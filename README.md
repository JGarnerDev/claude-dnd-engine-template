# Claude D&D Engine

A Claude Code-powered campaign engine for running and generating D&D 5e sessions. It synthesizes creative material, campaign history, design principles, and session planning into coherent, playable content.

---

## What This Is

This engine gives Claude a structured knowledge base and a set of commands to:

- Plan sessions that advance an active story hierarchy (campaign → act → mission → session)
- Track a canonical record of played events, canonized NPCs, and confirmed world facts
- Maintain a free entity pool of unplayed content available for session use
- Enforce consistent entity creation via schemas and type/tag registries

Claude reads your campaign files, follows the protocols in `CLAUDE.md`, and generates session content grounded in what has actually happened in your game.

---

## Getting Started

**1. Configure your campaign identity**

Fill in `scheduler/campaign.md` with your campaign name, premise, central conflict, and tone.

Fill in `meta/worldbuilding.md` with setting pillars, themes, and what to avoid.

**2. Set up your players**

Copy `meta/players/player-template.md` once per player. Fill in their preferences and character. Add a `player/name` tag to `meta/tags.md` for each one.

**3. Configure difficulty and rewards**

Fill in `meta/difficulty.md` and `meta/rewards.md` with your party's profile and your desired pacing.

**4. Seed your world**

Create entities in `data/` — regions, cities, factions, NPCs, dungeons. The engine draws from this free pool when generating sessions. See `TODO.md` for a full checklist.

**5. Create your first act and mission**

Use Claude to create `scheduler/acts/` and `scheduler/missions/` files that define your story arc.

**6. Run `/session`**

Ask Claude to plan the next session. It reads the story hierarchy and generates a playable session plan grounded in your campaign state.

---

## Folder Structure

- `data/` — Free entity pool. Content available to be used in sessions. Seeded with canonical D&D 5e backgrounds, classes, races, and deities.
- `historian/` — Authoritative record. Entities move here after being played and canonized. When `data/` and `historian/` conflict, `historian/` wins.
- `meta/` — Design principles, schemas, tag/type registries, and player preferences.
- `scheduler/` — Active story layer. Campaign, act, mission, and session plan files live here until completed.

---

## Commands

- `/session` — Plan the next session
- `/recap` — Canonize a played session (moves entities to `historian/`)
- `/inventory` — List all free entities in `data/` by type

---

## Story Hierarchy

```
Campaign (scheduler/campaign.md)
  └── Act (scheduler/acts/*.md)
        └── Mission (scheduler/missions/*.md)
              └── Session (scheduler/sessions/*.md → historian/sessions/ when played)
```

Each level references the one above and the ones below via wiki-links.

---

## Requirements

- [Claude Code](https://claude.ai/code) CLI or desktop app
- [Obsidian](https://obsidian.md) (optional, recommended for graph view and wiki-link navigation)
- [Foam](https://foambubble.github.io/foam/) for VS Code (optional alternative to Obsidian)

For full operational guidance, see `CLAUDE.md`.
