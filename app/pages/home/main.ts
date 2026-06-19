// Entry for pages/home. Same World | Campaign view switcher as the demo, but the
// data is the live campaign graph (virtual:campaign-data, backed by the PS
// extractor) instead of hand-made fixtures. renderTimelineView shows its shared
// empty state when the graph carries no dated beats yet — a fresh template, not
// an error.

import { renderTimelineView } from './view.js';
import data from 'virtual:campaign-data';

const root = document.getElementById('app');
if (root) renderTimelineView(root, data);
