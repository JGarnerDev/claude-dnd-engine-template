// Hand-made sample data for the dev harness. Stands in for the PowerShell
// extraction (M2). Default calendar (no custom months) — world-history view.

export const sampleData = {
  calendar: null, // -> DEFAULT_CALENDAR (twelve 30-day months)
  events: [
    { date: '1340-02-15', label: 'The Long Winter begins', track: 'world', major: true },
    { date: '1341-06-01', label: 'Saltmarsh trade pact signed', track: 'faction' },
    { date: '1341-11-20', label: 'Border skirmish at the Reach', track: 'world', minor: true },
    { date: '1342-05-03', label: 'Party forms at Greywater', track: 'party', major: true },
    { date: '1342-05-20', label: 'Sword shatters at Redfen', track: 'character', major: true },
    { date: '1342-06-15', label: 'Cult of the Hollow surfaces', track: 'faction' },
    { date: '1342-06-20', label: 'Tax revolt in the lowlands', track: 'world', minor: true },
    { date: '1342-08-01', label: 'Redfen burns', track: 'world', major: true },
    { date: '1343-01-10', label: 'Continent split by the Sundering', track: 'continent', major: true },
    { date: '1343-04-22', label: 'New trade route to Highport opens', track: 'faction' },
    { date: '1343-09-30', label: 'Mara confronts the killer', track: 'character', major: true },
    { date: '1344-03-12', label: 'Coronation at Highport', track: 'world' },
  ],
};
