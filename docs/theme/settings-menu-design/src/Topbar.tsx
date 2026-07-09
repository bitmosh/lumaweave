// SPDX-License-Identifier: Apache-2.0
/* IIFE-WRAPPED */
(() => {
/**
 * Topbar.tsx
 *
 * The LumaWeave host page chrome. NOT part of the Settings deliverable —
 * but renders the gear button that opens Settings, the info button next to
 * it, plus the topbar mirrors (theme picker, effects, reduce motion).
 *
 * Also renders the system-wide bottom status row that holds Account and
 * Profile (those were promoted out of the Settings panel's status bar at
 * the user's request).
 */

interface TopbarProps {
  themes: any[];
  themeId: string;
  onSelectTheme: (id: string) => void;
  effects: boolean;
  reduceMotion: boolean;
  onEffectsChange: (v: boolean) => void;
  onReduceMotionChange: (v: boolean) => void;
  onOpenSettings: () => void;
  settingsOpen: boolean;
  /** Current gwells dialect id — used for the topbar status label. */
  dialectId: string;
  /** All available dialects — read from GW_DIALECT_REGISTRY. */
  dialects: any[];
}

const Topbar: React.FC<TopbarProps> = ({
  themes, themeId, onSelectTheme,
  effects, reduceMotion, onEffectsChange, onReduceMotionChange,
  onOpenSettings, settingsOpen,
  dialectId, dialects,
}) => {
  const theme = themes.find((t) => t.id === themeId) ?? themes[0];
  const dialect = dialects.find((d) => d.id === dialectId) ?? dialects[0];
  return (
    <header className="lw-topbar">
      <div className="lw-topbar-logo">
        <div className="lw-topbar-hex" />
        <div>
          <div className="lw-topbar-title">LumaWeave</div>
          <div className="lw-topbar-sub">Map. Understand. Build.</div>
        </div>
      </div>
      <span className="lw-topbar-pill">PANORAMA ATLAS</span>
      <span className="lw-topbar-pill" style={{ color: 'var(--lw-color-magenta-500)', borderColor: 'var(--lw-color-magenta-500)' }}>
        ◉ {theme.name.toUpperCase()}
      </span>
      <span className="lw-topbar-stats">
        <span>graph <em>100n · 110e</em></span>
        <span>dialect <em>{dialect.label}</em></span>
        <span>fps <em>58</em></span>
      </span>
      <span className="lw-topbar-spacer" />
      <select
        className="lw-select"
        value={themeId}
        onChange={(e) => onSelectTheme(e.target.value)}
        aria-label="Theme"
        style={{ marginRight: 6 }}
      >
        {themes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>
      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--lw-text-muted)' }}>
        <span>Effects</span>
        <button
          type="button"
          className={'lw-toggle' + (effects ? ' is-on' : '')}
          onClick={() => onEffectsChange(!effects)}
          aria-label="Effects"
        />
      </label>
      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--lw-text-muted)' }}>
        <span>Reduce motion</span>
        <button
          type="button"
          className={'lw-toggle' + (reduceMotion ? ' is-on' : '')}
          onClick={() => onReduceMotionChange(!reduceMotion)}
          aria-label="Reduce motion"
        />
      </label>

      {/* Info button (About dialog) — out of scope, just renders */}
      <button type="button" className="lw-topbar-icon-btn" aria-label="About LumaWeave" title="About">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3">
          <circle cx="7" cy="7" r="5.5" />
          <line x1="7" y1="6" x2="7" y2="10" />
          <circle cx="7" cy="4" r="0.6" fill="currentColor" />
        </svg>
      </button>

      {/* Gear → opens Settings */}
      <button
        type="button"
        className={'lw-topbar-icon-btn' + (settingsOpen ? ' is-active' : '')}
        aria-label="Open settings"
        title="Settings · ⌘,"
        onClick={onOpenSettings}
      >
        <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 1.5l1.2 2 2.3-.5.5 2.3 2 1.2-1.2 2 1.2 2-2 1.2-.5 2.3-2.3-.5L8 14.5l-1.2-2-2.3.5-.5-2.3-2-1.2 1.2-2-1.2-2 2-1.2.5-2.3 2.3.5L8 1.5Zm0 3.7a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6Z" />
        </svg>
        <span className="lw-topbar-kbd" style={{ marginLeft: 6 }}>⌘,</span>
      </button>
    </header>
  );
};

/** System-level bottom status row. Account and Profile live here per user
 *  preference — they are NOT inside the Settings panel's status bar. */
interface SystemStatusProps {
  themeId: string;
  themes: any[];
  dialectId: string;
  dialects: any[];
}
const SystemStatus: React.FC<SystemStatusProps> = ({ themeId, themes, dialectId, dialects }) => {
  const theme = themes.find((t) => t.id === themeId) ?? themes[0];
  const dialect = dialects.find((d) => d.id === dialectId) ?? dialects[0];
  return (
    <footer style={{
      position: 'fixed',
      left: 0, right: 0, bottom: 0,
      zIndex: 4,
      display: 'flex',
      alignItems: 'stretch',
      fontFamily: 'IBM Plex Mono, monospace',
      fontSize: 10.5,
      letterSpacing: 0.04,
      borderTop: '1px solid var(--lw-panel-border)',
      background: 'color-mix(in oklab, var(--lw-app-bg) 80%, transparent)',
      backdropFilter: 'blur(8px)',
    }}>
      <Section label="ACCOUNT" value="offline" />
      <Section label="PROFILE" value="default" />
      <Section label="THEME"   value={theme.id} />
      <Section label="RENDERER" value="sigma2d" />
      <Section label="DIALECT"  value={`${dialect.id} · θ=1.0`} />
      <span style={{ flex: 1 }} />
      <Section label="SELECTION" value="live" />
      <Section label="" value="⌘K command palette" />
    </footer>
  );
};

const Section: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '7px 14px',
    borderRight: '1px solid var(--lw-panel-border)',
    color: 'var(--lw-text-muted)',
  }}>
    {label && (
      <span style={{ textTransform: 'uppercase', fontSize: 9.5, letterSpacing: 0.12, opacity: 0.7 }}>{label}</span>
    )}
    <span style={{ color: 'var(--lw-text-primary)' }}>{value}</span>
  </div>
);

(window as any).LW_Topbar = Topbar;
(window as any).LW_SystemStatus = SystemStatus;

})();
