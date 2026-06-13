# tests/ — Command Audit Domain Rules

This folder holds audits of slash commands: specs, rubrics, and run logs. Nothing here is campaign content. Files here are never entities — no `exists`, no `type`, no campaign tags.

## What a Command Audit Is

A command audit executes (or dry-runs) a slash command and measures it against its spec and the shared rubric. The goal is to find:

- **Gaps** — instructions in the command doc that are ambiguous, dead (never trigger), or missing
- **Token inefficiencies** — full-body reads where frontmatter suffices, manual reads where a script exists, re-reads of meta files, scope creep past 1 hop
- **Script candidates** — repeated multi-file read patterns that should collapse into one PowerShell script
- **Interaction friction** — unnecessary questions to the user, missing checkpoints, unclear output

## Folder Layout

- `rubrics/principles.md` — shared scoring criteria derived from root CLAUDE.md working protocol. Read once per audit.
- `commands/<command>/spec.md` — expected behavior contract for one command: required scripts, allowed body reads, interaction checkpoints, output contract.
- `commands/<command>/gaps.md` — accumulated findings. Append per audit; mark items resolved when the command doc is fixed.
- `runs/YYYY-MM-DD-<command>.md` — one execution trace per audit run. Evidence, not analysis — analysis goes in `gaps.md`.

## Audit Flow

1. Read `rubrics/principles.md` and the command's `spec.md` (create spec first if missing — see template below).
2. Execute the command in audit mode: follow its doc literally, but log every tool call as you go.
3. Write the run log to `runs/`. Record: each file read (frontmatter-only vs. full body), each script call, each user interaction, rough token cost per step.
4. Score against rubric. Append new findings to `gaps.md` with severity and a concrete fix.
5. Do **not** edit the command doc in the same pass. Findings first, DM approves, then fix.

## Persona Harness

Interactive commands (/session, /region) are audited against a **persona agent** standing in for the DM, so the main thread can execute the command end-to-end without real user input. Personas live in `commands/<command>/personas/<name>.md` and must stay stable across runs — changing a persona invalidates before/after comparisons.

Spawn mechanics (HARD CONSTRAINTS header, fresh-spawn-per-checkpoint, haiku, `tool_uses: 0` verification) live once in `personas/_shared.md` — read it before any persona spawn; persona files carry only character and behavior. Rationale: findings H1/H2 in `runs/2026-06-09-session.md`.

Persona roster — each targets a distinct bug class:

- `dm-basic` — happy path: compliance + token cost baseline (frozen since run 1)
- `dm-vague` — under-specification: defaults, re-asking, mind-change rework, casual free-entity-rule trips
- `dm-suggestive` — over-specified flavor / under-specified structure: creative integration, motif→canon mapping, mystery pressure

## Fixture Rules

If an audit needs frozen sample entities, put them in `commands/<command>/fixtures/`. Constraints:

- Fixture filenames must not collide with any real entity name in `data/`, `historian/`, or `scheduler/` — prefix with `fixture-`.
- Fixtures are excluded from `validate.ps1` and the semantic index. Never link to a fixture from real campaign files.

## Spec Template

```markdown
# Spec: /<command>

## Trigger
What invokes it; arguments.

## Required scripts
Scripts that MUST run before any manual file reads, in order.

## Read budget
- Frontmatter-only allowed: <patterns>
- Full-body allowed: <patterns, with justification>
- Hard cap: <n> file reads before declaring scope to the user.

## Interaction checkpoints
Points where the command must pause for DM input. Anything else: no questions.

## Output contract
Exact shape of what the command produces (format, files written, where).

## Out of scope
Things the command must NOT do (writes, index rebuilds, cross-campaign pulls).
```

## Run Log Template

```markdown
# Run: /<command> — YYYY-MM-DD

## Trace
One line per tool call: `<n>. <tool> <target> — <frontmatter|body|script> — ~<tokens>`

## Deviations from spec
What the command doc forced that the spec forbids, or vice versa.

## Totals
Reads: <n> (body: <n>, frontmatter: <n>) | Scripts: <n> | Questions to user: <n> | Est. tokens: <n>
```
