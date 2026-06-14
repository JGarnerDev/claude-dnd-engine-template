---
tags:
  - schema
---

# Character — PC Schema

Extends: `entity.md`

Covers player characters. Unlike NPCs, PCs are owned by a player and link to that player's preference file. This schema captures the narrative and relational layer — mechanical stats live in the character sheet.

---

## Player Form

*Fill this out for your own character. Required answers are marked with \*.*

**\* Character name:**

**\* Your name (or handle):**

**\* Race and class(es):** Include level if known.

**\* Where are you from:** Homeland, birthplace, or the place that shaped you most.

**\* Why are you adventuring:** What drove you out into the world?

**\* What do you want:** Your character's goals — short term and long term.

**What secret or burden do you carry (optional):** Something others don't know, or something that weighs on you.

**Who matters to you (optional):** Allies, family, rivals, enemies — anyone with a relationship worth tracking.

---

## Schema

### Canonical Path
`data/characters/pcs/{name}.md`

### Valid State Values
| State | Meaning |
|---|---|
| `active` | Currently playing |
| `dead` | Deceased |
| `retired` | Out of active play by choice |
| `missing` | Whereabouts unknown in-world |
| `transformed` | Significantly altered — undead, polymorphed, etc. |

### Frontmatter Template

```yaml
---
# --- MANDATORY (entity base) ---
name: ""
type: character
subtype: pc
exists: false
state: active | dead | retired | missing | transformed
tags:
  - character
  - character/pc
  - player/          # player/<name>, e.g. player/alice

# --- MANDATORY (pc) ---
player: [[meta/players/player-name]]   # links to meta/players/{name}.md
race: ""
class: ""
level:

# --- OPTIONAL (entity base) ---
aliases:
  - ""    # nicknames, titles
importance: critical | major | minor | background
active: true | false
last_updated: [[Session NN - Title]]
relates_to:
  - [[Entity Name]] (relationship)
known_by:
  - [[Character Name]] (partial | full)
description: ""

# --- OPTIONAL (pc) ---
background: ""
homeland: [[Location Name]]
motivation: ""
goals: []
secrets: []
allies:
  - [[Character or Faction Name]] (relationship)
family:
  - [[Character Name]] (relation)
enemies:
  - [[Character or Faction Name]] (nature of conflict)
character_sheet: ""    # path to sheet file or external link
---
```

### Body Template

Every `[[wiki-link]]` in frontmatter must also appear in the body. Include a reference block near the top:

```markdown
Campaign: [[Campaign Name]] | Player: [[Player Name]]

Race: [[Races]] | Class: [[Class Name]] | Background: [[Background Name]]
```

Omit any line for values that are unknown — do not create dead placeholder links.

### Form → Frontmatter Mapping
| Form answer | Field |
|---|---|
| Character name | `name`, filename |
| Your name/handle | `player` (link to their `meta/players/` file — create one if it doesn't exist) |
| Race and class | `race`, `class`, `level` |
| Background | `background` |
| Where from | `homeland` |
| Why adventuring | `motivation` |
| What you want | `goals` |
| Secret or burden | `secrets` |
| Who matters to you | `allies`, `family`, `enemies` |
