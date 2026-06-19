import rawData from '../data/countries.json'
import type { Country } from './types'

interface Dataset {
  meta: Record<string, unknown>
  data: Record<string, Country>
}

const dataset = rawData as unknown as Dataset

export const COUNTRIES: Record<string, Country> = dataset.data
export const ALL_COUNTRIES: Country[] = Object.values(COUNTRIES)

const byNumericId = new Map<string, Country>()
const byName = new Map<string, Country>()
for (const c of ALL_COUNTRIES) {
  if (c.numericId) byNumericId.set(c.numericId, c)
  byName.set(c.name, c)
}

// Map geometries on the 50m world atlas that have no usable ISO numeric id.
// Map them to the closest data entry, or null to render as neutral land.
const NAME_OVERRIDES: Record<string, string | null> = {
  Kosovo: 'XKX',
  'N. Cyprus': 'CYP',
  Somaliland: 'SOM',
  'Indian Ocean Ter.': null,
  'Siachen Glacier': null,
}

export interface GeoLike {
  id?: string | number
  rsmKey?: string
  properties?: { name?: string }
}

/** Resolve a react-simple-maps geography to a Country, or null if no data. */
export function countryFromGeo(geo: GeoLike): Country | null {
  const id = geo.id != null ? String(geo.id) : ''
  if (id && id !== '-99' && byNumericId.has(id)) return byNumericId.get(id)!

  const name = geo.properties?.name
  if (name && Object.prototype.hasOwnProperty.call(NAME_OVERRIDES, name)) {
    const iso3 = NAME_OVERRIDES[name]
    return iso3 ? COUNTRIES[iso3] ?? null : null
  }
  if (name && byName.has(name)) return byName.get(name)!
  return null
}

export function geoName(geo: GeoLike): string {
  return geo.properties?.name ?? 'Unknown'
}
