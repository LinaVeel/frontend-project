import { useCallback, useEffect, useMemo, useRef } from 'react'
import styles from './ChatWindow.module.css'
import MessageList from './MessageList'
import InputArea from './InputArea'
import { useChat } from '../../app/providers/ChatProvider'
import ErrorBoundary from '../ui/ErrorBoundary'
import type { Message } from '../../app/providers/chatTypes'

type Props = {
  title: string
  chatId: string | null
  onOpenSettings: () => void
  onOpenSidebar: () => void
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

type VisibleMessage = Message & { role: 'user' | 'assistant' }

export default function ChatWindow({ title, chatId, onOpenSettings, onOpenSidebar }: Props) {
  const { state, sendMessage, retryLast, stop } = useChat()

  const messages = useMemo(() => {
    if (!chatId) return []
    return (state.messagesByChatId[chatId] ?? []).filter(
      (m): m is VisibleMessage => m.role !== 'system',
    )
  }, [state.messagesByChatId, chatId])

  const isLoading = chatId ? Boolean(state.isLoadingByChatId[chatId]) : false
  const error = chatId ? state.errorByChatId[chatId] : null

  const endRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = useCallback(
    (text: string) => {
      if (isLoading) return
      void sendMessage(text)
    },
    [sendMessage, isLoading],
  )

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
        <ErrorBoundary message="Ошибка рендера сообщений">
          <MessageList messages={messages} isLoading={isLoading} endRef={endRef} />
        </ErrorBoundary>
      </div>

      <div className={styles.input}>
        <InputArea
          isLoading={isLoading}
          onSend={send}
          onStop={stop}
          error={error}
          onRetry={retryLast}
        />
      </div>
    </section>
  )
}
