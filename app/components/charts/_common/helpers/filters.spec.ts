import { describe, it, expect } from 'vitest';
import { applyFilters, trackList } from './filters.js';

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

describe('secret (DM-only) filtering', () => {
  const mixed = [
    { date: '1340-01-01', label: 'Public coronation', track: 'world' },
    { date: '1341-01-01', label: 'The hidden pact', track: 'faction', secret: true },
  ];

  it('hides secret beats by default (player-safe)', () => {
    expect(applyFilters(mixed).map((e) => e.label)).toEqual(['Public coronation']);
    expect(applyFilters(mixed, {}).map((e) => e.label)).toEqual(['Public coronation']);
    expect(applyFilters(mixed, { showSecret: false }).map((e) => e.label)).toEqual(['Public coronation']);
  });

  it('reveals secret beats when showSecret is on', () => {
    expect(applyFilters(mixed, { showSecret: true })).toHaveLength(2);
  });

  it('still applies query/track filters to revealed secret beats', () => {
    expect(applyFilters(mixed, { showSecret: true, tracks: new Set(['world']) }).map((e) => e.label)).toEqual([
      'Public coronation',
    ]);
    expect(applyFilters(mixed, { showSecret: true, query: 'hidden' }).map((e) => e.label)).toEqual(['The hidden pact']);
  });
});
