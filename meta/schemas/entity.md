---
tags:
  - schema
---

# Entity Schema

The base schema for every file in this campaign engine. All entities — regardless of type or subtype — must include this frontmatter. Type and subtype schemas extend this; they do not replace it.

## Canonical Frontmatter

```yaml
---
# --- MANDATORY ---
name: "Exact display name"
type: location | character | faction | item | event   # pick one
exists: true | false      # true = canonized in historian; false = data/creative material only
state: ""                 # current in-world condition, valid values defined per type/subtype schema

tags:
  - type/subtype          # e.g. location/city, character/npc, faction/guild

# Optional fields:
subtype: ""               # more specific classification (city, npc, ruin, etc.)
aliases:
  - "Alternate Name"      # Obsidian resolves wiki-links to these names

importance: critical | major | minor | background
active: true | false      # currently in play; false = retired/dormant but importance unchanged

last_updated: [[Session NN - Title]]   # session where this entity was last changed

relates_to:
  - [[Entity Name]] (relationship)"    # wiki-link survives in Obsidian graph with annotation

resources:
  - [[Entity Name]] (relationship)"    # material, economic, or physical resources tied to this entity

known_by:
  - [[Character Name]] (partial | full)"   # who knows this entity exists, and how much

owner: [[Player Character Name]]     # player who is narratively responsible for this entity

contributed_by: paul | ben | miguel | jeff   # real-world player who created or submitted this entity

description: "One-sentence summary shown in Obsidian hover previews."
---
```

## Body

Prose, tables, and detail go in the markdown body below the frontmatter. There is no required structure — use headers freely.

## Historian Extensions

Files in `historian/` must have `exists: true` and add the following mandatory fields:

```yaml
# --- MANDATORY (historian only) ---
source_session: [[Session NN - Title]]   # session that established this as fact
confirmed_date: ""                          # in-world date or session number when canonized

# Optional fields:
supersedes: [[data/path/to/entity]]      # data/ draft this entry replaces
```

### Backstory-Sourced Entities

Entities canonized through PC backstory ingestion (not from a played session) use a plain string for `source_session` instead of a wiki-link:

```yaml
source_session: "player backstory (Character Name)"   # e.g. "player backstory (Iggy Wallaed)"
confirmed_date: "pre-campaign"
```

These entities are player-confirmed canon for their character's history. They do not require a session wiki-link because they predate the campaign. Add a reliability callout in the body if any detail is flagged as partial or subject to revision:

```markdown
> **Reliability:** Sourced from [Character]'s player backstory. [Note any fragments, tiers, or unconfirmed details.]
```

## Rules

- Every entity file must open with a YAML frontmatter block (`---`).
- `name` must match the filename (spaces replaced with hyphens, lowercase).
- `name` must also be the entity’s exact canonical display name, with correct spelling, punctuation, and capitalization.
- Entity names and wiki-links must contain no broken characters, stray quotes, or malformed punctuation.
- `exists` mirrors the file's location: `data/` entities are `false`, `historian/` entities are `true`. Both must agree.
- `relates_to`, `resources`, `known_by`, and `owner` must use `[[wiki-link]]` syntax so Obsidian graph edges are preserved. Relationship annotations after the link are allowed.
- **Every `[[wiki-link]]` in frontmatter must also appear somewhere in the markdown body.** Obsidian reads frontmatter links; Foam (VS Code) reads body links only. Both must be satisfied for full graph coverage in either tool.
- `tags` should follow a `category/specific` hierarchy for Obsidian nested tag support.
- Do not use frontmatter tags for values that already resolve to an existing entity document. Use `[[wiki-link]]` in the markdown body to reference existing races, classes, factions, locations, or other entity pages instead.
- Never leave mandatory fields blank — use `unknown` or `"TBD"` as placeholders.
- Valid values for `state` are defined in each type or subtype schema.
