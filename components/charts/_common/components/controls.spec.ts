// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { enablePan, enableWheelZoom, enableMarkerInteraction } from './controls.js';
import type { PanViewport } from '../types.js';

// Dispatch a pointer-type event with a clientX (MouseEvent carries clientX;
// the listener only cares about the type + clientX, not the constructor).
function pointer(type: string, clientX: number) {
  return new MouseEvent(type, { clientX, bubbles: true });
}

describe('enablePan', () => {
  let viewport: HTMLDivElement;
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

  it('does not pan when the press lands on a button (so its click survives)', () => {
    const btn = document.createElement('button');
    viewport.appendChild(btn);
    btn.dispatchEvent(pointer('pointerdown', 100)); // bubbles to viewport, target = btn
    viewport.dispatchEvent(pointer('pointermove', 60));
    expect(viewport.scrollLeft).toBe(200); // unchanged — no pan started
    expect(viewport.classList.contains('tl-grabbing')).toBe(false);
  });

  it('does not pan when the press lands in the track gutter', () => {
    const gutter = document.createElement('div');
    gutter.className = 'tl-swim-gutter';
    viewport.appendChild(gutter);
    gutter.dispatchEvent(pointer('pointerdown', 100));
    viewport.dispatchEvent(pointer('pointermove', 60));
    expect(viewport.scrollLeft).toBe(200);
  });
});

describe('enableWheelZoom', () => {
  it('maps wheel up to zoom-in and down to zoom-out, passing cursor x', () => {
    const el = document.createElement('div');
    const calls: [string, number | undefined][] = [];
    enableWheelZoom(el, (kind, x) => calls.push([kind, x]));
    // happy-dom's WheelEvent ctor drops deltaY/clientX, so set them on the instance.
    const wheel = (deltaY: number, clientX: number) => {
      const e = new Event('wheel', { cancelable: true });
      Object.assign(e, { deltaY, clientX });
      el.dispatchEvent(e);
    };
    wheel(-1, 250);
    wheel(1, 80);
    expect(calls).toEqual([['in', 250], ['out', 80]]);
  });
});

describe('enableMarkerInteraction', () => {
  let viewport: PanViewport;
  let marker: HTMLDivElement;
  let opened: string[];

  beforeEach(() => {
    document.body.innerHTML = '';
    viewport = document.createElement('div');
    document.body.appendChild(viewport);
    marker = document.createElement('div');
    marker.className = 'tl-marker';
    Object.assign(marker.dataset, {
      label: 'Redfen burns',
      date: '1342-08-01',
      track: 'world',
      source: 'historian/events/redfen-burns.md',
    });
    viewport.appendChild(marker);
    opened = [];
    enableMarkerInteraction(viewport, (src) => opened.push(src));
  });

  const fire = (type: string, target: Element = marker) =>
    target.dispatchEvent(new MouseEvent(type, { bubbles: true, clientX: 50, clientY: 60 }));

  const tooltip = () => document.querySelector<HTMLElement>('.tl-tooltip')!;

  it('shows a tooltip with the full label and meta on hover', () => {
    fire('mouseover');
    const tip = tooltip();
    expect(tip.hidden).toBe(false);
    expect(tip.querySelector('.tl-tooltip-title')!.textContent).toBe('Redfen burns');
    expect(tip.querySelector('.tl-tooltip-meta')!.textContent).toContain('click to open');
  });

  it('hides the tooltip on mouseout', () => {
    fire('mouseover');
    fire('mouseout');
    expect(tooltip().hidden).toBe(true);
  });

  it('opens the source on a plain click', () => {
    fire('click');
    expect(opened).toEqual(['historian/events/redfen-burns.md']);
  });

  it('does not open when the click followed a drag (pan)', () => {
    viewport._tlDragged = true;
    fire('click');
    expect(opened).toEqual([]);
  });

  it('ignores clicks on a marker with no source', () => {
    delete marker.dataset.source;
    fire('click');
    expect(opened).toEqual([]);
  });
});
