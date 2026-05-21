/**
 * Typography Registry
 *
 * Maps semantic typography roles (display/body/mono) to font families.
 * v86e: contract stub with 3 seed entries. Font loading deferred to v87.
 *
 * Contract: docs/theme/contracts/TYPOGRAPHY_REGISTRY_CONTRACT.md
 */

export interface TypographyEntry {
  role: string;          // e.g. "display", "body", "mono"
  fontFamily: string;    // e.g. "Space Grotesk"
  fallbackStack: string; // full CSS font-family value with fallbacks
  axisIds?: string[];    // optional refs to fontAxisRegistry entries
}

export interface TypographyFilterQuery {
  role?: string;
}

export interface TypographyRegistryContract {
  list: () => TypographyEntry[];
  getById: (id: string) => TypographyEntry | undefined;
  filterByCategory: (query: TypographyFilterQuery) => TypographyEntry[];
  validateShape: (entry: unknown) => entry is TypographyEntry;
  register: (entry: TypographyEntry) => void;
  subscribe: (listener: () => void) => () => void;
}

const entries: TypographyEntry[] = [
  { role: "display", fontFamily: "Space Grotesk", fallbackStack: '"Space Grotesk", system-ui, sans-serif' },
  { role: "body",    fontFamily: "IBM Plex Sans",  fallbackStack: '"IBM Plex Sans", system-ui, sans-serif' },
  { role: "mono",    fontFamily: "IBM Plex Mono",  fallbackStack: '"IBM Plex Mono", ui-monospace, monospace' },
];

const listeners: Set<() => void> = new Set();

export const typographyRegistry: TypographyRegistryContract = {
  list: () => [...entries],
  getById: (role) => entries.find((e) => e.role === role),
  filterByCategory: ({ role }) =>
    role !== undefined ? entries.filter((e) => e.role === role) : [...entries],
  validateShape: (entry): entry is TypographyEntry => {
    if (typeof entry !== "object" || entry === null) return false;
    const e = entry as any;
    return (
      typeof e.role === "string" &&
      typeof e.fontFamily === "string" &&
      typeof e.fallbackStack === "string"
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
  (window as any).__lwTypographyRegistry = typographyRegistry;
}
