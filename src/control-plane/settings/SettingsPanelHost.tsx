import { useState, useEffect, useMemo, forwardRef, useImperativeHandle } from 'react';
import { SETTINGS_PANEL_CATEGORIES } from './settingsPanelCategoryRegistry';
import { settingsRegistry } from './settings.registry';
import type { CategoryId, PanelPosition } from './settingsPanel.types';
import { SettingsPanel } from './SettingsPanel';
import { SettingsSidebar } from './SettingsSidebar';
import { SettingsContent } from './SettingsContent';
import { SettingsSearchBar } from './SettingsSearchBar';
import { SettingsStatusBar, applyOpacityLayers } from './SettingsStatusBar';
import { CategoryTheme } from './categories/CategoryTheme';
import { CategoryTypography } from './categories/CategoryTypography';
import { CategoryGraph } from './categories/CategoryGraph';
import { CategoryInspector } from './categories/CategoryInspector';
import { CategoryDataSources } from './categories/CategoryDataSources';
import { CategoryDisplay } from './categories/CategoryDisplay';
import { CategoryAccessibility } from './categories/CategoryAccessibility';
import { CategoryAdvanced } from './categories/CategoryAdvanced';

export interface SettingsPanelHostHandle {
  toggle: () => void;
  open: () => void;
}

export const SettingsPanelHost = forwardRef<SettingsPanelHostHandle>(
  function SettingsPanelHost(_, ref) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState<CategoryId>('theme');
    const [search, setSearch] = useState('');
    const [opacity, setOpacity] = useState(1);
    const [position, setPosition] = useState<PanelPosition>('floating');

    useImperativeHandle(ref, () => ({
      toggle: () => setIsOpen((v) => !v),
      open: () => setIsOpen(true),
    }));

    // v97: migrate hotkey registration to hotkey registry
    useEffect(() => {
      const handler = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === ',') {
          e.preventDefault();
          setIsOpen((v) => !v);
        }
      };
      document.addEventListener('keydown', handler);
      return () => document.removeEventListener('keydown', handler);
    }, []);

    useEffect(() => {
      const panel = document.querySelector<HTMLElement>('[data-testid="settings-panel-root"]');
      if (panel) applyOpacityLayers(panel, opacity);
    }, [opacity, isOpen]);

    const q = search.trim().toLowerCase();

    const matchCounts = useMemo(() => {
      if (!q) return null;
      const counts: Record<string, number> = {};
      for (const s of settingsRegistry) {
        const hit =
          s.label.toLowerCase().includes(q) ||
          (s.description ?? '').toLowerCase().includes(q);
        if (hit) {
          counts[s.category] = (counts[s.category] ?? 0) + 1;
        }
      }
      return counts;
    }, [q]);

    const activeCat =
      SETTINGS_PANEL_CATEGORIES.find((c) => c.id === activeCategory) ??
      SETTINGS_PANEL_CATEGORIES[0];

    const sidebarCollapsed =
      position === 'docked-left' || position === 'docked-right';

    return (
      <SettingsPanel
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Settings"
        subtitle={activeCat.label.toLowerCase()}
        onPositionChange={setPosition}
        opacity={opacity}
        headerSlot={<SettingsSearchBar value={search} onChange={setSearch} />}
        sidebarSlot={
          <SettingsSidebar
            categories={SETTINGS_PANEL_CATEGORIES}
            activeId={activeCategory}
            collapsed={sidebarCollapsed}
            matchCounts={matchCounts}
            onSelect={setActiveCategory}
          />
        }
        contentSlot={
          <SettingsContent title={activeCat.label} description={activeCat.description}>
            {activeCategory === 'theme'         && <CategoryTheme />}
            {activeCategory === 'typography'    && <CategoryTypography />}
            {activeCategory === 'graph'         && <CategoryGraph />}
            {activeCategory === 'inspector'     && <CategoryInspector />}
            {activeCategory === 'data-sources'  && <CategoryDataSources />}
            {activeCategory === 'display'       && <CategoryDisplay />}
            {activeCategory === 'accessibility' && <CategoryAccessibility />}
            {activeCategory === 'advanced'      && <CategoryAdvanced />}
          </SettingsContent>
        }
        statusBarSlot={
          <SettingsStatusBar
            position={position}
            saveState="synced"
            opacity={opacity}
            onOpacityChange={setOpacity}
          />
        }
      />
    );
  },
);
