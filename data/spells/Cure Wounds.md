---
name: "Cure Wounds"
type: spell
exists: false
state: known
tags:
  - spell
  - spell/evocation
level: 1
school: evocation
casting_time: "1 action"
range: "Touch"
components:
  - V
  - S
duration: "Instantaneous"
concentration: false
effect: "Touch a living creature to restore 1d8 + spellcasting ability modifier HP. No effect on undead or constructs. At higher levels: +1d8 per spell slot level above 1st."
available_to:
  - Cleric
  - Druid
  - Paladin
  - Ranger
  - Bard
description: "Touch heal: 1d8 + spellcasting mod HP. +1d8 per level above 1st. No effect on undead."
---

The foundational healing spell. A touch-range restore of 1d8 + spellcasting ability modifier HP, scaling solidly with higher spell slots.

Notably ineffective on undead and constructs.
