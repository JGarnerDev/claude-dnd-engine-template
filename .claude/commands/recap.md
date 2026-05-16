Canonize a played session. Closes the loop on the session lifecycle: gathers what actually happened, updates the session file with historian fields, moves it to `historian/sessions/`, and audits entities for canonization.

---

## Phase 1 — Identify the Played Session

Check `scheduler/sessions/` for any file with `state: draft`.

- If exactly one draft session exists, use it. State its name and session number.
- If multiple exist, list them and ask the DM which one was just played.
- If none exist, ask the DM to specify the session number or file name.

Read the session file fully: note `session_number`, `mission`, `locations`, `key_npcs`, `encounters`, `opening_scene`, `closing_hook`.

---

## Phase 2 — Gather What Happened

Ask the DM the following. Keep it conversational — rough notes are fine.

1. **Date played** — What date was the session?
2. **Recap** — What actually happened? Walk me through it. (Free-form; DM can paste notes or speak informally.)
3. **Cliffhanger** — Where did things end? What question or situation carries into next session?
4. **State changes** — Any significant PC or NPC changes? (Deaths, level-ups, new afflictions, relationship shifts, items gained or lost.)
5. **New entities** — Anything invented at the table that doesn't have a file yet? (NPCs named on the fly, locations described, items handed out.)

Wait for the DM's response before continuing.

---

## Phase 3 — Entity Audit

For each entity listed in `locations` and `key_npcs` in the session plan:

1. Check `historian/` — if it already exists there, confirm its current state is still accurate given what happened.
2. Check `data/` — if it exists there with `exists: false`, flag it for canonization.
3. If it exists in neither place, flag it as a **missing entity** — do not silently create it.

Report findings before proceeding:
- Entities to canonize: [list]
- Entities with state changes: [list]
- Missing entities (need creation): [list]

---

## Phase 4 — Write the Historian Session Record

Update the session file with the following historian fields (do not remove any existing frontmatter fields):

```yaml
exists: true
state: completed
played_date: "{date from Phase 2}"
recap: "{synthesized from DM's notes — concise, past tense, third person}"
cliffhanger: "{from Phase 2}"
entities_canonized:
  - [[Entity Name]]   # one per entity moved to historian this session
new_entities:
  - "{description}"     # one per thing invented at the table, not yet filed
```

Then move the file from `scheduler/sessions/` to `historian/sessions/`.

---

## Phase 5 — Canonize Entities

For each entity flagged for canonization in Phase 3:

**If the entity file is in `data/` with `exists: false`:**
- Update `exists: true`
- Add `source_session: [[Session {nn}]]`
- Add `confirmed_date: "{played_date}"`
- Move the file from its `data/` path to the corresponding `historian/` path (see `meta/types.md` for the mapping)

**If the entity has a state change:**
- Update the relevant field (`state`, `location`, `last_updated`, etc.) in its `historian/` file

**If an entity is missing (no file anywhere):**
- Do not create it silently. Flag it clearly:
  > "**[Entity Name]** was referenced in this session but has no file. Create it now? If yes, I'll follow the Entity Creation Protocol."
- Wait for DM confirmation before creating anything.

---

## Phase 6 — Update Campaign State

Read `scheduler/campaign.md`. Propose updates to the `## Current State` section to reflect:
- New party location
- Any active afflictions or ongoing conditions
- Any resolved or newly opened threads

Present the proposed changes and ask for confirmation before writing.

---

## Phase 7 — Summary

Report what was done:

- Session file: moved to `historian/sessions/session-{nn}-{name}.md`
- Entities canonized: [list with paths]
- Entities with state updates: [list]
- Missing entities still needing files: [list]
- Campaign state: updated / no changes needed

If any action items remain (unconfirmed entities, meta files to update), list them explicitly.
