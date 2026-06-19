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
    [...container.querySelectorAll<HTMLElement>('.chart-chip')].find((c) => c.dataset.track === track)!;
  const fireInput = (value: string) => {
    const search = container.querySelector<HTMLInputElement>('.chart-search')!;
    search.value = value;
    search.dispatchEvent(new Event('input', { bubbles: true }));
  };
  // Wheel zoom is the only zoom UI now (+ density-bar click). It's rAF-batched,
  // so dispatch then flush a frame. deltaY < 0 = zoom in, > 0 = out.
  const flush = () => new Promise<void>((r) => requestAnimationFrame(() => r()));
  const wheel = async (deltaY: number) => {
    const vp = container.querySelector<HTMLElement>('.chart-viewport')!;
    vp.dispatchEvent(new WheelEvent('wheel', { deltaY, clientX: 100, bubbles: true, cancelable: true }));
    await flush();
  };

  it('renders one marker per event', () => {
    const result = renderTimeline(container, data);
    expect(result.eventCount).toBe(3);
    expect(container.querySelectorAll('.chart-marker')).toHaveLength(3);
  });

  it('gives each marker a dot, leader, and label', () => {
    renderTimeline(container, data);
    for (const marker of container.querySelectorAll('.chart-marker')) {
      expect(marker.querySelector('.chart-dot')).toBeTruthy();
      expect(marker.querySelector('.chart-leader')).toBeTruthy();
      expect(marker.querySelector('.chart-label')).toBeTruthy();
    }
  });

  it('tags markers with their track', () => {
    renderTimeline(container, data);
    const tracks = [...container.querySelectorAll<HTMLElement>('.chart-marker')].map((m) => m.dataset.track);
    expect(tracks).toContain('world');
    expect(tracks).toContain('faction');
  });

  it('marks major events with a star and weight class', () => {
    renderTimeline(container, data);
    const major = container.querySelector('.chart-marker.is-major');
    expect(major).toBeTruthy();
    expect(major!.querySelector('.chart-label')!.textContent).toMatch(/^★ /);
  });

  it('dims minor events with the minor weight class', () => {
    renderTimeline(container, data);
    expect(container.querySelector('.chart-marker.is-minor')).toBeTruthy();
  });

  it('renders year tick labels across the span', () => {
    renderTimeline(container, data);
    const ticks = [...container.querySelectorAll('.chart-tick-label')].map((t) => t.textContent);
    expect(ticks).toContain('1340');
    expect(ticks).toContain('1342');
  });

  it('shows an empty state when there are no events', () => {
    const result = renderTimeline(container, { events: [] });
    expect(result.eventCount).toBe(0);
    expect(container.querySelector('.chart-empty')).toBeTruthy();
  });

  it('widens the canvas when zooming in with the wheel', async () => {
    const result = renderTimeline(container, data);
    const before = result.contentWidth;
    await wheel(-120); // sample span is narrow; step past the viewport-width floor
    await wheel(-120);
    expect(result.contentWidth).toBeGreaterThan(before);
    expect(container.querySelectorAll('.chart-marker')).toHaveLength(3);
  });

  it('narrows the canvas back when zooming out', async () => {
    const result = renderTimeline(container, data);
    const base = result.contentWidth;
    await wheel(-120);
    await wheel(-120);
    expect(result.contentWidth).toBeGreaterThan(base);
    await wheel(120);
    await wheel(120);
    expect(result.contentWidth).toBe(base); // out is floored at fit (zoom level 1)
  });

  it('holds canvas height steady across zoom', async () => {
    renderTimeline(container, data);
    const canvas = () => container.querySelector<HTMLElement>('.chart-canvas')!.style.height;
    const before = canvas();
    await wheel(-120);
    await wheel(-120);
    expect(canvas()).toBe(before);
  });

  it('renders a filter bar with a search box and one chip per track', () => {
    renderTimeline(container, data);
    expect(container.querySelector('.chart-filterbar .chart-search')).toBeTruthy();
    const tracks = [...container.querySelectorAll<HTMLElement>('.chart-chip')].map((c) => c.dataset.track);
    expect(tracks).toEqual(['world', 'faction']);
  });

  it('filters markers by search text (hiding in place, not relaying out)', () => {
    renderTimeline(container, data);
    fireInput('revolt');
    // All markers stay in the DOM (so x/y never shift); non-matches just hide.
    expect(container.querySelectorAll('.chart-marker')).toHaveLength(3);
    const visible = container.querySelectorAll('.chart-marker:not(.chart-hidden)');
    expect(visible).toHaveLength(1);
    expect(visible[0].querySelector('.chart-label')!.textContent).toBe('Tax revolt');
  });

  it('selects a track to show only its markers', () => {
    renderTimeline(container, data);
    chip('world').click(); // whitelist world -> only the two world beats show
    const visible = [...container.querySelectorAll<HTMLElement>('.chart-marker:not(.chart-hidden)')];
    expect(visible.map((m) => m.dataset.track)).toEqual(['world', 'world']);
  });

  it('keeps the time axis fixed when filtering (x/y scale unchanged)', () => {
    const result = renderTimeline(container, data);
    const widthBefore = result.contentWidth;
    const ticksBefore = container.querySelectorAll('.chart-tick-label').length;
    const xBefore = [...container.querySelectorAll<HTMLElement>('.chart-marker')].map((m) => m.style.left);
    fireInput('e'); // matches some but not all
    chip('world').click(); // whitelist world -> visibility narrows, layout unchanged
    expect(result.contentWidth).toBe(widthBefore);
    expect(container.querySelectorAll('.chart-tick-label').length).toBe(ticksBefore);
    expect([...container.querySelectorAll<HTMLElement>('.chart-marker')].map((m) => m.style.left)).toEqual(xBefore);
  });

  it('keeps the chart (axis + ticks) even when filters exclude every beat', () => {
    renderTimeline(container, data);
    fireInput('nothing matches this');
    expect(container.querySelector('.chart-canvas')).toBeTruthy();
    expect(container.querySelector('.chart-axis')).toBeTruthy();
    expect(container.querySelectorAll('.chart-tick-label').length).toBeGreaterThan(0);
    expect(container.querySelector('.chart-empty')).toBeFalsy();
    expect(container.querySelectorAll('.chart-marker:not(.chart-hidden)')).toHaveLength(0);
  });

  it('exposes the source path on markers that have one', () => {
    renderTimeline(container, data);
    const sourced = container.querySelector<HTMLElement>('.chart-marker.has-source')!;
    expect(sourced.dataset.source).toBe('historian/events/winter.md');
    expect(sourced.dataset.label).toBe('Winter begins');
  });

  it('renders density bars for crowded beats instead of a marker each', () => {
    // 50 beats packed into one month → at fit density they share pixel buckets and
    // roll into below-axis density bars rather than 50 individual markers.
    const dense: TimelineData = {
      calendar: null,
      events: Array.from({ length: 50 }, (_, i) => ({
        date: `1340-01-${String((i % 28) + 1).padStart(2, '0')}`,
        label: `beat ${i}`,
        track: 'world',
      })),
    };
    renderTimeline(container, dense);
    const bars = container.querySelectorAll('.chart-bar');
    expect(bars.length).toBeGreaterThan(0);
    // far fewer individual markers than beats — the crowd is aggregated
    expect(container.querySelectorAll('.chart-marker').length).toBeLessThan(50);
    expect(Number(container.querySelector<HTMLElement>('.chart-bar')!.dataset.count)).toBeGreaterThan(1);
  });

  it('recounts/hides density bars to match the active filter', () => {
    const dense: TimelineData = {
      calendar: null,
      events: Array.from({ length: 50 }, (_, i) => ({
        date: `1340-01-${String((i % 28) + 1).padStart(2, '0')}`,
        label: `beat ${i}`,
        track: i % 2 === 0 ? 'world' : 'party', // half each track
      })),
    };
    const sumBarCounts = () =>
      [...container.querySelectorAll<HTMLElement>('.chart-bar:not(.chart-hidden)')].reduce(
        (s, b) => s + Number(b.dataset.count),
        0,
      );

    const api = renderTimeline(container, dense);
    const totalBefore = api.eventCount; // individuals + bar members
    const barSumBefore = sumBarCounts();
    expect(barSumBefore).toBeGreaterThan(0);

    chip('party').click(); // drop half the beats
    // bars rescale down to only the matching (world) members
    expect(api.eventCount).toBeLessThan(totalBefore);
    expect(sumBarCounts()).toBeLessThan(barSumBefore);

    fireInput('nothing matches this'); // now zero matches
    expect(container.querySelectorAll('.chart-bar:not(.chart-hidden)')).toHaveLength(0);
    expect(api.eventCount).toBe(0);
  });
});
