Plan the next session.

---

## Phase 1 — Orient

Read the following files before doing anything else. Do not generate any content yet.

1. `scheduler/campaign.md` — tone, central conflict, current act
2. `scheduler/acts/` — any file with `state: active`; note its goal and current mission list
3. `scheduler/missions/` — any file with `state: active`; note objective, hook, obstacles, and last_updated session
4. `historian/sessions/` — find the highest-numbered session file; read its `cliffhanger`, `recap`, and any `new_entities`
5. Meta reference files (read once; do not re-read per sub-task):
   - `meta/worldbuilding-approach.md` — how to reason about worldbuilding: coherence, causality, consequences
   - `meta/worldbuilding.md` — tone, themes, setting pillars, what to avoid
   - `meta/difficulty.md` — encounter tiers, DC ranges, session mix
   - `meta/rewards.md` — gold ranges, magic item philosophy, leveling pace
   - `meta/players/*.md` (excluding `player-template.md`) — per-player preferences
   - `meta/references.md` — where to look for external D&D data

Determine the next session number: highest session number found + 1.

After reading, state aloud:
- What the current act is (or "no act defined yet")
- What active mission(s) exist (or "no active mission")
- What the last session ended on (cliffhanger or final recap note)
- What the next session number will be

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

**Step 1 — Scan historian/ for unresolved threads**

Read frontmatter only (state, description) across `historian/characters/`, `historian/locations/`, and `historian/sessions/`. Look for:
- NPCs with `state: missing`, `state: imprisoned`, or `state: transformed`
- PC afflictions noted in historian PC files
- Stranded or abandoned entities called out in session recaps (e.g. Rose and Thorn)
- Cliffhangers from any recent session that were never resolved

**Step 2 — Scan data/ for notable free entities**

Read frontmatter only (`name`, `type`, `subtype`, `importance`, `active`, `description`) across all of `data/`. Filter to `exists: false`, `active: true`, `importance: major` or `critical`. These are entities ready to enter play.

**Step 3 — Check meta preferences**

Read `meta/worldbuilding.md` and any filled `meta/players/*.md` files (excluding the template). Note which sections are populated and which are blank. If all are blank, fall back to the campaign's `themes` and `tone` from `scheduler/campaign.md`.

**Step 4 — Present 3 hooks**

Present exactly three options. Label their source so the DM knows where each came from. Keep each hook to 2–4 sentences — enough to understand the direction, not a full plan.

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

## Phase 4 — Scoping Questions

After the hook is chosen (or confirmed in CONTINUATION mode), ask 2–3 targeted questions before generating the plan. Tailor the questions to what's genuinely unknown given the hook. Always ask:

1. **Session length** — Short (~1.5 hr), Standard (~2 hr), or Long (~2.5 hr+)?
2. **Session shape** — Roleplay-heavy, combat-heavy, exploration-heavy, or balanced?

Add a third question only if something specific about the hook warrants it (e.g. "Is the party expected to find Strahd's location this session, or is that still a mystery to preserve?").

Do not ask questions that the established context already answers.

Wait for the DM's response before continuing.

---

## Phase 5 — Generate Session Plan

Using all context gathered, produce a session plan in chat. Follow the session schema fields:

- **Session name** — propose a name (the DM can change it)
- **Opening scene** — where the party is, what's immediately in front of them, how the session begins
- **Closing hook** — how the session should end; the cliffhanger or question that sends players home wanting more
- **Key locations** — where the session takes place; use `[[wiki-link]]` for any established entity
- **Key NPCs** — who the players interact with; note if they are free (`data/`) or canon (`historian/`) entities
- **Encounters** — any planned combat, social, or exploration encounters; note difficulty tier if relevant. For non-standard encounter types (chase, puzzle, trade negotiation, performance, mini-game), check `meta/mechanics/` for an applicable mechanic file.
- **Loose threads to address** — any unresolved promises, player action items, or dangling beats from previous sessions

Apply the free entity rule: if the session requires an entity that doesn't exist in `data/` or `historian/`, **stop and flag it** rather than silently inventing one. Ask the DM whether to create it or proceed differently.

If meta preference files are blank, note: *"Group preferences and worldbuilding details are not yet filled in — session is based on campaign tone and themes only. Consider filling in meta/ files for more tailored generation."*

---

## Phase 6 — Offer to Write

After presenting the plan, ask:

> "Should I save this as `scheduler/sessions/session-{nn}-{name}.md` with `state: draft`?"

If yes:
1. Read `meta/schemas/session.md` to confirm the frontmatter template
2. Write the file at the canonical path
3. Populate all mandatory frontmatter fields from the plan above
4. Leave historian-only fields commented out (they are filled after play)

If no: leave the plan in chat for the DM to use or adapt manually.
