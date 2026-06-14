---
tags:
  - schema
---

# Spell Schema

Extends: `entity.md`

Covers canonical 5e spells and any world-specific magic. Spell files are reference material — they stay in `data/spells/` and generally do not move to `historian/`. Use them during session planning, NPC spell list construction, and item effect cross-referencing.

---

## Player Form

*DM-facing. Required answers marked with \*.*

**\* Name:** What is the spell called?

**\* Level:** Cantrip (0) or spell level (1–9)?

**\* School:** Abjuration, conjuration, divination, enchantment, evocation, illusion, necromancy, or transmutation?

**\* Casting time:** 1 action, 1 bonus action, 1 reaction, 1 minute, etc.?

**\* Range:** 60 feet, Self, Touch, etc.?

**\* Components:** Verbal (V), Somatic (S), Material (M)? If M, what material?

**\* Duration:** Instantaneous, 1 minute, Concentration up to X?

**\* Concentration:** Yes or no?

**\* Effect:** What does the spell do?

**Available to (optional):** Which classes have this on their spell list?

---

## Schema

### Canonical Path

`data/spells/{name}.md`

### Valid State Values

| State | Meaning |
|---|---|
| `known` | Exists and accessible in this world |
| `forbidden` | Exists but suppressed or banned in this setting |

### Frontmatter Template

```yaml
---
# --- MANDATORY (entity base) ---
name: ""
type: spell
exists: false
state: known
tags:
  - spell
  - spell/evocation    # replace with actual school

# --- MANDATORY (spell) ---
level: 0            # 0 = cantrip; 1–9 for leveled spells
school: abjuration | conjuration | divination | enchantment | evocation | illusion | necromancy | transmutation
casting_time: ""    # "1 action" / "1 bonus action" / "1 reaction" / "1 minute" / etc.
range: ""           # "60 feet" / "Self" / "Touch" / etc.
components:
  - V
  - S
  # - M
duration: ""        # "Instantaneous" / "1 minute" / "Concentration, up to 1 minute" / etc.
concentration: false
effect: ""

# --- OPTIONAL (spell) ---
material_component: ""
available_to: []
description: ""
aliases: []
---
```

### Form → Frontmatter Mapping

| Form answer | Field |
|---|---|
| Name | `name`, filename |
| Level | `level` |
| School | `school`, `tags` (add `spell/{school}`) |
| Casting time | `casting_time` |
| Range | `range` |
| Components | `components`, `material_component` |
| Duration | `duration` |
| Concentration | `concentration` |
| Effect | `effect` |
| Available to | `available_to` |
