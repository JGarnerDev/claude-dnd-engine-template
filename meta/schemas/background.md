---
tags:
  - schema
---

# Background Schema

Extends: `entity.md`

Covers character backgrounds. Each file represents a background as available in this campaign — the DM may restrict options. For standard PHB backgrounds, files are pre-populated.

---

## Player Form

*Use this when adding a custom or modified background. For standard PHB backgrounds, files are pre-populated.*

**\* Name:** What is this background called?

**\* Availability:** Is it open to players, restricted (DM approval needed), or unavailable?

**Restrictions or modifications:** Anything about this background that differs from canonical rules in your campaign?

---

## Schema

### Canonical Path

`data/backgrounds/{name}.md`

### Valid State Values

| State | Meaning |
|---|---|
| `available` | Open to players without restriction |
| `restricted` | Allowed with DM approval |
| `unavailable` | Not permitted in this campaign |

### Frontmatter Template

```yaml
---
# --- MANDATORY (entity base) ---
name: ""
type: background
exists: false
state: available | restricted | unavailable
tags:
  - background

# --- MANDATORY (background) ---
skill_proficiencies: []     # exactly two skills
feature: ""                 # name of the background feature

# --- OPTIONAL (background) ---
tool_proficiencies: []      # tools, instruments, or gaming sets
language_proficiencies: ""  # e.g. "Any two languages" or "Thieves' cant"
equipment: []               # starting equipment list
variants: []                # official variant names (e.g. Spy for Criminal)
source: PHB

# --- OPTIONAL (entity base) ---
importance: minor
active: true
description: ""
---
```

### Form → Frontmatter Mapping

| Form answer | Field |
|---|---|
| Name | `name`, filename |
| Availability | `state` |
| Restrictions or modifications | body prose |
