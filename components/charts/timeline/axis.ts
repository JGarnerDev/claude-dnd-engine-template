// Shared time-axis math. Pure. Both the world-view layout (lanes) and the
// swimlane layout (track rows) need the same date→x mapping, domain padding,
// content width, and year ticks — this is the one source for all of it.

import { parseDate, dayIndex, createScale, DEFAULT_CALENDAR } from './calendar.js';
import { PX_PER_YEAR, MARGIN, EDGE_PAD } from './constants.js';
import type { Calendar, Tick, TimelineEvent } from './types.js';

export interface IndexedEvent extends TimelineEvent {
  _idx: number;
}

export interface Axis {
  isEmpty: boolean;
  events: IndexedEvent[]; // sorted ascending by _idx
  daysPerYear: number;
  minIdx: number;
  maxIdx: number;
  contentWidth: number;
  spanYears: number;
  xOf: (idx: number) => number;
  ticks: Tick[];
}

// pxPerYear is the axis density (driven by zoom); higher = stretched. Width is
// purely density-driven — no spread-to-fill — so a given pxPerYear always maps
// to the same px/year regardless of viewport.
export function computeAxis(
  rawEvents: TimelineEvent[],
  cal: Calendar = DEFAULT_CALENDAR,
  pxPerYear: number = PX_PER_YEAR,
): Axis {
  const daysPerYear = cal.months.reduce((s, m) => s + m.days, 0);

  const events: IndexedEvent[] = rawEvents
    .map((e) => ({ ...e, _idx: dayIndex(parseDate(e.date), cal) }))
    .sort((a, b) => a._idx - b._idx);

  if (events.length === 0) {
    return { isEmpty: true, events: [], daysPerYear, minIdx: 0, maxIdx: 0, contentWidth: 0, spanYears: 0, xOf: () => MARGIN, ticks: [] };
  }

  const minIdx = events[0]._idx;
  const maxIdx = events[events.length - 1]._idx;

  // Pad the date domain by EDGE_PAD of its span on each side so the first and
  // last beats sit inset from the canvas edges. Single-event timelines fall back
  // to a year of padding so the lone beat lands centered (no divide-by-zero).
  const pad = (maxIdx - minIdx || daysPerYear) * EDGE_PAD;
  const domMin = minIdx - pad;
  const domMax = maxIdx + pad;

  const spanYears = Math.max(1, (domMax - domMin) / daysPerYear);
  const contentWidth = Math.ceil(spanYears * pxPerYear) + MARGIN * 2;
  const scale = createScale(domMin, domMax, contentWidth - MARGIN * 2);
  const xOf = (idx: number) => MARGIN + scale(idx);

  const firstYear = Math.floor(minIdx / daysPerYear);
  const lastYear = Math.floor(maxIdx / daysPerYear);
  const ticks: Tick[] = [];
  for (let y = firstYear; y <= lastYear; y++) {
    ticks.push({ label: cal.epochLabel ? `${y} ${cal.epochLabel}` : `${y}`, x: xOf(y * daysPerYear) });
  }

  return { isEmpty: false, events, daysPerYear, minIdx, maxIdx, contentWidth, spanYears, xOf, ticks };
}
