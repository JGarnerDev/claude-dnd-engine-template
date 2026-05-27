---
name: "Hold Monster"
type: spell
exists: false
state: known
tags:
  - spell
  - spell/enchantment
level: 5
school: enchantment
casting_time: "1 action"
range: "90 feet"
components:
  - V
  - S
  - M
material_component: "A small straight piece of iron"
duration: "Concentration, up to 1 minute"
concentration: true
effect: "Choose a creature within range. It must make a Wisdom save. On fail: paralyzed for the duration. At end of each of its turns, the target can make another Wisdom save. On success, the spell ends for that creature. At higher levels: one additional creature per slot level above 5th."
available_to:
  - Bard
  - Sorcerer
  - Warlock
  - Wizard
description: "Level 5. Concentration, 1 min. Any creature (not just humanoids): Wis save or paralyzed. Repeat save each turn."
---

Hold Monster is the single-target paralysis spell with no creature-type restriction — unlike Hold Person (humanoids only), this works on undead, beasts, fiends, and aberrations. Paralyzed is one of the most severe conditions (can't move or act, attacks against it are automatic critical hits within 5 feet). In Barovia, this can paralyze Strahd, vampire spawn, or any enemy regardless of type, setting up devastating follow-up attacks with guaranteed crits.
