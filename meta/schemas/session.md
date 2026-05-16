---
tags:
  - schema
---

# Session Schema

A session is a single play session — typically three to four hours. The session file starts as a plan in `scheduler/sessions/` and moves to `historian/sessions/` after play, updated with what actually happened.

---

## DM Form

**\* Session number:** What number is this session?

**\* Mission:** Which mission does this session primarily advance?

**\* Planned date:** When is this session scheduled?

**\* Opening scene:** How does the session begin — where are the players, what's immediately in front of them?

**\* Closing hook:** How should the session end — what cliffhanger or question sends players home wanting more?

**Key locations:** Where does the session take place?

**Key NPCs:** Who do the players interact with this session?

**Encounters (optional):** Any planned combat, social, or exploration encounters.

**Loose threads to address (optional):** Any unresolved questions or promises from previous sessions.

---

## Schema

### Canonical Path
`scheduler/sessions/session-{nn}-{name}.md`
Moves to `historian/sessions/session-{nn}-{name}.md` after play.

### Valid State Values
| State | Meaning |
|---|---|
| `draft` | Being planned, not finalized |
| `planned` | Finalized and ready to run |
| `completed` | Played — file should be moved to historian |
| `skipped` | Scheduled but not played |

### Frontmatter Template

```yaml
---
# --- MANDATORY ---
name: ""
type: session
exists: false
state: draft | planned | completed | skipped
tags:
  - session/
  - act/
  - mission/

session_number:
mission: [[Mission Name]]
planned_date: ""

# Optional fields:
locations:
  - [[Location Name]]
key_npcs:
  - [[NPC Name]] (role)
encounters: []
loose_threads: []
opening_scene: ""
closing_hook: ""
relates_to:
  - [[Entity Name]] (relationship)
importance: major
active: true
description: ""

# --- HISTORIAN ONLY (mandatory when moved) ---
# played_date: ""
# recap: ""              # what actually happened — may differ from the plan
# entities_canonized:    # data/ entities that became real this session
#   - [[Entity Name]]
# new_entities:          # net-new entities created during play
#   - [[Entity Name]]
# cliffhanger: ""        # what the party is left with going into next session
---
```

### Notes
- The plan and the recap live in the same file — the body holds the planned content, and `recap` captures what actually happened after play.
- `entities_canonized` tracks which `data/` entities were used and should now have matching `historian/` files created with `exists: true`.
- `new_entities` tracks anything invented at the table that needs to be backfilled into `historian/` as canon.
