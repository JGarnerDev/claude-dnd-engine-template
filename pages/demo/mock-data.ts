// Stress-test data generator for the timeline dev harness. Procedurally builds
// a large TimelineData spread across many tracks/categories — content is junk,
// the point is volume. Deterministic (seeded LCG) so reloads are stable.

import type { TimelineData, TimelineEvent, Span } from '../../components/charts/_common/types.js';

// Tiny deterministic PRNG (mulberry32) — keeps reloads identical so layout bugs
// are reproducible.
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const WORDS = [
  'siege', 'pact', 'betrayal', 'oath', 'ruin', 'famine', 'comet', 'duel',
  'coronation', 'plague', 'rebellion', 'exodus', 'eclipse', 'verdict', 'raid',
  'truce', 'schism', 'flood', 'ascension', 'collapse', 'wedding', 'heist',
  'reckoning', 'omen', 'crowning', 'sundering', 'awakening', 'purge',
];
const PLACES = [
  'Greywater', 'Highport', 'Redfen', 'Saltmarsh', 'the Reach', 'Blackmoor',
  'Thornvale', 'Ironhold', 'the Hollow', 'Aldmar', 'Westcairn', 'Duskwood',
];
const FACTIONS = [
  'Saltmarsh League', 'Cult of the Hollow', 'Ironhold Guild', 'Crown Wardens',
  'Ashen Hand', 'Free Companies', 'Verdant Pact', 'Night Bazaar',
];
const CHARACTERS = [
  'Mara', 'Borin', 'Sela', 'Kael', 'Idris', 'Vonn', 'Tamsin', 'Garrek',
  'Lyra', 'Osric', 'Pell', 'Wren',
];
const CONTINENTS = ['Aldmar', 'Veska', 'Korrath'];

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export interface MockOpts {
  events?: number; // total beat count
  spans?: number; // act/mission bars
  startYear?: number;
  yearSpan?: number; // events spread across [startYear, startYear+yearSpan)
  seed?: number;
}

export function generateMockData(opts: MockOpts = {}): TimelineData {
  const {
    events: eventCount = 2000,
    spans: spanCount = 60,
    startYear = 1300,
    yearSpan = 200,
    seed = 1,
  } = opts;

  const rand = rng(seed);
  const pick = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];

  // Track distribution: world is the densest lane, the rest fan out across
  // named members so the swimlane view gets many rows.
  const trackFor = (): string => {
    const roll = rand();
    if (roll < 0.35) return 'world';
    if (roll < 0.45) return 'party';
    if (roll < 0.7) return `faction:${pick(FACTIONS)}`;
    if (roll < 0.92) return `character:${pick(CHARACTERS)}`;
    return `continent:${pick(CONTINENTS)}`;
  };

  const randDate = (): string => {
    const year = startYear + Math.floor(rand() * yearSpan);
    const month = 1 + Math.floor(rand() * 12);
    const day = 1 + Math.floor(rand() * 30);
    return `${year}-${pad(month)}-${pad(day)}`;
  };

  const events: TimelineEvent[] = [];
  for (let i = 0; i < eventCount; i++) {
    const weightRoll = rand();
    const ev: TimelineEvent = {
      date: randDate(),
      label: `${pick(PLACES)} ${pick(WORDS)} #${i}`,
      track: trackFor(),
    };
    if (weightRoll < 0.08) ev.major = true;
    else if (weightRoll > 0.6) ev.minor = true;
    if (rand() < 0.5) ev.source = `historian/events/mock-${i}.md`;
    events.push(ev);
  }

  const spans: Span[] = [];
  for (let i = 0; i < spanCount; i++) {
    const s = startYear + Math.floor(rand() * yearSpan);
    const len = 1 + Math.floor(rand() * 6);
    spans.push({
      start: `${s}-01-01`,
      end: `${Math.min(s + len, startYear + yearSpan)}-12-30`,
      label: `Act ${i + 1}: the ${pick(WORDS)}`,
      track: i % 2 === 0 ? 'party' : 'world',
      source: `scheduler/acts/mock-act-${i}.md`,
    });
  }

  return { calendar: null, events, spans };
}
