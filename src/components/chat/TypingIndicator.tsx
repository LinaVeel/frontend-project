import styles from './TypingIndicator.module.css'

type Props = {
  isVisible?: boolean
}

export default function TypingIndicator({ isVisible = false }: Props) {
  if (!isVisible) return null
  return (
    <div className={styles.root} aria-label="Ассистент печатает">
      <span className={styles.dot} />
      <span className={styles.dot} />
      <span className={styles.dot} />
    </div>
  )
}
