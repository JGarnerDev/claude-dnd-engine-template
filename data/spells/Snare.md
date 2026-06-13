---
name: "Snare"
type: spell
exists: true
state: known
tags:
  - spell
  - spell/abjuration
level: 1
school: abjuration
casting_time: "1 minute"
range: "Touch"
components:
  - S
  - M
material_component: "25 feet of rope, which the spell consumes"
duration: "8 hours"
concentration: false
effect: "Lay a magical trap on the ground covering a 5-foot-square area. The trap is invisible and triggers when a Tiny or larger creature walks over it (Dexterity save). On fail: restrained for 1 hour. Can make a Strength check (DC = your spell save DC) to escape. Activates once, then gone."
available_to:
  - Druid
  - Ranger
  - Wizard
description: "Level 1. Lay an invisible 5-ft trap that restrains triggering creatures for 1 hour (Dex save). 8-hour duration."
---

Snare is a defensive utility spell for setting up ambushes, guarding rest areas, or creating tactical chokepoints. The restrained condition (speed 0, disadvantage on attacks, advantage on attacks against them) is powerful if the trap triggers. Primarily valuable in exploration and pre-encounter preparation.
