Generate the campaign's history gantt charts — a **world-history** timeline (events across the ages) and a **party-history** timeline (sessions and acts the party lived through). Each renders as a single mermaid gantt, viewable in Obsidian or VSCode (Markdown Preview Enhanced).

**Arguments:**

- `--full` — include `secret` events (hidden by default so the charts are player-safe to show at the table)

---

## Behavior

This command runs `scripts/timeline-gantt.ps1`, which reads entity frontmatter and **overwrites** three files in `historian/timeline/`:

- `world-history.md` — one gantt of dated world events
- `party-history.md` — one gantt of session milestones + act spans
- `timeline.md` — a reference doc that embeds both charts, plus a legend

The chart files hold exactly one mermaid block each and nothing else — they are regenerated every run, so never hand-edit them. The reference doc (`timeline.md`) is safe to keep notes in below the embeds; only the `![[...]]` embeds and legend are rewritten.

---

## What gets plotted

The script is the single source of truth — it reads, you don't pre-read entities. What it pulls:

- **World history** — any `type: event` in `data/events/` or `historian/events/` with a `timeline_date`. Events without a `timeline_date` (purely relative, "ages ago") are skipped — they have no coordinate to plot.
- **Party history** — `type: session` in `historian/sessions/` with `in_world_end_date` (plotted as milestones), and `type: act` in `historian/acts/` with `timeline_start` (plotted as a span bar to `timeline_end`).

`timeline_date` / `in_world_end_date` / `timeline_start` are flat `"YYYY[-MM[-DD]]"` strings — see `meta/calendar-template.md` for the contract. Month/day are optional; precision shows as bar width (year-wide / month-wide / day-diamond).

Axes are **independent** — world history may span millennia, party history months. Each auto-scales to its own range. Goal is rough orientation, not true scale. Deep-time spans switch to a compressed even-spacing mode with the real date carried in the label.

---

## Phase 1 — Run

```powershell
.\scripts\timeline-gantt.ps1            # player-safe (secret events hidden)
.\scripts\timeline-gantt.ps1 -Full      # include secret events
```

Map `--full` → `-Full`.

---

## Phase 2 — Report

Relay the script's summary: the output path and the per-chart counts (e.g. "world-history.md (7 events), party-history.md (4 items)"). Then:

- If a chart reports `0` entries, say so plainly and name the missing field — e.g. "no party-history yet: no `historian/sessions/` file carries `in_world_end_date`." Point at `/recap` (sessions) or the event commit step (events) as where the field gets written.
- If `--full` was used, note the charts now contain secret events and are **not** player-safe to screen-share.

Open `historian/timeline/timeline.md` in preview to view both charts.

---

## Notes

- **Calendar:** month names, epoch, and year suffix come from `meta/calendar.md` (falling back to `meta/calendar-template.md`). Rename months there, not in the script.
- **No new entities** — this command only reads frontmatter and writes the three chart/reference files. It never creates or edits campaign entities.
