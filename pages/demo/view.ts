// View switcher: a World | Campaign toggle over the same data. World = the
// single-axis layout (render.ts); Campaign = the swimlane multi-track layout
// (swimlane-render.ts). Thin host — each view fully owns its own content node.
//
// The header bar carries the view tabs (left) and the action buttons (right);
// the settings gear lives there and hoists the active chart's controls (zoom,
// filter) into its overlay, so the chart canvas below takes the full height.

import './view.css';
import { renderTimeline } from '../../components/charts/timeline/timeline.js';
import { renderSwimlane } from '../../components/charts/swimlane/swimlane.js';
import { mountSettingsPanel } from '../../components/charts/_common/components/settingspanel.js';
import type { TimelineData } from '../../components/charts/_common/types.js';

export type View = 'world' | 'tracks';

export function renderTimelineView(container: HTMLElement, data: TimelineData, initial: View = 'world'): void {
  container.innerHTML = '';
  container.classList.add('chart-viewhost');

  // Header: tabs on the left, action buttons (settings + future) on the right.
  const header = document.createElement('div');
  header.className = 'chart-headerbar';
  const tabs = document.createElement('div');
  tabs.className = 'chart-viewtabs';
  const actions = document.createElement('div');
  actions.className = 'chart-actions';
  header.append(tabs, actions);

  const content = document.createElement('div');
  content.className = 'chart-viewcontent';

  // One persistent settings panel; the gear stays put across view switches and
  // its contents are swapped to the active chart's controls.
  const settings = mountSettingsPanel(actions);

  const tabBtns = new Map<View, HTMLButtonElement>();
  const select = (v: View) => {
    for (const [key, btn] of tabBtns) btn.classList.toggle('is-active', key === v);
    const api = v === 'world' ? renderTimeline(content, data) : renderSwimlane(content, data);
    settings.setSections(api.controls);
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
  container.append(header, content);
  select(initial);
}
