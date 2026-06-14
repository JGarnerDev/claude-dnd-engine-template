# Tag Registry

Authoritative list of all valid tags. **Before tagging any entity, check here.** Before using a tag that isn't listed, add it here first. This prevents tag drift (e.g. `race/elf` vs `elf` vs `elven`).

---

## Rules

- Tags follow `namespace/value` hierarchy for Obsidian/Foam nested tag support
- Do not use frontmatter tags for values that correspond to existing entity documents. If a race, class, faction, location, or other entity already exists as a markdown file, reference it in the document body with `[[wiki-link]]` syntax instead of adding it as a tag.
- `session/NN` tags increment with each session — add the new tag here when a session file is created

---

## Registry

| Tag | Applies to | Meaning |
|---|---|---|
| **class** | | |
| `class` | class entity | Entity type: playable class — flat tag, no subtype |
| **creature/** | | |
| `creature` | creature entity | Entity type: notable creature with narrative presence |
| **cr/** | | |
| `cr/0` | monster | Challenge Rating 0 |
| `cr/0.125` | monster | Challenge Rating 1/8 |
| `cr/0.25` | monster | Challenge Rating 1/4 |
| `cr/0.5` | monster | Challenge Rating 1/2 |
| `cr/1` | monster | Challenge Rating 1 |
| `cr/2` | monster | Challenge Rating 2 |
| `cr/3` | monster | Challenge Rating 3 |
| `cr/4` | monster | Challenge Rating 4 |
| `cr/5` | monster | Challenge Rating 5 |
| `cr/6` | monster | Challenge Rating 6 |
| `cr/7` | monster | Challenge Rating 7 |
| `cr/8` | monster | Challenge Rating 8 |
| `cr/9` | monster | Challenge Rating 9 |
| `cr/10` | monster | Challenge Rating 10 |
| `cr/11` | monster | Challenge Rating 11 |
| `cr/12` | monster | Challenge Rating 12 |
| `cr/13` | monster | Challenge Rating 13 |
| `cr/14` | monster | Challenge Rating 14 |
| `cr/15` | monster | Challenge Rating 15 |
| `cr/16` | monster | Challenge Rating 16 |
| `cr/17` | monster | Challenge Rating 17 |
| `cr/18` | monster | Challenge Rating 18 |
| `cr/19` | monster | Challenge Rating 19 |
| `cr/20` | monster | Challenge Rating 20 |
| `cr/21` | monster | Challenge Rating 21 |
| `cr/22` | monster | Challenge Rating 22 |
| `cr/23` | monster | Challenge Rating 23 |
| `cr/24` | monster | Challenge Rating 24 |
| `cr/30` | monster | Challenge Rating 30 |
| **monster/** | | |
| `monster` | monster entity | Entity type: Monster Manual template (encounter archetype) |
| `monster/undead` | monster entity | Creature type: undead |
| `monster/beast` | monster entity | Creature type: beast |
| `monster/humanoid` | monster entity | Creature type: humanoid |
| `monster/aberration` | monster entity | Creature type: aberration |
| `monster/fiend` | monster entity | Creature type: fiend |
| `monster/monstrosity` | monster entity | Creature type: monstrosity |
| `monster/dragon` | monster entity | Creature type: dragon |
| `monster/construct` | monster entity | Creature type: construct |
| `monster/elemental` | monster entity | Creature type: elemental |
| `monster/fey` | monster entity | Creature type: fey |
| `monster/giant` | monster entity | Creature type: giant |
| `monster/ooze` | monster entity | Creature type: ooze |
| `monster/plant` | monster entity | Creature type: plant |
| `monster/other` | monster entity | Creature type: other |
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
| `location/biome` | location entity | Entity subtype: biome (terrain/climate type — desert, tundra, forest, etc.) |
| `location/building` | location entity | Entity subtype: non-commercial building (residence, manor, civic hall, etc.) |
| `location/dungeon` | location entity | Entity subtype: dungeon |
| `location/shop` | location entity | Entity subtype: shop (covers inns, taverns, and establishments) |
| `location/city` | location entity | Entity subtype: city or town |
| `location/region` | location entity | Entity subtype: region or territory |
| `location/wilderness` | location entity | Entity subtype: wilderness area |
| `location/terrain-feature` | location entity | Entity subtype: terrain feature (river, road, mountain range, pass, etc.) |
| **party** | | |
| `party` | party entity | Entity type: adventuring party |
| **player/** | | |
| `player/<name>` | pc | Character played by that player (one tag per player, e.g. `player/alice`) |
| **race** | | |
| `race` | race entity | Entity type: playable race — flat tag, no subtype |
| **session/** | | |
| `session/NN` | session | Identifies the session number — e.g. `session/01`, `session/11`, `session/13` |
| **schema** | | |
| `schema` | schema file | Meta document: entity schema definition |
| **guideline** | | |
| `guideline` | meta document | Meta document: design guideline that shapes story or game decisions |
| **faction/** | | |
| `faction/guild` | faction entity | Faction subtype: organized guild or professional society |
| `faction/religious` | faction entity | Faction subtype: religious order or church |
| `faction/cult` | faction entity | Faction subtype: cult or mystic sect |
| `faction/labor` | faction entity | Faction subtype: labor class or underclass |
| `faction/academic` | faction entity | Faction subtype: scholarly institution |
| `faction/noble` | faction entity | Faction subtype: noble house or aristocracy |
| `faction/administrative` | faction entity | Faction subtype: administrative authority or bureaucracy |
| **resource** | | |
| `resource` | resource entity | Entity type: natural or economic resource |
| **route** | | |
| `route` | route entity | Entity type: any route — parent tag for all route subtypes |
| `route/trade` | route entity | Route subtype: commercial trade route (any medium) |
| `route/pilgrimage` | route entity | Route subtype: religious or spiritual pilgrimage route |
| `route/military` | route entity | Route subtype: military road or logistics corridor |
| `route/highway` | route entity | Route subtype: major public civic thoroughfare |
| `route/trail` | route entity | Route subtype: informal or wilderness path |
| **culture** | | |
| `culture` | culture entity | Entity type: shared customs, values, and practices of a people |
| **mechanic** | | |
| `mechanic` | mechanic file | Meta document: gameplay mechanic or structured mini-game |
| **skill** | | |
| `skill` | skill entity | Entity type: 5e skill — flat tag, no subtype |
| **spell** | | |
| `spell` | spell entity | Entity type: any 5e spell — parent tag for all spell schools |
| `spell/abjuration` | spell entity | Spell school: abjuration |
| `spell/conjuration` | spell entity | Spell school: conjuration |
| `spell/divination` | spell entity | Spell school: divination |
| `spell/enchantment` | spell entity | Spell school: enchantment |
| `spell/evocation` | spell entity | Spell school: evocation |
| `spell/illusion` | spell entity | Spell school: illusion |
| `spell/necromancy` | spell entity | Spell school: necromancy |
| `spell/transmutation` | spell entity | Spell school: transmutation |
