Plan the next session.

**Arguments (optional):**

- `--depth narrated` — key scenes include read-aloud blockquote narration
- `--depth notes` — DM-facing bullet notes only
- `--scope inline` — full session in a single file
- `--scope linked` — session folder; encounter files live alongside the main file

If `--depth` or `--scope` are not provided, ask in Phase 4.

---

## Phase 1 — Orient

Do not generate any content yet.

**Step 1 — Run the dashboard script:**

```powershell
.\scripts\session-brief.ps1
```

It reports: next session number (with a milestone flag every 5th session — worth marking at the table), campaign/act/mission names and states, last session summary + cliffhanger + played date, Rest Clock state, Current State stamp staleness, the party roster with afflictions, and the design-preference drought counter (undeployed/seeded wishlist items). Do not manually re-read anything it already covers.

**Step 2 — Index staleness check.** Read `vector-index/.index-built` (line 1: ISO timestamp, line 2: commit SHA), then run `git log --oneline <sha>..HEAD -- data/ historian/ scheduler/`. If any commits appear, flag: *"Semantic index stale since `<sha[:7]>` — run `py -3.10 scripts\index-entities.py`."* If the file is missing, prompt to build. Never rebuild automatically — the searches in this command degrade silently on a stale index, so the DM should decide.

**Step 3 — Targeted manual reads** (only what the script doesn't cover):

1. Active mission file body (`state: active` in `scheduler/missions/`) — objective, hook, obstacles, last_updated session
2. Last session file — `new_entities` and recap detail (cliffhanger and summary already came from the script)
3. Active campaign file body (`state: active` in `scheduler/campaign/`) — tone, central conflict, themes
4. `data/lore/` — frontmatter scan only; open a lore body only when that domain is directly relevant to this session; treat `state: draft` sections as open questions, not settled canon
5. Table feedback — one grep, no file reads: `grep -A2 "table_notes:" historian/sessions/*.md | tail -20` (last 2–3 sessions' worth). What landed and what fell flat at recent sessions should bias scene design — more of what the table loved, less of what dragged. This is also the live check on the player-agency principle: if recent notes suggest choices aren't landing as consequential, weight the plan toward visible consequences of past party decisions.

**Step 4 — Meta reference files.** Each is read **once per run**, never re-read per sub-task. Tiered — do not read a conditional file unless its trigger applies:

Always:

- `meta/difficulty.md` — two-axis difficulty spectrum (attrition × lethality), Non-Combat Stakes, DC ranges. Note the frontmatter defaults here, but **do not resolve tiers yet** — the picks happen in Phase 4, after the story hook is chosen, so the difficulty answer can push back on the story (and vice versa). Exception: tiers given in the DM's prompt are settled immediately. The combat axes apply only if the session ends up planning combat — for a roleplay-only shape they sit inert and Non-Combat Stakes is the operative difficulty guidance.
- `meta/worldbuilding.md` — tone, themes, setting pillars, what to avoid
- `meta/mysteries.md` — load-bearing unknowns; do not accidentally answer these in session content

Conditional:

- `meta/rewards.md` — only if the session will include treasure, magic items, or a level-up
- `meta/players/*.md` (excluding `player-template.md`) — TRANSITION mode, roleplay-heavy shape, or the hook centers on a specific player's PC
- `meta/party-relationships.md` — only when planning scenes with PC-to-PC stakes
- `meta/campaign-design-preferences.md` — TRANSITION mode, or a CONTINUATION session that introduces a new antagonist, event, or mission element; note which items have `Deployed: —` (not yet used)
- `meta/worldbuilding-approach.md` — only when the session creates new world detail (new locations, factions, lore-adjacent content)
- `meta/literary-devices.md` — only when constructing hooks or scenes (Phase 3 onward); a palette of devices (reusable, `Last used:`) and twists (one-shot, `Deployed:`); both can carry pending `Seeded:` lines. Entries are scale-tagged (`scene`–`campaign`) — suggest at most one per session, never force, respect scale
- `meta/references.md` — only when an external D&D stat lookup is needed

**Step 5 — State the orientation aloud**, using the two-part recap format from root CLAUDE.md (narrative prose first, then TL;DR bullets):

- Party level and size (from PC frontmatter `level` fields — `party-status.ps1` or a quick frontmatter scan) — ask the DM to confirm or correct; the confirmed level feeds the RTD math in `meta/difficulty.md`. If any PC's `level_confirmed` is older than the last played session number (party-status flags this as LEVEL STALE), call it out explicitly — it means a `/recap` skipped the level question and a level-up may have been missed
- Rest Clock state (from the session brief): in-world time now, rounds and short rests since the last long rest, and whether a long rest is currently available. If the brief shows REST CLOCK STALE or NOT INITIALIZED, reconstruct it with the DM now — three questions ("what's the in-world date/time? when did they last long rest? roughly how many rounds since?"), write the answers back to the campaign file's `### Rest Clock` block with the current stamp, then continue
- Long-rest availability (`meta/difficulty.md` → Long Rest Rules): compute from the clock — a long rest is offerable only if ≥24 in-world hours have passed since the last one started, the party can reach a safe spot for 8 uninterrupted hours, and no PC is at 0 HP. State this plainly ("party long-rested ~14h ago — no fresh reset available this session without 10h more in-world") so it shapes pacing before any beats are written
- What the current act is (or "no act defined yet")
- What active mission(s) exist (or "no active mission")
- What the last session ended on (cliffhanger or final recap note)
- What the next session number will be

**Step 6 — Callback search** on the cliffhanger or active mission hook, to surface historian entities the story may be ready to revisit:

```powershell
.\scripts\semantic-search.ps1 -Query "<cliffhanger or mission hook text>" -Source historian -K 5
```

Note any results with score > 0.35 — these are callback candidates. Do not force them into the plan; use only if they fit naturally.

---

## Phase 2 — Mode Detection

**CONTINUATION mode** — use when: an active mission exists in `scheduler/missions/` AND the last session's cliffhanger is unresolved (story is mid-arc).

**TRANSITION mode** — use when: no active mission exists, OR the last session reached a natural conclusion (mission completed, major beat landed, party at a resting point between arcs).

If the mode is ambiguous, default to TRANSITION and say so — the DM can redirect.

---

## Phase 3A — CONTINUATION

The session advances the active mission. Proceed directly to Phase 4.

Keep the following in scope:

- Active mission: objective, hook, listed obstacles
- Last session cliffhanger
- Key NPCs and locations already established in the mission or recent sessions
- Any unresolved `new_entities` from the last session (things invented at the table that should be revisited)

---

## Phase 3B — TRANSITION (3 hooks)

When there is no active mission or the arc has reached a conclusion, surface options from three sources. Do not generate a full session plan yet — only brief hooks.

### Step 1 — Scan historian/ for unresolved threads

Run `/threads` for a full standalone view, or inline the same logic here:

Read frontmatter only (state, description) across `historian/characters/`, `historian/locations/`, and `historian/sessions/`. Look for:

- NPCs with `state: missing`, `state: imprisoned`, or `state: transformed`
- PC afflictions noted in historian PC files
- Stranded or abandoned entities called out in session recaps (e.g. Rose and Thorn)
- Cliffhangers from any recent session that were never resolved

### Step 2 — Find free entities

First identify the active campaign (`state: active` file in `scheduler/campaign/`). When surfacing entities, exclude historian entities tagged for a campaign other than the active one unless the DM explicitly requests a crossover. Untagged data entities are campaign-agnostic and always eligible.

Run semantic search using the themes of the current session direction (from cliffhanger, mission hook, or chosen thread):

```powershell
.\scripts\semantic-search.ps1 -Query "<themes from cliffhanger or direction>" -Exists false -K 8
```

Then surface importance-flagged entities the semantic search may not rank highly:

```powershell
.\scripts\free-entities.ps1
```

Filter its output to `importance: major` or `critical` with `active: true`. Combine both lists — semantic results for thematic fit, script output for importance-flagged entities. Do not manually sweep `data/` frontmatter; the script replaces that.

### Step 3 — Check meta preferences

Use `meta/worldbuilding.md` (already read in Phase 1). Player files in `meta/players/` carry identity and character links only — no preference sections — so group-level desires come from `meta/campaign-design-preferences.md`; fall back to the `themes` and `tone` in the active campaign file (already read in Phase 1) for anything not covered.

Also check `meta/campaign-design-preferences.md` (conditional-tier file — TRANSITION is its trigger): identify items with `Deployed: —` that haven't fired yet. If any are aging (many sessions have passed without use), flag the most relevant one as a candidate for Option C. Do not force a preference into a hook — only suggest it if the current story state creates a plausible opening.

Also check `meta/literary-devices.md`: if the story state creates a natural opening for one device or twist, name it as a light suggestion alongside the hooks (e.g. *"this hook would support a cold open"* or *"the patron thread is ripe for The patron's true face"*). At most one suggestion; skip silently when nothing fits. Twist suggestions must pass the file's safety check (no contradiction with historian canon, no accidental answer to a `meta/mysteries.md` unknown). Avoid devices whose `Last used:` points at the immediately previous session.

Respect the `Scale:` tags when picking:

- `scene`/`session`-scale entries are the default pool for session suggestions
- `mission`-scale entries fire only when this session creates or launches a mission — they shape the mission's structure, not one session's beats
- `arc`/`campaign`-scale entries fire only when the session sits at an act boundary or opens a new act; their cost is runway — committing means placing `Seeded:` breadcrumbs over multiple sessions before the payoff
- **Pending seeds outrank new suggestions:** before proposing anything new, check for `Seeded:` lines (devices and twists both) whose payoff this session could land or advance. Paying off a planted seed is almost always better than planting another.

### Step 4 — Present 3 hooks

Present exactly three options. Label their source so the DM knows where each came from. Keep each hook to 2–4 sentences — enough to understand the direction, not a full plan.

**Option B fallback:** if the free pool has no genuine fit for the active campaign (best semantic score below ~0.30 and no importance-flagged entity that matches tone), do not force a weak pool entity into Option B. Substitute a second historian thread or reference-catalog material and label it honestly (*from: historian/fallback — pool has no campaign fit*). Note the pool gap to the DM — it is meaningful signal.

Format:

> **Option A — [Short title]** *(from: historian/unresolved)*
> [Hook text]
>
> **Option B — [Short title]** *(from: data/free entity)*
> [Hook text]
>
> **Option C — [Short title]** *(from: campaign themes / meta preferences)*
> [Hook text]

Then ask: *"Which direction? You can also give me a different hook entirely."*

Wait for the DM's response before continuing.

---

## Phase 4 — Scoping + Elaboration (one message)

After the hook is chosen (or confirmed in CONTINUATION mode), do the **Elaboration Check first**, then ask all questions in a single batched message.

**Elaboration Check (before generating anything):** identify the session's likely key NPCs and locations from the hook, mission, and callback candidates. Check every key `./data` and `./historian` entity against the elaboration protocol in `data/CLAUDE.md`. Historian entities can be just as sparse as data entities — canonized does not mean ready for detailed play. **Do not fill gaps silently.** Sparse key entities are flagged at the **Immediate** tier and resolved via the batched questions below — before any scene is written, so elaboration answers can't invalidate finished scenes.

**Batched questions — one message, wait once:**

1. **Session length** — Short (~1.5 hr), Standard (~2 hr), or Long (~2.5 hr+)?
2. **Session shape** — Roleplay-only (no combat planned), roleplay-heavy, combat-heavy, exploration-heavy, or balanced?
3. **Difficulty** — attrition and lethality tiers for the adventuring day (`meta/difficulty.md`; moot if shape is roleplay-only). Don't ask cold: propose tiers that fit the chosen hook, note the frontmatter defaults, and **flag any discrepancy** between what the story implies and what the defaults say (a boss confrontation on soft lethality, a dungeon crawl on light attrition, a hook that ignores a nearly-spent Rest Clock). The DM's answer settles it — and may reshape the story beats, not just the encounter math. Skip the question entirely only if the DM's prompt already specified tiers.
4. **Depth** — (only if `--depth` not provided) `narrated` (read-aloud blockquotes for key moments) or `notes` (DM bullet notes only)?
5. **Scope** — (only if `--scope` not provided) `inline` (single file) or `linked` (folder with separate encounter files)?
6. **Elaboration decisions** — for each sparse key entity: draft the elaboration, or leave it to the DM?
7. At most **one** hook-specific question, only if something genuinely warrants it (e.g. "Is the party expected to find the villain's location this session, or is that still a mystery to preserve?").

Do not ask questions that the established context already answers. Do not split these into multiple messages.

Wait for the DM's response before continuing.

**Checkpoint 3b — draft approval (conditional).** If the DM delegates any elaboration drafting, the elaboration protocol (`data/CLAUDE.md`) requires drafts to come back for confirm/tweak/reject before any file is written. This is one additional wait — batch **all** delegated drafts (elaborations, new entities) into a single approval message. Do not send drafts one at a time.

---

## Phase 5 — Generate Session Plan

**Pre-step:** run the party dashboard for the Orientation paragraph and encounter balance:

```powershell
.\scripts\party-status.ps1
```

Using all context gathered, produce a session plan in chat.

**Frontmatter fields to populate:**

- **Session name** — propose a name (the DM can change it)
- **Key locations** — use `[[wiki-link]]` to entities in `historian/locations/` or `data/locations/` only; not factions (a ruling faction and the region it controls are two different entities — link the location)
- **Key NPCs** — note if free (`data/`) or canon (`historian/`)
- **Encounters** — for a roleplay-only shape, write `none planned` and stop; never invent encounters to satisfy a budget. Otherwise, list planned encounters sized to the resolved attrition tier (encounter count, round budget) and lethality tier (CR targets, tactics note per encounter); sanity-check with RTD math per `meta/difficulty.md`. The attrition budget belongs to the **adventuring day**, not the session: subtract the Rest Clock's rounds-since-long-rest from the tier budget and size to the remainder. If the remainder is near zero, the long rest is the content — plan it as a scene, or flag that pushing past budget bumps effective lethality a tier
- **Loose threads** — unresolved promises, player action items, or dangling beats from prior sessions
- **Opening scene** — where the party is, what's immediately in front of them
- **Closing hook** — the cliffhanger or question that sends players home wanting more

**Body structure — produce the following sections in order:**

### Orientation

- One-paragraph party state: current location, known afflictions, resources expended, mood/tone coming out of the last session (sourced from `party-status.ps1` and the last session recap)
- Bullet list: any unresolved `new_entities` from the last session that need acknowledgment

### Scenes

One `#### Scene N — [Title]` block per beat. Scale count to session length (Short: 3–4, Standard: 4–6, Long: 6–8).

**Travel legs:** if the plan moves the party overland or by water between known points, size the leg first — world map scale is 1 grid cell = 1000km; paces are foot 30km/day, horse 60, river barge 80 down / 30 up, ship 150 (per `scripts/region-scale.ps1`). A leg's duration advances the in-world clock — track days/hours elapsed across the session so the Rest Clock's `In-world time now` and the long-rest gate stay correct, and note where on the route the 24-hour window reopens (the party can long-rest at the first safe stop past that point — see `meta/difficulty.md` → Long Rest Rules). Then derive 1–3 stops from geography alone (river crossings, passes, day's-walk spacing — same map-first principle as `/region`), using working labels, not proper nouns, unless the DM names them. Only stops that serve the session (a scene, an encounter, a rest) become scene blocks; the rest is narration. **Never enumerate every settlement a realistic road would have** — at this scale that's one per travel day, and almost none deserve files. Stops live in the session plan as scheduler content (`exists: false`); `/recap` canonizes only the ones the party actually visits, per the Settlement & Road Tiers section of `meta/settlements.md`.

Each scene block contains:

- **Trigger** — what causes this scene to begin (party action, NPC move, time passing)
- **Location** — `[[wiki-link]]`; one-line description of what the space looks/feels like
- **NPCs present** — name, one-line goal for this scene, one-line voice note (how they talk/carry themselves)
- **Beats** — ordered bullet list of what happens; branch points noted inline (e.g., *"if party refuses → …"*)
- **Narration** — if `depth: narrated`, include a `> *"..."*` blockquote for the key moment of the scene; if `depth: notes`, omit
- **Transition** — one line on what triggers the move to the next scene or a likely detour

If `scope: linked`, replace the full encounter detail with a one-line reference: `→ see [[encounter-{slug}]]` and note that the encounter file will be written separately.

### NPC Quick-Reference

One entry per key NPC appearing this session. For canon NPCs, run `/voice <name>` first — **capped at the 2–3 NPCs carrying the most dialogue this session**. Skip `/voice` entirely for any NPC whose file was already read in full earlier in this run — derive the voice note from the in-context `personality`/`charm_hook` fields and body instead; a sub-command re-reading the same files adds nothing. Remaining canon NPCs get voice notes from their file's frontmatter and description only. Never invent fresh voice from scratch where history exists.

- **Name** — `[[wiki-link]]`
- **Motivation** — what they want right now
- **Knows** — bullet list of information they can reveal
- **Voice** — one sentence on speech pattern, demeanor, tells

### Contingencies

2–3 likely detours the party might take. For each: what triggers it, how to handle it without derailing the session, how to redirect.

### Closing

- How to land the closing hook (specific DM move or line)
- What to leave unresolved going into the next session

### Approaching Entities

Scan the active mission's `obstacles` field for entity references not already covered by the Phase 4 Elaboration Check. For each sparse entity named there that is **not** key this session but plausibly key within 1–2 sessions:

- Flag it as **Approaching** (light elaboration tier — see `data/CLAUDE.md`): *"[Name] appears in the mission's obstacles and is sparse. Consider a light sketch (personality + motivation) before they become immediate."*

These are lead-time flags, never blockers — the DM can defer or delegate at any point. Omit the section if nothing qualifies.

### Cameo Candidates

Detect filled questionnaires with a **single search, not per-file reads**. Two constraints discovered in audit: `questionnaires/` is gitignored, so ripgrep-based search tools silently return nothing — use POSIX grep via Bash; and questionnaire templates contain `>` option lists, so blockquote-text heuristics false-positive on blank templates. Use the explicit marker instead:

```bash
grep -l "^filled: true" questionnaires/*.md
```

(`filled:` lives in each questionnaire's `CLAUDE-INGEST` block — `false` at generation, flipped to `true` at return/ingestion. Files without the marker predate it: treat as unfilled unless the DM says otherwise.) Intersect the hits with cameo questionnaires (`entity_type: player` in the `CLAUDE-INGEST` block, or `-cameo` filenames).

For each filled cameo questionnaire, compare:

- `preferred_alignment` against the role and disposition of NPCs in this session
- `preferred_archetypes` against NPC archetypes and scene types

Surface up to 3 strong matches as a short block:

> **Cameo Candidates**
>
> - **{Name}** — fits [{NPC or role}] ({one-line reason based on their stated preferences})

Omit this block entirely if no questionnaires are filled. Do not force matches — only surface genuinely good fits. If nothing fits well, skip silently.

---

**Apply the free entity rule:** if the session requires an entity not in `data/` or `historian/`, **stop and flag it** rather than inventing one. Ask the DM whether to create it or proceed differently.

**Deployment tracking:** if a preference item from `meta/campaign-design-preferences.md` or a device/twist from `meta/literary-devices.md` is used in this session, note it in the session plan. After the session is played and canonized via `/recap`, update that item's `Deployed:` line (or a device's `Last used:` line) with a wikilink to the session file.

For non-standard encounter types (chase, puzzle, trade negotiation, performance, mini-game), check `meta/mechanics/` for an applicable mechanic file before writing the scene.

If meta preference files are blank, note: *"Group preferences and worldbuilding details are not yet filled in — session is based on campaign tone and themes only. Consider filling in meta/ files for more tailored generation."*

---

## Phase 6 — Offer to Write

After presenting the plan, ask:

> "Should I save this as a session file with `state: draft`?"

If yes:

1. Read `meta/schemas/session.md` to confirm the frontmatter template
2. Determine path based on scope (filename = exact display name, matching canon precedent — e.g. `Session 14 The Road Remembers.md`):
   - `scope: inline` → write `scheduler/sessions/Session {NN} {Name}.md`
   - `scope: linked` → create folder `scheduler/sessions/Session {NN} {Name}/`; write main file as `Session {NN} {Name}.md` inside it; write each encounter as `Encounter {Name}.md`
3. Populate all mandatory frontmatter fields from the plan above
4. Write the full body (Orientation, Scenes, NPC Quick-Reference, Contingencies, Closing) into the main file
5. Leave historian-only fields commented out (they are filled after play)

If no: leave the plan in chat for the DM to use or adapt manually.
