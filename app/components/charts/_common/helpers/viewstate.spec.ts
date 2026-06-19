import { describe, it, expect } from 'vitest';
import { clampZoom, resolveTracks, serializeState, applyDefaults, DEFAULT_STATE } from './viewstate.js';

describe('clampZoom', () => {
  it('clamps below fit up to 1', () => {
    expect(clampZoom(0.2, 8)).toBe(1);
    expect(clampZoom(-5, 8)).toBe(1);
  });
  it('clamps above the current ceiling down to maxZoom', () => {
    expect(clampZoom(50, 8)).toBe(8);
  });
  it('passes an in-range value through', () => {
    expect(clampZoom(4, 8)).toBe(4);
  });
  it('falls back to 1 for non-finite input', () => {
    expect(clampZoom(NaN, 8)).toBe(1);
    expect(clampZoom(Infinity, 8)).toBe(1);
  });
  it('treats a maxZoom below 1 as 1', () => {
    expect(clampZoom(3, 0.5)).toBe(1);
  });
});

describe('resolveTracks', () => {
  it('keeps only saved names still present, in saved order', () => {
    expect(resolveTracks(['b', 'a', 'gone'], ['a', 'b', 'c'])).toEqual(['b', 'a']);
  });
  it('returns empty when nothing resolves', () => {
    expect(resolveTracks(['x', 'y'], ['a', 'b'])).toEqual([]);
  });
  it('returns empty for an empty saved selection', () => {
    expect(resolveTracks([], ['a', 'b'])).toEqual([]);
  });
});

describe('serializeState', () => {
  it('snapshots live parts, draining the track Set to an array', () => {
    const state = serializeState('siege', new Set(['world', 'factions']), 4, 120, true);
    expect(state).toEqual({ query: 'siege', tracks: ['world', 'factions'], zoomLevel: 4, scrollLeft: 120, showSecret: true });
  });
});

describe('applyDefaults', () => {
  it('returns a fresh default copy for null/garbage', () => {
    expect(applyDefaults(null)).toEqual(DEFAULT_STATE);
    expect(applyDefaults(undefined)).toEqual(DEFAULT_STATE);
    // a fresh copy, not the shared constant
    expect(applyDefaults(null)).not.toBe(DEFAULT_STATE);
  });
  it('fills missing fields and keeps valid ones', () => {
    expect(applyDefaults({ query: 'a' })).toEqual({ query: 'a', tracks: [], zoomLevel: 1, scrollLeft: 0, showSecret: false });
  });
  it('drops wrong-typed fields and non-string tracks', () => {
    const raw = { query: 7, tracks: ['ok', 3, null], zoomLevel: 'x', scrollLeft: NaN, showSecret: 'yes' } as unknown;
    expect(applyDefaults(raw as Partial<typeof DEFAULT_STATE>)).toEqual({
      query: '',
      tracks: ['ok'],
      zoomLevel: 1,
      scrollLeft: 0,
      showSecret: false,
    });
  });
  it('keeps a valid showSecret', () => {
    expect(applyDefaults({ showSecret: true }).showSecret).toBe(true);
  });
});
