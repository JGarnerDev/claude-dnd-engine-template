// Pure world-view layout: turn raw events + a calendar into placed items (above/
// below-axis collision lanes), year ticks, and canvas dimensions. No DOM —
// render.js consumes this. The time-axis math is shared via computeAxis (axis.ts);
// this file owns only the lane/collision packing and the centered-axis geometry.

import { DEFAULT_CALENDAR } from './calendar.js';
import { computeAxis } from './axis.js';
import { assignLanes, placement } from './lanes.js';
import { PX_PER_YEAR, AXIS_GAP, TIER_H, MIN_CANVAS_HEIGHT } from './constants.js';
import type { Calendar, Layout, TimelineEvent, Weight } from './types.js';

// Shared by the world-view items and the swimlane items (swimlane.ts).
export function weightOf(e: Pick<TimelineEvent, 'major' | 'minor'>): Weight {
  return e.major ? 'is-major' : e.minor ? 'is-minor' : 'is-normal';
}

// pxPerYear is the axis density (driven by the zoom control); higher = stretched.
// Returns { isEmpty, contentWidth, canvasHeight, items, ticks, laneCount, spanYears }.
// item: { ...event, x, side, offset, weight, track, text }; tick: { label, x }
export function computeLayout(
  rawEvents: TimelineEvent[],
  cal: Calendar = DEFAULT_CALENDAR,
  pxPerYear: number = PX_PER_YEAR,
): Layout {
  const axis = computeAxis(rawEvents, cal, pxPerYear);
  if (axis.isEmpty) {
    return { isEmpty: true, contentWidth: 0, canvasHeight: MIN_CANVAS_HEIGHT, items: [], ticks: [], laneCount: 0, spanYears: 0 };
  }

  const { events, xOf } = axis;
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

  return { isEmpty: false, contentWidth: axis.contentWidth, canvasHeight, items, ticks: axis.ticks, laneCount: maxLane + 1, spanYears: axis.spanYears };
}
