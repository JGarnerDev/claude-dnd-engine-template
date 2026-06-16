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

A structured in-world date used by date-aware features (currently the `/timeline` gantt). Shape:

```yaml
timeline_date:
  year: 1342      # required
  month: 5        # optional — 1-based index into `months`
  day: 18         # optional — 1-based day within the month
```

- **`year` is mandatory.** `month` and `day` are optional, and graded precision is the point — an event known only to a year is *more honestly* recorded as a year than a guessed day.
- `month` is the **1-based index** into the frontmatter `months` list, not a name — so renaming months never breaks stored dates.
- The free-text `date:` prose field on events (e.g. "300 years ago", "before the Sundering") stays as the human label. `timeline_date` is the machine coordinate; they coexist.

## Absolute day index

The single sort key and axis coordinate. Days elapsed from the epoch to the timeline date.

- **Epoch** = day 1 of month 1 of `epoch_year`. Years before the epoch are negative.
- **Partial-date resolution:** a missing `month` resolves to the start of the year (month 1, day 1); a missing `day` resolves to the start of the month (day 1). So a year-only date anchors at that year's first day.
- A year's length = sum of all `months` day-counts (default 365). No leap rule by default — add one in the helper only if a world needs it.

`scripts/lib/common.ps1` implements the conversion (`ConvertTo-DayIndex`). Nothing else recomputes it — callers reference the helper.

## Precision

How complete a timeline date is: `year` | `month` | `day`. The gantt renders precision as **bar width** — a year-only date spans the whole year, a month-precise date spans the month, a full date is a one-day milestone. Uncertainty shows as width; the chart never fakes precision it lacks.

## Proxy date (rendering only)

Mermaid's `gantt` uses a Gregorian date engine. The render helper offsets the absolute day index onto a real-date epoch to produce a proxy `YYYY-MM-DD` that mermaid plots **proportionally correct**; the real in-world date rides on the task label. Custom-calendar correctness lives in the conversion here, never in the mermaid block. Proxy dates are an internal rendering detail — never written back to entity files.

## Renaming for your world

In your copied `meta/calendar.md`, edit the frontmatter only:

- **`months`** — replace with your world's months as `"Name:days"` strings, in order. Any count, any lengths. Keep them as a flat list (the parser reads lists, not maps).
- **`epoch_year`** — the year your reckoning counts from (often a founding or cataclysm). Stored years are relative to this.
- **`year_suffix`** — appended to displayed years (e.g. `DR`, `AE`). Blank for none.
- **`weekdays`** — the day cycle, if your world names days. Optional; unused by the gantt, available to future features.

No code changes — the helper and `/timeline` read whatever is in `meta/calendar.md` (falling back to this template's defaults if that file is absent).
