// Pure world-view layout: turn raw events + a calendar into placed items (above/
// below-axis collision lanes), year ticks, and canvas dimensions. No DOM —
// render.js consumes this. The time-axis math is shared via computeAxis (axis.ts);
// this file owns only the lane/collision packing and the centered-axis geometry.

import { DEFAULT_CALENDAR } from '../../_common/helpers/calendar.js';
import { computeAxisFrom, indexEvents } from '../../_common/helpers/axis.js';
import type { IndexedEvents } from '../../_common/helpers/axis.js';
import { clusterBeats } from '../../_common/helpers/cluster.js';
import { layoutLabels } from './labels.js';
import { weightOf } from '../../_common/helpers/weight.js';
import { PX_PER_YEAR, AXIS_GAP, TIER_H, MIN_CANVAS_HEIGHT, BAR_MAX_H, CLUSTER_OFF_GAP, LABEL_MAX_TIERS, LABEL_BOX_PAD } from '../../_common/constants.js';
import type { Calendar, DensityBar, Layout, TimelineEvent } from '../../_common/types.js';

// pxPerYear is the axis density (driven by the zoom control); higher = stretched.
// maxTiers is the label lane budget (the renderer derives it from viewport height;
// pure callers get the LABEL_MAX_TIERS fallback). Returns { isEmpty, contentWidth,
// canvasHeight, items, ticks, laneCount, spanYears }.
export function computeLayout(
  rawEvents: TimelineEvent[],
  cal: Calendar = DEFAULT_CALENDAR,
  pxPerYear: number = PX_PER_YEAR,
  maxTiers: number = LABEL_MAX_TIERS,
): Layout {
  return computeLayoutFrom(indexEvents(rawEvents, cal), cal, pxPerYear, maxTiers);
}

// Zoom step: lays out from pre-indexed events (sorted/day-indexed once by the
// renderer) so a zoom level re-runs only the density-driven scaling + lane
// packing, never the per-event sort. computeLayout is the convenience wrapper.
export function computeLayoutFrom(
  idx: IndexedEvents,
  cal: Calendar = DEFAULT_CALENDAR,
  pxPerYear: number = PX_PER_YEAR,
  maxTiers: number = LABEL_MAX_TIERS,
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

  // Priority, capped label gate + lane packing over the individuals (all visible
  // here — the renderer re-runs layoutLabels over the filter-matching subset when
  // a search/filter narrows the view). Majors claim the limited label slots first,
  // then non-majors fill leftover gaps; all obey the same spacing, so labels can't
  // tile into a wall even when thousands of beats crowd the axis. Bare beats are
  // on-axis dots (hover still shows the text) and consume no collision lane. The
  // full-set layout here is the worst case, so it sets the (locked) canvas height.
  const { showLabel, side: sideOf, offset: offsetOf, shift: shiftOf, laneCount } = layoutLabels(
    individuals.map((ei) => ({ x: xs[ei], major: !!events[ei].major })),
    individuals.map(() => true),
    { maxTiers },
  );
  const maxLane = Math.max(0, laneCount - 1);

  const halfHeight = AXIS_GAP + (Math.floor(maxLane / 2) + 1) * TIER_H + LABEL_BOX_PAD;
  // Below-axis half must also clear the tallest density bar.
  const canvasHeight = Math.max(MIN_CANVAS_HEIGHT, halfHeight * 2, (AXIS_GAP + BAR_MAX_H + LABEL_BOX_PAD) * 2);

  const items = individuals.map((ei, k) => {
    const e = events[ei];
    return {
      ...e,
      x: xs[ei],
      side: sideOf[k],
      offset: offsetOf[k],
      shift: shiftOf[k],
      weight: weightOf(e),
      track: e.track || 'world',
      text: e.major ? `★ ${e.label}` : e.label,
      showLabel: showLabel[k],
    };
  });

  return { isEmpty: false, contentWidth: axis.contentWidth, canvasHeight, items, bars, ticks: axis.ticks, laneCount: maxLane + 1, spanYears: axis.spanYears };
}
