# Session Log: Selection Visual Grammar v0

## Goal

Refine node/edge selection colors and add staged node-neighborhood selection modes.

## Files Changed

- `src/graph/renderers/sigma2d/selectionColors.ts` - Created centralized color constants
- `src/graph/renderers/sigma2d/selectionNeighborhood.ts` - Added getNodeNeighborhood helper
- `src/graph/renderers/sigma2d/SigmaGraphView.tsx` - Updated to use selectionColors, implemented staged node selection, updated debug panel
- `src/control-plane/settings/settings.schema.ts` - Added nodeSelectionStage to graphView schema
- `src/control-plane/settings/settings.defaults.ts` - Set default nodeSelectionStage to 1
- `src/control-plane/settings/settings.registry.ts` - Added nodeSelectionStage select control
- `src/app/AppShell.tsx` - Normalized and passed nodeSelectionStage to SigmaGraphView

## What Changed

### selectionColors.ts (new file)

**Centralized color constants:**
- defaultNode: #22d3ee (cyan)
- defaultEdge: #64748b (slate)
- selectedNode: #fbbf24 (amber)
- primaryEdge: #a855f7 (blacklight purple)
- secondaryEdge: #c4b5fd (pastel lavender)
- relationshipEndpointNode: #2563eb (darker blue)
- secondaryNeighborNode: #7dd3fc (lighter blue)

### selectionNeighborhood.ts

**Added helper:**
- `getNodeNeighborhood(graph, nodeId)` - Returns directEdgeIds and directNeighborNodeIds for a selected node

### SigmaGraphView

**Imports:**
- Added selectionColors import
- Added getNodeNeighborhood import

**Props:**
- Added nodeSelectionStage?: 1 | 2 | 3

**State:**
- Added nodeNeighborhoodInfo state with directEdgeCount and directNeighborCount

**Node selection useEffect (staged):**
- Reset all nodes to defaultNode color/size
- Stage 1: selected node only (amber #fbbf24, 1.6x size)
- Stage 2: selected node + direct edges (purple #a855f7, size 5)
- Stage 3: selected node + direct edges + direct neighbor nodes (light blue #7dd3fc, 1.25x size)
- Uses getNodeNeighborhood helper to get direct edges and neighbors
- Updates nodeNeighborhoodInfo state for debug panel
- Resets node neighborhood info when no node selected

**Edge selection useEffect (updated colors):**
- Reset all edges to defaultEdge (#6478b)
- Reset all nodes to defaultNode (#22d3ee)
- Selected/primary edge: primaryEdge (#a855f7), size 6
- Source/target endpoint nodes: relationshipEndpointNode (#2563eb), 1.6x size
- Secondary edges: secondaryEdge (#c4b5fd), size 4
- Secondary neighbor nodes: secondaryNeighborNode (#7dd3fc), 1.25x size
- Uses selectionColors constants throughout

**Debug panel:**
- Added Node Selection Stage row
- Added conditional Direct Edges count when node selected
- Added conditional Direct Neighbors count when node selected

### settings.schema.ts

**Added field:**
- graphView.nodeSelectionStage: 1 | 2 | 3

### settings.defaults.ts

**Added default:**
- graphView.nodeSelectionStage: 1

### settings.registry.ts

**Added control:**
- Type: select
- Category: Graph View
- Path: graphView.nodeSelectionStage
- Label: Node Selection Stage
- Description: Controls how much neighborhood context appears when selecting a node.
- Options: Stage 1 (Node only), Stage 2 (Node + direct edges), Stage 3 (Node + edges + neighbor nodes)

### AppShell

**Normalization:**
- Added nodeSelectionStage normalization from string to number using Number() cast
- Passed nodeSelectionStage prop to SigmaGraphView

## Color Direction

- Default nodes: cyan #22d3ee
- Selected relationship edge / primary edge: blacklight purple #a855f7
- Secondary edges: pastel lavender #c4b5fd
- Source/target endpoint nodes for selected relationship: darker blue #2563eb
- Secondary neighbor nodes: lighter blue #7dd3fc
- Selected node: amber #fbbf24 (kept from previous)
- Default edges: slate #64748b

## Node Selection Stages

**Stage 1 (Node only):**
- Selected node: amber #fbbf24, 1.6x size
- No connected edges highlighted
- No neighbor nodes highlighted

**Stage 2 (Node + direct edges):**
- Selected node: amber #fbbf24, 1.6x size
- Direct edges: purple #a855f7, size 5
- No neighbor nodes highlighted

**Stage 3 (Node + edges + neighbor nodes):**
- Selected node: amber #fbbf24, 1.6x size
- Direct edges: purple #a855f7, size 5
- Direct neighbor nodes: light blue #7dd3fc, 1.25x size

## Validation

- Typecheck passed: `npm run typecheck` succeeded
- Dev server running on port 1420

## Expected Behavior

**Edge selection:**
- Primary edge is purple (#a855f7), size 6
- Endpoint nodes are darker blue (#2563eb), 1.6x size
- Secondary edges are lavender (#c4b5fd), size 4
- Secondary nodes are light blue (#7dd3fc), 1.25x size

**Node selection stage 1:**
- Only selected node highlights (amber #fbbf24, 1.6x size)

**Node selection stage 2:**
- Selected node highlights (amber #fbbf24, 1.6x size)
- Direct edges highlight (purple #a855f7, size 5)

**Node selection stage 3:**
- Selected node highlights (amber #fbbf24, 1.6x size)
- Direct edges highlight (purple #a855f7, size 5)
- Direct neighbor nodes highlight (light blue #7dd3fc, 1.25x size)

**Debug panel:**
- Shows node selection stage
- Shows direct edge count when node selected
- Shows direct neighbor count when node selected
- Shows edge source/target, secondary edge count, secondary node count when edge selected

**Mutual exclusion:**
- Relationship selection clears node selection
- Node selection clears relationship selection
- Background click clears all highlights

## Terminology

- Node = entity
- Edge = canonical code/data term
- Relationship = human-facing UI term
- Primary edge = selected edge, or direct edge connected to selected node in stage 2/3
- Secondary edge = edge connected to either endpoint of selected relationship, excluding selected edge
- Secondary node = node reached through primary/secondary neighborhood expansion

## Decision

- Used centralized color constants in selectionColors.ts for consistency
- Implemented staged node selection based on nodeSelectionStage setting
- Used getNodeNeighborhood helper for clean node neighborhood computation
- Normalized nodeSelectionStage from string to number in AppShell (settings registry uses strings)
- Kept selected node color as amber (no clash with new colors)
- Debug panel shows comprehensive selection info for both node and edge selection
- InspectorPanel node selection counts deferred to future work (debug panel has the info)

## Next Step

Manual QA verification:
- Select edge: primary edge is purple, endpoint nodes darker blue, secondary edges lavender, secondary nodes light blue
- Select node stage 1: only selected node highlights
- Select node stage 2: selected node + direct edges highlight
- Select node stage 3: selected node + direct edges + direct neighbor nodes highlight
- Background clears all highlights
- Relationship selection still clears node selection
- Node selection still clears relationship selection
- Settings panel shows node selection stage control

## Roadmap

After Selection Visual Grammar v0:
1. Label Density v0
2. Node/Edge Type Color v0
3. Relationship Legend v0
4. Solar Plasma Visual Grammar v0
5. Force Layout v1
