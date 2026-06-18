// Pure swimlane layout (M4). Places each beat in its track's horizontal row at
// its time-x. The track tree (tracks.ts) decides which rows exist; `collapsed`
// (a set of category keys) decides whether a parent shows one roll-up row or
// expands into a header row + one row per child. No DOM.

import { DEFAULT_CALENDAR } from './calendar.js';
import { computeAxis } from './axis.js';
import { weightOf } from './layout.js';
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
} from '../constants.js';
import { parseTrack } from './tracks.js';
import type { Calendar, CategoryConfig, SwimItem, SwimLayout, SwimRow, TimelineEvent } from '../types.js';

// rows: build the ordered row list from the tree + collapse state, stacking each
// ROW_H tall below the axis band.
function buildRows(
  rawEvents: TimelineEvent[],
  collapsed: Set<string>,
  config?: CategoryConfig[],
): SwimRow[] {
  const tree = buildTrackTree(rawEvents, config);
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
  const axis = computeAxis(rawEvents, cal, pxPerYear);
  if (axis.isEmpty) {
    return { isEmpty: true, contentWidth: 0, totalHeight: SWIM_TOP_PAD + SWIM_BOTTOM_PAD, spanYears: 0, ticks: [], rows: [], items: [] };
  }

  const rows = buildRows(rawEvents, collapsed, config);
  const rowKeys = new Set(rows.map((r) => r.key));
  const centerOf = new Map(rows.map((r) => [r.key, r.centerY]));
  const colorOf = new Map(rows.map((r) => [r.key, r.colorVar]));

  const items: SwimItem[] = axis.events.map((e) => {
    const key = rowKeyFor(e.track, rowKeys);
    return {
      ...e,
      x: axis.xOf(e._idx),
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
  return { isEmpty: false, contentWidth: axis.contentWidth, totalHeight, spanYears: axis.spanYears, ticks: axis.ticks, rows, items };
}
