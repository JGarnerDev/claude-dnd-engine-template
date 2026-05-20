# Entity Creation Protocol

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

## Known Schemas

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
| A terrain feature (river, road, mountain range, pass, lake) | `meta/schemas/location-terrain-feature.md` |
| A natural resource (ore, timber, trade good, arcane material) | `meta/schemas/resource.md` |
| A culture (customs, values, and practices of a people) | `meta/schemas/culture.md` |

## Economic Depth (Optional Fields)

Several schemas have optional economic fields: `sells` (NPC), `specialty` + `supply` (shop), `trade_specialty` (city), `resource_type: goods` (resource). These exist to add organic flavor — **do not populate them by default.**

Populate when there is a narrative reason: the NPC's livelihood is trade-focused, the shop's identity hinges on what it stocks, or the city's founding purpose was economic. A random innkeeper needs no `sells`. A dwarven armorer in a mining town might. Use judgment; less is more.

When linking `sells` or `supply` to resource entities, prefer wiki-links to existing `data/resources/` files. If no matching resource entity exists, use plain text rather than creating a new resource just to satisfy the link.

## Gameplay Mechanics

Gameplay mechanics (mini-games, structured encounter types) live in `meta/mechanics/`. Use `meta/mechanics/_template.md` as the starting point for new mechanic files. These are GM design tools — they have no `type`, `exists`, or `state` fields and follow no entity protocol. The `/session` command checks `meta/mechanics/` for applicable mini-games when building non-standard encounters (chase, puzzle, trade, performance, etc.).

Each schema file also contains a **Player Form** section — a set of plain-language questions suitable to give directly to players when they want to create an entity.

## Obsidian Frontmatter Rules

All entity files use Obsidian-compatible YAML frontmatter:
- `relates_to`, `resources`, `known_by`, `owner`, and any other link fields must use `[[wiki-link]]` syntax so edges appear in Obsidian's graph view. Relationship annotations after the link are allowed.
- **Every `[[wiki-link]]` in frontmatter must also appear somewhere in the markdown body.** Obsidian parses frontmatter links; Foam (VS Code) parses body links only. Dual placement is required for graph coverage in both tools.
- `tags` must come from `meta/tags.md`. Never invent a tag — check the registry first.
- **Entity → Entity relationships use `[[wiki-link]]` in the body, never tags.** If a relationship can be expressed as a direct link between two entity files (e.g. a character's race, class, background, faction, or location), use a `[[wiki-link]]` in the markdown body. Do not create a tag as a proxy for that relationship. Tags are only for properties that have no entity counterpart (e.g. `player/jeff`, `state/alive`, `pantheon/faerûnian`).
- `type` and `subtype` must come from `meta/types.md`. Never invent a combination.
- `aliases` enables Obsidian to resolve alternate names to the same node.

Files in `historian/` use the same schema as `data/` but add mandatory `source_session` and `confirmed_date` fields (see `meta/schemas/entity.md`). When a `data/` entity and a `historian/` entity conflict, the `historian/` entry is authoritative.
