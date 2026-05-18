---
id: physics.gwells.pipelines
title: Gwells Physics — Pipelines
status: active
last-updated: 2026-05-17
---

# Gwells Physics — Pipelines

Three pipelines define how data and forces flow through gwells: the **data
flow** (source adapter to renderer), the **seeding flow** (initial position
placement), and the **engine frame loop** (per-frame physics).

## Pipeline 1 — Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. SOURCE ADAPTER                                           │
│    scripts/generate-self-graph.mjs (or another adapter)     │
│    Emits typed nodes + edges as JSON                        │
│                                                              │
│    Nodes: { id, type, label, path, size, ... }              │
│    Edge types include "contains" (parent-child hierarchy)   │
│    Nodes types: "spine", "directory", "doc", "code",        │
│                  "config", "fixture"                         │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│ 2. FIXTURE LOAD                                             │
│    src/fixtures/self-graph-generated.json                   │
│    Cached for fast reload during dev. Regenerated on        │
│    relevant source file change.                             │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│ 3. buildGraphologyGraph (src/graph/renderers/sigma2d/)      │
│    Translates JSON to graphology Graph instance             │
│                                                              │
│    For each node:                                            │
│      - Adds to graph with attrs: x, y, z, label, size,      │
│        baseSize, rawSize, color, nodeType, raw, ...         │
│      - Visual size = computeNodeSize(rawSize) * nodeSize     │
│                                                              │
│    For each edge:                                            │
│      - Adds with attrs: relationship, weight, raw           │
│                                                              │
│    After all nodes added, computes aggregate sizes for       │
│    directories and spines via computeAggregateSize.          │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│ 4. SigmaGraphView mounts                                    │
│    Creates Sigma instance with the graph.                   │
│    Installs window.__lwSigma, window.__lwGetGwellsState     │
│    probes (DEV / Playwright only).                          │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│ 5. applyDialect(graph, dialectId)                           │
│    See "Pipeline 2 — Seeding Flow" below.                   │
│    Returns a controller with start/stop methods.            │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│ 6. Engine frame loop                                        │
│    Runs requestAnimationFrame; each frame steps physics.    │
│    See "Pipeline 3 — Engine Frame Loop" below.              │
│    Writes updated x, y, z to graph nodes; Sigma redraws.    │
└─────────────────────────────────────────────────────────────┘
```

### Dialect switching (ACTIVE → ACTIVE mutate)

When the user switches dialects via the dropdown:

```
User picks new dialect → setting updated →
  useEffect in SigmaGraphView fires →
    controller.stop()       (current dialect halts)
    applyDialect(graph, newDialectId)  (new seeder runs, new controller)
```

The Sigma instance, graphology graph, and the canvas are all preserved. Only
positions and physics state change.

## Pipeline 2 — Seeding Flow

`applyDialect` is the entry point for both initial setup and dialect switches.

```
applyDialect(graph, dialectId, opts):
  │
  ├─ 1. Look up dialect entry in GW_DIALECT_REGISTRY
  │     If not found: log warning, fall back to default dialect
  │
  ├─ 2. Build wellAssignment map (nodeId → wellTypeId)
  │     For each graph node, call dialect.wellAssignment(nodeId, attrs)
  │
  ├─ 3. Resolve interactions (apply dialect's interactionOverrides)
  │     For each active interaction, build a ResolvedInteraction with
  │     final strength, range, idealDistance, etc.
  │
  ├─ 4. Resolve well params per well type (apply wellOverrides)
  │     Build a Map<wellTypeId, GWWellTypeDefaults> with overrides applied
  │
  ├─ 5. Build parentOfNode map from contains edges
  │     For each node with an incoming contains edge from a parent, record
  │     parentOfNode.set(nodeId, parentId).
  │     Used by edge-aware interactions (requireEdge: "contains-parent").
  │
  ├─ 6. Initialize node states (one per non-pinned node)
  │     velocity = (0, 0), pinned = false, lastSpeed = 0
  │     Skip pinned wells (spine-linear).
  │
  ├─ 7. Run the seed function
  │     dialect.seedFunctionId → fetch from GW_SEED_FUNCTION_REGISTRY
  │     Call seed({ graph, config }) → writes node positions
  │     See "Inside the seed function" below.
  │
  ├─ 8. Build pairIdealDistance map (Pass C8.2)
  │     For each (node, parent) pair where parent is in parentOfNode,
  │     compute |nodeSeed - parentSeed| and store as
  │     pairIdealDistance.set("nodeId|parentId", distance).
  │     Store both directions for bidirectional lookup.
  │     This map is used during spring force evaluation in stepPhysics.
  │
  ├─ 9. Store state on graph
  │     graph.setAttribute("__gwellsState", { dialectId, frame, nodes, ... })
  │     graph.setAttribute("__gwellsSeedPositions", seedPositions)
  │     (these are read by Sigma's nodeReducer to preserve pinned positions)
  │
  └─ 10. Return controller { start, stop, getState }
         start() begins the requestAnimationFrame loop.
         The mount effect calls start automatically.
```

### Inside the seed function

For `gwells.seed.radial-backbone`:

```
seedRadialBackbone(ctx):
  │
  ├─ Read seedParams: spineCount, spineAngles, spineSpacing,
  │   directoryOffset, helixTwist, fileOrbitRadius, etc.
  │
  ├─ Build parentToChildren map and find rootSpineIds via buildContainsMap
  │
  ├─ Assign root spines to axes via assignSpinesToAxes
  │   (Pass C8.4: bucket by first-path-segment; was alphabetical round-robin)
  │
  ├─ For each axis (spineIndex in 0..spineCount-1):
  │   │
  │   ├─ Flatten the axis's spines into a list via flattenSpinesFromRoot
  │   │
  │   ├─ Move root-spines (spine.*-root) to end of the list (Pass C8.4)
  │   │
  │   ├─ For each spine node along the axis (nodeIndex):
  │   │   │
  │   │   ├─ Compute spine position from axis angle and nodeIndex
  │   │   │
  │   │   ├─ Compute alternationSign = (nodeIndex % 2 === 0) ? +1 : -1
  │   │   │   (Pass C8.4: static per-axis alternation. Every spine consumes
  │   │   │    one slot regardless of whether it has children.)
  │   │   │
  │   │   ├─ For each directory child of this spine:
  │   │   │   placeBranchRecursive(child, spinePos, depth=0, alternationSign)
  │   │   │
  │   │   └─ For each loose file child of this spine (endpoint files):
  │   │       Fan placement (arc, no alternation)
  │
  └─ Write seeded positions into graph attributes and __gwellsSeedPositions map
```

### placeBranchRecursive — the fern-frond algorithm

```
placeBranchRecursive(dirId, parentPos, outwardDir, depth, alternationSign, ...):
  │
  ├─ Compute this directory's myDir vector:
  │   │
  │   if depth == 0:
  │     // First-level branch off spine — perpendicular to spine
  │     perpAngle = spineAxisAngle + π/2 + (helixTwist contribution)
  │     myDir = (cos(perpAngle), sin(perpAngle)) * alternationSign
  │
  │   else:
  │     // Continuing outward from parent — fern frond rule
  │     myDir = outwardDir (inherited from parent — no further perpendicular)
  │
  ├─ Compute this directory's position:
  │   myPos = parentPos + myDir * directoryOffset
  │
  ├─ Write x, y, z to graph node; store in allSeedPositions
  │
  ├─ For each directory child of this directory:
  │   placeBranchRecursive(childDir, myPos, myDir, depth+1, alternationSign)
  │   // Child inherits myDir as its outwardDir, same alternationSign
  │
  └─ For each file child of this directory:
      // Pass C8.3: phyllotaxis spiral, sorted by file size
      sortedFiles = files sorted ascending by rawSize
      for each file at index fi:
        { radius, angleRad } = computeFileOrbit(fi, fileCount, parentVisualSize)
        finalAngle = angleRad + helixTwist contribution
        filePos = myPos + (cos, sin)(finalAngle) * radius
        Write to graph node
```

## Pipeline 3 — Engine Frame Loop

`stepPhysics` runs once per frame (~16ms at 60fps). It processes every
non-pinned node, accumulates forces, integrates velocity, and writes new
positions.

```
stepPhysics(state, graph, resolvedInteractions, resolvedParams,
            parentOfNode, pairIdealDistance):
  │
  ├─ state.frame += 1
  │
  ├─ For each non-pinned node (nodeId):
  │   │
  │   ├─ fx = 0, fy = 0  (accumulated force)
  │   │
  │   ├─ wellTypeId = wellAssignment[nodeId]
  │   ├─ params = resolvedParams[wellTypeId]
  │   │
  │   ├─ For each ResolvedInteraction where source matches this wellType:
  │   │   │
  │   │   ├─ For each candidate target node with target wellType:
  │   │   │   │
  │   │   │   ├─ Edge-aware filter (Pass C7):
  │   │   │   │   if interaction.requireEdge == "contains-parent":
  │   │   │   │     // Only fire if target is this node's parent
  │   │   │   │     if parentOfNode[nodeId] != otherId: continue
  │   │   │   │
  │   │   │   ├─ Compute dist, range cutoff:
  │   │   │   │   dx = otherX - nodeX
  │   │   │   │   dy = otherY - nodeY
  │   │   │   │   dist = sqrt(dx² + dy²) + ε
  │   │   │   │   if interaction.range and dist > range: continue
  │   │   │   │
  │   │   │   ├─ Dispatch by interaction.kind:
  │   │   │   │   │
  │   │   │   │   "attraction": force = strength
  │   │   │   │     fx += (dx/dist) * force
  │   │   │   │     fy += (dy/dist) * force
  │   │   │   │
  │   │   │   │   "repulsion":  force = strength / max(dist² * 0.01, 0.01)
  │   │   │   │     fx -= (dx/dist) * force  (pushes away)
  │   │   │   │     fy -= (dy/dist) * force
  │   │   │   │
  │   │   │   │   "spring":  (Pass C8.2 — per-pair distance)
  │   │   │   │     pairKey = "nodeId|otherId"
  │   │   │   │     pairIdeal = pairIdealDistance.get(pairKey)
  │   │   │   │     ideal = pairIdeal ?? interaction.idealDistance
  │   │   │   │            ?? params.idealDistance
  │   │   │   │     displacement = dist - ideal
  │   │   │   │     force = strength * params.springStiffness * displacement
  │   │   │   │     fx += (dx/dist) * force
  │   │   │   │     fy += (dy/dist) * force
  │   │   │   │
  │   │   │   │   "perpendicular": adds a perpendicular force component
  │   │   │   │     fx += (-dy/dist) * strength
  │   │   │   │     fy += (dx/dist) * strength
  │   │   │
  │   ├─ Center gravity force (per-frame pull toward origin):
  │   │   if params.centerGravity > 0:
  │   │     dist = sqrt(x² + y²) + ε
  │   │     fx += (-x/dist) * params.centerGravity
  │   │     fy += (-y/dist) * params.centerGravity
  │   │
  │   ├─ Seed-anchor force (Pass C5 — pull toward seeded position):
  │   │   if params.seedAdherence > 0 and node has seed position:
  │   │     dx = seedX - nodeX
  │   │     dy = seedY - nodeY
  │   │     fx += dx * params.seedAdherence
  │   │     fy += dy * params.seedAdherence
  │   │
  │   ├─ Integrate:
  │   │   nodeState.vx = (nodeState.vx + fx) * params.damping
  │   │   nodeState.vy = (nodeState.vy + fy) * params.damping
  │   │   newX = nodeX + nodeState.vx
  │   │   newY = nodeY + nodeState.vy
  │   │   nodeState.lastSpeed = sqrt(vx² + vy²)
  │   │
  │   └─ Write newX, newY to graph node attrs
  │
  └─ Schedule next frame via requestAnimationFrame
```

### Force balance at equilibrium

For a file child whose parent is at the right place and whose seed position
matches its parent's seeded orbit, the forces at equilibrium are:

```
spring force toward parent at pairIdealDistance
  + seed-anchor force toward seeded position (which is at pairIdealDistance from parent)
  + sibling repulsion from neighbor files
  = approximately zero
```

Pass C8.2 made the spring's `ideal` equal to the seed-anchor's target. Before
C8.2, the spring used a static `idealDistance: 120` while the seed-anchor
pulled toward radius 900 — the file settled at ~402, halfway between, with
heavy drift. After C8.2 both forces agree and the file settles near its seeded
position with low drift.

### Performance note

The interaction loop is O(N²) in the worst case: every non-pinned node
considers every other node of a target well type. For 400 nodes this is fine.
For 10,000 nodes it becomes problematic. Mitigation will come in a future
performance pass (spatial partitioning, neighbor caches). Not blocking current
work.
