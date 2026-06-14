# CLAUDE.md

This file provides operational guidance to Claude Code (claude.ai/code) for working with this campaign engine.

**For project overview, quick start, and user-facing documentation:** See [README.md](./README.md)

---

## Project

This engine generates D&D sessions by synthesizing creative material, campaign history, design principles, and session planning into coherent, playable content.

**Roles:** One member of the table is the DM. The other players contribute creative material as seeds for them. Generation rules for this split live in `meta/worldbuilding-approach.md`.

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

## Placeholder Files

Blank or incomplete files (meta templates, draft lore, unfilled player files) are intentional placeholders the group fills later. When an audit or task surfaces one, the only required action is ensuring the `/todo` dashboard (`todo-dashboard.md`) carries an entry for filling it — as a backlog item with a note on what degrades until then. Don't flag them as defects, don't propose detection heuristics or workarounds to skip them, and don't score them as gaps beyond the todo entry.

## Entity Selection

Entity protocol (free entity rule, data transparency, contribution balance) documented in `data/CLAUDE.md` — auto-loaded when working with data files.

## Campaign Separation

This repo can span multiple campaigns (for example, an initial campaign and a later one set in a different world). A transition between them is a narrative device — a deliberate story beat, not a soft drift.

**`campaign` field** — historian and scheduler entities carry a `campaign: <name>` tag identifying which campaign they belong to. Data entities are campaign-agnostic by default (no tag) unless they are explicitly tied to one world.

**Session planning rules:**

- Identify the active campaign from `scheduler/campaign/` — the campaign file with `state: active`
- Do not pull entities tagged for a different campaign into the active campaign's sessions unless the DM explicitly requests a crossover
- Off-campaign entities are still visible and searchable — they just don't surface automatically in the active campaign's content
- Crossover is always allowed when the DM asks for it (throwbacks, callbacks, deliberate bleed)

**New entities** created during or after a world transition should carry the new campaign's tag. Entities created during seeding are untagged (agnostic) unless clearly tied to one campaign.

## Command Audits

`tests/` holds command audit specs, rubrics, and run logs — engine QA, not campaign content. Read `tests/CLAUDE.md` before running or writing a command audit. Files in `tests/` are never entities; they are excluded from `validate.ps1` and the semantic index.

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
| `todo-brief.ps1` | Start of every `/todo` — all DM action-item signals in one call | `.\scripts\todo-brief.ps1` |
| `inventory-brief.ps1` | Start of every `/inventory` — free entity pool grouped by type, with gaps | `.\scripts\inventory-brief.ps1 [-Type <type>]` |
| `threads-brief.ps1` | Start of every `/threads` Phase 2 — unresolved states, hostiles, pending seeds | `.\scripts\threads-brief.ps1` |
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
| `validate.ps1` | Graph integrity check — dangling `[[links]]`, missing/invalid `exists`/`name`/`type`, broken canon. Run before canonizing or after bulk edits | `.\scripts\validate.ps1 [-Scope all\|links\|frontmatter] [-Quiet]` |
| `validate-refs.ps1` | Instruction-file reference lint — finds path refs in CLAUDE.md files, commands, meta, tests, and todo files that point at renamed/deleted files. Run after renaming, moving, or deleting any instruction file or script | `.\scripts\validate-refs.ps1 [-Quiet]` |
| `refs.ps1` | Reverse dependency lookup — every file:line that references a target file. Run before renaming a file or changing a script's flags/output format, then update what it lists | `.\scripts\refs.ps1 -Target <path-or-filename>` |

**Script dependents:** each consumed script carries a `# consumers:` header line listing the instruction files that reference it. When changing a script's usage, flags, or output format, update those files in the same change.

Scripts output plain text; parse with your own judgment. They read frontmatter only (except `session-brief.ps1` which also reads the last session body for cliffhanger).

**Semantic index:** `vector-index/` (gitignored, rebuilt from source). Build once with `py -3.10 scripts\index-entities.py`, re-run after bulk entity additions. Use `semantic-search.ps1` to surface entities by thematic relevance — betrayal arcs, forgotten NPCs, callback hooks, contradiction checks.

**Index staleness check:** At the start of any session, read `vector-index/.index-built` (line 1: ISO timestamp, line 2: git commit SHA). Then run `git log --oneline <sha>..HEAD -- data/ historian/ scheduler/`. If any commits appear, flag it: "Semantic index stale since `<sha[:7]>` — run `py -3.10 scripts\index-entities.py`." Ignore commits that touch only non-indexed files (`CLAUDE.md`, `README.md`) — the indexer skips them, so they cannot stale the index. Do not rebuild automatically; prompt the user. If `.index-built` is missing, index has never been built — prompt to run it.

## Stamp Pattern

Recurring engine idiom for drift-prone state: stamp the state with the marker it was last confirmed at (session number or git SHA), restamp on every `/recap` even when nothing changed, and let a script flag when the stamp lags the latest played session. A stale stamp means reconstruct-with-DM — never trust the old numbers. Current instances: `vector-index/.index-built` (git SHA), PC `level_confirmed`, the campaign Rest Clock header. Use this pattern for any new state that can go silently stale.

## Player Entity Submissions

**Auto-ingestion trigger:** If any message, pasted content, or file contains a `<!-- CLAUDE-INGEST type: entity-questionnaire -->` block, treat it as a filled player questionnaire awaiting ingestion. Read `.claude/commands/entity-ingest.md` for the full flow. Never create an entity directly from raw player input.

## Session Notes Ingestion (Recap Inbox)

**Auto-ingestion trigger:** any markdown file in `recaps/inbox/` is raw session notes awaiting canonization — the DM drops rough notes there after play. When one exists at session start (`session-brief.ps1` flags it, along with any session whose `planned_date` has passed with no historian record), offer to run `/recap` using that file as the what-happened notes. Never canonize without the DM walking the `/recap` flow; after canonization completes, delete the inbox file — its content lives in the historian record.

## PC Backstory Ingestion

**Trigger:** Any of the following activate this flow:

- A file is placed in `historian/characters/pcs/` that lacks proper PC frontmatter (`exists: true`, `type: character`, `subtype: pc`)
- A message or pasted content contains raw backstory text that names a known PC

Read `.claude/commands/pc-backstory.md` for the full ingestion flow, gap analysis, and entity sourcing rules. **Do not write anything until DM confirms.**

## Campaign Transition Detection

**Trigger:** Any message containing language that suggests the party is leaving the current campaign context. Watch for:

- Leaving/ending the current campaign: "leaving this campaign", "done with the current campaign", "finished with this arc", "we're out of here", "end of the current arc"
- Starting fresh: "new world", "new campaign", "clean slate", "starting the next campaign", "transition"
- Narrative clean-slate signals: "the portal closes", "we're through", "no going back"

These phrases may appear casually — do not trigger on obvious metaphor or out-of-game chatter. When in doubt, ask once: *"Is the campaign transitioning to a new world? I can walk you through the handoff if so."*

If confirmed, read `.claude/commands/transition.md` and follow the full transition flow. Do not make any changes until the DM confirms each step.

## Output Style

No markdown tables in chat responses or generated campaign documents — use bullet lists with inline formatting instead. Existing tables inside instruction files (like the scripts table in this file) are exempt.

## Followup Suggestions

When a task reaches a natural endpoint, suggest at most **one** followup command — and only when the current state actually warrants it (e.g. entities just written → index rebuild; gap surfaced → fill command). Name the command and the reason in a single line: "Run `/x` to <reason>." Never append a boilerplate suggestion tail to every response; no state signal, no suggestion. Command files may specify their own closing suggestions — those take precedence.

## Recap Format

Whenever presenting a session recap — whether via `/session` Phase 1 orientation, a direct "what's the recap" prompt, or any other context — use this two-part format:

1. **Narrative prose** — 2–4 sentences, story-flavor, "previously on..." voice. Past tense, third person.
2. **TL;DR bullets** — party status (afflictions, notable conditions), open threads, cliffhanger. One line per item.

No DM brief card needed. No other formats unless explicitly requested.

## Commands

- `/commands` — `.claude/commands/commands.md` — list all available slash commands with descriptions
- `/inventory` — `.claude/commands/inventory.md` — scan all entities in `./data` and report what's in the pool
- `/session` — `.claude/commands/session.md` — plan the next session from campaign state, threads, and scheduler
- `/recap` — `.claude/commands/recap.md` — canonize a played session and write it to historian
- `/entity-questionnaire` — `.claude/commands/entity-questionnaire.md` — generate a player-facing questionnaire to design a new world entity
- `/find <query>` — `.claude/commands/find.md` — semantic entity search; surfaces entities by meaning
- `/threads` — `.claude/commands/threads.md` — surfaces forgotten/unresolved campaign threads
- `/voice <npc name>` — `.claude/commands/voice.md` — DM voice brief grounded in established canon
- `/rumor [count] [theme]` — `.claude/commands/rumor.md` — surface pool rumors as session-opener flavor; read-only
- `/check <claim>` — `.claude/commands/check.md` — contradiction check against historian before canonizing
- `/transition` — `.claude/commands/transition.md` — guided campaign transition flow; also auto-triggered by language cues
- `/todo` — `.claude/commands/todo.md` — plain-language DM dashboard of everything needing attention or action
