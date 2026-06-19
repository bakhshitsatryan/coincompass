import { motion } from 'framer-motion';
import {
  Compass,
  Wallet,
  Dices,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import styles from './PortfolioHeader.module.css';
import AnimatedNumber from './ui/AnimatedNumber';
import AmountOverride from './AmountOverride';
import Button from './ui/Button';
import type { PortfolioState } from '../lib/types';
import { formatCurrency, formatPercent, currencySymbol } from '../lib/format';

interface Props {
  portfolio: PortfolioState;
  onAmount: (amount: number) => void;
  onReset: () => void;
}

const SOURCE_META: Record<
  PortfolioState['source'],
  { label: string; icon: LucideIcon }
> = {
  portfolio: { label: 'CoinStats portfolio', icon: Wallet },
  demo: { label: 'Demo portfolio', icon: Dices },
  manual: { label: 'Custom amount', icon: SlidersHorizontal },
};

export default function PortfolioHeader({
  portfolio,
  onAmount,
  onReset,
}: Props) {
  const { amount, currency, source, raw } = portfolio;
  const meta = SOURCE_META[source];
  const SourceIcon = meta.icon;
  const pl = raw?.allTimeProfitLossPercent;
  const showPl = source === 'portfolio' && typeof pl === 'number' && pl !== 0;

  return (
    <motion.header
      className={styles.bar}
      initial={{ y: -28, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <button
        type='button'
        className={styles.brand}
        onClick={onReset}
        aria-label='Back to home'
        title='Back to home'
      >
        <span className={styles.mark}>
          <Compass className='lucide' size={19} strokeWidth={1.6} />
        </span>
        <span className={styles.brandText}>
          Coin<span className='text-grad-gold'>Compass</span>
        </span>
      </button>

      <div className={styles.value}>
        <div className={styles.valueMeta}>
          <span className={styles.sourceChip}>
            <SourceIcon className='lucide' size={12} />
            {meta.label}
          </span>
          {showPl && (
            <span
              className={`${styles.pl} ${pl! > 0 ? styles.up : styles.down}`}
            >
              {formatPercent(pl!)} all-time
            </span>
          )}
        </div>
        <AnimatedNumber
          className={`${styles.amount} tabular`}
          value={amount}
          format={(n) => formatCurrency(n, currency)}
        />
      </div>

      <div className={styles.controls}>
        <AmountOverride
          value={amount}
          currencySymbol={currencySymbol(currency) || '$'}
          onChange={onAmount}
        />
        <Button
          variant='ghost'
          size='md'
          leadingIcon={RotateCcw}
          onClick={onReset}
          className={styles.reset}
        >
          Start over
        </Button>
      </div>
    </motion.header>
  );
}
