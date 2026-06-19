// Timeline renderer (DOM assembly only). All positioning math lives in
// layout.js; this file turns a computed layout into elements, wires a zoom
// toolbar, and attaches pan. Depends on the DOM, so its test runs under
// happy-dom.

import '../_common/common.css';
import './timeline.css';
import { DEFAULT_CALENDAR } from '../_common/helpers/calendar.js';
import { computeLayoutFrom } from './helpers/layout.js';
import { barHeightFor } from '../_common/helpers/cluster.js';
import { indexEvents, spanYearsOf } from '../_common/helpers/axis.js';
import { ZOOM_FACTOR, ZOOM_MAX, MARGIN, TARGET_PX_PER_BEAT, MONTH_VIEW_FRAC, ZOOM_UPSCALE_FROM, ITEM_SCALE_MAX } from '../_common/constants.js';
import { enablePan, enableWheelZoom, enableMarkerInteraction } from '../_common/components/controls.js';
import { makeMatcher } from '../_common/helpers/filters.js';
import { buildFilterBar } from '../_common/components/filterbar.js';
import type { DensityBar, Layout, LayoutItem, PanViewport, Tick, TimelineData, TimelineEvent, ZoomKind } from '../_common/types.js';

// Mutable handle returned to the caller; tests read these counts.
interface TimelineApi {
  eventCount: number;
  contentWidth: number;
  laneCount: number;
}

// Build one individual marker, fully positioned. The individual set changes with
// zoom (density buckets dissolve as you zoom in), so markers are rebuilt per draw
// rather than repositioned — but the set is small (the crowd rolls into bars), so
// this is cheap. chart-bare follows the density gate; visible drives .chart-hidden.
function buildMarker(item: LayoutItem, visible: boolean): HTMLDivElement {
  const marker = document.createElement('div');
  let cls = `chart-marker ${item.weight} ${item.side}`;
  if (!item.showLabel) cls += ' chart-bare';
  if (item.source) cls += ' has-source';
  if (!visible) cls += ' chart-hidden';
  marker.className = cls;
  marker.style.left = `${item.x}px`;
  marker.style.setProperty('--chart-offset', `${item.offset}px`);
  marker.dataset.track = item.track;
  marker.dataset.label = item.label; // full, unclamped — hover shows it all
  marker.dataset.date = item.date;
  if (item.source) marker.dataset.source = item.source;

  const dot = document.createElement('div');
  dot.className = 'chart-dot';
  const leader = document.createElement('div');
  leader.className = 'chart-leader';
  const label = document.createElement('div');
  label.className = 'chart-label';
  label.textContent = item.text;

  marker.append(dot, leader, label);
  return marker;
}

// A density bar (LOD), centered on the axis. Fixed geometry (left/center x); its
// height/count are filter-dependent and set by styleBar.
function buildBar(bar: DensityBar): HTMLDivElement {
  const el = document.createElement('div');
  el.className = 'chart-bar';
  el.style.left = `${bar.centerX}px`;
  el.dataset.centerx = String(bar.centerX);
  return el;
}

// Size a bar to its filter-matching members: height ∝ matched count, badged when a
// matched member is a major, hidden when nothing matches. Returns the matched count
// so the caller can fold it into the total. Keeps bar geometry fixed (scale-stable)
// — only height/badge/visibility change with the filter.
function styleBar(el: HTMLElement, bar: DensityBar, events: readonly TimelineEvent[], match: (e: TimelineEvent) => boolean): number {
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
  el.style.height = `${barHeightFor(count)}px`;
  el.dataset.count = String(count);
  el.title = `${count} beats${hasMajor ? ' (incl. a major)' : ''} · click to zoom in`;
  return count;
}

function buildTick(tick: Tick): [HTMLDivElement, HTMLDivElement] {
  const line = document.createElement('div');
  line.className = 'chart-tick';
  line.style.left = `${tick.x}px`;
  const label = document.createElement('div');
  label.className = 'chart-tick-label';
  label.style.left = `${tick.x}px`;
  label.textContent = tick.label;
  return [line, label];
}


function buildToolbar(onZoom: (kind: ZoomKind) => void): HTMLDivElement {
  const bar = document.createElement('div');
  bar.className = 'chart-toolbar';
  const mk = (label: string, title: string, kind: ZoomKind): HTMLButtonElement => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chart-zoom-btn';
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
  empty.className = 'chart-empty';
  empty.textContent = text;
  return empty;
}

export function renderTimeline(container: HTMLElement, data: TimelineData): TimelineApi {
  const cal = data.calendar || DEFAULT_CALENDAR;
  const viewportWidth = container.clientWidth || 800;

  container.innerHTML = '';
  container.classList.add('chart-root');

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
  // Also guarantee you can zoom until one month fills ~MONTH_VIEW_FRAC of the
  // viewport: monthWidth = pxPerYear / monthsPerYear, so the density that puts a
  // month at that fraction is MONTH_VIEW_FRAC·viewportWidth·monthsPerYear.
  const monthsPerYear = cal.months.length || 12;
  const monthDensity = MONTH_VIEW_FRAC * viewportWidth * monthsPerYear;
  const maxZoom = Math.max(ZOOM_MAX, targetDensity / fitDensity, monthDensity / fitDensity);
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

  const viewport = document.createElement('div') as PanViewport;
  viewport.className = 'chart-viewport';

  let currentLayout: Layout | null = null;
  // Nodes from the last draw, in layout order. A filter edit reuses them to retoggle
  // visibility / rescale bars without a relayout; a zoom rebuilds them (the set
  // changes as buckets dissolve).
  let markerNodes: HTMLElement[] = [];
  let barNodes: HTMLElement[] = [];

  // Filtering keeps the layout (axis, ticks, bar positions, lanes) fixed — so this
  // never relayouts. Individual markers toggle .chart-hidden in place; density bars
  // re-count their matching members and rescale (height/badge/hide) so the
  // histogram reflects the filtered/searched set, not the full one. eventCount is
  // the total matching beats — individuals plus bar members.
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
      if (barNodes[i]) count += styleBar(barNodes[i], bar, idx.events, match);
    });
    api.eventCount = count;
  }

  // Grow markers as zoom approaches its maximum so they're easy to see and click.
  // Stays 1× until the zoom reaches the last stretch of its range, then ramps to
  // ITEM_SCALE_MAX at full zoom.
  function itemScale(): number {
    const p = maxZoom > 1 ? (zoomLevel - 1) / (maxZoom - 1) : 0; // zoom progress 0..1
    if (p <= ZOOM_UPSCALE_FROM) return 1;
    const t = (p - ZOOM_UPSCALE_FROM) / (1 - ZOOM_UPSCALE_FROM); // 0..1 over the last stretch
    return 1 + t * (ITEM_SCALE_MAX - 1);
  }

  function applyItemScale() {
    viewport.style.setProperty('--chart-item-scale', itemScale().toFixed(3));
  }

  // Filter bar owns the mutable filter state; a filter edit just retoggles
  // visibility, no relayout.
  const { bar: filterBar, state: filterState } = buildFilterBar(data.events, applyVisibility);

  // Rebuild the canvas for the current density. Only zoom (density change) calls
  // this. The individual-marker set changes with zoom (density buckets dissolve as
  // beats spread), so unlike a fixed set we recreate the canvas contents each draw
  // — cheap, since the crowd rolls into a bounded number of bars. anchor (or null)
  // is the point held fixed: { frac } along the timeline (0..1), { x } px from the
  // viewport left — so zooming feels anchored on the cursor.
  function draw(anchor?: { frac: number; x: number }) {
    const layout = layoutAt(fitDensity * zoomLevel);
    currentLayout = layout;
    const match = makeMatcher(filterState);

    const canvas = document.createElement('div');
    canvas.className = 'chart-canvas';
    canvas.style.width = `${layout.contentWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    const axis = document.createElement('div');
    axis.className = 'chart-axis';
    canvas.appendChild(axis);

    for (const tick of layout.ticks) canvas.append(...buildTick(tick));

    barNodes = [];
    let count = 0;
    for (const bar of layout.bars) {
      const node = buildBar(bar);
      barNodes.push(node);
      canvas.appendChild(node);
      count += styleBar(node, bar, idx.events, match); // sized to matching members
    }

    markerNodes = [];
    for (const item of layout.items) {
      const vis = match(item);
      const marker = buildMarker(item, vis);
      markerNodes.push(marker);
      canvas.appendChild(marker);
      if (vis) count++;
    }

    viewport.replaceChildren(canvas);
    api.eventCount = count;
    api.contentWidth = layout.contentWidth;
    api.laneCount = layout.laneCount;
    if (anchor) viewport.scrollLeft = anchor.frac * layout.contentWidth - anchor.x;
    applyItemScale();
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

  // Click a density bar → zoom in, anchored on the cluster (convert its content x
  // to a client x for the shared anchored zoom). Skipped after a pan-drag.
  viewport.addEventListener('click', (e) => {
    if (viewport._tlDragged) return;
    const bar = (e.target as Element | null)?.closest<HTMLElement>('.chart-bar');
    if (!bar) return;
    const cx = Number(bar.dataset.centerx);
    const left = viewport.getBoundingClientRect?.().left || 0;
    zoom('in', left + (cx - viewport.scrollLeft));
  });

  container.append(buildToolbar(zoom), filterBar, viewport);
  draw();
  enablePan(viewport);
  enableWheelZoom(viewport, zoomWheel);
  enableMarkerInteraction(viewport, (source) => window.open(source, '_blank'));

  return api;
}
