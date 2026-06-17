// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { buildFilterBar } from './filterbar.js';

const events = [
  { date: '1340-01-01', label: 'Winter begins', track: 'world' },
  { date: '1341-01-01', label: 'Trade pact', track: 'faction' },
  { date: '1342-01-01', label: 'Party forms', track: 'party' },
];

describe('buildFilterBar', () => {
  let calls;
  beforeEach(() => {
    calls = [];
  });

  it('renders a search box and one chip per track, all on by default', () => {
    const { bar, state } = buildFilterBar(events, () => {});
    expect(bar.querySelector('.tl-search')).toBeTruthy();
    const chips = [...bar.querySelectorAll('.tl-chip')];
    expect(chips.map((c) => c.dataset.track)).toEqual(['world', 'faction', 'party']);
    expect(chips.every((c) => c.classList.contains('is-on'))).toBe(true);
    expect([...state.tracks]).toEqual(['world', 'faction', 'party']);
  });

  it('updates the query and fires onChange on input', () => {
    const { bar, state } = buildFilterBar(events, (s) => calls.push(s.query));
    const search = bar.querySelector('.tl-search');
    search.value = 'pact';
    search.dispatchEvent(new Event('input'));
    expect(state.query).toBe('pact');
    expect(calls).toEqual(['pact']);
  });

  it('toggles a track off then on, firing onChange each time', () => {
    const { bar, state } = buildFilterBar(events, () => calls.push([...state.tracks]));
    const faction = [...bar.querySelectorAll('.tl-chip')].find((c) => c.dataset.track === 'faction');
    faction.click();
    expect(faction.classList.contains('is-on')).toBe(false);
    expect(state.tracks.has('faction')).toBe(false);
    faction.click();
    expect(state.tracks.has('faction')).toBe(true);
    expect(calls).toHaveLength(2);
  });
});
