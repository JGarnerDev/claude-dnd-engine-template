# Shared Audit Rubric

Score each criterion: **pass** / **partial** / **fail**, with one evidence line citing the run log step number. Criteria derive from root `CLAUDE.md` working protocol; if root protocol changes, update here.

## 1. Script-first

Every applicable script in the root CLAUDE.md scripts table runs **before** manual file reads. Manual reads that duplicate a script's output are failures, even if the result was correct.

## 2. Frontmatter-first

Reading order respected: frontmatter → body → linked files. A body read counts as justified only if the frontmatter demonstrably could not answer the question at that step.

## 3. One-hop limit

Linked files (`relates_to`, `known_by`, `resources`, ...) followed at most 1 hop from the focal entity. Deeper traversal requires explicit task need, stated in the trace.

## 4. Declared scope

Before pulling files for generation/planning, the command declares what it will read and why, giving the DM a redirect window. Per-phase declarations count — a single upfront whole-run declaration is not required (amended 2026-06-10 after three runs). Silent bulk reads are failures.

## 5. Meta read-once

Each `meta/` file read at most once per task. Re-reads within sub-tasks are failures.

## 6. Campaign separation

No `campaign: strahd` entities surfaced into new-world content without explicit DM request, and vice versa. Untagged data entities are fine anywhere.

## 7. Interaction economy

Questions to the DM only at spec-defined checkpoints or genuine blockers. Count every question; each one outside a checkpoint needs justification.

## 8. Output contract

Final output matches the command's spec contract exactly — format, file locations, and required sections (e.g. recap two-part format). Extra unrequested artifacts are failures.

## 9. Dead instructions

Flag any instruction in the command doc that could never trigger during this run *and* has no plausible run where it would. Candidate for deletion from the doc.

## 10. Token proportionality

Estimated total tokens vs. the minimal-necessary set for the same output quality. Report the ratio. Above ~1.5×: identify the heaviest steps and whether a script, frontmatter read, or doc fix would cut them.
