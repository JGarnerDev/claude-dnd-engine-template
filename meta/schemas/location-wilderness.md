---
tags:
  - schema
---

# Location — Wilderness Schema

Extends: `entity.md`

Covers named outdoor areas between settlements: forests, mountain passes, swamps, plains, roads, rivers, coastlines. Wilderness areas belong to regions and connect locations.

---

## Player Form

*Answer these questions and give them to your DM or paste them into chat. Required answers are marked with \*.*

**\* Name:** What is this area called? (e.g. the Ashwood, the Shattered Pass, the King's Road)

**\* Region:** Which region does this belong to or pass through?

**\* Terrain type:** What kind of land is it — forest, mountain, swamp, plains, desert, coast, road, river, or something else?

**\* Safe or dangerous:** Is this generally safe to travel through, or is it actively threatening?

**Hazards (optional):** What specific dangers exist — weather, monsters, terrain, curses?

**Notable features (optional):** Anything worth naming — a crossroads, a ruin, a shrine, a ford, a resource.

**Why travel here (optional):** Is this a route between places, a destination itself, or both?

---

## Schema

### Canonical Path

`data/locations/wilderness/{name}.md`

### Valid State Values

| State | Meaning |
|---|---|
| `safe` | Navigable without significant threat |
| `dangerous` | Active monster presence or hazards |
| `contested` | Multiple factions or creatures fighting over it |
| `cursed` | Under a magical or divine affliction |
| `blighted` | Environmentally damaged — dead, diseased, or corrupted |
| `impassable` | Currently untraversable |

### Frontmatter Template

```yaml
---
# --- MANDATORY (entity base) ---
name: ""
type: location
subtype: wilderness
exists: false
state: safe | dangerous | contested | cursed | blighted | impassable
tags:
  - location
  - location/wilderness
  - location/wilderness/forest   # use a more specific tag where applicable

# --- MANDATORY (wilderness) ---
region: [[Region Name]]
terrain: forest | mountain | swamp | plains | desert | coast | road | river | other

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

# --- OPTIONAL (wilderness) ---
travel_difficulty: easy | moderate | hard | treacherous
hazards: []
notable_features: []
connects:
  - [[Location Name]]
hook: ""
---
```

### Form → Frontmatter Mapping

| Form answer | Field |
|---|---|
| Name | `name`, filename |
| Region | `region` |
| Terrain type | `terrain` |
| Safe or dangerous | `state` |
| Hazards | `hazards` |
| Notable features | `notable_features` |
| Why travel here | `hook` |
