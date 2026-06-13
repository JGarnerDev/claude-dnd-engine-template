# Settlement & Route Conventions

Domain rules for creating and managing settlements (cities, towns, villages, hamlets) and the roads and routes that connect them. Read this before creating any `location-city`, `route`, or road-flavored `location-wilderness` entity. The universal creation protocol stays in `meta/entity-creation.md` — this file adds the settlement-specific conventions on top.

## Settlement & Road Tiers (Minor Places)

The world map's scale governs everything here: **1 grid cell = 1000km × 1000km**, and foot pace is ~30km/day (see `scripts/region-scale.ps1`). Map dots and registry IDs mark *major* cities only. At this scale a realistic world has a hamlet or waystation roughly every day's walk along any maintained road — thousands of settlements the map cannot and should not show. **Map silence is not world absence** (same principle as `/region`), and the inverse holds too: world presence does not demand an entity file.

**Settlement tiers** — no new schema or subtype. Towns, villages, and hamlets all use `location-city` (`subtype: city`), distinguished by convention:
- Town / large village → `importance: minor`, `population` free-text (e.g. `"~800, market town"`)
- Hamlet / waystation / crossroads inn cluster → `importance: background`
- Minor settlements have **no registry ID** — they sit below map resolution. Skip City Registry Graduation entirely (per its "no registry entry matches" clause).
- **Composition by inheritance:** a minor settlement defaults to the composition of its surrounding region or nearest major city — leave `composition` empty unless the place *deviates* (a dwarven mining hamlet near the range, a tortle fishing village). Unstated composition means standard-D&D human-majority mix per `meta/worldbuilding.md`'s base-setting principle. Never require the field at `background` importance.

**Road promotion ladder** — a minor road earns representation in steps, never all at once:
1. **Narration only** — the default. A road the party merely travels is scene description, not an entity.
2. **`waypoints:` entry** — if the road feeds an existing route, add the settlement or junction to that route's `waypoints:` list. One line, no new file.
3. **Own route entity** (`subtype: trail` or `highway`, `importance: minor`) — only once the road carries play weight: revisited, contested, named in an open thread, or load-bearing for a mission. The existing wilderness-vs-route split still applies (playable stretch → `location-wilderness`; trade edge → `route`).

**When to create the entity at all:** a minor settlement or road becomes a file only when play touches it — the party stops there, an NPC lives there, a thread points at it. Never pre-generate minor settlements to fill space; the travel-leg step in `/session` proposes them as working labels first, and `/recap` canonizes only what the table actually visited.

**Provenance:** minor settlements and roads improvised at the table are DM-created canon, not player pool material. At `/recap` they skip `data/` and are written **directly to `historian/`** with `exists: true`, `source_session`, and `confirmed_date`. The free-entity pool rules do not apply to them.

## Trade Routes for Cities

Cities with `importance: critical` or `importance: major` should have at least one route entity that names them in `origin` or `destination`. A city with no route connections is a design gap — flag it and fill it when the city becomes relevant.

Cities with `importance: minor` or `importance: background` may defer. Do not create placeholder routes just to satisfy coverage; wait until narrative context makes the route meaningful.

The route's `origin`/`destination` fields create the graph edge — no `routes` field is needed on the city entity itself.

## City Registry Graduation

When creating a `location-city` entity that corresponds to a dot in `maps/world/city-registry.md`:

1. Look up the city's registry ID by its col/row position in `city-registry.md`
2. Add the ID to the entity's `aliases:` field (e.g. `aliases: [C05-04a]`) so any prior cross-references resolve
3. Remove the entry from `city-registry.md` — the city is now canonical
4. Follow the full graduation checklist in `maps/CLAUDE.md` (label on map, dot removed, tiles regenerated)

If no registry entry matches (city was newly placed, not a pre-existing dot), skip steps 1–3.
