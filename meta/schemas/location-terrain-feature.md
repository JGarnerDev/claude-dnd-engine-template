---
tags:
  - schema
---

# Location — Terrain Feature Schema

Extends: `entity.md`

Covers named physical elements of the landscape that are not destinations in themselves but shape the world around them: rivers, mountain ranges, roads, passes, lakes, cliffs, bridges, coastlines. Terrain features connect locations and affect logistics, population, and encounter flavor.

Distinct from `location-wilderness`: a wilderness area is a named zone you travel *to* and adventure *in*. A terrain feature is a geographic element you travel *through* or *along* — it provides context and consequence, not necessarily a full encounter site.

---

## Player Form

*Answer these questions and give them to your DM or paste them into chat. Required answers are marked with \*.*

**\* Name:** What is this terrain feature called? (e.g. the Silver River, the High Pass, the Old King's Road)

**\* Type:** What kind of feature is it — river, lake, mountain range, peak, pass, road, bridge, ford, valley, cliff, swamp, coastline, or something else?

**\* Region:** Which region does this belong to or cross?

**\* Scale:** Is this a local feature (a single village's mill pond), regional (a trade road connecting cities), or continental (a mountain range defining a border)?

**Navigability (optional):** Is this easy to cross or travel, or does it pose difficulty?

**Connects (optional):** Which locations does this link or separate?

**Who controls it (optional):** Does any faction or power control or tax access to this feature?

**Seasonal effects (optional):** Does flooding, freezing, drought, or storm affect this feature by season?

---

## Schema

### Canonical Path

`data/locations/terrain-features/{name}.md`

### Valid State Values

| State | Meaning |
|---|---|
| `passable` | Currently traversable without special preparation |
| `difficult` | Crossable but demanding — rough weather, poor roads, high water |
| `flooded` | Seasonal or disaster flooding; water crossings dangerous or impossible |
| `frozen` | Iced over — affects water crossings; may open land routes |
| `damaged` | Infrastructure broken — bridge out, road collapsed, ford silted |
| `impassable` | Cannot be crossed or traversed currently |
| `contested` | Factions fighting for control of this chokepoint or resource |

### Frontmatter Template

```yaml
---
# --- MANDATORY (entity base) ---
name: ""
type: location
subtype: terrain-feature
exists: false
state: passable | difficult | flooded | frozen | damaged | impassable | contested
tags:
  - location
  - location/terrain-feature

# --- MANDATORY (terrain feature) ---
feature_type: river | lake | sea | mountain-range | peak | hill-range | valley | pass | cliff | forest | swamp | road | bridge | ford | canyon | island | peninsula | coast | bay | other
region:
  - [[Region Name]]

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

# --- OPTIONAL (terrain feature) ---
scale: local | regional | continental
navigability: easy | moderate | difficult | impassable
connects:
  - [[Location Name]]
controlled_by: [[Faction or NPC Name]]
seasonal_effects: ""
hook: ""
---
```

### Form → Frontmatter Mapping

| Form answer | Field |
|---|---|
| Name | `name`, filename |
| Type | `feature_type` |
| Region | `region` |
| Scale | `scale` |
| Navigability | `navigability` |
| Connects | `connects` |
| Who controls it | `controlled_by` |
| Seasonal effects | `seasonal_effects` |
