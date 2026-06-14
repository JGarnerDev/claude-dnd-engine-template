List all available slash commands for this campaign engine.

Output as an unordered list. For each command, one line: command name, dash, brief description. Include any notable arguments inline. No headers, no sections, no tables.

Commands to list:

- `/commands` — show this list
- `/session [--depth narrated|notes] [--scope inline|linked]` — plan the next session
- `/recap` — canonize a played session; moves it to historian and audits entities
- `/inventory` — report all free entities in `./data` grouped by type, with gaps
- `/pitch [--type <type>] [--count <n>]` — generate a creative flavor pitch (no files created)
- `/entity-questionnaire [--type <type>]` — generate a player-facing entity design questionnaire; also handles ingestion when a filled questionnaire is returned
- `/event [count|description] [--scale local|regional|global] [--add] [--from-pool] [--ai]` — generate world events from pool or AI; use `--add` to contribute new events
- `/region [--region <name>] [--draft <file>] [--city <n>]` — detail a world region: geography analysis → draft doc → entity anchoring → city questionnaires
- `/find <query> [--type <type>] [--source historian|data|scheduler] [--exists true|false] [-k <n>]` — semantic similarity search; surfaces entities by meaning, not keywords
- `/threads [-k <n>]` — surface forgotten or unresolved campaign threads; combines state-based scan with semantic ranking against current story state
- `/voice <npc name>` — build a DM voice brief for an NPC; grounds new dialogue in established canon
- `/rumor [count] [theme]` — surface rumors from the pool as session-opener flavor; read-only
- `/check <claim> [--source historian|data|both]` — check a proposed fact or recap against historian for contradictions
- `/idea [rough idea] [--build]` — develop a rough engine idea into a grounded, executable change via the staged idea-process flow; read-only until `--build`
- `/todo` — plain-language DM dashboard: outstanding player questionnaires, drafts, sessions awaiting recap, housekeeping
- `/sync` — sync shareable engine files to the template repo
- `pc-backstory` (auto-triggered) — ingest raw PC backstory text into a proper historian file
- `entity-ingest` (auto-triggered) — ingest a filled player entity questionnaire after balance review
