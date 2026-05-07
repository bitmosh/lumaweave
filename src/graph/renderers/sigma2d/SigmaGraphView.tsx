/**
 * LumaWeave Sigma 2D Graph View
 * Renders normalized graph using Graphology + Sigma
 *
 * This component applies graph visual policies to determine label visibility and styling.
 */

import { useEffect, useRef, useState } from "react";
import Sigma from "sigma";
import FA2Layout from "graphology-layout-forceatlas2/worker";
import { bidirectional } from "graphology-shortest-path";
import type {
  LumaWeaveNodeDraft,
  LumaWeaveEdgeDraft,
} from "../../schema/graph.types";
import {
  buildGraphologyGraph,
  LayoutSettings,
} from "./buildGraphologyGraph";
import {
  getRelationshipNeighborhood,
  getNodeNeighborhood,
} from "./selectionNeighborhood";
import { CollapsiblePanel } from "../../../control-plane/panels/CollapsiblePanel";
import { graphVisualTokens } from "../../visual/graphVisualTokens";
import { applyGraphStylePolicy } from "../../visual/graphStylePolicy";
import {
  type GraphInteractionState,
  type StylePolicyOptions,
} from "../../visual/graphVisualTypes";
import {
  applyNodeLabelPolicy,
  applyEdgeLabelPolicy,
  type SelectionContext,
  type LegacyLabelPolicyOptions,
  type NodeLabelMode,
  type EdgeLabelMode,
} from "../../visual/applyGraphLabelPolicyToGraphology";

interface SigmaGraphViewProps {
  nodes: LumaWeaveNodeDraft[];
  edges: LumaWeaveEdgeDraft[];
  nodeSize: number;
  linkDistance: number;
  repelForce: number;
  centerForce: number;
  physicsPreset: "custom" | "balanced" | "spread" | "tight" | "organic" | "performance";
  physicsDialect: "default" | "helix";
  // ForceAtlas2 advanced parameters
  strongGravityMode: boolean;
  linLogMode: boolean;
  adjustSizes: boolean;
  barnesHutTheta: number;
  communityGravity: number;

  selectedNodeId: string | null;
  selectedEdgeId?: string | null;
  pathTargetId?: string | null;
  neighborhoodDepth?: number;

  nodeLabelMode?: NodeLabelMode;
  edgeLabelMode?: EdgeLabelMode;
  maxEdgeLabelLength?: number;
  showLabelsOnHover?: boolean;
  zoomLabelThreshold?: number;
  edgeLabelFontSize?: number;
  nodeLabelFontSize?: number;
  hoverNodeColor?: string;

  resolvedTokens?: {
    nodeColor: {
      default: string;
      selected: string;
      hover: string;
      relationshipEndpoint: string;
      secondary: string;
      tertiary: string;
    };
    edgeColor: {
      default: string;
      selected: string;
      hovered: string;
      secondary: string;
      tertiary: string;
    };
    nodeLabelColor: {
      default: string;
      hover: string;
      selected: string;
    };
    edgeLabelColor: {
      default: string;
      selected: string;
    };
    labelFontSize: {
      node: number;
      edge: number;
    };
    nodeSizeMultiplier: {
      default: number;
      selected: number;
      relationshipEndpoint: number;
      secondary: number;
      tertiary: number;
    };
    edgeSize: {
      default: number;
      selected: number;
      hovered: number;
      secondary: number;
      tertiary: number;
    };
    labelTruncation: {
      maxEdgeLabelLength: number;
      allMediumMultiplier: number;
    };
    sigmaConfig: {
      labelRenderedSizeThreshold: number;
      labelFont: string;
      edgeLabelFont: string;
    };
    nodeColorScale: string[];
    edgeColorScale: string[];
  };

  onSelectNode: (nodeId: string) => void;
  onSetPathTarget?: (nodeId: string) => void;
  onSelectEdge?: (edgeId: string) => void;
  onClearSelection: () => void;
}

export function SigmaGraphView({
  nodes,
  edges,
  nodeSize,
  linkDistance,
  repelForce,
  centerForce,
  physicsPreset = "balanced",
  physicsDialect = "default",
  strongGravityMode = false,
  linLogMode = false,
  adjustSizes = false,
  barnesHutTheta = 0.5,
  communityGravity = 0,
  selectedNodeId,
  selectedEdgeId = null,
  pathTargetId = null,
  neighborhoodDepth = 2,
  nodeLabelMode = "selected-neighborhood",
  edgeLabelMode = "selected-neighborhood",
  maxEdgeLabelLength = 48,
  showLabelsOnHover = true,
  zoomLabelThreshold = 1.15,
  edgeLabelFontSize = 13,
  nodeLabelFontSize = 13,
  hoverNodeColor = "#ffffff",
  resolvedTokens = graphVisualTokens,
  onSelectNode,
  onSetPathTarget,
  onSelectEdge,
  onClearSelection,
}: SigmaGraphViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sigmaRef = useRef<Sigma | null>(null);
  const fa2Ref = useRef<FA2Layout | null>(null);
  const graphRef = useRef<any>(null);
  const onSelectNodeRef = useRef(onSelectNode);
  const onSetPathTargetRef = useRef(onSetPathTarget);
  const onSelectEdgeRef = useRef(onSelectEdge);
  const onClearSelectionRef = useRef(onClearSelection);
  const hasInitialCameraResetRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resolvedTokensRef = useRef(resolvedTokens);
  const communityGravityRef = useRef<(() => void) | null>(null);

  // Sync resolvedTokens ref on every render
  useEffect(() => {
    resolvedTokensRef.current = resolvedTokens;
  });

  // Separate useEffect for communityGravity centroid force
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

  const [debugInfo, setDebugInfo] = useState<Record<string, string | number>>(
    {},
  );
  const [neighborhoodInfo, setNeighborhoodInfo] = useState<{
    sourceId: string | null;
    targetId: string | null;
    secondaryEdgeCount: number;
    secondaryNodeCount: number;
  }>({
    sourceId: null,
    targetId: null,
    secondaryEdgeCount: 0,
    secondaryNodeCount: 0,
  });

  const [nodeNeighborhoodInfo, setNodeNeighborhoodInfo] = useState<{
    directEdgeCount: number;
    directNeighborCount: number;
  }>({
    directEdgeCount: 0,
    directNeighborCount: 0,
  });

  const settings: LayoutSettings = {
    nodeSize,
    linkDistance,
    repelForce,
    centerForce,
    physicsDialect,
    nodeColorScale: resolvedTokensRef.current?.nodeColorScale,
  };

  const [activeSelectionMode, setActiveSelectionMode] = useState<
    "none" | "node-stage-1" | "node-stage-2" | "node-stage-3" | "edge-relationship"
  >("none");
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);

  useEffect(() => {
    onSelectNodeRef.current = onSelectNode;
    onSetPathTargetRef.current = onSetPathTarget;
    onSelectEdgeRef.current = onSelectEdge;
    onClearSelectionRef.current = onClearSelection;
  }, [onSelectNode, onSetPathTarget, onSelectEdge, onClearSelection]);

  console.log("SigmaGraphView input", {
    nodes: nodes.length,
    edges: edges.length,
    nodeSize,
    linkDistance,
    repelForce,
  });

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

    setDebugInfo({
      sigmaInputNodes: nodes.length,
      sigmaInputEdges: edges.length,
      graphologyOrder: diagnostics.order,
      graphologySize: diagnostics.size,
      uniqueX: diagnostics.uniqueX,
      uniqueY: diagnostics.uniqueY,
      minX: diagnostics.minX,
      maxX: diagnostics.maxX,
      minY: diagnostics.minY,
      maxY: diagnostics.maxY,
      currentNodeSize: nodeSize,
      currentLinkDistance: linkDistance,
      currentRepelForce: repelForce,
    });

    // Apply label policy to graphology graph before Sigma renders
    // This prevents one-frame all-labels fallback when sliders change
    const selectionContext: SelectionContext = {
      selectedNodeId,
      selectedEdgeId,
      neighborhoodDepth: Math.floor(neighborhoodDepth || 2) as 1 | 2 | 3,
      hoveredNodeId: null, // No hover during initial render
      hoveredEdgeId: null, // No hover during initial render
    };

    const labelOptions: LegacyLabelPolicyOptions = {
      maxEdgeLabelLength: maxEdgeLabelLength || 20,
      showLabelsOnHover: showLabelsOnHover || false,
      hoverLabelColor: "#0f172a", // Not used in v0, kept for API compatibility
    };

    applyNodeLabelPolicy(graph, selectionContext, labelOptions, nodeLabelMode || "off");
    applyEdgeLabelPolicy(graph, selectionContext, labelOptions, edgeLabelMode || "off");

    // Apply selection styling policy before Sigma renders
    // This preserves visual state during Sigma recreation on slider changes
    const interactionState: GraphInteractionState = {
      selectedNodeId,
      selectedEdgeId,
      hoveredNodeId: null, // No hover during initial render
      hoveredEdgeId: null, // No hover during initial render
      neighborhoodDepth: Math.floor(neighborhoodDepth || 2) as 1 | 2 | 3,
    };

    const styleOptions: StylePolicyOptions = {
      hoverNodeColor,
      edgeLabelFontSize,
    };

    applyGraphStylePolicy(graph, interactionState, styleOptions, resolvedTokens);

    if (!containerRef.current) return;

    const sigma = new Sigma(graph, containerRef.current, {
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
    });

    console.log("[SIGMA CONFIG] labelColor: attribute-based with fallback", resolvedTokens.nodeLabelColor.default, ", edgeLabelSize:", edgeLabelFontSize);

  sigmaRef.current = sigma;

  // Start continuous FA2 supervisor
  // Stop any existing supervisor
  if (fa2Ref.current) {
    fa2Ref.current.stop();
    fa2Ref.current.kill();
  }

  // Start continuous FA2 supervisor
  const fa2Settings = {
    gravity: Math.max(0.001, centerForce * 0.005),
    scalingRatio: Math.max(0.1, repelForce * 0.1),
    slowDown: Math.max(1, linkDistance * 1),
    strongGravityMode,
    linLogMode,
    adjustSizes,
    barnesHutOptimize: graph.order > 150,
    barnesHutTheta,
  };

  // Start FA2 worker after Sigma completes first render
  // This ensures Sigma has fully registered all nodes AND edges
  // before the worker starts mutating positions
  sigma.once("afterRender", () => {
    if (fa2Ref.current) {
      fa2Ref.current.stop();
      fa2Ref.current.kill();
    }
    fa2Ref.current = new FA2Layout(graph, {
      settings: fa2Settings,
    });
    fa2Ref.current.start();
  });

  // Camera preservation rule: Only reset camera once after initial graph load.
  // Browser resize should resize canvas but preserve camera position/ratio.
  // This ref tracks whether the initial reset has happened.
  if (!hasInitialCameraResetRef.current) {
    sigma.getCamera().animatedReset({ duration: 0 });
    hasInitialCameraResetRef.current = true;
  }

  sigma.on("clickNode", ({ node, event }) => {
    if (event.original.ctrlKey && selectedNodeId) {
      // Ctrl+click with existing selection = set path target
      onSetPathTargetRef.current?.(node);
    } else {
      onSelectNodeRef.current(node);
    }
  });

  sigma.on("clickEdge", ({ edge }) => {
    if (onSelectEdgeRef.current) {
      onSelectEdgeRef.current(edge);
    }
  });

  sigma.on("clickStage", () => {
    onClearSelectionRef.current();
  });

  sigma.on("enterNode", ({ node }) => {
    console.log("[HOVER] enterNode:", node);
    setHoveredNodeId(node);
  });

  sigma.on("leaveNode", () => {
    console.log("[HOVER] leaveNode: clearing hoveredNodeId");
    setHoveredNodeId(null);
  });

  sigma.on("enterEdge", ({ edge }) => {
    console.log("[HOVER] enterEdge:", edge);
    setHoveredEdgeId(edge);
  });

  sigma.on("leaveEdge", () => {
    console.log("[HOVER] leaveEdge: clearing hoveredEdgeId");
    setHoveredEdgeId(null);
  });

  // Node drag state
  const dragState: {
    dragging: boolean;
    nodeId: string | null;
  } = { dragging: false, nodeId: null };

  // Start drag on node mousedown
  sigma.on("downNode", (e) => {
    dragState.dragging = true;
    dragState.nodeId = e.node;
    sigma.getCamera().disable();
    // Pause worker during drag so it doesn't fight mouse position
    if (fa2Ref.current) {
      fa2Ref.current.stop();
    }
    // Fix node position while dragging
    graph.setNodeAttribute(e.node, "fixed", true);
  });

  // Update position on mouse move
  const handleMouseMove = (e: MouseEvent) => {
    if (!dragState.dragging || !dragState.nodeId) return;

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
  };

  // End drag
  const handleMouseUp = () => {
    if (dragState.nodeId) {
      // Unfix node so physics can resume
      graph.setNodeAttribute(
        dragState.nodeId, "fixed", false
      );
    }
    dragState.dragging = false;
    dragState.nodeId = null;
    sigma.getCamera().enable();
    // Resume worker after drag ends
    if (fa2Ref.current) {
      fa2Ref.current.start();
    }
  };

  sigma.getContainer().addEventListener(
    "mousemove", handleMouseMove
  );
  sigma.getContainer().addEventListener(
    "mouseup", handleMouseUp
  );
  sigma.getContainer().addEventListener(
    "mouseleave", handleMouseUp
  );

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
}, [nodes, edges, linkDistance, repelForce, centerForce, physicsDialect, resolvedTokens]);

// Live slider updates for FA2 settings without graph rebuild
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
        gravity: Math.max(0.001, centerForce * 0.005),
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

// Node size live update without rebuild
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

// Compute and highlight shortest path when pathTargetId changes
useEffect(() => {
  const sigma = sigmaRef.current;
  const graph = graphRef.current;
  if (!sigma || !graph) return;
  if (!selectedNodeId || !pathTargetId) return;

  // Compute shortest path
  const path = bidirectional(
    graph,
    selectedNodeId,
    pathTargetId
  );

  if (!path) {
    console.log("[PATH] No path found between",
      selectedNodeId, "and", pathTargetId);
    return;
  }

  console.log("[PATH] Found path:", path);

  // Highlight path nodes
  const pathNodeSet = new Set(path);
  graph.forEachNode((nodeId: string) => {
    if (pathNodeSet.has(nodeId)) {
      graph.setNodeAttribute(
        nodeId, "color", "#fbbf24"  // gold
      );
    }
  });

  // Highlight path edges
  for (let i = 0; i < path.length - 1; i++) {
    const source = path[i];
    const target = path[i + 1];
    // Find edge between these two nodes
    graph.forEachEdge(source, (edgeId: string, _attrs: any,
      src: string, tgt: string) => {
      if (
        (src === source && tgt === target) ||
        (src === target && tgt === source)
      ) {
        graph.setEdgeAttribute(
          edgeId, "color", "#fbbf24"
        );
        graph.setEdgeAttribute(
          edgeId, "size", 5
        );
      }
    });
  }

  sigma.refresh();

}, [pathTargetId, selectedNodeId]);

// Clear path highlighting when selection is cleared
useEffect(() => {
  const sigma = sigmaRef.current;
  const graph = graphRef.current;
  if (!sigma || !graph) return;
  if (selectedNodeId !== null) return; // Only clear when deselected

  // Reset all node and edge colors by reapplying style policy
  applyGraphStylePolicy(
    graph,
    {
      selectedNodeId,
      selectedEdgeId,
      hoveredNodeId,
      hoveredEdgeId,
      neighborhoodDepth: Math.floor(neighborhoodDepth || 2) as 1 | 2 | 3,
    },
    {
      hoverNodeColor: hoverNodeColor || "#ffffff",
      edgeLabelFontSize: edgeLabelFontSize || 13,
    },
    resolvedTokensRef.current
  );
  sigma.refresh();

}, [selectedNodeId, selectedEdgeId, neighborhoodDepth, hoveredNodeId, hoveredEdgeId, hoverNodeColor, edgeLabelFontSize]);

// ResizeObserver to handle container size changes
useEffect(() => {
  if (!containerRef.current) return;
  
  const resizeObserver = new ResizeObserver(() => {
    if (sigmaRef.current) {
      sigmaRef.current.resize();
      sigmaRef.current.refresh(); // Ensure graph renders after container resize
    }
  });
  resizeObserver.observe(containerRef.current);

  return () => {
    resizeObserver.disconnect();
    // Sigma lifecycle managed by main useEffect
  };
}, []);

// Single selection styling effect - uses graph visual policy system
  useEffect(() => {
    const sigma = sigmaRef.current;
    if (!sigma) return;

    const graph = sigma.getGraph();

    console.log("[STYLING] Running policy-based styling", {
      selectedNodeId,
      selectedEdgeId,
      neighborhoodDepth,
      hoveredNodeId,
      hoveredEdgeId,
      hoverNodeColor,
    });

    // Build interaction state for policy
    const interactionState: GraphInteractionState = {
      selectedNodeId,
      selectedEdgeId,
      hoveredNodeId,
      hoveredEdgeId,
      neighborhoodDepth: Math.floor(neighborhoodDepth || 2) as 1 | 2 | 3,
    };

    // Build style options for policy
    const styleOptions: StylePolicyOptions = {
      hoverNodeColor,
      edgeLabelFontSize,
    };

    // Apply complete styling policy (reset + selection + hover)
    applyGraphStylePolicy(graph, interactionState, styleOptions, resolvedTokens);

    // Update neighborhood info for debug panel (policy doesn't handle this)
    if (selectedEdgeId) {
      const neighborhood = getRelationshipNeighborhood(graph, selectedEdgeId);
      setNeighborhoodInfo({
        sourceId: neighborhood.sourceId,
        targetId: neighborhood.targetId,
        secondaryEdgeCount: neighborhood.secondaryEdgeIds.length,
        secondaryNodeCount: neighborhood.secondaryNodeIds.length,
      });
      setNodeNeighborhoodInfo({
        directEdgeCount: 0,
        directNeighborCount: 0,
      });
    } else if (selectedNodeId) {
      const neighborhood = getNodeNeighborhood(graph, selectedNodeId);
      setNeighborhoodInfo({
        sourceId: null,
        targetId: null,
        secondaryEdgeCount: 0,
        secondaryNodeCount: 0,
      });
      setNodeNeighborhoodInfo({
        directEdgeCount: neighborhood.directEdgeIds.length,
        directNeighborCount: neighborhood.directNeighborNodeIds.length,
      });
    } else {
      setNeighborhoodInfo({
        sourceId: null,
        targetId: null,
        secondaryEdgeCount: 0,
        secondaryNodeCount: 0,
      });
      setNodeNeighborhoodInfo({
        directEdgeCount: 0,
        directNeighborCount: 0,
      });
    }

    // Update active selection mode for debug panel
    if (selectedEdgeId) {
      setActiveSelectionMode("edge-relationship");
      console.log("[STYLING] Applied selected edge styling:", selectedEdgeId);
    } else if (selectedNodeId) {
      const modeMap: Record<1 | 2 | 3, "node-stage-1" | "node-stage-2" | "node-stage-3"> = {
        1: "node-stage-1",
        2: "node-stage-2",
        3: "node-stage-3",
      };
      const depth = Math.floor(neighborhoodDepth || 2) as 1 | 2 | 3;
      setActiveSelectionMode(modeMap[depth]);
      console.log("[STYLING] Applied selected node styling:", selectedNodeId, "depth", depth);
    } else {
      setActiveSelectionMode("none");
      console.log("[STYLING] No selection");
    }

    sigma.refresh();
    console.log("[STYLING] Refreshed Sigma");
  }, [selectedNodeId, selectedEdgeId, neighborhoodDepth, hoveredNodeId, hoveredEdgeId, hoverNodeColor, edgeLabelFontSize]);

  // Edge label font size live update effect
  useEffect(() => {
    const sigma = sigmaRef.current;
    if (!sigma) return;

    console.log("[EDGE LABEL SIZE] Updating to:", edgeLabelFontSize);
    sigma.setSetting("edgeLabelSize", edgeLabelFontSize);
    sigma.refresh();
    console.log("[EDGE LABEL SIZE] Updated and refreshed");
  }, [edgeLabelFontSize]);

  // Node label font size live update effect
  useEffect(() => {
    const sigma = sigmaRef.current;
    if (!sigma) return;

    console.log("[NODE LABEL SIZE] Updating to:", nodeLabelFontSize);
    sigma.setSetting("labelSize", nodeLabelFontSize);
    sigma.refresh();
    console.log("[NODE LABEL SIZE] Updated and refreshed");
  }, [nodeLabelFontSize]);

  // Label policy effect - applies label visibility based on mode and selection
  useEffect(() => {
    const sigma = sigmaRef.current;
    if (!sigma) return;

    const graph = sigma.getGraph();

    const selectionContext: SelectionContext = {
      selectedNodeId,
      selectedEdgeId,
      neighborhoodDepth: Math.floor(neighborhoodDepth || 2) as 1 | 2 | 3,
      hoveredNodeId,
      hoveredEdgeId,
    };

    const labelOptions: LegacyLabelPolicyOptions = {
      maxEdgeLabelLength,
      showLabelsOnHover,
      hoverLabelColor: "#0f172a", // Not used in v0, kept for API compatibility
    };

    console.log("[LABEL POLICY] Applying with", {
      nodeLabelMode,
      edgeLabelMode,
      selectedNodeId,
      selectedEdgeId,
      neighborhoodDepth,
      hoveredNodeId,
      hoveredEdgeId,
    });

    applyNodeLabelPolicy(graph, selectionContext, labelOptions, nodeLabelMode);
    applyEdgeLabelPolicy(graph, selectionContext, labelOptions, edgeLabelMode);

    sigma.refresh();
    console.log("[LABEL POLICY] Applied and refreshed");
  }, [selectedNodeId, selectedEdgeId, neighborhoodDepth, nodeLabelMode, edgeLabelMode, maxEdgeLabelLength, showLabelsOnHover, hoveredNodeId, hoveredEdgeId]);

  return (
    <div className="relative h-full w-full" data-testid="renderer-debug-panel">
      <div ref={containerRef} className="absolute inset-0" />

      <CollapsiblePanel
        title="Renderer Debug"
        collapsedLabel="Debug"
        defaultExpanded={false}
        className="absolute left-4 bottom-4 w-80 text-xs shadow-2xl shadow-cyan-950/40"
      >
        <div className="space-y-1 text-xs">
          <DebugRow label="Sigma Input Nodes" value={debugInfo.sigmaInputNodes} />
          <DebugRow label="Sigma Input Edges" value={debugInfo.sigmaInputEdges} />
          <DebugRow label="Graphology Order" value={debugInfo.graphologyOrder} />
          <DebugRow label="Graphology Size" value={debugInfo.graphologySize} />
          <DebugRow label="Unique X" value={debugInfo.uniqueX} />
          <DebugRow label="Unique Y" value={debugInfo.uniqueY} />
          <DebugRow label="Min X" value={debugInfo.minX} />
          <DebugRow label="Max X" value={debugInfo.maxX} />
          <DebugRow label="Min Y" value={debugInfo.minY} />
          <DebugRow label="Max Y" value={debugInfo.maxY} />
          <DebugRow label="Node Size" value={debugInfo.currentNodeSize} />
          <DebugRow label="Simulation Speed" value={debugInfo.currentLinkDistance} />
          <DebugRow label="Repel Force" value={debugInfo.currentRepelForce} />
          <DebugRow label="Selected Node" value={selectedNodeId ?? "none"} data-testid="selected-node-debug-row" />
          <DebugRow label="Selected Edge" value={selectedEdgeId ?? "none"} data-testid="selected-edge-debug-row" />
          <DebugRow label="Neighborhood Depth" value={neighborhoodDepth} />
          <DebugRow label="Active Selection Mode" value={activeSelectionMode} />
          <DebugRow label="Node Label Mode" value={nodeLabelMode} data-testid="node-label-mode-debug-row" />
          <DebugRow label="Edge Label Mode" value={edgeLabelMode} data-testid="edge-label-mode-debug-row" />
          <DebugRow label="Max Edge Label Length" value={maxEdgeLabelLength} />
          <DebugRow label="Edge Label Font Size" value={edgeLabelFontSize} data-testid="edge-label-font-size-debug-row" />
          <DebugRow label="Node Label Font Size" value={nodeLabelFontSize} data-testid="node-label-font-size-debug-row" />
          <DebugRow label="Hovered Node" value={hoveredNodeId ?? "none"} data-testid="hovered-node-debug-row" />
          <DebugRow label="Hovered Edge" value={hoveredEdgeId ?? "none"} data-testid="hovered-edge-debug-row" />
          <DebugRow label="Show Labels On Hover" value={showLabelsOnHover ? "true" : "false"} />
          <DebugRow label="Zoom Label Threshold" value={zoomLabelThreshold} />
          {selectedEdgeId && (
            <>
              <DebugRow label="Edge Source" value={neighborhoodInfo.sourceId ?? "none"} />
              <DebugRow label="Edge Target" value={neighborhoodInfo.targetId ?? "none"} />
              <DebugRow label="Secondary Edges" value={neighborhoodInfo.secondaryEdgeCount} />
              <DebugRow label="Secondary Nodes" value={neighborhoodInfo.secondaryNodeCount} />
            </>
          )}
          {selectedNodeId && (
            <>
              <DebugRow label="Direct Edges" value={nodeNeighborhoodInfo.directEdgeCount} />
              <DebugRow label="Direct Neighbors" value={nodeNeighborhoodInfo.directNeighborCount} />
            </>
          )}
        </div>
      </CollapsiblePanel>
    </div>
  );
}

function DebugRow({
  label,
  value,
}: {
  label: string;
  value: string | number | undefined | null;
}) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-slate-500">{label}:</span>
      <span className="max-w-48 truncate text-right text-slate-200">
        {value ?? "-"}
      </span>
    </div>
  );
}