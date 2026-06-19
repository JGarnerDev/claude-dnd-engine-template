// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { listViews, saveView, deleteView } from './viewstore.js';
import type { SavedView } from '../types.js';

const KEY = 'campaign:saved-views:v1';
const mk = (name: string, tab: SavedView['tab'] = 'world'): SavedView => ({
  name,
  tab,
  state: { query: '', tracks: [], zoomLevel: 1, scrollLeft: 0 },
});

describe('viewstore', () => {
  beforeEach(() => localStorage.clear());

  it('returns [] when nothing is stored', () => {
    expect(listViews()).toEqual([]);
  });

  it('saves and reads back a view', () => {
    saveView(mk('Act 2 siege', 'tracks'));
    const views = listViews();
    expect(views).toHaveLength(1);
    expect(views[0].name).toBe('Act 2 siege');
    expect(views[0].tab).toBe('tracks');
  });

  it('overwrites an existing name in place (decision F)', () => {
    saveView(mk('a'));
    saveView(mk('b'));
    const updated = mk('a', 'tracks');
    updated.state.zoomLevel = 5;
    saveView(updated);
    const views = listViews();
    expect(views.map((v) => v.name)).toEqual(['a', 'b']); // position preserved
    expect(views[0].tab).toBe('tracks');
    expect(views[0].state.zoomLevel).toBe(5);
  });

  it('deletes by name and no-ops on a missing name (decision G)', () => {
    saveView(mk('a'));
    saveView(mk('b'));
    expect(deleteView('a').map((v) => v.name)).toEqual(['b']);
    expect(deleteView('ghost').map((v) => v.name)).toEqual(['b']);
  });

  it('persists across calls via the v1 key', () => {
    saveView(mk('x'));
    const raw = JSON.parse(localStorage.getItem(KEY)!);
    expect(raw.version).toBe(1);
    expect(raw.views).toHaveLength(1);
  });

  it('returns [] for corrupt JSON (fail soft)', () => {
    localStorage.setItem(KEY, '{not json');
    expect(listViews()).toEqual([]);
  });

  it('drops malformed entries and coerces a partial state', () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        version: 1,
        views: [
          null,
          { name: '' }, // empty name dropped
          { name: 'ok', tab: 'weird', state: { query: 'q' } }, // tab->world, state filled
        ],
      }),
    );
    const views = listViews();
    expect(views).toHaveLength(1);
    expect(views[0]).toEqual({
      name: 'ok',
      tab: 'world',
      state: { query: 'q', tracks: [], zoomLevel: 1, scrollLeft: 0 },
    });
  });
});

describe('viewstore fail-soft on a throwing store', () => {
  let original: Storage;
  beforeEach(() => {
    original = globalThis.localStorage;
    const throwing = {
      getItem() {
        throw new Error('blocked');
      },
      setItem() {
        throw new Error('blocked');
      },
    } as unknown as Storage;
    Object.defineProperty(globalThis, 'localStorage', { value: throwing, configurable: true });
  });
  afterEach(() => {
    Object.defineProperty(globalThis, 'localStorage', { value: original, configurable: true });
  });

  it('does not throw on read or write', () => {
    expect(listViews()).toEqual([]);
    expect(() => saveView(mk('a'))).not.toThrow();
  });
});
