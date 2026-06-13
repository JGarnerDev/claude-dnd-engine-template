---
type: meta
tags: [guideline]
default_attrition: standard
default_lethality: standard
---

# Difficulty Guidelines

Difficulty is a two-axis spectrum. **Attrition** and **lethality** are independent dimensions — a session can be grinding but safe, or short but deadly. When planning a session (`/session`), the DM picks one tier from each axis; if none is given, use the defaults in this file's frontmatter.

**Both axes describe combat, and combat is optional.** A session shaped roleplay-only is a valid plan, not a degenerate case of these axes — never invent encounters to fill a budget. For such a session the axes sit inert (the picks carry forward unused, the Rest Clock accrues zero rounds and still gets restamped at recap), and the operative difficulty dial is **Non-Combat Stakes** below.

## Party Profile
- **Level & size:** derived live, never hard-coded here. Source of truth is the `level` field in each PC's frontmatter (`historian/characters/pcs/`), surfaced by `party-status.ps1`. During `/session` orientation, state the derived level and party size and ask the DM to confirm. Each PC also carries `level_confirmed: <session number>` — restamped by every `/recap` — and `party-status.ps1` prints a LEVEL STALE warning when the stamp lags the latest played session, catching level-ups that missed canonization.
- **General power level:** <!-- are they optimized, casual, somewhere in between? -->

## Axis 1: Attrition

How much of the party's resource budget the adventuring day spends. 5e baseline assumption: 6–8 medium/hard encounters per long rest at ~3 rounds each — roughly **18–24 rounds of combat per long rest** — with ~2 short rests. Spell slots, hit dice, and HP are tuned to drain across that full day; a single fight on full resources lets the party nova and trivializes it.

**The budget belongs to the adventuring day, not the session.** Sessions are table-time slices; a session can open mid-day with the party already depleted. The live count of rounds and short rests since the last long rest is the **Rest Clock** — `### Rest Clock` block in the active campaign file's Current State, updated by every `/recap`, staleness-flagged by `session-brief.ps1`. When planning, remaining budget = tier budget − rounds on the clock. A depleted party also fights as if lethality were one tier higher — pushing past budget is a deliberate difficulty escalation, not a rounding error.

Tiers (rounds of combat per long rest):

- **Light** — ~6–10 rounds. 1–3 encounters. Party ends the day with most resources intact. Use for roleplay-heavy or travel sessions where combat is punctuation, not pressure.
- **Standard** — ~18–24 rounds. The DMG baseline. Resource management matters; the party should feel the squeeze by the last encounter.
- **Grinding** — 30+ rounds. Dungeon crawls, sieges, forced marches. Danger comes from depletion, not any single fight. Short rest access becomes a meaningful tactical question.

## Long Rest Rules

A long rest is what resets the Rest Clock — so when one can be *offered* is a difficulty lever, not a free button. Default 5e (2014 PHB), which this campaign uses unless the DM overrides:

- **Duration:** 8 hours — ~6 hours sleep + up to 2 hours light activity (reading, talking, eating, keeping watch).
- **Once per 24 hours:** a character benefits from only one long rest per 24-hour period, and must have at least 1 hour since the *end* of the last long rest before starting another. This is the gate `/session` enforces with the in-world clock.
- **Interruption:** ≥1 hour of strenuous activity (walking, fighting, casting spells, taking damage) breaks the rest — it must restart for any benefit. A planned rest in unsafe territory is therefore a *scene*, not a guaranteed reset (interrupted-rest encounters are valid attrition content).
- **0 HP:** a character who began the rest with 0 HP gets no benefit.

**Pacing variants** (DMG): gritty realism = long rest needs 7 days; epic heroism = 1 hour. If the DM switches variants, note it in the Rest Clock block — the 24-hour gate scales with it.

**What `/session` must honor:** never offer or assume a long rest unless (a) ≥24 in-world hours since the last long rest started, (b) the location is safe enough for 8 uninterrupted hours, and (c) no PC is sitting at 0 HP. When any condition fails, plan the rest as a scene with stakes (or a short rest) rather than a clean reset. Track in-world time across travel legs and downtime so this gate is always computable.

## Axis 2: Lethality

How capable the monsters are of actually killing a PC. Measured by two numbers and one behavior dial:

- **Rounds-to-down (RTD)** — average PC HP ÷ combined monster damage-per-round when focused on one target. RTD 1 means the encounter can drop a PC every round; RTD 4+ means chip damage only.
- **Spike** — maximum plausible single-round damage against one PC, compared to PC max HP. The instant-death rule triggers when damage ≥ remaining HP + max HP. Save-or-suck riders (paralysis, banishment, hold person) count as spike even without damage.
- **Tactics** — the free lever. Focus fire, attacking downed PCs, intelligent target selection (casters first). The same statblock swings an entire tier on tactics alone.

Tiers:

- **Soft** — RTD 4+, no spike threats, monsters spread damage and ignore downed PCs. Combat as spectacle and resource tax. PC death effectively off the table.
- **Standard** — RTD 2–3 in the hardest fight of the day, occasional spike from a boss, monsters fight credibly but don't kill-confirm. Death possible through bad luck or bad play, not by design.
- **Dangerous** — RTD 1–2 in set-piece fights, real spike threats, smart target selection. Downed PCs draw opportunistic attacks. The party should retreat from at least one fight they can't win.
- **Lethal** — RTD 1 available to the encounter, spike capable of instant death, full kill-confirm tactics. PC death is an expected campaign outcome, not an accident.

## How `/session` Uses This

1. Resolve the two tier picks **after the story hook is chosen** (`/session` Phase 4 scoping): DM prompt override > DM's scoping answer > frontmatter defaults. Propose tiers that fit the hook and flag discrepancies both ways — a story whose implied intensity contradicts the picked tiers gets reshaped or the tiers get changed, never silently bent. If the session shape is roleplay-only, skip steps 2–4 — plan against Non-Combat Stakes instead, and the Rest Clock simply carries forward unchanged.
2. **Attrition tier** sets the round budget for the adventuring day; subtract the Rest Clock's rounds-since-long-rest to get this session's budget. Near-zero remainder means the long rest is the content — plan it as a scene (interrupted rests included), or push past budget as a deliberate lethality bump.
3. **Lethality tier** sets CR targets and statblock selection (via `monster-lookup.ps1`), plus a tactics note in each encounter writeup (focus fire? kill-confirm? retreat triggers?).
4. Sanity-check with RTD math against the Party Profile above — XP-threshold tables (DMG 2014) run inaccurate at high levels and against optimized parties. Use the XP budget as a first pass only; tune by RTD and rounds-per-rest.

## Skill Challenge DCs

- **Easy** —
- **Medium** —
- **Hard** —
- **Very Hard** —
- **Nearly Impossible** —

## Non-Combat Stakes

The third dial, and the only one that applies to roleplay-only sessions. Where the combat axes measure resource drain and kill capacity, this measures how consequential social, exploration, and roleplay choices are — what a failed persuasion, a broken promise, or a missed clue actually costs.

<!-- How consequential should social, exploration, and roleplay choices be? -->
<!-- e.g. "mistakes should have real consequences but rarely be permanent" -->
