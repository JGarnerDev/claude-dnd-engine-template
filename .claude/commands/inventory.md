Scan the free entity pool in `./data` and produce an inventory report.

**Step 1 — Run the inventory script (no manual file reads):**

```powershell
.\scripts\inventory-brief.ps1
```

It scans every markdown file under `data/`, keeps only free entities (`exists: false`), and prints them grouped by `type`/`subtype` with `importance`, `active`, and `contributed_by` inline — plus a **GAPS** section listing pool types with zero free entities. Reference catalogs (`exists: true` — monsters, spells, deities, etc.) are excluded automatically. Do not re-read the underlying files; the script output is the complete signal set. Open an entity file only if the user asks a follow-up about a specific one.

A `-Type <type>` flag filters to one type group (e.g. `.\scripts\inventory-brief.ps1 -Type faction`).

**Step 2 — Present the report:**

1. A summary grouped by `type` (and `subtype` where present), showing the count of free entities in each group.
2. Under each group, list each entity by name, with `importance` and `active` shown inline.
3. A **Gaps** section at the end — pool types with zero free entities signal where to create content. The script checks: `character/npc`, `event`, `faction`, `item/magic`, `location/city`, `location/dungeon`, `location/region`, `location/shop`, `location/wilderness`, `rumor`. (`class`, `race`, `deity` are canonical reference data, not session-generation pool types.) If gaps exist, close the report with one line naming the fill paths: `/pitch --type <x>` to brainstorm material now, or `/entity-questionnaire --type <x>` to hand the design to a player. One line total, not one per gap.

Keep the report concise — this is a planning tool, not a narrative document.
