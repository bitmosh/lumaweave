import { useState, useEffect, useMemo, useRef } from "react";
import { TileProvider } from "../control-plane/panels/TileProvider";
import { TileLayer } from "../control-plane/panels/TileLayer";
import { useSettingsStore, settingsStore } from "../control-plane/settings/settings.store";
import { useGraphSourceSummary } from "../graph/ingest/useGraphSourceSummary";
import { SigmaGraphView } from "../graph/renderers/sigma2d/SigmaGraphView";
import {
  buildGraphologyGraph,
} from "../graph/renderers/sigma2d/buildGraphologyGraph";
import { getThemeRuntimeTokens, resolveGraphVisualTokens } from "../themes";
import { themePrimitives } from "../themes/tokenPrimitives";
import { themeTargetRegistry } from "../themes/themeTargetRegistry";
import { useResolvedTargetColor } from "../themes/useResolvedTargetColor";
import "../themes/provenanceRegistry";
import "../themes/clusterColor"; // registers __lwClusterColor dev probe
import { ThemeTargetInspectorOverlay } from "../themes/ThemeTargetInspectorOverlay";
import { InspectorMiniGraph } from "../control-plane/inspector/InspectorMiniGraph";
import { registerColorSpoke } from "../control-plane/inspector/spokes/registerColorSpoke";
import { registerGeometrySpoke } from "../control-plane/inspector/spokes/registerGeometrySpoke";
import { registerTypeSpoke } from "../control-plane/inspector/spokes/registerTypeSpoke";
import { registerMotionSpoke } from "../control-plane/inspector/spokes/registerMotionSpoke";
import { registerLayoutSpoke } from "../control-plane/inspector/spokes/registerLayoutSpoke";
import { registerCodeSpoke } from "../control-plane/inspector/spokes/registerCodeSpoke";
import { registerApplySpoke } from "../control-plane/inspector/spokes/registerApplySpoke";
import { registerHistorySpoke } from "../control-plane/inspector/spokes/registerHistorySpoke";
import { installOpenInIdeListener } from "../control-plane/ide/installOpenInIdeListener";
import "../control-plane/hotkeys/hotkey-registry.entries";
import "../control-plane/commands/command-registry.entries";
import { installGlobalHotkeyListener } from "../control-plane/hotkeys/installGlobalHotkeyListener";
import { adaptSelfGraphToSigma } from "../fixtures/self-graph-adapter";
import generatedGraph from "../fixtures/self-graph-generated.json";
import type { LumaSourceGraph } from "../fixtures/types";
import { SolarBackdrop } from "../graph/overlay/SolarBackdrop";
import { ClickHalo } from "../graph/overlay/ClickHalo";
import { GlitterField } from "../graph/overlay/GlitterField";
import { BookmarkLayer } from "../graph/overlay/BookmarkLayer";
import { Minimap } from "../graph/overlay/Minimap";
import { bookmarkRegistry, initializeDemoBookmarks } from "../graph/overlay/bookmarkRegistry";
import { I18nProvider } from "../i18n";
import { Topbar } from "../control-plane/topbar/Topbar";
import { SettingsPanelHost } from "../control-plane/settings/SettingsPanelHost";
import type { SettingsPanelHostHandle } from "../control-plane/settings/SettingsPanelHost";
import { CommandPaletteHost } from "../control-plane/commands/CommandPaletteHost";
import "../control-plane/commands/palette.css";
import { StatusBar } from "../control-plane/StatusBar";
import { useCrossfadeAppTokens } from "../themes/themeCrossfade";
import { useThemeInspectorStore } from "../themes/themeInspectorStore";

const EMPTY_OVERRIDES: Record<string, unknown> = {};
const EMPTY_PINS: Record<string, { x: number; y: number; z?: number }> = {};

export function AppShell() {
  const settingsPanelRef = useRef<SettingsPanelHostHandle>(null);
  const settings = useSettingsStore((state) => state.settings);
  const setSetting = useSettingsStore((state) => state.setSetting);
  const { summary, error: summaryError } = useGraphSourceSummary();

  // Register spokes and expose app state for Playwright tests (dev mode only)
  useEffect(() => {
    // Register inspector spokes — canonical order (v86d.3a+, v89.4)
    registerColorSpoke();    // order 0
    registerGeometrySpoke(); // order 1
    registerTypeSpoke();     // order 2
    registerMotionSpoke();   // order 3
    registerLayoutSpoke();   // order 4
    registerCodeSpoke();     // order 5 (real feature — was IDE spoke, now Code spoke)
    registerApplySpoke();    // order 6
    registerHistorySpoke();  // order 7
    installOpenInIdeListener();
    installGlobalHotkeyListener();

    // Expose app state for Playwright tests (dev mode only)
    if (import.meta.env.DEV || (window as any).PLAYWRIGHT) {
      (window as any).__lwStore = settingsStore;
      (window as any).__lwTokenPrimitives = themePrimitives;
      (window as any).__lwThemeTargetRegistry = themeTargetRegistry;
    }
  }, []);

  // Expose graph source summary for E2E tests (dev/test only)
  useEffect(() => {
    if (import.meta.env.DEV || (window as any).PLAYWRIGHT) {
      (window as any).__lwGraphSummary = summary;
    }
  }, [summary]);

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

  // v86b: Quality preset values for appearance sync
  const QUALITY_PRESET_VALUES = {
    potato: {
      reduceMotion: true,
      animationDensity: "off" as const,
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
      animationDensity: "low" as const,
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
      animationDensity: "medium" as const,
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
      animationDensity: "high" as const,
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
      current.animationDensity !== vals.animationDensity ||
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
    settings.appearance.animationDensity,
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

  // v87.4: Crossfade app token colors on theme switch (300ms, snaps when reduceMotion)
  const crossfadeTokens = useCrossfadeAppTokens(themeTokens, settings.appearance.reduceMotion);

  // Resolve topbar color bindings with overrides (v86d.3b)
  const topbarBorder = useResolvedTargetColor(
    "topbar.root",
    "panel.border" as any,
    themeTokens.app.panelBorder
  );
  const topbarText = useResolvedTargetColor(
    "topbar.root",
    "text.primary" as any,
    themeTokens.app.textPrimary
  );
  const topbarAccent = useResolvedTargetColor(
    "topbar.root",
    "accent.primary" as any,
    themeTokens.app.accent
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
  const activeSeedParamOverrides = useMemo(
    () => (settings.physics.seedParamOverrides?.[settings.physics.dialectId] ?? EMPTY_OVERRIDES) as Record<string, unknown>,
    [settings.physics.seedParamOverrides, settings.physics.dialectId],
  );

  // Pass C9.1: Derive active dialect's pin map
  const activePins = useMemo(
    () => (settings.physics.pins?.[settings.physics.dialectId] ?? EMPTY_PINS) as Record<string, { x: number; y: number; z?: number }>,
    [settings.physics.pins, settings.physics.dialectId],
  );

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
  const themeInspectorEnabled = useThemeInspectorStore((s) => s.enabled);
  const setThemeInspectorEnabled = useThemeInspectorStore((s) => s.setEnabled);

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

  // Determine which graph data to use — memoized to preserve reference equality
  // across re-renders caused by unrelated state changes (e.g. override-change events).
  const graphNodes = useMemo(
    () => (useFixture ? adaptedFixture.nodes : summary.normalizedNodes),
    [useFixture, adaptedFixture.nodes, summary.normalizedNodes],
  );
  const graphEdges = useMemo(
    () => (useFixture ? adaptedFixture.edges : summary.normalizedEdges),
    [useFixture, adaptedFixture.edges, summary.normalizedEdges],
  );

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
    <I18nProvider>
    <TileProvider>
      <main 
      className="h-screen overflow-hidden text-slate-100"
      style={{
        "--lw-app-background": crossfadeTokens.app.background,
        "--lw-panel-background": crossfadeTokens.app.panelBackground,
        "--lw-panel-border": topbarBorder,
        "--lw-text-primary": topbarText,
        "--lw-text-muted": crossfadeTokens.app.textMuted,
        "--lw-accent": topbarAccent,
        "--lw-visual-accent": topbarAccent,
        "--lw-app-glow": crossfadeTokens.app.glow,
        // Tier 1 primitive color tokens for theme-adaptive components (HexLogo, etc.)
        "--lw-color-flare-500": themePrimitives[settings.appearance.theme]?.color?.flare?.[500] ?? "#FF6B1A",
        "--lw-color-magenta-500": themePrimitives[settings.appearance.theme]?.color?.magenta?.[500] ?? "#FF1F8F",
        "--lw-color-purple-500": themePrimitives[settings.appearance.theme]?.color?.purple?.[500] ?? "#7B2FFF",
        "--lw-color-gold-500": themePrimitives[settings.appearance.theme]?.color?.gold?.[500] ?? "#FFB347",
        "--lw-inspector-radial-spoke-color": crossfadeTokens.inspector.radialSpokeColor,
        "--lw-inspector-radial-root-color": crossfadeTokens.inspector.radialSpokeColor,
        "--lw-inspector-radial-root-border": crossfadeTokens.inspector.radialHaloColor,
        "--lw-inspector-radial-text": crossfadeTokens.app.textPrimary,
        backgroundColor: crossfadeTokens.app.background,
      } as React.CSSProperties}
      data-lw-theme-target="app.shell"
    >
      <div className="grid h-screen grid-rows-[auto_1fr_auto]">
        <Topbar onOpenSettings={() => settingsPanelRef.current?.toggle()} />


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
                    }}
                    onSetPathTarget={(nodeId) => {
                      setPathTargetId(nodeId);
                    }}
                    onSelectEdge={(edgeId) => {
                      setSelectedEdgeId(edgeId);
                      setSelectedNodeId(null);
                    }}
                    onClearSelection={() => {
                      setSelectedNodeId(null);
                      setSelectedEdgeId(null);
                      setPathTargetId(null);
                    }}
                  />

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
                              glitterDensity={settings.appearance.animationDensity ?? "medium"}
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

                      {/* v104.0.0: Minimap — settings-driven, self-managing */}
                      <Minimap />
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

        <StatusBar />
      </div>
      <ThemeTargetInspectorOverlay
        enabled={themeInspectorEnabled}
        onEnabledChange={setThemeInspectorEnabled}
      />
      <InspectorMiniGraph />
      <TileLayer />
      <SettingsPanelHost ref={settingsPanelRef} />
      <CommandPaletteHost />
    </main>
  </TileProvider>
  </I18nProvider>
);
}
