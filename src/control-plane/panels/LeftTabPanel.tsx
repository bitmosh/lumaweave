import { ReactNode } from "react";

interface LeftTabPanelProps {
  collapsed: boolean;
  panelWidth: number;
  onWidthChange: (width: number) => void;
  activeTab: "graph" | "qa" | "evidence" | "debug";
  onTabChange: (tab: string) => void;
  onCollapse: () => void;
  // Section states
  graphTabSections: { graphSources: boolean; sourceAdapter: boolean };
  qaTabSections: { qaPanel: boolean };
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
  onSectionToggle: (tab: string, section: string) => void;
  // Panel components passed as render props
  graphTabContent: ReactNode;
  qaTabContent: ReactNode;
  evidenceTabContent: ReactNode;
  debugTabContent: ReactNode;
}

export function LeftTabPanel({
  collapsed,
  panelWidth,
  onWidthChange,
  activeTab,
  onTabChange,
  onCollapse,
  graphTabSections: _graphTabSections,
  qaTabSections: _qaTabSections,
  evidenceTabSections: _evidenceTabSections,
  debugTabSections: _debugTabSections,
  onSectionToggle: _onSectionToggle,
  graphTabContent,
  qaTabContent,
  evidenceTabContent,
  debugTabContent,
}: LeftTabPanelProps) {
  const TAB_ICONS: Record<string, string> = {
    graph: "⬡",
    qa: "✓",
    evidence: "◈",
    debug: "⌥",
  };

  const tabs = [
    { id: "graph" as const, label: "Graph" },
    { id: "qa" as const, label: "QA" },
    { id: "evidence" as const, label: "Evidence" },
    { id: "debug" as const, label: "Debug" },
  ] as const;

  // Collapsed state - narrow strip with tab icons
  if (collapsed) {
    return (
      <aside
        data-testid="left-tab-panel-collapsed"
        style={{
          width: "40px",
          minWidth: "40px",
          maxWidth: "40px",
          backgroundColor: "#0f172a",
          borderRight: "1px solid rgba(34, 211, 238, 0.1)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          padding: "8px 0",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            data-testid={`left-panel-icon-${tab.id}`}
            onClick={() => {
              onTabChange(tab.id);
              onCollapse();
            }}
            title={tab.label}
            style={{
              background: activeTab === tab.id ? "#1e293b" : "transparent",
              border: "none",
              color: activeTab === tab.id ? "#22d3ee" : "#94a3b8",
              cursor: "pointer",
              fontSize: "1.1rem",
              padding: "0.5rem",
              borderRadius: "0.5rem",
              transition: "all 0.15s ease",
              minWidth: "32px",
              minHeight: "32px",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#3b82f620")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = activeTab === tab.id ? "#1e293b" : "transparent")}
          >
            {TAB_ICONS[tab.id] || tab.label[0]}
          </button>
        ))}
      </aside>
    );
  }

  // Expanded state - full tab panel
  return (
    <aside
      data-testid="left-tab-panel"
      style={{
        width: `${panelWidth}px`,
        minWidth: `${panelWidth}px`,
        maxWidth: `${panelWidth}px`,
        backgroundColor: "#0f172a",
        borderRight: "1px solid rgba(34, 211, 238, 0.1)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Resize handle on right edge */}
      <div
        data-testid="left-panel-resize-handle"
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: "4px",
          cursor: "col-resize",
          background: "transparent",
          zIndex: 10,
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          const startX = e.clientX;
          const startWidth = panelWidth;

          const onMouseMove = (e: MouseEvent) => {
            const delta = e.clientX - startX;
            const newWidth = Math.min(480, Math.max(200, startWidth + delta));
            onWidthChange(newWidth);
          };

          const onMouseUp = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
          };

          document.addEventListener("mousemove", onMouseMove);
          document.addEventListener("mouseup", onMouseUp);
        }}
      />
      {/* Tab bar */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid #334155",
          backgroundColor: "#0f172a",
          overflowX: "auto",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        onWheel={(e) => {
          e.preventDefault();
          e.currentTarget.scrollLeft += e.deltaY;
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            data-testid={`tab-${tab.id}`}
            onClick={() => {
              onTabChange(tab.id);
              document.getElementById(`tab-section-${tab.id}`)?.scrollIntoView({ behavior: "instant" });
            }}
            style={{
              flex: "0 0 auto",
              padding: "0.75rem 0.75rem",
              background: activeTab === tab.id ? "#1e293b" : "transparent",
              border: "none",
              borderBottom: activeTab === tab.id ? "2px solid #3b82f6" : "2px solid transparent",
              color: activeTab === tab.id ? "#e2e8f0" : "#64748b",
              cursor: "pointer",
              fontSize: "0.7rem",
              fontWeight: activeTab === tab.id ? 600 : 400,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              transition: "all 0.15s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.25rem",
              minWidth: "fit-content",
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.backgroundColor = "#1e293b50";
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.backgroundColor = "transparent";
              }
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Collapse button */}
      <button
        onClick={onCollapse}
        style={{
          padding: "0.5rem",
          background: "transparent",
          border: "none",
          borderBottom: "1px solid #334155",
          color: "#64748b",
          cursor: "pointer",
          fontSize: "0.75rem",
          transition: "all 0.15s ease",
        }}
        title="Collapse panel (Ctrl+\\)"
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1e293b50")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
      >
        ◀ Collapse
      </button>

      {/* Tab content - all tabs always rendered normally */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "1rem",
        }}
      >
        <div id="tab-section-graph">{graphTabContent}</div>
        <div id="tab-section-qa">{qaTabContent}</div>
        <div id="tab-section-evidence">{evidenceTabContent}</div>
        <div id="tab-section-debug">{debugTabContent}</div>
        {/* v86a: settings tab removed */}
      </div>
    </aside>
  );
}
