---
tags:
  - schema
---

# Deity Schema

Extends: `entity.md`

Covers gods, demigods, dead gods, primordials, and other divine or cosmic entities. Deities are distinct from factions — they are cosmic forces with material consequences, not just organizations with power.

---

## Player Form

*Answer these questions and give them to your DM or paste them into chat. Required answers are marked with \*.*

**\* Name:** What is this deity called? Include titles or epithets if any.

**\* Domain(s):** What does this god represent or govern — war, death, harvest, trickery, knowledge, etc.?

**\* Moral character:** How would you describe their alignment or disposition?

**\* Current status:** Are they active and present, silent and distant, dead, imprisoned, or something else?

**\* Who worships them:** What peoples, factions, or cultures follow this deity and why?

**\* What do they want from mortals:** What do they ask, demand, or reward?

**Symbol, holy day, or sacred practice (optional):** How is worship expressed?

**Myths or divine history (optional):** Any known stories, wars between gods, or defining divine acts.

---

## Schema

### Canonical Path
`data/deities/{name}.md`

### Valid State Values
| State | Meaning |
|---|---|
| `active` | Present and responsive to worship |
| `dormant` | Exists but silent or unreachable |
| `diminished` | Weakened — fewer followers, less power |
| `dead` | Slain; may still have effects on the world |
| `imprisoned` | Bound by another force |
| `ascended` | Recently became divine |

### Frontmatter Template

```yaml
---
# --- MANDATORY (entity base) ---
name: ""
type: deity
exists: false
state: active | dormant | diminished | dead | imprisoned | ascended
tags:
  - deity
  - deity/war         # add one per domain — e.g. deity/war, deity/death, deity/trickery

# --- MANDATORY (deity) ---
tier: greater | intermediate | lesser | demigod
domains: []
moral_character: ""     # alignment or disposition in plain language
worshippers:
  - [[Faction or Culture Name]]
wants: ""

# --- OPTIONAL (entity base) ---
aliases:
  - ""    # other names, titles, aspects
importance: critical | major | minor | background
active: true | false
last_updated: [[Session NN - Title]]
relates_to:
  - [[Entity Name]] (relationship)
known_by:
  - [[Character Name]] (partial | full)
description: ""

# --- OPTIONAL (deity) ---
symbol: ""
holy_day: ""
sacred_practices: []
myths: []
divine_conflicts:
  - [[Deity Name]] (nature of conflict)
---
```

### Form → Frontmatter Mapping
| Form answer | Field |
|---|---|
| Name | `name`, filename |
| Domain(s) | `domains` |
| Moral character | `moral_character` |
| Current status | `state` |
| Who worships them | `worshippers` |
| What they want | `wants` |
| Symbol/holy day/practice | `symbol`, `holy_day`, `sacred_practices` |
| Myths or history | `myths`, body prose |
