# World Map

The world map lives at `maps/world/world-names.png` (8192×6144px). The Read tool downsamples it — labels are unreadable at full scale.

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
3. **When a tile isn't precise enough**, use `.\scripts\map-crop.ps1 -Feature "<name>" -Temp` for a targeted crop. Read it, then delete `maps/world/temp-crop.png`. Pixel formula is in `maps/world/index.md` → Grid Scale if you need to crop manually via PIL.
4. **If a feature isn't found in the primary tile, check all adjacent tiles before concluding it's absent.** Features near tile boundaries are often labeled on the neighboring tile. Never declare a feature missing after checking only one tile.

**When replacing `world-names.png`**, regenerate all tiles immediately: `python scripts\gen-tiles.py`. Then read affected tiles to diff labels before updating `index.md`.

Region and location drafts can have their own permanent crop. Use `.\scripts\map-crop.ps1 -Feature "<name>"` — looks up col/row from the index and saves to `maps/locations/<slug>-map.png` automatically.
