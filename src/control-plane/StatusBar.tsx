import { useState, useEffect, useRef, ReactNode } from "react";
import { t } from "../i18n";
import { useSettingsStore } from "./settings/settings.store";
import { useDebugStore } from "./debug/debug.store";
import "./StatusBar.css";
import { useTileContext } from "./panels/TileProvider";
import { tileSectionRegistry } from "./panels/tileSectionRegistry";
import { commandRegistry } from "./commands/command-registry";

// ── StatusBarPopoverButton ─────────────────────────────────────────────────

interface PopoverButtonProps {
  icon: string;
  label: string;
  open: boolean;
  onToggle: () => void;
  testId: string;
  children: ReactNode;
}

function StatusBarPopoverButton({
  icon,
  label,
  open,
  onToggle,
  testId,
  children,
}: PopoverButtonProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onToggle();
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open, onToggle]);

  return (
    <div className="lw-status-bar-popover-host" ref={ref}>
      <button
        type="button"
        className={`lw-status-bar-popover-button ${open ? "is-open" : ""}`}
        onClick={onToggle}
        data-testid={testId}
      >
        <span className="lw-status-bar-popover-icon">{icon}</span>
        <span className="lw-status-bar-popover-label">{label}</span>
        <span className="lw-status-bar-popover-arrow">{open ? "▼" : "▲"}</span>
      </button>
      {open && (
        <div
          className="lw-status-bar-popover"
          data-testid={`${testId}-popover`}
        >
          {children}
        </div>
      )}
    </div>
  );
}

// ── DebugPopoverContent ────────────────────────────────────────────────────

function DebugRow({ label, value }: { label: string; value: string | number | boolean | null | undefined }) {
  return (
    <div className="lw-debug-popover-kv">
      <span className="lw-debug-popover-key">{label}</span>
      <span className="lw-debug-popover-val">{value == null ? "–" : String(value)}</span>
    </div>
  );
}

function DebugPopoverContent() {
  const settings = useSettingsStore((s) => s.settings);
  const setSetting = useSettingsStore((s) => s.setSetting);
  const renderer = useDebugStore((s) => s.renderer);
  const interaction = useDebugStore((s) => s.interaction);
  const neighborhood = useDebugStore((s) => s.neighborhood);

  return (
    <div
      className="lw-debug-popover"
      data-testid="debug-popover-content"
    >
      <div className="lw-debug-popover-header">Debug</div>
      <label className="lw-debug-popover-row">
        <input
          type="checkbox"
          checked={settings.developer?.showFps ?? false}
          onChange={(e) => setSetting("developer.showFps", e.target.checked)}
        />
        <span>Show FPS counter</span>
      </label>
      <div className="lw-debug-popover-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <label style={{ flex: '0 0 auto' }}>Editor:</label>
        <select
          value={settings.developer?.preferredEditor ?? "vscode"}
          onChange={(e) => setSetting("developer.preferredEditor", e.target.value)}
          style={{ flex: '1', padding: '4px 8px', fontSize: '12px' }}
        >
          <option value="vscode">VS Code</option>
          <option value="windsurf">Windsurf</option>
          <option value="cursor">Cursor</option>
          <option value="zed">Zed</option>
          <option value="webstorm">WebStorm</option>
          <option value="sublime">Sublime Text</option>
          <option value="vim">Vim</option>
          <option value="neovim">Neovim</option>
          <option value="system-default">System Default</option>
          <option value="custom">Custom</option>
        </select>
      </div>
      <label className="lw-debug-popover-row">
        <input
          type="checkbox"
          checked={settings.appearance.reduceMotion}
          onChange={(e) =>
            setSetting("appearance.reduceMotion", e.target.checked)
          }
        />
        <span>Reduce motion</span>
      </label>
      <label className="lw-debug-popover-row">
        <input
          type="checkbox"
          checked={settings.appearance.animationEnabled}
          onChange={(e) =>
            setSetting("appearance.animationEnabled", e.target.checked)
          }
        />
        <span>Animation enabled</span>
      </label>
      <div className="lw-debug-popover-section">Renderer</div>
      <DebugRow label="nodes in" value={renderer.sigmaInputNodes} />
      <DebugRow label="edges in" value={renderer.sigmaInputEdges} />
      <DebugRow label="graph order" value={renderer.graphologyOrder} />
      <DebugRow label="graph size" value={renderer.graphologySize} />
      <DebugRow label="node size" value={renderer.currentNodeSize} />
      <DebugRow label="nbhd depth" value={renderer.neighborhoodDepth} />
      <DebugRow label="node labels" value={renderer.nodeLabelMode} />
      <DebugRow label="edge labels" value={renderer.edgeLabelMode} />
      <DebugRow label="zoom thresh" value={renderer.zoomLabelThreshold} />
      <div className="lw-debug-popover-section">Interaction</div>
      <DebugRow label="selection" value={interaction.activeSelectionMode} />
      <DebugRow label="hover node" value={interaction.hoveredNodeId} />
      <DebugRow label="hover edge" value={interaction.hoveredEdgeId} />
      <DebugRow label="selected node" value={interaction.selectedNodeId} />
      <DebugRow label="selected edge" value={interaction.selectedEdgeId} />
      <div className="lw-debug-popover-section">Neighborhood</div>
      <DebugRow label="src" value={neighborhood.sourceId} />
      <DebugRow label="tgt" value={neighborhood.targetId} />
      <DebugRow label="2° edges" value={neighborhood.secondaryEdgeCount} />
      <DebugRow label="2° nodes" value={neighborhood.secondaryNodeCount} />
    </div>
  );
}

// ── TilesPopoverContent ────────────────────────────────────────────────────

function TilesPopoverContent() {
  const ctx = useTileContext();
  const tileLayout = Array.from(ctx.tiles.values());
  const sections = tileSectionRegistry.list();

  const isVisible = (sectionKey: string): boolean => {
    const entry = tileLayout.find((t) => t.sectionKey === sectionKey);
    if (!entry) {
      return sections.find((s) => s.id === sectionKey)?.defaultVisible ?? false;
    }
    return entry.visible !== false;
  };

  const onToggle = (sectionKey: string, visible: boolean) => {
    const entry = tileLayout.find((t) => t.sectionKey === sectionKey);
    if (entry) {
      ctx.setTileVisibility(entry.id, visible);
    } else if (visible) {
      ctx.tileOut(sectionKey);
    }
  };

  return (
    <div className="lw-tiles-popover" data-testid="tiles-popover-content">
      <div className="lw-tiles-popover-header">
        {t("statusBar.tiles.title")}
      </div>
      <ul className="lw-tiles-popover-list">
        {sections.map((section) => {
          const visible = isVisible(section.id);
          return (
            <li key={section.id}>
              <label className="lw-tiles-popover-row">
                <input
                  type="checkbox"
                  checked={visible}
                  onChange={(e) => onToggle(section.id, e.target.checked)}
                  data-testid={`tiles-popover-checkbox-${section.id}`}
                />
                {section.iconGlyph && (
                  <span className="lw-tiles-popover-icon">
                    {section.iconGlyph}
                  </span>
                )}
                <span className="lw-tiles-popover-label">{section.label}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ── UiInspectorPill ────────────────────────────────────────────────────────

interface UiInspectorPillProps {
  active: boolean;
  onToggle: () => void;
}

function UiInspectorPill({ active, onToggle }: UiInspectorPillProps) {
  return (
    <button
      type="button"
      className={`lw-status-bar-inspector-pill ${active ? "is-active" : ""}`}
      onClick={onToggle}
      aria-pressed={active}
      data-testid="status-bar-inspector-pill"
      title={t("statusBar.uiInspector.tooltip")}
    >
      <span className="lw-status-bar-inspector-pill-dot" aria-hidden />
      <span className="lw-status-bar-inspector-pill-label">
        {t("statusBar.uiInspector.label")}
      </span>
    </button>
  );
}

// ── StatusBar ──────────────────────────────────────────────────────────────

export function StatusBar() {
  const [debugOpen, setDebugOpen] = useState(false);
  const [tilesOpen, setTilesOpen] = useState(false);
  const settings = useSettingsStore((s) => s.settings);
  const inspectorActive = (settings as any).inspector?.overlayEnabled ?? false;

  const toggleDebug = () => setDebugOpen((o) => !o);
  const toggleTiles = () => setTilesOpen((o) => !o);

  const toggleInspector = () => {
    commandRegistry.getById("view.toggleInspector")?.execute();
  };

  const animationState = settings.appearance.animationEnabled
    ? t("common.on")
    : t("common.off");

  return (
    <footer className="lw-status-bar" data-testid="status-bar">
      <div className="lw-status-bar-left">
        <StatusBarPopoverButton
          icon="🛠"
          label={t("statusBar.debug")}
          open={debugOpen}
          onToggle={toggleDebug}
          testId="status-bar-debug-button"
        >
          <DebugPopoverContent />
        </StatusBarPopoverButton>
        <StatusBarPopoverButton
          icon="▦"
          label={t("statusBar.tiles.label")}
          open={tilesOpen}
          onToggle={toggleTiles}
          testId="status-bar-tiles-button"
        >
          <TilesPopoverContent />
        </StatusBarPopoverButton>
      </div>
      <div className="lw-status-bar-text" data-testid="status-bar-text">
        {t("statusBar.controlPlane", {
          state: t("statusBar.controlPlaneOnline"),
        })}
        <span className="lw-status-sep">·</span>
        {t("statusBar.theme", { themeName: settings.appearance.theme })}
        <span className="lw-status-sep">·</span>
        {t("statusBar.animation", { state: animationState })}
        <span className="lw-status-sep">·</span>
        {t("statusBar.renderer", {
          rendererName: settings.graphView.defaultRenderer,
        })}
      </div>
      <div className="lw-status-bar-right">
        <UiInspectorPill active={inspectorActive} onToggle={toggleInspector} />
      </div>
    </footer>
  );
}
