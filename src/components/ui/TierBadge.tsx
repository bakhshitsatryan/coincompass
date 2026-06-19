import type { CSSProperties } from 'react'
import type { Tier } from '../../data/tiers'
import styles from './TierBadge.module.css'

interface Props {
  tier: Tier
  size?: number
  /** add a slow ambient animation (used on the big result icon) */
  animated?: boolean
  className?: string
}

/** Tier icon seated in a glowing tinted squircle. */
export default function TierBadge({ tier, size = 44, animated = false, className = '' }: Props) {
  const Icon = tier.icon
  const style = {
    width: size,
    height: size,
    ['--tier' as string]: tier.color,
  } as CSSProperties
  return (
    <span
      className={`${styles.badge} ${animated ? styles.animated : ''} ${className}`}
      style={style}
    >
      <Icon className="lucide" size={Math.round(size * 0.5)} strokeWidth={1.5} />
    </span>
  )
}
