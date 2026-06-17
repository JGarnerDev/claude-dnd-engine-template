// Timeline renderer (DOM assembly only). All positioning math lives in
// layout.js; this file turns a computed layout into elements. Depends on the
// DOM, so its test runs under happy-dom.

import { DEFAULT_CALENDAR } from './calendar.js';
import { computeLayout } from './layout.js';

function buildMarker(item) {
  const marker = document.createElement('div');
  marker.className = `tl-marker ${item.weight} ${item.side}`;
  marker.style.left = `${item.x}px`;
  marker.style.setProperty('--tl-offset', `${item.offset}px`);
  marker.dataset.track = item.track;

  const dot = document.createElement('div');
  dot.className = 'tl-dot';
  const leader = document.createElement('div');
  leader.className = 'tl-leader';
  const label = document.createElement('div');
  label.className = 'tl-label';
  label.textContent = item.text;

  marker.append(dot, leader, label);
  return marker;
}

function buildTick(tick) {
  const line = document.createElement('div');
  line.className = 'tl-tick';
  line.style.left = `${tick.x}px`;
  const label = document.createElement('div');
  label.className = 'tl-tick-label';
  label.style.left = `${tick.x}px`;
  label.textContent = tick.label;
  return [line, label];
}

export function renderTimeline(container, data) {
  const cal = data.calendar || DEFAULT_CALENDAR;
  const layout = computeLayout(data.events, cal, container.clientWidth || 800);

  container.innerHTML = '';
  container.classList.add('tl-root');

  if (layout.isEmpty) {
    const empty = document.createElement('div');
    empty.className = 'tl-empty';
    empty.textContent = 'No events to show.';
    container.appendChild(empty);
    return { eventCount: 0, contentWidth: 0, laneCount: 0 };
  }

  const viewport = document.createElement('div');
  viewport.className = 'tl-viewport';
  const canvas = document.createElement('div');
  canvas.className = 'tl-canvas';
  canvas.style.width = `${layout.contentWidth}px`;
  canvas.style.height = `${layout.canvasHeight}px`;

  const axis = document.createElement('div');
  axis.className = 'tl-axis';
  canvas.appendChild(axis);

  for (const tick of layout.ticks) canvas.append(...buildTick(tick));
  for (const item of layout.items) canvas.appendChild(buildMarker(item));

  viewport.appendChild(canvas);
  container.appendChild(viewport);
  return { eventCount: layout.items.length, contentWidth: layout.contentWidth, laneCount: layout.laneCount };
}
