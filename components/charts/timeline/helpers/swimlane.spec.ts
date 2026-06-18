import { describe, it, expect } from 'vitest';
import { computeSwimlane } from './swimlane.js';
import type { TimelineEvent } from '../types.js';

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

  it('drops a label that lacks readable room before the next dot (no clipped sliver)', () => {
    // 'a' has 'b' barely a month later — no room for a readable label, so 'a' is
    // skipped (bare dot + hover) rather than clipped to a sliver. 'b', with a long
    // clear run to 'c', takes the label instead.
    const out = computeSwimlane(
      [
        { date: '1340-01-01', label: 'a', track: 'world' },
        { date: '1340-02-01', label: 'b', track: 'world' }, // ~1 month after a
        { date: '1343-01-01', label: 'c', track: 'world' },
      ],
      new Set(),
      undefined,
      160,
    );
    const labelled = out.items.filter((i) => i.showLabel).map((i) => i.label);
    expect(labelled).toContain('b');
    expect(labelled).not.toContain('a'); // crowded out, no sliver
  });

  it('reveals more labels as density (zoom) increases', () => {
    const beats: TimelineEvent[] = [
      { date: '1340', label: 'one', track: 'world' },
      { date: '1345', label: 'two', track: 'world' },
      { date: '1350', label: 'three', track: 'world' },
    ];
    const tight = computeSwimlane(beats, new Set(), undefined, 15).items.filter((i) => i.showLabel).length;
    const wide = computeSwimlane(beats, new Set(), undefined, 200).items.filter((i) => i.showLabel).length;
    expect(wide).toBe(3);
    expect(wide).toBeGreaterThan(tight);
  });

  it('widens a label that has room and narrows one near a neighbour', () => {
    // Same row: a beat with a long clear run gets a wide max-width; one near the
    // canvas edge is capped by the remaining room.
    const out = computeSwimlane(
      [
        { date: '1340', label: 'early', track: 'world' },
        { date: '1348', label: 'late', track: 'world' },
      ],
      new Set(),
      undefined,
      200,
    );
    const early = out.items.find((i) => i.label === 'early')!;
    const late = out.items.find((i) => i.label === 'late')!;
    expect(early.showLabel && late.showLabel).toBe(true);
    // 'early' has 8 years of clear runway before 'late' → caps at SWIM_LABEL_MAX (260).
    expect(early.labelMaxWidth).toBe(260);
    // 'late' is last in the row → bounded by room to the canvas edge, narrower than early.
    expect(late.labelMaxWidth).toBeGreaterThanOrEqual(40);
    expect(late.labelMaxWidth).toBeLessThan(early.labelMaxWidth);
  });

  it('bounds a label by the next dot even when that dot is unlabelled', () => {
    // Three world beats. At this density the 2nd is too close to label (dropped),
    // but its dot still sits there — the 1st label must stop short of it, not run
    // to the far 3rd dot.
    const out = computeSwimlane(
      [
        { date: '1340-01-01', label: 'first', track: 'world' },
        { date: '1340-06-01', label: 'second', track: 'world' }, // ~half a year on → dropped
        { date: '1345-01-01', label: 'third', track: 'world' },
      ],
      new Set(),
      undefined,
      160,
    );
    const first = out.items.find((i) => i.label === 'first')!;
    const second = out.items.find((i) => i.label === 'second')!;
    expect(first.showLabel).toBe(true);
    expect(second.showLabel).toBe(false); // gated out
    // first's width is the gap to second's dot, not the far third — so well under the cap.
    expect(first.labelMaxWidth).toBeLessThan(second.x - first.x);
    expect(first.labelMaxWidth).toBeLessThan(260);
  });

  it('gates labels per row independently', () => {
    // One beat per row → every beat is the only dot in its row, so at a comfortable
    // density each has room and gets labelled, regardless of cross-row x proximity.
    const out = computeSwimlane(events, new Set(), undefined, 400);
    expect(out.items.every((i) => i.showLabel)).toBe(true);
  });
});
