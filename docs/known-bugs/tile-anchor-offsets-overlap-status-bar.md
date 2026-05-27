# Known Bug: Auto-populated tile anchor offsets overlap status bar

## Summary

On first load, the tile auto-populate logic in `TileProvider.tsx` uses `defaultAnchor`
offsets from `tileSectionRegistry.ts` to position tiles. The current offset values
do not account for the status bar height at the bottom of the viewport, causing tiles
near the bottom edge (labels-section at offset 820, appearance-section at offset 500)
to overlap the status bar.

## Symptom

Real users see tiles covering the status bar on first load. During E2E testing this
was surfaced as a Playwright hit-test issue: auto-populated tiles with high y-offsets
covered the status bar and intercepted clicks intended for it (specifically the Tiles
popover button at the bottom).

## Root cause

`computeAnchorPos` in `tileUtils.ts` calculates positions from `edge: "right"` anchors
using `offset` as a y-offset from the top of the viewport edge. Offsets of 500+ push
tiles near or below the viewport fold. No clamping is applied against
`window.innerHeight - STATUS_BAR_HEIGHT`.

## Workaround

In E2E tests, `openQaPanel` injects the QA tile directly via store, bypassing the
auto-populate positions entirely. This avoids the overlap issue in tests.

## Fix needed (v99 / polish arc)

Clamp `computeAnchorPos` output so `y + h <= window.innerHeight - STATUS_BAR_HEIGHT`
(approximately 36px for the status bar). The status bar height should be read from a
CSS variable or a constant shared between the status bar component and `tileUtils.ts`.

Alternatively, audit `defaultAnchor.offset` values in `tileSectionRegistry.ts` and
reduce offsets for labels-section and appearance-section to keep them above the fold.

## Files

- `src/control-plane/panels/tileUtils.ts` — `computeAnchorPos`
- `src/control-plane/panels/tileSectionRegistry.ts` — `defaultAnchor.offset` values
- `src/control-plane/StatusBar.tsx` — status bar height
