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

// The viewport element carries a flag set by enablePan so the click handler can
// tell a pan-drag from a tap.
export type PanViewport = HTMLElement & { _tlDragged?: boolean };
