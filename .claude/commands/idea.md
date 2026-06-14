Develop a rough creative idea for the engine into a precise, grounded, executable change — without reinventing what already exists. This command carries the full staged workflow inline; it is self-contained.

**Arguments:**

- `[rough idea]` — a thought in plain words, or the name of an existing idea doc to resume (optional; if omitted, ask the DM for the idea)
- `--build` — authorize Stages 6–7 (engine edits). Without it, stay read-only

---

## Behavior

Collaborative and staged. An idea moves through seven stages; earlier stages can be revisited — a loop, not a one-way pipe. Stop as soon as the idea is actionable; not every idea needs a full build.

Each idea lives as its own markdown file at repo root (e.g. `my-new-idea.md`) until its action steps are executed — a worksheet, not canon.

**Hard gate:** Stages 1–5 are read-only (they produce only the idea doc, no engine edits). Stages 6–7 edit the engine and run **only on explicit DM go-ahead** (`--build`, or a clear "build it").

---

## The Stages

### 1. Capture — what's the intent?

Raw idea in the DM's words. What experience or behavior is missing or wrong? No solutions yet. Lives in **Core Ideas**: a numbered list of atomic, load-bearing claims, kept atomic so later stages can test them one at a time.

### 2. Frame — say it precisely

Pin the vocabulary the idea introduces. Vague words ("spotlight", "balance") get exact meanings so action steps can't drift. Lives in **Key Terms**. If a term already means something in the engine (e.g. "contribution" already means submitted entities), say so and disambiguate — don't overload it silently.

### 3. Ground — what already exists?

Before designing anything, scan the engine for what already supports or conflicts with the idea (grep commands, scripts, meta files, schemas). Per capability the idea needs: **Exists** (reuse it; name the file) · **Partial** (extend it; name what's missing) · **Gap** (net-new; flag it). **Non-negotiable** — most bad action steps come from skipping this and reinventing existing parts. Declare read scope first. Record findings inline so the action steps inherit them.

### 4. Impact — what changes for DM and players?

Concrete before/after. What does the DM see at the table or in a command that they didn't before? What do players feel? Lives in **What the change looks like to the DM and the Players**. If you can't describe the felt difference, the idea isn't ready to action.

### 5. Action steps — what gets built?

Specific engine changes, each tied to a file, with one line of rationale. Ordered; mark which are prerequisites. The handoff test: a developed idea is one whose action steps could be executed by someone who never saw the discussion. Note both destinations — principles → `meta/`, mechanics → commands/scripts. Lives in **Action steps**.

Stop after Stage 5 unless the DM authorizes the build.

### 6. Build & verify — make it real (gated)

Execute the action steps. Then prove behavior changed: run the new script, walk the command, show the before/after. Don't claim done without the proof. Migrate the idea's principles into `meta/`; delete or archive the root idea doc once its steps are executed.

### 7. Refine — right-size what you built (gated, optional)

Audit the instruction-text you added as a body — a separate backward pass, not done mid-build (you can't see the full duplication footprint until every file exists). Lens is efficiency against the project's design principles, not correctness:

- **Single-source.** A feature spreads its core concepts across many files (meta doc, schemas, commands). Pick one canonical home — usually the meta doc — and make the rest reference it, don't re-teach it. Map where each concept is restated; collapse the dupes.
- **Inlining tension.** Progressive disclosure cuts both ways: forcing an execution command to open the meta doc every run is also a cost. Strip the duplicated *definitions* but keep the *steps* inline so the command runs without a lookup hop.
- **Verbosity.** Cut word count. Fragments over sentences.
- **Frontmatter.** Every declared tunable must have a script that reads it — cut dead config (a declared-but-unread tunable misleads).
- **No behavior change.** Scripts untouched, lint clean — this pass only moves and trims prose.

---

## Working Rules

- **Ground before you design.** Stage 3 is non-negotiable.
- **One idea per file.** Cross-references between idea docs use `[[wikilinks]]`, same as entities.
- **Declare scope before reading widely.** Say what you'll read and why before pulling files (same discipline as generation tasks in root `CLAUDE.md`).
- **Don't build unless asked.** Stages 1–5 produce only the idea doc; 6–7 gate on explicit go-ahead.
- **No engine changes until the doc is filled, reviewed, and approved as a whole.** Developing any doc section is always fair game — but engine edits wait until every section is drafted, reviewed together, and the DM signs off. Section-by-section build invites churn when a later section revises an earlier one.
- **Work one stage at a time, with the DM.** Develop a section, surface it, get input, then move on — don't draft every section solo. The DM's words are the spine; propose and refine, never replace.
- **Number the options.** End any message that surfaces choices with a numbered pick-list so the DM can pick by number.
- **Principles go to `meta/`, mechanics go to commands/scripts.** When an idea graduates, split it: the "why/what" becomes a meta rule, the "how" becomes engine code.
- **Right-size after you build** (Stage 7). The build proves behavior; a separate refine pass single-sources the prose against progressive disclosure. Duplication is invisible mid-build.

---

## Phase 1 — Locate or create the idea doc

- If the argument names an existing root idea doc (`*.md` at repo root), read it and report which stages are filled vs. empty. Resume at the first incomplete stage.
- Otherwise create a new doc at repo root from the template below (one idea per file). Capture the DM's rough statement verbatim in the opening paragraph. Do not pre-fill later sections.

State which doc you're working and where you're resuming before proceeding, then walk the stages above one at a time.

### Idea Doc Template

```markdown
# <idea name>

<one-paragraph statement of the rough idea>

## Core Ideas
<!-- Stage 1: numbered atomic claims -->

## Key Terms
<!-- Stage 2: vocabulary pinned to exact meaning -->

## Measurement Model
<!-- Optional. Only for ideas with mechanical depth — a scoring/measurement scheme,
     thresholds, weights, edge-case rules. The precise spec the action steps implement.
     Omit for ideas that are purely qualitative. -->

## Grounding
<!-- Stage 3: per capability — Exists / Partial / Gap, with file names -->

## What the change looks like to the DM and the Players
<!-- Stage 4: concrete before/after -->

## Action steps
<!-- Stage 5: ordered file-by-file edits, each with rationale -->
```

---

## Closing

After Stage 5, suggest the DM authorize the build with `/idea --build` when ready. After a build, if new entities or scripts landed, suggest the matching followup (e.g. index rebuild) per the engine's one-suggestion rule.
