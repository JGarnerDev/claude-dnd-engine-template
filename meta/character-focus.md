---
type: meta
tags: [guideline]
spotlight_target: 0.5
cold_start_sessions: 3
rotation_window_sessions: 4
---

# Character Focus & Spotlight

How the campaign balances *individual-character* story focus against everything else. The
goal: every player's character gets time in the sun — backstory, values, goals surfacing in
both big payoffs and small touches — without the world bending so far toward the party that
it stops feeling like a living world. Surface the readouts below as light suggestions
during planning and recap; the DM picks or ignores. **Suggestions, never mandates** — same
discipline as [[literary-devices]]. "Overdue" informs; it does not dictate.

**Scope:** this measures *narrative* spotlight only — not combat/mechanical engagement or
table fun. A balanced ledger is necessary, not sufficient: a PC can be story-spotlit and
still bored in every fight, or mechanically dominant with no arc beats. Treat the numbers as
a lens on one axis, not a fun-meter.

## The Measured Axis: Spotlight vs Agnostic

Every story beat sits on one side of a single cut:

- **Spotlight** — individual-character focus. Either **solo** (one PC's backstory, values,
  or goals) or **shared** (a single thread advancing *two* PCs' arcs at once — a two-hander,
  not two parallel threads). Capped at two PCs; three or more is not spotlight.
- **Agnostic** — everything else, in two flavors that both sit on the non-spotlight side:
  - **party-centric** — the party *as a group* is the focus (chosen-ones, hunted together,
    the world reacting to them collectively).
  - **world** — plot indifferent to the party.

The campaign-long target is **50/50: individual focus vs everything else.** Most material
should stay agnostic in the normal course of play; a spotlight reads as a deliberate beat,
not the default. ("Character-driven / plot-driven" survive only as loose prose descriptors,
never the measured cut.)

### The two-PC shared cap

A shared beat advances exactly two PCs' *individual* arcs through one thread. Three or more
PCs in focus is party-centric (agnostic), not spotlight — flag any beat that tries to
spotlight 3+ PCs. Solo spotlight stays distinct and separately desirable; it is the fuller,
deeper turn.

**Two-PC-party tiebreak:** in a two-PC party, `shared` (both PCs) and `party-centric` (the
whole party) collapse. Classify by intent — two individual *arcs* advancing = `shared`; a
*collective* stake the party faces together = `party-centric`.

## Spotlight Weight

Beats are not equal. A dedicated three-tier scale measures the **narrative magnitude** of a
beat:

- **touch = 1** — a small character moment: a callback line, an NPC remembers their name.
- **beat = 3** — a real scene built on their arc: confronts the estranged mentor.
- **arc = 9** — a pivotal payoff: slays the tyrant father, saves the nation.

Geometric, so one arc ≈ 3 beats ≈ 9 touches. Weight applies to **every** beat, agnostic
ones (`party-centric` / `world`) included — so the balance denominator covers everything,
and "eats a pie, people clap" (touch) never offsets "slays the father" (arc).

This is a **dedicated** scale — *not* the `Scale:` ladder in [[literary-devices]], which
measures narrative *reach* (`scene | session | mission | arc | campaign`), a different axis.
Don't conflate them.

## Balance

*Cumulative, lifetime, never cleared.* The target is 50/50:

```text
balance = sum(spotlight + shared weight) / sum(all beat weight)  →  aim 0.5
```

A big arc payoff tilts the lifetime ledger spotlight-heavy, so the campaign then *owes*
agnostic material later — it self-corrects. Act and campaign finales (intentionally
party-focused = agnostic) help rebalance; this is why we never clear the tally.

Alongside the lifetime number, a **recent-trend** readout over the **last 4 played sessions**
keeps the nudge actionable, since the lifetime figure moves slowly late-campaign. The trend
needs **≥ 4 sessions** to compute; until then it stays suppressed. Lifetime = the goal;
trend = what to lean this week.

## Rotation

Sharing focus across PCs so none is favored or starved. Measured as a per-PC **turn tally
over a rolling 4-session window**:

- solo spotlight ≥ beat tier = **1.0 turn**
- shared spotlight ≥ beat tier = **0.5 turn** (credited to *both* PCs)
- touches do **not** count toward rotation — only ≥ beat

The PC with the fewest turns *in that window* is "next up / overdue." The window matters: a
lifetime tally would let an Act-1 favorite mask later starvation, but rotation is about
*recent* fairness.

- **Present-only** — counts only sessions the PC was actually at the table.
- **Player rollup** — the fairness check rolls up to the **player**, not the character, so a
  player with multiple PCs or a reroll isn't double-counted as starved.
- **Appetite** — each PC carries `spotlight: normal | low`. A `low`-appetite player (there
  for tactics, not arcs) is never flagged "overdue" and is excluded from the rotation check.

## Shared-Beat Accounting

A two-hander counts **once** toward Balance (its weight added a single time) but credits
Rotation for **both** PCs at 0.5 each. Solo stays the distinct, fuller turn.

## Attendance

Inferred from who appears in the recap. **Never silently assume absence** — when a PC
doesn't appear, ask the DM "absent, or just quiet this session?" before excluding them.
Present-but-quiet still counts as present.

## Cold Start

The ledger stays **inert until ≥ 3 played sessions** exist. Until then, readouts say
*"insufficient history — spotlight balance not yet meaningful"* rather than show a misleading
number. A PC with no `spotlight_hooks:` is flagged for a backstory pass regardless of session
count.

## Spotlight Hooks

Each PC file carries a queryable `spotlight_hooks:` frontmatter list — fear/wound/goal/
unresolved-thread material `pc-backstory` already gathers, made addressable. Each hook is
`{ hook, status: open | seeded | paid }`:

- **open** — captured, not yet planned into a session.
- **seeded** — `/session` committed the upcoming session to it (breadcrumbs placed).
- **paid** — the beat landed in play; `/recap` advances `seeded → paid`.

`/session` reads these to propose 1–2 concrete opportunities for the overdue, present,
normal-appetite PC — biased by balance (lean agnostic when the campaign owes it). A PC with
no hooks surfaces as *"needs a backstory pass,"* not a dead nag. Without this field the whole
feature is inert.

## How the Engine Uses This

- **`/session` Phase 1** carries a spotlight readout next to the drought counter — lifetime
  balance, recent trend (≥ 4 sessions), and the overdue PC — via `spotlight-balance.ps1`.
- **`/session` planning** reads `spotlight_hooks:`, surfaces opportunities, and marks a hook
  `open → seeded` when the plan commits to it. Honors "never force."
- **`/recap`** runs a per-scene tagging pass: classify + weight **every** beat (touches
  included), note PC(s), advance planned hooks `seeded → paid`, confirm any suspected absence
  with the DM, and flag any beat naming 3+ PCs.
- **`/todo`** surfaces flags: overdue PC, missing hooks, starvation.

Read once per task, not re-read per sub-task or per entity.
