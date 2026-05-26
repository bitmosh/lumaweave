import type { CategoryDef, CategoryId } from './settingsPanel.types';

interface SidebarProps {
  categories: readonly CategoryDef[];
  activeId: CategoryId;
  collapsed: boolean;
  matchCounts: Record<string, number> | null;
  onSelect: (id: CategoryId) => void;
}

export function SettingsSidebar({ categories, activeId, collapsed, matchCounts, onSelect }: SidebarProps) {
  return (
    <nav
      data-testid="settings-panel-sidebar"
      className={'lw-sidebar' + (collapsed ? ' is-collapsed' : '')}
      role="tablist"
      aria-orientation="vertical"
    >
      {categories.map((c) => {
        const isActive = c.id === activeId;
        const count = matchCounts?.[c.id] ?? null;
        const dim = matchCounts != null && count === 0;
        return (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={c.label}
            title={collapsed ? c.label : undefined}
            data-testid={`settings-category-nav-${c.id}`}
            className={'lw-sidebar-item' + (isActive ? ' is-active' : '') + (dim ? ' is-dim' : '')}
            onClick={() => onSelect(c.id)}
          >
            <svg
              className="lw-sidebar-icon"
              viewBox="0 0 16 16"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth={c.id === 'graph' ? 1.4 : 0}
            >
              {c.id === 'graph' ? (
                <g fill="none">
                  <circle cx="4" cy="4" r="2" />
                  <circle cx="12" cy="11" r="2" />
                  <circle cx="3" cy="13" r="1.4" />
                  <path d="M5.5 5.5 10 9.5" />
                  <path d="M5 6l-2 5" />
                  <path d="M6 4h4" />
                </g>
              ) : (
                <path d={c.iconPath} />
              )}
            </svg>
            {!collapsed && <span className="lw-sidebar-label lw-text">{c.label}</span>}
            {!collapsed && count != null && count > 0 && (
              <span className="lw-sidebar-badge">{count}</span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
