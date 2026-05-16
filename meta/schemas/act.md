---
tags:
  - schema
---

# Act Schema

An act is a story arc — a collection of thematically connected missions that build toward a major turning point. Think of it as a chapter: it has an opening state, a closing state, and a clear change between them.

---

## DM Form

**\* Name:** What is this act called?

**\* Campaign:** Which campaign does this belong to?

**\* Central conflict:** What is the specific tension this act revolves around — distinct from but serving the larger campaign conflict?

**\* Goal:** What does the party need to accomplish for this act to be complete?

**\* Opening state:** What is true about the world at the start of this act?

**\* Closing state:** What is true about the world when this act ends — win or lose?

**Missions (optional):** What missions make up this act? These can be added as they're created.

**Estimated sessions (optional):** Rough number of sessions this act is expected to span.

---

## Schema

### Canonical Path
`scheduler/acts/{name}.md`
Moves to `historian/acts/{name}.md` when completed.

### Valid State Values
| State | Meaning |
|---|---|
| `draft` | Being written, not ready to run |
| `planned` | Finalized, queued up but not yet started |
| `active` | Currently being played through |
| `completed` | All missions resolved, act concluded |
| `abandoned` | Dropped from the story |

### Frontmatter Template

```yaml
---
# --- MANDATORY ---
name: ""
type: act
exists: false
state: draft | planned | active | completed | abandoned
tags:
  - act/
  - campaign/

campaign: [[Campaign Name]]
central_conflict: ""
goal: ""
opening_state: ""        # what is true at the start of this act
closing_state: ""        # what is true when this act ends

# Optional fields:
missions:
  - [[Mission Name]]
themes: []
estimated_sessions:
relates_to:
  - [[Entity Name]] (relationship)
importance: critical
active: true
last_updated: [[Session NN - Title]]
description: ""

# --- HISTORIAN ONLY (mandatory when moved) ---
# outcome: ""            # what actually happened; win, loss, or something in between
# sessions_played:       # actual number of sessions
---
```

### Notes
- Each act should feel meaningfully different from the last — the party's situation, the stakes, or the nature of the conflict should shift.
- When an act completes, add `outcome` and `sessions_played` before moving to `historian/`.
