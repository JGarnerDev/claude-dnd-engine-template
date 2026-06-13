---
name: "Counterspell"
type: spell
exists: true
state: known
tags:
  - spell
  - spell/abjuration
level: 3
school: abjuration
casting_time: "1 reaction, taken when a creature within 60 feet casts a spell"
range: "60 feet"
components:
  - S
duration: "Instantaneous"
concentration: false
effect: "Interrupt a creature casting a spell within 60 feet. Automatically succeeds against spells of 3rd level or lower. For higher-level spells: Arcana check (DC 10 + spell's level) to succeed. At higher levels: auto-succeeds against spells up to the slot level used."
available_to:
  - Wizard
  - Sorcerer
  - Warlock
description: "Reaction. Auto-counter spells 3rd level or lower. Arcana check (DC 10 + spell level) for higher."
---

Counterspell is one of the most powerful defensive reactions in 5e — the ability to simply negate an enemy's spell. Against spells of 3rd level or lower, it succeeds automatically. Higher-level spells require an Arcana check, but can be countered by casting Counterspell at a higher slot level.
