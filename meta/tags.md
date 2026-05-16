# Tag Registry

Authoritative list of all valid tags. **Before tagging any entity, check here.** Before using a tag that isn't listed, add it here first. This prevents tag drift (e.g. `race/elf` vs `elf` vs `elven`).

---

## Rules

- Tags follow `namespace/value` hierarchy for Obsidian/Foam nested tag support
- Do not use frontmatter tags for values that correspond to existing entity documents. If a race, class, faction, location, or other entity already exists as a markdown file, reference it in the document body with `[[wiki-link]]` syntax instead of adding it as a tag.
- `session/NN` tags increment with each session — add the new tag here when a session file is created
- `player/name` tags are added per campaign — add one entry per real-world player when setting up your group

---

## Registry

| Tag | Applies to | Meaning |
|---|---|---|
| **class** | | |
| `class` | class entity | Entity type: playable class — flat tag, no subtype |
| **creature/** | | |
| `creature` | creature entity | Entity type: notable creature with narrative presence |
| **background** | | |
| `background` | background entity | Entity type: character background — flat tag, no subtype |
| **character** | | |
| `character` | character entity | Entity type: any character (PC, NPC, or antagonist) — parent tag for all character subtypes |
| `character/antagonist` | character | Entity subtype: antagonist NPC — hostile, active threat to the party |
| `character/npc` | character | Entity subtype: non-player character |
| `character/pc` | character | Entity subtype: player character |
| **deity** | | |
| `deity` | deity entity | Entity type: any deity — parent tag for all deity/domain subtypes |
| `deity/arcana` | deity | Entity type + divine domain: Arcana |
| `deity/death` | deity | Entity type + divine domain: Death |
| `deity/forge` | deity | Entity type + divine domain: Forge |
| `deity/grave` | deity | Entity type + divine domain: Grave |
| `deity/knowledge` | deity | Entity type + divine domain: Knowledge |
| `deity/life` | deity | Entity type + divine domain: Life |
| `deity/light` | deity | Entity type + divine domain: Light |
| `deity/nature` | deity | Entity type + divine domain: Nature |
| `deity/order` | deity | Entity type + divine domain: Order |
| `deity/peace` | deity | Entity type + divine domain: Peace |
| `deity/tempest` | deity | Entity type + divine domain: Tempest |
| `deity/trickery` | deity | Entity type + divine domain: Trickery |
| `deity/twilight` | deity | Entity type + divine domain: Twilight |
| `deity/war` | deity | Entity type + divine domain: War |
| **item/** | | |
| `item/magic` | item entity | Entity subtype: magic item |
| `item/mundane` | item entity | Entity subtype: mundane item with narrative significance |
| **location** | | |
| `location` | location entity | Entity type: any location — parent tag for all location subtypes |
| `location/dungeon` | location entity | Entity subtype: dungeon |
| `location/shop` | location entity | Entity subtype: shop (covers inns, taverns, and establishments) |
| `location/city` | location entity | Entity subtype: city or town |
| `location/region` | location entity | Entity subtype: region or territory |
| `location/wilderness` | location entity | Entity subtype: wilderness area |
| **party** | | |
| `party` | party entity | Entity type: adventuring party |
| **player/** | | |
| `player/name` | pc | Add one entry per real-world player — e.g. `player/alice`, `player/bob` |
| **race** | | |
| `race` | race entity | Entity type: playable race — flat tag, no subtype |
| **session/** | | |
| `session/NN` | session | Identifies the session number — e.g. `session/01`, `session/11` |
| **schema** | | |
| `schema` | schema file | Meta document: entity schema definition |
| **guideline** | | |
| `guideline` | meta document | Meta document: design guideline that shapes story or game decisions |
