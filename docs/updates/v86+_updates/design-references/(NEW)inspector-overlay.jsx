// =============================================================================
// Inspector Ghost Overlay  (Milestone C)
// =============================================================================
// Alt+Shift+click any element in the graph (or any node/edge directly) to summon.
//
//   <Inspector tweaks={tweaks} setTweak={setTweak}/>
//
// Listens on `window` for `inspector:open` CustomEvents.  Detail shape:
//   { kind: 'node'|'edge'|'canvas', x, y, ref, label, color, size, ...payload }
// Ref is opaque — passed back through to apply()-callbacks.
//
// Renders:
//   1. Halo around the live target (an absolutely-positioned ring).
//   2. Radial menu — 9 spokes orbiting the cursor.
//   3. Compact popover panel anchored to the target, tabbed.
//   4. Scope picker on every tweak: this / kind / cluster / global.
// =============================================================================

(function () {
  const { useState, useEffect, useRef, useMemo } = React;

  const SP = window.SP || {
    space900: "#020108", space800: "#03000a", space700: "#080419",
    plasma: "#ff7044", flareGold: "#ffb347", flareIce: "#fff2c5",
    coronaCyan: "#4facff", coronaPink: "#ff5fae",
    ink: "#f0e6d8", muted: "#8a7e9b", line: "rgba(255,179,71,0.18)",
  };

  // ---------------------------------------------------------------------------
  // Spoke definitions for the radial menu
  // ---------------------------------------------------------------------------
  const SPOKES = [
    { id: "color",    label: "Color",     icon: "◐", angle: -90 },
    { id: "geometry", label: "Geometry",  icon: "◇", angle: -50 },
    { id: "type",     label: "Type",      icon: "Aa", angle: -10 },
    { id: "motion",   label: "Motion",    icon: "≋", angle: 30 },
    { id: "layout",   label: "Layout",    icon: "▦", angle: 70 },
    { id: "code",     label: "Code",      icon: "</>", angle: 110 },
    { id: "apply",    label: "Apply to…", icon: "≔", angle: 150 },
    { id: "ide",      label: "Open in IDE", icon: "↗", angle: 190 },
    { id: "history",  label: "History",   icon: "↶", angle: 230 },
  ];

  // ---------------------------------------------------------------------------
  // Eyedropper-style swatch palette (live + recent)
  // ---------------------------------------------------------------------------
  const PALETTE = [
    SP.plasma, SP.flareGold, SP.flareIce, SP.coronaCyan, SP.coronaPink,
    "#ffd166", "#ef476f", "#06d6a0", "#118ab2", "#7b2cbf", "#f72585", "#ffffff",
  ];

  // ---------------------------------------------------------------------------
  // Scope picker
  // ---------------------------------------------------------------------------
  function ScopePicker({ value, onChange, kind }) {
    const opts = [
      { id: "this", label: "this" },
      { id: "kind", label: kind || "kind" },
      { id: "cluster", label: "cluster" },
      { id: "global", label: "all" },
    ];
    return (
      <div className="ins-scope">
        {opts.map(o => (
          <button key={o.id}
                  className={`ins-scope-pip ${value === o.id ? "on" : ""}`}
                  onClick={() => onChange(o.id)}>{o.label}</button>
        ))}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Tabs
  // ---------------------------------------------------------------------------
  function ColorTab({ target, scope, setScope, applyColor }) {
    const [eyeOn, setEye] = useState(false);
    const [recent, setRecent] = useState(() => {
      try { return JSON.parse(localStorage.getItem("ins-recent-colors") || "[]"); }
      catch { return []; }
    });
    const pushRecent = (c) => {
      const next = [c, ...recent.filter(x => x !== c)].slice(0, 8);
      setRecent(next);
      try { localStorage.setItem("ins-recent-colors", JSON.stringify(next)); } catch {}
    };
    const apply = (c) => { pushRecent(c); applyColor(c); };

    return (
      <div className="ins-tab-body">
        <div className="ins-row">
          <span className="ins-row-label">CURRENT</span>
          <div className="ins-current-color" style={{ background: target.color }}/>
          <code className="ins-hex">{target.color}</code>
        </div>

        <div className="ins-row">
          <span className="ins-row-label">EYEDROPPER</span>
          <button className={`ins-pill ${eyeOn ? "on" : ""}`}
                  onClick={() => setEye(v => !v)}>
            {eyeOn ? "● picking" : "◉ pick from canvas"}
          </button>
        </div>

        {recent.length > 0 && (
          <div className="ins-row">
            <span className="ins-row-label">RECENT</span>
            <div className="ins-swatch-row">
              {recent.map((c, i) => (
                <button key={i} className="ins-swatch" style={{ background: c }}
                        title={c} onClick={() => apply(c)}/>
              ))}
            </div>
          </div>
        )}

        <div className="ins-row">
          <span className="ins-row-label">PALETTE</span>
          <div className="ins-swatch-grid">
            {PALETTE.map((c, i) => (
              <button key={i} className="ins-swatch lg" style={{ background: c }}
                      title={c} onClick={() => apply(c)}/>
            ))}
          </div>
        </div>

        <div className="ins-row">
          <span className="ins-row-label">HEX</span>
          <input className="ins-hex-input" type="text" defaultValue={target.color}
                 onKeyDown={(e) => {
                   if (e.key === "Enter") apply(e.currentTarget.value);
                 }}/>
        </div>

        <ScopePicker value={scope} onChange={setScope} kind={target.kind}/>
      </div>
    );
  }

  function GeometryTab({ target, scope, setScope, applyGeo }) {
    return (
      <div className="ins-tab-body">
        <div className="ins-row">
          <span className="ins-row-label">SIZE</span>
          <input className="ins-num" type="number" defaultValue={Math.round(target.r ?? 8)}
                 step={0.5}
                 onChange={(e) => applyGeo({ r: parseFloat(e.target.value) })}/>
          <span className="ins-unit">px</span>
        </div>
        <div className="ins-row">
          <span className="ins-row-label">POS X</span>
          <input className="ins-num" type="number" readOnly defaultValue={Math.round(target.sx ?? 0)}/>
          <span className="ins-unit">px</span>
        </div>
        <div className="ins-row">
          <span className="ins-row-label">POS Y</span>
          <input className="ins-num" type="number" readOnly defaultValue={Math.round(target.sy ?? 0)}/>
          <span className="ins-unit">px</span>
        </div>
        <div className="ins-row">
          <span className="ins-row-label">SHAPE</span>
          <div className="ins-pill-row">
            {["sphere","disc","ring","star"].map(s => (
              <button key={s} className="ins-pill ghost">{s}</button>
            ))}
          </div>
        </div>
        <ScopePicker value={scope} onChange={setScope} kind={target.kind}/>
      </div>
    );
  }

  function TypeTab({ target, scope, setScope }) {
    return (
      <div className="ins-tab-body">
        <div className="ins-row">
          <span className="ins-row-label">FAMILY</span>
          <select className="ins-select">
            <option>IBM Plex Mono</option>
            <option>IBM Plex Sans</option>
            <option>Sohne</option>
            <option>JetBrains Mono</option>
          </select>
        </div>
        <div className="ins-row">
          <span className="ins-row-label">SIZE</span>
          <input className="ins-num" type="number" defaultValue={11}/>
          <span className="ins-unit">px</span>
        </div>
        <div className="ins-row">
          <span className="ins-row-label">WEIGHT</span>
          <div className="ins-pill-row">
            {[300,400,500,600,700].map(w => (
              <button key={w} className="ins-pill ghost">{w}</button>
            ))}
          </div>
        </div>
        <div className="ins-row">
          <span className="ins-row-label">TRACKING</span>
          <input className="ins-num" type="number" step={0.01} defaultValue={0.14}/>
          <span className="ins-unit">em</span>
        </div>
        <ScopePicker value={scope} onChange={setScope} kind={target.kind}/>
      </div>
    );
  }

  function MotionTab({ target, scope, setScope, motionOverride, setMotionOverride }) {
    return (
      <div className="ins-tab-body">
        <div className="ins-row">
          <span className="ins-row-label">INTENSITY</span>
          <input className="ins-range" type="range" min={0} max={2} step={0.01}
                 defaultValue={target.intensity ?? 1}
                 onInput={(e) => setMotionOverride(parseFloat(e.target.value))}/>
          <span className="ins-num-readout">{(motionOverride ?? target.intensity ?? 1).toFixed(2)}</span>
        </div>
        <div className="ins-row">
          <span className="ins-row-label">EASING</span>
          <div className="ins-pill-row">
            {["linear","ease","spring","sine"].map(s => (
              <button key={s} className="ins-pill ghost">{s}</button>
            ))}
          </div>
        </div>
        <div className="ins-row">
          <span className="ins-row-label">PHASE</span>
          <input className="ins-num" type="number" defaultValue={0} step={0.05}/>
          <span className="ins-unit">s</span>
        </div>
        <ScopePicker value={scope} onChange={setScope} kind={target.kind}/>
      </div>
    );
  }

  function CodeTab({ target }) {
    const snippet = useMemo(() => {
      if (target.kind === "edge") {
        return `<PlasmaEdge\n  from="${target.fromLabel ?? "?"}"\n  to="${target.toLabel ?? "?"}"\n  color="${target.color}"\n  intensity={${(target.intensity ?? 1).toFixed(2)}}\n/>`;
      }
      return `<GlassSphere\n  label="${target.label}"\n  r={${(target.r ?? 8).toFixed(1)}}\n  color="${target.color}"\n  cluster="${target.cluster ?? "n/a"}"\n/>`;
    }, [target]);
    return (
      <div className="ins-tab-body">
        <div className="ins-code-head">
          <span className="ins-code-tag">JSX</span>
          <span className="ins-code-path">graph-view.jsx · L88</span>
          <button className="ins-pill ghost">copy</button>
        </div>
        <pre className="ins-code">{snippet}</pre>
        <div className="ins-code-diff">
          <div className="ins-diff-line add">+ color: "{target.color}"</div>
          <div className="ins-diff-line ctx">  intensity: {(target.intensity ?? 1).toFixed(2)}</div>
        </div>
      </div>
    );
  }

  function ApplyTab({ target, applyTo, setApplyTo }) {
    const suggestions = [
      { id: "this",    label: `Just this ${target.kind}`,         match: 1 },
      { id: "kind",    label: `All ${target.kind}s`,              match: 18 },
      { id: "cluster", label: `Cluster: ${target.cluster ?? "—"}`, match: 7 },
      { id: "color",   label: `All matching color`,                match: 4 },
      { id: "size",    label: `All similar size`,                  match: 11 },
      { id: "global",  label: "Everything",                         match: 102 },
    ];
    return (
      <div className="ins-tab-body">
        <div className="ins-apply-list">
          {suggestions.map(s => (
            <label key={s.id} className={`ins-apply-row ${applyTo === s.id ? "on" : ""}`}>
              <input type="radio" name="applyTo"
                     checked={applyTo === s.id}
                     onChange={() => setApplyTo(s.id)}/>
              <span className="ins-apply-label">{s.label}</span>
              <span className="ins-apply-count">{s.match}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }

  function HistoryTab() {
    const events = [
      { t: "now",    txt: "Color → #ffb347" },
      { t: "0:14",   txt: "Size 8 → 11" },
      { t: "0:42",   txt: "Cluster: physics" },
      { t: "1:08",   txt: "Created" },
    ];
    return (
      <div className="ins-tab-body">
        <div className="ins-hist">
          {events.map((e, i) => (
            <div key={i} className="ins-hist-row">
              <span className="ins-hist-t">{e.t}</span>
              <span className="ins-hist-dot"/>
              <span className="ins-hist-txt">{e.txt}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Compact popover, with tabs along the top
  // ---------------------------------------------------------------------------
  function CompactPopover({ target, anchor, onClose, applyColor }) {
    const [tab, setTab] = useState("color");
    const [scope, setScope] = useState("this");
    const [applyTo, setApplyTo] = useState("this");
    const [motionOverride, setMotionOverride] = useState(null);

    // Position the popover smartly: prefer right of anchor, fall back to left.
    const W = 296, H = 360;
    let left = anchor.x + 60;
    let top = anchor.y - H / 2;
    if (left + W > window.innerWidth - 12) left = anchor.x - 60 - W;
    top = Math.max(60, Math.min(window.innerHeight - H - 12, top));

    const TABS = [
      { id: "color", label: "Color" },
      { id: "geometry", label: "Geo" },
      { id: "type", label: "Type" },
      { id: "motion", label: "Motion" },
      { id: "code", label: "Code" },
      { id: "apply", label: "Apply" },
      { id: "history", label: "Hist" },
    ];

    const onApplyColor = (c) => applyColor(c, scope, applyTo);

    return (
      <div className="ins-pop" style={{ left, top, width: W }} onMouseDown={(e) => e.stopPropagation()}>
        <div className="ins-pop-head">
          <span className="ins-pop-kind">{target.kind?.toUpperCase()}</span>
          <span className="ins-pop-label">{target.label ?? target.fromLabel + " → " + target.toLabel}</span>
          <button className="ins-pop-x" onClick={onClose}>×</button>
        </div>
        <div className="ins-pop-tabs">
          {TABS.map(t => (
            <button key={t.id}
                    className={`ins-pop-tab ${tab === t.id ? "on" : ""}`}
                    onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
        </div>
        {tab === "color"    && <ColorTab    target={target} scope={scope} setScope={setScope} applyColor={onApplyColor}/>}
        {tab === "geometry" && <GeometryTab target={target} scope={scope} setScope={setScope} applyGeo={() => {}}/>}
        {tab === "type"     && <TypeTab     target={target} scope={scope} setScope={setScope}/>}
        {tab === "motion"   && <MotionTab   target={target} scope={scope} setScope={setScope}
                                             motionOverride={motionOverride}
                                             setMotionOverride={setMotionOverride}/>}
        {tab === "code"     && <CodeTab     target={target}/>}
        {tab === "apply"    && <ApplyTab    target={target} applyTo={applyTo} setApplyTo={setApplyTo}/>}
        {tab === "history"  && <HistoryTab/>}

        <div className="ins-pop-foot">
          <button className="ins-pill ghost sm" onClick={onClose}>esc</button>
          <span className="ins-foot-hint">Alt+Shift+click anywhere to re-target</span>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Radial menu
  // ---------------------------------------------------------------------------
  function RadialMenu({ anchor, onPick, onClose }) {
    const R = 88;
    return (
      <div className="ins-radial" style={{ left: anchor.x, top: anchor.y }}
           onMouseDown={(e) => e.stopPropagation()}>
        <div className="ins-radial-core" onClick={onClose}>×</div>
        {SPOKES.map(sp => {
          const a = (sp.angle * Math.PI) / 180;
          const sx = Math.cos(a) * R;
          const sy = Math.sin(a) * R;
          return (
            <button key={sp.id} className="ins-radial-spoke"
                    style={{ transform: `translate(${sx}px, ${sy}px) translate(-50%,-50%)` }}
                    onClick={() => onPick(sp.id)}>
              <span className="ins-radial-icon">{sp.icon}</span>
              <span className="ins-radial-label">{sp.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Halo (ring around the live target)
  // ---------------------------------------------------------------------------
  function GhostHalo({ target }) {
    const r = (target.r ?? 14) * (target.scale ?? 1);
    const size = r * 4 + 24;
    return (
      <div className="ins-halo"
           style={{ left: target.sx ?? target.x ?? 0,
                    top:  target.sy ?? target.y ?? 0,
                    width: size, height: size,
                    marginLeft: -size/2, marginTop: -size/2 }}>
        <div className="ins-halo-ring r1"/>
        <div className="ins-halo-ring r2"/>
        <div className="ins-halo-tick t1"/>
        <div className="ins-halo-tick t2"/>
        <div className="ins-halo-tick t3"/>
        <div className="ins-halo-tick t4"/>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Top-level Inspector (keyboard + event listener)
  // ---------------------------------------------------------------------------
  function Inspector({ tweaks, setTweak }) {
    const [target, setTarget] = useState(null);
    const [stage, setStage] = useState("radial"); // radial | popover
    const [anchor, setAnchor] = useState({ x: 0, y: 0 });

    // Listen to global "inspector:open"
    useEffect(() => {
      const onOpen = (e) => {
        const d = e.detail || {};
        setTarget(d);
        setAnchor({ x: d.sx ?? d.x ?? window.innerWidth/2,
                    y: d.sy ?? d.y ?? window.innerHeight/2 });
        setStage("radial");
      };
      window.addEventListener("inspector:open", onOpen);
      return () => window.removeEventListener("inspector:open", onOpen);
    }, []);

    // Esc to close
    useEffect(() => {
      const onKey = (e) => {
        if (!target) return;
        if (e.key === "Escape") setTarget(null);
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [target]);

    // Click outside to close
    useEffect(() => {
      if (!target) return;
      const onDown = (e) => {
        if (e.target.closest(".ins-pop") || e.target.closest(".ins-radial")) return;
        setTarget(null);
      };
      window.addEventListener("mousedown", onDown);
      return () => window.removeEventListener("mousedown", onDown);
    }, [target]);

    if (!target) return null;

    const applyColor = (c, scope = "this", applyTo = "this") => {
      // Wire to the actual graph: dispatch a global event the host can listen to
      window.dispatchEvent(new CustomEvent("inspector:apply", {
        detail: { kind: "color", target, scope, applyTo, value: c }
      }));
      setTarget(t => t ? { ...t, color: c } : t);
    };

    const onPick = (spokeId) => {
      if (spokeId === "ide") {
        window.dispatchEvent(new CustomEvent("inspector:open-in-ide", { detail: { target } }));
        return;
      }
      setStage("popover");
    };

    return (
      <div className="ins-root">
        <div className="ins-scrim" onMouseDown={() => setTarget(null)}/>
        <GhostHalo target={target}/>
        {stage === "radial" && (
          <RadialMenu anchor={anchor}
                      onPick={onPick}
                      onClose={() => setTarget(null)}/>
        )}
        {stage === "popover" && (
          <CompactPopover target={target} anchor={anchor}
                          onClose={() => setTarget(null)}
                          applyColor={applyColor}/>
        )}
        <Style/>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Style block
  // ---------------------------------------------------------------------------
  function Style() {
    return (
      <style>{`
        .ins-root { position: fixed; inset: 0; z-index: 80; pointer-events: none;
                    font-family: "IBM Plex Mono", ui-monospace, monospace; }
        .ins-scrim { position: absolute; inset: 0; background: rgba(2,1,8,0.32);
                     backdrop-filter: blur(1.5px); pointer-events: auto;
                     animation: insFade 0.18s ease both; }
        @keyframes insFade { from { opacity: 0; } to { opacity: 1; } }

        /* Halo */
        .ins-halo { position: absolute; pointer-events: none; }
        .ins-halo-ring { position: absolute; inset: 0; border-radius: 50%;
                         border: 1.4px solid ${SP.flareGold};
                         box-shadow: 0 0 18px rgba(255,179,71,0.45),
                                     inset 0 0 12px rgba(255,179,71,0.30); }
        .ins-halo-ring.r1 { animation: insHaloPulse 2.2s ease-in-out infinite; }
        .ins-halo-ring.r2 { inset: -10px; opacity: 0.35;
                            border-style: dashed;
                            animation: insHaloRot 18s linear infinite; }
        @keyframes insHaloPulse {
          0%,100% { opacity: 0.85; transform: scale(1); }
          50%     { opacity: 1;    transform: scale(1.04); }
        }
        @keyframes insHaloRot { to { transform: rotate(360deg); } }

        .ins-halo-tick { position: absolute; width: 14px; height: 1.4px;
                         background: ${SP.flareGold};
                         box-shadow: 0 0 6px ${SP.flareGold}; }
        .ins-halo-tick.t1 { left: 50%; top: -10px; transform: translate(-50%,-50%) rotate(90deg); }
        .ins-halo-tick.t2 { left: 50%; bottom: -10px; transform: translate(-50%,50%) rotate(90deg); }
        .ins-halo-tick.t3 { top: 50%; left: -10px; transform: translate(-50%,-50%); }
        .ins-halo-tick.t4 { top: 50%; right: -10px; transform: translate(50%,-50%); }

        /* Radial menu */
        .ins-radial { position: absolute; pointer-events: auto;
                      width: 0; height: 0;
                      animation: insRadialIn 0.22s cubic-bezier(.4,1.5,.5,1) both; }
        @keyframes insRadialIn {
          from { transform: scale(0.5); opacity: 0; }
          to   { transform: scale(1);    opacity: 1; }
        }
        .ins-radial-core { position: absolute; left: 0; top: 0;
                           transform: translate(-50%,-50%);
                           width: 36px; height: 36px; border-radius: 50%;
                           background: rgba(8,4,25,0.95);
                           border: 1px solid ${SP.flareGold};
                           color: ${SP.flareGold};
                           display: flex; align-items: center; justify-content: center;
                           font-size: 18px; cursor: pointer;
                           box-shadow: 0 0 18px rgba(255,179,71,0.55); }
        .ins-radial-core:hover { background: rgba(255,179,71,0.18); }

        .ins-radial-spoke { position: absolute; left: 0; top: 0;
                            width: 64px; height: 64px; border-radius: 50%;
                            background: rgba(3,0,10,0.92);
                            border: 1px solid rgba(255,179,71,0.30);
                            color: ${SP.ink};
                            display: flex; flex-direction: column;
                            align-items: center; justify-content: center;
                            gap: 2px; cursor: pointer;
                            transition: transform 0.15s, background 0.15s, border-color 0.15s; }
        .ins-radial-spoke:hover {
          background: rgba(255,179,71,0.18);
          border-color: ${SP.flareGold};
          color: ${SP.flareGold};
          box-shadow: 0 0 16px rgba(255,179,71,0.45);
        }
        .ins-radial-icon { font-size: 16px; line-height: 1; color: ${SP.flareIce}; }
        .ins-radial-spoke:hover .ins-radial-icon { color: ${SP.flareGold}; }
        .ins-radial-label { font-size: 8.5px; letter-spacing: 0.12em;
                            text-transform: uppercase; opacity: 0.8; }

        /* Popover */
        .ins-pop { position: absolute; pointer-events: auto;
                   background: linear-gradient(180deg,
                     rgba(8,4,25,0.96) 0%, rgba(3,0,10,0.96) 100%);
                   border: 1px solid rgba(255,179,71,0.32);
                   border-radius: 10px;
                   color: ${SP.ink};
                   box-shadow: 0 18px 60px rgba(0,0,0,0.65),
                               0 0 32px rgba(255,179,71,0.18);
                   backdrop-filter: blur(8px);
                   font-family: "IBM Plex Mono", ui-monospace, monospace;
                   animation: insPopIn 0.18s cubic-bezier(.4,1.3,.6,1) both;
                   overflow: hidden; }
        @keyframes insPopIn {
          from { transform: translateY(4px) scale(0.97); opacity: 0; }
          to   { transform: translateY(0)   scale(1);    opacity: 1; }
        }
        .ins-pop-head { display: flex; align-items: center; gap: 8px;
                        padding: 9px 10px;
                        border-bottom: 1px solid rgba(255,179,71,0.16);
                        background: rgba(255,179,71,0.04); }
        .ins-pop-kind { font-size: 9px; letter-spacing: 0.18em;
                         color: ${SP.flareGold}; }
        .ins-pop-label { flex: 1; font-size: 11px; letter-spacing: 0.06em;
                          color: ${SP.flareIce}; overflow: hidden;
                          text-overflow: ellipsis; white-space: nowrap; }
        .ins-pop-x { background: none; border: 0; color: ${SP.muted};
                     font-size: 16px; cursor: pointer; padding: 0 4px; }
        .ins-pop-x:hover { color: ${SP.flareGold}; }

        .ins-pop-tabs { display: flex; gap: 1px;
                         padding: 6px 6px 0;
                         border-bottom: 1px solid rgba(255,179,71,0.10); }
        .ins-pop-tab { flex: 1; background: none; border: 0;
                        color: ${SP.muted};
                        font-family: inherit; font-size: 9px;
                        letter-spacing: 0.12em; text-transform: uppercase;
                        padding: 6px 0 8px; cursor: pointer;
                        border-bottom: 1.5px solid transparent;
                        transition: color 0.12s, border-color 0.12s; }
        .ins-pop-tab:hover { color: ${SP.flareIce}; }
        .ins-pop-tab.on    { color: ${SP.flareGold};
                              border-bottom-color: ${SP.flareGold}; }

        .ins-tab-body { padding: 10px 12px; display: flex; flex-direction: column; gap: 8px;
                         max-height: 340px; overflow: auto; }

        .ins-row { display: flex; align-items: center; gap: 8px; }
        .ins-row-label { font-size: 8.5px; letter-spacing: 0.16em;
                          color: ${SP.muted}; min-width: 64px; }
        .ins-current-color { width: 22px; height: 22px; border-radius: 4px;
                              border: 1px solid rgba(255,255,255,0.2);
                              box-shadow: 0 0 10px currentColor; }
        .ins-hex { font-size: 11px; color: ${SP.flareIce}; flex: 1; }
        .ins-hex-input { flex: 1; background: rgba(255,255,255,0.04);
                          border: 1px solid rgba(255,179,71,0.20);
                          border-radius: 4px;
                          color: ${SP.flareIce};
                          font-family: inherit; font-size: 11px;
                          padding: 4px 8px;
                          text-transform: uppercase; }
        .ins-hex-input:focus { outline: none; border-color: ${SP.flareGold};
                                box-shadow: 0 0 0 2px rgba(255,179,71,0.18); }

        .ins-pill { background: rgba(255,179,71,0.08);
                     border: 1px solid rgba(255,179,71,0.30);
                     border-radius: 999px;
                     color: ${SP.flareIce};
                     font-family: inherit; font-size: 10px;
                     letter-spacing: 0.10em;
                     padding: 4px 10px; cursor: pointer; }
        .ins-pill:hover { background: rgba(255,179,71,0.18);
                           border-color: ${SP.flareGold}; }
        .ins-pill.on { background: ${SP.flareGold}; color: ${SP.space900}; }
        .ins-pill.ghost { background: transparent;
                           border-color: rgba(255,179,71,0.18);
                           color: ${SP.muted}; }
        .ins-pill.ghost:hover { color: ${SP.flareIce}; border-color: rgba(255,179,71,0.40); }
        .ins-pill.sm { font-size: 9px; padding: 2px 8px; }

        .ins-pill-row { display: flex; gap: 4px; flex-wrap: wrap; }

        .ins-swatch { width: 20px; height: 20px; border-radius: 3px;
                       border: 1px solid rgba(255,255,255,0.10);
                       cursor: pointer; padding: 0;
                       transition: transform 0.1s, box-shadow 0.1s; }
        .ins-swatch:hover { transform: scale(1.15);
                             box-shadow: 0 0 10px currentColor;
                             border-color: ${SP.flareGold}; }
        .ins-swatch.lg { width: 26px; height: 26px; border-radius: 4px; }
        .ins-swatch-row, .ins-swatch-grid { display: flex; flex-wrap: wrap; gap: 4px; flex: 1; }

        .ins-num { background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,179,71,0.20);
                    border-radius: 4px;
                    color: ${SP.flareIce};
                    font-family: inherit; font-size: 11px;
                    padding: 4px 8px; width: 64px; }
        .ins-num:focus { outline: none; border-color: ${SP.flareGold}; }
        .ins-unit { font-size: 9px; color: ${SP.muted}; letter-spacing: 0.1em; }
        .ins-num-readout { font-size: 10px; color: ${SP.flareGold}; min-width: 32px; text-align: right; }

        .ins-range { flex: 1; appearance: none; height: 2px;
                      background: rgba(255,179,71,0.20); border-radius: 1px; }
        .ins-range::-webkit-slider-thumb { appearance: none;
          width: 12px; height: 12px; border-radius: 50%;
          background: ${SP.flareGold};
          box-shadow: 0 0 8px ${SP.flareGold}; cursor: grab; }

        .ins-select { flex: 1; background: rgba(255,255,255,0.04);
                       border: 1px solid rgba(255,179,71,0.20);
                       border-radius: 4px;
                       color: ${SP.flareIce};
                       font-family: inherit; font-size: 11px;
                       padding: 4px 8px; }

        /* Scope picker */
        .ins-scope { display: flex; gap: 2px;
                      margin-top: auto; padding: 6px 0 0;
                      border-top: 1px solid rgba(255,179,71,0.10); }
        .ins-scope-pip { flex: 1; background: transparent;
                          border: 1px solid rgba(255,179,71,0.18);
                          border-radius: 4px;
                          color: ${SP.muted};
                          font-family: inherit; font-size: 9px;
                          letter-spacing: 0.10em; text-transform: uppercase;
                          padding: 4px 6px; cursor: pointer;
                          transition: all 0.12s; }
        .ins-scope-pip:hover { color: ${SP.flareIce}; border-color: rgba(255,179,71,0.40); }
        .ins-scope-pip.on { background: rgba(255,179,71,0.20);
                             color: ${SP.flareGold};
                             border-color: ${SP.flareGold};
                             box-shadow: 0 0 8px rgba(255,179,71,0.30); }

        /* Code tab */
        .ins-code-head { display: flex; align-items: center; gap: 6px;
                         font-size: 9px; letter-spacing: 0.12em; }
        .ins-code-tag { background: ${SP.flareGold}; color: ${SP.space900};
                         padding: 1px 6px; border-radius: 3px;
                         font-weight: 600; }
        .ins-code-path { flex: 1; color: ${SP.muted}; font-size: 9px; }
        .ins-code { background: rgba(0,0,0,0.45);
                     border: 1px solid rgba(255,179,71,0.12);
                     border-radius: 4px;
                     padding: 8px 10px;
                     font-family: inherit; font-size: 10.5px;
                     color: ${SP.flareIce};
                     white-space: pre; overflow: auto;
                     margin: 0; }
        .ins-code-diff { border-left: 2px solid rgba(255,179,71,0.30);
                          padding-left: 8px; }
        .ins-diff-line { font-size: 10px; padding: 1px 0; }
        .ins-diff-line.add { color: #06d6a0; }
        .ins-diff-line.ctx { color: ${SP.muted}; }

        /* Apply tab */
        .ins-apply-list { display: flex; flex-direction: column; gap: 4px; }
        .ins-apply-row { display: flex; align-items: center; gap: 8px;
                          padding: 6px 8px; border-radius: 4px;
                          border: 1px solid rgba(255,179,71,0.10);
                          cursor: pointer;
                          transition: background 0.12s; }
        .ins-apply-row:hover { background: rgba(255,179,71,0.06); }
        .ins-apply-row.on    { background: rgba(255,179,71,0.14);
                                border-color: ${SP.flareGold}; }
        .ins-apply-row input { accent-color: ${SP.flareGold}; }
        .ins-apply-label { flex: 1; font-size: 10.5px; color: ${SP.flareIce}; }
        .ins-apply-count { font-size: 9px; color: ${SP.muted}; }

        /* History tab */
        .ins-hist { display: flex; flex-direction: column; }
        .ins-hist-row { display: flex; align-items: center; gap: 8px;
                         padding: 5px 0;
                         border-left: 1.5px solid rgba(255,179,71,0.20);
                         padding-left: 10px;
                         margin-left: 4px;
                         position: relative; }
        .ins-hist-t { font-size: 9px; color: ${SP.muted}; min-width: 36px; }
        .ins-hist-dot { width: 6px; height: 6px; border-radius: 50%;
                         background: ${SP.flareGold};
                         box-shadow: 0 0 6px ${SP.flareGold};
                         position: absolute; left: -4px; }
        .ins-hist-txt { font-size: 10.5px; color: ${SP.flareIce}; }

        /* Footer */
        .ins-pop-foot { display: flex; align-items: center; gap: 8px;
                         padding: 6px 10px;
                         border-top: 1px solid rgba(255,179,71,0.10);
                         background: rgba(0,0,0,0.30); }
        .ins-foot-hint { flex: 1; text-align: right;
                          font-size: 8.5px; color: ${SP.muted};
                          letter-spacing: 0.10em; }
      `}</style>
    );
  }

  // ---------------------------------------------------------------------------
  // Public exports
  // ---------------------------------------------------------------------------
  Object.assign(window, { Inspector });
})();
