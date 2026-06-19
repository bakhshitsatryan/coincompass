export interface Country {
  iso3: string
  iso2: string
  numericId: string
  name: string
  region: string
  capital: string
  /** Comfortable single-person monthly cost in USD (incl. rent). */
  monthlyComfortable: number
  rent1br: number
  monthlyFood: number
  bigMac: number
  coffee: number
}

/** Raw shape returned by CoinStats GET /portfolio/value. */
export interface PortfolioValue {
  totalValue: number
  defiValue?: number
  totalCost?: number
  unrealizedProfitLoss?: number
  unrealizedProfitLossPercent?: number
  realizedProfitLoss?: number
  realizedProfitLossPercent?: number
  allTimeProfitLoss?: number
  allTimeProfitLossPercent?: number
}

export type AmountSource = 'portfolio' | 'demo' | 'manual'

export interface PortfolioState {
  amount: number
  currency: string
  source: AmountSource
  /** Present only when fetched from a real CoinStats portfolio. */
  raw?: PortfolioValue
}
