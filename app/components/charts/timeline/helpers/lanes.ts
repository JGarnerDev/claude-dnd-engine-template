// Lane -> placement. Pure — no DOM. The interval packing itself lives in
// labels.ts (layoutLabels); this just maps a lane index to a side/tier/offset.

import { AXIS_GAP, TIER_H } from '../../_common/constants.js';
import type { Placement } from '../../_common/types.js';

// Lane -> placement. Even lanes go above the axis, odd below; each pair steps
// one tier further out.
export function placement(lane: number): Placement {
  return {
    side: lane % 2 === 0 ? 'above' : 'below',
    tier: Math.floor(lane / 2),
    offset: AXIS_GAP + Math.floor(lane / 2) * TIER_H,
  };
}
