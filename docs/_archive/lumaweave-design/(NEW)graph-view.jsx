/* global React, SP, KIND, GRAPH, BOOKMARKS */
const { useState, useEffect, useRef, useMemo, useCallback } = React;

// ---------- Solar background (TAMED) ----------
function SolarBackdrop({ intensity, motionScale }) {
  const k = intensity * motionScale;
  return (
    <div className="solar-backdrop" aria-hidden="true">
      <div className="solar-space" />
      <div className="solar-corona" style={{ opacity: 0.42 + k * 0.30, animationDuration: `${24 / Math.max(0.3, motionScale)}s` }} />
      <div className="solar-flare flare-a" style={{ opacity: 0.28 + k * 0.30, animationDuration: `${36 / Math.max(0.3, motionScale)}s` }} />
      <div className="solar-flare flare-b" style={{ opacity: 0.22 + k * 0.28, animationDuration: `${42 / Math.max(0.3, motionScale)}s` }} />
      <div className="solar-flare flare-c" style={{ opacity: 0.20 + k * 0.30, animationDuration: `${48 / Math.max(0.3, motionScale)}s` }} />
      <svg className="solar-field" viewBox="0 0 1600 900" preserveAspectRatio="none">
        <defs>
          <linearGradient id="field1" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(255,107,26,0)" />
            <stop offset="50%" stopColor="rgba(255,179,71,0.30)" />
            <stop offset="100%" stopColor="rgba(255,31,143,0)" />
          </linearGradient>
          <linearGradient id="field2" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(79,172,255,0)" />
            <stop offset="50%" stopColor="rgba(0,212,255,0.22)" />
            <stop offset="100%" stopColor="rgba(123,47,255,0)" />
          </linearGradient>
        </defs>
        <path d="M -100 700 Q 400 200 900 500 T 1700 380" stroke="url(#field1)" strokeWidth="1" fill="none" />
        <path d="M -100 800 Q 500 300 1000 600 T 1700 480" stroke="url(#field2)" strokeWidth="0.8" fill="none" />
      </svg>
      <div className="solar-stars" />
      <div className="solar-vignette" />
      <style>{`
        .solar-backdrop { position:absolute; inset:0; overflow:hidden; pointer-events:none; }
        .solar-space {
          position:absolute; inset:0;
          background:
            radial-gradient(ellipse 80% 60% at 70% 40%, rgba(204,46,250,0.16), transparent 60%),
            radial-gradient(ellipse 90% 70% at 25% 70%, rgba(123,47,255,0.20), transparent 65%),
            radial-gradient(ellipse 100% 80% at 50% 50%, ${SP.voidWarm} 0%, ${SP.voidMid} 45%, ${SP.voidDeep} 100%);
        }
        .solar-corona {
          position:absolute; left:50%; top:55%; width:160%; height:160%;
          transform:translate(-50%,-50%);
          background: radial-gradient(circle at center,
            rgba(255,179,71,0.28) 0%, rgba(255,107,26,0.18) 14%,
            rgba(255,31,143,0.14) 24%, rgba(123,47,255,0.10) 38%, transparent 56%);
          filter: blur(40px);
          animation: pulseCorona 24s ease-in-out infinite;
        }
        @keyframes pulseCorona {
          0%, 100% { opacity: var(--o, 0.7); transform: translate(-50%,-50%) scale(1); }
          50%      { opacity: 1.00; transform: translate(-50%,-50%) scale(1.03); }
        }
        .solar-flare { position:absolute; border-radius:50%; mix-blend-mode: screen; filter: blur(46px); }
        .flare-a { left:18%; top:30%; width:38%; height:38%;
          background: radial-gradient(circle, rgba(255,107,26,0.55), transparent 65%);
          animation: drift 36s ease-in-out infinite; }
        .flare-b { left:55%; top:20%; width:30%; height:30%;
          background: radial-gradient(circle, rgba(255,31,143,0.42), transparent 70%);
          animation: drift 42s ease-in-out -8s infinite reverse; }
        .flare-c { left:60%; top:55%; width:34%; height:34%;
          background: radial-gradient(circle, rgba(0,212,255,0.30), transparent 72%);
          animation: drift 48s ease-in-out -14s infinite; }
        @keyframes drift {
          0%, 100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(2%,-2%) scale(1.04); }
        }
        .solar-field { position:absolute; inset:0; width:100%; height:100%; opacity:0.6; }
        .solar-stars {
          position:absolute; inset:0;
          background-image:
            radial-gradient(1px 1px at 15% 12%, rgba(255,255,255,0.85) 50%, transparent 51%),
            radial-gradient(1px 1px at 32% 68%, rgba(255,255,255,0.7) 50%, transparent 51%),
            radial-gradient(1px 1px at 78% 24%, rgba(255,200,180,0.85) 50%, transparent 51%),
            radial-gradient(1px 1px at 88% 82%, rgba(180,200,255,0.85) 50%, transparent 51%),
            radial-gradient(1px 1px at 52% 8%, rgba(255,255,255,0.75) 50%, transparent 51%),
            radial-gradient(0.6px 0.6px at 22% 42%, rgba(255,255,255,0.55) 50%, transparent 51%),
            radial-gradient(0.6px 0.6px at 70% 60%, rgba(255,255,255,0.55) 50%, transparent 51%),
            radial-gradient(0.6px 0.6px at 40% 30%, rgba(255,255,255,0.55) 50%, transparent 51%);
          opacity: 0.7;
        }
        .solar-vignette { position:absolute; inset:0; box-shadow: inset 0 0 240px 90px rgba(3,0,10,0.92); }
      `}</style>
    </div>
  );
}

// ---------- Glass Sphere Node ----------
function GlassSphere({ x, y, r, color, label, selected, hover, onPointerOver, onPointerOut, onClick, intensity, showLabel, hum, flowSpeed, glowStrength }) {
  const scale = selected ? 1.45 : hover ? 1.18 : 1;
  const sr = r * scale;
  // Hit area scales with the visible node so close neighbors stay clickable.
  const hitR = sr * 1.18;
  const id = label.replace(/[^a-zA-Z0-9]/g, '');
  const dur = flowSpeed > 0.05 ? `${(2.6 / flowSpeed).toFixed(2)}s` : "0s";
  const humDur = hum > 0.05 ? `${(3.4 / hum).toFixed(2)}s` : "0s";

  return (
    <g transform={`translate(${x} ${y})`}
       onMouseEnter={onPointerOver} onMouseLeave={onPointerOut}
       onClick={onClick}
       style={{ cursor: "pointer" }}>
      <defs>
        <radialGradient id={`g-glow-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0.65"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </radialGradient>
        <radialGradient id={`g-core-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1"/>
          <stop offset="20%" stopColor={color} stopOpacity="1"/>
          <stop offset="60%" stopColor={color} stopOpacity="0.85"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </radialGradient>
        <radialGradient id={`g-glass-${id}`} cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.95)"/>
          <stop offset="22%" stopColor="rgba(255,255,255,0.18)"/>
          <stop offset="55%" stopColor="rgba(255,255,255,0)"/>
          <stop offset="92%" stopColor="rgba(0,0,0,0.55)"/>
          <stop offset="100%" stopColor="rgba(0,0,0,0.85)"/>
        </radialGradient>
        <radialGradient id={`g-rim-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="80%" stopColor="rgba(0,0,0,0)"/>
          <stop offset="92%" stopColor={color} stopOpacity="0.4"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.95"/>
        </radialGradient>
      </defs>

      {/* outer halo */}
      <circle r={sr * 2.6} fill={`url(#g-glow-${id})`} pointerEvents="none"
              opacity={(selected ? 0.85 : hover ? 0.55 : 0.35) * (0.6 + intensity * 0.4)} />
      {/* dedicated hit area, scaled to visual size */}
      <circle r={hitR} fill="transparent"
              onMouseEnter={onPointerOver} onMouseLeave={onPointerOut}
              onClick={onClick}
              style={{ cursor: "pointer" }} />
      {/* glowing inner core */}
      <circle r={sr * 0.62} fill={`url(#g-core-${id})`}
              style={{ filter: `blur(${sr * 0.18}px)` }} />
      {/* glass body */}
      <circle r={sr} fill={color} opacity="0.32" />
      {/* neon flowing motion inside the sphere (clipped to body) */}
      <clipPath id={`clip-${id}`}><circle r={sr * 0.96}/></clipPath>
      {hum > 0.05 && (
        <g clipPath={`url(#clip-${id})`}>
          <ellipse cx="0" cy="0" rx={sr*0.85} ry={sr*0.22}
                   fill={`url(#g-core-${id})`} opacity={0.7 * glowStrength}
                   style={{ mixBlendMode: "screen" }}>
            <animateTransform attributeName="transform" type="rotate"
                              from="0" to="360" dur={dur} repeatCount="indefinite"/>
            <animate attributeName="opacity"
                     values={`${0.4*glowStrength};${0.85*glowStrength};${0.4*glowStrength}`}
                     dur={humDur} repeatCount="indefinite"/>
          </ellipse>
          <ellipse cx="0" cy="0" rx={sr*0.7} ry={sr*0.18}
                   fill={color} opacity={0.5 * glowStrength}
                   style={{ mixBlendMode: "screen", filter: `blur(${sr*0.06}px)` }}>
            <animateTransform attributeName="transform" type="rotate"
                              from="60" to="-300" dur={`${(parseFloat(dur)*1.4).toFixed(2)}s`}
                              repeatCount="indefinite"/>
          </ellipse>
          <circle r={sr*0.30} fill="#fff" opacity={0.55 * glowStrength}
                  style={{ filter: `blur(${sr*0.18}px)` }}>
            <animate attributeName="r"
                     values={`${sr*0.22};${sr*0.36};${sr*0.22}`}
                     dur={humDur} repeatCount="indefinite"/>
          </circle>
        </g>
      )}
      {/* glass shading (highlight + shadow) */}
      <circle r={sr} fill={`url(#g-glass-${id})`} />
      {/* rim light */}
      <circle r={sr} fill={`url(#g-rim-${id})`} />
      {/* small core dot - the "sun inside the glass" */}
      <circle r={sr * 0.30} fill="#fff" opacity={0.95 * glowStrength}
              style={{ filter: `blur(${sr*0.05}px) drop-shadow(0 0 ${sr*0.6}px ${color})` }}/>
      {/* specular highlight */}
      <ellipse cx={-sr*0.32} cy={-sr*0.40} rx={sr*0.28} ry={sr*0.16} fill="rgba(255,255,255,0.9)" />
      <ellipse cx={-sr*0.20} cy={-sr*0.50} rx={sr*0.10} ry={sr*0.06} fill="rgba(255,255,255,1)" />
      {/* selection ring */}
      {selected && (
        <circle r={sr * 1.55} fill="none" stroke={SP.flareGold} strokeWidth="1.2" strokeDasharray="3 3"
                style={{ filter: `drop-shadow(0 0 6px ${SP.flareGold})` }}>
          <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="14s" repeatCount="indefinite"/>
        </circle>
      )}
      {/* label */}
      {showLabel && (selected || hover || r >= 9) && (
        <text y={sr + 14} textAnchor="middle"
              fontFamily="IBM Plex Mono, monospace"
              fontSize={selected ? 12 : 10.5}
              fill={selected ? SP.flareGold : SP.ink}
              style={{ paintOrder: "stroke", stroke: "rgba(3,0,10,0.9)", strokeWidth: 3 }}>
          {label}
        </text>
      )}
    </g>
  );
}

// ---------- Plasma stream edge (now selectable) ----------
function PlasmaEdge({ x1, y1, x2, y2, color, hot, selected, intensity, label, showLabel,
                     onPointerOver, onPointerOut, onClick, motionScale }) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ox = -dy / len, oy = dx / len;
  const bend = Math.min(28, len * 0.12);
  const cx = mx + ox * bend;
  const cy = my + oy * bend;
  const d = `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
  // label position on curve midpoint
  const lx = (x1 + 2*cx + x2) / 4;
  const ly = (y1 + 2*cy + y2) / 4;
  const baseW = selected ? 2.4 : hot ? 1.8 : 1.0;
  const flowSpeed = motionScale > 0.05 ? `${(selected ? 1.2 : 3) / motionScale}s` : "0s";

  return (
    <g style={{ cursor: "pointer" }}>
      {/* hit area — fat invisible stroke for easy grabbing */}
      <path d={d} stroke="transparent" strokeWidth="38" fill="none"
            strokeLinecap="round"
            onMouseEnter={onPointerOver} onMouseLeave={onPointerOut}
            onClick={onClick} pointerEvents="stroke"/>
      {/* outer glow */}
      <path d={d} stroke={color} strokeWidth={baseW * 3 * (1 + intensity * 0.4)} fill="none"
            opacity={selected ? 0.42 : hot ? 0.28 : 0.10}
            style={{ filter: `blur(2px)` }} />
      {/* core stream */}
      <path d={d} stroke={color} strokeWidth={baseW} fill="none"
            opacity={selected ? 0.95 : hot ? 0.80 : 0.40}
            strokeLinecap="round"
            style={hot || selected ? { filter: `drop-shadow(0 0 4px ${color})` } : null} />
      {/* flowing dashes */}
      {motionScale > 0.05 && (
        <path d={d} stroke={selected ? SP.flareGold : color} strokeWidth={baseW * 0.7} fill="none"
              strokeDasharray={selected ? "2 8" : "1 14"} strokeLinecap="round"
              opacity={selected ? 1 : hot ? 0.85 : 0.5}>
          <animate attributeName="stroke-dashoffset"
                   from="0" to={selected ? "-40" : "-50"} dur={flowSpeed}
                   repeatCount="indefinite"/>
        </path>
      )}
      {/* label */}
      {showLabel && (selected || hot) && label && (
        <g transform={`translate(${lx} ${ly})`}>
          <rect x="-32" y="-9" width="64" height="16" rx="8"
                fill="rgba(3,0,10,0.85)" stroke={color} strokeOpacity="0.5"/>
          <text textAnchor="middle" y="3"
                fontFamily="IBM Plex Mono, monospace" fontSize="9"
                fill={selected ? SP.flareGold : color}
                letterSpacing="0.08em">{label}</text>
        </g>
      )}
    </g>
  );
}

// ---------- Click halo (water-ripple via CSS) ----------
function ClickHalo({ halos }) {
  return (
    <div className="halos-layer" aria-hidden="true">
      {halos.map(h => (
        <div key={h.id} className="ripple"
             style={{ left: h.x, top: h.y,
                      "--mr": `${h.maxR * 2}px`,
                      "--c1": SP.flareGold,
                      "--c2": SP.coronaCyan }}>
          <div className="r r1"/>
          <div className="r r2"/>
          <div className="r r3"/>
          <div className="splash"/>
        </div>
      ))}
      <style>{`
        .halos-layer { position:absolute; inset:0; pointer-events:none; z-index:5; overflow:hidden; }
        .ripple { position:absolute; transform: translate(-50%,-50%); width: 0; height: 0; }
        .ripple .r {
          position:absolute; left:50%; top:50%; transform: translate(-50%,-50%);
          width: 0; height: 0; border-radius: 50%;
          border: 2px solid var(--c1);
          box-shadow: 0 0 16px var(--c1), inset 0 0 8px var(--c2);
          opacity: 0.55;
          animation: rippleOut 1.6s cubic-bezier(.22,.61,.36,1) forwards;
        }
        .ripple .r2 { border-color: var(--c2); animation-delay: 0.18s; opacity: 0.42; }
        .ripple .r3 { border-color: var(--c1); animation-delay: 0.34s; opacity: 0.30;
                      border-width: 1px; }
        .ripple .splash {
          position:absolute; left:50%; top:50%; transform: translate(-50%,-50%);
          width: 0; height: 0; border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,0.6), var(--c1) 30%, transparent 65%);
          animation: splashOut 0.7s ease-out forwards;
          mix-blend-mode: screen;
        }
        @keyframes rippleOut {
          0%   { width:0; height:0; opacity: 0.65; border-width: 2.5px; }
          70%  { opacity: 0.32; border-width: 1.4px; }
          100% { width: var(--mr); height: var(--mr); opacity: 0; border-width: 0.4px; }
        }
        @keyframes splashOut {
          0%   { width: 0; height: 0; opacity: 1; }
          100% { width: 60px; height: 60px; opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ---------- Glitter wrapped to selection (cluster-depth aware) ----------
function GlitterField({ targets, color, motionScale }) {
  // targets: [{x, y, r}]
  if (!targets || targets.length === 0) return null;
  // generate ~14 particles per target
  return (
    <g pointerEvents="none">
      {targets.map((t, ti) => {
        const parts = Array.from({ length: 16 }).map((_, i) => {
          const a = (i / 16) * Math.PI * 2 + ti * 0.3;
          const dist = t.r * (0.6 + (i % 5) * 0.18);
          return {
            sx: Math.cos(a) * t.r * 0.3,
            sy: Math.sin(a) * t.r * 0.3,
            dx: Math.cos(a) * dist,
            dy: Math.sin(a) * dist,
            delay: ((ti * 7 + i * 13) % 800),
          };
        });
        const dur = motionScale > 0.05 ? `${1.4 / motionScale}s` : "1.4s";
        return (
          <g key={ti} transform={`translate(${t.x} ${t.y})`}>
            {parts.map((p, i) => (
              <circle key={i} cx={p.sx} cy={p.sy} r="1.2" fill={color}
                      style={{ filter: `drop-shadow(0 0 3px ${color})` }}>
                <animate attributeName="cx" from={p.sx} to={p.dx} dur={dur}
                         begin={`${p.delay}ms`} repeatCount="indefinite"/>
                <animate attributeName="cy" from={p.sy} to={p.dy} dur={dur}
                         begin={`${p.delay}ms`} repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0;1;0" dur={dur}
                         begin={`${p.delay}ms`} repeatCount="indefinite"/>
                <animate attributeName="r" values="0.6;1.6;0.4" dur={dur}
                         begin={`${p.delay}ms`} repeatCount="indefinite"/>
              </circle>
            ))}
          </g>
        );
      })}
    </g>
  );
}

// ---------- Bookmark ----------
function Bookmark({ b, size, reduceMotion }) {
  const px = b.x * size.w;
  const py = b.y * size.h;
  return (
    <div className={`bm ${b.type}`}
         style={{ left: px, top: py, width: b.r * 4.5, height: b.r * 4.5,
                  marginLeft: -(b.r * 2.25), marginTop: -(b.r * 2.25),
                  animationDuration: reduceMotion ? "0s" : "26s" }}>
      <div className="bm-core"
           style={{ background: `radial-gradient(circle at 35% 35%, #fff, ${b.color} 45%, transparent 75%)`,
                    boxShadow: `0 0 ${b.r*1.6}px ${b.color}, 0 0 ${b.r*3}px ${b.color}66` }} />
      <div className="bm-ring" style={{ borderColor: b.color }} />
      <div className="bm-badge" style={{ borderColor: b.color, color: b.color }}>
        <span className="bm-dot" style={{ background: b.color, boxShadow: `0 0 6px ${b.color}` }}/>
        <span className="bm-type">{b.type.toUpperCase()}</span>
        <span className="bm-sep">·</span>
        <span className="bm-label">{b.label}</span>
      </div>
      <style>{`
        .bm { position:absolute; pointer-events:auto; cursor: pointer;
              animation: bmDrift 26s ease-in-out infinite; }
        @keyframes bmDrift { 0%,100% { transform: translate(0,0); } 50% { transform: translate(6px,-6px); } }
        .bm-core { position:absolute; inset:25%; border-radius:50%; mix-blend-mode: screen; }
        .bm-ring { position:absolute; inset:18%; border:1px solid; border-radius:50%; opacity: 0.55;
                   animation: bmRing 6s ease-in-out infinite; }
        @keyframes bmRing { 0%,100%{transform:scale(1);opacity:0.55} 50%{transform:scale(1.15);opacity:0.20} }
        .bm-badge {
          position:absolute; top:100%; left:50%; transform:translateX(-50%);
          font-family: "IBM Plex Mono", ui-monospace, monospace;
          font-size: 9.5px; letter-spacing: 0.12em;
          padding: 3px 8px; border:1px solid; border-radius: 999px;
          margin-top: 6px; white-space: nowrap;
          background: rgba(3,0,10,0.78);
          display:flex; align-items:center; gap: 5px;
        }
        .bm-dot { width:5px; height:5px; border-radius:50%; }
        .bm-type { font-weight: 600; }
        .bm-sep { opacity: 0.5; }
        .bm-label { color: ${SP.ink}; }
      `}</style>
    </div>
  );
}

// ---------- Minimap (with rotation + viewport tracking) ----------
function Minimap({ camera, setCamera, selected, setSelected, size }) {
  const W = 220, H = 160;
  const onClickPos = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setCamera(c => ({ ...c, x, y }));
  };

  // viewport rect in model space → minimap px
  const viewW = 1 / camera.zoom;
  const viewH = (size.h / size.w) / camera.zoom;
  const vx = (camera.x - viewW / 2) * W;
  const vy = (camera.y - viewH / 2) * H;
  const vw = viewW * W;
  const vh = viewH * H;

  return (
    <div className="minimap-wrap">
      <div className="mm-head">
        <span className="mm-title">MINIMAP · n={GRAPH.nodes.length}</span>
        <span className="mm-zoom">×{camera.zoom.toFixed(2)} · {Math.round(camera.rot)}°</span>
      </div>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}
           className="mm-svg" onClick={onClickPos}>
        <rect x="0" y="0" width={W} height={H} fill="rgba(3,0,10,0.55)" />
        <g transform={`rotate(${camera.rot} ${W/2} ${H/2})`}>
          {GRAPH.edges.map((e, i) => {
            const a = GRAPH.nodes[e.source], b = GRAPH.nodes[e.target];
            return (
              <line key={i}
                    x1={a.x * W} y1={a.y * H}
                    x2={b.x * W} y2={b.y * H}
                    stroke="rgba(79,172,255,0.20)" strokeWidth="0.4"/>
            );
          })}
          {GRAPH.nodes.map((n, i) => (
            <circle key={i} cx={n.x * W} cy={n.y * H}
                    r={Math.max(1.2, n.r * 0.16)}
                    fill={n.color}
                    opacity={selected === i ? 1 : 0.85}
                    onClick={(e) => { e.stopPropagation(); setSelected(i); }}
                    style={{ cursor: "pointer", filter: selected === i
                      ? `drop-shadow(0 0 6px ${SP.flareGold})`
                      : `drop-shadow(0 0 2px ${n.color})` }}/>
          ))}
          {selected != null && (() => {
            const n = GRAPH.nodes[selected];
            return <circle cx={n.x * W} cy={n.y * H} r="6" fill="none"
                           stroke={SP.flareGold} strokeWidth="1"
                           pointerEvents="none"
                           style={{ filter: `drop-shadow(0 0 6px ${SP.flareGold})` }}/>;
          })()}
        </g>
        {/* viewport rect (unrotated, draws what's visible) */}
        <g transform={`rotate(${camera.rot} ${W/2} ${H/2})`}>
          <rect x={vx} y={vy} width={vw} height={vh}
                fill="rgba(255,179,71,0.10)"
                stroke={SP.flareGold} strokeWidth="1" strokeDasharray="2 2"
                pointerEvents="none"/>
        </g>
      </svg>
      <div className="mm-foot">click → pan · L-drag pan · R-drag rotate · scroll zoom</div>
      <style>{`
        .minimap-wrap {
          padding: 10px;
          background: linear-gradient(180deg, rgba(34,12,52,0.78), rgba(11,4,22,0.85));
          border: 1px solid ${SP.goldBorder};
          border-radius: 12px;
          backdrop-filter: blur(14px) saturate(140%);
          box-shadow: 0 0 0 1px rgba(255,179,71,0.10) inset, 0 8px 24px rgba(0,0,0,0.5),
                      0 0 30px rgba(255,107,26,0.10);
        }
        .mm-head { display:flex; justify-content:space-between; align-items:baseline; margin-bottom: 6px; }
        .mm-title { font-family: "Space Grotesk", system-ui, sans-serif;
                    font-size: 10px; letter-spacing: 0.18em; color: ${SP.flareGold}; }
        .mm-zoom { font-family: "IBM Plex Mono", ui-monospace, monospace;
                   font-size: 10px; color: ${SP.coronaCyan}; }
        .mm-svg { display:block; border-radius: 6px;
                  border: 1px solid rgba(255,179,71,0.15);
                  cursor: crosshair; }
        .mm-foot { font-family: "IBM Plex Mono", ui-monospace, monospace;
                   font-size: 8.5px; color: ${SP.muted}; margin-top: 5px;
                   text-align: center; letter-spacing: 0.08em; }
      `}</style>
    </div>
  );
}

// ---------- Draggable Inspector ----------
function DraggableInspector({ selectedNode, selectedEdgeInfo }) {
  const [pos, setPos] = useState({ x: 18, y: 18 });

  const onMouseDown = (e) => {
    e.preventDefault();
    const start = { x: e.clientX, y: e.clientY, ox: pos.x, oy: pos.y };
    const onMove = (ev) => {
      setPos({ x: start.ox + ev.clientX - start.x, y: start.oy + ev.clientY - start.y });
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const n = selectedNode;
  const showEdge = !!selectedEdgeInfo && !n;
  return (
    <div className="dins" style={{ left: pos.x, top: pos.y }}>
      <div className="dins-head" onMouseDown={onMouseDown}>
        <span className="dh-grip">⠿</span>
        <span className="dh-title">{showEdge ? "EDGE INSPECTOR" : "GRAPH INSPECTOR"}</span>
        <span className="dh-spacer" />
        <span className="dh-btn" title="pop out">▭</span>
        <span className="dh-btn" title="collapse">─</span>
      </div>
      <div className="dins-body">
        {showEdge ? <EdgeBody info={selectedEdgeInfo}/> : <NodeBody n={n}/>}
      </div>
      <style>{`
        .dins { position: absolute; width: 300px; z-index: 30;
                background: linear-gradient(180deg, rgba(34,12,52,0.82), rgba(11,4,22,0.92));
                border: 1px solid ${SP.goldBorderHot};
                border-radius: 14px;
                backdrop-filter: blur(18px) saturate(140%);
                box-shadow: 0 0 0 1px rgba(255,179,71,0.18) inset,
                            0 12px 40px rgba(0,0,0,0.6),
                            0 0 50px rgba(255,107,26,0.18);
                user-select: none; }
        .dins-head { display:flex; align-items:center; gap: 8px;
                     padding: 8px 12px;
                     border-bottom: 1px solid rgba(255,179,71,0.18);
                     cursor: grab; }
        .dins-head:active { cursor: grabbing; }
        .dh-grip { color: ${SP.flareGold}; font-size: 12px; opacity: 0.7; }
        .dh-title { font-family: "Space Grotesk", system-ui, sans-serif;
                    font-size: 10px; letter-spacing: 0.20em; color: ${SP.flareGold}; }
        .dh-spacer { flex: 1; }
        .dh-btn { color: ${SP.muted}; font-size: 11px; cursor: pointer; padding: 0 4px; }
        .dh-btn:hover { color: ${SP.ink}; }
        .dins-body { padding: 12px; }
      `}</style>
    </div>
  );
}

function NodeBody({ n }) {
  return <>
    <div className="di-id">
      <div className="di-glow" style={{ background: `radial-gradient(circle, ${n?.color || SP.flareGold}, ${SP.flareOrange})`,
                                        boxShadow: `0 0 18px ${n?.color || SP.flareOrange}` }}/>
      <div>
        <div className="di-name">{n?.label || "—"}</div>
        <div className="di-path">{n ? KIND[n.kind].name + " · " + n.id : "no selection"}</div>
      </div>
    </div>
    <div className="di-stats">
      <Stat k="DEGREE" v={n?.degree ?? "—"} />
      <Stat k="DEPTH" v={n ? "2" : "—"} />
      <Stat k="CLUSTER" v={n ? `c${n.cluster}` : "—"} />
    </div>
    <div className="di-bar"><div className="di-fill" style={{ width: n ? `${Math.min(95, 30 + n.degree * 7)}%` : "0%" }}/></div>
    <div className="di-foot">centrality · {n ? (Math.min(0.95, 0.30 + n.degree * 0.07)).toFixed(2) : "—"}</div>
    <div className="di-tags">
      {n && <>
        <span className="di-tag">{KIND[n.kind].name}</span>
        <span className="di-tag">solar.{n.kind}</span>
        <span className="di-tag">r={n.r.toFixed(1)}</span>
      </>}
    </div>
    <style>{commonInsStyles()}</style>
  </>;
}

function EdgeBody({ info }) {
  const { a, b, label, color } = info;
  return <>
    <div className="di-id">
      <div className="di-glow" style={{ background: `linear-gradient(90deg, ${a.color}, ${b.color})`,
                                        boxShadow: `0 0 18px ${color}` }}/>
      <div>
        <div className="di-name">{label}</div>
        <div className="di-path">edge · {a.id} → {b.id}</div>
      </div>
    </div>
    <div className="di-stats">
      <Stat k="SOURCE" v={a.label.slice(0, 8)}/>
      <Stat k="TARGET" v={b.label.slice(0, 8)}/>
      <Stat k="KIND" v={KIND[a.kind].name}/>
    </div>
    <div className="di-tags">
      <span className="di-tag">edge.{a.kind}</span>
      <span className="di-tag">flow</span>
      <span className="di-tag">selectable</span>
    </div>
    <style>{commonInsStyles()}</style>
  </>;
}

function commonInsStyles() {
  return `
    .di-id { display:flex; align-items:center; gap: 10px; margin-bottom: 12px; }
    .di-glow { width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0; }
    .di-name { font-family: "Space Grotesk", system-ui, sans-serif; font-size: 14px; color: ${SP.ink}; }
    .di-path { font-family: "IBM Plex Mono", ui-monospace, monospace; font-size: 10px; color: ${SP.muted}; margin-top: 1px; }
    .di-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 6px; margin-bottom: 10px; }
    .di-bar { height: 4px; background: rgba(255,255,255,0.06); border-radius: 999px; overflow: hidden; }
    .di-fill { height: 100%;
               background: linear-gradient(90deg, ${SP.coronaCyan}, ${SP.magenta} 60%, ${SP.flareOrange});
               box-shadow: 0 0 10px ${SP.flareOrange}; }
    .di-foot { font-family: "IBM Plex Mono", ui-monospace, monospace; font-size: 10px; color: ${SP.muted};
               text-align: right; margin-top: 5px; }
    .di-tags { display:flex; gap: 5px; margin-top: 10px; flex-wrap: wrap; }
    .di-tag { font-family: "IBM Plex Mono", ui-monospace, monospace;
              font-size: 9.5px; color: ${SP.coronaCyan};
              padding: 2px 7px; border-radius: 999px;
              border: 1px solid rgba(0,212,255,0.30);
              background: rgba(0,212,255,0.06); }
  `;
}

function Stat({ k, v }) {
  return (
    <div className="stat">
      <div className="sk">{k}</div>
      <div className="sv">{v}</div>
      <style>{`
        .stat { padding: 8px; border-radius: 8px;
                border: 1px solid rgba(255,179,71,0.18);
                background: rgba(11,4,22,0.5); }
        .sk { font-family: "IBM Plex Mono", ui-monospace, monospace;
              font-size: 9px; color: ${SP.muted}; letter-spacing: 0.12em; }
        .sv { font-family: "Space Grotesk", system-ui, sans-serif;
              font-size: 14px; color: ${SP.coronaCyan}; margin-top: 2px;
              white-space: nowrap; overflow:hidden; text-overflow: ellipsis; }
      `}</style>
    </div>
  );
}

// ---------- Camera HUD ----------
function CameraHUD({ camera, setCamera }) {
  return (
    <div className="cam-hud">
      <div className="cam-row">
        <button className="zb" onClick={(e)=>{e.stopPropagation(); setCamera(c => ({ ...c, zoom: Math.min(6, c.zoom * 1.10)}));}}>+</button>
        <button className="zb" onClick={(e)=>{e.stopPropagation(); setCamera(c => ({ ...c, zoom: Math.max(0.4, c.zoom / 1.10)}));}}>−</button>
        <button className="zb" onClick={(e)=>{e.stopPropagation(); setCamera({ x: 0.5, y: 0.5, zoom: 1.0, rot: 0 });}}>⊙</button>
      </div>
      <div className="cam-row">
        <button className="zb" onClick={(e)=>{e.stopPropagation(); setCamera(c => ({ ...c, rot: c.rot - 15 }));}}>↺</button>
        <button className="zb" onClick={(e)=>{e.stopPropagation(); setCamera(c => ({ ...c, rot: c.rot + 15 }));}}>↻</button>
        <button className="zb" onClick={(e)=>{e.stopPropagation(); setCamera(c => ({ ...c, rot: 0 }));}}>↑</button>
      </div>
      <style>{`
        .cam-hud {
          position: absolute; right: 16px; top: 16px; z-index: 6;
          display: flex; flex-direction: column; gap: 4px;
          background: linear-gradient(180deg, rgba(34,12,52,0.82), rgba(11,4,22,0.92));
          padding: 6px;
          border: 1px solid ${SP.goldBorder};
          border-radius: 10px;
          backdrop-filter: blur(14px);
        }
        .cam-row { display: flex; gap: 4px; }
        .zb { width: 28px; height: 28px;
              background: transparent; border: 1px solid rgba(255,179,71,0.18);
              color: ${SP.flareGold};
              border-radius: 6px; cursor: pointer;
              font-family: "Space Grotesk", system-ui, sans-serif;
              font-size: 13px; }
        .zb:hover { background: rgba(255,107,26,0.14); border-color: ${SP.goldBorderHot}; }
      `}</style>
    </div>
  );
}

// ---------- Graph Canvas ----------
function GraphCanvas({ intensity, reduceMotion, glitter, motionScale, clusterDepth, edgeLabels, nodeHum, nodeFlowSpeed, nodeGlow }) {
  const wrapRef = useRef(null);
  const [size, setSize] = useState({ w: 1200, h: 720 });
  const [camera, setCamera] = useState({ x: 0.5, y: 0.5, zoom: 1.0, rot: 0 });
  const [animCam, setAnimCam] = useState(camera);
  const [hover, setHover] = useState(null);
  const [hoverEdge, setHoverEdge] = useState(null);
  const [selected, setSelected] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [halos, setHalos] = useState([]);

  // smooth cam follow
  useEffect(() => {
    const start = animCam;
    const target = camera;
    const startTime = performance.now();
    const dur = 380;
    let raf;
    const tick = (t) => {
      const k = Math.min(1, (t - startTime) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      setAnimCam({
        x: start.x + (target.x - start.x) * e,
        y: start.y + (target.y - start.y) * e,
        zoom: start.zoom + (target.zoom - start.zoom) * e,
        rot: start.rot + (target.rot - start.rot) * e,
      });
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [camera.x, camera.y, camera.zoom, camera.rot]);

  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setSize({ w: width, h: height });
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  // model → screen with rotation
  const project = useCallback((nx, ny) => {
    const cx = animCam.x, cy = animCam.y, z = animCam.zoom;
    const rad = (animCam.rot * Math.PI) / 180;
    const cos = Math.cos(rad), sin = Math.sin(rad);
    // shift to center, rotate, then scale
    const aspect = size.h / size.w;
    let dx = (nx - cx);
    let dy = (ny - cy) * aspect;
    const rx = dx * cos - dy * sin;
    const ry = dx * sin + dy * cos;
    return { x: rx * z * size.w + size.w / 2, y: ry * z * size.w / aspect / aspect + size.h / 2 };
  }, [animCam, size]);

  // simpler projection (no aspect distortion)
  const project2 = useCallback((nx, ny) => {
    const cx = animCam.x, cy = animCam.y, z = animCam.zoom;
    const rad = (animCam.rot * Math.PI) / 180;
    const cos = Math.cos(rad), sin = Math.sin(rad);
    const dx = (nx - cx);
    const dy = (ny - cy);
    const rx = dx * cos - dy * sin;
    const ry = dx * sin + dy * cos;
    return { x: rx * z * size.w + size.w / 2, y: ry * z * size.w + size.h / 2 };
  }, [animCam, size]);

  const projected = useMemo(() => GRAPH.nodes.map((n) => {
    const p = project2(n.x, n.y);
    return { ...n, sx: p.x, sy: p.y };
  }), [project2]);

  // mouse interactions: pan / rotate / wheel zoom
  const dragRef = useRef(null);
  const onMouseDown = (e) => {
    if (e.button !== 0 && e.button !== 2) return;
    e.preventDefault();
    const startCam = { ...camera };
    const sx = e.clientX, sy = e.clientY;
    const button = e.button;
    dragRef.current = { moved: false };
    const onMove = (ev) => {
      const dx = ev.clientX - sx;
      const dy = ev.clientY - sy;
      if (Math.abs(dx) + Math.abs(dy) > 3) dragRef.current.moved = true;
      if (button === 0) {
        // pan: convert px to model space
        const rad = (startCam.rot * Math.PI) / 180;
        const cos = Math.cos(rad), sin = Math.sin(rad);
        const mx = dx / (size.w * startCam.zoom);
        const my = dy / (size.w * startCam.zoom);
        const px = mx * cos + my * sin;
        const py = -mx * sin + my * cos;
        setCamera({ ...startCam, x: startCam.x - px, y: startCam.y - py });
      } else if (button === 2) {
        const rotDelta = dx * 0.4;
        setCamera({ ...startCam, rot: startCam.rot + rotDelta });
      }
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const onWheel = (e) => {
    e.preventDefault();
    const delta = -e.deltaY;
    setCamera(c => ({ ...c, zoom: Math.max(0.4, Math.min(6, c.zoom * (1 + delta * 0.0015))) }));
  };

  // canvas click: halo + clear selection (only if didn't drag)
  const onCanvasClick = (e) => {
    if (dragRef.current?.moved) return;
    const t = e.target;
    const isBg = t === e.currentTarget || t.classList?.contains("canvas-bg-rect");
    if (!isBg) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // Alt+Shift+click on bg → open inspector for nearest node
    if (e.altKey && e.shiftKey) {
      let best = -1, bestD = Infinity;
      projected.forEach((p, i) => {
        const d = Math.hypot(p.sx - x, p.sy - y);
        if (d < bestD) { bestD = d; best = i; }
      });
      if (best >= 0) {
        const n = projected[best];
        window.dispatchEvent(new CustomEvent("inspector:open", { detail: {
          kind: "node", sx: n.sx + rect.left, sy: n.sy + rect.top,
          label: n.label, color: n.color, r: n.r, intensity: 1,
          cluster: KIND[n.kind]?.label, ref: best,
        }}));
      }
      return;
    }
    const id = Math.random().toString(36).slice(2);
    const maxR = Math.min(size.w, size.h) * 0.25;
    setHalos(h => [...h, { id, x, y, maxR }]);
    setTimeout(() => setHalos(h => h.filter(p => p.id !== id)), 1500);
    setSelected(null);
    setSelectedEdge(null);
  };

  // Alt+Shift+click on a node → inspector
  const onNodeAltClick = (i, e) => {
    if (!(e.altKey && e.shiftKey)) return false;
    e.stopPropagation();
    const rect = wrapRef.current.getBoundingClientRect();
    const n = projected[i];
    window.dispatchEvent(new CustomEvent("inspector:open", { detail: {
      kind: "node", sx: n.sx + rect.left, sy: n.sy + rect.top,
      label: n.label, color: n.color, r: n.r, intensity: 1,
      cluster: KIND[n.kind]?.label, ref: i,
    }}));
    return true;
  };
  const onEdgeAltClick = (i, e) => {
    if (!(e.altKey && e.shiftKey)) return false;
    e.stopPropagation();
    const ed = GRAPH.edges[i];
    const A = projected[ed.source], B = projected[ed.target];
    const rect = wrapRef.current.getBoundingClientRect();
    window.dispatchEvent(new CustomEvent("inspector:open", { detail: {
      kind: "edge",
      sx: ((A.sx + B.sx) / 2) + rect.left,
      sy: ((A.sy + B.sy) / 2) + rect.top,
      fromLabel: A.label, toLabel: B.label,
      color: A.color, r: 6, intensity: 1, ref: i,
    }}));
    return true;
  };

  const selectNode = (i) => {
    setSelected(i);
    setSelectedEdge(null);
  };
  const selectEdge = (idx) => {
    setSelectedEdge(idx);
    setSelected(null);
  };

  const selectedNode = selected != null ? GRAPH.nodes[selected] : null;
  const selectedEdgeInfo = selectedEdge != null ? (() => {
    const e = GRAPH.edges[selectedEdge];
    const a = GRAPH.nodes[e.source], b = GRAPH.nodes[e.target];
    return { a, b, color: a.color, label: `${a.label.slice(0,5)}→${b.label.slice(0,5)}` };
  })() : null;

  // BFS for cluster depth
  const adj = useMemo(() => {
    const m = {};
    GRAPH.nodes.forEach((_, i) => m[i] = []);
    GRAPH.edges.forEach(e => { m[e.source].push(e.target); m[e.target].push(e.source); });
    return m;
  }, []);
  const selectionGroup = useMemo(() => {
    if (selected == null) return new Set();
    const out = new Set([selected]);
    let frontier = [selected];
    for (let d = 0; d < clusterDepth; d++) {
      const next = [];
      frontier.forEach(i => adj[i].forEach(j => { if (!out.has(j)) { out.add(j); next.push(j); } }));
      frontier = next;
    }
    return out;
  }, [selected, clusterDepth, adj]);

  const glitterTargets = useMemo(() => {
    if (!glitter || selected == null) return [];
    return [...selectionGroup].map(i => {
      const n = projected[i];
      return { x: n.sx, y: n.sy, r: n.r * Math.min(1.5, animCam.zoom) * 1.4 };
    });
  }, [selectionGroup, glitter, selected, projected, animCam.zoom]);

  const glitterColor = selected != null ? GRAPH.nodes[selected].color : SP.flareGold;

  return (
    <section className="canvas-wrap" ref={wrapRef}
             data-screen-label="solar-plasma-graph"
             onMouseDown={onMouseDown}
             onClick={onCanvasClick}
             onWheel={onWheel}
             onContextMenu={(e) => e.preventDefault()}>
      <SolarBackdrop intensity={intensity} motionScale={reduceMotion ? 0 : motionScale} />

      <svg className="graph-svg" width={size.w} height={size.h}>
        <rect className="canvas-bg-rect" x="0" y="0" width="100%" height="100%" fill="transparent" />
        {/* edges */}
        <g>
          {GRAPH.edges.map((e, i) => {
            const A = projected[e.source], B = projected[e.target];
            const color = KIND[A.kind].color;
            const isSel = selectedEdge === i;
            const isHot = hoverEdge === i ||
                          (selected != null && (e.source === selected || e.target === selected));
            return (
              <PlasmaEdge key={i}
                          x1={A.sx} y1={A.sy} x2={B.sx} y2={B.sy}
                          color={color}
                          hot={isHot}
                          selected={isSel}
                          intensity={intensity}
                          motionScale={reduceMotion ? 0 : motionScale}
                          label={`${A.label.slice(0,4)}→${B.label.slice(0,4)}`}
                          showLabel={edgeLabels}
                          onPointerOver={() => setHoverEdge(i)}
                          onPointerOut={() => setHoverEdge(h => h === i ? null : h)}
                          onClick={(ev) => { if (onEdgeAltClick(i, ev)) return; ev.stopPropagation(); selectEdge(i); }}/>
            );
          })}
        </g>
        {/* glitter wrapped to selection group */}
        <GlitterField targets={glitterTargets} color={glitterColor}
                      motionScale={reduceMotion ? 0 : motionScale}/>
        {/* nodes */}
        <g>
          {projected.map((n, i) => (
            <GlassSphere key={n.id}
                         x={n.sx} y={n.sy} r={n.r * Math.min(1.5, animCam.zoom)}
                         color={n.color} label={n.label}
                         selected={selected === i}
                         hover={hover === i || selectionGroup.has(i)}
                         onPointerOver={() => setHover(i)}
                         onPointerOut={() => setHover(h => h === i ? null : h)}
                         onClick={(e) => { if (onNodeAltClick(i, e)) return; e.stopPropagation(); selectNode(i); }}
                         intensity={intensity}
                         hum={reduceMotion ? 0 : nodeHum}
                         flowSpeed={reduceMotion ? 0 : nodeFlowSpeed}
                         glowStrength={nodeGlow}
                         showLabel={true}/>
          ))}
        </g>
      </svg>

      <ClickHalo halos={halos} />

      {BOOKMARKS.map(b => <Bookmark key={b.id} b={b} size={size} reduceMotion={reduceMotion}/>)}

      <DraggableInspector selectedNode={selectedNode} selectedEdgeInfo={selectedEdgeInfo} />

      <div className="minimap-pos">
        <Minimap camera={camera} setCamera={setCamera}
                 selected={selected} setSelected={(i)=>selectNode(i)}
                 size={size}/>
      </div>

      <CameraHUD camera={camera} setCamera={setCamera}/>

      <div className="center-readout">
        <div className="cr-line">CORONA · {GRAPH.nodes.length} bodies · {GRAPH.edges.length} streams · cluster-depth {clusterDepth}</div>
      </div>

      <style>{`
        .canvas-wrap { position: relative; height: 100%; overflow: visible; cursor: grab; }
        .canvas-wrap:active { cursor: grabbing; }
        .graph-svg { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 2; }
        .minimap-pos { position: absolute; right: 16px; bottom: 60px; z-index: 6; }
        .center-readout { position: absolute; left: 50%; bottom: 22px; transform: translateX(-50%); z-index: 6; }
        .cr-line {
          font-family: "IBM Plex Mono", ui-monospace, monospace;
          font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase;
          color: ${SP.flareGold};
          padding: 5px 14px; border-radius: 999px;
          border: 1px solid rgba(255,179,71,0.25);
          background: rgba(11,4,22,0.7);
          backdrop-filter: blur(8px);
        }
      `}</style>
    </section>
  );
}

window.GraphCanvas = GraphCanvas;
