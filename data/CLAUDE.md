# Data

## Free Entity Rule

Entities in `./data` with `exists: false` are **free** — available to be used in session content. Entities that get played and canonized move to `./historian` with `exists: true`.

**Carve-out — reference catalogs are not the free pool.** Core D&D / published material (monsters, spells, deities, official items, feats, races, classes, backgrounds, skills) carries `exists: true` even while living in `./data`, because those things are real in the world and are a *reusable reference library*, not one-time creative drafts. They are not "free entities," do not get consumed or moved to historian on use, and do not count toward contribution balance. The Free Entity Rule below applies only to homebrew creative-pool entities (`exists: false`). Encounter/lookup tooling (e.g. `monster-lookup.ps1`) reads the catalog directly and ignores `exists`.

**When generating or planning content that requires an entity:**
1. First search `./data` for a free entity (`exists: false`) of the needed type.
2. If one exists, use it — do not invent a new one.
3. If none exists, **stop and ask the user** before creating anything. Present the gap clearly: what type is needed, why, and ask whether they want to create one or proceed differently.

Never silently generate a net-new entity during session planning or content generation. The data pool is intentional — running it low is meaningful signal, not a problem to paper over.

## Data Entity Transparency

When suggesting a `./data` entity for use, always surface its gaps inline:

- **Inferred detail** — anything you're filling in beyond what the file explicitly states. Flag it: *"[inferred: motivation assumed to be X]"*
- **Missing detail** — fields relevant to the planned use that are absent from the file. List them: *"[missing: combat stats, known location]"*

Do this per entity, at the point of suggestion — not as a separate section. Keep it brief; one line per gap is enough. The DM decides whether to fill gaps before play or leave them loose.

## Entity Elaboration

When a sparse `./data` or `./historian` entity is selected as a **key story element** — key NPC, central location, or primary faction in a session — check for sparseness before proceeding. Canonized historian entities can be just as underwritten as data entities; being in historian does not mean they are ready for detailed play.

**Sparse** means any of: `description` under ~15 words, no `personality` field, no `motivation` field, or body text that is a single sentence or absent.

**Proximity tiers — calibrate depth to how close the party is:**

- **Approaching** — entity appears in an active mission's `obstacles` or is likely to be key within 1–2 sessions, but is not key *this* session. Light elaboration: personality hook + motivation only. One-line flag; one-line draft if delegated.
- **Immediate** — entity is a key NPC, central location, or primary faction *this* session. Full elaboration: motivation, personality hook, one secret, one complication.

**Protocol:**

1. Flag it to the DM with the tier: *"[Name] is underwritten — [Approaching / Immediate]. Missing [fields]. I can draft [a light sketch / full elaboration], or you can write it yourself. Your call."*
2. **Wait for the DM's response.** Do not propose content until asked to.
3. If the DM delegates: before drafting, run two uniqueness checks:
   - **Trait registry** — read `meta/trait-registry.md`, scan the matching entity-type section for occupied trait slots. If overlap found: *"[trait] already occupied by [[Name]] — pushing a different direction."*
   - **Semantic search** — run `.\scripts\semantic-search.ps1 -Query "<proposed elaboration direction>" -Source historian -K 5`. Flag any result with score > 0.4 as a thematic collision; adjust the draft to avoid it.
   - **Batch check** — when several drafts are produced in the same pass, check them against *each other* before presenting: registry and search only see pre-existing content, so same-batch siblings can silently share a motif (e.g. two ledger-keepers drafted minutes apart). Same rule as hierarchical children: batch-mates should be as distinct as unrelated entities.

   Then draft the elaboration as a clearly labeled proposal block, scoped to the tier. Wait for confirm, tweak, or reject before touching the file.
4. If the DM writes it: wait; do not fill in parallel.
5. On approval: write the elaboration back to the entity file immediately. Then add a one-line entry to `meta/trait-registry.md` under the matching entity-type section — 10 words max, format: `- [[Name]] — [core trait]`. Do this before moving on.

**Skip the prompt if:** entity is background texture only (not a speaking role, not a central location), or the DM has indicated they want it loose.

## Hierarchical Entities

Large entities — factions, regions, cities, events, deities — can spawn child entities from their established detail. Offer this when an entity of this scale is elaborated, or when reviewing a richly-described entity that has no children yet.

**Spawn offer:** *"[Name] is a [type] with enough detail to seed children. Want to generate [members / sub-locations / etc.] from it?"*

Wait for the DM to confirm and specify what kind of child before reading `meta/entity-creation.md` and proceeding.

**Common parent → child paths (illustrative, not exhaustive):**

- `faction` → NPCs (members, leaders, informants), locations (headquarters, safehouses), resources (faction goods or contraband)
- `location-region` → cities, wilderness areas, terrain features, routes, cultures
- `location-city` → shops, NPCs (notable residents, officials), factions (local guilds, cults), dungeons (undercity, ruins beneath)
- `event` → NPCs (survivors, perpetrators, witnesses), locations (the site, what it became), factions (groups formed in its wake)
- `deity` → NPCs (priests, champions, fallen faithful), factions (temples, cults, heretical sects), items (relics, cursed offerings)

Any entity type can spawn children if the narrative warrants it. The paths above are starting points — follow the story's logic over the list.

**Child creation rules:**

- Child inherits parent's campaign tag and a `relates_to` link back to the parent
- Child goes through the full entity creation protocol (`meta/entity-creation.md`) — no shortcuts
- Child's detail must not contradict the parent's established canon; use the parent file as a creative constraint
- Multiple children from the same parent should be checked against each other and `meta/trait-registry.md` — siblings should be as distinct as unrelated entities

## Contribution Balance

Every entity has an optional `contributed_by` field (values: `paul`, `ben`, `miguel`, `jeff`). Use this to keep player contributions roughly equal over time.

**When choosing between comparable free entities of the same type**, prefer the one whose `contributed_by` player has the fewest entries in `./historian`. If contributions are unequal, note it briefly: *"Pulling from Paul's pool — Ben and Miguel are underrepresented."*

**When planning a session**, if one player's entities dominate the candidate pool, flag it and suggest pulling from another player's material where the story permits.

**To check current balance** at any time: run `.\scripts\contribution-balance.ps1` — shows pool vs. canonized counts per player and identifies who is next up. To see one player's available entities: `.\scripts\free-entities.ps1 -Player <name>`.

Do not force balance at the expense of narrative fit. Flag the gap; let the DM decide.
