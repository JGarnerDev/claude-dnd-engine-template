---
tags:
  - schema
---

# Culture Schema

Extends: `entity.md`

Covers the shared customs, values, taboos, and aesthetic sensibilities of a people — distinct from race (biology) and faction (organization). A culture explains *how* a group thinks and acts: what they celebrate, what they fear, how they greet strangers, what they build, and what they will die to protect. Multiple races can share a culture; one race can fracture into many cultures.

---

## Player Form

*Answer these questions and give them to your DM or paste them into chat. Required answers are marked with \*.*

**\* Name:** What is this culture called? (e.g. the Old Dwarven Mountain Tradition, a nomadic Road Culture, a coastal trading culture)

**\* Where it's centered:** Which region or location is the heartland of this culture?

**\* Core values:** What does this culture prize above all? (e.g. survival, loyalty to clan, devotion to a god, mercantile cunning, martial honor)

**\* Taboos:** What is forbidden, shunned, or shameful within this culture?

**Associated factions (optional):** Which factions embody or protect this culture?

**Associated races (optional):** Which races are primarily part of this culture? Leave blank for multiracial cultures.

**Practices (optional):** Notable customs, rituals, festivals, arts, or crafts.

**Aesthetic (optional):** Visual style — clothing, architecture, art, music, color symbolism.

**Language (optional):** Primary language(s) spoken.

---

## Schema

### Canonical Path

`data/cultures/{name}.md`

### Valid State Values

| State | Meaning |
|---|---|
| `thriving` | Vibrant, widely practiced, culturally confident |
| `declining` | Losing adherents or influence; under economic or political pressure |
| `assimilated` | Absorbed into a dominant culture; practices fading or surviving only in private |
| `isolated` | Cut off from outside contact; insular and self-referential |
| `persecuted` | Actively suppressed by a dominant power or rival culture |
| `extinct` | No longer practiced by any living community |

### Frontmatter Template

```yaml
---
# --- MANDATORY (entity base) ---
name: ""
type: culture
exists: false
state: thriving | declining | assimilated | isolated | persecuted | extinct
tags:
  - culture

# --- MANDATORY (culture) ---
region:
  - [[Region Name]]
values: []

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

# --- OPTIONAL (culture) ---
taboos: []
practices: []
aesthetic: ""
language: []
associated_factions:
  - [[Faction Name]]
associated_races:
  - [[Race Name]]
hook: ""
---
```

### Form → Frontmatter Mapping

| Form answer | Field |
|---|---|
| Name | `name`, filename |
| Where it's centered | `region` |
| Core values | `values` |
| Taboos | `taboos` |
| Associated factions | `associated_factions` |
| Associated races | `associated_races` |
| Practices | `practices` |
| Aesthetic | `aesthetic` |
| Language | `language` |
