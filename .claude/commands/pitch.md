Generate a creative text pitch — no files, no schema, no entity creation. Pure flavor and ideas.

**Arguments (all optional):**

- `--type <value>` — what to pitch: `campaign`, `region`, `town`, `npc`, `antagonist`, `faction`, `dungeon`, `encounter`, `hook`, `monster` (default: `campaign`)
- `--count <n>` — number of distinct options to present (default: 1)
- `--tone <value>` — e.g. `dark`, `whimsical`, `political`, `horror`, `mystery`, `epic` (default: infer from campaign if readable, else ask)
- `--setting <value>` — environmental/geographic context, e.g. `wetlands`, `mountain pass`, `port city`, `underdark` (default: infer or ask)
- `--hook <text>` — a specific narrative seed to build around (optional)
- `--party` — pull current party info from memory and weave party-specific flavor into the pitch
- `--scale brief|full` — `brief`: 1–3 sentences per element; `full`: paragraph per element (default: `full`)
- `--no-read` — skip all file reads; generate from scratch with no campaign context

---

## Behavior

Output is **text only**. No YAML, no wiki-links, no file writes. Pitches are disposable creative material — the DM decides later whether to formalize anything.

---

## Phase 1 — Gather Parameters

If no arguments are provided, ask the following before generating anything:

1. **What are we pitching?** Campaign, region, town, NPC, antagonist, faction, dungeon, encounter, monster, hook, or something else?
2. **Tone?** Dark/gritty, whimsical, political, horror, mystery, epic — or describe it.
3. **Setting or context?** Any geographic, environmental, or narrative constraints to build within?
4. **How many options?** One focused pitch or a few to choose from?

If some arguments are provided, only ask about what's missing and genuinely ambiguous. Do not ask about optional parameters that have sensible defaults.

---

## Phase 2 — Read Context (unless `--no-read`)

Run `.\scripts\pitch-brief.ps1 -Type <type>` — this replaces manual reads of `meta/worldbuilding.md` and `pitch-log/pitch-history.md`. It outputs tone, themes, and history filtered to the requested type only.

Additional reads:

- If `--party` is set or implied: pull party info from memory (names, level, current location, afflictions if any)
- If `--tone` is explicitly set: skip the script's tone output; use the provided value instead
- Do not read historian, sessions, missions, or act files unless the user explicitly asks for continuity with current story

Run semantic search to surface thematically matching pool entities that could seed the pitch:

```powershell
.\scripts\semantic-search.ps1 -Query "<type> <tone> <setting>" -Exists false -K 5
```

Scan results for contributed entities (`contributed_by` field) — prefer these as source material. Others may inspire names, details, or hooks. Do not force results into the pitch; use only what genuinely fits.

---

## Phase 3 — Generate Pitch

**Anti-archetype step (mandatory, do not skip):** Before writing each pitch, silently identify the most obvious, default version of the requested type — the first thing anyone would reach for. Then explicitly avoid it. If pitch history is loaded, treat every archetype listed there as also forbidden. The goal is for each generation to occupy different narrative space than everything that came before.

**Default flow — brief first, expand on request:**

Unless `--scale full` is set, run Steps 3a → 3b → 3c. If `--scale full` is set, skip to Step 3c directly for all pitches. If `--scale brief` is set, run Step 3a only and skip 3b and 3c.

**Step 3a — Brief summaries:**

Write each pitch as 1–3 sentences: name, the single sharpest thing about them, one hook or tension. Number each option (1, 2, 3…) even when `--count 1`. No full paragraphs yet.

When generating multiple pitches, make them meaningfully distinct — different tones, different angles, not variations on the same idea. **Spread across a directness spectrum:** at least one should be direct and confrontational, at least one more layered or oblique.

**Step 3b — Expansion prompt:**

After summaries, ask:

- If `--count 1`: "Want the full version?"
- If `--count` > 1: "Which to expand? (numbers, 'all', or skip)"

Wait for the user's response. Do not write anything further until they reply.

**Step 3c — Expand selected pitches:**

For each selected pitch, write full prose. Structure depends on `--type`:

**campaign:** Region/setting thumbnail → central conflict → what makes it fresh → how the party fits in

**region:** Name, geography/feel, what makes it distinctive, 1–2 rumors or open questions

**town:** Name, physical description, social character, 2–3 NPC sketches (name + one-liner), 1 hook or tension

**npc:** Name, appearance/first impression, what they want, what they hide, one memorable detail

**antagonist:** Name, what they want, why they're dangerous, how they'll first appear to the party. For humanoid antagonists, include race as part of the description — it shapes perception, culture, and first impression. Vary across the moral spectrum: some antagonists should have real depth and understandable motivation; others should be straightforwardly cruel, selfish, or monstrous — and that's enough. Don't default to complexity, and don't avoid it either. Match what serves the pitch. **Also vary fundamental nature** — antagonists need not be humanoid. Creatures, beasts, or entities operating on non-human drives are equally valid and often fresher. When generating multiple antagonists, treat nature (humanoid / creature / entity) as its own axis of diversity alongside moral complexity. For creature/beast/entity antagonists: if `data/monsters/` is populated, check it for an existing archetype to anchor the pitch to — use that creature type as the base rather than inventing a new one.

**faction:** Name, what they believe or control, internal tension, how they see outsiders

**dungeon:** Name, origin/history thumbnail, atmosphere, 2–3 notable features or hazards, the prize

**encounter:** Setup, stakes, 1–2 complications, what success and failure look like

**hook:** A single evocative opening scenario — where the party is, what they see, what they're about to step into

**monster:** Name, creature type, what makes this variant or encounter fresh (not just "it's a zombie"), habitat or lair thumbnail, one distinctive behavioral or tactical trait, one narrative hook or complication the party might discover

**Step 3d — Source Faithfulness Note (when player resources used):**

If the pitch drew on any `./data` entity with a `contributed_by` field, append a short note after the pitch output — whether brief (3a) or expanded (3c):

- One line: what was pulled directly from source material
- One line: biggest invention or unsupported inference (if any)
- Offer: "Want the full faithfulness breakdown?"

Keep it to 2–3 lines total. Skip if `--no-read` or if no player-contributed entities were referenced.

---

## Phase 4 — Save Pitch History

After Step 3a (briefs), append a 2–3 word archetype summary for each pitch to `pitch-log/pitch-history.md`. Do not wait for expansion. Format:

```text
- {type}: {archetype summary}
```

Examples: `- antagonist: cold bureaucrat`, `- npc: exhausted magistrate`, `- dungeon: collapsed mine`.

Keep no more than 20 entries per type — when a type exceeds 20, drop the oldest entries of that type only. Other types are unaffected. Create the file if it doesn't exist. Do this silently; do not mention it to the user.

---

## Phase 5 — Offer Next Steps

After Step 3c (expansion), offer one line:

> "Want to develop any of these further, or formalize one as an entity?"

If the DM wants to formalize: for event-type pitches, point to `/event --add`; for everything else, follow the entity creation protocol (read `meta/entity-creation.md` first).

Do not proceed unless the user responds affirmatively. Skip this phase if no expansion was requested.
