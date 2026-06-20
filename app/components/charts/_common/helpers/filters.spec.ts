import { describe, it, expect } from 'vitest';
import { applyFilters, trackList, audienceList } from './filters.js';
import { DM_AUDIENCE } from '../constants.js';

const events = [
  { date: '1340-01-01', label: 'The Long Winter begins', track: 'world' },
  { date: '1341-01-01', label: 'Trade pact signed', track: 'faction' },
  { date: '1342-01-01', label: 'Party forms', track: 'party' },
  { date: '1343-01-01', label: 'Winter thaws' }, // untagged -> world
];

const tagged = [
  { date: '1342-05-20', label: 'The duel at dawn', track: 'character:Mara' },
  { date: '1342-06-10', label: 'A quiet betrayal', track: 'party', keywords: ['Borin', 'Cult of the Hollow'] },
  { date: '1342-08-01', label: 'Redfen burns', track: 'world' },
];

describe('trackList', () => {
  it('returns unique tracks in source order, defaulting untagged to world', () => {
    expect(trackList(events)).toEqual(['world', 'faction', 'party']);
  });
});

describe('applyFilters', () => {
  it('passes everything with an empty state', () => {
    expect(applyFilters(events, {})).toHaveLength(4);
    expect(applyFilters(events)).toHaveLength(4);
  });

  it('matches the query as a case-insensitive substring of the label', () => {
    const out = applyFilters(events, { query: 'winter' });
    expect(out.map((e) => e.label)).toEqual(['The Long Winter begins', 'Winter thaws']);
  });

  it('ignores surrounding whitespace in the query', () => {
    expect(applyFilters(events, { query: '  pact ' })).toHaveLength(1);
  });

  it('treats an empty track set as no filter (passes everything)', () => {
    expect(applyFilters(events, { tracks: new Set() })).toHaveLength(4);
  });

  it('keeps only whitelisted tracks, defaulting untagged to world', () => {
    const out = applyFilters(events, { tracks: new Set(['world']) });
    expect(out.map((e) => e.label)).toEqual(['The Long Winter begins', 'Winter thaws']);
  });

  it('combines query and track filters', () => {
    const out = applyFilters(events, { query: 'winter', tracks: new Set(['faction']) });
    expect(out).toHaveLength(0);
  });

  it('matches the track member name even when absent from the label', () => {
    const out = applyFilters(tagged, { query: 'mara' });
    expect(out.map((e) => e.label)).toEqual(['The duel at dawn']);
  });

  it('does not match the bare category slug (no member)', () => {
    // 'character' is the category of the Mara beat but must not match it
    expect(applyFilters(tagged, { query: 'character' })).toHaveLength(0);
  });

  it('matches a keyword (related-entity name) not in the label or track', () => {
    expect(applyFilters(tagged, { query: 'borin' }).map((e) => e.label)).toEqual(['A quiet betrayal']);
    expect(applyFilters(tagged, { query: 'cult of the hollow' }).map((e) => e.label)).toEqual(['A quiet betrayal']);
  });
});

describe('audience (Known-by) filtering', () => {
  const mixed = [
    { date: '1340-01-01', label: 'Public coronation', track: 'world' }, // no knownBy: common knowledge
    { date: '1341-01-01', label: 'Mara overhears', track: 'faction', knownBy: ['Mara'] },
    { date: '1342-01-01', label: 'Borin and Mara find the ledger', track: 'faction', knownBy: ['Borin', 'Mara'] },
    { date: '1343-01-01', label: 'A nameless rite', track: 'world', secret: true }, // DM-only
  ];

  it('shows everything (secrets included) when no audience is selected', () => {
    expect(applyFilters(mixed)).toHaveLength(4);
    expect(applyFilters(mixed, {})).toHaveLength(4);
    expect(applyFilters(mixed, { audiences: new Set() })).toHaveLength(4);
  });

  it('DM sees everything including secrets', () => {
    expect(applyFilters(mixed, { audiences: new Set([DM_AUDIENCE]) })).toHaveLength(4);
  });

  it('a character sees public beats + their own knownBy, never a secret', () => {
    expect(applyFilters(mixed, { audiences: new Set(['Mara']) }).map((e) => e.label)).toEqual([
      'Public coronation',
      'Mara overhears',
      'Borin and Mara find the ledger',
    ]);
  });

  it('scopes out beats another character knows but this one does not', () => {
    expect(applyFilters(mixed, { audiences: new Set(['Borin']) }).map((e) => e.label)).toEqual([
      'Public coronation',
      'Borin and Mara find the ledger', // not "Mara overhears" — Borin isn't on it
    ]);
  });

  it('never shows a secret to a character', () => {
    expect(applyFilters(mixed, { audiences: new Set(['Mara', 'Borin']) }).map((e) => e.label)).not.toContain(
      'A nameless rite',
    );
  });

  it('unions selected audiences (DM + character = everything)', () => {
    expect(applyFilters(mixed, { audiences: new Set([DM_AUDIENCE, 'Borin']) })).toHaveLength(4);
  });

  it('still applies query/track filters on top of the viewpoint', () => {
    expect(applyFilters(mixed, { audiences: new Set(['Mara']), tracks: new Set(['faction']) }).map((e) => e.label)).toEqual([
      'Mara overhears',
      'Borin and Mara find the ledger',
    ]);
  });
});

describe('audienceList', () => {
  it('lists every character in any beat\'s knownBy, first-appearance order, deduped', () => {
    const events = [
      { date: '1340', label: 'public', track: 'world' },
      { date: '1341', label: 'a', knownBy: ['Mara', 'Borin'] },
      { date: '1342', label: 'b', secret: true, knownBy: ['Borin', 'Sela'] }, // secret beats still contribute names
      { date: '1343', label: 'c', secret: true }, // no knownBy contributes nobody
    ];
    expect(audienceList(events)).toEqual(['Mara', 'Borin', 'Sela']);
  });

  it('returns [] when no beat has knownBy', () => {
    expect(audienceList([{ date: '1340', label: 'x', track: 'world' }])).toEqual([]);
  });
});
