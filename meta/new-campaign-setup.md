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

## Step 3 — Map & geography setup *(optional, recommended)*

The engine runs mapless (theater-of-the-mind, or a module's own map) — but a world map keeps travel, adjacency, and `/region` math consistent. Ask the DM up front, before any region or city work:

- **Providing a map at all?** If no, skip this step entirely — pool entities don't need coordinates. If yes, continue.
- **Which layers, and when** — `world-names.png` (base, required), `world-sky.png` (optional aerial), `city-markers.png` (optional undetailed-city dots). Note which exist now vs. coming later; build only from what's present.
- **World & grid scale** — real-world distance per cell, grid dimensions (cols × rows), equator row, pole rows, base image pixel size. Record these in `maps/CLAUDE.md` → Grid Scale (and update the hardcoded numbers in the map scripts if they differ from the template defaults).
- **Biome census** — what biomes / climate zones the world contains and roughly where. Captured into the **Biome Census** section of `index.md` below; it feeds `/region` and entity generation.

**Build from skeletons (do not pre-fill, do not ship a foreign world's data):** once the layers are placed in `maps/world/`, build this world's data files from the synced skeletons:

1. Copy `maps/world/index-template.md` → `maps/world/index.md`; fill Status, Images, Biome Census, and grid pixel size. Leave Tile Coverage / Known Region Positions to populate as features are read.
2. Copy `maps/world/city-registry-template.md` → `maps/world/city-registry.md` (only if a markers layer exists).
3. Run `python scripts\gen-tiles.py` to slice every layer into the nine legible tiles.
4. Read the tiles to fill Tile Coverage and seed Known Region Positions.

The skeletons and `maps/CLAUDE.md` are the only map files that ship in the template; `index.md`, `city-registry.md`, and all `.png` layers are this world's data and are never shipped pre-filled.

---

## Step 4 — Proceed to campaign and act creation

Once the four meta files exist and `meta/worldbuilding.md` is filled (and the map is set up, if used), run `/session` to begin. The engine's commands assume these files are present; a missing `meta/worldbuilding.md` will produce thin or off-tone output.
