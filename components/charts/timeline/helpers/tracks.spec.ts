import { describe, it, expect } from 'vitest';
import { parseTrack, buildTrackTree, DEFAULT_CATEGORIES } from './tracks.js';
import type { TimelineEvent } from '../types.js';

describe('parseTrack', () => {
  it('splits category:member on the first colon', () => {
    expect(parseTrack('faction:The Ashen Cult')).toEqual({ category: 'faction', member: 'The Ashen Cult' });
  });

  it('treats a bare string as a parent category with no member', () => {
    expect(parseTrack('world')).toEqual({ category: 'world', member: null });
  });

  it('defaults blank/undefined to the world lane', () => {
    expect(parseTrack('')).toEqual({ category: 'world', member: null });
    expect(parseTrack(undefined)).toEqual({ category: 'world', member: null });
  });

  it('keeps colons inside the member name', () => {
    expect(parseTrack('faction:Cult: of the Hollow')).toEqual({
      category: 'faction',
      member: 'Cult: of the Hollow',
    });
  });
});

describe('buildTrackTree', () => {
  const ev = (track: string | undefined, label = 'x'): TimelineEvent => ({ date: '1340', label, track });

  it('emits only categories that carry beats, in config order', () => {
    const tree = buildTrackTree([ev('world'), ev('party'), ev('faction:Cult')]);
    expect(tree.map((c) => c.key)).toEqual(['party', 'faction', 'world']);
  });

  it('derives child members in first-seen order, deduped', () => {
    const tree = buildTrackTree([ev('character:Mara'), ev('character:Iggy'), ev('character:Mara')]);
    const characters = tree.find((c) => c.key === 'character')!;
    expect(characters.members.map((m) => m.member)).toEqual(['Mara', 'Iggy']);
  });

  it('flags a category that has a beat sitting directly on the parent', () => {
    const tree = buildTrackTree([ev('party'), ev('party:Alpha Squad')]);
    const party = tree.find((c) => c.key === 'party')!;
    expect(party.hasParentBeats).toBe(true);
    expect(party.members.map((m) => m.member)).toEqual(['Alpha Squad']);
  });

  it('carries config label/color/collapse onto the category', () => {
    const tree = buildTrackTree([ev('faction:Cult')]);
    const faction = tree.find((c) => c.key === 'faction')!;
    expect(faction.label).toBe('Factions');
    expect(faction.colorVar).toBe('--track-faction');
    expect(faction.collapsed).toBe(true);
  });

  it('appends unknown categories after configured ones with sane fallbacks', () => {
    const tree = buildTrackTree([ev('world'), ev('deity:Pelor')]);
    expect(tree.map((c) => c.key)).toEqual(['world', 'deity']);
    const deity = tree.find((c) => c.key === 'deity')!;
    expect(deity.label).toBe('deity');
    expect(deity.colorVar).toBe('--track-world');
  });

  it('defaults untagged events to the world parent', () => {
    const tree = buildTrackTree([ev(undefined)]);
    expect(tree.map((c) => c.key)).toEqual(['world']);
    expect(tree[0].hasParentBeats).toBe(true);
  });

  it('ships the documented default categories in order', () => {
    expect(DEFAULT_CATEGORIES.map((c) => c.key)).toEqual([
      'party',
      'character',
      'faction',
      'continent',
      'world',
    ]);
  });
});
