// SPDX-License-Identifier: Apache-2.0
import type Graph from "graphology";

export type GWStructuralRole =
  | "root"
  | "spine"
  | "container"
  | "leaf"
  | "orphan"
  | "hub"
  | "bridge"
  | "unknown";

export interface GWStructuralNodeInfo {
  nodeId: string;
  explicitKind?: string;
  role: GWStructuralRole;
  depth: number | null;
  parentId?: string;
  childCount: number;
  inDegree: number;
  outDegree: number;
  totalDegree: number;
  hasContainsParent: boolean;
  hasContainsChildren: boolean;
  isEndpoint: boolean;
  componentIndex: number;
  componentSize: number;
  isHub: boolean;
  isBridge: boolean;
  confidence: number;
}

export interface GWStructuralGraphInfo {
  nodes: Map<string, GWStructuralNodeInfo>;
  parentOfNode: Map<string, string>;
  childrenOfNode: Map<string, Set<string>>;
  components: string[][];
  rootNodeIds: string[];
  orphanNodeIds: string[];
  hubNodeIds: string[];
  bridgeNodeIds: string[];
  containsEdgeCount: number;
}

interface DegreeRecord {
  inDegree: number;
  outDegree: number;
  totalDegree: number;
}

function getRecordValue(
  value: unknown,
  key: string,
): unknown {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)[key]
    : undefined;
}

function getExplicitKind(attrs: Record<string, unknown>): string | undefined {
  const nodeType = attrs.nodeType;
  if (typeof nodeType === "string" && nodeType.length > 0) return nodeType;

  const rawType = getRecordValue(attrs.raw, "type");
  if (typeof rawType === "string" && rawType.length > 0) return rawType;

  const rawKind = getRecordValue(attrs.raw, "kind");
  if (typeof rawKind === "string" && rawKind.length > 0) return rawKind;

  return undefined;
}

function getEdgeKind(attrs: Record<string, unknown>): string | undefined {
  const relationship = attrs.relationship;
  if (typeof relationship === "string" && relationship.length > 0) {
    return relationship;
  }

  const rawType = getRecordValue(attrs.raw, "type");
  if (typeof rawType === "string" && rawType.length > 0) return rawType;

  return undefined;
}

function isContentLeafKind(kind: string | undefined): boolean {
  return (
    kind === "file" ||
    kind === "doc" ||
    kind === "code" ||
    kind === "config" ||
    kind === "fixture" ||
    kind === "note" ||
    kind === "tag"
  );
}

function ensureDegree(
  degrees: Map<string, DegreeRecord>,
  nodeId: string,
): DegreeRecord {
  let degree = degrees.get(nodeId);
  if (!degree) {
    degree = { inDegree: 0, outDegree: 0, totalDegree: 0 };
    degrees.set(nodeId, degree);
  }
  return degree;
}

function addChild(
  childrenOfNode: Map<string, Set<string>>,
  parentId: string,
  childId: string,
): void {
  let children = childrenOfNode.get(parentId);
  if (!children) {
    children = new Set<string>();
    childrenOfNode.set(parentId, children);
  }
  children.add(childId);
}

function computeComponents(
  nodeIds: string[],
  adjacency: Map<string, Set<string>>,
): { components: string[][]; componentIndexByNode: Map<string, number> } {
  const seen = new Set<string>();
  const components: string[][] = [];
  const componentIndexByNode = new Map<string, number>();

  for (const startId of nodeIds) {
    if (seen.has(startId)) continue;

    const component: string[] = [];
    const stack = [startId];
    seen.add(startId);

    while (stack.length > 0) {
      const nodeId = stack.pop()!;
      component.push(nodeId);
      componentIndexByNode.set(nodeId, components.length);

      const neighbors = adjacency.get(nodeId);
      if (!neighbors) continue;

      for (const neighborId of neighbors) {
        if (seen.has(neighborId)) continue;
        seen.add(neighborId);
        stack.push(neighborId);
      }
    }

    component.sort();
    components.push(component);
  }

  return { components, componentIndexByNode };
}

function computeDepths(
  nodeIds: string[],
  parentOfNode: Map<string, string>,
  childrenOfNode: Map<string, Set<string>>,
): Map<string, number | null> {
  const depths = new Map<string, number | null>();
  const roots = nodeIds
    .filter((nodeId) => !parentOfNode.has(nodeId) && childrenOfNode.has(nodeId))
    .sort();

  const queue: Array<{ nodeId: string; depth: number }> = roots.map((nodeId) => ({
    nodeId,
    depth: 0,
  }));

  while (queue.length > 0) {
    const { nodeId, depth } = queue.shift()!;
    const previousDepth = depths.get(nodeId);
    if (previousDepth !== undefined && previousDepth !== null && previousDepth <= depth) continue;

    depths.set(nodeId, depth);

    const children = childrenOfNode.get(nodeId);
    if (!children) continue;

    for (const childId of Array.from(children).sort()) {
      queue.push({ nodeId: childId, depth: depth + 1 });
    }
  }

  for (const nodeId of nodeIds) {
    if (!depths.has(nodeId)) depths.set(nodeId, null);
  }

  return depths;
}

function computeBridgeNodes(
  nodeIds: string[],
  adjacency: Map<string, Set<string>>,
): Set<string> {
  const discovery = new Map<string, number>();
  const low = new Map<string, number>();
  const parent = new Map<string, string>();
  const bridges = new Set<string>();
  let time = 0;

  function visit(nodeId: string): void {
    discovery.set(nodeId, time);
    low.set(nodeId, time);
    time += 1;

    let childCount = 0;
    const neighbors = Array.from(adjacency.get(nodeId) ?? []).sort();

    for (const neighborId of neighbors) {
      if (!discovery.has(neighborId)) {
        parent.set(neighborId, nodeId);
        childCount += 1;
        visit(neighborId);

        low.set(nodeId, Math.min(low.get(nodeId)!, low.get(neighborId)!));

        const isRoot = !parent.has(nodeId);
        if (isRoot && childCount > 1) {
          bridges.add(nodeId);
        }
        if (!isRoot && low.get(neighborId)! >= discovery.get(nodeId)!) {
          bridges.add(nodeId);
        }
      } else if (parent.get(nodeId) !== neighborId) {
        low.set(nodeId, Math.min(low.get(nodeId)!, discovery.get(neighborId)!));
      }
    }
  }

  for (const nodeId of nodeIds) {
    if (!discovery.has(nodeId)) visit(nodeId);
  }

  return bridges;
}

function resolveRole(input: {
  explicitKind: string | undefined;
  hasContainsParent: boolean;
  hasContainsChildren: boolean;
  childCount: number;
  totalDegree: number;
  isHub: boolean;
  isBridge: boolean;
}): { role: GWStructuralRole; confidence: number } {
  if (input.explicitKind === "spine") {
    return { role: "spine", confidence: 1 };
  }

  if (!input.hasContainsParent && input.hasContainsChildren) {
    return { role: "root", confidence: input.childCount > 0 ? 0.9 : 0.75 };
  }

  if (input.hasContainsChildren) {
    return { role: "container", confidence: 0.9 };
  }

  if (input.hasContainsParent) {
    return { role: "leaf", confidence: 0.85 };
  }

  if (input.explicitKind === "directory") {
    return { role: "container", confidence: 0.65 };
  }

  if (input.totalDegree === 0) {
    return { role: "orphan", confidence: 0.85 };
  }

  if (input.isHub) {
    return { role: "hub", confidence: 0.7 };
  }

  if (input.isBridge) {
    return { role: "bridge", confidence: 0.65 };
  }

  if (isContentLeafKind(input.explicitKind)) {
    return { role: "leaf", confidence: 0.6 };
  }

  if (input.totalDegree === 1) {
    return { role: "leaf", confidence: 0.45 };
  }

  return { role: "unknown", confidence: 0.25 };
}

export function analyzeGraphStructure(graph: Graph): GWStructuralGraphInfo {
  const nodeIds: string[] = [];
  const explicitKindByNode = new Map<string, string | undefined>();
  const parentOfNode = new Map<string, string>();
  const childrenOfNode = new Map<string, Set<string>>();
  const degrees = new Map<string, DegreeRecord>();
  const adjacency = new Map<string, Set<string>>();
  let containsEdgeCount = 0;

  graph.forEachNode((nodeId, attrs) => {
    nodeIds.push(nodeId);
    explicitKindByNode.set(nodeId, getExplicitKind(attrs));
    ensureDegree(degrees, nodeId);
    adjacency.set(nodeId, new Set<string>());
  });

  graph.forEachEdge((edgeId, attrs) => {
    const sourceId = graph.source(edgeId);
    const targetId = graph.target(edgeId);
    const sourceDegree = ensureDegree(degrees, sourceId);
    const targetDegree = ensureDegree(degrees, targetId);

    sourceDegree.outDegree += 1;
    sourceDegree.totalDegree += 1;
    targetDegree.inDegree += 1;
    targetDegree.totalDegree += 1;

    adjacency.get(sourceId)?.add(targetId);
    adjacency.get(targetId)?.add(sourceId);

    if (getEdgeKind(attrs) === "contains") {
      containsEdgeCount += 1;
      if (!parentOfNode.has(targetId)) {
        parentOfNode.set(targetId, sourceId);
      }
      addChild(childrenOfNode, sourceId, targetId);
    }
  });

  nodeIds.sort();

  const { components, componentIndexByNode } = computeComponents(nodeIds, adjacency);
  const depths = computeDepths(nodeIds, parentOfNode, childrenOfNode);
  const bridgeNodes = computeBridgeNodes(nodeIds, adjacency);
  const hubDegreeThreshold = Math.max(4, Math.ceil(Math.sqrt(Math.max(nodeIds.length, 1))));
  const nodes = new Map<string, GWStructuralNodeInfo>();
  const rootNodeIds: string[] = [];
  const orphanNodeIds: string[] = [];
  const hubNodeIds: string[] = [];
  const bridgeNodeIds: string[] = [];

  for (const nodeId of nodeIds) {
    const explicitKind = explicitKindByNode.get(nodeId);
    const degree = ensureDegree(degrees, nodeId);
    const childCount = childrenOfNode.get(nodeId)?.size ?? 0;
    const hasContainsParent = parentOfNode.has(nodeId);
    const hasContainsChildren = childCount > 0;
    const componentIndex = componentIndexByNode.get(nodeId) ?? -1;
    const isHub = degree.totalDegree >= hubDegreeThreshold;
    const isBridge = bridgeNodes.has(nodeId);
    const roleResult = resolveRole({
      explicitKind,
      hasContainsParent,
      hasContainsChildren,
      childCount,
      totalDegree: degree.totalDegree,
      isHub,
      isBridge,
    });

    const info: GWStructuralNodeInfo = {
      nodeId,
      explicitKind,
      role: roleResult.role,
      depth: depths.get(nodeId) ?? null,
      parentId: parentOfNode.get(nodeId),
      childCount,
      inDegree: degree.inDegree,
      outDegree: degree.outDegree,
      totalDegree: degree.totalDegree,
      hasContainsParent,
      hasContainsChildren,
      isEndpoint: explicitKind === "spine" && childCount === 0,
      componentIndex,
      componentSize: componentIndex >= 0 ? components[componentIndex].length : 0,
      isHub,
      isBridge,
      confidence: roleResult.confidence,
    };

    nodes.set(nodeId, info);

    if (info.role === "root") rootNodeIds.push(nodeId);
    if (info.role === "orphan") orphanNodeIds.push(nodeId);
    if (info.isHub) hubNodeIds.push(nodeId);
    if (info.isBridge) bridgeNodeIds.push(nodeId);
  }

  return {
    nodes,
    parentOfNode,
    childrenOfNode,
    components,
    rootNodeIds,
    orphanNodeIds,
    hubNodeIds,
    bridgeNodeIds,
    containsEdgeCount,
  };
}

export function getStructuralRole(
  graph: Graph,
  nodeId: string,
  context?: GWStructuralGraphInfo,
): GWStructuralRole {
  const resolvedContext = context ?? analyzeGraphStructure(graph);
  return resolvedContext.nodes.get(nodeId)?.role ?? "unknown";
}
