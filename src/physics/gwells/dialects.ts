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

// Shared per-well-type overrides used by all three dialects.
const radialBackboneWellOverrides = {
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
};

// Shared per-interaction overrides.
const radialBackboneInteractionOverrides = {
  "gwells.interaction.file-orbit.repels.directory-anchor-other": {
    strength: 1.4,
    range: 180,
  },
};

export const GW_DIALECT_REGISTRY: readonly GWDialectEntry[] = [
  {
    id: "gwells.dialect.horizontal-linear",
    label: "Horizontal Linear",
    description:
      "Single horizontal spine running left-to-right. Directories " +
      "perpendicular above/below. The default radial-backbone preset.",
    status: "active",
    isDefault: true,
    seedFunctionId: "gwells.seed.radial-backbone",
    wellAssignment: {
      assign: (_nodeId: string, attrs: Record<string, unknown>): string | null => {
        if (attrs.nodeType === "spine") return "gwells.well.spine-linear";
        if (attrs.isEndpoint === true) return "gwells.well.endpoint-fan";
        if (attrs.nodeType === "directory") return "gwells.well.directory-anchor";
        if (attrs.nodeType === "file") return "gwells.well.file-orbit";
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
        helixTwist: 0,
        fileOrbitRadius: 90,
        endpointFanArc: 100,
        endpointFanCount: 6,
      },
      wellOverrides: radialBackboneWellOverrides,
      interactionOverrides: radialBackboneInteractionOverrides,
    },
  },
  {
    id: "gwells.dialect.vertical-parallel",
    label: "Vertical Parallel",
    description:
      "Two parallel vertical spines with a gap. Preserves the visual " +
      "layout of the existing FA2-pipeline directoryBackboneSeeder.",
    status: "active",
    isDefault: false,
    seedFunctionId: "gwells.seed.radial-backbone",
    wellAssignment: {
      assign: (_nodeId: string, attrs: Record<string, unknown>): string | null => {
        if (attrs.nodeType === "spine") return "gwells.well.spine-linear";
        if (attrs.isEndpoint === true) return "gwells.well.endpoint-fan";
        if (attrs.nodeType === "directory") return "gwells.well.directory-anchor";
        if (attrs.nodeType === "file") return "gwells.well.file-orbit";
        return null;
      },
    },
    activeInteractions: radialBackboneInteractions,
    config: {
      seedParams: {
        spineCount: 2,
        spineAngles: [90, 270],
        offsetFromHub: 1000,
        spineSpacing: 150,
        directoryOffset: 220,
        directoryAlternation: "above-below",
        helixTwist: 0,
        fileOrbitRadius: 80,
        endpointFanArc: 100,
        endpointFanCount: 6,
      },
      wellOverrides: radialBackboneWellOverrides,
      interactionOverrides: radialBackboneInteractionOverrides,
    },
  },
  {
    id: "gwells.dialect.helix-dual",
    label: "Helix Dual",
    description:
      "Two strands meeting at hub, twisted around each other. " +
      "Demonstrates helix-twist math; foundation for future " +
      "helix-triple, helix-quad, etc.",
    status: "active",
    isDefault: false,
    seedFunctionId: "gwells.seed.radial-backbone",
    wellAssignment: {
      assign: (_nodeId: string, attrs: Record<string, unknown>): string | null => {
        if (attrs.nodeType === "spine") return "gwells.well.spine-linear";
        if (attrs.isEndpoint === true) return "gwells.well.endpoint-fan";
        if (attrs.nodeType === "directory") return "gwells.well.directory-anchor";
        if (attrs.nodeType === "file") return "gwells.well.file-orbit";
        return null;
      },
    },
    activeInteractions: radialBackboneInteractions,
    config: {
      seedParams: {
        spineCount: 2,
        spineAngles: [90, 270],
        offsetFromHub: 0,
        spineSpacing: 150,
        directoryOffset: 220,
        directoryAlternation: "above-below",
        helixTwist: 5,
        fileOrbitRadius: 90,
        endpointFanArc: 100,
        endpointFanCount: 6,
      },
      wellOverrides: radialBackboneWellOverrides,
      interactionOverrides: radialBackboneInteractionOverrides,
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
