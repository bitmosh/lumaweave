import type { StarmapSettings } from "./settings.schema";

export const defaultSettings: StarmapSettings = {
  version: 88, // post-v97: glitterEnabled→animationEnabled, glitterDensity→animationDensity

  general: {
    startupProjectId: null,
    autosave: true,
    openLastProjectOnStartup: true,
  },

  appearance: {
    theme: "solar-plasma",
    accentIntensity: 1,
    panelTransparency: 0.82,
    animationEnabled: true,
    reduceMotion: false,
    starfieldEnabled: true,
    // NEW v86a defaults
    drama: "cranked",
    motionScale: 0.6,
    panelBlur: 16,
    nodeHum: 0.7,
    nodeFlowSpeed: 0.55,
    nodeGlow: 1.0,
    // NEW v86b defaults (performance preset coupling)
    animationDensity: "medium",
    edgePlasmaMode: "animated-overlay",
    backdropMotion: "half",
  },

  graphView: {
    defaultRenderer: "sigma2d",
    defaultLayout: "constellation",
    showArrows: false,
    showIsolatedNodes: false,
    showLowConfidenceEdges: false,
    neighborhoodDepth: 2,
    hoverNodeColor: "#ffffff",
    nodeSize: 1,
    dimMode: "off",
  },

  physics: {
    dialectId: "gwells.dialect.radial-backbone",
    seedParamOverrides: {},
    pins: {},
    pinnedHighlightActive: false,
  },

  labels: {
    nodeLabelMode: "selected-neighborhood",
    edgeLabelMode: "selected-neighborhood",
    maxEdgeLabelLength: 48,
    showLabelsOnHover: true,
    zoomLabelThreshold: 1.15,
    edgeLabelFontSize: 13,
    nodeLabelFontSize: 13,
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
    preferredEditor: "vscode",
    customEditorTemplate: "code --goto {path}:{line}",
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
    // v86a: settingsTabSections removed
    tiledTabs: [], // v86a: DEPRECATED - kept for migration only
    tileLayout: [], // v86a: NEW - replaces tiledTabs in v86c
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

  inspector: {
    overlayEnabled: false,
    autoOpenOnSelection: true,
  },
};