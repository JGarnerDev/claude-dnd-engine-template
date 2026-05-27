---
name: "Heroism"
type: spell
exists: false
state: known
tags:
  - spell
  - spell/enchantment
level: 1
school: enchantment
casting_time: "1 action"
range: "Touch"
components:
  - V
  - S
duration: "Concentration, up to 1 minute"
concentration: true
effect: "A willing creature you touch is imbued with bravery. Until the spell ends, the creature is immune to the frightened condition and gains temp HP equal to your spellcasting modifier at the start of each of its turns. At higher levels: +1 creature per slot level above 1st."
available_to:
  - Bard
  - Paladin
description: "Level 1. Concentration. Touch ally: frightened immunity + temp HP per turn equal to spellcasting mod."
---

Heroism provides both crowd-control immunity (frightened is common from Strahd and undead) and a continuous temp HP buffer. The temp HP stack is particularly strong for a melee frontliner facing constant hits. Concentration cost is the main drawback. Scales to multiple allies at higher levels.
