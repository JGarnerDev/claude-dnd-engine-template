---
tags:
  - schema
---

# Player Schema

Covers real-world players at the table. This is **not** an in-world entity — it does not extend `entity.md` and has no `exists` or in-world `state`. Player files live in `meta/players/` and are referenced by PC files via the `player:` field.

---

## Player Form

*Answer these questions to set up your player file. Required answers are marked with \*.*

**\* Your name (or handle):**

**\* Role:** Are you a core player (attend most sessions) or a cameo player (occasional / guest)?

**\* Character(s):** List any characters you play or have played, and their current status (active / retired / dead).

**Pronouns (optional):**

**Availability (optional):** How often can you attend? Any scheduling constraints?

**What's fun for you (optional):** What kinds of moments, scenes, or challenges do you enjoy most?

**Spotlight moments you'd love (optional):** Specific scenes, beats, or story threads you want to see.

**Your character's arc (optional):** Where do you want your character to go? What resolution feels satisfying?

**Things you'd rather avoid (optional):** Any content or situations that aren't fun for you personally.

**Notes for the DM (optional):** Anything else useful — engagement style, things you've loved in past campaigns.

---

## Schema

### Canonical Path
`meta/players/{name}.md`

### Valid Role Values
| Role | Meaning |
|---|---|
| `core` | Attends most sessions; central to the campaign |
| `cameo` | Occasional or guest player; may join for specific arcs or one-shots |

### Valid Status Values
| Status | Meaning |
|---|---|
| `active` | Currently playing |
| `hiatus` | Temporarily away but expected to return |
| `retired` | No longer playing in this campaign |

### Frontmatter Template

```yaml
---
# --- MANDATORY ---
name: ""                  # real name or handle; matches filename
role: core | cameo
status: active | hiatus | retired

characters:
  - [[PC Name]] (active | retired | dead)   # all PCs this player has had

# --- OPTIONAL ---
pronouns: ""
availability: ""          # e.g. "weekly", "every other session", "guest only"
description: ""           # one-line summary for hover previews
---
```

### Form → Frontmatter Mapping
| Form answer | Field |
|---|---|
| Name / handle | `name`, filename |
| Role | `role` |
| Character(s) | `characters` |
| Pronouns | `pronouns` |
| Availability | `availability` |

### Body Structure

After the frontmatter, use these sections. All are optional — blank sections are fine for new players; fill in over time.

```markdown
# {Name}

## What's Fun For Me

## Spotlight Moments I'd Love

## My Character's Arc

## Things I'd Rather Avoid

## Notes for the DM
```

### Notes

- Player files are **meta**, not entities. Do not add `type: character`, `exists:`, or any entity-schema fields.
- **Every `[[wiki-link]]` in frontmatter must also appear in the body.** Foam only reads body links; Obsidian reads both. Use the `Character: [[X]]` line pattern.
- `characters` must use `[[wiki-link]]` syntax pointing to `data/characters/pcs/{name}.md` (or `historian/` once canonized).
- When creating a new PC file, the `player:` field on that PC must link back to this file: `player: [[meta/players/{name}]]`.
- `player-template.md` in `meta/players/` is the blank starter — do not treat it as an active player file.
- Core and cameo players use identical file structure. Role is tracked in frontmatter, not by file format.
