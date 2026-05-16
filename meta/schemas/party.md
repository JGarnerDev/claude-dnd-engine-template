---
tags:
  - schema
---

# Party Schema

Covers adventuring party entities — the in-world group of PCs that forms and evolves over the campaign.

A party entity tracks who is in the group, how they came together, and what they've accomplished. The name is optional at creation — parties often earn one through play.

---

## Canonical Path

`historian/characters/parties/{Party Name}.md`

Parties are historian entities from the moment they form — they are not free data/ entities awaiting use.

## Valid State Values

| State | Meaning |
|---|---|
| `active` | Party is operating together |
| `restructured` | Membership changed significantly (someone joined or left) |
| `disbanded` | Party has broken up |

## Frontmatter Template

```yaml
---
name: "TBD"              # fill in when the party earns a name; leave "TBD" until then
type: party
exists: true
state: active
description: ""          # one-line summary, optional at creation

aliases: []              # alternate names or titles the party goes by

members:
  - [[PC Name]]          # wiki-links to historian/characters/pcs/ files

base_of_operations: "unknown"
campaign: [[Campaign Name]]

source_session: "[[session-NN-name]]"   # session when the party formed
confirmed_date: "unknown"               # in-world date of formation

tags: []    # party has no categorical tags — campaign relationship lives in campaign: [[Campaign Name]] field above
---
```

## Body Structure

```markdown
# {Party Name or "Unnamed Party"}

Members: [[PC Name]], [[PC Name]]   # repeat frontmatter member links here — Foam requires body links
Campaign: [[Campaign Name]]

## Formation

<!-- How and why did these characters come together? What bound them at the start? -->

## Reputation

<!-- What are they known for, feared for, or recognized by? Who knows their name? -->

## Notable Accomplishments

<!-- Major things the party has done together — updated as campaign progresses. -->

## Current Goals

<!-- What is the party actively working toward right now? -->
```

## Notes

- `name: "TBD"` is the correct placeholder when the party has no name yet. Do not invent a name — wait until the players choose one.
- When a name is chosen, update `name:`, the filename, and all `[[wiki-links]]` that reference this file.
- `members` links point to `historian/characters/pcs/` files, not to `meta/players/` files.
- `source_session` and `confirmed_date` are mandatory (historian entity rule). Use `"unknown"` for confirmed_date if the in-world date isn't established yet.
- Membership changes warrant updating `members` and optionally setting `state: restructured` with a note in the body.

## Player Form

Use these questions to gather party details from players at campaign start:

1. Who are the members of the party? (list character names)
2. How did they first meet or why are they traveling together?
3. Do they have a name yet? (leave blank if not — they'll earn one)
4. Where are they currently based, if anywhere?
