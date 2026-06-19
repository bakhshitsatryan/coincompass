import type { CSSProperties, ReactNode } from 'react'
import styles from './GlassPanel.module.css'

interface Props {
  children: ReactNode
  /** classes on the outer shell */
  className?: string
  /** classes on the inner core (where content lives) */
  innerClassName?: string
  /** accent glow color, e.g. var(--gold) */
  glow?: string
  style?: CSSProperties
  innerStyle?: CSSProperties
}

/**
 * Double-bezel (Doppelrand) container: a glass plate seated in a machined tray.
 * Outer shell carries the hairline + ambient glow; inner core has its own
 * surface and an inset top highlight, with a concentric smaller radius.
 */
export default function GlassPanel({
  children,
  className = '',
  innerClassName = '',
  glow,
  style,
  innerStyle,
}: Props) {
  return (
    <div
      className={`${styles.shell} ${className}`}
      style={{ ...(glow ? ({ ['--glow' as string]: glow } as CSSProperties) : null), ...style }}
    >
      <div className={`${styles.core} ${innerClassName}`} style={innerStyle}>
        {children}
      </div>
    </div>
  )
}
