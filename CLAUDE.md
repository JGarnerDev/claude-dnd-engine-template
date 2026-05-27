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

Content is organized from largest to smallest narrative unit:

| Level | File location | Moves to historian when… |
|---|---|---|
| **Campaign** | `scheduler/campaign.md` | Campaign fully concludes |
| **Act** | `scheduler/acts/{name}.md` | Act completes |
| **Mission** | `scheduler/missions/{name}.md` | Mission resolves (success or failure) |
| **Session** | `scheduler/sessions/session-{nn}-{name}.md` | Session is played |

Each level references the one above it and the ones below it via wiki-links. Sessions advance missions; missions build acts; acts serve the campaign.

## Context and Reading Strategy

Read in this order, stopping as soon as the task is satisfied:

1. **Frontmatter only** — check `description`, `type`, `state`, `exists` before opening the body
2. **Body** — only if frontmatter doesn't answer the question
3. **Linked files** — follow `relates_to`, `known_by`, `resources`, etc. at most **1 hop** from the focal entity; go deeper only when explicitly required by the task

Before pulling any files for a generation or planning task, declare scope: what you intend to read and why. This keeps context bounded and gives the user a chance to redirect.

Meta files (`meta/worldbuilding-approach.md`, `meta/difficulty.md`, etc.) are read **once per task**, not re-read for each sub-task or entity created within it.

Scan commands (e.g. `/inventory`) read **frontmatter only** — never the body.

## Free Entity Rule

Entities in `./data` with `exists: false` are **free** — available to be used in session content. Entities that get played and canonized move to `./historian` with `exists: true`.

**When generating or planning content that requires an entity:**
1. First search `./data` for a free entity (`exists: false`) of the needed type.
2. If one exists, use it — do not invent a new one.
3. If none exists, **stop and ask the user** before creating anything. Present the gap clearly: what type is needed, why, and ask whether they want to create one or proceed differently.

Never silently generate a net-new entity during session planning or content generation. The data pool is intentional — running it low is meaningful signal, not a problem to paper over.

## New Campaign Setup

When starting a new campaign, read `meta/new-campaign-setup.md` before generating any content.

## Entity Creation

When creating any entity, read `meta/entity-creation.md` before proceeding. It contains the full protocol, known schemas, Obsidian frontmatter rules, and gameplay mechanics guidance.

## Graph Configuration

When adding a new type, subtype, or entity folder, read `meta/graph-settings.md` before touching any config files.

## Scripts

PowerShell scripts in `./scripts/` replace repetitive multi-file reads. **Run these via Bash before manual file reads — they collapse 5–10 tool calls into one.**

| Script | When to use | Usage |
|---|---|---|
| `session-brief.ps1` | Start of every `/session` | `.\scripts\session-brief.ps1` |
| `session-state.ps1` | Quick campaign/act/mission check | `.\scripts\session-state.ps1` |
| `party-status.ps1` | PC stats + afflictions | `.\scripts\party-status.ps1` |
| `free-entities.ps1` | Find available entities by type | `.\scripts\free-entities.ps1 [-Type <type>]` |
| `entity-graph.ps1` | 1-hop relations for any entity | `.\scripts\entity-graph.ps1 -Name "<name>"` |
| `location-entities.ps1` | All historian entities near a location | `.\scripts\location-entities.ps1 -Location "<name>"` |
| `pitch-brief.ps1` | Start of every `/pitch` | `.\scripts\pitch-brief.ps1 [-Type <type>]` |
| `monster-lookup.ps1` | Find monsters by CR, creature type, or habitat | `.\scripts\monster-lookup.ps1 [-Type <type>] [-CRMin <n>] [-CRMax <n>] [-Habitat <name>]` |

Scripts output plain text; parse with your own judgment. They read frontmatter only (except `session-brief.ps1` which also reads the last session body for cliffhanger).

## Player Entity Submissions

**Auto-ingestion trigger:** If any message, pasted content, or file contains a `<!-- CLAUDE-INGEST type: entity-questionnaire -->` block, treat it as a filled player questionnaire awaiting ingestion. Read `.claude/commands/entity-ingest.md` for the full flow. Never create an entity directly from raw player input.

## PC Backstory Ingestion

**Trigger:** Any of the following activate this flow:
- A file is placed in `historian/characters/pcs/` that lacks proper PC frontmatter (`exists: true`, `type: character`, `subtype: pc`)
- A message or pasted content contains raw backstory text that names a known PC

Read `.claude/commands/pc-backstory.md` for the full ingestion flow, gap analysis, and entity sourcing rules. **Do not write anything until DM confirms.**

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
