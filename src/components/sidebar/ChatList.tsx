import styles from './ChatList.module.css'
import ChatItem from './ChatItem'
import type { Chat } from '../../App'

type Props = {
  chats: Chat[]
  activeChatId: string
  onSelectChat: (id: string) => void
}

export default function ChatList({ chats, activeChatId, onSelectChat }: Props) {
  return (
    <div className={styles.root}>
      {chats.map((chat) => (
        <ChatItem
          key={chat.id}
          chat={chat}
          isActive={chat.id === activeChatId}
          onClick={() => onSelectChat(chat.id)}
          onEdit={() => {
            // mock
          }}
          onDelete={() => {
            // mock
          }}
        />
      ))}
    </div>
  )
}
