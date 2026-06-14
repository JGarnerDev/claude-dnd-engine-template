Develop a rough creative idea for the engine into a precise, grounded, executable change — the staged workflow defined in `idea proccess.md`.

**Arguments:**

- `[rough idea]` — a thought in plain words, or the name of an existing idea doc to resume (optional; if omitted, ask the DM for the idea)
- `--build` — signals the DM is ready to authorize Stage 6–7 (engine edits). Without it, stay read-only

---

## Behavior

Collaborative and staged. `idea proccess.md` is the canonical spec — read it for the full stage definitions, the Idea Doc Template, and the Working Rules; this command is the operational driver, it does not restate them.

**Hard gate:** Stages 1–5 are read-only (they produce only the idea doc). Stages 6–7 edit the engine and run **only on explicit DM go-ahead** (`--build`, or a clear "build it"). Never edit engine files while developing the doc.

**Work one stage at a time, with the DM.** Develop a section, surface it, get input, then move on — don't draft every section solo. The DM's words are the spine. End any message that surfaces choices with a numbered pick-list.

---

## Phase 1 — Locate or create the idea doc

- If the argument names an existing root idea doc (`*.md` at repo root), read it and report which stages are filled vs. empty. Resume at the first incomplete stage.
- Otherwise create a new doc at repo root from the **Idea Doc Template** in `idea proccess.md` (one idea per file). Capture the DM's rough statement verbatim in the opening paragraph. Do not pre-fill later sections.

State which doc you're working and where you're resuming before proceeding.

---

## Phase 2 — Work the stages

Walk the stages in `idea proccess.md`, one at a time, stopping as soon as the idea is actionable (not every idea needs a full build):

Read-only (produce only the idea doc):

- **Stage 1 · Capture** — atomic numbered claims (Core Ideas).
- **Stage 2 · Frame** — pin the new vocabulary (Key Terms); disambiguate any term that already means something in the engine.
- **Stage 3 · Ground** — scan the engine before designing (grep scripts, meta, schemas, commands). Per capability: Exists / Partial / Gap, with file names. **Non-negotiable** — most bad action steps come from skipping it. Declare read scope first.
- **Stage 4 · Impact** — concrete before/after for DM and players.
- **Stage 5 · Action steps** — ordered, file-by-file edits, each with one line of rationale; mark prerequisites. Note both destinations: principles → `meta/`, mechanics → commands/scripts.

Stop after Stage 5 unless the DM authorizes the build. Gated (engine edits, `--build` only):

- **Stage 6 · Build & verify** — execute the action steps, then prove behavior changed (run the script, walk the command, show before/after). Migrate principles into `meta/`; delete or archive the root idea doc once its steps are executed.
- **Stage 7 · Refine / right-size** (mandatory, keeps the project efficient) — audit the added instruction-text as a body: single-source duplicated concepts to one canonical home, strip definitions (keep steps) in execution commands, cut word count and dead frontmatter. No behavior change — lint clean.

---

## Closing

After Stage 5, suggest the DM authorize the build with `/idea --build` when ready. After a build, if new entities or scripts landed, suggest the matching followup (e.g. index rebuild) per the engine's normal one-suggestion rule.
