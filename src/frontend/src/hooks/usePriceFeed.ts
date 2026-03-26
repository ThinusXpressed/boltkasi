import { useEffect, useState } from 'react';

const PRICE_URL = 'https://price-feed.dev.fedibtc.com/latest';

interface PriceFeed {
  zarPerSat: number | null;
}

let cached: { zarPerSat: number; fetchedAt: number } | null = null;

export function usePriceFeed(): PriceFeed {
  const [zarPerSat, setZarPerSat] = useState<number | null>(cached?.zarPerSat ?? null);

  useEffect(() => {
    // Reuse cache if less than 60 seconds old
    if (cached && Date.now() - cached.fetchedAt < 60_000) {
      setZarPerSat(cached.zarPerSat);
      return;
    }

    fetch(PRICE_URL)
      .then((r) => r.json())
      .then((data) => {
        const btcUsd: number = data.prices['BTC/USD']?.rate;
        const zarUsd: number = data.prices['ZAR/USD']?.rate;
        if (!btcUsd || !zarUsd) return;
        // sats → ZAR:  sats / 1e8 * btcUsd / zarUsd
        const zarPerSat = btcUsd / zarUsd / 1e8;
        cached = { zarPerSat, fetchedAt: Date.now() };
        setZarPerSat(zarPerSat);
      })
      .catch(() => {/* price unavailable, show nothing */});
  }, []);

  return { zarPerSat };
}

export function formatZAR(sats: number, zarPerSat: number | null): string {
  if (zarPerSat === null) return '';
  const zar = sats * zarPerSat;
  return `R ${zar.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
