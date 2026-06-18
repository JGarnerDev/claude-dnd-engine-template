// Shared types for the timeline view. Pure type declarations — no runtime code,
// so importers use `import type`. The render JSON contract (TimelineData) is the
// shape scripts/timeline-data.ps1 emits and build-entry consumes.

export interface Month {
  name: string;
  days: number;
}

export interface Calendar {
  epochLabel: string;
  months: Month[];
}

export interface DateParts {
  year: number;
  month: number;
  day: number;
}

// One plotted beat. track/major/minor/source are optional in the raw data;
// computeLayout resolves track to a concrete string on its output items.
export interface TimelineEvent {
  date: string;
  label: string;
  track?: string;
  major?: boolean;
  minor?: boolean;
  source?: string;
}

// Act/mission span bar. Extracted by the generator; render consumes it in M4.
export interface Span {
  start: string;
  end: string;
  label: string;
  track?: string;
  source?: string;
}

export interface TimelineData {
  calendar?: Calendar | null;
  events: TimelineEvent[];
  spans?: Span[];
}

export type Side = 'above' | 'below';
export type Weight = 'is-major' | 'is-minor' | 'is-normal';

export interface Placement {
  side: Side;
  tier: number;
  offset: number;
}

// A laid-out beat: the event plus its computed geometry.
export interface LayoutItem extends TimelineEvent {
  x: number;
  side: Side;
  offset: number;
  weight: Weight;
  track: string; // resolved (defaults to 'world')
  text: string;
}

export interface Tick {
  label: string;
  x: number;
}

export interface Layout {
  isEmpty: boolean;
  contentWidth: number;
  canvasHeight: number;
  items: LayoutItem[];
  ticks: Tick[];
  laneCount: number;
  spanYears: number;
}

export interface FilterState {
  query?: string;
  tracks?: Set<string> | null;
}

export type ZoomKind = 'in' | 'out' | 'reset';

// --- Track tree (M4) --------------------------------------------------------
// A beat's `track` string is "category" or "category:member". member empty =>
// the beat sits directly on the parent category lane.
export interface ParsedTrack {
  category: string;
  member: string | null;
}

// Config for one parent category (D5 — config-driven, defaults shipped).
export interface CategoryConfig {
  key: string;
  label: string;
  colorVar: string; // CSS custom property, e.g. '--track-world'
  collapsed: boolean; // initial expand/collapse state
}

export interface TrackChild {
  member: string;
  label: string;
}

// A present parent category + the child members present under it. Only emitted
// when it actually carries beats (auto-derived presence; D7 explicit membership).
export interface TrackCategory {
  key: string;
  label: string;
  colorVar: string;
  collapsed: boolean;
  members: TrackChild[];
  hasParentBeats: boolean; // a beat tagged to the category with no member
}

// --- Swimlane layout (M4) ---------------------------------------------------
// One rendered track row. key = category (parent / roll-up) or `category:member`
// (child) — the same key a beat resolves to, so beats map straight onto rows.
export interface SwimRow {
  key: string;
  category: string;
  member: string | null; // null = parent / roll-up row
  label: string;
  depth: number; // 0 parent header, 1 child
  colorVar: string;
  isRollup: boolean; // collapsed parent aggregating its children's beats
  collapsed: boolean;
  hasToggle: boolean; // parent with children -> shows an expand/collapse control
  y: number; // row top, px
  centerY: number; // dot baseline, px
  height: number;
}

// A beat placed in the swimlane grid: x from the time axis, y from its row.
export interface SwimItem extends TimelineEvent {
  x: number;
  y: number;
  rowKey: string;
  colorVar: string;
  weight: Weight;
  track: string; // resolved
  showLabel: boolean; // density-gated inline label (clears when its row crowds)
  labelMaxWidth: number; // px to the next labelled dot in the row (responsive truncation)
}

export interface SwimLayout {
  isEmpty: boolean;
  contentWidth: number;
  totalHeight: number;
  spanYears: number;
  ticks: Tick[];
  rows: SwimRow[];
  items: SwimItem[];
}

// The viewport element carries a flag set by enablePan so the click handler can
// tell a pan-drag from a tap.
export type PanViewport = HTMLElement & { _tlDragged?: boolean };
