// Responsive axis ticks (pure). Picks tick granularity from the pixel density so
// labels stay readable at any zoom: month ticks when deeply zoomed in, single
// years at mid zoom, and multi-year steps (2/5/10/25…) when zoomed out far enough
// that yearly ticks would crowd below MIN_TICK_PX. One source for both the world
// view and the swimlane (both go through computeAxis).

import { MIN_TICK_PX } from '../constants.js';
import type { Calendar, Tick } from '../types.js';

// "Nice" year steps so multi-year ticks land on round numbers (…, 1950, 1960).
const NICE_YEAR_STEPS = [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000];

// Smallest step whose pixel spacing clears MIN_TICK_PX; extends past the table by
// ×10 for extreme zoom-outs (millennia).
export function yearStepFor(pxPerYear: number): number {
  for (const step of NICE_YEAR_STEPS) {
    if (step * pxPerYear >= MIN_TICK_PX) return step;
  }
  let step = NICE_YEAR_STEPS[NICE_YEAR_STEPS.length - 1];
  while (step * pxPerYear < MIN_TICK_PX) step *= 10;
  return step;
}

export function buildTicks(
  minIdx: number,
  maxIdx: number,
  cal: Calendar,
  pxPerYear: number,
  xOf: (idx: number) => number,
): Tick[] {
  const daysPerYear = cal.months.reduce((s, m) => s + m.days, 0);
  const monthsPerYear = cal.months.length;
  const firstYear = Math.floor(minIdx / daysPerYear);
  const lastYear = Math.floor(maxIdx / daysPerYear);
  const yearLabel = (y: number) => (cal.epochLabel ? `${y} ${cal.epochLabel}` : `${y}`);
  const ticks: Tick[] = [];

  // Month granularity — only when an average month is wide enough to label. The
  // first month of each year carries the year number; the rest the month name.
  if (monthsPerYear > 0 && pxPerYear / monthsPerYear >= MIN_TICK_PX) {
    for (let y = firstYear; y <= lastYear; y++) {
      let dayAcc = y * daysPerYear;
      for (let m = 0; m < monthsPerYear; m++) {
        ticks.push({ label: m === 0 ? yearLabel(y) : cal.months[m].name, x: xOf(dayAcc) });
        dayAcc += cal.months[m].days;
      }
    }
    return ticks;
  }

  // Year / multi-year granularity, aligned to the chosen nice step.
  const step = yearStepFor(pxPerYear);
  for (let y = firstYear; y <= lastYear; y++) {
    if ((((y % step) + step) % step) !== 0) continue; // keep multiples of step (negatives too)
    ticks.push({ label: yearLabel(y), x: xOf(y * daysPerYear) });
  }
  return ticks;
}
