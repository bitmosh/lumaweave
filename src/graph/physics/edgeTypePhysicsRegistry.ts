/**
 * Edge Type Physics Registry
 *
 * Canonical registry for edge type physics weights.
 * Physics weight drives FA2 attraction strength; visual weight drives render thickness.
 *
 * Follows REGISTRY_CONTRACT_PATTERNS.md: const array + helper functions, no classes.
 */

export interface EdgeTypePhysicsEntry {
  edgeType: string;
  physicsWeight: number;  // 0..1, drives FA2 attraction (0 = no layout influence)
  visualWeight: number;  // 0..1, drives edge render thickness
  description: string;
}

/**
 * Canonical registry of edge type physics weights.
 * Read-only const array following registry contract pattern.
 *
 * Physics weights:
 * - contains: 1.0 (structural backbone, strong layout influence)
 * - governs: 0.5 (contract-to-spine relationship, moderate influence)
 * - All metadata edges: 0.0 (semantic edges should not distort layout)
 *
 * Visual weights:
 * - Structural edges: higher visibility
 * - Metadata edges: lower visibility
 */
export const EDGE_TYPE_PHYSICS_REGISTRY: readonly EdgeTypePhysicsEntry[] = [
  {
    edgeType: "contains",
    physicsWeight: 1.0,
    visualWeight: 0.7,
    description: "Directory containment (parent → child). Structural backbone with strongest layout influence.",
  },
  {
    edgeType: "governs",
    physicsWeight: 0.5,
    visualWeight: 0.6,
    description: "Contract/policy → governed subsystem. Moderate layout influence.",
  },
  {
    edgeType: "explicit-reference",
    physicsWeight: 0.0,
    visualWeight: 0.8,
    description: "Frontmatter references field. Semantic edge, no layout influence.",
  },
  {
    edgeType: "wiki-link",
    physicsWeight: 0.0,
    visualWeight: 0.5,
    description: "[[xxx]] in markdown body. Semantic edge, no layout influence.",
  },
  {
    edgeType: "markdown-link",
    physicsWeight: 0.0,
    visualWeight: 0.5,
    description: "[text](path.md) in markdown. Semantic edge, no layout influence.",
  },
  {
    edgeType: "code-import",
    physicsWeight: 0.0,
    visualWeight: 0.6,
    description: "TypeScript/JS import statement. Semantic edge, no layout influence.",
  },
  {
    edgeType: "tag-overlap",
    physicsWeight: 0.0,
    visualWeight: 0.3,
    description: "Shared tags (≥2 threshold). Semantic edge, no layout influence.",
  },
  {
    edgeType: "describes",
    physicsWeight: 0.0,
    visualWeight: 0.4,
    description: "Doc mentions code path (heuristic). Semantic edge, no layout influence.",
  },
] as const;

/**
 * Get edge type physics entry by type.
 */
export function getEdgeTypePhysics(edgeType: string): EdgeTypePhysicsEntry | undefined {
  return EDGE_TYPE_PHYSICS_REGISTRY.find((entry) => entry.edgeType === edgeType);
}

/**
 * Get physics weight for an edge type. Returns 0 if type not found.
 */
export function getEdgePhysicsWeight(edgeType: string): number {
  const entry = getEdgeTypePhysics(edgeType);
  return entry?.physicsWeight ?? 0;
}

/**
 * Get visual weight for an edge type. Returns 0.5 if type not found.
 */
export function getEdgeVisualWeight(edgeType: string): number {
  const entry = getEdgeTypePhysics(edgeType);
  return entry?.visualWeight ?? 0.5;
}
