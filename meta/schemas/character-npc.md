---
tags:
  - schema
---

# Character — NPC Schema

Extends: `entity.md`

Covers any non-player character: townsfolk, antagonists, merchants, quest-givers, etc.

---

## Player Form

*Answer these questions and give them to your DM or paste them into chat. Required answers are marked with \*.*

**\* Name:** What is this character's name?

**\* Location:** Where are they based or most often found?

**\* Personality:** Describe them in a few words or sentences — what's the immediate impression?

**\* How they make a living:** What do they do day-to-day to survive or thrive?

**\* Goals and motives:** What do they want, and why do they want it?

**Friends, family, enemies (optional):** Who are the important people in their life, and what is the relationship?

**Character sheet detail (optional):** Race, class, level, any notable stats or abilities.

---

## Schema

### Canonical Path
`data/characters/npcs/{name}.md`

### Valid State Values
| State | Meaning |
|---|---|
| `alive` | Living and active |
| `dead` | Deceased |
| `missing` | Whereabouts unknown |
| `imprisoned` | Captive or restrained |
| `transformed` | Significantly altered — undead, polymorphed, etc. |

### Frontmatter Template

```yaml
---
# --- MANDATORY (entity base) ---
name: ""
type: character
subtype: npc
exists: false
state: alive | dead | missing | imprisoned | transformed
tags:
  - character
  - character/npc

# --- MANDATORY (npc) ---
location: [[Location Name]]
personality: ""
livelihood: ""

# --- OPTIONAL (entity base) ---
aliases: []
importance: critical | major | minor | background
active: true | false
last_updated: [[Session NN - Title]]
relates_to:
  - [[Entity Name]] (relationship)
known_by:
  - [[Character Name]] (partial | full)
owner: [[Player Character Name]]
description: ""

# --- OPTIONAL (npc) ---
background: ""
race: ""
class: ""
level:
disposition: hostile | neutral | friendly | unknown
goals: []
motives: []
allies:
  - [[Character or Faction Name]] (nature of relationship)
family:
  - [[Character Name]] (relation)
enemies:
  - [[Character or Faction Name]] (nature of conflict)
character_sheet: ""    # path to sheet file, or inline summary
charm_hook: ""         # optional: one specific flaw, habit, fear, or absurdity that makes players want to root for them
---
```

### Body Template

Every `[[wiki-link]]` in frontmatter must also appear in the body. Include a reference block near the top:

```markdown
Location: [[Location Name]] | Campaign: [[Campaign Name]]

Race: [[Race Name]] | Class: [[Class Name]] | Background: [[Background Name]]
```

Omit any line for values that are unknown — do not create dead placeholder links.

For `disposition: friendly` or `importance: major` NPCs, consider a `charm_hook` — one specific detail (flaw, habit, fear, absurdity) that makes players want to root for them rather than just use them.

### Form → Frontmatter Mapping
| Form answer | Field |
|---|---|
| Name | `name`, filename |
| Location | `location` |
| Personality | `personality` |
| How they make a living | `livelihood` |
| Background | `background` |
| Race | `race` |
| Class/level | `class`, `level` |
| Disposition toward party | `disposition` |
| Goals | `goals` |
| Motives | `motives` |
| Friends | `allies` |
| Family | `family` |
| Enemies | `enemies` |
| Character sheet detail | `character_sheet` |
