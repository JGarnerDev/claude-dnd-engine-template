---
name: "Infestation"
type: spell
exists: true
state: known
tags:
  - spell
  - spell/conjuration
level: 0
school: conjuration
casting_time: "1 action"
range: "30 feet"
components:
  - V
  - S
  - M
material_component: "A living flea"
duration: "Instantaneous"
concentration: false
effect: "Fleas or similar insects swarm one creature within range. Target must succeed on a Constitution save or take 1d6 poison damage and move 5 feet in a random direction (if it can move and the space is unoccupied). Movement doesn't provoke opportunity attacks. Damage increases at 5th (2d6), 11th (3d6), 17th (4d6)."
available_to:
  - Druid
  - Sorcerer
  - Warlock
  - Wizard
description: "Cantrip. 1d6 poison (Con save) + target moves 5 ft in random direction on fail."
---

Infestation deals modest damage with a chaotic repositioning effect on failed saves. The random movement can break enemy formations, push enemies into hazards, or disrupt concentration (as a secondary effect of movement). Situationally useful in tight tactical scenarios.
