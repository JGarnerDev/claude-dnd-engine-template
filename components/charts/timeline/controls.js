// Interaction wiring for the timeline. Kept apart from render.js so DOM
// assembly stays one concern and pointer/scroll behavior is another. DOM-bound.

// Drag-to-pan: press and drag horizontally to scroll the viewport along the
// time axis. Native overflow scroll (wheel/trackpad) still works alongside it.
export function enablePan(viewport) {
  let dragging = false;
  let startX = 0;
  let startScroll = 0;

  viewport.addEventListener('pointerdown', (e) => {
    dragging = true;
    startX = e.clientX;
    startScroll = viewport.scrollLeft;
    viewport.classList.add('tl-grabbing');
    viewport.setPointerCapture?.(e.pointerId);
  });

  viewport.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    viewport.scrollLeft = startScroll - (e.clientX - startX);
  });

  const end = (e) => {
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
export function enableWheelZoom(viewport, onZoom) {
  viewport.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      onZoom(e.deltaY < 0 ? 'in' : 'out', e.clientX);
    },
    { passive: false },
  );
}
