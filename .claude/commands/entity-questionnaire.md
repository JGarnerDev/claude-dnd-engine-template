Generate a player-facing questionnaire for designing any world entity. Output is a clean shareable markdown document — no YAML, no schema jargon. Suitable to paste into Discord, email, or a shared doc.

Also handles **ingestion**: when a filled questionnaire is returned (by file, paste, or conversational message), run balance review before creating any entity. If a message or file contains a `<!-- CLAUDE-INGEST -->` block, treat it as a pending ingestion automatically — no explicit flag needed.

**Arguments:**
- `--type <type>` — entity type to create: `resource`, `npc`, `faction`, `location`, `deity`, `monster`, `magic-item`, `event`, `culture`, `race`, or any type listed in `meta/entity-creation.md` *(required unless `--ingest` is used)*
- `--name <text>` — working or placeholder name
- `--concept <text>` — one-sentence description of what it is
- `--player <name>` — player filling it out (personalizes header)
- `--registry-id <id>` — city registry ID (e.g. `C05-04a`) from `maps/world/city-registry.md`; used when the entity is a pre-existing dot on the city-markers layer
- `--output` — write to `scratch/{name}-questionnaire.md` in addition to displaying
- `--ingest <file or "paste">` — ingestion mode: take a filled questionnaire and run balance review before creating the entity

---

## Generation Mode

### Phase 1 — Gather Parameters

If required parameters are missing, ask only what's needed:
1. **What type of entity?** (if `--type` missing)
2. **What is it?** One sentence. (if `--concept` missing)
3. **Who's filling it out?** (optional)

If `--name` is not provided, leave naming to the player — the questionnaire's first Identity question should ask for it.

Do not ask about optional parameters that have sensible defaults.

---

### Phase 2 — Load Schema & Check Overlaps

Read `meta/entity-creation.md` to find the correct schema file for `--type`. Then read `meta/schemas/{schema}.md` — specifically the **Player Form** and **Form → Frontmatter Mapping** sections.

Run `.\scripts\free-entities.ps1 -Type <type>` to get existing free entities of this type. Scan for any that share the same origin, function, or key trait as the concept.

Also run semantic search on the concept to catch cross-type duplicates — entities that serve the same narrative role under a different type:

```powershell
.\scripts\semantic-search.ps1 -Query "<concept text>" -K 5
```

Flag any result with score > 0.40 as a potential overlap regardless of type. Surface all overlaps silently — only in the DM note (Phase 4).

---

### Phase 3 — Build Questionnaire

Use the **Player Form** from the schema as the base. Translate all fields into plain, jargon-free English. Then add 2–4 concept-specific bonus questions tailored to `--concept` that the base form doesn't cover.

Group questions loosely:
- **Identity** — what it is, what it looks like, what it does
- **Origin** — where it comes from, how it enters the world
- **Economy / Power** — who controls it, what it's worth, who wants it (skip if not applicable to type)
- **Story** — the hook, the complication, the secret

Always end with a hook question: *What makes this a story element, not just background detail?*

**Required vs optional labeling (mandatory):**

For each question, check whether it maps to a mandatory or optional field in the schema's frontmatter template. Then label and explain it in the questionnaire:

- **Required questions** — label with `*(Required)*` and add one short sentence explaining *why* this answer is needed. Keep it friendly, not bureaucratic. Example: *"This one's needed so we know where to place it on the map and who might be competing for it."*
- **Optional questions** — label with `*(Optional)*` and add one short sentence explaining what answering it *unlocks*. Example: *"No pressure — but if you have thoughts here, it helps us build faction drama around it."*
- **Concept-specific bonus questions** — label with `*(Your call)*` since these go beyond the schema. Frame them as creative invitations, not requirements.

Write labels and explanations in a tone that feels like a collaborative creative partner, not a form. The player should feel like their input matters and that blanks are genuinely fine.

---

### Phase 4 — Format & Output

```
<!-- CLAUDE-INGEST
type: entity-questionnaire
entity_type: {type}
action: Filled questionnaire — run ingestion mode. Do not create any entity without balance review first.
concept: {concept}
player: {player name if provided}
registry_id: {registry ID if --registry-id provided, otherwise omit this line}
filled: false
-->

# {Name if provided, otherwise "Your {type}" } — World Design Notes
*For {Player} — fill out what you know, leave blanks for anything undecided.*

{If --registry-id was provided: **Registry ID:** {id} — stable reference for this city until it has a name. Use this when cross-referencing other players' cities.}

---

{questions grouped by section}

---

*Hand back to your DM when done. No right answers — the goal is enough detail to make this real.*
```

Always write the questionnaire to `questionnaires/`. Name the file using kebab-case (lowercase, spaces → hyphens): `{player-kebab}-{name-kebab}.md` if both are known, `{player-kebab}-{type}.md` if no name, or `{name-kebab}.md` if no player. Report the path when done. The `--output` flag is now a no-op (output is always written).

**Player type rules (cameo and patron — merged questionnaire):**
- Filename suffix: `cameo` when invoked as cameo, `patron` when invoked as patron, `player` if role unspecified — e.g. `jonah-carson-cameo.md`
- INGEST block: use `entity_type: player`; role is determined from the filled "How do you want to participate?" answer
- INGEST action: `Filled questionnaire — run ingestion. Write to meta/players/{Full Name}.md.`
- Title: `# {Full Name} — Player Registration`
- Tagline: `*For {First Name} — fill out what applies to you, leave the rest blank.*`
- Always generate the merged template from the schema (both "If Cameo" and "If Patron" sections present); the player self-selects their path

**Answer areas (all questionnaire types):**
After every question, add a blank blockquote line for the player to fill in:
```
**Question text** *(label)*:

> 
```
For the archetype list, add a `*My picks:*` label followed by a blank blockquote line after the list block.

If an overlap was found in Phase 2, append after the player-facing content:

```
---
## ⚠ Note for DM

Possible overlap with existing entity: **{Name}** — {description}. Confirm with {player} whether this is distinct, a variant, or the same thing before creating a new entity.
```

---

## Ingestion Mode

Triggered by `--ingest <file>`, `--ingest paste`, or automatically whenever a message or file contains a `<!-- CLAUDE-INGEST type: entity-questionnaire -->` block.

### Ingest Phase 1 — Read Answers

Parse the filled questionnaire. Extract what was answered and note blanks. Read `entity_type` from the CLAUDE-INGEST block to know which schema applies.

If the file lives in `questionnaires/` and has real answers, set `filled: true` in its `CLAUDE-INGEST` block now (add the line if the file predates the marker). `/session` cameo detection and other scans rely on this marker — template `> ` blockquote heuristics false-positive, and `questionnaires/` is gitignored so ripgrep-based tools can't see it (use POSIX grep via Bash).

---

### Ingest Phase 2 — Balance Review

Read `meta/worldbuilding.md` (once). Run `.\scripts\free-entities.ps1 -Type <entity_type>` for current pool. Also run semantic search on the entity name and concept to detect cross-type thematic conflicts:

```powershell
.\scripts\semantic-search.ps1 -Query "<entity name> <concept summary>" -K 5
```

Results with score > 0.40 of a different type are potential hidden duplicates — assess under the **Overlap** dimension below.

Silently assess — use findings only to inform DM questions:

- **Pool saturation:** Does adding this crowd out existing entities of the same type or rarity?
- **Faction/power balance:** Does who controls or embodies this shift world leverage in unintended ways?
- **Flavor dominance:** Does this push one theme (a faction, an origin type, a region) too loud?
- **Tech/faith axis:** Does this interact with the tech/faith tension? Intentional or accidental?
- **Lore consistency:** Does anything conflict with `meta/worldbuilding.md` or historian facts?
- **Hook weight:** Is the story hook appropriately sized, or does it threaten to dominate sessions?
- **Overlap:** Is this distinct enough from existing entities to warrant a new file?

---

### Ingest Phase 3 — DM Questions

```
## Entity Ingestion Review: {Name} ({type})

**What the player gave us:**
{2–3 sentence summary}

**Gaps (blank or vague answers needed for schema):**
{list, or "none"}

**Balance flags:**
{one line per actual concern — omit clean categories}

---

**Before I create this entity, confirm:**
{2–5 targeted questions based on real flags — not boilerplate}
```

If no flags: "No balance concerns. Create the entity as described?"

---

### Ingest Phase 4 — Create Entity

Only after DM confirms. Before writing, run `/check <entity name and concept>` to catch any historian facts that would conflict with the new entity. Surface CONFLICT results to the DM before proceeding.

Read `meta/entity-creation.md`, then the correct schema. Map answers using the Form → Frontmatter Mapping table. Use `unknown` for mandatory blanks — never omit.

Write to the canonical path defined in the schema. Confirm path when done.
