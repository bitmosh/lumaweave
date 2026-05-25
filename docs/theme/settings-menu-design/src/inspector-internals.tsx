/* IIFE-WRAPPED */
(() => {
/**
 * inspector-internals.tsx
 *
 * Two non-trivial subcomponents for the Inspector category:
 *
 *   1. <InspectorPreview /> — live demo of the radial inspector. Reads its
 *      spoke list from window.LW_SETTINGS_DATA.INSPECTOR_SPOKE_REGISTRY so
 *      it cannot diverge from the production radial. Idle ring rotates
 *      slowly clockwise (~30s/rev); pauses while a sub-menu is open;
 *      respects the Effects ↔ Reduce-Motion OR-gate.
 *
 *   2. <HotkeyRebindRow /> — read-only display of the current binding +
 *      a "Change" affordance that drops the row into capture mode. Writes
 *      through the (mocked) hotkey registry and surfaces collisions inline.
 *
 *  Both consume registries via window globals (set in settings-data.ts) so
 *  Bandit can swap them for live store reads without touching this file.
 */

const D = (window as any).LW_SETTINGS_DATA;
const { formatBinding, findCollision } = D;

/* ─── 1. InspectorPreview ──────────────────────────────────────────────── */

interface InspectorPreviewProps {
  /** Display the active hotkey at the bottom of the preview. */
  activationHotkey: string;
  /** OR-gate: animations run when effects && !reduceMotion. */
  animationsActive: boolean;
}

interface SpokeStubProps { spoke: any }
const SpokeStub: React.FC<SpokeStubProps> = ({ spoke }) => {
  switch (spoke.stub) {
    case 'swatches':
      return (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['#ff8a5b','#ff52a8','#b56cff','#ffc857','#5cd6ff','#5cffae','#fde3d0','#7d96ad'].map((c) => (
            <span key={c} style={{ width: 22, height: 22, borderRadius: 5, background: c, boxShadow: '0 0 0 1px rgba(255,255,255,0.06)' }} />
          ))}
        </div>
      );
    case 'geometry-presets':
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
          {['M3 18l9-15 9 15z', 'M4 4h16v16H4z', 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18z'].map((d, i) => (
            <div key={i} style={{ height: 38, display: 'grid', placeItems: 'center', border: '1px solid var(--lw-panel-border-current, var(--lw-panel-border))', borderRadius: 5, background: 'color-mix(in oklab, var(--lw-app-bg) 30%, transparent)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--lw-accent)" strokeWidth="1.6" strokeLinejoin="round"><path d={d} /></svg>
            </div>
          ))}
        </div>
      );
    case 'type-axes':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {['wght 400 → 700','wdth 80 → 120'].map((t) => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: 'var(--lw-text-muted)' }}>
              <span style={{ minWidth: 90 }}>{t}</span>
              <div style={{ height: 3, flex: 1, background: 'var(--lw-panel-border-current, var(--lw-panel-border))', borderRadius: 2, position: 'relative' }}>
                <div style={{ position: 'absolute', left: '60%', top: -2, width: 7, height: 7, borderRadius: '50%', background: 'var(--lw-accent)' }} />
              </div>
            </div>
          ))}
        </div>
      );
    case 'motion-curves':
      return (
        <div style={{ display: 'flex', gap: 6 }}>
          {['ease-in','ease-out','spring'].map((k, i) => (
            <div key={k} style={{ flex: 1, border: '1px solid var(--lw-panel-border-current, var(--lw-panel-border))', borderRadius: 5, padding: 4 }}>
              <svg width="100%" height="22" viewBox="0 0 40 22" fill="none" stroke="var(--lw-accent)" strokeWidth="1.4" strokeLinecap="round">
                <path d={i === 0 ? 'M2 20 C 14 20 26 4 38 2' : i === 1 ? 'M2 20 C 14 4 26 2 38 2' : 'M2 11 C 10 -4 22 26 38 8'} />
              </svg>
              <div style={{ fontSize: 9, color: 'var(--lw-text-muted)', textAlign: 'center', marginTop: 2 }}>{k}</div>
            </div>
          ))}
        </div>
      );
    case 'layout-toggles':
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
          {['stack', 'grid', 'flow'].map((k) => (
            <span key={k} style={{ padding: '4px 6px', fontSize: 10, fontFamily: 'IBM Plex Mono, monospace', textAlign: 'center', border: '1px solid var(--lw-panel-border-current, var(--lw-panel-border))', borderRadius: 4, color: 'var(--lw-text-muted)' }}>{k}</span>
          ))}
        </div>
      );
    case 'code-snippet':
      return (
        <pre style={{ margin: 0, fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: 'var(--lw-text-primary)', background: 'color-mix(in oklab, var(--lw-app-bg) 60%, transparent)', padding: 8, borderRadius: 4, lineHeight: 1.5 }}>
{`function applyTheme(id) {
  const t = themePresets[id];
  themeStore.set(t);
}`}
        </pre>
      );
    case 'apply-scopes':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {['this target','target-kind: alert','cluster: control-plane','global'].map((s, i) => (
            <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10.5, fontFamily: 'IBM Plex Mono, monospace', color: i === 0 ? 'var(--lw-accent)' : 'var(--lw-text-muted)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', border: '1px solid currentColor', background: i === 0 ? 'currentColor' : 'transparent' }} />
              {s}
            </span>
          ))}
        </div>
      );
    case 'ide-targets':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontFamily: 'IBM Plex Mono, monospace', fontSize: 10 }}>
          {['VS Code','Cursor','Zed','WebStorm'].map((s) => (
            <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--lw-text-muted)' }}>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--lw-accent)' }} />
              {s}
            </span>
          ))}
        </div>
      );
    case 'history-list':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, fontFamily: 'IBM Plex Mono, monospace', fontSize: 9.5, color: 'var(--lw-text-muted)' }}>
          {['node.color → #ff52a8',
            'edge.opacity → 0.70',
            'theme → Solar Plasma'].map((s, i) => (
            <span key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s}</span>
              <span>{i + 2}m ago</span>
            </span>
          ))}
        </div>
      );
    default:
      return <div style={{ fontSize: 10, color: 'var(--lw-text-muted)' }}>—</div>;
  }
};

const SpokeIcon: React.FC<{ spoke: any; size?: number }> = ({ spoke, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"
    fill={spoke.iconFill ? 'currentColor' : 'none'}
    stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d={spoke.iconPath} />
  </svg>
);

const InspectorPreview: React.FC<InspectorPreviewProps> = ({ activationHotkey, animationsActive }) => {
  const spokes = (D.INSPECTOR_SPOKE_REGISTRY as any[]).slice().sort((a, b) => a.order - b.order);
  const [activeSpokeId, setActiveSpokeId] = React.useState<string | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Spoke geometry — centred in a 360x360 stage.
  const STAGE = 380;
  const CENTER = STAGE / 2;
  const RING_R = 140;       // distance from center to spoke button center
  const RING_BTN = 70;      // diameter of a spoke button
  const angleFor = (order: number) => (order / spokes.length) * 360 - 90; // 0=top

  // Close on Escape.
  React.useEffect(() => {
    if (!activeSpokeId) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setActiveSpokeId(null); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeSpokeId]);

  // Close when clicking the stage background (but not the sub-menu or the
  // spoke buttons themselves — those handle their own logic).
  const handleStageClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.lw-radial-spoke') || target.closest('.lw-radial-submenu')) return;
    if (activeSpokeId) setActiveSpokeId(null);
  };

  const activeSpoke = activeSpokeId ? spokes.find((s) => s.id === activeSpokeId) : null;
  // Ring rotates when animations are active AND no sub-menu open.
  const ringSpinning = animationsActive && !activeSpoke;

  return (
    <div className="lw-radial-frame" ref={containerRef} onClick={handleStageClick}>
      <div className="lw-radial-stage" style={{ width: STAGE, height: STAGE }}>
        {/* Dashed concentric rings + crosshairs (the center decoration). */}
        <svg
          className={'lw-radial-rings' + (ringSpinning ? ' is-spinning' : '')}
          width={STAGE} height={STAGE} viewBox={`0 0 ${STAGE} ${STAGE}`}
        >
          <g stroke="var(--lw-accent)" strokeWidth="1" fill="none">
            <circle cx={CENTER} cy={CENTER} r={RING_R}     strokeDasharray="3 6" opacity="0.55" />
            <circle cx={CENTER} cy={CENTER} r={RING_R - 8} strokeDasharray="2 8" opacity="0.35" />
            {/* crosshair extensions outside the center node */}
            {[0, 90, 180, 270].map((deg) => {
              const a = deg * Math.PI / 180;
              const r1 = 30, r2 = 50;
              const x1 = CENTER + r1 * Math.cos(a), y1 = CENTER + r1 * Math.sin(a);
              const x2 = CENTER + r2 * Math.cos(a), y2 = CENTER + r2 * Math.sin(a);
              return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} strokeDasharray="2 3" opacity="0.55" />;
            })}
          </g>
        </svg>

        {/* Center node — close affordance when a sub-menu is open. */}
        <button
          type="button"
          className={'lw-radial-center' + (activeSpoke ? ' is-active' : '')}
          aria-label={activeSpoke ? 'Close' : 'Inspector ready'}
          title={activeSpoke ? 'Close' : 'Click any spoke'}
          onClick={() => activeSpoke && setActiveSpokeId(null)}
          style={{ left: CENTER, top: CENTER }}
        >
          {activeSpoke ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="4" y1="4" x2="12" y2="12" />
              <line x1="12" y1="4" x2="4" y2="12" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8" cy="8" r="2.4" fill="currentColor" />
            </svg>
          )}
        </button>

        {/* Spoke buttons. */}
        {spokes.map((s) => {
          const isOpen = s.id === activeSpokeId;
          const isDim = !!activeSpoke && !isOpen;
          const a = angleFor(s.order) * Math.PI / 180;
          const x = CENTER + RING_R * Math.cos(a);
          const y = CENTER + RING_R * Math.sin(a);
          return (
            <button
              type="button"
              key={s.id}
              className={'lw-radial-spoke'
                + (isOpen ? ' is-open' : '')
                + (isDim ? ' is-dim' : '')
                + (s.status === 'beta' ? ' is-beta' : '')}
              style={{
                left: x,
                top: y,
                width: RING_BTN,
                height: RING_BTN,
              }}
              onClick={() => setActiveSpokeId(isOpen ? null : s.id)}
              title={s.label + (s.status === 'beta' ? ' · beta' : '')}
            >
              <SpokeIcon spoke={s} />
              <span className="lw-radial-spoke-label">{s.label}</span>
              {s.status === 'beta' && <span className="lw-radial-spoke-tag">β</span>}
            </button>
          );
        })}

        {/* Sub-menu — positioned outside the spoke that opened it. */}
        {activeSpoke && (() => {
          const a = angleFor(activeSpoke.order) * Math.PI / 180;
          const SUB_OFFSET = 56;  // distance from spoke center to sub-menu near-edge
          const px = CENTER + (RING_R + SUB_OFFSET) * Math.cos(a);
          const py = CENTER + (RING_R + SUB_OFFSET) * Math.sin(a);
          // Align the sub-menu edge that's NEAREST the spoke. e.g. if the
          // spoke is on the right side, the sub-menu's LEFT edge is at the
          // anchor. We compute transformOrigin to make this read naturally.
          const cos = Math.cos(a), sin = Math.sin(a);
          // Translate so the sub-menu's relevant edge meets the anchor.
          const txPct = -50 + cos * 50;
          const tyPct = -50 + sin * 50;
          return (
            <div
              className={'lw-radial-submenu' + (animationsActive ? '' : ' is-instant')}
              style={{
                left: px,
                top: py,
                transform: `translate(${txPct}%, ${tyPct}%)`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="lw-radial-submenu-head">
                <SpokeIcon spoke={activeSpoke} size={13} />
                <span>{activeSpoke.label}</span>
                <span style={{ flex: 1 }} />
                <span className="lw-radial-submenu-stub-id">{activeSpoke.stub}</span>
              </div>
              <div className="lw-radial-submenu-body">
                <SpokeStub spoke={activeSpoke} />
              </div>
            </div>
          );
        })()}
      </div>

      {/* Hotkey overlay */}
      <div className="lw-radial-hotkey">
        <span style={{ color: 'var(--lw-text-muted)' }}>activation</span>
        <span style={{ color: 'var(--lw-text-primary)' }}>{activationHotkey}</span>
        {!animationsActive && (
          <span style={{ marginLeft: 'auto', color: 'var(--lw-color-gold-500)' }}>
            motion paused · effects or reduce-motion off
          </span>
        )}
      </div>

      <p className="lw-radial-caption">
        Click any spoke to see what it exposes. Click the center, hit Escape, or click the
        backdrop to close. Spokes read from <code>inspectorSpokeRegistry</code>; new spokes
        appear here automatically.
      </p>
    </div>
  );
};

/* ─── 2. HotkeyRebindRow ───────────────────────────────────────────────── */

type Binding = { modifiers: Array<'Ctrl'|'Alt'|'Shift'|'Meta'>; key: string | null; onClick?: boolean };

interface HotkeyRebindRowProps {
  /** Current binding shown in read mode. */
  binding: Binding;
  /** Registry id we're rebinding — used to ignore self-collisions. */
  registryId: string;
  /** Persist a new binding. */
  onChange: (b: Binding) => void;
  isSearchMatch?: boolean;
}

const HotkeyRebindRow: React.FC<HotkeyRebindRowProps> = ({ binding, registryId, onChange, isSearchMatch }) => {
  const [mode, setMode] = React.useState<'read' | 'capturing' | 'captured'>('read');
  const [captured, setCaptured] = React.useState<Binding | null>(null);
  const timeoutRef = React.useRef<number | null>(null);

  const cancel = React.useCallback(() => {
    setMode('read');
    setCaptured(null);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
  }, []);

  const startCapture = () => {
    setMode('capturing');
    setCaptured(null);
    // 5-second silent timeout.
    timeoutRef.current = window.setTimeout(() => {
      if (mode === 'capturing') cancel();
    }, 5000);
  };

  const save = () => {
    if (!captured) return;
    onChange(captured);
    setMode('read');
    setCaptured(null);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
  };

  // Capture key events while in capturing mode.
  React.useEffect(() => {
    if (mode !== 'capturing') return;
    const onKey = (e: KeyboardEvent) => {
      // Esc cancels.
      if (e.key === 'Escape') {
        e.preventDefault();
        cancel();
        return;
      }
      e.preventDefault();
      const mods: Array<'Ctrl'|'Alt'|'Shift'|'Meta'> = [];
      if (e.ctrlKey)  mods.push('Ctrl');
      if (e.altKey)   mods.push('Alt');
      if (e.shiftKey) mods.push('Shift');
      if (e.metaKey)  mods.push('Meta');
      // Modifier-only chord — user is holding mods without trailing key.
      const isModOnly = ['Control','Alt','Shift','Meta'].includes(e.key);
      const b: Binding = {
        modifiers: mods,
        key: isModOnly ? null : e.key.length === 1 ? e.key.toLowerCase() : e.key,
        onClick: isModOnly, // modifier-only chord can be "hold + click"
      };
      // Refresh the captured value as the user adjusts.
      setCaptured(b);
      // If we got a trailing key, commit to "captured" mode (not just preview).
      if (!isModOnly) setMode('captured');
    };
    const onKeyUp = (e: KeyboardEvent) => {
      // When the user releases keys while in "capturing" with a mod-only
      // binding, freeze that as captured (so they can save the hold chord).
      if (mode !== 'capturing') return;
      if (captured && captured.key == null && captured.modifiers.length > 0) {
        setMode('captured');
      }
    };
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('keyup', onKeyUp, true);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('keyup', onKeyUp, true);
    };
  }, [mode, captured, cancel]);

  // Reset the 5s timeout each time the captured value updates.
  React.useEffect(() => {
    if (mode === 'capturing' && captured) {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => cancel(), 5000);
    }
  }, [captured, mode, cancel]);

  const collision = (mode === 'captured' && captured) ? findCollision(captured, registryId) : null;
  const isModOnly = captured && captured.key == null;

  return (
    <div
      className={'lw-row is-block' + (isSearchMatch ? ' is-active-search-match' : '')}
      style={{ display: 'block' }}
    >
      <div className="lw-row-meta" style={{ marginBottom: 8 }}>
        <div className="lw-row-label">Radial activation hotkey</div>
        <div className="lw-row-desc">
          The combo that opens the radial inspector on a target. Modifier-only chords
          ("Alt + Shift + hold") work for click-to-activate. Validated against the
          hotkey registry — collisions surface inline.
        </div>
      </div>

      <div className="lw-hotkey-frame">
        {/* Current binding pill */}
        <div className="lw-hotkey-pill">
          <span className="lw-hotkey-pill-label">CURRENT</span>
          <code className="lw-hotkey-pill-value">{formatBinding(binding)}</code>
        </div>

        {/* Mode: read */}
        {mode === 'read' && (
          <button type="button" className="lw-btn" onClick={startCapture}>
            Change
          </button>
        )}

        {/* Mode: capturing (no captured value yet) */}
        {mode === 'capturing' && !captured && (
          <>
            <div className="lw-hotkey-pill is-capturing">
              <span className="lw-hotkey-pill-label">PRESS</span>
              <code className="lw-hotkey-pill-value">Press key combo…</code>
              <span className="lw-anim-pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--lw-accent)' }} />
            </div>
            <button type="button" className="lw-btn" onClick={cancel}>Cancel</button>
          </>
        )}

        {/* Mode: capturing with a live mod-only chord */}
        {mode === 'capturing' && captured && (
          <>
            <div className="lw-hotkey-pill is-capturing">
              <span className="lw-hotkey-pill-label">HOLDING</span>
              <code className="lw-hotkey-pill-value">{formatBinding(captured)}</code>
              <span className="lw-anim-pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--lw-accent)' }} />
            </div>
            <button type="button" className="lw-btn" onClick={cancel}>Cancel</button>
          </>
        )}

        {/* Mode: captured (valid combo, awaiting confirm) */}
        {mode === 'captured' && captured && (
          <>
            <div className="lw-hotkey-pill is-captured">
              <span className="lw-hotkey-pill-label">NEW</span>
              <code className="lw-hotkey-pill-value">{formatBinding(captured)}</code>
            </div>
            <button type="button" className="lw-btn" onClick={save} disabled={!!collision}>
              {collision ? 'Resolve collision…' : 'Save'}
            </button>
            <button type="button" className="lw-btn" onClick={cancel}>Cancel</button>
          </>
        )}
      </div>

      {/* Hint banner */}
      {isModOnly && mode !== 'read' && (
        <div className="lw-hotkey-hint">
          <span style={{ color: 'var(--lw-color-gold-500)' }}>◆</span>
          Modifier-only chord — treated as "hold modifier + click to activate".
          Cannot coexist with bindings that share these modifiers + a key.
        </div>
      )}

      {collision && (
        <div className="lw-hotkey-hint is-warn">
          <span style={{ color: 'var(--lw-color-flare-500)' }}>⚠</span>
          Already bound to: <strong>{collision.command}</strong> — replace, or pick a different combo.
          <button type="button" className="lw-btn is-link" onClick={() => { /* stub */ }}>Replace anyway</button>
        </div>
      )}
    </div>
  );
};

(window as any).LW_Inspector = { InspectorPreview, HotkeyRebindRow };

})();
