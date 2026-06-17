# Frontend components — working rules

Auto-loaded when working under `components/`. These are UI components (charts, views) for the engine — dev-only source that a generator inlines into self-contained HTML. The runtime artifact ships with no build step and no dependencies; the tooling here (Vite, Vitest) is dev-only.

## File splitting

Keep modules small and single-purpose. When a file starts doing several jobs, split it.

- **One concern per file.** Separate pure logic from DOM. Math/data-shaping modules must not touch `document`; DOM modules import them and assemble elements.
- **Soft cap ~100 lines.** Past that, look for a seam to extract. It's a smell, not a hard rule — don't split mid-concern just to hit a number.
- **Shared constants live in one place** (e.g. `constants.js`) so layout math and CSS stay in agreement.
- **Adjacent tests.** Every source file `x.js` has a sibling `x.test.js`. Pure modules test under the default (node) env; DOM modules start with `// @vitest-environment happy-dom`.

Example split (timeline): `constants.js` (shared) → `calendar.js`, `lanes.js`, `layout.js` (pure) → `render.js` (DOM only). Pure files are directly unit-testable without a DOM.

## Testing

- Vitest. `npm test` runs all; `npm run test:watch` for the loop.
- Build first, test after we agree the piece is right (no TDD).
- DOM env is **happy-dom** (jsdom pulls a broken transitive dep on the dev node version).

## Output stays self-contained

Nothing here may add a runtime dependency or a build step to the shipped HTML. Dev tooling (`package.json`, `node_modules`, Vite, Vitest) never ships — the generator inlines CSS/JS/data into one offline-openable file.
