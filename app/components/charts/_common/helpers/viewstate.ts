// Pure fail-soft logic for applying a saved view's ChartState to live data
// (decision H). No DOM — the chart's get/setState seam and the storage layer
// both lean on these so the rules can't drift between read and apply. Tested in
// the default node env.

import type { ChartState } from '../types.js';

// The "nothing saved" baseline: fit zoom, no filter/search, no pan, DM-only off.
export const DEFAULT_STATE: ChartState = { query: '', tracks: [], zoomLevel: 1, scrollLeft: 0, showSecret: false };

// Clamp a saved zoom to the current data's range. maxZoom is data-derived and
// may differ from when the view was saved, so an over-range value snaps to the
// new ceiling; a non-finite value falls back to fit (1).
export function clampZoom(z: number, maxZoom: number): number {
  if (!Number.isFinite(z)) return 1;
  return Math.min(Math.max(z, 1), Math.max(1, maxZoom));
}

// Intersect a saved track selection with the tracks present in the current data,
// dropping names that no longer exist. Order follows the saved list. An empty
// result means "no filter" (all pass), consistent with the default.
export function resolveTracks(saved: readonly string[], available: readonly string[]): string[] {
  const present = new Set(available);
  return saved.filter((t) => present.has(t));
}

// Build a ChartState from a chart's live parts. tracks is taken from the live
// Set (order non-deterministic, but membership is what matters on apply).
export function serializeState(
  query: string,
  tracks: Iterable<string>,
  zoomLevel: number,
  scrollLeft: number,
  showSecret: boolean,
): ChartState {
  return { query, tracks: [...tracks], zoomLevel, scrollLeft, showSecret };
}

// Coerce an unknown/partial payload into a safe ChartState — every field gets a
// typed default if missing or the wrong type. Never throws (fail soft).
export function applyDefaults(raw: Partial<ChartState> | null | undefined): ChartState {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_STATE };
  return {
    query: typeof raw.query === 'string' ? raw.query : '',
    tracks: Array.isArray(raw.tracks) ? raw.tracks.filter((t): t is string => typeof t === 'string') : [],
    zoomLevel: typeof raw.zoomLevel === 'number' && Number.isFinite(raw.zoomLevel) ? raw.zoomLevel : 1,
    scrollLeft: typeof raw.scrollLeft === 'number' && Number.isFinite(raw.scrollLeft) ? raw.scrollLeft : 0,
    showSecret: typeof raw.showSecret === 'boolean' ? raw.showSecret : false,
  };
}
