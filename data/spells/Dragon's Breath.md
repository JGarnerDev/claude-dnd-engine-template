---
name: "Dragon's Breath"
type: spell
exists: true
state: known
tags:
  - spell
  - spell/transmutation
level: 2
school: transmutation
casting_time: "1 bonus action"
range: "Touch"
components:
  - V
  - S
  - M
material_component: "A hot pepper"
duration: "Concentration, up to 1 minute"
concentration: true
effect: "Touch a willing creature. Until the spell ends, the creature can use an action to exhale energy in a 15-foot cone. Each creature in the cone makes a Dexterity save (DC = your spell save DC). On fail: 3d6 damage. Half on save. Choose the damage type when casting: acid, cold, fire, lightning, or poison. At higher levels: +1d6 per slot level above 2nd."
available_to:
  - Sorcerer
  - Wizard
description: "Level 2. Concentration, 1 min. Grant a creature a 15-ft cone breath weapon (3d6, Dex save, choice of damage type)."
---

Dragon's Breath converts a melee ally into a sustained area damage dealer — they spend their action each turn for 3d6 damage in a cone, which scales with slot level. Best on creatures with no strong action economy (familiars, pets, or martial allies who have bonus action attacks but flexible actions). Fire damage is most common; lightning or cold for type coverage.
