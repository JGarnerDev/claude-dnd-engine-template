# PC Backstory Ingestion

**Do not write anything until DM confirms.** Never merge backstory content silently.

**Ingestion flow:**

1. Parse the free-text — extract what's present: appearance, personality, motivations, key relationships, notable history, abilities/spells/features, secrets
2. Match to an existing PC file in `historian/characters/pcs/` by name (check aliases too). If no match, stop and ask DM before proceeding.
3. Map extracted content to the PC file's body sections:
   - Appearance, Personality, Backstory, Abilities (Noted in Play)
   - Do not overwrite session history or affliction data — append only
   - Flag anything contradicting existing canonized facts with a `> **Reliability:**` note
3.5. Extract **spotlight hooks** to frontmatter (see **Spotlight Hooks** below).
4. Show DM a proposed diff: which sections change, what gets added, what conflicts exist — include the proposed `spotlight_hooks:` list
5. Identify gaps (see **Gap Analysis** below) and offer a follow-up questionnaire if warranted
6. Write only after explicit DM confirmation

**Format note:** Backstory content from players is flavor-authoritative for their own character. Treat it as confirmed unless it contradicts `historian/` canon, in which case flag and ask.

## Gap Analysis

After parsing, check for missing or underdeveloped material across two categories:

**Mechanical gaps** — fields the PC schema requires but the backstory doesn't answer:

- Race, class, background (if unconfirmed)
- Level at campaign start
- Signature abilities or spells not mentioned

**Narrative gaps** — content the DM needs for session use but is absent or too vague:

- Appearance (none given)
- At least one named relationship (ally, rival, mentor, family)
- A concrete personal motivation beyond "wants adventure"
- A personal fear, wound, or regret usable as a story hook
- Any unresolved thread the player intended to explore

Surface gaps after the proposed diff, grouped by severity:

- **Blocking** — field is mandatory in the PC schema and cannot be left as `unknown` without degrading the file (e.g. race, class). Flag clearly; do not write the file until resolved.
- **Useful** — not mandatory but high DM value. Flag and offer a questionnaire.
- **Optional** — nice to have. Mention briefly; do not generate a questionnaire unless DM asks.

**Follow-up questionnaire:** Generate only when there are Blocking or Useful gaps. Output is player-facing plain language — no schema field names, no jargon. Ask only about the specific gaps identified; never send a generic full-character form. Present the questionnaire to the DM to review and forward to the player at their discretion.

## Spotlight Hooks

The same fear/wound/regret and unresolved-thread material the Gap Analysis already hunts for
is what the character-focus ledger needs as queryable hooks (`meta/character-focus.md`). When
that material is present in the backstory, turn it into `spotlight_hooks:` frontmatter so
`/session` can surface PC-specific opportunities later.

- Each distinct fear, wound, regret, goal, or unresolved thread becomes one hook: a single
  one-line phrase a DM could build a scene around (e.g. *"confront the mentor who exiled
  her"*, *"find out who burned the village"*). Keep them concrete and scene-able — not vague
  traits ("is brave").
- Every new hook gets `status: open`. Never write `seeded`/`paid` at ingestion — those
  statuses are advanced by `/session` (`open → seeded`) and `/recap` (`seeded → paid`).
- Set `spotlight: normal` unless the DM says the player is tactics-first / arc-light, in
  which case set `spotlight: low`.
- Include the proposed hook list in the diff (step 4) and write only on DM confirmation, same
  as everything else. If the backstory yields no scene-able hook material, leave
  `spotlight_hooks:` empty — `/session` will flag the PC as needing a backstory pass, which
  is the correct signal, not a defect to paper over.

## Backstory-Sourced Entities

Backstory ingestion often introduces entities (locations, deities, NPCs, factions) that don't have files yet. These are player-confirmed canon — they skip the balance review flow used for `/entity-questionnaire` submissions. But they still require reading `meta/entity-creation.md` for schema before any file is written.

After proposing the PC file diff (step 4 above), identify any new entities referenced in the backstory. Before treating them as new, run semantic search on each referenced entity's description to check if it already exists under a different name:

```powershell
.\scripts\semantic-search.ps1 -Query "<entity description from backstory>" -K 3
```

Any result with score > 0.45 is a likely match — surface it to the DM before creating a new file. Then categorize remaining genuinely new entities:

- **Canonized past/present entities** (locations, deities, factions that existed or still exist) → create in `historian/` with `exists: true`; use `state: destroyed` / `state: active` as appropriate
- **Potential future entities** (antagonists with unknown fate, unresolved plot threads) → create in `data/` with `exists: false` as free entities available for future sessions
- **Deceased minor NPCs** → no file unless a specific individual becomes plot-relevant; document names in the PC file only
- **Items carried by the PC** → no separate file; document in the PC's file

Present the entity list to the DM alongside the PC diff. Create entity files only after DM confirmation, and only after reading `meta/entity-creation.md`.
