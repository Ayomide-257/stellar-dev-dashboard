import { describe, it, expect } from 'vitest';
import {
  DemoDataError,
  DEMO_DATA_THRESHOLD,
  DEMO_SAMPLE_SIZE,
  shouldUseDemoData,
  generateDemoTransactions,
  generateDemoOperations,
  generateSimulatedPrices,
  generateDemoScanFindings,
} from '../demoData';

describe('demoData generators (#964)', () => {
  // ── Primary flow ───────────────────────────────────────────────────────────

  it('generates the requested number of demo transactions with chart-ready fields', () => {
    const txs = generateDemoTransactions(20);

    expect(txs).toHaveLength(20);
    expect(new Set(txs.map((t) => t.id)).size).toBe(20);
    for (const tx of txs) {
      expect(tx.hash).toMatch(/^a[0-9a-f]{63}$/);
      expect(Number.isFinite(Number(tx.fee_charged))).toBe(true);
      expect(tx.operation_count).toBeGreaterThanOrEqual(1);
      expect(typeof tx.successful).toBe('boolean');
      expect(tx.source_account).toMatch(/^G[A-Z2-7]{55}$/);
      expect(Number.isNaN(Date.parse(tx.created_at))).toBe(false);
    }
  });

  it('defaults to the documented sample size', () => {
    expect(generateDemoTransactions()).toHaveLength(DEMO_SAMPLE_SIZE);
  });

  it('expands transactions into operations that reference their parent hash', () => {
    const txs = generateDemoTransactions(5);
    const ops = generateDemoOperations(txs);

    expect(ops.length).toBeGreaterThanOrEqual(txs.length);
    const hashes = new Set(txs.map((t) => t.hash));
    for (const op of ops) {
      expect(hashes.has(op.transaction_hash)).toBe(true);
      expect(['XLM', 'USDC']).toContain(op.asset_code);
      expect(Number.isFinite(Number(op.amount))).toBe(true);
    }
  });

  it('generates simulated price series and scan findings in range', () => {
    const prices = generateSimulatedPrices('XLM', 30, 0.12);
    expect(prices).toHaveLength(31);
    expect(prices.every((p) => p > 0)).toBe(true);

    for (let i = 0; i < 50; i++) {
      const findings = generateDemoScanFindings();
      expect(Number.isInteger(findings)).toBe(true);
      expect(findings).toBeGreaterThanOrEqual(0);
      expect(findings).toBeLessThanOrEqual(7);
    }
  });

  // ── Boundary cases ─────────────────────────────────────────────────────────

  it('treats exactly the threshold count of live rows as demo data', () => {
    // <= 5 live records still falls back to the simulated sample…
    expect(shouldUseDemoData(DEMO_DATA_THRESHOLD)).toBe(true);
    expect(shouldUseDemoData(0)).toBe(true);
    // …one record above the threshold uses live data.
    expect(shouldUseDemoData(DEMO_DATA_THRESHOLD + 1)).toBe(false);
    expect(shouldUseDemoData(500)).toBe(false);
  });

  it('falls back to demo data when the live count is unknown (NaN)', () => {
    expect(shouldUseDemoData(Number.NaN)).toBe(true);
    expect(shouldUseDemoData(Number.POSITIVE_INFINITY)).toBe(false);
  });

  it('generates a single demo transaction at the lower boundary', () => {
    expect(generateDemoTransactions(1)).toHaveLength(1);
  });

  it('supports a zero-day simulated price history (single point)', () => {
    expect(generateSimulatedPrices('USDC', 0, 1)).toEqual([1]);
  });

  it('uses sensible default prices when the holding has no price', () => {
    const usdc = generateSimulatedPrices('USDC', 7);
    expect(usdc[usdc.length - 1]).toBeCloseTo(1.0, 5);
    const unknown = generateSimulatedPrices('XYZ', 7);
    expect(unknown.every((p) => p > 0)).toBe(true);
  });

  // ── Failure cases ──────────────────────────────────────────────────────────

  it('rejects invalid transaction counts instead of inventing data', () => {
    for (const bad of [0, -3, 2.5, Number.NaN]) {
      expect(() => generateDemoTransactions(bad)).toThrowError(DemoDataError);
      try {
        generateDemoTransactions(bad);
      } catch (err) {
        expect((err as DemoDataError).code).toBe('INVALID_COUNT');
      }
    }
  });

  it('rejects non-array input for operation generation', () => {
    expect(() => generateDemoOperations(null as never)).toThrowError(DemoDataError);
    try {
      generateDemoOperations('nope' as never);
    } catch (err) {
      expect((err as DemoDataError).code).toBe('INVALID_TRANSACTIONS');
    }
  });

  it('rejects invalid simulated price ranges', () => {
    for (const days of [-1, 1.5, 400]) {
      expect(() => generateSimulatedPrices('XLM', days)).toThrowError(DemoDataError);
    }
    try {
      generateSimulatedPrices('XLM', -1);
    } catch (err) {
      expect((err as DemoDataError).code).toBe('INVALID_DAYS');
    }
  });
});
