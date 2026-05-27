# Known Bug: Auto-populated tile anchor offsets overlap status bar

**Status: RESOLVED in v98.4**

## Summary

On first load, the tile auto-populate logic in `TileProvider.tsx` uses `defaultAnchor`
offsets from `tileSectionRegistry.ts` to position tiles. The current offset values
did not account for the status bar height at the bottom of the viewport, causing tiles
near the bottom edge (labels-section at offset 820, appearance-section at offset 500)
to overlap the status bar.

## Symptom

Real users saw tiles covering the status bar on first load. During E2E testing this
was surfaced as a Playwright hit-test issue: auto-populated tiles with high y-offsets
covered the status bar and intercepted clicks intended for it (specifically the Tiles
popover button at the bottom).

## Root cause

`computeAnchorPos` in `tileUtils.ts` calculated positions from `edge: "right"` anchors
using `offset` as a y-offset from the top of the viewport edge. Offsets of 500+ pushed
tiles near or below the viewport fold. No clamping was applied against
`window.innerHeight - STATUS_BAR_HEIGHT`.

## Fix (landed v98.4)

Added `STATUS_BAR_HEIGHT = 40` and `TOPBAR_HEIGHT = 64` constants to `tileUtils.ts`.
Updated `computeAnchorPos` to use the `h` parameter for viewport-aware clamping:
- `y` is clamped to `[TOPBAR_HEIGHT, window.innerHeight - STATUS_BAR_HEIGHT - h - 8]`
- `x` is clamped to `[8, window.innerWidth - w - 8]`

All anchor positions now respect the status bar margin regardless of offset values.

## Files

- `src/control-plane/panels/tileUtils.ts` — `computeAnchorPos` (fixed)
