import { useState, useCallback } from 'react';
import { useSettingsStore } from '../settings.store';
import { builtInThemePresets } from '../../../themes/themePresets';
import { getThemeRuntimeTokens } from '../../../themes/themeTokens';
import type { CategoryContentProps } from '../settingsPanel.types';
import type { ThemeId } from '../../settings/settings.schema';

// Sub-areas: browse and active are live; others are stubs for later phases.
type SubArea = 'browse' | 'active' | 'workshop' | 'history' | 'bookmarks' | 'export';

const SUB_AREAS: { id: SubArea; label: string; live: boolean }[] = [
  { id: 'browse', label: 'Browse', live: true },
  { id: 'active', label: 'Active', live: true },
  { id: 'workshop', label: 'Workshop', live: false },
  { id: 'history', label: 'History', live: false },
  { id: 'bookmarks', label: 'Bookmarks', live: false },
  { id: 'export', label: 'Export', live: false },
];

// --- Browse Sub-Area ---

function ThemeCard({
  preset,
  isApplied,
  isSelected,
  onSelect,
  onApply,
}: {
  preset: typeof builtInThemePresets[0];
  isApplied: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onApply: () => void;
}) {
  const tokens = getThemeRuntimeTokens(preset.id as ThemeId);

  return (
    <button
      type="button"
      className={`theme-card${isApplied ? ' theme-card--applied' : ''}${isSelected ? ' theme-card--selected' : ''}`}
      onClick={onSelect}
      onDoubleClick={onApply}
      title={`${preset.name} — click to preview, double-click to apply`}
      aria-pressed={isApplied}
    >
      <div
        className="theme-card-swatch"
        style={{
          background: `linear-gradient(135deg, ${tokens.app.background} 0%, ${tokens.app.accent}33 100%)`,
          borderColor: tokens.app.panelBorder,
        }}
      >
        <span
          className="theme-card-accent-dot"
          style={{ background: tokens.app.accent }}
        />
      </div>
      <div className="theme-card-meta">
        <span className="theme-card-name">{preset.name}</span>
        {isApplied && <span className="theme-card-badge">Active</span>}
        {isSelected && !isApplied && <span className="theme-card-badge theme-card-badge--preview">Selected</span>}
      </div>
    </button>
  );
}

function BrowseSubArea({ appliedThemeId, onApply }: { appliedThemeId: string; onApply: (id: string) => void }) {
  const [selectedId, setSelectedId] = useState<string>(appliedThemeId);

  return (
    <div className="theme-browse">
      <p className="theme-browse-hint">
        Click a theme to preview it. Double-click to apply.
      </p>
      <div className="theme-browse-grid">
        {builtInThemePresets.map((preset) => (
          <ThemeCard
            key={preset.id}
            preset={preset}
            isApplied={preset.id === appliedThemeId}
            isSelected={preset.id === selectedId}
            onSelect={() => setSelectedId(preset.id)}
            onApply={() => onApply(preset.id)}
          />
        ))}
      </div>
    </div>
  );
}

// --- Active Sub-Area ---

function ActiveSubArea({ appliedThemeId }: { appliedThemeId: string }) {
  const tokens = getThemeRuntimeTokens(appliedThemeId as ThemeId);
  const preset = builtInThemePresets.find((p) => p.id === appliedThemeId);

  const appTokenEntries = Object.entries(tokens.app) as [string, string][];

  return (
    <div className="theme-active">
      <div className="theme-active-header">
        <span className="theme-active-name">{preset?.name ?? appliedThemeId}</span>
        <span className="theme-active-id">{appliedThemeId}</span>
      </div>

      <section className="theme-active-section">
        <h4 className="theme-active-section-title">Runtime tokens</h4>
        <div className="theme-active-tokens">
          {appTokenEntries.map(([key, value]) => (
            <div key={key} className="theme-token-row">
              <span
                className="theme-token-swatch"
                style={{ background: value }}
                title={value}
              />
              <span className="theme-token-key">{key}</span>
              <span className="theme-token-value">{value}</span>
            </div>
          ))}
        </div>
      </section>

      {preset && (
        <section className="theme-active-section">
          <h4 className="theme-active-section-title">About</h4>
          <p className="theme-active-desc">{preset.description}</p>
          {preset.tags && preset.tags.length > 0 && (
            <div className="theme-active-tags">
              {preset.tags.map((tag) => (
                <span key={tag} className="theme-active-tag">{tag}</span>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

// --- Stub Sub-Area ---

function StubSubArea({ label }: { label: string }) {
  return (
    <div className="theme-stub">
      <span className="theme-stub-label">{label}</span>
      <p className="theme-stub-coming">Coming in a later v102 phase</p>
    </div>
  );
}

// --- Main CategoryTheme ---

export function CategoryTheme({ onDrillIn, onDrillOut }: CategoryContentProps) {
  const [activeSubArea, setActiveSubArea] = useState<SubArea>('browse');
  const settings = useSettingsStore((s) => s.settings);
  const setSetting = useSettingsStore((s) => s.setSetting);

  const appliedThemeId = (settings.appearance?.theme ?? 'solar-plasma') as string;

  const handleSubAreaSelect = useCallback((id: SubArea) => {
    setActiveSubArea(id);
    onDrillIn?.();
  }, [onDrillIn]);

  const handleApplyTheme = useCallback((id: string) => {
    setSetting('appearance', { ...settings.appearance, theme: id as ThemeId });
  }, [setSetting, settings.appearance]);

  return (
    <div data-testid="settings-category-content-theme" className="theme-menu">
      {/* Sub-area navigation */}
      <nav className="theme-subnav" aria-label="Theme sections">
        {SUB_AREAS.map((area) => (
          <button
            key={area.id}
            type="button"
            className={`theme-subnav-btn${activeSubArea === area.id ? ' is-active' : ''}${!area.live ? ' is-stub' : ''}`}
            onClick={() => handleSubAreaSelect(area.id)}
            disabled={!area.live}
            title={!area.live ? 'Coming in a later v102 phase' : undefined}
          >
            {area.label}
          </button>
        ))}
      </nav>

      {/* Back link to expand sidebar */}
      <button
        type="button"
        className="theme-subnav-back"
        onClick={() => onDrillOut?.()}
        aria-label="Expand category sidebar"
      >
        ← All settings
      </button>

      {/* Sub-area content */}
      <div className="theme-subnav-content">
        {activeSubArea === 'browse' && (
          <BrowseSubArea appliedThemeId={appliedThemeId} onApply={handleApplyTheme} />
        )}
        {activeSubArea === 'active' && (
          <ActiveSubArea appliedThemeId={appliedThemeId} />
        )}
        {activeSubArea === 'workshop' && <StubSubArea label="Workshop" />}
        {activeSubArea === 'history' && <StubSubArea label="History" />}
        {activeSubArea === 'bookmarks' && <StubSubArea label="Bookmarks" />}
        {activeSubArea === 'export' && <StubSubArea label="Export" />}
      </div>
    </div>
  );
}
