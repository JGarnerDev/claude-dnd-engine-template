Detail a region of the world map — from geographic markers to draft document to player questionnaires.

---

## Core Principle — Geography First

**The map is the authority.** Every suggestion in this command — resources, diplomatic tensions, city roles, questionnaire questions — must be derivable from what is physically visible on the map. Terrain, water, elevation, and position on the world map are the primary drivers.

Do not reach for generic D&D tropes, invented politics, or flavor that isn't grounded in the map's geology. If a city sits on a river fork, *that fact* explains its wealth and its enemies — not a lore decision. If a city is backed against a cliff, the cliff explains its defense posture and its isolation — not a backstory.

Player-contributed entities from `./data` are a secondary layer — they attach where geography supports them, never the other way around.

**The map shows major features, not all details.** Settlements, terrain type, and major rivers are marked. Roads, minor waterways, small settlements, and wilderness detail are usually absent — not because they don't exist, but because the map doesn't show them at this scale. Propose them freely where geography makes them obvious: a road along a navigable river, a hamlet between two ports, a mountain track where a pass is marked. Map silence is not world absence. Flag anything that requires a decision beyond what terrain implies.

When in doubt: look at the map again.

---

**Arguments:**

- `--region <name>` — region name used for file naming (kebab-case); prompted if missing
- `--draft <file>` — skip Phases 1–3; run `.\scripts\region-brief.ps1 -Region <file>` to restore context, then resume at Phase 4 or later
- `--city <n>` — jump directly to Phase 7 for a single numbered city questionnaire

---

## Phase 1 — Map Orientation

Check `maps/world/` for the world map image before asking the DM to share one — it may already be on disk (`world-sky.jpg` is the primary reference). Check `maps/regions/{region-slug}/` for an existing region map.

**If no region map is on disk, attempt an automatic crop before asking the DM:**

```powershell
.\scripts\map-crop.ps1 -Feature "<region-name>" -Markers
```

- If the feature is in the index, this saves a permanent crop to `maps/locations/<slug>-map.png` (base) and `maps/locations/<slug>-markers.png` (city markers). Use both as the region reference.
- If the feature is not in the index, fall back to a relevant world tile (see `maps/world/index.md`). Also read the corresponding `tiles/markers-{name}.png` for dot coverage. If the tile lacks sufficient detail, run a temp crop by col/row bounds:

  ```powershell
  .\scripts\map-crop.ps1 -ColMin <n> -ColMax <n> -RowMin <n> -RowMax <n> -Markers -Temp
  ```

  Then read `maps/world/temp-crop.png` and `maps/world/temp-markers.png`, then delete both.
- Only ask the DM to share an image if all automated options fail to produce a readable crop.

**After obtaining the base crop, read the markers crop.** Count visible red dots — each is an unnamed, undetailed city. Note the count; it informs Phase 2 scope.

If only one image is available (world map but no region crop, or vice versa), proceed with what's on disk — note the gap and work from the world tile for geography analysis.

Once map references are resolved:

**Step 1a — Locate on world map.**
Identify where the region sits. Ask the DM to point it out (grid column/row, or a landmark) if not obvious. Note position relative to mountain ranges, ocean coasts, and major landmasses.

**Step 1b — Run world context script.**

```powershell
.\scripts\region-world-context.ps1 -Col <n> -Row <n>
```

This outputs climate band, wind/moisture rules, coast type expectations, a water body checklist, and any known world entities near that position.

**Step 1c — Resolve the water body checklist.**
Before proceeding, confirm all four items from the script output:

- Is the main water body landlocked or ocean-connected?
- If ocean-connected — which direction is the sea passage from this region?
- What major rivers feed into or drain from the region?
- Does any water body connect this region to another?

If the answer requires a reference image, ask: *"Can you share a zoomed-out image or indicate on the world map where the water connects?"*

**Step 1d — State your reading.**
*"This region sits [position]. Climate is [band]. The water body is [type — landlocked/inland sea/bay/river delta]. It connects to [ocean/nothing] via [direction]. Based on world rules, I expect [terrain consequences]."* Ask the DM to confirm or correct before proceeding.

---

## Phase 2 — Scope Definition

Ask the DM: **"What needs defining in this region?"**

They may want: city locations, trade routes, wilderness areas, political borders, all of the above, or something else.

**If the markers crop revealed red dots**, get an exact count:

```powershell
.\scripts\count-markers.ps1 -ColMin <n> -ColMax <n> -RowMin <n> -RowMax <n>
```

Then look up each dot's position in `maps/world/city-registry.md` by matching approximate col/row — surface the registry IDs alongside the count. These IDs are the stable references players use to claim and cross-reference cities before any names exist.

Surface it: *"The city-markers layer shows N undetailed cities in this region with registry IDs [list]. Do you want to work all of them, or focus on a subset? I can assign IDs to players now so they can cross-reference each other's cities."* Dots from the markers layer serve as the base location set — the DM only needs to add numbered markers to the map image if they want locations that are **not** already marked.

If no markers layer is available and the region map has no clear markers, suggest: *"Add red numbered markers to the map image for each [city/location/point of interest] you want detailed — that gives us a shared reference for everything that follows."*

Once scope and markers are confirmed, **establish scale:**

- Estimate how many world-map grid squares the region covers by comparing the region image to the world map grid. A rough fraction (0.25, 0.5, 1.0) is enough.
- Run: `.\scripts\region-scale.ps1 -SpanGrids <n> -WaterBody <sea|river|both|none> -Locations <marker count>`
- State the result: *"This region is roughly [X]km across. Nearest-neighbor cities are approximately [Y] days apart on foot / [Z] days by ship."* This informs questionnaire questions and diplomatic feasibility.

Do not proceed until the DM has confirmed scope, markers, and scale.

If `--region` name was not provided, ask now.

---

## Phase 3 — Geography Analysis

Analyze the region map. For each numbered marker, identify:

- **Working label** — a 2–3 word descriptive label that travels with the marker through the draft (e.g. "River Crossing (1)", "Mountain Post (2)", "Delta Port (5)"). Not a proper noun — just enough to navigate without referring to the map every time.
- Terrain at and around the site (river, coast, cliff, forest, plains, mountain base, sea shore, etc.)
- Primary geographic role (river crossing, river fork, estuary, coastal cliff, interior forest, open ground, mountain pass, sea port, etc.)
- Nearest neighbors by proximity

Apply the world geography rules from Phase 1.

After analysis, state the working labels and marker count with a brief summary of each, then ask the DM to confirm before proceeding.

---

## Phase 4 — Draft Document

Before writing, run:

- `.\scripts\free-entities.ps1 -Type resource` — note player-contributed resources; attach to cities whose terrain plausibly produces them
- `.\scripts\free-entities.ps1 -Type faction` — note player-contributed factions; attach to cities whose role or terrain fits their interest
- `.\scripts\free-entities.ps1 -Type location` — note player-contributed regions or wilderness areas that overlap geographically

Reference these inline when suggesting resources and diplomatic context. Use `[[EntityName]]` wikilink syntax. Label player-contributed entities: *([player]'s resource)*. Do not force a fit.

Write `data/locations/regions/{region}.md`.

**Draft structure:**

1. **Header block** — region name (or TBD), world map position, dominant climate/terrain, water body type and connection, approximate scale (km across)

2. **Locations grouped by zone** — group markers into natural geographic clusters. For each location:
   - **Geographic description** — 2–3 sentences: terrain, water access, strategic position
   - **Role** — inferred geopolitical role (port, toll city, fortress, logging hub, frontier post, etc.)
   - **Suggested resources** — 3–5 likely exports or local goods derived from terrain and role. Attach player-contributed entities where terrain fits; label as suggested.
   - **Transportation** — primary mode(s) available at this location (sea ship, river barge, road, mountain track, overland only) and approximate travel time to nearest neighbor based on Phase 2 scale output.
   - **Racial composition** — suggested mix with one-line rationale. Draw from existing race entities in `./data/races/` and any relevant faction or cultural entities. Range from homogenous to cosmopolitan depending on the location's role (e.g. a remote mountain post = likely homogenous; a major sea port = cosmopolitan). Label as suggested.
   - **Military** — one-line relative strength note (e.g. "Moderate — river toll revenue funds a standing garrison; no walls"; "Weak — no standing force; relies on terrain and isolation"). Derive from terrain, role, and resources — not invented lore.
   - **Diplomatic relations** — for each neighbor, a one-line stance derived from geographic logic alone. Chokepoints, dependencies, and shared water are the drivers. Do not invent political history. Label as inferred.
   - **Off-map note** *(edge markers only)* — if the location sits at or near the region map's edge, name the off-map connection explicitly: what does this location face toward, and what does that imply? Name the gap; do not fill it. E.g. *"Faces east toward unknown hinterland — what's there shapes this city's entire landward identity."*

3. **Regional tensions** — 3–5 structural conflicts implied by geography (chokepoint control, rival ports, interior independence, frontier autonomy). Include off-map forces where relevant — an external power controlling a sea passage, a neighboring region visible on the world map, a mountain range whose far side is unknown. Name the external pressure; do not invent its content.

4. **Trade Routes & Transportation** — 3–5 primary trade corridors in the region: what moves, by what mode, between which locations, and what controls or threatens each corridor. Derive from terrain and location roles.

5. **Military Overview** — brief relative ranking of all locations by defensive/offensive capacity. One line per location. Derive entirely from terrain and resource access.

6. **Open questions** — things geography can't answer that questionnaires will resolve (region name, political structure, non-human presence, Whatwill activity, etc.)

Do not invent proper nouns (city names, faction names, NPC names). Use working labels and numbered markers only. Naming belongs to the DM and players.

Report the file path when done, then pause for DM review.

---

## Phase 5 — DM Review Gate

Prompt:

> Review `data/locations/regions/{region}.md`. Use this checklist:
>
> - Terrain reads correct for each location?
> - Zone groupings make sense?
> - Water body type and connection confirmed?
> - Transportation modes accurate?
> - Racial composition suggestions reasonable?
> - Any location role changes needed?
>
> When ready, say "proceed" or give me corrections first.

Apply all corrections before moving on. Do not proceed to Phase 6 until the DM confirms the draft.

---

## Phase 6 — Entity Anchoring

Run:

```powershell
.\scripts\free-entities.ps1 -Type character
.\scripts\free-entities.ps1 -Type faction
.\scripts\free-entities.ps1 -Type event
.\scripts\contribution-balance.ps1
```

**Scope:** Phase 6 covers NPCs, factions, and events only. Do NOT re-anchor resources — those were handled in Phase 4. If a resource was already attached in Phase 4, carry it forward; do not list it again as a candidate entity.

For each location in the draft, run semantic search on the location's geographic role and terrain description to surface non-obvious pool fits:

```powershell
.\scripts\semantic-search.ps1 -Query "<location role and terrain description>" -K 6
```

Treat results with score > 0.35 as additional anchoring candidates. Then also scan the free-entities output directly for:

- NPCs whose background fits the location's role or terrain
- Factions headquartered there or with obvious strategic interest
- Events that could be seeded at this location

Combine both sources — semantic results for thematic fit, free-entities output for explicit type filtering.

Prioritize player-contributed entities. Flag if one player's material dominates the anchoring candidates — include the contribution balance output. Flag if any player has no pool at all and note that their entities can't be balanced here.

Attach suggestions inline in the draft as a new section per location:

```markdown
**Candidate entities:**
- [[EntityName]] (type, player) — one-line fit rationale. [missing: gaps relevant to this use]
```

If no entities fit a location, note: *"Unanchored — no free NPCs, factions, or events fit this location."*

**Anchoring Summary** at the end of the draft — list each location with:

- Location number and working label
- Anchored entities (name, type, player) with one-line fit description
- Or: "Unanchored"

Report anchored count, unanchored count, and contribution balance. Pause for DM review before Phase 7.

---

## Phase 7 — Questionnaire Generation

Generate one questionnaire per location. Each questionnaire is written specifically for that location's geopolitical identity — not a generic city form.

For each location:

1. Read the location's draft entry, transportation/scale context, racial composition, and any anchored entities
2. Identify 3–4 questions that only *this* location's geography and role can answer (e.g. for a toll-city on a river fork: "Who decides which ships get waved through?"; for an isolated cliff fortress: "What does this city produce that makes siege worth it?"; for a sea port with cosmopolitan composition: "Which quarter do newcomers end up in, and why?")
3. Add 1–2 questions about racial composition and cultural flavor
4. Add 2–3 universal questions (name, founding story, what visitors notice first)
5. End with: *What makes this a place something could go wrong?*

Format: plain markdown, no YAML, no schema jargon. Suitable to paste into Discord.

**Include the registry ID at the top of each questionnaire** — look it up in `maps/world/city-registry.md` by the city's col/row position. Add it as a one-liner before the first question:

```text
**Registry ID:** C##-##x — this is your city's stable reference until it has a name.
```

Players use this ID to cross-reference each other's cities before either has a name. When ingested, the ID travels into the entity's `aliases:` field.

Write to `questionnaires/{region}-city-{n}.md`. Report all paths when done.

After reporting paths, add one closing line: when a player returns a filled questionnaire, the DM just pastes it (or drops the file back) — the `CLAUDE-INGEST` block triggers ingestion automatically, no command needed.

If `--city <n>` was provided, generate only that location's questionnaire.
