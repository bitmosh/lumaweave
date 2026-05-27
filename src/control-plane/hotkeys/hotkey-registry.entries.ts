import { hotkeyRegistry } from "./hotkey-registry";

// Active: accepted by governance (v35 contract + v97a additions + v97b palette)
hotkeyRegistry.register({
  id: "inspector.toggle",
  label: "Inspector Toggle",
  category: "Inspector",
  binding: { modifiers: ["Alt", "Shift"], key: "I" },
  commandId: "view.toggleInspector",
  status: "active",
});

hotkeyRegistry.register({
  id: "inspector.pinTarget",
  label: "Pin/Unpin Target",
  category: "Inspector",
  binding: { modifiers: ["Alt", "Shift"], key: "P" },
  commandId: "inspector.pinTarget",
  status: "active",
});

hotkeyRegistry.register({
  id: "graph.fit",
  label: "Fit Graph to View",
  category: "Graph",
  binding: { modifiers: [], key: "F" },
  commandId: "graph.fit",
  status: "active",
});

hotkeyRegistry.register({
  id: "graph.resetView",
  label: "Reset Graph View",
  category: "Graph",
  binding: { modifiers: ["Alt"], key: "R" },
  commandId: "graph.resetView",
  status: "active",
});

hotkeyRegistry.register({
  id: "view.toggleCommandDeck",
  label: "Toggle Command Deck",
  category: "Navigation",
  binding: { modifiers: ["Alt", "Shift"], key: "D" },
  commandId: "view.toggleCommandDeck",
  status: "active",
});

hotkeyRegistry.register({
  id: "settings.open",
  label: "Open Settings",
  category: "General",
  binding: { modifiers: ["Ctrl"], key: "," },
  commandId: "view.openSettings",
  status: "active",
});

hotkeyRegistry.register({
  id: "commandPalette.open",
  label: "Open Command Palette",
  category: "General",
  binding: { modifiers: ["Ctrl"], key: "k" },
  commandId: "palette.open",
  status: "active",
});

// Native: browser/OS managed — do not intercept
hotkeyRegistry.register({
  id: "native.fullscreen",
  label: "Fullscreen",
  category: "Native",
  binding: { modifiers: [], key: "F11" },
  status: "native",
  governanceNote: "Browser-managed; do not intercept.",
});

hotkeyRegistry.register({
  id: "native.devtools",
  label: "Developer Tools",
  category: "Native",
  binding: { modifiers: ["Ctrl", "Shift"], key: "I" },
  status: "native",
  governanceNote: "Browser-managed; do not intercept.",
});

hotkeyRegistry.register({
  id: "native.find",
  label: "Find in Page",
  category: "Native",
  binding: { modifiers: ["Ctrl"], key: "F" },
  status: "native",
  governanceNote: "Browser-managed; do not intercept.",
});

// Banned: reserved by platform — cannot be bound to commands
hotkeyRegistry.register({
  id: "banned.escape",
  label: "Escape",
  category: "Banned",
  binding: { modifiers: [], key: "Escape" },
  status: "banned",
  governanceNote: "Reserved for modal/overlay dismiss; cannot be bound to commands.",
});

hotkeyRegistry.register({
  id: "banned.enter",
  label: "Enter",
  category: "Banned",
  binding: { modifiers: [], key: "Enter" },
  status: "banned",
  governanceNote: "Reserved for form submission; cannot be bound to commands.",
});
