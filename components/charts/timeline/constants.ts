// Layout constants for the timeline chart. Kept here so the pure layout math
// (layout.js, lanes.js) and the DOM/CSS stay in agreement from one source.

export const PX_PER_YEAR = 160; // layout's default density (non-render callers/tests)
// Zoom is relative: render starts at a "fit" density that fills the viewport
// (zoom level 1), then multiplies it. Level 1 = whole timeline visible; higher
// = stretched. Can't zoom out past 1 (nothing to show beyond full view).
export const ZOOM_FACTOR = 1.5; // multiply/divide per zoom-in/out step
export const ZOOM_MAX = 8; // floor for deepest zoom = 8× the fit density (sparse timelines)
// For dense/long timelines, 8× of a tiny fit density still can't despace beats.
// render.ts raises the cap so zoom can reach ~this many px between adjacent beats.
export const TARGET_PX_PER_BEAT = 36;
export const MARGIN = 80; // left/right gutter inside the canvas, in px. >= LABEL_W/2 so an edge beat's centered label never spills past the canvas bound
export const EDGE_PAD = 0.05; // breathing room before first / after last beat, as a fraction of span

// Label box geometry (mirrors .tl-label in style.css). Labels occupy a fixed
// slot so lane assignment needs no DOM measurement (works under happy-dom too).
export const LABEL_W = 150;
export const LABEL_GAP = 6; // min horizontal gap between labels sharing a lane
export const AXIS_GAP = 16; // gap from axis to the nearest tier
export const TIER_H = 70; // vertical step per tier (exceeds clamped label height)

export const MIN_CANVAS_HEIGHT = 320;

// Axis ticks: minimum pixel spacing between two tick labels. Drives the
// responsive granularity — months when zoomed in, single years mid-zoom,
// multi-year steps (2/5/10/25…) when zoomed out and years would crowd below this.
export const MIN_TICK_PX = 60;

// Swimlane view (M4). Track rows stack vertically; the time axis/ticks sit in a
// reserved band at the top, and a fixed left gutter holds the track-tree labels.
export const ROW_H = 34; // height of one track row, in px
export const SWIM_LABEL_GAP = 90; // min px between two labelled dots in a row; below this the later label is dropped (density gate)
export const SWIM_LABEL_LEFT = 9; // px from dot center to label start (mirrors .tl-swim-label left)
export const SWIM_LABEL_PAD = 10; // breathing gap so a label stops short of the next dot
export const SWIM_LABEL_MIN = 40; // floor for a label's responsive max-width, px
export const SWIM_LABEL_MAX = 260; // cap so an isolated label doesn't stretch across empty space, px
export const SWIM_TOP_PAD = 40; // band above the first row for axis ticks
export const SWIM_BOTTOM_PAD = 12;
export const GUTTER_W = 160; // left label-gutter width
