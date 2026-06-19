// Build config for the self-contained timeline artifact (M2). Dev-only tooling
// — never ships. `npm run build:timeline` bundles the timeline modules + CSS
// into ONE offline HTML (no CDN, no separate assets) via singlefile, emitting
// components/charts/timeline/dist/timeline.html. That shell carries a data
// sentinel; scripts/timeline-data.ps1 injects the real campaign JSON into it.
//
// Vitest reads vitest.config.js separately, so this only affects `vite`/`vite build`.
import { defineConfig } from 'vite';
import { resolve } from 'path';
import { viteSingleFile } from 'vite-plugin-singlefile';

// The demo/build page lives in pages/demo (repo root, sibling of components/) and
// pulls the two charts (timeline, swimlane) + _common from components/charts.
const demoDir = resolve(__dirname, 'pages/demo');

export default defineConfig({
  root: demoDir,
  plugins: [viteSingleFile()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: { input: resolve(demoDir, 'timeline.html') },
  },
});
