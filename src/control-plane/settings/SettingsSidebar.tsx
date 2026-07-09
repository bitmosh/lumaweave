// SPDX-License-Identifier: Apache-2.0
import type { CategoryDef, CategoryId } from './settingsPanel.types';
import { t } from '../../i18n';

function normCatId(id: string) {
  return id.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

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
        const catLabel = t(`settings.panel.categories.${normCatId(c.id)}.label`);
        const Icon = c.icon;
        return (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={catLabel}
            title={collapsed ? catLabel : undefined}
            data-testid={`settings-category-nav-${c.id}`}
            className={'lw-sidebar-item' + (isActive ? ' is-active' : '') + (dim ? ' is-dim' : '')}
            onClick={() => onSelect(c.id)}
          >
            <Icon size={16} className="lw-sidebar-icon" aria-hidden="true" />
            {!collapsed && <span className="lw-sidebar-label lw-text">{catLabel}</span>}
            {!collapsed && count != null && count > 0 && (
              <span className="lw-sidebar-badge">{count}</span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
