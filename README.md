# D&D Campaign Engine

A structured, version-controlled system for generating and tracking D&D campaign sessions using creative synthesis, campaign history, and design principles.

## What This Is

This engine generates sessions for the **Curse of Strahd** campaign by synthesizing three layers:

1. **Creative pool** (`./data/`) — Free entities (NPCs, locations, factions, items, rumors) available for play
2. **Campaign history** (`./historian/`) — Authoritative record of what actually happened (10 sessions completed)
3. **Design principles** (`./meta/`) — Table preferences, difficulty tiers, rewards calibration, worldbuilding approach

When you plan a session, the engine reads the campaign state and asks "what's the story trying to do next?" — then surfaces hooks from unresolved threads, the free entity pool, and thematic preferences.

## Quick Start

### Run the Next Session

```
/session
```

This command:
1. Reads your campaign, active act, and active mission
2. Detects whether you're mid-arc (continue) or between arcs (transition)
3. In transition mode, surfaces 3 narrative hooks and asks which direction
4. Generates a session plan (opening scene, key NPCs, encounters, closing hook)
5. Offers to write the plan as a draft in `scheduler/sessions/`

### Check Your Free Entity Pool

```
/inventory
```

Scans `./data/` and reports:
- Free entities grouped by type (NPC, location, faction, etc.)
- Importance and active status for each
- **Gaps** — types with zero free entities (signals where to create content)

### Canonize a Played Session

```
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
| `./historian/` | Authoritative record of campaign history — what actually happened |
| `./meta/` | Design principles, table preferences, schemas, and decision frameworks |
| `./scheduler/` | Active story layer — campaign doc, acts, missions, and session plans |
| `./meta/schemas/` | Entity file templates and frontmatter specifications |

## Story Hierarchy

```
Campaign (scheduler/campaign.md)
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

1. **Fill meta files** (`meta/worldbuilding.md`, `meta/difficulty.md`, `meta/rewards.md`) with table preferences and design guidelines
2. **Seed the free pool** (`data/`) with 5–10 key campaign entities (NPCs, locations, factions, rumors)
3. **Define acts and missions** in `scheduler/` to frame the story progression

### Running `/session`

1. Reads campaign state and active story layer
2. Detects **continuation** (mid-arc) or **transition** (between arcs)
3. Surfaces 3 narrative hooks and asks which direction
4. Generates a full session plan (scenes, NPCs, encounters, structure)

### After Playing

1. Run `/recap` to canonize what happened
2. Session file moves from `scheduler/` to `historian/` with play metadata
3. Entities used are moved from `data/` to `historian/`
4. Campaign state is updated automatically

---

## Current Campaign State

**Curse of Strahd** — Party at level 3 after 10 sessions

| Player | Character | Race/Class | Status |
|---|---|---|---|
| Jeff | Iggadreon "Iggy" Wallaed | Aasimar (Celestial) Bard | Alive — shadow affliction |
| Paul | Luci | Aasimar (Scourge) | Alive — no Sacred Flame |
| Miguel | Odibli "ODB" | Gnome Wizard | Alive |
| Ben | Dip | Unknown | Alive — whisper affliction |

**Current Location:** Outside Death House, Barovia. Strahd has greeted the party.

**Open Threads:**
- Rose and Thorn (young NPCs) stranded inside Death House
- Iggy's shadow doesn't match his form
- Dip hears whispers in silence
- Luci was retrieved from death by Strahd (why?)

See `scheduler/campaign.md` for full campaign details.

---

## Operational Instructions

For detailed procedures on:
- **Session generation protocol** — See `CLAUDE.md` > "Session Generation Protocol"
- **Reading strategy** — See `CLAUDE.md` > "Context and Reading Strategy"
- **Entity creation** — See `CLAUDE.md` > "Entity Creation Protocol"
- **Free entity rule specifics** — See `CLAUDE.md` > "Free Entity Rule"

For the entity creation protocol details and mandatory instructions, see [`CLAUDE.md`](./CLAUDE.md).

---

## Getting Started

**To plan the next session:** Run `/session`

**To see what entities are available:** Run `/inventory`

**To record what actually happened:** Run `/recap` after playing

**To create a new entity:** Follow the Entity Creation Protocol in `CLAUDE.md`

**To add a player preference:** Create a file in `meta/players/{player-name}.md` (copy `meta/players/player-template.md`)
