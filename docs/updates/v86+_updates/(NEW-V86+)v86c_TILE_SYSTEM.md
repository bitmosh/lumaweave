# Phase Packet: v86c Tile System

## A. Phase Mission

Replace the per-whole-tab tile model with the design's per-section tear-off, snap grid, edge magnetism, group formation, custom-shape group outline, and top-row-only group bar. Every accordion section in the left panel and every section in the right Control Dock grows a tear-off handle.

## B. Scope Boundaries

### Allowed

- `Tile.tsx` — drag/resize internals reused inside the new FloatingTile
- `LeftTabPanel.tsx` — pass through tile context
- `ControlDock.tsx` — pass through tile context (full rebuild belongs to v86e)
- `CollapsibleSection.tsx` — extend with optional `tileableKey`
- `AppShell.tsx` — mount TileProvider + render TileLayer
- `settings.schema.ts` (already touched in v86a — `tileLayout` field)
- `settings.store.ts` — read/write tileLayout
- New files in `/src/control-plane/tiles/`:
  - `TileProvider.tsx`
  - `TileableSection.tsx` (wraps CollapsibleSection)
  - `FloatingTile.tsx` (replaces Tile.tsx role)
  - `TileLayer.tsx`
  - `GroupBar.tsx`
  - `GroupOutline.tsx`
  - `tileSnap.ts` (snap algorithm)
  - `tileGroups.ts` (group computation)
  - `tileSection.types.ts`
  - `tileSectionRegistry.ts`

### Forbidden

- Visual treatment changes → v86b
- Inspector mini-graph → v86d
- TopBar / footer / dock changes → v86e
- Pin/dock zones (snap to viewport edges) → deferred per design notes
- Auto-restore on close → deferred
- Persisting tile groups (groups are runtime-computed, not stored) → confirmed in design notes

## C. Architecture Map

```
Layer 1 — Skeleton
  tileSection.types.ts        TileSectionEntry, TileLayoutEntry (already in settings)
  
Layer 2 — Organs
  tileSectionRegistry.ts      Registry of tileable section bodies
  TileProvider.tsx            Context owner — subscribes to settings store
  tileSnap.ts                 16px grid + 22px edge magnetism
  tileGroups.ts               Rectilinear hull + top-row computation

Layer 3 — Muscles
  N/A — no renderer changes

Layer 4 — Nerves
  Reuses settings.store for tileLayout array
  
Layer 5 — Armor
  TileableSection.tsx         Extends CollapsibleSection with tear-off handle (⤴)
  FloatingTile.tsx            Reuses Tile.tsx drag/resize, adds snap on pointerup
  GroupBar.tsx                Top-row-width-only group bar
  GroupOutline.tsx            SVG polygon over rectilinear hull
  TileLayer.tsx               Renders all floating tiles + groups
  AppShell.tsx                Mounts provider + layer

Layer 6 — Paint
  Reads panel.tile.handleColor, panel.tile.groupOutlineColor from v86a tokens
```

## D. Non-Negotiable Contracts

The seven v86 long-term contracts apply. Plus these v86c-specific:

1. **The "BIG RULE" — group bar matches top-row width only.** When a group has a top row of 1 tile and a wider bottom row, the group bar's horizontal extent matches just the top tile, NOT the bounding box of the group. User's explicit requirement.
2. **Group outline is a rectilinear hull, not a bounding rectangle.** Drawn as a single SVG polygon path tracing the actual outer edge of the tile arrangement.
3. **Pointer capture on tear-off.** Use `setPointerCapture` on the handle's `pointerdown` so motion events fire continuously even if pointer leaves the handle. Avoids the documented "first 8px lost on tear-off" bug.
4. **Source slot grey-out is a CSS state, not a re-render.** When a section is tiled out, the source slot keeps its DOM but adds `data-tiled-out="true"`. CSS handles greying, dashed border, and "Tiled out" pulse.
5. **Snap is computed at `pointerup`, not during drag.** During drag, position updates freely. At pointer-up, `tileSnap.findSnap` returns the closest snap target within 22px and the position is updated to that target. Avoids jittery snap-during-drag.
6. **Groups are runtime-derived, not stored.** `tileLayout` stores positions only. `computeGroups(tileLayout)` runs every render.
7. **Per-tile un-snap grip.** Each tile inside a group has a slim grip handle on its strip. Dragging the grip pulls just that tile out of the group (un-snaps its position by 30px from the nearest neighbor edge).
8. **Tile-section registry-first.** Sections that can be torn off register their `{key, title, originPanel, render}` in `tileSectionRegistry`. v86c registers the seven existing sections.

## E. Dependency Order

```txt
1. Skeleton:
   - tileSection.types.ts (entry types verified against v86a's TileLayoutEntry)
   
2. Organs:
   - tileSectionRegistry.ts (registry contract + initial 7 entries)
   - tileSnap.ts (16px grid + 22px magnetism — pure functions)
   - tileGroups.ts (rectilinear hull + top-row computation — pure functions)
   - TileProvider.tsx (context owner, settings store subscription)

3. Armor:
   - FloatingTile.tsx (port Tile.tsx internals; add snap on pointerup; pointer capture)
   - GroupBar.tsx (top-row-width-only)
   - GroupOutline.tsx (SVG rectilinear hull polygon)
   - TileableSection.tsx (extends CollapsibleSection with handle)
   - TileLayer.tsx (renders all)
   - AppShell.tsx mounts provider + layer
   - LeftTabPanel + ControlDock pass tile context through

4. Validation:
   - Tear-off creates floating tile
   - Snap grid + edge magnetism work
   - Group forms when 2 tiles snap edge-to-edge
   - Group bar matches top-row width
   - Outline is rectilinear hull
   - Per-tile grip un-snaps
   - Source slot greys out
   - Layouts persist across reload
```

## F. Current Permissions

Bandit may patch the Allowed list. Bandit may inspect the entire codebase. Bandit may NOT touch `SigmaGraphView`, `NodeSphereProgram`, or any visual rendering code. Bandit may NOT touch theme tokens beyond consuming them.

## G. Later-Phase Items

- Pin/dock zones (snap to viewport edges) → likely vP1 or v97
- Auto-restore tile to original panel slot when closed → future polish
- Group state persistence (currently runtime-derived) → never; design choice
- Multi-tile lasso selection inside groups → future
- Z-order persistence beyond runtime → future

## H. Known Failure Modes

1. **`setPointerCapture` not supported on some elements.** It's a `HTMLElement` method — works everywhere. But if the handle is wrapped in something exotic, capture may target the wrong element. Verify on a concrete `<button>` or `<div>`.
2. **`computeGroups` is O(n²) over all tiles.** Fine up to ~20 tiles; if user creates more, still fine. Don't pre-optimize.
3. **`tileLayout` write thrash during drag.** The naive implementation writes to settings store on every pointer move. Don't. Use a local refs-based position during drag, write to store only on pointerup. Same pattern as `Tile.tsx`'s existing dragging state.
4. **Source slot doesn't grey out.** Verify `data-tiled-out` attribute is being set; verify CSS selector targets it; verify `TileableSection` passes the tiled state down.
5. **Group bar doesn't follow top row.** `tileGroups.computeTopRow` should return the leftmost-and-topmost tiles whose y matches the group's minimum y.
6. **Outline polygon has artifacts.** Rectilinear hull algorithm: walk the perimeter clockwise, only emit corners where direction changes. Test with L-shaped groups (1 top tile, 3 bottom row).
7. **Tear-off ⤴ handle not visible.** TileableSection should always render the handle. Check that handle z-index is above the section's other content.
8. **Migration produces wrong tileLayout from old `tiledTabs`.** v86a's migration creates legacy tile entries with synthetic ids — verify the migration's output by inspecting localStorage after upgrading from a v76 state.

## I. Troubleshooting Playbooks

### Tear-off doesn't drag

1. Check pointer capture is being set in `pointerdown`.
2. Check the tear-off handle has `touch-action: none` to prevent browser drag conflicts.
3. Check no parent element has `pointer-events: none`.

### Snap doesn't trigger

1. Log `findSnap` result on pointerup.
2. Verify the moving tile's bounding rect and the candidate tiles' rects are in the same coordinate space (both client-relative).
3. Distance threshold is 22px — verify literal value in `tileSnap.SNAP_TOLERANCE`.

### Group forms but bar is wrong width

1. `computeGroups` produces `{ tileIds, topRow }` — log topRow.
2. topRow should be `{x, w, tileIds[]}` representing the topmost row of tiles.
3. GroupBar's width should be `topRow.w`, not the group bbox width.

### Source slot stays bright when tiled out

1. `TileableSection` renders the section. When tiled, it reads `useTiles().isTiledOut(key)`.
2. Verify the `data-tiled-out` attribute appears on the rendered section element when `isTiledOut === true`.
3. Verify CSS `[data-tiled-out="true"]` selector applies opacity / dashed border.

### Layout doesn't persist

1. Reload page; check localStorage for `useSettingsStore`'s persisted state.
2. Verify `tileLayout` array is in the persisted JSON.
3. If empty after reload, check the migration ran (version field).

## J. Validation Ladder

```bash
npm run typecheck                              # zero errors
npm run qa:e2e                                 # all tests green
node scripts/validate-system-index.mjs         # system index sound
```

New tests required:

- `tile-tear-off.spec.ts` — tear off a section; floating tile appears; source slot greys out.
- `tile-snap.spec.ts` — drag a tile near another; on release it snaps; group forms.
- `tile-group-bar.spec.ts` — group of 1+3 tiles renders bar matching top row only.
- `tile-group-outline.spec.ts` — outline polygon traces rectilinear hull (snapshot test).
- `tile-unsnap-grip.spec.ts` — drag per-tile grip; tile leaves group.
- `tile-layout-persistence.spec.ts` — tear off, position, reload, position survives.

Manual QA:

1. Tear off Physics from Control Dock → floating tile at cursor.
2. Source section in Dock greys out + dashed border + "Tiled out" pulses.
3. Tear off Theme from Dock → second tile.
4. Drag Theme tile near Physics → snap → group forms.
5. Group has amber outline hugging the actual shape (not a bounding rect).
6. Group has shared bar above top row only.
7. Drag group bar → whole group moves together.
8. Click ⊟ on a tile inside the group → that tile collapses; group outline updates.
9. Drag per-tile grip → tile un-snaps from group.
10. Reload → layout persists.
11. Close all tiles → source sections light up again.

## K. Research / Tool Policy

- Pointer capture: MDN docs on `setPointerCapture`. Standard since 2018.
- Rectilinear hull: classic computational geometry. Don't import a library; the algorithm fits in 30 lines.
- React Context for tile state: standard pattern.

## L. Output Requirements

Final report must include:

1. Number of tileable sections registered (expected: 7).
2. Snap grid size (16px) and snap tolerance (22px) confirmed in `tileSnap.ts` constants.
3. Pointer capture verified working.
4. Group bar passes "BIG RULE" test (manual QA: 1+3 tile group, bar = top tile width).
5. Layout persistence verified.
6. Migration tested with synthetic v76-state input.
7. Z-order behavior on tile click confirmed (clicked tile rises to front).

---

## Appendix A — Tile State Model

```typescript
// already established in v86a's settings.schema.ts
export interface TileLayoutEntry {
  id: string;             // "tile_<sectionKey>_<random>"
  sectionKey: string;     // matches tileSectionRegistry key
  x: number; y: number;   // snapped 16px grid
  w: number; h: number;   // resize-able
  collapsed: boolean;
  z: number;              // bring-to-front counter
}

// runtime-derived, not stored
export interface TileGroup {
  id: string;             // hash of member tile ids
  tileIds: string[];      // members
  topRow: { x: number; w: number; tileIds: string[] };
  hull: Array<{ x: number; y: number }>;  // rectilinear polygon points
  bbox: { x: number; y: number; w: number; h: number };
}
```

## Appendix B — Snap Algorithm

```typescript
// tileSnap.ts
export const TILE_GRID = 16;
export const SNAP_TOLERANCE = 22;

export function snapToGrid(v: number): number {
  return Math.round(v / TILE_GRID) * TILE_GRID;
}

export function findSnap(
  moving: TileLayoutEntry,
  others: TileLayoutEntry[]
): { x: number; y: number } {
  const edges = (t: TileLayoutEntry) => ({
    left: t.x, right: t.x + t.w,
    top: t.y, bottom: t.y + t.h,
  });
  
  const movingE = edges(moving);
  
  for (const other of others) {
    const otherE = edges(other);
    // Right of other → left of moving
    if (Math.abs(movingE.left - otherE.right) < SNAP_TOLERANCE
        && rangesOverlap(movingE.top, movingE.bottom, otherE.top, otherE.bottom)) {
      return { x: otherE.right, y: snapToGrid(moving.y) };
    }
    // ...7 more cases (left/right/top/bottom permutations)
  }
  
  return { x: snapToGrid(moving.x), y: snapToGrid(moving.y) };
}
```

## Appendix C — Group Computation

```typescript
// tileGroups.ts
export function computeGroups(tiles: TileLayoutEntry[]): TileGroup[] {
  const adj = buildAdjacency(tiles);  // two tiles adjacent if they share an edge
  const components = connectedComponents(adj);
  
  return components
    .filter(component => component.length >= 2)  // singletons are not groups
    .map(componentTileIds => {
      const groupTiles = tiles.filter(t => componentTileIds.includes(t.id));
      return {
        id: hash(componentTileIds.sort().join("|")),
        tileIds: componentTileIds,
        topRow: computeTopRow(groupTiles),
        hull: computeRectilinearHull(groupTiles),
        bbox: computeBBox(groupTiles),
      };
    });
}

function computeTopRow(tiles: TileLayoutEntry[]) {
  const minY = Math.min(...tiles.map(t => t.y));
  const topRowTiles = tiles
    .filter(t => t.y === minY)
    .sort((a, b) => a.x - b.x);
  const left = topRowTiles[0].x;
  const right = topRowTiles[topRowTiles.length - 1].x + topRowTiles[topRowTiles.length - 1].w;
  return { x: left, w: right - left, tileIds: topRowTiles.map(t => t.id) };
}
```

## Appendix D — TileableSection Contract

```typescript
// TileableSection.tsx
interface TileableSectionProps {
  sectionKey: string;             // matches tileSectionRegistry key
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
  accent?: string;
}

// Renders:
//   - Standard CollapsibleSection visual
//   - PLUS a ⤴ tear-off handle (top-right of section header)
//   - Handle uses pointer capture on pointerdown
//   - On 8px+ movement, calls TileProvider.tileOut(sectionKey, position)
//   - When tiled out: data-tiled-out="true" on root; greyed via CSS
```

## Appendix E — TileSection Registry Initial Population

v86c registers these 7 sections:

```typescript
// tileSectionRegistry.ts initial entries
register({ key: "graphSources",  title: "Graph Sources",   originPanel: "left",  render: () => <GraphSourcesBody/> });
register({ key: "sourceAdapter", title: "Source Adapter",  originPanel: "left",  render: () => <SourceAdapterPanel/> });
register({ key: "layoutFA2",     title: "Layout · FA2",    originPanel: "left",  render: () => <LayoutFA2Body/> });
register({ key: "physics",       title: "Physics · FA2",   originPanel: "right", render: () => <PhysicsBody/> });
register({ key: "labels",        title: "Labels",          originPanel: "right", render: () => <LabelsBody/> });
register({ key: "theme",         title: "Theme",           originPanel: "right", render: () => <ThemeBody/> });
register({ key: "inspectorSec",  title: "Inspector",       originPanel: "right", render: () => <InspectorBody/> });
```

`*Body` components are extracted from `LeftTabPanel` and the redesigned `ControlDock` (full extraction in v86e). For v86c, stub them with the existing content.

## Appendix F — Group Outline SVG

```typescript
// GroupOutline.tsx
function GroupOutline({ group, accentColor }: { group: TileGroup; accentColor: string }) {
  const pathD = group.hull
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .concat("Z")
    .join(" ");
  
  return (
    <svg className="group-outline"
         style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 999 }}>
      <path d={pathD}
            fill="none"
            stroke={accentColor}
            strokeWidth="1.5"
            strokeDasharray="6 4"
            opacity="0.7"
            style={{ transition: "all 200ms ease-out" }}/>
    </svg>
  );
}
```

---

*See `v86a_FOUNDATION.md` for `tileLayout` schema. See `v86e_COSMETIC_POLISH.md` for the redesigned ControlDock that consumes the tile section bodies.*
