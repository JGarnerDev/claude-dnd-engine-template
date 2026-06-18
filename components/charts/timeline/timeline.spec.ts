// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { renderTimeline } from './timeline.js';
import type { TimelineData } from '../_common/types.js';

describe('renderTimeline', () => {
  let container: HTMLDivElement;
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  const data: TimelineData = {
    calendar: null,
    events: [
      { date: '1340-02-15', label: 'Winter begins', track: 'world', major: true, source: 'historian/events/winter.md' },
      { date: '1341-06-01', label: 'Trade pact', track: 'faction' },
      { date: '1342-06-20', label: 'Tax revolt', track: 'world', minor: true },
    ],
  };

  const chip = (track: string) =>
    [...container.querySelectorAll<HTMLElement>('.tl-chip')].find((c) => c.dataset.track === track)!;
  const fireInput = (value: string) => {
    const search = container.querySelector<HTMLInputElement>('.tl-search')!;
    search.value = value;
    search.dispatchEvent(new Event('input', { bubbles: true }));
  };

  it('renders one marker per event', () => {
    const result = renderTimeline(container, data);
    expect(result.eventCount).toBe(3);
    expect(container.querySelectorAll('.tl-marker')).toHaveLength(3);
  });

  it('gives each marker a dot, leader, and label', () => {
    renderTimeline(container, data);
    for (const marker of container.querySelectorAll('.tl-marker')) {
      expect(marker.querySelector('.tl-dot')).toBeTruthy();
      expect(marker.querySelector('.tl-leader')).toBeTruthy();
      expect(marker.querySelector('.tl-label')).toBeTruthy();
    }
  });

  it('tags markers with their track', () => {
    renderTimeline(container, data);
    const tracks = [...container.querySelectorAll<HTMLElement>('.tl-marker')].map((m) => m.dataset.track);
    expect(tracks).toContain('world');
    expect(tracks).toContain('faction');
  });

  it('marks major events with a star and weight class', () => {
    renderTimeline(container, data);
    const major = container.querySelector('.tl-marker.is-major');
    expect(major).toBeTruthy();
    expect(major!.querySelector('.tl-label')!.textContent).toMatch(/^★ /);
  });

  it('dims minor events with the minor weight class', () => {
    renderTimeline(container, data);
    expect(container.querySelector('.tl-marker.is-minor')).toBeTruthy();
  });

  it('renders year tick labels across the span', () => {
    renderTimeline(container, data);
    const ticks = [...container.querySelectorAll('.tl-tick-label')].map((t) => t.textContent);
    expect(ticks).toContain('1340');
    expect(ticks).toContain('1342');
  });

  it('shows an empty state when there are no events', () => {
    const result = renderTimeline(container, { events: [] });
    expect(result.eventCount).toBe(0);
    expect(container.querySelector('.tl-empty')).toBeTruthy();
  });

  it('renders a zoom toolbar with in/out/reset controls', () => {
    renderTimeline(container, data);
    expect(container.querySelectorAll('.tl-zoom-btn')).toHaveLength(3);
  });

  it('widens the canvas when zooming in', () => {
    const result = renderTimeline(container, data);
    const before = result.contentWidth;
    const zoomIn = [...container.querySelectorAll<HTMLElement>('.tl-zoom-btn')].find((b) => b.title === 'Zoom in')!;
    zoomIn.click(); // sample span is narrow; step past the viewport-width floor
    zoomIn.click();
    expect(result.contentWidth).toBeGreaterThan(before);
    expect(container.querySelectorAll('.tl-marker')).toHaveLength(3);
  });

  it('restores the default width after reset', () => {
    const result = renderTimeline(container, data);
    const base = result.contentWidth;
    const byTitle = (t: string) =>
      [...container.querySelectorAll<HTMLElement>('.tl-zoom-btn')].find((b) => b.title === t)!;
    byTitle('Zoom in').click();
    byTitle('Reset zoom').click();
    expect(result.contentWidth).toBe(base);
  });

  it('holds canvas height steady across zoom', () => {
    renderTimeline(container, data);
    const canvas = () => container.querySelector<HTMLElement>('.tl-canvas')!.style.height;
    const before = canvas();
    const zoomIn = [...container.querySelectorAll<HTMLElement>('.tl-zoom-btn')].find((b) => b.title === 'Zoom in')!;
    zoomIn.click();
    zoomIn.click();
    expect(canvas()).toBe(before);
  });

  it('renders a filter bar with a search box and one chip per track', () => {
    renderTimeline(container, data);
    expect(container.querySelector('.tl-filterbar .tl-search')).toBeTruthy();
    const tracks = [...container.querySelectorAll<HTMLElement>('.tl-chip')].map((c) => c.dataset.track);
    expect(tracks).toEqual(['world', 'faction']);
  });

  it('filters markers by search text (hiding in place, not relaying out)', () => {
    renderTimeline(container, data);
    fireInput('revolt');
    // All markers stay in the DOM (so x/y never shift); non-matches just hide.
    expect(container.querySelectorAll('.tl-marker')).toHaveLength(3);
    const visible = container.querySelectorAll('.tl-marker:not(.tl-hidden)');
    expect(visible).toHaveLength(1);
    expect(visible[0].querySelector('.tl-label')!.textContent).toBe('Tax revolt');
  });

  it('toggles a track off to hide its markers', () => {
    renderTimeline(container, data);
    chip('world').click(); // hide the two world beats
    const visible = [...container.querySelectorAll<HTMLElement>('.tl-marker:not(.tl-hidden)')];
    expect(visible.map((m) => m.dataset.track)).toEqual(['faction']);
  });

  it('keeps the time axis fixed when filtering (x/y scale unchanged)', () => {
    const result = renderTimeline(container, data);
    const widthBefore = result.contentWidth;
    const ticksBefore = container.querySelectorAll('.tl-tick-label').length;
    const xBefore = [...container.querySelectorAll<HTMLElement>('.tl-marker')].map((m) => m.style.left);
    fireInput('e'); // matches some but not all
    chip('world').click(); // leaves at least the faction beat visible
    expect(result.contentWidth).toBe(widthBefore);
    expect(container.querySelectorAll('.tl-tick-label').length).toBe(ticksBefore);
    expect([...container.querySelectorAll<HTMLElement>('.tl-marker')].map((m) => m.style.left)).toEqual(xBefore);
  });

  it('keeps the chart (axis + ticks) even when filters exclude every beat', () => {
    renderTimeline(container, data);
    fireInput('nothing matches this');
    expect(container.querySelector('.tl-canvas')).toBeTruthy();
    expect(container.querySelector('.tl-axis')).toBeTruthy();
    expect(container.querySelectorAll('.tl-tick-label').length).toBeGreaterThan(0);
    expect(container.querySelector('.tl-empty')).toBeFalsy();
    expect(container.querySelectorAll('.tl-marker:not(.tl-hidden)')).toHaveLength(0);
  });

  it('exposes the source path on markers that have one', () => {
    renderTimeline(container, data);
    const sourced = container.querySelector<HTMLElement>('.tl-marker.has-source')!;
    expect(sourced.dataset.source).toBe('historian/events/winter.md');
    expect(sourced.dataset.label).toBe('Winter begins');
  });
});
