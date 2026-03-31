import styles from './EmptyState.module.css'

type Props = {
  title: string
}

function ChatIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function EmptyState({ title }: Props) {
  return (
    <div className={styles.root}>
      <div className={styles.icon}>
        <ChatIcon />
      </div>
      <div className={styles.title}>{title}</div>
    </div>
  )
}
