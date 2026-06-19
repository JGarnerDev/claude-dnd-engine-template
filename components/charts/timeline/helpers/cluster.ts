// Density-histogram clustering (LOD) for the world view. Pure. When beats crowd
// past one per bucket, aggregate them into fixed-width pixel columns and emit a
// below-axis density bar per column (height ∝ √count) instead of a wall of
// overlapping dots/labels. ALL beats bucket — including majors: with thousands of
// majors the old "majors never cluster" exemption just rebuilt the wall. A bucket
// that contains a major is flagged (hasMajor) so the bar can still signal "a big
// beat happened here". Sparse buckets stay individual, so zooming in (which
// spreads beats over more pixels) melts the histogram back into per-beat markers.
// No DOM.

import { DENSITY_BUCKET_PX, DENSITY_MIN, BAR_MIN_H, BAR_MAX_H, BAR_FULL_COUNT } from '../../_common/constants.js';
import type { DensityBar } from '../../_common/types.js';

export interface ClusterInput {
  x: number; // pixel position on the axis
  major: boolean; // flags the bucket as containing a major (badge), no longer an exemption
}

export interface ClusterResult {
  individuals: number[]; // input indices to render as normal markers (sparse buckets)
  bars: DensityBar[]; // dense buckets (>= DENSITY_MIN beats)
}

// Absolute (zoom-invariant) bar height for a given member count: count/BAR_FULL_COUNT
// of the bar's range, capped. One source so the layout and any live re-count (e.g.
// the renderer rescaling a bar to its filter-matching members) stay in agreement.
export function barHeightFor(count: number): number {
  return Math.round(BAR_MIN_H + Math.min(1, count / BAR_FULL_COUNT) * (BAR_MAX_H - BAR_MIN_H));
}

// items MUST be sorted ascending by x. Bucket width defaults to DENSITY_BUCKET_PX.
// Bar heights scale by √count / √maxCount so the densest in-view bucket reaches
// BAR_MAX_H and the rest read proportionally (√ keeps small buckets from vanishing).
export function clusterBeats(items: ClusterInput[], bucketPx: number = DENSITY_BUCKET_PX): ClusterResult {
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
    const height = barHeightFor(count);
    const centerX = members.reduce((s, idx) => s + items[idx].x, 0) / count;
    const hasMajor = members.some((idx) => items[idx].major);
    return { x0: bucket * bucketPx, centerX, count, height, hasMajor, members };
  });

  // Stable render order: individuals by original index, bars left→right.
  individuals.sort((a, b) => a - b);
  bars.sort((a, b) => a.x0 - b.x0);
  return { individuals, bars };
}
