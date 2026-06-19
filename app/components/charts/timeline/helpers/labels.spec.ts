import { describe, it, expect } from 'vitest';
import { gateLabels } from './labels.js';

describe('gateLabels', () => {
  it('labels everything when all clear the gap', () => {
    const xs = [0, 100, 200, 300];
    const show = gateLabels(xs, xs.map(() => false), 50);
    expect(show).toEqual([true, true, true, true]);
  });

  it('drops labels that fall within the gap', () => {
    const xs = [0, 10, 20, 100]; // 10/20 too close to 0
    const show = gateLabels(xs, xs.map(() => false), 50);
    expect(show).toEqual([true, false, false, true]);
  });

  it('caps total labels by spacing regardless of count', () => {
    // 1000 beats packed in 1000px, minGap 50 → at most ~21 labels survive
    const xs = Array.from({ length: 1000 }, (_, i) => i);
    const show = gateLabels(xs, xs.map(() => false), 50);
    expect(show.filter(Boolean).length).toBeLessThanOrEqual(21);
  });

  it('gives majors first claim on the slots', () => {
    // a non-major at 0 and a major at 20, gap 50 → only one can show; the major wins
    const xs = [0, 20];
    const show = gateLabels(xs, [false, true], 50);
    expect(show).toEqual([false, true]);
  });

  it('still caps majors — a wall of majors does not all label', () => {
    const xs = Array.from({ length: 500 }, (_, i) => i); // 500 majors in 500px
    const show = gateLabels(xs, xs.map(() => true), 50);
    const labelled = show.filter(Boolean).length;
    expect(labelled).toBeGreaterThan(0);
    expect(labelled).toBeLessThanOrEqual(11); // ~500/50
  });

  it('fills leftover gaps with non-majors between spaced majors', () => {
    // majors at 0 and 200; a non-major at 100 clears both (gap 50) → labelled
    const xs = [0, 100, 200];
    const show = gateLabels(xs, [true, false, true], 50);
    expect(show).toEqual([true, true, true]);
  });

  it('keeps a non-major out when it crowds a placed major', () => {
    // major at 0, non-major at 30 (within gap 50) → non-major dropped
    const xs = [0, 30];
    const show = gateLabels(xs, [true, false], 50);
    expect(show).toEqual([true, false]);
  });
});
