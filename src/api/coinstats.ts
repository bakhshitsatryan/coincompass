import type { PortfolioValue } from '../lib/types'

export const DEFAULT_BASE_URL = 'https://api.coinstats.app/v1'

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'RUB', 'INR'] as const
export type Currency = (typeof CURRENCIES)[number]

export type CoinStatsErrorCode =
  | 'invalid_key'
  | 'rate_limit'
  | 'network'
  | 'bad_response'
  | 'http'

export class CoinStatsError extends Error {
  code: CoinStatsErrorCode
  status?: number
  constructor(code: CoinStatsErrorCode, message: string, status?: number) {
    super(message)
    this.name = 'CoinStatsError'
    this.code = code
    this.status = status
  }
}

export interface FetchOptions {
  baseUrl?: string
  currency?: string
  shareToken?: string
  signal?: AbortSignal
}

function normalize(json: unknown): PortfolioValue | null {
  let o: unknown = json
  if (Array.isArray(json)) o = json[0]
  if (o == null) return null
  if (typeof o === 'number') return { totalValue: o }
  if (typeof o === 'object') {
    const rec = o as Record<string, unknown>
    if (typeof rec.totalValue === 'number') return rec as unknown as PortfolioValue
    if (typeof rec.value === 'number') return { ...(rec as object), totalValue: rec.value } as PortfolioValue
  }
  return null
}

/**
 * Fetch the portfolio value from CoinStats.
 * The browser calls the API directly — CoinStats sends `access-control-allow-origin: *`.
 */
export async function fetchPortfolioValue(
  apiKey: string,
  opts: FetchOptions = {},
): Promise<PortfolioValue> {
  const base = (opts.baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, '')
  const url = new URL(`${base}/portfolio/value`)
  url.searchParams.set('currency', opts.currency || 'USD')
  if (opts.shareToken) url.searchParams.set('shareToken', opts.shareToken)

  let res: Response
  try {
    res = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'X-API-KEY': apiKey.trim(), accept: 'application/json' },
      signal: opts.signal,
    })
  } catch {
    throw new CoinStatsError(
      'network',
      'Could not reach CoinStats. Check your connection — or the endpoint URL if you changed it (CORS).',
    )
  }

  if (res.status === 401 || res.status === 403) {
    throw new CoinStatsError('invalid_key', 'That API key was rejected. Double-check it and try again.', res.status)
  }
  if (res.status === 429) {
    throw new CoinStatsError('rate_limit', 'Rate limit reached. Wait a moment, then try again.', 429)
  }
  if (!res.ok) {
    throw new CoinStatsError('http', `CoinStats responded with an error (HTTP ${res.status}).`, res.status)
  }

  let json: unknown
  try {
    json = await res.json()
  } catch {
    throw new CoinStatsError('bad_response', 'CoinStats returned an unreadable response.')
  }

  const value = normalize(json)
  if (!value) {
    throw new CoinStatsError('bad_response', 'No portfolio value found in the response.')
  }
  return value
}
