---
tags:
  - schema
---

# Location — City Schema

Extends: `entity.md`, `location.md` (when created)

Covers cities, towns, villages, and any settled population center.

---

## Player Form

*Answer these questions and give them to your DM or paste them into chat. Required answers are marked with \*.*

**\* Name:** What is this settlement called?

**\* Location on the world map:** Where does it sit — region, coast, near what landmarks?

**\* Why it exists:** What gave rise to this settlement — trade route, military fort, holy site, natural resource, something else?

**\* How it exists:**
- What underlying conflicts or pressures shape daily life here (tensions)?
- Who lives here — rough mix of races, classes, wealth levels (composition)?
- What factions operate in or around the city?
- Who rules, and how stable is that rule (rulership)?

**\* Shops:** What are the key establishments? At minimum:
- Inn (name, proprietor)
- Mundane shop (name, proprietor, specialty)
- Magic shop — if any (name, proprietor)

**Map (optional):** Attach or describe a map of the city layout.

---

## Schema

### Canonical Path
`data/locations/cities/{name}.md`

### Valid State Values
| State | Meaning |
|---|---|
| `thriving` | Growing, prosperous |
| `stable` | Normal operation |
| `troubled` | Unrest, decay, or crisis |
| `besieged` | Under active attack or blockade |
| `ruined` | Largely destroyed but not empty |
| `abandoned` | Empty or near-empty |

### Frontmatter Template

```yaml
---
# --- MANDATORY (entity base) ---
name: ""
type: location
subtype: city
exists: false
state: thriving | stable | troubled | besieged | ruined | abandoned
tags:
  - location
  - location/city

# --- MANDATORY (city) ---
global_location: [[Region or Area Name]]
purpose: commerce | political | military | religious | other

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

# --- OPTIONAL (city) ---
map: ""                        # path to map file or image
population: ""                 # rough descriptor or number
composition: ""
tensions: []
factions:
  - [[Faction Name]]
rulership: [[NPC Name]]
shops:
  - [[Shop Name]]
trade_specialty: ""    # optional: what this settlement is regionally known for producing or trading, e.g. "fine leatherwork", "dwarven arms"
routes:
  - [[Route Name]]     # trade routes, highways, or sea lanes that serve this city (enables route-cities.ps1)
---
```

### Form → Frontmatter Mapping
| Form answer | Field |
|---|---|
| Name | `name`, filename |
| Location on world map | `global_location` |
| Why it exists | `purpose` |
| Tensions | `tensions` |
| Composition | `composition` |
| Factions | `factions` |
| Rulership | `rulership` |
| Shops | `shops` (each shop gets its own file per `location-shop.md`) |
| Map | `map` |
