import { describe, it, expect } from 'vitest';
import { assignLanes, placement } from './lanes.js';

describe('assignLanes', () => {
  it('keeps well-spaced centers in lane 0', () => {
    expect(assignLanes([0, 200, 400])).toEqual([0, 0, 0]);
  });

  it('pushes overlapping centers into separate lanes', () => {
    // 0 occupies [-75, 75]; 50 ([-25, 125]) overlaps -> lane 1
    expect(assignLanes([0, 50])).toEqual([0, 1]);
  });

  it('reuses a lane once its last label has cleared', () => {
    expect(assignLanes([0, 50, 400])).toEqual([0, 1, 0]);
  });

  it('stacks a tight cluster into ascending lanes', () => {
    // 150px labels 40px apart all overlap -> one lane each
    expect(assignLanes([0, 40, 80, 120])).toEqual([0, 1, 2, 3]);
  });

  it('respects custom label width and gap', () => {
    expect(assignLanes([0, 100], 40, 2)).toEqual([0, 0]); // 40px slot: no overlap
  });
});

describe('placement', () => {
  it('alternates sides and steps tiers outward', () => {
    expect(placement(0)).toMatchObject({ side: 'above', tier: 0 });
    expect(placement(1)).toMatchObject({ side: 'below', tier: 0 });
    expect(placement(2)).toMatchObject({ side: 'above', tier: 1 });
    expect(placement(3)).toMatchObject({ side: 'below', tier: 1 });
  });

  it('increases offset with tier', () => {
    expect(placement(2).offset).toBeGreaterThan(placement(0).offset);
  });
});
