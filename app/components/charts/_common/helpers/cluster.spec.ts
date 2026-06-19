import { describe, it, expect } from 'vitest';
import { clusterBeats } from './cluster.js';
import { BAR_MAX_H, DENSITY_BUCKET_PX } from '../constants.js';

// Helper: a non-major beat at x.
const b = (x: number) => ({ x, major: false });

describe('clusterBeats', () => {
  it('keeps sparse beats individual (one per bucket)', () => {
    const items = [b(0), b(100), b(200)]; // far apart at the default 8px bucket
    const { individuals, bars } = clusterBeats(items);
    expect(individuals).toEqual([0, 1, 2]);
    expect(bars).toHaveLength(0);
  });

  it('buckets crowded beats into one bar', () => {
    // five beats inside a single 8px column
    const items = [b(1), b(2), b(3), b(4), b(5)];
    const { individuals, bars } = clusterBeats(items);
    expect(individuals).toEqual([]);
    expect(bars).toHaveLength(1);
    expect(bars[0].count).toBe(5);
    expect(bars[0].x0).toBe(0); // floor(x/8)*8
  });

  it('buckets majors too, flagging the bar hasMajor', () => {
    const items = [b(1), { x: 2, major: true }, b(3), b(4)];
    const { individuals, bars } = clusterBeats(items);
    expect(individuals).toEqual([]); // all four in one crowded bucket
    expect(bars).toHaveLength(1);
    expect(bars[0].count).toBe(4);
    expect(bars[0].hasMajor).toBe(true);
    expect(bars[0].members).toEqual([0, 1, 2, 3]);
  });

  it('leaves an isolated major individual; an all-minor bar is unflagged', () => {
    const { individuals, bars } = clusterBeats([{ x: 0, major: true }, b(100), b(101)]);
    expect(individuals).toContain(0); // the lone major in its own bucket
    expect(bars).toHaveLength(1);
    expect(bars[0].hasMajor).toBe(false);
  });

  it('leaves a lone non-major in a bucket as an individual (below DENSITY_MIN)', () => {
    const items = [b(1), b(40)]; // separate buckets, one beat each
    const { individuals, bars } = clusterBeats(items);
    expect(individuals).toEqual([0, 1]);
    expect(bars).toHaveLength(0);
  });

  it('scales bar height with count, taller for denser buckets', () => {
    const dense = [b(0), b(1), b(2), b(3)]; // 4 in bucket 0
    const light = [b(40), b(41)]; // 2 in bucket 5
    const { bars } = clusterBeats([...dense, ...light]);
    const big = bars.find((x) => x.count === 4)!;
    const small = bars.find((x) => x.count === 2)!;
    expect(small.height).toBeLessThan(big.height);
  });

  it('caps a bucket of BAR_FULL_COUNT+ at BAR_MAX_H', () => {
    const big = clusterBeats(Array.from({ length: 60 }, (_, i) => b(i * 0.1))); // 60 in bucket 0
    expect(big.bars[0].height).toBe(BAR_MAX_H);
  });

  it('height is absolute — a small bar is the same height with or without a bigger one in view', () => {
    const aloneTwo = clusterBeats([b(0), b(1)]).bars.find((x) => x.count === 2)!;
    // same pair, now sharing the view with a 60-beat bar elsewhere
    const withGiant = clusterBeats([b(0), b(1), ...Array.from({ length: 60 }, (_, i) => b(200 + i * 0.05))]);
    const pair = withGiant.bars.find((x) => x.count === 2)!;
    expect(pair.height).toBe(aloneTwo.height); // not inflated by the in-view max
    expect(pair.height).toBeLessThan(BAR_MAX_H);
  });

  it('honors a custom bucket width', () => {
    const items = [b(0), b(50)];
    expect(clusterBeats(items, DENSITY_BUCKET_PX).bars).toHaveLength(0); // 8px: separate buckets
    expect(clusterBeats(items, 100).bars).toHaveLength(1); // 100px: same bucket -> bar of 2
  });

  it('reports a center x at the mean of the bucket members', () => {
    const { bars } = clusterBeats([b(2), b(4), b(6)]);
    expect(bars[0].centerX).toBe(4); // (2+4+6)/3
  });
});
