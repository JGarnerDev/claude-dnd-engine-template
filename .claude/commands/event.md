Generate world events — political, social, economic, or military shifts that could reshape the campaign world. Draws from the pool in `data/world-events-pool.md`, AI generation, or both.

**Arguments:**

- `[count]` — number of events to generate (default: 3; ignored if description provided)
- `[description]` — if text (not a number), develop that specific event rather than random selection
- `--scale local|regional|global` — filter or target scale (default: mixed)
- `--add` — add one or more events to the pool; skips generation
- `--from-pool` — only pull from existing pool entries, no AI generation
- `--ai` — only AI-generate; skip pool

---

## Behavior

Output is **text only** — names, setups, and outcomes. No YAML, no entity files. Events are inspiration and possibility until the DM commits.

---

## Phase 1 — Parse Arguments

Three modes:

1. **Random** (no args or just a count): select N events with variety of scale
2. **Specific** (text description provided): develop that event with full context
3. **Add** (`--add`): add one or more events to the pool; skip to Add Mode

---

## Phase 2 — Read Context

Always read `data/world-events-pool.md`.

If AI generation is needed (pool empty or sparse, `--ai` flag, or specific description provided):

- Run `.\scripts\pitch-brief.ps1` for campaign tone and themes
- Note any player-contributed material relevant to the event's scale or type

---

## Phase 3 — Select or Generate

**From pool:**

- **Specific description mode** (text description provided): run semantic search on that description to surface the most relevant pool entries before deciding on generation vs. pool use:

  ```powershell
  .\scripts\semantic-search.ps1 -Query "<event description>" -K 5
  ```

  Prefer pool matches with score > 0.40 over AI generation — the pool exists to be used. If no strong matches, proceed to AI generation.
- **Random mode** (no description): randomly select entries. If `--scale` is set, filter first. For mixed-scale requests without a flag, ensure variety — aim for at least one local, one regional, one global when count ≥ 3.

**AI generation:** Ground events in campaign worldbuilding. Apply the same anti-archetype discipline as `/pitch` — avoid obvious defaults. Each event should feel specific to *this* world, not generic fantasy. When drawing on player-contributed lore, note which player's material shaped it.

**Mixed:** If pool has fewer entries than the requested count, fill the remainder with AI generation.

---

## Phase 4 — Present Events

For each event:

```markdown
### [N]. [Event Name] — [Scale]
*[pool | AI-generated | AI-generated, sourced from [player]'s material]*

**Setup:** What's happening or beginning to unfold.

**Outcomes:** How this reshapes the political, social, economic, or military landscape. 2–4 sentences.
```

When presenting mixed scales without a filter, vary order (don't cluster all globals together).

---

## Phase 5 — Post-generation Options

After presenting all events, offer one line:

> "Want to add any AI-generated events to the pool, develop one further, or commit one as a world entity?"

**Adding to pool:** After DM confirms, append approved events to `data/world-events-pool.md` in standard format. Do silently; report path when done.

**Developing further:** Expand the event's setup, involved factions, NPCs, or consequences. Text only — no files.

**Committing an event:** If the DM wants an event to actually happen in the world, begin entity creation. Read `meta/entity-creation.md`, then `meta/schemas/event.md`. Follow full entity creation protocol — confirm with DM before writing any file.

---

## Add Mode (`--add`)

Collect the following (conversationally, not as a form):

1. **Name** — what is this event called?
2. **Scale** — local, regional, or global?
3. **Contributed by** — which player, or `ai` if Claude-generated?
4. **Themes** — 1–3 tags (e.g. `trade`, `war`, `religion`, `plague`, `succession`)
5. **Setup** — what happens or begins?
6. **Outcomes** — what changes politically, socially, economically, or militarily?

Append to `data/world-events-pool.md` using the standard format. Confirm path when done. Multiple events can be added in one session — ask "Add another?" after each.
