// Swimlane renderer (DOM, M4). Track rows down the left gutter (expand/collapse
// tree), beats as dots on their row across a shared time axis. Reuses the pure
// swimlane layout (swimlane.ts) and the same interaction wiring as the world
// view (controls.ts) — dots are `.chart-marker`s so hover/click work unchanged.

import '../_common/common.css';
import './swimlane.css';
import { DEFAULT_CALENDAR } from '../_common/helpers/calendar.js';
import { computeSwimlaneFrom } from './helpers/swimlane-layout.js';
import { indexEvents, spanYearsOf } from '../_common/helpers/axis.js';
import { buildTrackTree, DEFAULT_CATEGORIES } from './helpers/tracks.js';
import { makeMatcher } from '../_common/helpers/filters.js';
import { buildFilterBar } from '../_common/components/filterbar.js';
import type { SettingsSection } from '../_common/components/settingspanel.js';
import { enablePan, enableWheelZoom, enableMarkerInteraction } from '../_common/components/controls.js';
import { barHeightFor } from '../_common/helpers/cluster.js';
import { ZOOM_FACTOR, ZOOM_MAX, MARGIN, GUTTER_W, SWIM_TOP_PAD, MONTH_VIEW_FRAC, SWIM_BAR_MAX, SWIM_BAR_MIN, SWIM_BAR_FULL_COUNT } from '../_common/constants.js';
import type { PanViewport, SwimBar, SwimItem, SwimLayout, SwimRow, TimelineEvent, Tick, TimelineData, ZoomKind } from '../_common/types.js';

// Per-row bar height for a member count (swimlane sizing — fits inside a row).
const swimBarHeight = (count: number): number => barHeightFor(count, SWIM_BAR_MAX, SWIM_BAR_MIN, SWIM_BAR_FULL_COUNT);

interface SwimApi {
  eventCount: number;
  rowCount: number;
  contentWidth: number;
  // Chrome nodes (zoom toolbar, filter bar) for the host's settings panel.
  controls: SettingsSection[];
}

// A dot's persistent structure + its zoom-invariant data (top/colour/weight,
// dataset, source). Only `y` (row), colour and weight live here — all fixed for
// a given collapse state — so a zoom reuses the node and just moves it. The
// inline label is owned by positionDot (it appears/disappears with the density
// gate).
function createDot(item: SwimItem): HTMLDivElement {
  const marker = document.createElement('div');
  marker.className = `chart-marker chart-swim-marker ${item.weight}`;
  marker.style.top = `${item.y}px`;
  marker.dataset.label = item.label;
  marker.dataset.date = item.date;
  marker.dataset.track = item.track;
  if (item.source) {
    marker.dataset.source = item.source;
    marker.classList.add('has-source');
  }
  const dot = document.createElement('div');
  dot.className = 'chart-dot';
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
  marker.classList.toggle('chart-hidden', !visible);
  let label = labels[idx];
  if (item.showLabel) {
    if (!label) {
      label = document.createElement('div');
      label.className = 'chart-swim-label';
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
  line.className = 'chart-swim-grid';
  line.style.left = `${tick.x}px`;
  const label = document.createElement('div');
  label.className = 'chart-swim-ticklabel';
  label.style.left = `${tick.x}px`;
  label.textContent = tick.label;
  return [line, label];
}

// A per-row density bar (LOD), centered on its row at (x, y). Fixed geometry; the
// height/count are filter-dependent and set by styleSwimBar.
function buildSwimBar(bar: SwimBar): HTMLDivElement {
  const el = document.createElement('div');
  el.className = 'chart-swim-bar';
  el.style.left = `${bar.x}px`;
  el.style.top = `${bar.y}px`;
  el.style.background = `var(${bar.colorVar})`;
  el.dataset.centerx = String(bar.x);
  return el;
}

// Size a bar to its filter-matching members: height ∝ matched count, hidden when
// none match, badged when a matched member is major. Geometry stays fixed
// (scale-stable). Returns the matched count for the caller's total.
function styleSwimBar(el: HTMLElement, bar: SwimBar, events: readonly TimelineEvent[], match: (e: TimelineEvent) => boolean): number {
  let count = 0;
  let hasMajor = false;
  for (const m of bar.members) {
    const e = events[m];
    if (match(e)) {
      count++;
      if (e.major) hasMajor = true;
    }
  }
  if (count === 0) {
    el.classList.add('chart-hidden');
    return 0;
  }
  el.classList.remove('chart-hidden');
  el.classList.toggle('has-major', hasMajor);
  el.style.height = `${swimBarHeight(count)}px`;
  el.dataset.count = String(count);
  el.title = `${count} beats${hasMajor ? ' (incl. a major)' : ''} · click to zoom in`;
  return count;
}

// Builds the full canvas (ticks, bands, per-row density bars, dots) and returns the
// dot nodes + bar nodes (layout order) and the visible count. The individual/bar
// split changes with zoom (buckets dissolve), so the canvas is rebuilt each draw.
interface BuiltSwimCanvas {
  canvas: HTMLDivElement;
  markers: HTMLElement[];
  bars: HTMLElement[];
  visibleCount: number;
}
function buildCanvas(layout: SwimLayout, events: readonly TimelineEvent[], match: (e: TimelineEvent) => boolean): BuiltSwimCanvas {
  const canvas = document.createElement('div');
  canvas.className = 'chart-swim-canvas';
  canvas.style.width = `${layout.contentWidth}px`;
  canvas.style.height = `${layout.totalHeight}px`;

  for (const tick of layout.ticks) canvas.append(...tickNodesFor(tick));
  // Faint row bands so dots read as sitting on a lane.
  for (const row of layout.rows) {
    const band = document.createElement('div');
    band.className = `chart-swim-band${row.depth ? ' is-child' : ''}`;
    band.style.top = `${row.y}px`;
    band.style.height = `${row.height}px`;
    canvas.appendChild(band);
  }

  let visibleCount = 0;
  const bars: HTMLElement[] = [];
  for (const bar of layout.bars) {
    const el = buildSwimBar(bar);
    bars.push(el);
    canvas.appendChild(el);
    visibleCount += styleSwimBar(el, bar, events, match);
  }

  const markers: HTMLElement[] = [];
  const labels: (HTMLElement | null)[] = [];
  layout.items.forEach((item, i) => {
    const marker = createDot(item);
    markers.push(marker);
    labels.push(null);
    canvas.appendChild(marker);
    const vis = match(item);
    positionDot(marker, item, labels, i, vis);
    if (vis) visibleCount++;
  });
  return { canvas, markers, bars, visibleCount };
}

function buildGutter(rows: SwimRow[], height: number, onToggle: (category: string) => void): HTMLDivElement {
  const gutter = document.createElement('div');
  gutter.className = 'chart-swim-gutter';
  gutter.style.height = `${height}px`;

  const head = document.createElement('div');
  head.className = 'chart-swim-gutter-head';
  head.style.height = `${SWIM_TOP_PAD}px`;
  head.textContent = 'Tracks';
  gutter.appendChild(head);

  for (const row of rows) {
    // Toggleable rows are a full-width button so the whole label is the hit area,
    // not just the arrow. Leaf rows stay plain divs.
    const label = document.createElement(row.hasToggle ? 'button' : 'div');
    label.className = `chart-swim-rowlabel depth-${row.depth}${row.hasToggle ? ' is-toggle' : ''}`;
    label.style.top = `${row.y}px`;
    label.style.height = `${row.height}px`;

    // Name first (so every row's colour bar + text align at the same x),
    // toggle arrow pushed to the right edge on toggleable rows.
    const text = document.createElement('span');
    text.className = 'chart-swim-rowname';
    text.textContent = row.label;
    text.style.setProperty('--row-color', `var(${row.colorVar})`);
    label.appendChild(text);

    if (row.hasToggle) {
      (label as HTMLButtonElement).type = 'button';
      label.addEventListener('click', () => onToggle(row.category));
      const tw = document.createElement('span');
      tw.className = 'chart-swim-toggle';
      tw.setAttribute('aria-hidden', 'true');
      tw.textContent = row.collapsed ? '▸' : '▾';
      label.appendChild(tw);
    }
    gutter.appendChild(label);
  }
  return gutter;
}

export function renderSwimlane(container: HTMLElement, data: TimelineData): SwimApi {
  const cal = data.calendar || DEFAULT_CALENDAR;
  const viewportWidth = container.clientWidth || 800;
  container.innerHTML = '';
  container.classList.add('chart-root');

  // Initial collapse state from the configured defaults (only bites a category
  // that actually has children — see computeSwimlane).
  const collapsed = new Set(DEFAULT_CATEGORIES.filter((c) => c.collapsed).map((c) => c.key));

  // Sort + day-index every event exactly once; every zoom/collapse layout reuses
  // it (only the scale and row stacking change downstream).
  const idx = indexEvents(data.events, cal);
  if (idx.events.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'chart-empty';
    empty.textContent = 'No events to show.';
    container.appendChild(empty);
    return { eventCount: 0, rowCount: 0, contentWidth: 0, controls: [] };
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
  const api: SwimApi = { eventCount: 0, rowCount: 0, contentWidth: 0, controls: [] };

  const swim = document.createElement('div') as PanViewport;
  swim.className = 'chart-swim';

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
  // Nodes from the last draw, in layout order. A filter edit reuses them to retoggle
  // dot visibility / rescale bars without a relayout; a zoom rebuilds them (the
  // individual/bar split changes as buckets dissolve).
  let markerNodes: HTMLElement[] = [];
  let barNodes: HTMLElement[] = [];

  // Filtering keeps the layout fixed. Dots toggle .chart-hidden in place; per-row
  // density bars re-count their matching members and rescale (height/badge/hide) so
  // the histogram reflects the filtered set. eventCount = matching dots + matching
  // bar members.
  function applyVisibility() {
    if (!currentLayout) return;
    const match = makeMatcher(filterState);
    let count = 0;
    currentLayout.items.forEach((item, i) => {
      const vis = match(item);
      markerNodes[i]?.classList.toggle('chart-hidden', !vis);
      if (vis) count++;
    });
    currentLayout.bars.forEach((bar, i) => {
      if (barNodes[i]) count += styleSwimBar(barNodes[i], bar, idx.events, match);
    });
    api.eventCount = count;
  }

  const { bar: filterBar, search, chips, state: filterState } = buildFilterBar(data.events, applyVisibility);

  // Rebuild the gutter + canvas for the current density/collapse state. Both zoom
  // and collapse change the layout (the individual/bar split shifts with zoom, rows
  // shift with collapse), so the canvas is rebuilt each draw — cheap, since the
  // crowd rolls into a bounded number of bars. Listeners live on `swim`, so swapping
  // its children leaves pan/zoom/hover intact.
  function draw(anchor?: { frac: number; x: number }) {
    const layout = layoutAt(fitDensity * zoomLevel);
    currentLayout = layout;
    const match = makeMatcher(filterState);

    const built = buildCanvas(layout, idx.events, match);
    markerNodes = built.markers;
    barNodes = built.bars;
    swim.replaceChildren(buildGutter(layout.rows, layout.totalHeight, toggle), built.canvas);

    api.eventCount = built.visibleCount;
    api.rowCount = layout.rows.length;
    api.contentWidth = layout.contentWidth;
    if (anchor) swim.scrollLeft = anchor.frac * layout.contentWidth - anchor.x;
  }

  function toggle(category: string) {
    if (collapsed.has(category)) collapsed.delete(category);
    else collapsed.add(category);
    draw();
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
    else zoomLevel = Math.max(1, zoomLevel / ZOOM_FACTOR);
  }

  // Density-bar click: discrete zoom-in, draw immediately.
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

  // Click a density bar → zoom in, anchored on the cluster. Skipped after a pan-drag.
  swim.addEventListener('click', (e) => {
    if (swim._tlDragged) return;
    const bar = (e.target as Element | null)?.closest<HTMLElement>('.chart-swim-bar');
    if (!bar) return;
    const cx = Number(bar.dataset.centerx);
    const left = swim.getBoundingClientRect?.().left || 0;
    zoom('in', left + (cx - swim.scrollLeft));
  });

  // The filter controls are wired to this chart's state but handed to the host
  // via api.controls, which hoists them into the header settings panel under
  // their own labels — leaving the canvas to fill the full height. Zoom is
  // wheel-only (+ density-bar click).
  api.controls = [
    { label: 'Search', node: search },
    { label: 'Filter', node: chips },
  ];
  container.append(filterBar, swim);
  draw();
  enablePan(swim);
  enableWheelZoom(swim, zoomWheel);
  enableMarkerInteraction(swim, (source) => window.open(source, '_blank'));
  return api;
}

// Re-exported so a host can seed/inspect the tree without importing tracks.js.
export { buildTrackTree };
