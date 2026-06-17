// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { enablePan, enableWheelZoom } from './controls.js';

// Dispatch a pointer-type event with a clientX (MouseEvent carries clientX;
// the listener only cares about the type + clientX, not the constructor).
function pointer(type, clientX) {
  return new MouseEvent(type, { clientX, bubbles: true });
}

describe('enablePan', () => {
  let viewport;
  beforeEach(() => {
    viewport = document.createElement('div');
    document.body.appendChild(viewport);
    viewport.scrollLeft = 200;
    enablePan(viewport);
  });

  it('scrolls opposite the drag direction', () => {
    viewport.dispatchEvent(pointer('pointerdown', 100));
    viewport.dispatchEvent(pointer('pointermove', 60)); // dragged left 40px
    expect(viewport.scrollLeft).toBe(240); // 200 - (60 - 100)
  });

  it('ignores movement before a press', () => {
    viewport.dispatchEvent(pointer('pointermove', 60));
    expect(viewport.scrollLeft).toBe(200);
  });

  it('stops panning after release', () => {
    viewport.dispatchEvent(pointer('pointerdown', 100));
    viewport.dispatchEvent(pointer('pointerup', 100));
    viewport.dispatchEvent(pointer('pointermove', 60));
    expect(viewport.scrollLeft).toBe(200);
  });

  it('toggles the grabbing class across a drag', () => {
    viewport.dispatchEvent(pointer('pointerdown', 100));
    expect(viewport.classList.contains('tl-grabbing')).toBe(true);
    viewport.dispatchEvent(pointer('pointerup', 100));
    expect(viewport.classList.contains('tl-grabbing')).toBe(false);
  });
});

describe('enableWheelZoom', () => {
  it('maps wheel up to zoom-in and down to zoom-out, passing cursor x', () => {
    const el = document.createElement('div');
    const calls = [];
    enableWheelZoom(el, (kind, x) => calls.push([kind, x]));
    // happy-dom's WheelEvent ctor drops deltaY/clientX, so set them on the instance.
    const wheel = (deltaY, clientX) => {
      const e = new Event('wheel', { cancelable: true });
      Object.assign(e, { deltaY, clientX });
      el.dispatchEvent(e);
    };
    wheel(-1, 250);
    wheel(1, 80);
    expect(calls).toEqual([['in', 250], ['out', 80]]);
  });
});
