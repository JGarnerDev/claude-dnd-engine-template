---
tags:
  - schema
---

# Player Schema

Covers real-world players at the table. This is **not** an in-world entity — it does not extend `entity.md` and has no `exists` or in-world `state`. Player files live in `meta/players/` and are referenced by PC files via the `player:` field.

---

## Player Form

*Required fields marked with \*.*

**\* Your name (or handle):**

**\* Role:** Core player (most sessions) or cameo (occasional / guest)?

**\* Characters:** List any characters you play or have played, and their current status (active / retired / dead). Leave blank if undecided.

**Pronouns (optional):**

**Availability (optional):** How often can you join? Any scheduling constraints?

**Ally, obstacle, or villain — where do you land naturally?**

**Powerful figure or street-level? Big political footprint or stays in the shadows?**

**Pick archetypes that appeal to you** *(see valid values below — choose as many as you want)*:

**What kind of scene do you want to be remembered for?**

**Any character type you've always wanted to try but never got to play?**

**Things you'd rather avoid:** Content or situations that aren't fun for you personally.

**Notes for the DM:** Anything else — engagement style, what you've loved in past campaigns.

---

## Questionnaire Template

Use this exact structure when generating a player questionnaire. No schema jargon, no YAML. Sections and labels are canonical — do not reorder or rename them.

```markdown
## About You

**Pronouns** *(Optional)*:

**Availability** — How often could you join a session? Any scheduling constraints? *(Optional — helps us know when to build you in)*:

---

## How You Like to Play

**Ally, obstacle, or villain** — where do you land naturally when you play a character? *(Optional — but it shapes what kind of role we build for you)*:

**Power level** — do you prefer playing someone with real weight (a lord, a crime boss, a high priest), or someone street-level who operates in the shadows? *(Optional)*:

**Pick any archetypes that appeal to you** *(circle or list as many as you want — optional, but the more you give us, the better the fit)*:

> **Power / Political:** noble, city official, guild master, church authority, crime boss
>
> **Antagonist:** main villain, lieutenant, rival, corrupt official, morally grey threat
>
> **Social / Commerce:** merchant, information broker, innkeeper, fence, smuggler
>
> **Combat / Underworld:** mercenary, bounty hunter, bandit leader, assassin, monster hunter
>
> **Arcane / Esoteric:** sage, cult leader, oracle, artificer
>
> **Humble / Community:** commoner, priest, craftsperson, guide
>
> **Wild:** trickster, mysterious stranger, shapeshifter

---

## The Creative Stuff

**What kind of scene do you want to be remembered for?** *(Optional — a big moment, a twist, a speech, a fight? Dream out loud.)*:

**Any character type you've always wanted to try but never got to play?** *(Optional — now's your chance)*:

**Anything you'd rather avoid** — content, situations, or dynamics that aren't fun for you? *(Optional — totally valid, we'll work around it)*:

---

## Cameo-Specific
*(Omit this section for core players.)*

**Do you have a character concept in mind, or would you rather be handed one?** *(Your call — both are great options)*:

**How do you want to enter the story?** — Already know the party? A stranger they meet? Someone with history (friendly or otherwise)? *(Your call — this is the entry point question)*:

**Heavy drama or lighter moments?** — Some players want real weight and consequences; others want more levity. Both have a place. *(Your call — helps us pitch your character at the right register)*:

---

**Anything else for the DM** — how you like to engage, stuff you've loved in past campaigns, etc.?

---

*Hand back to your DM when done.*
```

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

### Valid Preferred Alignment Values
| Value | Meaning |
|---|---|
| `heroic` | Prefers playing characters who help or protect |
| `grey` | Prefers morally complex, ambiguous characters |
| `villainous` | Prefers playing antagonists, threats, or corrupted figures |

### Valid Preferred Archetype Values

**Power / Political**
`noble`, `city-official`, `guild-master`, `church-authority`, `crime-boss`

**Antagonist Flavors**
`main-villain`, `lieutenant`, `rival`, `corrupt-official`, `morally-grey-threat`

**Social / Commerce**
`merchant`, `information-broker`, `innkeeper`, `fence`, `smuggler`

**Combat / Underworld**
`mercenary`, `bounty-hunter`, `bandit-leader`, `assassin`, `monster-hunter`

**Arcane / Esoteric**
`sage`, `cult-leader`, `oracle`, `artificer`

**Humble / Community**
`commoner`, `priest`, `craftsperson`, `guide`

**Wild**
`trickster`, `mysterious-stranger`, `shapeshifter`

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
preferred_alignment: heroic | grey | villainous
preferred_archetypes:     # list from valid values above
  - ""
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
| Ally / obstacle / villain | `preferred_alignment` |
| Archetype picks | `preferred_archetypes` |

### Body Structure

```markdown
# {Name}

## Archetype Preferences

## Scene I Want to Be Remembered For

## Characters I've Always Wanted to Try

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
- `preferred_archetypes` and `preferred_alignment` are optional but valuable for cameos — use them to match candidates against open narrative slots during session planning.
