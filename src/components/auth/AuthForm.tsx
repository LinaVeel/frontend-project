import { useMemo, useState } from 'react'
import styles from './AuthForm.module.css'
import Button from '../ui/Button'
import ErrorMessage from '../ui/ErrorMessage'
import type { ScopeName } from '../../app/providers/chatTypes'

type Props = {
  onSubmit: (params: { credentials: string; scope: ScopeName }) => void
}

const SCOPES: ScopeName[] = ['GIGACHAT_API_PERS', 'GIGACHAT_API_B2B', 'GIGACHAT_API_CORP']

export default function AuthForm({ onSubmit }: Props) {
  const [credentials, setCredentials] = useState('')
  const [scope, setScope] = useState<ScopeName>('GIGACHAT_API_PERS')
  const [touched, setTouched] = useState(false)

  const error = useMemo(() => {
    if (!touched) return ''
    if (!credentials.trim()) return 'Поле Credentials не должно быть пустым'
    return ''
  }, [credentials, touched])

  const submit = () => {
    setTouched(true)
    if (!credentials.trim()) return
    onSubmit({ credentials, scope })
  }

  return (
    <div className={styles.root}>
      <div className={styles.card}>
        <div className={styles.title}>Вход</div>
        <div className={styles.field}>
          <label className={styles.label}>Credentials (Base64) или Bearer token</label>
          <input
            className={styles.input}
            type="password"
            value={credentials}
            onChange={(e) => setCredentials(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="Base64 или Bearer …"
          />
          {error ? <ErrorMessage message={error} /> : null}
        </div>

        <div className={styles.field}>
          <div className={styles.label}>Scope</div>
          <div className={styles.scopes}>
            {SCOPES.map((s) => (
              <label key={s} className={styles.scopeItem}>
                <input
                  type="radio"
                  name="scope"
                  value={s}
                  checked={scope === s}
                  onChange={() => setScope(s)}
                />
                <span className={styles.scopeLabel}>{s}</span>
              </label>
            ))}
          </div>
        </div>

        <Button onClick={submit}>Войти</Button>
      </div>
    </div>
  )
}
