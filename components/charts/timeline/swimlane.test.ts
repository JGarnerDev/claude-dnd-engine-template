import { describe, it, expect } from 'vitest';
import { computeSwimlane } from './swimlane.js';
import type { TimelineEvent } from './types.js';

const events: TimelineEvent[] = [
  { date: '1340', label: 'a', track: 'world' },
  { date: '1341', label: 'b', track: 'party' },
  { date: '1342', label: 'c', track: 'character:Mara' },
  { date: '1343', label: 'd', track: 'character:Iggy' },
];

const keyOf = (label: string, out: ReturnType<typeof computeSwimlane>) =>
  out.items.find((i) => i.label === label)!.rowKey;

describe('computeSwimlane', () => {
  it('reports empty for no events', () => {
    const out = computeSwimlane([]);
    expect(out.isEmpty).toBe(true);
    expect(out.rows).toEqual([]);
  });

  it('expands a category into a header row plus one row per child', () => {
    const out = computeSwimlane(events);
    expect(out.rows.map((r) => r.key)).toEqual([
      'party',
      'character',
      'character:Mara',
      'character:Iggy',
      'world',
    ]);
  });

  it('places each beat on its own row at the row centre', () => {
    const out = computeSwimlane(events);
    const mara = out.rows.find((r) => r.key === 'character:Mara')!;
    expect(keyOf('c', out)).toBe('character:Mara');
    expect(out.items.find((i) => i.label === 'c')!.y).toBe(mara.centerY);
  });

  it('marks child rows depth 1 and parents depth 0', () => {
    const out = computeSwimlane(events);
    expect(out.rows.find((r) => r.key === 'character')!.depth).toBe(0);
    expect(out.rows.find((r) => r.key === 'character:Mara')!.depth).toBe(1);
  });

  it('shows a toggle only on parents that have children', () => {
    const out = computeSwimlane(events);
    expect(out.rows.find((r) => r.key === 'character')!.hasToggle).toBe(true);
    expect(out.rows.find((r) => r.key === 'party')!.hasToggle).toBe(false);
    expect(out.rows.find((r) => r.key === 'world')!.hasToggle).toBe(false);
  });

  it('collapses a parent into one roll-up row holding all children beats (D6)', () => {
    const out = computeSwimlane(events, new Set(['character']));
    expect(out.rows.map((r) => r.key)).toEqual(['party', 'character', 'world']);
    const rollup = out.rows.find((r) => r.key === 'character')!;
    expect(rollup.isRollup).toBe(true);
    expect(keyOf('c', out)).toBe('character'); // Mara beat rolls up
    expect(keyOf('d', out)).toBe('character'); // Iggy beat rolls up
  });

  it('keeps a parent-direct beat on the header row, separate from child rows', () => {
    const out = computeSwimlane([
      { date: '1340', label: 'wide', track: 'party' },
      { date: '1341', label: 'solo', track: 'party:Alpha Squad' },
    ]);
    expect(out.rows.map((r) => r.key)).toEqual(['party', 'party:Alpha Squad']);
    expect(keyOf('wide', out)).toBe('party');
    expect(keyOf('solo', out)).toBe('party:Alpha Squad');
  });

  it('tags items with the category colour and shares the time axis (ticks/width)', () => {
    const out = computeSwimlane(events);
    expect(out.items.find((i) => i.label === 'b')!.colorVar).toBe('--track-party');
    expect(out.contentWidth).toBeGreaterThan(0);
    expect(out.ticks.length).toBeGreaterThan(0);
  });

  it('grows totalHeight as rows are added', () => {
    const expanded = computeSwimlane(events);
    const collapsed = computeSwimlane(events, new Set(['character']));
    expect(expanded.totalHeight).toBeGreaterThan(collapsed.totalHeight);
  });
});
