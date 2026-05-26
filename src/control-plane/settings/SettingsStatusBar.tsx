import type { PanelPosition } from './settingsPanel.types';

type SaveState = 'synced' | 'stale' | 'diff' | 'live';

interface StatusBarProps {
  position: PanelPosition;
  saveState: SaveState;
  saveDiff?: { added: number; removed: number; changed: number };
  opacity: number;
  onOpacityChange: (v: number) => void;
}

const POSITION_GLYPH: Record<PanelPosition, { glyph: string; label: string }> = {
  'floating':     { glyph: '⬚',  label: 'floating' },
  'docked-left':  { glyph: '◧',  label: 'docked-l' },
  'docked-right': { glyph: '◨',  label: 'docked-r' },
  'minimized':    { glyph: '▭',  label: 'minimized' },
};

const SAVE_LABEL: Record<SaveState, { text: string; dotClass: string }> = {
  'synced': { text: 'synced',  dotClass: '' },
  'stale':  { text: 'stale',   dotClass: 'is-warn' },
  'diff':   { text: 'diff',    dotClass: 'is-alert' },
  'live':   { text: 'live',    dotClass: '' },
};

export function SettingsStatusBar({ position, saveState, saveDiff, opacity, onOpacityChange }: StatusBarProps) {
  const pos = POSITION_GLYPH[position];
  const sav = SAVE_LABEL[saveState];
  const pct = Math.round(opacity * 100);

  return (
    <footer data-testid="settings-panel-statusbar" className="lw-statusbar" role="status">
      <div className="lw-status-section" title={'Position · ' + pos.label}>
        <span className="lw-status-label">POS</span>
        <span className="lw-status-value" style={{ fontSize: 13, lineHeight: 1 }}>{pos.glyph}</span>
        <span className="lw-status-value">{pos.label}</span>
      </div>

      <div className="lw-status-section" title={'Save · ' + sav.text}>
        <span className="lw-status-label">SAVE</span>
        <span className={'lw-status-dot ' + sav.dotClass} />
        <span className="lw-status-value">{sav.text}</span>
        {saveState === 'diff' && saveDiff && (
          <span style={{ opacity: 0.7 }}>
            +{saveDiff.added} / −{saveDiff.removed} / ~{saveDiff.changed}
          </span>
        )}
      </div>

      <div className="lw-status-section is-opacity is-flex" title={'Panel opacity · ' + pct + '%'}>
        <span className="lw-status-label">OPACITY</span>
        <svg className="lw-opacity-icon" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3">
          <circle cx="7" cy="7" r="5.5" />
          <path d="M7 1.5a5.5 5.5 0 0 1 0 11Z" fill="currentColor" stroke="none" />
        </svg>
        <div className="lw-opacity-slider-wrap">
          <input
            data-testid="settings-panel-opacity"
            type="range"
            className="lw-slider"
            min={0}
            max={1}
            step={0.02}
            value={opacity}
            style={{ ['--p' as string]: pct + '%' } as React.CSSProperties}
            aria-label="Panel opacity"
            onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
          />
          <div className="lw-opacity-ticks" aria-hidden="true">
            {[0, 0.25, 0.5, 0.75, 1].map((v) => (
              <button
                type="button"
                key={v}
                className="lw-opacity-tick"
                style={{ left: (v * 100) + '%' }}
                title={`${Math.round(v * 100)}%`}
                onClick={() => onOpacityChange(v)}
              />
            ))}
          </div>
        </div>
        <span className="lw-status-value" style={{ minWidth: 38, textAlign: 'right' }}>{pct}%</span>
      </div>
    </footer>
  );
}

export function applyOpacityLayers(root: HTMLElement, slider: number) {
  const bg = slider;
  const chrome = 0.6 + slider * 0.4;
  root.style.setProperty('--lw-settings-bg-opacity',     String(bg));
  root.style.setProperty('--lw-settings-chrome-opacity', String(chrome));
  root.style.setProperty('--lw-settings-text-opacity',   '1');
}
