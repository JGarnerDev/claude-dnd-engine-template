// Hand-made sample data for the dev harness. Stands in for the PowerShell
// extraction (M2). Default calendar (no custom months) — world-history view.
// `source` is the path the click-to-open handler navigates to; M2 fills it from
// the originating .md. Left off some beats here to exercise the no-source path.

import type { TimelineData } from '../../components/charts/_common/types.js';

export const sampleData: TimelineData = {
  calendar: null, // -> DEFAULT_CALENDAR (twelve 30-day months)
  events: [
    { date: '1340-02-15', label: 'The Long Winter begins', track: 'world', major: true, source: 'historian/events/long-winter.md' },
    { date: '1341-06-01', label: 'Saltmarsh trade pact signed', track: 'faction:Saltmarsh League', source: 'historian/events/saltmarsh-pact.md' },
    { date: '1341-11-20', label: 'Border skirmish at the Reach', track: 'world', minor: true },
    { date: '1342-05-03', label: 'Party forms at Greywater', track: 'party', major: true, source: 'historian/events/party-forms.md' },
    { date: '1342-05-20', label: 'Mara\'s sword shatters at Redfen', track: 'character:Mara', major: true },
    { date: '1342-06-10', label: 'Borin swears the oath', track: 'character:Borin', minor: true },
    { date: '1342-06-15', label: 'Cult of the Hollow surfaces', track: 'faction:Cult of the Hollow', source: 'historian/events/cult-surfaces.md' },
    { date: '1342-06-20', label: 'Tax revolt in the lowlands', track: 'world', minor: true },
    { date: '1342-08-01', label: 'Redfen burns', track: 'world', major: true, source: 'historian/events/redfen-burns.md', keywords: ['Mara', 'Cult of the Hollow'] },
    { date: '1343-01-10', label: 'Continent split by the Sundering', track: 'continent:Aldmar', major: true, source: 'historian/events/the-sundering.md' },
    { date: '1343-04-22', label: 'New trade route to Highport opens', track: 'faction:Saltmarsh League' },
    { date: '1343-07-08', label: 'Borin loses his shield arm', track: 'character:Borin' },
    { date: '1343-09-30', label: 'Mara confronts the killer', track: 'character:Mara', major: true, source: 'historian/events/mara-confronts.md' },
    { date: '1344-03-12', label: 'Coronation at Highport', track: 'world', source: 'historian/events/highport-coronation.md' },
  ],
};
