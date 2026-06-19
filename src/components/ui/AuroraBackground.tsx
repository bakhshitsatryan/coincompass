import styles from './AuroraBackground.module.css'

/**
 * Fixed, GPU-only animated mesh: slowly drifting blurred orbs in the brand
 * accents over an OLED-deep base, plus a vignette. pointer-events: none.
 */
export default function AuroraBackground() {
  return (
    <div className={styles.aurora} aria-hidden="true">
      <div className={`${styles.orb} ${styles.gold}`} />
      <div className={`${styles.orb} ${styles.emerald}`} />
      <div className={`${styles.orb} ${styles.violet}`} />
      <div className={`${styles.orb} ${styles.cyan}`} />
      <div className={styles.grid} />
      <div className={styles.vignette} />
    </div>
  )
}
