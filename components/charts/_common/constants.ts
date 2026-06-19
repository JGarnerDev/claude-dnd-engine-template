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
// Deepest zoom also guarantees you can get this close: one calendar month fills
// at least this fraction of the viewport width at maximum zoom (both views).
export const MONTH_VIEW_FRAC = 0.6;
export const MARGIN = 80; // left/right gutter inside the canvas, in px. >= LABEL_W/2 so an edge beat's centered label never spills past the canvas bound
export const EDGE_PAD = 0.05; // breathing room before first / after last beat, as a fraction of span

// Label box geometry (mirrors .tl-label in style.css). Labels occupy a fixed
// slot so lane assignment needs no DOM measurement (works under happy-dom too).
export const LABEL_W = 150;
export const LABEL_GAP = 6; // min horizontal gap between labels sharing a lane
export const AXIS_GAP = 16; // gap from axis to the nearest tier
export const TIER_H = 70; // vertical step per tier (exceeds clamped label height)

export const MIN_CANVAS_HEIGHT = 320;

// Density histogram (LOD). When beats crowd below one bar per BUCKET_PX, the
// world view buckets the non-major beats into fixed-width pixel columns and draws
// a below-axis density bar per bucket (height ∝ √count) instead of a wall of
// dots/labels. Majors are never bucketed (always individual + labelled); a bucket
// holding fewer than DENSITY_MIN beats stays individual too, so zooming in melts
// the histogram back into per-beat markers.
export const DENSITY_BUCKET_PX = 8; // bucket column width, px
export const DENSITY_MIN = 2; // min beats in a bucket to render a bar (else individual)
export const BAR_MIN_H = 6; // shortest density bar, px
export const BAR_MAX_H = 120; // tallest density bar, px
// Bar height maps count → px on an ABSOLUTE scale (not relative to the in-view
// max), so a bar's height means the same thing at every zoom. A bucket of this
// many beats (or more) hits BAR_MAX_H; smaller buckets scale down linearly — so a
// 2-beat cluster you've zoomed into stays a short stub instead of inflating to a
// full-height tower just because it's the densest thing on screen.
export const BAR_FULL_COUNT = 50;
// Clustering is an overview-only device. Once the timeline is zoomed in enough
// that the average beat spacing reaches a dot's footprint, beats are individually
// resolvable — so drop the bars entirely and render every beat as its own marker
// (coincident-date beats just overlap). Below this, dense buckets roll into bars.
export const CLUSTER_OFF_GAP = 14; // avg px/beat at or above which clustering turns off

// Deep-zoom upscale: as zoom approaches its maximum, grow markers so they're easy
// to see and click. The scale stays 1× until the zoom reaches the last stretch of
// its range (ZOOM_UPSCALE_FROM as a fraction of [1, maxZoom]), then ramps to
// ITEM_SCALE_MAX at full zoom.
export const ZOOM_UPSCALE_FROM = 0.9; // start upscaling in the last 10% of the zoom range
export const ITEM_SCALE_MAX = 1.6; // dot scale at maximum zoom

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
// Per-row density bar sizing (LOD). Bars are centered on a ROW_H-tall row, so the
// height range is small — a short stub for a couple beats up to nearly the row
// height for a packed bucket.
export const SWIM_BAR_MAX = 24; // tallest per-row bar, px (< ROW_H so it stays in the row)
export const SWIM_BAR_MIN = 4; // shortest per-row bar, px
export const SWIM_BAR_FULL_COUNT = 30; // member count mapping to SWIM_BAR_MAX (rows are less dense than the world aggregate)
