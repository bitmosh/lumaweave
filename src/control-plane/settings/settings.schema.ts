export type ThemeId =
  | "solar-plasma"
  | "obsidian-aurora"
  | "midnight-loom"
  | "void-circuit"
  | "agartha-dream"
  | "agartha-dusk";

export type EdgeLabelMode =
  | "off"
  | "selected-neighborhood"
  | "important-only"
  | "all-short"
  | "all-medium";

export type NodeLabelMode =
  | "off"
  | "selected-neighborhood"
  | "important-only"
  | "all";

export type LayoutLensId =
  | "constellation"
  | "districts"
  | "solar-orbit"
  | "helix"
  | "trihelix"
  | "pipeline"
  | "impact-rings";

export interface StarmapSettings {
  version: number;

  general: {
    startupProjectId: string | null;
    autosave: boolean;
    openLastProjectOnStartup: boolean;
  };

  appearance: {
    theme: ThemeId;
    accentIntensity: number;
    panelTransparency: number;
    glitterEnabled: boolean;
    reduceMotion: boolean;
    starfieldEnabled: boolean;
  };

  graphView: {
    defaultRenderer: "sigma2d" | "cosmograph2d" | "three3d";
    defaultLayout: LayoutLensId;
    showArrows: boolean;
    showIsolatedNodes: boolean;
    showLowConfidenceEdges: boolean;
    neighborhoodDepth: number;
    hoverNodeColor: string;
  };

  physics: {
    physicsPreset: "custom" | "balanced" | "spread" | "tight" | "organic" | "performance";
    nodeSize: number;
    linkDistance: number;
    repelForce: number;
    centerForce: number;
    communityGravity: number;
    physicsDialect: "default" | "helix" | "solar-orbit";
    // ForceAtlas2 advanced parameters
    strongGravityMode: boolean;
    linLogMode: boolean;
    adjustSizes: boolean;
    barnesHutTheta: number;
  };

  labels: {
    nodeLabelMode: NodeLabelMode;
    edgeLabelMode: EdgeLabelMode;
    maxEdgeLabelLength: number;
    showLabelsOnHover: boolean;
    zoomLabelThreshold: number;
    edgeLabelFontSize: number;
    nodeLabelFontSize: number;
  };

  evidence: {
    showSourceSnippets: boolean;
    snippetLineCount: number;
    showRawArtifactRefs: boolean;
    minimumConfidence: "low" | "medium" | "high";
  };

  sourceLinking: {
    editorScheme: "vscode" | "windsurf" | "file";
    sourceRoot: string | null;
    openBehavior: "editor" | "file" | "both";
  };

  performance: {
    qualityPreset: "beautiful" | "balanced" | "large-graph" | "potato";
    particleCap: number;
    maxVisibleLabels: number;
    largeGraphModeThreshold: number;
  };

  developer: {
    showDebugPanel: boolean;
    showFps: boolean;
    logLevel: "silent" | "error" | "warn" | "info" | "debug";
  };

  ui: {
    // Left panel
    leftPanelCollapsed: boolean;
    leftPanelActiveTab: "graph" | "qa" | "evidence" | "debug" | "settings";
    leftPanelWidth: number; // px when expanded (default 280)

    // Left panel section collapse states per tab
    graphTabSections: {
      graphSources: boolean;
      sourceAdapter: boolean;
    };
    qaTabSections: {
      qaPanel: boolean;
    };
    evidenceTabSections: {
      graphVisualInventory: boolean;
      systemIndex: boolean;
      evidenceSettings: boolean;
    };
    debugTabSections: {
      commandDeck: boolean;
      debugInfo: boolean;
      performanceSettings: boolean;
    };
    settingsTabSections: {
      generalSettings: boolean;
    };

    // Tiles (popped out tabs)
    tiledTabs: Array<"graph" | "qa" | "evidence" | "debug" | "settings">;

    // Control Dock (right panel)
    controlDockCollapsed: boolean;
    controlDockWidth: number;           // px when expanded
    controlDockCollapsedWidth: number;  // px when collapsed (default 40)
    controlDockSections: {
      physics: boolean;
      appearance: boolean;
      labels: boolean;
      graphView: boolean;
    };
  };
}