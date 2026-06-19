// View switcher: a World | Campaign toggle over the same data. World = the
// single-axis layout (render.ts); Campaign = the swimlane multi-track layout
// (swimlane-render.ts). Thin host — each view fully owns its own content node.

import './view.css';
import { renderTimeline } from '../../components/charts/timeline/timeline.js';
import { renderSwimlane } from '../../components/charts/swimlane/swimlane.js';
import type { TimelineData } from '../../components/charts/_common/types.js';

export type View = 'world' | 'tracks';

export function renderTimelineView(container: HTMLElement, data: TimelineData, initial: View = 'world'): void {
  container.innerHTML = '';
  container.classList.add('chart-viewhost');

  const tabs = document.createElement('div');
  tabs.className = 'chart-viewtabs';
  const content = document.createElement('div');
  content.className = 'chart-viewcontent';

  const tabBtns = new Map<View, HTMLButtonElement>();
  const select = (v: View) => {
    for (const [key, btn] of tabBtns) btn.classList.toggle('is-active', key === v);
    if (v === 'world') renderTimeline(content, data);
    else renderSwimlane(content, data);
  };

  const mk = (v: View, label: string) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chart-viewtab';
    b.textContent = label;
    b.addEventListener('click', () => select(v));
    tabBtns.set(v, b);
    return b;
  };
  tabs.append(mk('world', 'World'), mk('tracks', 'Campaign'));
  container.append(tabs, content);
  select(initial);
}
