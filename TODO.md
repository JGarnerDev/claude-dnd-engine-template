# TODO — Campaign Engine Setup

Progress tracker for getting this project ready to generate sessions and run campaigns.



---

## Meta Configuration
*These files exist as placeholders. They need actual campaign content before session generation will be meaningful.*

- [ ] `meta/worldbuilding.md` — fill in tone, themes, setting pillars, what to avoid
- [ ] `meta/difficulty.md` — fill in party profile, encounter mix, DC ranges
- [ ] `meta/rewards.md` — fill in gold ranges, magic item philosophy, leveling pace
- [ ] Create per-player files in `meta/players/` (copy `player-template.md` per player, add `player/name` tag to `meta/tags.md`)

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
- [ ] Create the campaign doc at `scheduler/campaign/{name}.md` (per `meta/schemas/campaign.md`) — name, premise, central conflict, tone
- [ ] Create **first act** once the campaign document exists. An act splits the whole campaign into a sort of "chapter", and has goals and leveling brackets.
- [ ] Create **first mission(s)** once the opening act is defined. A mission is a variable-sized story unit, with mini-goals that either contribute to the act, or can be completely side-quests.
- [ ] Draft the **first session plan** once meta configuration and starting data are in place. Sessions are the times the players come together to play.
