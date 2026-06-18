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
    [...container.querySelectorAll<HTMLElement>('.tl-viewtab')].find((b) => b.textContent === label)!;

  it('renders a World and Tracks tab', () => {
    renderTimelineView(container, data);
    const labels = [...container.querySelectorAll('.tl-viewtab')].map((b) => b.textContent);
    expect(labels).toEqual(['World', 'Tracks']);
  });

  it('shows the world view by default (single-axis markers, no swimlanes)', () => {
    renderTimelineView(container, data);
    expect(container.querySelector('.tl-canvas')).toBeTruthy();
    expect(container.querySelector('.tl-swim-canvas')).toBeFalsy();
    expect(tab('World').classList.contains('is-active')).toBe(true);
  });

  it('honors an explicit initial view', () => {
    renderTimelineView(container, data, 'tracks');
    expect(container.querySelector('.tl-swim-canvas')).toBeTruthy();
    expect(tab('Tracks').classList.contains('is-active')).toBe(true);
  });

  it('swaps to the swimlane view when Tracks is clicked', () => {
    renderTimelineView(container, data);
    tab('Tracks').click();
    expect(container.querySelector('.tl-swim-canvas')).toBeTruthy();
    expect(container.querySelector('.tl-canvas')).toBeFalsy();
    expect(tab('Tracks').classList.contains('is-active')).toBe(true);
    expect(tab('World').classList.contains('is-active')).toBe(false);
  });

  it('swaps back to the world view', () => {
    renderTimelineView(container, data, 'tracks');
    tab('World').click();
    expect(container.querySelector('.tl-canvas')).toBeTruthy();
    expect(container.querySelector('.tl-swim-canvas')).toBeFalsy();
  });
});
