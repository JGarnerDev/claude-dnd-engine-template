# New Campaign Setup

Before generating any content for a new campaign, create the four campaign-specific meta files below and populate `meta/worldbuilding.md` from player input. These files are intentionally excluded from `.template-sync` — they carry this group's specific content, not engine structure.

---

## Step 1 — Collect player worldbuilding preferences

Ask players:

- Tone and inspirations (books, games, films)
- Biomes or settings they want to explore
- Magic: how rare, how it works, who has access
- Notable resources, economies, or factions of interest
- Anything they want to avoid

---

## Step 2 — Create these four files before any entity or session work

### `meta/worldbuilding.md`

The creative contract for this campaign. Fill from player answers above. Required sections: Tone, Core Themes, Setting Pillars, World Textures (key textures and economies), What to Avoid. See the existing campaign's `meta/worldbuilding.md` as a format reference.

### `meta/campaign-design-preferences.md`

Player-sourced design desires — story beats, antagonist archetypes, mission structures the group wants to experience. Required sections: Desired Major Events, Antagonist Archetypes, Mission Preferences, Session Preferences, Player Agency Principle. Each item needs a `Deployed: —` tracking line. See existing file for format. Start empty; fill as players express desires during Session 0 and early play.

### `meta/mysteries.md`

Load-bearing unknowns the DM is protecting. Required sections: Active Mysteries (with `Revealed: —` lines), How to Add a Mystery, Principles. Start with one or two mysteries established during campaign design; add more as play reveals them. See existing file for format.

### `meta/party-relationships.md`

DM's read on bonds, tensions, and shared history between PCs. Not canon history (that's `historian/`) — the relational texture of the group. Start sparse; fill in as play develops. No fixed schema required; free-form sections per relationship pair or group dynamic.

---

## Step 3 — Proceed to campaign and act creation

Once all four files exist and `meta/worldbuilding.md` is filled, run `/session` to begin. The engine's commands assume these files are present; a missing `meta/worldbuilding.md` will produce thin or off-tone output.
