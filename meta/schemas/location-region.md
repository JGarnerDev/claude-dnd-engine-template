---
tags:
  - schema
---

# Location — Region Schema

Extends: `entity.md`

Covers broad geographic or political areas: nations, provinces, territories, island chains, mountain ranges. Regions contain cities, wilderness, and dungeons.

---

## Player Form

*Answer these questions and give them to your DM or paste them into chat. Required answers are marked with \*.*

**\* Name:** What is this region called?

**\* Where on the world map:** Where does it sit relative to other known places?

**\* Defining geography:** What is the dominant terrain — mountains, plains, coast, dense forest, desert, river delta?

**\* Who controls it:** Which faction, nation, or power claims or controls this region? Is that control contested?

**\* Tensions:** What pressures or conflicts shape life here — border disputes, resource wars, old wounds, unstable leadership?

**Major settlements (optional):** What cities or towns exist here? Each gets its own file.

**Notable features (optional):** Landmarks, roads, sacred sites, natural wonders, or dangerous areas.

**Climate (optional):** Anything notable about weather, seasons, or environment.

---

## Schema

### Canonical Path

`data/locations/regions/{name}.md`

### Valid State Values

| State | Meaning |
|---|---|
| `stable` | Functioning under established control |
| `contested` | Multiple powers vying for control |
| `occupied` | Under foreign or hostile control |
| `frontier` | Largely unsettled, no dominant power |
| `devastated` | Damaged by war, disaster, or magical event |

### Frontmatter Template

```yaml
---
# --- MANDATORY (entity base) ---
name: ""
type: location
subtype: region
exists: false
state: stable | contested | occupied | frontier | devastated
tags:
  - location
  - location/region

# --- MANDATORY (region) ---
geography: ""
controlling_faction: [[Faction Name]]

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

# --- OPTIONAL (region) ---
climate: ""
biome: arctic | tundra | taiga | temperate-forest | tropical-forest | grassland | savanna | desert | scrubland | wetland | coastal | alpine | volcanic | aerial | underdark | planar  # list ok: [temperate-forest, tundra]
tensions: []
settlements:
  - [[City or Town Name]]
notable_features: []
wilderness_areas:
  - [[Wilderness Name]]
---
```

### Form → Frontmatter Mapping

| Form answer | Field |
|---|---|
| Name | `name`, filename |
| Where on world map | body — prose description |
| Defining geography | `geography` |
| Who controls it | `controlling_faction` |
| Tensions | `tensions` |
| Major settlements | `settlements` |
| Notable features | `notable_features` |
| Climate | `climate` |
