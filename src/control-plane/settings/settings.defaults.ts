import type { StarmapSettings } from "./settings.schema";

export const defaultSettings: StarmapSettings = {
  version: 1,

  general: {
    startupProjectId: null,
    autosave: true,
    openLastProjectOnStartup: true,
  },

  appearance: {
    theme: "solar-plasma",
    accentIntensity: 1,
    panelTransparency: 0.82,
    glitterEnabled: true,
    reduceMotion: false,
    starfieldEnabled: true,
  },

  graphView: {
    defaultRenderer: "sigma2d",
    defaultLayout: "constellation",
    showArrows: false,
    showIsolatedNodes: false,
    showLowConfidenceEdges: false,
    neighborhoodDepth: 2,
    hoverNodeColor: "#ffffff",
  },

  physics: {
    physicsPreset: "balanced",
    nodeSize: 1,
    linkDistance: 3,
    repelForce: 100,
    centerForce: 200,
    communityGravity: 0,
    physicsDialect: "helix" as const,
    // ForceAtlas2 advanced parameters
    strongGravityMode: false,
    linLogMode: false,
    adjustSizes: false,
    barnesHutTheta: 0.5,
  },

  labels: {
    nodeLabelMode: "selected-neighborhood",
    edgeLabelMode: "selected-neighborhood",
    maxEdgeLabelLength: 48,
    showLabelsOnHover: true,
    zoomLabelThreshold: 1.15,
    edgeLabelFontSize: 13,
    nodeLabelFontSize: 13,
    hoverLabelColor: "#e0f2fe",
  },

  evidence: {
    showSourceSnippets: true,
    snippetLineCount: 5,
    showRawArtifactRefs: false,
    minimumConfidence: "low",
  },

  sourceLinking: {
    editorScheme: "vscode",
    sourceRoot: null,
    openBehavior: "editor",
  },

  performance: {
    qualityPreset: "balanced",
    particleCap: 150,
    maxVisibleLabels: 300,
    largeGraphModeThreshold: 10000,
  },

  developer: {
    showDebugPanel: true,
    showFps: false,
    logLevel: "info",
  },

  ui: {
    leftPanelCollapsed: false,
    leftPanelActiveTab: "graph",
    leftPanelWidth: 280,
    graphTabSections: {
      graphSources: true,
      sourceAdapter: true,
    },
    qaTabSections: {
      qaPanel: true,
    },
    evidenceTabSections: {
      graphVisualInventory: true,
      systemIndex: true,
      evidenceSettings: false,
    },
    debugTabSections: {
      commandDeck: false,
      debugInfo: false,
      performanceSettings: false,
    },
    settingsTabSections: {
      generalSettings: true,
    },
    tiledTabs: [],
    controlDockCollapsed: false,
    controlDockWidth: 420,
    controlDockCollapsedWidth: 40,
    controlDockSections: {
      physics: true,
      appearance: true,
      labels: false,
      graphView: false,
    },
  },
};