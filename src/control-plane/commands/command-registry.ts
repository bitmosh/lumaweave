import type { StarmapCommand } from "./command.types";

export const commandRegistry: StarmapCommand[] = [
  {
    id: "settings.open",
    title: "Open Settings",
    category: "General",
    shortcut: "Ctrl+,",
    run: (ctx) => ctx.openSettings(),
  },
  {
    id: "graph.fit",
    title: "Fit Graph",
    category: "Graph",
    shortcut: "F",
    run: (ctx) => ctx.fitGraph(),
  },
  {
    id: "graph.resetView",
    title: "Reset Graph View",
    category: "Graph",
    run: (ctx) => ctx.resetView(),
  },
];