// Label placement for the world view. Pure — no DOM. Packs the individual beats'
// labels into a budget of vertical lanes (alternating above/below the axis via
// placement()), but unlike a fixed centered-over-the-dot gate this lets a label
// slide horizontally (`shift`) into adjacent empty axis space, with the leader
// slanting to bridge the gap. So crowded labels claim sideways room instead of
// dropping, and the lane budget (viewport-derived by the renderer) uses the
// vertical room actually on screen. Two priority passes keep majors first.
//
// Filtering re-runs this over only the visible subset, so narrowing the view frees
// budget for the survivors — a lone search hit on an empty axis regains its label.

import { LABEL_W, LABEL_GAP, LABEL_MAX_TIERS, LABEL_MAX_SHIFT } from '../../_common/constants.js';
import { placement } from './lanes.js';
import type { Side } from '../../_common/types.js';

// Per-item placement, aligned to `items`. shift = label-center x minus the dot x
// (>= 0; the leader spans it). Bare beats (hidden, or no tier within reach) are
// showLabel=false, side 'above', offset/shift 0 and consume no lane.
export interface LabelLayout {
  showLabel: boolean[];
  side: Side[];
  offset: number[];
  shift: number[];
  laneCount: number;
}

export interface LabelOpts {
  maxTiers?: number; // lane budget (alternating above/below)
  labelW?: number; // label box width, px
  gap?: number; // min horizontal gap between two boxes sharing a lane
  maxShift?: number; // max px a label may slide off its dot to fit a lane
}

// `items` MUST be x-ascending (callers pass time-sorted beats). visible[i] gates a
// beat out of the competition entirely (filtered). Greedy: for each beat (majors
// first, then non-majors, each left-to-right), take the lowest lane where the
// label — pushed right just far enough to clear what's already there — still sits
// within maxShift of the dot. None fits => bare.
export function layoutLabels(items: { x: number; major: boolean }[], visible: boolean[], opts: LabelOpts = {}): LabelLayout {
  const maxTiers = opts.maxTiers ?? LABEL_MAX_TIERS;
  const labelW = opts.labelW ?? LABEL_W;
  const gap = opts.gap ?? LABEL_GAP;
  const maxShift = opts.maxShift ?? LABEL_MAX_SHIFT;

  const n = items.length;
  const showLabel = new Array<boolean>(n).fill(false);
  const side: Side[] = new Array<Side>(n).fill('above');
  const offset = new Array<number>(n).fill(0);
  const shift = new Array<number>(n).fill(0);

  // Each lane's occupied label-box intervals [left, right], kept sorted by left.
  const lanes: Array<Array<[number, number]>> = [];
  let maxLane = -1;

  // Smallest left >= start such that [left, left+labelW] clears every interval on
  // the lane by `gap`. Walks the sorted intervals once, ratcheting right past any
  // that conflict (handles boxes on either side — it may jump fully past one).
  const clearLeft = (list: Array<[number, number]>, start: number): number => {
    let L = start;
    for (const [l, r] of list) {
      if (l < L + labelW + gap && r + gap > L) L = r + gap;
    }
    return L;
  };
  const insert = (list: Array<[number, number]>, iv: [number, number]): void => {
    let lo = 0;
    while (lo < list.length && list[lo][0] < iv[0]) lo++;
    list.splice(lo, 0, iv);
  };

  const tryPlace = (i: number): void => {
    const x = items[i].x;
    for (let t = 0; t < maxTiers; t++) {
      const list = lanes[t] || (lanes[t] = []);
      const left = clearLeft(list, x - labelW / 2);
      const cx = left + labelW / 2;
      if (cx - x <= maxShift) {
        insert(list, [left, left + labelW]);
        const p = placement(t);
        showLabel[i] = true;
        side[i] = p.side;
        offset[i] = p.offset;
        shift[i] = cx - x;
        if (t > maxLane) maxLane = t;
        return;
      }
    }
  };

  for (let i = 0; i < n; i++) if (visible[i] && items[i].major) tryPlace(i);
  for (let i = 0; i < n; i++) if (visible[i] && !items[i].major) tryPlace(i);

  return { showLabel, side, offset, shift, laneCount: maxLane + 1 };
}
