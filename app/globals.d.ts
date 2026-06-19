// Ambient declarations for the timeline build. `vite/client` (in tsconfig
// "types") already supplies the `*.css` import shim used by build-entry.ts.

import type { TimelineData } from './components/charts/timeline/types';

declare global {
  interface Window {
    // Data blob injected by scripts/timeline-data.ps1 into the built shell.
    __TL_DATA__?: TimelineData | null;
  }
}

export {};
