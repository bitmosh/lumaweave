import { commandRegistry } from "./command-registry";
import { useSettingsStore } from "../settings/settings.store";

function dispatch(type: string, detail?: unknown) {
  window.dispatchEvent(new CustomEvent(type, { detail }));
}

// General
commandRegistry.register({
  id: "settings.open",
  label: "Open Settings",
  category: "General",
  execute: () => dispatch("settings:open"),
});

// Graph
commandRegistry.register({
  id: "graph.fit",
  label: "Fit Graph to View",
  category: "Graph",
  execute: () => dispatch("graph:fitView"),
});

commandRegistry.register({
  id: "graph.resetView",
  label: "Reset Graph View",
  category: "Graph",
  execute: () => dispatch("graph:resetView"),
});

commandRegistry.register({
  id: "graph.toggleIsolatedNodes",
  label: "Toggle Isolated Nodes",
  category: "Graph",
  execute: () => {
    const { settings, setSetting } = useSettingsStore.getState();
    setSetting("graphView.showIsolatedNodes", !settings.graphView.showIsolatedNodes);
  },
});

commandRegistry.register({
  id: "graph.toggleLowConfidenceEdges",
  label: "Toggle Low Confidence Edges",
  category: "Graph",
  execute: () => {
    const { settings, setSetting } = useSettingsStore.getState();
    setSetting("graphView.showLowConfidenceEdges", !settings.graphView.showLowConfidenceEdges);
  },
});

// Theme
commandRegistry.register({
  id: "theme.exportBundle",
  label: "Export Theme Override Bundle",
  category: "Theme",
  execute: () => dispatch("theme:exportBundle"),
});

// View
commandRegistry.register({
  id: "inspector.toggleThemeTargetInspector",
  label: "Toggle Theme Target Inspector",
  category: "View",
  execute: () => dispatch("inspector:toggleThemeTarget"),
});

commandRegistry.register({
  id: "view.toggleCommandDeck",
  label: "Toggle Command Deck",
  category: "View",
  execute: () => dispatch("view:toggleCommandDeck"),
});

commandRegistry.register({
  id: "view.toggleMinimap",
  label: "Toggle Minimap",
  category: "View",
  execute: () => dispatch("view:toggleMinimap"),
});

// Inspector
commandRegistry.register({
  id: "inspector.toggle",
  label: "Toggle Inspector Panel",
  category: "Inspector",
  execute: () => dispatch("inspector:toggle"),
});

commandRegistry.register({
  id: "inspector.pinTarget",
  label: "Pin/Unpin Target",
  category: "Inspector",
  execute: () => dispatch("inspector:pinTarget"),
});

// Physics
commandRegistry.register({
  id: "physics.resetLayout",
  label: "Reset Physics Layout",
  category: "Physics",
  execute: () => dispatch("physics:resetLayout"),
});

commandRegistry.register({
  id: "physics.togglePinnedHighlight",
  label: "Toggle Pinned Highlight",
  category: "Physics",
  execute: () => {
    const { settings, setSetting } = useSettingsStore.getState();
    setSetting("physics.pinnedHighlightActive", !settings.physics.pinnedHighlightActive);
  },
});

// Labels
commandRegistry.register({
  id: "labels.cycleNodeLabelMode",
  label: "Cycle Node Label Mode",
  category: "Labels",
  execute: () => {
    const { settings, setSetting } = useSettingsStore.getState();
    const modes = ["off", "selected-neighborhood", "important-only", "all"] as const;
    const current = settings.labels.nodeLabelMode;
    const next = modes[(modes.indexOf(current) + 1) % modes.length];
    setSetting("labels.nodeLabelMode", next);
  },
});

// Debug
commandRegistry.register({
  id: "debug.toggleFps",
  label: "Toggle FPS Counter",
  category: "Debug",
  execute: () => {
    const { settings, setSetting } = useSettingsStore.getState();
    setSetting("developer.showFps", !settings.developer.showFps);
  },
});
