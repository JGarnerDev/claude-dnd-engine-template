# Charts — progress

Working notes for the chart components (timeline + swimlane). Engine QA / dev tracking, not campaign content.

## File structure convention

Each chart is its own folder under `components/charts/`, named after the chart; its
root file is named after the chart and is the renderer (no `render` files). A chart
owns a `helpers/` of pure logic only it uses. Shared code → `_common/`. The
cross-chart switcher + dev harness live in `pages/demo/` at the **repo root**
(sibling of `components/`), not under `components/`.

```text
<repo root>/
  components/charts/
    _common/
      components/   filterbar.ts(+spec)  controls.ts(+spec)   # DOM shared by charts
      helpers/      axis  calendar  ticks  filters  weight     # pure, shared
      constants.ts  types.ts
    timeline/                                # World view chart
      timeline.ts  timeline.spec.ts          # renderer (exports renderTimeline)
      helpers/      layout  lanes            # pure, timeline-only
    swimlane/                                # Tracks view chart
      swimlane.ts  swimlane.spec.ts          # renderer (exports renderSwimlane)
      helpers/      swimlane-layout  tracks  # pure, swimlane-only (computeSwimlane)
  pages/demo/                                # cross-chart switcher + dev harness
    view.ts (mounts either chart)  build-entry.ts
    sample-data.ts  mock-data.ts  *.html  style.css  dist/
```

Rules:

- A chart's private helper must not be imported by another chart — if both need it, it lives in `_common` (this is why `weightOf` was extracted to `_common/helpers/weight.ts`).
- Tests are `*.spec.ts`, sibling to their source. Pure → node env; DOM → `// @vitest-environment happy-dom`.
- Build pipeline: Vite root = `pages/demo` (`vite.config.js`); `npm run dev` opens it; `npm run build:timeline` → `pages/demo/dist/timeline.html`; `scripts/timeline-data.ps1` injects campaign JSON into that shell.

## Open items

### Label overflow — majors bypass the density gate

World view density-gates labels (`timeline/helpers/layout.ts`), but **major beats always get a label** (`!!e.major || …`). With many majors over a span they still tile/overlap — the stress harness at 2000 beats shows a wall of `★` labels.

Fix options:

- Gate majors too, just give them priority over normal/minor beats when picking which label survives a crowded slot.
- Cap label density regardless of weight (hard ceiling per viewport width).

Surfaced via `stress.html` (`mock-data.ts` generator). Not yet fixed.

## Done

- Stress harness: `stress.html` + `generateMockData` (`mock-data.ts`) — seeded, tunable beat/span counts.
- World-view density gate + adaptive max zoom (`timeline/helpers/layout.ts`, `timeline/timeline.ts`); bare on-axis dots for gated beats.
- File reorg: two sibling charts (`timeline/`, `swimlane/`) + `_common/` + `pages/demo/` under `components/charts/`; `render.ts`→`timeline.ts`, `swimlane-render.ts`→`swimlane.ts`, pure `swimlane.ts`→`swimlane-layout.ts`; `weightOf` extracted to `_common/helpers/weight.ts`.
