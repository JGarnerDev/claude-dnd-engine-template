---
tags:
  - schema
---

# Location — Building Schema

Extends: `entity.md`, `location.md` (when created)

Covers non-commercial structures within a settlement: residences, manors, civic halls, guild houses, temples used as locations (not deities), etc. For commercial establishments use `location/shop`. For explorable ruins or dungeon-style interiors use `location/dungeon`.

---

## Player Form

*Answer these questions and give them to your DM or paste them into chat. Required answers are marked with \*.*

**\* Name:** What is this building called or known as?

**\* City:** Which city or settlement is this building in?

**\* Who lives or works here:** Who occupies it? (Name any notable residents or owners.)

**\* Purpose:** What is this building's function — home, manor, civic building, guild hall, temple, other?

**Condition (optional):** Is it in good repair, damaged, abandoned?

**What happened here (optional):** Any notable events tied to this building?

---

## Schema

### Canonical Path

`data/locations/buildings/{name}.md`

### Valid State Values

| State | Meaning |
|---|---|
| `occupied` | Inhabited and functional |
| `abandoned` | Empty or near-empty |
| `damaged` | Structurally compromised but in use |
| `ruined` | Largely destroyed |
| `destroyed` | Razed or collapsed |

### Frontmatter Template

```yaml
---
# --- MANDATORY (entity base) ---
name: ""
type: location
subtype: building
exists: false
state: occupied | abandoned | damaged | ruined | destroyed
tags:
  - location
  - location/building

# --- MANDATORY (building) ---
city: [[City Name]]
residents:
  - [[NPC Name]] (role or relation)
purpose: residential | civic | religious | military | other

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

# --- OPTIONAL (building) ---
map_location: ""    # where within the city
condition: ""       # descriptive note on physical state
---
```

### Body Template

Every `[[wiki-link]]` in frontmatter must also appear in the body. Include a reference block near the top:

```markdown
City: [[City Name]] | Campaign: [[Campaign Name]]
```

### Form → Frontmatter Mapping

| Form answer | Field |
|---|---|
| Name | `name`, filename |
| City | `city` |
| Who lives/works here | `residents` |
| Purpose | `purpose` |
| Condition | `condition` |
