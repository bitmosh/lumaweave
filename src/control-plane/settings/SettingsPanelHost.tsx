import { useState, useEffect, useMemo, forwardRef, useImperativeHandle } from 'react';
import { SETTINGS_PANEL_CATEGORIES } from './settingsPanelCategoryRegistry';
import { settingsRegistry } from './settings.registry';
import { t } from '../../i18n';

function normCatId(id: string) {
  return id.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}
import type { CategoryId, PanelPosition } from './settingsPanel.types';
import { SettingsPanel } from './SettingsPanel';
import { SettingsSidebar } from './SettingsSidebar';
import { SettingsContent } from './SettingsContent';
import { SettingsSearchBar } from './SettingsSearchBar';
import { SettingsStatusBar, applyOpacityLayers } from './SettingsStatusBar';

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
        if ((e.metaKey || e.ctrlKey) && (e.key === ',' || e.code === 'Comma')) {
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
        const pathKey = s.path.replace(/\./g, '_');
        const label = t(`settings.controls.${pathKey}.label`).toLowerCase();
        const desc = s.description ? t(`settings.controls.${pathKey}.description`).toLowerCase() : '';
        const hit = label.includes(q) || desc.includes(q);
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

    const catKey = normCatId(activeCat.id);
    const catLabel = t(`settings.panel.categories.${catKey}.label`);
    const catDescription = t(`settings.panel.categories.${catKey}.description`);
    const ActiveContent = activeCat.content;

    return (
      <SettingsPanel
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title={t("settings.panel.title")}
        subtitle={catLabel.toLowerCase()}
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
          <SettingsContent title={catLabel} description={catDescription}>
            <ActiveContent />
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
