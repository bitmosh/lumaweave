import { ReactNode } from "react";

interface LeftTabPanelProps {
  collapsed: boolean;
  activeTab: "graph" | "qa" | "evidence" | "debug" | "settings";
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
  settingsTabSections: {
    generalSettings: boolean;
  };
  onSectionToggle: (tab: string, section: string) => void;
  tiledTabs: string[];
  onTileOut: (tab: string) => void;
  // Panel components passed as render props
  graphTabContent: ReactNode;
  qaTabContent: ReactNode;
  evidenceTabContent: ReactNode;
  debugTabContent: ReactNode;
  settingsTabContent: ReactNode;
}

export function LeftTabPanel({
  collapsed,
  activeTab,
  onTabChange,
  onCollapse,
  graphTabSections: _graphTabSections,
  qaTabSections: _qaTabSections,
  evidenceTabSections: _evidenceTabSections,
  debugTabSections: _debugTabSections,
  settingsTabSections: _settingsTabSections,
  onSectionToggle: _onSectionToggle,
  tiledTabs,
  onTileOut,
  graphTabContent,
  qaTabContent,
  evidenceTabContent,
  debugTabContent,
  settingsTabContent,
}: LeftTabPanelProps) {
  const tabs = [
    { id: "graph" as const, label: "Graph" },
    { id: "qa" as const, label: "QA" },
    { id: "evidence" as const, label: "Evidence" },
    { id: "debug" as const, label: "Debug" },
    { id: "settings" as const, label: "Settings" },
  ] as const;

  const isTiled = (tabId: string) => tiledTabs.includes(tabId);

  // Collapsed state - narrow strip with expand button
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
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
        onClick={onCollapse}
        title="Expand panel (Ctrl+\\)"
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCollapse();
          }}
          style={{
            background: "transparent",
            border: "none",
            color: "#94a3b8",
            cursor: "pointer",
            fontSize: "1.25rem",
            padding: "0.5rem",
            borderRadius: "0.5rem",
            transition: "all 0.15s ease",
            minWidth: "32px",
            minHeight: "32px",
          }}
          title="Expand panel (Ctrl+\\)"
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#3b82f620")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          ▶
        </button>
      </aside>
    );
  }

  // Expanded state - full tab panel
  return (
    <aside
      data-testid="left-tab-panel"
      style={{
        width: "280px",
        minWidth: "280px",
        maxWidth: "280px",
        backgroundColor: "#0f172a",
        borderRight: "1px solid rgba(34, 211, 238, 0.1)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
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
            onClick={() => onTabChange(tab.id)}
            disabled={isTiled(tab.id)}
            style={{
              flex: "0 0 auto",
              padding: "0.75rem 0.75rem",
              background: activeTab === tab.id ? "#1e293b" : "transparent",
              border: "none",
              borderBottom: activeTab === tab.id ? "2px solid #3b82f6" : "2px solid transparent",
              color: activeTab === tab.id ? "#e2e8f0" : "#64748b",
              cursor: isTiled(tab.id) ? "not-allowed" : "pointer",
              fontSize: "0.7rem",
              fontWeight: activeTab === tab.id ? 600 : 400,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              transition: "all 0.15s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.25rem",
              opacity: isTiled(tab.id) ? 0.5 : 1,
              minWidth: "fit-content",
            }}
            onMouseEnter={(e) => {
              if (!isTiled(tab.id) && activeTab !== tab.id) {
                e.currentTarget.style.backgroundColor = "#1e293b50";
              }
            }}
            onMouseLeave={(e) => {
              if (!isTiled(tab.id) && activeTab !== tab.id) {
                e.currentTarget.style.backgroundColor = "transparent";
              }
            }}
          >
            {tab.label}
            {!isTiled(tab.id) && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onTileOut(tab.id);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#64748b",
                  cursor: "pointer",
                  fontSize: "0.7rem",
                  padding: "0.25rem",
                  borderRadius: "0.25rem",
                  lineHeight: 1,
                }}
                title="Pop out as tile"
                onMouseEnter={(e) => (e.currentTarget.style.color = "#94a3b8")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
              >
                ⬚
              </div>
            )}
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

      {/* Tab content - all tabs always rendered normally, no CSS hiding */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "1rem",
        }}
      >
        {graphTabContent}
        {qaTabContent}
        {evidenceTabContent}
        {debugTabContent}
        {settingsTabContent}
      </div>
    </aside>
  );
}
