import { useState, useEffect, useMemo } from "react";
import { SettingsPanel } from "../control-plane/settings/SettingsPanel";
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
import { Tile } from "../control-plane/panels/Tile";
import { useSettingsStore } from "../control-plane/settings/settings.store";
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

export function AppShell() {
  const settings = useSettingsStore((state) => state.settings);
  const setSetting = useSettingsStore((state) => state.setSetting);
  const { summary, error: summaryError } = useGraphSourceSummary();

  // Self-graph fixture for demo (v75a)
  // TODO: Smart switching deferred.
  // Requires updating layout dimension assertions
  // in theme-target-inspector.spec.ts lines 211-212
  // which are hardcoded to fixture viewport geometry.
  // Fix: derive expected dimensions from actual
  // viewport instead of hardcoded pixel values.
  const [useFixture] = useState(true);
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
  } : summary;

  // Get theme tokens for current theme
  const themeTokens = getThemeRuntimeTokens(settings.appearance.theme);

  // Resolve graph visual tokens from theme tokens with settings overrides
  const resolvedGraphTokens = resolveGraphVisualTokens(themeTokens.graph, {
    hoverNodeColor: settings.graphView.hoverNodeColor,
  });

  const neighborhoodDepth = Math.floor(
    settings.graphView.neighborhoodDepth ?? 2
  ) as 1 | 2 | 3 | 4;

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [pathTargetId, setPathTargetId] = useState<string | null>(null);
  const [inspectorExpanded, setInspectorExpanded] = useState(false);
  const [themeInspectorEnabled, setThemeInspectorEnabled] = useState(false);

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
        nodeSize: settings.physics.nodeSize,
        linkDistance: settings.physics.linkDistance,
        repelForce: settings.physics.repelForce,
        centerForce: settings.physics.centerForce,
        physicsDialect: "default",
      },
    );
    const neighborhood = getRelationshipNeighborhood(graph, selectedEdgeId);
    secondaryEdgeCount = neighborhood.secondaryEdgeIds.length;
    secondaryNodeCount = neighborhood.secondaryNodeIds.length;
  }

  const graphSummary = useFixture
    ? {
        source: "Self-Graph (LumaWeave docs)",
        rawNodeCount: generatedGraph.metadata.nodeCount,
        rawEdgeCount: generatedGraph.metadata.edgeCount,
        normalizedNodeCount: adaptedFixture.nodes.length,
        normalizedEdgeCount: adaptedFixture.edges.length,
        renderer: "sigma2d",
        layout: "sunflower",
        status: "loaded",
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
            settingsTabSections={settings.ui.settingsTabSections}
            onSectionToggle={(tab, section) => {
              const sectionKey = `${tab}TabSections` as keyof typeof settings.ui;
              const sections = settings.ui[sectionKey] as any;
              setSetting("ui", {
                ...settings.ui,
                [sectionKey]: { ...sections, [section]: !sections[section] },
              });
            }}
            tiledTabs={settings.ui.tiledTabs}
            onTileOut={(tabId) =>
              setSetting("ui", {
                ...settings.ui,
                tiledTabs: [...settings.ui.tiledTabs, tabId],
                leftPanelActiveTab: tabId as any,
              })
            }
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
            settingsTabContent={
              <div
                className="rounded-xl p-4"
                style={{
                  border: `1px solid ${themeTokens.app.panelBorder}`,
                  backgroundColor: `${themeTokens.app.background}70`,
                }}
              >
                <h3 className="mb-2 text-sm font-semibold" style={{ color: themeTokens.app.textPrimary } as React.CSSProperties}>
                  Settings
                </h3>
                <div className="min-h-0">
                  <div style={{ color: themeTokens.app.textMuted, textAlign: "center", padding: "2rem" } as React.CSSProperties}>
                    Settings moved to Control Dock (right panel)
                  </div>
                </div>
              </div>
            }
          />

          <section
            className="relative min-h-0 overflow-hidden"
            data-testid={useFixture ? "self-graph-fixture-loaded" : "graph-viewport"}
            style={{
              background: "radial-gradient(ellipse at center, #0d1929 0%, #060b14 60%, #030508 100%)",
            } as React.CSSProperties}
            data-lw-theme-target="graph.frame"
          >
            <div 
              className="absolute inset-0"
              style={{ backgroundColor: `${themeTokens.app.background}b3` } as React.CSSProperties}
            />

            <div className="relative h-full">
              {graphNodes &&
              graphEdges &&
              graphNodes.length > 0 ? (
                (() => {
                  console.log("AppShell Sigma props", {
                    normalizedNodes: graphNodes.length,
                    normalizedEdges: graphEdges.length,
                    nodeSize: settings.physics.nodeSize,
                    linkDistance: settings.physics.linkDistance,
                    repelForce: settings.physics.repelForce,
                    selectedNodeId,
                    selectedEdgeId,
                  });

                  return (
                    <>
                      <SigmaGraphView
                        nodes={graphNodes}
                        edges={graphEdges}
                        nodeSize={settings.physics.nodeSize}
                        linkDistance={settings.physics.linkDistance}
                        repelForce={settings.physics.repelForce}
                        centerForce={settings.physics.centerForce}
                        physicsPreset={settings.physics.physicsPreset}
                        physicsDialect={settings.physics.physicsDialect}
                        strongGravityMode={settings.physics.strongGravityMode}
                        linLogMode={settings.physics.linLogMode}
                        adjustSizes={settings.physics.adjustSizes}
                        barnesHutTheta={settings.physics.barnesHutTheta}
                        communityGravity={settings.physics.communityGravity}
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
                    </>
                  );
                })()
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
        {settings.ui.tiledTabs.map((tabId) => (
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
        ))}

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
    </main>
  );
}
