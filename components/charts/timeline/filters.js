// Pure beat filtering. Given the raw events + a filter state, return the subset
// that should render. No DOM — render.js applies this before computeLayout, and
// it's directly unit-testable.

// Unique track names in source order (first appearance wins). Untagged events
// fall back to 'world', matching computeLayout's default.
export function trackList(events) {
  return [...new Set(events.map((e) => e.track || 'world'))];
}

// Does one event pass the filter state? state: { query?, tracks? }
//  - query   : case-insensitive substring match against the label (blank = all)
//  - tracks  : whitelist of track names; omit/null = every track passes
export function matchesFilters(e, { query = '', tracks = null } = {}) {
  if (tracks && !tracks.has(e.track || 'world')) return false;
  const q = query.trim().toLowerCase();
  if (q && !e.label.toLowerCase().includes(q)) return false;
  return true;
}

// Subset of events that pass the filter. Note: the renderer lays out the *full*
// event set (so filtering never shifts the x/y scale) and uses matchesFilters
// per marker to toggle visibility — this helper is for non-render callers/tests.
export function applyFilters(events, state = {}) {
  return events.filter((e) => matchesFilters(e, state));
}
