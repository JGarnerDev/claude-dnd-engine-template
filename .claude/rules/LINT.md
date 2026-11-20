---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
  - "**/*.mjs"
  - "**/*.cjs"
  - "**/*.py"
---

# Lint rules

The pre-commit hook formats staged code (Prettier, `ruff format`) and lints it (oxlint, `ruff check`). Lint errors block the commit. Configs: `.oxlintrc.json`, `ruff.toml`, `.prettierrc.json`, all shared across Jeff's projects.

Run by hand:

- JS/TS: `npm run lint`, `npm run format`
- Python: `uvx ruff@0.17.6 check --fix .`, `uvx ruff@0.17.6 format .`

**When you fix a lint error, add a line below** on how to write the code so it doesn't come back: the rule id, then what to do instead. Write code that follows these from the start. If an entry would help every project, also add it to the hub starter's copy (`Organized/.claude/skills/new-project/starter/.claude/rules/LINT.md`).

## How to avoid each error

- `ruff B007` (loop variable not used): name it `_` or `_name`.
- `ruff B023` (closure doesn't bind the loop variable): bind it as a default argument, `lambda m, note=note: ...`, or pass it in, so the closure keeps this iteration's value.
- `ruff E731` (lambda assigned to a name): write a `def`.
- `ruff B904` (raise inside `except` loses the cause): `raise NewError(...) from e`, or `from None` when the cause is noise.
- `react(refs)` (ref read or written during render): for a "latest callback", use `useEffectEvent`, not a ref set each render (`useKeys`, `Slides`). `usePanel` returns its refs beside `PanelApi`: destructure them (`const { search, body, ...p } = usePanel(resolve)`) and pass each as its own prop, never `ref={p.search}`.
- `react-hooks(exhaustive-deps)`: deps are plain names; compute an expression into a variable first (`const followed = follows ? ctx : null;`).
- `eslint(no-control-regex)`: markdown placeholder sentinels use Private Use characters (`\uE000`…), not control characters.
