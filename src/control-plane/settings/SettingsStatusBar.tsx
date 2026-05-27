import type { PanelPosition } from './settingsPanel.types';
import { t } from '../../i18n';

type SaveState = 'synced' | 'stale' | 'diff' | 'live';

interface StatusBarProps {
  position: PanelPosition;
  saveState: SaveState;
  saveDiff?: { added: number; removed: number; changed: number };
  opacity: number;
  onOpacityChange: (v: number) => void;
}

const POSITION_GLYPH: Record<PanelPosition, { glyph: string; labelKey: string }> = {
  'floating':     { glyph: '⬚',  labelKey: 'settings.panel.statusBar.positions.floating' },
  'docked-left':  { glyph: '◧',  labelKey: 'settings.panel.statusBar.positions.dockedLeft' },
  'docked-right': { glyph: '◨',  labelKey: 'settings.panel.statusBar.positions.dockedRight' },
  'minimized':    { glyph: '▭',  labelKey: 'settings.panel.statusBar.positions.minimized' },
};

const SAVE_LABEL: Record<SaveState, { textKey: string; dotClass: string }> = {
  'synced': { textKey: 'settings.panel.statusBar.saveStates.synced', dotClass: '' },
  'stale':  { textKey: 'settings.panel.statusBar.saveStates.stale',  dotClass: 'is-warn' },
  'diff':   { textKey: 'settings.panel.statusBar.saveStates.diff',   dotClass: 'is-alert' },
  'live':   { textKey: 'settings.panel.statusBar.saveStates.live',   dotClass: '' },
};

export function SettingsStatusBar({ position, saveState, saveDiff, opacity, onOpacityChange }: StatusBarProps) {
  const pos = POSITION_GLYPH[position];
  const sav = SAVE_LABEL[saveState];
  const pct = Math.round(opacity * 100);
  const posLabel = t(pos.labelKey);
  const savText = t(sav.textKey);

  return (
    <footer data-testid="settings-panel-statusbar" className="lw-statusbar" role="status">
      <div className="lw-status-section" title={t("settings.panel.statusBar.posLabel") + ' · ' + posLabel}>
        <span className="lw-status-label">{t("settings.panel.statusBar.posLabel")}</span>
        <span className="lw-status-value" style={{ fontSize: 13, lineHeight: 1 }}>{pos.glyph}</span>
        <span className="lw-status-value">{posLabel}</span>
      </div>

      <div className="lw-status-section" title={t("settings.panel.statusBar.saveLabel") + ' · ' + savText}>
        <span className="lw-status-label">{t("settings.panel.statusBar.saveLabel")}</span>
        <span className={'lw-status-dot ' + sav.dotClass} />
        <span className="lw-status-value">{savText}</span>
        {saveState === 'diff' && saveDiff && (
          <span style={{ opacity: 0.7 }}>
            +{saveDiff.added} / −{saveDiff.removed} / ~{saveDiff.changed}
          </span>
        )}
      </div>

      <div className="lw-status-section is-opacity is-flex" title={t("settings.panel.statusBar.opacityLabel") + ' · ' + pct + '%'}>
        <span className="lw-status-label">{t("settings.panel.statusBar.opacityLabel")}</span>
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
            aria-label={t("settings.panel.statusBar.opacityAriaLabel")}
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
        <span className="lw-status-value" style={{ minWidth: 38, textAlign: 'end' }}>{pct}%</span>
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
