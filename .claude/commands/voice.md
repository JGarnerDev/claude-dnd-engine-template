Build a voice brief for an NPC — grounds new dialogue and characterization in established canon.

**Arguments:**

- `<npc name>` — name of the NPC (required); fuzzy match against historian and data

---

## Behavior

Read-only by default. Output is a compact DM reference card for playing the NPC. The only write this command may perform is the Phase 6 voice cache, and only with DM approval.

---

## Phase 1 — Locate Entity

Search `historian/` then `data/` for the NPC by name. Check `aliases` field if exact match fails. If still not found:

```powershell
.\scripts\semantic-search.ps1 -Query "<npc name>" -Type character -K 3
```

Confirm match with DM if ambiguous.

---

## Phase 2 — Read Entity File

Read the NPC's full file. Extract:

- `personality`, `disposition`, `livelihood`
- Any dialogue or speech examples in the body
- Relationship notes from `relates_to`
- Current `state` and `location`

---

## Phase 3 — Surface Past Appearances

Find sessions where this NPC appeared or was referenced:

```powershell
.\scripts\semantic-search.ps1 -Query "<npc name> <personality summary>" -Source historian -K 5
```

For results with score > 0.40, read the NPC quick-reference section of those session files for established voice notes.

---

## Phase 4 — Find Voice Parallels

Surface similar NPCs for texture reference — same archetype or disposition:

```powershell
.\scripts\semantic-search.ps1 -Query "<personality summary>" -Type character -Source historian -K 4
```

Use as texture only. Do not copy voice patterns wholesale.

---

## Phase 5 — Synthesize Voice Brief

```markdown
## Voice Brief: [Name]

**Speaks like:** [cadence, vocabulary, register — 1–2 sentences]
**Wants right now:** [current motivation given campaign state]
**Knows:** [information they can reveal — bullet list]
**Won't say:** [what they conceal or deflect]
**Tell:** [one physical or verbal habit that signals lying, nervousness, or interest]
**Callback:** [one specific past moment to reference if the party brings it up]
```

Keep each field to one line or a short bullet list. This is a DM reference card, not prose.

---

## Phase 6 — Offer to Cache the Brief

**Skip silently if the NPC's file already has a `## Voice` section** — in that case Phase 2 read it and this run should have built on it, noting any drift between the cached brief and newer session evidence.

Otherwise, offer once:

> "Save this brief into [Name]'s file as a `## Voice` section? Future /voice calls (and /session NPC quick-reference) become a single file read."

If yes: append the brief verbatim as a `## Voice` section at the end of the NPC's file (historian or data — wherever it lives), preceded by a one-line stamp: `*Cached by /voice after Session {latest played NN}; regenerate if the character shifts.*` Do not modify frontmatter. If no: leave the brief in chat only.
