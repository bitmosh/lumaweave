/**
 * v86c Tile Section Registry
 * Registry contract pattern for tileable sections.
 * Extended in post-v97 pass 1 with anchor defaults and new tiles.
 */

import { createElement, Suspense, lazy } from "react";
import type { TileSectionEntry, TileSectionRegistry } from "./tile.types";
import { PhysicsSectionContent } from "./PhysicsSectionContent";
import { LabelsSectionContent } from "./LabelsSectionContent";
import { AppearanceSectionContent } from "./AppearanceSectionContent";
import { GraphSourcesTileContent } from "../graph-sources/GraphSourcesTileContent";
import { GraphInspectorTileContent } from "../inspector/GraphInspectorTileContent";
import { AgentChatPlaceholder } from "../agent/AgentChatPlaceholder";
import { QaPanelTileContent } from "../qa/QaPanelTileContent";
import { GraphVisualInventoryTileContent } from "../graph/GraphVisualInventoryTileContent";
import { SystemIndexTileContent } from "../system-index/SystemIndexTileContent";
import { CommandDeckTileContent } from "../command-deck/CommandDeckTileContent";

// Lazy to prevent CSS import from breaking Node.js module resolution in Playwright
const LazyTypographyPlayground = lazy(() =>
  import("./TypographyPlaygroundSection").then((m) => ({
    default: m.TypographyPlaygroundSection,
  }))
);

const entries: TileSectionEntry[] = [
  // ===== Right-edge tiles (graph visual controls) =====
  {
    id: "physics-section",
    label: "Physics",
    category: "right-panel",
    defaultWidth: 320,
    defaultHeight: 400,
    collapsible: true,
    content: () => createElement(PhysicsSectionContent),
    contentTestId: "dialect-select",
    sourceTestId: "settings-section-physics",
    defaultAnchor: { edge: "right", offset: 80 },
    defaultVisible: true,
    defaultExpanded: true,
    iconGlyph: "⚛",
  },
  {
    id: "appearance-section",
    label: "Appearance",
    category: "right-panel",
    defaultWidth: 280,
    defaultHeight: 300,
    collapsible: true,
    content: () => createElement(AppearanceSectionContent),
    contentTestId: "appearance-section-content",
    sourceTestId: "settings-section-graph-view",
    defaultAnchor: { edge: "right", offset: 500 },
    defaultVisible: true,
    defaultExpanded: true,
    iconGlyph: "🎨",
  },
  {
    id: "labels-section",
    label: "Labels",
    category: "right-panel",
    defaultWidth: 280,
    defaultHeight: 300,
    collapsible: true,
    content: () => createElement(LabelsSectionContent),
    contentTestId: "labels-section-content",
    sourceTestId: "settings-section-labels",
    defaultAnchor: { edge: "right", offset: 820 },
    defaultVisible: true,
    defaultExpanded: true,
    iconGlyph: "🏷",
  },
  {
    id: "typography-playground-section",
    label: "Typography",
    category: "right-panel",
    defaultWidth: 360,
    defaultHeight: 420,
    collapsible: true,
    content: () =>
      createElement(Suspense, { fallback: null }, createElement(LazyTypographyPlayground)),
    contentTestId: "typography-playground",
    sourceTestId: "settings-section-typography-playground",
    defaultAnchor: { edge: "right", offset: 80 },
    defaultVisible: false,
    defaultExpanded: true,
    iconGlyph: "Aa",
  },

  // ===== Left-edge tiles =====
  {
    id: "graph-sources-section",
    label: "Graph Sources",
    category: "left-panel",
    defaultWidth: 300,
    defaultHeight: 480,
    collapsible: true,
    content: () => createElement(GraphSourcesTileContent),
    contentTestId: "graph-sources-tile-content",
    sourceTestId: undefined,
    defaultAnchor: { edge: "left", offset: 80 },
    defaultVisible: true,
    defaultExpanded: true,
    iconGlyph: "🗂",
  },
  {
    id: "graph-inspector-section",
    label: "Graph Inspector",
    category: "left-panel",
    defaultWidth: 320,
    defaultHeight: 520,
    collapsible: true,
    content: () => createElement(GraphInspectorTileContent),
    contentTestId: "graph-inspector-tile-content",
    sourceTestId: undefined,
    defaultAnchor: { edge: "left", offset: 580 },
    defaultVisible: true,
    defaultExpanded: true,
    iconGlyph: "🔍",
  },
  {
    id: "agent-chat-section",
    label: "Agent Chat",
    category: "left-panel",
    defaultWidth: 360,
    defaultHeight: 560,
    collapsible: true,
    content: () => createElement(AgentChatPlaceholder),
    contentTestId: "agent-chat-placeholder",
    sourceTestId: undefined,
    defaultAnchor: { edge: "left", offset: 80 },
    defaultVisible: false,
    defaultExpanded: true,
    iconGlyph: "💬",
  },
  {
    id: "qa-feedback-section",
    label: "Feedback & Testing",
    category: "left-panel",
    defaultWidth: 360,
    defaultHeight: 600,
    collapsible: true,
    content: () => createElement(QaPanelTileContent),
    contentTestId: "qa-panel-tile-content",
    sourceTestId: undefined,
    defaultAnchor: { edge: "left", offset: 80 },
    defaultVisible: false,
    defaultExpanded: true,
    iconGlyph: "📋",
  },

  // ===== Evidence / inspection tiles =====
  {
    id: "graph-visual-inventory-section",
    label: "Graph Visual Inventory",
    category: "left-panel",
    defaultWidth: 400,
    defaultHeight: 560,
    collapsible: true,
    content: () => createElement(GraphVisualInventoryTileContent),
    contentTestId: "graph-visual-inventory-panel",
    sourceTestId: undefined,
    defaultAnchor: { edge: "left", offset: 80 },
    defaultVisible: false,
    defaultExpanded: true,
    iconGlyph: "🗃",
  },
  {
    id: "system-index-section",
    label: "System Index",
    category: "left-panel",
    defaultWidth: 360,
    defaultHeight: 520,
    collapsible: true,
    content: () => createElement(SystemIndexTileContent),
    contentTestId: "system-index-tile-content",
    sourceTestId: undefined,
    defaultAnchor: { edge: "left", offset: 80 },
    defaultVisible: false,
    defaultExpanded: true,
    iconGlyph: "📇",
  },
  {
    id: "command-deck-section",
    label: "Command Deck",
    category: "left-panel",
    defaultWidth: 400,
    defaultHeight: 560,
    collapsible: true,
    content: () => createElement(CommandDeckTileContent),
    contentTestId: "command-deck-panel",
    sourceTestId: undefined,
    defaultAnchor: { edge: "left", offset: 80 },
    defaultVisible: false,
    defaultExpanded: true,
    iconGlyph: "🎛",
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

    if (e.category !== "left-panel" && e.category !== "control-dock" && e.category !== "right-panel") {
      errors.push("category must be 'left-panel', 'control-dock', or 'right-panel'");
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
