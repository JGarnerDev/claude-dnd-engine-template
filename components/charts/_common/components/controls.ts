// Interaction wiring for the timeline. Kept apart from render.js so DOM
// assembly stays one concern and pointer/scroll behavior is another. DOM-bound.

import type { PanViewport, ZoomKind } from '../types.js';

// Drag-to-pan: press and drag horizontally to scroll the viewport along the
// time axis. Native overflow scroll (wheel/trackpad) still works alongside it.
export function enablePan(viewport: PanViewport): void {
  let dragging = false;
  let startX = 0;
  let startScroll = 0;

  viewport.addEventListener('pointerdown', (e) => {
    // Don't pan (or capture the pointer) when the press lands on an interactive
    // control or the sticky track gutter. Capturing on the viewport would
    // retarget the ensuing click to the viewport, swallowing the button's own
    // click (e.g. the swimlane expand/collapse toggle).
    if ((e.target as Element | null)?.closest('button, a, input, .tl-swim-gutter')) return;
    dragging = true;
    startX = e.clientX;
    startScroll = viewport.scrollLeft;
    // Reset the drag flag the click handler reads to tell a pan from a tap.
    viewport._tlDragged = false;
    viewport.classList.add('tl-grabbing');
    viewport.setPointerCapture?.(e.pointerId);
  });

  viewport.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    if (Math.abs(e.clientX - startX) > 3) viewport._tlDragged = true;
    viewport.scrollLeft = startScroll - (e.clientX - startX);
  });

  const end = (e: PointerEvent) => {
    if (!dragging) return;
    dragging = false;
    viewport.classList.remove('tl-grabbing');
    viewport.releasePointerCapture?.(e.pointerId);
  };
  viewport.addEventListener('pointerup', end);
  viewport.addEventListener('pointercancel', end);
  viewport.addEventListener('pointerleave', end);
}

// Mouse-wheel zoom. Wheel up zooms in, down zooms out; cursor x is passed so
// the caller can anchor the zoom under the pointer. preventDefault stops the
// page/viewport from also scrolling on the same gesture.
export function enableWheelZoom(viewport: HTMLElement, onZoom: (kind: ZoomKind, clientX?: number) => void): void {
  viewport.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      onZoom(e.deltaY < 0 ? 'in' : 'out', e.clientX);
    },
    { passive: false },
  );
}

// Hover detail + click-to-open. Listeners are delegated on the viewport (which
// persists across redraws) rather than per-marker, so they survive every zoom/
// filter rebuild. Markers carry data-label/date/track/source. onOpen(source) is
// called on a click that wasn't a pan (see enablePan's _tlDragged flag).
export function enableMarkerInteraction(viewport: PanViewport, onOpen: (source: string) => void): void {
  const tip = document.createElement('div');
  tip.className = 'tl-tooltip';
  tip.hidden = true;
  // Build the title/meta nodes once; hover only sets their textContent (no
  // per-mouseover element churn).
  const title = document.createElement('div');
  title.className = 'tl-tooltip-title';
  const meta = document.createElement('div');
  meta.className = 'tl-tooltip-meta';
  tip.append(title, meta);
  document.body.appendChild(tip);

  const markerAt = (e: Event): HTMLElement | null =>
    (e.target as Element | null)?.closest<HTMLElement>('.tl-marker') ?? null;

  viewport.addEventListener('mouseover', (e) => {
    const m = markerAt(e);
    if (!m) return;
    const { label, date, track, source } = m.dataset;
    title.textContent = label ?? '';
    meta.textContent = source ? `${date} · ${track} · click to open` : `${date} · ${track}`;
    tip.hidden = false;
  });

  // Pointer-following position. mousemove fires at pointer rate and each style
  // write forces a reflow, so coalesce to one write per frame: stash the latest
  // coords and flush in a single rAF (skip if one is already pending).
  let moveRaf = 0;
  let lastX = 0;
  let lastY = 0;
  viewport.addEventListener('mousemove', (e) => {
    if (tip.hidden) return;
    lastX = e.clientX;
    lastY = e.clientY;
    if (moveRaf) return;
    moveRaf = requestAnimationFrame(() => {
      moveRaf = 0;
      tip.style.left = `${lastX + 14}px`;
      tip.style.top = `${lastY + 14}px`;
    });
  });

  viewport.addEventListener('mouseout', (e) => {
    if (markerAt(e)) tip.hidden = true;
  });

  viewport.addEventListener('click', (e) => {
    if (viewport._tlDragged) return; // it was a pan, not a tap
    const source = markerAt(e)?.dataset.source;
    if (source) onOpen(source);
  });
}
