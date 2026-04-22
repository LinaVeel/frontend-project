import styles from './ErrorMessage.module.css'
import Button from './Button'

type Props = {
  message: string
  onRetry?: () => void
  retryLabel?: string
}

function AlertIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M12 9v4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 17h.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function ErrorMessage({ message, onRetry, retryLabel = 'Повторить' }: Props) {
  return (
    <div className={styles.root} role="alert">
      <AlertIcon />
      <span className={styles.message}>{message}</span>
      {onRetry ? (
        <span className={styles.actions}>
          <Button variant="secondary" onClick={onRetry}>
            {retryLabel}
          </Button>
        </span>
      ) : null}
    </div>
  )
}
