# TODO — Campaign Engine Setup

Progress tracker for getting this project ready to generate sessions and run campaigns.

---

## Cleanup — Stale Files to Remove
*Files that exist in this repo but should not — campaign content that leaked in, or files now excluded from sync. Remove manually; `/sync` will not auto-delete these.*

- [x] `data/resources/Coffee.md` — world-specific economy resource; excluded from sync
- [x] `data/resources/Serhari.md` — player-contributed resource; excluded from sync
- [x] `data/resources/Stonecap Mushroom.md` — world-specific flora; excluded from sync
- [x] `data/resources/Whatwill.md` — world-specific material; excluded from sync
- [x] `meta/worldbuilding.md` — already a blank template (no campaign lore present); kept in place — the Meta Configuration section below needs it to exist and be filled
- [x] `scheduler/campaign.md` — removed (also vacated old top-level path; convention is `scheduler/campaign/{name}.md`)
- [x] `scheduler/acts/Act 1 - Opening Arc.md` — campaign-specific act; removed (`acts/` kept via `.gitkeep`)

---

## Schemas
*These files exist as placeholders. They need actual campaign content before session generation will be meaningful.*

- [ ] Make a biome schema (terrain types to shape flora, fauna, and logistics of a region)
- [ ] Make a terrain feature schema (forests, rivers, roads, or anything on a map that effects the populations around them)
- [ ] Make a natural resource schema (what locations consume, including abstract location, rarity, accessibility, trade)
- [ ] Make a culture schema (what certain peoples, factions, etc. from certain regions are generally shaped by)
- [ ] Make a gameplay mechanic schema (mini games that can constitute a session/mission, make .claude\commands\session.md aware of it)

---

## Meta Configuration
*These files exist as placeholders. They need actual campaign content before session generation will be meaningful.*

- [ ] `meta/worldbuilding.md` — fill in tone, themes, setting pillars, what to avoid
- [ ] `meta/difficulty.md` — fill in party profile, encounter mix, DC ranges
- [ ] `meta/rewards.md` — fill in gold ranges, magic item philosophy, leveling pace
- [ ] Create per-player files in `meta/players/` (copy `player-template.md` per player, add `player/name` tag to `meta/tags.md`)

---

## Data — Canonical D&D
*Source material seeded from the 5e API or training knowledge. Forms the base creative pool.*

- [ ] Monsters — seed `data/creatures/` with notable monsters from the 5e API (good for dungeon population and encounter planning)
- [ ] Magic items — seed `data/items/magic/` with canonical items from the 5e API
- [ ] Spells — consider a `data/spells/` reference or inline on NPC/item files

---

## Data — Campaign-Specific
*World-building work that requires creative input. These populate the free entity pool for session generation.*

### World Structure
- [ ] Create **Regions** — the area where the campaign takes place
- [ ] Create a **starting city** — the home base or first major location
- [ ] Create **factions** — powers that shape local politics and conflict
- [ ] Create key **wilderness areas** — roads, forests, or landmarks near the starting city
- [ ] Create **dungeons** — available adventure sites within reach

### Characters
- [ ] Create **PC files** for each player character (`data/characters/pcs/`)
- [ ] Create **key NPC files** — at minimum: quest-giver, innkeeper, local authority, recurring contact

### History & Hooks
- [ ] Create **historical events** that shaped the current world state
- [ ] Create a handful of **rumors** — in-world hooks players can discover
- [ ] Create at least one **faction** with clear motives, tensions, and opposition

### Shops & Services
- [ ] Populate the starting city with at minimum: an inn, a mundane shop, and a magic shop (each chains to an NPC proprietor)

---

## Historian
- [ ] Create party entity (`historian/characters/parties/Your Party Name.md`)
- [ ] Add detail to the party — formation story, reputation, goals
- [ ] Prompt Claude with each player's backstory, allowing it to create new entities with DM's approval
- [ ] Backfill additional entities invented at the table as they're confirmed

---

## Scheduler
- [ ] Fill in `scheduler/campaign.md` — name, premise, central conflict, tone
- [ ] Create **first act** once the campaign document exists. An act splits the whole campaign into a sort of "chapter", and has goals and leveling brackets.
- [ ] Create **first mission(s)** once the opening act is defined. A mission is a variable-sized story unit, with mini-goals that either contribute to the act, or can be completely side-quests.
- [ ] Draft the **first session plan** once meta configuration and starting data are in place. Sessions are the times the players come together to play.
