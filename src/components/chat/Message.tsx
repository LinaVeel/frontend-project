import styles from './Message.module.css'
import ReactMarkdown from 'react-markdown'

type Props = {
  variant: 'user' | 'assistant'
  content: string
  timestamp?: string
}

function formatTime(value?: string) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M8 8V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 21h9a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function AssistantAvatar() {
  return <div className={styles.avatar}>G</div>
}

export default function Message({ variant, content, timestamp }: Props) {
  const isUser = variant === 'user'
  const variantClass = isUser ? styles.user : styles.assistant
  const senderLabel = isUser ? 'Вы' : 'Ассистент'
  const createdAt = formatTime(timestamp)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content)
    } catch {
      // ignore
    }
  }

  return (
    <div className={`${styles.row} ${isUser ? styles.rowUser : styles.rowAssistant}`}>
      {!isUser ? <AssistantAvatar /> : null}
      <div className={`${styles.bubble} ${variantClass}`}>
        <div className={styles.meta}>
          <div className={styles.sender}>{senderLabel}</div>
          {createdAt ? <div className={styles.time}>{createdAt}</div> : null}
        </div>

        <div className={styles.content}>
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>

        <button className={styles.copy} type="button" aria-label="Копировать" onClick={copy}>
          <CopyIcon />
          Копировать
        </button>
      </div>
    </div>
  )
}
