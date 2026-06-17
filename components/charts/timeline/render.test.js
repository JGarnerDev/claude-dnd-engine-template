// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { renderTimeline } from './render.js';

describe('renderTimeline', () => {
  let container;
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  const data = {
    calendar: null,
    events: [
      { date: '1340-02-15', label: 'Winter begins', track: 'world', major: true },
      { date: '1341-06-01', label: 'Trade pact', track: 'faction' },
      { date: '1342-06-20', label: 'Tax revolt', track: 'world', minor: true },
    ],
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
    const tracks = [...container.querySelectorAll('.tl-marker')].map((m) => m.dataset.track);
    expect(tracks).toContain('world');
    expect(tracks).toContain('faction');
  });

  it('marks major events with a star and weight class', () => {
    renderTimeline(container, data);
    const major = container.querySelector('.tl-marker.is-major');
    expect(major).toBeTruthy();
    expect(major.querySelector('.tl-label').textContent).toMatch(/^★ /);
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
    const zoomIn = [...container.querySelectorAll('.tl-zoom-btn')].find((b) => b.title === 'Zoom in');
    zoomIn.click(); // sample span is narrow; step past the viewport-width floor
    zoomIn.click();
    expect(result.contentWidth).toBeGreaterThan(before);
    expect(container.querySelectorAll('.tl-marker')).toHaveLength(3);
  });

  it('restores the default width after reset', () => {
    const result = renderTimeline(container, data);
    const base = result.contentWidth;
    const byTitle = (t) => [...container.querySelectorAll('.tl-zoom-btn')].find((b) => b.title === t);
    byTitle('Zoom in').click();
    byTitle('Reset zoom').click();
    expect(result.contentWidth).toBe(base);
  });

  it('holds canvas height steady across zoom', () => {
    renderTimeline(container, data);
    const canvas = () => container.querySelector('.tl-canvas').style.height;
    const before = canvas();
    const zoomIn = [...container.querySelectorAll('.tl-zoom-btn')].find((b) => b.title === 'Zoom in');
    zoomIn.click();
    zoomIn.click();
    expect(canvas()).toBe(before);
  });
});
