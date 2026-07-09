// SPDX-License-Identifier: Apache-2.0
/**
 * Perspective Registry
 * 
 * A typed inventory of built-in perspectives and their metadata.
 * In v38, perspectives are built-in and read-only.
 * 
 * This registry is populated at build time and is read-only at runtime.
 */

export type PerspectiveCategory =
  | "architecture"
  | "theme"
  | "qa"
  | "graph"
  | "command"
  | "custom";

export type PerspectiveStatus = "active" | "locked" | "future";

export type PerspectiveScope = {
  canMutateGraph: boolean;
  canMutateCamera: boolean;
  canMutateFilter: boolean;
  canMutatePhysics: boolean;
  canPersist: boolean;
  requiresStorage: boolean;
};

export interface Perspective {
  id: string;
  title: string;
  description: string;
  category: PerspectiveCategory;
  status: PerspectiveStatus;
  scope: PerspectiveScope;
  metadata?: Record<string, unknown>;
}

export interface PerspectiveRegistry {
  perspectives: Perspective[];
  version: string;
  lastUpdated: string;
}

/**
 * Built-in perspective metadata for v38
 * 
 * These perspectives are read-only and do not mutate graph/Sigma behavior.
 */
const BUILT_IN_PERSPECTIVES: Perspective[] = [
  {
    id: "default-architecture",
    title: "Default Architecture",
    description: "Shows the default architecture view of LumaWeave",
    category: "architecture",
    status: "active",
    scope: {
      canMutateGraph: false,
      canMutateCamera: false,
      canMutateFilter: false,
      canMutatePhysics: false,
      canPersist: false,
      requiresStorage: false,
    },
  },
  {
    id: "theme-mapping",
    title: "Theme Mapping",
    description: "Shows theme mapping relationships and token paths",
    category: "theme",
    status: "active",
    scope: {
      canMutateGraph: false,
      canMutateCamera: false,
      canMutateFilter: false,
      canMutatePhysics: false,
      canPersist: false,
      requiresStorage: false,
    },
  },
  {
    id: "command-deck",
    title: "Command Deck",
    description: "Shows registered commands and hotkey inventory",
    category: "command",
    status: "active",
    scope: {
      canMutateGraph: false,
      canMutateCamera: false,
      canMutateFilter: false,
      canMutatePhysics: false,
      canPersist: false,
      requiresStorage: false,
    },
  },
  {
    id: "qa-evidence",
    title: "QA Evidence",
    description: "Shows QA evidence, checklist history, and acceptance reports",
    category: "qa",
    status: "active",
    scope: {
      canMutateGraph: false,
      canMutateCamera: false,
      canMutateFilter: false,
      canMutatePhysics: false,
      canPersist: false,
      requiresStorage: false,
    },
  },
  {
    id: "graph-physics",
    title: "Graph Physics",
    description: "Future perspective for graph physics configuration",
    category: "graph",
    status: "future",
    scope: {
      canMutateGraph: false,
      canMutateCamera: false,
      canMutateFilter: false,
      canMutatePhysics: false,
      canPersist: false,
      requiresStorage: false,
    },
    metadata: {
      reason: "Locked in v38 - requires explicit contract for graph physics",
    },
  },
  {
    id: "source-adapter",
    title: "Source Adapter",
    description: "Future perspective for source adapter integration",
    category: "architecture",
    status: "future",
    scope: {
      canMutateGraph: false,
      canMutateCamera: false,
      canMutateFilter: false,
      canMutatePhysics: false,
      canPersist: false,
      requiresStorage: false,
    },
    metadata: {
      reason: "Locked in v38 - requires explicit contract for source adapter views",
    },
  },
];

/**
 * The Perspective Registry
 * 
 * This is the source of truth for built-in perspective metadata.
 * It is read-only at runtime in v38.
 */
export const perspectiveRegistry: PerspectiveRegistry = {
  perspectives: BUILT_IN_PERSPECTIVES,
  version: "v0",
  lastUpdated: "2026-05-03",
};

/**
 * Get a perspective by ID
 */
export function getPerspectiveById(id: string): Perspective | undefined {
  return perspectiveRegistry.perspectives.find((p) => p.id === id);
}

/**
 * Get all active perspectives
 */
export function getActivePerspectives(): Perspective[] {
  return perspectiveRegistry.perspectives.filter((p) => p.status === "active");
}

/**
 * Get all perspectives by category
 */
export function getPerspectivesByCategory(category: PerspectiveCategory): Perspective[] {
  return perspectiveRegistry.perspectives.filter((p) => p.category === category);
}
