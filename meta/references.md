---
type: meta
---

# External References

When generating sessions or world content, consult these sources for authoritative D&D data. Always prefer `./historian` over any external source for campaign-specific facts.

## D&D 5e Rules & Mechanics

**API:** `https://www.dnd5eapi.co/api/2014/`

All endpoints return JSON. Key ones for generation:

| Endpoint | Use |
|---|---|
| `/spells` | Spell lists for NPCs, scrolls, magic items |
| `/monsters` | Stat blocks and lore for dungeon population |
| `/magic-items` | Canonical magic item properties |
| `/classes` + `/subclasses` | PC and NPC class details |
| `/races` + `/subraces` | Race traits for characters |
| `/backgrounds` | PC background options |
| `/conditions` | Status effect definitions |
| `/damage-types` | Damage type reference |
| `/rule-sections/{slug}` | Rules text (e.g. `fantasy-historical-pantheons`) |

Fetch the root `/api/2014/` to get the full list of available endpoints.

## Forgotten Realms Lore

**Wiki MediaWiki API:** `https://forgottenrealms.fandom.com/api.php`

The HTML wiki blocks bots — always use the API. Useful query patterns:

```
# Get page content (wikitext)
/api.php?action=parse&page={Page_Title}&prop=wikitext&format=json

# List members of a category
/api.php?action=query&list=categorymembers&cmtitle=Category:{Name}&cmlimit=500&cmnamespace=0&format=json

# Search for a page
/api.php?action=query&list=search&srsearch={term}&format=json
```

Use underscores for spaces in page titles. Special characters (e.g. û in Faerûn) must be URL-encoded.

Key categories for common lookups:
| Category | Content |
|---|---|
| `Category:Faerûnian_pantheon` | Faerûnian deities |
| `Category:Locations_in_Faerûn` | Named places |
| `Category:Factions` | Organizations and groups |
| `Category:Deities_by_domain` | Deities organized by cleric domain |

## When to Use Each Source

| Question | Where to look |
|---|---|
| What happened in our campaign? | `./historian` (authoritative) |
| What entities exist in our world? | `./data` (free pool) |
| How should this session be structured? | `./meta` |
| What are the 5e rules for X? | D&D 5e API |
| What is canonical Forgotten Realms lore for X? | Forgotten Realms wiki API |
| What does a specific spell/monster/item do? | D&D 5e API |
