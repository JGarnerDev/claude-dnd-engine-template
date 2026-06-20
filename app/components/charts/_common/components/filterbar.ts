// Filter bar DOM: a search box + one toggle chip per track. Owns the mutable
// filter state and fires onChange after every edit; render.js re-filters and
// redraws from that state. DOM-bound — pairs with filters.js (pure matching).

import './filterbar.css';
import { trackList, audienceList } from '../helpers/filters.js';
import { DM_AUDIENCE, DM_LABEL } from '../constants.js';
import type { FilterState, TimelineEvent } from '../types.js';

// Mutable state the bar owns; render reads it in place on each redraw.
export interface FilterBarState {
  query: string;
  tracks: Set<string>;
  audiences: Set<string>;
}

// Returns { bar, state }. state = { query, tracks:Set, audiences:Set } is mutated
// in place as the user edits, so the caller can read it directly inside its
// redraw. Returns the wrapping `bar` (search + chips, for standalone use) plus the
// parts on their own (`search`, `chips`, and `audience` — the "Known by" viewpoint
// group, null when the data has no per-knowledge beats) so a host can place them
// under separate labels — and the mutable `state`.
export function buildFilterBar(
  events: TimelineEvent[],
  onChange: (state: FilterState) => void,
  initial?: { query: string; tracks: string[]; audiences?: string[] },
): {
  bar: HTMLDivElement;
  search: HTMLInputElement;
  chips: HTMLDivElement;
  audience: HTMLDivElement | null;
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
  const state: FilterBarState = { query: initial?.query ?? '', tracks: new Set(), audiences: new Set() };

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

  // "Known by" viewpoint group: filters the chart to what an audience knows, like
  // the track chips but over knowledge. Nothing selected = no filter (all beats,
  // secrets included). A character chip narrows to that character's knowledge
  // (public beats + their non-secret knownBy beats, never a secret); the DM chip
  // shows everything incl. secrets. Multiple chips union. Built only when there's
  // something to pick: characters come from any beat's knownBy, and the DM chip
  // appears only when secret beats exist (its point is seeing them). A seeded view
  // restores the selection.
  const characters = audienceList(events);
  const hasSecret = events.some((e) => e.secret);
  let audience: HTMLDivElement | null = null;
  if (hasSecret || characters.length > 0) {
    const seedAudiences = new Set(initial?.audiences ?? []);
    audience = document.createElement('div');
    audience.className = 'chart-chips chart-audiences';

    const addAudienceChip = (key: string, label: string, isDm: boolean) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = `chart-chip chart-chip-audience${isDm ? ' chart-chip-dm' : ''}`;
      chip.dataset.audience = key;
      chip.textContent = label;
      const on = seedAudiences.has(key);
      chip.classList.toggle('is-on', on);
      chip.setAttribute('aria-pressed', String(on));
      if (on) state.audiences.add(key);
      chip.addEventListener('click', () => {
        const nowOn = chip.classList.toggle('is-on');
        if (nowOn) state.audiences.add(key);
        else state.audiences.delete(key);
        chip.setAttribute('aria-pressed', String(nowOn));
        onChange(state);
      });
      audience!.appendChild(chip);
    };

    if (hasSecret) addAudienceChip(DM_AUDIENCE, DM_LABEL, true);
    for (const name of characters) addAudienceChip(name, name, false);
  }

  bar.append(search, chips);
  if (audience) bar.append(audience);
  return { bar, search, chips, audience, state };
}
