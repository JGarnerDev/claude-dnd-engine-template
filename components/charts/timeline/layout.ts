// Pure world-view layout: turn raw events + a calendar into placed items (above/
// below-axis collision lanes), year ticks, and canvas dimensions. No DOM —
// render.js consumes this. The time-axis math is shared via computeAxis (axis.ts);
// this file owns only the lane/collision packing and the centered-axis geometry.

import { DEFAULT_CALENDAR } from './calendar.js';
import { computeAxis } from './axis.js';
import { assignLanes, placement } from './lanes.js';
import { PX_PER_YEAR, AXIS_GAP, TIER_H, MIN_CANVAS_HEIGHT, LABEL_W, LABEL_GAP } from './constants.js';
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
  const xs = events.map((e) => xOf(e._idx));

  // Density-gate labels (events are sorted by time). Walk left→right and grant a
  // label only when the beat clears one label footprint from the last labelled
  // beat; majors always get one. Beats that don't are bare on-axis dots — hover
  // still shows the full text. Crucially, unlabelled beats consume no collision
  // lane, so a dense timeline collapses from a wall of stacked labels to a clean
  // axis of dots with periodic labels. Recomputed per zoom (density rises), so
  // labels thin out when crowded and fill back in as you zoom in.
  const minGap = LABEL_W + LABEL_GAP;
  const showLabel: boolean[] = new Array(events.length);
  let lastLabelX = -Infinity;
  events.forEach((e, i) => {
    const wants = !!e.major || xs[i] - lastLabelX >= minGap;
    showLabel[i] = wants;
    if (wants) lastLabelX = xs[i];
  });

  // Lanes pack only the labelled beats — their boxes are the only things that
  // can overlap. Map each lane back to its event index; bare beats get lane -1.
  const labelledLanes = assignLanes(xs.filter((_, i) => showLabel[i]));
  let maxLane = 0;
  let li = 0;
  const laneOf: number[] = events.map((_, i) => {
    if (!showLabel[i]) return -1;
    const lane = labelledLanes[li++];
    maxLane = Math.max(maxLane, lane);
    return lane;
  });

  const halfHeight = AXIS_GAP + (Math.floor(maxLane / 2) + 1) * TIER_H + 28;
  const canvasHeight = Math.max(MIN_CANVAS_HEIGHT, halfHeight * 2);

  const items = events.map((e, i) => {
    const { side, offset } = showLabel[i] ? placement(laneOf[i]) : { side: 'above' as const, offset: 0 };
    return {
      ...e,
      x: xs[i],
      side,
      offset,
      weight: weightOf(e),
      track: e.track || 'world',
      text: e.major ? `★ ${e.label}` : e.label,
      showLabel: showLabel[i],
    };
  });

  return { isEmpty: false, contentWidth: axis.contentWidth, canvasHeight, items, ticks: axis.ticks, laneCount: maxLane + 1, spanYears: axis.spanYears };
}
