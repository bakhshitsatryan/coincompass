const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  RUB: '₽',
  INR: '₹',
}

export function currencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency] ?? ''
}

/** Full currency string, e.g. "$1,250,000". */
export function formatCurrency(amount: number, currency = 'USD'): string {
  try {
    const whole = Number.isInteger(amount)
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: amount >= 1000 || whole ? 0 : 2,
    }).format(amount)
  } catch {
    return `${currencySymbol(currency)}${Math.round(amount).toLocaleString('en-US')}`
  }
}

/** Compact currency, e.g. "$1.25M". */
export function formatCompactCurrency(amount: number, currency = 'USD'): string {
  const sym = currencySymbol(currency) || ''
  return sym + formatCompact(amount)
}

/** Compact number, e.g. "1.2M", "3,400", "12.4B". */
export function formatCompact(n: number): string {
  if (!isFinite(n)) return '∞'
  const abs = Math.abs(n)
  if (abs < 1000) return (Math.round(n * 10) / 10).toLocaleString('en-US')
  const units = [
    { v: 1e12, s: 'T' },
    { v: 1e9, s: 'B' },
    { v: 1e6, s: 'M' },
    { v: 1e3, s: 'K' },
  ]
  for (const u of units) {
    if (abs >= u.v) {
      const val = n / u.v
      return (val >= 100 ? Math.round(val) : Math.round(val * 10) / 10) + u.s
    }
  }
  return String(Math.round(n))
}

/** Whole-number with thousands separators. */
export function formatInt(n: number): string {
  return Math.round(n).toLocaleString('en-US')
}

/**
 * Human duration from a number of years.
 *  - very large  -> "indefinitely"
 *  - >= ~2 years -> "X years"
 *  - < 2 years   -> "N months"
 *  - tiny        -> "weeks"
 */
export function formatDuration(years: number): string {
  if (!isFinite(years) || years >= 500) return 'indefinitely'
  if (years >= 100) return `${Math.round(years)} years`
  if (years >= 2) return `${years >= 10 ? Math.round(years) : Math.round(years * 10) / 10} years`
  const months = years * 12
  if (months >= 1.5) return `${Math.round(months)} months`
  const weeks = years * 52
  if (weeks >= 1) return `${Math.max(1, Math.round(weeks))} weeks`
  return 'days'
}

export function formatPercent(p: number): string {
  const sign = p > 0 ? '+' : ''
  return `${sign}${(Math.round(p * 100) / 100).toLocaleString('en-US')}%`
}
