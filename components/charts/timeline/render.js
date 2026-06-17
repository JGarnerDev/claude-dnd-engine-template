// Timeline renderer (DOM assembly only). All positioning math lives in
// layout.js; this file turns a computed layout into elements, wires a zoom
// toolbar, and attaches pan. Depends on the DOM, so its test runs under
// happy-dom.

import { DEFAULT_CALENDAR } from './calendar.js';
import { computeLayout } from './layout.js';
import { ZOOM_FACTOR, ZOOM_MAX, MARGIN } from './constants.js';
import { enablePan, enableWheelZoom } from './controls.js';

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

function buildCanvas(layout, height = layout.canvasHeight) {
  const canvas = document.createElement('div');
  canvas.className = 'tl-canvas';
  canvas.style.width = `${layout.contentWidth}px`;
  canvas.style.height = `${height}px`;

  const axis = document.createElement('div');
  axis.className = 'tl-axis';
  canvas.appendChild(axis);

  for (const tick of layout.ticks) canvas.append(...buildTick(tick));
  for (const item of layout.items) canvas.appendChild(buildMarker(item));
  return canvas;
}

function buildToolbar(onZoom) {
  const bar = document.createElement('div');
  bar.className = 'tl-toolbar';
  const mk = (label, title, kind) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'tl-zoom-btn';
    b.textContent = label;
    b.title = title;
    b.addEventListener('click', () => onZoom(kind));
    return b;
  };
  bar.append(
    mk('−', 'Zoom out', 'out'),
    mk('Reset', 'Reset zoom', 'reset'),
    mk('+', 'Zoom in', 'in'),
  );
  return bar;
}

export function renderTimeline(container, data) {
  const cal = data.calendar || DEFAULT_CALENDAR;
  const viewportWidth = container.clientWidth || 800;

  container.innerHTML = '';
  container.classList.add('tl-root');

  const probe = computeLayout(data.events, cal);
  if (probe.isEmpty) {
    const empty = document.createElement('div');
    empty.className = 'tl-empty';
    empty.textContent = 'No events to show.';
    container.appendChild(empty);
    return { eventCount: 0, contentWidth: 0, laneCount: 0 };
  }

  // Fit density: px/year that makes the whole span exactly fill the viewport.
  // Zoom level 1 == fit (whole timeline visible); zooming multiplies from here,
  // so every step changes the layout and reset always returns to full view.
  const fitDensity = Math.max(1, (viewportWidth - MARGIN * 2) / probe.spanYears);
  let zoomLevel = 1;
  const api = { eventCount: 0, contentWidth: 0, laneCount: 0 };

  // Lock canvas height to the fit-zoom layout. Lanes only ever decrease as we
  // zoom in (events spread, fewer collisions), so fit is the tallest — pinning
  // it keeps the page from reflowing and the scrollbar from jumping on zoom.
  const canvasHeight = computeLayout(data.events, cal, fitDensity).canvasHeight;

  const viewport = document.createElement('div');
  viewport.className = 'tl-viewport';

  // Redraw at the current zoom. anchor (or null) is the point to hold fixed:
  // { frac } = position along the timeline (0..1), { x } = px from the viewport
  // left to keep it under — so zooming feels anchored on the cursor/center.
  function draw(anchor) {
    const layout = computeLayout(data.events, cal, fitDensity * zoomLevel);
    viewport.innerHTML = '';
    viewport.appendChild(buildCanvas(layout, canvasHeight));
    api.eventCount = layout.items.length;
    api.contentWidth = layout.contentWidth;
    api.laneCount = layout.laneCount;
    if (anchor) viewport.scrollLeft = anchor.frac * layout.contentWidth - anchor.x;
  }

  function zoom(kind, clientX) {
    const vw = viewport.clientWidth || viewportWidth;
    const left = viewport.getBoundingClientRect?.().left || 0;
    const x = clientX != null ? clientX - left : vw / 2;
    const frac = api.contentWidth ? (viewport.scrollLeft + x) / api.contentWidth : 0.5;
    if (kind === 'in') zoomLevel = Math.min(ZOOM_MAX, zoomLevel * ZOOM_FACTOR);
    else if (kind === 'out') zoomLevel = Math.max(1, zoomLevel / ZOOM_FACTOR);
    else zoomLevel = 1;
    draw({ frac, x });
  }

  container.append(buildToolbar(zoom), viewport);
  draw();
  enablePan(viewport);
  enableWheelZoom(viewport, zoom);

  return api;
}
