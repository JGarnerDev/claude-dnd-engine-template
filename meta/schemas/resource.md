---
tags:
  - schema
---

# Resource Schema

Extends: `entity.md`

Covers named natural or economic resources: ore deposits, timber stands, fishing grounds, arcane leylines, trade commodities, skilled labor pools. Resources drive faction conflict, trade routes, and session hooks — whoever controls a scarce resource controls leverage.

---

## Player Form

*Answer these questions and give them to your DM or paste them into chat. Required answers are marked with \*.*

**\* Name:** What is this resource called? (e.g. the Barovian Amber Fields, the Tser Pool Salmon Run, Iron Veins of Mount Ghakis)

**\* Type:** What category — ore, timber, food, fresh water, stone, arcane material, livestock, textiles, alchemical components, labor, or something else?

**\* Where it comes from:** Which location, region, or terrain feature does this resource originate from or pass through?

**\* Rarity:** Is this common (found everywhere), uncommon (regionally significant), rare (hard to obtain anywhere), or unique (only one source exists)?

**Who controls it (optional):** Which faction, NPC, or power owns or restricts access?

**Trade value (optional):** Is this low-value bulk goods, moderate staple trade, high-value specialty, or priceless?

**Accessibility (optional):** Is access open, restricted by faction, hidden/undiscovered, or monopolized?

---

## Schema

### Canonical Path
`data/resources/{name}.md`

### Valid State Values
| State | Meaning |
|---|---|
| `abundant` | Plentiful; easily accessed; low scarcity pressure |
| `scarce` | Limited supply relative to demand; creates pressure |
| `depleted` | Nearly or fully exhausted; historical significance only |
| `hidden` | Not yet discovered or publicly known |
| `monopolized` | Single controller dominates all access |
| `contested` | Multiple parties fighting for control or access |

### Frontmatter Template

```yaml
---
# --- MANDATORY (entity base) ---
name: ""
type: resource
exists: false
state: abundant | scarce | depleted | hidden | monopolized | contested
tags:
  - resource

# --- MANDATORY (resource) ---
resource_type: ore | timber | food | fresh-water | stone | arcane | livestock | textiles | alchemical | labor | goods | other
rarity: common | uncommon | rare | unique
location:
  - [[Location or Region Name]]

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

# --- OPTIONAL (resource) ---
controlled_by: [[Faction or NPC Name]]
trade_value: negligible | low | moderate | high | priceless
accessibility: open | restricted | hidden | monopolized
consumers:
  - [[Faction or Location Name]] (nature of dependency)
depends_on:
  - [[Resource Name]] (what this resource requires to be produced or sustained)
  # Sync rule: if A depends_on B, B should list A in consumers. Keep both ends updated.
hook: ""
---
```

### Form → Frontmatter Mapping
| Form answer | Field |
|---|---|
| Name | `name`, filename |
| Type | `resource_type` |
| Where it comes from | `location` |
| Rarity | `rarity` |
| Who controls it | `controlled_by` |
| Trade value | `trade_value` |
| Accessibility | `accessibility` |
