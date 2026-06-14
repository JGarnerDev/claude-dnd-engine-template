Surface a rumor — a quick session-opener or tavern-talk beat pulled from the rumor pool. Read-only flavor tool; no entity creation, no file writes.

**Arguments (all optional):**

- `[count]` — number of rumors to surface (default: 1)
- `[theme]` — if text is provided, bias selection toward that theme (e.g. `/rumor the church`, `/rumor 2 strange lights`)

---

## Behavior

Output is **text only**. Surfacing a rumor does not consume it — the pool entity stays free until it is actually used in play and canonized via the normal flow. This command is a circulation tool: it keeps pool rumors visible so they get played instead of forgotten.

---

## Phase 1 — Pull from the Pool

```powershell
.\scripts\inventory-brief.ps1 -Type rumor
```

If a theme was given, also rank by relevance:

```powershell
.\scripts\semantic-search.ps1 -Query "<theme>" -Type rumor -K 5
```

Respect campaign separation: skip rumors tagged for a campaign other than the active one, and vice versa. Untagged rumors are always eligible.

## Phase 2 — Present

Pick the requested number — themed match first, otherwise vary which rumors get surfaced run to run (don't always lead with the same one). For each:

- **The rumor**, told in-world: one or two sentences as an NPC would actually pass it along (tavern phrasing, not file phrasing). Invent the messenger flavor freely (a drunk ostler, a nervous pilgrim) — that's delivery, not canon.
- One line for the DM: where it could surface naturally given the party's current location, and whether it's free pool material (name the entity).

**If the pool is empty** (or empty for the active campaign): say so — that's meaningful signal — and offer to improvise 1–3 disposable rumors in the same format, grounded in current campaign tone. Improvised rumors are pitch-grade material: if the DM wants one kept, it goes through the normal entity creation protocol, never silently filed.

## Phase 3 — Close

One line: *"Want another, or should one of these find its way into the next session plan?"* Do not generate session content or create entities unless asked.
