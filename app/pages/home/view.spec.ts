// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { renderTimelineView } from './view.js';
import type { TimelineData } from '../../components/charts/_common/types.js';

describe('renderTimelineView', () => {
  let container: HTMLDivElement;
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  const data: TimelineData = {
    calendar: null,
    events: [
      { date: '1340-02-15', label: 'War begins', track: 'world', major: true },
      { date: '1341-06-01', label: 'Aelith born', track: 'character:Aelith' },
    ],
  };

  const tab = (label: string) =>
    [...container.querySelectorAll<HTMLElement>('.chart-viewtab')].find((b) => b.textContent === label)!;

  it('renders a World and Campaign tab', () => {
    renderTimelineView(container, data);
    const labels = [...container.querySelectorAll('.chart-viewtab')].map((b) => b.textContent);
    expect(labels).toEqual(['World', 'Campaign']);
  });

  it('shows the world view by default (single-axis markers, no swimlanes)', () => {
    renderTimelineView(container, data);
    expect(container.querySelector('.chart-canvas')).toBeTruthy();
    expect(container.querySelector('.chart-swim-canvas')).toBeFalsy();
    expect(tab('World').classList.contains('is-active')).toBe(true);
  });

  it('honors an explicit initial view', () => {
    renderTimelineView(container, data, 'tracks');
    expect(container.querySelector('.chart-swim-canvas')).toBeTruthy();
    expect(tab('Campaign').classList.contains('is-active')).toBe(true);
  });

  it('swaps to the swimlane view when Campaign is clicked', () => {
    renderTimelineView(container, data);
    tab('Campaign').click();
    expect(container.querySelector('.chart-swim-canvas')).toBeTruthy();
    expect(container.querySelector('.chart-canvas')).toBeFalsy();
    expect(tab('Campaign').classList.contains('is-active')).toBe(true);
    expect(tab('World').classList.contains('is-active')).toBe(false);
  });

  it('swaps back to the world view', () => {
    renderTimelineView(container, data, 'tracks');
    tab('World').click();
    expect(container.querySelector('.chart-canvas')).toBeTruthy();
    expect(container.querySelector('.chart-swim-canvas')).toBeFalsy();
  });

  it('renders the empty state (no tabs/canvas) when there are no events', () => {
    for (const empty of [null, { calendar: null, events: [] } as TimelineData]) {
      renderTimelineView(container, empty);
      expect(container.querySelector('.chart-empty')).toBeTruthy();
      expect(container.querySelector('.chart-viewtab')).toBeFalsy();
      expect(container.querySelector('.chart-canvas')).toBeFalsy();
    }
  });
});
