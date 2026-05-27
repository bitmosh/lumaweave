import React from 'react';
import type { SettingsPanelProps, PanelPosition } from './settingsPanel.types';
import { t } from '../../i18n';
import './SettingsPanel.css';

function getDefaultRect() {
  const w = Math.min(1180, window.innerWidth - 160);
  const h = Math.min(740, window.innerHeight - 160);
  return {
    left: Math.max(0, (window.innerWidth - w) / 2),
    top: Math.max(0, (window.innerHeight - h) / 2),
    width: w,
    height: h,
  };
}
const STORE_KEY = 'lw.settings.panel.geometry.v1';

function readRect(): { left: number; top: number; width: number; height: number } | null {
  try {
    const stored = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    if (!stored) return null;
    // Sanity check: require AT LEAST 200px of titlebar horizontally visible and
    // top within viewport, otherwise fall back to default (recenter).
    const visibleWidth = Math.min(window.innerWidth, stored.left + stored.width) - Math.max(0, stored.left);
    if (visibleWidth < 200 || stored.top < 0 || stored.top > window.innerHeight - 50) {
      return null;
    }
    return stored;
  } catch {
    return null;
  }
}

export function SettingsPanel({
  open, onClose, title = 'Settings', subtitle,
  initialRect, onPositionChange,
  opacity: _opacity,
  headerSlot, sidebarSlot, contentSlot, statusBarSlot,
}: SettingsPanelProps) {
  const panelRef = React.useRef<HTMLDivElement>(null);
  const [rect, setRect] = React.useState(() => readRect() ?? initialRect ?? getDefaultRect());
  const [position, setPosition] = React.useState<PanelPosition>('floating');
  const [dragHint, setDragHint] = React.useState<'left' | 'right' | null>(null);
  const [minimized, setMinimized] = React.useState(false);

  React.useEffect(() => {
    onPositionChange?.(minimized ? 'minimized' : position);
  }, [position, minimized, onPositionChange]);

  React.useEffect(() => {
    const t = setTimeout(() => {
      try { localStorage.setItem(STORE_KEY, JSON.stringify(rect)); } catch {}
    }, 150);
    return () => clearTimeout(t);
  }, [rect]);

  // ─── Drag (title bar) ──────────────────────────────────────────────────
  const startDrag = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startLeft = rect.left;
    const startTop = rect.top;
    const VW = window.innerWidth;

    const move = (ev: MouseEvent) => {
      const nx = startLeft + (ev.clientX - startX);
      const ny = startTop + (ev.clientY - startY);
      if (ev.clientX < 24) setDragHint('left');
      else if (ev.clientX > VW - 24) setDragHint('right');
      else setDragHint(null);
      setRect((r) => ({
        ...r,
        left: Math.max(0, Math.min(nx, window.innerWidth - r.width)),
        top: Math.max(0, Math.min(ny, window.innerHeight - 50)),
      }));
      if (position !== 'floating' && Math.abs(ev.clientX - startX) > 40) {
        setPosition('floating');
      }
    };
    const up = (ev: MouseEvent) => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      if (ev.clientX < 24) {
        setPosition('docked-left');
        setRect({ left: 0, top: 64, width: 380, height: window.innerHeight - 80 });
      } else if (ev.clientX > VW - 24) {
        setPosition('docked-right');
        setRect({ left: VW - 380, top: 64, width: 380, height: window.innerHeight - 80 });
      }
      setDragHint(null);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  // ─── Resize ────────────────────────────────────────────────────────────
  const startResize = (corner: 'e' | 's' | 'se' | 'sw') => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX, startY = e.clientY;
    const r0 = rect;
    const move = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      setRect((r) => {
        const next = { ...r };
        if (corner.includes('e')) next.width = Math.max(720, r0.width + dx);
        if (corner.includes('s')) next.height = Math.max(480, r0.height + dy);
        if (corner === 'sw') {
          next.width = Math.max(720, r0.width - dx);
          next.left = r0.left + dx;
          next.height = Math.max(480, r0.height + dy);
        }
        return next;
      });
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  // Clamp panel back into viewport on browser resize.
// Doesn't recenter — just nudges any out-of-bounds edges back in.
React.useEffect(() => {
  if (!open) return;
  const handleResize = () => {
    setRect((r) => {
      const maxLeft = window.innerWidth - 200;   // keep 200px of titlebar visible
      const maxTop = window.innerHeight - 50;    // keep titlebar reachable
      const maxWidth = window.innerWidth - 40;   // 20px breathing room
      const maxHeight = window.innerHeight - 40;
      return {
        left: Math.max(0, Math.min(r.left, maxLeft)),
        top: Math.max(0, Math.min(r.top, maxTop)),
        width: Math.min(r.width, maxWidth),
        height: Math.min(r.height, maxHeight),
      };
    });
  };
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, [open]);

  // ─── Keyboard: Esc to close ────────────────────────────────────────────
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const target = e.target as HTMLElement;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {dragHint && (
        <div
          style={{
            position: 'fixed', top: 64, bottom: 0,
            [dragHint === 'left' ? 'left' : 'right']: 0,
            width: 380,
            background: 'color-mix(in oklab, var(--lw-accent) 14%, transparent)',
            border: '1px dashed var(--lw-accent)',
            borderTop: 'none',
            borderBottom: 'none',
            zIndex: 49,
            pointerEvents: 'none',
          } as React.CSSProperties}
        />
      )}

      <div
        ref={panelRef}
        data-testid="settings-panel-root"
        data-lw-theme-target="settings.panel"
        className={'lw-settings-panel' + (minimized ? ' is-minimized' : '')}
        role="dialog"
        aria-label="Settings"
        style={{
          left: rect.left, top: rect.top,
          width: rect.width,
          height: minimized ? undefined : rect.height,
        }}
      >
        <div className="lw-settings-panel-bg" />
        <div className="lw-settings-panel-chrome">

          <div
            data-testid="settings-panel-titlebar"
            className="lw-titlebar"
            onMouseDown={startDrag}
          >
            <span className="lw-titlebar-title lw-text">{title}</span>
            {subtitle && <span className="lw-titlebar-meta lw-text">· {subtitle}</span>}
            <span className="lw-titlebar-spacer" />

            <button
              type="button"
              data-testid="settings-panel-dock-left"
              className="lw-titlebar-btn"
              aria-label={t("settings.panel.buttons.dockLeft")}
              title={t("settings.panel.buttons.dockLeftTitle")}
              onClick={() => {
                setPosition('docked-left');
                setRect({ left: 0, top: 64, width: 380, height: window.innerHeight - 80 });
              }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.2">
                <rect x="1" y="1" width="11" height="11" rx="1" />
                <rect x="1" y="1" width="4" height="11" fill="currentColor" />
              </svg>
            </button>
            <button
              type="button"
              data-testid="settings-panel-dock-right"
              className="lw-titlebar-btn"
              aria-label={t("settings.panel.buttons.dockRight")}
              title={t("settings.panel.buttons.dockRightTitle")}
              onClick={() => {
                setPosition('docked-right');
                setRect({ left: window.innerWidth - 380, top: 64, width: 380, height: window.innerHeight - 80 });
              }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.2">
                <rect x="1" y="1" width="11" height="11" rx="1" />
                <rect x="8" y="1" width="4" height="11" fill="currentColor" />
              </svg>
            </button>
            <button
              type="button"
              className="lw-titlebar-btn"
              aria-label={t("settings.panel.buttons.float")}
              title={t("settings.panel.buttons.float")}
              onClick={() => {
                setPosition('floating');
                const r = readRect() ?? getDefaultRect();
                setRect({ left: 160, top: 90, width: Math.max(r.width, 1100), height: Math.max(r.height, 700) });
              }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.2">
                <rect x="2" y="2" width="9" height="9" rx="1" />
              </svg>
            </button>

            <button
              type="button"
              data-testid="settings-panel-minimize"
              className="lw-titlebar-btn"
              aria-label={t("settings.panel.buttons.minimize")}
              title={t("settings.panel.buttons.minimize")}
              onClick={() => setMinimized((m) => !m)}
            >
              <svg width="11" height="11" viewBox="0 0 11 11" stroke="currentColor" strokeWidth="1.4">
                <line x1="2" y1="6" x2="9" y2="6" />
              </svg>
            </button>
            <button
              type="button"
              data-testid="settings-panel-close"
              className="lw-titlebar-btn is-close"
              aria-label={t("settings.panel.buttons.close")}
              title={t("settings.panel.buttons.closeTitle")}
              onClick={onClose}
            >
              <svg width="11" height="11" viewBox="0 0 11 11" stroke="currentColor" strokeWidth="1.4">
                <line x1="2" y1="2" x2="9" y2="9" />
                <line x1="9" y1="2" x2="2" y2="9" />
              </svg>
            </button>
          </div>

          {!minimized && (
            <>
              {headerSlot}
              <div className="lw-body">
                {sidebarSlot}
                {contentSlot}
              </div>
              {statusBarSlot}
            </>
          )}

          {!minimized && position === 'floating' && (
            <>
              <div className="lw-resize lw-resize-e"  onMouseDown={startResize('e')}  />
              <div className="lw-resize lw-resize-s"  onMouseDown={startResize('s')}  />
              <div className="lw-resize lw-resize-se" onMouseDown={startResize('se')} />
              <div className="lw-resize lw-resize-sw" onMouseDown={startResize('sw')} />
            </>
          )}
        </div>
      </div>
    </>
  );
}
