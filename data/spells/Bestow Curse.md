---
name: "Bestow Curse"
type: spell
exists: true
state: known
tags:
  - spell
  - spell/necromancy
level: 3
school: necromancy
casting_time: "1 action"
range: "Touch"
components:
  - V
  - S
duration: "Concentration, up to 1 minute (or 8 hours at 4th, 24 hours at 5th, until dispelled at 7th+)"
concentration: true
effect: "Touch a creature, which must succeed on a Wisdom save or be cursed. Choose one of the following: disadvantage on ability checks and saves with a chosen ability score; disadvantage on attack rolls against you; Wisdom save (DC = your spell save DC) at start of each turn — on fail, wastes its action doing nothing; your attacks deal an extra 1d8 necrotic damage to the target. Slot levels extend duration."
available_to:
  - Bard
  - Cleric
  - Wizard
description: "Level 3. Concentration (extends with slot). Touch: Wisdom save or cursed — pick one debuff. Removed by Remove Curse."
---

Bestow Curse is highly flexible — four different curse effects suit different situations (action denial is most powerful single-target debuff; 1d8 necrotic per hit is best on martial-heavy parties). Duration scales with slot level, reaching permanent-until-dispelled at 7th. Touch range is the main limitation. Pairs with Remove Curse as counterplay.
