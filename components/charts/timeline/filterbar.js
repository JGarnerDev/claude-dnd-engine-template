// Filter bar DOM: a search box + one toggle chip per track. Owns the mutable
// filter state and fires onChange after every edit; render.js re-filters and
// redraws from that state. DOM-bound — pairs with filters.js (pure matching).

import { trackList } from './filters.js';

// Returns { bar, state }. state = { query, tracks:Set } is mutated in place as
// the user edits, so the caller can read it directly inside its redraw.
export function buildFilterBar(events, onChange) {
  const bar = document.createElement('div');
  bar.className = 'tl-filterbar';

  const state = { query: '', tracks: new Set(trackList(events)) };

  const search = document.createElement('input');
  search.type = 'search';
  search.className = 'tl-search';
  search.placeholder = 'Search beats…';
  search.addEventListener('input', () => {
    state.query = search.value;
    onChange(state);
  });

  const chips = document.createElement('div');
  chips.className = 'tl-chips';
  for (const track of trackList(events)) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'tl-chip is-on';
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
  return { bar, state };
}
