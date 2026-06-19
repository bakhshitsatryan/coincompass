import { Globe } from 'lucide-react'
import styles from './FlagIcon.module.css'

interface Props {
  iso2: string
  /** height in px (width follows 4:3) */
  size?: number
  className?: string
}

/** Crisp SVG country flag (flag-icons), rounded, with a hairline + fallback. */
export default function FlagIcon({ iso2, size = 22, className = '' }: Props) {
  const code = (iso2 || '').toLowerCase()
  const style = { width: Math.round(size * 1.34), height: size }
  if (!code) {
    return (
      <span className={`${styles.wrap} ${styles.fallback} ${className}`} style={style}>
        <Globe className="lucide" size={size * 0.7} />
      </span>
    )
  }
  return (
    <span className={`${styles.wrap} ${className}`} style={style}>
      <span className={`fi fi-${code} ${styles.flag}`} />
    </span>
  )
}
