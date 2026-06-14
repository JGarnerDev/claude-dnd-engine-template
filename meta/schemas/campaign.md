---
tags:
  - schema
---

# Campaign Schema

The root document of the entire campaign. There is one campaign file per campaign. It is the first thing Claude reads before any generation task and provides the overarching context that everything else serves.

---

## DM Form

**\* Name:** What is this campaign called?

**\* Premise:** What is the campaign about in one or two sentences? What situation do the players enter at the start?

**\* Central conflict:** What is the driving tension of the whole campaign — the force or problem that the story ultimately resolves?

**\* Tone:** Where does this campaign sit on the axes that matter — dark vs. light, grounded vs. fantastical, political vs. action-driven?

**\* End condition:** What does a successful campaign ending look like? What would feel like resolution?

**Current act (optional):** Which act is the campaign currently in?

---

## Schema

### Canonical Path

`scheduler/campaign/{name}.md` — one file per campaign. Exactly one file carries `state: active` at a time; the rest are `draft`, `on-hiatus`, or awaiting move to historian.

### Valid State Values

| State | Meaning |
|---|---|
| `draft` | Campaign concept being developed, not yet started |
| `active` | Campaign is currently being played |
| `on-hiatus` | Paused but intended to resume |
| `completed` | Story reached its conclusion |
| `abandoned` | Discontinued |

### Frontmatter Template

```yaml
---
# --- MANDATORY ---
name: ""
type: campaign
exists: false
state: draft | active | on-hiatus | completed | abandoned
tags:
  - campaign/

premise: ""              # one or two sentences: what situation do the players enter?
central_conflict: ""     # the driving tension the whole campaign ultimately resolves
tone: ""                 # feel and register of the campaign

# Optional fields:
current_act: [[Act Name]]
acts:
  - [[Act Name]]
end_condition: ""        # what resolution looks like
themes: []               # 2-5 recurring themes
importance: critical
active: true
description: ""
---
```

### Notes

- `exists` flips to `true` and the file moves to `historian/` only when the campaign is fully completed.
- During play, this file stays in `scheduler/` and is updated as the campaign evolves.
- Claude reads this file first before any session generation task.
