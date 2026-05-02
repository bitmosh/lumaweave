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
    showArrows: true,
    showIsolatedNodes: false,
    showLowConfidenceEdges: false,
    nodeSelectionStage: 1,
    hoverNodeColor: "#ffffff",
    hoverLabelColor: "#e0f2fe",
    selectedNodeColor: "#fbbf24",
    defaultNodeColor: "#22d3ee",
    selectedEdgeColor: "#a855f7",
  },

  physics: {
    nodeSize: 1,
    linkThickness: 1,
    linkDistance: 120,
    repelForce: 100,
    centerForce: 40,
    communityGravity: 80,
    curveAmount: 45,
    animationSoftness: 60,
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
};