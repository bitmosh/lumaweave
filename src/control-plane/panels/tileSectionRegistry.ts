// SPDX-License-Identifier: Apache-2.0
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
import { QaPanelTileContent } from "../qa/QaPanelTileContent";
import { GraphVisualInventoryTileContent } from "../graph/GraphVisualInventoryTileContent";
import { SystemIndexTileContent } from "../system-index/SystemIndexTileContent";
import { CommandDeckTileContent } from "../command-deck/CommandDeckTileContent";
import { SourceAdapterTileContent } from "../../source-adapter/SourceAdapterTileContent";

// Lazy to prevent CSS imports from breaking Node.js module resolution in Playwright
const LazyTypographyPlayground = lazy(() =>
  import("./TypographyPlaygroundSection").then((m) => ({
    default: m.TypographyPlaygroundSection,
  }))
);
const LazyAgentChatTile = lazy(() =>
  import("../agent/AgentChatTile").then((m) => ({
    default: m.AgentChatTile,
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
    defaultAnchor: { edge: "right", slot: 0 },
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
    defaultAnchor: { edge: "right", slot: 1 },
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
    defaultAnchor: { edge: "right", slot: 2 },
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
    defaultAnchor: { edge: "right", slot: 3 },
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
    defaultAnchor: { edge: "left", slot: 0 },
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
    defaultAnchor: { edge: "left", slot: 1 },
    defaultVisible: true,
    defaultExpanded: true,
    iconGlyph: "🔍",
  },
  // deferred: candidate for settings advanced-tabs relocation (not a canvas tile by default)
  {
    id: "agent-chat-section",
    label: "Agent Chat",
    category: "left-panel",
    defaultWidth: 360,
    defaultHeight: 560,
    collapsible: true,
    content: () => createElement(Suspense, { fallback: null }, createElement(LazyAgentChatTile)),
    contentTestId: "agent-chat-tile",
    sourceTestId: undefined,
    defaultAnchor: { edge: "left", offset: 80 },
    defaultVisible: false,
    defaultExpanded: true,
    iconGlyph: "💬",
  },
  // deferred: candidate for settings advanced-tabs relocation (not a canvas tile by default)
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
    requiresDevMode: true,
  },

  // ===== Evidence / inspection tiles =====
  // deferred: candidate for settings advanced-tabs relocation (not a canvas tile by default)
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
    requiresDevMode: true,
  },
  // deferred: candidate for settings advanced-tabs relocation (not a canvas tile by default)
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
    requiresDevMode: true,
  },
  // deferred: candidate for settings advanced-tabs relocation (not a canvas tile by default)
  {
    id: "command-deck-section",
    label: "Keyboard Shortcuts",
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
  // deferred: candidate for settings advanced-tabs relocation (not a canvas tile by default)
  {
    id: "source-adapter-section",
    label: "Source Adapters",
    category: "left-panel",
    defaultWidth: 400,
    defaultHeight: 560,
    collapsible: true,
    content: () => createElement(SourceAdapterTileContent),
    contentTestId: "source-adapter-panel",
    sourceTestId: undefined,
    defaultAnchor: { edge: "left", offset: 80 },
    defaultVisible: false,
    defaultExpanded: true,
    iconGlyph: "🔌",
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

    if (e.kind === "webview" && (typeof e.webviewUrl !== "string" || !e.webviewUrl)) {
      errors.push(`id "${e.id}": kind "webview" requires a non-empty webviewUrl`);
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
