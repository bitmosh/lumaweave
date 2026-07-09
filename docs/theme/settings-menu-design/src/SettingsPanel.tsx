// SPDX-License-Identifier: Apache-2.0
/* IIFE-WRAPPED */
(() => {
/**
 * SettingsPanel.tsx
 *
 * The floating-tile shell: title bar, drag + resize wiring, minimize/close
 * buttons, dock affordances, and slot for the body (sidebar + content +
 * status bar).
 *
 * In the production codebase this component registers with
 * tileSectionRegistry (v86c) and receives position/dock state from the tile
 * system. In this prototype we self-manage state in useState + refs so the
 * drag/resize/minimize/dock behaviors can be demonstrated.
 */

type PanelPosition = 'floating' | 'docked-left' | 'docked-right' | 'minimized';

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  /** Initial geometry override. */
  initialRect?: { left: number; top: number; width: number; height: number };
  /** Reports panel position changes to the parent (for status bar mirror). */
  onPositionChange?: (p: PanelPosition) => void;
  /** Reports the opacity slider value to the parent (so the host can persist it). */
  opacity: number;
  /** Slot: header content (search bar) */
  headerSlot?: React.ReactNode;
  /** Slot: sidebar */
  sidebarSlot: React.ReactNode;
  /** Slot: main content */
  contentSlot: React.ReactNode;
  /** Slot: status bar (lives between body and panel bottom edge) */
  statusBarSlot: React.ReactNode;
  /** Subtitle in the title bar (rendered in monospace muted) */
  subtitle?: string;
}

const DEFAULT_RECT = { left: 140, top: 90, width: 1180, height: 740 };
const STORE_KEY = 'lw.settings.panel.geometry.v1';

function readRect(): { left: number; top: number; width: number; height: number } | null {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); } catch { return null; }
}
function writeRect(r: any) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(r)); } catch { /* swallow */ }
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  open, onClose, title = 'Settings', subtitle,
  initialRect, onPositionChange,
  headerSlot, sidebarSlot, contentSlot, statusBarSlot,
}) => {
  const panelRef = React.useRef<HTMLDivElement>(null);
  const [rect, setRect] = React.useState(() => readRect() ?? initialRect ?? DEFAULT_RECT);
  const [position, setPosition] = React.useState<PanelPosition>('floating');
  const [dragHint, setDragHint] = React.useState<'left' | 'right' | null>(null);
  const [minimized, setMinimized] = React.useState(false);

  React.useEffect(() => {
    onPositionChange?.(minimized ? 'minimized' : position);
  }, [position, minimized, onPositionChange]);

  React.useEffect(() => { writeRect(rect); }, [rect]);

  // ─── Drag (title bar) ──────────────────────────────────────────────────
  const startDrag = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return; // don't drag from buttons
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startLeft = rect.left;
    const startTop = rect.top;
    const VW = window.innerWidth;

    const move = (ev: MouseEvent) => {
      const nx = startLeft + (ev.clientX - startX);
      const ny = startTop + (ev.clientY - startY);
      // Hint dock zones near the edges.
      if (ev.clientX < 24) setDragHint('left');
      else if (ev.clientX > VW - 24) setDragHint('right');
      else setDragHint(null);
      setRect((r) => ({ ...r, left: nx, top: ny }));
      // Undocking — leaving a docked state by dragging back
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
        let next = { ...r };
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

  // ─── Keyboard: Esc to close ────────────────────────────────────────────
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const target = e.target as HTMLElement;
        // Only close on bare Esc — let inputs handle their own clear behavior.
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
      {/* Dock hint overlays — appear at left/right viewport edge during drag */}
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
          } as any}
        />
      )}

      <div
        ref={panelRef}
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
          {/* Title bar */}
          <div className="lw-titlebar" onMouseDown={startDrag}>
            <span className="lw-titlebar-grip">
              {Array.from({ length: 9 }).map((_, i) => <span key={i} />)}
            </span>
            <span className="lw-titlebar-title lw-text">{title}</span>
            {subtitle && <span className="lw-titlebar-meta lw-text">· {subtitle}</span>}
            <span className="lw-titlebar-spacer" />

            {/* Dock-left / dock-right affordances */}
            <button
              type="button"
              className="lw-titlebar-btn"
              aria-label="Dock left"
              title="Dock to left bank"
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
              className="lw-titlebar-btn"
              aria-label="Dock right"
              title="Dock to right bank"
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
              aria-label="Float (undock)"
              title="Float"
              onClick={() => {
                setPosition('floating');
                const r = readRect() ?? DEFAULT_RECT;
                setRect({ left: 160, top: 90, width: Math.max(r.width, 1100), height: Math.max(r.height, 700) });
              }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.2">
                <rect x="2" y="2" width="9" height="9" rx="1" />
              </svg>
            </button>

            <button
              type="button"
              className="lw-titlebar-btn"
              aria-label="Minimize"
              title="Minimize"
              onClick={() => setMinimized((m) => !m)}
            >
              <svg width="11" height="11" viewBox="0 0 11 11" stroke="currentColor" strokeWidth="1.4">
                <line x1="2" y1="6" x2="9" y2="6" />
              </svg>
            </button>
            <button type="button" className="lw-titlebar-btn is-close" aria-label="Close" title="Close · esc" onClick={onClose}>
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
                {(position === 'docked-left' || position === 'docked-right') ? (
                  <>
                    {/* Docked → no sidebar labels (handled via prop) */}
                    {sidebarSlot}
                    {contentSlot}
                  </>
                ) : (
                  <>
                    {sidebarSlot}
                    {contentSlot}
                  </>
                )}
              </div>
              {statusBarSlot}
            </>
          )}

          {/* Resize handles */}
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
};

(window as any).LW_SettingsPanel = SettingsPanel;

})();
