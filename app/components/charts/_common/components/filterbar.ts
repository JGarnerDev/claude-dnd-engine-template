// Filter bar DOM: a search box + one toggle chip per track. Owns the mutable
// filter state and fires onChange after every edit; render.js re-filters and
// redraws from that state. DOM-bound — pairs with filters.js (pure matching).

import './filterbar.css';
import { trackList } from '../helpers/filters.js';
import type { FilterState, TimelineEvent } from '../types.js';

// Mutable state the bar owns; render reads it in place on each redraw.
export interface FilterBarState {
  query: string;
  tracks: Set<string>;
  showSecret: boolean;
}

// Returns { bar, state }. state = { query, tracks:Set, showSecret } is mutated in
// place as the user edits, so the caller can read it directly inside its redraw.
// Returns the wrapping `bar` (search + chips, for standalone use) plus the parts
// on their own (`search`, `chips`, and `secret` — the DM-only toggle, null when
// the data carries no secret beats) so a host can place them under separate
// labels — and the mutable `state`.
export function buildFilterBar(
  events: TimelineEvent[],
  onChange: (state: FilterState) => void,
  initial?: { query: string; tracks: string[]; showSecret?: boolean },
): {
  bar: HTMLDivElement;
  search: HTMLInputElement;
  chips: HTMLDivElement;
  secret: HTMLButtonElement | null;
  state: FilterBarState;
} {
  const bar = document.createElement('div');
  bar.className = 'chart-filterbar';

  const tracks = trackList(events); // computed once; seeds the chips
  // Start with NO tracks selected — an empty set means "filter nothing" (all
  // pass). Clicking a chip narrows to the selected track(s); this makes
  // filtering to one/a few a single click instead of deselecting the rest.
  // A loaded view seeds the selection (still-present tracks only — caller
  // intersects against the live track list before passing them in).
  const seedTracks = new Set(initial?.tracks ?? []);
  const state: FilterBarState = { query: initial?.query ?? '', tracks: new Set(), showSecret: initial?.showSecret ?? false };

  const search = document.createElement('input');
  search.type = 'search';
  search.className = 'chart-search';
  search.placeholder = 'Search beats…';
  search.value = state.query; // reflect a seeded query in the box
  search.addEventListener('input', () => {
    state.query = search.value;
    onChange(state);
  });

  const chips = document.createElement('div');
  chips.className = 'chart-chips';
  for (const track of tracks) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chart-chip'; // off by default; is-on added on selection
    chip.dataset.track = track;
    chip.textContent = track;
    if (seedTracks.has(track)) {
      chip.classList.add('is-on'); // restore a loaded view's chip state
      state.tracks.add(track);
    }
    chip.addEventListener('click', () => {
      const on = chip.classList.toggle('is-on');
      if (on) state.tracks.add(track);
      else state.tracks.delete(track);
      onChange(state);
    });
    chips.appendChild(chip);
  }

  // DM-only toggle: a single chip that surfaces secret beats. Only built when the
  // data actually carries secret beats — a player-safe export drops them entirely,
  // so there's nothing to toggle and the control stays hidden. Off by default so
  // the chart opens player-safe even when secret beats are present.
  let secret: HTMLButtonElement | null = null;
  if (events.some((e) => e.secret)) {
    secret = document.createElement('button');
    secret.type = 'button';
    secret.className = 'chart-chip chart-chip-secret';
    secret.textContent = 'DM-only';
    secret.classList.toggle('is-on', state.showSecret);
    secret.setAttribute('aria-pressed', String(state.showSecret));
    secret.addEventListener('click', () => {
      state.showSecret = secret!.classList.toggle('is-on');
      secret!.setAttribute('aria-pressed', String(state.showSecret));
      onChange(state);
    });
  }

  bar.append(search, chips);
  if (secret) bar.append(secret);
  return { bar, search, chips, secret, state };
}
