---
tags:
  - schema
---

# Mission Schema

A mission is a self-contained objective — the atomic unit of story. It has a clear goal, a reason the party cares, and meaningful consequences for both success and failure. A mission typically spans one to three sessions.

---

## DM Form

**\* Name:** What is this mission called?

**\* Act:** Which act does this mission belong to?

**\* Objective:** What does the party need to do? State it as a concrete goal.

**\* Hook:** Why does the party care — or why are they compelled to act? What pulls them in?

**\* Key locations:** Where does this mission take place?

**\* Key NPCs:** Who does the party interact with? Who drives or opposes the mission?

**Obstacles (optional):** What stands between the party and success — enemies, puzzles, moral dilemmas, time pressure?

**Success consequences (optional):** What changes if the party succeeds?

**Failure consequences (optional):** What changes if the party fails or walks away?

**Reward (optional):** What do they gain — gold, items, information, allies, narrative progress?

---

## Schema

### Canonical Path
`scheduler/missions/{name}.md`
Moves to `historian/missions/{name}.md` when resolved.

### Valid State Values
| State | Meaning |
|---|---|
| `draft` | Being written, not ready to run |
| `planned` | Ready, queued behind an active mission |
| `active` | Currently being pursued by the party |
| `completed` | Resolved successfully |
| `failed` | Resolved with failure — consequences applied |
| `abandoned` | Dropped from the story |

### Frontmatter Template

```yaml
---
# --- MANDATORY ---
name: ""
type: mission
exists: false
state: draft | planned | active | completed | failed | abandoned
tags:
  - mission/
  - act/

act: [[Act Name]]
objective: ""
hook: ""

# Optional fields:
sessions:
  - [[Session NN - Title]]
locations:
  - [[Location Name]]
key_npcs:
  - [[NPC Name]] (role)
obstacles: []
success_consequences: ""
failure_consequences: ""
reward: ""
relates_to:
  - [[Entity Name]] (relationship)
importance: major
active: true
last_updated: [[Session NN - Title]]
description: ""

# --- HISTORIAN ONLY (mandatory when moved) ---
# outcome: completed | failed
# outcome_detail: ""     # what actually happened
# sessions_played:
#   - [[Session NN - Title]]
---
```

### Notes
- Both `success_consequences` and `failure_consequences` should be filled in before a mission goes `active` — failure should matter, not just be a dead end.
- When resolved, move to `historian/missions/` and fill in the historian fields before archiving.
