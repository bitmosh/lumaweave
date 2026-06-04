import type { ThemeTokenPath } from "./themeTokenPaths";

export type ThemeTargetStatus = "active" | "planned" | "experimental";

export type ThemeTargetSurface =
  | "shell"
  | "topbar"
  | "panel"
  | "mission-control"
  | "control"
  | "settings"
  | "graph";

export type ThemeEditableProperty =
  | "background"
  | "border"
  | "text"
  | "accent"
  | "glow"
  | "opacity"
  | "radius";

export type ThemeTargetContract = {
  themeTargetId: string;
  label: string;
  surface: ThemeTargetSurface;
  visualHandle?: string;
  tokenBindings: Partial<Record<ThemeEditableProperty, ThemeTokenPath>>;
  editableProperties: ThemeEditableProperty[];
  status: ThemeTargetStatus;
  notes?: string;
};

const THEME_TARGETS: ThemeTargetContract[] = [
  {
    themeTargetId: "app.shell",
    label: "Application Shell",
    surface: "shell",
    tokenBindings: {
      background: "app.background",
      glow: "app.glow",
    },
    editableProperties: ["background", "glow"],
    status: "active",
    notes: "Global ambient shell background + glow",
  },
  {
    themeTargetId: "topbar.root",
    label: "Top Bar",
    surface: "topbar",
    tokenBindings: {
      background: "app.background",
      border: "panel.border",
      text: "text.primary",
      accent: "accent.primary",
    },
    editableProperties: ["background", "border", "text", "accent"],
    status: "active",
  },
  {
    themeTargetId: "topbar.wordmark",
    label: "Top Bar Wordmark",
    surface: "topbar",
    tokenBindings: {
      text: "text.primary",
      accent: "accent.primary",
    },
    editableProperties: ["text", "accent"],
    status: "active",
  },
  {
    themeTargetId: "topbar.statusPill",
    label: "Top Bar Status Pill",
    surface: "topbar",
    tokenBindings: {
      border: "panel.border",
      text: "accent.primary",
      accent: "accent.primary",
    },
    editableProperties: ["border", "text", "accent"],
    status: "active",
  },
  {
    themeTargetId: "topbar.statusCluster",
    label: "Top Bar Status Cluster",
    surface: "topbar",
    tokenBindings: {
      border: "panel.border",
      text: "text.primary",
      accent: "accent.primary",
    },
    editableProperties: ["border", "text", "accent"],
    status: "active",
  },
  {
    themeTargetId: "mission-control.panel",
    label: "Mission Control Panel",
    surface: "mission-control",
    visualHandle: "lw-panel",
    tokenBindings: {
      background: "panel.background",
      border: "panel.border",
      text: "text.primary",
    },
    editableProperties: ["background", "border", "text"],
    status: "active",
  },
  {
    themeTargetId: "mission-control.question-card",
    label: "Mission Control Question Card",
    surface: "mission-control",
    visualHandle: "lw-card",
    tokenBindings: {
      background: "panel.background",
      border: "panel.border",
      text: "text.primary",
    },
    editableProperties: ["background", "border", "text"],
    status: "active",
  },
  {
    themeTargetId: "mission-control.proposal-card",
    label: "Mission Control Proposal Card",
    surface: "mission-control",
    visualHandle: "lw-card",
    tokenBindings: {
      background: "panel.background",
      border: "panel.border",
      text: "text.primary",
    },
    editableProperties: ["background", "border", "text"],
    status: "active",
  },
  {
    themeTargetId: "mission-control.backlog-card",
    label: "Mission Control Backlog Card",
    surface: "mission-control",
    visualHandle: "lw-card",
    tokenBindings: {
      background: "panel.background",
      border: "panel.border",
      text: "text.primary",
    },
    editableProperties: ["background", "border", "text"],
    status: "active",
  },
  {
    themeTargetId: "settings.panel",
    label: "Settings Panel",
    surface: "settings",
    visualHandle: "lw-panel",
    tokenBindings: {
      background: "panel.background",
      border: "panel.border",
      text: "text.primary",
    },
    editableProperties: ["background", "border", "text"],
    status: "active",
  },
  {
    themeTargetId: "graph.frame",
    label: "Graph Frame",
    surface: "graph",
    tokenBindings: {
      background: "app.background",
      border: "panel.border",
    },
    editableProperties: ["background", "border"],
    status: "active",
    notes: "Wrapper around Sigma canvas (not Sigma internals)",
  },
  // v104.0.0: minimap targets — active (shipped)
  {
    themeTargetId: "minimap.root",
    label: "Minimap Panel",
    surface: "graph",
    tokenBindings: {
      background: "panel.background",
      border: "panel.border",
    },
    editableProperties: ["background", "border"],
    status: "active",
  },
  {
    themeTargetId: "minimap.header",
    label: "Minimap Header",
    surface: "graph",
    tokenBindings: {
      background: "panel.background",
      border: "panel.border",
      text: "text.primary",
    },
    editableProperties: ["background", "border", "text"],
    status: "active",
  },
  {
    themeTargetId: "minimap.footer",
    label: "Minimap Footer",
    surface: "graph",
    tokenBindings: {
      background: "panel.background",
      border: "panel.border",
      text: "text.muted",
    },
    editableProperties: ["background", "border", "text"],
    status: "active",
  },
  {
    themeTargetId: "minimap.viewport-rect",
    label: "Minimap Viewport Rect",
    surface: "graph",
    tokenBindings: {
      border: "accent.primary",
      background: "accent.primary",
    },
    editableProperties: ["border", "background"],
    status: "active",
  },
  // Planned / future targets (no runtime bindings yet)
  {
    themeTargetId: "graph.node.default",
    label: "Graph Node Default",
    surface: "graph",
    tokenBindings: {},
    editableProperties: ["background", "accent"],
    status: "planned",
    notes: "Will bind to graph.node.* tokens after Graph Visual Policy refresh",
  },
  {
    themeTargetId: "graph.node.selected",
    label: "Graph Node Selected",
    surface: "graph",
    tokenBindings: {},
    editableProperties: ["background", "accent"],
    status: "planned",
  },
  {
    themeTargetId: "graph.edge.default",
    label: "Graph Edge Default",
    surface: "graph",
    tokenBindings: {},
    editableProperties: ["border", "accent"],
    status: "planned",
  },
  {
    themeTargetId: "graph.edge.selected",
    label: "Graph Edge Selected",
    surface: "graph",
    tokenBindings: {},
    editableProperties: ["border", "accent"],
    status: "planned",
  },
  {
    themeTargetId: "theme-mapping.panel",
    label: "Theme Mapping Panel",
    surface: "mission-control",
    tokenBindings: {},
    editableProperties: ["background", "border", "text", "accent"],
    status: "planned",
    notes: "Future Theme Mapping UI container",
  },
  {
    themeTargetId: "theme-mapping.control",
    label: "Theme Mapping Control",
    surface: "control",
    tokenBindings: {},
    editableProperties: ["background", "border", "text", "accent"],
    status: "planned",
    notes: "Placeholder for generated inspector controls",
  },
];

const themeTargetMap = new Map(THEME_TARGETS.map((target) => [target.themeTargetId, target]));

export function getThemeTargetById(themeTargetId: string): ThemeTargetContract | undefined {
  return themeTargetMap.get(themeTargetId);
}

/**
 * Returns the kind for a target, used as targetKind in resolveForTarget.
 * v89.2: kind = surface field. More granular kinds can be added later.
 */
export function getTargetKind(themeTargetId: string): string | undefined {
  return themeTargetMap.get(themeTargetId)?.surface;
}

export function getActiveThemeTargets(): ThemeTargetContract[] {
  return THEME_TARGETS.filter((target) => target.status === "active");
}

export function getPlannedThemeTargets(): ThemeTargetContract[] {
  return THEME_TARGETS.filter((target) => target.status === "planned");
}

export interface ThemeTargetSummary {
  totalTargets: number;
  activeTargets: number;
  plannedTargets: number;
  targetsWithTokenBindings: number;
  targetsWithVisualHandles: number;
  targetsMissingTokenBindings: number;
}

export function getThemeTargetSummary(): ThemeTargetSummary {
  const totalTargets = THEME_TARGETS.length;
  const activeTargets = getActiveThemeTargets().length;
  const plannedTargets = getPlannedThemeTargets().length;
  const targetsWithTokenBindings = THEME_TARGETS.filter(
    (target) => Object.keys(target.tokenBindings).length > 0,
  ).length;
  const targetsWithVisualHandles = THEME_TARGETS.filter((target) => Boolean(target.visualHandle)).length;
  const targetsMissingTokenBindings = getActiveThemeTargets().filter(
    (target) => Object.keys(target.tokenBindings).length === 0,
  ).length;

  return {
    totalTargets,
    activeTargets,
    plannedTargets,
    targetsWithTokenBindings,
    targetsWithVisualHandles,
    targetsMissingTokenBindings,
  };
}

export function getThemeTargetsBySurface(surface: ThemeTargetSurface): ThemeTargetContract[] {
  return THEME_TARGETS.filter((target) => target.surface === surface);
}

export const themeTargetRegistry = {
  targets: THEME_TARGETS,
};
