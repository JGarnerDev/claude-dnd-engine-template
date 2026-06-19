// Dev config for pages/home — the user-facing timeline view fed by the LIVE
// campaign graph (vs pages/demo, which is the fixture-driven dev harness).
//
// `npm run home` -> vite serves this with the campaign-data plugin, which runs
// scripts/timeline-data.ps1 under the hood and hot-reloads on entity edits.
// No build step: this page is a local DM tool, not a shipped artifact (the
// shipped artifact stays the self-contained HTML from vite.config.js).

import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { defineConfig } from 'vite';
import { campaignData } from './campaign-data-plugin';

const here = dirname(fileURLToPath(import.meta.url)); // pages/home
const repoRoot = resolve(here, '..', '..');

export default defineConfig({
  root: here,
  plugins: [campaignData(repoRoot)],
  server: {
    open: true,
    // home imports charts from components/ and opens source .md via /@fs/ —
    // both live outside the page root, so allow the whole repo.
    fs: { allow: [repoRoot] },
  },
});
