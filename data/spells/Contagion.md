---
name: "Contagion"
type: spell
exists: false
state: known
tags:
  - spell
  - spell/necromancy
level: 5
school: necromancy
casting_time: "1 action"
range: "Touch"
components:
  - V
  - S
duration: "7 days"
concentration: false
effect: "Touch a creature. It makes a Constitution save. On fail: poisoned. At the end of each of the target's turns, it repeats the save. After failing three saves, the disease takes hold for 7 days (no more saves). After succeeding three saves, the spell ends. Diseases include Blinding Sickness (disadvantage on Wisdom checks/saves, blinded), Filth Fever (disadvantage on Strength checks, saves, and attack rolls), Flesh Rot, Mindfire (Int disadvantage, Wisdom disadvantage), Seizure, Slimy Doom."
available_to:
  - Cleric
  - Druid
description: "Level 5. Touch: Con save or poisoned; 3 failed saves = 7-day disease. 3 successes = spell ends."
---

Contagion is a long-burn incapacitation spell — once the disease takes hold after three failed saves, it runs for 7 days with no further saves, applying severe debuffs depending on the chosen disease. Blindness or Mindfire effectively removes a creature from most tactical situations. The "three-save" ramp-up period means it takes multiple rounds to fully activate, making it less suited to short fights but devastating in extended encounters or against boss creatures.
