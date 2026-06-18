# Frontend components — working rules

Auto-loaded when working under `components/`. These are UI components (charts, views) for the engine — dev-only source that a generator inlines into self-contained HTML. The runtime artifact ships with no build step and no dependencies; the tooling here (Vite, Vitest, TypeScript) is dev-only.

## TypeScript

Source is **TypeScript**, `strict` mode (`tsconfig.json` at repo root). Run `npm run typecheck` (`tsc --noEmit`) — it must stay clean. Shared types live in one `types.ts` per component; importers use `import type { … }` (the config sets `verbatimModuleSyntax`). Import specifiers keep the `.js` extension (e.g. `import { x } from './layout.js'`) — the bundler resolves them to the `.ts` files. Avoid `any`; in tests, type `querySelector` with its generic (`querySelector<HTMLInputElement>('…')`) and assert non-null (`!`) where the element is known to exist.

## File splitting

Keep modules small and single-purpose. When a file starts doing several jobs, split it.

- **One concern per file.** Separate pure logic from DOM. Math/data-shaping modules must not touch `document`; DOM modules import them and assemble elements.
- **Soft cap ~100 lines.** Past that, look for a seam to extract. It's a smell, not a hard rule — don't split mid-concern just to hit a number.
- **Shared constants live in one place** (e.g. `constants.ts`) so layout math and CSS stay in agreement.
- **Adjacent tests.** Every source file `x.ts` has a sibling `x.spec.ts`. Pure modules test under the default (node) env; DOM modules start with `// @vitest-environment happy-dom`.

### Folder layout (per component)

- `helpers/` — pure logic only (no DOM): the math/data-shaping modules + their specs.
- root `*.ts` — the DOM components (rendering, element creation) + their specs.
- root `constants.ts` (static data) and `types.ts` (shared types).
- entry / fixtures (`build-entry.ts`, `*-data.ts`, `*.html`, `style.css`) stay at root.

Example (timeline): `helpers/{calendar,lanes,layout,filters,axis,ticks,tracks,swimlane}.ts` (pure, unit-testable without a DOM) → root `render.ts`, `controls.ts`, `filterbar.ts`, `swimlane-render.ts`, `view.ts` (DOM) over the shared `constants.ts` + `types.ts`.

## Testing

- Vitest (runs `.ts` directly). `npm test` runs all; `npm run test:watch` for the loop. `npm run typecheck` is separate — run both.
- Build first, test after we agree the piece is right (no TDD).
- DOM env is **happy-dom** (jsdom pulls a broken transitive dep on the dev node version).

## Output stays self-contained

Nothing here may add a runtime dependency or a build step to the shipped HTML. Dev tooling (`package.json`, `node_modules`, Vite, Vitest) never ships — the generator inlines CSS/JS/data into one offline-openable file.
