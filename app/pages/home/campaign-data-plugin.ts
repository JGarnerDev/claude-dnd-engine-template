// Vite plugin: feed pages/home the LIVE campaign graph instead of fixtures.
//
// It runs scripts/timeline-data.ps1 -JsonOnly (the same extractor the shipped
// artifact uses) and exposes the result as the virtual module
// `virtual:campaign-data`. -JsonOnly returns before the HTML-injection step, so
// no `npm run build:timeline` shell is needed — pure read of entity frontmatter.
//
// In `vite dev` it also watches the three graph layers (data/ historian/
// scheduler/); editing any .md re-extracts and full-reloads the page. So the DM
// runs `npm run home` once and the page tracks the campaign with zero steps.

import { execFileSync } from 'node:child_process';
import { resolve, sep } from 'node:path';
import type { Plugin } from 'vite';

const VIRTUAL_ID = 'virtual:campaign-data';
const RESOLVED_ID = '\0' + VIRTUAL_ID;

// The graph layers a beat can come from. A change to any .md under these
// invalidates the cached extraction.
const GRAPH_DIRS = ['data', 'historian', 'scheduler'];

// Run the PowerShell extractor and return its JSON text (or 'null' on failure —
// the page then renders its empty state rather than crashing the dev server).
// -Full so secret beats reach the DM's own home page (tagged `secret: true`, plus
// each beat's `knownBy`). The chart's "Known by" filter defaults to no viewpoint
// (everything shows, secrets included — this is the DM's tool); the DM picks a
// character to scope it to what that character knows for a player-safe glance. The
// shipped artifact stays player-safe — only this local DM-side page opts into the
// full set.
function extract(repoRoot: string): string {
  const script = resolve(repoRoot, 'scripts', 'timeline-data.ps1');
  const exe = process.platform === 'win32' ? 'powershell.exe' : 'pwsh';
  try {
    const out = execFileSync(
      exe,
      ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', script, '-JsonOnly', '-Full', '-Root', repoRoot],
      { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
    );
    return rewriteSources(out.trim() || 'null', repoRoot);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[campaign-data] timeline-data.ps1 failed:\n${msg}`);
    return 'null';
  }
}

// The extractor writes `source` as `../../<rel>` — tuned for the shipped
// artifact's home in historian/timeline/. The dev server is rooted at
// pages/home, so those don't resolve. Rewrite them to `/@fs/<abs>` URLs that
// Vite serves (repoRoot is in server.fs.allow), so click-to-open hits the real
// .md. Untouched when JSON is null/empty.
function rewriteSources(json: string, repoRoot: string): string {
  if (json === 'null') return json;
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    return json; // leave malformed JSON for the loader to surface
  }
  const absBase = repoRoot.split(sep).join('/');
  const fix = (b: { source?: string }) => {
    if (typeof b.source === 'string') {
      const rel = b.source.replace(/^(\.\.\/)+/, '');
      b.source = `/@fs/${absBase}/${rel}`;
    }
  };
  const d = data as { events?: Array<{ source?: string }>; spans?: Array<{ source?: string }> };
  d.events?.forEach(fix);
  d.spans?.forEach(fix);
  return JSON.stringify(d);
}

export function campaignData(repoRoot: string): Plugin {
  let cached: string | null = null;

  return {
    name: 'campaign-data',

    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
    },

    load(id) {
      if (id !== RESOLVED_ID) return;
      if (cached === null) cached = extract(repoRoot);
      return `export default ${cached};`;
    },

    configureServer(server) {
      const roots = GRAPH_DIRS.map((d) => resolve(repoRoot, d));
      server.watcher.add(roots);

      const onChange = (file: string) => {
        if (!file.endsWith('.md')) return;
        if (!roots.some((r) => file.startsWith(r))) return;
        cached = null; // re-extract lazily on next load
        const mod = server.moduleGraph.getModuleById(RESOLVED_ID);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: 'full-reload' });
        server.config.logger.info(`[campaign-data] graph changed (${file}) — reloading`);
      };

      server.watcher.on('change', onChange);
      server.watcher.on('add', onChange);
      server.watcher.on('unlink', onChange);
    },
  };
}
