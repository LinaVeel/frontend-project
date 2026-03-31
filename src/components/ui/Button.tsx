import styles from './Button.module.css'

import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'ghost'
  leftIcon?: ReactNode
}

export default function Button({ children, onClick, disabled = false, variant = 'primary', leftIcon }: Props) {
  const className = `${styles.root} ${variant === 'primary' ? styles.primary : ''} ${variant === 'secondary' ? styles.secondary : ''} ${
    variant === 'ghost' ? styles.ghost : ''
  }`

  return (
    <button type="button" className={className} onClick={onClick} disabled={disabled}>
      {leftIcon ? <span className={styles.icon}>{leftIcon}</span> : null}
      <span>{children}</span>
    </button>
  )
}
