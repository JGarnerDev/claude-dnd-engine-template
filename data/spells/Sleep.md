---
name: "Sleep"
type: spell
exists: true
state: known
tags:
  - spell
  - spell/enchantment
level: 1
school: enchantment
casting_time: "1 action"
range: "90 feet"
components:
  - V
  - S
  - M
material_component: "A pinch of fine sand, rose petals, or a cricket"
duration: "1 minute"
concentration: false
effect: "Creatures in a 20-foot radius sphere centered on a point fall into a magical slumber based on HP. Roll 5d8 — the total is how many HP of creatures are affected, starting from the lowest current HP. Sleeping creatures are unconscious. Undead and immune-to-charm creatures are unaffected. A sleeping creature wakes if damaged or shaken awake. At higher levels: +2d8 per slot level above 1st."
available_to:
  - Bard
  - Sorcerer
  - Wizard
description: "Level 1. Creatures in 20-ft sphere sleep based on HP total (5d8 HP affected). No concentration."
---

Sleep is extremely powerful at low levels — no save, no attack roll, just HP-based effect that renders creatures unconscious. Falls off as enemy HP pools grow, but at levels 1-4 it reliably drops minions and weaker creatures. No effect on undead (critically important in Barovia) or charm-immune creatures. Sleeping creatures can be killed outright (auto-crit and instant death on 2 failed death saves).
