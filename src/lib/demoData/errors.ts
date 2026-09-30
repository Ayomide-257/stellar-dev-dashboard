/**
 * Errors thrown by the simulated ("demo") data generators (#964).
 *
 * Generators fail loudly on invalid input instead of silently inventing
 * numbers, so callers can render an empty state rather than fake data.
 */

export type DemoDataErrorCode = 'INVALID_COUNT' | 'INVALID_DAYS' | 'INVALID_TRANSACTIONS';

export class DemoDataError extends Error {
  code: DemoDataErrorCode;
  details?: Record<string, unknown>;

  constructor(code: DemoDataErrorCode, message: string, details?: Record<string, unknown>) {
    super(`[DemoData:${code}] ${message}`);
    this.name = 'DemoDataError';
    this.code = code;
    this.details = details;
  }
}
