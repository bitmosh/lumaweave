# Session Log: Relationship Neighborhood Highlight v0

## Goal

When an edge is selected, visually highlight the relationship and the two nodes it connects. Also softly reveal the immediate secondary neighborhood around both connected nodes.

## Files Changed

- `src/graph/renderers/sigma2d/selectionNeighborhood.ts` - Created helper module with functions for computing relationship neighborhoods
- `src/graph/renderers/sigma2d/SigmaGraphView.tsx` - Added neighborhood highlighting for selected edges, updated debug panel with neighborhood counts
- `src/control-plane/panels/InspectorPanel.tsx` - Added secondaryEdgeCount and secondaryNodeCount props and display
- `src/app/AppShell.tsx` - Added neighborhood computation and passed counts to InspectorPanel

## What Changed

### selectionNeighborhood.ts (new file)

**Helper functions:**
- `getEdgeEndpointNodeIds(graph, edgeId)` - Returns source and target node IDs for an edge
- `getConnectedEdgeIds(graph, nodeId)` - Returns all edge IDs connected to a node
- `getOppositeNodeId(graph, edgeId, nodeId)` - Returns the opposite node ID for an edge given one endpoint
- `getRelationshipNeighborhood(graph, edgeId)` - Returns neighborhood data:
  - sourceId, targetId: endpoint nodes
  - secondaryEdgeIds: edges connected to source or target (excluding selected edge)
  - secondaryNodeIds: nodes connected through secondary edges (excluding endpoints)

### SigmaGraphView

**Neighborhood highlighting:**
- Imported getRelationshipNeighborhood helper
- Added neighborhoodInfo state to track sourceId, targetId, secondaryEdgeCount, secondaryNodeCount
- Updated edge selection useEffect to:
  - Reset all edges to default (#6478b, size 3)
  - Reset all nodes to default (#22d3ee, baseSize)
  - Compute neighborhood when edge selected
  - Highlight selected edge: amber (#fbbf24), size 6
  - Highlight source/target nodes: amber (#fbbf24), size baseSize * 1.6
  - Highlight secondary edges: cyan (#38bdf8), size 4
  - Highlight secondary neighbor nodes: light cyan (#67e8f9), size baseSize * 1.25
  - Update neighborhoodInfo state for debug panel
  - Reset neighborhood info when no edge selected

**Debug panel:**
- Added conditional rows when selectedEdgeId is set:
  - Edge Source
  - Edge Target
  - Secondary Edges (count)
  - Secondary Nodes (count)

### InspectorPanel

**Props:**
- Added secondaryEdgeCount?: number
- Added secondaryNodeCount?: number

**Edge selection display:**
- Added conditional display of secondary edge count (if > 0)
- Added conditional display of secondary node count (if > 0)

### AppShell

**Neighborhood computation:**
- Imported getRelationshipNeighborhood and buildGraphologyGraph
- Computed neighborhood when selectedEdgeId is set:
  - Built temporary Graphology graph from normalized nodes/edges
  - Called getRelationshipNeighborhood to get counts
  - Stored secondaryEdgeCount and secondaryNodeCount
- Passed counts to InspectorPanel

## Validation

- Typecheck passed: `npm run typecheck` succeeded
- Dev server running on port 1420

## Expected Behavior

- Selecting an edge highlights:
  - Selected edge: amber (#fbbf24), size 6
  - Source and target nodes: amber (#fbbf24), size baseSize * 1.6
  - Secondary edges (connected to endpoints): cyan (#38bdf8), size 4
  - Secondary neighbor nodes: light cyan (#67e8f9), size baseSize * 1.25
  - Unrelated nodes/edges: default colors
- Debug panel shows edge source, target, secondary edge count, secondary node count
- Inspector panel shows secondary edge count and secondary node count when relationship selected
- Selecting a node still works (amber highlight)
- Clicking background clears all highlights

## Terminology

- Edge = canonical code term
- Relationship = human-facing UI term
- Source/target nodes = primary endpoint nodes for selected edge
- Secondary edges = other edges connected to either endpoint node
- Secondary nodes = nodes connected through secondary edges

## Decision

- Used separate helper module for neighborhood computation to keep code clean and reusable
- Computed neighborhood in AppShell for InspectorPanel (temporary graph rebuild)
- Computed neighborhood again in SigmaGraphView for highlighting (uses live graph)
- Secondary edges exclude the selected edge itself
- Secondary nodes exclude the source and target nodes
- Amber (#fbbf24) for selected edge and endpoints (matches previous selection styling)
- Cyan (#38bdf8) for secondary edges, light cyan (#67e8f9) for secondary nodes
- Conditional display in InspectorPanel only when counts > 0

## Next Step

Manual QA verification:
- Selecting an edge highlights the edge
- Both endpoint nodes highlight
- Secondary connected edges/nodes highlight differently
- Selecting a node still works
- Clicking background clears all highlights
- Debug panel shows neighborhood counts
- Inspector panel shows neighborhood counts

## Roadmap

After Relationship Neighborhood Highlight v0:
1. Label Density v0
2. Node/Edge Type Color v0
3. Relationship Legend v0
4. Solar Plasma Visual Grammar v0
5. Force Layout v1
