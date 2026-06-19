// Pure beat filtering. Given the raw events + a filter state, return the subset
// that should render. No DOM — render.js applies this before computeLayout, and
// it's directly unit-testable.

import type { FilterState, TimelineEvent } from '../types.js';

// Unique track names in source order (first appearance wins). Untagged events
// fall back to 'world', matching computeLayout's default.
export function trackList(events: TimelineEvent[]): string[] {
  return [...new Set(events.map((e) => e.track || 'world'))];
}

// Searchable text for one beat: its label, its track *member* name (the part
// after "category:", e.g. "Mara" from "character:Mara" — the bare category slug
// is skipped so "character" doesn't match every character beat), and any
// keywords (related-entity names). Lets a beat be found by a name not in its
// title. Built per call, like the old per-event label lowercasing.
function searchText(e: TimelineEvent): string {
  const parts = [e.label];
  if (e.track) {
    const i = e.track.indexOf(':');
    if (i >= 0) parts.push(e.track.slice(i + 1)); // track member, not the category slug
  }
  if (e.keywords) parts.push(...e.keywords);
  return parts.join(' ').toLowerCase();
}

// Build a reusable predicate from a filter state. The query is trimmed +
// lowercased *once* here, not per event — hot paths (applyVisibility over N
// markers, draw over N items) call this once per filter edit and reuse the
// closure, instead of re-normalizing the same query string N times.
//   - query   : case-insensitive substring match against the beat's search text
//               (label + track member + keywords; blank = all)
//   - tracks  : whitelist of track names; omit/null = every track passes
export function makeMatcher({ query = '', tracks = null }: FilterState = {}): (e: TimelineEvent) => boolean {
  const q = query.trim().toLowerCase();
  return (e: TimelineEvent): boolean => {
    if (tracks && !tracks.has(e.track || 'world')) return false;
    if (q && !searchText(e).includes(q)) return false;
    return true;
  };
}

// Does one event pass the filter state? Convenience wrapper over makeMatcher for
// one-off / non-hot callers and tests; per-item hot loops should build a matcher
// once with makeMatcher and reuse it.
export function matchesFilters(e: TimelineEvent, state: FilterState = {}): boolean {
  return makeMatcher(state)(e);
}

// Subset of events that pass the filter. Note: the renderer lays out the *full*
// event set (so filtering never shifts the x/y scale) and uses matchesFilters
// per marker to toggle visibility — this helper is for non-render callers/tests.
export function applyFilters(events: TimelineEvent[], state: FilterState = {}): TimelineEvent[] {
  return events.filter((e) => matchesFilters(e, state));
}
