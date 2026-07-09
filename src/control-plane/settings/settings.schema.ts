// SPDX-License-Identifier: Apache-2.0
import type { AdapterConfig } from "../../source-adapter/baseSourceAdapter";

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

export type GwellsDialectId =
  | "gwells.dialect.radial-backbone"
  | "gwells.dialect.parallel-spines";

export interface TileLayoutEntry {
  id: string;
  sectionKey: string;
  x: number;
  y: number;
  w: number;
  h: number;
  collapsed: boolean;
  z: number;
  prevH?: number;
}

// v104.0.0: MinimapSettings — persisted minimap state.
// Uses TileAnchor for anchor shape (offset-based; minimap uses its own
// position handler, not the tile docking engine).
export interface MinimapAnchor {
  edge: "left" | "right" | "top" | "bottom" | "free";
  offset?: number;
  x?: number;
  y?: number;
}

export interface SourcesSettings {
  active: string | null;
  configurations: Record<string, AdapterConfig>; // v109.0.1: narrowed from { inputPath?: string }
  refreshToken: number; // v108.0.1: incremented on regenerate success to re-trigger useGraphSourceSummary
}

export interface MinimapSettings {
  visible: boolean;
  collapsed: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  opacity: number;                    // clamped 0.30..1.00 by MinimapOpacitySlider
  anchor: MinimapAnchor;
  theme: "auto-contrast" | "warm-glass" | "cool-glass";
  showViewport: boolean;
  showSelectedNode: boolean;
  refreshOnLayoutComplete: boolean;
  enableClickToNavigate: boolean;
}

export interface LumaWeaveSettings {
  version: 95; // v112.5b.1: agents.inference config added

  general: {
    startupProjectId: string | null;
    autosave: boolean;
    openLastProjectOnStartup: boolean;
  };

  appearance: {
    theme: ThemeId;
    accentIntensity: number;
    panelTransparency: number;
    animationEnabled: boolean;
    reduceMotion: boolean;
    starfieldEnabled: boolean;
    // NEW v86a (defaults defined; UI for these is v86e)
    drama: "quiet" | "cranked" | "extreme"; // multiplier 0.55/1.0/1.4
    motionScale: number; // 0–1.5; reduceMotion forces 0
    panelBlur: number; // 0–28 px backdrop-filter
    nodeHum: number; // 0–2 sphere fade rate
    nodeFlowSpeed: number; // 0–2 sphere flow speed
    nodeGlow: number; // 0.2–2 glow strength
    // NEW v86b (performance preset coupling)
    animationDensity: "off" | "low" | "medium" | "high";
    edgePlasmaMode: "static" | "animated-overlay";
    backdropMotion: "off" | "low" | "half" | "full";
  };

  graphView: {
    defaultRenderer: "sigma2d" | "cosmograph2d" | "three3d";
    defaultLayout: LayoutLensId;
    showArrows: boolean;
    showIsolatedNodes: boolean;
    showLowConfidenceEdges: boolean;
    neighborhoodDepth: number;
    hoverNodeColor: string;
    nodeSize: number;
    dimMode: "off" | "outside-cluster" | "outside-pinned"; // v86d: inspector dim mode integration
  };

  physics: {
    dialectId: GwellsDialectId;
    /**
     * Per-dialect parameter overrides. Keyed by dialect id.
     * Each value is a partial seedParams record that gets merged onto
     * the dialect's defaults at runtime.
     *
     * Example:
     *   {
     *     "gwells.dialect.radial-backbone": {
     *       helixTwist: { directory: 5, file: 2 }
     *     },
     *     "gwells.dialect.parallel-spines": {
     *       helixTwist: { spine: 8 }
     *     }
     *   }
     */
    seedParamOverrides: Record<string, Record<string, unknown>>;
    /**
     * Per-dialect pin storage. Keyed by dialect id.
     * Each value is a map from node ID to pinned position.
     *
     * Example:
     *   {
     *     "gwells.dialect.radial-backbone": {
     *       "node-123": { x: 5000, y: 5000, z: 0 },
     *       "node-456": { x: 6000, y: 6000 }
     *     }
     *   }
     *
     * Added in Pass C9.1.
     */
    pins: Record<string, Record<string, { x: number; y: number; z?: number }>>;
    /**
     * Pinned highlight mode toggle. When true, dims all nodes except
     * those in the pinned set. Default false.
     *
     * Added in Pass C9.3 (changed from session-scoped to persisted for testability).
     */
    pinnedHighlightActive: boolean;
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
    qualityPreset: "custom" | "beautiful" | "balanced" | "large-graph" | "potato";
    particleCap: number;
    maxVisibleLabels: number;
    largeGraphModeThreshold: number;
  };

  inspector?: {
    overlayEnabled?: boolean;
    autoOpenOnSelection?: boolean;
  };

  developer: {
    showDebugPanel: boolean;
    showFps: boolean;
    logLevel: "silent" | "error" | "warn" | "info" | "debug";
    preferredEditor: "vscode" | "windsurf" | "cursor" | "zed" | "webstorm" | "sublime" | "vim" | "neovim" | "system-default" | "custom";
    customEditorTemplate: string;
    devMode: boolean; // v112.4.0: gates dev-only tile surfaces
  };

  ui: {
    // Left panel
    leftPanelCollapsed: boolean;
    leftPanelActiveTab: "graph" | "qa" | "evidence" | "debug"; // v86a: settings removed
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
    // v86a: settingsTabSections removed

    // Tiles (popped out tabs)
    tiledTabs: never[]; // v86a: DEPRECATED - kept for migration only
    tileLayout: TileLayoutEntry[]; // v86a: NEW - replaces tiledTabs in v86c

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

  agents: {
    inference: {
      endpoint: string;  // OpenAI-compatible endpoint URL
      model: string;     // model name (free-form)
      byokKey: string;   // optional API key; empty = no Authorization header
      temperature?: number;
      maxTokens?: number;
    };
  };

  minimap: MinimapSettings;
  sources: SourcesSettings;
}