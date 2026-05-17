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

import type { GWDialectEntry, GWStatus } from "./types";

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
      assign: (_nodeId: string, attrs: Record<string, unknown>): string | null => {
        if (attrs.nodeType === "spine") return "gwells.well.spine-linear";
        if (attrs.isEndpoint === true) return "gwells.well.endpoint-fan";
        if (attrs.nodeType === "directory") return "gwells.well.directory-anchor";
        // Map all leaf content types to file-orbit
        if (
          attrs.nodeType === "file" ||
          attrs.nodeType === "doc" ||
          attrs.nodeType === "code" ||
          attrs.nodeType === "config" ||
          attrs.nodeType === "fixture"
        ) {
          return "gwells.well.file-orbit";
        }
        return null;
      },
    },
    activeInteractions: radialBackboneInteractions,
    config: {
      seedParams: {
        spineCount: 2,
        spineAngles: [0, 180],
        offsetFromHub: 0,
        spineSpacing: 150,
        directoryOffset: 220,
        directoryAlternation: "above-below",
        helixTwist: {},
        fileOrbitRadius: 90,
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
      assign: (_nodeId: string, attrs: Record<string, unknown>): string | null => {
        if (attrs.nodeType === "spine") return "gwells.well.spine-linear";
        if (attrs.isEndpoint === true) return "gwells.well.endpoint-fan";
        if (attrs.nodeType === "directory") return "gwells.well.directory-anchor";
        // Map all leaf content types to file-orbit
        if (
          attrs.nodeType === "file" ||
          attrs.nodeType === "doc" ||
          attrs.nodeType === "code" ||
          attrs.nodeType === "config" ||
          attrs.nodeType === "fixture"
        ) {
          return "gwells.well.file-orbit";
        }
        return null;
      },
    },
    activeInteractions: radialBackboneInteractions,
    config: {
      seedParams: {
        spineCount: 2,
        offsetFromHub: 1000,
        spineSpacing: 150,
        directoryOffset: 220,
        directoryAlternation: "above-below",
        helixTwist: {},
        fileOrbitRadius: 80,
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
