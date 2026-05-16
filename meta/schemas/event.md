---
tags:
  - schema
---

# Event Schema

Extends: `entity.md`

Covers named historical events that shaped the present: battles, disasters, treaties, founding moments, divine interventions, catastrophes. Events are causes — use them to explain why the world is the way it is.

---

## Player Form

*Answer these questions and give them to your DM or paste them into chat. Required answers are marked with \*.*

**\* Name:** What is this event called or remembered as?

**\* When:** In-world date, era, or relative time (e.g. "300 years ago", "before the Sundering", "last winter").

**\* What happened:** A brief description of the event itself.

**\* Who was involved:** Major participants, factions, or actors. Each significant one should have or get their own entity file.

**\* Outcome:** How did it end? Who won, lost, survived, or was changed?

**\* Consequences:** What about the current world exists because of this event? Be specific — this is the most important field.

**How well known is it (optional):** Is this common knowledge, regional lore, a secret, or a matter of historical debate?

---

## Schema

### Canonical Path
`data/events/{name}.md`

### Valid State Values
| State | Meaning |
|---|---|
| `recent` | Within living memory |
| `historical` | Known but not within living memory |
| `ancient` | Known only through records or ruins |
| `legendary` | May be mythologized or partially fictional |
| `disputed` | Accounts conflict; truth unclear |
| `secret` | Occurred but not publicly known |

### Frontmatter Template

```yaml
---
# --- MANDATORY (entity base) ---
name: ""
type: event
exists: false
state: recent | historical | ancient | legendary | disputed | secret
tags:
  - event/
  - event/battle      # use a more specific tag where applicable
  - region/

# --- MANDATORY (event) ---
date: ""              # in-world date, era, or relative time
outcome: ""
consequences: []      # what about the present world exists because of this

# --- OPTIONAL (entity base) ---
aliases:
  - ""    # other names this event is known by
importance: critical | major | minor | background
active: true | false
last_updated: [[Session NN - Title]]
relates_to:
  - [[Entity Name]] (relationship)
known_by:
  - [[Character Name]] (partial | full)
description: ""

# --- OPTIONAL (event) ---
participants:
  - [[Entity Name]] (role)
awareness: widely-known | regional | secret | forgotten | disputed
---
```

### Form → Frontmatter Mapping
| Form answer | Field |
|---|---|
| Name | `name`, filename |
| When | `date` |
| What happened | `description` + body prose |
| Who was involved | `participants` |
| Outcome | `outcome` |
| Consequences | `consequences` |
| How well known | `awareness`, `state` |
