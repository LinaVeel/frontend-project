import styles from './Toggle.module.css'

type Props = {
  checked: boolean
  onChange: (checked: boolean) => void
}

export default function Toggle({ checked, onChange }: Props) {
  return (
    <button
      type="button"
      className={`${styles.root} ${checked ? styles.on : ''}`}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
    >
      <span className={styles.thumb} />
    </button>
  )
}
