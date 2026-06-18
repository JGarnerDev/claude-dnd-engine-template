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
    [...container.querySelectorAll<HTMLElement>('.tl-chip')].find((c) => c.dataset.track === track)!;

  it('renders one swim marker per event', () => {
    const api = renderSwimlane(container, data);
    expect(api.eventCount).toBe(4);
    expect(container.querySelectorAll('.tl-swim-marker')).toHaveLength(4);
  });

  it('gives each marker a colored dot and track dataset', () => {
    renderSwimlane(container, data);
    for (const m of container.querySelectorAll<HTMLElement>('.tl-swim-marker')) {
      expect(m.querySelector('.tl-dot')).toBeTruthy();
      expect(m.dataset.track).toBeTruthy();
    }
  });

  it('builds a gutter with a row label per track row', () => {
    const api = renderSwimlane(container, data);
    const labels = container.querySelectorAll('.tl-swim-rowlabel');
    expect(labels.length).toBe(api.rowCount);
    expect(api.rowCount).toBeGreaterThan(0);
  });

  it('expands a category with children into a header + child rows', () => {
    renderSwimlane(container, data);
    const names = [...container.querySelectorAll('.tl-swim-rowname')].map((n) => n.textContent);
    expect(names).toContain('Characters'); // header row
    expect(names).toContain('Aelith'); // child row
    expect(names).toContain('Borin');
  });

  it('rolls a collapsed category up to a single row (no child rows)', () => {
    renderSwimlane(container, data);
    const names = [...container.querySelectorAll('.tl-swim-rowname')].map((n) => n.textContent);
    expect(names).toContain('Factions'); // present as roll-up
    expect(names).not.toContain('Ashen Cult'); // child hidden while collapsed
  });

  it('toggles a collapsed category open via its gutter toggle', () => {
    renderSwimlane(container, data);
    const factionRow = [...container.querySelectorAll<HTMLElement>('.tl-swim-rowlabel')].find(
      (r) => r.querySelector('.tl-swim-rowname')!.textContent === 'Factions',
    )!;
    factionRow.querySelector<HTMLButtonElement>('.tl-swim-toggle')!.click();
    const names = [...container.querySelectorAll('.tl-swim-rowname')].map((n) => n.textContent);
    expect(names).toContain('Ashen Cult'); // child now visible
  });

  it('toggles when the row name itself is clicked (whole label is the hit area)', () => {
    renderSwimlane(container, data);
    const factionRow = [...container.querySelectorAll<HTMLElement>('.tl-swim-rowlabel')].find(
      (r) => r.querySelector('.tl-swim-rowname')!.textContent === 'Factions',
    )!;
    expect(factionRow.tagName).toBe('BUTTON'); // toggleable rows are buttons
    factionRow.querySelector<HTMLElement>('.tl-swim-rowname')!.click(); // click the name, not the arrow
    const names = [...container.querySelectorAll('.tl-swim-rowname')].map((n) => n.textContent);
    expect(names).toContain('Ashen Cult'); // expanded
  });

  it('leaves leaf rows as plain non-button labels', () => {
    renderSwimlane(container, data);
    const worldRow = [...container.querySelectorAll<HTMLElement>('.tl-swim-rowlabel')].find(
      (r) => r.querySelector('.tl-swim-rowname')!.textContent === 'World',
    )!;
    expect(worldRow.tagName).toBe('DIV'); // leaf category → not a button
  });

  it('renders a zoom toolbar and a per-track filter bar', () => {
    renderSwimlane(container, data);
    expect(container.querySelectorAll('.tl-zoom-btn')).toHaveLength(3);
    expect(container.querySelector('.tl-filterbar .tl-search')).toBeTruthy();
    expect(container.querySelectorAll('.tl-chip').length).toBeGreaterThan(0);
  });

  it('hides markers in place when a track is filtered off (scale stable)', () => {
    const api = renderSwimlane(container, data);
    const widthBefore = api.contentWidth;
    chip('world').click();
    expect(container.querySelectorAll('.tl-swim-marker')).toHaveLength(4); // all stay in DOM
    expect(container.querySelectorAll('.tl-swim-marker.tl-hidden').length).toBeGreaterThan(0);
    expect(api.contentWidth).toBe(widthBefore);
  });

  it('widens the canvas when zooming in', () => {
    const api = renderSwimlane(container, data);
    const before = api.contentWidth;
    const zoomIn = [...container.querySelectorAll<HTMLElement>('.tl-zoom-btn')].find((b) => b.title === 'Zoom in')!;
    zoomIn.click();
    zoomIn.click();
    expect(api.contentWidth).toBeGreaterThan(before);
    expect(container.querySelectorAll('.tl-swim-marker')).toHaveLength(4);
  });

  it('exposes the source path on markers that have one', () => {
    renderSwimlane(container, data);
    const sourced = container.querySelector<HTMLElement>('.tl-swim-marker.has-source')!;
    expect(sourced.dataset.source).toBe('historian/events/war.md');
    expect(sourced.dataset.label).toBe('War begins');
  });

  it('renders inline labels on density-gated markers', () => {
    renderSwimlane(container, data);
    const labels = [...container.querySelectorAll('.tl-swim-label')].map((l) => l.textContent);
    // At fit density rows are sparse here, so every beat gets its label.
    expect(labels).toContain('★ War begins'); // major → star prefix
    expect(labels).toContain('Aelith born');
    expect(labels.length).toBeGreaterThan(0);
  });

  it('shows an empty state when there are no events', () => {
    const api = renderSwimlane(container, { events: [] });
    expect(api.eventCount).toBe(0);
    expect(container.querySelector('.tl-empty')).toBeTruthy();
  });
});
