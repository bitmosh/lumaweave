/**
 * v86c Tile Section Registry
 * Registry contract pattern for tileable sections
 */

import { createElement } from "react";
import type { TileSectionEntry, TileSectionRegistry } from "./tile.types";
import { PhysicsSectionContent } from "./PhysicsSectionContent";

const entries: TileSectionEntry[] = [
  {
    id: "physics-section",
    label: "Physics",
    category: "control-dock",
    defaultWidth: 320,
    defaultHeight: 400,
    collapsible: true,
    content: () => createElement(PhysicsSectionContent),
    contentTestId: "dialect-select",
    sourceTestId: "settings-section-physics",
  },
  {
    id: "appearance-section",
    label: "Appearance",
    category: "control-dock",
    defaultWidth: 280,
    defaultHeight: 300,
    collapsible: true,
    sourceTestId: "settings-section-graph-view",
    // contentTestId set in Scope C-2
  },
  {
    id: "labels-section",
    label: "Labels",
    category: "control-dock",
    defaultWidth: 280,
    defaultHeight: 300,
    collapsible: true,
    sourceTestId: "settings-section-labels",
    // contentTestId set in Scope C-2
  },
];

const tileSectionRegistryImpl: TileSectionRegistry = {
  list: () => {
    return [...entries];
  },

  getById: (id: string) => {
    return entries.find((entry) => entry.id === id);
  },

  filterByCategory: (query) => {
    if (!query.category) {
      return [...entries];
    }
    return entries.filter((entry) => entry.category === query.category);
  },

  validateShape: (entry: unknown) => {
    const errors: string[] = [];
    
    if (typeof entry !== "object" || entry === null) {
      return { valid: false, errors: ["Entry must be an object"] };
    }

    const e = entry as Partial<TileSectionEntry>;

    if (typeof e.id !== "string" || !e.id) {
      errors.push("id must be a non-empty string");
    }

    if (typeof e.label !== "string" || !e.label) {
      errors.push("label must be a non-empty string");
    }

    if (e.category !== "left-panel" && e.category !== "control-dock") {
      errors.push("category must be 'left-panel' or 'control-dock'");
    }

    if (typeof e.defaultWidth !== "number" || e.defaultWidth <= 0) {
      errors.push("defaultWidth must be a positive number");
    }

    if (typeof e.defaultHeight !== "number" || e.defaultHeight <= 0) {
      errors.push("defaultHeight must be a positive number");
    }

    if (typeof e.collapsible !== "boolean") {
      errors.push("collapsible must be a boolean");
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  },

  register: (entry: TileSectionEntry) => {
    const validation = tileSectionRegistryImpl.validateShape(entry);
    if (!validation.valid) {
      throw new Error(`Invalid tile section entry: ${validation.errors?.join(", ")}`);
    }

    const existingIndex = entries.findIndex((e) => e.id === entry.id);
    if (existingIndex >= 0) {
      entries[existingIndex] = entry;
    } else {
      entries.push(entry);
    }
  },
};

export const tileSectionRegistry = tileSectionRegistryImpl;
