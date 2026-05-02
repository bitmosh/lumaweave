# Phase Packet: Baseline B Graph Visual System

## Phase Mission

Stabilize the 2D graph visual system so node labels, edge labels, hover, selection, Neighborhood Depth, settings, debug rows, and Playwright validation follow one coherent policy.

This phase is about making visual behavior predictable, centralized, testable, and maintainable.

## Current Layer

Layers 1–4 only:

```txt
Skeleton: tokens/types/contracts
Organs: label/style/neighborhood policies
Muscles: SigmaGraphView policy application
Nerves: settings/debug/QA/Playwright
```

## Do Not Implement

- Solar Plasma
- 3D / React Three Fiber
- force physics
- full theme editor
- pop-out color picker
- draggable/resizable panels
- relationship label templates
- source code line extraction
- custom edge-label renderer unless explicitly approved as fallback

## Critical Contracts

1. Neighborhood Depth is the shared radius for node and edge selected-neighborhood behavior.
2. Node Label Mode and Edge Label Mode are visibility filters, not independent depth systems.
3. Selected state persists until changed or cleared.
4. Hover state is temporary and layered over selection.
5. Background click clears selection.
6. `all-short` and `all-medium` edge modes remain preserved.
7. No dead active settings controls.
8. Manual QA overrides code inspection.
9. Playwright tests must pass.

## Styling Order

```txt
1. default styles
2. selected/neighborhood styles
3. hover overlay styles
4. sigma.refresh()
```

## Label Color Rule

If Sigma supports stateful label color:
- default labels light
- selected labels readable
- hovered labels dark only while hover background is white

If Sigma does not:
- restore globally readable default labels
- document limitation
- propose custom hover overlay fallback

## Validation

```bash
npm run typecheck
npm run qa:e2e
```

Manual QA:
1. Graph loads.
2. Node select works.
3. Edge select works.
4. Background clears.
5. Hover highlight is temporary.
6. Selected highlight persists.
7. Node/Edge labels follow Neighborhood Depth.
8. Edge Label Font Size works or limitation is documented.
9. No active dead controls.
