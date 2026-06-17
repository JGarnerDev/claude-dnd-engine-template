import { describe, it, expect } from 'vitest';
import { computeLayout } from './layout.js';

const events = [
  { date: '1340-02-15', label: 'Winter begins', track: 'world', major: true },
  { date: '1341-06-01', label: 'Trade pact', track: 'faction' },
  { date: '1342-06-20', label: 'Tax revolt', track: 'world', minor: true },
];

describe('computeLayout', () => {
  it('orders items chronologically regardless of input order', () => {
    const out = computeLayout([events[2], events[0], events[1]]);
    expect(out.items.map((i) => i.label)).toEqual(['Winter begins', 'Trade pact', 'Tax revolt']);
  });

  it('assigns ascending x positions', () => {
    const xs = computeLayout(events).items.map((i) => i.x);
    expect(xs[0]).toBeLessThan(xs[1]);
    expect(xs[1]).toBeLessThan(xs[2]);
  });

  it('classifies weight from major/minor flags', () => {
    const out = computeLayout(events);
    expect(out.items[0].weight).toBe('is-major');
    expect(out.items[1].weight).toBe('is-normal');
    expect(out.items[2].weight).toBe('is-minor');
  });

  it('prefixes major labels with a star', () => {
    expect(computeLayout(events).items[0].text).toBe('★ Winter begins');
  });

  it('defaults a missing track to world', () => {
    const out = computeLayout([{ date: '1340-01-01', label: 'x' }]);
    expect(out.items[0].track).toBe('world');
  });

  it('emits one tick per year across the span', () => {
    const ticks = computeLayout(events).ticks.map((t) => t.label);
    expect(ticks).toEqual(['1340', '1341', '1342']);
  });

  it('labels ticks with the calendar epoch when present', () => {
    const cal = { epochLabel: 'AE', months: Array.from({ length: 12 }, () => ({ days: 30 })) };
    const out = computeLayout([{ date: '5-01-01', label: 'x' }], cal);
    expect(out.ticks[0].label).toBe('5 AE');
  });

  it('reports empty for no events', () => {
    const out = computeLayout([]);
    expect(out.isEmpty).toBe(true);
    expect(out.items).toHaveLength(0);
  });

  it('drives content width purely from density (no viewport floor)', () => {
    const narrow = computeLayout(events, undefined, 80);
    const wide = computeLayout(events, undefined, 320);
    expect(wide.contentWidth).toBeGreaterThan(narrow.contentWidth);
    // span ~2.35yr: at low density content is well under any sane viewport,
    // proving the old max(viewport, …) clamp is gone.
    expect(narrow.contentWidth).toBeLessThan(400);
  });

  it('keeps item x positions proportional to density', () => {
    const lo = computeLayout(events, undefined, 80).items.map((i) => i.x);
    const hi = computeLayout(events, undefined, 320).items.map((i) => i.x);
    expect(hi[2] - hi[0]).toBeGreaterThan(lo[2] - lo[0]);
  });

  it('reports span in years', () => {
    expect(computeLayout(events).spanYears).toBeGreaterThan(2);
  });

  it('insets the first and last beats ~5% from the canvas edges', () => {
    const out = computeLayout(events, undefined, 200);
    const xs = out.items.map((i) => i.x);
    const firstGap = xs[0];
    const lastGap = out.contentWidth - xs[xs.length - 1];
    // First/last sit well off the edges, near symmetric (allow the fixed margin).
    expect(firstGap).toBeGreaterThan(out.contentWidth * 0.04);
    expect(lastGap).toBeGreaterThan(out.contentWidth * 0.04);
    expect(Math.abs(firstGap - lastGap)).toBeLessThan(2);
  });

  it('centers a single beat', () => {
    const out = computeLayout([{ date: '1340-06-01', label: 'lone' }], undefined, 200);
    expect(out.items[0].x).toBeCloseTo(out.contentWidth / 2, 0);
  });
});
