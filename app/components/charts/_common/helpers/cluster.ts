// Density-histogram clustering (LOD), shared by both charts. Pure. When beats
// crowd past one per bucket, aggregate them into fixed-width pixel columns and emit
// a density bar per column (height ∝ count) instead of a wall of overlapping
// dots/labels. ALL beats bucket — including majors: with thousands of majors an
// exemption just rebuilds the wall. A bucket that contains a major is flagged
// (hasMajor) so the bar can still signal "a big beat happened here". Sparse buckets
// stay individual, so zooming in (which spreads beats over more pixels) melts the
// histogram back into per-beat markers. No DOM.
//
// The world view clusters all beats on one axis; the swimlane clusters each track
// row independently — both call clusterBeats per their own grouping.

import { DENSITY_BUCKET_PX, DENSITY_MIN, BAR_MIN_H, BAR_MAX_H, BAR_FULL_COUNT } from '../constants.js';
import type { DensityBar } from '../types.js';

export interface ClusterInput {
  x: number; // pixel position on the axis
  major: boolean; // flags the bucket as containing a major (badge), no longer an exemption
}

export interface ClusterResult {
  individuals: number[]; // input indices to render as normal markers (sparse buckets)
  bars: DensityBar[]; // dense buckets (>= DENSITY_MIN beats)
}

// Absolute (zoom-invariant) bar height for a member count: count/fullCount of the
// [minH, maxH] range, capped. Defaults are the world-view bar sizing; the swimlane
// passes a shorter range so a bar fits inside a track row. One source so the layout
// and any live re-count (e.g. rescaling a bar to its filter-matching members) agree.
export function barHeightFor(
  count: number,
  maxH: number = BAR_MAX_H,
  minH: number = BAR_MIN_H,
  fullCount: number = BAR_FULL_COUNT,
): number {
  return Math.round(minH + Math.min(1, count / fullCount) * (maxH - minH));
}

// items MUST be sorted ascending by x. bucketPx defaults to DENSITY_BUCKET_PX;
// barHeight maps a bucket's count to a bar height (defaults to barHeightFor).
export function clusterBeats(
  items: ClusterInput[],
  bucketPx: number = DENSITY_BUCKET_PX,
  barHeight: (count: number) => number = barHeightFor,
): ClusterResult {
  // Group every index by bucket (insertion order preserved per bucket).
  const groups = new Map<number, number[]>();
  items.forEach((it, i) => {
    const b = Math.floor(it.x / bucketPx);
    const g = groups.get(b);
    if (g) g.push(i);
    else groups.set(b, [i]);
  });

  // A bucket is a bar only once it holds DENSITY_MIN+ beats; below that its beats
  // stay individual (so a lightly-populated column still reads as real markers).
  const individuals: number[] = [];
  const dense: { bucket: number; members: number[] }[] = [];
  for (const [bucket, members] of groups) {
    if (members.length >= DENSITY_MIN) dense.push({ bucket, members });
    else individuals.push(...members);
  }

  const bars: DensityBar[] = dense.map(({ bucket, members }) => {
    const count = members.length;
    const height = barHeight(count);
    const centerX = members.reduce((s, idx) => s + items[idx].x, 0) / count;
    const hasMajor = members.some((idx) => items[idx].major);
    return { x0: bucket * bucketPx, centerX, count, height, hasMajor, members };
  });

  // Stable render order: individuals by original index, bars left→right.
  individuals.sort((a, b) => a - b);
  bars.sort((a, b) => a.x0 - b.x0);
  return { individuals, bars };
}
