import styles from './ChatItem.module.css'
import type { ReactNode } from 'react'
import type { Chat } from '../../App'

type Props = {
  chat: Chat
  isActive: boolean
  onClick: () => void
  onEdit: () => void
  onDelete: () => void
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
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

export default function ChatItem({ chat, isActive, onClick, onEdit, onDelete }: Props) {
  return (
    <div className={`${styles.root} ${isActive ? styles.active : ''}`} role="button" tabIndex={0} onClick={onClick}>
      <div className={styles.main}>
        <div className={styles.titleRow}>
          <div className={styles.title} title={chat.title}>
            {chat.title}
          </div>
          <div className={styles.date}>{chat.lastMessageAt}</div>
        </div>
        <div className={styles.actions}>
          <IconButton
            label="Редактировать чат"
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
          >
            <PencilIcon />
          </IconButton>
          <IconButton
            label="Удалить чат"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
          >
            <TrashIcon />
          </IconButton>
        </div>
      </div>
    </div>
  )
}
