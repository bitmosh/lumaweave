import { useState } from "react";
import { SettingsPanel } from "../control-plane/settings/SettingsPanel";
import { QaPanel } from "../control-plane/qa/QaPanel";
import { InspectorPanel } from "../control-plane/panels/InspectorPanel";
import { CollapsiblePanel } from "../control-plane/panels/CollapsiblePanel";
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

export function AppShell() {
  const settings = useSettingsStore((state) => state.settings);
  const setSetting = useSettingsStore((state) => state.setSetting);
  const { summary, error: summaryError } = useGraphSourceSummary();

  // Get theme tokens for current theme
  const themeTokens = getThemeRuntimeTokens(settings.appearance.theme);

  // Resolve graph visual tokens from theme tokens with settings overrides
  const resolvedGraphTokens = resolveGraphVisualTokens(themeTokens.graph, {
    hoverNodeColor: settings.graphView.hoverNodeColor,
  });

  // Normalize nodeSelectionStage from string to number
  const nodeSelectionStage = Number(settings.graphView.nodeSelectionStage) as 1 | 2 | 3;

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [inspectorExpanded, setInspectorExpanded] = useState(false);
  const [themeInspectorEnabled, setThemeInspectorEnabled] = useState(false);

  const selectedNode = selectedNodeId
    ? summary.normalizedNodes?.find((node) => node.id === selectedNodeId) || null
    : null;

  const selectedEdge = selectedEdgeId
    ? summary.normalizedEdges?.find((edge) => edge.id === selectedEdgeId) || null
    : null;

  const selectedEdgeSource = selectedEdge
    ? summary.normalizedNodes?.find((node) => node.id === selectedEdge.source) || null
    : null;

  const selectedEdgeTarget = selectedEdge
    ? summary.normalizedNodes?.find((node) => node.id === selectedEdge.target) || null
    : null;

  // Compute neighborhood for selected edge
  let secondaryEdgeCount = 0;
  let secondaryNodeCount = 0;

  if (selectedEdgeId && summary.normalizedNodes && summary.normalizedEdges) {
    const { graph } = buildGraphologyGraph(
      summary.normalizedNodes,
      summary.normalizedEdges,
      { nodeSize: 1, linkDistance: 1, repelForce: 1 },
    );
    const neighborhood = getRelationshipNeighborhood(graph, selectedEdgeId);
    secondaryEdgeCount = neighborhood.secondaryEdgeIds.length;
    secondaryNodeCount = neighborhood.secondaryNodeIds.length;
  }

  const graphSummary = {
    source: "ai-lab",
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
        "--lw-glow": themeTokens.app.glow,
        backgroundColor: themeTokens.app.background,
      } as React.CSSProperties}
      data-lw-theme-target="app.shell"
    >
      <div className="grid h-screen grid-rows-[auto_1fr_auto]">
        <header 
          className="px-6 py-4"
          style={{
            borderBottom: `1px solid ${themeTokens.app.panelBorder}`,
            backgroundColor: `${themeTokens.app.background}dd`,
          } as React.CSSProperties}
          data-lw-theme-target="topbar.root"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 
                className="text-2xl font-bold"
                style={{ color: themeTokens.app.accent } as React.CSSProperties}
              >
                LumaWeave Observatory
              </h1>
              <p className="text-sm" style={{ color: themeTokens.app.textMuted } as React.CSSProperties}>
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
                  <option value="haunted-observatory">Haunted Observatory</option>
                  <option value="glitter-goblin">Glitter Goblin</option>
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

        <section className="grid min-h-0 grid-cols-[280px_1fr_420px]">
          <aside 
            className="min-h-0 overflow-y-auto p-4"
            data-testid="graph-sources-panel"
            style={{
              borderRight: `1px solid ${themeTokens.app.panelBorder}`,
              backgroundColor: themeTokens.app.panelBackground,
            } as React.CSSProperties}
          >
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
              <div 
                className="mt-3 rounded-full px-3 py-1 text-xs"
                style={{
                  backgroundColor: `${themeTokens.app.accent}10`,
                  color: themeTokens.app.accent,
                } as React.CSSProperties}
              >
                {summary.status}
              </div>

              <div className="mt-3 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span style={{ color: themeTokens.app.textMuted } as React.CSSProperties}>graph.json:</span>
                  <span
                    style={{
                      color: summary.graphPresent ? themeTokens.app.accent : "#f87171",
                    } as React.CSSProperties}
                  >
                    {summary.graphPresent ? "found" : "missing"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span style={{ color: themeTokens.app.textMuted } as React.CSSProperties}>manifest.json:</span>
                  <span
                    style={{
                      color: summary.manifestPresent ? themeTokens.app.accent : themeTokens.app.textMuted,
                    } as React.CSSProperties}
                  >
                    {summary.manifestPresent ? "found" : "missing"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span style={{ color: themeTokens.app.textMuted } as React.CSSProperties}>GRAPH_REPORT.md:</span>
                  <span
                    style={{
                      color: summary.reportPresent ? themeTokens.app.accent : themeTokens.app.textMuted,
                    } as React.CSSProperties}
                  >
                    {summary.reportPresent ? "found" : "missing"}
                  </span>
                </div>

                <div className="mt-2 flex justify-between" style={{ borderTop: `1px solid ${themeTokens.app.panelBorder}10`, paddingTop: "0.5rem" }}>
                  <span style={{ color: themeTokens.app.textMuted } as React.CSSProperties}>Raw nodes:</span>
                  <span style={{ color: themeTokens.app.accent } as React.CSSProperties}>{summary.nodeCount}</span>
                </div>

                <div className="flex justify-between">
                  <span style={{ color: themeTokens.app.textMuted } as React.CSSProperties}>Raw edges:</span>
                  <span style={{ color: themeTokens.app.accent } as React.CSSProperties}>{summary.edgeCount}</span>
                </div>

                <div className="mt-2 flex justify-between" style={{ borderTop: `1px solid ${themeTokens.app.panelBorder}10`, paddingTop: "0.5rem" }}>
                  <span style={{ color: themeTokens.app.textMuted } as React.CSSProperties}>Normalized nodes:</span>
                  <span style={{ color: "#86efac" } as React.CSSProperties}>
                    {summary.normalizedNodeCount}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span style={{ color: themeTokens.app.textMuted } as React.CSSProperties}>Normalized edges:</span>
                  <span style={{ color: "#86efac" } as React.CSSProperties}>
                    {summary.normalizedEdgeCount}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span style={{ color: themeTokens.app.textMuted } as React.CSSProperties}>Warnings:</span>
                  <span
                    style={{
                      color: summary.warnings.length > 0 ? "#fbbf24" : themeTokens.app.textMuted,
                    } as React.CSSProperties}
                  >
                    {summary.warnings.length}
                  </span>
                </div>
              </div>

              {summary.warnings.length > 0 && (
                <div 
                  className="mt-3 rounded p-2"
                  style={{
                    border: `1px solid #fbbf2430`,
                    backgroundColor: "#78350f10",
                  } as React.CSSProperties}
                >
                  <div className="mb-1 text-xs font-semibold" style={{ color: "#fbbf24" } as React.CSSProperties}>
                    Warnings (first 3):
                  </div>
                  <ul className="space-y-1 text-xs" style={{ color: "#fcd34d99" } as React.CSSProperties}>
                    {summary.warnings.slice(0, 3).map((warning, index) => (
                      <li key={index} className="truncate">
                        • {warning}
                      </li>
                    ))}
                    {summary.warnings.length > 3 && (
                      <li style={{ color: "#fbbf2460" } as React.CSSProperties}>
                        ... and {summary.warnings.length - 3} more
                      </li>
                    )}
                  </ul>
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

            <div 
              className="mt-4 rounded-xl p-4"
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
          </aside>

          <section 
            className="relative min-h-0 overflow-hidden"
            data-testid="graph-viewport"
            style={{
              background: `radial-gradient(circle at center, ${themeTokens.app.accent}16, transparent 35%), radial-gradient(circle at bottom right, ${themeTokens.app.glow}12, transparent 30%)`,
            } as React.CSSProperties}
            data-lw-theme-target="graph.frame"
          >
            <div 
              className="absolute inset-0"
              style={{ backgroundColor: `${themeTokens.app.background}b3` } as React.CSSProperties}
            />

            <div className="relative h-full">
              {summary.normalizedNodes &&
              summary.normalizedEdges &&
              summary.normalizedNodes.length > 0 ? (
                (() => {
                  console.log("AppShell Sigma props", {
                    normalizedNodes: summary.normalizedNodes.length,
                    normalizedEdges: summary.normalizedEdges.length,
                    nodeSize: settings.physics.nodeSize,
                    linkDistance: settings.physics.linkDistance,
                    repelForce: settings.physics.repelForce,
                    selectedNodeId,
                    selectedEdgeId,
                  });

                  return (
                    <>
                      <SigmaGraphView
                        nodes={summary.normalizedNodes}
                        edges={summary.normalizedEdges}
                        nodeSize={settings.physics.nodeSize}
                        linkDistance={settings.physics.linkDistance}
                        repelForce={settings.physics.repelForce}
                        selectedNodeId={selectedNodeId}
                        selectedEdgeId={selectedEdgeId}
                        nodeSelectionStage={nodeSelectionStage}
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
                        onSelectEdge={(edgeId) => {
                          setSelectedEdgeId(edgeId);
                          setSelectedNodeId(null);
                          setInspectorExpanded(true);
                        }}
                        onClearSelection={() => {
                          setSelectedNodeId(null);
                          setSelectedEdgeId(null);
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

          <aside 
            className="min-h-0 overflow-y-auto p-4"
            data-testid="settings-panel"
            style={{
              borderLeft: `1px solid ${themeTokens.app.panelBorder}`,
              backgroundColor: themeTokens.app.panelBackground,
            } as React.CSSProperties}
            data-lw-theme-target="settings.panel"
          >
            <h2 
              className="mb-3 text-sm font-semibold uppercase tracking-wider"
              style={{ color: themeTokens.app.textMuted } as React.CSSProperties}
            >
              Control Plane
            </h2>

            <div className="space-y-4">
              <SettingsPanel />
            </div>
          </aside>
        </section>

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
