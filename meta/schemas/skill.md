---
tags:
  - schema
---

# Skill Schema

**Canonical path:** `data/skills/{Skill Name}.md`
**Historian path:** `historian/skills/{Skill Name}.md`
**Type:** `skill` (no subtype)

---

## Frontmatter Template

```yaml
---
name: "{{Skill Name}}"
type: skill
exists: false
state: available
tags:
  - skill
ability: "{{STR|DEX|CON|INT|WIS|CHA}}"
source: PHB
description: "{{What this skill covers in one sentence}}"
use_cases:
  - "{{Common application}}"
  - "{{Common application}}"
---
```

## Field Reference

| Field | Required | Notes |
|---|---|---|
| `name` | yes | Exact PHB name |
| `type` | yes | Always `skill` |
| `exists` | yes | `false` in data pool |
| `state` | yes | Always `available` |
| `tags` | yes | Always `[skill]` |
| `ability` | yes | Governing ability score abbreviation |
| `source` | yes | Always `PHB` |
| `description` | yes | One-sentence summary of what the skill covers |
| `use_cases` | yes | 3–6 concrete DM prompts for when to call for a check |

## Valid `ability` Values

`STR` · `DEX` · `CON` · `INT` · `WIS` · `CHA`
