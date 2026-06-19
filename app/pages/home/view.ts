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
import type { SettingsSection } from '../../components/charts/_common/components/settingspanel.js';
import { mountSavedViews } from '../../components/charts/_common/components/savedviews.js';
import type { ChartState, TimelineData } from '../../components/charts/_common/types.js';

export type View = 'world' | 'tracks';

// The slice of each chart's api the host needs: its hoistable controls and a
// snapshot of its full restorable state (both charts implement both).
interface ChartApi {
  controls: SettingsSection[];
  getState(): ChartState;
}

// Shared empty state: shown when the data carries no dated beats the timeline can
// place. Used by pages/home against the live graph (a fresh template, not an
// error). The fixture/artifact entries always pass dated sample data, so they
// never hit this branch.
function renderEmpty(container: HTMLElement): void {
  container.innerHTML = `
    <div class="chart-empty">
      <h1>No timeline yet</h1>
      <p>This view plots your campaign's dated beats. Nothing carries a date
         the timeline can place yet.</p>
      <p>Add any of these, then this page reloads on its own:</p>
      <ul>
        <li><code>timeline_date</code> on a <code>type: event</code> in
            <code>data/events/</code> or <code>historian/events/</code></li>
        <li><code>in_world_end_date</code> on a <code>type: session</code> in
            <code>historian/sessions/</code> (written by <code>/recap</code>)</li>
        <li>a <code>chronicle:</code> beat on any historian/scheduler entity</li>
      </ul>
    </div>`;
}

export function renderTimelineView(container: HTMLElement, data: TimelineData | null, initial: View = 'world'): void {
  container.innerHTML = '';

  if (!data || !Array.isArray(data.events) || data.events.length === 0) {
    renderEmpty(container);
    return;
  }

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

  // Live refs the saved-views widget reads: which tab is showing and the active
  // chart's api. Switching tabs rebuilds the chart from scratch (discarding its
  // state), so a loaded view must be applied as initial state at render time —
  // select() threads an optional ChartState into the renderer for exactly that.
  let currentView: View = initial;
  let activeApi: ChartApi | null = null;

  const tabBtns = new Map<View, HTMLButtonElement>();
  const select = (v: View, initialState?: ChartState) => {
    currentView = v;
    for (const [key, btn] of tabBtns) btn.classList.toggle('is-active', key === v);
    activeApi = v === 'world' ? renderTimeline(content, data, initialState) : renderSwimlane(content, data, initialState);
    settings.setSections(activeApi.controls);
  };

  // Save · Load sit left of the gear (mounted into `actions` first). Save reads
  // the current tab + chart state; Load re-renders the target tab seeded with
  // the saved state.
  mountSavedViews(actions, {
    getCurrent: () => ({ tab: currentView, state: activeApi!.getState() }),
    apply: (view) => select(view.tab, view.state),
  });

  // One persistent settings panel; the gear stays put across view switches and
  // its contents are swapped to the active chart's controls.
  const settings = mountSettingsPanel(actions);

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
