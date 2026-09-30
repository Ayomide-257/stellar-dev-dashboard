/**
 * Simulated price histories used as a fallback when no market-data source
 * (CoinGecko) covers an asset (#964).
 *
 * These numbers are invented. Views must render them behind
 * `<DemoDataProvider>` with a visible "Demo data" badge.
 */

import { DemoDataError } from './errors';

/** Last-resort starting price when neither holdings nor defaults apply. */
const DEFAULT_PRICE = 0.05;

const FALLBACK_PRICES: Record<string, number> = {
  USDC: 1.0,
  XLM: 0.12,
};

const VOLATILITY: Record<string, number> = {
  USDC: 0.001,
  XLM: 0.03,
};

/**
 * Generate a random-walk price series of `days + 1` points ending at
 * `currentPrice` (or a sensible default for the asset).
 *
 * @throws {DemoDataError} when `days` is not a non-negative integer.
 */
export function generateSimulatedPrices(
  code: string,
  days: number,
  currentPrice?: number
): number[] {
  if (!Number.isInteger(days) || days < 0 || days > 365) {
    throw new DemoDataError(
      'INVALID_DAYS',
      `Simulated price history requires 0-365 days, got ${String(days)}.`,
      { days, code }
    );
  }

  const start =
    typeof currentPrice === 'number' && Number.isFinite(currentPrice) && currentPrice > 0
      ? currentPrice
      : FALLBACK_PRICES[code] ?? DEFAULT_PRICE;

  const dailyVolatility = VOLATILITY[code] ?? 0.05;
  const trend = code === 'USDC' ? 0 : 0.0003;

  const prices: number[] = [];
  let price = start;
  for (let i = 0; i <= days; i++) {
    prices.push(price);
    const change = 1 + (Math.random() - 0.5) * dailyVolatility - trend;
    price = price / change;
  }
  return prices.reverse();
}
