import styles from './ChatList.module.css'
import ChatItem from './ChatItem'

export type ChatListItem = {
  id: string
  title: string
  lastMessageAtLabel: string
}

type Props = {
  chats: ChatListItem[]
  activeChatId: string | null
  onSelectChat: (id: string) => void
  onEditChat: (id: string) => void
  onDeleteChat: (id: string) => void
}

export default function ChatList({ chats, activeChatId, onSelectChat, onEditChat, onDeleteChat }: Props) {
  return (
    <div className={styles.root}>
      {chats.map((chat) => (
        <ChatItem
          key={chat.id}
          chat={chat}
          isActive={chat.id === activeChatId}
          onSelectChat={onSelectChat}
          onEditChat={onEditChat}
          onDeleteChat={onDeleteChat}
        />
      ))}
    </div>
  )
}
