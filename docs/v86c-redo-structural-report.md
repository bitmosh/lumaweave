# v86c Tile System Structural Report

**Generated:** 2026-05-10
**Purpose:** Diagnostic report documenting current tile system implementation vs reference patterns
**Reference:** docs/updates/v86+_updates/(NEW)LumaWeave_Solar_Plasma_Prototype.html (lines 909-1308+)

---

## 1. CollapsibleSection.tsx

**Line Count:** 152 lines

**Top-Level Exports:**
- Functions: `CollapsibleSection`
- Constants: `TILE_GRID` (16), `snap` function
- Types: `CollapsibleSectionProps` interface

**Key State Hooks:**
- `useTileContext()` - custom hook from TileProvider (consumes React context internally)
- No useState, useRef, useEffect used directly

**Event Listener Strategy:**
- Window-level listeners: `window.addEventListener("mousemove", onMove)`, `window.addEventListener("mouseup", onUp)`
- Element-level: `onMouseDown={handleTearOffMouseDown}` on tear-off button
- No pointer capture
- No Escape handler
- No pointercancel handler

**Notable Type Definitions:**
```typescript
interface CollapsibleSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
  testId?: string;
  accentColor?: string;
  borderColor?: string;
  tileableKey?: string;
}
```

**Dependencies on Tile-System Files:**
- `useTileContext` from `./TileProvider`

**Dependencies on Settings Store:**
- None

**DEPARTURES FROM REFERENCE:**

1. **CSS Architecture**
   - Reference: Inline `<style>` tag with CSS classes (`.tsec`, `.tsec-head`, `.tsec-toggle`, `.tsec-tear`, `.tsec-ghost`, etc.)
   - Implementation: Inline style objects on React elements
   - Reason: Integration with existing LumaWeave CSS system (Tailwind + custom CSS), not standalone prototype

2. **Ghost Indicator Structure**
   - Reference: `<div className="tsec-ghost"><span>Tiled out</span><span className="tsec-ghost-dot"/></div>` with CSS animation
   - Implementation: `<div className="tile-ghost-indicator"><span>Tiled out</span><span className="tile-ghost-dot"/></div>` with CSS class from external CSS file
   - Reason: CSS classes defined in lumaweave-visual-handles.css for consistency

3. **Toggle Button Disabled State**
   - Reference: `<button className="tsec-toggle" ... disabled={tiledOut}>`
   - Implementation: No disabled prop on toggle button
   - Reason: Not implemented yet (may be oversight)

4. **Test Attributes**
   - Reference: No test attributes
   - Implementation: `data-testid`, `data-testid={testId ? \`${testId}-toggle\` : undefined}`
   - Reason: Testing infrastructure (Playwright) requirements

5. **Theme Target Attribute**
   - Reference: No theme target attribute
   - Implementation: `data-lw-theme-target="ignore"`
   - Reason: LumaWeave theme system integration

6. **Button Nesting Structure**
   - Reference: Two sibling buttons in header (toggle + tear-off) with spacer
   - Implementation: Two sibling buttons in header (toggle + tear-off) with spacer
   - Status: MATCHES (after Phase 1 fix)

7. **Tear-Off Handler Logic**
   - Reference: Creates tile at 8px threshold, does NOT continue dragging after creation (no drag continuity in reference)
   - Implementation: Creates tile at 8px threshold, then continues updating same tile position via closure variable
   - Reason: Phase 1 requirement for drag-from-tear-off continuity

8. **Tear-Off Handler Event Listeners**
   - Reference: window mousemove/mouseup only
   - Implementation: window mousemove/mouseup only
   - Status: MATCHES

9. **Animation Definition**
   - Reference: `animation: ghostPulse 2s ease-in-out infinite` defined in inline CSS @keyframes
   - Implementation: `animation: "pulse 2s ease-in-out infinite"` in inline style (uses existing CSS animation)
   - Reason: Reuses existing LumaWeave pulse animation

10. **Hover States**
    - Reference: CSS hover states (`.tsec-tear:hover:not(:disabled)`)
    - Implementation: No hover states
    - Reason: Inline style objects don't support pseudo-selectors easily

11. **Cursor States**
    - Reference: `cursor: grab` → `cursor: grabbing` on active
    - Implementation: `cursor: tiledOut ? "not-allowed" : "grab"` (no grabbing state)
    - Reason: Inline style limitation

12. **Props Interface**
    - Reference: Props passed directly ({ sectionKey, title, children, accent, defaultOpen })
    - Implementation: CollapsibleSectionProps interface with testId, borderColor, isOpen, onToggle
    - Reason: TypeScript strictness, integration with existing CollapsibleSection component

13. **Children Type**
    - Reference: children passed directly
    - Implementation: children typed as ReactNode
    - Reason: TypeScript type safety

---

## 2. TileProvider.tsx

**Line Count:** 99 lines

**Top-Level Exports:**
- Functions: `TileProvider`, `useTileContext`
- Constants: `TILE_GRID` (16), `snap` function
- Types: None (types imported from tile.types.ts)

**Key State Hooks:**
- `useState<TileLayoutEntry[]>` - for tiles array
- `useRef<number>` - for zCounter
- `useCallback` - for all action functions (tileOut, closeTile, closeGroup, updateTile, bring, isTiledOut, syncTiles)
- `useSettingsStore()` - from settings.store (consumes Zustand store)

**Event Listener Strategy:**
- None (provider only, no event listeners)

**Notable Type Definitions:**
- Uses imported types: `TileLayoutEntry`, `TileContextState`, `TileContextActions`

**Dependencies on Tile-System Files:**
- Types from `./tile.types`
- `tileSectionRegistry` from `./tileSectionRegistry`

**Dependencies on Settings Store:**
- `useSettingsStore()` - Zustand store
- Reads: `settings.ui.tileLayout`
- Writes: `setSetting("ui.tileLayout", newTiles)`

**DEPARTURES FROM REFERENCE:**

1. **State Storage Pattern**
   - Reference: `useState([])` for tiles array only
   - Implementation: `useState([])` for tiles array + `useSettingsStore()` for persistence
   - Reason: Settings store integration for layout persistence

2. **Context Value Structure**
   - Reference: `{ tiles, registry, tileOut, closeTile, closeGroup, updateTile, bring, isTiledOut }` (flat object)
   - Implementation: `TileContextState & TileContextActions` (separate state/actions interfaces)
   - Reason: TypeScript type safety, clearer API contract

3. **Tiles Data Structure**
   - Reference: Array of tile objects
   - Implementation: Array in state, but context value converts to Map: `tiles: new Map(tiles.map(t => [t.id, t]))`
   - Reason: Map provides O(1) lookups by ID, better for tile operations

4. **Context Value Fields**
   - Reference: `{ tiles, registry, tileOut, closeTile, closeGroup, updateTile, bring, isTiledOut }`
   - Implementation: `{ tiles (Map), maxZ, groups, tileOut, closeTile, closeGroup, updateTile, bringToFront, toggleCollapsed, isTiledOut }`
   - Reason: Added maxZ for z-order tracking, groups array (computed in TileLayer, empty here), bringToFront vs bring naming, toggleCollapsed helper

5. **tileOut Return Value**
   - Reference: Returns `true` if added, `false` otherwise (boolean)
   - Implementation: Returns `string | null` (tile ID or null)
   - Reason: Phase 0/1 requirement for drag continuity - need tile ID to continue dragging

6. **tileOut Section Lookup**
   - Reference: No section registry check, assumes sectionKey is valid
   - Implementation: `tileSectionRegistry.getById(sectionKey)` - returns null if section not found
   - Reason: Integration with tileSectionRegistry for validation

7. **tileOut Default Dimensions**
   - Reference: Hardcoded `w: 320, h: 220`
   - Implementation: `w: section.defaultWidth, h: section.defaultHeight` from registry
   - Reason: Per-section default dimensions from registry

8. **Persistence Mechanism**
   - Reference: No persistence (in-memory only)
   - Implementation: `syncTiles` function calls `setSetting("ui.tileLayout", newTiles)` to persist to settings store
   - Reason: Layout persistence requirement

9. **zCounter Initialization**
   - Reference: `useRefT(10)` - starts at 10
   - Implementation: `useRef(Math.max(...tileLayout.map(t => t.z), 10))` - initializes from saved layout
   - Reason: Ensure z-order continuity after reload

10. **syncTiles Function**
    - Reference: No sync function, direct setTiles calls
    - Implementation: Separate `syncTiles` callback that updates both local state and settings store
    - Reason: Persistence requirement

11. **toggleCollapsed Function**
    - Reference: No dedicated toggleCollapsed function
    - Implementation: Inline function in contextValue that calls updateTile
    - Reason: Convenience helper for UI

12. **bringToFront vs bring Naming**
    - Reference: `bring` function
    - Implementation: `bring` internal, exposed as `bringToFront` in context
    - Reason: Clearer API naming

13. **groups Field**
    - Reference: No groups field in context
    - Implementation: `groups: []` in contextValue (empty, computed in TileLayer)
    - Reason: Type contract consistency (groups computed at render time)

14. **maxZ Field**
    - Reference: No maxZ field
    - Implementation: `maxZ: Math.max(...tiles.map(t => t.z), 10)` in contextValue
    - Reason: Z-order tracking for UI

15. **Registry in Context**
    - Reference: `registry` passed to TileProvider and included in context
    - Implementation: Registry imported directly in TileProvider, NOT included in context
    - Reason: Registry used only in provider for validation, not needed in context

---

## 3. FloatingTile.tsx

**Line Count:** 180 lines

**Top-Level Exports:**
- Functions: `FloatingTile`, `findSnap`
- Constants: `TILE_GRID` (16), `SNAP_TOLERANCE` (22), `COLLAPSED_H` (30), `MIN_W` (200), `MIN_H` (110), `snap` function

**Key State Hooks:**
- None (stateless component, all state from context)

**Event Listener Strategy:**
- Window-level listeners: `window.addEventListener("mousemove", onMove)`, `window.addEventListener("mouseup", onUp)`, `window.addEventListener("keydown", onKeyDown)`, `window.addEventListener("pointercancel", onPointerCancel)`
- Element-level: `onMouseDown={onHeaderDown}`, `onMouseDown={onUngroupDown}`, `onMouseDown={onResizeDown}`, `onMouseDown={() => ctx.bringToFront(tile.id)}`
- No pointer capture
- Escape handler: Yes (onKeyDown checks for Escape key)
- pointercancel handler: Yes

**Notable Type Definitions:**
```typescript
interface FloatingTileProps {
  tile: TileLayoutEntry;
  group?: TileGroup | null;
}
```

**Dependencies on Tile-System Files:**
- Types from `./tile.types`
- `useTileContext` from `./TileProvider`

**Dependencies on Settings Store:**
- None

**DEPARTURES FROM REFERENCE:**

1. **CSS Architecture**
   - Reference: Inline `<style>` tag with CSS classes (`.tile`, `.tile-head`, `.tile-grip`, `.tile-body`, etc.)
   - Implementation: CSS classes from external CSS file (`.tile`, `.tile-head`, `.tile-grip`, etc.)
   - Reason: Integration with LumaWeave CSS system

2. **Tile Content Rendering**
   - Reference: `{reg.content()}` - calls content function from registry
   - Implementation: `<div className="tile-body">{/* Content will be rendered by TileLayer */}</div>` - empty placeholder
   - Reason: Content rendering handled by TileLayer in this implementation

3. **Registry Lookup**
   - Reference: `const reg = ctx.registry[tile.sectionKey]`
   - Implementation: `const reg = ctx.tiles.get(tile.id)` (then checks if exists)
   - Reason: Context uses Map instead of array, registry not in context

4. **bring vs bringToFront**
   - Reference: `ctx.bring(tile.id)`
   - Implementation: `ctx.bringToFront(tile.id)`
   - Reason: API naming difference in context

5. **Event Listeners - Escape Handler**
   - Reference: No Escape handler in FloatingTile
   - Implementation: `window.addEventListener("keydown", onKeyDown)` with Escape check
   - Reason: Cancellation requirement

6. **Event Listeners - pointercancel**
   - Reference: No pointercancel handler
   - Implementation: `window.addEventListener("pointercancel", onPointerCancel)`
   - Reason: Cancellation requirement for touch devices

7. **Ungroup Glyph**
   - Reference: `⧉` (U+22C9)
   - Implementation: `⤴` (U+2934)
   - Reason: Phase 0/1 change for clarity (tear-off direction)

8. **Slim Strip Drag Handler**
   - Reference: `onMouseDown={onHeaderDown}` on slim strip (reuses header drag)
   - Implementation: `onMouseDown={onUngroupDown}` on slim strip (separate ungroup handler)
   - Reason: Phase 5 requirement for per-tile ungroup button

9. **Body Drag**
   - Reference: No body drag
   - Implementation: No body drag (tile-body has no onMouseDown)
   - Reason: Phase 5 removed body drag from in-group tiles

10. **Group Header Visibility**
    - Reference: `const showHeader = !inGroup;` (no header when in group)
    - Implementation: `const showHeader = !inGroup;` (same)
    - Status: MATCHES

11. **Slim Strip Visibility**
    - Reference: `const showSlimStrip = inGroup;` (show slim strip when in group)
    - Implementation: `const showSlimStrip = inGroup;` (same)
    - Status: MATCHES

12. **findSnap Function Location**
    - Reference: Defined inside tile-system module, not exported
    - Implementation: Exported from tileUtils.ts, also defined in FloatingTile.tsx (duplicate)
    - Reason: Code organization (utils exported separately), but duplicate exists

13. **findSnap Implementation**
    - Reference: Returns best candidate or null, uses `(!best || d < best.d)` comparison
    - Implementation: Same logic
    - Status: MATCHES

14. **Detached Offset Logic**
    - Reference: `nx = nx + 28; ny = ny + 8;` after ungroup
    - Implementation: `nx += 28; ny += 8;` after ungroup
    - Status: MATCHES

15. **Viewport Clamping**
    - Reference: `nx = Math.max(8, Math.min(window.innerWidth - tile.w - 8, nx))`
    - Implementation: Same
    - Status: MATCHES

---

## 4. TileLayer.tsx

**Line Count:** 131 lines

**Top-Level Exports:**
- Functions: `TileLayer`, `GroupBar`, `GroupOutline`
- Constants: None (uses constants from tileUtils)

**Key State Hooks:**
- `useMemo` - for computeGroups result memoization

**Event Listener Strategy:**
- GroupBar: Window-level listeners (`mousemove`, `mouseup`, `keydown`, `pointercancel`)
- GroupBar: Element-level `onMouseDown={handleMouseDown}`
- GroupOutline: No event listeners (passive visualization)
- TileLayer: No event listeners (container only)

**Notable Type Definitions:**
- Uses imported types: `TileGroup`

**Dependencies on Tile-System Files:**
- `useTileContext` from `./TileProvider`
- `FloatingTile` from `./FloatingTile`
- `computeGroups` from `./tileUtils`
- Types from `./tile.types`

**Dependencies on Settings Store:**
- None

**DEPARTURES FROM REFERENCE:**

1. **Component Structure**
   - Reference: TileLayer renders tiles directly, GroupBar/GroupOutline defined in same module
   - Implementation: TileLayer renders tiles, GroupBar/GroupOutline defined as internal functions
   - Status: MATCHES (internal functions vs separate exports is organizational)

2. **GroupBar 2+ Tile Check**
   - Reference: `if (group.tileIds.length < 2) return null;`
   - Implementation: `if (group.tileIds.length < 2) return null;`
   - Status: MATCHES

3. **GroupBar Drag Logic**
   - Reference: Iterates all group tiles with offsets, updates all on mousemove
   - Implementation: Same logic
   - Status: MATCHES

4. **GroupBar Event Listeners**
   - Reference: window mousemove/mouseup only
   - Implementation: window mousemove/mouseup + keydown (Escape) + pointercancel
   - Reason: Cancellation requirement

5. **GroupOutline Implementation**
   - Reference: SVG polygon tracing rectilinear hull (lines 448-472 in reference)
   - Implementation: Per-tile div outlines that merge at seams (individual divs)
   - Reason: Phase 3 correction - user specified per-tile outlines, not SVG polygon

6. **GroupBar Collapse All**
   - Reference: Has collapse all button and logic
   - Implementation: No collapse all button, only close button
   - Reason: Not implemented yet (may be Phase 4+)

7. **GroupBar Button Handler**
   - Reference: `if (e.target.closest(".gbar-btn")) return;` to exclude buttons from drag
   - Implementation: No button exclusion check (only close button)
   - Reason: Simplified implementation (only close button exists)

8. **GroupBar CSS**
   - Reference: Inline CSS in GroupBar component
   - Implementation: CSS class `.group-bar` from external CSS file
   - Reason: CSS architecture

9. **GroupOutline CSS**
   - Reference: SVG with stroke/fill
   - Implementation: Divs with border, opacity, borderRadius
   - Reason: Per-tile outline approach

10. **computeGroups Call**
    - Reference: Called in TileLayer with useMemo
    - Implementation: Same
    - Status: MATCHES

---

## 5. tileUtils.ts

**Line Count:** 84 lines

**Top-Level Exports:**
- Functions: `computeGroups`, `findSnap`
- Constants: `SNAP_TOLERANCE` (22), `COLLAPSED_H` (30)

**Key State Hooks:**
- None (pure utility functions)

**Event Listener Strategy:**
- None (pure functions)

**Notable Type Definitions:**
- Uses imported types: `TileLayoutEntry`, `TileGroup`

**Dependencies on Tile-System Files:**
- Types from `./tile.types`

**Dependencies on Settings Store:**
- None

**DEPARTURES FROM REFERENCE:**

1. **Module Structure**
   - Reference: Functions defined inline in tile-system module
   - Implementation: Separate utility module
   - Reason: Code organization, reusability

2. **TypeScript Types**
   - Reference: No type annotations (plain JavaScript)
   - Implementation: TypeScript type annotations on parameters/returns
   - Reason: TypeScript strictness

3. **computeGroups Return Structure**
   - Reference: Returns `{ groups, tileToGroup }` where tileToGroup maps tileId → groupId
   - Implementation: Returns `{ groups, tileToGroup }` where tileToGroup maps tileId → groupId
   - Status: MATCHES

4. **TileGroup Structure**
   - Reference: `{ id, tileIds, topRow, topX, topW, topY, bbox }`
   - Implementation: `{ tileIds, topRow, topX, topW, topY, bbox }` (no id field)
   - Reason: ID not needed (key is tileIds.join("-"))

5. **findSnap Implementation**
   - Reference: Same logic
   - Implementation: Same logic
   - Status: MATCHES

6. **Union-Find Implementation**
   - Reference: Same union-find algorithm
   - Implementation: Same union-find algorithm
   - Status: MATCHES

7. **BIG RULE Implementation**
   - Reference: Top row width from CONTIGUOUS top-row tiles
   - Implementation: Top row width from CONTIGUOUS top-row tiles
   - Status: MATCHES

---

## 6. tile.types.ts

**Line Count:** 111 lines

**Top-Level Exports:**
- Types: `TileSectionEntry`, `TileGroup`, `TileContextState`, `TileContextActions`, `TileLayoutEntry`
- Type aliases: `TileSectionRegistry`
- Constants: `SNAP_GRID_SIZE` (16), `EDGE_MAGNETISM_TOLERANCE` (22)

**Key State Hooks:**
- None (type definitions only)

**Event Listener Strategy:**
- None (type definitions only)

**Notable Type Definitions:**
- All exports are type definitions

**Dependencies on Tile-System Files:**
- `RegistryContract` from `../../themes/registryContract.types`

**Dependencies on Settings Store:**
- None

**DEPARTURES FROM REFERENCE:**

1. **Type System**
   - Reference: No type definitions (plain JavaScript)
   - Implementation: Full TypeScript type system
   - Reason: TypeScript strictness, type safety

2. **Separate Types File**
   - Reference: Types inline in implementation
   - Implementation: Separate types module
   - Reason: Type reusability, clear API contracts

3. **TileSectionEntry**
   - Reference: Inline object structure in registry
   - Implementation: Defined interface with id, label, category, defaultWidth, defaultHeight, collapsible
   - Reason: Type safety, registry contract

4. **TileGroup**
   - Reference: Inline object structure
   - Implementation: Defined interface with tileIds, topRow, topX, topW, topY, bbox
   - Reason: Type safety

5. **TileContextState vs TileContextActions Separation**
   - Reference: Single flat context object
   - Implementation: Separate interfaces for state and actions
   - Reason: Clear API contract, type safety

6. **tileOut Return Type**
   - Reference: Returns boolean
   - Implementation: Returns `string | null` (tile ID)
   - Reason: Drag continuity requirement (need tile ID)

7. **Constants Export**
   - Reference: Constants inline
   - Implementation: Exported constants (SNAP_GRID_SIZE, EDGE_MAGNETISM_TOLERANCE)
   - Reason: Reusability, single source of truth

8. **RegistryContract Dependency**
   - Reference: No registry contract type
   - Implementation: Imports RegistryContract from themes module
   - Reason: Integration with existing registry system

9. **Legacy tearOff Alias**
   - Reference: No legacy alias
   - Implementation: `tearOff?: (sectionKey: string, initialX: number, initialY: number) => void` optional
   - Reason: Backward compatibility (not currently used)

---

## Summary of Major Architectural Departures

### 1. TypeScript Integration
- **All files:** Full TypeScript type system vs reference's plain JavaScript
- **Reason:** Type safety, better IDE support, compile-time error detection

### 2. CSS Architecture
- **CollapsibleSection, FloatingTile, TileLayer:** External CSS files vs inline `<style>` tags
- **Reason:** Integration with LumaWeave CSS system (Tailwind + custom CSS)

### 3. Settings Store Integration
- **TileProvider:** Zustand store for layout persistence vs reference's in-memory only
- **Reason:** Layout persistence requirement

### 4. Context Structure
- **TileProvider:** Separate state/actions interfaces, Map-based tiles vs reference's flat object with array
- **Reason:** Type safety, O(1) lookups, clearer API contract

### 5. Event Handling
- **FloatingTile, TileLayer:** Added Escape and pointercancel handlers vs reference's mousemove/mouseup only
- **Reason:** Cancellation requirement

### 6. Group Outline Implementation
- **TileLayer:** Per-tile div outlines vs reference's SVG polygon rectilinear hull
- **Reason:** Phase 3 user correction - per-tile outlines that merge at seams

### 7. Drag Continuity
- **CollapsibleSection:** Continues dragging after tile creation vs reference's create-only
- **Reason:** Phase 1 requirement for drag-from-tear-off continuity

### 8. Content Rendering
- **FloatingTile:** Empty placeholder vs reference's registry.content() call
- **Reason:** Content rendering handled by TileLayer in this implementation

### 9. Registry Integration
- **TileProvider:** tileSectionRegistry validation vs reference's direct registry access
- **Reason:** Integration with existing registry system

### 10. Module Organization
- **tileUtils.ts, tile.types.ts:** Separate utility/type modules vs reference's single-file approach
- **Reason:** Code organization, reusability, type safety

---

## Status Assessment

**Infrastructure Completeness:** All core tile system components implemented and type-safe

**Reference Fidelity:** High - core algorithms (union-find, snap, group computation) match reference exactly

**Integration Points:** Settings store, registry system, CSS architecture all integrated

**Known Gaps:**
- GroupBar collapse-all button not implemented
- Toggle button disabled state not implemented
- Content rendering not wired to TileLayer
- Hover states not implemented (CSS limitation)

**Phase 0/1 Changes:**
- Drag continuity implemented (departure from reference)
- Button nesting fixed (now matches reference)
- tileOut returns ID instead of boolean (departure from reference)

**Phase 3 Changes:**
- Group outline changed from SVG polygon to per-tile divs (departure from reference per user correction)

**Pending Phases:**
- Phase 2: Group bar drag (already implemented, may need verification)
- Phase 3: Group outline corrections (per-tile outlines implemented)
- Phase 4: Pulse animation (CSS class implemented)
- Phase 5: Per-tile ungroup button (implemented)
- Phase 6: Persistence (implemented via settings store)
