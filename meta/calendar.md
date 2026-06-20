---
type: meta
tags: [guideline, calendar]
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

# Calendar

This campaign's in-world calendar — the live config read by `scripts/lib/common.ps1` and `/timeline`. Currently Gregorian-shaped (the default). Rename the `months`, set `epoch_year`, and add a `year_suffix` to fit this world; edit frontmatter only, no code.

**Rules and contract** (timeline-date shape, absolute day index, precision, proxy dates) live in `meta/calendar-template.md` — this file holds only the per-world values. Built per campaign from that template (see `meta/new-campaign-setup.md`); not synced to the engine template repo.
