import { useEffect, useMemo, useState } from 'react'
import styles from './SettingsPanel.module.css'
import Button from '../ui/Button'
import Toggle from '../ui/Toggle'
import Slider from '../ui/Slider'
import type { ModelName, Settings, ThemeMode } from '../../app/providers/chatTypes'

type Props = {
  isOpen: boolean
  settings: Settings
  onClose: () => void
  onSave: (next: Settings) => void
  onReset: () => void
}

const MODEL_OPTIONS: ModelName[] = ['GigaChat', 'GigaChat-Plus', 'GigaChat-Pro', 'GigaChat-Max']

export default function SettingsPanel({ isOpen, settings, onClose, onSave, onReset }: Props) {
  const [draft, setDraft] = useState<Settings>(settings)

  useEffect(() => {
    if (isOpen) setDraft(settings)
  }, [isOpen, settings])

  const themeLabel = useMemo(() => (draft.theme === 'dark' ? 'Тёмная' : 'Светлая'), [draft.theme])

  if (!isOpen) return null

  return (
    <div
      className={styles.backdrop}
      role="button"
      tabIndex={0}
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose()
      }}
    >
      <aside className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.title}>Настройки</div>
          <Button variant="ghost" onClick={onClose}>
            Закрыть
          </Button>
        </div>

        <div className={styles.body}>
          <div className={styles.field}>
            <div className={styles.label}>Модель</div>
            <select
              className={styles.select}
              value={draft.model}
              onChange={(e) => setDraft((s) => ({ ...s, model: e.target.value as ModelName }))}
            >
              {MODEL_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <div className={styles.label}>Temperature: {draft.temperature.toFixed(2)}</div>
            <Slider
              min={0}
              max={2}
              step={0.01}
              value={draft.temperature}
              onChange={(v) => setDraft((s) => ({ ...s, temperature: v }))}
            />
          </div>

          <div className={styles.field}>
            <div className={styles.label}>Top-P: {draft.topP.toFixed(2)}</div>
            <Slider min={0} max={1} step={0.01} value={draft.topP} onChange={(v) => setDraft((s) => ({ ...s, topP: v }))} />
          </div>

          <div className={styles.field}>
            <div className={styles.label}>Repetition penalty: {draft.repetitionPenalty.toFixed(2)}</div>
            <Slider
              min={0}
              max={2}
              step={0.01}
              value={draft.repetitionPenalty}
              onChange={(v) => setDraft((s) => ({ ...s, repetitionPenalty: v }))}
            />
          </div>

          <div className={styles.field}>
            <div className={styles.label}>Max Tokens</div>
            <input
              className={styles.input}
              type="number"
              value={draft.maxTokens}
              onChange={(e) => setDraft((s) => ({ ...s, maxTokens: Number(e.target.value) }))}
              min={1}
              step={1}
            />
          </div>

          <div className={styles.field}>
            <div className={styles.label}>System Prompt</div>
            <textarea
              className={styles.textarea}
              value={draft.systemPrompt}
              onChange={(e) => setDraft((s) => ({ ...s, systemPrompt: e.target.value }))}
              rows={5}
            />
          </div>

          <div className={styles.fieldRow}>
            <div>
              <div className={styles.label}>Тема</div>
              <div className={styles.hint}>{themeLabel}</div>
            </div>
            <Toggle
              checked={draft.theme === 'dark'}
              onChange={(checked) => setDraft((s) => ({ ...s, theme: (checked ? 'dark' : 'light') as ThemeMode }))}
            />
          </div>
        </div>

        <div className={styles.footer}>
          <Button variant="secondary" onClick={onReset}>
            Сбросить
          </Button>
          <Button onClick={() => onSave(draft)}>Сохранить</Button>
        </div>
      </aside>
    </div>
  )
}
