import type { Country } from './types'
import { pickTier, type Tier } from '../data/tiers'

export interface Comparison {
  id: string
  label: string
  /** Raw count (formatted by the UI). */
  value: number
}

export interface LifestyleResult {
  country: Country
  amount: number
  /** Years of comfortable living the amount buys in this country. */
  years: number
  tier: Tier
  comparisons: Comparison[]
}

/** Years of comfortable living `amount` buys in `country`. */
export function yearsOfLiving(amount: number, country: Country): number {
  const annual = country.monthlyComfortable * 12
  if (annual <= 0) return 0
  return amount / annual
}

/** The lifestyle tier `amount` lands on in `country`. */
export function tierFor(amount: number, country: Country): Tier {
  return pickTier(yearsOfLiving(amount, country))
}

export function computeLifestyle(amount: number, country: Country): LifestyleResult {
  const years = yearsOfLiving(amount, country)
  const tier = pickTier(years)
  const comparisons: Comparison[] = [
    { id: 'rent', label: 'years of rent', value: amount / (country.rent1br * 12) },
    { id: 'food', label: 'months of groceries', value: amount / country.monthlyFood },
    { id: 'bigmac', label: 'Big Macs', value: amount / country.bigMac },
    { id: 'coffee', label: 'cups of coffee', value: amount / country.coffee },
  ]
  return { country, amount, years, tier, comparisons }
}

export interface WorldSummary {
  total: number
  /** tierId -> number of countries on that tier. */
  tierCounts: Record<string, number>
  kingCount: number
  comfortableOrBetter: number
  /** Country where the money lasts the longest (cheapest cost of living). */
  bestCountry?: Country
}

export function summarizeWorld(amount: number, countries: Country[]): WorldSummary {
  const tierCounts: Record<string, number> = {}
  let kingCount = 0
  let comfortableOrBetter = 0
  let bestCountry: Country | undefined
  let bestYears = -1

  // Tiers at/above "comfortable" by minYears threshold.
  const COMFORTABLE_MIN_YEARS = 5

  for (const c of countries) {
    const years = yearsOfLiving(amount, c)
    const tier = pickTier(years)
    tierCounts[tier.id] = (tierCounts[tier.id] ?? 0) + 1
    if (tier.id === 'king') kingCount++
    if (years >= COMFORTABLE_MIN_YEARS) comfortableOrBetter++
    if (years > bestYears) {
      bestYears = years
      bestCountry = c
    }
  }

  return { total: countries.length, tierCounts, kingCount, comfortableOrBetter, bestCountry }
}
