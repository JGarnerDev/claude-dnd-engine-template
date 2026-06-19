import { describe, it, expect } from 'vitest';
import { weightOf } from './weight.js';

describe('weightOf', () => {
  it('maps major flag to is-major', () => expect(weightOf({ major: true })).toBe('is-major'));
  it('maps minor flag to is-minor', () => expect(weightOf({ minor: true })).toBe('is-minor'));
  it('defaults to is-normal', () => expect(weightOf({})).toBe('is-normal'));
  it('prefers major when both flags set', () => expect(weightOf({ major: true, minor: true })).toBe('is-major'));
});
