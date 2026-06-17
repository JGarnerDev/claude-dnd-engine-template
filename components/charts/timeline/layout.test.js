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

  it('widens content to at least the viewport width', () => {
    const out = computeLayout(events, undefined, 2000);
    expect(out.contentWidth).toBeGreaterThanOrEqual(2000);
  });
});
