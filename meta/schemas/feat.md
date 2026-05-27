---
tags:
  - schema
---

# Feat Schema

Extends: `entity.md`

Covers 5e feats from the Player's Handbook and major supplements. Feat files are reference material — they stay in `data/feats/` and do not move to `historian/`. Use them during character creation, NPC building, and session planning.

---

## Player Form

*DM-facing. Required answers marked with \*.*

**\* Name:** What is the feat called?

**\* Effect:** What does the feat do mechanically? (1–3 sentences)

**Prerequisite (optional):** Ability score minimum, race, proficiency, or other requirement?

**Source (optional):** Book and page number.

---

## Schema

### Canonical Path
`data/feats/{name}.md`

### Valid State Values
| State | Meaning |
|---|---|
| `available` | Legal in this campaign |
| `banned` | Disallowed for this campaign |
| `homebrew` | Custom or modified version |

### Frontmatter Template

```yaml
---
# --- MANDATORY (entity base) ---
name: ""
type: feat
exists: false
state: available
tags:
  - feat

# --- MANDATORY (feat) ---
effect: ""

# --- OPTIONAL (feat) ---
prerequisite: ""
source: ""
description: ""
aliases: []
---
```

### Form → Frontmatter Mapping
| Form answer | Field |
|---|---|
| Name | `name`, filename |
| Effect | `effect` |
| Prerequisite | `prerequisite` |
| Source | `source` |
