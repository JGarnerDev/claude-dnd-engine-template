// Production entry for the self-contained timeline artifact (M2). Vite bundles
// this + the CSS into one offline HTML via vite-plugin-singlefile. The data
// generator (scripts/timeline-data.ps1) injects the real campaign blob into
// window.__TL_DATA__; absent that (e.g. the raw build output), it falls back to
// sample-data so the artifact is never blank.
import { renderTimelineView } from '../home/view.js';
import { sampleData } from './sample-data.js';
import type { TimelineData } from '../../components/charts/_common/types.js';

const injected = window.__TL_DATA__;
const data: TimelineData =
  injected && Array.isArray(injected.events) && injected.events.length > 0 ? injected : sampleData;

const root = document.getElementById('timeline');
if (root) renderTimelineView(root, data);
