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

const timelineDir = resolve(__dirname, 'components/charts/timeline');

export default defineConfig({
  root: timelineDir,
  plugins: [viteSingleFile()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: { input: resolve(timelineDir, 'timeline.html') },
  },
});
