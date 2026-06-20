// Pure beat filtering. Given the raw events + a filter state, return the subset
// that should render. No DOM — render.js applies this before computeLayout, and
// it's directly unit-testable.

import type { FilterState, TimelineEvent } from '../types.js';
import { DM_AUDIENCE } from '../constants.js';

// Does a single audience know this beat? The DM knows everything (secrets too). A
// character never sees a secret beat; otherwise it knows a beat whose knownBy
// lists it, and every public beat (one with no knownBy — common knowledge).
function knownTo(e: TimelineEvent, audience: string): boolean {
  if (audience === DM_AUDIENCE) return true;
  if (e.secret) return false;
  if (e.knownBy && e.knownBy.length > 0) return e.knownBy.includes(audience);
  return true;
}

// A beat passes the viewpoint filter if no audience is selected (no filter) or at
// least one selected audience knows it (union — mirrors the track whitelist).
function audienceVisible(e: TimelineEvent, audiences: Set<string> | null): boolean {
  if (!audiences || audiences.size === 0) return true;
  for (const a of audiences) if (knownTo(e, a)) return true;
  return false;
}

// Unique track names in source order (first appearance wins). Untagged events
// fall back to 'world', matching computeLayout's default.
export function trackList(events: TimelineEvent[]): string[] {
  return [...new Set(events.map((e) => e.track || 'world'))];
}

// Distinct character names that appear in any beat's knownBy, in first-appearance
// order. These seed the per-character viewpoint buttons; a character earns a button
// once some beat names them as knowing it.
export function audienceList(events: TimelineEvent[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const e of events) {
    if (!e.knownBy) continue;
    for (const c of e.knownBy) {
      if (!seen.has(c)) {
        seen.add(c);
        out.push(c);
      }
    }
  }
  return out;
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
//   - query    : case-insensitive substring match against the beat's search text
//                (label + track member + keywords; blank = all)
//   - tracks   : whitelist of track names; omit/null/empty = every track passes
//                (empty selection means "no track filter", not "hide all")
//   - audiences: viewpoint whitelist (see audienceVisible). Empty/null (default)
//                = no filter; otherwise the union of what the selected audiences
//                know. DM sees all; a character sees their non-secret knowledge.
export function makeMatcher({ query = '', tracks = null, audiences = null }: FilterState = {}): (e: TimelineEvent) => boolean {
  const q = query.trim().toLowerCase();
  return (e: TimelineEvent): boolean => {
    if (!audienceVisible(e, audiences)) return false;
    if (tracks && tracks.size > 0 && !tracks.has(e.track || 'world')) return false;
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
