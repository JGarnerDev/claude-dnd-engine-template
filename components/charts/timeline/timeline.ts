// Timeline renderer (DOM assembly only). All positioning math lives in
// layout.js; this file turns a computed layout into elements, wires a zoom
// toolbar, and attaches pan. Depends on the DOM, so its test runs under
// happy-dom.

import { DEFAULT_CALENDAR } from '../_common/helpers/calendar.js';
import { computeLayoutFrom } from './helpers/layout.js';
import { indexEvents, spanYearsOf } from '../_common/helpers/axis.js';
import { ZOOM_FACTOR, ZOOM_MAX, MARGIN, TARGET_PX_PER_BEAT } from '../_common/constants.js';
import { enablePan, enableWheelZoom, enableMarkerInteraction } from '../_common/components/controls.js';
import { makeMatcher } from '../_common/helpers/filters.js';
import { buildFilterBar } from '../_common/components/filterbar.js';
import type { Layout, LayoutItem, Tick, TimelineData, ZoomKind } from '../_common/types.js';

// Mutable handle returned to the caller; tests read these counts.
interface TimelineApi {
  eventCount: number;
  contentWidth: number;
  laneCount: number;
}

// Create a marker's persistent structure + its zoom-invariant data (track/label/
// date/source, full text). Geometry that changes with zoom (x/offset/side/bare)
// is applied separately by positionMarker, so the node can be reused across zoom
// levels instead of torn down and rebuilt. The event set is fixed per render, so
// these are built once and repositioned thereafter.
function createMarker(item: LayoutItem): HTMLDivElement {
  const marker = document.createElement('div');
  marker.dataset.track = item.track;
  marker.dataset.label = item.label; // full, unclamped — hover shows it all
  marker.dataset.date = item.date;
  if (item.source) marker.dataset.source = item.source;

  const dot = document.createElement('div');
  dot.className = 'tl-dot';
  const leader = document.createElement('div');
  leader.className = 'tl-leader';
  const label = document.createElement('div');
  label.className = 'tl-label';
  label.textContent = item.text; // density-independent in the world view

  marker.append(dot, leader, label);
  return marker;
}

// Apply the per-zoom geometry to an existing marker node. Rewrites the class list
// from scratch (side flips with lane repacking; tl-bare follows the density gate)
// and the position vars. visible drives .tl-hidden so a zoom under an active
// filter keeps hidden beats hidden. Cheap string + style writes, no node churn.
function positionMarker(marker: HTMLElement, item: LayoutItem, visible: boolean): void {
  // Density-gated bare dot: on the axis with no label/leader (CSS hides them);
  // the label element stays in the DOM so hover/data is intact.
  let cls = `tl-marker ${item.weight} ${item.side}`;
  if (!item.showLabel) cls += ' tl-bare';
  if (item.source) cls += ' has-source';
  if (!visible) cls += ' tl-hidden';
  marker.className = cls;
  marker.style.left = `${item.x}px`;
  marker.style.setProperty('--tl-offset', `${item.offset}px`);
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
  // Persistent canvas + nodes, built once and reused across every zoom. The event
  // set is fixed per render, so markers are created once (createMarker) and only
  // repositioned (positionMarker) on a density change — no teardown/rebuild. Only
  // the ticks (granularity changes with density) are swapped per zoom.
  let canvasEl: HTMLDivElement | null = null;
  let markerNodes: HTMLElement[] = [];
  let tickNodes: HTMLElement[] = [];

  // Filtering only toggles marker visibility — the layout (axis, ticks, lane
  // stacking) is identical for any filter, so this never recomputes or rebuilds
  // the canvas. Zip the cached nodes against layout.items to retoggle .tl-hidden
  // in place; the matcher normalizes the query once (not per item).
  function applyVisibility() {
    if (!currentLayout) return;
    const match = makeMatcher(filterState);
    let count = 0;
    currentLayout.items.forEach((item, i) => {
      const vis = match(item);
      markerNodes[i]?.classList.toggle('tl-hidden', !vis);
      if (vis) count++;
    });
    api.eventCount = count;
  }

  // Filter bar owns the mutable filter state; a filter edit just retoggles
  // visibility, no relayout.
  const { bar: filterBar, state: filterState } = buildFilterBar(data.events, applyVisibility);

  // Geometry update — only zoom (density change) calls this. anchor (or null) is
  // the point to hold fixed: { frac } = position along the timeline (0..1),
  // { x } = px from the viewport left to keep it under — so zooming feels
  // anchored on the cursor. First call builds the canvas + markers once; every
  // later call reuses those nodes, swapping only ticks and repositioning markers.
  function draw(anchor?: { frac: number; x: number }) {
    const layout = layoutAt(fitDensity * zoomLevel);
    currentLayout = layout;
    const match = makeMatcher(filterState);

    if (!canvasEl) {
      // One-time build: canvas shell + axis + the full (fixed) marker set.
      canvasEl = document.createElement('div');
      canvasEl.className = 'tl-canvas';
      canvasEl.style.height = `${canvasHeight}px`;
      const axis = document.createElement('div');
      axis.className = 'tl-axis';
      canvasEl.appendChild(axis);
      markerNodes = layout.items.map((item) => {
        const marker = createMarker(item);
        canvasEl!.appendChild(marker);
        return marker;
      });
      viewport.appendChild(canvasEl);
    }

    canvasEl.style.width = `${layout.contentWidth}px`;

    // Ticks change granularity with density, so swap them. Re-add before the
    // first marker to keep the tick grid painted behind the markers.
    for (const n of tickNodes) n.remove();
    tickNodes = [];
    const before = markerNodes[0] ?? null;
    for (const tick of layout.ticks) {
      const [line, lab] = buildTick(tick);
      canvasEl.insertBefore(line, before);
      canvasEl.insertBefore(lab, before);
      tickNodes.push(line, lab);
    }

    // Reposition the persistent markers (x/offset/side/bare) + apply visibility.
    let count = 0;
    layout.items.forEach((item, i) => {
      const vis = match(item);
      positionMarker(markerNodes[i], item, vis);
      if (vis) count++;
    });
    api.eventCount = count;
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
