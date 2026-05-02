export type ThemeId =
  | "solar-plasma"
  | "obsidian-aurora"
  | "haunted-observatory"
  | "glitter-goblin";

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
    nodeSelectionStage: 1 | 2 | 3;
    hoverNodeColor: string;
    hoverLabelColor: string;
    selectedNodeColor: string;
    defaultNodeColor: string;
    selectedEdgeColor: string;
  };

  physics: {
    nodeSize: number;
    linkThickness: number;
    linkDistance: number;
    repelForce: number;
    centerForce: number;
    communityGravity: number;
    curveAmount: number;
    animationSoftness: number;
  };

  labels: {
    nodeLabelMode: NodeLabelMode;
    edgeLabelMode: EdgeLabelMode;
    maxEdgeLabelLength: number;
    showLabelsOnHover: boolean;
    zoomLabelThreshold: number;
    edgeLabelFontSize: number;
    nodeLabelFontSize: number;
    hoverLabelColor: string;
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
}