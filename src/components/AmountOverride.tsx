import { useEffect, useRef, useState } from 'react'
import { Pencil } from 'lucide-react'
import styles from './AmountOverride.module.css'
import { formatCompact } from '../lib/format'

interface Props {
  value: number
  currencySymbol: string
  onChange: (amount: number) => void
}

const PRESETS = [
  { label: '1K', value: 1_000 },
  { label: '10K', value: 10_000 },
  { label: '100K', value: 100_000 },
  { label: '1M', value: 1_000_000 },
  { label: '10M', value: 10_000_000 },
]

export default function AmountOverride({ value, currencySymbol, onChange }: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      setDraft(String(Math.round(value)))
      requestAnimationFrame(() => inputRef.current?.select())
    }
  }, [editing, value])

  const commit = () => {
    const n = Number(draft.replace(/[^0-9.]/g, ''))
    if (isFinite(n) && n >= 0) onChange(n)
    setEditing(false)
  }

  return (
    <div className={styles.root}>
      <span className={styles.label}>What if you had</span>
      <div className={styles.chips}>
        {PRESETS.map((p) => {
          const active = Math.round(value) === p.value
          return (
            <button
              key={p.value}
              className={`${styles.chip} ${active ? styles.active : ''}`}
              onClick={() => onChange(p.value)}
            >
              {currencySymbol}
              {p.label}
            </button>
          )
        })}
      </div>
      {editing ? (
        <div className={styles.editor}>
          <span className={styles.sym}>{currencySymbol}</span>
          <input
            ref={inputRef}
            className={styles.input}
            value={draft}
            inputMode="numeric"
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit()
              if (e.key === 'Escape') setEditing(false)
            }}
          />
        </div>
      ) : (
        <button className={styles.custom} onClick={() => setEditing(true)} title="Enter a custom amount">
          <Pencil className="lucide" size={13} />
          <span className="tabular">
            {currencySymbol}
            {formatCompact(value)}
          </span>
        </button>
      )}
    </div>
  )
}
