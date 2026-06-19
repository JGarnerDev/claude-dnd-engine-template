// Entry for pages/home. Same World | Campaign view switcher as the demo, but the
// data is the live campaign graph (virtual:campaign-data, backed by the PS
// extractor) instead of hand-made fixtures. Renders an instructive empty state
// when the graph carries no dated beats yet — a fresh template, not an error.

import { renderTimelineView } from '../demo/view.js';
import data from 'virtual:campaign-data';

const root = document.getElementById('app');
if (root) {
  if (data && Array.isArray(data.events) && data.events.length > 0) {
    renderTimelineView(root, data);
  } else {
    root.innerHTML = `
      <div class="home-empty">
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
}
