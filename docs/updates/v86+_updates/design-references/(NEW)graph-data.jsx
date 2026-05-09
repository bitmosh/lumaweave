/* global window */
// Solar Plasma palette
const SP = {
  voidDeep:   "#03000A",
  voidMid:    "#0E0420",
  voidWarm:   "#1B0830",
  coronaBlue: "#4FACFF",
  coronaCyan: "#00D4FF",
  flareOrange:"#FF6B1A",
  flareGold:  "#FFB347",
  magenta:    "#FF1F8F",
  fuchsia:    "#CC2EFA",
  purple:     "#7B2FFF",
  ink:        "#FFE9D6",
  muted:      "rgba(255, 215, 188, 0.55)",
  faint:      "rgba(255, 215, 188, 0.32)",
  goldBorder: "rgba(255, 179, 71, 0.32)",
  goldBorderHot: "rgba(255, 179, 71, 0.62)",
};

// Node kinds → color
const KIND = {
  shell:  { color: SP.flareGold,    name: "shell"   },
  store:  { color: SP.coronaBlue,   name: "store"   },
  render: { color: SP.flareOrange,  name: "render"  },
  theme:  { color: SP.magenta,      name: "theme"   },
  panel:  { color: SP.purple,       name: "panel"   },
  qa:     { color: SP.fuchsia,      name: "qa"      },
  graph:  { color: SP.coronaCyan,   name: "graph"   },
  fixture:{ color: "#7CF6B5",       name: "fixture" },
};

// Deterministic PRNG
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Pre-named module labels
const NAMES = [
  "AppShell","useSettingsStore","SigmaGraphView","buildGraphologyGraph","themePresets",
  "ControlDock","LeftTabPanel","QaPanel","graphVisualTokens","settings.schema",
  "InspectorPanel","applyTheme","getRelationshipNeighborhood","CommandPalette","selectionState",
  "themeTokens","resolveGraphVisualTokens","ThemeTargetInspectorOverlay","panel-registry","CollapsiblePanel",
  "CollapsibleSection","Tile","SettingsPanel","SourceAdapterPanel","sourceAdapterRegistry",
  "useGraphSourceSummary","loadGraphifySource","normalizeGraphifyGraph","graphLabelPolicy","graphStylePolicy",
  "applyGraphLabelPolicy","SystemIndexPanel","systemIndexRegistry","CommandDeckPanel","CommandDeckShell",
  "command-registry","feature-flags","feature-registry","controlSurfaceContract","handleset.registry",
  "perspectiveRegistry","controlPlaneModeRegistry","advisory-registry","qa-registry","qa.store",
  "qa.types","settings.defaults","settings.migrations","settings.store","settings.registry",
  "themeOverrideStorage","themeTargetHeuristics","themeTokenGovernance","themeTokenPaths","themeTargetRegistry",
  "self-graph-adapter","self-graph-generated","fixtures/types","graphifyAdapter","jsonlAdapter",
  "cypherBridge","graphViewElementRegistry","graphVisualThemeMapping","Tile","DockLayout",
  "GraphVisualInventoryPanel","ThemeMappingPanel","panel.types","motionSafetyRegistry","audioSourceRegistry",
  "musicReactiveMapping","syntheticAudioSignal","useTabRegistry","useDockState","useFixtureMode",
  "useTheme","usePanelLayout","useCommandDeck","useQaAdvisories","useSourceAdapter",
  "renderEdges","renderNodes","cameraController","selectionMachine","hoverMachine",
  "edgeBundling","layoutWorker","barnesHutSolver","fa2Solver","linLogSolver",
  "labelOcclusion","labelTruncation","tokenResolver","tokenInheritance","schemaMigration",
  "advisoryEngine","provenanceTracker","sourceManifest","graphReport","fixtureBuilder",
  "neighborhoodWalker","centralityRanker","communityDetector","clusterPainter","spectrumGradient",
];

function clusterGen(seed = 7) {
  const rand = mulberry32(seed);
  const clusters = [
    { cx: 0.50, cy: 0.50, r: 0.10, kind: "shell",   count: 4  }, // core
    { cx: 0.30, cy: 0.42, r: 0.16, kind: "store",   count: 14 },
    { cx: 0.55, cy: 0.32, r: 0.18, kind: "theme",   count: 16 },
    { cx: 0.66, cy: 0.55, r: 0.18, kind: "render",  count: 16 },
    { cx: 0.36, cy: 0.66, r: 0.16, kind: "panel",   count: 14 },
    { cx: 0.72, cy: 0.74, r: 0.14, kind: "qa",      count: 12 },
    { cx: 0.20, cy: 0.78, r: 0.13, kind: "fixture", count: 10 },
    { cx: 0.82, cy: 0.30, r: 0.13, kind: "graph",   count: 14 },
  ];
  const nodes = [];
  let nameIdx = 0;
  clusters.forEach((c, ci) => {
    for (let i = 0; i < c.count; i++) {
      const a = rand() * Math.PI * 2;
      const rr = Math.sqrt(rand()) * c.r;
      const x = c.cx + Math.cos(a) * rr * 1.2;
      const y = c.cy + Math.sin(a) * rr * 1.0;
      const importance = i === 0 ? 1.0 : 0.25 + rand() * 0.6;
      nodes.push({
        id: `n${ci}_${i}`,
        x, y,
        kind: c.kind,
        importance,
        label: NAMES[nameIdx++ % NAMES.length],
        cluster: ci,
        degree: 0,
      });
    }
  });
  return { nodes, clusters };
}

function buildEdges(nodes, seed = 11) {
  const rand = mulberry32(seed);
  const edges = [];
  const byCluster = {};
  nodes.forEach((n, i) => {
    (byCluster[n.cluster] ||= []).push(i);
  });

  // intra-cluster
  Object.values(byCluster).forEach((arr) => {
    const hub = arr[0];
    arr.forEach((idx, j) => {
      if (j === 0) return;
      if (rand() < 0.65) edges.push([hub, idx]);
      // some peer connections
      if (j > 1 && rand() < 0.18) {
        edges.push([arr[1 + Math.floor(rand() * (arr.length - 1))], idx]);
      }
    });
  });

  // inter-cluster: hub-hub + a few cross
  const hubs = Object.values(byCluster).map((a) => a[0]);
  for (let i = 0; i < hubs.length; i++) {
    for (let j = i + 1; j < hubs.length; j++) {
      if (rand() < 0.55) edges.push([hubs[i], hubs[j]]);
    }
  }
  // sparse cross-cluster
  for (let k = 0; k < 14; k++) {
    const a = Math.floor(rand() * nodes.length);
    const b = Math.floor(rand() * nodes.length);
    if (a !== b && nodes[a].cluster !== nodes[b].cluster) edges.push([a, b]);
  }

  // dedupe
  const seen = new Set();
  const out = [];
  edges.forEach(([a, b]) => {
    const k = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (seen.has(k)) return;
    seen.add(k);
    nodes[a].degree++; nodes[b].degree++;
    out.push({ source: a, target: b, kind: nodes[a].kind });
  });
  return out;
}

const _graph = (() => {
  const { nodes, clusters } = clusterGen();
  const edges = buildEdges(nodes);
  // size from degree + importance
  nodes.forEach((n) => {
    n.r = 4 + Math.min(7, n.degree * 0.5) + n.importance * 6;
    n.color = KIND[n.kind].color;
  });
  return { nodes, edges, clusters };
})();

// Floating bookmarks/alerts (not connected to graph)
const BOOKMARKS = [
  { id: "bm1", x: 0.16, y: 0.16, r: 22, color: "#FF4D6D", type: "alert",    label: "PROVENANCE GAP", sub: "advisory-204 · 3 nodes" },
  { id: "bm2", x: 0.86, y: 0.18, r: 18, color: SP.flareGold, type: "pinned", label: "SigmaGraphView", sub: "pinned · render" },
  { id: "bm3", x: 0.92, y: 0.74, r: 14, color: SP.coronaCyan, type: "ref",   label: "FA2 SOLVER",     sub: "reference · barnesHut" },
  { id: "bm4", x: 0.10, y: 0.86, r: 14, color: SP.fuchsia,    type: "alert", label: "QA · 1 fail",    sub: "themeTokens.spec" },
];

window.SP = SP;
window.KIND = KIND;
window.GRAPH = _graph;
window.BOOKMARKS = BOOKMARKS;
