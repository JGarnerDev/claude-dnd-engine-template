# World Map

## Map images are gitignored — you supply the masters, tiles are generated locally

No map images live in git. Map masters, the generated tiles, and any crops are large binaries whose repeated diffs bloat the `.git` history badly, so `.gitignore` blankets `maps/**/*.{png,webp,jpg,jpeg,gif}`. **How you obtain and store the masters is up to you** (a CDN/asset host, an external drive, a manual export — your call); the engine only needs them present locally under `maps/world/masters/`. The committed map artifacts are the markdown scaffolds (`index.md`, `city-registry.md`, and their templates) and this file.

> **Never commit generated images.** The default output paths all sit inside `maps/` and are covered by the ignore rules. The one gap: `map-crop.ps1 -Output <path>` can write a crop *outside* `maps/`, which the ignore rules do not catch. Always keep `-Output` inside `maps/` (the default `maps/locations/` is correct). If you ever crop elsewhere, `git status` it before any commit and discard it.

**Cold-start sequence (a fresh clone has no images):**

1. Place your master images in `maps/world/masters/` (see filenames below).
2. `python scripts\gen-tiles.py` — slices masters into `maps/world/tiles/` (creates the dir).

Until the masters are present, `map-crop.ps1` and `count-markers.ps1` stop with a guard error telling you to supply them (`scripts/map-common.ps1` → `Require-Master`). There is no committed fallback.

- Masters can be **any resolution** — never assume a pixel size. Every script derives cell size from the master's actual `img.size` at run time (`cellW = W/16`, `cellH = H/13`), so any export resolution works without edits.
- Masters can be **any common image format** — `webp`, `png`, `jpg`, `jpeg`, or `gif`. Scripts resolve each master by *stem* (`world-names.<ext>`), trying those extensions in order, so you don't have to convert your exports. Below the filenames are shown with `.webp`, but `.png` etc. work identically.
- The Read tool downsamples large images, so master labels are unreadable at full scale — always read a pre-cropped tile.

**Three master images — ground, sky, markers** (name each by its stem; any accepted extension works):

- `maps/world/masters/world-names.<ext>` — all surface features: continents, mountains, rivers, plains, seas, cities, etc.
- `maps/world/masters/world-sky.<ext>` — all air-situated features floating above the surface. These are **not** in the `world-names` master. Tiled separately as `sky-{nw,n,...}.png`; scripts that pull from `world-names` will not show sky features.
- `maps/world/masters/city-markers.<ext>` — a **flattened base+dots export**: the full surface map with red dots burned in over it (not a transparent overlay). Red dots mark cities that exist but are unnamed and undetailed — they mean "work needed here."

**Always use pre-cropped tiles.** Nine tiles per master cover the full map with overlap. Read the tile that contains your area of interest. Tile coverage and key content are documented in `maps/world/index.md`.

- Base: `maps/world/tiles/{nw,n,ne,w,c,e,sw,s,se}.png`
- Markers: `maps/world/tiles/markers-{nw,...}.png` — read alongside the base tile to see which cities in an area are undetailed
- Sky: `maps/world/tiles/sky-{nw,...}.png` — read for air-situated features

Use `map-crop.ps1 -Markers` to crop the base and markers layers for a region at once. Regenerate every tile set with `python scripts\gen-tiles.py`.

### Editing a master

Masters are edited in your own map tool and re-placed — not edited in-repo. To change the map (add a label, move a marker, edit sky features): edit the master, drop the updated file back into `maps/world/masters/`, run `python scripts\gen-tiles.py` to regenerate all tiles, then read the affected tiles to diff labels before updating `index.md`.

**City graduation — when a city is named and detailed:**

1. In your map tool, add its label to the base map and remove its dot from the markers map, then re-place both updated masters in `maps/world/masters/`
2. Run `python scripts\gen-tiles.py` to refresh tiles
3. Add the city/region to the Known Region Positions table in `maps/world/index.md` if it warrants a permanent crop entry
4. Remove the city's entry from `maps/world/city-registry.md` — add its registry ID (e.g. `C05-04a`) to the entity's `aliases:` field so existing cross-references resolve

After graduation the city appears in base tile reads and no longer appears in markers tile reads. The `world-names` master is the source of truth — if a label is there, the city is canonical.

**Index maintenance:** `maps/world/index.md` → Known Region Positions is the lookup table for `map-crop.ps1 -Feature`. Add an entry whenever you identify a named feature's col/row from a tile or crop — bays, forests, plains, mountain ranges, rivers, sub-continents. One line per feature; col/row can be approximate. If a feature lacks a draft, use `—`. Update this proactively rather than waiting until a feature is formally worked.

**Four hard rules:**

1. **Read a tile before describing any feature's position.** Never infer position from geography alone — always read the label from the map.
2. **Letter assignments come from the map, never invented.** If a section of the questionnaire needs letters (Plains A, River B, etc.), crop the relevant tile and count what's actually labeled before writing entries.
3. **When a tile isn't precise enough**, use `.\scripts\map-crop.ps1 -Feature "<name>" -Temp` for a targeted crop. Read it, then delete `maps/world/temp-crop.png`. Pixel formula is in the **Grid Scale** section below if you need to crop manually via PIL.
4. **If a feature isn't found in the primary tile, check all adjacent tiles before concluding it's absent.** Features near tile boundaries are often labeled on the neighboring tile. Never declare a feature missing after checking only one tile.

**When a master changes**, re-place it in `maps/world/masters/` and regenerate all tiles immediately: `python scripts\gen-tiles.py`. Then read affected tiles to diff labels before updating `index.md`.

Region and location drafts can have their own permanent crop. Use `.\scripts\map-crop.ps1 -Feature "<name>"` — looks up col/row from the index and saves to `maps/locations/<slug>-map.png` automatically.

**Map work delegation:** the table's designated world-builder (often a player) may be available for manual map-making — world map edits, region/city/derivative maps. When manual map or image work comes up, remind the DM it can be handed off **unless the map is a secret** (content players should only see when they discover it in play — a player world-builder would be spoiled). The DM decides which maps are safe to delegate; spoiler-free maps default to the world-builder.

To hand work off, copy `maps/map-request-template.md` to `questionnaires/map-<slug>.md`, fill the DM sections (the spoiler check is mandatory), and send it to the world-builder. Claude can draft the fill from canon — pull must-include features from the relevant tiles, drafts, and registry entries rather than asking the DM to recall them.

---

## Grid Scale

**Structural (always true):** places are addressed by a 1-indexed column/row grid laid over the `world-names` master. A cell's pixel box is `cellW × cellH`; left edge of col N = `(N−1) × cellW`, top edge of row N = `(N−1) × cellH`. Cell distance (km) drives all `/region` travel-time and city-spacing math.

**Cell pixel size is never hardcoded.** It is derived per-image from the master's actual resolution at run time: `cellW = imageWidth / 16`, `cellH = imageHeight / 13`. `map-crop.ps1`, `count-markers.ps1`, and `gen-tiles.py` all open the master and read `img.size` before computing crop boxes, so any export resolution works without edits.

**Per-world values — set at setup, not universal.** The grid count and the per-cell distance are *one campaign's choice* — a new world picks its own (see `meta/new-campaign-setup.md` → Map & geography setup). Only the **km-per-cell** distance is hardcoded, in `region-scale.ps1` and `region-world-context.ps1` (`$GRID_KM`); changing a world's scale means updating this section **and** those two scripts together.

- Distance per cell: **1000km × 1000km** (`$GRID_KM`)
- Grid dimensions: ~16 columns × ~13 rows (the `16 × 13` divisor used to derive cell pixels)
- Equator row: ~7 / Poles: row 1 (north), row 13 (south)
- Cell pixel size: derived at run time from the master's resolution (not a fixed number)

## Climate Rules

**Structural (the method):** derive a region's climate, coastline, and drainage from three inputs — its latitude (distance from the equator row), the world's prevailing wind direction, and which way a coast/slope faces relative to that wind. Windward coasts are wet; leeward coasts are dry (rain shadow behind mountains); maritime latitudes are mild, high latitudes stormy/grey.

**Per-world model — confirm or replace at setup.** The default below assumes an **Earth-like world with west-to-east prevailing winds and the equator near row 7**. A world with different prevailing winds, multiple suns, magical climate, or no clear latitude bands needs its own model here — and `region-world-context.ps1` encodes this default, so update the script if you change it. Capture the world's actual biomes in `maps/world/index.md` → Biome Census and reconcile them against whatever model you keep here.

*Default model (west-to-east winds, equator row 7; latitude = distance from row 7):*

- West-facing (windward) coasts/slopes vary by latitude:
  - Tropical (dist ≤1): warm and humid; wet/dry seasons; NOT persistently grey
  - Subtropical (dist 2): Mediterranean — hot dry summers, mild wet winters; sunny, not grey
  - Warm temperate (dist 3): mild maritime; reliable moisture; can be overcast but not cold
  - Temperate/cold (dist ≥4): maximum moisture, frequent storms; grey skies common
- East-facing (leeward) coasts/slopes: drier; rain shadow if mountains present
- Rivers drain east/southeast off mountain ranges
- West coasts (tropical/subtropical): warm water, beaches possible, rocky headlands between bays
- West coasts (temperate/cold): rocky cliffs, sea stacks, no beaches
- East coasts: sandy beaches / river mouths: wide estuaries

## City Marker ID Format

Unnamed city markers carry stable IDs in `maps/world/city-registry.md` (campaign data) until they graduate.

- **ID format:** `C{col}-{row}{letter}` — col/row are map grid cells (1-indexed), letter disambiguates within the same cell (e.g. `C05-04a`).
- IDs persist until a city is named and graduated (see the **City graduation** steps above). On graduation, remove the registry entry and add the ID to the entity's `aliases:` field so cross-references resolve.
