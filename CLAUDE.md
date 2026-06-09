# CLAUDE.md

This file provides operational guidance to Claude Code (claude.ai/code) for working with this campaign engine.

**For project overview, quick start, and user-facing documentation:** See [README.md](./README.md)

---

## Project

This engine generates D&D sessions by synthesizing creative material, campaign history, design principles, and session planning into coherent, playable content.

## Folder Roles

- `./data` — Creative source material (lore, worldbuilding, inspiration). Informational "food" that shapes story flavor and content, but is not authoritative.
- `./historian` — The authoritative record of the campaign. Past and current in-world facts (events, NPCs, locations, outcomes) live here. When `data` and `historian` conflict, `historian` wins.
- `./meta` — Principles, guidelines, and rules governing the campaign design (e.g. challenge/reward balance, pacing, tone). These govern *how* sessions are constructed, not *what* happened.
- `./scheduler` — The active story layer. Contains the campaign document, acts, missions, and session plans. Files here have `exists: false` and move to `historian/` when completed or played.

## Story Hierarchy

Documented in `scheduler/CLAUDE.md` — auto-loaded when working with scheduler files.

## Working Protocol

**Progressive disclosure:** This project uses subdirectory `CLAUDE.md` files to load domain rules only when relevant. Root CLAUDE.md stays lean. Do not load or re-derive subdirectory rules unless the task touches that domain. Trust that the right rules are in context when you need them.

**Reading** — read in this order, stopping as soon as the task is satisfied:

1. **Frontmatter only** — check `description`, `type`, `state`, `exists` before opening the body
2. **Body** — only if frontmatter doesn't answer the question
3. **Linked files** — follow `relates_to`, `known_by`, `resources`, etc. at most **1 hop** from the focal entity; go deeper only when explicitly required by the task

Before pulling any files for a generation or planning task, declare scope: what you intend to read and why. This keeps context bounded and gives the user a chance to redirect.

Meta files (`meta/worldbuilding-approach.md`, `meta/difficulty.md`, etc.) are read **once per task**, not re-read for each sub-task or entity created within it.

Scan commands (e.g. `/inventory`) read **frontmatter only** — never the body.

**Writing** — before editing any existing file, read its frontmatter to confirm `state` and `exists`. Never overwrite without knowing current state. Before creating new content, declare what you're creating and why — same discipline as declaring read scope.

## Entity Selection

Entity protocol (free entity rule, data transparency, contribution balance) documented in `data/CLAUDE.md` — auto-loaded when working with data files.

## Campaign Separation

This repo spans two campaigns: `strahd` (Curse of Strahd, sessions 1–present) and a future homebrew new world (name TBD). The transition will be a narrative device — a deliberate story beat, not a soft drift.

**`campaign` field** — historian and scheduler entities carry `campaign: strahd` or `campaign: <new-world-name>`. Data entities are campaign-agnostic by default (no tag) unless they are explicitly tied to one world.

**Session planning rules:**
- Identify the active campaign from `scheduler/campaign.md`
- Do not pull `campaign: strahd` entities into new-world sessions unless the DM explicitly requests a crossover
- Strahd-tagged entities are still visible and searchable — they just don't surface automatically in new-world content
- Crossover is always allowed when the DM asks for it (throwbacks, callbacks, deliberate bleed)

**New entities** created during or after the world transition should carry the new-world campaign tag. Entities created now, during seeding, are untagged (agnostic) unless clearly Strahd-specific.

## New Campaign Setup

When starting a new campaign, read `meta/new-campaign-setup.md` before generating any content.

## Entity Creation

When creating any entity, read `meta/entity-creation.md` before proceeding. It contains the full protocol, known schemas, Obsidian frontmatter rules, and gameplay mechanics guidance.

## Graph Configuration

When adding a new type, subtype, or entity folder, read `meta/graph-settings.md` before touching any config files.

## World Map

Map rules, tile protocol, and crop scripts documented in `maps/CLAUDE.md` — auto-loaded when working with map files.

## Scripts

PowerShell scripts in `./scripts/` replace repetitive multi-file reads. **Run these via Bash before manual file reads — they collapse 5–10 tool calls into one.**

| Script | When to use | Usage |
|---|---|---|
| `session-brief.ps1` | Start of every `/session` | `.\scripts\session-brief.ps1` |
| `session-state.ps1` | Quick campaign/act/mission check | `.\scripts\session-state.ps1` |
| `party-status.ps1` | PC stats + afflictions | `.\scripts\party-status.ps1` |
| `free-entities.ps1` | Find available entities by type or player | `.\scripts\free-entities.ps1 [-Type <type>] [-Player <name>]` |
| `contribution-balance.ps1` | Player contribution counts (pool vs. canonized) | `.\scripts\contribution-balance.ps1` |
| `entity-graph.ps1` | 1-hop relations for any entity | `.\scripts\entity-graph.ps1 -Name "<name>"` |
| `location-entities.ps1` | All historian entities near a location | `.\scripts\location-entities.ps1 -Location "<name>"` |
| `pitch-brief.ps1` | Start of every `/pitch` | `.\scripts\pitch-brief.ps1 [-Type <type>]` |
| `monster-lookup.ps1` | Find monsters by CR, creature type, or habitat | `.\scripts\monster-lookup.ps1 [-Type <type>] [-CRMin <n>] [-CRMax <n>] [-Habitat <name>]` |
| `route-cities.ps1` | Find all cities served by a trade route (uses city `routes` field) | `.\scripts\route-cities.ps1 -Route "<route name>"` |
| `count-markers.ps1` | Count undetailed cities (red dots) in a map region | `.\scripts\count-markers.ps1 -Feature "<name>"` or `-ColMin <n> -ColMax <n> -RowMin <n> -RowMax <n>` |
| `region-world-context.ps1` | Start of every `/region` Phase 1 — climate, wind rules, water checklist | `.\scripts\region-world-context.ps1 -Col <n> -Row <n>` |
| `region-scale.ps1` | Start of every `/region` Phase 2 — travel times and city spacing from grid span | `.\scripts\region-scale.ps1 -SpanGrids <n> -WaterBody <sea\|river\|both\|none> [-Locations <n>]` |
| `region-brief.ps1` | Resume a `/region` session — compressed draft summary | `.\scripts\region-brief.ps1 [-Region <slug>]` |
| `naming-status.ps1` | Show named vs. unnamed entries in world-naming questionnaire | `.\scripts\naming-status.ps1 [-Section <name>]` |
| `map-crop.ps1` | Crop world map by feature name or col/row; saves to `maps/locations/` | `.\scripts\map-crop.ps1 -Feature "<name>"` or `-ColMin <n> -ColMax <n> -RowMin <n> -RowMax <n> [-Margin <px>] [-Temp]` |
| `gen-tiles.py` | Regenerate all 9 world map tiles from `world-names.png` after replacing the source image | `python scripts\gen-tiles.py` |
| `index-entities.py` | Build/rebuild the semantic vector index (run after adding new entities) | `py -3.10 scripts\index-entities.py [--reset]` |
| `semantic-search.ps1` | Semantic similarity search — find entities by meaning, not keywords | `.\scripts\semantic-search.ps1 -Query "<text>" [-Type <type>] [-Subtype <sub>] [-Exists true\|false] [-Source data\|historian\|scheduler] [-K <n>]` |

Scripts output plain text; parse with your own judgment. They read frontmatter only (except `session-brief.ps1` which also reads the last session body for cliffhanger).

**Semantic index:** `vector-index/` (gitignored, rebuilt from source). Build once with `py -3.10 scripts\index-entities.py`, re-run after bulk entity additions. Use `semantic-search.ps1` to surface entities by thematic relevance — betrayal arcs, forgotten NPCs, callback hooks, contradiction checks.

**Index staleness check:** At the start of any session, read `vector-index/.index-built` (line 1: ISO timestamp, line 2: git commit SHA). Then run `git log --oneline <sha>..HEAD -- data/ historian/ scheduler/`. If any commits appear, flag it: "Semantic index stale since `<sha[:7]>` — run `py -3.10 scripts\index-entities.py`." Do not rebuild automatically; prompt the user. If `.index-built` is missing, index has never been built — prompt to run it.

## Player Entity Submissions

**Auto-ingestion trigger:** If any message, pasted content, or file contains a `<!-- CLAUDE-INGEST type: entity-questionnaire -->` block, treat it as a filled player questionnaire awaiting ingestion. Read `.claude/commands/entity-ingest.md` for the full flow. Never create an entity directly from raw player input.

## PC Backstory Ingestion

**Trigger:** Any of the following activate this flow:
- A file is placed in `historian/characters/pcs/` that lacks proper PC frontmatter (`exists: true`, `type: character`, `subtype: pc`)
- A message or pasted content contains raw backstory text that names a known PC

Read `.claude/commands/pc-backstory.md` for the full ingestion flow, gap analysis, and entity sourcing rules. **Do not write anything until DM confirms.**

## Campaign Transition Detection

**Trigger:** Any message containing language that suggests the party is leaving the current campaign context. Watch for:
- Leaving/ending the current campaign: "leaving Strahd", "done with Strahd", "finished with Barovia", "we're out of Barovia", "end of the Strahd arc"
- Starting fresh: "new world", "new campaign", "clean slate", "starting the homebrew", "transition"
- Narrative clean-slate signals: "the portal closes", "we're through", "no going back"

These phrases may appear casually — do not trigger on obvious metaphor or out-of-game chatter. When in doubt, ask once: *"Is the campaign transitioning to the new world? I can walk you through the handoff if so."*

If confirmed, read `.claude/commands/transition.md` and follow the full transition flow. Do not make any changes until the DM confirms each step.

## Recap Format

Whenever presenting a session recap — whether via `/session` Phase 1 orientation, a direct "what's the recap" prompt, or any other context — use this two-part format:

1. **Narrative prose** — 2–4 sentences, story-flavor, "previously on..." voice. Past tense, third person.
2. **TL;DR bullets** — party status (afflictions, notable conditions), open threads, cliffhanger. One line per item.

No DM brief card needed. No other formats unless explicitly requested.

## Commands

- `/commands` — `.claude/commands/commands.md`
- `/inventory` — `.claude/commands/inventory.md`
- `/session` — `.claude/commands/session.md`
- `/recap` — `.claude/commands/recap.md`
- `/entity-questionnaire` — `.claude/commands/entity-questionnaire.md`
- `/find <query>` — `.claude/commands/find.md` — semantic entity search; surfaces entities by meaning
- `/threads` — `.claude/commands/threads.md` — surfaces forgotten/unresolved campaign threads
- `/voice <npc name>` — `.claude/commands/voice.md` — DM voice brief grounded in established canon
- `/check <claim>` — `.claude/commands/check.md` — contradiction check against historian before canonizing
- `/transition` — `.claude/commands/transition.md` — guided campaign transition flow; also auto-triggered by language cues
