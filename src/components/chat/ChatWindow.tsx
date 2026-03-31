import { useCallback, useEffect, useRef, useState } from 'react'
import styles from './ChatWindow.module.css'
import MessageList from './MessageList'
import InputArea from './InputArea'
import type { ChatMessage } from '../../types/message'

type Props = {
  title: string
  chatId: string
  initialMessages: ChatMessage[]
  onOpenSettings: () => void
  onOpenSidebar: () => void
}

function formatAssistantReply(userText: string) {
  const trimmed = userText.trim()
  if (!trimmed) return 'Понял.'
  if (trimmed.length <= 80) return `Понял: ${trimmed}`
  return `Понял. Коротко: ${trimmed.slice(0, 80).trim()}…`
}

function makeId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `m_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

function BurgerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.4 15a1.8 1.8 0 0 0 .36 2l.04.04a2.2 2.2 0 0 1-1.56 3.76 2.2 2.2 0 0 1-1.56-.64l-.04-.04a1.8 1.8 0 0 0-2-.36 1.8 1.8 0 0 0-1.08 1.64V21a2.2 2.2 0 0 1-4.4 0v-.06a1.8 1.8 0 0 0-1.08-1.64 1.8 1.8 0 0 0-2 .36l-.04.04a2.2 2.2 0 1 1-3.12-3.12l.04-.04a1.8 1.8 0 0 0 .36-2 1.8 1.8 0 0 0-1.64-1.08H3a2.2 2.2 0 0 1 0-4.4h.06a1.8 1.8 0 0 0 1.64-1.08 1.8 1.8 0 0 0-.36-2l-.04-.04A2.2 2.2 0 1 1 7.42 2.7l.04.04a1.8 1.8 0 0 0 2 .36A1.8 1.8 0 0 0 10.54 1.46V1.4a2.2 2.2 0 0 1 4.4 0v.06a1.8 1.8 0 0 0 1.08 1.64 1.8 1.8 0 0 0 2-.36l.04-.04A2.2 2.2 0 1 1 21.18 5.82l-.04.04a1.8 1.8 0 0 0-.36 2 1.8 1.8 0 0 0 1.64 1.08H21a2.2 2.2 0 0 1 0 4.4h-.06A1.8 1.8 0 0 0 19.4 15Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function ChatWindow({ title, chatId, initialMessages, onOpenSettings, onOpenSidebar }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [isLoading, setIsLoading] = useState(false)

  const endRef = useRef<HTMLDivElement | null>(null)
  const pendingReplyTimeoutId = useRef<number | null>(null)

  const stop = useCallback(() => {
    if (pendingReplyTimeoutId.current != null) {
      window.clearTimeout(pendingReplyTimeoutId.current)
      pendingReplyTimeoutId.current = null
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    setMessages(initialMessages)
    stop()
  }, [chatId, initialMessages, stop])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    return () => {
      if (pendingReplyTimeoutId.current != null) {
        window.clearTimeout(pendingReplyTimeoutId.current)
        pendingReplyTimeoutId.current = null
      }
    }
  }, [])

  const send = useCallback((text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isLoading) return

    const userMessage: ChatMessage = {
      id: makeId(),
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    const delay = 1000 + Math.floor(Math.random() * 1000)
    pendingReplyTimeoutId.current = window.setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: makeId(),
        role: 'assistant',
        content: formatAssistantReply(trimmed),
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
      pendingReplyTimeoutId.current = null
    }, delay)
  }, [isLoading])

  return (
    <section className={styles.root}>
      <header className={styles.header}>
        <button className={styles.burger} type="button" aria-label="Открыть меню" onClick={onOpenSidebar}>
          <BurgerIcon />
        </button>
        <div className={styles.title} title={title}>
          {title}
        </div>
        <button className={styles.settings} type="button" aria-label="Настройки" onClick={onOpenSettings}>
          <SettingsIcon />
        </button>
      </header>

      <div className={styles.messages}>
        <MessageList messages={messages} isLoading={isLoading} endRef={endRef} />
      </div>

      <div className={styles.input}>
        <InputArea
          isLoading={isLoading}
          onSend={send}
          onStop={stop}
        />
      </div>
    </section>
  )
}
