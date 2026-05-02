# Graph Visual Policy v0 - Audit Table

Part A: Visual/Label Sources Audit

| File | Value/Rule | Meaning | Move to Token/Policy? |
|------|------------|---------|----------------------|
| **selectionColors.ts** | | | |
| selectionColors.defaultNode = "#22d3ee" | Default node fill color | YES - token |
| selectionColors.defaultEdge = "#64748b" | Default edge stroke color | YES - token |
| selectionColors.selectedNode = "#fbbf24" | Selected node fill color | YES - token |
| selectionColors.primaryEdge = "#a855f7" | Selected/primary edge stroke color | YES - token |
| selectionColors.secondaryEdge = "#c4b5fd" | Secondary edge stroke color | YES - token |
| selectionColors.relationshipEndpointNode = "#2563eb" | Edge endpoint node fill color | YES - token |
| selectionColors.secondaryNeighborNode = "#3b82f6" | Secondary neighbor node fill color | YES - token |
| **SigmaGraphView.tsx** | | | |
| hoverNodeColor prop (default "#ffffff") | Hover node fill color override | YES - token override |
| hoverLabelColor prop (default "#e0f2fe") | Hover label text color | NO - not wired to Sigma, mark Planned |
| nodeSize prop | Node size multiplier | YES - token |
| edgeLabelFontSize prop (default 13) | Edge label font size | YES - token |
| Sigma config: defaultNodeColor = "#22d3ee" | Sigma default node color | YES - token |
| Sigma config: defaultEdgeColor = "#64748b" | Sigma default edge color | YES - token |
| Sigma config: labelColor = { attribute: "labelColor", color: "#f1f5f9" } | Node label text color (stateful) | YES - token |
| Sigma config: labelSize = 12 | Node label font size | YES - token |
| Sigma config: labelRenderedSizeThreshold = 6 | Zoom threshold for labels | NO - Planned |
| Sigma config: edgeLabelColor = { color: "#94a3b8" } | Edge label text color | YES - token |
| Sigma config: edgeLabelSize = edgeLabelFontSize | Edge label font size | YES - token |
| graph.setNodeAttribute(node, "color", selectionColors.defaultNode) | Reset node to default color | YES - policy |
| graph.setEdgeAttribute(edgeId, "color", selectionColors.defaultEdge) | Reset edge to default color | YES - policy |
| graph.setNodeAttribute(hoveredNodeId, "color", hoverNodeColor) | Set hovered node color | YES - policy |
| graph.setNodeAttribute(hoveredNodeId, "labelColor", "#0f172a") | Set hovered node label color (dark) | YES - policy |
| graph.setNodeAttribute(nodeId, "labelColor", undefined) | Clear non-hovered node label color | YES - policy |
| graph.setNodeAttribute(nodeId, "color", selectionColors.selectedNode) | Set selected node color | YES - policy |
| graph.setNodeAttribute(nodeId, "size", baseSize * multiplier) | Set node size (multiplier based on state) | YES - policy |
| graph.setEdgeAttribute(edgeId, "color", selectionColors.primaryEdge) | Set selected edge color | YES - policy |
| graph.setEdgeAttribute(edgeId, "size", value) | Set edge size (based on state) | YES - policy |
| **labelPolicy.ts** | | | |
| LabelPolicyOptions.maxEdgeLabelLength | Truncation length for edge labels | YES - token |
| LabelPolicyOptions.showLabelsOnHover | Show labels on hover toggle | YES - token |
| LabelPolicyOptions.hoverLabelColor | Hover label color (unused) | NO - not wired, mark Planned |
| NodeLabelMode type | Node label visibility mode | YES - type |
| EdgeLabelMode type | Edge label visibility mode | YES - type |
| applyNodeLabelPolicy() | Decides which node labels visible | YES - policy |
| applyEdgeLabelPolicy() | Decides which edge labels visible | YES - policy |
| graph.setNodeAttribute(nodeId, "label", value) | Set node label text | YES - policy |
| graph.setEdgeAttribute(edgeId, "label", value) | Set edge label text | YES - policy |
| **selectionNeighborhood.ts** | | | |
| getRelationshipNeighborhood() | Computes edge selection neighborhood | YES - policy |
| getNodeNeighborhood() | Computes node selection neighborhood | YES - policy |
| **buildGraphologyGraph.ts** | | | |
| node color = "#22d3ee" | Hardcoded node color | YES - token |
| edge color = "#64748b" | Hardcoded edge color | YES - token |
| node size = baseSize * nodeSize | Node size calculation | YES - policy |
| node label, fullLabel, originalLabel | Label attributes | YES - policy |
| edge label, fullLabel, originalLabel | Label attributes | YES - policy |
| **settings.schema.ts** | | | |
| graphView.hoverNodeColor | Hover node color setting | YES - token override (if wired) |
| graphView.hoverLabelColor | Hover label color setting | NO - Planned |
| labels.nodeLabelMode | Node label mode setting | YES - policy input |
| labels.edgeLabelMode | Edge label mode setting | YES - policy input |
| labels.maxEdgeLabelLength | Edge label truncation setting | YES - token |
| labels.showLabelsOnHover | Show labels on hover setting | YES - token |
| labels.zoomLabelThreshold | Zoom label threshold | NO - Planned |
| labels.edgeLabelFontSize | Edge label font size setting | YES - token |
| graphView.nodeSelectionStage | Neighborhood depth setting | YES - policy input |
| **settings.registry.ts** | | | |
| physics.nodeSize | Node size control | YES - token |
| physics.linkDistance | Link distance control | NO - physics, not visual policy |
| physics.repelForce | Repel force control | NO - physics, not visual policy |
| physics.centerForce | Center force (Planned) | NO - Planned |
| physics.communityGravity | Community gravity (Planned) | NO - Planned |
| physics.curveAmount | Edge curve (Planned) | NO - Planned |
| physics.animationSoftness | Animation softness (Planned) | NO - Planned |
| labels.zoomLabelThreshold | Zoom label threshold (Planned) | NO - Planned |
| graphView.hoverLabelColor | Hover label color (Planned) | NO - Planned |
