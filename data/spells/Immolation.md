---
name: "Immolation"
type: spell
exists: true
state: known
tags:
  - spell
  - spell/evocation
level: 5
school: evocation
casting_time: "1 action"
range: "90 feet"
components:
  - V
duration: "Concentration, up to 1 minute"
concentration: true
effect: "Flames wreathe one creature you can see within range. The target makes a Dexterity save. On fail: 8d6 fire damage and burns for the duration. While burning, it takes 4d6 fire damage at start of each turn and sheds bright light in a 30-ft radius and dim light for 30 ft more. On success: 4d6 fire damage and no ongoing burning. A burning creature can end the effect by dropping prone and using its action to roll on the ground."
available_to:
  - Sorcerer
description: "Level 5. Concentration, 1 min. 8d6 fire initial + 4d6/turn ongoing (Dex save). Target sheds bright light while burning. Sorcerer-only."
---

Immolation front-loads 8d6 fire damage with 4d6/turn DoT on a failed save — total potential damage is enormous over the full minute. The burning creature sheds bright light, removing its ability to hide in darkness and revealing invisible/stealthed creatures in its radius. Sorcerer-exclusive. In Barovia, the light emission from a burning target counters darkness-exploiting enemies. Concentration cost competes with other sustained sorcerer options.
