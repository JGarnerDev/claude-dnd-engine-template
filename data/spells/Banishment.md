---
name: "Banishment"
type: spell
exists: true
state: known
tags:
  - spell
  - spell/abjuration
level: 4
school: abjuration
casting_time: "1 action"
range: "60 feet"
components:
  - V
  - S
  - M
material_component: "An item distasteful to the target"
duration: "Concentration, up to 1 minute"
concentration: true
effect: "Attempt to send one creature to another plane. Target must make a Charisma save. On fail: if native to this plane, banished to a harmless demiplane, incapacitated until the spell ends (returns to within 10 feet of original space). If not native (a fiend, elemental, etc.), banished to its home plane and doesn't return if concentration is maintained for 1 full minute. At higher levels: one additional creature per slot above 4th."
available_to:
  - Cleric
  - Paladin
  - Sorcerer
  - Warlock
  - Wizard
description: "Level 4. Concentration, 1 min. One creature: Charisma save or banished. Non-native creatures permanently banished if concentration held 1 min."
---

Banishment removes the single most dangerous target from a fight — the action economy impact of a creature spending 10 rounds doing nothing is equivalent to killing it. Against extraplanar creatures (devils, demons, elementals), sustained concentration permanently removes them. In Barovia, useful against Strahd's fiendish servants; against Strahd himself (native to Barovia), it provides only temporary removal.
