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

**\* Role:** Core player (most sessions), cameo (occasional / guest), or patron (offscreen — no sessions required)?

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

> 

**Availability** *(Optional)*:

> 

---

**How do you want to participate?** *(Required — circle one)*:

> **Cameo** — Join occasionally as a guest character for a session or arc.
> **Patron** — No sessions required. You run a faction or power behind the scenes; the DM brings your decisions to life at the table.

---

*Filled in **Cameo**? Complete the next two sections, then skip to "Anything else."*
*Filled in **Patron**? Skip to the Patron section.*

---

## If Cameo — How You Like to Play

**Ally, obstacle, or villain** — where do you land naturally? *(Optional)*:

> 

**Power level** — real weight (lord, crime boss, high priest) or street-level? *(Optional)*:

> 

**Pick any archetypes that appeal to you** *(optional — circle or list as many as you want)*:

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

*My picks:*

> 

---

## If Cameo — The Creative Stuff

**What kind of scene do you want to be remembered for?** *(Optional)*:

> 

**Any character type you've always wanted to try?** *(Optional)*:

> 

**Do you have a concept in mind, or would you rather be handed one?** *(Your call)*:

> 

**How do you want to enter the story?** — Known to the party? A stranger? Someone with history? *(Your call)*:

> 

**Heavy drama or lighter moments?** *(Your call)*:

> 

**Anything you'd rather avoid** — content or dynamics that aren't fun for you? *(Optional)*:

> 

---

## If Patron — Your Power

**What kind of power would you want to control?** — One faction or several, your call. For each, describe the type and decision style — not a specific name. *(Required — e.g. "a trading guild that bribes rather than fights / a minor noble house playing both sides")*:

> 

**What do they want?** — One line per faction if you listed more than one. *(Required — e.g. "expand trade routes / stay neutral and survive")*:

> 

**Anything they'd never do?** *(Optional)*:

> 

---

**Anything else for the DM**?

> 

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
| `patron` | Offscreen power-broker; controls a faction, nation, or organization and makes decisions asynchronously with the DM — no session attendance required or expected |

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
role: core | cameo | patron
status: active | hiatus | retired

characters:
  - [[PC Name]] (active | retired | dead)   # all PCs this player has had; omit for patrons with no PC

# --- OPTIONAL ---
pronouns: ""
availability: ""          # e.g. "weekly", "every other session", "guest only", "async only"
faction: [[Faction Name]] # patron only — filled after DM creates/assigns the faction
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
- Core, cameo, and patron players use identical file structure. Role is tracked in frontmatter, not by file format.
- `preferred_archetypes` and `preferred_alignment` are optional but valuable for cameos — use them to match candidates against open narrative slots during session planning.
- Patron players typically have no `characters` entry until/unless they take the field. `faction` is the key link field for patrons — point it at the faction/nation entity in `data/` or `historian/`.
- Patron decisions are async — the DM surfaces relevant events after sessions and the patron responds out-of-band. Standing orders in the player file body can reduce how often the DM needs to check in.
