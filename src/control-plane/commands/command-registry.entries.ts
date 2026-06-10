import { commandRegistry } from "./command-registry";
import { useSettingsStore } from "../settings/settings.store";
import { paletteController } from "./palette/useCommandPaletteState";
import { tileSectionRegistry } from "../panels/tileSectionRegistry";

function toggleTileVisibility(sectionKey: string): void {
  const state = useSettingsStore.getState();
  const tileLayout: any[] = (state.settings.ui as any)?.tileLayout ?? [];
  const section = tileSectionRegistry.getById(sectionKey);
  const entry = tileLayout.find((t: any) => t.sectionKey === sectionKey);
  const currentVisible = entry ? (entry.visible !== false) : (section?.defaultVisible ?? false);
  if (entry) {
    const updated = tileLayout.map((t: any) =>
      t.sectionKey === sectionKey ? { ...t, visible: !currentVisible } : t
    );
    state.setSetting("ui.tileLayout", updated);
  } else if (!currentVisible && section) {
    // Tile not yet in layout — create it
    const id = `tile_${Date.now().toString(36)}`;
    const newTile = {
      id,
      sectionKey,
      x: 100,
      y: 100,
      w: section.defaultWidth,
      h: section.defaultHeight,
      collapsed: false,
      z: 1,
      visible: true,
    };
    state.setSetting("ui.tileLayout", [...tileLayout, newTile]);
  }
}

function dispatch(type: string, detail?: unknown) {
  window.dispatchEvent(new CustomEvent(type, { detail }));
}

// View / Navigation
commandRegistry.register({
  id: "view.openSettings",
  label: "Open Settings",
  category: "view",
  aliases: ["settings", "preferences", "config"],
  description: "Open the settings panel",
  execute: () => dispatch("settings:open"),
});

commandRegistry.register({
  id: "view.toggleInspector",
  label: "Toggle Inspector Panel",
  category: "view",
  aliases: ["inspector", "inspect"],
  description: "Show or hide the inspector panel",
  execute: () => dispatch("inspector:toggle"),
});

commandRegistry.register({
  id: "view.toggleCommandDeck",
  label: "Toggle Command Deck",
  category: "view",
  description: "Show or hide the command deck panel",
  execute: () => dispatch("view:toggleCommandDeck"),
});

commandRegistry.register({
  id: "view.toggleMinimap",
  label: "Toggle Minimap",
  category: "view",
  description: "Show or hide the graph minimap",
  execute: () => dispatch("view:toggleMinimap"),
});

commandRegistry.register({
  id: "view.toggleReduceMotion",
  label: "Toggle Reduce Motion",
  category: "view",
  aliases: ["motion", "animation", "reduce motion"],
  description: "Enable or disable reduced motion",
  execute: () => {
    const { settings, setSetting } = useSettingsStore.getState();
    setSetting("appearance.reduceMotion", !settings.appearance.reduceMotion);
  },
});

// Graph
commandRegistry.register({
  id: "graph.fit",
  label: "Fit Graph to View",
  category: "graph",
  aliases: ["fit", "zoom to fit"],
  description: "Fit the graph to fill the viewport",
  execute: () => dispatch("graph:fitView"),
});

commandRegistry.register({
  id: "graph.resetView",
  label: "Reset Graph View",
  category: "graph",
  description: "Reset the camera to the default position",
  execute: () => dispatch("graph:resetView"),
});

commandRegistry.register({
  id: "graph.toggleIsolatedNodes",
  label: "Toggle Isolated Nodes",
  category: "graph",
  description: "Show or hide nodes with no edges",
  execute: () => {
    const { settings, setSetting } = useSettingsStore.getState();
    setSetting("graphView.showIsolatedNodes", !settings.graphView.showIsolatedNodes);
  },
});

commandRegistry.register({
  id: "graph.toggleLowConfidenceEdges",
  label: "Toggle Low Confidence Edges",
  category: "graph",
  description: "Show or hide edges with low confidence scores",
  execute: () => {
    const { settings, setSetting } = useSettingsStore.getState();
    setSetting("graphView.showLowConfidenceEdges", !settings.graphView.showLowConfidenceEdges);
  },
});

commandRegistry.register({
  id: "graph.cycleDialect",
  label: "Cycle Physics Dialect",
  category: "graph",
  aliases: ["dialect", "physics layout", "layout"],
  description: "Switch to the next gwells physics dialect",
  execute: () => dispatch("graph:cycleDialect"),
});

// Theme
commandRegistry.register({
  id: "theme.exportBundle",
  label: "Export Theme Override Bundle",
  category: "theme",
  description: "Export current theme overrides to a JSON bundle file",
  execute: () => dispatch("theme:exportBundle"),
});

commandRegistry.register({
  id: "theme.next",
  label: "Next Theme",
  category: "theme",
  aliases: ["theme", "switch theme", "change theme"],
  description: "Cycle to the next available theme",
  execute: () => dispatch("theme:next"),
});

commandRegistry.register({
  id: "theme.openWorkshop",
  label: "Open Theme Workshop",
  category: "theme",
  description: "Open the theme workshop",
  enabled: () => false,
  execute: () => {},
});

// Inspector
commandRegistry.register({
  id: "inspector.toggleThemeTargetInspector",
  label: "Toggle Theme Target Inspector",
  category: "inspector",
  description: "Enable or disable the theme target inspector overlay",
  execute: () => dispatch("inspector:toggleThemeTarget"),
});

commandRegistry.register({
  id: "inspector.pinTarget",
  label: "Pin/Unpin Target",
  category: "inspector",
  description: "Pin or unpin the currently inspected node",
  execute: () => dispatch("inspector:pinTarget"),
});

commandRegistry.register({
  id: "inspector.openOnCurrentSelection",
  label: "Inspect Current Selection",
  category: "inspector",
  aliases: ["inspect selection", "open inspector"],
  description: "Open the inspector focused on the currently selected node",
  execute: () => dispatch("inspector:openOnCurrentSelection"),
});

// Physics
commandRegistry.register({
  id: "physics.resetLayout",
  label: "Reset Physics Layout",
  category: "physics",
  description: "Reset all nodes to their seed positions",
  execute: () => dispatch("physics:resetLayout"),
});

commandRegistry.register({
  id: "physics.togglePinnedHighlight",
  label: "Toggle Pinned Highlight",
  category: "physics",
  description: "Dim all nodes except pinned ones",
  execute: () => {
    const { settings, setSetting } = useSettingsStore.getState();
    setSetting("physics.pinnedHighlightActive", !settings.physics.pinnedHighlightActive);
  },
});

// Labels
commandRegistry.register({
  id: "labels.cycleNodeLabelMode",
  label: "Cycle Node Label Mode",
  category: "labels",
  description: "Cycle through node label display modes",
  execute: () => {
    const { settings, setSetting } = useSettingsStore.getState();
    const modes = ["off", "selected-neighborhood", "important-only", "all"] as const;
    const current = settings.labels.nodeLabelMode;
    const next = modes[(modes.indexOf(current) + 1) % modes.length];
    setSetting("labels.nodeLabelMode", next);
  },
});

// Palette
commandRegistry.register({
  id: "palette.open",
  label: "Open Command Palette",
  category: "general",
  aliases: ["command palette", "palette", "commands"],
  description: "Open the command palette to search and run commands",
  execute: () => paletteController.open(),
});

// Debug
commandRegistry.register({
  id: "debug.toggleFps",
  label: "Toggle FPS Counter",
  category: "debug",
  description: "Show or hide the frames-per-second counter",
  execute: () => {
    const { settings, setSetting } = useSettingsStore.getState();
    setSetting("developer.showFps", !settings.developer.showFps);
  },
});

commandRegistry.register({
  id: "debug.clearAllOverrides",
  label: "Clear All Theme Overrides",
  category: "debug",
  description: "Permanently delete all saved theme overrides. Cannot be undone.",
  destructive: true,
  execute: () => dispatch("debug:clearAllOverrides"),
});

// Tile visibility toggles
commandRegistry.register({
  id: "view.toggleTile.physics",
  label: "Toggle Physics Tile",
  category: "view",
  aliases: ["physics", "tile"],
  execute: () => toggleTileVisibility("physics-section"),
});

commandRegistry.register({
  id: "view.toggleTile.appearance",
  label: "Toggle Appearance Tile",
  category: "view",
  aliases: ["appearance", "tile"],
  execute: () => toggleTileVisibility("appearance-section"),
});

commandRegistry.register({
  id: "view.toggleTile.labels",
  label: "Toggle Labels Tile",
  category: "view",
  aliases: ["labels", "tile"],
  execute: () => toggleTileVisibility("labels-section"),
});

commandRegistry.register({
  id: "view.toggleTile.typography",
  label: "Toggle Typography Tile",
  category: "view",
  aliases: ["typography", "tile", "font"],
  execute: () => toggleTileVisibility("typography-playground-section"),
});

commandRegistry.register({
  id: "view.toggleTile.graphSources",
  label: "Toggle Graph Sources Tile",
  category: "view",
  aliases: ["sources", "tile"],
  execute: () => toggleTileVisibility("graph-sources-section"),
});

commandRegistry.register({
  id: "view.toggleTile.graphInspector",
  label: "Toggle Graph Inspector Tile",
  category: "view",
  aliases: ["inspector", "tile"],
  execute: () => toggleTileVisibility("graph-inspector-section"),
});

commandRegistry.register({
  id: "view.toggleTile.agentChat",
  label: "Toggle Agent Chat Tile",
  category: "view",
  aliases: ["agent", "chat", "tile"],
  execute: () => toggleTileVisibility("agent-chat-section"),
});

commandRegistry.register({
  id: "view.toggleTile.graphVisualInventory",
  label: "Toggle Graph Visual Inventory Tile",
  category: "view",
  aliases: ["inventory", "evidence", "tile"],
  execute: () => toggleTileVisibility("graph-visual-inventory-section"),
});

commandRegistry.register({
  id: "view.toggleTile.systemIndex",
  label: "Toggle System Index Tile",
  category: "view",
  aliases: ["system index", "index", "tile"],
  execute: () => toggleTileVisibility("system-index-section"),
});

commandRegistry.register({
  id: "view.toggleTile.commandDeck",
  label: "Toggle Command Deck Tile",
  category: "view",
  aliases: ["command deck", "deck", "tile"],
  execute: () => toggleTileVisibility("command-deck-section"),
});
