// Pure layout: turn raw events + a calendar into placed items, year ticks, and
// canvas dimensions. No DOM — render.js consumes this to build the chart, and
// it's directly unit-testable.

import { parseDate, dayIndex, createScale, DEFAULT_CALENDAR } from './calendar.js';
import { assignLanes, placement } from './lanes.js';
import { PX_PER_YEAR, MARGIN, AXIS_GAP, TIER_H, MIN_CANVAS_HEIGHT } from './constants.js';

function weightOf(e) {
  return e.major ? 'is-major' : e.minor ? 'is-minor' : 'is-normal';
}

// rawEvents: [{ date, label, track?, major?, minor? }]
// Returns { isEmpty, contentWidth, canvasHeight, items, ticks, laneCount }.
// item: { ...event, x, side, offset, weight, track, text }
// tick: { label, x }
export function computeLayout(rawEvents, cal = DEFAULT_CALENDAR, viewportWidth = 800) {
  const daysPerYear = cal.months.reduce((s, m) => s + m.days, 0);

  const events = rawEvents
    .map((e) => ({ ...e, _idx: dayIndex(parseDate(e.date), cal) }))
    .sort((a, b) => a._idx - b._idx);

  if (events.length === 0) {
    return { isEmpty: true, contentWidth: 0, canvasHeight: MIN_CANVAS_HEIGHT, items: [], ticks: [], laneCount: 0 };
  }

  const minIdx = events[0]._idx;
  const maxIdx = events[events.length - 1]._idx;
  const spanYears = Math.max(1, (maxIdx - minIdx) / daysPerYear);
  const contentWidth = Math.max(viewportWidth, Math.ceil(spanYears * PX_PER_YEAR) + MARGIN * 2);
  const scale = createScale(minIdx, maxIdx, contentWidth - MARGIN * 2);
  const xOf = (idx) => MARGIN + scale(idx);

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
  const ticks = [];
  for (let y = firstYear; y <= lastYear; y++) {
    ticks.push({ label: cal.epochLabel ? `${y} ${cal.epochLabel}` : `${y}`, x: xOf(y * daysPerYear) });
  }

  return { isEmpty: false, contentWidth, canvasHeight, items, ticks, laneCount: maxLane + 1 };
}
