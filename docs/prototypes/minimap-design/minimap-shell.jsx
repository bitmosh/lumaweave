// minimap-shell.jsx
// → MinimapShell.tsx in real app
//
// Owns: positioning, drag-start, resize-start, clamping, flip-direction
// computation, glass panel chrome. Provides drag/resize/flipped to
// children via context so MinimapHeader can be the drag handle and
// MinimapResizeGrip can be the resize handle without prop-drilling.
//
// CRITICAL: the panel root has NO drag handler — drag is initiated
// from MinimapHeader only. This matches user expectation that clicks
// inside the snapshot pan the main camera, not move the panel.
//
// Drag/resize idioms lifted from FloatingTile.tsx:
//   - window-level mousemove/mouseup
//   - 16px snap on resize, pixel-precise on drag
//   - 200×120 minimum, 520×360 maximum
//   - clamp to viewport with 8px margin, 40px bottom for status bar
//
// Collapse flip: if the panel's bottom edge sits in the bottom quarter
// of the viewport, the panel renders flipped (header at bottom, footer
// at top). Toggling collapse adjusts position.y to keep the header at
// the same on-screen Y — same trick FloatingTile uses for its flip.

const MIN_W = 200;
const MIN_H = 120;
const MAX_W = 520;
const MAX_H = 360;
const COLLAPSED_H = 30;
const SNAP_GRID = 16;
const EDGE_MARGIN = 8;
const STATUS_BAR_MARGIN = 40;
const TOP_MARGIN = 68; // leaves room for topbar

const snap = (v) => Math.round(v / SNAP_GRID) * SNAP_GRID;

// Compute initial position from a TileAnchor. Reused by Minimap.snap().
function positionFromAnchor(anchor, size) {
  if (!anchor || anchor.edge === 'free') {
    return {
      x: anchor?.x ?? window.innerWidth - size.width - 18,
      y: anchor?.y ?? window.innerHeight - size.height - STATUS_BAR_MARGIN - 18,
    };
  }
  const offset = anchor.offset ?? 18;
  switch (anchor.edge) {
    case 'right':  return { x: window.innerWidth - size.width - offset, y: window.innerHeight - size.height - STATUS_BAR_MARGIN - offset };
    case 'left':   return { x: offset, y: window.innerHeight - size.height - STATUS_BAR_MARGIN - offset };
    case 'top':    return { x: window.innerWidth - size.width - 18, y: offset };
    case 'bottom': return { x: window.innerWidth - size.width - 18, y: window.innerHeight - size.height - STATUS_BAR_MARGIN - offset };
    default:       return { x: 18, y: 18 };
  }
}

// flip rule: bottom edge of panel is in the bottom quarter of viewport.
function shouldFlip(position, size, collapsed, viewportH) {
  const h = collapsed ? COLLAPSED_H : size.height;
  return position.y + h > viewportH * 0.75;
}

// Collapse toggle that preserves the on-screen Y of the header.
function toggleCollapsed(settings, setSetting, flipped) {
  if (settings.collapsed) {
    // Expanding
    if (flipped) {
      const newY = Math.max(
        TOP_MARGIN,
        settings.position.y - (settings.size.height - COLLAPSED_H)
      );
      setSetting({
        collapsed: false,
        position: { x: settings.position.x, y: newY },
      });
    } else {
      setSetting('collapsed', false);
    }
  } else {
    // Collapsing
    if (flipped) {
      const newY = settings.position.y + settings.size.height - COLLAPSED_H;
      setSetting({
        collapsed: true,
        position: { x: settings.position.x, y: newY },
      });
    } else {
      setSetting('collapsed', true);
    }
  }
}

// ──────────────────────────────────────────────────────────
// ShellContext — what children inside MinimapShell can pull.
// ──────────────────────────────────────────────────────────
const ShellContext = React.createContext({
  startDrag: () => {},
  startResize: () => {},
  flipped: false,
  collapsed: false,
});
function useShellContext() { return React.useContext(ShellContext); }

// ──────────────────────────────────────────────────────────
function MinimapShell({ status, children }) {
  const settings = useMinimapSettings();
  const setSetting = useSetMinimapSetting();

  // Track viewport height for flip decisions.
  const [vh, setVh] = React.useState(() => window.innerHeight);
  React.useEffect(() => {
    const onResize = () => setVh(window.innerHeight);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // First mount: hydrate position from anchor.
  React.useEffect(() => {
    if (settings.position.x === 0 && settings.position.y === 0) {
      setSetting('position', positionFromAnchor(settings.anchor, settings.size));
    }
  }, []);

  // Clamp on viewport resize.
  React.useEffect(() => {
    const onResize = () => {
      const h = settings.collapsed ? COLLAPSED_H : settings.size.height;
      const x = Math.max(EDGE_MARGIN, Math.min(window.innerWidth - settings.size.width - EDGE_MARGIN, settings.position.x));
      const y = Math.max(TOP_MARGIN, Math.min(window.innerHeight - h - STATUS_BAR_MARGIN, settings.position.y));
      if (x !== settings.position.x || y !== settings.position.y) {
        setSetting('position', { x, y });
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [settings.position, settings.size, settings.collapsed]);

  const flipped = shouldFlip(settings.position, settings.size, settings.collapsed, vh);

  // ─── startDrag (consumed by MinimapHeader) ──────────────
  const startDrag = (e) => {
    // Header buttons stopPropagation themselves; this is just a safety.
    if (e.target.closest && (
      e.target.closest('[data-testid="minimap-snap"]') ||
      e.target.closest('[data-testid="minimap-collapse"]') ||
      e.target.closest('[data-testid="minimap-close"]')
    )) return;
    e.preventDefault();
    setStatus('drag');
    const startX = e.clientX;
    const startY = e.clientY;
    const startPos = settings.position;
    const h = settings.collapsed ? COLLAPSED_H : settings.size.height;

    const onMove = (ev) => {
      let nx = startPos.x + (ev.clientX - startX);
      let ny = startPos.y + (ev.clientY - startY);
      nx = Math.max(EDGE_MARGIN, Math.min(window.innerWidth - settings.size.width - EDGE_MARGIN, nx));
      ny = Math.max(TOP_MARGIN, Math.min(window.innerHeight - h - STATUS_BAR_MARGIN, ny));
      setSetting('position', { x: nx, y: ny });
    };
    const onUp = () => {
      setStatus('idle');
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // ─── startResize (consumed by MinimapResizeGrip) ────────
  const startResize = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (settings.collapsed) return;
    setStatus('resize');
    const startX = e.clientX;
    const startY = e.clientY;
    const startSize = settings.size;

    const onMove = (ev) => {
      const w = Math.max(MIN_W, Math.min(MAX_W, snap(startSize.width + (ev.clientX - startX))));
      const h = Math.max(MIN_H, Math.min(MAX_H, snap(startSize.height + (ev.clientY - startY))));
      setSetting('size', { width: w, height: h });
    };
    const onUp = () => {
      setStatus('idle');
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const [interactionStatus, setStatus] = React.useState('idle');
  const effectiveStatus = interactionStatus !== 'idle' ? interactionStatus : status;
  const isActive = effectiveStatus === 'drag' || effectiveStatus === 'resize';

  const h = settings.collapsed ? COLLAPSED_H : settings.size.height;

  // OKLCH-native styling — uses relative color syntax (oklch(from … l c h / α))
  // to derive alpha variants from the source CSS vars cleanly. CSS Color 5,
  // supported in Chromium 119+ which covers Tauri / Electron.
  const borderColor = isActive
    ? 'oklch(from var(--lw-accent) l c h / 0.95)'
    : 'var(--lw-panel-border)';

  const glow = isActive
    ? [
        'inset 0 0 0 1px oklch(from var(--lw-accent) l c h / 0.30)',
        '0 0 34px oklch(from var(--lw-accent) l c h / 0.32)',
        '0 22px 60px rgba(0, 0, 0, 0.55)',
      ].join(', ')
    : [
        'inset 0 0 0 1px oklch(from var(--lw-panel-border) l c h / 0.18)',
        '0 0 22px oklch(from var(--lw-accent) l c h / 0.20)',
        '0 14px 40px rgba(0, 0, 0, 0.45)',
      ].join(', ');

  const bg = [
    'radial-gradient(60% 60% at 18% 20%, oklch(from var(--lw-accent) l c h / 0.18), transparent 55%)',
    'radial-gradient(60% 60% at 82% 80%, oklch(from var(--lw-accent) l c h / 0.18), transparent 65%)',
    'var(--lw-panel-background)',
  ].join(', ');

  return (
    <ShellContext.Provider value={{ startDrag, startResize, flipped, collapsed: settings.collapsed }}>
      <div
        data-testid="minimap-panel"
        data-lw-theme-target="minimap.root"
        data-active={isActive}
        data-collapsed={settings.collapsed}
        data-flipped={flipped}
        style={{
          position: 'fixed',
          left: settings.position.x,
          top: settings.position.y,
          width: settings.size.width,
          height: h,
          borderRadius: 14,
          border: `1px solid ${borderColor}`,
          background: bg,
          backdropFilter: 'blur(var(--lw-panel-blur, 14px)) saturate(1.3)',
          WebkitBackdropFilter: 'blur(var(--lw-panel-blur, 14px)) saturate(1.3)',
          boxShadow: glow,
          overflow: 'hidden',
          userSelect: 'none',
          opacity: settings.opacity,
          transition: 'box-shadow 160ms ease, border-color 160ms ease, opacity 120ms ease',
          cursor: interactionStatus === 'drag' ? 'grabbing' : undefined,
          zIndex: 80,
          boxSizing: 'border-box',
        }}
      >
        {/* sheen */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background:
              'linear-gradient(115deg, rgba(255,255,255,0.07), transparent 30%, transparent 75%, rgba(255,255,255,0.03))',
          }}
        />
        {children}
      </div>
    </ShellContext.Provider>
  );
}

Object.assign(window, {
  MinimapShell,
  useShellContext,
  toggleCollapsed,
  positionFromAnchor,
  shouldFlip,
  MIN_W, MIN_H, MAX_W, MAX_H, COLLAPSED_H,
});
