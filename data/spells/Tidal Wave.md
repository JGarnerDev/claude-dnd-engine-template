---
name: "Tidal Wave"
type: spell
exists: true
state: known
tags:
  - spell
  - spell/conjuration
level: 3
school: conjuration
casting_time: "1 action"
range: "120 feet"
components:
  - V
  - S
  - M
material_component: "A drop of water"
duration: "Instantaneous"
concentration: false
effect: "Conjure a wave of water in a 30-foot long, 10-foot wide, 10-foot tall line. Each creature in the area must make a Dexterity save: 4d8 bludgeoning damage on fail (half on success). Creatures who fail are knocked prone. The water spreads over the ground in the affected area, making it difficult terrain until cleared."
available_to:
  - Druid
  - Sorcerer
  - Wizard
description: "Level 3. 30x10x10 ft line: 4d8 bludgeoning (Dex save) + prone on fail. Leaves difficult terrain. No concentration."
---

Tidal Wave is a no-concentration AoE with prone on top — 4d8 bludgeoning plus prone affects multiple targets in a 30-foot line without concentration, freeing up a slot for control spells. Prone (speed halved, attacks at disadvantage, melee attacks against them at advantage) is a strong secondary effect. The difficult terrain persists. Useful when concentration is already committed to Haste, Web, or similar spells.
