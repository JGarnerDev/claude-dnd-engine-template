import { describe, it, expect } from 'vitest';
import { applyFilters, trackList } from './filters.js';

const events = [
  { date: '1340-01-01', label: 'The Long Winter begins', track: 'world' },
  { date: '1341-01-01', label: 'Trade pact signed', track: 'faction' },
  { date: '1342-01-01', label: 'Party forms', track: 'party' },
  { date: '1343-01-01', label: 'Winter thaws' }, // untagged -> world
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

  it('keeps only whitelisted tracks, defaulting untagged to world', () => {
    const out = applyFilters(events, { tracks: new Set(['world']) });
    expect(out.map((e) => e.label)).toEqual(['The Long Winter begins', 'Winter thaws']);
  });

  it('combines query and track filters', () => {
    const out = applyFilters(events, { query: 'winter', tracks: new Set(['faction']) });
    expect(out).toHaveLength(0);
  });
});
