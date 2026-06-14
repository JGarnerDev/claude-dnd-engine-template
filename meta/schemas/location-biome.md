---
tags:
  - schema
---

# Location — Biome Schema

Extends: `entity.md`

Covers a **biome** — a terrain/climate type that defines the ecological character of the land: desert, tundra, temperate forest, rainforest, grassland, wetland, alpine, coast, and so on. A biome describes the flora, fauna, hazards, resources, and travel logistics that follow from a kind of terrain, independent of any single named place.

Distinct from the neighboring location subtypes:

- A `location-region` is a *named territory* (e.g. the Greenwood, the Ashreaches). A biome is the *terrain type* that one or more regions are made of (temperate forest, volcanic highland).
- A `location-wilderness` is a *named zone you adventure in*. A biome is the *category* that zone belongs to.
- A `location-terrain-feature` is a single *named geographic element* (a river, a pass). A biome is the surrounding *matrix* those features sit in.

One biome can span many regions; one region can contain several biomes. Biomes feed `/region` generation and the map **Biome Census** (`maps/world/index.md`) — they are the palette regions are painted from.

---

## Player Form

*Answer these questions and give them to your DM or paste them into chat. Required answers are marked with \*.*

**\* Name:** What is this biome called? (e.g. the Ashfall Highlands, Coldmarch Tundra, the Verdant Reach, Saltpan Flats)

**\* Biome type:** What kind of terrain is it — desert, tundra, grassland, savanna, temperate forest, rainforest, boreal forest, wetland, mountain, coast, volcanic, or something else?

**\* Climate:** What is the weather like — arid, temperate, tropical, polar, alpine, Mediterranean?

**Where it appears (optional):** Which regions or parts of the world contain this biome?

**Flora (optional):** Signature plants — what grows here, what is harvested, what is dangerous to touch?

**Fauna (optional):** Signature animals and monsters — what lives, hunts, or migrates through here?

**Hazards (optional):** Natural dangers — heat, cold, flooding, avalanche, quicksand, toxic air, magical instability.

**Resources (optional):** What of value comes out of this biome — ore, timber, game, rare flora, arcane material? Link existing `data/resources/` entities where possible.

**Travel (optional):** How hard is it to move through — open and fast, slow and choking, seasonally impassable?

**Seasonal effects (optional):** How does the biome change across the year — monsoon, freeze, dry season, bloom?

---

## Schema

### Canonical Path

`data/locations/biomes/{name}.md`

### Valid State Values

| State | Meaning |
|---|---|
| `thriving` | Full, healthy ecosystem; abundant flora and fauna |
| `stable` | Normal, self-sustaining baseline |
| `stressed` | Under pressure — drought, overhunting, encroachment, blight onset |
| `blighted` | Corrupted by disease, pollution, or hostile magic; life twisted or sickened |
| `barren` | Depleted or dead — resources exhausted, little life remains |
| `shifting` | Transitioning toward another biome (climate change, magic, disaster) |

### Frontmatter Template

```yaml
---
# --- MANDATORY (entity base) ---
name: ""
type: location
subtype: biome
exists: false
state: thriving | stable | stressed | blighted | barren | shifting
tags:
  - location
  - location/biome

# --- MANDATORY (biome) ---
biome_type: desert | tundra | grassland | savanna | temperate-forest | rainforest | boreal-forest | wetland | marsh | mountain | alpine | coast | reef | volcanic | badlands | underdark | other
climate: arid | semi-arid | temperate | mediterranean | tropical | subtropical | continental | polar | alpine | other

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

# --- OPTIONAL (biome) ---
regions:
  - [[Region Name]]
flora: []
fauna: []
hazards: []
resources:
  - [[Resource Name]]
travel: open | moderate | slow | seasonal | impassable
seasonal_effects: ""
hook: ""
---
```

### Form → Frontmatter Mapping

| Form answer | Field |
|---|---|
| Name | `name`, filename |
| Biome type | `biome_type` |
| Climate | `climate` |
| Where it appears | `regions` |
| Flora | `flora` |
| Fauna | `fauna` |
| Hazards | `hazards` |
| Resources | `resources` |
| Travel | `travel` |
| Seasonal effects | `seasonal_effects` |
