---
name: "Fear"
type: spell
exists: true
state: known
tags:
  - spell
  - spell/illusion
level: 3
school: illusion
casting_time: "1 action"
range: "Self (30-foot cone)"
components:
  - V
  - S
  - M
material_component: "A white feather or the heart of a hen"
duration: "Concentration, up to 1 minute"
concentration: true
effect: "Project a phantasmal image of a creature's worst fears. Each creature in a 30-foot cone must make a Wisdom save. On fail: frightened and must use its movement to move as far from you as possible. Can't willingly move closer to you while frightened. At end of each of its turns, target can repeat the save if there is no line of sight to you. On success, spell ends for that creature."
available_to:
  - Bard
  - Sorcerer
  - Warlock
  - Wizard
description: "Level 3. Concentration, 1 min. 30-ft cone: Wisdom save or frightened and forced to flee. Repeatable save without line of sight."
---

Fear is a powerful crowd control spell — the forced-flee component removes enemies from melee entirely, and frightened (disadvantage on attacks, checks) compounds the effect even if they can't flee further. Multi-target AoE makes it efficient against groups. No line of sight breaks the condition, so terrain matters. In tight dungeon corridors, fleeing enemies often can't escape line of sight.
