# Type Registry

Authoritative list of all valid `type` / `subtype` combinations. **Before declaring `type` or `subtype` on any entity, check here.** Every combination maps to exactly one schema and one canonical path pair.

---

## Rules

- `type` and `subtype` values are always lowercase, no spaces (use hyphens if needed)
- The `type`/`subtype` pair must correspond to a row in this table — no ad hoc combinations
- The combined tag form `type/subtype` (e.g. `character/npc`) must also appear in `meta/tags.md`
- When a new schema is created, add its row here before creating any entity files

---

## Registry

| type | subtype | Schema | `data/` path | `historian/` path |
|---|---|---|---|---|
| `act` | — | `meta/schemas/act.md` | `scheduler/acts/` | `historian/acts/` |
| `background` | — | `meta/schemas/background.md` | `data/backgrounds/` | `historian/backgrounds/` |
| `campaign` | — | `meta/schemas/campaign.md` | `scheduler/campaign.md` | — |
| `class` | — | `meta/schemas/class.md` | `data/classes/` | `historian/classes/` |
| `character` | `antagonist` | `meta/schemas/character-antagonist.md` | `data/characters/antagonists/` | `historian/characters/antagonists/` |
| `character` | `npc` | `meta/schemas/character-npc.md` | `data/characters/npcs/` | `historian/characters/npcs/` |
| `character` | `pc` | `meta/schemas/character-pc.md` | `data/characters/pcs/` | `historian/characters/pcs/` |
| `deity` | — | `meta/schemas/deity.md` | `data/deities/` | `historian/deities/` |
| `event` | — | `meta/schemas/event.md` | `data/events/` | `historian/events/` |
| `faction` | — | `meta/schemas/faction.md` | `data/factions/` | `historian/factions/` |
| `creature` | — | `meta/schemas/creature.md` | `data/creatures/` | `historian/creatures/` |
| `item` | `magic` | `meta/schemas/item-magic.md` | `data/items/magic/` | `historian/items/magic/` |
| `item` | `mundane` | `meta/schemas/item-mundane.md` | `data/items/mundane/` | `historian/items/mundane/` |
| `location` | `city` | `meta/schemas/location-city.md` | `data/locations/cities/` | `historian/locations/cities/` |
| `location` | `dungeon` | `meta/schemas/location-dungeon.md` | `data/locations/dungeons/` | `historian/locations/dungeons/` |
| `location` | `region` | `meta/schemas/location-region.md` | `data/locations/regions/` | `historian/locations/regions/` |
| `location` | `shop` | `meta/schemas/location-shop.md` | `data/locations/shops/` | `historian/locations/shops/` |
| `location` | `wilderness` | `meta/schemas/location-wilderness.md` | `data/locations/wilderness/` | `historian/locations/wilderness/` |
| `mission` | — | `meta/schemas/mission.md` | `scheduler/missions/` | `historian/missions/` |
| `party` | — | `meta/schemas/party.md` | — | `historian/characters/parties/` |
| `race` | — | `meta/schemas/race.md` | `data/races/` | `historian/races/` |
| `rumor` | — | `meta/schemas/rumor.md` | `data/rumors/` | `historian/rumors/` |
| `session` | — | `meta/schemas/session.md` | `scheduler/sessions/` | `historian/sessions/` |
