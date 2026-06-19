import { motion } from 'framer-motion';
import { X, Home, ShoppingBasket, Sandwich, Coffee } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import styles from './CountryResultCard.module.css';
import GlassPanel from './ui/GlassPanel';
import TierBadge from './ui/TierBadge';
import FlagIcon from './ui/FlagIcon';
import type { Country } from '../lib/types';
import { computeLifestyle } from '../lib/lifestyle';
import { formatCurrency, formatCompact, formatDuration } from '../lib/format';

interface Props {
  country: Country;
  amount: number;
  currency: string;
  onClose: () => void;
}

const COMPARISON_ICONS: Record<string, LucideIcon> = {
  rent: Home,
  food: ShoppingBasket,
  bigmac: Sandwich,
  coffee: Coffee,
};

const ease = [0.16, 1, 0.3, 1] as const;

export default function CountryResultCard({
  country,
  amount,
  currency,
  onClose,
}: Props) {
  const result = computeLifestyle(amount, country);
  const { tier, years, comparisons } = result;

  return (
    <motion.div
      className={styles.dock}
      initial={{ y: 140, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 140, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 240, damping: 28 }}
    >
      <GlassPanel
        glow={tier.color}
        className={styles.shell}
        innerClassName={styles.card}
        innerStyle={{
          background:
            'linear-gradient(180deg, rgba(14,17,26,0.97), rgba(8,10,16,0.98))',
          borderColor: `color-mix(in srgb, ${tier.color} 28%, var(--line))`,
        }}
      >
        <button className={styles.close} onClick={onClose} aria-label='Close'>
          <X className='lucide' size={18} />
        </button>

        <div className={styles.headRow}>
          <FlagIcon iso2={country.iso2} size={30} />
          <div>
            <h2 className={styles.name}>{country.name}</h2>
            <span className={styles.region}>
              {country.capital ? `${country.capital} · ` : ''}
              {country.region}
            </span>
          </div>
        </div>

        <div className={styles.body}>
          <div className={styles.verdict}>
            <TierBadge tier={tier} size={66} animated />
            <div>
              <span className={styles.tierLabel} style={{ color: tier.color }}>
                {tier.label}
              </span>
              <p className={styles.verdictLine}>{tier.verdict}</p>
            </div>
          </div>

          <div className={styles.story}>
            <p className={styles.sentence}>
              With{' '}
              <strong className='tabular'>
                {formatCurrency(amount, currency)}
              </strong>{' '}
              here,{' '}
              {years >= 500 ? (
                <>
                  you&rsquo;d live in comfort{' '}
                  <strong style={{ color: tier.color }}>
                    for the rest of your life
                  </strong>
                  .
                </>
              ) : (
                <>
                  you could live comfortably for{' '}
                  <strong style={{ color: tier.color }}>
                    {formatDuration(years)}
                  </strong>
                  .
                </>
              )}
            </p>
            <p className={styles.blurb}>{tier.blurb}</p>
            <p className={styles.cost}>
              Comfortable living runs{' '}
              <strong>
                {formatCurrency(country.monthlyComfortable, currency)}/mo
              </strong>
              {' · '}1-bed rent{' '}
              <strong>{formatCurrency(country.rent1br, currency)}</strong>
            </p>
          </div>
        </div>

        <div className={styles.grid}>
          {comparisons.map((c, i) => {
            const Icon = COMPARISON_ICONS[c.id];
            return (
              <motion.div
                key={c.id}
                className={styles.stat}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease, delay: 0.12 + i * 0.06 }}
              >
                <span className={styles.statIcon}>
                  <Icon className='lucide' size={16} />
                </span>
                <span className={styles.statValue}>
                  {formatCompact(c.value)}
                </span>
                <span className={styles.statLabel}>{c.label}</span>
              </motion.div>
            );
          })}
        </div>
      </GlassPanel>
    </motion.div>
  );
}
