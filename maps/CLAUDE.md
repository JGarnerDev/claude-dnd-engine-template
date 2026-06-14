# World Map

The world map lives at `maps/world/world-names.png` (8192×6144px). The Read tool downsamples it — labels are unreadable at full scale.

**Two separate map files — ground vs. sky:**

- `maps/world/world-names.png` — all surface features: continents, mountains, rivers, plains, seas, cities, etc.
- `maps/world/world-sky.png` — all air-situated features: Islifts, Slices, and anything else floating above the surface. These are **not** in `world-names.png` and are updated separately. When labeling sky features (e.g. Islift names), the user must edit `world-sky.png` manually. Scripts and crops that pull from `world-names.png` will not show sky features.

**Always use pre-cropped tiles.** Nine tiles cover the full map with overlap: `maps/world/tiles/nw.png`, `n.png`, `ne.png`, `w.png`, `c.png`, `e.png`, `sw.png`, `s.png`, `se.png`. Read the tile that contains your area of interest. Tile coverage and key content are documented in `maps/world/index.md`.

**City markers layer:** `maps/world/city-markers.png` is a transparent PNG (same 8192×6144px as `world-names.png`) with red dots marking cities that exist in the world but are unnamed and undetailed. Dots carry no labels — they mean "work needed here." Tiles of this layer live in `maps/world/tiles/markers-{nw,n,...}.png` (regenerate with `gen-tiles.py`). Read a markers tile alongside the base tile to see which cities in an area are undetailed. Use `map-crop.ps1 -Markers` to crop both layers for a specific region at once.

**City graduation — when a city is named and detailed:**

1. Add its label to `world-names.png` (the authority for all named, canonical features)
2. Remove its dot from `city-markers.png`
3. Run `python scripts\gen-tiles.py` to regenerate both tile sets
4. Add the city/region to the Known Region Positions table in `maps/world/index.md` if it warrants a permanent crop entry
5. Remove the city's entry from `maps/world/city-registry.md` — add its registry ID (e.g. `C05-04a`) to the entity's `aliases:` field so existing cross-references resolve

After graduation the city appears in base tile reads and no longer appears in markers tile reads. `world-names.png` is the source of truth — if a label is there, the city is canonical.

**Index maintenance:** `maps/world/index.md` → Known Region Positions is the lookup table for `map-crop.ps1 -Feature`. Add an entry whenever you identify a named feature's col/row from a tile or crop — bays, forests, plains, mountain ranges, rivers, sub-continents. One line per feature; col/row can be approximate. If a feature lacks a draft, use `—`. Update this proactively rather than waiting until a feature is formally worked.

**Four hard rules:**

1. **Read a tile before describing any feature's position.** Never infer position from geography alone — always read the label from the map.
2. **Letter assignments come from the map, never invented.** If a section of the questionnaire needs letters (Plains A, River B, etc.), crop the relevant tile and count what's actually labeled before writing entries.
3. **When a tile isn't precise enough**, use `.\scripts\map-crop.ps1 -Feature "<name>" -Temp` for a targeted crop. Read it, then delete `maps/world/temp-crop.png`. Pixel formula is in the **Grid Scale** section below if you need to crop manually via PIL.
4. **If a feature isn't found in the primary tile, check all adjacent tiles before concluding it's absent.** Features near tile boundaries are often labeled on the neighboring tile. Never declare a feature missing after checking only one tile.

**When replacing `world-names.png`**, regenerate all tiles immediately: `python scripts\gen-tiles.py`. Then read affected tiles to diff labels before updating `index.md`.

Region and location drafts can have their own permanent crop. Use `.\scripts\map-crop.ps1 -Feature "<name>"` — looks up col/row from the index and saves to `maps/locations/<slug>-map.png` automatically.

**Map work delegation:** the table's designated world-builder (often a player) may be available for manual map-making — world map edits, region/city/derivative maps. When manual map or image work comes up, remind the DM it can be handed off **unless the map is a secret** (content players should only see when they discover it in play — a player world-builder would be spoiled). The DM decides which maps are safe to delegate; spoiler-free maps default to the world-builder.

To hand work off, copy `maps/map-request-template.md` to `questionnaires/map-<slug>.md`, fill the DM sections (the spoiler check is mandatory), and send it to the world-builder. Claude can draft the fill from canon — pull must-include features from the relevant tiles, drafts, and registry entries rather than asking the DM to recall them.

---

## Grid Scale

**Structural (always true):** places are addressed by a 1-indexed column/row grid laid over `world-names.png`. A cell's pixel box is `cellW × cellH`; left edge of col N = `(N−1) × cellW`, top edge of row N = `(N−1) × cellH`. Cell distance (km) drives all `/region` travel-time and city-spacing math.

**Per-world values — set at setup, not universal.** The numbers below are the template's defaults, i.e. *one campaign's choice* — a new world picks its own (see `meta/new-campaign-setup.md` → Map & geography setup). These four scripts **hardcode** the same numbers: `map-crop.ps1`, `count-markers.ps1`, `region-scale.ps1`, `region-world-context.ps1`. Changing a world's scale means updating this section **and** those scripts together.

- Distance per cell: **1000km × 1000km**
- Grid dimensions: ~16 columns × ~13 rows
- Equator row: ~7 / Poles: row 1 (north), row 13 (south)
- Cell pixel size: 512px wide × 472px tall (depends on the base image resolution)

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
