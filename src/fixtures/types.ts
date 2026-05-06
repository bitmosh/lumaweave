/**
 * Self-Graph Fixture Types
 *
 * Type definitions for static LumaSourceGraph fixtures.
 * Used by src/fixtures/self-graph-fixture.ts and Sigma graph renderer.
 */

export type ConfidenceClass = "observed" | "inferred" | "ai-inferred";

export interface LumaGraphNode {
  id: string;
  label: string;
  type: string;
  cluster?: string;
  sourceAdapter: string;
  metadata: Record<string, unknown>;
}

export interface LumaGraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  confidence: ConfidenceClass;
  weight?: number;
  label?: string;
  metadata: Record<string, unknown>;
}

export interface LumaSourceGraph {
  nodes: LumaGraphNode[];
  edges: LumaGraphEdge[];
  metadata: {
    adapterId: string;
    createdAt: string;
    inputSummary: string;
    nodeCount: number;
    edgeCount: number;
    warnings: string[];
  };
}
