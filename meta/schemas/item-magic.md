---
tags:
  - schema
---

# Item — Magic Schema

Extends: `entity.md`

Covers magic items with narrative weight: weapons, armor, wondrous items, artifacts. Mundane items only need a file if they carry significant story meaning.

---

## Player Form

*Answer these questions and give them to your DM or paste them into chat. Required answers are marked with \*.*

**\* Name:** What is the item called? If unidentified, describe it.

**\* Item type:** Weapon, armor, ring, wondrous item, rod, staff, wand, ammunition, or other?

**\* Rarity:** Common, uncommon, rare, very rare, legendary, or artifact?

**\* Requires attunement?** If yes, by whom or what (any creature, a spellcaster, a specific class, etc.)?

**\* Origin:** Who made it, why, and roughly when? Even a legend or rumor counts.

**\* What it does:** Brief mechanical or narrative effect. Does not need to be a full stat block.

**Quirks or personality (optional):** Does it have a personality, a curse, unusual behavior, or preferences?

**Current holder or location (optional):** Who has it, or where is it?

---

## Schema

### Canonical Path
`data/items/magic/{name}.md`

### Valid State Values
| State | Meaning |
|---|---|
| `unidentified` | Exists but properties unknown |
| `identified` | Properties known |
| `attuned` | Currently attuned to a creature |
| `dormant` | Temporarily inert or suppressed |
| `lost` | Location unknown |
| `destroyed` | No longer functional |
| `cursed` | Actively harmful, difficult to remove |

### Frontmatter Template

```yaml
---
# --- MANDATORY (entity base) ---
name: ""
type: item
subtype: magic
exists: false
state: unidentified | identified | attuned | dormant | lost | destroyed | cursed
tags:
  - item/magic
  - item/magic/weapon    # use a more specific tag where applicable

# --- MANDATORY (magic item) ---
item_type: weapon | armor | ring | wondrous | rod | staff | wand | ammunition | other
rarity: common | uncommon | rare | very-rare | legendary | artifact
attunement: false         # or true, or a string describing who can attune
origin: ""
effect: ""

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

# --- OPTIONAL (magic item) ---
current_holder: [[Character or Location Name]]
quirks: []
history: []    # significant past owners or events involving this item
---
```

### Form → Frontmatter Mapping
| Form answer | Field |
|---|---|
| Name | `name`, filename |
| Item type | `item_type` |
| Rarity | `rarity` |
| Requires attunement | `attunement` |
| Origin | `origin` |
| What it does | `effect` |
| Quirks or personality | `quirks` |
| Current holder/location | `current_holder` |
