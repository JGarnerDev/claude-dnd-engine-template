// Layout constants for the timeline chart. Kept here so the pure layout math
// (layout.js, lanes.js) and the DOM/CSS stay in agreement from one source.

export const PX_PER_YEAR = 160; // axis density; later driven by the zoom control
export const MARGIN = 48; // left/right gutter inside the canvas, in px

// Label box geometry (mirrors .tl-label in style.css). Labels occupy a fixed
// slot so lane assignment needs no DOM measurement (works under happy-dom too).
export const LABEL_W = 150;
export const LABEL_GAP = 6; // min horizontal gap between labels sharing a lane
export const AXIS_GAP = 16; // gap from axis to the nearest tier
export const TIER_H = 70; // vertical step per tier (exceeds clamped label height)

export const MIN_CANVAS_HEIGHT = 320;
