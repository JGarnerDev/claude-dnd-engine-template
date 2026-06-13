<!-- SKELETON — copy to maps/world/index.md and fill once map layers are placed. Delete these HTML comments as you go. Structural rules (Grid Scale, Climate Rules, City Marker ID Format) live in maps/CLAUDE.md, NOT here — this file holds only this world's data. -->

# World Map

## Status

<!-- One-line dated log of map ingestions and label changes. Append, newest at top. Example:
Updated YYYY-MM-DD: base layer ingested, N features named, tiles generated. -->

## Images

<!-- List only the layers this campaign actually has. Drop lines you don't use. -->
- `world-names.png` — base label layer; all land + water features and every named label. Source of truth. **{W}×{H}px.**
- `world-sky.png` — optional sky layer (floating/aerial features). Edited manually; surface scripts ignore it.
- `city-markers.png` — transparent overlay; red dots = unnamed, undetailed cities. Tiled as `tiles/markers-{name}.png`.
- `city-registry.md` — stable IDs for every undetailed marker. See `maps/CLAUDE.md` → City Marker ID Format.

## Biome Census

<!-- The biomes/climate zones this world contains, captured at setup (Map & Geography step). One line per biome: name — where it sits (rough col/row band or named region) — defining traits. This is the world's ecological palette; /region and entity generation draw on it. Reconcile with the Climate Rules model in maps/CLAUDE.md. -->

## Tile Coverage

<!-- Fill after running `python scripts\gen-tiles.py` and reading each tile. Nine overlapping tiles cover the full map; Cols/Rows are this world's grid. Key content = the named features a tile contains. -->

| Tile | File | Cols | Rows | Key content |
|---|---|---|---|---|
| Northwest | `tiles/nw.png` |  |  |  |
| North | `tiles/n.png` |  |  |  |
| Northeast | `tiles/ne.png` |  |  |  |
| West | `tiles/w.png` |  |  |  |
| Center | `tiles/c.png` |  |  |  |
| East | `tiles/e.png` |  |  |  |
| Southwest | `tiles/sw.png` |  |  |  |
| South | `tiles/s.png` |  |  |  |
| Southeast | `tiles/se.png` |  |  |  |

## Known Region Positions

<!-- Lookup table for `map-crop.ps1 -Feature` and `count-markers.ps1` — KEEP THIS HEADER AND COLUMN FORMAT; the scripts parse it. One row per named feature; col/row approximate is fine; use — when a feature has no draft yet. Grow proactively as you identify features in tiles. -->

| Feature | Col | Row | Draft |
|--------|-----|-----|-------|

## Cosmology Notes

<!-- Optional — world-specific cosmological facts that affect geography (orbital bodies, planar seams, floating-mass origins). Delete this section if the world has none. -->
