import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  DemoDataProvider,
  useDemoData,
  DEMO_DATA_BADGE_TEXT,
  DEFAULT_DEMO_DATA_REASON,
} from '../DemoDataProvider';

/** Reads the nearest demo-data context so tests can assert on it. */
function ContextProbe() {
  const { active, reason } = useDemoData();
  return (
    <span data-testid="context-probe">{`${active ? 'active' : 'inactive'}::${reason}`}</span>
  );
}

describe('DemoDataProvider (#964)', () => {
  // ── Primary flow ────────────────────────────────────────────────────────────

  it('shows the visible "Demo data" badge with children when active', () => {
    render(
      <DemoDataProvider active reason="Simulated sample from bundled fixtures">
        <p>chart content</p>
      </DemoDataProvider>
    );

    const badge = screen.getByTestId('demo-data-badge');
    expect(badge).toBeVisible();
    expect(badge).toHaveTextContent(DEMO_DATA_BADGE_TEXT);
    // The reason is exposed so users can tell what is simulated.
    expect(badge.getAttribute('aria-label')).toContain('Simulated sample from bundled fixtures');
    expect(badge.getAttribute('title')).toContain('Simulated sample from bundled fixtures');
    // Children render inside the marked region.
    expect(screen.getByText('chart content')).toBeVisible();
    expect(screen.getByTestId('demo-data-region')).toContain(badge);
  });

  it('reports active context to consumers while showing the badge', () => {
    render(
      <DemoDataProvider active reason="sample rows">
        <ContextProbe />
      </DemoDataProvider>
    );
    expect(screen.getByTestId('context-probe')).toHaveTextContent('active::sample rows');
  });

  // ── Boundary cases ─────────────────────────────────────────────────────────

  it('renders children untouched with no badge when inactive (real-data path)', () => {
    render(
      <DemoDataProvider active={false} reason="should not be shown">
        <p>real data</p>
      </DemoDataProvider>
    );

    expect(screen.queryByTestId('demo-data-badge')).toBeNull();
    expect(screen.queryByTestId('demo-data-region')).toBeNull();
    expect(screen.getByText('real data')).toBeVisible();
    expect(screen.queryByTestId('context-probe')).toBeNull();
  });

  it('defaults to inactive when the active prop is omitted', () => {
    render(
      <DemoDataProvider>
        <ContextProbe />
      </DemoDataProvider>
    );
    expect(screen.getByTestId('context-probe')).toHaveTextContent('inactive::');
    expect(screen.queryByTestId('demo-data-badge')).toBeNull();
  });

  it('supports nesting: an inner inactive provider keeps the outer badge', () => {
    render(
      <DemoDataProvider active reason="outer demo">
        <div>
          <DemoDataProvider>
            <ContextProbe />
          </DemoDataProvider>
        </div>
      </DemoDataProvider>
    );
    expect(screen.getByTestId('demo-data-badge')).toBeVisible();
    expect(screen.getByTestId('context-probe')).toHaveTextContent('inactive::');
  });

  // ── Failure cases ──────────────────────────────────────────────────────────

  it('still badges the data with a default reason when no reason is given', () => {
    render(
      <DemoDataProvider active>
        <p>mystery numbers</p>
      </DemoDataProvider>
    );

    const badge = screen.getByTestId('demo-data-badge');
    expect(badge).toBeVisible();
    expect(badge).toHaveTextContent(DEMO_DATA_BADGE_TEXT);
    expect(badge.getAttribute('aria-label')).toContain(DEFAULT_DEMO_DATA_REASON);
    expect(screen.getByText('mystery numbers')).toBeVisible();
  });
});
