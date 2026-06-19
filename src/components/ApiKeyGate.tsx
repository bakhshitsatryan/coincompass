import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  KeyRound,
  ArrowRight,
  Dices,
  ChevronDown,
  ExternalLink,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react';
import styles from './ApiKeyGate.module.css';
import GlassPanel from './ui/GlassPanel';
import Button from './ui/Button';
import {
  fetchPortfolioValue,
  DEFAULT_BASE_URL,
  CURRENCIES,
  CoinStatsError,
} from '../api/coinstats';
import type { PortfolioState } from '../lib/types';
import { currencySymbol } from '../lib/format';

interface Props {
  onEnter: (state: PortfolioState) => void;
}

const DEMO_PRESETS = [
  { label: '$1K', value: 1_000 },
  { label: '$50K', value: 50_000 },
  { label: '$250K', value: 250_000 },
  { label: '$1M', value: 1_000_000 },
];

const ease = [0.16, 1, 0.3, 1] as const;
const rise = {
  hidden: { opacity: 0, y: 26, filter: 'blur(8px)' },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease, delay: 0.1 + i * 0.08 },
  }),
};

export default function ApiKeyGate({ onEnter }: Props) {
  const [apiKey, setApiKey] = useState('');
  const [shareToken, setShareToken] = useState('');
  const [baseUrl, setBaseUrl] = useState(DEFAULT_BASE_URL);
  const [currency, setCurrency] = useState('USD');
  const [advanced, setAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!apiKey.trim() || loading) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetchPortfolioValue(apiKey, {
        baseUrl,
        currency,
        shareToken: shareToken.trim() || undefined,
      });
      onEnter({
        amount: res.totalValue || 0,
        currency,
        source: 'portfolio',
        raw: res,
      });
    } catch (e) {
      setError(
        e instanceof CoinStatsError
          ? e.message
          : 'Something went wrong. Try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  const enterDemo = (value: number) =>
    onEnter({ amount: value, currency: 'USD', source: 'demo' });

  return (
    <div className={styles.gate}>
      <div className={styles.inner}>
        <motion.span
          custom={0}
          variants={rise}
          initial='hidden'
          animate='show'
          className='eyebrow'
        >
          <span className={styles.dot} /> Powered by the CoinStats API
        </motion.span>

        <motion.h1
          custom={1}
          variants={rise}
          initial='hidden'
          animate='show'
          className={styles.title}
        >
          Your crypto, mapped to{' '}
          <span className='text-grad-gold'>the entire world</span>.
        </motion.h1>

        <motion.p
          custom={2}
          variants={rise}
          initial='hidden'
          animate='show'
          className={styles.sub}
        >
          Connect your CoinStats portfolio and a real, interactive map of every
          country lights up — showing whether your stack makes you a{' '}
          <strong>king</strong> or leaves you on the street, country by country.
        </motion.p>

        <motion.div
          custom={3}
          variants={rise}
          initial='hidden'
          animate='show'
          className={styles.cardWrap}
        >
          <GlassPanel glow='var(--gold)' innerClassName={styles.card}>
            <label className={styles.fieldLabel} htmlFor='apikey'>
              <span>CoinStats API key</span>
              <a
                className={styles.getKey}
                href='https://coinstats.app/api/'
                target='_blank'
                rel='noreferrer'
              >
                Get an API key <ExternalLink className='lucide' size={12} />
              </a>
            </label>
            <div className={styles.inputRow}>
              <KeyRound className={`lucide ${styles.inputIcon}`} size={18} />
              <input
                id='apikey'
                className={styles.input}
                type='password'
                placeholder='Paste your X-API-KEY…'
                value={apiKey}
                autoComplete='off'
                spellCheck={false}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setError('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            <button
              className={styles.advToggle}
              onClick={() => setAdvanced((v) => !v)}
            >
              <ChevronDown
                className={`lucide ${styles.chev} ${
                  advanced ? styles.chevOpen : ''
                }`}
                size={15}
              />
              Advanced — share token, endpoint, currency
            </button>

            <AnimatePresence initial={false}>
              {advanced && (
                <motion.div
                  className={styles.advanced}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease }}
                >
                  <div className={styles.advInner}>
                    <div className={styles.advField}>
                      <span className={styles.smallLabel}>
                        Share token (optional)
                      </span>
                      <input
                        className={styles.smallInput}
                        placeholder='shareToken'
                        value={shareToken}
                        spellCheck={false}
                        onChange={(e) => setShareToken(e.target.value)}
                      />
                    </div>
                    <div className={styles.advField}>
                      <span className={styles.smallLabel}>
                        Endpoint base URL
                      </span>
                      <input
                        className={styles.smallInput}
                        value={baseUrl}
                        spellCheck={false}
                        onChange={(e) => setBaseUrl(e.target.value)}
                      />
                    </div>
                    <div className={styles.advFieldRow}>
                      <span className={styles.smallLabel}>Currency</span>
                      <select
                        className={styles.select}
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                      >
                        {CURRENCIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {error && (
                <motion.div
                  className={styles.error}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <TriangleAlert className='lucide' size={15} />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              variant='primary'
              size='lg'
              fullWidth
              trailingIcon={ArrowRight}
              loading={loading}
              onClick={handleSubmit}
              disabled={!apiKey.trim()}
            >
              {loading ? 'Reading your portfolio…' : 'Reveal my world'}
            </Button>

            <div className={styles.privacy}>
              <ShieldCheck className='lucide' size={13} />
              Your key is used only in your browser to call CoinStats directly.
              Nothing is stored.
            </div>
          </GlassPanel>

          {/* Demo block */}
          <div className={styles.demo}>
            <div className={styles.divider}>
              <span>no key? jump straight in</span>
            </div>
            <div className={styles.demoRow}>
              <Button
                variant='secondary'
                size='lg'
                leadingIcon={Dices}
                onClick={() => enterDemo(100_000)}
                className={styles.demoBtn}
              >
                Try the Demo
              </Button>
              <div className={styles.demoChips}>
                <span className={styles.demoChipsLabel}>with</span>
                {DEMO_PRESETS.map((p) => (
                  <button
                    key={p.value}
                    className={styles.demoChip}
                    onClick={() => enterDemo(p.value)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <div className={styles.footer}>
        {currencySymbol(currency)} · 240+ countries · realistic cost-of-living
        model
      </div>
    </div>
  );
}
