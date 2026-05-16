---
tags:
  - schema
---

# Creature Schema

Extends: `entity.md`

Covers notable monsters and beasts with personality, recurring presence, or narrative significance — named creatures that matter to the story, not generic stat-block filler. A random goblin patrol does not need a file; Strahd's named nightmare steed does.

---

## Player Form

*This form is primarily DM-facing. Required answers are marked with \*.*

**\* Name:** What is this creature called?

**\* Creature type:** What 5e creature type is it — undead, beast, humanoid, aberration, fiend, monstrosity, dragon, construct, elemental, fey, giant, ooze, plant, or other?

**\* Challenge rating:** What is its CR? Approximate is fine.

**\* Where it lives:** Where is it based or most often encountered?

**\* Why it matters:** What makes this creature significant — is it a recurring antagonist, a named guardian, a companion, a mystery, or something else?

**Personality (optional):** Does it have distinct behavioral traits, drives, or quirks?

**Goals (optional):** What does it want, if anything?

**Weaknesses (optional):** Narrative or mechanical vulnerabilities worth flagging.

---

## Schema

### Canonical Path
`data/creatures/{name}.md`

### Valid State Values
| State | Meaning |
|---|---|
| `alive` | Active in the world |
| `dead` | Confirmed destroyed or slain |
| `dormant` | Sleeping, hibernating, or otherwise inactive |
| `imprisoned` | Captured, bound, or otherwise contained |
| `transformed` | Significantly altered — polymorphed, corrupted, etc. |
| `unknown` | Status unclear |

### Frontmatter Template

```yaml
---
# --- MANDATORY (entity base) ---
name: ""
type: creature
exists: false
state: alive | dead | dormant | imprisoned | transformed | unknown
tags:
  - creature

# --- MANDATORY (creature) ---
creature_type: undead | beast | humanoid | aberration | fiend | monstrosity | dragon | construct | elemental | fey | giant | ooze | plant | other
challenge_rating: ""    # CR value, e.g. "5" or "1/2"
location: [[Location Name]]

# --- OPTIONAL (entity base) ---
aliases:
  - ""
importance: critical | major | minor | background
active: true | false
last_updated: [[Session NN - Title]]
relates_to:
  - [[Entity Name]] (relationship)
known_by:
  - [[Character Name]] (partial | full)
description: ""

# --- OPTIONAL (creature) ---
personality: ""
goals: []
motives: []
lair: [[Location Name]]     # specific lair if distinct from location
allies:
  - [[Character or Creature Name]] (nature of relationship)
enemies:
  - [[Character or Faction Name]] (nature of conflict)
tactics: ""         # brief combat or behavioral notes
weaknesses: ""      # narrative or mechanical vulnerabilities
stat_block: ""      # path to external stat block, or "inline" if appended to body
---
```

### Form → Frontmatter Mapping
| Form answer | Field |
|---|---|
| Name | `name`, filename |
| Creature type | `creature_type` |
| Challenge rating | `challenge_rating` |
| Where it lives | `location` |
| Why it matters | `description` |
| Personality | `personality` |
| Goals | `goals` |
| Weaknesses | `weaknesses` |
