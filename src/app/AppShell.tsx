import { useState, useEffect, useMemo } from "react";
// v86a: SettingsPanel removed - Settings tab removed from left panel
import { QaPanel } from "../control-plane/qa/QaPanel";
import { InspectorPanel } from "../control-plane/panels/InspectorPanel";
import { CollapsiblePanel } from "../control-plane/panels/CollapsiblePanel";
import { CollapsibleSection } from "../control-plane/panels/CollapsibleSection";
import { CommandDeckPanel } from "../control-plane/command-deck/CommandDeckPanel";
import { GraphVisualInventoryPanel } from "../control-plane/graph/GraphVisualInventoryPanel";
import { SystemIndexPanel } from "../control-plane/system-index/SystemIndexPanel";
import { SourceAdapterPanel } from "../source-adapter/SourceAdapterPanel";
import { LeftTabPanel } from "../control-plane/panels/LeftTabPanel";
import { ControlDock } from "../control-plane/panels/ControlDock";
import { TileProvider } from "../control-plane/panels/TileProvider";
import { TileLayer } from "../control-plane/panels/TileLayer";
import { useSettingsStore, settingsStore } from "../control-plane/settings/settings.store";
import { useGraphSourceSummary } from "../graph/ingest/useGraphSourceSummary";
import { SigmaGraphView } from "../graph/renderers/sigma2d/SigmaGraphView";
import {
  getRelationshipNeighborhood,
} from "../graph/renderers/sigma2d/selectionNeighborhood";
import {
  buildGraphologyGraph,
} from "../graph/renderers/sigma2d/buildGraphologyGraph";
import { getThemeRuntimeTokens, resolveGraphVisualTokens } from "../themes";
import { ThemeTargetInspectorOverlay } from "../themes/ThemeTargetInspectorOverlay";
import { adaptSelfGraphToSigma } from "../fixtures/self-graph-adapter";
import generatedGraph from "../fixtures/self-graph-generated.json";
import type { LumaSourceGraph } from "../fixtures/types";
import { PlasmaOverlayEdge } from "../graph/edges/PlasmaOverlayEdge";
import { SolarBackdrop } from "../graph/overlay/SolarBackdrop";
import { ClickHalo } from "../graph/overlay/ClickHalo";
import { GlitterField } from "../graph/overlay/GlitterField";
import { BookmarkLayer } from "../graph/overlay/BookmarkLayer";
import { Minimap } from "../graph/overlay/Minimap";
import { bookmarkRegistry, initializeDemoBookmarks } from "../graph/overlay/bookmarkRegistry";

export function AppShell() {
  const settings = useSettingsStore((state) => state.settings);
  const setSetting = useSettingsStore((state) => state.setSetting);
  const { summary, error: summaryError } = useGraphSourceSummary();

  // Expose app state for Playwright tests (dev mode only)
  useEffect(() => {
    if (import.meta.env.DEV || (window as any).PLAYWRIGHT) {
      (window as any).__lwStore = settingsStore;
    }
  }, []);

  // Smart fixture switching:
  // - Build-time injected by Vite define
  // - true when running under Playwright (stable geometry)
  // - false in dev/prod
  const isTestEnv =
    typeof __PLAYWRIGHT__ !== "undefined" && __PLAYWRIGHT__;

  const hasRealSource =
    !summaryError &&
    summary.normalizedNodes != null &&
    summary.normalizedNodes.length > 0;

  // In test env: always use fixture (stable geometry)
  // In dev/prod: use real source if available
  const useFixture = isTestEnv || !hasRealSource;

  const adaptedFixture = useMemo(
    () => adaptSelfGraphToSigma(generatedGraph as LumaSourceGraph),
    []
  );

  const panelSummary = useFixture ? {
    label: "LumaWeave Self-Graph",
    sourcePath: "src/fixtures/self-graph-generated.json",
    status: "loaded" as const,
    graphPresent: true,
    manifestPresent: false,
    reportPresent: false,
    nodeCount: 124,
    edgeCount: 115,
    normalizedNodeCount: 124,
    normalizedEdgeCount: 115,
    warnings: [] as string[],
    componentCount: undefined,
    isolatedNodeCount: undefined,
    largestComponentSize: undefined,
  } : summary;

  // v86b: Quality preset values for appearance sync
  const QUALITY_PRESET_VALUES = {
    potato: {
      reduceMotion: true,
      glitterDensity: "off" as const,
      edgePlasmaMode: "static" as const,
      backdropMotion: "off" as const,
      motionScale: 0,
      drama: "quiet" as const,
      nodeHum: 0,
      nodeFlowSpeed: 0,
      nodeGlow: 0.2,
      starfieldEnabled: false,
    },
    "large-graph": {
      reduceMotion: true,
      glitterDensity: "low" as const,
      edgePlasmaMode: "static" as const,
      backdropMotion: "low" as const,
      motionScale: 0.3,
      drama: "quiet" as const,
      nodeHum: 0.2,
      nodeFlowSpeed: 0.2,
      nodeGlow: 0.5,
      starfieldEnabled: false,
    },
    balanced: {
      reduceMotion: false,
      glitterDensity: "medium" as const,
      edgePlasmaMode: "animated-overlay" as const,
      backdropMotion: "half" as const,
      motionScale: 0.6,
      drama: "cranked" as const,
      nodeHum: 0.7,
      nodeFlowSpeed: 0.55,
      nodeGlow: 1.0,
      starfieldEnabled: true,
    },
    beautiful: {
      reduceMotion: false,
      glitterDensity: "high" as const,
      edgePlasmaMode: "animated-overlay" as const,
      backdropMotion: "full" as const,
      motionScale: 1.0,
      drama: "extreme" as const,
      nodeHum: 1.2,
      nodeFlowSpeed: 1.0,
      nodeGlow: 1.5,
      starfieldEnabled: true,
    },
  };

  // v86b: Sync appearance settings with quality preset values
  useEffect(() => {
    const preset = settings.performance.qualityPreset;
    if (preset === "custom") return;
    const vals = QUALITY_PRESET_VALUES[preset as keyof typeof QUALITY_PRESET_VALUES];
    if (!vals) return;
    setSetting("appearance", { ...settings.appearance, ...vals });
  }, [settings.performance.qualityPreset]);
  
  // v86b: Auto-flip qualityPreset to custom when appearance values change manually
  useEffect(() => {
    const preset = settings.performance.qualityPreset;
    if (preset === "custom") return;
    const vals = QUALITY_PRESET_VALUES[preset as keyof typeof QUALITY_PRESET_VALUES];
    if (!vals) return;
    const current = settings.appearance;
    const differs =
      current.reduceMotion !== vals.reduceMotion ||
      current.glitterDensity !== vals.glitterDensity ||
      current.edgePlasmaMode !== vals.edgePlasmaMode ||
      current.backdropMotion !== vals.backdropMotion ||
      current.motionScale !== vals.motionScale ||
      current.drama !== vals.drama ||
      current.nodeHum !== vals.nodeHum ||
      current.nodeFlowSpeed !== vals.nodeFlowSpeed ||
      current.nodeGlow !== vals.nodeGlow ||
      current.starfieldEnabled !== vals.starfieldEnabled;
    if (differs) setSetting("performance.qualityPreset", "custom");
  }, [
    settings.appearance.reduceMotion,
    settings.appearance.glitterDensity,
    settings.appearance.edgePlasmaMode,
    settings.appearance.backdropMotion,
    settings.appearance.motionScale,
    settings.appearance.drama,
    settings.appearance.nodeHum,
    settings.appearance.nodeFlowSpeed,
    settings.appearance.nodeGlow,
    settings.appearance.starfieldEnabled,
  ]);

  // v86c: Memoize theme tokens to prevent identity churn on unrelated settings changes
  const themeTokens = useMemo(
    () => getThemeRuntimeTokens(settings.appearance.theme),
    [settings.appearance.theme]
  );

  // Resolve graph visual tokens from theme tokens with settings overrides
  // v86c: Memoize to prevent identity churn on unrelated settings changes
  const resolvedGraphTokens = useMemo(
    () => resolveGraphVisualTokens(themeTokens.graph, {
      hoverNodeColor: settings.graphView.hoverNodeColor,
    }),
    [themeTokens, settings.graphView.hoverNodeColor]
  );

  const neighborhoodDepth = Math.floor(
    settings.graphView.neighborhoodDepth ?? 2
  ) as 1 | 2 | 3 | 4;

  // Pass C4: Derive active dialect's seedParamOverrides for live tuning
  const activeSeedParamOverrides = (settings.physics.seedParamOverrides?.[settings.physics.dialectId] ?? {}) as Record<string, unknown>;

  // Pass C9.1: Derive active dialect's pin map
  const activePins = (settings.physics.pins?.[settings.physics.dialectId] ?? {}) as Record<string, { x: number; y: number; z?: number }>;

  // v86b: Click halo state — single active halo, overridden by rapid clicks
  const [clickHalo, setClickHalo] = useState<{
    x: number;
    y: number;
    color: string;
    key: number;
  } | null>(null);

  // v86b: Initialize demo bookmarks once on mount
  useEffect(() => {
    if (bookmarkRegistry.getAll().length === 0) {
      initializeDemoBookmarks();
    }
  }, []);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [pathTargetId, setPathTargetId] = useState<string | null>(null);
  const [inspectorExpanded, setInspectorExpanded] = useState(false);
  const [themeInspectorEnabled, setThemeInspectorEnabled] = useState(false);

  // Pass C9.2: pinned highlight mode state (persisted for testability)
  const pinnedHighlightActive = settings.physics?.pinnedHighlightActive ?? false;
  const setPinnedHighlightActive = (value: boolean) => {
    setSetting("physics.pinnedHighlightActive", value);
  };

  // Ctrl+\ hotkey to toggle left panel
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "\\") {
        e.preventDefault();
        setSetting("ui", {
          ...settings.ui,
          leftPanelCollapsed: !settings.ui.leftPanelCollapsed,
        });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [settings.ui, setSetting]);

  // v86b: Click handler for viewport background — spawns visual halo
  const handleViewportClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setClickHalo({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      color: resolvedGraphTokens?.selectionHaloColor ?? "#3b82f6",
      key: Date.now(),
    });
  };

  // Determine which graph data to use
  const graphNodes = useFixture ? adaptedFixture.nodes : summary.normalizedNodes;
  const graphEdges = useFixture ? adaptedFixture.edges : summary.normalizedEdges;

  const selectedNode = selectedNodeId
    ? graphNodes?.find((node) => node.id === selectedNodeId) || null
    : null;

  const selectedEdge = selectedEdgeId
    ? graphEdges?.find((edge) => edge.id === selectedEdgeId) || null
    : null;

  const selectedEdgeSource = selectedEdge
    ? graphNodes?.find((node) => node.id === selectedEdge.source) || null
    : null;

  const selectedEdgeTarget = selectedEdge
    ? graphNodes?.find((node) => node.id === selectedEdge.target) || null
    : null;

  // Compute neighborhood for selected edge
  let secondaryEdgeCount = 0;
  let secondaryNodeCount = 0;

  if (selectedEdgeId && graphNodes && graphEdges) {
    const { graph } = buildGraphologyGraph(
      graphNodes,
      graphEdges,
      {
        nodeSize: settings.graphView.nodeSize,
      },
    );
    const neighborhood = getRelationshipNeighborhood(graph, selectedEdgeId);
    secondaryEdgeCount = neighborhood.secondaryEdgeIds.length;
    secondaryNodeCount = neighborhood.secondaryNodeIds.length;
  }

  // Compute component diagnostics for fixture
  let componentDiagnostics = {
    componentCount: undefined as number | undefined,
    isolatedNodeCount: undefined as number | undefined,
    largestComponentSize: undefined as number | undefined,
  };

  if (useFixture && adaptedFixture.nodes.length > 0) {
    const { diagnostics: fixtureDiagnostics } = buildGraphologyGraph(
      adaptedFixture.nodes,
      adaptedFixture.edges,
      {
        nodeSize: settings.graphView.nodeSize,
      },
    );
    componentDiagnostics = {
      componentCount: fixtureDiagnostics.componentCount,
      isolatedNodeCount: fixtureDiagnostics.isolatedNodeCount,
      largestComponentSize: fixtureDiagnostics.largestComponentSize,
    };
  }

  const graphSummary = useFixture
    ? {
        source: "Self-Graph (LumaWeave docs)",
        rawNodeCount: generatedGraph.metadata.stats.nodeCount,
        rawEdgeCount: generatedGraph.metadata.stats.edgeCount,
        normalizedNodeCount: adaptedFixture.nodes.length,
        normalizedEdgeCount: adaptedFixture.edges.length,
        renderer: "sigma2d",
        layout: "sunflower",
        status: "loaded",
        ...componentDiagnostics,
      }
    : {
        source: summary.sourceId || "Unknown",
        rawNodeCount: summary.nodeCount,
        rawEdgeCount: summary.edgeCount,
        normalizedNodeCount: summary.normalizedNodeCount,
        normalizedEdgeCount: summary.normalizedEdgeCount,
        renderer: "sigma2d",
        layout: "sunflower",
        status: summary.status,
      };

  return (
    <TileProvider>
      <main 
      className="h-screen overflow-hidden text-slate-100"
      style={{
        "--lw-app-bg": themeTokens.app.background,
        "--lw-panel-bg": themeTokens.app.panelBackground,
        "--lw-panel-border": themeTokens.app.panelBorder,
        "--lw-text-primary": themeTokens.app.textPrimary,
        "--lw-text-muted": themeTokens.app.textMuted,
        "--lw-accent": themeTokens.app.accent,
        "--lw-visual-accent": themeTokens.app.accent,
        "--lw-glow": themeTokens.app.glow,
        backgroundColor: themeTokens.app.background,
      } as React.CSSProperties}
      data-lw-theme-target="app.shell"
    >
      <div className="grid h-screen grid-rows-[auto_1fr_auto]">
        <header
          className="px-6 py-4"
          style={{
            borderBottom: "1px solid rgba(34, 211, 238, 0.15)",
            backgroundColor: `${themeTokens.app.background}dd`,
          } as React.CSSProperties}
          data-lw-theme-target="topbar.root"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-2xl font-bold"
                style={{ color: "var(--lw-visual-accent, #22d3ee)" } as React.CSSProperties}
              >
                LumaWeave Observatory
              </h1>
              <p className="text-sm" style={{ color: "var(--lw-text-muted, #94a3b8)" } as React.CSSProperties}>
                Local-first luminous architecture workbench
              </p>
            </div>

            <div className="flex items-center gap-6">
              {/* Compact Appearance Controls */}
              <div className="flex items-center gap-3">
                <select
                  data-testid="theme-preset-selector"
                  value={settings.appearance.theme}
                  onChange={(e) => setSetting("appearance.theme", e.target.value)}
                  style={{
                    borderRadius: "0.5rem",
                    border: `1px solid ${themeTokens.app.panelBorder}`,
                    backgroundColor: `${themeTokens.app.background}cc`,
                    color: themeTokens.app.textPrimary,
                    padding: "0.5rem 0.75rem",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  } as React.CSSProperties}
                >
                  <option value="solar-plasma">Solar Plasma</option>
                  <option value="obsidian-aurora">Obsidian Aurora</option>
                  <option value="midnight-loom">Midnight Loom</option>
                  <option value="void-circuit">Void Circuit</option>
                  <option value="agartha-dream">Agartha Dream</option>
                  <option value="agartha-dusk">Agartha Dusk</option>
                </select>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <span style={{ color: themeTokens.app.textMuted } as React.CSSProperties}>Glitter</span>
                    <input
                      type="checkbox"
                      checked={settings.appearance.glitterEnabled}
                      onChange={(e) => setSetting("appearance.glitterEnabled", e.currentTarget.checked)}
                      style={{
                        borderRadius: "0.25rem",
                        border: `1px solid ${themeTokens.app.panelBorder}`,
                        backgroundColor: `${themeTokens.app.background}cc`,
                        accentColor: themeTokens.app.accent,
                        cursor: "pointer",
                      } as React.CSSProperties}
                    />
                  </label>

                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <span style={{ color: themeTokens.app.textMuted } as React.CSSProperties}>Reduce Motion</span>
                    <input
                      type="checkbox"
                      checked={settings.appearance.reduceMotion}
                      onChange={(e) => setSetting("appearance.reduceMotion", e.currentTarget.checked)}
                      style={{
                        borderRadius: "0.25rem",
                        border: `1px solid ${themeTokens.app.panelBorder}`,
                        backgroundColor: `${themeTokens.app.background}cc`,
                        accentColor: themeTokens.app.accent,
                        cursor: "pointer",
                      } as React.CSSProperties}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section
          className="grid min-h-0"
          style={{
            gridTemplateColumns: `var(--left-width) 1fr var(--right-width)`,
            "--left-width": settings.ui.leftPanelCollapsed ? "0px" : `${settings.ui.leftPanelWidth}px`,
            "--right-width": settings.ui.controlDockCollapsed
              ? `${settings.ui.controlDockCollapsedWidth}px`
              : `${settings.ui.controlDockWidth}px`,
          } as React.CSSProperties}
        >
          <LeftTabPanel
            collapsed={settings.ui.leftPanelCollapsed}
            panelWidth={settings.ui.leftPanelWidth}
            onWidthChange={(width) =>
              setSetting("ui", { ...settings.ui, leftPanelWidth: width })
            }
            activeTab={settings.ui.leftPanelActiveTab}
            onTabChange={(tab) =>
              setSetting("ui", { ...settings.ui, leftPanelActiveTab: tab as any })
            }
            onCollapse={() =>
              setSetting("ui", {
                ...settings.ui,
                leftPanelCollapsed: !settings.ui.leftPanelCollapsed,
              })
            }
            graphTabSections={settings.ui.graphTabSections}
            qaTabSections={settings.ui.qaTabSections}
            evidenceTabSections={settings.ui.evidenceTabSections}
            debugTabSections={settings.ui.debugTabSections}
            // v86a: settingsTabSections removed
            onSectionToggle={(tab, section) => {
              const sectionKey = `${tab}TabSections` as keyof typeof settings.ui;
              const sections = settings.ui[sectionKey] as any;
              setSetting("ui", {
                ...settings.ui,
                [sectionKey]: { ...sections, [section]: !sections[section] },
              });
            }}
            graphTabContent={
              <>
                <CollapsibleSection
                  title="Graph Sources"
                  isOpen={settings.ui.graphTabSections.graphSources}
                  onToggle={() => setSetting("ui", {
                    ...settings.ui,
                    graphTabSections: {
                      ...settings.ui.graphTabSections,
                      graphSources: !settings.ui.graphTabSections.graphSources,
                    }
                  })}
                  testId="section-graph-sources"
                  accentColor={themeTokens.app.accent}
                  borderColor={themeTokens.app.panelBorder}
                  tileableKey="graph-section"
                >
                  <div
                    className="rounded-xl p-4"
                    style={{
                      border: `1px solid ${themeTokens.app.panelBorder}`,
                      backgroundColor: `${themeTokens.app.background}70`,
                    } as React.CSSProperties}
                  >
                    <div style={{ color: themeTokens.app.textPrimary } as React.CSSProperties}>{panelSummary.label}</div>
                    <div className="mt-1 text-xs" style={{ color: themeTokens.app.textMuted } as React.CSSProperties}>
                      {panelSummary.sourcePath}
                    </div>
                    <div
                      className="mt-3 rounded-full px-3 py-1 text-xs"
                      style={{
                        backgroundColor: `${themeTokens.app.accent}10`,
                        color: themeTokens.app.accent,
                      } as React.CSSProperties}
                    >
                      {panelSummary.status}
                    </div>
                    <div className="mt-3 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span style={{ color: themeTokens.app.textMuted } as React.CSSProperties}>graph.json:</span>
                        <span
                          style={{
                            color: panelSummary.graphPresent ? themeTokens.app.accent : "#f87171",
                          } as React.CSSProperties}
                        >
                          {panelSummary.graphPresent ? "found" : "missing"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: themeTokens.app.textMuted } as React.CSSProperties}>manifest.json:</span>
                        <span
                          style={{
                            color: panelSummary.manifestPresent ? themeTokens.app.accent : themeTokens.app.textMuted,
                          } as React.CSSProperties}
                        >
                          {panelSummary.manifestPresent ? "found" : "missing"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: themeTokens.app.textMuted } as React.CSSProperties}>GRAPH_REPORT.md:</span>
                        <span
                          style={{
                            color: panelSummary.reportPresent ? themeTokens.app.accent : themeTokens.app.textMuted,
                          } as React.CSSProperties}
                        >
                          {panelSummary.reportPresent ? "found" : "missing"}
                        </span>
                      </div>
                      <div className="mt-2 flex justify-between" style={{ borderTop: `1px solid ${themeTokens.app.panelBorder}10`, paddingTop: "0.5rem" }}>
                        <span style={{ color: themeTokens.app.textMuted } as React.CSSProperties}>Raw nodes:</span>
                        <span style={{ color: themeTokens.app.accent } as React.CSSProperties}>{panelSummary.nodeCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: themeTokens.app.textMuted } as React.CSSProperties}>Raw edges:</span>
                        <span style={{ color: themeTokens.app.accent } as React.CSSProperties}>{panelSummary.edgeCount}</span>
                      </div>
                      <div className="mt-2 flex justify-between" style={{ borderTop: `1px solid ${themeTokens.app.panelBorder}10`, paddingTop: "0.5rem" }}>
                        <span style={{ color: themeTokens.app.textMuted } as React.CSSProperties}>Normalized nodes:</span>
                        <span style={{ color: "#86efac" } as React.CSSProperties}>
                          {panelSummary.normalizedNodeCount}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: themeTokens.app.textMuted } as React.CSSProperties}>Normalized edges:</span>
                        <span style={{ color: "#86efac" } as React.CSSProperties}>
                          {panelSummary.normalizedEdgeCount}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: themeTokens.app.textMuted } as React.CSSProperties}>Warnings:</span>
                        <span
                          style={{
                            color: panelSummary.warnings.length > 0 ? "#fbbf24" : themeTokens.app.textMuted,
                          } as React.CSSProperties}
                        >
                          {panelSummary.warnings.length}
                        </span>
                      </div>
                      <div className="mt-2 flex justify-between" style={{ borderTop: `1px solid ${themeTokens.app.panelBorder}10`, paddingTop: "0.5rem" }}>
                        <span style={{ color: themeTokens.app.textMuted } as React.CSSProperties}>Connected Components:</span>
                        <span style={{ color: "#93c5fd" } as React.CSSProperties}>
                          {panelSummary.componentCount ?? "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: themeTokens.app.textMuted } as React.CSSProperties}>Isolated Nodes:</span>
                        <span style={{ color: "#fca5a5" } as React.CSSProperties}>
                          {panelSummary.isolatedNodeCount ?? "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: themeTokens.app.textMuted } as React.CSSProperties}>Largest Component:</span>
                        <span style={{ color: "#86efac" } as React.CSSProperties}>
                          {panelSummary.largestComponentSize ?? "N/A"}
                        </span>
                      </div>
                    </div>
                    {panelSummary.warnings.length > 0 && (
                      <div
                        className="mt-3 rounded p-2"
                        style={{
                          border: `1px solid #fbbf2430`,
                          backgroundColor: "#78350f10",
                        } as React.CSSProperties}
                      >
                        {panelSummary.warnings.slice(0, 3).map((warning, index) => (
                          <div key={index} className="text-xs" style={{ color: "#fbbf24" } as React.CSSProperties}>
                            {warning}
                          </div>
                        ))}
                        {panelSummary.warnings.length > 3 && (
                          <div className="text-xs" style={{ color: "#fbbf24" } as React.CSSProperties}>
                            ... and {panelSummary.warnings.length - 3} more
                          </div>
                        )}
                      </div>
                    )}
                    {summaryError && (
                      <div
                        className="mt-3 rounded px-3 py-2 text-xs"
                        style={{
                          backgroundColor: "#7f1d1d30",
                          color: "#fca5a5",
                        } as React.CSSProperties}
                      >
                        {summaryError}
                      </div>
                    )}
                  </div>
                </CollapsibleSection>
                <CollapsibleSection
                  title="Source Adapter"
                  isOpen={settings.ui.graphTabSections.sourceAdapter}
                  onToggle={() => setSetting("ui", {
                    ...settings.ui,
                    graphTabSections: {
                      ...settings.ui.graphTabSections,
                      sourceAdapter: !settings.ui.graphTabSections.sourceAdapter,
                    }
                  })}
                  testId="section-source-adapter"
                  accentColor={themeTokens.app.accent}
                  borderColor={themeTokens.app.panelBorder}
                >
                  <div
                    className="rounded-xl p-4"
                    data-testid="source-adapter-panel-shell"
                    style={{
                      border: `1px solid ${themeTokens.app.panelBorder}`,
                      backgroundColor: `${themeTokens.app.background}70`,
                    }}
                  >
                    <h3 className="mb-2 text-sm font-semibold" style={{ color: themeTokens.app.textPrimary } as React.CSSProperties}>
                      Source Adapter Registry
                    </h3>
                    <div className="min-h-0">
                      <SourceAdapterPanel />
                    </div>
                  </div>
                </CollapsibleSection>
              </>
            }
            qaTabContent={
              <CollapsibleSection
                title="QA"
                isOpen={settings.ui.qaTabSections.qaPanel}
                onToggle={() => setSetting("ui", {
                  ...settings.ui,
                  qaTabSections: {
                    ...settings.ui.qaTabSections,
                    qaPanel: !settings.ui.qaTabSections.qaPanel,
                  }
                })}
                testId="section-qa-panel"
                accentColor={themeTokens.app.accent}
                borderColor={themeTokens.app.panelBorder}
                tileableKey="qa-section"
              >
                <div
                  className="rounded-xl p-4"
                  data-testid="qa-panel"
                  style={{
                    border: `1px solid ${themeTokens.app.panelBorder}`,
                    backgroundColor: `${themeTokens.app.background}70`,
                  } as React.CSSProperties}
                >
                  <h3 className="mb-2 text-sm font-semibold" style={{ color: themeTokens.app.textPrimary } as React.CSSProperties}>
                    QA
                  </h3>
                  <div className="min-h-0">
                    <QaPanel
                      themeAccent={themeTokens.app.accent}
                      themeTextMuted={themeTokens.app.textMuted}
                      themePanelBorder={themeTokens.app.panelBorder}
                      themeInspectorEnabled={themeInspectorEnabled}
                      onThemeInspectorToggle={() => setThemeInspectorEnabled((prev) => !prev)}
                    />
                  </div>
                </div>
              </CollapsibleSection>
            }
            evidenceTabContent={
              <>
                <CollapsibleSection
                  title="Graph Visual Inventory"
                  isOpen={settings.ui.evidenceTabSections.graphVisualInventory}
                  onToggle={() => setSetting("ui", {
                    ...settings.ui,
                    evidenceTabSections: {
                      ...settings.ui.evidenceTabSections,
                      graphVisualInventory: !settings.ui.evidenceTabSections.graphVisualInventory,
                    }
                  })}
                  testId="section-graph-visual-inventory"
                  accentColor={themeTokens.app.accent}
                  borderColor={themeTokens.app.panelBorder}
                  tileableKey="evidence-section"
                >
                  <div
                    className="rounded-xl p-4"
                    data-testid="graph-visual-inventory-panel"
                    style={{
                      border: `1px solid ${themeTokens.app.panelBorder}`,
                      backgroundColor: `${themeTokens.app.background}70`,
                    }}
                  >
                    <h3 className="mb-2 text-sm font-semibold" style={{ color: themeTokens.app.textPrimary } as React.CSSProperties}>
                      Graph Visual Inventory
                    </h3>
                    <div className="min-h-0">
                      <GraphVisualInventoryPanel />
                    </div>
                  </div>
                </CollapsibleSection>
                <CollapsibleSection
                  title="System Index"
                  isOpen={settings.ui.evidenceTabSections.systemIndex}
                  onToggle={() => setSetting("ui", {
                    ...settings.ui,
                    evidenceTabSections: {
                      ...settings.ui.evidenceTabSections,
                      systemIndex: !settings.ui.evidenceTabSections.systemIndex,
                    }
                  })}
                  testId="section-system-index"
                  accentColor={themeTokens.app.accent}
                  borderColor={themeTokens.app.panelBorder}
                  tileableKey="evidence-section"
                >
                  <div
                    className="rounded-xl p-4"
                    data-testid="system-index-panel-shell"
                    style={{
                      border: `1px solid ${themeTokens.app.panelBorder}`,
                      backgroundColor: `${themeTokens.app.background}70`,
                    }}
                  >
                    <h3 className="mb-2 text-sm font-semibold" style={{ color: themeTokens.app.textPrimary } as React.CSSProperties}>
                      System Index
                    </h3>
                    <div className="min-h-0">
                      <SystemIndexPanel />
                    </div>
                  </div>
                </CollapsibleSection>
              </>
            }
            debugTabContent={
              <CollapsibleSection
                title="Command Deck"
                isOpen={settings.ui.debugTabSections.commandDeck}
                onToggle={() => setSetting("ui", {
                  ...settings.ui,
                  debugTabSections: {
                    ...settings.ui.debugTabSections,
                    commandDeck: !settings.ui.debugTabSections.commandDeck,
                  }
                })}
                testId="section-command-deck"
                accentColor={themeTokens.app.accent}
                borderColor={themeTokens.app.panelBorder}
                tileableKey="debug-section"
              >
                <div
                  className="rounded-xl p-4"
                  data-testid="command-deck-panel"
                  style={{
                    border: `1px solid ${themeTokens.app.panelBorder}`,
                    backgroundColor: `${themeTokens.app.background}70`,
                  }}
                >
                  <h3 className="mb-2 text-sm font-semibold" style={{ color: themeTokens.app.textPrimary } as React.CSSProperties}>
                    Command Deck
                  </h3>
                  <div className="min-h-0">
                    <CommandDeckPanel
                      themeAccent={themeTokens.app.accent}
                      themeTextMuted={themeTokens.app.textMuted}
                      themePanelBorder={themeTokens.app.panelBorder}
                    />
                  </div>
                </div>
              </CollapsibleSection>
            }
            // v86a: settingsTabContent removed
          />

          <section
            className="relative min-h-0 overflow-hidden"
            data-testid={useFixture ? "self-graph-fixture-loaded" : "graph-viewport"}
            style={{
              background: "radial-gradient(ellipse at center, #0d1929 0%, #060b14 60%, #030508 100%)",
            } as React.CSSProperties}
            data-lw-theme-target="graph.frame"
            onClick={handleViewportClick}
          >
            <div 
              className="absolute inset-0"
              style={{ backgroundColor: `${themeTokens.app.background}b3` } as React.CSSProperties}
            />

            <div className="relative h-full">
              {graphNodes &&
              graphEdges &&
              graphNodes.length > 0 ? (
                <>
                  {/* v86b close-1: Solar backdrop — renders before Sigma so Sigma paints on top */}
                  <SolarBackdrop
                    backdropMotion={settings.appearance.backdropMotion ?? "half"}
                    reduceMotion={settings.appearance.reduceMotion}
                    starfieldEnabled={settings.appearance.starfieldEnabled ?? true}
                    coronaColor={themeTokens.backdrop?.coronaColor}
                    coronaIntensity={themeTokens.backdrop?.coronaIntensity}
                    flareColor={themeTokens.backdrop?.flareColor}
                    starfieldDensity={themeTokens.backdrop?.starfieldDensity}
                    vignetteIntensity={themeTokens.backdrop?.vignetteIntensity}
                  />

                  {/* v86c: Stable key prop prevents remount on settings changes */}
                  <SigmaGraphView
                    key={graphSummary.source}
                    nodes={graphNodes}
                    edges={graphEdges}
                    nodeSize={settings.graphView.nodeSize}
                    dialectId={settings.physics.dialectId}
                    seedParamOverrides={activeSeedParamOverrides}
                    activePins={activePins}
                    onUpdatePins={(dialectId: string, pinMap: Record<string, { x: number; y: number; z?: number }>) => {
                      const currentAll = useSettingsStore.getState().settings.physics.pins ?? {};
                      const newAll = { ...currentAll, [dialectId]: pinMap };
                      setSetting("physics.pins", newAll);
                    }}
                    pinnedHighlightActive={pinnedHighlightActive}
                    selectedNodeId={selectedNodeId}
                    selectedEdgeId={selectedEdgeId}
                    pathTargetId={pathTargetId}
                    neighborhoodDepth={neighborhoodDepth}
                    nodeLabelMode={settings.labels.nodeLabelMode}
                    edgeLabelMode={settings.labels.edgeLabelMode}
                    maxEdgeLabelLength={settings.labels.maxEdgeLabelLength}
                    showLabelsOnHover={settings.labels.showLabelsOnHover}
                    zoomLabelThreshold={settings.labels.zoomLabelThreshold}
                    edgeLabelFontSize={settings.labels.edgeLabelFontSize}
                    nodeLabelFontSize={settings.labels.nodeLabelFontSize}
                    hoverNodeColor={settings.graphView.hoverNodeColor}
                    resolvedTokens={resolvedGraphTokens}
                    nodeHum={settings.appearance.nodeHum}
                    nodeFlowSpeed={settings.appearance.nodeFlowSpeed}
                    nodeGlow={settings.appearance.nodeGlow}
                    reduceMotion={settings.appearance.reduceMotion}
                    onSelectNode={(nodeId) => {
                      setSelectedNodeId(nodeId);
                      setSelectedEdgeId(null);
                      setInspectorExpanded(true);
                    }}
                    onSetPathTarget={(nodeId) => {
                      setPathTargetId(nodeId);
                    }}
                    onSelectEdge={(edgeId) => {
                      setSelectedEdgeId(edgeId);
                      setSelectedNodeId(null);
                      setInspectorExpanded(true);
                    }}
                    onClearSelection={() => {
                      setSelectedNodeId(null);
                      setSelectedEdgeId(null);
                      setPathTargetId(null);
                    }}
                  />

                      {/* v86b: Plasma overlay for animated edge flow */}
                      {(window as any).__lwSigma ? (
                        <PlasmaOverlayEdge
                          sigma={(window as any).__lwSigma}
                          edges={graphEdges.map(e => ({ id: e.id, source: e.source, target: e.target }))}
                          motionScale={settings.appearance.reduceMotion ? 0 : settings.appearance.motionScale ?? 0.6}
                          flowSpeed={settings.appearance.nodeFlowSpeed ?? 0.55}
                          edgePlasmaMode={settings.appearance.edgePlasmaMode ?? "animated-overlay"}
                        />
                      ) : null}

                      {/* Floating Graph Inspector Panel */}
                      <div className="absolute left-4 top-4 w-80">
                        <CollapsiblePanel
                          title="Graph Inspector"
                          collapsedLabel="Graph Inspector"
                          expanded={inspectorExpanded}
                          onExpandedChange={setInspectorExpanded}
                          className="shadow-2xl shadow-cyan-950/40"
                        >
                          <InspectorPanel
                            selectedNode={selectedNode}
                            selectedEdge={selectedEdge}
                            selectedEdgeSource={selectedEdgeSource}
                            selectedEdgeTarget={selectedEdgeTarget}
                            secondaryEdgeCount={secondaryEdgeCount}
                            secondaryNodeCount={secondaryNodeCount}
                            graphSummary={graphSummary}
                          />
                        </CollapsiblePanel>
                      </div>

                      {/* v86b close-1: Click halo */}
                      {clickHalo && (
                        <ClickHalo
                          key={clickHalo.key}
                          x={clickHalo.x}
                          y={clickHalo.y}
                          color={clickHalo.color}
                          reduceMotion={settings.appearance.reduceMotion}
                          onComplete={() => setClickHalo(null)}
                        />
                      )}

                      {/* v86b close-1: Glitter field on selected node */}
                      {selectedNodeId && (window as any).__lwSigma && (() => {
                        const sigma = (window as any).__lwSigma;
                        try {
                          const display = sigma.getNodeDisplayData(selectedNodeId);
                          if (!display) return null;
                          const viewport = sigma.graphToViewport(display);
                          return (
                            <GlitterField
                              x={viewport.x}
                              y={viewport.y}
                              color={resolvedGraphTokens?.selectionHaloColor ?? "#fbbf24"}
                              glitterDensity={settings.appearance.glitterDensity ?? "medium"}
                              reduceMotion={settings.appearance.reduceMotion}
                            />
                          );
                        } catch {
                          return null;
                        }
                      })()}

                      {/* v86b close-1: Floating bookmarks */}
                      <BookmarkLayer
                        alertColor={themeTokens.bookmark?.alertColor}
                        pinnedColor={themeTokens.bookmark?.pinnedColor}
                        refColor={themeTokens.bookmark?.refColor}
                        onTogglePinnedHighlight={() => {
                          setPinnedHighlightActive(!pinnedHighlightActive);
                        }}
                      />

                      {/* v86b close-1: Minimap */}
                      {(window as any).__lwSigma && (() => {
                        const sigma = (window as any).__lwSigma;
                        try {
                          let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                          sigma.getGraph().forEachNode((id: string) => {
                            const d = sigma.getNodeDisplayData(id);
                            if (!d) return;
                            if (d.x < minX) minX = d.x;
                            if (d.y < minY) minY = d.y;
                            if (d.x > maxX) maxX = d.x;
                            if (d.y > maxY) maxY = d.y;
                          });
                          if (!isFinite(minX)) return null;
                          const cam = sigma.getCamera().getState();
                          return (
                            <Minimap
                              graphBounds={{ minX, minY, maxX, maxY }}
                              viewportBounds={{ x: cam.x, y: cam.y, ratio: cam.ratio }}
                            />
                          );
                        } catch {
                          return null;
                        }
                      })()}
                    </>
                  ) : (
                <div className="flex h-full items-center justify-center">
                  <div 
                    className="rounded-3xl p-8 text-center"
                    style={{
                      border: `1px solid ${themeTokens.app.panelBorder}`,
                      backgroundColor: `${themeTokens.app.background}70`,
                      boxShadow: `0 25px 50px -12px ${themeTokens.app.glow}40`,
                    } as React.CSSProperties}
                  >
                    <div 
                      className="mx-auto mb-5 h-20 w-20 rounded-full"
                      style={{
                        backgroundColor: `${themeTokens.app.accent}20`,
                        boxShadow: `0 0 60px ${themeTokens.app.accent}45`,
                      } as React.CSSProperties}
                    />
                    <h2 
                      className="text-xl font-semibold"
                      style={{ color: themeTokens.app.textPrimary } as React.CSSProperties}
                    >
                      Graph Canvas Placeholder
                    </h2>
                    <p 
                      className="mt-2 max-w-md text-sm"
                      style={{ color: themeTokens.app.textMuted } as React.CSSProperties}
                    >
                      {summary.status === "loading"
                        ? "Loading graph data..."
                        : summary.status === "error"
                          ? "Failed to load graph data"
                          : "No graph data available"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          <ControlDock
            collapsed={settings.ui.controlDockCollapsed}
            width={settings.ui.controlDockWidth}
            collapsedWidth={settings.ui.controlDockCollapsedWidth}
            sections={settings.ui.controlDockSections}
            onCollapse={() =>
              setSetting("ui", {
                ...settings.ui,
                controlDockCollapsed: !settings.ui.controlDockCollapsed,
              })
            }
            onSectionToggle={(section) => {
              setSetting("ui", {
                ...settings.ui,
                controlDockSections: {
                  ...settings.ui.controlDockSections,
                  [section]: !settings.ui.controlDockSections[section as keyof typeof settings.ui.controlDockSections],
                },
              });
            }}
            onWidthChange={(width) =>
              setSetting("ui", { ...settings.ui, controlDockWidth: width })
            }
            settings={settings}
            setSetting={setSetting}
          />
        </section>

        {/* Tiles rendered outside grid, position fixed */}
        {/* v86a: tile system is v86c - commented out for now */}
        {/* {settings.ui.tiledTabs.map((tabId) => (
          <Tile
            key={tabId}
            tabId={tabId}
            title={tabId.charAt(0).toUpperCase() + tabId.slice(1)}
            initialWidth={280}
            initialHeight={500}
            onClose={() =>
              setSetting("ui", {
                ...settings.ui,
                tiledTabs: settings.ui.tiledTabs.filter((t) => t !== tabId),
                leftPanelActiveTab: tabId as any,
              })
            }
          >
            {tabId === "graph" && (
              <>
                <h2
                  className="mb-3 text-sm font-semibold uppercase tracking-wider"
                  style={{ color: themeTokens.app.textMuted } as React.CSSProperties}
                >
                  Graph Sources
                </h2>
                <div
                  className="rounded-xl p-4"
                  style={{
                    border: `1px solid ${themeTokens.app.panelBorder}`,
                    backgroundColor: `${themeTokens.app.background}70`,
                  } as React.CSSProperties}
                >
                  <div style={{ color: themeTokens.app.textPrimary } as React.CSSProperties}>{summary.label}</div>
                  <div className="mt-1 text-xs" style={{ color: themeTokens.app.textMuted } as React.CSSProperties}>
                    {summary.sourcePath}
                  </div>
                </div>
              </>
            )}
            {tabId === "qa" && (
              <QaPanel
                themeAccent={themeTokens.app.accent}
                themeTextMuted={themeTokens.app.textMuted}
                themePanelBorder={themeTokens.app.panelBorder}
                themeInspectorEnabled={themeInspectorEnabled}
                onThemeInspectorToggle={() => setThemeInspectorEnabled((prev) => !prev)}
              />
            )}
            {tabId === "evidence" && (
              <>
                <GraphVisualInventoryPanel />
                <div className="mt-4">
                  <SystemIndexPanel />
                </div>
              </>
            )}
            {tabId === "debug" && (
              <CommandDeckPanel
                themeAccent={themeTokens.app.accent}
                themeTextMuted={themeTokens.app.textMuted}
                themePanelBorder={themeTokens.app.panelBorder}
              />
            )}
            {tabId === "settings" && <SettingsPanel />}
          </Tile>
        ))} */}

        <footer 
          className="px-6 py-3 text-xs"
          style={{
            borderTop: `1px solid ${themeTokens.app.panelBorder}`,
            backgroundColor: `${themeTokens.app.background}e6`,
            color: themeTokens.app.textMuted,
          } as React.CSSProperties}
        >
          Status: control plane online · theme {settings.appearance.theme} ·
          glitter {settings.appearance.glitterEnabled ? "on" : "off"} ·
          renderer {settings.graphView.defaultRenderer}
        </footer>
      </div>
      <ThemeTargetInspectorOverlay
        enabled={themeInspectorEnabled}
        onEnabledChange={setThemeInspectorEnabled}
      />
      <TileLayer />
    </main>
  </TileProvider>
);
}
