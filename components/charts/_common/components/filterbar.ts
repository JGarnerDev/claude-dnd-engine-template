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
}

// Returns { bar, state }. state = { query, tracks:Set } is mutated in place as
// the user edits, so the caller can read it directly inside its redraw.
// Returns the wrapping `bar` (search + chips, for standalone use) plus the two
// parts on their own (`search`, `chips`) so a host can place them under separate
// labels — and the mutable `state`.
export function buildFilterBar(
  events: TimelineEvent[],
  onChange: (state: FilterState) => void,
): { bar: HTMLDivElement; search: HTMLInputElement; chips: HTMLDivElement; state: FilterBarState } {
  const bar = document.createElement('div');
  bar.className = 'chart-filterbar';

  const tracks = trackList(events); // computed once; seeds the chips
  // Start with NO tracks selected — an empty set means "filter nothing" (all
  // pass). Clicking a chip narrows to the selected track(s); this makes
  // filtering to one/a few a single click instead of deselecting the rest.
  const state: FilterBarState = { query: '', tracks: new Set() };

  const search = document.createElement('input');
  search.type = 'search';
  search.className = 'chart-search';
  search.placeholder = 'Search beats…';
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
    chip.addEventListener('click', () => {
      const on = chip.classList.toggle('is-on');
      if (on) state.tracks.add(track);
      else state.tracks.delete(track);
      onChange(state);
    });
    chips.appendChild(chip);
  }

  bar.append(search, chips);
  return { bar, search, chips, state };
}
