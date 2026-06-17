// Pure layout: turn raw events + a calendar into placed items, year ticks, and
// canvas dimensions. No DOM — render.js consumes this to build the chart, and
// it's directly unit-testable.

import { parseDate, dayIndex, createScale, DEFAULT_CALENDAR } from './calendar.js';
import { assignLanes, placement } from './lanes.js';
import { PX_PER_YEAR, MARGIN, AXIS_GAP, TIER_H, MIN_CANVAS_HEIGHT, EDGE_PAD } from './constants.js';
import type { Calendar, Layout, Tick, TimelineEvent, Weight } from './types.js';

function weightOf(e: Pick<TimelineEvent, 'major' | 'minor'>): Weight {
  return e.major ? 'is-major' : e.minor ? 'is-minor' : 'is-normal';
}

// rawEvents: [{ date, label, track?, major?, minor? }]
// pxPerYear is the axis density (driven by the zoom control); higher = stretched.
// Width is purely density-driven — no spread-to-fill — so a given pxPerYear
// always maps to the same px/year regardless of viewport. The viewport floor
// (filling the window at the default zoom) lives in render.js via a fit density.
// Returns { isEmpty, contentWidth, canvasHeight, items, ticks, laneCount, spanYears }.
// item: { ...event, x, side, offset, weight, track, text }
// tick: { label, x }
export function computeLayout(
  rawEvents: TimelineEvent[],
  cal: Calendar = DEFAULT_CALENDAR,
  pxPerYear: number = PX_PER_YEAR,
): Layout {
  const daysPerYear = cal.months.reduce((s, m) => s + m.days, 0);

  const events = rawEvents
    .map((e) => ({ ...e, _idx: dayIndex(parseDate(e.date), cal) }))
    .sort((a, b) => a._idx - b._idx);

  if (events.length === 0) {
    return { isEmpty: true, contentWidth: 0, canvasHeight: MIN_CANVAS_HEIGHT, items: [], ticks: [], laneCount: 0, spanYears: 0 };
  }

  const minIdx = events[0]._idx;
  const maxIdx = events[events.length - 1]._idx;

  // Pad the date domain by EDGE_PAD of its span on each side so the first and
  // last beats (and their labels) sit inset from the canvas edges instead of
  // clipping. Single-event timelines fall back to a year of padding so the lone
  // beat lands centered rather than dividing by zero.
  const pad = (maxIdx - minIdx || daysPerYear) * EDGE_PAD;
  const domMin = minIdx - pad;
  const domMax = maxIdx + pad;

  const spanYears = Math.max(1, (domMax - domMin) / daysPerYear);
  const contentWidth = Math.ceil(spanYears * pxPerYear) + MARGIN * 2;
  const scale = createScale(domMin, domMax, contentWidth - MARGIN * 2);
  const xOf = (idx: number) => MARGIN + scale(idx);

  const lanes = assignLanes(events.map((e) => xOf(e._idx)));
  const maxLane = lanes.reduce((m, l) => Math.max(m, l), 0);
  const halfHeight = AXIS_GAP + (Math.floor(maxLane / 2) + 1) * TIER_H + 28;
  const canvasHeight = Math.max(MIN_CANVAS_HEIGHT, halfHeight * 2);

  const items = events.map((e, i) => {
    const { side, offset } = placement(lanes[i]);
    return {
      ...e,
      x: xOf(e._idx),
      side,
      offset,
      weight: weightOf(e),
      track: e.track || 'world',
      text: e.major ? `★ ${e.label}` : e.label,
    };
  });

  const firstYear = Math.floor(minIdx / daysPerYear);
  const lastYear = Math.floor(maxIdx / daysPerYear);
  const ticks: Tick[] = [];
  for (let y = firstYear; y <= lastYear; y++) {
    ticks.push({ label: cal.epochLabel ? `${y} ${cal.epochLabel}` : `${y}`, x: xOf(y * daysPerYear) });
  }

  return { isEmpty: false, contentWidth, canvasHeight, items, ticks, laneCount: maxLane + 1, spanYears };
}
