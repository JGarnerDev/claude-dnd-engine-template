// Pure world-view layout: turn raw events + a calendar into placed items (above/
// below-axis collision lanes), year ticks, and canvas dimensions. No DOM —
// render.js consumes this. The time-axis math is shared via computeAxis (axis.ts);
// this file owns only the lane/collision packing and the centered-axis geometry.

import { DEFAULT_CALENDAR } from '../../_common/helpers/calendar.js';
import { computeAxisFrom, indexEvents } from '../../_common/helpers/axis.js';
import type { IndexedEvents } from '../../_common/helpers/axis.js';
import { assignLanes, placement } from './lanes.js';
import { clusterBeats } from '../../_common/helpers/cluster.js';
import { gateLabels } from './labels.js';
import { weightOf } from '../../_common/helpers/weight.js';
import { PX_PER_YEAR, AXIS_GAP, TIER_H, MIN_CANVAS_HEIGHT, BAR_MAX_H, CLUSTER_OFF_GAP } from '../../_common/constants.js';
import type { Calendar, DensityBar, Layout, TimelineEvent } from '../../_common/types.js';

// pxPerYear is the axis density (driven by the zoom control); higher = stretched.
// Returns { isEmpty, contentWidth, canvasHeight, items, ticks, laneCount, spanYears }.
// item: { ...event, x, side, offset, weight, track, text }; tick: { label, x }
export function computeLayout(
  rawEvents: TimelineEvent[],
  cal: Calendar = DEFAULT_CALENDAR,
  pxPerYear: number = PX_PER_YEAR,
): Layout {
  return computeLayoutFrom(indexEvents(rawEvents, cal), cal, pxPerYear);
}

// Zoom step: lays out from pre-indexed events (sorted/day-indexed once by the
// renderer) so a zoom level re-runs only the density-driven scaling + lane
// packing, never the per-event sort. computeLayout is the convenience wrapper.
export function computeLayoutFrom(
  idx: IndexedEvents,
  cal: Calendar = DEFAULT_CALENDAR,
  pxPerYear: number = PX_PER_YEAR,
): Layout {
  const axis = computeAxisFrom(idx, cal, pxPerYear);
  if (axis.isEmpty) {
    return { isEmpty: true, contentWidth: 0, canvasHeight: MIN_CANVAS_HEIGHT, items: [], bars: [], ticks: [], laneCount: 0, spanYears: 0 };
  }

  const { events, xOf } = axis;
  const xs = events.map((e) => xOf(e._idx));

  // LOD: roll crowded beats into below-axis density bars (height ∝ count). But
  // clustering is an overview device only — once the timeline is zoomed in enough
  // that beats are individually resolvable (average spacing >= a dot footprint),
  // drop the bars and render every beat as its own marker, even coincident-date
  // ones (they overlap). Below that, dense buckets cluster. `individuals` indexes
  // into the sorted `events`; it's index-sorted and xs is ascending, so they're
  // already in time order.
  // Average spacing across the actual beat extent (not contentWidth, which counts
  // empty padding) — a tight cluster of N beats reads as crowded even on a wide axis.
  const avgGap = events.length > 1 ? (xs[xs.length - 1] - xs[0]) / (events.length - 1) : Infinity;
  const { individuals, bars } =
    avgGap < CLUSTER_OFF_GAP
      ? clusterBeats(events.map((e, i) => ({ x: xs[i], major: !!e.major })))
      : { individuals: events.map((_, i) => i), bars: [] as DensityBar[] };
  const indXs = individuals.map((ei) => xs[ei]);

  // Priority, capped label gate over the individuals: majors claim the limited
  // label slots first, then non-majors fill leftover gaps — but all obey the same
  // spacing, so labels can't tile into a wall even when thousands of beats (majors
  // included) crowd the axis. Unlabelled beats are bare on-axis dots (hover still
  // shows the text) and consume no collision lane. Recomputed per zoom.
  const showLabel = gateLabels(indXs, individuals.map((ei) => !!events[ei].major));

  // Lanes pack only the labelled individuals — their boxes are the only things
  // that can overlap. Map each lane back; bare beats get lane -1.
  const labelledLanes = assignLanes(indXs.filter((_, k) => showLabel[k]));
  let maxLane = 0;
  let li = 0;
  const laneOf: number[] = individuals.map((_, k) => {
    if (!showLabel[k]) return -1;
    const lane = labelledLanes[li++];
    maxLane = Math.max(maxLane, lane);
    return lane;
  });

  const halfHeight = AXIS_GAP + (Math.floor(maxLane / 2) + 1) * TIER_H + 28;
  // Below-axis half must also clear the tallest density bar.
  const canvasHeight = Math.max(MIN_CANVAS_HEIGHT, halfHeight * 2, (AXIS_GAP + BAR_MAX_H + 28) * 2);

  const items = individuals.map((ei, k) => {
    const e = events[ei];
    const { side, offset } = showLabel[k] ? placement(laneOf[k]) : { side: 'above' as const, offset: 0 };
    return {
      ...e,
      x: xs[ei],
      side,
      offset,
      weight: weightOf(e),
      track: e.track || 'world',
      text: e.major ? `★ ${e.label}` : e.label,
      showLabel: showLabel[k],
    };
  });

  return { isEmpty: false, contentWidth: axis.contentWidth, canvasHeight, items, bars, ticks: axis.ticks, laneCount: maxLane + 1, spanYears: axis.spanYears };
}
