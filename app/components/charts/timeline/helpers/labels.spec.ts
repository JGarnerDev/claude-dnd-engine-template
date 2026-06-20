import { describe, it, expect } from 'vitest';
import { layoutLabels } from './labels.js';

// Small explicit boxes so the packing math is easy to follow. items must be
// x-ascending (the real callers pass time-sorted beats).
const items = (xs: number[], majors: boolean[] = xs.map(() => false)) => xs.map((x, i) => ({ x, major: majors[i] }));

describe('layoutLabels (interval packer)', () => {
  it('labels well-spaced beats on one lane, centered (no shift)', () => {
    const out = layoutLabels(items([0, 200, 400]), [true, true, true], { labelW: 100, gap: 10, maxShift: 50, maxTiers: 4 });
    expect(out.showLabel).toEqual([true, true, true]);
    expect(out.shift).toEqual([0, 0, 0]);
    expect(out.side).toEqual(['above', 'above', 'above']); // all lane 0
    expect(out.laneCount).toBe(1);
  });

  it('stacks a tight cluster onto alternating tiers, capping at the budget', () => {
    // three coincident beats, budget 2 → two stack (above/below), third is bare
    const out = layoutLabels(items([0, 0, 0]), [true, true, true], { labelW: 100, gap: 10, maxShift: 10, maxTiers: 2 });
    expect(out.showLabel).toEqual([true, true, false]);
    expect(out.side).toEqual(['above', 'below', 'above']);
    expect(out.shift).toEqual([0, 0, 0]); // coincident → stacked, never slid
    expect(out.offset[1]).toBe(16); // lane 1 = first tier, below
    expect(out.laneCount).toBe(2);
  });

  it('slides a colliding label sideways into a gap when maxShift allows', () => {
    // 0 and 60 collide on lane 0 (100px boxes), but the second can slide right to
    // clear and stay within maxShift → both label on lane 0, one displaced.
    const out = layoutLabels(items([0, 60]), [true, true], { labelW: 100, gap: 10, maxShift: 120, maxTiers: 2 });
    expect(out.showLabel).toEqual([true, true]);
    expect(out.side).toEqual(['above', 'above']); // same lane
    expect(out.shift[0]).toBe(0);
    expect(out.shift[1]).toBe(50); // pushed right to clear the first box
    expect(out.laneCount).toBe(1);
  });

  it('drops to the next tier when the sideways slide would exceed maxShift', () => {
    const out = layoutLabels(items([0, 60]), [true, true], { labelW: 100, gap: 10, maxShift: 40, maxTiers: 2 });
    expect(out.showLabel).toEqual([true, true]);
    expect(out.side).toEqual(['above', 'below']); // forced onto a second tier
    expect(out.shift).toEqual([0, 0]);
    expect(out.laneCount).toBe(2);
  });

  it('gives majors first claim on a scarce budget', () => {
    // single lane, no slide → only one of three crowded beats labels; the major wins
    const out = layoutLabels(items([0, 5, 10], [false, true, false]), [true, true, true], {
      labelW: 100,
      gap: 10,
      maxShift: 0,
      maxTiers: 1,
    });
    expect(out.showLabel).toEqual([false, true, false]);
  });

  it('only visible beats compete: a lone survivor reclaims a label', () => {
    const opts = { labelW: 100, gap: 10, maxShift: 0, maxTiers: 1 };
    expect(layoutLabels(items([0, 10]), [true, true], opts).showLabel).toEqual([true, false]);
    expect(layoutLabels(items([0, 10]), [false, true], opts).showLabel).toEqual([false, true]);
  });

  it('frees budget for a survivor when its crowding neighbour is filtered out', () => {
    const opts = { labelW: 100, gap: 10, maxShift: 0, maxTiers: 1 };
    // both visible: the later one is crowded out
    expect(layoutLabels(items([0, 20]), [true, true], opts).showLabel).toEqual([true, false]);
    // hide the first → the second labels (and centers, shift 0)
    const narrowed = layoutLabels(items([0, 20]), [false, true], opts);
    expect(narrowed.showLabel).toEqual([false, true]);
    expect(narrowed.shift[1]).toBe(0);
  });

  it('hidden beats are always bare regardless of spacing', () => {
    const out = layoutLabels(items([0, 1000]), [false, true], { maxTiers: 4 });
    expect(out.showLabel).toEqual([false, true]);
    expect(out.offset[0]).toBe(0);
    expect(out.shift[0]).toBe(0);
    expect(out.side[0]).toBe('above');
  });

  it('reports zero lanes when nothing is visible', () => {
    const out = layoutLabels(items([0, 100, 200]), [false, false, false]);
    expect(out.showLabel).toEqual([false, false, false]);
    expect(out.laneCount).toBe(0);
  });

  it('honours a larger lane budget (the viewport-derived #1 lever)', () => {
    // five coincident beats: budget 4 stacks four, budget 6 would fit more — proves
    // the cap is the binding limit, not a hardcoded 4.
    const five = items([0, 0, 0, 0, 0]);
    const opts = { labelW: 100, gap: 10, maxShift: 10 };
    expect(layoutLabels(five, five.map(() => true), { ...opts, maxTiers: 4 }).showLabel.filter(Boolean)).toHaveLength(4);
    expect(layoutLabels(five, five.map(() => true), { ...opts, maxTiers: 6 }).showLabel.filter(Boolean)).toHaveLength(5);
  });
});
