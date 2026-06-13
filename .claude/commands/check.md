Check a proposed fact, recap summary, or entity detail against historian canon for contradictions.

**Arguments:**
- `<claim>` — text to check (required); sentence, paragraph, or bullet list
- `--source historian|data|both` — scope of the check (default: historian)
- `-k <n>` — number of candidates to surface (default: 6)

---

## Behavior

Read-only. No generation, no file writes. Output is a conflict report — CLEAR, POSSIBLE, or CONFLICT.

---

## Phase 1 — Run Semantic Search

```powershell
.\scripts\semantic-search.ps1 -Query "<claim text>" -Source <source> -K <k>
```

---

## Phase 2 — Assess Results

For each result with score > 0.35, read the relevant section of the entity file. Classify:

- **CONFLICT** — directly contradicts the claim (different state, incompatible fact, timeline violation)
- **POSSIBLE** — related and *may* conflict; requires DM judgment
- **RELATED** — thematically connected but not contradictory; useful context, not a problem

Ignore results below 0.35.

---

## Phase 3 — Report

**If no results above 0.35:**
`CLEAR — no historian conflicts found.`

**If POSSIBLE or CONFLICT results exist:**

```
CHECK: "<claim summary>"

[CONFLICT / POSSIBLE]:
- [Entity name] ([file path]) score=X.XXX
  Claim says: [relevant part of claim]
  Historian says: [relevant quote or summary from entity file]
  Verdict: [direct contradiction / possible overlap / timeline issue]

Recommend: [confirm with DM / revise claim / no action needed]
```

Surface CONFLICT entries first, then POSSIBLE. Omit RELATED unless it adds useful context.
