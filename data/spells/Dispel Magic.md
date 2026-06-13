---
name: "Dispel Magic"
type: spell
exists: true
state: known
tags:
  - spell
  - spell/abjuration
level: 3
school: abjuration
casting_time: "1 action"
range: "120 feet"
components:
  - V
  - S
duration: "Instantaneous"
concentration: false
effect: "End one spell of 3rd level or lower on a target automatically. For higher-level spells: Arcana check (DC 10 + spell's level) to dispel. At higher levels: auto-dispels spells up to the slot level used."
available_to:
  - Bard
  - Cleric
  - Druid
  - Paladin
  - Sorcerer
  - Warlock
  - Wizard
description: "End one spell 3rd level or lower automatically. Arcana check (DC 10 + level) for higher."
---

Dispel Magic removes ongoing magical effects from a target — spells, enchantments, magical conditions. Auto-succeeds against 3rd-level and lower effects; higher-level effects require an Arcana check.
