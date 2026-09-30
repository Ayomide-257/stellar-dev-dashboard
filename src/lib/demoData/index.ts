/**
 * Simulated-data generators (#964).
 *
 * Everything exported from here invents numbers. Contract for callers:
 *  1. Only use it on the fallback/demo path — real Horizon/RPC/API data wins.
 *  2. Render the result inside `<DemoDataProvider active>` so users see the
 *     "Demo data" badge.
 *  3. Handle `DemoDataError` by showing an empty state, never invented data.
 *
 * See docs/DATA_AUTHENTICITY.md for the full audit and policy.
 */

export { DemoDataError } from './errors';
export type { DemoDataErrorCode } from './errors';

export {
  DEMO_DATA_THRESHOLD,
  DEMO_SAMPLE_SIZE,
  shouldUseDemoData,
  generateDemoTransactions,
  generateDemoOperations,
} from './transactions';
export type { DemoTransaction, DemoOperation } from './transactions';

export { generateSimulatedPrices } from './prices';

export { generateDemoScanFindings } from './scans';
