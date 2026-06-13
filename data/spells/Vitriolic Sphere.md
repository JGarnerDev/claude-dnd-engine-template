---
name: "Vitriolic Sphere"
type: spell
exists: true
state: known
tags:
  - spell
  - spell/evocation
level: 4
school: evocation
casting_time: "1 action"
range: "150 feet"
components:
  - V
  - S
  - M
material_component: "A drop of bile"
duration: "Instantaneous"
concentration: false
effect: "A globe of putrid acid arcs through the air to a point within range. All creatures within a 20-foot radius sphere must make a Dexterity save. On fail: 10d4 acid damage immediately and 5d4 acid damage at the end of their next turn. On success: half damage and no damage at the end of the next turn."
available_to:
  - Sorcerer
  - Wizard
description: "Level 4. 20-ft sphere: 10d4 acid immediately + 5d4 acid next turn on fail (Dex save). No concentration."
---

Vitriolic Sphere front-loads significant acid damage with a DoT rider — the immediate 10d4 (average 25) plus next-turn 5d4 (average 12.5) totals 37.5 average on failed saves, which competes well with Fireball at the same slot. Acid damage is commonly resisted less than fire. No concentration means it stacks with sustained control spells. The two-turn damage window punishes enemies who stay close after being hit.
