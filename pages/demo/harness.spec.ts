// Smoke test — proves the Vitest harness runs (M0). Real module tests
// (calendar.test.js, etc.) are added per-module once we agree the code is right.
import { describe, it, expect } from 'vitest';

describe('vitest harness', () => {
  it('runs', () => {
    expect(true).toBe(true);
  });
});
