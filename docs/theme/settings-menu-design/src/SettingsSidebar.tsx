/* IIFE-WRAPPED */
(() => {
/**
 * SettingsSidebar.tsx
 *
 * Left rail listing the 8 categories. Active highlight uses the accent
 * border-left + soft bg tint. When docked to a tile bank, the rail
 * collapses to icons (label hidden, tooltip on hover via aria-label).
 *
 * Search badge: when search is active, each category shows an "N matches"
 * badge instead of vanishing — keeps the map of the menu visible while
 * filtering content.
 */

interface SidebarProps {
  categories: typeof window.LW_SETTINGS_DATA.CATEGORIES;
  activeId: string;
  collapsed: boolean;
  matchCounts: Record<string, number> | null;
  onSelect: (id: string) => void;
}

const SettingsSidebar: React.FC<SidebarProps> = ({ categories, activeId, collapsed, matchCounts, onSelect }) => {
  return (
    <nav
      className={'lw-sidebar' + (collapsed ? ' is-collapsed' : '')}
      role="tablist"
      aria-orientation="vertical"
    >
      {categories.map((c: any) => {
        const isActive = c.id === activeId;
        const count = matchCounts?.[c.id] ?? null;
        const dim = matchCounts != null && (count === 0);
        return (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={c.label}
            title={collapsed ? c.label : undefined}
            className={'lw-sidebar-item' + (isActive ? ' is-active' : '') + (dim ? ' is-dim' : '')}
            onClick={() => onSelect(c.id)}
          >
            <svg className="lw-sidebar-icon" viewBox="0 0 16 16" fill="currentColor" stroke="currentColor" strokeWidth={c.id === 'graph' ? 1.4 : 0}>
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
};

(window as any).LW_SettingsSidebar = SettingsSidebar;

})();
