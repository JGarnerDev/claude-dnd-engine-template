// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mountSavedViews } from './savedviews.js';
import { listViews, saveView } from '../helpers/viewstore.js';
import type { ChartState, SavedView } from '../types.js';

const state = (over: Partial<ChartState> = {}): ChartState => ({
  query: '',
  tracks: [],
  zoomLevel: 1,
  scrollLeft: 0,
  showSecret: false,
  ...over,
});

function mount(over: { tab?: SavedView['tab']; state?: ChartState } = {}) {
  const host = document.createElement('div');
  document.body.append(host);
  const apply = vi.fn();
  const getCurrent = vi.fn(() => ({ tab: over.tab ?? 'world', state: over.state ?? state() }));
  mountSavedViews(host, { getCurrent, apply });
  const q = <T extends HTMLElement>(sel: string) => host.querySelector<T>(sel)!;
  return { host, apply, getCurrent, q, all: <T extends HTMLElement>(sel: string) => [...host.querySelectorAll<T>(sel)] };
}

describe('mountSavedViews', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
  });

  it('mounts Save and Load buttons in that order, left of the gear slot', () => {
    const { all } = mount();
    const btns = all<HTMLButtonElement>('.chart-sv-btn');
    expect(btns.map((b) => b.title)).toEqual(['Save view', 'Load view']);
  });

  it('saves the current view under a typed name', () => {
    const { q } = mount({ tab: 'tracks', state: state({ query: 'siege', zoomLevel: 4 }) });
    q<HTMLInputElement>('.chart-sv-name').value = 'Act 2';
    q<HTMLButtonElement>('.chart-sv-confirm').click();
    const views = listViews();
    expect(views).toHaveLength(1);
    expect(views[0]).toEqual({ name: 'Act 2', tab: 'tracks', state: state({ query: 'siege', zoomLevel: 4 }) });
  });

  it('ignores a blank name', () => {
    const { q } = mount();
    q<HTMLInputElement>('.chart-sv-name').value = '   ';
    q<HTMLButtonElement>('.chart-sv-confirm').click();
    expect(listViews()).toEqual([]);
  });

  it('requires a second confirm to overwrite an existing name', () => {
    saveView({ name: 'dup', tab: 'world', state: state() });
    const { q } = mount({ state: state({ zoomLevel: 7 }) });
    const confirm = q<HTMLButtonElement>('.chart-sv-confirm');
    q<HTMLInputElement>('.chart-sv-name').value = 'dup';
    confirm.click();
    expect(confirm.textContent).toBe('Overwrite?'); // staged, not yet written
    expect(listViews()[0].state.zoomLevel).toBe(1);
    confirm.click();
    expect(listViews()).toHaveLength(1);
    expect(listViews()[0].state.zoomLevel).toBe(7);
  });

  it('lists saved views on Load and applies one on click', () => {
    saveView({ name: 'A', tab: 'world', state: state() });
    saveView({ name: 'B', tab: 'tracks', state: state({ query: 'x' }) });
    const { all, apply } = mount();
    all<HTMLButtonElement>('.chart-sv-btn')[1].click(); // open Load
    const rows = all<HTMLButtonElement>('.chart-sv-load');
    expect(rows.map((r) => r.textContent)).toEqual(['A', 'B']);
    rows[1].click();
    expect(apply).toHaveBeenCalledWith(expect.objectContaining({ name: 'B', tab: 'tracks' }));
  });

  it('deletes a view from the Load list via its ×', () => {
    saveView({ name: 'A', tab: 'world', state: state() });
    saveView({ name: 'B', tab: 'world', state: state() });
    const { all } = mount();
    all<HTMLButtonElement>('.chart-sv-btn')[1].click();
    all<HTMLButtonElement>('.chart-sv-del')[0].click(); // delete 'A'
    expect(listViews().map((v) => v.name)).toEqual(['B']);
    expect(all<HTMLButtonElement>('.chart-sv-load').map((r) => r.textContent)).toEqual(['B']);
  });

  it('shows an empty-state message when nothing is saved', () => {
    const { all, q } = mount();
    all<HTMLButtonElement>('.chart-sv-btn')[1].click();
    expect(q('.chart-sv-empty').textContent).toMatch(/no saved views/i);
  });
});
