Find campaign entities by semantic similarity. Pure RAG query — no generation, no file writes.

**Arguments:**
- `<query>` — search text (required)
- `--type <type>` — filter by entity type (character, location, faction, etc.)
- `--subtype <subtype>` — filter by subtype (npc, antagonist, pc, etc.)
- `--source historian|data|scheduler` — filter by source directory
- `--exists true|false` — filter by exists status (omit for all)
- `-k <n>` — number of results (default: 8)

---

## Phase 1 — Run Query

```powershell
.\scripts\semantic-search.ps1 -Query "<query>" [-Type <type>] [-Subtype <subtype>] [-Source <source>] [-Exists <exists>] [-K <k>]
```

---

## Phase 2 — Format Results

Group results by source:

- **Canon (historian/)** — established campaign fact
- **Pool (data/)** — available for play, not yet canonized
- **Active (scheduler/)** — currently in the story layer

For each result present: name, type/subtype, state, score, and a one-line relevance note — *why* this entity matched (not just what it is).

Flag anything notable:
- Cross-type hits — entity type differs from what the query implied
- High-scoring pool entities (score > 0.45) — strong candidates for current story
- State anomalies (`missing`, `imprisoned`, `transformed`) — unresolved threads

---

## Phase 3 — Offer Follow-Up

After results, offer one line:

> "Want to open any of these, use one in an upcoming session, or run a follow-up query?"

Do not proceed unless the user responds. Do not generate session content unprompted.
