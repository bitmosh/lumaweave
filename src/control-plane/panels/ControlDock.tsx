import { useState, useRef } from "react";
import { SettingsPanel } from "../settings/SettingsPanel";
import type { StarmapSettings } from "../settings/settings.schema";

interface ControlDockProps {
  collapsed: boolean;
  width: number;
  collapsedWidth: number;
  sections: {
    physics: boolean;
    appearance: boolean;
    labels: boolean;
    graphView: boolean;
  };
  onCollapse: () => void;
  onSectionToggle: (section: string) => void;
  onWidthChange: (width: number) => void;
  settings: StarmapSettings;
  setSetting: <K extends keyof StarmapSettings>(
    key: K,
    value: StarmapSettings[K]
  ) => void;
}

export function ControlDock({
  collapsed,
  width,
  collapsedWidth,
  sections,
  onCollapse,
  onSectionToggle: _onSectionToggle,
  onWidthChange,
  settings: _settings,
  setSetting: _setSetting,
}: ControlDockProps) {
  const [isResizing, setIsResizing] = useState(false);
  const resizeStart = useRef(0);
  const widthStart = useRef(width);

  const handleResizeStart = (e: React.MouseEvent) => {
    setIsResizing(true);
    resizeStart.current = e.clientX;
    widthStart.current = width;
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing) return;
    const dx = e.clientX - resizeStart.current;
    const newWidth = Math.max(280, Math.min(600, widthStart.current - dx));
    onWidthChange(newWidth);
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
  };

  // Add/remove resize event listeners
  if (isResizing) {
    window.addEventListener("mousemove", handleResizeMove);
    window.addEventListener("mouseup", handleResizeEnd);
  }

  const handleIconClick = (section: string) => {
    if (collapsed) {
      onCollapse();
    }
    // Scroll to section when expanded
    setTimeout(() => {
      const element = document.querySelector(`[data-section="${section}"]`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  return (
    <aside
      data-testid={collapsed ? "control-dock-collapsed" : "control-dock"}
      style={{
        width: collapsed ? `${collapsedWidth}px` : `${width}px`,
        minWidth: collapsed ? `${collapsedWidth}px` : `${width}px`,
        maxWidth: collapsed ? `${collapsedWidth}px` : `${width}px`,
        display: "flex",
        backgroundColor: "#0f172a",
        borderLeft: "1px solid rgba(34, 211, 238, 0.1)",
        position: "relative",
        transition: isResizing ? "none" : "width 0.2s ease",
      }}
    >
      {/* Resize handle */}
      {!collapsed && (
        <div
          onMouseDown={handleResizeStart}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "4px",
            cursor: "ew-resize",
            backgroundColor: isResizing ? "#3b82f6" : "transparent",
            zIndex: 10,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#3b82f6")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        />
      )}

      {/* Icon bar (always visible on right edge) */}
      <div
        data-testid="control-dock-icon-bar"
        style={{
          width: "40px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "1rem 0.5rem",
          gap: "1rem",
          borderLeft: collapsed ? "none" : "1px solid #1e293b",
          backgroundColor: "#0f172a",
        }}
      >
        {/* Physics icon */}
        <button
          onClick={() => handleIconClick("physics")}
          style={{
            background: sections.physics ? "#3b82f620" : "transparent",
            border: "none",
            borderRadius: "0.5rem",
            padding: "0.5rem",
            cursor: "pointer",
            color: sections.physics ? "#3b82f6" : "#94a3b8",
            fontSize: "1.25rem",
            transition: "all 0.15s ease",
          }}
          title="Physics"
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#3b82f630")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = sections.physics ? "#3b82f620" : "transparent")}
        >
          ⚡
        </button>

        {/* Appearance icon */}
        <button
          onClick={() => handleIconClick("appearance")}
          style={{
            background: sections.appearance ? "#3b82f620" : "transparent",
            border: "none",
            borderRadius: "0.5rem",
            padding: "0.5rem",
            cursor: "pointer",
            color: sections.appearance ? "#3b82f6" : "#94a3b8",
            fontSize: "1.25rem",
            transition: "all 0.15s ease",
          }}
          title="Appearance"
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#3b82f630")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = sections.appearance ? "#3b82f620" : "transparent")}
        >
          🎨
        </button>

        {/* Labels icon */}
        <button
          onClick={() => handleIconClick("labels")}
          style={{
            background: sections.labels ? "#3b82f620" : "transparent",
            border: "none",
            borderRadius: "0.5rem",
            padding: "0.5rem",
            cursor: "pointer",
            color: sections.labels ? "#3b82f6" : "#94a3b8",
            fontSize: "1.25rem",
            transition: "all 0.15s ease",
          }}
          title="Labels"
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#3b82f630")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = sections.labels ? "#3b82f620" : "transparent")}
        >
          🏷
        </button>

        {/* Graph View icon */}
        <button
          onClick={() => handleIconClick("graphView")}
          style={{
            background: sections.graphView ? "#3b82f620" : "transparent",
            border: "none",
            borderRadius: "0.5rem",
            padding: "0.5rem",
            cursor: "pointer",
            color: sections.graphView ? "#3b82f6" : "#94a3b8",
            fontSize: "1.25rem",
            transition: "all 0.15s ease",
          }}
          title="Graph View"
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#3b82f630")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = sections.graphView ? "#3b82f620" : "transparent")}
        >
          👁
        </button>

        {/* Collapse toggle */}
        <button
          onClick={onCollapse}
          style={{
            marginTop: "auto",
            background: "transparent",
            border: "none",
            borderRadius: "0.5rem",
            padding: "0.5rem",
            cursor: "pointer",
            color: "#64748b",
            fontSize: "1rem",
            transition: "all 0.15s ease",
          }}
          title={collapsed ? "Expand" : "Collapse"}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#94a3b8")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
        >
          {collapsed ? "▶" : "◀"}
        </button>
      </div>

      {/* Content area (hidden when collapsed) */}
      {!collapsed && (
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            maxHeight: "calc(100vh - 64px)",
            padding: "1rem",
          }}
        >
          <h2
            className="mb-3 text-sm font-semibold uppercase tracking-wider"
            style={{ color: "#64748b" }}
          >
            Control Plane
          </h2>

          <div className="space-y-4" data-testid="settings-panel" data-lw-theme-target="settings.panel">
            <SettingsPanel />
          </div>
        </div>
      )}
    </aside>
  );
}
