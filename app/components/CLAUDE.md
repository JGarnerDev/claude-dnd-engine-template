# Frontend components — working rules

Auto-loaded when working under `app/components/`. These are UI components (charts, views) for the engine — dev-only source that a generator inlines into self-contained HTML. All JS/TS tooling (`components/`, `pages/`, `package.json`, the configs) lives under `app/`; run `npm` from there. The campaign content (`data/`, `historian/`, `scheduler/`, `meta/`, `maps/`) and the PowerShell engine scripts (`scripts/`) stay at the repo root, one level up. The runtime artifact ships with no build step and no dependencies; the tooling here (Vite, Vitest, TypeScript) is dev-only.

## TypeScript

Source is **TypeScript**, `strict` mode (`app/tsconfig.json`). Run `npm run typecheck` (`tsc --noEmit`) — it must stay clean. Shared types live in one `types.ts` per component; importers use `import type { … }` (the config sets `verbatimModuleSyntax`). Import specifiers keep the `.js` extension (e.g. `import { x } from './layout.js'`) — the bundler resolves them to the `.ts` files. Avoid `any`; in tests, type `querySelector` with its generic (`querySelector<HTMLInputElement>('…')`) and assert non-null (`!`) where the element is known to exist.

## File splitting

Keep modules small and single-purpose. When a file starts doing several jobs, split it.

- **One concern per file.** Separate pure logic from DOM. Math/data-shaping modules must not touch `document`; DOM modules import them and assemble elements.
- **Soft cap ~100 lines.** Past that, look for a seam to extract. It's a smell, not a hard rule — don't split mid-concern just to hit a number.
- **Shared constants live in one place** (e.g. `constants.ts`) so layout math and CSS stay in agreement.
- **Adjacent tests.** Every source file `x.ts` has a sibling `x.spec.ts`. Pure modules test under the default (node) env; DOM modules start with `// @vitest-environment happy-dom`.

### Folder layout (charts)

Each chart is its own folder under `components/charts/`, named after the chart; its root file is named after the chart too (e.g. `timeline/timeline.ts`, `swimlane/swimlane.ts`) and is the renderer (DOM). No files named `render`. A chart owns a `helpers/` of pure logic only that chart uses. Anything shared by more than one chart drops to `components/charts/_common/`.

- `<chart>/<chart>.ts` (+ spec) — the renderer (DOM); `<chart>/helpers/` — pure math used only by that chart (+ specs).
- `_common/helpers/` — pure logic shared by more than one chart (+ specs).
- `_common/components/` — DOM widgets/behavior shared by more than one chart (+ specs).
- `_common/constants.ts` (static data) and `_common/types.ts` (shared types).
- `app/pages/demo/` (sibling of `app/components/` — not under `components/`) — the cross-chart switcher (`view.ts`), build entry (`build-entry.ts`), fixtures (`*-data.ts`), `*.html`, `dist/`. This is the Vite root (see `app/vite.config.js`) and what `npm run dev` opens; its `.ts` import the charts via `../../components/charts/…`.

### Styling (CSS)

CSS lives next to the code that produces the DOM and is pulled in by a side-effect `import './x.css'` in that module — Vite bundles and inlines it into the self-contained artifact (no `<link>` needed). Mirror the same file layout as the source:

- `<chart>/<chart>.css` — styles for that chart only (e.g. `timeline/timeline.css`, `swimlane/swimlane.css`), imported by `<chart>/<chart>.ts`.
- `_common/common.css` — theme tokens (`:root --chart-*` / `--track-*`), shared base classes (`.chart-root`, `.chart-dot`, `.chart-marker` + weight/state), and the shared scrollbar styling. Each chart imports it (Vite dedupes).
- `_common/components/<widget>.css` — styles for a shared widget (e.g. `filterbar.css`, `controls.css`), imported by its `.ts`.
- `pages/home/view.css` — styles for the page-level view switcher, imported by `view.ts`.

Classes are prefixed `chart-` (page-agnostic). Keep a rule with the element that owns it; lift a rule to `_common/` only when more than one chart needs it (the "shared when applicable" rule). The dev HTML harnesses carry only page chrome (`.demo-header`, `body`) inline — chart CSS reaches them through the JS import chain. When CSS geometry and layout math must agree, the constant lives in `_common/constants.ts` and the CSS comments point back to it.

Pure helpers are unit-testable without a DOM (node env); DOM files use `// @vitest-environment happy-dom`. Don't let a chart's private helper be imported by another chart — if both need it, it belongs in `_common` (this is why `weightOf` lives in `_common/helpers/weight.ts`).

Example: `timeline/` (World view) owns `helpers/{layout,lanes}`; `swimlane/` (Tracks view) owns `helpers/{swimlane-layout,tracks}`; both draw on `_common/helpers/{axis,calendar,ticks,filters,weight}` and `_common/components/{filterbar,controls,settingspanel}` over `_common/{constants,types}`; `pages/home/view.ts` mounts either chart.

### Saved-views state contract

Both charts save/load named UI snapshots through one shared contract — don't re-derive it:

- The shape is `ChartState` (`query`/`tracks`/`zoomLevel`/`scrollLeft`) and `SavedView` (`name`/`tab`/`state`) in `_common/types.ts`.
- Each chart **emits** its state via `api.getState(): ChartState` and **accepts** it via an optional `initialState?: ChartState` arg on `renderTimeline`/`renderSwimlane`. Charts rebuild on tab switch, so a loaded view is applied as initial state at render — never mutated onto a live chart. `buildFilterBar`'s optional 3rd arg (`{ query, tracks }`) seeds the search box + chips.
- Fail-soft apply rules (clamp zoom to the current `maxZoom`, intersect saved tracks with present ones) are pure helpers in `_common/helpers/viewstate.ts`. Persistence (`localStorage` key `campaign:saved-views:v1`, fail-soft CRUD) is in `_common/helpers/viewstore.ts`.
- The Save/Load widget (`_common/components/savedviews.ts`) mounts into the header `actions` slot **before** the settings gear (order: Save · Load · Settings); `pages/home/view.ts` wires its `getCurrent`/`apply` callbacks to the active chart's `getState()` and a re-render.

## Testing

- Vitest (runs `.ts` directly). `npm test` runs all; `npm run test:watch` for the loop. `npm run typecheck` is separate — run both.
- Build first, test after we agree the piece is right (no TDD).
- DOM env is **happy-dom** (jsdom pulls a broken transitive dep on the dev node version).

## Output stays self-contained

Nothing here may add a runtime dependency or a build step to the shipped HTML. Dev tooling (`package.json`, `node_modules`, Vite, Vitest) never ships — the generator inlines CSS/JS/data into one offline-openable file.
