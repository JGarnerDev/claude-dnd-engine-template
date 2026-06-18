import { describe, it, expect } from 'vitest';
import { buildTicks, yearStepFor } from './ticks.js';
import { DEFAULT_CALENDAR } from './calendar.js';

const DPY = 360; // DEFAULT_CALENDAR: twelve 30-day months
const idOfYear = (y: number) => y * DPY;
const identity = (idx: number) => idx; // x positions don't matter for label assertions

describe('yearStepFor', () => {
  it('uses a 1-year step when years are comfortably wide', () => {
    expect(yearStepFor(160)).toBe(1);
  });

  it('climbs the nice-step ladder as density drops', () => {
    expect(yearStepFor(10)).toBe(10); // 1..5 too tight at 10px/yr, 10*10=100 clears
    expect(yearStepFor(30)).toBe(2); // 2*30=60 clears
    expect(yearStepFor(5)).toBe(25); // 25*5=125 clears
  });

  it('extends past the table for extreme zoom-outs', () => {
    expect(yearStepFor(0.05)).toBeGreaterThan(1000);
  });
});

describe('buildTicks', () => {
  it('emits one tick per year at mid density', () => {
    const ticks = buildTicks(idOfYear(1340), idOfYear(1342), DEFAULT_CALENDAR, 160, identity);
    expect(ticks.map((t) => t.label)).toEqual(['1340', '1341', '1342']);
  });

  it('thins to a multi-year step when zoomed out', () => {
    const ticks = buildTicks(idOfYear(1340), idOfYear(1370), DEFAULT_CALENDAR, 10, identity);
    // 10px/yr → step 10 → only decade years.
    expect(ticks.map((t) => t.label)).toEqual(['1340', '1350', '1360', '1370']);
  });

  it('drops to month ticks when zoomed in far enough', () => {
    // 720px/yr → 60px per (12) months → month granularity.
    const ticks = buildTicks(idOfYear(1340), idOfYear(1340), DEFAULT_CALENDAR, 720, identity);
    expect(ticks).toHaveLength(12);
    expect(ticks[0].label).toBe('1340'); // first month carries the year
    expect(ticks[1].label).toBe('Month 2'); // others carry the month name
  });

  it('honors the calendar epoch label', () => {
    const cal = { epochLabel: 'AE', months: Array.from({ length: 12 }, () => ({ name: '', days: 30 })) };
    const ticks = buildTicks(idOfYear(5), idOfYear(5), cal, 160, identity);
    expect(ticks[0].label).toBe('5 AE');
  });

  it('places ticks via the supplied xOf', () => {
    const ticks = buildTicks(idOfYear(1340), idOfYear(1341), DEFAULT_CALENDAR, 160, (idx) => idx * 2);
    expect(ticks[0].x).toBe(idOfYear(1340) * 2);
  });
});
