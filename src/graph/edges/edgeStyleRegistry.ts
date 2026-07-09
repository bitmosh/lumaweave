// SPDX-License-Identifier: Apache-2.0
/**
 * Edge Style Registry
 *
 * Declares edge style presets for graph rendering (v91+).
 * v86e: contract stub. Empty registry; v91 populates with plasma/wire/ribbon presets.
 *
 * Contract: docs/graph/contracts/EDGE_STYLE_REGISTRY_CONTRACT.md
 */

export type EdgeStyleMode = "plasma" | "wire" | "ribbon";

export interface EdgeStyleEntry {
  id: string;
  label: string;
  mode: EdgeStyleMode;
  config: Record<string, unknown>;
}

export interface EdgeStyleFilterQuery {
  mode?: EdgeStyleMode;
}

export interface EdgeStyleRegistryContract {
  list: () => EdgeStyleEntry[];
  getById: (id: string) => EdgeStyleEntry | undefined;
  filterByCategory: (query: EdgeStyleFilterQuery) => EdgeStyleEntry[];
  validateShape: (entry: unknown) => entry is EdgeStyleEntry;
  register: (entry: EdgeStyleEntry) => void;
  subscribe: (listener: () => void) => () => void;
}

const entries: EdgeStyleEntry[] = [];
const listeners: Set<() => void> = new Set();

export const edgeStyleRegistry: EdgeStyleRegistryContract = {
  list: () => [...entries],
  getById: (id) => entries.find((e) => e.id === id),
  filterByCategory: ({ mode }) =>
    mode !== undefined ? entries.filter((e) => e.mode === mode) : [...entries],
  validateShape: (entry): entry is EdgeStyleEntry => {
    if (typeof entry !== "object" || entry === null) return false;
    const e = entry as any;
    return (
      typeof e.id === "string" &&
      typeof e.label === "string" &&
      (e.mode === "plasma" || e.mode === "wire" || e.mode === "ribbon") &&
      typeof e.config === "object" && e.config !== null
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

if (
  typeof window !== "undefined" &&
  (import.meta.env.DEV || (window as any).PLAYWRIGHT)
) {
  (window as any).__lwEdgeStyleRegistry = edgeStyleRegistry;
}
