/**
 * LumaWeave Graph Schema
 * Raw artifact types and draft node/edge representations
 */

export type RawGraphArtifact = Record<string, unknown>;

export type LumaWeaveNodeDraft = {
  id: string;
  label: string;
  type?: string;
  raw: Record<string, unknown>;
};

export type LumaWeaveEdgeDraft = {
  id: string;
  source: string;
  target: string;
  relationship?: string;
  raw: Record<string, unknown>;
};

export type GraphSourceSummary = {
  sourceId: string;
  label: string;
  sourcePath: string;
  publicBaseUrl: string;
  status: "idle" | "loading" | "loaded" | "error";
  graphPresent: boolean;
  manifestPresent: boolean;
  reportPresent: boolean;
  nodeCount: number;
  edgeCount: number;
  error?: string;
  rawGraph?: RawGraphArtifact;
  rawManifest?: RawGraphArtifact | null;
  rawReportText?: string | null;
  // Normalization results
  normalizedNodeCount: number;
  normalizedEdgeCount: number;
  warnings: string[];
  normalizedNodes?: LumaWeaveNodeDraft[];
  normalizedEdges?: LumaWeaveEdgeDraft[];
};
