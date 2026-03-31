import styles from './MessageList.module.css'
import Message from './Message'
import TypingIndicator from './TypingIndicator'
import EmptyState from '../ui/EmptyState'
import type { RefObject } from 'react'
import type { ChatMessage } from '../../types/message'

type Props = {
  messages: ChatMessage[]
  isLoading?: boolean
  endRef?: RefObject<HTMLDivElement>
}

export default function MessageList({ messages, isLoading = false, endRef }: Props) {
  if (messages.length === 0) {
    return (
      <div className={styles.emptyWrap}>
        <EmptyState title="Начните новый диалог" />
      </div>
    )
  }

  return (
    <div className={styles.root}>
      <div className={styles.inner}>
        {messages.map((m) => (
          <Message key={m.id} variant={m.role} content={m.content} timestamp={m.timestamp} />
        ))}
        <TypingIndicator isVisible={isLoading} />
        <div ref={endRef} />
      </div>
    </div>
  )
}
