# Future Visual Handles Taxonomy

## Purpose

This is the future taxonomy for all 2D/3D visual development handles. The TypeScript registry (`src/control-plane/handles/handleset.registry.ts`) intentionally remains smaller and focused on current, active, partial, internal, and near-term planned handles. This taxonomy is a map for future phases.

**Important:** Do not add UI controls, do not implement runtime behavior, do not wire settings, do not bloat the source registry with every future handle.

---

## 1. 2D Renderer Handles

**Status:** planned

**Proposed Handles:**
- renderer2d.antialiasing - Enable/disable antialiasing for 2D renderer
- renderer2d.pixelRatio - Device pixel ratio for high-DPI displays
- renderer2d.minZoom - Minimum zoom level
- renderer2d.maxZoom - Maximum zoom level
- renderer2d.zoomSensitivity - Zoom sensitivity multiplier
- renderer2d.panSensitivity - Pan sensitivity multiplier
- renderer2d.enableEdgeCurving - Enable curved edges instead of straight lines
- renderer2d.edgeCurvature - Edge curvature amount
- renderer2d.enableArrowheads - Show arrowheads on directed edges
- renderer2d.arrowheadSize - Arrowhead size

**Purpose:** Control 2D Sigma/graphology renderer behavior and quality settings.

**Dependencies:** Stable 2D renderer, Sigma configuration.

**Do-not-implement-yet:** Until 2D renderer is stable and baseline features are complete.

---

## 2. Node Visual Handles

**Status:** planned

**Proposed Handles:**
- nodeVisual.borderColor - Node border color
- nodeVisual.borderWidth - Node border width
- nodeVisual.borderOpacity - Node border opacity
- nodeVisual.shadowEnabled - Enable node shadow/glow
- nodeVisual.shadowColor - Node shadow color
- nodeVisual.shadowBlur - Node shadow blur amount
- nodeVisual.shape - Node shape (circle, square, diamond, hexagon)
- nodeVisual.iconEnabled - Enable node icons
- nodeVisual.iconSize - Node icon size
- nodeVisual.gradientEnabled - Enable node gradient fill
- nodeVisual.gradientColors - Node gradient color stops

**Purpose:** Control node visual appearance beyond basic color and size.

**Dependencies:** Theme token system, stable 2D renderer.

**Do-not-implement-yet:** Until theme token system is implemented.

---

## 3. Edge Visual Handles

**Status:** planned

**Proposed Handles:**
- edgeVisual.borderEnabled - Enable edge border
- edgeVisual.borderColor - Edge border color
- edgeVisual.borderWidth - Edge border width
- edgeVisual.dashEnabled - Enable dashed edges
- edgeVisual.dashPattern - Edge dash pattern (array of lengths)
- edgeVisual.dashGap - Edge dash gap
- edgeVisual.arrowheadEnabled - Enable edge arrowheads
- edgeVisual.arrowheadPosition - Arrowhead position (source, target, middle)
- edgeVisual.arrowheadSize - Arrowhead size
- edgeVisual.opacity - Edge opacity
- edgeVisual.widthVariance - Edge width variance based on weight

**Purpose:** Control edge visual appearance beyond basic color and size.

**Dependencies:** Theme token system, stable 2D renderer.

**Do-not-implement-yet:** Until theme token system is implemented.

---

## 4. Label Handles

**Status:** planned (some active, see handleset.registry.ts)

**Proposed Handles:**
- label.fontFamily - Label font family
- label.fontWeight - Label font weight (normal, bold, etc.)
- label.fontStyle - Label font style (normal, italic)
- label.textDecoration - Label text decoration (underline, etc.)
- label.textShadowEnabled - Enable label text shadow
- label.textShadowColor - Label shadow color
- label.textShadowBlur - Label shadow blur
- label.backgroundEnabled - Enable label background
- label.backgroundColor - Label background color
- label.backgroundPadding - Label background padding
- label.borderRadius - Label border radius
- label.opacity - Label opacity
- label.maxWidth - Label maximum width before wrapping
- label.lineHeight - Label line height
- label.horizontalOffset - Label horizontal offset from node
- label.verticalOffset - Label vertical offset from node

**Purpose:** Control label typography, styling, and positioning.

**Dependencies:** Theme token system, stable label policy.

**Do-not-implement-yet:** Until theme token system is implemented and label policy is stable.

---

## 5. Neighborhood / Depth Handles

**Status:** planned (some active, see handleset.registry.ts)

**Proposed Handles:**
- neighborhood.progressiveDepth - Decimal depth slider (1.0, 1.5, 2.0, etc.)
- neighborhood.depthDecay - Depth decay function (linear, exponential, custom)
- neighborhood.includeSource - Include source node in neighborhood
- neighborhood.includeTarget - Include target node in neighborhood
- neighborhood.bidirectional - Bidirectional neighborhood traversal
- neighborhood.maxNodes - Maximum nodes in neighborhood
- neighborhood.excludeSelf - Exclude self from neighborhood
- neighborhood.weightedDistance - Use weighted distance for neighborhood

**Purpose:** Control neighborhood traversal and depth behavior.

**Dependencies:** Stable integer depth, depth computation refactoring.

**Do-not-implement-yet:** Until integer depth is stable and proven.

---

## 6. Cluster Gravity / Color-Coded Neighborhood Handles

**Status:** planned

**Proposed Handles:**
- clusterGravity.enabled - Enable cluster gravity visualization
- clusterGravity.strength - Cluster gravity strength
- clusterGravity.maxRadius - Maximum cluster radius
- clusterGravity.colorPalette - Cluster color palette
- clusterGravity.overlapMode - Cluster overlap mode (blend, stripe, prioritize-strongest, mixed-halo)
- clusterGravity.minImportance - Minimum importance for cluster anchor
- clusterGravity.labelEnabled - Show cluster labels
- clusterGravity.labelFontSize - Cluster label font size
- clusterGravity.boundaryEnabled - Show cluster boundaries
- clusterGravity.boundaryColor - Cluster boundary color
- clusterGravity.boundaryWidth - Cluster boundary width

**Purpose:** Control cluster gravity and color-coded neighborhood visualization.

**Dependencies:** Importantness/weighting model, theme token system, stable depth/neighborhood traversal.

**Do-not-implement-yet:** Until stable integer depth/neighborhood traversal is proven and theme token system is implemented.

---

## 7. Importance / Weighting Handles

**Status:** planned

**Proposed Handles:**
- importance.algorithm - Importance algorithm (degree, centrality, pagerank, custom)
- importance.weightDecay - Weight decay function
- importance.minThreshold - Minimum importance threshold
- importance.maxThreshold - Maximum importance threshold
- importance.normalize - Normalize importance scores
- importance.confidenceWeight - Weight for confidence score in importance
- importance.degreeWeight - Weight for degree in importance
- importance.centralityWeight - Weight for centrality in importance

**Purpose:** Control importance/weighting computation for nodes and edges.

**Dependencies:** Graph normalization, centrality algorithms, importance data from graph artifacts.

**Do-not-implement-yet:** Until graph normalization includes importance data and centrality algorithms are implemented.

---

## 8. 2D Physics / Layout Handles

**Status:** planned (some active, see handleset.registry.ts)

**Proposed Handles:**
- physics2d.gravity - Gravity force strength
- physics2d.centerForce - Center gravity force
- physics2d.edgeWeightInfluence - Edge weight influence on layout
- physics2d.nodeWeightInfluence - Node weight influence on layout
- physics2d.clusteringEnabled - Enable clustering in layout
- physics2d.clusteringForce - Clustering force strength
- physics2d.layoutAlgorithm - Layout algorithm (force-directed, circular, grid, hierarchical)
- physics2d.iterations - Number of layout iterations
- physics2d.convergenceThreshold - Convergence threshold for layout
- physics2d.enableSimulation - Enable continuous simulation
- physics2d.simulationSpeed - Simulation speed multiplier

**Purpose:** Control 2D physics and layout behavior.

**Dependencies:** Stable 2D renderer, Sigma layout configuration.

**Do-not-implement-yet:** Until 2D renderer is stable and baseline features are complete.

---

## 9. Layout Lens Handles

**Status:** planned

**Proposed Handles:**
- layoutLens.activeLens - Active layout lens (constellation, district, solar-orbit, helix, pipeline, impact-rings, chord, matrix)
- layoutLens.autoRotate - Auto-rotate layout
- layoutLens.rotationSpeed - Rotation speed
- layoutLens.groupBy - Group nodes by (community, type, importance)
- layoutLens.sortBy - Sort nodes by (degree, importance, name)
- layoutLens.packMode - Pack mode (tight, loose, radial)
- layoutLens.showLabels - Show labels in layout lens
- layoutLens.showEdges - Show edges in layout lens

**Purpose:** Control semantic layout lenses for different visualization perspectives.

**Dependencies:** Stable 2D renderer, layout algorithms, community detection.

**Do-not-implement-yet:** Until stable 2D renderer is proven and layout algorithms are implemented.

---

## 10. 3D Renderer Handles

**Status:** very-low-priority

**Proposed Handles:**
- renderer3d.enabled - Enable 3D renderer
- renderer3d.cameraPosition - Camera position (x, y, z)
- renderer3d.cameraTarget - Camera look-at target
- renderer3d.cameraFov - Camera field of view
- renderer3d.cameraNear - Camera near clipping plane
- renderer3d.cameraFar - Camera far clipping plane
- renderer3d.orthoEnabled - Enable orthographic projection
- renderer3d.shadowsEnabled - Enable shadows
- renderer3d.reflectionsEnabled - Enable reflections
- renderer3d.postProcessingEnabled - Enable post-processing effects
- renderer3d.ambientLight - Ambient light intensity
- renderer3d.directionalLight - Directional light settings

**Purpose:** Control 3D Three.js renderer behavior.

**Dependencies:** Stable 2D renderer, Three.js/React Three Fiber integration.

**Do-not-implement-yet:** Until 2D renderer is stable and mature, and explicit user demand exists.

---

## 11. 3D Physics Handles

**Status:** very-low-priority

**Proposed Handles:**
- physics3d.gravity - 3D gravity force
- physics3d.nodeMass - Node mass in 3D
- physics3d.edgeStiffness - Edge stiffness in 3D
- physics3d.damping - Damping factor
- physics3d.timeStep - Simulation time step
- physics3d.subSteps - Physics sub-steps per frame
- physics3d.enableCollisions - Enable node collisions
- physics3d.collisionRadius - Collision radius

**Purpose:** Control 3D physics simulation behavior.

**Dependencies:** 3D renderer, physics engine (Cannon.js, Ammo.js, etc.).

**Do-not-implement-yet:** Until 3D renderer is implemented and physics engine is integrated.

---

## 12. Theme Preset Handles

**Status:** planned

**Proposed Handles:**
- theme.activePreset - Active theme preset ID
- theme.customPresets - Array of custom theme presets
- theme.builtInPresets - Array of built-in theme presets
- theme.exportFormat - Export format (JSON, CSS)
- theme.importSource - Import source (file, URL, clipboard)

**Purpose:** Control theme preset selection and management.

**Dependencies:** Theme preset model, theme token system, theme editor UI.

**Do-not-implement-yet:** Until theme preset model is implemented.

---

## 13. Panel / Cockpit Handles

**Status:** planned

**Proposed Handles:**
- cockpit.leftRailMode - Left rail mode (expanded, collapsed, hidden)
- cockpit.rightRailMode - Right rail mode (expanded, collapsed, hidden)
- cockpit.topBarMode - Top bar mode (expanded, collapsed, hidden)
- cockpit.bottomBarMode - Bottom bar mode (expanded, collapsed, hidden)
- cockpit.panelResizable - Enable panel resizing
- cockpit.panelDraggable - Enable panel dragging
- cockpit.panelSnapToEdges - Enable panel snap to edges
- cockpit.layoutPreset - Active layout preset (default, focus, debug, inspector, qa)
- cockpit.autoHidePanels - Auto-hide panels on interaction

**Purpose:** Control cockpit layout and panel behavior.

**Dependencies:** Layout system, panel components.

**Do-not-implement-yet:** Until layout system is implemented and panel components are stable.

---

## 14. Mission Control Handles

**Status:** planned (some partial, see handleset.registry.ts)

**Proposed Handles:**
- missionControl.enabled - Enable Mission Control panel
- missionControl.mode - Active Mission Control mode (checklist, history, debug, agent-chat)
- missionControl.activeChecklistId - Active QA checklist ID
- missionControl.lastSubmittedReport - Last submitted QA report
- missionControl.submissionHistory - Submission history array
- missionControl.agentChatEnabled - Enable Agent Chat tab
- missionControl.collapsible - Enable Mission Control collapse/expand
- missionControl.defaultTab - Default tab on open

**Purpose:** Control Mission Control panel behavior and state.

**Dependencies:** Mission Control UI, Agent Chat infrastructure.

**Do-not-implement-yet:** Until Mission Control UI is stable and Agent Chat infrastructure is ready.

---

## 15. Performance Handles

**Status:** planned

**Proposed Handles:**
- performance.maxNodes - Maximum nodes to render
- performance.maxEdges - Maximum edges to render
- performance.enableCulling - Enable view frustum culling
- performance.enableLOD - Enable level-of-detail
- performance.lodThreshold - LOD distance threshold
- performance.enableLazyLoading - Enable lazy loading
- performance.cacheEnabled - Enable graph caching
- performance.cacheSize - Cache size limit

**Purpose:** Control performance optimization settings.

**Dependencies:** Graph rendering, performance profiling.

**Do-not-implement-yet:** Until performance profiling identifies bottlenecks.

---

## 16. Source Linking / Evidence Handles

**Status:** planned

**Proposed Handles:**
- sourceLinking.enabled - Enable source linking
- sourceLinking.openInEditor - Open in editor on click
- sourceLinking.editorCommand - Editor command (code, vscode, etc.)
- sourceLinking.showLineNumbers - Show line numbers in source snippets
- sourceLinking.maxSnippetLines - Maximum lines in source snippet
- sourceLinking.snippetInline - Show snippets inline on hover
- sourceLinking.evidencePanel - Show evidence in dedicated panel

**Purpose:** Control source linking and evidence display behavior.

**Dependencies:** Graph normalization with source metadata, editor integration.

**Do-not-implement-yet:** Until graph normalization includes source metadata and editor integration is proven.

---

## Notes

- This taxonomy is a map for future phases
- The TypeScript registry intentionally remains smaller and focused
- No UI controls should be added without handleset entries
- No runtime implementation without proper planning and QA
