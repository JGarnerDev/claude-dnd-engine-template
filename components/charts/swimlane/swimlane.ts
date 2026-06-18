// Swimlane renderer (DOM, M4). Track rows down the left gutter (expand/collapse
// tree), beats as dots on their row across a shared time axis. Reuses the pure
// swimlane layout (swimlane.ts) and the same interaction wiring as the world
// view (controls.ts) — dots are `.tl-marker`s so hover/click work unchanged.

import { DEFAULT_CALENDAR } from '../_common/helpers/calendar.js';
import { computeSwimlane } from './helpers/swimlane-layout.js';
import { buildTrackTree, DEFAULT_CATEGORIES } from './helpers/tracks.js';
import { matchesFilters } from '../_common/helpers/filters.js';
import { buildFilterBar } from '../_common/components/filterbar.js';
import { enablePan, enableWheelZoom, enableMarkerInteraction } from '../_common/components/controls.js';
import { ZOOM_FACTOR, ZOOM_MAX, MARGIN, GUTTER_W, SWIM_TOP_PAD } from '../_common/constants.js';
import type { PanViewport, SwimItem, SwimLayout, SwimRow, TimelineData, ZoomKind } from '../_common/types.js';

interface SwimApi {
  eventCount: number;
  rowCount: number;
  contentWidth: number;
}

function buildDot(item: SwimItem): HTMLDivElement {
  const marker = document.createElement('div');
  marker.className = `tl-marker tl-swim-marker ${item.weight}`;
  marker.style.left = `${item.x}px`;
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
  if (item.showLabel) {
    const label = document.createElement('div');
    label.className = 'tl-swim-label';
    label.textContent = item.weight === 'is-major' ? `★ ${item.label}` : item.label;
    label.style.maxWidth = `${item.labelMaxWidth}px`; // responsive: full when there's room, ellipsis only when tight
    marker.appendChild(label);
  }
  return marker;
}

function buildCanvas(layout: SwimLayout, isVisible: (i: SwimItem) => boolean): HTMLDivElement {
  const canvas = document.createElement('div');
  canvas.className = 'tl-swim-canvas';
  canvas.style.width = `${layout.contentWidth}px`;
  canvas.style.height = `${layout.totalHeight}px`;

  for (const tick of layout.ticks) {
    const line = document.createElement('div');
    line.className = 'tl-swim-grid';
    line.style.left = `${tick.x}px`;
    const label = document.createElement('div');
    label.className = 'tl-swim-ticklabel';
    label.style.left = `${tick.x}px`;
    label.textContent = tick.label;
    canvas.append(line, label);
  }
  // Faint row bands so dots read as sitting on a lane.
  for (const row of layout.rows) {
    const band = document.createElement('div');
    band.className = `tl-swim-band${row.depth ? ' is-child' : ''}`;
    band.style.top = `${row.y}px`;
    band.style.height = `${row.height}px`;
    canvas.appendChild(band);
  }
  for (const item of layout.items) {
    const dot = buildDot(item);
    if (!isVisible(item)) dot.classList.add('tl-hidden');
    canvas.appendChild(dot);
  }
  return canvas;
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

  const probe = computeSwimlane(data.events, collapsed, cal);
  if (probe.isEmpty) {
    const empty = document.createElement('div');
    empty.className = 'tl-empty';
    empty.textContent = 'No events to show.';
    container.appendChild(empty);
    return { eventCount: 0, rowCount: 0, contentWidth: 0 };
  }

  // Fit so the gutter + canvas exactly fill the viewport at zoom 1. The extra
  // -2px slack absorbs contentWidth's Math.ceil rounding so gutter + canvas can't
  // round a hair past the viewport and trigger a phantom horizontal scrollbar.
  const fitDensity = Math.max(1, (viewportWidth - GUTTER_W - MARGIN * 2 - 2) / probe.spanYears);
  let zoomLevel = 1;
  const api: SwimApi = { eventCount: 0, rowCount: 0, contentWidth: 0 };

  const swim = document.createElement('div') as PanViewport;
  swim.className = 'tl-swim';

  const { bar: filterBar, state: filterState } = buildFilterBar(data.events, () => draw());

  function draw(anchor?: { frac: number; x: number }) {
    const layout = computeSwimlane(data.events, collapsed, cal, fitDensity * zoomLevel);
    const visible = (i: SwimItem) => matchesFilters(i, filterState);
    // Gutter (sticky left) + canvas as the two scroll children. Listeners live
    // on `swim`, so swapping its children leaves pan/zoom/hover intact.
    swim.replaceChildren(buildGutter(layout.rows, layout.totalHeight, toggle), buildCanvas(layout, visible));
    api.eventCount = layout.items.filter(visible).length;
    api.rowCount = layout.rows.length;
    api.contentWidth = layout.contentWidth;
    if (anchor) swim.scrollLeft = anchor.frac * layout.contentWidth - anchor.x;
  }

  function toggle(category: string) {
    if (collapsed.has(category)) collapsed.delete(category);
    else collapsed.add(category);
    draw();
  }

  function zoom(kind: ZoomKind, clientX?: number) {
    const vw = swim.clientWidth || viewportWidth;
    const left = swim.getBoundingClientRect?.().left || 0;
    const x = clientX != null ? clientX - left : vw / 2;
    const frac = api.contentWidth ? (swim.scrollLeft + x) / api.contentWidth : 0.5;
    if (kind === 'in') zoomLevel = Math.min(ZOOM_MAX, zoomLevel * ZOOM_FACTOR);
    else if (kind === 'out') zoomLevel = Math.max(1, zoomLevel / ZOOM_FACTOR);
    else zoomLevel = 1;
    draw({ frac, x });
  }

  container.append(buildToolbar(zoom), filterBar, swim);
  draw();
  enablePan(swim);
  enableWheelZoom(swim, zoom);
  enableMarkerInteraction(swim, (source) => window.open(source, '_blank'));
  return api;
}

// Re-exported so a host can seed/inspect the tree without importing tracks.js.
export { buildTrackTree };
