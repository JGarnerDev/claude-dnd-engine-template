---
name: "Witch Bolt"
type: spell
exists: true
state: known
tags:
  - spell
  - spell/evocation
level: 1
school: evocation
casting_time: "1 action"
range: "30 feet"
components:
  - V
  - S
  - M
material_component: "A twig from a tree that has been struck by lightning"
duration: "Concentration, up to 1 minute"
concentration: true
effect: "Ranged spell attack. On hit: 1d12 lightning damage and the target is linked until the spell ends. On your next turns, use an action to deal 1d12 lightning damage automatically (no attack roll). Spell ends if target moves out of 30-foot range or you use your action for something else. At higher levels: +1d12 per slot level above 1st."
available_to:
  - Sorcerer
  - Warlock
  - Wizard
description: "Level 1. Concentration. Initial 1d12 lightning attack; 1d12 lightning each subsequent turn automatically (must use action and stay in 30 ft)."
---

Witch Bolt is considered weak compared to other sustained damage options — the action cost each turn, concentration requirement, and 30-foot range limitation make it inferior to simply recasting other damage spells. The automatic damage after the initial hit is its primary appeal; the constraints largely negate it.
