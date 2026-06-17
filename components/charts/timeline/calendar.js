// Calendar engine for the timeline view.
//
// Pure and dependency-free. Converts dates on an arbitrary (often fantasy)
// calendar into a monotonic day index, then into an x pixel coordinate.
//
// A calendar is: { epochLabel: string, months: [{ name, days }, ...] }.
// With no calendar supplied we use DEFAULT_CALENDAR (twelve 30-day months):
// a clean, monotonic fallback that's good enough for ordering and placement.
// Supply a config for real fantasy month systems (custom names / lengths).

export const DEFAULT_CALENDAR = {
  epochLabel: '',
  months: Array.from({ length: 12 }, (_, i) => ({ name: `Month ${i + 1}`, days: 30 })),
};

// Parse "YYYY[-MM[-DD]]" -> { year, month, day }. Missing parts default to 1.
// Negative (pre-epoch) years allowed: "-300-02-01".
export function parseDate(str) {
  if (typeof str !== 'string') {
    throw new TypeError(`date must be a string, got ${typeof str}`);
  }
  const m = str.trim().match(/^(-?\d+)(?:-(\d{1,2}))?(?:-(\d{1,2}))?$/);
  if (!m) throw new Error(`unparseable date: "${str}"`);
  return {
    year: parseInt(m[1], 10),
    month: m[2] ? parseInt(m[2], 10) : 1,
    day: m[3] ? parseInt(m[3], 10) : 1,
  };
}

function daysPerYear(cal) {
  return cal.months.reduce((sum, mo) => sum + mo.days, 0);
}

// Absolute day index from year 0, month 1, day 1. Monotonic across the calendar,
// so it doubles as a sort key and as the domain value for createScale.
export function dayIndex(date, cal = DEFAULT_CALENDAR) {
  const { year, month, day } = date;
  if (month < 1 || month > cal.months.length) {
    throw new RangeError(`month ${month} out of range 1..${cal.months.length}`);
  }
  let before = 0;
  for (let i = 0; i < month - 1; i++) before += cal.months[i].days;
  return year * daysPerYear(cal) + before + (day - 1);
}

// Linear scale: day index -> x in [0, width]. min maps to 0, max maps to width.
// Degenerate domain (min === max) maps everything to 0.
export function createScale(minIndex, maxIndex, width) {
  const span = maxIndex - minIndex;
  return (index) => (span === 0 ? 0 : ((index - minIndex) / span) * width);
}
