import styles from './MessageList.module.css'
import Message from './Message'
import TypingIndicator from './TypingIndicator'
import EmptyState from '../ui/EmptyState'
import type { ChatMessage } from '../../App'

type Props = {
  messages: ChatMessage[]
  typingVisible?: boolean
}

export default function MessageList({ messages, typingVisible = false }: Props) {
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
          <Message key={m.id} role={m.role} senderLabel={m.senderLabel} content={m.content} createdAt={m.createdAt} />
        ))}
        <TypingIndicator isVisible={typingVisible} />
      </div>
    </div>
  )
}
