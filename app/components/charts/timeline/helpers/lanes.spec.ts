import { describe, it, expect } from 'vitest';
import { placement } from './lanes.js';

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
