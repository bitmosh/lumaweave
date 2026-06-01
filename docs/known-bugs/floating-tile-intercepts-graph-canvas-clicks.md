# Floating Tile Intercepts Graph Canvas Pointer Events

**Status:** OPEN — worked around in tests, present in production
**Discovered:** v98.4.1 (gwells C9.4 / C9.4b)
**Target fix:** v100 (tile system migration to react-grid-layout + react-moveable)

## Symptom
A defaultVisible:true floating tile (e.g. physics-section) auto-populates on
page load. Its DOM element at z-index 10 intercepts pointer events over the
graph canvas region beneath it. Users clicking a graph element (bookmark,
node) in the area under the tile get their click captured by the tile instead.

## Evidence
Playwright log on gwells C9.4: "physics-section-content from tile-layer
subtree intercepts pointer events" when clicking a canvas bookmark behind
the tile.

## Current workaround
gwells-physics.spec.ts C9.4 / C9.4b call clearTiles() at test start to empty
the tile layout. This makes the TEST pass but does not fix the production
behavior — real users do not clear tiles before clicking the canvas.

## Root cause
The hand-rolled tile layer does not distinguish "click on tile's visible body"
(should hit tile) from "click on canvas in region under/around tile" (should
hit canvas). Tiles capture pointer events across their bounding box.

## Proposed fix (v100)
The react-grid-layout + react-moveable migration replaces the tile layer's
pointer handling wholesale. Address there rather than patching the current
layer (which v100 removes). Design question to resolve: tiles over the canvas
should capture clicks on their interactive body but pass through clicks
outside their visible controls — likely pointer-events handling on the tile
container vs its content, or a click-through mode for canvas-overlapping tiles.

## Related
- v98.3 status-bar overlap (resolved via anchor clamp) — same class of problem
  (tile over interactive element), different surface
