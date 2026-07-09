// SPDX-License-Identifier: Apache-2.0
/**
 * Self-Graph Fixture Types
 *
 * Type definitions for static LumaSourceGraph fixtures.
 * Used by src/fixtures/self-graph-fixture.ts and Sigma graph renderer.
 *
 * Supports both v0 (legacy) and v1 (lumaweave-self-graph/v1) schemas.
 */

export type ConfidenceClass = "observed" | "inferred" | "ai-inferred";

export interface LumaGraphNodeV0 {
  id: string;
  label: string;
  type: string;
  cluster?: string;
  sourceAdapter: string;
  metadata: Record<string, unknown>;
}

export interface LumaGraphNodeV1 {
  id: string;
  type: "doc" | "code" | "config" | "fixture" | "spine";
  label: string;
  fullLabel: string;
  path: string;
  cluster: string | null;
  status: string | null;
  tags: string[];
  size: number;
  lastModified: string;
  raw: {
    color?: string;
    dimFactor?: number;
    icon?: string;
  };
}

export type LumaGraphNode = LumaGraphNodeV0 | LumaGraphNodeV1;

export interface LumaGraphEdgeV0 {
  id: string;
  source: string;
  target: string;
  type: string;
  confidence: ConfidenceClass;
  weight?: number;
  label?: string;
  metadata: Record<string, unknown>;
}

export interface LumaGraphEdgeV1 {
  id: string;
  source: string;
  target: string;
  type: string;
  weight: number;
  bidirectional: boolean;
  provenance: {
    source: string;
    detail?: string;
  };
  raw?: {
    label?: string;
    color?: string;
  };
}

export type LumaGraphEdge = LumaGraphEdgeV0 | LumaGraphEdgeV1;

export interface LumaSourceGraphMetadataV0 {
  adapterId: string;
  createdAt: string;
  inputSummary: string;
  nodeCount: number;
  edgeCount: number;
  warnings: string[];
}

export interface LumaSourceGraphMetadataV1 {
  schemaVersion: "lumaweave-self-graph/v1";
  generatedAt: string;
  generator: string;
  sourceCommit?: string;
  sourceTree: string;
  stats: {
    nodeCount: number;
    edgeCount: number;
    nodesByType: {
      doc: number;
      code: number;
      config: number;
      fixture: number;
      spine: number;
    };
    edgesByType: Record<string, number>;
  };
}

export type LumaSourceGraphMetadata = LumaSourceGraphMetadataV0 | LumaSourceGraphMetadataV1;

export interface LumaSourceGraph {
  schemaVersion?: string; // v1 only, optional for v0 compatibility
  nodes: LumaGraphNode[];
  edges: LumaGraphEdge[];
  metadata: LumaSourceGraphMetadata;
}
