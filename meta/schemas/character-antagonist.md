---
tags:
  - schema
---

# Character — Antagonist Schema

Extends: `entity.md`

Covers NPCs who are actively hostile to the party. When a neutral or friendly NPC turns hostile, move their file from `data/characters/npcs/` to `data/characters/antagonists/` and update `subtype` to `antagonist`.

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
`data/characters/antagonists/{name}.md`

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
subtype: antagonist
exists: false
state: alive | dead | missing | imprisoned | transformed
tags:
  - character
  - character/antagonist

# --- MANDATORY (antagonist) ---
location: [[Location Name]]
personality: ""
livelihood: ""
disposition: hostile

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

# --- OPTIONAL (antagonist) ---
background: ""
race: ""
class: ""
level:
goals: []
motives: []
allies:
  - [[Character or Faction Name]] (nature of relationship)
family:
  - [[Character Name]] (relation)
enemies:
  - [[Character or Faction Name]] (nature of conflict)
character_sheet: ""    # path to sheet file, or inline summary
human_detail: ""       # recommended for all antagonists: one comprehensible motive, mundane habit, or thing they protect
---
```

### Body Template

Every `[[wiki-link]]` in frontmatter must also appear in the body. Include a reference block near the top:

```markdown
Location: [[Location Name]] | Campaign: [[Campaign Name]]

Race: [[Race Name]] | Class: [[Class Name]] | Background: [[Background Name]]
```

Omit any line for values that are unknown — do not create dead placeholder links.

Fill `human_detail` for all antagonists regardless of importance — even minor ones. One comprehensible reason, mundane habit, or thing they protect separates them from obstacle NPCs and makes encounters land harder.

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
| Goals | `goals` |
| Motives | `motives` |
| Friends | `allies` |
| Family | `family` |
| Enemies | `enemies` |
| Character sheet detail | `character_sheet` |
