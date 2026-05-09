/* global React, ReactDOM, GraphCanvas, TopBar, LeftPanel, ControlDock, Footer, useTweaks, TweaksPanel, TweakSection, TweakSlider, TweakToggle, TweakRadio, SP */
const { useState: useStateA } = React;

function App() {
  const [theme, setTheme] = useStateA("solar-plasma");
  const [glitter, setGlitter] = useStateA(true);
  const [reduce, setReduce] = useStateA(false);
  const [activeTab, setActiveTab] = useStateA("graph");
  const [activeIcon, setActiveIcon] = useStateA("physics");

  const [sections, setSections] = useStateA({
    graphSources: true, sourceAdapter: true, layout: true,
  });
  const toggleSection = (k) => setSections(s => ({ ...s, [k]: !s[k] }));

  const [dockSections, setDockSections] = useStateA({
    physics: true, labels: false, appearance: true, inspector: true,
  });
  const toggleDock = (k) => setDockSections(s => ({ ...s, [k]: !s[k] }));

  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "intensity": 0.85,
    "blur": 16,
    "drama": "cranked",
    "motionScale": 0.6,
    "clusterDepth": 1,
    "edgeLabels": false,
    "nodeHum": 0.7,
    "nodeFlowSpeed": 0.55,
    "nodeGlow": 1.0
  }/*EDITMODE-END*/;
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  const dramaIntensity = t.drama === "extreme" ? 1.4 : t.drama === "cranked" ? 1.0 : 0.55;
  const finalIntensity = Math.min(1.6, t.intensity * dramaIntensity);

  // Tileable section registry — bodies for tiles
  const tileRegistry = {
    graphSources:  { title: "Graph Sources",   content: () => <window.GraphSourcesBody/>, originPanel: "left" },
    sourceAdapter: { title: "Source Adapter",  content: () => <window.SourceAdapterBody/>, originPanel: "left" },
    layoutFA2:     { title: "Layout · FA2",    content: () => <window.LayoutFA2Body/>, originPanel: "left" },
    physics:       { title: "Physics · FA2",   content: () => <window.PhysicsBody/>, originPanel: "right" },
    labels:        { title: "Labels",          content: () => <window.LabelsBody/>, originPanel: "right" },
    theme:         { title: "Theme",           content: () => <window.ThemeBody tweaks={{ blur: t.blur, setBlur: (v)=>setTweak("blur",v), intensity: t.intensity, setIntensity: (v)=>setTweak("intensity",v) }}/>, originPanel: "right" },
    inspectorSec:  { title: "Inspector",       content: () => <window.InspectorBody/>, originPanel: "right" },
  };

  return (
    <window.TileProvider registry={tileRegistry}>
    <div className="app-shell" data-lw-theme={theme}>
      <TopBar theme={theme} onThemeChange={setTheme}
              glitter={glitter} onGlitter={setGlitter}
              reduce={reduce} onReduce={setReduce} />
      <div className="app-grid">
        <LeftPanel active={activeTab} setActive={setActiveTab}
                   sections={sections} toggleSection={toggleSection} />
        <GraphCanvas intensity={finalIntensity}
                     reduceMotion={reduce}
                     glitter={glitter}
                     motionScale={t.motionScale}
                     clusterDepth={t.clusterDepth}
                     edgeLabels={t.edgeLabels}
                     nodeHum={t.nodeHum}
                     nodeFlowSpeed={t.nodeFlowSpeed}
                     nodeGlow={t.nodeGlow} />
        <ControlDock activeIcon={activeIcon} setActiveIcon={setActiveIcon}
                     dockSections={dockSections} toggleDock={toggleDock}
                     tweaks={{ blur: t.blur, setBlur: (v) => setTweak("blur", v),
                               intensity: t.intensity, setIntensity: (v) => setTweak("intensity", v) }} />
      </div>
      <Footer theme={theme} />
      <TweaksPanel title="Tweaks">
        <TweakSection title="Solar Plasma · drama">
          <TweakRadio label="Mood" value={t.drama}
            options={[{value:"quiet",label:"Quiet"},{value:"cranked",label:"Cranked"},{value:"extreme",label:"Extreme"}]}
            onChange={(v) => setTweak("drama", v)} />
          <TweakSlider label="Glow / contrast" value={t.intensity} min={0.3} max={1.5} step={0.05}
                       onChange={(v) => setTweak("intensity", v)} unit="x" />
          <TweakSlider label="Motion scale" value={t.motionScale} min={0} max={1.5} step={0.05}
                       onChange={(v) => setTweak("motionScale", v)} unit="x" />
          <TweakSlider label="Panel blur" value={t.blur} min={0} max={28} step={1}
                       onChange={(v) => setTweak("blur", v)} unit="px" />
        </TweakSection>
        <TweakSection title="Selection">
          <TweakSlider label="Cluster depth" value={t.clusterDepth} min={0} max={4} step={1}
                       onChange={(v) => setTweak("clusterDepth", v)} unit="hops" />
          <TweakToggle label="Edge labels" value={t.edgeLabels}
                       onChange={(v) => setTweak("edgeLabels", v)} />
        </TweakSection>
        <TweakSection title="Sphere interior">
          <TweakSlider label="Hum (fade rate)" value={t.nodeHum} min={0} max={2} step={0.05}
                       onChange={(v) => setTweak("nodeHum", v)} unit="x" />
          <TweakSlider label="Flow speed" value={t.nodeFlowSpeed} min={0} max={2} step={0.05}
                       onChange={(v) => setTweak("nodeFlowSpeed", v)} unit="x" />
          <TweakSlider label="Glow strength" value={t.nodeGlow} min={0.2} max={2} step={0.05}
                       onChange={(v) => setTweak("nodeGlow", v)} unit="x" />
        </TweakSection>
      </TweaksPanel>
      <window.TileLayer/>
      <window.Inspector tweaks={t} setTweak={setTweak}/>
      <style>{`
        :root { color-scheme: dark; }
        html, body, #root { height: 100%; margin: 0; }
        body {
          font-family: "IBM Plex Sans", system-ui, -apple-system, sans-serif;
          background: ${SP.voidDeep};
          color: ${SP.ink};
          overflow: hidden;
        }
        .app-shell { height: 100vh; display: grid; grid-template-rows: auto 1fr auto; }
        .app-grid {
          display: grid;
          grid-template-columns: 300px 1fr 380px;
          min-height: 0;
          position: relative;
        }
      `}</style>
    </div>
    </window.TileProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
