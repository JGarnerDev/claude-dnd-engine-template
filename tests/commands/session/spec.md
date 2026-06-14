# Spec: /session

Contract for what a correct, efficient `/session` run looks like. The command doc (`.claude/commands/session.md`) describes the flow; this spec defines the measurable budget and checkpoints an audit scores against. Where the two disagree, that is a finding for `gaps.md`, not a license to deviate mid-run.

## Trigger

`/session` with optional `--depth narrated|notes` and `--scope inline|linked`. Missing args are asked in Phase 4, never earlier.

## Required scripts (before any manual file reads)

1. `scripts/session-brief.ps1` — root CLAUDE.md mandates it at start of every `/session`. Covers campaign, active act/mission, last-session cliffhanger. Manual reads duplicating its output are rubric-1 failures.
2. Index staleness check — read `vector-index/.index-built`, run the `git log` comparison, flag if stale. Prompt only; never rebuild.
3. `scripts/party-status.ps1` — Phase 5 pre-step; feeds the Orientation party-state paragraph and encounter balance without opening PC files.
4. `scripts/semantic-search.ps1` — Phase 1 callback search (cliffhanger/hook query, `-Source historian -K 5`); again in Phase 3B Step 2 if TRANSITION (`-Exists false -K 8`).
5. `scripts/free-entities.ps1` — TRANSITION Step 2 importance-flagged scan, instead of a manual frontmatter sweep of all of `data/`.

## Read budget

- **Frontmatter-only allowed:** `data/lore/*` (Phase 1 scan), `data/*` and `historian/*` thread/entity scans in Phase 3B, `questionnaires/*` fill-check in Cameo Candidates.
- **Full-body allowed:**
  - `meta/` reference files per the Phase 1 tier rules — always-tier (difficulty, worldbuilding, mysteries) every run; conditional-tier only when its stated trigger applies; once each per run, never re-read in later phases
  - Active mission + active act files (small, load-bearing)
  - Last session file (cliffhanger/recap/new_entities)
  - `meta/schemas/session.md` — only if Phase 6 write is confirmed
  - Specific lore file bodies — only when a lore domain is directly relevant to the chosen hook, stated in the trace
  - Entities that are key NPCs/locations in the final plan (1 hop max from them)
- **Hard cap:** ~25 file reads for a CONTINUATION run, ~35 for TRANSITION, excluding script calls. Past the cap, declare scope to the DM before continuing.
- **Scope declaration:** per-phase declarations satisfy this spec — state what the next phase will read and why as you enter it. A single upfront whole-run declaration is NOT required (amended 2026-06-10: all three audit runs scored "partial" against the upfront reading; the per-phase pattern bounded context fine in practice and matches the doc's phase structure). Silent bulk reads remain a failure.

## Interaction checkpoints (exhaustive)

1. **Phase 1 orientation statement** — act, mission, cliffhanger, next session number. Recap follows the two-part recap format (narrative prose + TL;DR bullets). Informational; no question unless mode is ambiguous.
2. **Phase 3B hook choice** — TRANSITION only. Exactly 3 labeled options, 2–4 sentences each. Wait.
3. **Phase 4 scoping + elaboration** — one batched message: length, shape, depth/scope if not given as args, elaboration decisions for sparse key entities, at most one hook-specific extra question. Wait once. Splitting into multiple messages is a finding.
   - **3b (conditional):** if the DM delegates drafting, one additional draft-approval message is required by the elaboration protocol — all delegated drafts batched into that single message. More than one draft round trip is a finding.
4. **Free entity rule stops** — required entity missing from `data/` and `historian/`: stop and flag.
5. **Phase 6 write offer** — "save as `state: draft`?"

Any question outside these five is a rubric-7 finding.

## Output contract

- Session plan in chat: frontmatter fields (name, key locations as `[[wiki-links]]`, key NPCs with free/canon tag, encounters, loose threads, opening scene, closing hook) plus body sections in order: Orientation, Scenes (count scaled to length), NPC Quick-Reference (`/voice` capped at 2–3 top speakers), Contingencies, Closing, Approaching Entities (omit if empty), Cameo Candidates (omit if no filled questionnaires; detection via single grep, not per-file reads). Elaboration is resolved at the Phase 4 checkpoint, before scenes are written — it is not an output section.
- If write confirmed: file(s) under `scheduler/sessions/` per scope, `state: draft`, `exists: false`, historian-only fields commented out.
- If meta files blank: the canned "preferences not yet filled" note, once.
- If a `campaign-design-preferences.md` item is deployed: noted in the plan.

## Out of scope

- No writes outside `scheduler/sessions/` (no historian edits, no `Deployed:` updates — those happen at `/recap`)
- No entity creation — free entity rule flags instead
- No semantic index rebuild
- No entities tagged for a campaign other than the active one in its sessions without explicit DM request, and vice versa
- No answering `meta/mysteries.md` unknowns in session content
- No re-reading any `meta/` file after Phase 1
