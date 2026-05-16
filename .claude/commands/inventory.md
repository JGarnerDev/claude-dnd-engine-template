Scan every markdown file inside `./data` and produce a free entity inventory report.

For each file, read its YAML frontmatter and extract: `name`, `type`, `subtype`, `importance`, and `active`.

Only include files where `exists: false`.

Report format:

1. A summary table grouped by `type` (and `subtype` where present), showing the count of free entities in each group.
2. Under each group, list each entity by name, with `importance` and `active` shown inline.
3. A **Gaps** section at the end listing any types that have zero free entities. Check all campaign-relevant entity pool types:
   `character/npc`, `event`, `faction`, `item/magic`, `location/city`, `location/dungeon`, `location/region`, `location/shop`, `location/wilderness`, `rumor`
   (Omit `class`, `race`, `deity` — these are canonical reference data, not session-generation pool types.)

Keep the report concise — this is a planning tool, not a narrative document.
