/**
 * Graph View Element Registry v0
 *
 * A typed/static inventory of graph visual elements and their metadata.
 *
 * This registry is read-only and passive. It does not control Sigma or graph rendering.
 * It does not mutate graph behavior. It describes existing graph elements and future/locked elements.
 *
 * @version v0
 */

export type ElementCategory = "frame" | "layer" | "overlay" | "control";

export type ElementStatus = "active" | "future" | "locked";

export type EvidenceKind = "dom-wrapper" | "policy-only" | "future";

export interface GraphViewElement {
  id: string;
  title: string;
  description: string;
  category: ElementCategory;
  status: ElementStatus;
  evidenceKind: EvidenceKind;
  testSelector?: string;
  sigmaBoundary: string;
  policyNote: string;
}

export interface GraphViewElementRegistry {
  version: string;
  elements: Record<string, GraphViewElement>;
  lastUpdated: string;
}

/**
 * Built-in Graph View Elements
 */
export const graphViewElements: GraphViewElement[] = [
  {
    id: "graph.frame",
    title: "Graph Frame",
    description: "Graph container and canvas wrapper that holds the Sigma renderer",
    category: "frame",
    status: "active",
    evidenceKind: "dom-wrapper",
    testSelector: "canvas",
    sigmaBoundary: "Registry does not control Sigma internals. Canvas is a DOM wrapper around Sigma.",
    policyNote: "Frame is passive metadata. DOM evidence markers wrap Sigma canvas but do not inspect canvas internals.",
  },
  {
    id: "graph.surface",
    title: "Graph Surface",
    description: "The visible graph rendering surface showing nodes and edges",
    category: "frame",
    status: "active",
    evidenceKind: "dom-wrapper",
    testSelector: "canvas",
    sigmaBoundary: "Registry does not control Sigma rendering. Surface is a DOM-level observation of Sigma output.",
    policyNote: "Surface is passive metadata. Playwright tests observe DOM-visible behavior, not canvas pixel states.",
  },
  {
    id: "graph.nodes",
    title: "Node Layer",
    description: "Layer that renders graph nodes with their visual properties",
    category: "layer",
    status: "active",
    evidenceKind: "dom-wrapper",
    sigmaBoundary: "Registry does not control Sigma node rendering. Node layer is Sigma-managed.",
    policyNote: "Node layer is passive metadata. Changes to node visual behavior require explicit Visual Policy acceptance.",
  },
  {
    id: "graph.edges",
    title: "Edge Layer",
    description: "Layer that renders graph edges with their visual properties",
    category: "layer",
    status: "active",
    evidenceKind: "dom-wrapper",
    sigmaBoundary: "Registry does not control Sigma edge rendering. Edge layer is Sigma-managed.",
    policyNote: "Edge layer is passive metadata. Changes to edge visual behavior require explicit Visual Policy acceptance.",
  },
  {
    id: "graph.labels",
    title: "Label Layer",
    description: "Layer that renders node/edge labels when enabled",
    category: "layer",
    status: "active",
    evidenceKind: "dom-wrapper",
    sigmaBoundary: "Registry does not control Sigma label rendering. Label layer is Sigma-managed.",
    policyNote: "Label layer is passive metadata. Changes to label visual behavior require explicit Visual Policy acceptance.",
  },
  {
    id: "graph.overlay",
    title: "Overlay Layer",
    description: "Layer for selection indicators, hover states, and other visual overlays",
    category: "overlay",
    status: "active",
    evidenceKind: "dom-wrapper",
    sigmaBoundary: "Registry does not control Sigma overlay rendering. Overlay layer is Sigma-managed.",
    policyNote: "Overlay layer is passive metadata. Changes to overlay visual behavior require explicit Visual Policy acceptance.",
  },
  {
    id: "graph.hud",
    title: "Graph HUD",
    description: "Heads-Up Display showing graph statistics or metadata",
    category: "overlay",
    status: "future",
    evidenceKind: "future",
    sigmaBoundary: "Registry does not control Sigma internals. HUD is a separate DOM surface.",
    policyNote: "HUD is future metadata. Future HUD implementation requires explicit contract and Visual Policy acceptance.",
  },
  {
    id: "graph.controls",
    title: "Graph Controls",
    description: "Control surface for physics sliders, camera controls, and filter controls",
    category: "control",
    status: "active",
    evidenceKind: "dom-wrapper",
    testSelector: "setting-physics-nodeSize",
    sigmaBoundary: "Registry does not control Sigma physics. Controls are DOM-level UI that update props.",
    policyNote: "Controls are passive metadata. Changes to control behavior require explicit Visual Policy acceptance.",
  },
  {
    id: "graph.physics",
    title: "Graph Physics",
    description: "Physics settings including node size",
    category: "control",
    status: "active",
    evidenceKind: "dom-wrapper",
    testSelector: "setting-physics-nodeSize",
    sigmaBoundary: "Registry does not control Sigma physics engine. Physics settings are props passed to Sigma.",
    policyNote: "Physics is passive metadata. Changes to physics behavior require explicit Visual Policy acceptance.",
  },
  {
    id: "graph.minimap",
    title: "Graph Minimap",
    description: "Minimap showing an overview of the entire graph",
    category: "overlay",
    status: "locked",
    evidenceKind: "future",
    sigmaBoundary: "Registry does not control Sigma internals. Minimap would be a separate DOM surface.",
    policyNote: "Minimap is locked metadata. Future minimap implementation requires explicit contract and Visual Policy acceptance.",
  },
];

/**
 * Graph View Element Registry v0
 *
 * A typed map of element IDs to element metadata.
 * This registry is read-only and passive. It does not control Sigma or graph rendering.
 */
export const graphViewElementRegistry: GraphViewElementRegistry = {
  version: "v0",
  elements: graphViewElements.reduce((acc, element) => {
    acc[element.id] = element;
    return acc;
  }, {} as Record<string, GraphViewElement>),
  lastUpdated: new Date().toISOString(),
};

/**
 * Get a Graph View Element by ID
 */
export function getGraphViewElement(id: string): GraphViewElement | undefined {
  return graphViewElementRegistry.elements[id];
}

/**
 * Get all Graph View Elements
 */
export function getAllGraphViewElements(): GraphViewElement[] {
  return graphViewElements;
}

/**
 * Get Graph View Elements by category
 */
export function getGraphViewElementsByCategory(category: ElementCategory): GraphViewElement[] {
  return graphViewElements.filter((element) => element.category === category);
}

/**
 * Get Graph View Elements by status
 */
export function getGraphViewElementsByStatus(status: ElementStatus): GraphViewElement[] {
  return graphViewElements.filter((element) => element.status === status);
}
