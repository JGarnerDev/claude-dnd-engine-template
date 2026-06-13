# Player Entity Submission Ingestion

Players design world entities via `/entity-questionnaire`. Filled questionnaires are ingested through balance review before any entity is created.

**Ingestion flow:**

1. Parse answers from the filled content
2. Read `entity_type` from the CLAUDE-INGEST block
3. Run balance review — `meta/worldbuilding.md` + `free-entities.ps1 -Type <entity_type>`
4. Present DM with a review summary and targeted questions
5. Create the entity only after explicit DM confirmation

Never skip balance review. Never create an entity directly from raw player input. This applies regardless of how the questionnaire arrives — pasted inline, referenced by path, or attached.
