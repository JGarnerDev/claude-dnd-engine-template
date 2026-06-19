// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { renderSwimlane } from './swimlane.js';
import type { TimelineData } from '../_common/types.js';

describe('renderSwimlane', () => {
  let container: HTMLDivElement;
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  // 'character' is expanded by default (so its child rows show); 'faction' is
  // collapsed by default (so it rolls up). 'world' is the untagged fallback.
  const data: TimelineData = {
    calendar: null,
    events: [
      { date: '1340-02-15', label: 'War begins', track: 'world', major: true, source: 'historian/events/war.md' },
      { date: '1341-06-01', label: 'Aelith born', track: 'character:Aelith' },
      { date: '1342-06-20', label: 'Borin sworn', track: 'character:Borin', minor: true },
      { date: '1343-01-10', label: 'Cult rises', track: 'faction:Ashen Cult' },
    ],
  };

  const chip = (track: string) =>
    [...container.querySelectorAll<HTMLElement>('.chart-chip')].find((c) => c.dataset.track === track)!;
  // Wheel zoom is the only zoom UI now (+ density-bar click). It's rAF-batched,
  // so dispatch then flush a frame. deltaY < 0 = zoom in.
  const flush = () => new Promise<void>((r) => requestAnimationFrame(() => r()));
  const wheel = async (deltaY: number) => {
    const vp = container.querySelector<HTMLElement>('.chart-swim')!;
    vp.dispatchEvent(new WheelEvent('wheel', { deltaY, clientX: 100, bubbles: true, cancelable: true }));
    await flush();
  };

  it('renders one swim marker per event', () => {
    const api = renderSwimlane(container, data);
    expect(api.eventCount).toBe(4);
    expect(container.querySelectorAll('.chart-swim-marker')).toHaveLength(4);
  });

  it('gives each marker a colored dot and track dataset', () => {
    renderSwimlane(container, data);
    for (const m of container.querySelectorAll<HTMLElement>('.chart-swim-marker')) {
      expect(m.querySelector('.chart-dot')).toBeTruthy();
      expect(m.dataset.track).toBeTruthy();
    }
  });

  it('builds a gutter with a row label per track row', () => {
    const api = renderSwimlane(container, data);
    const labels = container.querySelectorAll('.chart-swim-rowlabel');
    expect(labels.length).toBe(api.rowCount);
    expect(api.rowCount).toBeGreaterThan(0);
  });

  it('expands a category with children into a header + child rows', () => {
    renderSwimlane(container, data);
    const names = [...container.querySelectorAll('.chart-swim-rowname')].map((n) => n.textContent);
    expect(names).toContain('Characters'); // header row
    expect(names).toContain('Aelith'); // child row
    expect(names).toContain('Borin');
  });

  it('rolls a collapsed category up to a single row (no child rows)', () => {
    renderSwimlane(container, data);
    const names = [...container.querySelectorAll('.chart-swim-rowname')].map((n) => n.textContent);
    expect(names).toContain('Factions'); // present as roll-up
    expect(names).not.toContain('Ashen Cult'); // child hidden while collapsed
  });

  it('toggles a collapsed category open via its gutter toggle', () => {
    renderSwimlane(container, data);
    const factionRow = [...container.querySelectorAll<HTMLElement>('.chart-swim-rowlabel')].find(
      (r) => r.querySelector('.chart-swim-rowname')!.textContent === 'Factions',
    )!;
    factionRow.querySelector<HTMLButtonElement>('.chart-swim-toggle')!.click();
    const names = [...container.querySelectorAll('.chart-swim-rowname')].map((n) => n.textContent);
    expect(names).toContain('Ashen Cult'); // child now visible
  });

  it('toggles when the row name itself is clicked (whole label is the hit area)', () => {
    renderSwimlane(container, data);
    const factionRow = [...container.querySelectorAll<HTMLElement>('.chart-swim-rowlabel')].find(
      (r) => r.querySelector('.chart-swim-rowname')!.textContent === 'Factions',
    )!;
    expect(factionRow.tagName).toBe('BUTTON'); // toggleable rows are buttons
    factionRow.querySelector<HTMLElement>('.chart-swim-rowname')!.click(); // click the name, not the arrow
    const names = [...container.querySelectorAll('.chart-swim-rowname')].map((n) => n.textContent);
    expect(names).toContain('Ashen Cult'); // expanded
  });

  it('leaves leaf rows as plain non-button labels', () => {
    renderSwimlane(container, data);
    const worldRow = [...container.querySelectorAll<HTMLElement>('.chart-swim-rowlabel')].find(
      (r) => r.querySelector('.chart-swim-rowname')!.textContent === 'World',
    )!;
    expect(worldRow.tagName).toBe('DIV'); // leaf category → not a button
  });

  it('renders a per-track filter bar', () => {
    renderSwimlane(container, data);
    expect(container.querySelector('.chart-filterbar .chart-search')).toBeTruthy();
    expect(container.querySelectorAll('.chart-chip').length).toBeGreaterThan(0);
  });

  it('hides markers in place when a track is filtered off (scale stable)', () => {
    const api = renderSwimlane(container, data);
    const widthBefore = api.contentWidth;
    chip('world').click();
    expect(container.querySelectorAll('.chart-swim-marker')).toHaveLength(4); // all stay in DOM
    expect(container.querySelectorAll('.chart-swim-marker.chart-hidden').length).toBeGreaterThan(0);
    expect(api.contentWidth).toBe(widthBefore);
  });

  it('widens the canvas when zooming in with the wheel', async () => {
    const api = renderSwimlane(container, data);
    const before = api.contentWidth;
    await wheel(-120);
    await wheel(-120);
    expect(api.contentWidth).toBeGreaterThan(before);
    expect(container.querySelectorAll('.chart-swim-marker')).toHaveLength(4);
  });

  it('exposes the source path on markers that have one', () => {
    renderSwimlane(container, data);
    const sourced = container.querySelector<HTMLElement>('.chart-swim-marker.has-source')!;
    expect(sourced.dataset.source).toBe('historian/events/war.md');
    expect(sourced.dataset.label).toBe('War begins');
  });

  it('renders inline labels on density-gated markers', () => {
    renderSwimlane(container, data);
    const labels = [...container.querySelectorAll('.chart-swim-label')].map((l) => l.textContent);
    // At fit density rows are sparse here, so every beat gets its label.
    expect(labels).toContain('★ War begins'); // major → star prefix
    expect(labels).toContain('Aelith born');
    expect(labels.length).toBeGreaterThan(0);
  });

  it('shows an empty state when there are no events', () => {
    const api = renderSwimlane(container, { events: [] });
    expect(api.eventCount).toBe(0);
    expect(container.querySelector('.chart-empty')).toBeTruthy();
  });

  it('renders per-row density bars for crowded tracks and recounts them on filter', () => {
    const dense: TimelineData = {
      calendar: null,
      events: Array.from({ length: 40 }, (_, i) => ({
        date: `1340-01-${String((i % 28) + 1).padStart(2, '0')}`,
        label: `b${i}`,
        track: i % 2 === 0 ? 'world' : 'party',
      })),
    };
    const api = renderSwimlane(container, dense);
    expect(container.querySelectorAll('.chart-swim-bar').length).toBeGreaterThan(0);
    expect(container.querySelectorAll('.chart-swim-marker').length).toBeLessThan(40); // crowd aggregated

    const sumCounts = () =>
      [...container.querySelectorAll<HTMLElement>('.chart-swim-bar:not(.chart-hidden)')].reduce(
        (s, b) => s + Number(b.dataset.count),
        0,
      );
    const before = sumCounts();
    chip('party').click(); // drop half the beats
    expect(sumCounts()).toBeLessThan(before);
    expect(api.eventCount).toBeLessThan(40);
  });

  it('getState() snapshots the live query and track selection', () => {
    const api = renderSwimlane(container, data);
    const search = container.querySelector<HTMLInputElement>('.chart-search')!;
    search.value = 'aelith';
    search.dispatchEvent(new Event('input'));
    chip('world').click();
    const state = api.getState();
    expect(state.query).toBe('aelith');
    expect(state.tracks).toEqual(['world']);
    expect(state.zoomLevel).toBe(1);
  });

  it('seeds the filter UI from initialState and round-trips through getState()', () => {
    const api = renderSwimlane(container, data, { query: 'war', tracks: ['world'], zoomLevel: 1, scrollLeft: 0, showSecret: false });
    expect(container.querySelector<HTMLInputElement>('.chart-search')!.value).toBe('war');
    expect(chip('world').classList.contains('is-on')).toBe(true);
    const state = api.getState();
    expect(state.query).toBe('war');
    expect(state.tracks).toEqual(['world']);
  });
});
