Generate a creative text pitch — no files, no schema, no entity creation. Pure flavor and ideas.

**Arguments (all optional):**
- `--type <value>` — what to pitch: `campaign`, `region`, `town`, `npc`, `antagonist`, `faction`, `dungeon`, `encounter`, `hook` (default: `campaign`)
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

1. **What are we pitching?** Campaign, region, town, NPC, antagonist, faction, dungeon, encounter, or something else?
2. **Tone?** Dark/gritty, whimsical, political, horror, mystery, epic — or describe it.
3. **Setting or context?** Any geographic, environmental, or narrative constraints to build within?
4. **How many options?** One focused pitch or a few to choose from?

If some arguments are provided, only ask about what's missing and genuinely ambiguous. Do not ask about optional parameters that have sensible defaults.

---

## Phase 2 — Read Context (unless `--no-read`)

Read the minimum needed to make the pitch feel coherent with the campaign:

- If `--party` is set or implied: pull party info from memory (names, level, current location, afflictions if any)
- If `--tone` not set: check `meta/worldbuilding.md` frontmatter only — grab `tone` and `themes`
- Do not read historian, sessions, missions, or act files unless the user explicitly asks for continuity with current story

---

## Phase 3 — Generate Pitch

Write the pitch as flowing prose. Structure depends on `--type`:

**campaign:** Region/setting thumbnail → central conflict → what makes it fresh → how the party fits in

**region:** Name, geography/feel, what makes it distinctive, 1–2 rumors or open questions

**town:** Name, physical description, social character, 2–3 NPC sketches (name + one-liner), 1 hook or tension

**npc:** Name, appearance/first impression, what they want, what they hide, one memorable detail

**antagonist:** Name, what they want, why they're dangerous, how they'll first appear to the party

**faction:** Name, what they believe or control, internal tension, how they see outsiders

**dungeon:** Name, origin/history thumbnail, atmosphere, 2–3 notable features or hazards, the prize

**encounter:** Setup, stakes, 1–2 complications, what success and failure look like

**hook:** A single evocative opening scenario — where the party is, what they see, what they're about to step into

If `--count` > 1, label each option clearly (Option A, Option B, etc.) and make them meaningfully distinct — different tones, different angles, not variations on the same idea.

If `--scale brief`, compress each element to 1–3 sentences. If `--scale full`, give each element a full paragraph.

---

## Phase 4 — Offer Next Steps

After the pitch, offer one line:

> "Want to develop any of these further, or formalize one as an entity?"

Do not proceed unless the user responds affirmatively.
