// Timeline renderer (DOM assembly only). All positioning math lives in
// layout.js; this file turns a computed layout into elements, wires a zoom
// toolbar, and attaches pan. Depends on the DOM, so its test runs under
// happy-dom.

import { DEFAULT_CALENDAR } from './calendar.js';
import { computeLayout } from './layout.js';
import { ZOOM_FACTOR, ZOOM_MAX, MARGIN, TARGET_PX_PER_BEAT } from './constants.js';
import { enablePan, enableWheelZoom, enableMarkerInteraction } from './controls.js';
import { matchesFilters } from './filters.js';
import { buildFilterBar } from './filterbar.js';
import type { Layout, LayoutItem, Tick, TimelineData, ZoomKind } from './types.js';

// Mutable handle returned to the caller; tests read these counts.
interface TimelineApi {
  eventCount: number;
  contentWidth: number;
  laneCount: number;
}

function buildMarker(item: LayoutItem): HTMLDivElement {
  const marker = document.createElement('div');
  marker.className = `tl-marker ${item.weight} ${item.side}`;
  marker.style.left = `${item.x}px`;
  marker.style.setProperty('--tl-offset', `${item.offset}px`);
  marker.dataset.track = item.track;
  marker.dataset.label = item.label; // full, unclamped — hover shows it all
  marker.dataset.date = item.date;
  // Density-gated bare dot: keep it on the axis with no label/leader (CSS hides
  // them). The label element still renders in the DOM so hover/data stays intact.
  if (!item.showLabel) marker.classList.add('tl-bare');
  if (item.source) {
    marker.dataset.source = item.source;
    marker.classList.add('has-source');
  }

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

function buildTick(tick: Tick): [HTMLDivElement, HTMLDivElement] {
  const line = document.createElement('div');
  line.className = 'tl-tick';
  line.style.left = `${tick.x}px`;
  const label = document.createElement('div');
  label.className = 'tl-tick-label';
  label.style.left = `${tick.x}px`;
  label.textContent = tick.label;
  return [line, label];
}

// isVisible(item) decides which markers show. The layout is always the full set
// (so x/y never shift on filter); unmatched markers are just hidden in place.
function buildCanvas(
  layout: Layout,
  height: number = layout.canvasHeight,
  isVisible: (item: LayoutItem) => boolean = () => true,
): HTMLDivElement {
  const canvas = document.createElement('div');
  canvas.className = 'tl-canvas';
  canvas.style.width = `${layout.contentWidth}px`;
  canvas.style.height = `${height}px`;

  const axis = document.createElement('div');
  axis.className = 'tl-axis';
  canvas.appendChild(axis);

  for (const tick of layout.ticks) canvas.append(...buildTick(tick));
  for (const item of layout.items) {
    const marker = buildMarker(item);
    if (!isVisible(item)) marker.classList.add('tl-hidden');
    canvas.appendChild(marker);
  }
  return canvas;
}

function buildToolbar(onZoom: (kind: ZoomKind) => void): HTMLDivElement {
  const bar = document.createElement('div');
  bar.className = 'tl-toolbar';
  const mk = (label: string, title: string, kind: ZoomKind): HTMLButtonElement => {
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

function buildEmpty(text: string): HTMLDivElement {
  const empty = document.createElement('div');
  empty.className = 'tl-empty';
  empty.textContent = text;
  return empty;
}

export function renderTimeline(container: HTMLElement, data: TimelineData): TimelineApi {
  const cal = data.calendar || DEFAULT_CALENDAR;
  const viewportWidth = container.clientWidth || 800;

  container.innerHTML = '';
  container.classList.add('tl-root');

  const probe = computeLayout(data.events, cal);
  if (probe.isEmpty) {
    container.appendChild(buildEmpty('No events to show.'));
    return { eventCount: 0, contentWidth: 0, laneCount: 0 };
  }

  // Fit density: px/year that makes the whole span exactly fill the viewport.
  // Zoom level 1 == fit (whole timeline visible); zooming multiplies from here,
  // so every step changes the layout and reset always returns to full view.
  const fitDensity = Math.max(1, (viewportWidth - MARGIN * 2) / probe.spanYears);
  // Deepest zoom adapts to beat density: dense/long timelines need a higher cap
  // than 8× of a tiny fit density to spread beats to ~TARGET_PX_PER_BEAT apart.
  // Sparse timelines keep the ZOOM_MAX floor.
  const beatsPerYear = probe.items.length / probe.spanYears;
  const targetDensity = beatsPerYear * TARGET_PX_PER_BEAT;
  const maxZoom = Math.max(ZOOM_MAX, targetDensity / fitDensity);
  let zoomLevel = 1;
  const api: TimelineApi = { eventCount: 0, contentWidth: 0, laneCount: 0 };

  // Lock canvas height to the fit-zoom layout. Lanes only ever decrease as we
  // zoom in (events spread, fewer collisions), so fit is the tallest — pinning
  // it keeps the page from reflowing and the scrollbar from jumping on zoom.
  const canvasHeight = computeLayout(data.events, cal, fitDensity).canvasHeight;

  const viewport = document.createElement('div');
  viewport.className = 'tl-viewport';

  // Filter bar owns the mutable filter state; draw() reads it on every redraw.
  const { bar: filterBar, state: filterState } = buildFilterBar(data.events, () => draw());

  // Redraw at the current zoom + filter. The layout is computed from the *full*
  // event set, so the time axis and lane stacking stay put no matter what's
  // filtered — only marker visibility changes. anchor (or null) is the point to
  // hold fixed: { frac } = position along the timeline (0..1), { x } = px from
  // the viewport left to keep it under — so zooming feels anchored on the cursor.
  function draw(anchor?: { frac: number; x: number }) {
    const layout = computeLayout(data.events, cal, fitDensity * zoomLevel);
    const visible = (item: LayoutItem) => matchesFilters(item, filterState);
    // Always render the chart (axis, ticks, scale) regardless of how many beats
    // match — filtering only toggles marker visibility, never blanks the view.
    viewport.innerHTML = '';
    viewport.appendChild(buildCanvas(layout, canvasHeight, visible));
    api.eventCount = layout.items.filter(visible).length;
    api.contentWidth = layout.contentWidth;
    api.laneCount = layout.laneCount;
    if (anchor) viewport.scrollLeft = anchor.frac * layout.contentWidth - anchor.x;
  }

  function zoom(kind: ZoomKind, clientX?: number) {
    const vw = viewport.clientWidth || viewportWidth;
    const left = viewport.getBoundingClientRect?.().left || 0;
    const x = clientX != null ? clientX - left : vw / 2;
    const frac = api.contentWidth ? (viewport.scrollLeft + x) / api.contentWidth : 0.5;
    if (kind === 'in') zoomLevel = Math.min(maxZoom, zoomLevel * ZOOM_FACTOR);
    else if (kind === 'out') zoomLevel = Math.max(1, zoomLevel / ZOOM_FACTOR);
    else zoomLevel = 1;
    draw({ frac, x });
  }

  container.append(buildToolbar(zoom), filterBar, viewport);
  draw();
  enablePan(viewport);
  enableWheelZoom(viewport, zoom);
  enableMarkerInteraction(viewport, (source) => window.open(source, '_blank'));

  return api;
}
