---
tags:
  - schema
---

# Race Schema

Extends: `entity.md`

Covers playable and non-playable races. Each file represents the race as it exists in this campaign world — the DM may override canonical defaults to fit the setting.

---

## Player Form

*Use this when defining how a race exists in your world. Required answers are marked with \*.*

**\* Name:** What is this race called in your world?

**\* How common are they:** Are they widespread, regional, rare, reclusive, or typically encountered as monsters?

**Homeland:** Do they have a recognized homeland or region? If scattered, where do concentrations exist?

**Prejudices or alliances:** How do other races typically regard them, and vice versa?

**World-specific variations:** Anything about this race that differs from the canonical D&D description in your world?

**Patron deity (optional):** Which god or gods do they commonly worship?

---

## Schema

### Canonical Path
`data/races/{name}.md`

### Valid State Values
| State | Meaning |
|---|---|
| `widespread` | Common across many regions |
| `regional` | Found primarily in specific areas |
| `rare` | Infrequently encountered |
| `reclusive` | Mostly keeps to themselves, avoids outsiders |
| `scattered` | No homeland; found in small numbers everywhere |
| `monstrous` | Typically encountered as enemies; rare as player characters in this world |

### Frontmatter Template

```yaml
---
# --- MANDATORY (entity base) ---
name: ""
type: race
exists: false
state: widespread | regional | rare | reclusive | scattered | monstrous
tags:
  - race/
  - size/medium        # size/small, size/medium, size/large

# --- MANDATORY (race) ---
size: Small | Medium | Large
speed: 30              # base walking speed in feet

# --- OPTIONAL (entity base) ---
aliases: []
importance: critical | major | minor | background
active: true | false
last_updated: [[Session NN - Title]]
relates_to:
  - [[Entity Name]] (relationship)
description: ""

# --- OPTIONAL (race) ---
subraces: []
typical_alignment: ""
languages:
  - Common
homeland: ""           # region name or description; use [[wiki-link]] if a region file exists
patron_deity:
  - [[Deity Name]]
source: ""             # PHB, VGtM, MotM, etc.
key_traits: []         # brief list of notable racial traits; full detail goes in the body
---
```

### Form → Frontmatter Mapping
| Form answer | Field |
|---|---|
| Name | `name`, filename |
| How common | `state` |
| Homeland | `homeland` |
| Prejudices or alliances | `relates_to` or body prose |
| World-specific variations | body prose |
| Patron deity | `patron_deity` |
