# Timeline component — progress

Working notes for the timeline chart. Engine QA / dev tracking, not campaign content.

## File structure convention

Per component:

```text
component/
  helpers/            # pure logic only — no DOM
    helperFn.ts
    helperFn.spec.ts
  component.ts        # rendering / element creation (DOM)
  component.spec.ts
  subComponent.ts
  subComponent.spec.ts
  constants.ts        # static data
  types.ts            # types
```

Applied to timeline:

- `helpers/` — pure math/data modules + specs: `axis`, `calendar`, `lanes`, `layout`, `filters`, `ticks`, `tracks`, `swimlane`
- root (DOM components) — `render`, `controls`, `filterbar`, `swimlane-render`, `view`
- root (entry/fixtures) — `build-entry`, `sample-data`, `mock-data`, `*.html`, `style.css`, `dist/`
- root (shared) — `constants.ts`, `types.ts`
- tests are `*.spec.ts`, sibling to their source

## Open items

### Label overflow — majors bypass the density gate

World view density-gates labels (`helpers/layout.ts`), but **major beats always get a label** (`!!e.major || …`). With many majors over a span they still tile/overlap — the stress harness at 2000 beats shows a wall of `★` labels.

Fix options:

- Gate majors too, just give them priority over normal/minor beats when picking which label survives a crowded slot.
- Cap label density regardless of weight (hard ceiling per viewport width).

Surfaced via `stress.html` (`mock-data.ts` generator). Not yet fixed.

## Done

- Stress harness: `stress.html` + `generateMockData` (`mock-data.ts`) — seeded, tunable beat/span counts.
- World-view density gate + adaptive max zoom (`helpers/layout.ts`, `render.ts`); bare on-axis dots for gated beats.
- File reorg to the structure convention above.
