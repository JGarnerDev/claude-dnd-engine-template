# CLAUDE.md

This file provides operational guidance to Claude Code (claude.ai/code) for working with this campaign engine.

**For project overview, quick start, and user-facing documentation:** See [README.md](./README.md)

**This document contains:** Mandatory procedures, reading strategy, entity protocols, and session generation/canonization workflows that Claude must follow exactly.

---

## Project

This engine generates D&D sessions by synthesizing creative material, campaign history, design principles, and session planning into coherent, playable content.

## Folder Roles

- `./data` — Creative source material (lore, worldbuilding, inspiration). Informational "food" that shapes story flavor and content, but is not authoritative.
- `./historian` — The authoritative record of the campaign. Past and current in-world facts (events, NPCs, locations, outcomes) live here. When `data` and `historian` conflict, `historian` wins.
- `./meta` — Principles, guidelines, and rules governing the campaign design (e.g. challenge/reward balance, pacing, tone). These govern *how* sessions are constructed, not *what* happened.
- `./scheduler` — The active story layer. Contains the campaign document, acts, missions, and session plans. Files here have `exists: false` and move to `historian/` when completed or played.

## Story Hierarchy

Content is organized from largest to smallest narrative unit:

| Level | File location | Moves to historian when… |
|---|---|---|
| **Campaign** | `scheduler/campaign.md` | Campaign fully concludes |
| **Act** | `scheduler/acts/{name}.md` | Act completes |
| **Mission** | `scheduler/missions/{name}.md` | Mission resolves (success or failure) |
| **Session** | `scheduler/sessions/session-{nn}-{name}.md` | Session is played |

Each level references the one above it and the ones below it via wiki-links. Sessions advance missions; missions build acts; acts serve the campaign.

## Session Generation Protocol

When asked to plan or generate a session, read in this order before producing any content:

1. `scheduler/campaign.md` — overarching story, tone, central conflict
2. The current act file in `scheduler/acts/` — what arc we're in, what needs to happen
3. Active mission file(s) in `scheduler/missions/` — the specific objective being pursued
4. Meta reference files (see **Meta Reference Files** below) — design guidelines and player preferences
5. Declare scope before pulling entity files — state what you intend to read and why

Session content must advance the active mission. Do not generate content that floats free of the story hierarchy.

## Context and Reading Strategy

Read in this order, stopping as soon as the task is satisfied:

1. **Frontmatter only** — check `description`, `type`, `state`, `exists` before opening the body
2. **Body** — only if frontmatter doesn't answer the question
3. **Linked files** — follow `relates_to`, `known_by`, `resources`, etc. at most **1 hop** from the focal entity; go deeper only when explicitly required by the task

Before pulling any files for a generation or planning task, declare scope: what you intend to read and why. This keeps context bounded and gives the user a chance to redirect.

Meta files (`meta/worldbuilding-approach.md`, `meta/difficulty.md`, etc.) are read **once per task**, not re-read for each sub-task or entity created within it.

Scan commands (e.g. `/inventory`) read **frontmatter only** — never the body.

## Free Entity Rule

Entities in `./data` with `exists: false` are **free** — available to be used in session content. Entities that get played and canonized move to `./historian` with `exists: true`.

**When generating or planning content that requires an entity:**
1. First search `./data` for a free entity (`exists: false`) of the needed type.
2. If one exists, use it — do not invent a new one.
3. If none exists, **stop and ask the user** before creating anything. Present the gap clearly: what type is needed, why, and ask whether they want to create one or proceed differently.

Never silently generate a net-new entity during session planning or content generation. The data pool is intentional — running it low is meaningful signal, not a problem to paper over.

## Meta Reference Files

When generating sessions, encounters, rewards, or any world content, read these files once at the start of the task:

| File | Purpose |
|---|---|
| `meta/worldbuilding-approach.md` | How to reason about worldbuilding — coherence, causality, consequences |
| `meta/worldbuilding.md` | Tone, themes, setting pillars, what to avoid |
| `meta/difficulty.md` | Encounter tiers, DC ranges, session mix |
| `meta/rewards.md` | Gold ranges, magic item philosophy, leveling pace |
| `meta/players/*.md` (excluding template) | Per-player preferences |
| `meta/references.md` | Where to look for external D&D data — API endpoints, wiki access patterns, and when to use each source |

`meta/players/player-template.md` is a blank template for adding new players — do not treat it as an active preference file.

## Entity Creation Protocol

Every piece of content in this engine is an **entity** — a markdown file with YAML frontmatter. Before creating any entity, follow these steps in order:

1. Read `meta/schemas/entity.md` — the base schema all entities must satisfy.
2. Read the most specific schema that applies (see **Known Schemas** below). Each schema file contains the canonical file path, valid `state` values, the full frontmatter template, and a mapping from player form answers to frontmatter fields.
3. Check `meta/types.md` — confirm the `type`/`subtype` combination is registered. Use only combinations listed there. Create sparingly.
4. Check `meta/tags.md` — use only tags listed in the registry. If a tag is needed that doesn't exist, add it to `meta/tags.md` first, then use it. Create sparingly if a wiki-link cannot be made.
5. Create the file at the canonical path defined in that schema.
5.1 Use the entity's exact canonical display name in `name:` and in all body `[[wiki-links]]`. Do not abbreviate, shorten, or alter the entity name when linking.
5.2 Ensure entity names contain no broken characters, stray quotes, or malformed punctuation before creating the file.
5.3 The filename (excluding `.md`) must be the human-readable, properly capitalized name that exactly matches the `name:` frontmatter field. Do not use slugs, kebab-case, lowercase, or any other transformation — the filename and the `name:` value must be identical.
6. Populate all mandatory frontmatter fields. Use `unknown` or `"TBD"` for anything not yet known — never omit a mandatory field.
7. Turn all named references to known entities into wiki-links in the entire document, including front matter. 

If a user provides form answers (structured or freeform), use the **Form → Frontmatter Mapping** table in the schema to translate their answers into the correct fields. If required fields are missing, ask before creating the file.

### Known Schemas

| What the user wants to make | Schema to read |
|---|---|
| The campaign document | `meta/schemas/campaign.md` |
| A story arc | `meta/schemas/act.md` |
| A mission or quest | `meta/schemas/mission.md` |
| A single session plan | `meta/schemas/session.md` |
| An adventuring party (the PCs as a group) | `meta/schemas/party.md` |
| A faction, nation, guild, or group | `meta/schemas/faction.md` |
| A region, territory, or nation's geography | `meta/schemas/location-region.md` |
| A city, town, or village | `meta/schemas/location-city.md` |
| A shop, inn, or establishment | `meta/schemas/location-shop.md` |
| A dungeon, ruin, cave, or delve | `meta/schemas/location-dungeon.md` |
| A wilderness area, road, or named outdoor space | `meta/schemas/location-wilderness.md` |
| An NPC | `meta/schemas/character-npc.md` |
| An antagonist NPC (hostile, active threat) | `meta/schemas/character-antagonist.md` |
| A player character | `meta/schemas/character-pc.md` |
| A magic item | `meta/schemas/item-magic.md` |
| A historical event, battle, or disaster | `meta/schemas/event.md` |
| A god, demigod, or divine entity | `meta/schemas/deity.md` |
| A rumor or piece of circulating information | `meta/schemas/rumor.md` |
| A playable or world race | `meta/schemas/race.md` |
| A character class | `meta/schemas/class.md` |
| A player (real-world, core or cameo) | `meta/schemas/player.md` |

Each schema file also contains a **Player Form** section — a set of plain-language questions suitable to give directly to players when they want to create an entity.

All entity files use Obsidian-compatible YAML frontmatter:
- `relates_to`, `resources`, `known_by`, `owner`, and any other link fields must use `[[wiki-link]]` syntax so edges appear in Obsidian's graph view. Relationship annotations after the link are allowed.
- **Every `[[wiki-link]]` in frontmatter must also appear somewhere in the markdown body.** Obsidian parses frontmatter links; Foam (VS Code) parses body links only. Dual placement is required for graph coverage in both tools.
- `tags` must come from `meta/tags.md`. Never invent a tag — check the registry first.
- **Entity → Entity relationships use `[[wiki-link]]` in the body, never tags.** If a relationship can be expressed as a direct link between two entity files (e.g. a character's race, class, background, faction, or location), use a `[[wiki-link]]` in the markdown body. Do not create a tag as a proxy for that relationship. Tags are only for properties that have no entity counterpart (e.g. `player/jeff`, `state/alive`, `pantheon/faerûnian`).
- `type` and `subtype` must come from `meta/types.md`. Never invent a combination.
- `aliases` enables Obsidian to resolve alternate names to the same node.

Files in `historian/` use the same schema as `data/` but add mandatory `source_session` and `confirmed_date` fields (see `meta/schemas/entity.md`). When a `data/` entity and a `historian/` entity conflict, the `historian/` entry is authoritative.

## Graph Settings Protocol

When a new type or subtype is added to `meta/types.md`, or a new entity folder is created under `data/` or `historian/`, update both graph config files to add matching color groups:

1. **`.vscode/settings.json`** — add a group entry to each view in `foam.graph.views` that needs it:
   - `Default` view: add entries for both the `data/` and `historian/` paths, with `id`, `label`, `match.property: "path"`, `match.value`, `color`, and `enabled: true`. Order general before specific (last match wins).
   - `Canon vs Free` view: no change needed unless an entirely new top-level folder is added.

2. **`.obsidian/graph.json`** — add a `colorGroups` entry for both the `data/` and `historian/` paths using the same color. RGB format: pack R, G, B as a 9-digit zero-padded decimal integer (`RRRGGGBBB`), e.g. R=77, G=208, B=225 → `77208225`.

Before choosing a color, read `meta/color-theory.md` for the canonical color map. Select the hex for the matching group or subtype. Use the same hex in both config files. If no existing group fits, pick from the Available list in that file.

## Commands

### `/inventory`

Defined in `.claude/commands/inventory.md`. Scans `./data` for all free entities (`exists: false`), groups them by type and subtype, lists each with importance and active status, and flags any types with zero free entities as gaps.

### `/session`

Defined in `.claude/commands/session.md`. Plans the next session. Reads campaign, act, and mission state to detect whether the party is mid-arc (continuation) or between arcs (transition). In transition mode, surfaces 3 hooks from three sources — unresolved historian threads, notable free data/ entities, and campaign themes/meta preferences — then asks scoping questions before generating the full session plan. Offers to write the result as a draft file in `scheduler/sessions/`.
