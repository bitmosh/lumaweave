/**
 * LumaWeave Sigma 2D Graph View
 * Renders normalized graph using Graphology + Sigma
 *
 * This component applies graph visual policies to determine label visibility and styling.
 */

import { useEffect, useRef, useState, memo } from "react";
import Sigma from "sigma";
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
import { applyNodeLabelPolicy,
  applyEdgeLabelPolicy,
  type SelectionContext,
  type LegacyLabelPolicyOptions,
  type NodeLabelMode,
  type EdgeLabelMode,
} from "../../visual/applyGraphLabelPolicyToGraphology";
import { attachCameraController } from "../../overlay/cameraController";
import { NodeCircleProgram } from "sigma/rendering";
import { applyDialect, type GWController } from "../../../physics/gwells";
import { installGwellsProbeGlobal } from "./gwellsProbe";

interface SigmaGraphViewProps {
  nodes: LumaWeaveNodeDraft[];
  edges: LumaWeaveEdgeDraft[];
  nodeSize: number;
  dialectId: string;
  seedParamOverrides: Record<string, unknown>;

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

  // v86b: appearance settings for shader uniforms
  nodeHum?: number;
  nodeFlowSpeed?: number;
  nodeGlow?: number;
  reduceMotion?: boolean;

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

function SigmaGraphViewComponent({
  nodes,
  edges,
  nodeSize,
  dialectId = "gwells.dialect.horizontal-linear",
  seedParamOverrides = {},
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
  hoverNodeColor = graphVisualTokens.nodeColor.hover,
  nodeHum = 0.7,
  nodeFlowSpeed = 0.55,
  nodeGlow = 1.0,
  reduceMotion = false,
  resolvedTokens = graphVisualTokens,
  onSelectNode,
  onSetPathTarget,
  onSelectEdge,
  onClearSelection,
}: SigmaGraphViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sigmaRef = useRef<Sigma | null>(null);
  const cameraControllerRef = useRef<ReturnType<typeof attachCameraController> | null>(null);
  const gwellsControllerRef = useRef<GWController | null>(null);
  const graphRef = useRef<any>(null);
  const onSelectNodeRef = useRef(onSelectNode);
  const onSetPathTargetRef = useRef(onSetPathTarget);
  const onSelectEdgeRef = useRef(onSelectEdge);
  const onClearSelectionRef = useRef(onClearSelection);
  const hasInitialCameraResetRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resolvedTokensRef = useRef(resolvedTokens);
  const cleanupProbeRef = useRef<(() => void) | null>(null);

  // v86b: Ref-based uniform pipeline - animation loop updates this ref directly
  // NodeSphereProgram reads from this ref on its natural render cycle
  const uniformsRef = useRef<{
    time: number;
    hum: number;
    flowSpeed: number;
    glowStrength: number;
  }>({
    time: 0,
    hum: nodeHum ?? 0.7,
    flowSpeed: nodeFlowSpeed ?? 0.55,
    glowStrength: nodeGlow ?? 1.0,
  });

  // Sync resolvedTokens ref on every render
  useEffect(() => {
    resolvedTokensRef.current = resolvedTokens;
  });

  // v86b: Ref-based uniform pipeline - rAF loop updates uniformsRef directly

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

  useEffect(() => {
    if (!containerRef.current || nodes.length === 0) return;

    // Clear any pending debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce only the graph rebuild
    debounceRef.current = setTimeout(() => {
      const { graph, diagnostics } = buildGraphologyGraph(nodes, edges, settings);

      // Store graph for gwells controller updates
      graphRef.current = graph;

      // Clear solar orbit attributes on rebuild
      graph.forEachNode((nodeId) => {
        graph.removeNodeAttribute(nodeId, "isSun");
      });

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
      currentDialectId: dialectId,
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
      hoverLabelColor: graphVisualTokens.nodeLabelColor.default, // Token-based hover label color
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
        circle: NodeCircleProgram,
      },
      defaultNodeType: "circle",
    });

    sigmaRef.current = sigma;

    // v86b: Attach uniformsRef to Sigma instance for NodeSphereProgram to read
    (sigma as any).__uniformsRef = uniformsRef;

    // v86b: Attach camera controller for eased transitions and state preservation
    cameraControllerRef.current = attachCameraController(sigma, {
      reduceMotion: reduceMotion ?? false,
    });

    // Expose Sigma instance and camera controller for Playwright tests
    (window as any).__lwSigma = sigma;
    (window as any).__lwCameraController = cameraControllerRef.current;

    // vP-Physics-Backbone-Seed: Install nodeReducer to pin spine positions
    // Gwells writes seeded positions in graph-level attribute __seededSpinePositions.
    // Sigma nodeReducer reads this to enforce pinning at render time.
    const previousNodeReducer = sigma.getSetting("nodeReducer");
    sigma.setSetting("nodeReducer", (nodeId: string, data: any) => {
      const base = previousNodeReducer
        ? previousNodeReducer(nodeId, data)
        : { ...data };
      const seeded = graph.getAttribute("__seededSpinePositions") as Map<string, { x: number; y: number }> | undefined;
      if (seeded && seeded.has(nodeId)) {
        const pos = seeded.get(nodeId);
        if (pos) {
          return { ...base, x: pos.x, y: pos.y };
        }
      }
      return base;
    });

    // Install gwells runtime probe for Playwright testing
    cleanupProbeRef.current = installGwellsProbeGlobal(graph);

    // Stop any existing gwells controller
    if (gwellsControllerRef.current) {
      gwellsControllerRef.current.stop();
      gwellsControllerRef.current = null;
    }

    // Start gwells controller after Sigma completes first render
    // This ensures Sigma has fully registered all nodes AND edges
    // before gwells starts mutating positions
    sigma.once("afterRender", () => {
      try {
        gwellsControllerRef.current = applyDialect(graph, dialectId);
        console.log(`[gwells] started controller with dialect '${dialectId}'`);
      } catch (err) {
        console.error(`[gwells] failed to apply dialect '${dialectId}':`, err);
      }
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
    setHoveredNodeId(node);
  });

  sigma.on("leaveNode", () => {
    setHoveredNodeId(null);
  });

  sigma.on("enterEdge", ({ edge }) => {
    setHoveredEdgeId(edge);
  });

  sigma.on("leaveEdge", () => {
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
    // Pause gwells during drag so it doesn't fight mouse position
    if (gwellsControllerRef.current) {
      gwellsControllerRef.current.pause();
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
      // Pass C5: Update seed position to where the user dropped the node
      // so the engine's seed-anchor force doesn't pull it back to its
      // original seeded position.
      if (graph.hasAttribute("__gwellsSeedPositions")) {
        const seedPositions = graph.getAttribute("__gwellsSeedPositions") as Map<
          string,
          { x: number; y: number; z: number }
        >;
        const x = graph.getNodeAttribute(dragState.nodeId, "x") as number;
        const y = graph.getNodeAttribute(dragState.nodeId, "y") as number;
        const z = (graph.getNodeAttribute(dragState.nodeId, "z") as number) ?? 0;
        seedPositions.set(dragState.nodeId, { x, y, z });
      }

      // Unfix node so physics can resume
      graph.setNodeAttribute(
        dragState.nodeId, "fixed", false
      );
    }
    dragState.dragging = false;
    dragState.nodeId = null;
    sigma.getCamera().enable();
    // Resume gwells after drag ends
    if (gwellsControllerRef.current) {
      gwellsControllerRef.current.resume();
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
    // Cleanup gwells runtime probe
    if (cleanupProbeRef.current) {
      cleanupProbeRef.current();
      cleanupProbeRef.current = null;
    }
    // Stop gwells controller
    if (gwellsControllerRef.current) {
      gwellsControllerRef.current.stop();
      gwellsControllerRef.current = null;
    }
    if (sigmaRef.current) {
      sigmaRef.current.kill();
      sigmaRef.current = null;
      hasInitialCameraResetRef.current = false;
    }
  }
}, [nodes, edges]);

// Dialect change effect - ACTIVE-to-ACTIVE mutate path
// When dialectId changes, stop current controller and apply new dialect without Sigma recreation
useEffect(() => {
  const sigma = sigmaRef.current;
  const graph = graphRef.current;
  if (!sigma || !graph) return;

  // Stop existing controller
  if (gwellsControllerRef.current) {
    gwellsControllerRef.current.stop();
    gwellsControllerRef.current = null;
  }

  // Apply new dialect
  sigma.once("afterRender", () => {
    try {
      gwellsControllerRef.current = applyDialect(graph, dialectId);
      console.log(`[gwells] switched to dialect '${dialectId}'`);
    } catch (err) {
      console.error(`[gwells] failed to apply dialect '${dialectId}':`, err);
    }
  });
  sigma.refresh();
}, [dialectId]);

// Pass C4: Override change — apply runtime config override (no Sigma recreation, no controller restart)
useEffect(() => {
  if (!gwellsControllerRef.current) return;
  
  // Only the seedParams path supported for v0 — wellOverrides and interactionOverrides
  // are not currently exposed via the UI but the engine supports them.
  gwellsControllerRef.current.applyConfigOverride({
    seedParams: seedParamOverrides,
  });
}, [seedParamOverrides]);

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
    return;
  }

  // Highlight path nodes
  const pathNodeSet = new Set(path);
  graph.forEachNode((nodeId: string) => {
    if (pathNodeSet.has(nodeId)) {
      graph.setNodeAttribute(
        nodeId, "color", graphVisualTokens.nodeColor.selected
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
          edgeId, "color", graphVisualTokens.nodeColor.selected
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
      hoverNodeColor: hoverNodeColor || (resolvedTokensRef.current?.nodeColor?.hover ?? graphVisualTokens.nodeColor.hover),
      edgeLabelFontSize: edgeLabelFontSize || 13,
    },
    resolvedTokensRef.current
  );
  sigma.refresh();

}, [selectedNodeId, selectedEdgeId, neighborhoodDepth, hoveredNodeId, hoveredEdgeId, hoverNodeColor, edgeLabelFontSize]);

// ResizeObserver to handle container size changes
useEffect(() => {
  if (!containerRef.current) return;
  
  const resizeObserver = new ResizeObserver((entries) => {
    const sigma = sigmaRef.current;
    if (!sigma) return;
    const entry = entries[0];
    if (!entry) return;
    const { width, height } = entry.contentRect;
    if (width === 0 || height === 0) return;  // GUARD — prevents "Container has no width" error during React remounts.
    sigma.resize();
    sigma.refresh(); // Ensure graph renders after container resize
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
    } else if (selectedNodeId) {
      const modeMap: Record<1 | 2 | 3, "node-stage-1" | "node-stage-2" | "node-stage-3"> = {
        1: "node-stage-1",
        2: "node-stage-2",
        3: "node-stage-3",
      };
      const depth = Math.floor(neighborhoodDepth || 2) as 1 | 2 | 3;
      setActiveSelectionMode(modeMap[depth]);
    } else {
      setActiveSelectionMode("none");
    }

    sigma.refresh();
  }, [selectedNodeId, selectedEdgeId, neighborhoodDepth, hoveredNodeId, hoveredEdgeId, hoverNodeColor, edgeLabelFontSize, resolvedTokens]);

  // Edge label font size live update effect
  useEffect(() => {
    const sigma = sigmaRef.current;
    if (!sigma) return;

    sigma.setSetting("edgeLabelSize", edgeLabelFontSize);
    sigma.refresh();
  }, [edgeLabelFontSize]);

  // Node label font size live update effect
  useEffect(() => {
    const sigma = sigmaRef.current;
    if (!sigma) return;

    sigma.setSetting("labelSize", nodeLabelFontSize);
    sigma.refresh();
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
      hoverLabelColor: graphVisualTokens.nodeLabelColor.default, // Token-based hover label color
    };

    applyNodeLabelPolicy(graph, selectionContext, labelOptions, nodeLabelMode);
    applyEdgeLabelPolicy(graph, selectionContext, labelOptions, edgeLabelMode);

    sigma.refresh();
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

// v86c: React.memo with custom comparison to prevent remount on settings changes
// Returns true if props are equal (skip render), false if props differ (re-render)
const arePropsEqual = (prev: SigmaGraphViewProps, next: SigmaGraphViewProps) => {
  // Identity checks for memoized objects - these are stable across unrelated settings changes
  if (prev.nodes !== next.nodes) return false;
  if (prev.edges !== next.edges) return false;
  if (prev.resolvedTokens !== next.resolvedTokens) return false;

  // Value checks for selection state - these should trigger re-render
  if (prev.selectedNodeId !== next.selectedNodeId) return false;
  if (prev.selectedEdgeId !== next.selectedEdgeId) return false;
  if (prev.pathTargetId !== next.pathTargetId) return false;
  if (prev.neighborhoodDepth !== next.neighborhoodDepth) return false;

  // Value checks for physics props - these should trigger re-render
  if (prev.nodeSize !== next.nodeSize) return false;
  if (prev.dialectId !== next.dialectId) return false;
  if (prev.seedParamOverrides !== next.seedParamOverrides) return false;

  // Value checks for label props - these should trigger re-render
  if (prev.nodeLabelMode !== next.nodeLabelMode) return false;
  if (prev.edgeLabelMode !== next.edgeLabelMode) return false;
  if (prev.maxEdgeLabelLength !== next.maxEdgeLabelLength) return false;
  if (prev.showLabelsOnHover !== next.showLabelsOnHover) return false;
  if (prev.zoomLabelThreshold !== next.zoomLabelThreshold) return false;
  if (prev.edgeLabelFontSize !== next.edgeLabelFontSize) return false;
  if (prev.nodeLabelFontSize !== next.nodeLabelFontSize) return false;
  if (prev.hoverNodeColor !== next.hoverNodeColor) return false;

  // Value checks for appearance props - these should trigger re-render
  if (prev.nodeHum !== next.nodeHum) return false;
  if (prev.nodeFlowSpeed !== next.nodeFlowSpeed) return false;
  if (prev.nodeGlow !== next.nodeGlow) return false;
  if (prev.reduceMotion !== next.reduceMotion) return false;

  // All props equal - skip re-render
  return true;
};

export const SigmaGraphView = memo(SigmaGraphViewComponent, arePropsEqual);

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