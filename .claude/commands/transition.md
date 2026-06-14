Guide a campaign transition — from the current campaign to a new homebrew world.

Do not begin this flow until the DM explicitly confirms the transition is happening. Ask one clarifying question at a time. Do not write anything without confirmation at each step.

---

## Phase 1 — Confirm and Name

Ask:
1. "Confirmed — are we doing the transition now, or just planning ahead?"
2. If now: "What's the name of the new world or campaign? (Can be a placeholder if unnamed yet.)"

Wait for answers before continuing.

---

## Phase 2 — Audit What Crosses Over

Read `historian/characters/pcs/` — list all PCs and companions. Ask the DM:

> "These characters are crossing over to the new world. Anyone staying behind, dying in the transition, or getting left in the old campaign?"

Also ask:

> "Any NPCs, items, or factions from the old campaign explicitly coming with the party? List them and I'll update their tags."

Wait for the DM's response. Note which entities cross over vs. stay tagged to the old campaign.

---

## Phase 3 — Update Tags

For each entity confirmed as crossing over:
- Remove the old `campaign: <old-name>` tag and replace with `campaign: <new-name>` (or remove tag entirely if campaign-agnostic)

For each entity staying behind:
- Leave the old `campaign: <old-name>` tag unchanged

For the party PCs and companions confirmed as crossing: update their historian files now. Show the DM the list of changes before writing.

---

## Phase 4 — Update Campaign File

Campaign files live in `scheduler/campaign/` — one per campaign. Read both the concluding campaign file (`state: active`) and the successor file (`state: draft`). Propose updates:
- Concluding campaign: `state` → `completed` and `active` → `false`, then move to `historian/campaign/` (create the folder on first use — read `meta/graph-settings.md` before adding it, and work with the DM to fill the historian-side fields as they start using them)
- Successor campaign: `state` → `active` and `active` → `true` (both fields must flip — scripts key on `state`, but the `active` boolean exists in the frontmatter and must not contradict it)
- Successor `description` → brief new world premise (ask DM for 1–2 sentences)
- Successor `tone`, `themes` → ask if these are changing or carrying over. **Tone reset:** before writing these, read `meta/worldbuilding.md`'s "What to Avoid" list — it explicitly forbids a prior campaign's genre bleeding forward (the old campaign is a chapter, not the world's identity). Check the proposed tone/themes against every avoid-list item and flag any carry-over that violates one.
- Reset or archive active act/mission references

Do not write until DM approves the proposed content.

---

## Phase 5 — Scaffold New Act

Create a new Act 1 placeholder in `scheduler/acts/` for the new campaign. Use the same placeholder structure as a standard Act 1, with fields for the DM to fill in:
- `central_conflict: TBD`
- `goal: TBD`
- `opening_state: TBD`
- `closing_state: TBD`

Ask the DM: "Should I create the new Act 1 scaffold now, or wait until you're ready to fill it in?"

---

## Phase 6 — Index and Wrap Up

After all file changes are confirmed and written:
1. Remind the DM to rebuild the semantic index: `py -3.10 scripts\index-entities.py`
2. Summarize what changed: entities retagged, campaign file updated, new act scaffolded
3. Note any old-campaign entities the DM flagged as potential crossovers but left unresolved — list them as open items

---

**Throughout:** Never write silently. Each phase ends with a confirmation before the next begins. The DM may pause mid-transition and resume later — that's fine.
