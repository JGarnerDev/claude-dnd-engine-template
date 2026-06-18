// Greedy label-lane assignment (D9). Pure — no DOM.

import { LABEL_W, LABEL_GAP, AXIS_GAP, TIER_H } from '../constants.js';
import type { Placement } from '../types.js';

// Greedy interval coloring. `centers` must be ascending (events are sorted by
// time). Returns a lane index per center such that labels never horizontally
// overlap within a lane.
export function assignLanes(centers: number[], labelW = LABEL_W, gap = LABEL_GAP): number[] {
  const laneRight: number[] = [];
  return centers.map((cx) => {
    const left = cx - labelW / 2;
    const right = cx + labelW / 2;
    for (let lane = 0; ; lane++) {
      if (laneRight[lane] === undefined || laneRight[lane] + gap <= left) {
        laneRight[lane] = right;
        return lane;
      }
    }
  });
}

// Lane -> placement. Even lanes go above the axis, odd below; each pair steps
// one tier further out.
export function placement(lane: number): Placement {
  return {
    side: lane % 2 === 0 ? 'above' : 'below',
    tier: Math.floor(lane / 2),
    offset: AXIS_GAP + Math.floor(lane / 2) * TIER_H,
  };
}
