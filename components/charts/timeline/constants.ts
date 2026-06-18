// Layout constants for the timeline chart. Kept here so the pure layout math
// (layout.js, lanes.js) and the DOM/CSS stay in agreement from one source.

export const PX_PER_YEAR = 160; // layout's default density (non-render callers/tests)
// Zoom is relative: render starts at a "fit" density that fills the viewport
// (zoom level 1), then multiplies it. Level 1 = whole timeline visible; higher
// = stretched. Can't zoom out past 1 (nothing to show beyond full view).
export const ZOOM_FACTOR = 1.5; // multiply/divide per zoom-in/out step
export const ZOOM_MAX = 8; // deepest zoom = 8× the fit density
export const MARGIN = 48; // left/right gutter inside the canvas, in px
export const EDGE_PAD = 0.05; // breathing room before first / after last beat, as a fraction of span

// Label box geometry (mirrors .tl-label in style.css). Labels occupy a fixed
// slot so lane assignment needs no DOM measurement (works under happy-dom too).
export const LABEL_W = 150;
export const LABEL_GAP = 6; // min horizontal gap between labels sharing a lane
export const AXIS_GAP = 16; // gap from axis to the nearest tier
export const TIER_H = 70; // vertical step per tier (exceeds clamped label height)

export const MIN_CANVAS_HEIGHT = 320;

// Swimlane view (M4). Track rows stack vertically; the time axis/ticks sit in a
// reserved band at the top, and a fixed left gutter holds the track-tree labels.
export const ROW_H = 34; // height of one track row, in px
export const SWIM_TOP_PAD = 40; // band above the first row for axis ticks
export const SWIM_BOTTOM_PAD = 12;
export const GUTTER_W = 160; // left label-gutter width
