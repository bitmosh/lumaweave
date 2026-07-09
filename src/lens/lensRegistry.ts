// SPDX-License-Identifier: Apache-2.0
/**
 * Lens Registry
 *
 * Graph viewing lens presets combining suggested settings
 * and compatible physics dialects (v93+).
 * v86e: contract stub. Empty registry; v93 implements.
 * v93: drop layoutFn (no dispatch yet), add description+status, register 2 entries.
 *
 * Contract: docs/lens/contracts/LENS_REGISTRY_CONTRACT.md
 */

export interface LensEntry {
  id: string;
  label: string;
  description: string;
  status: "active" | "planned" | "experimental";
  suggestedSettings: Record<string, unknown>;
  compatibleDialects: string[];            // ids from physicsDialectRegistry
}

export interface LensFilterQuery {
  compatibleDialect?: string;
}

export interface LensRegistryContract {
  list: () => LensEntry[];
  getById: (id: string) => LensEntry | undefined;
  filterByCategory: (query: LensFilterQuery) => LensEntry[];
  validateShape: (entry: unknown) => entry is LensEntry;
  register: (entry: LensEntry) => void;
  subscribe: (listener: () => void) => () => void;
}

const entries: LensEntry[] = [];
const listeners: Set<() => void> = new Set();

export const lensRegistry: LensRegistryContract = {
  list: () => [...entries],
  getById: (id) => entries.find((e) => e.id === id),
  filterByCategory: ({ compatibleDialect }) =>
    compatibleDialect !== undefined
      ? entries.filter((e) => e.compatibleDialects.includes(compatibleDialect))
      : [...entries],
  validateShape: (entry): entry is LensEntry => {
    if (typeof entry !== "object" || entry === null) return false;
    const e = entry as any;
    return (
      typeof e.id === "string" &&
      typeof e.label === "string" &&
      typeof e.description === "string" &&
      typeof e.status === "string" &&
      typeof e.suggestedSettings === "object" && e.suggestedSettings !== null &&
      Array.isArray(e.compatibleDialects)
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

lensRegistry.register({
  id: "lens.radial-backbone",
  label: "Radial Backbone",
  description: "Radial layout with a central backbone spine, nodes arranged along angled arms",
  status: "active",
  suggestedSettings: {
    spineCount: 2,
    spineAngles: [0, 180],
    spineSpacing: 1200,
    directoryOffset: 2400,
  },
  compatibleDialects: ["dialect.gwells.radial-backbone"],
});

lensRegistry.register({
  id: "lens.parallel-spines",
  label: "Parallel Spines",
  description: "Parallel vertical spines layout with nodes offset from a central hub",
  status: "active",
  suggestedSettings: {
    spineCount: 2,
    offsetFromHub: 1000,
    spineSpacing: 1200,
    directoryOffset: 2400,
  },
  compatibleDialects: ["dialect.gwells.parallel-spines"],
});

if (
  typeof window !== "undefined" &&
  (import.meta.env.DEV || (window as any).PLAYWRIGHT)
) {
  (window as any).__lwLensRegistry = lensRegistry;
}
