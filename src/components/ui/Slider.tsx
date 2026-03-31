import styles from './Slider.module.css'

type Props = {
  min: number
  max: number
  step: number
  value: number
  onChange: (value: number) => void
}

export default function Slider({ min, max, step, value, onChange }: Props) {
  return (
    <input
      className={styles.root}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  )
}
