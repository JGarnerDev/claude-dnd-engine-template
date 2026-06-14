---
tags:
  - schema
---

# Faction Schema

Covers any organized group: nations, guilds, cults, gangs, political movements, etc.

---

## Player Form

*Answer these questions and give them to your DM or paste them into chat. Required answers are marked with \*.*

**\* Name:** What is this faction called?

**\* Location(s):** Where do they operate? List any cities, regions, or landmarks.

**\* Why they exist:** What is their founding purpose — commerce, political power, military force, religion, crime, something else?

**\* How they exist:**

- What do they actually want right now (motives)?
- What pressures or conflicts threaten them internally or externally (tensions)?
- How are they organized — flat, hierarchical, cell-based (composition & hierarchy)?
- Who leads them, and how did they get that power (rulership)?
- How do they sustain themselves — trade, tribute, theft, magic (livelihood)?

**\* Allies & Opposition:** Who are their friends and enemies? Other factions, individuals, or powers?

---

## Schema

### Canonical Path

`data/factions/{name}.md`

### Valid State Values

| State | Meaning |
|---|---|
| `active` | Operating normally |
| `fractured` | Internal conflict, weakened |
| `dormant` | Inactive but not gone |
| `at-war` | In open conflict |
| `exiled` | Displaced from home territory |
| `dissolved` | No longer exists |

### Frontmatter Template

```yaml
---
# --- MANDATORY (entity base) ---
name: ""
type: faction
exists: false
state: active | fractured | dormant | at-war | exiled | dissolved
tags:
  - faction/         # e.g. faction/guild, faction/nation, faction/cult
  - region/

# --- MANDATORY (faction) ---
locations:
  - [[Location Name]]
purpose: commerce | political | military | religious | criminal | arcane | other

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

# --- OPTIONAL (faction) ---
rulership: [[NPC Name]]
motives: []
tensions: []
hierarchy: ""
livelihood: ""
allies:
  - [[Entity Name]] (nature of alliance)
opposition:
  - [[Entity Name]] (nature of conflict)
---
```

### Form → Frontmatter Mapping

| Form answer | Field |
|---|---|
| Name | `name`, filename |
| Location(s) | `locations` |
| Why they exist | `purpose` |
| Motives | `motives` |
| Tensions | `tensions` |
| Composition & hierarchy | `hierarchy` |
| Rulership | `rulership` |
| Livelihood | `livelihood` |
| Allies | `allies` |
| Opposition | `opposition` |
