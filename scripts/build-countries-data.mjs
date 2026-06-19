// Build a realistic monthly cost-of-living dataset for EVERY country.
//
// Strategy:
//  1. Enumerate all ISO 3166-1 countries (i18n-iso-countries).
//  2. Hand-set realistic "comfortable single-person monthly cost" anchors for
//     ~60 well-known countries (Numbeo-style figures).
//  3. Pull real World Bank data (free, no key): GNI per capita (PPP) + region/
//     income metadata for every economy.
//  4. Fit a log-log regression of (anchor cost) vs (GNI PPP) and use it to
//     estimate cost for every non-anchored country, so values stay realistic
//     and monotonic with income. Fall back to income-tier / region medians.
//  5. Derive sub-costs (rent, food, Big Mac, coffee) and bake to JSON.
//
// Run: npm run data    (output committed at src/data/countries.json)

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import countries from 'i18n-iso-countries'
import en from 'i18n-iso-countries/langs/en.json' with { type: 'json' }

countries.registerLocale(en)

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname, '../src/data/countries.json')

// US baseline used only for sub-cost scaling reference.
const US_BASE = 3400

// Comfortable single-person monthly cost (USD), incl. rent. Hand-anchored.
const ANCHORS = {
  CHE: 4200, NOR: 3300, ISL: 3300, USA: 3400, SGP: 3200, LUX: 3300, HKG: 3000,
  AUS: 2900, DNK: 2900, IRL: 2900, GBR: 2800, ISR: 2700, ARE: 2700, CAN: 2700,
  NLD: 2700, NZL: 2500, DEU: 2500, QAT: 2500, FRA: 2400, SWE: 2400, AUT: 2400,
  BEL: 2400, FIN: 2300, JPN: 2300, KOR: 2100, ITA: 2050, ESP: 1950, SAU: 1800,
  PRT: 1700, SVN: 1650, GRC: 1600, EST: 1550, CZE: 1500, CHN: 1500, CHL: 1450,
  POL: 1400, HRV: 1350, MEX: 1300, HUN: 1300, BRA: 1200, RUS: 1200, ROU: 1200,
  ZAF: 1150, ARG: 1100, THA: 1100, TUR: 1100, MYS: 1050, COL: 1000, PER: 950,
  IDN: 900, VNM: 880, PHL: 880, UKR: 850, MAR: 800, KEN: 750, IND: 700, GHA: 700,
  NGA: 700, LKA: 700, EGY: 650, TZA: 650, NPL: 600, BGD: 600, PAK: 600, ETH: 580,
  // Wealthy micro-states (often missing from World Bank GNI) — keep the extremes real.
  MCO: 4800, LIE: 4200, BMU: 4600, CYM: 3800, IMN: 2600, AND: 2200, SMR: 2000,
}

// Income-tier fallback cost (USD/mo) when GNI is unavailable.
const INCOME_FALLBACK = {
  'High income': 2500,
  'Upper middle income': 1300,
  'Lower middle income': 780,
  'Low income': 520,
}

// Friendlier, shorter region labels.
const REGION_LABEL = {
  'East Asia & Pacific': 'Asia-Pacific',
  'Europe & Central Asia': 'Europe & C. Asia',
  'Latin America & Caribbean': 'Latin America',
  'Middle East & North Africa': 'Middle East & N. Africa',
  'North America': 'North America',
  'South Asia': 'South Asia',
  'Sub-Saharan Africa': 'Sub-Saharan Africa',
}

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))
const round = (v, step = 1) => Math.round(v / step) * step

async function getJson(url) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), 30000)
  try {
    const res = await fetch(url, { signal: ctrl.signal })
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
    return await res.json()
  } finally {
    clearTimeout(t)
  }
}

async function fetchWorldBank() {
  // Country metadata (region, income, capital) — paginate.
  const meta = {}
  for (let page = 1; ; page++) {
    const j = await getJson(
      `https://api.worldbank.org/v2/country?format=json&per_page=300&page=${page}`,
    )
    const [info, rows] = j
    for (const c of rows || []) {
      if (!c.region || c.region.value === 'Aggregates') continue
      meta[c.id] = {
        region: (c.region.value || '').trim(),
        income: (c.incomeLevel?.value || '').trim(),
        capital: (c.capitalCity || '').trim(),
      }
    }
    if (!info || page >= info.pages) break
  }

  // GNI per capita, PPP (current international $) — most recent value.
  const gni = {}
  const gj = await getJson(
    'https://api.worldbank.org/v2/country/all/indicator/NY.GNP.PCAP.PP.CD?format=json&per_page=400&mrnev=1',
  )
  for (const r of gj[1] || []) {
    if (r.value != null) gni[r.countryiso3code] = r.value
  }
  return { meta, gni }
}

// Ordinary least squares for log(cost) = b0 + b1 * log(gni).
function fitLogLog(pairs) {
  const xs = pairs.map((p) => Math.log(p.gni))
  const ys = pairs.map((p) => Math.log(p.cost))
  const n = xs.length
  const mx = xs.reduce((a, b) => a + b, 0) / n
  const my = ys.reduce((a, b) => a + b, 0) / n
  let num = 0
  let den = 0
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (ys[i] - my)
    den += (xs[i] - mx) ** 2
  }
  const b1 = num / den
  const b0 = my - b1 * mx
  return { b0, b1 }
}

const oneDecimal = (v) => Number(v.toFixed(1))

function subCosts(mc) {
  const ratio = mc / US_BASE
  return {
    rent1br: round(mc * 0.42, 5),
    monthlyFood: round(mc * 0.22, 5),
    bigMac: oneDecimal(clamp(1.8 + ratio * 4.2, 1.6, 9)),
    coffee: oneDecimal(clamp(0.6 + ratio * 4.0, 0.5, 7)),
  }
}

async function main() {
  console.log('Fetching World Bank data…')
  let wb = { meta: {}, gni: {} }
  try {
    wb = await fetchWorldBank()
    console.log(
      `  metadata: ${Object.keys(wb.meta).length} countries, GNI: ${Object.keys(wb.gni).length} values`,
    )
  } catch (e) {
    console.warn('  World Bank fetch failed, falling back to anchors only:', e.message)
  }

  // Fit regression on anchors that have GNI.
  const fitPairs = []
  for (const [iso3, cost] of Object.entries(ANCHORS)) {
    const gni = wb.gni[iso3]
    if (gni) fitPairs.push({ iso3, cost, gni })
  }
  const fit = fitPairs.length >= 5 ? fitLogLog(fitPairs) : { b0: Math.log(520), b1: 0.3 }
  console.log(`  regression on ${fitPairs.length} anchors -> b0=${fit.b0.toFixed(3)} b1=${fit.b1.toFixed(3)}`)
  const predict = (gni) => Math.exp(fit.b0 + fit.b1 * Math.log(gni))

  // First pass: assign cost + collect by region for medians.
  const all = Object.keys(countries.getAlpha3Codes())
  const byRegion = {}
  const draft = {}

  for (const iso3 of all) {
    const name = countries.getName(iso3, 'en')
    if (!name) continue
    const numericId = countries.alpha3ToNumeric(iso3) || ''
    const iso2 = (countries.alpha3ToAlpha2(iso3) || '').toLowerCase()
    const meta = wb.meta[iso3] || {}
    const gni = wb.gni[iso3]

    let mc
    let source
    if (ANCHORS[iso3] != null) {
      mc = ANCHORS[iso3]
      source = 'anchor'
    } else if (gni) {
      mc = predict(gni)
      source = 'gni'
    } else if (meta.income && INCOME_FALLBACK[meta.income] != null) {
      mc = INCOME_FALLBACK[meta.income]
      source = 'income'
    } else {
      mc = null
      source = 'region' // resolved in pass 2
    }
    if (mc != null) mc = clamp(mc, 220, 5500)

    const rawRegion = meta.region || ''
    const region = REGION_LABEL[rawRegion] || rawRegion || 'Other'
    if (mc != null) (byRegion[region] ||= []).push(mc)

    draft[iso3] = {
      iso3,
      iso2,
      numericId,
      name,
      region,
      capital: meta.capital || '',
      gniPerCapita: gni || null,
      _mc: mc,
      _source: source,
    }
  }

  // Region medians for the no-data fallback.
  const median = (arr) => {
    const s = [...arr].sort((a, b) => a - b)
    return s.length ? s[Math.floor(s.length / 2)] : 900
  }
  const regionMedian = Object.fromEntries(
    Object.entries(byRegion).map(([r, arr]) => [r, median(arr)]),
  )
  const globalMedian = median(Object.values(byRegion).flat())

  // Second pass: finalize, derive sub-costs.
  const data = {}
  let fallbackCount = 0
  for (const iso3 of Object.keys(draft)) {
    const d = draft[iso3]
    let mc = d._mc
    if (mc == null) {
      mc = regionMedian[d.region] ?? globalMedian
      fallbackCount++
    }
    mc = round(clamp(mc, 220, 5500), 10)
    const sc = subCosts(mc)
    data[iso3] = {
      iso3: d.iso3,
      iso2: d.iso2,
      numericId: d.numericId,
      name: d.name,
      region: d.region,
      capital: d.capital,
      monthlyComfortable: mc,
      ...sc,
    }
  }

  // Manually add Kosovo (no official ISO numeric; present on the map as "Kosovo").
  if (!data.XKX) {
    const mc = 900
    data.XKX = {
      iso3: 'XKX',
      iso2: 'xk',
      numericId: '',
      name: 'Kosovo',
      region: 'Europe & C. Asia',
      capital: 'Pristina',
      monthlyComfortable: mc,
      ...subCosts(mc),
    }
  }

  const out = {
    meta: {
      description:
        'Realistic estimated monthly cost-of-living per country (USD), anchored to Numbeo-style figures and scaled by World Bank GNI per capita (PPP). Estimates for a "what-if" experience, not authoritative quotes.',
      generatedBy: 'scripts/build-countries-data.mjs',
      countryCount: Object.keys(data).length,
      anchors: Object.keys(ANCHORS).length,
      regionFallbacks: fallbackCount,
      units: 'USD per month, single person, comfortable lifestyle (incl. rent)',
    },
    data,
  }

  writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n')
  console.log(`\nWrote ${Object.keys(data).length} countries -> ${OUT}`)
  console.log(`  (${Object.keys(ANCHORS).length} anchored, ${fallbackCount} region-median fallbacks)`)
  // Sanity prints.
  const show = ['USA', 'CHE', 'THA', 'IND', 'NGA', 'DEU', 'JPN', 'MCO', 'VNM', 'COD', 'LUX']
  for (const c of show) {
    if (data[c]) {
      const d = data[c]
      console.log(
        `  ${c} ${d.name}: $${d.monthlyComfortable}/mo  rent $${d.rent1br}  bigMac $${d.bigMac}  [${d.region}]`,
      )
    }
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
