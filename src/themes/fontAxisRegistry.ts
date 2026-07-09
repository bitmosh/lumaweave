// SPDX-License-Identifier: Apache-2.0
/**
 * Font Axis Registry
 *
 * Variable font axis registry for typography playground (v87+).
 * v86e: contract stub. Empty registry; v87 populates with seed data.
 *
 * Contract: docs/theme/contracts/FONT_AXIS_REGISTRY_CONTRACT.md
 */

export interface FontAxisEntry {
  id: string;
  fontFamily: string;
  axis: string;        // CSS variation axis tag (e.g. "wght", "opsz")
  axisName: string;
  min: number;
  max: number;
  default: number;
  step?: number;
}

export interface FontAxisFilterQuery {
  fontFamily?: string;
}

export interface FontAxisRegistryContract {
  list: () => FontAxisEntry[];
  getById: (id: string) => FontAxisEntry | undefined;
  filterByCategory: (query: FontAxisFilterQuery) => FontAxisEntry[];
  validateShape: (entry: unknown) => entry is FontAxisEntry;
  register: (entry: FontAxisEntry) => void;
  subscribe: (listener: () => void) => () => void;
}

const entries: FontAxisEntry[] = [];
const listeners: Set<() => void> = new Set();

export const fontAxisRegistry: FontAxisRegistryContract = {
  list: () => [...entries],
  getById: (id) => entries.find((e) => e.id === id),
  filterByCategory: ({ fontFamily }) =>
    fontFamily !== undefined ? entries.filter((e) => e.fontFamily === fontFamily) : [...entries],
  validateShape: (entry): entry is FontAxisEntry => {
    if (typeof entry !== "object" || entry === null) return false;
    const e = entry as any;
    return (
      typeof e.id === "string" &&
      typeof e.fontFamily === "string" &&
      typeof e.axis === "string" &&
      typeof e.axisName === "string" &&
      typeof e.min === "number" &&
      typeof e.max === "number" &&
      typeof e.default === "number"
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
  (window as any).__lwFontAxisRegistry = fontAxisRegistry;
}

// v87.4 seed — wght axis for each font loaded in v87.2
// Ranges match the variable font specs; Google Fonts loads discrete weights
// by default (see index.html). The playground slider works but snaps between
// loaded weights until the URL is updated to request a wght range.
fontAxisRegistry.register({
  id: "space-grotesk-wght",
  fontFamily: "Space Grotesk",
  axis: "wght",
  axisName: "Weight",
  min: 300,
  max: 700,
  default: 500,
  step: 1,
});

fontAxisRegistry.register({
  id: "ibm-plex-sans-wght",
  fontFamily: "IBM Plex Sans",
  axis: "wght",
  axisName: "Weight",
  min: 100,
  max: 700,
  default: 400,
  step: 1,
});

fontAxisRegistry.register({
  id: "ibm-plex-mono-wght",
  fontFamily: "IBM Plex Mono",
  axis: "wght",
  axisName: "Weight",
  min: 100,
  max: 500,
  default: 400,
  step: 1,
});
