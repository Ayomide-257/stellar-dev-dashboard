/**
 * Simulated transactions & operations used by views that fall back when no
 * live Horizon data is available (#964).
 *
 * IMPORTANT: every value produced here is invented. It must only ever be
 * rendered behind `<DemoDataProvider>` so users see a visible "Demo data"
 * badge next to it. Never feed these rows into flows that imply real
 * on-chain state (balances, signing, accounting).
 */

import { DemoDataError } from './errors';

/** Above this many live records a view uses real data; at or below, demo data. */
export const DEMO_DATA_THRESHOLD = 5;

/** Number of sample transactions generated for the anomaly visualisation. */
export const DEMO_SAMPLE_SIZE = 120;

/**
 * Whether a view should fall back to simulated data given how many live
 * records it has. Mirrors the historical `count > 5 ? live : demo` check:
 * non-finite counts (no store data yet) fall back to demo data.
 */
export function shouldUseDemoData(liveCount: number): boolean {
  return !(liveCount > DEMO_DATA_THRESHOLD);
}

export interface DemoTransaction {
  id: string;
  hash: string;
  created_at: string;
  fee_charged: string;
  operation_count: number;
  successful: boolean;
  memo?: string;
  source_account: string;
}

export interface DemoOperation {
  id: string;
  type: string;
  created_at: string;
  amount: string;
  asset_code: string;
  from: string;
  to: string;
  transaction_hash: string;
  source_account: string;
}

const STELLAR_BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function randomStellarAddress(): string {
  let out = 'G';
  for (let i = 0; i < 55; i++) {
    out += STELLAR_BASE32[Math.floor(Math.random() * 32)];
  }
  return out;
}

function toNum(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Generate a deterministic-shape but randomly-valued sample of transactions.
 *
 * @throws {DemoDataError} when `count` is not a positive integer — callers
 * must treat that as "no data" rather than quietly rendering invented rows.
 */
export function generateDemoTransactions(count: number = DEMO_SAMPLE_SIZE): DemoTransaction[] {
  if (!Number.isInteger(count) || count < 1 || count > 5000) {
    throw new DemoDataError(
      'INVALID_COUNT',
      `Demo transaction count must be an integer between 1 and 5000, got ${String(count)}.`,
      { count }
    );
  }

  const now = Date.now();
  const txs: DemoTransaction[] = [];
  for (let i = 0; i < count; i++) {
    const isAnomaly = Math.random() < 0.12;
    const fee = isAnomaly ? 10000 + Math.random() * 40000 : 100 + Math.random() * 400;
    const opCount = isAnomaly ? Math.floor(Math.random() * 8) + 1 : Math.floor(Math.random() * 3) + 1;
    const success = isAnomaly ? Math.random() < 0.4 : Math.random() < 0.98;
    const hourOffset = isAnomaly ? Math.floor(Math.random() * 24) : 8 + Math.floor(Math.random() * 12);
    txs.push({
      id: `sample-${i}`,
      hash: `a${i.toString(16).padStart(63, '0')}`,
      created_at: new Date(now - (count - i) * 3600000 + hourOffset * 3600000).toISOString(),
      fee_charged: String(Math.round(fee)),
      operation_count: opCount,
      successful: success,
      memo: isAnomaly && Math.random() < 0.3 ? `ref-${i}` : undefined,
      source_account: randomStellarAddress(),
    });
  }
  return txs;
}

/**
 * Expand demo (or live) transactions into operation rows for the visualisation.
 *
 * @throws {DemoDataError} when `txs` is not an array.
 */
export function generateDemoOperations(txs: DemoTransaction[]): DemoOperation[] {
  if (!Array.isArray(txs)) {
    throw new DemoDataError('INVALID_TRANSACTIONS', 'Expected an array of transactions.', {
      received: typeof txs,
    });
  }

  const ops: DemoOperation[] = [];
  for (const tx of txs) {
    const opCount = toNum(tx.operation_count, 1);
    for (let j = 0; j < opCount; j++) {
      const types = [
        'payment',
        'create_account',
        'change_trust',
        'manage_sell_offer',
        'path_payment_strict_send',
        'set_options',
      ];
      const isAnomalyOp = !tx.successful || toNum(tx.fee_charged) > 5000;
      ops.push({
        id: `${tx.id}-op-${j}`,
        type: isAnomalyOp && Math.random() < 0.4 ? 'manage_sell_offer' : types[j % types.length],
        created_at: tx.created_at,
        amount: String(isAnomalyOp ? 10000 + Math.random() * 90000 : 10 + Math.random() * 500),
        asset_code: Math.random() < 0.5 ? 'XLM' : 'USDC',
        from: tx.source_account,
        to: randomStellarAddress(),
        transaction_hash: tx.hash,
        source_account: tx.source_account,
      });
    }
  }
  return ops;
}
