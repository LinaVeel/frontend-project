import styles from './Sidebar.module.css'
import SearchInput from './SearchInput'
import ChatList from './ChatList'
import Button from '../ui/Button'
import { useChat } from '../../app/providers/ChatProvider'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

type Props = {
  onNavigate?: () => void
}

function PlusIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function Sidebar({
  onNavigate,
}: Props) {
  const navigate = useNavigate()
  const { state, createChat, setActiveChat, renameChat, deleteChat } = useChat()
  const [searchQuery, setSearchQuery] = useState('')

  const items = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()

    const list = state.chats.map((chat) => {
      const messages = state.messagesByChatId[chat.id] ?? []
      const last = [...messages].reverse().find((m) => m.role !== 'system')
      const lastMessagePreview = last?.content?.trim() ?? ''
      const lastAt = last?.timestamp ?? chat.updatedAt
      const lastMessageAtLabel = new Date(lastAt).toLocaleDateString()

      return {
        ...chat,
        lastMessageAtLabel,
        lastMessagePreview,
      }
    })

    if (!q) return list

    return list.filter((c) => {
      const inTitle = c.title.toLowerCase().includes(q)
      const inLast = c.lastMessagePreview.toLowerCase().includes(q)
      return inTitle || inLast
    })
  }, [state.chats, state.messagesByChatId, searchQuery])

  return (
    <aside className={styles.root}>
      <div className={styles.header}>
        <Button
          onClick={() => {
            const id = createChat()
            setActiveChat(id)
            navigate(`/chat/${id}`)
            onNavigate?.()
          }}
          leftIcon={<PlusIcon />}
        >
          Новый чат
        </Button>
      </div>

      <div className={styles.search}>
        <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Поиск чатов" />
      </div>

      <div className={styles.list}>
        <ChatList
          chats={items}
          activeChatId={state.activeChatId}
          onSelectChat={(id) => {
            setActiveChat(id)
            navigate(`/chat/${id}`)
            onNavigate?.()
          }}
          onEditChat={(id) => {
            const chat = state.chats.find((c) => c.id === id)
            const next = window.prompt('Новое название чата', chat?.title ?? '')
            if (!next) return
            renameChat(id, next.trim())
          }}
          onDeleteChat={(id) => {
            const chat = state.chats.find((c) => c.id === id)
            const ok = window.confirm(`Удалить чат «${chat?.title ?? 'чат'}»?`)
            if (!ok) return
            deleteChat(id)
            if (state.activeChatId === id) {
              navigate('/')
            }
          }}
        />
      </div>
    </aside>
  )
}
