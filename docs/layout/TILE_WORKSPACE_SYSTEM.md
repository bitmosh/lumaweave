---
id: system.tile.workspace
title: Tile Workspace System
type: concept
status: concept
version: v73c
domain: layout
cluster: gold
agent_readable: true
include_in_self_graph: true
last_updated: v73c
depends_on:
  - contract.cockpit.layout
related:
  - contract.workspace.configuration
  - model.lens.navigation
tags: [tiles, workspace, layout, movable, snappable, fullscreen, panels, widgets]
---

# Tile Workspace System

## Concept

LumaWeave's UI is built from **Tiles** — modular, self-contained
UI panels that can be moved, resized, collapsed, snapped, and
arranged into saved **Workspace Configurations**. The user builds
their own cockpit layout from tiles, rather than working within
a fixed panel structure.

The right panel (physics/rendering settings) is the only
anchored tile by default. Everything else is free.

---

## What a Tile Is

A Tile is a self-contained UI panel with:

```typescript
interface Tile {
  id: string;                    // stable tile ID
  type: TileType;                // what kind of content it shows
  title: string;                 // display title
  state: TileState;              // expanded | collapsed | minimized | fullscreen
  position: TilePosition;        // x, y in workspace grid
  size: TileSize;                // width, height in grid units
  anchored: boolean;             // if true, cannot be moved
  removable: boolean;            // if false, cannot be removed from workspace
  displayDepth: DisplayDepth;    // 0-4 (minimal to debug)
  evidenceMode: boolean;         // show full evidence or summary
}

type TileType =
  | "graph-view"           // the Sigma/3D/flat graph renderer
  | "mission-control"      // QA checklist, agent reports
  | "system-index"         // system index registry browser
  | "graph-inventory"      // graph visual inventory
  | "physics-settings"     // force layout + physics controls
  | "theme-settings"       // theme preset + customization
  | "signal-patch-bay"     // Signal Loom audio routing
  | "source-browser"       // source adapter / graph sources
  | "evidence-panel"       // evidence viewer
  | "history-slider"       // graph history timeline
  | "node-inspector"       // selected node/edge details
  | "agent-chat"           // future: agent familiar interface
  | "custom"               // user-defined tile (future)

type TileState = "expanded" | "collapsed" | "minimized" | "fullscreen"
type DisplayDepth = 0 | 1 | 2 | 3 | 4
```

---

## Tile Behavior

### Collapsed
- Shows only the tile header (title, icon, expand button)
- Takes minimal vertical space
- Content is hidden but tile holds its grid position
- Single click on header to expand

### Expanded
- Shows full tile content at current size
- Can be resized by dragging edges
- Can be moved by dragging the header
- Double-click header to collapse

### Minimized
- Reduces to an icon in a tile tray (future — dock area)
- Frees up workspace space entirely
- Click icon to restore to last position/size

### Fullscreen
- Tile expands to fill the entire workspace
- All other tiles are hidden but preserved
- Press Escape or click fullscreen button to return
- Especially useful for: Theme Settings, Mission Control, Graph View

---

## Snapping System

Tiles snap to a configurable grid and to each other:

```
Snap targets:
  - Grid lines (configurable: 8px, 16px, 32px grid)
  - Edges of other tiles (magnetic snap within 12px)
  - Viewport edges (snap to top/left/right/bottom)
  - Center lines (vertical and horizontal)

Snap behavior:
  - Snap preview shown as a ghost outline while dragging
  - Snap on release (not during drag — preserves control)
  - Hold Alt to disable snapping while dragging
  - Tiles snap to each other's edges to form flush groups
```

---

## Workspace Configurations

A **Workspace Configuration** is a saved snapshot of tile
positions, sizes, states, and display depths. Users can save,
name, and switch between configurations.

```typescript
interface WorkspaceConfiguration {
  id: string;
  name: string;           // user-defined name
  description?: string;
  tiles: Tile[];          // full tile state snapshot
  activePhysicsDialect: string;  // which physics layout was active
  activeLens: string;            // which lens was active
  createdAt: number;
  updatedAt: number;
}
```

### Built-in Workspace Presets

```
Overview          → summary tile top, graph center, system index right
Deep Dive         → full graph, node inspector right, evidence bottom
QA Mode           → mission control left, graph center, inventory right
Theme Workshop    → theme settings fullscreen (or large center)
Signal Studio     → signal patch bay main, graph right, physics bottom
Presentation      → graph fullscreen, all other tiles hidden
```

---

## Anchored Tiles

Some tiles are anchored by default but can be un-anchored by
the user (except the graph view):

```
Graph View          → anchored to center, not removable
                      (the graph is always the center of LumaWeave)

Physics Settings    → anchored to right rail by default
                      → user can un-anchor and move freely
                      → user can remove (but it's always accessible
                        via the tile tray)

All other tiles     → freely movable, snappable, removable
```

The user can always add removed tiles back via the tile tray or
lens navigation.

---

## Display Depth Per Tile

Each tile has an independent display depth setting (0–4):

```
0 = Minimal     Title and status badge only
1 = Summary     Title + key metrics + status
2 = Operational Title + metrics + action buttons + next steps
3 = Evidence    Full evidence view with source/test paths
4 = Debug       Raw IDs, registry keys, testIDs, file paths
```

The tile's display depth is independent of the global
Human/Evidence/Debug mode. The global mode sets a default depth,
but individual tiles can be adjusted.

---

## Fullscreen Tiles — High-Value Use Cases

**Theme Settings fullscreen:**
The theme editor becomes a full creative studio. Color wheel,
preset management, generated artwork swapping, token path browser,
all in a spacious layout. Most valuable fullscreen tile.

**Mission Control fullscreen:**
Full QA checklist with sidebar history, Playwright failure summary,
agent reports, and eventually agent familiar chat. The development
cockpit at full size.

**Graph View fullscreen:**
Pure graph — no panels, no chrome. Maximum immersion. Same as
Focus Mode layout preset but user-triggered from the tile itself.

**Signal Patch Bay fullscreen:**
Full Signal Loom routing matrix. Audio channel assignments,
handle routing, envelope editor, physics dialect audio map.
The visual equivalent of a modular synthesizer.

---

## Implementation Phases

```
Phase 1: Fixed presets (current AppShell)
  → no tile movement, fixed left/right rails

Phase 2: Collapsible tiles
  → tiles can collapse/expand, fixed positions

Phase 3: Tile visibility toggle
  → tiles can be shown/hidden from a tile menu

Phase 4: Resizable tiles
  → drag edges to resize within fixed positions

Phase 5: Movable tiles + snap grid
  → tiles can be repositioned with snap support

Phase 6: Magnetic smart layout guides
  → tiles snap intelligently to each other

Phase 7: Saved workspace configurations
  → name, save, switch workspaces

Phase 8: Fullscreen tiles + tile tray
  → any tile can go fullscreen, minimized tiles in tray
```

**Do not implement Phase 5+ without explicit layout contract
accepted by the governance system.**

Current status: Phase 1 (fixed AppShell layout).
Phase 2 (collapsible tiles) is the next safe implementation step
and can proceed after the v69 retry (overview grid) is accepted.

---

## Relationship to Lens Navigation

Each **Lens** (Overview, Atlas, Evidence, Signal, Workshop,
Mission) has a default workspace configuration — a recommended
tile arrangement for that lens's purpose.

Switching lenses can:
- Apply the lens's default workspace configuration (if user has
  not customized it)
- Or preserve the user's current configuration (if they have
  customized it for that lens)

Users can save per-lens workspace configurations. A "Signal"
lens configuration would naturally feature the Signal Patch Bay
and physics settings prominently. An "Evidence" lens configuration
would feature the evidence panel and system index.
