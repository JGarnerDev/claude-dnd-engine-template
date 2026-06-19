// Calendar engine for the timeline view.
//
// Pure and dependency-free. Converts dates on an arbitrary (often fantasy)
// calendar into a monotonic day index, then into an x pixel coordinate.
//
// A calendar is: { epochLabel: string, months: [{ name, days }, ...] }.
// With no calendar supplied we use DEFAULT_CALENDAR (twelve 30-day months):
// a clean, monotonic fallback that's good enough for ordering and placement.
// Supply a config for real fantasy month systems (custom names / lengths).

import type { Calendar, DateParts } from '../types.js';

export const DEFAULT_CALENDAR: Calendar = {
  epochLabel: '',
  months: Array.from({ length: 12 }, (_, i) => ({ name: `Month ${i + 1}`, days: 30 })),
};

// Parse "YYYY[-MM[-DD]]" -> { year, month, day }. Missing parts default to 1.
// Negative (pre-epoch) years allowed: "-300-02-01".
export function parseDate(str: string): DateParts {
  // Runtime guard: dates arrive from external JSON, not only typed callers.
  if (typeof str !== 'string') {
    throw new TypeError(`date must be a string, got ${typeof str}`);
  }
  const m = str.trim().match(/^(-?\d+)(?:-(\d{1,2}))?(?:-(\d{1,2}))?$/);
  if (!m) throw new Error(`unparseable date: "${str}"`);
  return {
    year: parseInt(m[1], 10),
    month: m[2] ? parseInt(m[2], 10) : 1,
    day: m[3] ? parseInt(m[3], 10) : 1,
  };
}

// Precomputed, calendar-constant lookup tables. The calendar never changes
// within a render, so derive these once and reuse them: daysPerYear (full year
// length) + monthPrefix (days before each 0-based month). With them a day index
// is O(1) — no per-call month loop. monthPrefix.length === months.length.
export interface CalendarTables {
  daysPerYear: number;
  monthPrefix: number[];
}

export function calendarTables(cal: Calendar = DEFAULT_CALENDAR): CalendarTables {
  const monthPrefix: number[] = [];
  let acc = 0;
  for (const mo of cal.months) {
    monthPrefix.push(acc);
    acc += mo.days;
  }
  return { daysPerYear: acc, monthPrefix };
}

// O(1) absolute day index from precomputed tables. Hot paths (indexEvents over N
// events) build the tables once and call this per event.
export function dayIndexWith(date: DateParts, { daysPerYear, monthPrefix }: CalendarTables): number {
  const { year, month, day } = date;
  if (month < 1 || month > monthPrefix.length) {
    throw new RangeError(`month ${month} out of range 1..${monthPrefix.length}`);
  }
  return year * daysPerYear + monthPrefix[month - 1] + (day - 1);
}

// Absolute day index from year 0, month 1, day 1. Monotonic across the calendar,
// so it doubles as a sort key and as the domain value for createScale. Thin
// wrapper over dayIndexWith for one-off callers/tests; loops should reuse tables.
export function dayIndex(date: DateParts, cal: Calendar = DEFAULT_CALENDAR): number {
  return dayIndexWith(date, calendarTables(cal));
}

// Linear scale: day index -> x in [0, width]. min maps to 0, max maps to width.
// Degenerate domain (min === max) maps everything to 0.
export function createScale(minIndex: number, maxIndex: number, width: number): (index: number) => number {
  const span = maxIndex - minIndex;
  return (index: number) => (span === 0 ? 0 : ((index - minIndex) / span) * width);
}
