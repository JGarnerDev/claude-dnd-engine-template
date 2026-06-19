// Pure swimlane layout (M4). Places each beat in its track's horizontal row at
// its time-x. The track tree (tracks.ts) decides which rows exist; `collapsed`
// (a set of category keys) decides whether a parent shows one roll-up row or
// expands into a header row + one row per child. No DOM.

import { DEFAULT_CALENDAR } from '../../_common/helpers/calendar.js';
import { computeAxisFrom, indexEvents } from '../../_common/helpers/axis.js';
import type { IndexedEvents } from '../../_common/helpers/axis.js';
import { weightOf } from '../../_common/helpers/weight.js';
import { clusterBeats, barHeightFor } from '../../_common/helpers/cluster.js';
import { buildTrackTree } from './tracks.js';
import {
  ROW_H,
  SWIM_TOP_PAD,
  SWIM_BOTTOM_PAD,
  PX_PER_YEAR,
  SWIM_LABEL_GAP,
  SWIM_LABEL_LEFT,
  SWIM_LABEL_PAD,
  SWIM_LABEL_MIN,
  SWIM_LABEL_MAX,
  DENSITY_BUCKET_PX,
  CLUSTER_OFF_GAP,
  SWIM_BAR_MAX,
  SWIM_BAR_MIN,
  SWIM_BAR_FULL_COUNT,
} from '../../_common/constants.js';
import { parseTrack } from './tracks.js';
import type { Calendar, CategoryConfig, SwimBar, SwimItem, SwimLayout, SwimRow, TimelineEvent, TrackCategory } from '../../_common/types.js';

// rows: build the ordered row list from the (prebuilt) tree + collapse state,
// stacking each ROW_H tall below the axis band. The tree is zoom- and
// collapse-invariant, so the renderer builds it once and passes it in.
function buildRows(tree: TrackCategory[], collapsed: Set<string>): SwimRow[] {
  const rows: SwimRow[] = [];
  let y = SWIM_TOP_PAD;
  const push = (r: Omit<SwimRow, 'y' | 'centerY' | 'height'>) => {
    rows.push({ ...r, y, centerY: y + ROW_H / 2, height: ROW_H });
    y += ROW_H;
  };

  for (const cat of tree) {
    const hasChildren = cat.members.length > 0;
    const base = { category: cat.key, label: cat.label, colorVar: cat.colorVar };
    if (!hasChildren) {
      // Leaf category: a single parent row holds all its beats, no toggle.
      push({ ...base, key: cat.key, member: null, depth: 0, isRollup: false, collapsed: false, hasToggle: false });
    } else if (collapsed.has(cat.key)) {
      // Collapsed: one roll-up row aggregating parent + all children (D6).
      push({ ...base, key: cat.key, member: null, depth: 0, isRollup: true, collapsed: true, hasToggle: true });
    } else {
      // Expanded: a header row (also holds parent-direct beats) + child rows.
      push({ ...base, key: cat.key, member: null, depth: 0, isRollup: false, collapsed: false, hasToggle: true });
      for (const m of cat.members) {
        push({ ...base, key: `${cat.key}:${m.member}`, member: m.member, label: m.label, depth: 1, isRollup: false, collapsed: false, hasToggle: false });
      }
    }
  }
  return rows;
}

// Which row a beat lands on: its child row when that child is expanded/exists,
// otherwise its category's parent/roll-up row.
function rowKeyFor(track: string | undefined, rowKeys: Set<string>): string {
  const { category, member } = parseTrack(track);
  if (member !== null) {
    const childKey = `${category}:${member}`;
    if (rowKeys.has(childKey)) return childKey;
  }
  return category;
}

export function computeSwimlane(
  rawEvents: TimelineEvent[],
  collapsed: Set<string> = new Set(),
  cal: Calendar = DEFAULT_CALENDAR,
  pxPerYear: number = PX_PER_YEAR,
  config?: CategoryConfig[],
): SwimLayout {
  return computeSwimlaneFrom(indexEvents(rawEvents, cal), buildTrackTree(rawEvents, config), collapsed, cal, pxPerYear);
}

// Zoom/collapse step: takes the pre-indexed events and the prebuilt track tree
// (both built once per render by the renderer), so a zoom or collapse re-runs
// only the scale + row stacking — never the per-event sort or tree walk.
// computeSwimlane is the convenience wrapper that indexes + builds the tree.
export function computeSwimlaneFrom(
  idx: IndexedEvents,
  tree: TrackCategory[],
  collapsed: Set<string> = new Set(),
  cal: Calendar = DEFAULT_CALENDAR,
  pxPerYear: number = PX_PER_YEAR,
): SwimLayout {
  const axis = computeAxisFrom(idx, cal, pxPerYear);
  if (axis.isEmpty) {
    return { isEmpty: true, contentWidth: 0, totalHeight: SWIM_TOP_PAD + SWIM_BOTTOM_PAD, spanYears: 0, ticks: [], rows: [], items: [], bars: [] };
  }

  const rows = buildRows(tree, collapsed);
  const rowKeys = new Set(rows.map((r) => r.key));
  const centerOf = new Map(rows.map((r) => [r.key, r.centerY]));
  const colorOf = new Map(rows.map((r) => [r.key, r.colorVar]));

  const events = axis.events; // sorted ascending by time
  const xs = events.map((e) => axis.xOf(e._idx));
  const keyOf = events.map((e) => rowKeyFor(e.track, rowKeys));

  // LOD: per row, roll crowded buckets into density bars; like the world view it's
  // an overview device, so once beats are individually resolvable (avg spacing >=
  // a dot footprint) clustering switches off and every beat is a dot. Each row
  // clusters independently — one track, one colour, no mixing.
  const avgGap = events.length > 1 ? (xs[xs.length - 1] - xs[0]) / (events.length - 1) : Infinity;
  const bars: SwimBar[] = [];
  let individualIdx: number[]; // global event indices that render as dots

  if (avgGap < CLUSTER_OFF_GAP) {
    const swimBarHeight = (c: number) => barHeightFor(c, SWIM_BAR_MAX, SWIM_BAR_MIN, SWIM_BAR_FULL_COUNT);
    const byRowIdx = new Map<string, number[]>(); // rowKey -> global event indices (x-sorted)
    events.forEach((_, i) => {
      const g = byRowIdx.get(keyOf[i]);
      if (g) g.push(i);
      else byRowIdx.set(keyOf[i], [i]);
    });
    individualIdx = [];
    for (const [key, idxs] of byRowIdx) {
      const input = idxs.map((i) => ({ x: xs[i], major: !!events[i].major }));
      const { individuals, bars: rowBars } = clusterBeats(input, DENSITY_BUCKET_PX, swimBarHeight);
      for (const li of individuals) individualIdx.push(idxs[li]);
      const cy = centerOf.get(key) ?? SWIM_TOP_PAD;
      const color = colorOf.get(key) ?? '--track-world';
      for (const b of rowBars) {
        bars.push({ x: b.centerX, y: cy, height: b.height, count: b.count, hasMajor: b.hasMajor, colorVar: color, rowKey: key, members: b.members.map((li) => idxs[li]) });
      }
    }
    individualIdx.sort((a, b) => a - b);
  } else {
    individualIdx = events.map((_, i) => i);
  }

  const items: SwimItem[] = individualIdx.map((i) => {
    const e = events[i];
    const key = keyOf[i];
    return {
      ...e,
      x: xs[i],
      y: centerOf.get(key) ?? SWIM_TOP_PAD,
      rowKey: key,
      colorVar: colorOf.get(key) ?? '--track-world',
      weight: weightOf(e),
      track: e.track || 'world',
      showLabel: false,
      labelMaxWidth: 0,
    };
  });

  // Density-gated, responsive labels. Per row: walk dots left→right and label one
  // only when it clears SWIM_LABEL_GAP from the last labelled dot (so crowded
  // rows thin out and fill back in as you zoom — like the world view). Each
  // surviving label then gets a max-width = room up to the *next labelled* dot
  // (or the canvas edge), so a label with space shows in full and only a
  // genuinely tight one truncates.
  const byRow = new Map<string, SwimItem[]>();
  for (const item of items) {
    const row = byRow.get(item.rowKey);
    if (row) row.push(item);
    else byRow.set(item.rowKey, [item]);
  }
  for (const rowItems of byRow.values()) {
    rowItems.sort((a, b) => a.x - b.x);
    let lastX = -Infinity;
    for (let i = 0; i < rowItems.length; i++) {
      const here = rowItems[i];
      if (here.x - lastX < SWIM_LABEL_GAP) continue; // too close to the last label → drop
      // Room up to the *next dot* (labelled or not) bounds the label so it never
      // runs over a neighbouring marker. If that room is below the readable floor,
      // skip this dot entirely (bare dot + hover) rather than show a clipped
      // sliver — the next dot, which may have room, can take the label instead.
      const nextX = i + 1 < rowItems.length ? rowItems[i + 1].x : axis.contentWidth;
      const room = nextX - here.x - SWIM_LABEL_LEFT - SWIM_LABEL_PAD;
      if (room < SWIM_LABEL_MIN) continue;
      here.showLabel = true;
      lastX = here.x;
      here.labelMaxWidth = Math.min(SWIM_LABEL_MAX, room);
    }
  }

  const totalHeight = (rows.length ? rows[rows.length - 1].y + ROW_H : SWIM_TOP_PAD) + SWIM_BOTTOM_PAD;
  return { isEmpty: false, contentWidth: axis.contentWidth, totalHeight, spanYears: axis.spanYears, ticks: axis.ticks, rows, items, bars };
}
