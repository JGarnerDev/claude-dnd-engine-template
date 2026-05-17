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

### Canonical Paths

**Inline** (single file):
`scheduler/sessions/session-{nn}-{name}.md`
Moves to `historian/sessions/session-{nn}-{name}.md` after play.

**Linked** (folder):
`scheduler/sessions/session-{nn}-{name}/session-{nn}-{name}.md` — main file
`scheduler/sessions/session-{nn}-{name}/encounter-{slug}.md` — one per encounter
Entire folder moves to `historian/sessions/session-{nn}-{name}/` after play.

The main file always uses the same `session-{nn}-{name}` naming convention regardless of scope.

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
locations:          # links to historian/locations/ or data/locations/ entities only — not factions
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

### Body Structure (pre-play)

The body is the DM-facing runnable document. Sections in order:

**Orientation** — party state paragraph (location, afflictions, resources, tone coming out of last session); bullet list of unresolved `new_entities` from the last session.

**Scenes** — one `#### Scene N — [Title]` block per beat. Count scales to length (Short: 3–4, Standard: 4–6, Long: 6–8). Each block:
- **Trigger** — what starts the scene
- **Location** — `[[wiki-link]]`; one-line description
- **NPCs present** — name, goal for this scene, voice note
- **Beats** — ordered bullets; branch points inline (*"if party refuses → …"*)
- **Narration** — `> *"..."*` blockquote for key moment (depth: narrated only; omit for depth: notes)
- **Transition** — what moves to next scene or likely detour
- If scope is linked: `→ see [[encounter-{slug}]]` replaces inline encounter detail

**NPC Quick-Reference** — one entry per key NPC: `[[wiki-link]]`, motivation, what they know (bullets), voice (one sentence).

**Contingencies** — 2–3 likely detours: trigger, how to handle, how to redirect.

**Closing** — how to land the closing hook; what to leave unresolved.

### Notes
- The plan and the recap live in the same file — the body holds the planned content, and `recap` captures what actually happened after play.
- `entities_canonized` tracks which `data/` entities were used and should now have matching `historian/` files created with `exists: true`.
- `new_entities` tracks anything invented at the table that needs to be backfilled into `historian/` as canon.
- For linked sessions, encounter files are part of the same session unit — they move with the folder, not independently.
