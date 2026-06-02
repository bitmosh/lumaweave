import { useState, useCallback } from 'react';
import { useSettingsStore } from '../settings.store';
import { builtInThemePresets } from '../../../themes/themePresets';
import { getThemeRuntimeTokens } from '../../../themes/themeTokens';
import { computeWCAGResult } from '../../../themes/wcagContrast';
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

// Node/edge constellation: same fixed layout across all cards — users compare color, not shape.
// Coords and edges mirrored from the settings-menu-design prototype (theme-menu-categories-1.tsx).
const THUMB_NODES = [
  { cx: 30, cy: 32, r: 6 }, { cx: 64, cy: 18, r: 9 }, { cx: 110, cy: 30, r: 5 },
  { cx: 152, cy: 48, r: 8 }, { cx: 178, cy: 22, r: 4 }, { cx: 44, cy: 70, r: 4 },
  { cx: 96, cy: 76, r: 11 }, { cx: 138, cy: 88, r: 5 }, { cx: 22, cy: 96, r: 6 },
  { cx: 72, cy: 110, r: 4 }, { cx: 124, cy: 116, r: 7 }, { cx: 170, cy: 100, r: 5 },
] as const;
const THUMB_EDGES: [number, number][] = [
  [0,1],[1,2],[2,3],[3,4],[1,5],[5,6],[6,3],[6,7],[7,11],[5,9],[6,10],[9,10],[8,5],[8,9],
];

function ThemeGraphThumb({ themeId, bg0, bg1, edgeColor, nodeColors }: {
  themeId: string;
  bg0: string;
  bg1: string;
  edgeColor: string;
  nodeColors: string[];
}) {
  const gradId = `tg-${themeId}`;
  const filterId = `tg-glow-${themeId}`;
  return (
    <svg
      className="lw-themecard-thumb"
      viewBox="0 0 200 130"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={gradId} cx="50%" cy="55%" r="70%">
          <stop offset="0%" stopColor={bg0} />
          <stop offset="100%" stopColor={bg1} />
        </radialGradient>
        <filter id={filterId}>
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>
      <rect width="200" height="130" fill={`url(#${gradId})`} />
      {THUMB_EDGES.map(([a, b], i) => (
        <line key={i}
          x1={THUMB_NODES[a].cx} y1={THUMB_NODES[a].cy}
          x2={THUMB_NODES[b].cx} y2={THUMB_NODES[b].cy}
          stroke={edgeColor} strokeWidth="0.8"
        />
      ))}
      {THUMB_NODES.map((n, i) => {
        const color = nodeColors[i % nodeColors.length];
        return (
          <g key={i}>
            <circle cx={n.cx} cy={n.cy} r={n.r * 1.6} fill={color} opacity="0.35" filter={`url(#${filterId})`} />
            <circle cx={n.cx} cy={n.cy} r={n.r} fill={color} />
          </g>
        );
      })}
    </svg>
  );
}

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
  // Identity palette — accent-forward; these are the colors that define this theme's look.
  // NOTE: thumbnail (ThemeGraphThumb below) correctly keeps nodeColorScale — don't change that.
  const paletteColors = [
    tokens.app.accent,
    tokens.app.background,
    tokens.app.panelBackground,
    tokens.app.textPrimary,
    tokens.app.panelBorder,
  ];
  // WCAG badge: textPrimary-on-background. rgba bgs are parsed as opaque RGB (alpha stripped)
  // — result is an approximation but won't throw; see wcagContrast.ts:parseColor.
  const contrast = computeWCAGResult(tokens.app.textPrimary, tokens.app.background);

  return (
    <button
      type="button"
      className={`theme-card${isApplied ? ' theme-card--applied' : ''}${isSelected ? ' theme-card--selected' : ''}`}
      onClick={onSelect}
      onDoubleClick={onApply}
      title={`${preset.name} — click to preview, double-click to apply`}
      aria-pressed={isApplied}
    >
      <ThemeGraphThumb
        themeId={preset.id}
        bg0={tokens.app.background}
        bg1={tokens.app.panelBackground}
        edgeColor={tokens.graph.edgeDefault}
        nodeColors={tokens.graph.nodeColorScale}
      />
      <div className="theme-card-meta">
        <span className="theme-card-name">{preset.name}</span>
        <span
          className={`wcag-badge wcag-badge--${contrast.level === 'fail' ? 'fail' : contrast.level === 'AA-large' ? 'warn' : 'pass'}`}
          title={`WCAG ${contrast.level} · ${contrast.ratio.toFixed(1)}:1 (text on bg)`}
        >
          {contrast.level === 'fail' ? '✗' : contrast.level === 'AA-large' ? 'AA*' : contrast.level}
        </span>
        {isApplied && <span className="theme-card-badge">Active</span>}
        {isSelected && !isApplied && <span className="theme-card-badge theme-card-badge--preview">Selected</span>}
      </div>
      <div className="lw-palette-row theme-card-palette">
        {paletteColors.map((color, i) => (
          <span key={i} className="lw-palette-chip" style={{ background: color }} title={color} />
        ))}
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
