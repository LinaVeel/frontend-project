import { useMemo, useState } from 'react'
import styles from './InputArea.module.css'
import Button from '../ui/Button'

type Props = {
  isLoading?: boolean
  onSend: (text: string) => void
  onStop: () => void
}

function AttachIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M21.44 11.05 12 20.5a6 6 0 0 1-8.49-8.49L13.39 2.12a4 4 0 0 1 5.66 5.66l-9.19 9.19a2 2 0 0 1-2.83-2.83l8.49-8.49"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function InputArea({ isLoading = false, onSend, onStop }: Props) {
  const [value, setValue] = useState('')

  const canSend = useMemo(() => value.trim().length > 0 && !isLoading, [value, isLoading])
  const rows = useMemo(() => {
    const lineCount = value.split('\n').length
    return Math.max(1, Math.min(5, lineCount))
  }, [value])

  const submit = () => {
    if (!canSend) return
    onSend(value.trim())
    setValue('')
  }

  return (
    <div className={styles.root}>
      <button className={styles.attach} type="button" aria-label="Прикрепить изображение" onClick={() => {}}>
        <AttachIcon />
      </button>

      <textarea
        className={styles.textarea}
        value={value}
        disabled={isLoading}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Сообщение..."
        rows={rows}
        onKeyDown={(e) => {
          if (isLoading) return
          if ((e.nativeEvent as KeyboardEvent).isComposing) return
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            submit()
          }
        }}
      />

      <div className={styles.actions}>
        {isLoading ? (
          <Button variant="secondary" onClick={onStop}>
            Стоп
          </Button>
        ) : (
          <Button disabled={!canSend} onClick={submit}>
            Отправить
          </Button>
        )}
      </div>
    </div>
  )
}
