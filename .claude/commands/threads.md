Surface forgotten or unresolved campaign threads. Combines state-based scanning with semantic ranking against current story state.

**Arguments:** none required

- `-k <n>` — number of semantic results to surface (default: 10)

---

## Behavior

Read-only. No generation, no file writes. Surfaces what the campaign is forgetting.

---

## Phase 1 — Get Current Story State

Run:

```powershell
.\scripts\session-state.ps1
```

Extract: current cliffhanger (or most recent historian session cliffhanger), active mission hook, current act goal. This becomes the semantic anchor for relevance ranking.

---

## Phase 2 — State-Based Scan

Run:

```powershell
.\scripts\threads-brief.ps1
```

It collects, in one call: historian entities in unresolved states (`missing`, `imprisoned`, `transformed`, `unknown`, `stranded`, `captured`), living characters with `disposition: hostile`, and pending `Seeded:` lines from `meta/literary-devices.md` and `meta/campaign-design-preferences.md`. Do not manually sweep historian frontmatter or re-read the two meta files — the script output is the complete Phase 2 signal set.

Apply judgment to the raw output:

- For hostile characters, drop any with a recent session reference — only surface ones the story has forgotten.
- For each pending seed, note the session it was planted in and how many sessions have passed since. A planted seed is a thread by definition — the table saw the breadcrumb even if nobody named it.

---

## Phase 3 — Semantic Ranking

Run semantic search using the story anchor from Phase 1:

```powershell
.\scripts\semantic-search.ps1 -Query "<cliffhanger + mission hook text>" -Source historian -K <k>
```

Then run against pool to surface free entities the story may be ready to use:

```powershell
.\scripts\semantic-search.ps1 -Query "<cliffhanger + mission hook text>" -Exists false -K 5
```

---

## Phase 4 — Present Threads Report

Combine Phase 2 (state-based) and Phase 3 (semantic) results. Deduplicate. Present ranked by combined signal — semantic score weighted higher for historian results, state flag weighted higher for pool results.

Format:

**Unresolved (state-flagged):**

- [Name] (type) [state] — one-line note on what's unresolved and why it may matter now

**Semantically relevant (historian):**

- [Name] (type) score=X.XXX — one-line note on connection to current story

**Pool candidates ready to enter play:**

- [Name] (type) score=X.XXX — one-line note on thematic fit

**Pending seeds (planted, not yet paid off):**

- [Item] (device/twist/preference, scale) — seeded in [[Session NN]], {n} sessions ago: {seed note}. One-line note on whether current story state offers a payoff opening.

Omit the seeds section if nothing is seeded. Flag any seed older than ~5 sessions as aging — candidate for pay-off, re-seed, or deliberate retirement at the next act transition.

End with:

> "Any of these worth pulling into the next session? `/session` picks threads up automatically — flag any here you want weighted in, or want deliberately left alone."
