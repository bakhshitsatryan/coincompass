import {
  Crown,
  Gem,
  Sparkles,
  Sofa,
  Home,
  CloudDrizzle,
  TentTree,
  type LucideIcon,
} from 'lucide-react'

export interface Tier {
  id: string
  /** Short label, e.g. "King". */
  label: string
  /** Inclusive lower bound, in years of comfortable living the amount buys. */
  minYears: number
  icon: LucideIcon
  /** Accent color (hex) used for the choropleth + UI accents. */
  color: string
  /** One-line verdict. */
  verdict: string
  /** Flavor sentence. */
  blurb: string
}

// Ordered HIGH → LOW. `pickTier` walks this and returns the first tier whose
// `minYears` the amount clears. The same amount lands on different tiers in
// different countries — that contrast is the whole point.
export const TIERS: Tier[] = [
  {
    id: 'king',
    label: 'King',
    minYears: 200,
    icon: Crown,
    color: '#FFCE45',
    verdict: 'Absolute royalty.',
    blurb: 'Build the palace. You could reign here for lifetimes and never run dry.',
  },
  {
    id: 'elite',
    label: 'Elite',
    minYears: 50,
    icon: Gem,
    color: '#C08CFF',
    verdict: 'Generational wealth.',
    blurb: 'Top-of-the-pyramid money. You and your grandkids are set for life.',
  },
  {
    id: 'large',
    label: 'Living Large',
    minYears: 15,
    icon: Sparkles,
    color: '#4FE0A6',
    verdict: 'Seriously wealthy.',
    blurb: 'Penthouse views and zero alarms. Decades of the good life, fully funded.',
  },
  {
    id: 'comfortable',
    label: 'Comfortable',
    minYears: 5,
    icon: Sofa,
    color: '#3FC6F0',
    verdict: 'Comfortably set.',
    blurb: 'No money stress for years. Nice place, good food, room to breathe.',
  },
  {
    id: 'getting-by',
    label: 'Getting By',
    minYears: 1,
    icon: Home,
    color: '#6E8BE6',
    verdict: "You'd manage.",
    blurb: 'A roof and the basics covered for a while. Budget, but you survive.',
  },
  {
    id: 'scraping',
    label: 'Scraping By',
    minYears: 0.25,
    icon: CloudDrizzle,
    color: '#E89B4C',
    verdict: 'Tight and tense.',
    blurb: 'Counting every coin. A few rough months before the well runs dry.',
  },
  {
    id: 'broke',
    label: 'Broke',
    minYears: 0,
    icon: TentTree,
    color: '#E85D75',
    verdict: "You wouldn't last.",
    blurb: "Not enough to plant roots here. The street is closer than the penthouse.",
  },
]

export const NEUTRAL_COLOR = '#2B3242'

export function pickTier(years: number): Tier {
  for (const tier of TIERS) {
    if (years >= tier.minYears) return tier
  }
  return TIERS[TIERS.length - 1]
}

export function tierById(id: string): Tier {
  return TIERS.find((t) => t.id === id) ?? TIERS[TIERS.length - 1]
}
