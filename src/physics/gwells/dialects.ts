// SPDX-License-Identifier: Apache-2.0
/**
 * GWells — Dialect Registry
 *
 * v0 — Skeleton. Entry added in Pass C.
 *
 * A dialect bundles a seed function, well assignment, active
 * interactions, and config overrides into a single named layout
 * configuration. Picking a dialect is the user-facing way to choose
 * a layout.
 *
 * No engine logic here. Pure data + lookup helpers.
 */

import type { GWDialectEntry, GWStatus, GWWellAssignmentContext } from "./types";

// Shared active interactions list used by all three dialects.
const radialBackboneInteractions = [
  "gwells.interaction.spine-linear.aligns.spine-linear",
  "gwells.interaction.directory-anchor.perpendicular.spine-linear",
  "gwells.interaction.directory-anchor.repels.directory-anchor",
  "gwells.interaction.file-orbit.springs.directory-anchor",
  "gwells.interaction.file-orbit.repels.file-orbit",
  "gwells.interaction.file-orbit.repels.directory-anchor-other",
  "gwells.interaction.endpoint-fan.springs.spine-linear-endpoint",
  "gwells.interaction.endpoint-fan.repels.endpoint-fan",
] as const;

// Shared per-well-type overrides used by all dialects.
const sharedWellOverrides = {
  "gwells.well.spine-linear": {
    // pinned; physics params don't apply
  },
  "gwells.well.directory-anchor": {
    siblingRepulsion: 280,
    damping: 0.85,
    centerGravity: 0.05,
  },
  "gwells.well.file-orbit": {
    attractionStrength: 0.6,
    siblingRepulsion: 120,
    springStiffness: 0.08,
    damping: 0.9,
    idealDistance: 90,
    centerGravity: 0.02,
  },
  "gwells.well.endpoint-fan": {
    attractionStrength: 0.5,
    siblingRepulsion: 90,
    springStiffness: 0.06,
    damping: 0.9,
    idealDistance: 100,
    centerGravity: 0,
  },
};

// Shared per-interaction overrides.
const sharedInteractionOverrides = {
  "gwells.interaction.file-orbit.repels.directory-anchor-other": {
    strength: 1.4,
    range: 180,
  },
};

// Parallel-spines softens the directory-directory repulsion to allow
// directories from different spines to branch inward without violent rejection.
const parallelSpinesInteractionOverrides = {
  ...sharedInteractionOverrides,
  "gwells.interaction.directory-anchor.repels.directory-anchor": {
    strength: 80,
    range: 200,
  },
};

const SPINE_WELL = "gwells.well.spine-linear";
const DIRECTORY_WELL = "gwells.well.directory-anchor";
const FILE_WELL = "gwells.well.file-orbit";
const ENDPOINT_WELL = "gwells.well.endpoint-fan";
const LEGACY_FILE_KINDS = new Set(["file", "doc", "code", "config", "fixture"]);

function getRecordValue(value: unknown, key: string): unknown {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)[key]
    : undefined;
}

function getLegacyNodeKind(attrs: Record<string, unknown>): string | undefined {
  const nodeType = attrs.nodeType;
  if (typeof nodeType === "string" && nodeType.length > 0) return nodeType;

  const rawType = getRecordValue(attrs.raw, "type");
  if (typeof rawType === "string" && rawType.length > 0) return rawType;

  return undefined;
}

function assignWellTypeFromAttrsAndStructure(
  nodeId: string,
  attrs: Record<string, unknown>,
  context?: GWWellAssignmentContext,
): string | null {
  const legacyKind = getLegacyNodeKind(attrs);

  if (legacyKind === "spine") return SPINE_WELL;
  if (attrs.isEndpoint === true) return ENDPOINT_WELL;
  if (legacyKind === "directory") return DIRECTORY_WELL;
  if (legacyKind && LEGACY_FILE_KINDS.has(legacyKind)) return FILE_WELL;

  const role = context?.structure.nodes.get(nodeId)?.role;
  switch (role) {
    case "spine":
      return SPINE_WELL;
    case "root":
    case "container":
    case "hub":
    case "bridge":
      return DIRECTORY_WELL;
    case "leaf":
    case "orphan":
      return FILE_WELL;
    case "unknown":
    case undefined:
      return null;
  }
}

export const GW_DIALECT_REGISTRY: readonly GWDialectEntry[] = [
  {
    id: "gwells.dialect.radial-backbone",
    label: "Radial Backbone",
    description:
      "Two spines emanating from a central hub at 0° and 180°. " +
      "Directories perpendicular above/below. The default dialect.",
    status: "active",
    isDefault: true,
    seedFunctionId: "gwells.seed.radial-backbone",
    wellAssignment: {
      assign: assignWellTypeFromAttrsAndStructure,
    },
    activeInteractions: radialBackboneInteractions,
    config: {
      seedParams: {
        spineCount: 2,
        spineAngles: [0, 180],
        offsetFromHub: 0,
        spineSpacing: 1200,       // CHANGED from 150 (Pass C8 tune: triple spine spacing)
        directoryOffset: 2400,    // CHANGED from 4400 (Pass C8.4: wider spacing between depth levels)
        directoryAlternation: "above-below",
        helixTwist: {},
        fileOrbitRadius: 40,     // Renamed semantically: this is now the BASE for dynamic computation
        endpointFanArc: 100,
        endpointFanCount: 6,
      },
      wellOverrides: sharedWellOverrides,
      interactionOverrides: sharedInteractionOverrides,
    },
  },
  {
    id: "gwells.dialect.parallel-spines",
    label: "Parallel Spines",
    description:
      "Two vertical spines at x=±2000, z=0. Directories fan horizontally. " +
      "Visual match for the former FA2 dual-vertical layout.",
    status: "active",
    isDefault: false,
    seedFunctionId: "gwells.seed.parallel-spines",
    wellAssignment: {
      assign: assignWellTypeFromAttrsAndStructure,
    },
    activeInteractions: radialBackboneInteractions,
    config: {
      seedParams: {
        spineCount: 2,
        offsetFromHub: 1000,     // unchanged (the central-axis radius)
        spineSpacing: 1200,       // CHANGED from 150 (matches radial-backbone)
        directoryOffset: 2400,    // CHANGED from 1800 (Pass C8.4: wider spacing between depth levels)
        directoryAlternation: "above-below",
        helixTwist: {},
        fileOrbitRadius: 40,     // Same base as radial-backbone
        endpointFanArc: 100,
        endpointFanCount: 6,
      },
      wellOverrides: sharedWellOverrides,
      interactionOverrides: parallelSpinesInteractionOverrides,
    },
  },
] as const;

export function getDialectById(id: string): GWDialectEntry | undefined {
  return GW_DIALECT_REGISTRY.find((e) => e.id === id);
}

export function listDialects(): readonly GWDialectEntry[] {
  return GW_DIALECT_REGISTRY;
}

export function listDialectsByStatus(status: GWStatus): GWDialectEntry[] {
  return GW_DIALECT_REGISTRY.filter((e) => e.status === status);
}

export function getDefaultDialect(): GWDialectEntry | undefined {
  return GW_DIALECT_REGISTRY.find((e) => e.isDefault);
}
