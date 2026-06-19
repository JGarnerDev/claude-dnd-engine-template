# Saved Views

Let the user save and load named "views" of both the World and Party tabs of the home page, so that configurations of filters, search terms, and zoom levels are retained and can be loaded on a single click. Save and Load are icons placed beside the existing settings icon.

## Core Ideas
<!-- Stage 1: numbered atomic claims -->

1. Named "views" can be saved and loaded from the home page.
2. A view captures the **selected tab** (World or Party) plus that tab's config: active filters, current search term, zoom level.
3. Views live in a single global list — not split per tab. The selected tab is a stored property of the view, not a partition of the list.
4. The user names a view on save.
5. Loading a view (one click) switches to the view's stored tab and restores its captured config.
6. Save and Load are icons beside the existing settings icon.
7. Views persist across sessions (reload / restart keeps them).

Open (resolve in Stage 3 grounding): exactly which filter/search/zoom controls exist per tab, and whether a view should also capture map pan position (World) or scroll/sort state (Party).

## Key Terms
<!-- Stage 2: vocabulary pinned to exact meaning -->

- **View** — a named, saved snapshot of UI state. Stores: selected tab + active filters + search term + zoom level (+ pan/scroll TBD Stage 3). Many per app, user-created.
- **Config / view-state** — the restorable bundle a view holds. Distinct from app **Settings** (the existing gear panel = global prefs). View ≠ Settings; loading a view does **not** touch gear settings.
- **Save icon** — sits immediately left of the gear. Prompts for a name, then captures current live UI state into a new named view (name collision → overwrite, TBD Stage 4).
- **Load icon** — sits between Save and the gear (Save · Load · Settings, left→right). Opens a list of saved views; clicking one applies it.
- **Active view** — none by default. Loading a view does not lock it; editing controls afterward silently drifts from the snapshot (no auto-save).

Icon order, left→right: **Save · Load · Settings(gear)**.

## Measurement Model

The serialization shape the action steps implement (the "spec" half — no scoring, just the data contract).

**`ChartState`** — the per-tab restorable bundle (shared type, both charts):

```text
ChartState {
  query: string          // filter search box value
  tracks: string[]       // selected track chips (serialized from the live Set)
  zoomLevel: number      // 1 = fit; clamped to [1, maxZoom] on apply
  scrollLeft: number     // viewport pan position in px
}
```

**`SavedView`** — one named entry:

```text
SavedView {
  name: string           // user-given; unique key (case-sensitive)
  tab: 'world' | 'tracks'
  state: ChartState
}
```

**Storage:** `localStorage["campaign:saved-views:v1"]` = JSON `{ version: 1, views: SavedView[] }`. The `version` guards future migration; an unreadable/old payload is treated as empty (fail soft, never throw).

**Apply rules (fail soft, decision H):**

- `zoomLevel` → `clamp(saved, 1, maxZoom)` for the *current* data (maxZoom is data-derived, may differ from when saved).
- `tracks` → intersect saved names with the data's current `trackList`; drop names that no longer exist. Empty result = "no filter" (all pass), consistent with default.
- `scrollLeft` → applied after the seeded draw; browser clamps an over-range value to the content width automatically.
- Unknown `tab` → fall back to `'world'`.

**Overwrite (decision F):** save with an existing `name` replaces that entry in place after a confirm step. **Delete (decision G):** each Load-list row carries a × that removes that entry and rewrites storage.

## Grounding
<!-- Stage 3: per capability — Exists / Partial / Gap, with file names -->

Read scope: `app/pages/home/view.ts` (tab host), `timeline.ts` + `swimlane.ts` (renderers), `filterbar.ts`, `controls.ts`, `settingspanel.ts`, `app/pages/home/main.ts`.

**Naming note:** home page tabs are `world` ("World") and `tracks` ("Campaign") — the DM's "Party" = the Campaign/tracks tab. `View` type already exists: `'world' | 'tracks'` (`view.ts:15`).

Per capability:

- **Selected tab** — *Partial.* `renderTimelineView(container, data, initial)` already takes an `initial: View` and tracks the active tab in the `select(v)` closure (`view.ts:17,38`). Missing: a way to read the *current* tab back out, and to switch programmatically after mount. Tab buttons exist; no external getter.
- **Filters + search** — *Exists (read-once) / Partial (apply).* `buildFilterBar` owns mutable `state: {query, tracks:Set<string>}` (`filterbar.ts:10,31`), identical in both charts. Readable in place. Missing: `buildFilterBar` has no way to *seed* an initial state or re-render its chips' `is-on` / search `value` from a loaded snapshot.
- **Zoom level** — *Partial.* Both charts hold `zoomLevel` (number, 1=fit) as a render-local closure var (`timeline.ts:146`, `swimlane.ts:256`). Not exposed; `renderTimeline/Swimlane(container, data)` take no initial zoom and return only counts.
- **Pan / scroll position** — *Partial.* `viewport.scrollLeft` is the pan position (`controls.ts`, `timeline.ts:263`). Restorable in principle but not exposed.
- **Chart state read/write API** — *Gap.* `TimelineApi`/`SwimApi` expose only `eventCount`/`contentWidth`/`laneCount`/`controls` — no `getState()`, no `setState()`/initial-state arg. This is the core missing seam: views can't be captured or applied without it.
- **Save/Load UI slot** — *Exists.* Header has a right-side `actions` div; `mountSettingsPanel(actions)` drops the gear there (`view.ts:27,35`). Save/Load buttons append into the same `actions`, ordered before the gear.
- **Named-view persistence (storage)** — *Gap.* No `localStorage`/`sessionStorage` anywhere in `app/`. Net-new. Shipped artifact is a single offline HTML file — `localStorage` works in-browser, keyed per file origin. No dependency added (constraint in `components/CLAUDE.md`: artifact stays dependency-free, no build step).
- **Naming prompt + list picker UI** — *Gap.* No modal/prompt or list-popover widget exists. Net-new small DOM widgets (Save → name prompt; Load → list popover), styled to match the settings island.

**Resolved open question from Stage 1:** zoom + filter + search are the capturable per-tab state. Pan (`scrollLeft`) is cheap to include and lives in the same viewport — recommend capturing it too so a loaded view lands exactly where it was. No sort/secondary state exists to capture.

**Key architecture constraint:** switching tabs calls `renderTimeline`/`renderSwimlane` fresh every time (`view.ts:40`), discarding all chart state. So a view must be **applied as initial state at render**, not mutated onto a live chart — the get/set API must support construction-time seeding, and `select(v)` must accept an optional state to seed.

## What the change looks like to the DM and the Players

**Before.** The header right side has one button: the gear. Filters, search, and zoom live inside the gear's panel for the active tab. Set up a useful view — say World tab, zoomed into Act 2, filtered to the "Factions" track, searching "siege" — and there's no way to keep it. Switch to the Campaign tab and back, or reload, and everything resets to fit-zoom / no filter. Every return to a working view is rebuilt by hand.

**After.** Three buttons sit on the header right, left→right: **Save · Load · Settings(gear)**.

- **Save** — click it, type a name ("Act 2 siege"), confirm. The current tab + its filters + search + zoom + scroll are captured under that name.
- **Load** — click it, a small list drops down showing every saved view by name. Click one: the page switches to that view's tab and snaps the chart to the saved filters, search, zoom, and scroll position — one click, exact restore.
- Views persist in the browser (`localStorage`), so they survive reload and reopening the artifact file.

**For the DM at the table.** Preset lenses on the campaign graph, one click away. "Show me the war timeline" / "the party's personal arcs" / "everything in the capital" become saved views instead of re-fiddled filters mid-session. Faster to pull up a frame while players wait.

**For the players.** Same instant framing when they're looking at the shared timeline — jump to the view that answers their question without watching the DM rebuild it.

**Edge behaviors (resolve in Stage 5):** saving a name that already exists overwrites it (with confirm); the Load list offers a delete (×) per view; loading a view whose tab/track no longer matches the data fails soft (applies what still resolves, ignores stale tracks).

## Action steps

Ordered; prerequisites first. All under `app/`. This is an app mechanic, not a campaign-design principle — nothing migrates to `meta/`. Every new source file gets a sibling `.spec.ts` (`components/CLAUDE.md` rule); DOM specs use `// @vitest-environment happy-dom`.

1. **[prereq] `_common/types.ts`** — add exported `ChartState` and `SavedView` interfaces (Measurement Model shape). One canonical home for the contract; both charts and the widget import from here. *Rationale: single-source the data shape so chart get/set and storage can't drift.*

2. **[prereq] `_common/helpers/viewstate.ts`** (new + spec) — pure helpers: `clampZoom(z, maxZoom)`, `resolveTracks(saved, available)` (intersection), and `serializeState`/`applyDefaults`. No DOM. *Rationale: the fail-soft apply rules (decision H) are pure logic — testable in node env without a chart.*

3. **`_common/components/filterbar.ts`** — add optional 3rd param `initial?: { query: string; tracks: string[] }`. Seed `search.value = initial.query`, add each still-valid track to the `state.tracks` Set and set its chip `.is-on`. *Rationale: a loaded view must reconstruct the filter UI, not just the internal state — chips and search box have to show the restored selection.*

4. **`timeline/timeline.ts`** — (a) add optional `initialState?: ChartState` param to `renderTimeline`; seed `zoomLevel = clampZoom(initialState.zoomLevel, maxZoom)`, pass `initialState` filter parts into `buildFilterBar`, and set `viewport.scrollLeft` after the initial `draw()`. (b) add `getState(): ChartState` to `TimelineApi` reading `{ filterState.query, [...filterState.tracks], zoomLevel, viewport.scrollLeft }`. *Rationale: this is the core Gap — the chart must both emit and accept its full state.*

5. **`swimlane/swimlane.ts`** — identical change to step 4 against `SwimApi` (`zoomLevel`/`swim.scrollLeft`/`filterState` already present, same shape). *Rationale: the Campaign tab must save/load symmetrically with World.*

6. **`_common/helpers/viewstore.ts`** (new + spec) — localStorage CRUD against `campaign:saved-views:v1`: `listViews()`, `saveView(v)` (replace-by-name = overwrite, decision F), `deleteView(name)` (decision G), all wrapped in try/catch returning `[]`/no-op on parse failure (fail soft). *Rationale: persistence is a net-new Gap; isolate storage from DOM so it's unit-testable with a localStorage stub.*

7. **`_common/components/savedviews.ts`** (new) + **`savedviews.css`** (new) + spec — mounts **Save** and **Load** buttons into a host slot. Takes two callbacks: `getCurrent(): { tab, state }` and `apply(view: SavedView)`. Save opens a small inline island-styled popover (text input + confirm; if name exists, shows an "Overwrite?" confirm — no native `window.prompt`, which sandboxed iframes block). Load opens a list popover: one row per saved view (name → `apply`, plus a × → `deleteView` + refresh). Buttons reuse the gear's island visual language. *Rationale: the two Gap widgets (name prompt, list picker); kept dependency-free and self-contained per `components/CLAUDE.md`.*

8. **`pages/demo/view.ts`** — (a) keep a live ref to the active chart `api` and the current `View`; change `select(v, initialState?)` to thread an optional state into the renderer. (b) mount the saved-views widget into `actions` **before** `mountSettingsPanel(actions)` so DOM order is Save · Load · Settings. (c) wire `getCurrent` = `{ tab: currentView, state: activeApi.getState() }` and `apply` = `select(view.tab, view.state)`. *Rationale: the host owns tab identity and the active api; it's the only place that can read "current everything" and re-render into a loaded view (charts rebuild on switch — must apply as initial state).*

9. **`pages/home/main.ts`** — no change. Home delegates to `renderTimelineView`, which now carries the widget; the live-data page inherits Save/Load for free. *Rationale: confirm no extra wiring needed; note it so the build doesn't hunt for a second mount point.*

10. **`components/CLAUDE.md`** — add a short "Saved views state contract" note: charts expose `getState()` and accept `initialState: ChartState`; the shape lives in `types.ts`; storage key + fail-soft rules live in `viewstore.ts`/`viewstate.ts`. *Rationale: single doc home for the cross-file contract so the next change doesn't re-derive it (the only "principle"-level artifact this idea produces).*

11. **Verify** — `npm run typecheck` clean; `npm test` green (new specs for viewstate, viewstore, filterbar-seed, timeline/swimlane get/setState, savedviews widget); then `npm run dev` and walk it: set filters+zoom+pan on World, Save "test", change everything / switch to Campaign, Load "test" → lands back on World with exact state; reload page → view still listed; delete it. *Rationale: prove behavior changed, per Stage 6.*
