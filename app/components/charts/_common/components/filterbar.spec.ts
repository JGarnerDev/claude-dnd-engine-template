// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { buildFilterBar } from './filterbar.js';

const events = [
  { date: '1340-01-01', label: 'Winter begins', track: 'world' },
  { date: '1341-01-01', label: 'Trade pact', track: 'faction' },
  { date: '1342-01-01', label: 'Party forms', track: 'party' },
];

describe('buildFilterBar', () => {
  let calls: unknown[];
  beforeEach(() => {
    calls = [];
  });

  it('renders a search box and one chip per track, all off by default', () => {
    const { bar, state } = buildFilterBar(events, () => {});
    expect(bar.querySelector('.chart-search')).toBeTruthy();
    const chips = [...bar.querySelectorAll<HTMLElement>('.chart-chip')];
    expect(chips.map((c) => c.dataset.track)).toEqual(['world', 'faction', 'party']);
    expect(chips.some((c) => c.classList.contains('is-on'))).toBe(false);
    expect([...state.tracks]).toEqual([]); // empty = no track filter
  });

  it('updates the query and fires onChange on input', () => {
    const { bar, state } = buildFilterBar(events, (s) => calls.push(s.query));
    const search = bar.querySelector<HTMLInputElement>('.chart-search')!;
    search.value = 'pact';
    search.dispatchEvent(new Event('input'));
    expect(state.query).toBe('pact');
    expect(calls).toEqual(['pact']);
  });

  it('seeds the query box and chip state from an initial snapshot', () => {
    const { bar, state } = buildFilterBar(events, () => {}, { query: 'pact', tracks: ['faction'] });
    const search = bar.querySelector<HTMLInputElement>('.chart-search')!;
    expect(search.value).toBe('pact');
    expect(state.query).toBe('pact');
    const chips = [...bar.querySelectorAll<HTMLElement>('.chart-chip')];
    const on = chips.filter((c) => c.classList.contains('is-on')).map((c) => c.dataset.track);
    expect(on).toEqual(['faction']);
    expect([...state.tracks]).toEqual(['faction']);
  });

  it('ignores a seeded track that no longer exists in the data', () => {
    const { state } = buildFilterBar(events, () => {}, { query: '', tracks: ['gone'] });
    expect([...state.tracks]).toEqual([]);
  });

  it('toggles a track on then off, firing onChange each time', () => {
    const { bar, state } = buildFilterBar(events, () => calls.push([...state.tracks]));
    const faction = [...bar.querySelectorAll<HTMLElement>('.chart-chip')].find(
      (c) => c.dataset.track === 'faction',
    )!;
    faction.click();
    expect(faction.classList.contains('is-on')).toBe(true);
    expect(state.tracks.has('faction')).toBe(true);
    faction.click();
    expect(faction.classList.contains('is-on')).toBe(false);
    expect(state.tracks.has('faction')).toBe(false);
    expect(calls).toHaveLength(2);
  });
});
