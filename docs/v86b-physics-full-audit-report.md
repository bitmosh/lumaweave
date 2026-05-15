# DRAFT — vP-physics-full-audit: End-to-end physics system analysis

**Status:** DRAFT — Read-only audit complete
**Date:** 2026-05-13
**Pass:** vP-physics-full-audit

---

## Summary

Comprehensive read-only audit of the current physics system as it exists on disk. This audit grounds future physics fixes in actual current state rather than possibly-stale documentation snapshots. All code quoted is the exact current content from the files.

---

## Question 1: Position-mutation inventory

### Direct mutators (explicit setNodeAttribute calls)

#### 1. Sunflower seed placement
**File:** `src/graph/renderers/sigma2d/buildGraphologyGraph.ts`  
**Lines:** 85-87  
**Function:** `buildGraphologyGraph`  
**Trigger:** Called during graph construction (invoked from SigmaGraphView rebuild effect)  
**Conditions:** None (runs for all nodes)  
**Math:**
```typescript
const position = getSunflowerPosition(index, layoutScale);

graph.addNode(node.id, {
  x: position.x,
  y: position.y,
  ...
});
```

`getSunflowerPosition` (lines 33-44):
```typescript
function getSunflowerPosition(
  index: number,
  layoutScale: number,
): { x: number; y: number } {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const radius = Math.sqrt(index + 1) * layoutScale;
  const angle = index * goldenAngle;

  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
  };
}
```

`layoutScale` calculation (line 76-77):
```typescript
const layoutScale =
  18 + settings.linkDistance * 0.2 + settings.repelForce * 0.08;
```

---

#### 2. Community gravity handler
**File:** `src/graph/renderers/sigma2d/SigmaGraphView.tsx`  
**Lines:** 279-280  
**Function:** Handler inside useEffect (lines 236-293)  
**Trigger:** Sigma `afterRender` event (continuous)  
**Conditions:** `communityGravity > 0` (line 246)  
**Math:**
```typescript
// Compute centroid per cluster
const centroids = new Map<string, {x: number, y: number, count: number}>();

graph.forEachNode((_nodeId: string, attrs: any) => {
  const cluster = (attrs.raw as any)?.cluster ?? "gray";
  if (!centroids.has(cluster)) {
    centroids.set(cluster, {x: 0, y: 0, count: 0});
  }
  const c = centroids.get(cluster)!;
  c.x += (attrs.x as number);
  c.y += (attrs.y as number);
  c.count++;
});

centroids.forEach(c => {
  c.x /= c.count;
  c.y /= c.count;
});

// Apply gentle pull toward cluster centroid
const strength = communityGravity * 0.0008;
graph.forEachNode((nodeId: string, attrs: any) => {
  const cluster = (attrs.raw as any)?.cluster ?? "gray";
  const centroid = centroids.get(cluster);
  if (!centroid) return;
  const dx = centroid.x - (attrs.x as number);
  const dy = centroid.y - (attrs.y as number);
  graph.setNodeAttribute(nodeId, "x", (attrs.x as number) + dx * strength);
  graph.setNodeAttribute(nodeId, "y", (attrs.y as number) + dy * strength);
});
```

**Effect deps:** `[communityGravity]` (line 293)

---

#### 3. Solar-orbit dialect - centroid pull
**File:** `src/graph/renderers/sigma2d/SigmaGraphView.tsx`  
**Lines:** 351-354  
**Function:** Handler inside useEffect (lines 296-421)  
**Trigger:** Sigma `afterRender` event (continuous)  
**Conditions:** `physicsDialect === "solar-orbit"` (line 306)  
**Math:**
```typescript
// Step 2: pull nodes toward their centroid
// Sun nodes: stronger pull (they anchor cluster)
// Non-sun nodes: moderate pull
graph.forEachNode((nodeId: string, attrs: any) => {
  const cluster =
    (attrs.raw as any)?.cluster ?? "gray";
  const centroid = centroids.get(cluster);
  if (!centroid) return;

  const isSun = attrs.isSun as boolean;
  const strength = isSun ? 0.004 : 0.002;

  const dx = centroid.x - (attrs.x as number);
  const dy = centroid.y - (attrs.y as number);

  graph.setNodeAttribute(nodeId, "x",
    (attrs.x as number) + dx * strength);
  graph.setNodeAttribute(nodeId, "y",
    (attrs.y as number) + dy * strength);
});
```

**Effect deps:** `[physicsDialect]` (line 421)

---

#### 4. Solar-orbit dialect - sun repulsion
**File:** `src/graph/renderers/sigma2d/SigmaGraphView.tsx`  
**Lines:** 397-404  
**Function:** Handler inside same useEffect (lines 296-421)  
**Trigger:** Sigma `afterRender` event (continuous)  
**Conditions:** `physicsDialect === "solar-orbit"` (line 306)  
**Math:**
```typescript
// Step 3: inter-cluster sun repulsion
// Suns push away from other suns
const sunIds = Array.from(clusterSuns.values());

for (let i = 0; i < sunIds.length; i++) {
  for (let j = i + 1; j < sunIds.length; j++) {
    const a = sunIds[i];
    const b = sunIds[j];
    const aAttrs =
      graph.getNodeAttributes(a);
    const bAttrs =
      graph.getNodeAttributes(b);

    const dx = (aAttrs.x as number) - (bAttrs.x as number);
    const dy = (aAttrs.y as number) - (bAttrs.y as number);
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 0.01) continue; // Avoid division by zero

    const force = 0.05 / (dist * dist);
    const nx = dx / dist;
    const ny = dy / dist;

    graph.setNodeAttribute(a.id, "x",
      (aAttrs.x as number) - nx * force);
    graph.setNodeAttribute(a.id, "y",
      (aAttrs.y as number) - ny * force);
    graph.setNodeAttribute(b.id, "x",
      (bAttrs.x as number) + nx * force);
    graph.setNodeAttribute(b.id, "y",
      (bAttrs.y as number) + ny * force);
  }
}
```

---

#### 5. Mouse drag handler
**File:** `src/graph/renderers/sigma2d/SigmaGraphView.tsx`  
**Lines:** 721-726  
**Function:** `handleMouseMove` inside rebuild useEffect  
**Trigger:** Mouse move event during node drag  
**Conditions:** `dragState.dragging && dragState.nodeId`  
**Math:**
```typescript
const graphCoords = sigma.viewportToGraph({
  x: e.clientX -
    sigma.getContainer().getBoundingClientRect().left,
  y: e.clientY -
    sigma.getContainer().getBoundingClientRect().top,
});

graph.setNodeAttribute(
  dragState.nodeId, "x", graphCoords.x
);
graph.setNodeAttribute(
  dragState.nodeId, "y", graphCoords.y
);
```

Also sets `fixed` attribute on drag start (line 707) and unsets on drag end (line 734).

---

### Indirect mutators (library calls that mutate positions)

#### 6. noverlap anti-collision pass
**File:** `src/graph/renderers/sigma2d/buildGraphologyGraph.ts`  
**Line:** 231  
**Function:** `buildGraphologyGraph`  
**Trigger:** Called after sunflower seed, before FA2  
**Conditions:** None  
**Math:**
```typescript
noverlap.assign(graph, {
  maxIterations: 50,
  settings: {
    ratio: 1.2,
    margin: 2,
    speed: 3,
    gridSize: 25,
    expansion: 1.5,
  },
});
```

**Note:** This is a library call that internally mutates node x/y attributes to prevent node overlap.

---

#### 7. ForceAtlas2 (FA2) layout engine
**File:** `src/graph/renderers/sigma2d/SigmaGraphView.tsx`  
**Lines:** 620-623 (initial construction), 785-797 (live-update reconstruction)  
**Function:** FA2Layout worker  
**Trigger:** 
- Initial: Sigma `afterRender` event (once after first render)
- Live-update: Sigma `afterRender` event (on physics slider changes)  
**Conditions:** None (runs continuously once started)  
**Math:** See Question 3 for full settings object

**Note:** FA2 is a force-directed layout algorithm that continuously mutates node x/y attributes based on physics simulation. It runs in a Web Worker and updates positions on each simulation tick.

---

## Question 2: Execution order on initial load

### Fresh mount of SigmaGraphView

#### 1. First effect that fires (line 205-207)
**Effect:** Sync resolvedTokens ref
```typescript
useEffect(() => {
  resolvedTokensRef.current = resolvedTokens;
});
```
**Deps:** `[resolvedTokens]` (line 207)
**Runs:** Immediately on mount
**State mutations:** Updates `resolvedTokensRef.current`
**Position mutations:** None

---

#### 2. Second effect (line 212-233)
**Effect:** v86b Ref-based uniform pipeline (rAF loop)
```typescript
useEffect(() => {
  // Contract #1: reduceMotion halts uniforms at 0.0 (except glowStrength)
  if (reduceMotion) {
    uniformsRef.current.time = 0;
    uniformsRef.current.hum = 0;
    uniformsRef.current.flowSpeed = 0;
    uniformsRef.current.glowStrength = nodeGlow ?? 1.0;
    return;
  }

  // Normal mode: animate uniforms with rAF loop
  let raf: number;
  const tick = (now: number) => {
    uniformsRef.current.time = now * 0.001;
    uniformsRef.current.hum = nodeHum ?? 0.7;
    uniformsRef.current.flowSpeed = nodeFlowSpeed ?? 0.55;
    uniformsRef.current.glowStrength = nodeGlow ?? 1.0;
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}, [reduceMotion, nodeHum, nodeFlowSpeed, nodeGlow]);
```
**Deps:** `[reduceMotion, nodeHum, nodeFlowSpeed, nodeGlow]` (line 233)
**Runs:** Immediately on mount
**State mutations:** Updates `uniformsRef.current` continuously via rAF loop
**Position mutations:** None
**Continuous:** Yes (rAF loop runs at 60fps)

---

#### 3. Third effect (line 236-293)
**Effect:** Community gravity centroid force
```typescript
useEffect(() => {
  const sigma = sigmaRef.current;
  const graph = graphRef.current;
  if (!sigma || !graph) return;

  // Remove previous handler
  if (communityGravityRef.current) {
    sigma.removeListener("afterRender", communityGravityRef.current);
  }

  if (communityGravity <= 0) {
    communityGravityRef.current = null;
    return;
  }

  const handler = () => {
    // [centroid computation and position mutation code]
  };

  communityGravityRef.current = handler;
  sigma.on("afterRender", handler);

  return () => {
    if (communityGravityRef.current) {
      sigma.removeListener("afterRender", communityGravityRef.current);
      communityGravityRef.current = null;
    }
  };
}, [communityGravity]);
```
**Deps:** `[communityGravity]` (line 293)
**Runs:** Immediately on mount
**State mutations:** None
**Position mutations:** Yes (via afterRender handler, if `communityGravity > 0`)
**Continuous:** Yes (afterRender handler fires on each frame)
**Note:** On initial mount, `sigmaRef.current` and `graphRef.current` are null, so this effect does nothing initially. It will fire again after the rebuild effect creates Sigma and graph.

---

#### 4. Fourth effect (line 296-421)
**Effect:** Solar-orbit dialect
```typescript
useEffect(() => {
  const sigma = sigmaRef.current;
  const graph = graphRef.current;
  if (!sigma || !graph) return;

  // Remove previous handler
  if (solarOrbitRef.current) {
    sigma.removeListener("afterRender", solarOrbitRef.current);
  }

  if (physicsDialect !== "solar-orbit") {
    solarOrbitRef.current = null;
    return;
  }

  const handler = () => {
    // [solar-orbit centroid pull and sun repulsion code]
  };

  solarOrbitRef.current = handler;
  sigma.on("afterRender", handler);

  return () => {
    if (solarOrbitRef.current) {
      sigma.removeListener("afterRender", solarOrbitRef.current);
      solarOrbitRef.current = null;
    }
  };
}, [physicsDialect]);
```
**Deps:** `[physicsDialect]` (line 421)
**Runs:** Immediately on mount
**State mutations:** None
**Position mutations:** Yes (via afterRender handler, if `physicsDialect === "solar-orbit"`)
**Continuous:** Yes (afterRender handler fires on each frame)
**Note:** On initial mount, `sigmaRef.current` and `graphRef.current` are null, so this effect does nothing initially. It will fire again after the rebuild effect creates Sigma and graph.

---

#### 5. Fifth effect (line 461-466)
**Effect:** Sync callback refs
```typescript
useEffect(() => {
  onSelectNodeRef.current = onSelectNode;
  onSetPathTargetRef.current = onSetPathTarget;
  onSelectEdgeRef.current = onSelectEdge;
  onClearSelectionRef.current = onClearSelection;
}, [onSelectNode, onSetPathTarget, onSelectEdge, onClearSelection]);
```
**Deps:** `[onSelectNode, onSetPathTarget, onSelectEdge, onClearSelection]` (line 466)
**Runs:** Immediately on mount
**State mutations:** Updates callback refs
**Position mutations:** None

---

#### 6. Sixth effect (line 468-773) — THE MAIN REBUILD EFFECT
**Effect:** Graph rebuild, Sigma creation, FA2 start
```typescript
useEffect(() => {
  if (!containerRef.current || nodes.length === 0) return;

  // Clear any pending debounce
  if (debounceRef.current) {
    clearTimeout(debounceRef.current);
  }

  // Debounce only the graph rebuild
  debounceRef.current = setTimeout(() => {
    const { graph, diagnostics } = buildGraphologyGraph(nodes, edges, settings);

    // Store graph for FA2 supervisor updates
    graphRef.current = graph;

    // Clear solar orbit attributes on rebuild
    graph.forEachNode((nodeId) => {
      graph.removeNodeAttribute(nodeId, "isSun");
    });

    setDebugInfo({...});

    // Apply label policy
    applyNodeLabelPolicy(graph, selectionContext, labelOptions, nodeLabelMode || "off");
    applyEdgeLabelPolicy(graph, selectionContext, labelOptions, edgeLabelMode || "off");

    // Apply selection styling policy
    applyGraphStylePolicy(graph, interactionState, styleOptions, resolvedTokens);

    if (!containerRef.current) return;

    const sigma = new Sigma(graph, containerRef.current, {
      allowInvalidContainer: true,
      renderLabels: true,
      labelFont: resolvedTokens.sigmaConfig.labelFont,
      labelSize: nodeLabelFontSize,
      labelColor: { attribute: "labelColor", color: resolvedTokens.nodeLabelColor.default },
      labelRenderedSizeThreshold: resolvedTokens.sigmaConfig.labelRenderedSizeThreshold,
      renderEdgeLabels: true,
      defaultNodeColor: resolvedTokens.nodeColor.default,
      defaultEdgeColor: resolvedTokens.edgeColor.default,
      defaultEdgeType: "line",
      enableEdgeEvents: true,
      edgeLabelFont: resolvedTokens.sigmaConfig.edgeLabelFont,
      edgeLabelSize: edgeLabelFontSize,
      edgeLabelColor: { color: resolvedTokens.edgeLabelColor.default },
      nodeProgramClasses: {
        circle: NodeSphereProgram,
      },
      defaultNodeType: "circle",
    });

    sigmaRef.current = sigma;

    (sigma as any).__uniformsRef = uniformsRef;
    cameraControllerRef.current = attachCameraController(sigma, {
      reduceMotion: reduceMotion ?? false,
    });

    (window as any).__lwSigma = sigma;
    (window as any).__lwCameraController = cameraControllerRef.current;

    // Stop any existing supervisor
    if (fa2Ref.current) {
      fa2Ref.current.stop();
      fa2Ref.current.kill();
    }

    const fa2Settings = {
      gravity: Math.max(0.001, centerForce * 0.05),
      scalingRatio: Math.max(0.1, repelForce * 0.1),
      slowDown: Math.max(1, linkDistance * 1),
      strongGravityMode,
      linLogMode,
      adjustSizes,
      barnesHutOptimize: graph.order > 150,
      barnesHutTheta,
    };

    console.log("[LW-INSTR fa2-init]", {...});

    sigma.once("afterRender", () => {
      if (fa2Ref.current) {
        fa2Ref.current.stop();
        fa2Ref.current.kill();
      }
      fa2Ref.current = new FA2Layout(graph, {
        settings: fa2Settings,
      });
      fa2Ref.current.start();

      setTimeout(() => {
        // [post-FA2 position logging]
      }, 3000);
    });

    // Camera preservation
    if (!hasInitialCameraResetRef.current) {
      sigma.getCamera().animatedReset({ duration: 0 });
      hasInitialCameraResetRef.current = true;
    }

    sigma.on("clickNode", ({ node, event }) => {...});
    sigma.on("clickEdge", ({ edge }) => {...});
    sigma.on("clickStage", () => {...});
    sigma.on("enterNode", ({ node }) => {...});
    sigma.on("leaveNode", () => {...});
    sigma.on("enterEdge", ({ edge }) => {...});
    sigma.on("leaveEdge", () => {...});

    // Node drag state
    const dragState: { dragging: boolean; nodeId: string | null } = { dragging: false, nodeId: null };

    sigma.on("downNode", (e) => {
      dragState.dragging = true;
      dragState.nodeId = e.node;
      sigma.getCamera().disable();
      if (fa2Ref.current) {
        fa2Ref.current.stop();
      }
      graph.setNodeAttribute(e.node, "fixed", true);
    });

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragState.dragging || !dragState.nodeId) return;
      const graphCoords = sigma.viewportToGraph({...});
      graph.setNodeAttribute(dragState.nodeId, "x", graphCoords.x);
      graph.setNodeAttribute(dragState.nodeId, "y", graphCoords.y);
    };

    const handleMouseUp = () => {
      if (dragState.nodeId) {
        graph.setNodeAttribute(dragState.nodeId, "fixed", false);
      }
      dragState.dragging = false;
      dragState.nodeId = null;
      sigma.getCamera().enable();
      if (fa2Ref.current) {
        fa2Ref.current.start();
      }
    };

    sigma.getContainer().addEventListener("mousemove", handleMouseMove);
    sigma.getContainer().addEventListener("mouseup", handleMouseUp);
    sigma.getContainer().addEventListener("mouseleave", handleMouseUp);

  }, 150);

  return () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (fa2Ref.current) {
      fa2Ref.current.stop();
      fa2Ref.current.kill();
      fa2Ref.current = null;
    }
    if (sigmaRef.current) {
      sigmaRef.current.kill();
      sigmaRef.current = null;
      hasInitialCameraResetRef.current = false;
    }
  }
}, [nodes, edges]);
```
**Deps:** `[nodes, edges]` (line 773)
**Runs:** After 150ms debounce on mount (when nodes/edges first arrive)
**Functions it calls:**
- `buildGraphologyGraph(nodes, edges, settings)` — Creates graph with sunflower seed positions, runs noverlap
- `applyNodeLabelPolicy` — Applies label visibility policy
- `applyEdgeLabelPolicy` — Applies edge label policy
- `applyGraphStylePolicy` — Applies styling policy
- `new Sigma(graph, containerRef.current, {...})` — Creates Sigma instance
- `attachCameraController` — Attaches camera controller
- `new FA2Layout(graph, { settings: fa2Settings })` — Creates FA2 instance
- `fa2Ref.current.start()` — Starts FA2 simulation

**State mutations:**
- Sets `graphRef.current = graph`
- Sets `sigmaRef.current = sigma`
- Sets `cameraControllerRef.current`
- Sets debug info state
- Sets `hasInitialCameraResetRef.current = true`
- Sets drag state during mouse events

**Position mutations:**
- **Sunflower seed:** `buildGraphologyGraph` sets initial x/y via `getSunflowerPosition`
- **noverlap:** `buildGraphologyGraph` runs `noverlap.assign` which mutates positions
- **FA2:** `fa2Ref.current.start()` starts continuous position mutations via FA2 worker
- **Mouse drag:** Event handlers mutate dragged node position

**Sigma instance creation:** Line 542-565
**FA2 instance creation and start:** Line 620-623 (inside sigma.once("afterRender"))

**afterRender handlers attached:**
- Line 615: `sigma.once("afterRender", ...)` — FA2 start (fires once)
- Community gravity handler (attached in separate effect, line 285)
- Solar-orbit handler (attached in separate effect, line 418)

**Anything else running in first 100ms:**
- rAF uniform loop (continuous, started in effect #2)
- Community gravity handler (attached but no-op until Sigma exists)
- Solar-orbit handler (attached but no-op until Sigma exists)

**What's running continuously at 1 second:**
- rAF uniform loop (60fps)
- FA2 worker (continuous simulation)
- Community gravity afterRender handler (if `communityGravity > 0`)
- Solar-orbit afterRender handler (if `physicsDialect === "solar-orbit"`)

**What's running continuously at 3 seconds:**
- Same as 1 second
- FA2 has been running for 3 seconds, graph should be settling

---

#### 7. Seventh effect (line 775-802) — LIVE-UPDATE FA2 EFFECT
**Effect:** Live slider updates for FA2 settings without graph rebuild
```typescript
useEffect(() => {
  if (!graphRef.current || !sigmaRef.current) return;
  if (fa2Ref.current) {
    fa2Ref.current.stop();
    fa2Ref.current.kill();
    fa2Ref.current = null;
  }
  sigmaRef.current.once("afterRender", () => {
    if (!graphRef.current) return;
    fa2Ref.current = new FA2Layout(graphRef.current, {
      settings: {
        gravity: Math.max(0.001, centerForce * 0.05),
        scalingRatio: Math.max(0.1, repelForce * 0.1),
        slowDown: Math.max(1, linkDistance * 1),
        strongGravityMode,
        linLogMode,
        adjustSizes,
        barnesHutOptimize: true,
        barnesHutTheta,
      },
    });
    fa2Ref.current.start();
  });
  sigmaRef.current.refresh();
}, [centerForce, repelForce, linkDistance,
    strongGravityMode, linLogMode, adjustSizes,
    barnesHutTheta, physicsPreset]);
```
**Deps:** `[centerForce, repelForce, linkDistance, strongGravityMode, linLogMode, adjustSizes, barnesHutTheta, physicsPreset]` (lines 800-802)
**Runs:** When any of the physics slider props change
**Functions it calls:**
- `fa2Ref.current.stop()` / `kill()` — Stops existing FA2
- `new FA2Layout(graphRef.current, { settings: {...} })` — Creates new FA2 instance
- `fa2Ref.current.start()` — Starts FA2 with new settings
- `sigmaRef.current.refresh()` — Refreshes Sigma

**State mutations:** None (only ref mutations)
**Position mutations:** Indirect (FA2 worker mutates positions)
**Note:** This effect does NOT rebuild the graph — it only updates FA2 settings. This is the intended "live-update" path for physics slider changes.

---

#### 8. Eighth effect (line 804-815)
**Effect:** Node size live update without rebuild
```typescript
useEffect(() => {
  const sigma = sigmaRef.current;
  if (!sigma) return;
  const graph = sigma.getGraph();
  graph.forEachNode((node) => {
    const attrs = graph.getNodeAttributes(node);
    const baseSize = attrs.baseSize as number;
    graph.setNodeAttribute(node, "size", baseSize * nodeSize);
  });
  sigma.refresh();
}, [nodeSize]);
```
**Deps:** `[nodeSize]` (line 815)
**Runs:** When nodeSize changes
**Position mutations:** None (only size attribute)

---

#### 9. Ninth effect (line 817-868)
**Effect:** Compute and highlight shortest path
```typescript
useEffect(() => {
  const sigma = sigmaRef.current;
  const graph = graphRef.current;
  if (!sigma || !graph) return;
  if (!selectedNodeId || !pathTargetId) return;

  const path = bidirectional(graph, selectedNodeId, pathTargetId);
  if (!path) return;

  // Highlight path nodes and edges
  [...]
  sigma.refresh();
}, [pathTargetId, selectedNodeId]);
```
**Deps:** `[pathTargetId, selectedNodeId]` (line 868)
**Runs:** When pathTargetId or selectedNodeId changes
**Position mutations:** None

---

#### 10. Tenth effect (line 870-895)
**Effect:** Clear path highlighting
```typescript
useEffect(() => {
  const sigma = sigmaRef.current;
  const graph = graphRef.current;
  if (!sigma || !graph) return;
  if (selectedNodeId !== null) return;

  applyGraphStylePolicy(...);
  sigma.refresh();
}, [selectedNodeId, selectedEdgeId, neighborhoodDepth, hoveredNodeId, hoveredEdgeId, hoverNodeColor, edgeLabelFontSize]);
```
**Deps:** `[selectedNodeId, selectedEdgeId, neighborhoodDepth, hoveredNodeId, hoveredEdgeId, hoverNodeColor, edgeLabelFontSize]` (line 895)
**Runs:** When selection or hover changes
**Position mutations:** None

---

#### 11. Eleventh effect (line 897-917)
**Effect:** ResizeObserver to handle container size changes
```typescript
useEffect(() => {
  if (!containerRef.current) return;
  
  const resizeObserver = new ResizeObserver((entries) => {
    const sigma = sigmaRef.current;
    if (!sigma) return;
    const entry = entries[0];
    if (!entry) return;
    const { width, height } = entry.contentRect;
    if (width === 0 || height === 0) return;
    sigma.resize();
    sigma.refresh();
  });
  resizeObserver.observe(containerRef.current);

  return () => {
    resizeObserver.disconnect();
  };
}, []);
```
**Deps:** `[]` (line 917)
**Runs:** Immediately on mount
**Position mutations:** None

---

#### 12. Twelfth effect (line 919-998)
**Effect:** Single selection styling effect
```typescript
useEffect(() => {
  const sigma = sigmaRef.current;
  if (!sigma) return;

  const graph = sigma.getGraph();

  const interactionState: GraphInteractionState = {...};
  const styleOptions: StylePolicyOptions = {...};

  applyGraphStylePolicy(graph, interactionState, styleOptions, resolvedTokens);

  // Update neighborhood info for debug panel
  [...]

  sigma.refresh();
}, [selectedNodeId, selectedEdgeId, neighborhoodDepth, hoveredNodeId, hoveredEdgeId, hoverNodeColor, edgeLabelFontSize, resolvedTokens]);
```
**Deps:** `[selectedNodeId, selectedEdgeId, neighborhoodDepth, hoveredNodeId, hoveredEdgeId, hoverNodeColor, edgeLabelFontSize, resolvedTokens]` (line 998)
**Runs:** When selection, hover, or styling props change
**Position mutations:** None

---

#### 13. Thirteenth effect (line 1000-1007)
**Effect:** Edge label font size live update
```typescript
useEffect(() => {
  const sigma = sigmaRef.current;
  if (!sigma) return;

  sigma.setSetting("edgeLabelSize", edgeLabelFontSize);
  sigma.refresh();
}, [edgeLabelFontSize]);
```
**Deps:** `[edgeLabelFontSize]` (line 1007)
**Runs:** When edgeLabelFontSize changes
**Position mutations:** None

---

#### 14. Fourteenth effect (line 1009-1016)
**Effect:** Node label font size live update
```typescript
useEffect(() => {
  const sigma = sigmaRef.current;
  if (!sigma) return;

  sigma.setSetting("labelSize", nodeLabelFontSize);
  sigma.refresh();
}, [nodeLabelFontSize]);
```
**Deps:** `[nodeLabelFontSize]` (line 1016)
**Runs:** When nodeLabelFontSize changes
**Position mutations:** None

---

#### 15. Fifteenth effect (line 1018-1043)
**Effect:** Label policy effect
```typescript
useEffect(() => {
  const sigma = sigmaRef.current;
  if (!sigma) return;

  const graph = sigma.getGraph();

  const selectionContext: SelectionContext = {...};
  const labelOptions: LegacyLabelPolicyOptions = {...};

  applyNodeLabelPolicy(graph, selectionContext, labelOptions, nodeLabelMode);
  applyEdgeLabelPolicy(graph, selectionContext, labelOptions, edgeLabelMode);

  sigma.refresh();
}, [selectedNodeId, selectedEdgeId, neighborhoodDepth, nodeLabelMode, edgeLabelMode, maxEdgeLabelLength, showLabelsOnHover, hoveredNodeId, hoveredEdgeId]);
```
**Deps:** `[selectedNodeId, selectedEdgeId, neighborhoodDepth, nodeLabelMode, edgeLabelMode, maxEdgeLabelLength, showLabelsOnHover, hoveredNodeId, hoveredEdgeId]` (line 1043)
**Runs:** When label-related props change
**Position mutations:** None

---

### Execution order summary

1. **Mount:** Effects 1, 2, 3, 4, 5, 11 fire immediately (refs, rAF loop, community gravity handler attach, solar-orbit handler attach, callback refs, resizeObserver)
2. **150ms later:** Effect 6 (rebuild) fires after debounce
   - Calls `buildGraphologyGraph` (sunflower seed + noverlap)
   - Creates Sigma instance
   - Attaches event handlers (click, drag, etc.)
   - Creates FA2 instance
   - Starts FA2 (inside sigma.once("afterRender"))
   - Triggers community gravity and solar-orbit handlers to actually run (now that Sigma exists)
3. **Continuous at 1 second:** rAF loop, FA2 worker, community gravity handler (if enabled), solar-orbit handler (if enabled)
4. **Continuous at 3 seconds:** Same as 1 second, FA2 has been running for 3 seconds
5. **On slider change:** Effect 7 (live-update FA2) fires, recreates FA2 with new settings without rebuilding graph

---

## Question 3: Data flow into FA2

### LayoutSettings object passed to buildGraphologyGraph

**File:** `src/graph/renderers/sigma2d/SigmaGraphView.tsx`  
**Line:** 478 (call site), 444-452 (construction)

```typescript
const settings: LayoutSettings = {
  nodeSize,
  linkDistance,
  repelForce,
  centerForce,
  physicsDialect,
  nodeColorScale: resolvedTokensRef.current?.nodeColorScale,
};

const { graph, diagnostics } = buildGraphologyGraph(nodes, edges, settings);
```

**Source of each setting:**
- `nodeSize`: Prop from SigmaGraphViewProps (line 142)
- `linkDistance`: Prop from SigmaGraphViewProps (line 143)
- `repelForce`: Prop from SigmaGraphViewProps (line 144)
- `centerForce`: Prop from SigmaGraphViewProps (line 145)
- `physicsDialect`: Prop from SigmaGraphViewProps (line 147)
- `nodeColorScale`: From `resolvedTokensRef.current?.nodeColorScale` (line 452)

**Usage in buildGraphologyGraph:**
- `nodeSize`: Line 91, 159 — Multiplies baseSize for node sizing
- `linkDistance`: Line 77 — Part of layoutScale calculation: `18 + settings.linkDistance * 0.2 + settings.repelForce * 0.08`
- `repelForce`: Line 77 — Part of layoutScale calculation
- `centerForce`: NOT used in buildGraphologyGraph (only used in SigmaGraphView for FA2)
- `physicsDialect`: Line 26 — Type field, NOT used in layout logic (comment at line 223: "Dialect-specific layout seeding: not implemented; sunflower seed stands")
- `nodeColorScale`: Lines 165-194 — Used for color assignment by centrality rank

---

### fa2Settings object (initial construction)

**File:** `src/graph/renderers/sigma2d/SigmaGraphView.tsx`  
**Lines:** 589-598

```typescript
const fa2Settings = {
  gravity: Math.max(0.001, centerForce * 0.05),
  scalingRatio: Math.max(0.1, repelForce * 0.1),
  slowDown: Math.max(1, linkDistance * 1),
  strongGravityMode,
  linLogMode,
  adjustSizes,
  barnesHutOptimize: graph.order > 150,
  barnesHutTheta,
};
```

**Source and transformation for each setting:**

1. **gravity**
   - Source: `centerForce` prop (line 145)
   - Slider config (settings.registry.ts lines 93-100): min 0, max 200, step 5
   - Schema default (settings.defaults.ts line 48): 200
   - Preset balanced (AppShell.tsx lines 89-95): centerForce: 200
   - Transformation: `Math.max(0.001, centerForce * 0.05)` — Multiplier × 0.05, floor at 0.001
   - At balanced preset: 200 * 0.05 = 10.0

2. **scalingRatio**
   - Source: `repelForce` prop (line 144)
   - Slider config (settings.registry.ts lines 84-90): min 0, max 500, step 5
   - Schema default (settings.defaults.ts line 47): 100
   - Preset balanced (AppShell.tsx lines 89-95): repelForce: 100
   - Transformation: `Math.max(0.1, repelForce * 0.1)` — Multiplier × 0.1, floor at 0.1
   - At balanced preset: 100 * 0.1 = 10.0

3. **slowDown**
   - Source: `linkDistance` prop (line 143)
   - Slider config (settings.registry.ts lines 74-81): min 1, max 20, step 0.5
   - Schema default (settings.defaults.ts line 46): 3
   - Preset balanced (AppShell.tsx lines 89-95): linkDistance: 3
   - Transformation: `Math.max(1, linkDistance * 1)` — Multiplier × 1, floor at 1
   - At balanced preset: 3 * 1 = 3

4. **strongGravityMode**
   - Source: `strongGravityMode` prop (line 148)
   - Slider config (settings.registry.ts lines 103-108): boolean
   - Schema default (settings.defaults.ts line 52): false
   - Preset balanced (AppShell.tsx lines 89-95): strongGravityMode: false
   - Transformation: None (passed directly)
   - At balanced preset: false

5. **linLogMode**
   - Source: `linLogMode` prop (line 149)
   - Slider config (settings.registry.ts lines 110-115): boolean
   - Schema default (settings.defaults.ts line 53): false
   - Preset balanced (AppShell.tsx lines 89-95): linLogMode: false
   - Transformation: None (passed directly)
   - At balanced preset: false

6. **adjustSizes**
   - Source: `adjustSizes` prop (line 150)
   - Slider config (settings.registry.ts lines 117-122): boolean
   - Schema default (settings.defaults.ts line 54): false
   - Preset balanced: Not in PRESET_VALUES (defaults to false)
   - Transformation: None (passed directly)
   - At balanced preset: false

7. **barnesHutOptimize**
   - Source: Computed: `graph.order > 150` (line 596)
   - Slider config: None (not a slider)
   - Schema default: None (computed)
   - Preset balanced: Not applicable
   - Transformation: Boolean threshold on node count
   - At balanced preset: Depends on node count (true if > 150 nodes)

8. **barnesHutTheta**
   - Source: `barnesHutTheta` prop (line 151)
   - Slider config (settings.registry.ts lines 124-132): min 0.1, max 1.2, step 0.05
   - Schema default (settings.defaults.ts line 55): 0.5
   - Preset balanced: Not in PRESET_VALUES (defaults to 0.5)
   - Transformation: None (passed directly)
   - At balanced preset: 0.5

---

### fa2Settings object (live-update reconstruction)

**File:** `src/graph/renderers/sigma2d/SigmaGraphView.tsx`  
**Lines:** 786-795

```typescript
settings: {
  gravity: Math.max(0.001, centerForce * 0.05),
  scalingRatio: Math.max(0.1, repelForce * 0.1),
  slowDown: Math.max(1, linkDistance * 1),
  strongGravityMode,
  linLogMode,
  adjustSizes,
  barnesHutOptimize: true,
  barnesHutTheta,
}
```

**Difference from initial construction:**
- `barnesHutOptimize`: Hardcoded to `true` (line 793) instead of `graph.order > 150`
- All other settings: Identical to initial construction

**Note:** The live-update effect hardcodes `barnesHutOptimize: true` regardless of node count, which is different from the initial construction that uses `graph.order > 150`. This is an inconsistency.

---

### noverlap.assign() settings

**File:** `src/graph/renderers/sigma2d/buildGraphologyGraph.ts`  
**Lines:** 231-240

```typescript
noverlap.assign(graph, {
  maxIterations: 50,
  settings: {
    ratio: 1.2,
    margin: 2,
    speed: 3,
    gridSize: 25,
    expansion: 1.5,
  },
});
```

**Source of each setting:**
- All settings: Hardcoded constants (not from sliders or schema)
- No transformation from user-facing settings
- Runs after sunflower seed, before FA2

**Note:** noverlap is an anti-collision pass that nudges nodes apart. It runs once during graph construction, not continuously.

---

## Question 4: Ghost controls inventory

### physics.nodeSize
**Slider config (settings.registry.ts lines 64-71):**
```typescript
{
  type: "range",
  category: "Physics",
  path: "physics.nodeSize",
  label: "Node Size",
  min: 0.25,
  max: 4,
  step: 0.05,
}
```

**Where it's read and applied:**
- `buildGraphologyGraph` line 91: `size: ((node.raw?.size as number) ?? baseSize) * settings.nodeSize`
- `buildGraphologyGraph` line 159: `newSize * settings.nodeSize`
- `SigmaGraphView.tsx` line 804-815: Node size live update effect — `graph.setNodeAttribute(node, "size", baseSize * nodeSize)`

**Affects layout:** Yes — affects node visual size, not position. NOT a ghost control.

---

### physics.linkDistance
**Slider config (settings.registry.ts lines 74-81):**
```typescript
{
  type: "range",
  category: "Physics",
  path: "physics.linkDistance",
  label: "Simulation Speed",
  description: "Controls simulation convergence speed. Higher values slow movement and increase stability. Lower values create faster, more chaotic movement.",
  min: 1,
  max: 20,
  step: 0.5,
}
```

**Schema default (settings.defaults.ts line 46):** 3  
**Preset balanced (AppShell.tsx line 92):** 3

**Where it's read and applied:**
- `buildGraphologyGraph` line 77: Part of layoutScale calculation — `18 + settings.linkDistance * 0.2 + settings.repelForce * 0.08`
- `SigmaGraphView.tsx` line 592: `slowDown: Math.max(1, linkDistance * 1)` — Passed to FA2
- `SigmaGraphView.tsx` line 789: `slowDown: Math.max(1, linkDistance * 1)` — Passed to FA2 (live-update)

**Affects layout:** Yes — affects sunflower seed scale AND FA2 slowDown. NOT a ghost control.

**Note:** The label says "Simulation Speed" but the variable name is `linkDistance`. This is confusing but the value does affect layout.

---

### physics.repelForce
**Slider config (settings.registry.ts lines 84-90):**
```typescript
{
  type: "range",
  category: "Physics",
  path: "physics.repelForce",
  label: "Repel Force",
  min: 0,
  max: 500,
  step: 5,
}
```

**Schema default (settings.defaults.ts line 47):** 100  
**Preset balanced (AppShell.tsx line 90):** 100

**Where it's read and applied:**
- `buildGraphologyGraph` line 77: Part of layoutScale calculation — `18 + settings.linkDistance * 0.2 + settings.repelForce * 0.08`
- `SigmaGraphView.tsx` line 591: `scalingRatio: Math.max(0.1, repelForce * 0.1)` — Passed to FA2
- `SigmaGraphView.tsx` line 788: `scalingRatio: Math.max(0.1, repelForce * 0.1)` — Passed to FA2 (live-update)

**Affects layout:** Yes — affects sunflower seed scale AND FA2 repulsion. NOT a ghost control.

---

### physics.centerForce
**Slider config (settings.registry.ts lines 93-100):**
```typescript
{
  type: "range",
  category: "Physics",
  path: "physics.centerForce",
  label: "Center Force",
  description: "Controls attraction to graph center.",
  min: 0,
  max: 200,
  step: 5,
}
```

**Schema default (settings.defaults.ts line 48):** 200  
**Preset balanced (AppShell.tsx line 91):** 200

**Where it's read and applied:**
- `SigmaGraphView.tsx` line 590: `gravity: Math.max(0.001, centerForce * 0.05)` — Passed to FA2
- `SigmaGraphView.tsx` line 787: `gravity: Math.max(0.001, centerForce * 0.05)` — Passed to FA2 (live-update)

**Affects layout:** Yes — affects FA2 gravity. NOT a ghost control.

**Note:** NOT used in buildGraphologyGraph (only used in SigmaGraphView for FA2).

---

### physics.communityGravity
**Slider config (settings.registry.ts lines 134-142):**
```typescript
{
  type: "range",
  category: "Physics",
  path: "physics.communityGravity",
  label: "Community Gravity",
  description: "Extra gravitational pull toward cluster centroid. Tightens neighborhoods.",
  min: 0,
  max: 5,
  step: 0.1,
}
```

**Schema default (settings.defaults.ts line 49):** 0.5

**Where it's read and applied:**
- `SigmaGraphView.tsx` line 152: Prop destructuring — `communityGravity = 0`
- `SigmaGraphView.tsx` line 246: Condition check — `if (communityGravity <= 0)`
- `SigmaGraphView.tsx` line 272: Strength calculation — `const strength = communityGravity * 0.0008`
- `SigmaGraphView.tsx` line 293: Effect deps — `[communityGravity]`

**Affects layout:** Yes — affects community gravity handler that pulls nodes toward cluster centroids. NOT a ghost control.

**Note:** Default prop value is 0 (line 152), which disables the handler by default. Schema default is 0.5 but prop default overrides it.

---

### physics.physicsDialect
**Slider config (settings.registry.ts lines 52-62):**
```typescript
{
  type: "select",
  category: "Physics",
  path: "physics.physicsDialect",
  label: "Physics Dialect",
  description: "Layout algorithm and shape",
  options: [
    { value: "default", label: "Default (Force-Directed)" },
    { value: "helix", label: "Helix (Brand Shape)" },
    { value: "solar-orbit", label: "Solar Orbit" },
  ],
}
```

**Schema default (settings.defaults.ts line 50):** `"helix"` (note: helix dispatch was removed in previous pass)

**Where it's read and applied:**
- `buildGraphologyGraph` line 26: Type field in LayoutSettings — `physicsDialect: "default" | "helix" | "solar-orbit"`
- `buildGraphologyGraph` line 223: Comment — "Dialect-specific layout seeding: not implemented; sunflower seed stands"
- `SigmaGraphView.tsx` line 147: Prop destructuring
- `SigmaGraphView.tsx` line 306: Condition check — `if (physicsDialect !== "solar-orbit")`
- `SigmaGraphView.tsx` line 421: Effect deps — `[physicsDialect]`

**Affects layout:** PARTIALLY — Only "solar-orbit" mode is implemented. "default" and "helix" do nothing different (sunflower seed is always used). The "helix" dispatch was removed in a previous pass. This is a PARTIAL GHOST CONTROL (2 of 3 options do nothing).

---

### physics.strongGravityMode
**Slider config (settings.registry.ts lines 103-108):**
```typescript
{
  type: "boolean",
  category: "Physics",
  path: "physics.strongGravityMode",
  label: "Strong Gravity Mode",
  description: "Enables stronger gravity force for more compact layouts.",
}
```

**Schema default (settings.defaults.ts line 52):** false  
**Preset balanced (AppShell.tsx line 93):** false

**Where it's read and applied:**
- `SigmaGraphView.tsx` line 148: Prop destructuring
- `SigmaGraphView.tsx` line 593: Passed directly to FA2 — `strongGravityMode`
- `SigmaGraphView.tsx` line 790: Passed directly to FA2 (live-update) — `strongGravityMode`

**Affects layout:** Yes — passed to FA2 as a setting. NOT a ghost control.

---

### physics.linLogMode
**Slider config (settings.registry.ts lines 110-115):**
```typescript
{
  type: "boolean",
  category: "Physics",
  path: "physics.linLogMode",
  label: "Lin-Log Mode",
  description: "Uses logarithmic attraction for better edge distribution.",
}
```

**Schema default (settings.defaults.ts line 53):** false  
**Preset balanced (AppShell.tsx line 94):** false  
**Preset organic (AppShell.tsx line 115):** true

**Where it's read and applied:**
- `SigmaGraphView.tsx` line 149: Prop destructuring
- `SigmaGraphView.tsx` line 594: Passed directly to FA2 — `linLogMode`
- `SigmaGraphView.tsx` line 791: Passed directly to FA2 (live-update) — `linLogMode`

**Affects layout:** Yes — passed to FA2 as a setting. NOT a ghost control.

---

### physics.adjustSizes
**Slider config (settings.registry.ts lines 117-122):**
```typescript
{
  type: "boolean",
  category: "Physics",
  path: "physics.adjustSizes",
  label: "Adjust Sizes",
  description: "Allows FA2 to adjust node sizes during simulation.",
}
```

**Schema default (settings.defaults.ts line 54):** false

**Where it's read and applied:**
- `SigmaGraphView.tsx` line 150: Prop destructuring
- `SigmaGraphView.tsx` line 595: Passed directly to FA2 — `adjustSizes`
- `SigmaGraphView.tsx` line 792: Passed directly to FA2 (live-update) — `adjustSizes`

**Affects layout:** Yes — passed to FA2 as a setting. NOT a ghost control.

---

### physics.barnesHutTheta
**Slider config (settings.registry.ts lines 124-132):**
```typescript
{
  type: "range",
  category: "Physics",
  path: "physics.barnesHutTheta",
  label: "Barnes-Hut Theta",
  description: "Accuracy/performance tradeoff for Barnes-Hut approximation.",
  min: 0.1,
  max: 1.2,
  step: 0.05,
}
```

**Schema default (settings.defaults.ts line 55):** 0.5

**Where it's read and applied:**
- `SigmaGraphView.tsx` line 151: Prop destructuring
- `SigmaGraphView.tsx` line 597: Passed directly to FA2 — `barnesHutTheta`
- `SigmaGraphView.tsx` line 794: Passed directly to FA2 (live-update) — `barnesHutTheta`

**Affects layout:** Yes — passed to FA2 as a setting. NOT a ghost control.

---

### physics.physicsPreset
**Slider config (settings.registry.ts lines 37-50):**
```typescript
{
  type: "select",
  category: "Physics",
  path: "physics.physicsPreset",
  label: "Physics Preset",
  description: "Quick preset configurations for common graph layouts.",
  options: [
    { value: "custom", label: "Custom" },
    { value: "balanced", label: "Balanced" },
    { value: "spread", label: "Spread Out" },
    { value: "tight", label: "Tight Clusters" },
    { value: "organic", label: "Organic Flow" },
    { value: "performance", label: "Performance" },
  ],
}
```

**Schema default (settings.defaults.ts line 43):** "balanced"

**Where it's read and applied:**
- `SigmaGraphView.tsx` line 146: Prop destructuring
- `SigmaGraphView.tsx` line 802: Effect deps — `physicsPreset` (live-update FA2 effect)

**Affects layout:** INDIRECTLY — It's in the deps array of the live-update FA2 effect, so changing the preset triggers FA2 recreation. However, the preset values themselves (PRESET_VALUES in AppShell.tsx) are NOT automatically applied to the sliders. The preset only triggers FA2 recreation with current slider values. This is a PARTIAL GHOST CONTROL (preset values exist but are not auto-applied).

---

### physics.qualityPreset
**Note:** This exists in schema (settings.schema.ts line 83) but there is NO slider for it in settings.registry.ts. It's used in the performance.qualityPreset field instead (settings.schema.ts line 121). This appears to be a DUPLICATE or MIGRATED field.

---

### physics.simulationSpeed
**Does not exist** in schema, registry, or defaults. Not a control.

---

### Summary of ghost controls

**TRUE GHOST CONTROLS (do not affect layout):**
- None found — all physics controls affect layout in some way

**PARTIAL GHOST CONTROLS (some options/values do nothing):**
- `physics.physicsDialect` — "default" and "helix" options do nothing (only "solar-orbit" is implemented)
- `physics.physicsPreset` — Preset values exist but are not auto-applied to sliders (only triggers FA2 recreation)

**NON-GHOST CONTROLS (fully functional):**
- `physics.nodeSize` — Affects node size
- `physics.linkDistance` — Affects sunflower seed scale AND FA2 slowDown
- `physics.repelForce` — Affects sunflower seed scale AND FA2 repulsion
- `physics.centerForce` — Affects FA2 gravity
- `physics.communityGravity` — Affects community gravity handler
- `physics.strongGravityMode` — Affects FA2
- `physics.linLogMode` — Affects FA2
- `physics.adjustSizes` — Affects FA2
- `physics.barnesHutTheta` — Affects FA2

---

## Question 5: Minimal physics architecture

### Minimal pipeline

```
user-facing nodes/edges → sunflower seed → FA2 → render
```

### Components to remove

#### 1. noverlap pass
**File:** `src/graph/renderers/sigma2d/buildGraphologyGraph.ts`  
**Lines:** 231-240

```typescript
noverlap.assign(graph, {
  maxIterations: 50,
  settings: {
    ratio: 1.2,
    margin: 2,
    speed: 3,
    gridSize: 25,
    expansion: 1.5,
  },
});
```

**Currently doing:** Anti-collision pass that nudges nodes apart after sunflower seed, before FA2  
**Visible to user:** No — it runs once during graph construction, not visible as a separate feature  
**Would removing it break user-facing functionality:** No — FA2 can handle collision avoidance on its own  
**Dead code:** No — it runs during graph construction  
**Conflicts with FA2:** No — it runs before FA2, not fighting over positions  
**Recommendation:** Can be safely removed to simplify pipeline

---

#### 2. community gravity handler
**File:** `src/graph/renderers/sigma2d/SigmaGraphView.tsx`  
**Lines:** 236-293

```typescript
useEffect(() => {
  const sigma = sigmaRef.current;
  const graph = graphRef.current;
  if (!sigma || !graph) return;

  // Remove previous handler
  if (communityGravityRef.current) {
    sigma.removeListener("afterRender", communityGravityRef.current);
  }

  if (communityGravity <= 0) {
    communityGravityRef.current = null;
    return;
  }

  const handler = () => {
    // [centroid computation and position mutation]
  };

  communityGravityRef.current = handler;
  sigma.on("afterRender", handler);

  return () => {
    if (communityGravityRef.current) {
      sigma.removeListener("afterRender", communityGravityRef.current);
      communityGravityRef.current = null;
    }
  };
}, [communityGravity]);
```

**Currently doing:** Pulls nodes toward cluster centroids on each afterRender  
**Visible to user:** Yes — when `communityGravity > 0`, nodes are pulled toward cluster centroids  
**Would removing it break user-facing functionality:** Yes — users would lose the ability to tighten neighborhoods via the Community Gravity slider  
**Dead code:** No — controlled by `communityGravity > 0` condition  
**Conflicts with FA2:** YES — It fights with FA2 over positions (both mutate x/y on each frame)  
**Recommendation:** Keep for user-facing functionality, but note it conflicts with FA2

---

#### 3. solar-orbit handler
**File:** `src/graph/renderers/sigma2d/SigmaGraphView.tsx`  
**Lines:** 296-421

```typescript
useEffect(() => {
  const sigma = sigmaRef.current;
  const graph = graphRef.current;
  if (!sigma || !graph) return;

  // Remove previous handler
  if (solarOrbitRef.current) {
    sigma.removeListener("afterRender", solarOrbitRef.current);
  }

  if (physicsDialect !== "solar-orbit") {
    solarOrbitRef.current = null;
    return;
  }

  const handler = () => {
    // [solar-orbit centroid pull and sun repulsion]
  };

  solarOrbitRef.current = handler;
  sigma.on("afterRender", handler);

  return () => {
    if (solarOrbitRef.current) {
      sigma.removeListener("afterRender", solarOrbitRef.current);
      solarOrbitRef.current = null;
    }
  };
}, [physicsDialect]);
```

**Currently doing:** Solar-orbit layout (centroid pull + sun repulsion) when `physicsDialect === "solar-orbit"`  
**Visible to user:** Yes — when solar-orbit dialect is selected  
**Would removing it break user-facing functionality:** Yes — users would lose the solar-orbit layout option  
**Dead code:** PARTIALLY — "default" and "helix" dialects do nothing (only "solar-orbit" is implemented)  
**Conflicts with FA2:** YES — It fights with FA2 over positions (both mutate x/y on each frame)  
**Recommendation:** Keep for user-facing functionality, but note it conflicts with FA2 and that "default"/"helix" options are dead code

---

#### 4. helix dispatch (already removed but included for completeness)
**File:** `src/graph/renderers/sigma2d/buildGraphologyGraph.ts`  
**Status:** Removed in previous pass (vP-physics-remove-helix-dispatch)  
**Currently doing:** Nothing (comment at line 223: "Dialect-specific layout seeding: not implemented; sunflower seed stands")  
**Visible to user:** No  
**Would removing it break user-facing functionality:** No  
**Dead code:** YES — helix dispatch functions were deleted, but physicsDialect still has "helix" option  
**Conflicts with FA2:** No  
**Recommendation:** Already removed, but physicsDialect "helix" option is now dead code

---

#### 5. physicsDialect-related code
**File:** Multiple (settings.schema.ts, settings.registry.ts, settings.defaults.ts, SigmaGraphView.tsx, buildGraphologyGraph.ts)

**Currently doing:** 
- Type field in LayoutSettings (buildGraphologyGraph line 26)
- Condition check in solar-orbit handler (SigmaGraphView line 306)
- Slider option in UI (settings.registry lines 52-62)
- Schema default (settings.defaults line 50)

**Visible to user:** Partially — only "solar-orbit" option works, "default" and "helix" do nothing  
**Would removing it break user-facing functionality:** No — "default" and "helix" are already dead, "solar-orbit" could be moved to a separate flag  
**Dead code:** YES — "default" and "helix" options are dead  
**Conflicts with FA2:** No  
**Recommendation:** Remove "default" and "helix" options, rename physicsDialect to a boolean flag for solar-orbit mode

---

### Summary of minimal pipeline requirements

To achieve the minimal pipeline (sunflower seed → FA2 → render), the following would need to be removed:

1. **noverlap pass** (buildGraphologyGraph lines 231-240) — Can be safely removed
2. **community gravity handler** (SigmaGraphView lines 236-293) — Keep for user functionality, but note conflict with FA2
3. **solar-orbit handler** (SigmaGraphView lines 296-421) — Keep for user functionality, but note conflict with FA2
4. **physicsDialect dead code** — Remove "default" and "helix" options, simplify to boolean flag

**Note:** The community gravity and solar-orbit handlers are user-facing features that intentionally fight with FA2 to provide alternative layout behaviors. They are not "broken" but they are not part of the minimal FA2-only pipeline.

---

## Additional Findings

### Duplicate code paths

1. **FA2 kill/recreate in two places**
   - Location 1: SigmaGraphView lines 617-623 (inside rebuild effect, sigma.once("afterRender"))
   - Location 2: SigmaGraphView lines 778-797 (live-update effect, sigma.once("afterRender"))
   - Both stop/kill existing FA2, create new FA2, start it
   - This is intentional (live-update path for slider changes), not a bug

2. **barnesHutOptimize inconsistency**
   - Initial construction (line 596): `barnesHutOptimize: graph.order > 150`
   - Live-update reconstruction (line 793): `barnesHutOptimize: true` (hardcoded)
   - This is a real inconsistency — live-update always uses Barnes-Hut regardless of node count

---

### Stale comments that contradict current code

1. **buildGraphologyGraph line 76-77 comment**
   ```typescript
   const layoutScale =
     18 + settings.linkDistance * 0.2 + settings.repelForce * 0.08;
   ```
   No comment explaining the formula or why these multipliers are used

2. **buildGraphologyGraph line 223 comment**
   ```typescript
   // Dialect-specific layout seeding: not implemented; sunflower seed stands
   ```
   This comment is accurate but suggests that dialect-specific seeding might be added later

3. **settings.registry line 76 label**
   ```typescript
   label: "Simulation Speed",
   ```
   But the variable is named `linkDistance`. This is confusing.

---

### TODO/FIXME comments in physics-related files

None found in the files examined.

---

### Effects with deps arrays that don't match what they reference

1. **Effect line 461-466** (callback refs)
   - Deps: `[onSelectNode, onSetPathTarget, onSelectEdge, onClearSelection]`
   - References: All four callbacks are referenced in the effect body
   - Status: Correct

2. **Effect line 919-998** (selection styling)
   - Deps: `[selectedNodeId, selectedEdgeId, neighborhoodDepth, hoveredNodeId, hoveredEdgeId, hoverNodeColor, edgeLabelFontSize, resolvedTokens]`
   - References: All deps are referenced in the effect body
   - Status: Correct

3. **Effect line 1018-1043** (label policy)
   - Deps: `[selectedNodeId, selectedEdgeId, neighborhoodDepth, nodeLabelMode, edgeLabelMode, maxEdgeLabelLength, showLabelsOnHover, hoveredNodeId, hoveredEdgeId]`
   - References: All deps are referenced in the effect body
   - Status: Correct

No deps mismatches found.

---

### Imports of modules that aren't used in any function body

None found in the files examined. All imports are used.

---

### Settings group fields that exist in the schema but are never read

1. **physics.qualityPreset** (settings.schema.ts line 83)
   - Exists in physics.qualityPreset
   - Also exists in performance.qualityPreset (settings.schema.ts line 121)
   - No slider in settings.registry.ts for physics.qualityPreset
   - Appears to be a duplicate or migrated field
   - Recommendation: Remove from physics group, keep only in performance group

---

### Other surprising findings

1. **physicsDialect default mismatch**
   - Schema default (settings.defaults line 50): `"helix"`
   - But helix dispatch was removed in previous pass
   - Default should be `"default"` or `"solar-orbit"` to match actual functionality

2. **communityGravity prop default mismatch**
   - Prop default (SigmaGraphView line 152): `0`
   - Schema default (settings.defaults line 49): `0.5`
   - Prop default overrides schema default, so community gravity is disabled by default even though schema says it should be 0.5

3. **linkDistance label confusion**
   - Slider label: "Simulation Speed"
   - Variable name: `linkDistance`
   - This suggests the variable was renamed but the label wasn't updated, or vice versa

4. **Instrumentation logs still in place**
   - Console logs from vP-physics-instrument-positions are still in the code
   - These are intentional diagnostic tools, not accidental

5. **physicsPreset in live-update deps but preset values not auto-applied**
   - physicsPreset is in deps array of live-update FA2 effect (line 802)
   - But changing preset doesn't auto-apply PRESET_VALUES to sliders
   - Preset only triggers FA2 recreation with current slider values
   - This is confusing UX — preset should either auto-apply values or not be in deps

---

## Conclusion

The physics system has multiple position mutators running simultaneously:
- Sunflower seed (one-time)
- noverlap (one-time)
- FA2 (continuous)
- Community gravity (continuous, if enabled)
- Solar-orbit (continuous, if dialect selected)
- Mouse drag (on interaction)

The minimal pipeline (sunflower seed → FA2 → render) is achievable by removing noverlap and the optional handlers, but the handlers are user-facing features that intentionally conflict with FA2 to provide alternative layout behaviors.

The barnesHutOptimize inconsistency between initial construction and live-update is a real bug that should be fixed.

The physicsDialect "default" and "helix" options are dead code that should be removed.
