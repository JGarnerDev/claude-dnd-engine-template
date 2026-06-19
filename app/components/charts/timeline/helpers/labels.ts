// Priority, capped label gate for the world view. Pure. Given the individual
// markers' x positions (ascending) and which are majors, decide which get a label.
// Majors get first claim on the limited label slots, then non-majors fill whatever
// gaps remain — but everyone obeys the same minGap spacing, so the total label
// count is capped by the available width. This is what stops a wall of labels when
// thousands of beats (majors included) crowd the axis. No DOM.

import { LABEL_W, LABEL_GAP } from '../../_common/constants.js';

// xs MUST be sorted ascending; majors[i] aligns with xs[i]. Returns a showLabel
// flag per index. Two ordered passes keep it O(n): majors greedily left→right,
// then non-majors clearing both the nearest placed major and the last placed
// non-major.
export function gateLabels(
  xs: number[],
  majors: boolean[],
  minGap: number = LABEL_W + LABEL_GAP,
): boolean[] {
  const n = xs.length;
  const show = new Array<boolean>(n).fill(false);

  // Pass 1 — majors win slots first, greedy by x.
  const placedMajorX: number[] = [];
  let lastMajor = -Infinity;
  for (let i = 0; i < n; i++) {
    if (majors[i] && xs[i] - lastMajor >= minGap) {
      show[i] = true;
      lastMajor = xs[i];
      placedMajorX.push(xs[i]);
    }
  }

  // Pass 2 — non-majors fill the leftover gaps. lastLeft tracks the rightmost
  // placed label at or left of the candidate (a placed major, advanced via mp, or
  // the previous placed non-major); the next placed major bounds it on the right.
  let mp = 0;
  let lastLeft = -Infinity;
  for (let i = 0; i < n; i++) {
    if (majors[i]) continue;
    const x = xs[i];
    while (mp < placedMajorX.length && placedMajorX[mp] <= x) lastLeft = Math.max(lastLeft, placedMajorX[mp++]);
    const rightMajor = mp < placedMajorX.length ? placedMajorX[mp] : Infinity;
    if (x - lastLeft >= minGap && rightMajor - x >= minGap) {
      show[i] = true;
      lastLeft = x;
    }
  }

  return show;
}
