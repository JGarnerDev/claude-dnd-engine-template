// Swimlane renderer (DOM, M4). Track rows down the left gutter (expand/collapse
// tree), beats as dots on their row across a shared time axis. Reuses the pure
// swimlane layout (swimlane.ts) and the same interaction wiring as the world
// view (controls.ts) — dots are `.tl-marker`s so hover/click work unchanged.

import { DEFAULT_CALENDAR } from '../_common/helpers/calendar.js';
import { computeSwimlaneFrom } from './helpers/swimlane-layout.js';
import { indexEvents, spanYearsOf } from '../_common/helpers/axis.js';
import { buildTrackTree, DEFAULT_CATEGORIES } from './helpers/tracks.js';
import { makeMatcher } from '../_common/helpers/filters.js';
import { buildFilterBar } from '../_common/components/filterbar.js';
import { enablePan, enableWheelZoom, enableMarkerInteraction } from '../_common/components/controls.js';
import { ZOOM_FACTOR, ZOOM_MAX, MARGIN, GUTTER_W, SWIM_TOP_PAD, MONTH_VIEW_FRAC } from '../_common/constants.js';
import type { PanViewport, SwimItem, SwimLayout, SwimRow, Tick, TimelineData, ZoomKind } from '../_common/types.js';

interface SwimApi {
  eventCount: number;
  rowCount: number;
  contentWidth: number;
}

// A dot's persistent structure + its zoom-invariant data (top/colour/weight,
// dataset, source). Only `y` (row), colour and weight live here — all fixed for
// a given collapse state — so a zoom reuses the node and just moves it. The
// inline label is owned by positionDot (it appears/disappears with the density
// gate).
function createDot(item: SwimItem): HTMLDivElement {
  const marker = document.createElement('div');
  marker.className = `tl-marker tl-swim-marker ${item.weight}`;
  marker.style.top = `${item.y}px`;
  marker.dataset.label = item.label;
  marker.dataset.date = item.date;
  marker.dataset.track = item.track;
  if (item.source) {
    marker.dataset.source = item.source;
    marker.classList.add('has-source');
  }
  const dot = document.createElement('div');
  dot.className = 'tl-dot';
  dot.style.background = `var(${item.colorVar})`;
  marker.appendChild(dot);
  return marker;
}

// Apply per-zoom state to an existing dot: x, visibility, and the density-gated
// inline label (created/removed as the gate flips, max-width retuned each zoom).
// labels[idx] caches the label node so we don't query for it. Label text is
// density-independent, so it's set once on creation.
function positionDot(
  marker: HTMLElement,
  item: SwimItem,
  labels: (HTMLElement | null)[],
  idx: number,
  visible: boolean,
): void {
  marker.style.left = `${item.x}px`;
  marker.classList.toggle('tl-hidden', !visible);
  let label = labels[idx];
  if (item.showLabel) {
    if (!label) {
      label = document.createElement('div');
      label.className = 'tl-swim-label';
      label.textContent = item.weight === 'is-major' ? `★ ${item.label}` : item.label;
      marker.appendChild(label);
      labels[idx] = label;
    }
    label.style.maxWidth = `${item.labelMaxWidth}px`; // responsive: full when there's room, ellipsis only when tight
  } else if (label) {
    label.remove();
    labels[idx] = null;
  }
}

function tickNodesFor(tick: Tick): [HTMLDivElement, HTMLDivElement] {
  const line = document.createElement('div');
  line.className = 'tl-swim-grid';
  line.style.left = `${tick.x}px`;
  const label = document.createElement('div');
  label.className = 'tl-swim-ticklabel';
  label.style.left = `${tick.x}px`;
  label.textContent = tick.label;
  return [line, label];
}

// Returns the canvas plus the dot nodes, their label cache, the tick nodes (so a
// zoom can swap them without disturbing bands/dots) and the visible count. Built
// fresh on first render and on collapse (rows change); a plain zoom reuses these.
interface BuiltSwimCanvas {
  canvas: HTMLDivElement;
  markers: HTMLElement[];
  labels: (HTMLElement | null)[];
  ticks: HTMLElement[];
  visibleCount: number;
}
function buildCanvas(layout: SwimLayout, match: (i: SwimItem) => boolean): BuiltSwimCanvas {
  const canvas = document.createElement('div');
  canvas.className = 'tl-swim-canvas';
  canvas.style.width = `${layout.contentWidth}px`;
  canvas.style.height = `${layout.totalHeight}px`;

  const ticks: HTMLElement[] = [];
  for (const tick of layout.ticks) {
    const [line, label] = tickNodesFor(tick);
    canvas.append(line, label);
    ticks.push(line, label);
  }
  // Faint row bands so dots read as sitting on a lane.
  for (const row of layout.rows) {
    const band = document.createElement('div');
    band.className = `tl-swim-band${row.depth ? ' is-child' : ''}`;
    band.style.top = `${row.y}px`;
    band.style.height = `${row.height}px`;
    canvas.appendChild(band);
  }
  const markers: HTMLElement[] = [];
  const labels: (HTMLElement | null)[] = [];
  let visibleCount = 0;
  layout.items.forEach((item, i) => {
    const marker = createDot(item);
    markers.push(marker);
    labels.push(null);
    canvas.appendChild(marker);
    const vis = match(item);
    positionDot(marker, item, labels, i, vis);
    if (vis) visibleCount++;
  });
  return { canvas, markers, labels, ticks, visibleCount };
}

function buildGutter(rows: SwimRow[], height: number, onToggle: (category: string) => void): HTMLDivElement {
  const gutter = document.createElement('div');
  gutter.className = 'tl-swim-gutter';
  gutter.style.height = `${height}px`;

  const head = document.createElement('div');
  head.className = 'tl-swim-gutter-head';
  head.style.height = `${SWIM_TOP_PAD}px`;
  head.textContent = 'Tracks';
  gutter.appendChild(head);

  for (const row of rows) {
    // Toggleable rows are a full-width button so the whole label is the hit area,
    // not just the arrow. Leaf rows stay plain divs.
    const label = document.createElement(row.hasToggle ? 'button' : 'div');
    label.className = `tl-swim-rowlabel depth-${row.depth}${row.hasToggle ? ' is-toggle' : ''}`;
    label.style.top = `${row.y}px`;
    label.style.height = `${row.height}px`;

    // Name first (so every row's colour bar + text align at the same x),
    // toggle arrow pushed to the right edge on toggleable rows.
    const text = document.createElement('span');
    text.className = 'tl-swim-rowname';
    text.textContent = row.label;
    text.style.setProperty('--row-color', `var(${row.colorVar})`);
    label.appendChild(text);

    if (row.hasToggle) {
      (label as HTMLButtonElement).type = 'button';
      label.addEventListener('click', () => onToggle(row.category));
      const tw = document.createElement('span');
      tw.className = 'tl-swim-toggle';
      tw.setAttribute('aria-hidden', 'true');
      tw.textContent = row.collapsed ? '▸' : '▾';
      label.appendChild(tw);
    }
    gutter.appendChild(label);
  }
  return gutter;
}

function buildToolbar(onZoom: (kind: ZoomKind) => void): HTMLDivElement {
  const bar = document.createElement('div');
  bar.className = 'tl-toolbar';
  const mk = (label: string, title: string, kind: ZoomKind) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'tl-zoom-btn';
    b.textContent = label;
    b.title = title;
    b.addEventListener('click', () => onZoom(kind));
    return b;
  };
  bar.append(mk('−', 'Zoom out', 'out'), mk('Reset', 'Reset zoom', 'reset'), mk('+', 'Zoom in', 'in'));
  return bar;
}

export function renderSwimlane(container: HTMLElement, data: TimelineData): SwimApi {
  const cal = data.calendar || DEFAULT_CALENDAR;
  const viewportWidth = container.clientWidth || 800;
  container.innerHTML = '';
  container.classList.add('tl-root');

  // Initial collapse state from the configured defaults (only bites a category
  // that actually has children — see computeSwimlane).
  const collapsed = new Set(DEFAULT_CATEGORIES.filter((c) => c.collapsed).map((c) => c.key));

  // Sort + day-index every event exactly once; every zoom/collapse layout reuses
  // it (only the scale and row stacking change downstream).
  const idx = indexEvents(data.events, cal);
  if (idx.events.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'tl-empty';
    empty.textContent = 'No events to show.';
    container.appendChild(empty);
    return { eventCount: 0, rowCount: 0, contentWidth: 0 };
  }

  // Track tree depends only on events (+ config) — zoom- and collapse-invariant.
  // Build it once and feed every layout; collapse just re-stacks the rows.
  const tree = buildTrackTree(data.events);

  // span is density-invariant — derive it from the indexed events, no probe layout.
  const spanYears = spanYearsOf(idx);
  // Fit so the gutter + canvas exactly fill the viewport at zoom 1. The extra
  // -2px slack absorbs contentWidth's Math.ceil rounding so gutter + canvas can't
  // round a hair past the viewport and trigger a phantom horizontal scrollbar.
  const fitDensity = Math.max(1, (viewportWidth - GUTTER_W - MARGIN * 2 - 2) / spanYears);
  // Allow zooming until one month fills ~MONTH_VIEW_FRAC of the canvas area (the
  // viewport minus the gutter), like the world view.
  const canvasWidth = Math.max(1, viewportWidth - GUTTER_W);
  const monthsPerYear = cal.months.length || 12;
  const maxZoom = Math.max(ZOOM_MAX, (MONTH_VIEW_FRAC * canvasWidth * monthsPerYear) / fitDensity);
  let zoomLevel = 1;
  const api: SwimApi = { eventCount: 0, rowCount: 0, contentWidth: 0 };

  const swim = document.createElement('div') as PanViewport;
  swim.className = 'tl-swim';

  // Memoize per (density, collapse state). The layout depends on zoom and which
  // categories are collapsed, but never on the filter — so filtering reuses the
  // current layout and only retoggles visibility.
  const layoutCache = new Map<string, SwimLayout>();
  const layoutAt = (pxPerYear: number): SwimLayout => {
    const key = `${pxPerYear}|${[...collapsed].sort().join(',')}`;
    let layout = layoutCache.get(key);
    if (!layout) {
      layout = computeSwimlaneFrom(idx, tree, collapsed, cal, pxPerYear);
      layoutCache.set(key, layout);
    }
    return layout;
  };

  let currentLayout: SwimLayout | null = null;
  // Persistent nodes. The gutter + bands depend only on the collapse state (not
  // zoom), so a plain zoom keeps them and just reflows the dots + ticks; a collapse
  // toggle does a full rebuild. markerNodes also lets a filter edit retoggle
  // visibility without re-scanning the DOM.
  let canvasEl: HTMLDivElement | null = null;
  let markerNodes: HTMLElement[] = [];
  let labelNodes: (HTMLElement | null)[] = [];
  let tickNodes: HTMLElement[] = [];

  // Filter-only change: zip the cached dot nodes against layout.items and
  // retoggle .tl-hidden in place — no relayout, no canvas rebuild. The matcher
  // normalizes the query once, not per item.
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

  const { bar: filterBar, state: filterState } = buildFilterBar(data.events, applyVisibility);

  // draw(anchor, full). full=true (first render + collapse toggle) rebuilds the
  // gutter, bands and dots from scratch — rows changed. full=false (zoom) keeps
  // the gutter + bands and only swaps ticks (granularity) + reflows the persistent
  // dots (x/label/visibility), since rows and y are zoom-invariant.
  function draw(anchor?: { frac: number; x: number }, full = false) {
    const layout = layoutAt(fitDensity * zoomLevel);
    currentLayout = layout;
    const match = makeMatcher(filterState);

    if (full || !canvasEl) {
      // Gutter (sticky left) + canvas as the two scroll children. Listeners live
      // on `swim`, so swapping its children leaves pan/zoom/hover intact.
      const built = buildCanvas(layout, match);
      canvasEl = built.canvas;
      markerNodes = built.markers;
      labelNodes = built.labels;
      tickNodes = built.ticks;
      swim.replaceChildren(buildGutter(layout.rows, layout.totalHeight, toggle), built.canvas);
      api.eventCount = built.visibleCount;
    } else {
      canvasEl.style.width = `${layout.contentWidth}px`;
      // Swap ticks (density-dependent); re-insert before the first band so the
      // grid stays painted behind bands + dots.
      for (const n of tickNodes) n.remove();
      tickNodes = [];
      const before = canvasEl.firstChild;
      for (const tick of layout.ticks) {
        const [line, label] = tickNodesFor(tick);
        canvasEl.insertBefore(line, before);
        canvasEl.insertBefore(label, before);
        tickNodes.push(line, label);
      }
      // Reflow the persistent dots in place.
      let count = 0;
      layout.items.forEach((item, i) => {
        const vis = match(item);
        positionDot(markerNodes[i], item, labelNodes, i, vis);
        if (vis) count++;
      });
      api.eventCount = count;
    }

    api.rowCount = layout.rows.length;
    api.contentWidth = layout.contentWidth;
    if (anchor) swim.scrollLeft = anchor.frac * layout.contentWidth - anchor.x;
  }

  function toggle(category: string) {
    if (collapsed.has(category)) collapsed.delete(category);
    else collapsed.add(category);
    draw(undefined, true); // rows change → full rebuild
  }

  function anchorAt(clientX?: number) {
    const vw = swim.clientWidth || viewportWidth;
    const left = swim.getBoundingClientRect?.().left || 0;
    const x = clientX != null ? clientX - left : vw / 2;
    const frac = api.contentWidth ? (swim.scrollLeft + x) / api.contentWidth : 0.5;
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

  // Wheel: coalesce a fling's many events into one draw per frame; anchor is
  // captured from the pre-batch layout, steps accumulate into zoomLevel.
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

  container.append(buildToolbar(zoom), filterBar, swim);
  draw();
  enablePan(swim);
  enableWheelZoom(swim, zoomWheel);
  enableMarkerInteraction(swim, (source) => window.open(source, '_blank'));
  return api;
}

// Re-exported so a host can seed/inspect the tree without importing tracks.js.
export { buildTrackTree };
