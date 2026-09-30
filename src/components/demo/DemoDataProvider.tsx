import React, { createContext, useContext, useMemo } from 'react';

/**
 * DemoDataProvider — marks simulated data as simulated (#964).
 *
 * Any view that falls back to invented numbers (no live Horizon/RPC/API data
 * yet, market-data fallback, bundled sample scan results, …) wraps that output
 * in this provider. When `active` is true a visible "Demo data" badge is
 * rendered above the children, so users can always tell real on-chain data
 * from simulated data.
 *
 * When `active` is false the provider is a pass-through: children render
 * exactly as before with no badge and no extra DOM wrapper, so the real-data
 * path is untouched.
 *
 * Consumers can also read the state via `useDemoData()` (e.g. to disable
 * actions that imply real balances while demo data is shown).
 */

export const DEMO_DATA_BADGE_TEXT = 'Demo data';

export const DEFAULT_DEMO_DATA_REASON =
  'Simulated data for demonstration purposes — not real on-chain values.';

export interface DemoDataContextValue {
  /** True while the surrounding subtree is rendering simulated data. */
  active: boolean;
  /** Human-readable explanation of what is simulated and why. */
  reason: string;
}

const DemoDataContext = createContext<DemoDataContextValue>({
  active: false,
  reason: '',
});

/** Read the nearest demo-data state. Always safe to call. */
export function useDemoData(): DemoDataContextValue {
  return useContext(DemoDataContext);
}

export interface DemoDataProviderProps {
  /** Render the badge when true. False (default) renders children untouched. */
  active?: boolean;
  /** Why the data is simulated — shown in the badge tooltip and aria-label. */
  reason?: string;
  children: React.ReactNode;
  /** Optional wrapper styling applied only while the badge is shown. */
  style?: React.CSSProperties;
  className?: string;
}

export function DemoDataProvider({
  active = false,
  reason = '',
  children,
  style,
  className,
}: DemoDataProviderProps) {
  const value = useMemo<DemoDataContextValue>(
    () => ({ active, reason }),
    [active, reason]
  );

  if (!active) {
    return <DemoDataContext.Provider value={value}>{children}</DemoDataContext.Provider>;
  }

  const label = reason || DEFAULT_DEMO_DATA_REASON;

  return (
    <DemoDataContext.Provider value={value}>
      <div
        className={className}
        data-testid="demo-data-region"
        style={{ display: 'flex', flexDirection: 'column', ...style }}
      >
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
          <span
            data-testid="demo-data-badge"
            role="status"
            aria-label={`${DEMO_DATA_BADGE_TEXT}: ${label}`}
            title={label}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 10px',
              borderRadius: '999px',
              border: '1px dashed var(--amber, #f59e0b)',
              background: 'var(--amber-glow, rgba(245, 158, 11, 0.12))',
              color: 'var(--amber, #f59e0b)',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              cursor: 'help',
            }}
          >
            <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true" focusable="false">
              <circle cx="4" cy="4" r="3" fill="currentColor" />
            </svg>
            {DEMO_DATA_BADGE_TEXT}
          </span>
        </div>
        {children}
      </div>
    </DemoDataContext.Provider>
  );
}

export default DemoDataProvider;
