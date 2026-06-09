---
tags:
  - schema
---

# Route Schema

Covers any established path, road, lane, or corridor used for regular movement of people or goods: trade roads, pilgrim ways, military highways, sea lanes, air corridors, wilderness trails, and more.

---

## Player Form

*Answer these questions and give them to your DM or paste them into chat. Required answers are marked with \*.*

**\* Name:** What is this route called?

**\* Type:** What kind of route is this?
- Trade — commercial goods and merchants
- Pilgrimage — religious or spiritual travel
- Military — troop movement and logistics
- Highway — major public civic thoroughfare
- Trail — informal or wilderness path

**\* Medium:** How is it traveled?
- Land (road, path, mountain pass)
- Sea (ocean lane, coastal route)
- Air (skyship lane, flying mount corridor)
- River (waterway, canal)

**\* Origin & Destination:** Where does the route begin and end? Name both locations.

**\* Who controls it:** What faction, nation, or power maintains, patrols, or dominates this route? (Can be none / lawless.)

**\* State:** Is this route currently active, disrupted, contested, or abandoned?

**Waypoints:** Any notable stops, crossings, toll gates, or landmarks along the way?

**Primary goods or travelers:** What is mainly moved or who mainly travels this route?

**Hazards:** What dangers threaten travelers — bandits, monsters, weather, political checkpoints?

---

## Schema

### Canonical Path
`data/routes/{name}.md`

### Valid State Values
| State | Meaning |
|---|---|
| `active` | Operating normally |
| `disrupted` | Temporarily blocked or dangerous |
| `contested` | Multiple factions fighting for control |
| `abandoned` | No longer in regular use |
| `unknown` | Exists but current status unconfirmed by party |

### Frontmatter Template

```yaml
---
# --- MANDATORY (entity base) ---
name: ""
type: route
subtype: trade | pilgrimage | military | highway | trail
exists: false
state: active | disrupted | contested | abandoned | unknown
tags:
  - route/         # e.g. route/trade, route/military
  - region/

# --- MANDATORY (route) ---
origin: [[Location Name]]
destination: [[Location Name]]
medium: land | sea | air | river

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

# --- OPTIONAL (route) ---
waypoints:
  - [[Location Name]]
controlling_faction: [[Faction Name]]
primary_goods: []
travelers: []
hazards: []
toll_points: []
distance: ""
travel_time: ""
---
```

### Form → Frontmatter Mapping
| Form answer | Field |
|---|---|
| Name | `name`, filename |
| Type | `subtype`, tag `route/` |
| Medium | `medium` |
| Origin & Destination | `origin`, `destination` |
| Who controls it | `controlling_faction` |
| State | `state` |
| Waypoints | `waypoints` |
| Primary goods/travelers | `primary_goods`, `travelers` |
| Hazards | `hazards` |
