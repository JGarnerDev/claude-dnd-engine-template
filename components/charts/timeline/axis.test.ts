import { describe, it, expect } from 'vitest';
import { computeAxis } from './axis.js';
import type { TimelineEvent } from './types.js';

const events: TimelineEvent[] = [
  { date: '1340-01-01', label: 'a' },
  { date: '1341-06-01', label: 'b' },
  { date: '1342-11-20', label: 'c' }, // within the default 360-day year
];

describe('computeAxis', () => {
  it('reports empty for no events', () => {
    const a = computeAxis([]);
    expect(a.isEmpty).toBe(true);
    expect(a.contentWidth).toBe(0);
  });

  it('sorts events ascending by day index', () => {
    const a = computeAxis([events[2], events[0], events[1]]);
    expect(a.events.map((e) => e.label)).toEqual(['a', 'b', 'c']);
  });

  it('maps later dates to larger x', () => {
    const a = computeAxis(events);
    const xs = a.events.map((e) => a.xOf(e._idx));
    expect(xs[0]).toBeLessThan(xs[1]);
    expect(xs[1]).toBeLessThan(xs[2]);
  });

  it('emits one year tick per year across the span', () => {
    const a = computeAxis(events);
    expect(a.ticks.map((t) => t.label)).toEqual(['1340', '1341', '1342']);
  });

  it('scales contentWidth with density', () => {
    const a1 = computeAxis(events, undefined, 100);
    const a2 = computeAxis(events, undefined, 200);
    expect(a2.contentWidth).toBeGreaterThan(a1.contentWidth);
  });
});
