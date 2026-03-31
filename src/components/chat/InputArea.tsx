import { useEffect, useMemo, useRef, useState } from 'react'
import styles from './InputArea.module.css'
import Button from '../ui/Button'

type Props = {
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

export default function InputArea({ onSend, onStop }: Props) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const canSend = useMemo(() => value.trim().length > 0, [value])

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    const maxHeight = el.dataset.maxHeight ? Number(el.dataset.maxHeight) : 0
    const next = el.scrollHeight
    if (maxHeight > 0) {
      el.style.height = `${Math.min(next, maxHeight)}px`
      el.style.overflowY = next > maxHeight ? 'auto' : 'hidden'
    } else {
      el.style.height = `${next}px`
    }
  }, [value])

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    const computed = window.getComputedStyle(el)
    const lineHeight = Number.parseFloat(computed.lineHeight || '0')
    const paddingTop = Number.parseFloat(computed.paddingTop || '0')
    const paddingBottom = Number.parseFloat(computed.paddingBottom || '0')
    const borderTop = Number.parseFloat(computed.borderTopWidth || '0')
    const borderBottom = Number.parseFloat(computed.borderBottomWidth || '0')
    const max = lineHeight * 5 + paddingTop + paddingBottom + borderTop + borderBottom
    el.dataset.maxHeight = String(max)
  }, [])

  const submit = () => {
    if (!canSend) return
    onSend(value)
    setValue('')
  }

  return (
    <div className={styles.root}>
      <button className={styles.attach} type="button" aria-label="Прикрепить изображение" onClick={() => {}}>
        <AttachIcon />
      </button>

      <textarea
        ref={textareaRef}
        className={styles.textarea}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Сообщение..."
        rows={1}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            submit()
          }
        }}
      />

      <div className={styles.actions}>
        <Button variant="secondary" onClick={onStop}>
          Стоп
        </Button>
        <Button disabled={!canSend} onClick={submit}>
          Отправить
        </Button>
      </div>
    </div>
  )
}
