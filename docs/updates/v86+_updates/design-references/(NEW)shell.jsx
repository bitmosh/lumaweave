/* global React, SP */
const { useState: useStateS } = React;

function HexLogo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="hexFill" x1="0" y1="0" x2="64" y2="64">
          <stop offset="0%" stopColor={SP.flareOrange} />
          <stop offset="55%" stopColor={SP.magenta} />
          <stop offset="100%" stopColor={SP.purple} />
        </linearGradient>
        <radialGradient id="hexGlow" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="rgba(255,179,71,0.55)" />
          <stop offset="100%" stopColor="rgba(255,179,71,0)" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#hexGlow)" />
      <polygon points="32,4 56,18 56,46 32,60 8,46 8,18"
               fill="none" stroke="url(#hexFill)" strokeWidth="2" strokeLinejoin="round" />
      <g stroke="url(#hexFill)" strokeWidth="1" strokeLinecap="round" opacity="0.95">
        <line x1="32" y1="14" x2="46" y2="22" />
        <line x1="32" y1="14" x2="18" y2="22" />
        <line x1="32" y1="14" x2="32" y2="32" />
        <line x1="46" y1="22" x2="46" y2="42" />
        <line x1="18" y1="22" x2="18" y2="42" />
        <line x1="46" y1="42" x2="32" y2="50" />
        <line x1="18" y1="42" x2="32" y2="50" />
        <line x1="32" y1="32" x2="46" y2="42" />
        <line x1="32" y1="32" x2="18" y2="42" />
      </g>
      <g fill={SP.ink}>
        <circle cx="32" cy="14" r="2" />
        <circle cx="46" cy="22" r="2" />
        <circle cx="18" cy="22" r="2" />
        <circle cx="46" cy="42" r="2" />
        <circle cx="18" cy="42" r="2" />
        <circle cx="32" cy="50" r="2" />
        <circle cx="32" cy="32" r="2.5" fill={SP.flareGold} />
      </g>
    </svg>
  );
}

function TopBar({ theme, onThemeChange, glitter, onGlitter, reduce, onReduce }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <HexLogo size={34} />
        <div className="wordmark">
          <div className="wm-row">
            <span className="wm-name">LumaWeave</span>
            <span className="wm-sub">PANORAMA ATLAS</span>
          </div>
          <div className="wm-tag">Map. Understand. Build.</div>
        </div>
        <div className="solar-pill">
          <span className="solar-dot" />
          <span>Solar Plasma</span>
        </div>
      </div>
      <div className="topbar-right">
        <div className="status-cluster">
          <span className="status-key">graph</span>
          <span className="status-val">{window.GRAPH.nodes.length}n · {window.GRAPH.edges.length}e</span>
          <span className="sep">·</span>
          <span className="status-key">layout</span>
          <span className="status-val">FA2 · settling</span>
          <span className="sep">·</span>
          <span className="status-key">fps</span>
          <span className="status-val ok">58</span>
        </div>
        <select value={theme} onChange={(e) => onThemeChange(e.target.value)} className="theme-select">
          <option value="solar-plasma">⚡ Solar Plasma</option>
          <option value="obsidian-aurora">◇ Obsidian Aurora</option>
          <option value="midnight-loom">✦ Midnight Loom</option>
          <option value="void-circuit">▦ Void Circuit</option>
          <option value="agartha-dream">❀ Agartha Dream</option>
          <option value="agartha-dusk">☾ Agartha Dusk</option>
        </select>
        <Toggle label="Glitter" on={glitter} onChange={onGlitter} />
        <Toggle label="Reduce Motion" on={reduce} onChange={onReduce} />
      </div>
      <style>{`
        .topbar {
          display:flex; align-items:center; justify-content:space-between;
          padding: 10px 18px;
          background: linear-gradient(180deg, rgba(27,8,48,0.86), rgba(11,4,22,0.94));
          backdrop-filter: blur(16px) saturate(140%);
          border-bottom: 1px solid ${SP.goldBorder};
          box-shadow: 0 1px 0 rgba(255,179,71,0.12), 0 8px 30px rgba(0,0,0,0.5);
          position: relative; z-index: 10;
        }
        .topbar-left { display:flex; align-items:center; gap:14px; }
        .wordmark { display:flex; flex-direction:column; gap:1px; line-height:1; }
        .wm-row { display:flex; align-items:baseline; gap:10px; }
        .wm-name {
          font-family: "Space Grotesk", system-ui, sans-serif;
          font-weight: 600; font-size: 18px; letter-spacing: -0.01em;
          background: linear-gradient(92deg, ${SP.flareGold}, ${SP.magenta} 60%, ${SP.coronaCyan});
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }
        .wm-sub {
          font-family: "IBM Plex Mono", ui-monospace, monospace;
          font-size: 9.5px; letter-spacing: 0.22em; color: ${SP.flareGold};
          padding: 2px 6px; border:1px solid rgba(255,179,71,0.32);
          border-radius: 3px;
        }
        .wm-tag {
          font-family: "IBM Plex Mono", ui-monospace, monospace;
          font-size: 10px; color: ${SP.muted}; letter-spacing: 0.06em;
          margin-top: 4px;
        }
        .solar-pill {
          display:flex; align-items:center; gap:8px;
          font-family: "IBM Plex Mono", ui-monospace, monospace;
          font-size: 10.5px; letter-spacing: 0.12em; text-transform: uppercase;
          color: ${SP.flareGold};
          padding: 5px 10px; border-radius: 999px;
          border: 1px solid rgba(255,179,71,0.32);
          background: linear-gradient(90deg, rgba(255,107,26,0.14), rgba(255,31,143,0.10));
          margin-left: 6px;
        }
        .solar-dot {
          width: 7px; height:7px; border-radius:50%;
          background: ${SP.flareOrange};
          box-shadow: 0 0 10px ${SP.flareOrange}, 0 0 20px rgba(255,107,26,0.6);
          animation: solarPulse 2.4s ease-in-out infinite;
        }
        @keyframes solarPulse {
          0%,100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.25); opacity: 0.7; }
        }
        .topbar-right { display:flex; align-items:center; gap:14px; }
        .status-cluster {
          display:flex; align-items:center; gap:8px;
          font-family: "IBM Plex Mono", ui-monospace, monospace;
          font-size: 11px;
          padding: 5px 12px; border-radius: 999px;
          border: 1px solid rgba(79,172,255,0.22);
          background: rgba(11,4,22,0.6);
        }
        .status-key { color: ${SP.muted}; }
        .status-val { color: ${SP.coronaCyan}; }
        .status-val.ok { color: #7CF6B5; }
        .sep { color: ${SP.faint}; }
        .theme-select {
          font-family: "IBM Plex Sans", system-ui, sans-serif;
          font-size: 12px; color: ${SP.ink};
          background: rgba(11,4,22,0.85);
          border: 1px solid ${SP.goldBorder};
          border-radius: 8px; padding: 6px 10px; cursor: pointer;
        }
        .theme-select:hover { border-color: ${SP.goldBorderHot}; }
      `}</style>
    </header>
  );
}

function Toggle({ label, on, onChange }) {
  return (
    <label className={`tg ${on ? "on" : ""}`} onClick={() => onChange(!on)}>
      <span className="tg-label">{label}</span>
      <span className="tg-track"><span className="tg-knob" /></span>
      <style>{`
        .tg { display:flex; align-items:center; gap:8px; cursor:pointer;
              font-family: "IBM Plex Sans", system-ui, sans-serif;
              font-size: 11.5px; color: ${SP.muted}; user-select:none; }
        .tg.on { color: ${SP.flareGold}; }
        .tg-track {
          width: 28px; height:14px; border-radius: 999px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,179,71,0.28);
          position: relative; transition: all .18s ease;
        }
        .tg.on .tg-track {
          background: linear-gradient(90deg, ${SP.flareOrange}, ${SP.magenta});
          border-color: rgba(255,179,71,0.6);
          box-shadow: 0 0 12px rgba(255,107,26,0.55);
        }
        .tg-knob {
          position:absolute; top:1px; left:1px; width:10px; height:10px;
          border-radius: 50%; background: #FFE9D6;
          transition: transform .18s ease;
        }
        .tg.on .tg-knob { transform: translateX(14px); }
      `}</style>
    </label>
  );
}

const LEFT_TABS = [
  { id: "graph",    label: "Graph",    glyph: "⬡" },
  { id: "qa",       label: "QA",       glyph: "✓" },
  { id: "evidence", label: "Evidence", glyph: "◈" },
  { id: "debug",    label: "Debug",    glyph: "⌥" },
];

function LeftPanel({ active, setActive, sections, toggleSection }) {
  return (
    <aside className="left-panel">
      <div className="tab-strip">
        {LEFT_TABS.map(t => (
          <button key={t.id} onClick={() => setActive(t.id)}
                  className={`tab ${active === t.id ? "active" : ""}`}>
            <span className="tab-glyph">{t.glyph}</span>
            <span className="tab-label">{t.label}</span>
          </button>
        ))}
      </div>
      <div className="tab-body">
        {active === "graph" && <GraphTab sections={sections} toggleSection={toggleSection}/>}
        {active === "qa" && <QaTab/>}
        {active === "evidence" && <EvidenceTab/>}
        {active === "debug" && <DebugTab/>}
      </div>
      <style>{`
        .left-panel {
          display:flex; flex-direction:column;
          background: linear-gradient(180deg, rgba(20,7,38,0.82), rgba(11,4,22,0.90));
          border-right: 1px solid ${SP.goldBorder};
          backdrop-filter: blur(14px) saturate(140%);
          height: 100%; min-height: 0; z-index: 2; position: relative;
        }
        .tab-strip {
          display:flex; padding: 6px 6px 0 6px; gap: 2px;
          border-bottom: 1px solid rgba(255,179,71,0.10);
          background: rgba(3,0,10,0.50);
        }
        .tab {
          flex: 1; display:flex; flex-direction:column; align-items:center; gap:3px;
          padding: 9px 4px 11px;
          background: transparent; border: none; cursor: pointer;
          color: ${SP.muted};
          font-family: "IBM Plex Sans", system-ui, sans-serif;
          font-size: 9.5px; letter-spacing: 0.14em; text-transform: uppercase;
          border-bottom: 2px solid transparent;
          transition: all .15s ease;
        }
        .tab:hover { color: ${SP.ink}; }
        .tab .tab-glyph { font-size: 14px; line-height: 1; }
        .tab.active {
          color: ${SP.flareGold};
          border-bottom-color: ${SP.flareOrange};
          background: linear-gradient(180deg, rgba(255,107,26,0.14), transparent);
        }
        .tab-body { flex:1; min-height:0; overflow-y:auto; padding: 14px; }
      `}</style>
    </aside>
  );
}

function Section({ title, open, onToggle, children }) {
  return (
    <div className="section">
      <button onClick={onToggle} className="section-head">
        <span className="caret">{open ? "▾" : "▸"}</span>
        <span>{title}</span>
      </button>
      {open && <div className="section-body">{children}</div>}
      <style>{`
        .section { margin-bottom: 12px; }
        .section-head {
          width: 100%; display:flex; align-items:center; gap: 8px;
          padding: 8px 10px;
          background: linear-gradient(90deg, rgba(255,107,26,0.12), transparent 70%);
          border: none;
          color: ${SP.flareGold};
          font-family: "Space Grotesk", system-ui, sans-serif;
          font-size: 10.5px; font-weight: 600;
          letter-spacing: 0.14em; text-transform: uppercase;
          cursor: pointer;
          border-radius: 6px;
          border-left: 2px solid ${SP.flareOrange};
        }
        .caret { font-size: 9px; opacity: 0.8; }
        .section-body { padding: 10px 4px 4px; }
      `}</style>
    </div>
  );
}

function KV({ label, value, tone = "muted" }) {
  const colors = { muted: SP.muted, ok: "#7CF6B5", cy: SP.coronaCyan, hot: SP.flareGold };
  return (
    <div className="kv">
      <span className="kv-l">{label}</span>
      <span className="kv-v" style={{ color: colors[tone] }}>{value}</span>
      <style>{`
        .kv { display:flex; justify-content:space-between;
              font-family: "IBM Plex Mono", ui-monospace, monospace;
              font-size: 11px; padding: 2px 0; }
        .kv-l { color: ${SP.muted}; }
      `}</style>
    </div>
  );
}

function GraphSourcesBody() {
  return <div className="src-card">
    <div className="src-head">
      <div className="src-name">LumaWeave Self-Graph</div>
      <div className="src-status"><span className="dot"/>loaded</div>
    </div>
    <div className="src-path">src/fixtures/self-graph-generated.json</div>
    <div className="kv-list">
      <KV label="graph.json" value="found" tone="ok"/>
      <KV label="manifest.json" value="missing" tone="muted"/>
      <div className="rule"/>
      <KV label="nodes" value={window.GRAPH.nodes.length} tone="cy"/>
      <KV label="edges" value={window.GRAPH.edges.length} tone="cy"/>
      <KV label="warnings" value="0" tone="muted"/>
    </div>
  </div>;
}
function SourceAdapterBody() {
  return <>
    <div className="adapter-row"><span>graphify · v3.2</span><span className="adp-flag">active</span></div>
    <div className="adapter-row"><span>jsonl · stream</span><span className="adp-flag idle">idle</span></div>
    <div className="adapter-row"><span>cypher · bridge</span><span className="adp-flag idle">idle</span></div>
  </>;
}
function LayoutFA2Body() {
  return <>
    <div className="meter">
      <div className="meter-label"><span>continuous physics</span><span className="meter-val">settling · 0.0023</span></div>
      <div className="meter-bar"><div className="meter-fill" style={{ width: "78%" }}/></div>
    </div>
    <div className="chips">
      {["balanced","spread","tight","organic","perf"].map((c, i) => (
        <span key={c} className={`chip ${i === 0 ? "on" : ""}`}>{c}</span>
      ))}
    </div>
  </>;
}
window.GraphSourcesBody = GraphSourcesBody;
window.SourceAdapterBody = SourceAdapterBody;
window.LayoutFA2Body = LayoutFA2Body;

function PhysicsBody() {
  return <>
    <Slider label="Repel Force" value={100} min={0} max={400} unit="" color={SP.flareOrange}/>
    <Slider label="Center Force" value={200} min={0} max={500} unit="" color={SP.flareGold}/>
    <Slider label="Link Distance" value={3} min={1} max={10} unit="rel" color={SP.magenta}/>
    <div className="row-toggles">
      <MicroToggle label="strongGravity" on={false}/>
      <MicroToggle label="linLog" on={false}/>
      <MicroToggle label="adjustSizes" on={true}/>
    </div>
  </>;
}
function LabelsBody() {
  return <>
    <Slider label="Node label size" value={13} min={8} max={22} unit="px" color={SP.coronaCyan}/>
    <Slider label="Edge label size" value={11} min={8} max={20} unit="px" color={SP.coronaBlue}/>
    <Segmented label="Node label mode" options={["all","selected","hover","zoom"]} active="zoom"/>
  </>;
}
function ThemeBody({ tweaks }) {
  return <>
    <div className="palette-row">
      {[SP.coronaCyan, SP.coronaBlue, SP.flareGold, SP.flareOrange, SP.magenta, SP.fuchsia, SP.purple].map(c => (
        <span key={c} className="swatch" style={{ background: c, color: c }}/>
      ))}
    </div>
    {tweaks && <>
      <Slider label="Panel blur" value={tweaks.blur} min={0} max={28} unit="px"
              color={SP.flareGold} onChange={tweaks.setBlur}/>
      <Slider label="Glow intensity" value={Math.round(tweaks.intensity*100)} min={0} max={150} unit="%"
              color={SP.flareOrange} onChange={(v) => tweaks.setIntensity(v/100)}/>
    </>}
  </>;
}
function InspectorBody() {
  return <div className="inspector-card">
    <div className="ins-head">
      <span className="ins-dot" style={{ background: SP.flareGold, boxShadow: `0 0 12px ${SP.flareGold}` }}/>
      <span className="ins-label">Selected node</span>
    </div>
    <div style={{ fontFamily: "IBM Plex Mono", fontSize: 11, color: SP.muted, lineHeight: 1.6 }}>
      Drag the inspector by its title bar. Tear-off via ⤴.
    </div>
  </div>;
}
window.PhysicsBody = PhysicsBody;
window.LabelsBody = LabelsBody;
window.ThemeBody = ThemeBody;
window.InspectorBody = InspectorBody;

function GraphTab({ sections, toggleSection }) {
  return <>
    <TileableSection sectionKey="graphSources" title="Graph Sources"><GraphSourcesBody/></TileableSection>
    <TileableSection sectionKey="sourceAdapter" title="Source Adapter"><SourceAdapterBody/></TileableSection>
    <TileableSection sectionKey="layoutFA2" title="Layout · FA2"><LayoutFA2Body/></TileableSection>
    <style>{`
      .src-card {
        padding: 14px; border-radius: 10px;
        border: 1px solid rgba(79,172,255,0.20);
        background: linear-gradient(180deg, rgba(15,30,55,0.55), rgba(11,4,22,0.55));
      }
      .src-head { display:flex; justify-content:space-between; align-items:baseline; }
      .src-name { font-family: "Space Grotesk", system-ui, sans-serif; font-size: 13px; color: ${SP.ink}; font-weight: 500; }
      .src-status { display:flex; align-items:center; gap:5px;
                    font-family: "IBM Plex Mono", ui-monospace, monospace;
                    font-size: 10px; color: #7CF6B5; }
      .src-status .dot { width:6px; height:6px; border-radius:50%; background: #7CF6B5; box-shadow: 0 0 8px #7CF6B5; }
      .src-path { font-family: "IBM Plex Mono", ui-monospace, monospace;
                  font-size: 10px; color: ${SP.muted}; margin-top: 3px;
                  overflow:hidden; text-overflow: ellipsis; white-space:nowrap; }
      .kv-list { margin-top: 10px; display:flex; flex-direction:column; gap: 3px; }
      .rule { height:1px; background: rgba(255,179,71,0.10); margin: 4px 0; }
      .adapter-row {
        display:flex; justify-content:space-between; align-items:center;
        padding: 9px 11px; border-radius: 8px;
        border: 1px solid rgba(79,172,255,0.16);
        background: rgba(11,4,22,0.45);
        font-family: "IBM Plex Mono", ui-monospace, monospace;
        font-size: 11px; color: ${SP.ink};
        margin-bottom: 7px;
      }
      .adp-flag { font-size: 9.5px; letter-spacing: 0.14em; text-transform: uppercase;
                  color: ${SP.flareGold}; padding: 2px 8px; border-radius: 999px;
                  border: 1px solid rgba(255,179,71,0.40); background: rgba(255,107,26,0.12); }
      .adp-flag.idle { color: ${SP.faint}; border-color: rgba(255,255,255,0.10); background: transparent; }
      .meter { margin-bottom: 14px; }
      .meter-label { display:flex; justify-content:space-between;
                     font-family: "IBM Plex Mono", ui-monospace, monospace;
                     font-size: 10px; color: ${SP.muted}; margin-bottom: 5px; }
      .meter-val { color: ${SP.coronaCyan}; }
      .meter-bar { height: 4px; background: rgba(255,255,255,0.06);
                   border-radius: 999px; overflow: hidden; }
      .meter-fill { height: 100%;
                    background: linear-gradient(90deg, ${SP.flareOrange}, ${SP.magenta} 60%, ${SP.coronaCyan});
                    box-shadow: 0 0 12px rgba(255,107,26,0.4);
                    animation: meterPulse 2s ease-in-out infinite; }
      @keyframes meterPulse { 0%,100%{opacity:0.85} 50%{opacity:1} }
      .chips { display:flex; flex-wrap: wrap; gap: 5px; }
      .chip { font-family: "IBM Plex Mono", ui-monospace, monospace;
              font-size: 10px; padding: 4px 10px; border-radius: 999px;
              color: ${SP.muted};
              border: 1px solid rgba(255,179,71,0.16);
              background: rgba(11,4,22,0.4);
              cursor: pointer; transition: all .15s ease; }
      .chip.on { color: ${SP.voidDeep}; font-weight: 600;
                 background: linear-gradient(90deg, ${SP.flareGold}, ${SP.flareOrange});
                 border-color: ${SP.flareOrange};
                 box-shadow: 0 0 14px rgba(255,107,26,0.45); }
    `}</style>
  </>;
}

function QaTab() {
  return (
    <Section title="QA · advisories" open={true} onToggle={()=>{}}>
      <div className="qa-row warn">
        <span className="qa-icon">!</span>
        <div><div className="qa-title">3 nodes lack provenance</div>
             <div className="qa-sub">graph.normalize · advisory-204</div></div>
      </div>
      <div className="qa-row ok">
        <span className="qa-icon">✓</span>
        <div><div className="qa-title">Theme tokens validated</div>
             <div className="qa-sub">themeTokens.validateThemeTokens</div></div>
      </div>
      <div className="qa-row">
        <span className="qa-icon">i</span>
        <div><div className="qa-title">Inspector overlay disabled</div>
             <div className="qa-sub">themeTargetInspector</div></div>
      </div>
      <style>{`
        .qa-row { display:flex; gap: 11px; padding: 10px 12px;
                  border-radius: 8px; margin-bottom: 8px;
                  border: 1px solid rgba(255,255,255,0.06);
                  background: rgba(11,4,22,0.4); }
        .qa-row.warn { border-color: rgba(255,179,71,0.34); background: rgba(255,107,26,0.10); }
        .qa-row.ok   { border-color: rgba(124,246,181,0.20); background: rgba(124,246,181,0.06); }
        .qa-icon { width: 20px; height:20px; flex-shrink:0;
                   display:flex; align-items:center; justify-content:center;
                   border-radius: 50%; font-size: 11px; font-weight: 700;
                   font-family: "IBM Plex Sans", system-ui, sans-serif;
                   background: ${SP.faint}; color: ${SP.voidDeep}; }
        .qa-row.warn .qa-icon { background: ${SP.flareOrange}; color: ${SP.voidDeep}; }
        .qa-row.ok   .qa-icon { background: #7CF6B5; color: ${SP.voidDeep}; }
        .qa-title { font-family: "IBM Plex Sans", system-ui, sans-serif;
                    font-size: 12px; color: ${SP.ink}; }
        .qa-sub { font-family: "IBM Plex Mono", ui-monospace, monospace;
                  font-size: 10px; color: ${SP.muted}; margin-top: 2px; }
      `}</style>
    </Section>
  );
}

function EvidenceTab() {
  return (
    <Section title="Graph Visual Inventory" open={true} onToggle={()=>{}}>
      <KV label="node tokens" value="14" tone="cy"/>
      <KV label="edge tokens" value="9" tone="cy"/>
      <KV label="label tokens" value="6" tone="cy"/>
      <KV label="theme targets" value="42" tone="ok"/>
    </Section>
  );
}

function DebugTab() {
  return (
    <Section title="Command Deck" open={true} onToggle={()=>{}}>
      <div className="cmd-line">› <span className="ink">graph.snapshot</span> --as=svg</div>
      <div className="cmd-line muted">› settings.dump</div>
      <div className="cmd-line muted">› theme.swap solar-plasma agartha-dream</div>
      <style>{`
        .cmd-line { font-family: "IBM Plex Mono", ui-monospace, monospace;
                    font-size: 11px; color: ${SP.ink}; padding: 5px 0; }
        .cmd-line.muted { color: ${SP.muted}; }
        .cmd-line .ink { color: ${SP.coronaCyan}; }
      `}</style>
    </Section>
  );
}

function SettingsTab() {
  return (
    <Section title="Settings" open={true} onToggle={()=>{}}>
      <div style={{padding:"14px 4px", color: SP.muted,
                   fontFamily: "IBM Plex Sans", fontSize: 12 }}>
        Settings moved to Control Dock →
      </div>
    </Section>
  );
}

// ---------- Right control dock ----------
const DOCK_ICONS = [
  { id: "physics",    glyph: "⚡", label: "Physics" },
  { id: "labels",     glyph: "Aa", label: "Labels" },
  { id: "appearance", glyph: "◐",  label: "Theme" },
  { id: "inspector",  glyph: "◉",  label: "Inspector" },
];

function ControlDock({ activeIcon, setActiveIcon, dockSections, toggleDock, tweaks }) {
  return (
    <aside className="dock">
      <div className="dock-content">
        <div className="dock-head">
          <span className="dock-eyebrow">CONTROL PLANE</span>
          <span className="dock-divider" />
        </div>
        <DockSection title="Physics · ForceAtlas2" open={dockSections.physics}
                     onToggle={() => toggleDock("physics")} icon="⚡" sectionKey="physics">
          <Slider label="Repel Force"   value={100} min={0} max={400} unit=""    color={SP.flareOrange}/>
          <Slider label="Center Force"  value={200} min={0} max={500} unit=""    color={SP.flareGold}/>
          <Slider label="Link Distance" value={3}   min={1} max={10}  unit="rel" color={SP.magenta}/>
          <div className="row-toggles">
            <MicroToggle label="strongGravity" on={false} />
            <MicroToggle label="linLog" on={false} />
            <MicroToggle label="adjustSizes" on={true} />
          </div>
        </DockSection>
        <DockSection title="Labels" open={dockSections.labels}
                     onToggle={() => toggleDock("labels")} icon="Aa" sectionKey="labels">
          <Slider label="Node label size" value={13} min={8} max={22} unit="px" color={SP.coronaCyan}/>
          <Slider label="Edge label size" value={11} min={8} max={20} unit="px" color={SP.coronaBlue}/>
          <Segmented label="Node label mode" options={["all","selected","hover","zoom"]} active="zoom" />
        </DockSection>
        <DockSection title="Theme" open={dockSections.appearance}
                     onToggle={() => toggleDock("appearance")} icon="◐" sectionKey="theme">
          <div className="palette-row">
            {[SP.coronaCyan, SP.coronaBlue, SP.flareGold, SP.flareOrange, SP.magenta, SP.fuchsia, SP.purple].map(c => (
              <span key={c} className="swatch" style={{ background: c, color: c }} />
            ))}
          </div>
          <Slider label="Panel blur" value={tweaks.blur} min={0} max={28} unit="px"
                  color={SP.flareGold} onChange={tweaks.setBlur}/>
          <Slider label="Glow intensity" value={Math.round(tweaks.intensity*100)} min={0} max={150} unit="%"
                  color={SP.flareOrange} onChange={(v) => tweaks.setIntensity(v/100)}/>
          <div className="row-toggles">
            <MicroToggle label="starfield"   on={true} />
            <MicroToggle label="coronaPulse" on={true} />
            <MicroToggle label="fieldLines"  on={true} />
          </div>
        </DockSection>
        <DockSection title="Inspector" open={dockSections.inspector}
                     onToggle={() => toggleDock("inspector")} icon="◉" sectionKey="inspectorSec">
          <div className="inspector-card">
            <div className="ins-head">
              <span className="ins-dot" style={{ background: SP.flareGold, boxShadow: `0 0 12px ${SP.flareGold}` }}/>
              <span className="ins-label">Selected node</span>
              <span className="ins-id">→ pop out</span>
            </div>
            <div style={{
              fontFamily: "IBM Plex Mono", fontSize: 11, color: SP.muted,
              lineHeight: 1.6
            }}>
              Inspector is now <span style={{color:SP.flareGold}}>draggable</span> over the graph canvas. Drag the title bar to reposition.
            </div>
          </div>
        </DockSection>
      </div>
      <div className="dock-rail">
        {DOCK_ICONS.map(i => (
          <button key={i.id} className={`rail-btn ${activeIcon === i.id ? "active" : ""}`}
                  onClick={() => setActiveIcon(i.id)} title={i.label}>
            <span className="rail-glyph">{i.glyph}</span>
            <span className="rail-label">{i.label}</span>
          </button>
        ))}
      </div>
      <style>{`
        .dock {
          display:flex; flex-direction:row;
          background: linear-gradient(180deg, rgba(20,7,38,0.84), rgba(11,4,22,0.92));
          border-left: 1px solid ${SP.goldBorder};
          backdrop-filter: blur(14px) saturate(140%);
          height: 100%; min-height:0; z-index: 2; position: relative;
        }
        .dock-content { flex: 1; min-width: 0; overflow-y: auto; padding: 16px; }
        .dock-head { display:flex; align-items:center; gap:10px; margin-bottom: 14px; }
        .dock-eyebrow { font-family: "Space Grotesk", system-ui, sans-serif;
                        font-size: 10px; letter-spacing: 0.20em; color: ${SP.flareGold}; }
        .dock-divider { flex:1; height:1px; background: linear-gradient(90deg, ${SP.flareGold}, transparent); }
        .dock-rail { width: 50px; display:flex; flex-direction:column; align-items:center;
                     padding: 12px 6px; gap: 6px;
                     border-left: 1px solid rgba(255,179,71,0.15);
                     background: rgba(3,0,10,0.55); }
        .rail-btn { width: 40px; height: 46px;
                    display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px;
                    border: 1px solid transparent;
                    background: transparent; color: ${SP.muted};
                    border-radius: 8px; cursor: pointer; transition: all .15s ease; }
        .rail-btn:hover { color: ${SP.ink}; background: rgba(255,179,71,0.06); }
        .rail-btn.active { color: ${SP.flareGold};
                           background: linear-gradient(180deg, rgba(255,107,26,0.20), rgba(255,107,26,0.08));
                           border-color: rgba(255,179,71,0.40);
                           box-shadow: 0 0 16px rgba(255,107,26,0.30); }
        .rail-glyph { font-size: 14px; line-height: 1;
                      font-family: "Space Grotesk", system-ui, sans-serif; font-weight: 600; }
        .rail-label { font-family: "IBM Plex Mono", ui-monospace, monospace;
                      font-size: 7.5px; letter-spacing: 0.10em; text-transform: uppercase; }
        .row-toggles { display:flex; flex-wrap:wrap; gap: 6px; margin-top: 10px; }
        .palette-row { display:flex; gap:6px; margin-bottom: 12px; }
        .swatch { width: 20px; height: 20px; border-radius: 5px;
                  border: 1px solid rgba(255,255,255,0.12);
                  box-shadow: 0 0 10px currentColor; }
        .inspector-card { padding: 13px; border-radius: 10px;
                          border: 1px solid rgba(255,179,71,0.24);
                          background: linear-gradient(180deg, rgba(255,107,26,0.08), rgba(11,4,22,0.55)); }
        .ins-head { display:flex; align-items:center; gap:8px; margin-bottom: 10px; }
        .ins-dot { width:8px; height:8px; border-radius:50%; }
        .ins-label { font-family: "Space Grotesk", system-ui, sans-serif;
                     font-size: 12px; color: ${SP.ink}; font-weight: 500; }
        .ins-id { margin-left:auto; font-family: "IBM Plex Mono", ui-monospace, monospace;
                  font-size: 10px; color: ${SP.flareGold}; cursor: pointer; }
      `}</style>
    </aside>
  );
}

function DockSection({ title, open, onToggle, icon, sectionKey, children }) {
  const ctx = window.useTiles && window.useTiles();
  const tiledOut = ctx && sectionKey ? ctx.isTiledOut(sectionKey) : false;
  const startTearOff = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!ctx || tiledOut) return;
    const sx = e.clientX, sy = e.clientY; let dragging = false;
    const onMove = (ev) => {
      if (!dragging && Math.hypot(ev.clientX-sx, ev.clientY-sy) > 8) {
        dragging = true;
        ctx.tileOut(sectionKey, { x: ev.clientX - 60, y: ev.clientY - 14 });
      }
    };
    const onUp = () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };
  return (
    <div className={`dsec ${tiledOut ? "dtiled" : ""}`}>
      <button className="dsec-head" onClick={onToggle} disabled={tiledOut}>
        <span className="dsec-icon">{icon}</span>
        <span className="dsec-title">{title}</span>
        <span className="dsec-tear" title="Tear off" onMouseDown={startTearOff}>⤴</span>
        <span className="dsec-caret">{open ? "▾" : "▸"}</span>
      </button>
      {open && !tiledOut && <div className="dsec-body">{children}</div>}
      {tiledOut && <div className="dsec-ghost">Tiled out</div>}
      <style>{`
        .dsec { margin-bottom: 12px; }
        .dsec-head { width:100%; display:flex; align-items:center; gap: 9px;
                     background: linear-gradient(90deg, rgba(255,107,26,0.12), transparent 70%);
                     border: 1px solid rgba(255,179,71,0.20);
                     border-radius: 8px;
                     padding: 9px 11px;
                     cursor: pointer;
                     color: ${SP.ink}; }
        .dsec-icon { font-family: "Space Grotesk", system-ui, sans-serif;
                     font-size: 12px; color: ${SP.flareGold};
                     width: 18px; text-align:center; }
        .dsec-title { flex:1; text-align:left;
                      font-family: "Space Grotesk", system-ui, sans-serif;
                      font-size: 11px; letter-spacing: 0.10em; text-transform: uppercase;
                      color: ${SP.ink}; }
        .dsec-caret { color: ${SP.flareGold}; font-size: 10px; }
        .dsec-body { padding: 12px 4px 4px; }
        .dsec.dtiled { opacity: 0.42; }
        .dsec.dtiled .dsec-head { border-style: dashed; cursor: not-allowed; }
        .dsec-tear { color: ${SP.muted}; font-size: 11px; cursor: grab;
                     padding: 2px 6px; border-radius: 4px; margin-right: 4px; }
        .dsec-tear:hover { color: ${SP.flareGold}; background: rgba(255,179,71,0.08); }
        .dsec-tear:active { cursor: grabbing; }
        .dsec-ghost { padding: 10px; text-align:center;
                      font-family: "IBM Plex Mono", ui-monospace, monospace;
                      font-size: 9.5px; letter-spacing: 0.18em; color: ${SP.muted}; }
      `}</style>
    </div>
  );
}

function Slider({ label, value, min, max, step = 1, unit = "", color = SP.flareGold, onChange }) {
  const [v, setV] = useStateS(value);
  React.useEffect(() => { setV(value); }, [value]);
  const pct = ((v - min) / (max - min)) * 100;
  return (
    <div className="sl">
      <div className="sl-row">
        <span className="sl-l">{label}</span>
        <span className="sl-v" style={{ color }}>{v}{unit ? ` ${unit}` : ""}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={v}
             onChange={(e) => { const nv = Number(e.target.value); setV(nv); onChange && onChange(nv); }}
             className="sl-range"
             style={{ "--pct": `${pct}%`, "--color": color }} />
      <style>{`
        .sl { margin-bottom: 12px; }
        .sl-row { display:flex; justify-content:space-between;
                  font-family: "IBM Plex Mono", ui-monospace, monospace;
                  font-size: 10.5px; margin-bottom: 5px; }
        .sl-l { color: ${SP.muted}; }
        .sl-range { -webkit-appearance: none; appearance: none;
                    width: 100%; height: 4px; background: transparent;
                    background-image: linear-gradient(to right, var(--color), var(--color) var(--pct), rgba(255,255,255,0.08) var(--pct));
                    border-radius: 999px; cursor: pointer; }
        .sl-range::-webkit-slider-thumb { -webkit-appearance: none; appearance: none;
                                          width: 12px; height: 12px; border-radius: 50%;
                                          background: ${SP.ink}; border: 2px solid var(--color);
                                          box-shadow: 0 0 10px var(--color); }
        .sl-range::-moz-range-thumb { width: 12px; height: 12px; border-radius: 50%;
                                       background: ${SP.ink}; border: 2px solid var(--color);
                                       box-shadow: 0 0 10px var(--color); }
      `}</style>
    </div>
  );
}

function MicroToggle({ label, on: defaultOn }) {
  const [on, setOn] = useStateS(defaultOn);
  return (
    <button onClick={() => setOn(o => !o)} className={`mt ${on ? "on" : ""}`}>
      <span className={`mt-pip ${on ? "on" : ""}`} />
      <span>{label}</span>
      <style>{`
        .mt { display:flex; align-items:center; gap: 5px;
              background: rgba(11,4,22,0.5);
              border: 1px solid rgba(255,255,255,0.10);
              border-radius: 999px;
              padding: 4px 9px 4px 7px;
              color: ${SP.muted};
              font-family: "IBM Plex Mono", ui-monospace, monospace;
              font-size: 9.5px; cursor: pointer; transition: all .15s ease; }
        .mt.on { color: ${SP.flareGold}; border-color: rgba(255,179,71,0.50);
                 background: rgba(255,107,26,0.10); }
        .mt-pip { width:6px; height:6px; border-radius:50%; background: rgba(255,255,255,0.18); }
        .mt-pip.on { background: ${SP.flareOrange}; box-shadow: 0 0 8px ${SP.flareOrange}; }
      `}</style>
    </button>
  );
}

function Segmented({ label, options, active }) {
  const [a, setA] = useStateS(active);
  return (
    <div className="seg">
      <div className="seg-l">{label}</div>
      <div className="seg-row" style={{ gridTemplateColumns: `repeat(${options.length},1fr)` }}>
        {options.map(o => (
          <button key={o} onClick={() => setA(o)} className={a === o ? "on" : ""}>{o}</button>
        ))}
      </div>
      <style>{`
        .seg { margin-bottom: 10px; }
        .seg-l { font-family: "IBM Plex Mono", ui-monospace, monospace;
                 font-size: 10.5px; color: ${SP.muted}; margin-bottom: 5px; }
        .seg-row { display: grid; background: rgba(11,4,22,0.5);
                   border: 1px solid rgba(255,255,255,0.06);
                   border-radius: 8px; padding: 2px; gap: 2px; }
        .seg-row button { font-family: "IBM Plex Mono", ui-monospace, monospace;
                          font-size: 10px; padding: 5px 4px;
                          background: transparent; border: none; color: ${SP.muted};
                          border-radius: 6px; cursor: pointer; }
        .seg-row button.on { color: ${SP.voidDeep}; font-weight: 600;
                             background: linear-gradient(90deg, ${SP.flareGold}, ${SP.flareOrange});
                             box-shadow: 0 0 10px rgba(255,107,26,0.45); }
      `}</style>
    </div>
  );
}

function Footer({ theme }) {
  return (
    <footer className="footer">
      <div className="ft-cluster">
        <span className="ft-tag">CONTROL PLANE</span>
        <span className="ft-state">online</span>
        <span className="sep">·</span>
        <span className="ft-key">theme</span><span className="ft-val">{theme}</span>
        <span className="sep">·</span>
        <span className="ft-key">renderer</span><span className="ft-val">sigma2d</span>
        <span className="sep">·</span>
        <span className="ft-key">layout</span><span className="ft-val">FA2 · θ=1.0</span>
      </div>
      <div className="ft-right">
        <span className="ft-key">selection</span>
        <span className="ft-val hot">live</span>
        <span className="sep">·</span>
        <span className="ft-kbd">⌘K</span>
        <span className="ft-val">command palette</span>
      </div>
      <style>{`
        .footer {
          display:flex; justify-content:space-between; align-items:center;
          padding: 7px 16px;
          background: linear-gradient(180deg, rgba(11,4,22,0.94), rgba(3,0,10,0.96));
          border-top: 1px solid ${SP.goldBorder};
          font-family: "IBM Plex Mono", ui-monospace, monospace;
          font-size: 10.5px; color: ${SP.muted}; z-index: 10; position: relative;
        }
        .ft-cluster, .ft-right { display:flex; align-items:center; gap: 8px; }
        .ft-tag { font-family: "Space Grotesk", system-ui, sans-serif;
                  color: ${SP.flareGold}; letter-spacing: 0.18em;
                  padding: 1px 8px; border-radius: 3px;
                  border: 1px solid rgba(255,179,71,0.28);
                  background: rgba(255,107,26,0.08); }
        .ft-state { color: #7CF6B5; }
        .ft-key { color: ${SP.faint}; }
        .ft-val { color: ${SP.ink}; }
        .ft-val.hot { color: ${SP.flareGold}; }
        .ft-kbd { font-family: "IBM Plex Mono", ui-monospace, monospace;
                  color: ${SP.flareGold};
                  padding: 1px 6px; border-radius: 4px;
                  border: 1px solid rgba(255,179,71,0.34); }
        .sep { color: ${SP.faint}; }
      `}</style>
    </footer>
  );
}

window.TopBar = TopBar;
window.LeftPanel = LeftPanel;
window.ControlDock = ControlDock;
window.Footer = Footer;
