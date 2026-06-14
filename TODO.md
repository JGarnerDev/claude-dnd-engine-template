# TODO — Campaign Engine Setup

Progress tracker for getting this project ready to generate sessions and run campaigns. Ordered to match the recommended flow in `meta/new-campaign-setup.md`. Work top to bottom; `/session` assumes the meta files and a campaign doc already exist.

---

## 1. Meta Configuration
*The campaign's creative contract. These ship as placeholders and need real content before generation is meaningful. The four campaign-specific files (worldbuilding, design-preferences, mysteries, party-relationships) are excluded from template sync — they hold this group's content, not engine structure. See `meta/new-campaign-setup.md` Step 1–2.*

- [ ] `meta/worldbuilding.md` — fill required sections: Tone, Core Themes, Setting Pillars, World Textures (key textures & economies), What to Avoid. **Read every `/session`** — thin or off-tone output if blank
- [ ] `meta/campaign-design-preferences.md` — group wishlist: Desired Major Events, Antagonist Archetypes, Mission Preferences, Session Preferences, Player Agency Principle. Each item gets a `Deployed: —` tracking line. Start sparse; fill during Session 0 and early play
- [ ] `meta/mysteries.md` — load-bearing unknowns the DM protects: Active Mysteries (each with a `Revealed: —` line), How to Add a Mystery, Principles. **Read every `/session`** so content never accidentally answers a live mystery
- [ ] `meta/party-relationships.md` — DM's read on bonds, tensions, shared history between PCs (relational texture, not canon). Free-form; start sparse, grow as play develops
- [ ] `meta/difficulty.md` — party profile, two-axis difficulty spectrum (attrition × lethality), DC ranges, Long Rest Rules. Drives all `/session` encounter math and the Rest Clock
- [ ] `meta/rewards.md` — gold ranges, magic item philosophy, leveling pace
- [ ] Create per-player files in `meta/players/` (copy `player-template.md` per player; add a `player/name` tag to `meta/tags.md`)

---

## 2. Maps & Geography
*Optional but recommended — a world map keeps travel, adjacency, and `/region` math consistent. Skip this whole section if running mapless (theater-of-the-mind or a module's own map). See `meta/new-campaign-setup.md` Step 3 and `maps/CLAUDE.md`.*

- [ ] Decide whether to provide a world map at all (if no, skip the rest)
- [ ] Place map layers in `maps/world/` — `world-names.png` (surface, required), optional `world-sky.png` (air features), optional `city-markers.png` (undetailed-city dots)
- [ ] Set world & grid scale in `maps/CLAUDE.md` → Grid Scale (distance/cell, cols × rows, equator/pole rows, pixel size) — update the hardcoded numbers in the map scripts if they differ from template defaults
- [ ] Copy `maps/world/index-template.md` → `index.md`; fill Status, Images, Biome Census, grid pixel size
- [ ] Copy `maps/world/city-registry-template.md` → `city-registry.md` (only if a markers layer exists)
- [ ] Run `python scripts\gen-tiles.py` to slice every layer into the nine tiles
- [ ] Read tiles to fill Tile Coverage and seed Known Region Positions in `index.md`

---

## 3. Data — Free Entity Pool
*Campaign-specific world-building that needs creative input. These populate the free entity pool (`exists: false`) that `/session` draws hooks and NPCs from. More volume = richer suggestions, but `/session` runs on a thin pool — build out as you go.*

### World Structure
- [ ] Create **Regions** — the area where the campaign takes place
- [ ] Create a **starting city** — the home base or first major location
- [ ] Create **factions** — powers that shape local politics and conflict
- [ ] Create key **wilderness areas** — roads, forests, or landmarks near the starting city
- [ ] Create **dungeons** — available adventure sites within reach

### Characters & Hooks
- [ ] Create **key NPC files** — at minimum: quest-giver, innkeeper, local authority, recurring contact
- [ ] Create **historical events** that shaped the current world state
- [ ] Create a handful of **rumors** — in-world hooks players can discover

### Shops & Services
- [ ] Populate the starting city with at minimum an inn, a mundane shop, and a magic shop (each chains to an NPC proprietor)

---

## 4. Historian — Party & PCs
*The authoritative record. The actual player characters being played live here (`exists: true`), not in the data pool — `/session` and `session-brief.ps1` read PCs from `historian/characters/pcs/`.*

- [ ] Create the **party entity** (`historian/characters/parties/{Party Name}.md`, per `meta/schemas/party.md`)
- [ ] Add detail to the party — formation story, reputation, goals
- [ ] Create a **PC entity per player character** in `historian/characters/pcs/` (per `meta/schemas/character-pc.md`) — must carry `level` and a `level_confirmed` stamp; encounter math leans on these and `/session` flags them when stale
- [ ] Prompt Claude with each player's backstory, letting it create new entities with DM approval (see `.claude/commands/pc-backstory.md`)
- [ ] Backfill additional entities invented at the table as they're confirmed

---

## 5. Scheduler — Story Layer
*The active story: campaign → act → mission → session (largest to smallest). See `scheduler/CLAUDE.md`.*

- [ ] Create the campaign doc at `scheduler/campaign/{name}.md` (per `meta/schemas/campaign.md`) — name, premise, central conflict, tone, end condition. Mark it `state: active`
- [ ] Add the campaign's runtime sections to that doc: a `## Current State (after Session N)` block, a `### Rest Clock (as of Session N)` block, and a `## Party` table — `/session` reads these for pacing and encounter math, and flags them when missing or stale (see `meta/difficulty.md` and the Stamp Pattern in `CLAUDE.md`)
- [ ] Create the **first act** once the campaign doc exists — a "chapter" of the whole campaign, with goals and leveling brackets
- [ ] Create the **first mission(s)** once the opening act is defined — a variable-sized story unit with mini-goals serving the act (or side quests)
- [ ] Draft the **first session plan** with `/session` once meta config and starting data are in place

---

## 6. Search Index & Validation
*Engine housekeeping that makes generation reliable.*

- [ ] Build the semantic index once entities exist: `py -3.10 scripts\index-entities.py` — `/session` callback and free-entity searches degrade silently without it; rebuild after bulk entity additions
- [ ] Run `.\scripts\validate.ps1` before first generation — clears dangling `[[links]]` and missing frontmatter (placeholder world names under construction are expected errors)
- [ ] Run `/session` to plan the opening session
