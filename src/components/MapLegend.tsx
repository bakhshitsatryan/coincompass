import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, ChevronDown, MapPin } from 'lucide-react';
import styles from './MapLegend.module.css';
import { TIERS } from '../data/tiers';
import { ALL_COUNTRIES } from '../lib/countries';
import { summarizeWorld } from '../lib/lifestyle';
import TierBadge from './ui/TierBadge';
import FlagIcon from './ui/FlagIcon';

interface Props {
  amount: number;
}

// Only count "real" countries (skip entries without an ISO2/flag).
const COUNTABLE = ALL_COUNTRIES.filter((c) => c.iso2 && c.numericId);

export default function MapLegend({ amount }: Props) {
  // Collapsed by default on phones so the legend doesn't blanket the map; the
  // user can tap to expand the full tier breakdown.
  const [open, setOpen] = useState(
    typeof window === 'undefined' || window.innerWidth > 680
  );
  const summary = useMemo(() => summarizeWorld(amount, COUNTABLE), [amount]);

  const insight =
    summary.kingCount > 0
      ? `You'd reign as a King in ${summary.kingCount} ${
          summary.kingCount === 1 ? 'country' : 'countries'
        }.`
      : summary.comfortableOrBetter > 0
      ? `You'd live comfortably in ${summary.comfortableOrBetter} ${
          summary.comfortableOrBetter === 1 ? 'country' : 'countries'
        }.`
      : `Right now, this stack struggles almost everywhere.`;

  return (
    <motion.aside
      className={styles.legend}
      initial={{ opacity: 0, x: -22 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
    >
      <div className={styles.insight}>
        <span className={styles.crown}>
          <Crown className='lucide' size={16} strokeWidth={1.6} />
        </span>
        <p className={styles.insightText}>{insight}</p>
      </div>

      {summary.bestCountry && (
        <div className={styles.best}>
          <MapPin className='lucide' size={13} />
          Lasts longest in
          <FlagIcon iso2={summary.bestCountry.iso2} size={14} />
          <strong>{summary.bestCountry.name}</strong>
        </div>
      )}

      <button className={styles.toggle} onClick={() => setOpen((v) => !v)}>
        How you'd live
        <ChevronDown
          className={`lucide ${styles.chev} ${open ? styles.chevOpen : ''}`}
          size={14}
        />
      </button>

      <motion.div
        className={styles.scale}
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        style={{ overflow: 'hidden' }}
      >
        <div className={styles.scaleInner}>
          {TIERS.map((tier) => (
            <div key={tier.id} className={styles.row}>
              <TierBadge tier={tier} size={22} />
              <span className={styles.rowLabel} style={{ color: tier.color }}>
                {tier.label}
              </span>
              <span className={styles.count}>
                {summary.tierCounts[tier.id] ?? 0}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.aside>
  );
}
