# D&D Campaign Engine

A structured, version-controlled system for generating and tracking D&D campaign sessions using creative synthesis, campaign history, and design principles.

## What This Is

This engine generates sessions for your D&D campaign by synthesizing three layers:

1. **Creative pool** (`./data/`) — Free entities (NPCs, locations, factions, items, rumors) available for play
2. **Campaign history** (`./historian/`) — Authoritative record of what actually happened
3. **Design principles** (`./meta/`) — Table preferences, difficulty tiers, rewards calibration, worldbuilding approach

When you plan a session, the engine reads the campaign state and asks "what's the story trying to do next?" — then surfaces hooks from unresolved threads, the free entity pool, and thematic preferences.

## Setup

**Requires:** Python 3.10, PowerShell, Claude Code (claude.ai/code)

```powershell
# Install Python dependency
py -3.10 -m pip install -r requirements.txt

# Build the semantic search index (~17s first run, downloads 79MB ONNX model)
py -3.10 scripts\index-entities.py

# Enable auto-formatting of Markdown on commit (one time per clone)
.\scripts\setup-hooks.ps1
```

The index is stored locally in `vector-index/` (gitignored) and must be built on each new clone. Re-run `index-entities.py` after bulk entity additions. Individual entity changes don't require a full rebuild — run with `--reset` only if the index feels stale.

### Markdown formatting

Entity files, commands, and docs are Markdown. A `.markdownlint.json` at the repo root defines the rules (tuned for Obsidian — long lines and frontmatter-first files are allowed). `scripts\setup-hooks.ps1` points git at `.githooks/` and installs `markdownlint-cli2@0.13.0` (the exact pin that runs on node 18). After that, a pre-commit hook auto-fixes staged `.md` files and re-stages the changes — you never format by hand. The hook is non-blocking: if a rule can't be auto-fixed (e.g. a code fence missing a language), the commit still goes through. To format the whole repo on demand: `markdownlint-cli2 --fix "*.md" "**/*.md" "!node_modules/**"`.

> **Note:** `py -3.10` is the Windows Python Launcher syntax. If `py` is not available, use the full path to your Python 3.10 executable.

### Why the semantic index?

The core engine uses deterministic, keyword-based retrieval — scripts query entities by type, state, and field value. This works well but has a blind spot: **thematic and implicit connections**. If you can't remember which NPC was involved in a betrayal two sessions ago, or you want to surface forgotten pool entities that fit the current session's mood, keyword search can't help.

The vector index adds semantic similarity search over all entity bodies. Use cases:

- **Callback surfacing** — "what have we seen that's similar to this?" before writing a scene
- **Forgotten entity discovery** — find pool entities that thematically fit the session hook without manually scanning `data/`
- **Thematic resonance** — surface characters or locations connected to a theme (loyalty, corruption, grief) even when those words don't appear in their frontmatter
- **Contradiction detection** — before canonizing a recap, check whether new facts conflict with existing historian entries
- **NPC voice consistency** — pull past descriptions of an NPC to ground new dialogue in established characterization
- **"Who would care about this?"** — find entities with motivations or histories that make them plausible reactors to an in-world event

Query it directly:

```powershell
.\scripts\semantic-search.ps1 -Query "betrayal and political intrigue" -Type character -Source historian
.\scripts\semantic-search.ps1 -Query "ancient ritual site" -Type location -Exists false -K 10
.\scripts\semantic-search.ps1 -Query "merchant with a secret"
```

---

## Quick Start

### Run the Next Session

```text
/session
```

This command:

1. Reads your campaign, active act, and active mission
2. Detects whether you're mid-mission with an open cliffhanger (continue) or at a clean break — mission complete or no active mission (transition)
3. In transition mode, surfaces 3 narrative hooks and asks which direction
4. Generates a session plan (opening scene, key NPCs, encounters, closing hook)
5. Offers to write the plan as a draft in `scheduler/sessions/`

### Check Your Free Entity Pool

```text
/inventory
```

Scans `./data/` and reports:

- Free entities grouped by type (NPC, location, faction, etc.)
- Importance and active status for each
- **Gaps** — types with zero free entities (signals where to create content)

### Canonize a Played Session

```text
/recap
```

After you play a session:

1. Gathers what actually happened (rough notes are fine)
2. Updates the session file with historian fields (date played, recap, cliffhanger)
3. Audits which entities should move from `data/` to `historian/`
4. Moves the session file from `scheduler/` to `historian/`
5. Updates PC/NPC states and campaign state

---

## Project Structure

| Folder | Role |
|---|---|
| `./data/` | Free entity pool — creative material available for session generation |
| `./historian/` | Authoritative record of campaign history and world — what actually happened and what actually exists |
| `./meta/` | Design principles, table preferences, schemas, and decision frameworks |
| `./scheduler/` | Active story layer — campaign doc, acts, missions, and session plans |
| `./meta/schemas/` | Entity file templates and frontmatter specifications |

## Story Hierarchy

```text
Campaign (scheduler/campaign/*.md)
  ├── Act (scheduler/acts/*.md)
  │     ├── Mission (scheduler/missions/*.md)
  │     │     └── Session (scheduler/sessions/*.md) ← moves to historian/ when played
```

Each level references the one above and the ones below via wiki-links. When a session is played, its file moves from `scheduler/sessions/` to `historian/sessions/` with historian metadata.

---

## Key Concepts

### Free Entity Rule

Entities in `data/` with `exists: false` are **free** — available for session generation. When generating content that requires an entity (an NPC, location, etc.):

1. Search `data/` for a free entity of the needed type
2. If found, use it — don't invent a new one
3. If not found, **ask before creating** — the free pool is intentional

When an entity is used and played, it moves to `historian/` with `exists: true` and becomes canonized (owned by a specific session).

### Entity Types

Every piece of content is an entity — a markdown file with YAML frontmatter. Valid types:

| Type | Use | Seeded? |
|---|---|---|
| `character/npc` | Non-player characters | No |
| `character/pc` | Player characters | Yes (historian/) |
| `faction` | Organizations, groups, powers | No |
| `location/city` | Cities and towns | No |
| `location/dungeon` | Dungeons, caves, delves | No |
| `location/region` | Regions and territories | No |
| `location/shop` | Shops, inns, establishments | No |
| `location/wilderness` | Forests, roads, outdoor spaces | No |
| `item/magic` | Magic items | No |
| `event` | Historical events, disasters | No |
| `rumor` | Circulating stories and hooks | No |
| `deity` | Gods and divine entities | Yes (data/) |
| `race` | Playable and world races | Yes (data/) |
| `class` | Character classes | Yes (data/) |
| `campaign` | Campaign root document | Yes (scheduler/) |
| `act` | Story arcs | No |
| `mission` | Quests and objectives | No |
| `session` | Individual play sessions | No (scheduler/sessions/, moves to historian/) |

---

## Workflow

### Before Session Generation

`/session` is only as good as the material it reads. On a fresh clone the pool is empty and the meta files are blank, so generation invents everything from scratch instead of drawing on *your* table. The prep below tunes the engine to your campaign — do it once up front, top it up as you play.

> **New campaign?** Read `meta/new-campaign-setup.md` first (or tell Claude "I'm starting a new campaign"). It orders world-naming and first-act setup so you don't seed content that contradicts itself later.

**1. Tune the table — fill the meta files.** These govern *how* sessions are built and are read once per task, so the effort compounds across every future `/session`.

- `meta/worldbuilding.md` / `meta/worldbuilding-approach.md` — tone, themes, who generates what (DM vs. players)
- `meta/difficulty.md` — encounter difficulty spectrum and the Rest Clock pacing model
- `meta/rewards.md` — loot and reward calibration
- `meta/campaign-design-preferences.md` — table-level style preferences
- `meta/players/{name}.md` — one per player (copy `player-template.md`): spotlight wants, lines/veils, character hooks. Honest answers → better `/session` hooks.

Blank fields are fine — deliberate elaboration space, not gaps. Fill what you have an opinion on; leave the rest.

**2. Seed the free pool (`data/`).** Generation pulls existing free entities (`exists: false`) before inventing new ones, so a seeded pool means sessions reuse *your* NPCs and hooks instead of one-off strangers. Aim for 5–10 starters across types (a couple NPCs, a location or two, a faction, a few rumors).

- `/entity-questionnaire` — design an entity *with* your players: produces a shareable form, their answers ingest into a schema'd entity. Highest-leverage move — player-authored entities give ownership and hooks you didn't have to write.
- `/inventory` — see the pool by type with **gaps** (types with zero free entities) flagged. Your shopping list.

**3. Ground it in a map *(optional, recommended)*.** Not required for `/session`, but a world map gives entities a real place and keeps travel and adjacency consistent. Map-light campaign (theater-of-the-mind, or a module's existing map)? Skip this whole step — pool entities don't *need* coordinates. Otherwise, from a blank `maps/` folder:

*Layers — separate PNGs that must share identical dimensions so they register pixel-for-pixel. Higher resolution = sharper labels in tile reads; keep each file under 100MB.*

- `maps/world/world-names.png` — **base layer and source of truth.** Surface features (continents, ranges, rivers, seas) plus every *named* label; if a label's on this image, the place is canon. The one file you can't skip — drop your world image here, and match every other layer to its exact dimensions. No map yet? [Inkarnate](https://inkarnate.com) is a solid browser-based maker — export the highest-resolution PNG you can (under the 100MB ceiling).
- `maps/world/world-sky.png` — **optional overlay** — skip if nothing's above ground. Same canvas, for geography in its own plane above the surface (floating islands, aerial realm). Separate because surface scripts read only `world-names.png`. Edited manually.
- `maps/world/city-markers.png` — **transparent overlay**, same canvas. Red dots = cities that exist but aren't named/detailed yet ("work needed here" pins). A city "graduates" by getting a label on `world-names.png` and its dot deleted here.
- `maps/world/city-registry.md` — stable text IDs (e.g. `C05-04a`) per undetailed marker, so you can assign/cross-reference a city before it's named.

*Build the text data files from skeletons, not by hand:* `maps/world/index.md` (world data — Status, Images, **Biome Census**, tile coverage, feature positions) and `maps/world/city-registry.md` are copied from `index-template.md` / `city-registry-template.md` and filled once your layers are placed. The biome census — what biomes exist and roughly where — is captured at setup and feeds `/region` and entity generation. See `meta/new-campaign-setup.md` → Map & geography setup.

*Tiles:* the Read tool downsamples a large image until labels are unreadable, so nothing reads the full map directly. `python scripts\gen-tiles.py` slices each layer into **nine overlapping, legible tiles** (`tiles/nw.png … se.png`, plus `markers-*.png`). Run once after placing `world-names.png`, and again after any layer edit — tiles are regenerated, never hand-edited.

*Scale (your call):* places are addressed by a column/row grid over the map, but **what a cell represents is yours** — pick a real-world distance per cell and set it in `maps/CLAUDE.md` → Grid Scale (the template uses ~16×13 cells at 1000km each, just one campaign's choice). That scale drives `/region` travel-time and city-spacing math, so set it before detailing regions and keep the base image at full resolution.

*Blank → populated:*

- `/region` — takes a map chunk from geography → draft → player questionnaire in one flow. Cleanest on-ramp.
- Manual edits (drawing region/city maps, labels) can go to a designated world-builder via `maps/map-request-template.md` — see `maps/CLAUDE.md` for delegation and spoiler rules.

**4. Frame the story arc (`scheduler/`).** Give the engine a spine:

- A `campaign` file in `scheduler/campaign/` with `state: active` — `/session` reads this to find the active campaign.
- `act` files for arcs, `mission` files for the objectives inside them.

No need to map the whole campaign — one active act with a mission or two lets `/session` detect where you are (mid-mission vs. at a clean break) and surface coherent hooks.

**5. Build the semantic index.** If skipped during Setup, run `py -3.10 scripts\index-entities.py` once the pool has entities — it powers callback surfacing, forgotten-entity discovery, and `/recap` contradiction checks. Re-run after bulk additions.

Minimum viable prep: one active `campaign`, an active act, a handful of seeded entities. Everything else sharpens output — start thin, enrich as you play.

### Running `/session`

1. Reads campaign state and active story layer
2. Detects **continuation** (active mission, open cliffhanger) or **transition** (mission complete, or no active mission)
3. Surfaces 3 narrative hooks and asks which direction
4. Generates a full session plan (scenes, NPCs, encounters, structure)

### After Playing

1. Run `/recap` to canonize what happened
2. Session file moves from `scheduler/` to `historian/` with play metadata
3. Entities used are moved from `data/` to `historian/`
4. Campaign state is updated automatically

---

## Current Campaign State

See the `state: active` file in `scheduler/campaign/` for live campaign state, party status, and open threads.

---

## Operational Instructions

For detailed procedures on:

- **Reading strategy** — See `CLAUDE.md` > "Context and Reading Strategy"
- **Entity creation** — See `CLAUDE.md` > "Entity Creation"
- **Free entity rule** — See `CLAUDE.md` > "Free Entity Rule"
- **Scripts reference** — See `CLAUDE.md` > "Scripts"

---

## Getting Started

**To plan the next session:** Run `/session`

**To see what entities are available:** Run `/inventory`

**To record what actually happened:** Run `/recap` after playing

**To create a new entity:** Follow the Entity Creation Protocol in `CLAUDE.md`

**To add a player preference:** Create a file in `meta/players/{player-name}.md` (copy `meta/players/player-template.md`)

**To format Markdown:** Nothing to do — the pre-commit hook from `.\scripts\setup-hooks.ps1` auto-fixes staged `.md` on commit. Format everything on demand with `markdownlint-cli2 --fix "*.md" "**/*.md" "!node_modules/**"`

**To browse the vault visually (optional):** The engine runs entirely through slash commands — no editor required. But entities use Obsidian-style frontmatter and `[[wikilinks]]`, so the repo opens cleanly as an [Obsidian](https://obsidian.md) vault or a [Foam](https://foambubble.github.io/foam/) workspace in VS Code. Either gives you a clickable graph view of the entity web. This is a nice-to-have for exploring relationships, not a setup step.
