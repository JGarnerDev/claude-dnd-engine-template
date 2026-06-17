import { describe, it, expect } from 'vitest';
import { parseDate, dayIndex, createScale, DEFAULT_CALENDAR } from './calendar.js';

describe('parseDate', () => {
  it('parses a full date', () => {
    expect(parseDate('1342-05-01')).toEqual({ year: 1342, month: 5, day: 1 });
  });

  it('defaults missing month and day to 1', () => {
    expect(parseDate('1342')).toEqual({ year: 1342, month: 1, day: 1 });
    expect(parseDate('1342-07')).toEqual({ year: 1342, month: 7, day: 1 });
  });

  it('handles negative (pre-epoch) years', () => {
    expect(parseDate('-300-02-10')).toEqual({ year: -300, month: 2, day: 10 });
  });

  it('tolerates surrounding whitespace', () => {
    expect(parseDate('  1342-05-01  ')).toEqual({ year: 1342, month: 5, day: 1 });
  });

  it('throws on non-strings', () => {
    expect(() => parseDate(1342)).toThrow(TypeError);
  });

  it('throws on unparseable input', () => {
    expect(() => parseDate('not-a-date')).toThrow();
    expect(() => parseDate('')).toThrow();
  });
});

describe('dayIndex (default calendar)', () => {
  it('computes the absolute day index', () => {
    // 1342 full years * 360 + 4 prior months * 30 + (day 1 -> 0)
    expect(dayIndex(parseDate('1342-05-01'))).toBe(1342 * 360 + 4 * 30);
  });

  it('is monotonic across days, months, and years', () => {
    const d1 = dayIndex(parseDate('1342-05-01'));
    const d2 = dayIndex(parseDate('1342-05-02'));
    const d3 = dayIndex(parseDate('1342-06-01'));
    const d4 = dayIndex(parseDate('1343-01-01'));
    expect(d2).toBeGreaterThan(d1);
    expect(d3).toBeGreaterThan(d2);
    expect(d4).toBeGreaterThan(d3);
  });

  it('orders negative years before year 0', () => {
    expect(dayIndex(parseDate('-1-12-30'))).toBeLessThan(dayIndex(parseDate('0-01-01')));
  });

  it('throws on an out-of-range month', () => {
    expect(() => dayIndex(parseDate('1342-13-01'))).toThrow(RangeError);
    expect(() => dayIndex(parseDate('1342-00-01'))).toThrow(RangeError);
  });
});

describe('dayIndex (custom fantasy calendar)', () => {
  const cal = {
    epochLabel: 'AE',
    months: [
      { name: 'Frostwane', days: 30 },
      { name: 'Seedfall', days: 31 },
      { name: 'Highsun', days: 28 },
    ],
  };

  it('sums custom month lengths', () => {
    // all of Frostwane (30) + day 1 of Seedfall (-> 0)
    expect(dayIndex(parseDate('0-02-01'), cal)).toBe(30);
    // Frostwane (30) + Seedfall (31) + day 5 of Highsun (-> 4)
    expect(dayIndex(parseDate('0-03-05'), cal)).toBe(30 + 31 + 4);
  });

  it('uses the custom year length across year boundaries', () => {
    const perYear = 30 + 31 + 28; // 89
    expect(dayIndex(parseDate('1-01-01'), cal)).toBe(perYear);
  });

  it('range-checks against the custom month count', () => {
    expect(() => dayIndex(parseDate('0-04-01'), cal)).toThrow(RangeError);
  });
});

describe('createScale', () => {
  it('maps min to 0 and max to width', () => {
    const x = createScale(100, 200, 1000);
    expect(x(100)).toBe(0);
    expect(x(200)).toBe(1000);
    expect(x(150)).toBe(500);
  });

  it('collapses a degenerate domain to 0', () => {
    const x = createScale(50, 50, 1000);
    expect(x(50)).toBe(0);
  });
});

describe('DEFAULT_CALENDAR', () => {
  it('is twelve 30-day months (360-day year)', () => {
    expect(DEFAULT_CALENDAR.months).toHaveLength(12);
    expect(DEFAULT_CALENDAR.months.reduce((s, m) => s + m.days, 0)).toBe(360);
  });
});
