---
name: "Hold Person"
type: spell
exists: true
state: known
tags:
  - spell
  - spell/enchantment
level: 2
school: enchantment
casting_time: "1 action"
range: "60 feet"
components:
  - V
  - S
  - M
material_component: "A small, straight piece of iron"
duration: "Concentration, up to 1 minute"
concentration: true
effect: "One humanoid within range must succeed on a Wisdom save or be paralyzed. Target repeats the save at the end of each of its turns. Attacks against a paralyzed creature have advantage; melee hits within 5 feet are automatic critical hits. At higher levels: +1 additional target per spell slot level above 2nd."
available_to:
  - Bard
  - Cleric
  - Druid
  - Sorcerer
  - Warlock
  - Wizard
description: "Concentration. Paralyze 1 humanoid (Wisdom save). Attacks have advantage; melee hits auto-crit."
---

Hold Person is a high-ceiling control spell. Paralyzed humanoids fail Strength and Dexterity saves, attacks against them have advantage, and melee hits automatically crit — enabling massive burst damage if the initial Wisdom save fails.

Limitation: only affects humanoids. Against Barovia's undead, fiends, and beasts, it has no effect — but it remains powerful against cultists, enemy spellcasters, and werewolves in humanoid form.
