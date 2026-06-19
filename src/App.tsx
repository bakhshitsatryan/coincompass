import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import AuroraBackground from './components/ui/AuroraBackground'
import ApiKeyGate from './components/ApiKeyGate'
import PortfolioHeader from './components/PortfolioHeader'
import WorldMap from './components/WorldMap'
import MapLegend from './components/MapLegend'
import CountryResultCard from './components/CountryResultCard'
import type { Country, PortfolioState } from './lib/types'
import styles from './App.module.css'

export default function App() {
  const [portfolio, setPortfolio] = useState<PortfolioState | null>(null)
  const [selected, setSelected] = useState<Country | null>(null)

  const enter = (state: PortfolioState) => {
    setPortfolio(state)
    setSelected(null)
  }
  const setAmount = (amount: number) =>
    setPortfolio((p) => (p ? { ...p, amount, source: 'manual', raw: undefined } : p))
  const reset = () => {
    setPortfolio(null)
    setSelected(null)
  }

  return (
    <>
      <AuroraBackground />
      <AnimatePresence mode="wait">
        {!portfolio ? (
          <motion.div
            key="gate"
            exit={{ opacity: 0, filter: 'blur(10px)', scale: 0.98 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <ApiKeyGate onEnter={enter} />
          </motion.div>
        ) : (
          <motion.div
            key="map"
            className={`${styles.mapView} ${selected ? styles.hasCard : ''}`}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.stage}>
              <WorldMap amount={portfolio.amount} selected={selected} onSelect={setSelected} />
            </div>

            <div className={styles.headerZone}>
              <PortfolioHeader portfolio={portfolio} onAmount={setAmount} onReset={reset} />
            </div>

            <div className={styles.legendZone}>
              <MapLegend amount={portfolio.amount} />
            </div>

            <AnimatePresence>
              {selected && (
                <motion.div
                  key="scrim"
                  className={styles.scrim}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setSelected(null)}
                />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {selected && (
                <CountryResultCard
                  key={selected.iso3}
                  country={selected}
                  amount={portfolio.amount}
                  currency={portfolio.currency}
                  onClose={() => setSelected(null)}
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
