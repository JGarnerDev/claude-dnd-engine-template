---
tags:
  - schema
---

# Item — Mundane Schema

Extends: `entity.md`

Covers significant non-magic objects that carry narrative weight: heirlooms, quest items, relics, trophies, key documents, or any physical object that matters to the story. Ordinary gear that has no story importance does not need a file.

---

## Player Form

*Answer these questions and give them to your DM or paste them into chat. Required answers are marked with \*.*

**\* Name:** What is this object called?

**\* Why it matters:** What makes this item significant — is it an heirloom, a quest target, a trophy, a piece of evidence, or something else?

**\* Origin:** Who made it, owned it, or where did it come from?

**\* Current condition:** Is it intact, damaged, or broken?

**Appearance (optional):** What does it look like — material, size, distinctive markings?

**Current holder or location (optional):** Who has it, or where is it?

**History (optional):** Any significant past owners or events involving this item.

---

## Schema

### Canonical Path
`data/items/mundane/{name}.md`

### Valid State Values
| State | Meaning |
|---|---|
| `intact` | In good condition, fully functional |
| `damaged` | Worn or partially functional |
| `broken` | Non-functional but potentially repairable |
| `lost` | Location unknown |
| `destroyed` | Gone beyond recovery |
| `hidden` | Deliberately concealed |

### Frontmatter Template

```yaml
---
# --- MANDATORY (entity base) ---
name: ""
type: item
subtype: mundane
exists: false
state: intact | damaged | broken | lost | destroyed | hidden
tags:
  - item/mundane

# --- MANDATORY (mundane item) ---
item_type: weapon | armor | tool | container | document | jewelry | trophy | heirloom | quest-item | other
origin: ""
significance: ""    # why this item matters narratively

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
owner: [[Player Character Name]]
description: ""

# --- OPTIONAL (mundane item) ---
material: ""        # primary material (iron, wood, parchment, bone, etc.)
appearance: ""      # brief physical description
current_holder: [[Character or Location Name]]
history: []         # significant past owners or events
---
```

### Form → Frontmatter Mapping
| Form answer | Field |
|---|---|
| Name | `name`, filename |
| Why it matters | `significance` |
| Origin | `origin` |
| Current condition | `state` |
| Appearance | `appearance`, `material` |
| Current holder/location | `current_holder` |
| History | `history` |
