Canonize a played session. Closes the loop on the session lifecycle: gathers what actually happened, updates the session file with historian fields, moves it to `historian/sessions/`, and audits entities for canonization.

---

## Phase 1 — Identify the Played Session

First check `recaps/inbox/` for a notes file — if one exists, it is the DM's raw account of the played session and usually identifies which session it was. Read it now; it feeds Phase 2.

Check `scheduler/sessions/` for any file with `state: draft`.

- If exactly one draft session exists, use it. State its name and session number.
- If multiple exist, list them and ask the DM which one was just played.
- If none exist, ask the DM to specify the session number or file name.

Read the session file fully: note `session_number`, `mission`, `locations`, `key_npcs`, `encounters`, `opening_scene`, `closing_hook`.

---

## Phase 2 — Gather What Happened

**If an inbox notes file was found in Phase 1:** mine it for all six answers below first, then ask the DM only what the notes don't answer — in one batched message. Do not re-ask anything the notes already cover.

Otherwise, ask the DM the following. Keep it conversational — rough notes are fine.

1. **Date played** — What date was the session?
2. **Recap** — What actually happened? Walk me through it. (Free-form; DM can paste notes or speak informally.)
3. **Cliffhanger** — Where did things end? What question or situation carries into next session?
4. **State changes** — Any significant PC or NPC changes? (Deaths, level-ups, new afflictions, relationship shifts, items gained or lost.) Always confirm levels explicitly — state the current party level from PC frontmatter and ask "still correct?" rather than waiting for the DM to volunteer a level-up.
5. **Rests, rounds & in-world time** — Did the party take a long rest at any point (especially before the cliffhanger)? Any short rests? Roughly how many rounds of combat were fought? Roughly how much in-world time passed this session, and what's the in-world date/time the party ends on? (Rough estimates are fine — this feeds the Rest Clock, which only needs to distinguish fresh from half-spent from running-on-fumes, and to know the in-world time for the long-rest 24-hour gate. Zero rounds is a normal answer for a roleplay-only session; the clock still gets restamped.) Any notable resource burns worth recording (big spells gone, hit dice low)?
6. **New entities** — Anything invented at the table that doesn't have a file yet? (NPCs named on the fly, locations described, items handed out.)
7. **Table reaction** — What landed? Anything that fell flat or felt off? (One line is fine — this informs future planning, not canonization.)

Wait for the DM's response before continuing.

---

## Phase 2.5 — Spotlight Tagging Pass

Tag the session for the character-focus ledger (`meta/character-focus.md`). Work from the
Phase 2 recap; this is a quick per-scene pass (~4–8 taps across a session), not one global
question. **Skip entirely if fewer than 3 sessions including this one are played** — the
ledger is inert before cold-start clears; note that and move on.

1. **Classify + weight every beat.** Walk the recap scene by scene and tag each beat in the
   `classification: weight` form defined in `meta/schemas/session.md` → Spotlight Beats
   (`spotlight`/`shared`/`party-centric`/`world` × `touch`/`beat`/`arc`). Tag touches too —
   dropping them biases the ratio. PC names must match each PC's `name:` exactly.
2. **Shared cap.** If a beat focuses 3+ PCs individually, it isn't spotlight — flag it and
   reclassify as `party-centric` with the DM rather than writing a 3-PC `shared`.
3. **Two-PC-party tiebreak.** In a two-PC party, decide `shared` vs `party-centric` by intent:
   two individual arcs advancing = `shared`; one collective stake = `party-centric`.
4. **Attendance.** Note which PCs appear in the recap. **Never silently assume absence** — for
   any PC who doesn't appear, ask the DM "absent this session, or just quiet?" before
   excluding them from rotation. Present-but-quiet still counts as present.
5. **Hook payoff.** For any `spotlight_hooks:` entry on a PC file currently at `status: seeded`
   (set by `/session` when it planned this session around the hook), check whether its beat
   actually landed. If yes, mark it to advance `seeded → paid` in Phase 5.

Hold the tagged beat list, the attendance note, and the hooks-to-advance list for Phases 4–5.

---

## Phase 3 — Entity Audit

For each entity listed in `locations` and `key_npcs` in the session plan:

1. Check `historian/` — if it already exists there, confirm its current state is still accurate given what happened.
2. Check `data/` — if it exists there with `exists: false`, flag it for canonization.
3. If it exists in neither place, run semantic search as a fuzzy fallback — the entity may exist under a different name than the session plan used:

   ```powershell
   .\scripts\semantic-search.ps1 -Query "<entity name and any known description>" -K 3
   ```

   Any result with score > 0.45 is a likely match — confirm with DM before assuming missing. If no match found, flag as a **missing entity** — do not silently create it.

Report findings before proceeding:

- Entities to canonize: [list]
- Entities with state changes: [list]
- Missing entities (need creation): [list]

---

## Phase 4 — Write the Historian Session Record

Before writing, run `/check <recap summary>` to flag any historian conflicts in the DM's account. Surface CONFLICT and POSSIBLE results to the DM; do not silently canonize content that contradicts existing canon. If the DM confirms the new account supersedes old canon, note the discrepancy in `table_notes`.

**Reliability flags:** in this session record and in any historian content written during this recap (Phase 5 included), add a `> **Reliability:**` blockquote whenever:

- a detail is inferred rather than stated in the notes
- the source used a nickname or abbreviation instead of a confirmed name
- two sources conflict with each other
- the notes are ambiguous about mechanics vs. fiction

End each flag with an explicit "Confirm with DM" or "Confirm with [player name]" so it's clear who verifies it. Err on the side of flagging — unconfirmed details are cheap to mark now and expensive to untangle later.

Update the session file with the following historian fields (do not remove any existing frontmatter fields):

```yaml
exists: true
state: completed
played_date: "{date from Phase 2}"
in_world_end_date: "{in-world date the party ends on, from Phase 2 question 5, as flat "YYYY[-MM[-DD]]" — year required, month/day to whatever precision is known. Omit field if the session has no datable in-world anchor. Plots this session as a /timeline party-history milestone.}"
recap: "{synthesized from DM's notes — concise, past tense, third person}"
cliffhanger: "{from Phase 2}"
entities_canonized:
  - [[Entity Name]]   # one per entity moved to historian this session
new_entities:
  - "{description}"     # one per thing invented at the table, not yet filed
table_notes: "{what landed, what didn't — from Phase 2 question 7. Omit field if no feedback given.}"
beats:                  # from Phase 2.5 tagging pass; omit if cold-start not yet cleared
  - "spotlight(PC Name): beat"
  - "party-centric: touch"
pcs_present:            # PCs at the table this session — from the Phase 2.5 attendance check
  - "PC Name"
```

Write `beats:` as one quoted line per tagged beat in the `classification: weight` form (see
`meta/schemas/session.md` → Spotlight Beats). Write `pcs_present:` as the DM-confirmed list of
PCs who were at the table (the Phase 2.5 attendance check). Omit both fields when the Phase 2.5
pass was skipped for cold-start.

Then move the file from `scheduler/sessions/` to `historian/sessions/`.

---

## Phase 5 — Canonize Entities

For each entity flagged for canonization in Phase 3:

**If the entity file is in `data/` with `exists: false`:**

- Update `exists: true`
- Add `source_session: [[Session {nn}]]`
- Add `confirmed_date: "{played_date}"`
- Move the file from its `data/` path to the corresponding `historian/` path (see `meta/types.md` for the mapping)
- **Elaboration check:** if the moved entity has no `personality` or `motivation` field, offer a minimal elaboration prompt — *"[Name] just became real. Want a personality hook and motivation sketched now while it's fresh?"* If yes, draft immediately (one-pass, Approaching tier from `data/CLAUDE.md`) and write back to the historian file before continuing. Do not do this silently.

**If the entity has a state change:**

- Update the relevant field (`state`, `location`, `last_updated`, etc.) in its `historian/` file

**Level restamp (every recap, even with no level-up):** for each active PC in `historian/characters/pcs/`, set `level_confirmed: {session_number}` — updating `level` first if the DM reported a change in Phase 2. The stamp records "level verified as of session N"; skipping it is what makes levels go silently stale.

**Spotlight hook advance (from Phase 2.5):** for each hook flagged as landed, edit that PC's `spotlight_hooks:` entry from `status: seeded` to `status: paid`. Only advance hooks whose beat actually paid off this session — a seeded hook that didn't land stays `seeded` and carries forward. Do not invent or add hooks here; new hooks come only from `.claude/commands/pc-backstory.md`.

**If an entity is missing (no file anywhere):**

- Do not create it silently. Flag it clearly:
  > "**[Entity Name]** was referenced in this session but has no file. Create it now? If yes, I'll read `meta/entity-creation.md` first."
- Wait for DM confirmation before creating anything.

**Improvised minor settlements & roads** (hamlets, villages, waystations, connecting tracks the party visited — usually surfacing via Phase 2's new-entities question or a travel-leg stop in the session plan):

- These follow the Settlement & Road Tiers section of `meta/settlements.md`: DM-created canon, written **directly to `historian/`** with `exists: true`, `source_session`, `confirmed_date` — no `data/` pool detour, no registry ID.
- Apply the promotion ladder before creating any road file: a road the party merely traveled stays narration in the recap; a stop on an existing route becomes a `waypoints:` line on that route; only a road with real play weight gets its own entity.
- A settlement the party only passed through without consequence can also stay as recap narration — confirm with the DM whether it earned a file.

---

## Phase 6 — Update Campaign State

Read the active campaign file (`state: active` in `scheduler/campaign/`). Propose updates to the `## Current State` section to reflect:

- New party location
- Any active afflictions or ongoing conditions
- Any resolved or newly opened threads

**Rest Clock (every recap, never skipped):** update the `### Rest Clock` block from Phase 2's rests-and-rounds answer, then restamp the header to `(as of: Session {NN})` even if nothing changed — the stamp is what `session-brief.ps1` checks for staleness:

- Always update `In-world time now` to where the party ends, and recompute `Hours since last long rest` and `Long rest available` (≥24h since last + safe location + no PC at 0 HP) from it — these drive the long-rest gate in `meta/difficulty.md`
- Long rest taken → reset: new `Last long rest (in-world)` anchor, `Hours since last long rest` to 0, rounds and short rests to 0, clear notable burns
- No long rest → add this session's rounds to `Rounds of combat since`, increment `Short rests since`, append notable burns
- DM unsure → record best estimate marked `(~estimate)`; never leave the old numbers standing unstamped

**Preference tracking:** check the session plan's DM notes for deployed or seeded items from `meta/campaign-design-preferences.md`, and for devices or twists from `meta/literary-devices.md`. Update the item's `Deployed:` line (wikilink to the session), its `Seeded:` line (wikilink + one-phrase breadcrumb note — devices and twists both seed), or a device's `Last used:` line. When a session *pays off* a seeded device, stamp `Last used:` with this session and mark the seed note paid (e.g. `→ paid off [[Session NN]]`) so `/threads` stops surfacing it. Note the scale the item was used at if it differs from the obvious one. This closes the loop `/session` opens — if it isn't done here, it never happens.

**Mystery registration:** if the session plan or the DM's notes flag a new load-bearing unknown (e.g. a "register in mysteries.md after play" note), propose the `meta/mysteries.md` entry now.

Present the proposed changes and ask for confirmation before writing.

---

## Phase 7 — Summary

Report what was done:

- Session file: moved to `historian/sessions/Session {NN} {Name}.md` (filename = exact display name, per `meta/schemas/entity.md`)
- Entities canonized: [list with paths]
- Entities with state updates: [list]
- Missing entities still needing files: [list]
- Campaign state: updated / no changes needed
- Preference `Deployed:`/`Seeded:` lines updated: [list, or none]
- Inbox notes file deleted: [yes / n/a]

If any action items remain (unconfirmed entities, meta files to update), list them explicitly.

A recap always writes indexed files (the session record, plus any canonized entities), so the semantic index is now stale. End the summary with one line: "Semantic index is now stale — run `py -3.10 scripts/index-entities.py` when convenient." Do not rebuild it yourself.

---

## Phase 8 — Offer the Player-Facing Recap

After the summary, offer once:

> "Want a player-facing 'previously on…' blurb for the group chat?"

If yes, render a short message from the canonized recap: 3–5 sentences of narrative prose in the "previously on" voice (past tense, third person), closing on the cliffhanger as a teaser. **Spoiler-safe:** include only what the players witnessed at the table — no DM-side information, no `Reliability` flags, no mechanics, no unrevealed entity names. Output as a single copy-paste block in chat; no file is written.
