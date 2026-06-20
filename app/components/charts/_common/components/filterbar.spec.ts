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

  describe('Known-by viewpoint group', () => {
    const withKnowledge = [
      ...events,
      { date: '1343-01-01', label: 'Mara overhears', track: 'world', knownBy: ['Mara'] },
      { date: '1344-01-01', label: 'Borin and Mara', track: 'world', knownBy: ['Borin', 'Mara'] },
      { date: '1345-01-01', label: 'Nameless rite', track: 'world', secret: true }, // DM-only
    ];
    const chipText = (group: HTMLElement) =>
      [...group.querySelectorAll<HTMLElement>('.chart-chip-audience')].map((c) => c.textContent);
    const chip = (group: HTMLElement, label: string) =>
      [...group.querySelectorAll<HTMLElement>('.chart-chip-audience')].find((c) => c.textContent === label)!;

    it('is absent when no beat has knownBy and none is secret', () => {
      const { audience } = buildFilterBar(events, () => {});
      expect(audience).toBeNull();
    });

    it('builds a DM chip (secrets present) + one chip per character, all off', () => {
      const { audience, state } = buildFilterBar(withKnowledge, () => {});
      expect(audience).toBeTruthy();
      expect(chipText(audience!)).toEqual(['DM', 'Mara', 'Borin']);
      expect(audience!.querySelector('.chart-chip-dm')).toBeTruthy();
      expect([...audience!.querySelectorAll('.is-on')]).toHaveLength(0);
      expect([...state.audiences]).toEqual([]);
    });

    it('omits the DM chip when there are no secret beats', () => {
      const noSecret = [...events, { date: '1343-01-01', label: 'Mara overhears', track: 'world', knownBy: ['Mara'] }];
      const { audience } = buildFilterBar(noSecret, () => {});
      expect(chipText(audience!)).toEqual(['Mara']);
    });

    it('toggles an audience into the set and fires onChange', () => {
      const { audience, state } = buildFilterBar(withKnowledge, (s) => calls.push([...(s.audiences ?? [])]));
      const mara = chip(audience!, 'Mara');
      mara.click();
      expect(mara.classList.contains('is-on')).toBe(true);
      expect(state.audiences.has('Mara')).toBe(true);
      mara.click();
      expect(state.audiences.has('Mara')).toBe(false);
      expect(calls).toEqual([['Mara'], []]);
    });

    it('seeds selected audiences from an initial snapshot', () => {
      const { audience, state } = buildFilterBar(withKnowledge, () => {}, { query: '', tracks: [], audiences: ['Borin'] });
      expect([...state.audiences]).toEqual(['Borin']);
      expect(chip(audience!, 'Borin').classList.contains('is-on')).toBe(true);
    });
  });
});
