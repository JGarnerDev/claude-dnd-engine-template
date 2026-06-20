---
type: meta
tags: [guideline, calendar, template]
epoch_year: 0
year_suffix: ""
months:
  - "January:31"
  - "February:28"
  - "March:31"
  - "April:30"
  - "May:31"
  - "June:30"
  - "July:31"
  - "August:31"
  - "September:30"
  - "October:31"
  - "November:30"
  - "December:31"
weekdays:
  - "Monday"
  - "Tuesday"
  - "Wednesday"
  - "Thursday"
  - "Friday"
  - "Saturday"
  - "Sunday"
---

# Calendar (template)

Skeleton for the campaign calendar. **Copy this file to `meta/calendar.md` and rename the months/epoch for your world** (see `meta/new-campaign-setup.md`). This template is engine material — it ships Gregorian-shaped so the engine works out of the box; the *live* campaign calendar lives in the unsynced `meta/calendar.md`.

The months, epoch, and labels live in frontmatter so `scripts/lib/common.ps1` can read them. This file is the canonical home for the calendar contract below — `meta/calendar.md` carries only the per-world values and points back here.

## Timeline date

A structured in-world date used by date-aware features (currently the `/timeline` gantt). Shape is a **flat string** `"YYYY[-MM[-DD]]"` — hyphen-separated, trailing parts optional:

```yaml
timeline_date: "1342-05-18"   # year-month-day (day precision)
timeline_date: "1342-05"      # year-month   (month precision)
timeline_date: "1342"         # year-only    (year precision)
```

- **The year segment is mandatory.** Month and day are optional, and graded precision is the point — an event known only to a year is *more honestly* recorded as `"1342"` than a guessed day.
- `month` is the **1-based index** into the frontmatter `months` list, not a name — so renaming months never breaks stored dates. `"1342-05"` means the 5th month, whatever it's called.
- A flat string (not a nested YAML map) because the frontmatter parser in `scripts/lib/common.ps1` reads scalars and lists, not nested maps. The helpers split on `-` (`Get-DatePrecision`, `Get-DateParts`).
- The free-text `date:` prose field on events (e.g. "300 years ago", "before the Sundering") stays as the human label. `timeline_date` is the machine coordinate; they coexist.

## Ordering

Timeline entries sort by a numeric key derived from the date, honoring graded precision.

- **Sort key** = `year*10000 + month*100 + day` (`Get-DateSortKey` in `scripts/lib/common.ps1`). Stable ordering across mixed-precision dates.
- **Partial-date resolution:** a missing `month` resolves to the start of the year (month 1, day 1); a missing `day` resolves to the start of the month (day 1). So a year-only date anchors at that year's first day.
- The sort key composites the calendar-relative year directly — `epoch_year` and `year_suffix` are display-only (applied by `Get-Calendar` when labelling), not folded into ordering.

`scripts/lib/common.ps1` owns the date helpers (`Get-DatePrecision`, `Get-DateParts`, `Get-DateSortKey`, `Get-PlotDate`). Nothing else recomputes them — callers reference the helpers.

## Precision

How complete a timeline date is: `year` | `month` | `day` (`Get-DatePrecision` = segment count). The gantt renders precision as **bar width** — a year-only date spans the whole year, a month-precise date spans the month, a full date is a one-day milestone. Uncertainty shows as width; the chart never fakes precision it lacks.

## Proxy date (rendering only)

Mermaid's `gantt` uses a Gregorian date engine. `Get-PlotDate` maps a timeline date onto a real `[datetime]` (clamped to ≤12 months / ≤28 days so any custom calendar still yields a valid Gregorian date) that mermaid plots **roughly proportional** — orientation, not true scale. The real in-world date rides on the task label. For spans too large to tick, `/timeline` switches to compressed-sequence mode: synthetic evenly-spaced proxy dates, blank axis, real date in the label. Proxy dates are an internal rendering detail — never written back to entity files.

## Renaming for your world

In your copied `meta/calendar.md`, edit the frontmatter only:

- **`months`** — replace with your world's months as `"Name:days"` strings, in order. Any count, any lengths. Keep them as a flat list (the parser reads lists, not maps).
- **`epoch_year`** — the year your reckoning counts from (often a founding or cataclysm). Stored years are relative to this.
- **`year_suffix`** — appended to displayed years (e.g. `DR`, `AE`). Blank for none.
- **`weekdays`** — the day cycle, if your world names days. Optional; unused by the gantt, available to future features.

No code changes — the helper and `/timeline` read whatever is in `meta/calendar.md` (falling back to this template's defaults if that file is absent).
