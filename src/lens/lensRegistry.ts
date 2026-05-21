/**
 * Lens Registry
 *
 * Graph viewing lens presets combining layout function signature,
 * suggested settings, and compatible physics dialects (v93+).
 * v86e: contract stub. Empty registry; v93 implements.
 *
 * Contract: docs/lens/contracts/LENS_REGISTRY_CONTRACT.md
 */

export interface LensEntry {
  id: string;
  label: string;
  layoutFn: string;                        // name reference to a layout function
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
      typeof e.layoutFn === "string" &&
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

if (
  typeof window !== "undefined" &&
  (import.meta.env.DEV || (window as any).PLAYWRIGHT)
) {
  (window as any).__lwLensRegistry = lensRegistry;
}
