import styles from './Sidebar.module.css'
import SearchInput from './SearchInput'
import ChatList from './ChatList'
import Button from '../ui/Button'
import type { Chat } from '../../App'

type Props = {
  chats: Chat[]
  activeChatId: string
  onSelectChat: (id: string) => void
  searchQuery: string
  onSearchQueryChange: (value: string) => void
  onNewChat: () => void
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
  chats,
  activeChatId,
  onSelectChat,
  searchQuery,
  onSearchQueryChange,
  onNewChat,
}: Props) {
  return (
    <aside className={styles.root}>
      <div className={styles.header}>
        <Button onClick={onNewChat} leftIcon={<PlusIcon />}>
          Новый чат
        </Button>
      </div>

      <div className={styles.search}>
        <SearchInput value={searchQuery} onChange={onSearchQueryChange} placeholder="Поиск чатов" />
      </div>

      <div className={styles.list}>
        <ChatList chats={chats} activeChatId={activeChatId} onSelectChat={onSelectChat} />
      </div>
    </aside>
  )
}
