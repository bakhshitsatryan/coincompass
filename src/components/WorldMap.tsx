import { useCallback, useEffect, useRef, useState } from 'react'
import { ComposableMap, Geographies, Geography, ZoomableGroup, Sphere, Graticule } from 'react-simple-maps'
import { geoCentroid } from 'd3-geo'
import { Plus, Minus, Locate } from 'lucide-react'
import styles from './WorldMap.module.css'
import geoData from '../assets/countries-50m.json'
import { countryFromGeo, type GeoLike } from '../lib/countries'
import { tierFor, yearsOfLiving } from '../lib/lifestyle'
import { NEUTRAL_COLOR } from '../data/tiers'
import type { Country } from '../lib/types'
import { formatDuration } from '../lib/format'
import TierBadge from './ui/TierBadge'
import FlagIcon from './ui/FlagIcon'

interface Props {
  amount: number
  selected: Country | null
  onSelect: (c: Country) => void
}

type View = { coordinates: [number, number]; zoom: number }
const HOME: View = { coordinates: [12, 18], zoom: 1 }
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

function centroidOf(geo: GeoLike): [number, number] | null {
  try {
    const c = geoCentroid(geo as never) as [number, number]
    if (!c || Number.isNaN(c[0]) || Number.isNaN(c[1])) return null
    return c
  } catch {
    return null
  }
}

export default function WorldMap({ amount, selected, onSelect }: Props) {
  const [hovered, setHovered] = useState<Country | null>(null)
  const [position, setPosition] = useState<View>(HOME)

  const containerRef = useRef<HTMLDivElement>(null)
  const tipRef = useRef<HTMLDivElement>(null)
  const posRef = useRef<View>(position)
  posRef.current = position
  const rafRef = useRef<number | null>(null)
  const animatingRef = useRef(false)
  const reduced = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
  }, [])

  const animateTo = useCallback((coordinates: [number, number], zoom: number) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (reduced.current) {
      setPosition({ coordinates, zoom })
      return
    }
    const start = posRef.current
    const t0 = performance.now()
    const dur = 700
    animatingRef.current = true
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / dur)
      const e = 1 - Math.pow(1 - p, 3)
      setPosition({
        coordinates: [
          lerp(start.coordinates[0], coordinates[0], e),
          lerp(start.coordinates[1], coordinates[1], e),
        ],
        zoom: lerp(start.zoom, zoom, e),
      })
      if (p < 1) rafRef.current = requestAnimationFrame(tick)
      else animatingRef.current = false
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  const handleMove = (e: React.MouseEvent) => {
    const el = tipRef.current
    const box = containerRef.current
    if (!el || !box) return
    const r = box.getBoundingClientRect()
    el.style.transform = `translate(${e.clientX - r.left}px, ${e.clientY - r.top}px)`
  }

  const handleClick = (geo: GeoLike) => {
    const c = countryFromGeo(geo)
    if (!c) return
    onSelect(c)
    const centroid = centroidOf(geo)
    if (centroid) animateTo(centroid, Math.max(2.6, posRef.current.zoom))
  }

  const zoomBy = (factor: number) => {
    const z = Math.min(8, Math.max(1, posRef.current.zoom * factor))
    animateTo(posRef.current.coordinates, z)
  }

  const selectedKey = selected?.numericId || selected?.iso3 || ''
  const hoveredYears = hovered ? yearsOfLiving(amount, hovered) : 0
  const hoveredTier = hovered ? tierFor(amount, hovered) : null

  return (
    <div className={styles.wrap} ref={containerRef} onMouseMove={handleMove}>
      <ComposableMap
        className={styles.map}
        projection="geoEqualEarth"
        width={980}
        height={500}
        viewBox="0 0 980 500"
        preserveAspectRatio="xMidYMid meet"
        projectionConfig={{ scale: 185, center: [0, 0] }}
      >
        <ZoomableGroup
          center={position.coordinates}
          zoom={position.zoom}
          minZoom={1}
          maxZoom={8}
          onMoveEnd={(pos: View) => {
            if (animatingRef.current) return
            setPosition(pos)
          }}
        >
          <Sphere id="sphere" className={styles.sphere} stroke="transparent" strokeWidth={0} fill="url(#ocean)" />
          <Graticule className={styles.graticule} stroke="rgba(255,255,255,0.05)" />
          <defs>
            <radialGradient id="ocean" cx="50%" cy="42%" r="75%">
              <stop offset="0%" stopColor="#0b1320" />
              <stop offset="100%" stopColor="#070a12" />
            </radialGradient>
          </defs>
          <Geographies geography={geoData as object}>
            {({ geographies }: { geographies: GeoLike[] }) =>
              geographies.map((geo) => {
                const country = countryFromGeo(geo)
                const fill = country ? tierFor(amount, country).color : NEUTRAL_COLOR
                const isSelected = !!country && (country.numericId || country.iso3) === selectedKey
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={() => setHovered(country)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => handleClick(geo)}
                    className={`${styles.geo} ${country ? '' : styles.noData} ${isSelected ? styles.selected : ''}`}
                    style={{
                      default: {
                        fill,
                        stroke: isSelected ? '#ffffff' : 'rgba(5,7,12,0.55)',
                        strokeWidth: isSelected ? 1.1 : 0.4,
                        outline: 'none',
                        transition: 'fill 0.55s cubic-bezier(0.16,1,0.3,1)',
                      },
                      hover: {
                        fill,
                        stroke: '#ffffff',
                        strokeWidth: 0.9,
                        outline: 'none',
                        filter: 'brightness(1.22)',
                        cursor: country ? 'pointer' : 'default',
                      },
                      pressed: { fill, outline: 'none' },
                    }}
                  />
                )
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Zoom controls */}
      <div className={styles.controls}>
        <button className={styles.ctrl} onClick={() => zoomBy(1.6)} aria-label="Zoom in">
          <Plus className="lucide" size={17} />
        </button>
        <button className={styles.ctrl} onClick={() => zoomBy(1 / 1.6)} aria-label="Zoom out">
          <Minus className="lucide" size={17} />
        </button>
        <button className={styles.ctrl} onClick={() => animateTo(HOME.coordinates, HOME.zoom)} aria-label="Reset view">
          <Locate className="lucide" size={16} />
        </button>
      </div>

      {/* Cursor tooltip */}
      <div ref={tipRef} className={`${styles.tip} ${hovered ? styles.tipShown : ''}`}>
        {hovered && hoveredTier && (
          <>
            <div className={styles.tipHead}>
              <FlagIcon iso2={hovered.iso2} size={18} />
              <span className={styles.tipName}>{hovered.name}</span>
            </div>
            <div className={styles.tipRow}>
              <TierBadge tier={hoveredTier} size={26} />
              <div className={styles.tipMeta}>
                <span style={{ color: hoveredTier.color }}>{hoveredTier.label}</span>
                <span className={styles.tipYears}>
                  {hoveredYears >= 500 ? 'set for life' : `${formatDuration(hoveredYears)} of living`}
                </span>
              </div>
            </div>
            <span className={styles.tipHint}>click to open</span>
          </>
        )}
      </div>

      {/* Hint when nothing hovered/selected */}
      {!hovered && !selected && (
        <div className={styles.hint}>
          <span className={styles.hintDot} />
          Hover a country · click to see how you'd live there
        </div>
      )}
    </div>
  )
}
