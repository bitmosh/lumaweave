// SPDX-License-Identifier: Apache-2.0
/**
 * Physics Dialect Registry
 *
 * Named force-model dialects that drive graph layout (v93+).
 * v86e: contract stub. Empty registry; v93 implements.
 *
 * Contract: docs/graph/contracts/PHYSICS_DIALECT_REGISTRY_CONTRACT.md
 */

export interface PhysicsDialect {
  id: string;
  label: string;
  forceModel: string;                      // e.g. "gwells", "repulsion-spring", "hierarchical"
  paramSchema: Record<string, unknown>;
  compatibleWithLenses: string[];          // ids from lensRegistry
  defaultSettings: Record<string, unknown>;
}

export interface PhysicsDialectFilterQuery {
  forceModel?: string;
}

export interface PhysicsDialectRegistryContract {
  list: () => PhysicsDialect[];
  getById: (id: string) => PhysicsDialect | undefined;
  filterByCategory: (query: PhysicsDialectFilterQuery) => PhysicsDialect[];
  validateShape: (entry: unknown) => entry is PhysicsDialect;
  register: (entry: PhysicsDialect) => void;
  subscribe: (listener: () => void) => () => void;
}

const entries: PhysicsDialect[] = [];
const listeners: Set<() => void> = new Set();

export const physicsDialectRegistry: PhysicsDialectRegistryContract = {
  list: () => [...entries],
  getById: (id) => entries.find((e) => e.id === id),
  filterByCategory: ({ forceModel }) =>
    forceModel !== undefined ? entries.filter((e) => e.forceModel === forceModel) : [...entries],
  validateShape: (entry): entry is PhysicsDialect => {
    if (typeof entry !== "object" || entry === null) return false;
    const e = entry as any;
    return (
      typeof e.id === "string" &&
      typeof e.label === "string" &&
      typeof e.forceModel === "string" &&
      typeof e.paramSchema === "object" && e.paramSchema !== null &&
      Array.isArray(e.compatibleWithLenses) &&
      typeof e.defaultSettings === "object" && e.defaultSettings !== null
    );
  },
  register: (entry) => {
    entries.push(entry);
    listeners.forEach((l) => l());
  },
  subscribe: (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

physicsDialectRegistry.register({
  id: "dialect.gwells.radial-backbone",
  label: "Gwells Radial Backbone",
  forceModel: "gwells",
  paramSchema: {
    spineCount: "number",
    spineAngles: "number[]",
    spineSpacing: "number",
    directoryOffset: "number",
  },
  compatibleWithLenses: ["lens.radial-backbone"],
  defaultSettings: {
    spineCount: 2,
    spineAngles: [0, 180],
    spineSpacing: 1200,
    directoryOffset: 2400,
  },
});

physicsDialectRegistry.register({
  id: "dialect.gwells.parallel-spines",
  label: "Gwells Parallel Spines",
  forceModel: "gwells",
  paramSchema: {
    spineCount: "number",
    offsetFromHub: "number",
    spineSpacing: "number",
    directoryOffset: "number",
  },
  compatibleWithLenses: ["lens.parallel-spines"],
  defaultSettings: {
    spineCount: 2,
    offsetFromHub: 1000,
    spineSpacing: 1200,
    directoryOffset: 2400,
  },
});

if (
  typeof window !== "undefined" &&
  (import.meta.env.DEV || (window as any).PLAYWRIGHT)
) {
  (window as any).__lwPhysicsDialectRegistry = physicsDialectRegistry;
}
