import styles from './ChatItem.module.css'
import { memo } from 'react'
import type { MouseEventHandler, ReactNode } from 'react'
import type { ChatListItem } from './ChatList'

type Props = {
  chat: ChatListItem
  isActive: boolean
  onSelectChat: (id: string) => void
  onEditChat: (id: string) => void
  onDeleteChat: (id: string) => void
}

function IconButton({ label, onClick, children }: { label: string; onClick: MouseEventHandler<HTMLButtonElement>; children: ReactNode }) {
  return (
    <button className={styles.iconButton} type="button" aria-label={label} onClick={onClick}>
      {children}
    </button>
  )
}

function PencilIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M12 20h9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M3 6h18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 6V4h8v2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 6l-1 14H6L5 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 11v6M14 11v6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChatItem({ chat, isActive, onSelectChat, onEditChat, onDeleteChat }: Props) {
  return (
    <div
      className={`${styles.root} ${isActive ? styles.active : ''}`}
      role="button"
      tabIndex={0}
      onClick={() => onSelectChat(chat.id)}
    >
      <div className={styles.main}>
        <div className={styles.titleRow}>
          <div className={styles.title} title={chat.title}>
            {chat.title}
          </div>
          <div className={styles.date}>{chat.lastMessageAtLabel}</div>
        </div>
        <div className={styles.actions}>
          <IconButton
            label="Редактировать чат"
            onClick={(e) => {
              e.stopPropagation()
              onEditChat(chat.id)
            }}
          >
            <PencilIcon />
          </IconButton>
          <IconButton
            label="Удалить чат"
            onClick={(e) => {
              e.stopPropagation()
              onDeleteChat(chat.id)
            }}
          >
            <TrashIcon />
          </IconButton>
        </div>
      </div>
    </div>
  )
}

export default memo(ChatItem, (prev, next) => {
  return (
    prev.isActive === next.isActive &&
    prev.chat.id === next.chat.id &&
    prev.chat.title === next.chat.title &&
    prev.chat.lastMessageAtLabel === next.chat.lastMessageAtLabel &&
    prev.onSelectChat === next.onSelectChat &&
    prev.onEditChat === next.onEditChat &&
    prev.onDeleteChat === next.onDeleteChat
  )
})
