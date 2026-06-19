// Timeline renderer (DOM assembly only). All positioning math lives in
// layout.js; this file turns a computed layout into elements, wires a zoom
// toolbar, and attaches pan. Depends on the DOM, so its test runs under
// happy-dom.

import { DEFAULT_CALENDAR } from '../_common/helpers/calendar.js';
import { computeLayoutFrom } from './helpers/layout.js';
import { indexEvents, spanYearsOf } from '../_common/helpers/axis.js';
import { ZOOM_FACTOR, ZOOM_MAX, MARGIN, TARGET_PX_PER_BEAT } from '../_common/constants.js';
import { enablePan, enableWheelZoom, enableMarkerInteraction } from '../_common/components/controls.js';
import { matchesFilters } from '../_common/helpers/filters.js';
import { buildFilterBar } from '../_common/components/filterbar.js';
import type { Layout, LayoutItem, Tick, TimelineData, ZoomKind } from '../_common/types.js';

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

  // Sort + day-index every event exactly once; every zoom level reuses this.
  const idx = indexEvents(data.events, cal);
  if (idx.events.length === 0) {
    container.appendChild(buildEmpty('No events to show.'));
    return { eventCount: 0, contentWidth: 0, laneCount: 0 };
  }

  // span + beat density are density-invariant, so derive them from the indexed
  // events without laying out a full chart first.
  const spanYears = spanYearsOf(idx);
  // Fit density: px/year that makes the whole span exactly fill the viewport.
  // Zoom level 1 == fit (whole timeline visible); zooming multiplies from here,
  // so every step changes the layout and reset always returns to full view.
  const fitDensity = Math.max(1, (viewportWidth - MARGIN * 2) / spanYears);
  // Deepest zoom adapts to beat density: dense/long timelines need a higher cap
  // than 8× of a tiny fit density to spread beats to ~TARGET_PX_PER_BEAT apart.
  // Sparse timelines keep the ZOOM_MAX floor.
  const beatsPerYear = idx.events.length / spanYears;
  const targetDensity = beatsPerYear * TARGET_PX_PER_BEAT;
  const maxZoom = Math.max(ZOOM_MAX, targetDensity / fitDensity);
  let zoomLevel = 1;
  const api: TimelineApi = { eventCount: 0, contentWidth: 0, laneCount: 0 };

  // Memoize the layout per density. Filtering never changes geometry (see
  // applyVisibility), so a layout is computed at most once per distinct zoom
  // level and reused across redraws — the fit layout below is the first cache
  // entry, reused verbatim by the initial draw() at zoomLevel 1.
  const layoutCache = new Map<number, Layout>();
  const layoutAt = (pxPerYear: number): Layout => {
    let layout = layoutCache.get(pxPerYear);
    if (!layout) {
      layout = computeLayoutFrom(idx, cal, pxPerYear);
      layoutCache.set(pxPerYear, layout);
    }
    return layout;
  };

  // Lock canvas height to the fit-zoom layout. Lanes only ever decrease as we
  // zoom in (events spread, fewer collisions), so fit is the tallest — pinning
  // it keeps the page from reflowing and the scrollbar from jumping on zoom.
  const canvasHeight = layoutAt(fitDensity).canvasHeight;

  const viewport = document.createElement('div');
  viewport.className = 'tl-viewport';

  let currentLayout: Layout | null = null;

  // Filtering only toggles marker visibility — the layout (axis, ticks, lane
  // stacking) is identical for any filter, so this never recomputes or rebuilds
  // the canvas. Markers render in layout.items order, so we can zip the live
  // nodes against the items to retoggle .tl-hidden in place.
  function applyVisibility() {
    if (!currentLayout) return;
    const markers = viewport.querySelectorAll<HTMLElement>('.tl-marker');
    let count = 0;
    currentLayout.items.forEach((item, i) => {
      const vis = matchesFilters(item, filterState);
      markers[i]?.classList.toggle('tl-hidden', !vis);
      if (vis) count++;
    });
    api.eventCount = count;
  }

  // Filter bar owns the mutable filter state; a filter edit just retoggles
  // visibility, no relayout.
  const { bar: filterBar, state: filterState } = buildFilterBar(data.events, applyVisibility);

  // Full geometry rebuild — only zoom (density change) needs it. anchor (or
  // null) is the point to hold fixed: { frac } = position along the timeline
  // (0..1), { x } = px from the viewport left to keep it under — so zooming
  // feels anchored on the cursor.
  function draw(anchor?: { frac: number; x: number }) {
    const layout = layoutAt(fitDensity * zoomLevel);
    currentLayout = layout;
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

  // The point to hold fixed under the cursor while the canvas rescales: frac =
  // fraction along the content, x = px from the viewport's left edge.
  function anchorAt(clientX?: number) {
    const vw = viewport.clientWidth || viewportWidth;
    const left = viewport.getBoundingClientRect?.().left || 0;
    const x = clientX != null ? clientX - left : vw / 2;
    const frac = api.contentWidth ? (viewport.scrollLeft + x) / api.contentWidth : 0.5;
    return { frac, x };
  }

  function applyZoom(kind: ZoomKind) {
    if (kind === 'in') zoomLevel = Math.min(maxZoom, zoomLevel * ZOOM_FACTOR);
    else if (kind === 'out') zoomLevel = Math.max(1, zoomLevel / ZOOM_FACTOR);
    else zoomLevel = 1;
  }

  // Toolbar: discrete clicks, draw immediately.
  function zoom(kind: ZoomKind, clientX?: number) {
    const anchor = anchorAt(clientX);
    applyZoom(kind);
    draw(anchor);
  }

  // Wheel: a fling fires many events per frame. Accumulate the zoom steps and
  // capture the anchor from the pre-batch layout (first event of the batch),
  // then draw once per frame — skipping the intermediate layouts the browser
  // would never paint.
  let zoomRaf = 0;
  let wheelAnchor: { frac: number; x: number } | undefined;
  function zoomWheel(kind: ZoomKind, clientX?: number) {
    if (!zoomRaf) wheelAnchor = anchorAt(clientX);
    applyZoom(kind);
    if (!zoomRaf) {
      zoomRaf = requestAnimationFrame(() => {
        zoomRaf = 0;
        draw(wheelAnchor);
        wheelAnchor = undefined;
      });
    }
  }

  container.append(buildToolbar(zoom), filterBar, viewport);
  draw();
  enablePan(viewport);
  enableWheelZoom(viewport, zoomWheel);
  enableMarkerInteraction(viewport, (source) => window.open(source, '_blank'));

  return api;
}
