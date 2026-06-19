import type { ButtonHTMLAttributes } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Loader2 } from 'lucide-react'
import styles from './Button.module.css'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'md' | 'lg'
  trailingIcon?: LucideIcon
  leadingIcon?: LucideIcon
  loading?: boolean
  fullWidth?: boolean
}

export default function Button({
  variant = 'primary',
  size = 'md',
  trailingIcon: Trailing,
  leadingIcon: Leading,
  loading = false,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...rest
}: Props) {
  return (
    <button
      className={[
        styles.root,
        styles[variant],
        styles[size],
        fullWidth ? styles.full : '',
        className,
      ].join(' ')}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <Loader2 className={`lucide ${styles.spin}`} size={size === 'lg' ? 20 : 18} />
      ) : (
        Leading && <Leading className="lucide" size={size === 'lg' ? 20 : 18} />
      )}
      <span className={styles.label}>{children}</span>
      {Trailing && (
        <span className={styles.iconCircle}>
          <Trailing className="lucide" size={size === 'lg' ? 18 : 16} />
        </span>
      )}
    </button>
  )
}
