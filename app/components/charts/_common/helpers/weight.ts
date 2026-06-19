// Weight classifier shared by both views' layout math: maps a beat's major/minor
// flags to its visual weight class. Pure. Lives in _common because the World
// layout (layout.ts) and the Tracks layout (swimlane.ts) both need it.

import type { TimelineEvent, Weight } from '../types.js';

export function weightOf(e: Pick<TimelineEvent, 'major' | 'minor'>): Weight {
  return e.major ? 'is-major' : e.minor ? 'is-minor' : 'is-normal';
}
