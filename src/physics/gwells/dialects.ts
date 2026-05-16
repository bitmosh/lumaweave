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

export const GW_DIALECT_REGISTRY: readonly GWDialectEntry[] = [
  {
    id: "gwells.dialect.end-to-end-spine",
    label: "End-to-End Spine",
    description:
      "Two halves of a continuous spine (docs left, src right) with " +
      "alternating perpendicular directory anchors and file orbits. " +
      "The v0 LumaWeave layout.",
    status: "active",
    isDefault: true,
    seedFunctionId: "gwells.seed.directory-backbone-n2",
    wellAssignment: {
      assign: (_nodeId, attrs) => {
        if (attrs.nodeType === "spine") return "gwells.well.spine-linear";
        if (attrs.isEndpoint === true) return "gwells.well.endpoint-fan";
        if (attrs.nodeType === "directory") return "gwells.well.directory-anchor";
        if (attrs.nodeType === "file") return "gwells.well.file-orbit";
        return null;
      },
    },
    activeInteractions: [
      "gwells.interaction.spine-linear.aligns.spine-linear",
      "gwells.interaction.directory-anchor.perpendicular.spine-linear",
      "gwells.interaction.directory-anchor.repels.directory-anchor",
      "gwells.interaction.file-orbit.springs.directory-anchor",
      "gwells.interaction.file-orbit.repels.file-orbit",
      "gwells.interaction.file-orbit.repels.directory-anchor-other",
      "gwells.interaction.endpoint-fan.springs.spine-linear-endpoint",
      "gwells.interaction.endpoint-fan.repels.endpoint-fan",
    ],
    config: {
      seedParams: {
        spineSpacing: 150,
        directoryOffset: 220,
        directoryAlternation: "above-below",
        fileOrbitRadius: 90,
        endpointFanArc: 100,
        endpointFanCount: 6,
      },
      wellOverrides: {
        "gwells.well.spine-linear": {
          // pinned; physics params don't apply
        },
        "gwells.well.directory-anchor": {
          siblingRepulsion: 280,
          damping: 0.85,
        },
        "gwells.well.file-orbit": {
          attractionStrength: 0.6,
          siblingRepulsion: 120,
          springStiffness: 0.08,
          damping: 0.9,
          idealDistance: 90,
        },
        "gwells.well.endpoint-fan": {
          attractionStrength: 0.5,
          siblingRepulsion: 90,
          springStiffness: 0.06,
          damping: 0.9,
          idealDistance: 100,
        },
      },
      interactionOverrides: {
        "gwells.interaction.file-orbit.repels.directory-anchor-other": {
          strength: 1.4,
          range: 180,
        },
      },
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
