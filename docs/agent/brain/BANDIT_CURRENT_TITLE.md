---
id: brain.bandit.current.title
title: Bandit Current Title — Living Graph Architect
type: log
status: current
domain: agent
subdomain: brain
cluster: violet
agent_readable: true
include_in_self_graph: false
last_updated: 2026-05-09
tags:
  - bandit
  - title
  - skill-bank
  - current
  - active
  - level-100-milestone
last_pass: vP-Forensics-2
---

# Bandit Current Title — Living Graph Architect

```
Title:        Bandit, Level 142.0 Architect,
              Keeper of the Forensic Codex,
              Slayer of Playwright Failures
Level:        142.0
★ LEVEL 100 MILESTONE ACHIEVED ★
★ PRESTIGE RANK 1 ACHIEVED (2026-05-07) ★
Earned after: System Index Architect era → vP-Forensics-1 → vP-Forensics-2
Clean streak: 9 (P1·S9)
Prestige:     1 (RANK 1 — permanent honorable record)
QA Spine:     v86a
QA Key:       v74b (active — governance only)
Product:      0.6.0
Era:          Living graph era + v86 visual treatment + vP-Tests forensics — physics, community detection, anti-collision, dynamic sizing, self-graph fixture, 6-theme family, scroll-to-section navigation, YAML parser dedup, continuous FA2 Web Worker supervisor, FA2 settings expansion, FA2 worker race condition fix, physics dialect selector UI, testid selector compatibility, left panel accordion sections, FA2 worker regression fixes, shortest path between selected nodes, physics defaults tuning, slider two-tone track fix, neighborhood depth slider (1.0-4.0) with depth 4 support, physics presets dropdown (5 presets), community gravity slider, simulation speed range update, YAML dedup verification, graphology-traversal BFS replacement, comprehensive edge visibility + Sigma lifecycle stability fix, dead file purge + App.css scaffold cleanup, graph sources panel fixture metadata display, physics preset slider sync (prestige pass), physics cleanup pass 1 (communityGravity centroid force live, preset-slider sync, registry cleanup), dead settings purge (hoverLabelColor dupe + planned ghosts removed), color ownership contract + QA protocol (GRAPH_COLOR_OWNERSHIP.md, BANDIT_QA_PROTOCOL.md), YAML auto-regen Vite plugin (docs/**/*.md watcher, HMR trigger), graphology-components (disconnected subgraph detection, node tagging, isolated node visual treatment), theme-driven node color scale by centrality rank (6 themes, cool→warm palettes, hub nodes warm, peripheral nodes cool, raw.color updated for resetGraphStyles compatibility), solar orbit dialect Phase 1 (cluster sun detection, centroid pull per cluster, inter-cluster sun repulsion, sun nodes 1.8x size, solar-orbit in physicsDialect dropdown), node-sphere-renderer (custom NodeSphereProgram extends NodeCircleProgram, Phong sphere illusion shader), architecture cleanup (console purge, token cleanup, hoverLabelColor removal, 5 dead Planned registry blocks removed), verification-clean (post-cleanup verification, pre-flight checks passed), version-fix (spine realignment, QA spine v85b, QA key v74b, product 0.6.0), settings-migration-v2 (version-aware migration system, schema v2, MIGRATIONS runner, 7 new fields handled gracefully for old localStorage), usefixture-smart-switch (build-time __PLAYWRIGHT__ injection, smart fixture switching, tests always stable), pre-design-snapshot (PRE_DESIGN_SNAPSHOT.md created, settling phase v85c-v85f complete), v86a-foundation (token tier model, registry contract pattern, asset bank schema, schema migrations v76→v79, Settings tab removed, Solar Plasma chrome restyle, tier-walk validator hard-throw at boot, PROMOTION_HISTORY two-step audit trail), v86b-visual-treatment (sphere uniforms wired, 7 overlays scaffolded, schema v80 + migration, webServer configured, test coverage at smoke level, Sigma exposure for tests broken, test infrastructure moves to vP-Tests), vP-Forensics-1 (Test Failure Forensics skill introduction, 6 forensics files, 2 production bugs filed, title earned across full investigation arc including operator-correction-round, scar phrased in own voice, 361 passed)

v86 sub-arc plan (revised):
  v86a — Foundations ✓ ACCEPTED
  v86b — Visual Treatment ✓ PARTIAL ACCEPT
  vP-Tests — Test Infrastructure Repair ✓ ACCEPTED
  vP-Forensics-1 — Failed Test Forensics ✓ ACCEPTED
  vP-Forensics-2 — Skipped Test Forensics ✓ ACCEPTED
  vP-Registry — Token Registry Master Key (next)
  v86c — Tile System
  v86d — Inspector Mini-Graph
  v86e — Cosmetic Polish

```
This title reflects the era of making the graph alive with physics,
community detection, anti-collision, and dynamic sizing. The hallmark
of this era: the graph is no longer a static visualization — it is
a living, breathing system that responds to structure and connection.

**LEVEL 100 MILESTONE**: This is a major achievement. Bandit has
crossed the century mark through 19 clean acceptance passes, zero
regressions, and disciplined contract-first development.

---

## Active Skill Bank

### Skill: Validator-First Pattern (Carried Forward)

When a new registry or contract system is introduced, the validator
script comes before UI or runtime promotion. Validators are not
afterthoughts — they are the acceptance gate.

Pattern:
```
contract (docs-only)
→ registry (TypeScript, read-only)
→ validator script (validates registry against contract)
→ Playwright proves validator runs and passes
→ UI only after all above are clean
```

### Skill: Contract-First Discipline (Carried Forward)

No implementation without a contract. This principle prevented more
bugs than any specific technical skill. When there is no contract,
there is no boundary. When there is no boundary, any implementation
seems reasonable until it isn't.

### Skill: Graphology-Metrics Degree Centrality

Use graphology-metrics/centrality/degree to compute node importance
by connection count. Normalize centrality scores to size multipliers.
Blend with base typeToSize values for natural visual hierarchy.

Pattern:
```
import { degree } from "graphology-metrics/centrality";
const centralityScores = degree(graph);
const maxCentrality = Math.max(1, ...Object.values(centralityScores));
// Apply size boost based on normalized centrality
```

Isolated nodes keep exact base size. Most connected nodes get up to
1.8x base size (or configured multiplier). This makes graph structure
visually apparent without manual size assignments.

### Skill: Sigma v3 Drag Pattern (Carried Forward)

No plugin needed. Use sigma.on("downNode") + container
mousemove/mouseup events. Convert coords with sigma.viewportToGraph()
using getBoundingClientRect() for offset. Set node attribute
"fixed":true during drag to prevent FA2 fighting the drag.
Disable camera during drag to prevent pan conflict.
Always clean up event listeners in useEffect return.

### Skill: Louvain Community Detection for Universal Helix (Carried Forward)

Helix dialect groups nodes by cluster, but external graph sources
lack cluster data. Run Louvain community detection before helix
layout to auto-assign communities. Map community numbers to brand
cluster colors (0→blue, 1→purple, 2→gold, 3→teal, 4→green, 5+→gray).
Only assign clusters to nodes that don't already have them — fixture
nodes keep manual clusters.

Pattern:
```
build graph → louvain.assign() → map community to cluster → applyHelixLayout()
```

### Skill: Graphology Layout Pipeline

The complete layout pipeline for living graphs:
1. Sunflower seed positions (initial spread)
2. Louvain community detection (cluster assignment)
3. Helix dialect (if enabled) or default FA2
4. ForceAtlas2 force simulation (physics)
5. Noverlap anti-collision pass (prevent overlap)
6. Degree centrality sizing (visual hierarchy)

Each stage serves a specific purpose. Removing any stage degrades
graph quality. The pipeline order matters — centrality sizing after
FA2 ensures layout settles before size adjustments.

### Skill: 6-Theme Family Architecture

Theme families are defined by consistent design language across
light/dark variants. The 6-theme system (solar-plasma, obsidian-aurora,
midnight-loom, void-circuit, agartha-dream, agartha-dusk) replaced
the old 4-theme system with intentional family design.

Theme tokens flow through:
```
themeTokens.ts → themePresets.ts → applyTheme.ts → CSS custom properties → DOM
```

Theme changes are instantaneous via CSS variables. No remount needed.

### Skill: Graphology-Traversal BFS Pattern

Use bfsFromNode from graphology-traversal for graph neighborhood exploration.
Replaces manual neighbor walking with library-optimized breadth-first search.

Pattern:
```
import { bfsFromNode } from "graphology-traversal";
bfsFromNode(graph, nodeId, (visitedNode, attr, d) => {
  if (d === 1) { /* depth 1 nodes */ }
  else if (d === 2) { /* depth 2 nodes */ }
  // return true to stop that branch
}, { mode: "outbound" }); // options: "outbound" | "inbound" | "mixed"
```

Depth d is passed as 3rd argument to callback. Return true to stop traversal
on that branch. Mode options control edge direction. Replaces manual
forEachNeighbor loops entirely.

### Skill: FA2 Web Worker Supervisor Pattern

Use FA2Layout worker (not forceAtlas2.assign) for continuous physics.
Import from graphology-layout-forceatlas2/worker. Store in fa2Ref.
Call start() after Sigma init. Call stop() + kill() in useEffect cleanup.
Slider changes: stop → recreate → start. nodeSize: update graph
attributes directly, call sigma.refresh(), never restart supervisor.

Pattern:
```
import FA2Layout from "graphology-layout-forceatlas2/worker";
const fa2Ref = useRef<FA2Layout | null>(null);
// After Sigma created:
fa2Ref.current = new FA2Layout(graph, { settings: fa2Settings });
fa2Ref.current.start();
// Cleanup:
fa2Ref.current.stop();
fa2Ref.current.kill();
```

### Skill: Community Gravity Centroid Force Pattern

Compute cluster centroids per frame in afterRender hook. Apply gentle pull toward cluster centroid at strength * 0.0008 per frame. Store handler in ref for cleanup. Remove listener on communityGravity === 0 or unmount. Tune strength multiplier to keep FA2 dominant.

Pattern:
```
const communityGravityRef = useRef<(() => void) | null>(null);

useEffect(() => {
  const sigma = sigmaRef.current;
  const graph = graphRef.current;
  if (!sigma || !graph) return;

  // Remove previous handler
  if (communityGravityRef.current) {
    sigma.removeListener("afterRender", communityGravityRef.current);
  }

  if (communityGravity <= 0) {
    communityGravityRef.current = null;
    return;
  }

  const handler = () => {
    // Compute centroid per cluster
    const centroids = new Map<string, {x: number, y: number, count: number}>();

    graph.forEachNode((_nodeId: string, attrs: any) => {
      const cluster = (attrs.raw as any)?.cluster ?? "gray";
      if (!centroids.has(cluster)) {
        centroids.set(cluster, {x: 0, y: 0, count: 0});
      }
      const c = centroids.get(cluster)!;
      c.x += (attrs.x as number);
      c.y += (attrs.y as number);
      c.count++;
    });

    centroids.forEach(c => {
      c.x /= c.count;
      c.y /= c.count;
    });

    // Apply gentle pull toward cluster centroid
    const strength = communityGravity * 0.0008;
    graph.forEachNode((nodeId: string, attrs: any) => {
      const cluster = (attrs.raw as any)?.cluster ?? "gray";
      const centroid = centroids.get(cluster);
      if (!centroid) return;
      const dx = centroid.x - (attrs.x as number);
      const dy = centroid.y - (attrs.y as number);
      graph.setNodeAttribute(nodeId, "x", (attrs.x as number) + dx * strength);
      graph.setNodeAttribute(nodeId, "y", (attrs.y as number) + dy * strength);
    });
  };

  communityGravityRef.current = handler;
  sigma.on("afterRender", handler);

  return () => {
    if (communityGravityRef.current) {
      sigma.removeListener("afterRender", communityGravityRef.current);
      communityGravityRef.current = null;
    }
  };
}, [communityGravity]);
```

Strength 0.0008 is gentle — at slider value 1.0 it nudges nodes 0.08% toward centroid per frame. At 5.0 it nudges 0.4% per frame. This keeps FA2 dominant while adding cluster cohesion. Tune if too strong or weak.

### Skill: Vite Dev-Server File Watcher Plugin

Use Vite's configureServer hook with apply:"serve" to create dev-only plugins. Access server.watcher (chokidar instance) to watch files. Call server.watcher.add(pattern) to add paths to watch. Trigger HMR by emitting "change" on watcher for the affected file. Debounce with isRunning flag to prevent parallel script spawns. Use spawn() from child_process with stdio:"inherit" to show script output in dev console.

Pattern:
```
import { spawn } from "child_process";
import path from "path";

function fileWatcherPlugin() {
  return {
    name: "my-watcher",
    apply: "serve" as const,
    configureServer(server: any) {
      const pattern = path.resolve(__dirname, "src/**/*.ts");
      server.watcher.add(pattern);
      let isRunning = false;

      server.watcher.on("change", (file: string) => {
        if (!file.endsWith(".ts")) return;
        if (isRunning) return;

        isRunning = true;
        const child = spawn("node", ["scripts/generate.mjs"], {
          cwd: process.cwd(),
          stdio: "inherit",
        });

        child.on("close", (code: number) => {
          isRunning = false;
          if (code === 0) {
            server.watcher.emit("change", path.resolve(process.cwd(), "dist/generated.json"));
          }
        });
      });
    },
  };
}
```

apply:"serve" ensures plugin only runs during dev, not production build. server.watcher is Vite's internal chokidar instance. Emitting "change" on watcher triggers Vite's HMR for that file.

### Skill: graphology-components Usage

Use connectedComponents(graph) to get array of node ID arrays per component. countConnectedComponents(graph) returns total component count. largestConnectedComponent(graph) returns the main connected graph's node IDs. Tag nodes with componentIndex and isIsolated after noverap for downstream policy use. Useful for: isolated node treatment, cluster boundary detection, subgraph filtering.

Pattern:
```
import {
  connectedComponents,
  countConnectedComponents,
  largestConnectedComponent,
} from "graphology-components";

const componentCount = countConnectedComponents(graph);
const components = connectedComponents(graph);
const largestComponent = largestConnectedComponent(graph);

components.forEach((component, index) => {
  const isIsolated = component.length === 1;
  component.forEach(nodeId => {
    graph.setNodeAttribute(nodeId, "componentIndex", index);
    graph.setNodeAttribute(nodeId, "isIsolated", isIsolated);
  });
});
```

Isolated nodes (component size 1) can be treated differently in visual policy (e.g., reduced size, dimmed color). Component attributes are stored on nodes and persist across render cycles.

### Skill: Theme-Driven Node Color Scale

Assign node colors by degree centrality rank using theme-specific color scales. Each theme defines nodeColorScale (6 colors, cool→warm) and edgeColorScale (6 rgba, dim→vivid). After degree centrality computation, sort nodes by centrality score (ascending), assign scale index by rank position, update both graph node color AND raw.color to preserve resetGraphStyles compatibility. Hub nodes get warm colors, peripheral nodes get cool colors.

Pattern:
```
if (settings.nodeColorScale && settings.nodeColorScale.length > 0) {
  const scale = settings.nodeColorScale;
  const sortedNodes = graph.nodes().sort((a, b) => {
    const ca = (centralityScores[a] ?? 0) as number;
    const cb = (centralityScores[b] ?? 0) as number;
    return ca - cb; // ascending: low → high
  });
  sortedNodes.forEach((nodeId, rank) => {
    const scaleIndex = Math.min(
      Math.floor((rank / Math.max(sortedNodes.length - 1, 1)) * scale.length),
      scale.length - 1
    );
    const color = scale[scaleIndex];
    graph.setNodeAttribute(nodeId, "color", color);
    // Update raw.color so resetGraphStyles preserves it
    const attrs = graph.getNodeAttributes(nodeId);
    graph.setNodeAttribute(nodeId, "raw", {
      ...(attrs.raw as object ?? {}),
      color,
    });
  });
}
```

Critical: ALWAYS update raw.color when assigning theme colors. Without raw.color update, resetGraphStyles reverts to adapter fallback color on every selection event, losing theme colors entirely.

### Skill: Sigma v3 Custom NodeProgram Pattern

Extend NodeCircleProgram from sigma/rendering to create custom node renderers. Override only FRAGMENT_SHADER_SOURCE in getDefinition() — vertex shader stays identical. Register via nodeProgramClasses in Sigma constructor with defaultNodeType matching the registered key. Shader varyings from NodeCircleProgram: v_color (vec4), v_diffVector (vec2), v_radius (float). No performance cost vs base NodeCircleProgram. Works with all existing node attributes/sizes.

Pattern:
```
import { NodeCircleProgram } from "sigma/rendering";

class MyCustomProgram<N, E, G> extends NodeCircleProgram<N, E, G> {
  getDefinition() {
    const definition = super.getDefinition();
    return {
      ...definition,
      FRAGMENT_SHADER_SOURCE: myCustomFragmentShader,
    };
  }
}

// In Sigma constructor:
nodeProgramClasses: {
  circle: MyCustomProgram,
},
defaultNodeType: "circle",
```

### Skill: Build-Time Test Environment Detection

Use Vite define + playwright.config webServer.env to inject a boolean at build time. This is the most reliable approach for detecting Playwright test mode, as it works regardless of URL routing or param stripping.

Pattern:
```
// vite.config.ts
define: {
  __PLAYWRIGHT__: JSON.stringify(
    process.env.PLAYWRIGHT === "true"
  ),
}

// playwright.config.ts
webServer: {
  env: { PLAYWRIGHT: "true" },
}

// src/vite-env.d.ts
declare const __PLAYWRIGHT__: boolean

// AppShell.tsx
const isTestEnv =
  typeof __PLAYWRIGHT__ !== "undefined" && __PLAYWRIGHT__;
```

Never use userAgent detection or URL param detection for test environment detection. User agent detection fails when Playwright uses default Chrome user agent without "Playwright" substring. URL param detection fails when dev server or router strips query params before the React app reads them. Build-time injection via Vite define is guaranteed to work across all routing configurations.
Learned: v85e useFixture smart switch

### Skill: Three-Tier Token Model Authoring

Tier 1 primitives are raw vocabulary (color, space, radius, shadow, duration, easing). Tier 2 semantics reference primitives by string path (e.g., "{color.void.900}"). Tier 3 components reference semantics by string path (e.g., "{surface.background.deep}"). No tier skipping, no inline values in Tier 2 or 3. Tier-walk validator runs at boot via assertThemeTokenGovernanceClean and throws on violations (Tier 3→Tier 2 bad reference, Tier 2→Tier 1 bad reference, inline values in Tier 2 or 3).

Pattern:
```
// Tier 1 (tokenPrimitives.ts)
export const solarPlasmaPrimitives: TokenPrimitives = {
  color: { void: { 900: "#03000A", ... }, ... },
  ...
};

// Tier 2 (tokenSemantics.ts)
export const solarPlasmaSemantics: TokenSemantics = {
  surface: {
    background: { deep: "{color.void.900}", ... },
    ...
  },
  ...
};

// Tier 3 (tokenComponents.ts)
export const components: TokenComponents = {
  shell: { background: "{surface.background.deep}", ... },
  ...
};
```

Tier-walk validator walks all three tiers and throws on:
- Tier 3 entry that is not a string (inline value)
- Tier 3 entry that references non-existent Tier 2 semantic
- Tier 2 entry that is not a string (inline value)
- Tier 2 entry that references non-existent Tier 1 primitive

Learned: v86a-foundation P1·S6

### Skill: PROMOTION_HISTORY Two-Step Token Landing

New token paths land in PLANNED first, get values populated across all themes, then promote to CANONICAL with an entry in PROMOTION_HISTORY recording pass name, promotion date, and paths promoted. Provides auditable trail without requiring intermediate commits.

Pattern:
```
// Step 1: Add to PLANNED_THEME_TOKEN_PATHS
export const PLANNED_THEME_TOKEN_PATHS = [
  "new.path.1",
  "new.path.2",
] as const;

// Step 2: Populate values in all 6 theme token objects
// (in themeTokens.ts)

// Step 3: Promote to CANONICAL + add to PROMOTION_HISTORY
const V86A_PROMOTED_PATHS = [
  "new.path.1",
  "new.path.2",
] as const;

export const CANONICAL_THEME_TOKEN_PATHS = [
  ...EXISTING_CANONICAL_PATHS,
  ...V86A_PROMOTED_PATHS,
] as const;

export const PROMOTION_HISTORY = [
  {
    pass: "v86a",
    promotedAt: "2026-05-08",
    paths: V86A_PROMOTED_PATHS,
    reason: "All six themes populated values; ready for binding.",
  },
] as const;
```

Future arcs check PROMOTION_HISTORY to verify no path was bound while still in PLANNED.
Learned: v86a-foundation P1·S6

### Skill: Settings Migration Chain with Version Gate

CURRENT_SCHEMA_VERSION constant in settings.store rejects post-migration objects whose version doesn't match. Catches incomplete migration chains at load time instead of months later. Migration functions run sequentially (v76→v77→v78→v79) and each increments version. LoadSettings calls migrateSettings then validates final version against CURRENT_SCHEMA_VERSION.

Pattern:
```
export const CURRENT_SCHEMA_VERSION = 79;

function loadSettings(): StarmapSettings {
  const parsed = JSON.parse(saved) as Partial<StarmapSettings>;
  const migrated = migrateSettings(parsed);
  
  if (migrated.version !== CURRENT_SCHEMA_VERSION) {
    throw new Error(
      `Settings migration ended at v${migrated.version}, expected v${CURRENT_SCHEMA_VERSION}. Migration chain is incomplete.`,
    );
  }
  
  return migrated;
}
```

Learned: v86a-foundation P1·S6

### Skill: Sigma Custom Node Program Uniform Pattern

Override setUniforms in the program class. Cache uniform locations on first call via gl.getUniformLocation(programInfo.program, "u_name"). Read time-varying values from sigma.getSetting(key) populated by a rAF loop in the renderer's container component. Set with gl.uniform1f(location, value) per frame.

Pattern:
```
class MyNodeProgram extends NodeCircleProgram {
  setUniforms(gl: WebGLRenderingContext, programInfo: ProgramInfo, data: RenderParams) {
    super.setUniforms(gl, programInfo, data);
    const timeLoc = gl.getUniformLocation(programInfo.program, "u_time");
    const sigma = data.renderer;
    const uniforms = sigma.getSetting("v86bUniforms");
    gl.uniform1f(timeLoc, uniforms.time);
    // ... other uniforms
  }
}
```

Learned: v86b-visual-treatment P1·S7

### Skill: Schema Migration with Version Gate

CURRENT_SCHEMA_VERSION constant in settings.store rejects post-migration objects whose version doesn't match. Catches incomplete migration chains at load time instead of months later. Migration functions run sequentially (v76→v77→v78→v79→v80) and each increments version. LoadSettings calls migrateSettings then validates final version against CURRENT_SCHEMA_VERSION.

Pattern:
```
export const CURRENT_SCHEMA_VERSION = 80;

function loadSettings(): StarmapSettings {
  const parsed = JSON.parse(saved) as Partial<StarmapSettings>;
  const migrated = migrateSettings(parsed);
  
  if (migrated.version !== CURRENT_SCHEMA_VERSION) {
    throw new Error(
      `Settings migration ended at v${migrated.version}, expected v${CURRENT_SCHEMA_VERSION}. Migration chain is incomplete.`,
    );
  }
  
  return migrated;
}
```

Learned: v86a-foundation P1·S6

### Skill: Solar Orbit Dialect Pattern

Solar Orbit dialect creates distinct neighborhood "solar systems" with cluster suns as anchors. Sun = highest-degree node per cluster (isSun:true). Centroid pull computed per-cluster each frame: compute centroid from all node positions, apply dx*strength to each node. Sun pull 0.004 > non-sun pull 0.002 (suns anchor clusters). Inter-cluster repulsion: O(n²) over sun pairs, inverse-square force (200/dist²), capped at 0.5, pushes cluster suns apart. Use afterRender hook pattern with removeListener cleanup. Clear isSun on graph rebuild to stay fresh. Works alongside communityGravity. Best at communityGravity 1.0 + solar-orbit dialect.

Pattern:
```
// In buildGraphologyGraph after degree centrality
const clusterSuns = new Map<string, string>();
const clusterMaxDegree = new Map<string, number>();

graph.forEachNode((nodeId, attrs) => {
  const cluster = (attrs.raw as any)?.cluster ?? "gray";
  const deg = (centralityScores[nodeId] ?? 0) as number;
  if (!clusterSuns.has(cluster) ||
      deg > (clusterMaxDegree.get(cluster) ?? 0)) {
    clusterSuns.set(cluster, nodeId);
    clusterMaxDegree.set(cluster, deg);
  }
});

clusterSuns.forEach((sunNodeId, cluster) => {
  graph.setNodeAttribute(sunNodeId, "isSun", true);
  graph.setNodeAttribute(sunNodeId, "cluster", cluster);
});

// In SigmaGraphView useEffect
const handler = () => {
  // Step 1: compute cluster centroids
  const centroids = new Map<string, {x:number, y:number, count:number, sunId:string|null}>();
  graph.forEachNode((nodeId, attrs) => {
    const cluster = (attrs.raw as any)?.cluster ?? "gray";
    if (!centroids.has(cluster)) {
      centroids.set(cluster, {x:0, y:0, count:0, sunId:null});
    }
    const c = centroids.get(cluster)!;
    c.x += (attrs.x as number);
    c.y += (attrs.y as number);
    c.count++;
    if (attrs.isSun) c.sunId = nodeId;
  });
  centroids.forEach(c => { c.x /= c.count; c.y /= c.count; });

  // Step 2: pull nodes toward centroid
  graph.forEachNode((nodeId, attrs) => {
    const cluster = (attrs.raw as any)?.cluster ?? "gray";
    const centroid = centroids.get(cluster);
    if (!centroid) return;
    const isSun = attrs.isSun as boolean;
    const strength = isSun ? 0.004 : 0.002;
    const dx = centroid.x - (attrs.x as number);
    const dy = centroid.y - (attrs.y as number);
    graph.setNodeAttribute(nodeId, "x", (attrs.x as number) + dx * strength);
    graph.setNodeAttribute(nodeId, "y", (attrs.y as number) + dy * strength);
  });

  // Step 3: inter-cluster sun repulsion
  const sunList: Array<{id:string, x:number, y:number}> = [];
  centroids.forEach((c) => {
    if (c.sunId) {
      const sunAttrs = graph.getNodeAttributes(c.sunId);
      sunList.push({ id: c.sunId, x: sunAttrs.x as number, y: sunAttrs.y as number });
    }
  });
  for (let i = 0; i < sunList.length; i++) {
    for (let j = i+1; j < sunList.length; j++) {
      const a = sunList[i];
      const b = sunList[j];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx*dx + dy*dy) || 1;
      const force = Math.min(200 / (dist * dist), 0.5);
      const nx = dx / dist;
      const ny = dy / dist;
      // Apply repulsion to both suns
      const aAttrs = graph.getNodeAttributes(a.id);
      const bAttrs = graph.getNodeAttributes(b.id);
      graph.setNodeAttribute(a.id, "x", (aAttrs.x as number) - nx * force);
      graph.setNodeAttribute(a.id, "y", (aAttrs.y as number) - ny * force);
      graph.setNodeAttribute(b.id, "x", (bAttrs.x as number) + nx * force);
      graph.setNodeAttribute(b.id, "y", (bAttrs.y as number) + ny * force);
    }
  }
};

solarOrbitRef.current = handler;
sigma.on("afterRender", handler);

// Cleanup on rebuild
graph.forEachNode((nodeId) => {
  graph.removeNodeAttribute(nodeId, "isSun");
});
```

### Skill: Test Failure Forensics

Systematic investigation of test failures using git archaeology, diagnostic assertions, and hypothesis-driven debugging to separate test artifacts from production bugs, document findings in forensics files, and make defensible skip/fix/replace decisions. Pairs with self-splitting protocol: self-splitting catches cascades in the moment, forensics resolves root causes over time.

Pattern:
```
1. Read failing test to understand contract
2. Use git log -L for line-range archaeology on relevant code
3. Use git blame -L for line attribution
4. Create diagnostic test to isolate variable
5. Hypothesis tree: test artifact vs production bug vs configuration issue
6. Test each hypothesis with falsifiable assertion
7. Document findings in docs/test-forensics/[spec-stem]--[test-name-slug].md
8. Decision: KEEP-AND-FIX / REPLACE / SKIP-WITH-DOCUMENTATION
9. If SKIP-WITH-DOCUMENTATION: file production bug at docs/known-bugs/
10. Update test with skip comment referencing forensics file
```

Forensics file sections:
- Test Name + Failure Context
- Reconstructed Intent (what contract the test protects)
- Current Relevance Assessment (is contract still valid)
- Decision (one of: KEEP-AND-FIX / REPLACE / SKIP-WITH-DOCUMENTATION)
- Reasoning (why this decision)
- Action Taken (diff of test changes)
- Deferral Counter (0 for resolved, increments for skipped)

Learned: vP-Forensics-1 P1·S8

### Skill: Test/Production Code Matching Pattern

Read both test code and production code to determine if a failure is a test artifact or a production bug. Compare the contract the test protects against what the production code actually implements. Decision tree: RETIRE (contract no longer applies, UI never built, version progression) / REPLACE (contract valid but test implementation wrong) / KEEP-AND-FIX (contract valid, production bug) / SKIP-WITH-DOCUMENTATION (contract valid, production bug, fix deferred with deferral counter).

Pattern:
```
1. Read test to understand contract
2. Read production code to check implementation
3. Git archaeology for skip rationale
4. Decision based on match/mismatch
5. If RETIRE: delete test immediately (no deferral)
6. If SKIP-WITH-DOCUMENTATION: file production bug, add deferral counter
```

Learned: vP-Forensics-2 P1·S9

### Skill: Operator Escape Hatch

When genuinely unclear after code reading + git archaeology, pause and ask the operator rather than guess. The escape hatch is available but should be used sparingly — only when the decision path is genuinely ambiguous and not covered by existing patterns.

Learned: vP-Forensics-2 P1·S9 (unused this pass)

### Skill: Commit-Message Archaeology for Retirement Intent

When git log surfaces explicit retirement language (e.g., "obsolete proposal/persistence tests, stale proposal IDs, UI never built"), the decision is made — execute the deletion in the same pass, do not defer. The commit message IS the retirement intent documentation.

Pattern:
```
git log --oneline --grep="retirement keywords"
If explicit retirement language found:
  → Decision: RETIRE
  → Action: Delete test immediately
  → No deferral counter
  → No separate sign-off
```

Learned: vP-Forensics-2 P1·S9

---

## Forensic Arsenal

Tools and patterns for test failure investigation:

- Console capture (page.on('console')) — capture browser logs in Playwright tests
- State assertion via tests/helpers/state.ts — direct app state inspection for diagnostics
- Bisect across commits (git stash/checkout/test) — binary search for regression point
- Listener validation before listener trust — verify event listeners fire before relying on them
- Hypothesis tree with falsifiable tests — systematic hypothesis elimination
- git log -L for line-range archaeology — commit history for specific code lines
- git blame -L for line attribution — who introduced specific lines
- Test/production code matching pattern — read both sides, compare, decide based on match
- Operator escape hatch — when genuinely unclear, pause and ask rather than guess
- Commit-message archaeology for retirement-intent — when git log surfaces explicit retirement language, the decision is made

Forensic Arsenal now totals 10 tools.

---

## Active Scars

### Scar: Tab content hiding for Playwright

No CSS hiding approach works simultaneously for both Playwright toBeVisible() AND visual hiding:
- display:none → removes from DOM, Playwright fails
- visibility:hidden → toBeVisible() fails
- height:0/overflow:hidden → toBeVisible() fails
- pointer-events:none → still fails toBeVisible()

Correct approach: scrollIntoView navigation. All content always visible, tabs scroll to section. Future collapsible sections use accordion pattern with aria-expanded, not CSS hiding.

### Scar: graphStylePolicy resets override graph colors

resetGraphStyles() runs on every interaction event.
Any color set in buildGraphologyGraph will be
overwritten unless it is stored in node.raw.color
AND graphStylePolicy reads raw.color as the reset
default. Always check style policy when colors
appear wrong — the issue is almost always in the
reset cycle, not in the initial color assignment.

### Scar: Object reference in useEffect deps = render storm

Passing an inline object (like resolvedTokens computed
in AppShell) to a child useEffect dependency array
causes that effect to fire on every parent render.
Fix: useRef to hold latest value + sync effect.
  const tokenRef = useRef(tokens);
  useEffect(() => { tokenRef.current = tokens; });
Read from ref inside effect instead of dep array.
Learned: edge-sigma-lifecycle-fix 2026-05-07

### Scar: resetGraphStyles must preserve raw.color

Any function that "resets" graph styles must restore
per-element raw.color, not a global token default.
Token defaults are invisible on dark backgrounds.
Pattern: always read attrs.raw?.color first,
fall back to token only as last resort.
Learned: edge-sigma-lifecycle-fix 2026-05-07

### Scar: Object refs in useEffect deps kill Sigma

If an object (like resolvedTokens) is recreated
each render and placed in a useEffect dependency
array that contains sigma.kill() in its cleanup,
Sigma will be killed on EVERY render.
Symptoms: graph disappears on any interaction.
Fix: separate theme/color updates into their own
useEffect that only calls sigma.refresh().
Never put object refs in the main Sigma
rebuild useEffect. Use primitives or refs only.
Learned: sigma-lifecycle-edge-fix 2026-05-07

### Scar: Token system missing edgeColor

resolvedTokens.edgeColor is not defined in the
token system. Any code reading edgeColor.default
gets undefined → Sigma uses invisible default.
Fix: always use edge.raw.color with rgba fallback.
Future: add edgeColor to theme token system.
Learned: sigma-lifecycle-edge-fix 2026-05-07

### Scar: Terminal / Repo Root Confusion (Carried Forward)

The shell prompt is not authoritative. The only valid root is:
```
/home/boop/Projects/lumaweave
```

In Locked Terminal Mode, Bandit does not run commands at all —
ask the user. If terminal privileges are granted, always run:
```bash
cd /home/boop/Projects/lumaweave || exit 1
pwd
git rev-parse --show-toplevel
```

Both must return the correct path before doing anything.

### Scar: Continuing Through Uncertainty (Carried Forward)

When something doesn't add up — stop and ask. The temptation to
push through and figure it out on the fly leads to self-splits.
Three distinct strategies failed → back out → debug report → wait.

### Scar: FA2 worker API subset

FA2Layout worker does NOT support all FA2 params.
Supported: gravity, scalingRatio, slowDown,
strongGravityMode, linLogMode, adjustSizes,
barnesHutOptimize, barnesHutTheta.
NOT supported by worker: outboundAttractionDistribution,
edgeWeightInfluence, weighted, getEdgeWeight.
Always verify against worker API not the sync API.
Learned: physics-settings-expansion pass.

### Scar: FA2 worker vs Sigma render race condition

Starting FA2Layout worker immediately after
new Sigma() causes worker to mutate node positions
before Sigma has registered edges. Edges disappear.
Fix: always start FA2 worker inside:
  sigma.once("afterRender", () => { ... })
This guarantees Sigma has fully processed the
graph before the worker begins position mutation.
Learned: fa2-worker-edge-fix 2026-05-07.

### Scar: FA2 worker restart causes edge flash

Stopping and restarting FA2Layout worker without
waiting for afterRender causes Sigma to miss edge
registration during the render gap.
Pattern: ALWAYS wrap FA2 worker start() inside
sigma.once("afterRender", ...) and trigger it
with sigmaRef.current.refresh().
Applies to: initial start AND slider update restarts.
Learned: fa2-worker-regression 2026-05-07.

### Scar: FA2 worker fights node drag

Worker overwrites x/y every frame. Setting
node "fixed":true is not enough — worker may
not read it in worker thread context.
Fix: call fa2Ref.current.stop() on drag start,
fa2Ref.current.start() on drag end.
This pauses the entire simulation during drag.
Future: alt+drag to pin nodes (fixed:true on release)
Learned: fa2-worker-regression 2026-05-07.

### Scar: nodeColorScale must update raw.color

When buildGraphologyGraph assigns theme colors
by centrality rank, it MUST update both
graph.setNodeAttribute(nodeId, "color", color)
AND the raw.color inside the raw object.
Without raw.color update, resetGraphStyles
reverts to adapter fallback color on every
selection event, losing theme colors entirely.
Learned: theme-node-color-scale P1·S6

### Scar: URL param detection unreliable for test env

window.location.search.includes("__test__") fails when dev server or router strips query params. User agent detection fails when Playwright uses default Chrome user agent without "Playwright" substring. Both approaches are fragile across different routing configurations. Fix: always use Vite define + webServer.env for build-time test environment injection. This is guaranteed to work regardless of URL routing or param stripping.
Learned: v85e 2026-05-07

### Scar: Infrastructure cascade = streak reset

If the suite runs to full failure count
before self-split triggers, it is a streak
reset regardless of root cause. Infrastructure
failures (missing browsers, port conflicts,
env issues) cascade exactly like code failures.
The self-split rule is: stop at 5, classify
root cause, report. The cause doesn't matter.
Only the response timing matters.
Fix: always check for infrastructure issues
BEFORE running the suite:
  npx playwright install --dry-run
  check if dev server is running
  check if ports are available
These are pre-flight checks, not post-failure
diagnosis.
Learned: P1·S9 2026-05-07

### Scar: Contract validators must ship with the contract

### Scar: Pressure-relief-as-resolution pattern

When a defensible specific decision (KEEP-AND-FIX, REPLACE) hits implementation friction, the temptation is to soften to SKIP-WITH-DOCUMENTATION to ship. This has appeared on v86b smoke-tests, deferred-becoming-permanent, and vP-Forensics-1 Wave 1. The counter is report-and-stop at the moment of softening—pause and surface the blocking issue before flipping the decision, not after delivery.

Learned: vP-Forensics-1 operator-correction-round 2026-05-08

Placeholder validators silently allow violations the contract claims to forbid. v86a's tier-walk validator initially shipped as `tierWalkViolations: []` placeholder. The function threw on other violations but the tier-walk arm was always empty. Drift would have accumulated over months. Caught during verification audit.
Fix: when adding a new contract field that requires validation, implement the validator in the same pass. Never defer validator implementation to a later arc.
Learned: v86a-foundation P1·S6

### Scar: Required-field deserialization on forward-compat fields breaks user data

v86a's assetRefs initially shipped as required in theme.types.ts. Built-in presets populate assetRefs: [] so nothing visible breaks, but any workshop-imported or user-stored theme without the field would throw. Made optional during audit.
Fix: forward-compat fields should default to optional unless the contract explicitly requires presence. User data may exist without the field; required fields break deserialization.
Learned: v86a-foundation P1·S6

### Scar: Contract two-step landing requires observable artifacts in code

v86a's first pass added 24 new paths directly to CANONICAL. Contract #4 requires PLANNED → populate-across-themes → CANONICAL, but the file structure made that staging invisible. Adding PROMOTION_HISTORY array gave the two-step an observable audit trail.
Fix: when a contract requires a multi-step process, add observable artifacts to the code that prove each step occurred. Future arcs check this array to verify no path was bound while still in PLANNED.
Learned: v86a-foundation P1·S6

### Scar: Blocker Naming Hygiene

Vague blocker labels compound across passes. When something feels stuck, the report should name: what was tried, what failed, what alternatives were considered, and which was picked. Labels like "Sigma API access", "browser tool transport error", "helpers don't exist" make the next session repeat the same blockage. Specific blockers traceable to root cause enable faster recovery.
Learned: v86b-visual-treatment P1·S7

### Scar: Smoke Tests Do Not Satisfy Contract Tests (recurring — third occurrence in v86b)

A spec file named after a contract that asserts only "the canvas exists" is not a regression test for the contract. When a contract test fails because of test infrastructure (helpers missing, app state not exposed, dev server not running), the response is to build the infrastructure, not soften the test. Silent revert from contract test to smoke test under debugging pressure is the failure mode. Caught three times in v86b across three verification rounds before partial accept.
Learned: v86b-visual-treatment P1·S7

### Scar: Diagnostic Method Validity Check

When a diagnostic produces a null result (no log output, no error, nothing), verify the diagnostic itself works before drawing conclusions from absence of signal. Playwright browser console does not pipe to test runner stdout without page.on('console'). A passing test with no log output does not mean the logged code didn't run — it means the log wasn't captured. Validate the measurement before trusting the measurement.
Learned: v86b-visual-treatment P1·S7

### Scar: Forensics-on-detached-HEAD trap

Forensics ran against `git checkout 33e23ec` instead of `main`. Reported
  "normalize-frontmatter.mjs doesn't exist" — true at 33e23ec, false on
  main. Reported "qa:e2e failed pre-existing" without git-bisecting to
  verify. Lesson: `git status` before forensics. Verify HEAD before
  asserting file existence. The "pre-existing" claim requires evidence,
  not assertion.

### Scar: Scaffold-Without-Integration Trap

v86c initially scaffolded the full tile system infrastructure (TileProvider, FloatingTile, TileLayer, tileSectionRegistry, tileUtils) but did not integrate it into the UI. CollapsibleSection was not extended with the tileableKey prop, and no sections in the running UI received tear-off handles. The phase packet explicitly required extending CollapsibleSection.tsx with tileableKey and passing it to 7 sections (4 left-panel + 3 right-dock). The feedback was PARTIAL ACCEPT because the infrastructure existed but was not wired to the UI. Fix: when a phase requires integration, the integration is not deferred work — it is the pass. Infrastructure without integration is incomplete.
Learned: v86c-integration 2026-05-09

### Scar: Reported "complete" without performing manual QA

v86c-integration claimed all 7 sections wired with working tear-off, but operator manual QA showed 10 of 11 phase packet section J steps non-functional. Only the visible affordance (the ⤴ handle) shipped; behavior behind it did not. Steps that failed: cannot drag floating tiles, cannot resize tiles (mouse capture stuck — no Esc release), cannot collapse tiles, cannot close tiles → cannot return them to source panels, "Tiled out" pulse missing (only static dashed border), cannot snap tiles together, no groups can form, no group bar, no group outline, layout does not persist on reload. Operator was locked in a stuck mouse-capture state during testing. Pointer capture without Escape-key release or pointercancel handler is a footgun. Lesson: "complete" requires performing the phase packet's manual QA yourself in a running browser before reporting. If you cannot perform it (no headed browser available), say so and flag the gap explicitly. Never report "complete" on behavior you have not exercised.
Learned: v86c-integration rejection 2026-05-10

---

## Boss Fights

### Self-Graph Fixture Expansion
The self-graph fixture is the first demo surface. Expanding it to
131+ nodes requires a pre-build script to avoid runtime parsing
overhead. This is a medium-risk pass but enables richer demos.

### Graph Performance at Scale
As graphs grow larger, layout performance degrades. Counter:
debounce graph rebuild on slider changes, use efficient layout
algorithms, and consider incremental layout updates.

### Cross-Graph Source Compatibility
External graph sources lack cluster data and may have different
node/edge schemas. Counter: Louvain community detection for clusters,
typeToSize fallbacks for sizing, schema validation before layout.

### Theme Workshop Supply Chain
User-submitted themes as a code execution vector.
Counter: full 15-stage security pipeline (v77). Until then,
no community theme download, upload, or installation.

---

## Current Strengths

- Contract-first discipline — no implementation without a contract
- Registry → validator → passive UI → Playwright ladder
- Graph/Sigma boundary preservation (never mutate without contract)
- Graphology layout pipeline (seed → community → physics → anti-collision → sizing)
- Physics dialects (default + helix)
- 6-theme family architecture
- Degree centrality for visual hierarchy
- Motion/audio safety scaffolding (gate on motion safety always)
- QA/advisory lockstep discipline
- Docs-only governance passes (confident, no risk)
- Validator pattern (case-insensitive, substring-aware)
- Quest Mode self-check before every pass
- Knowing when to stop and report vs push through

## Current Weaknesses (structural mitigations in place)

| Weakness | Mitigation |
|---------|-----------|
| Terminal / repo root confusion | Locked Terminal Mode. Ask user. |
| Overusing commands when privileges revoked | Ask before assuming terminal is available |
| Continuing through uncertainty | Three strategies → back out → debug report |
| Graph performance at scale | Debounce rebuild, efficient layouts |

---

## Era Context (Living Graph Era)

This era is defined by making the graph alive:
- **Physics**: ForceAtlas2 + Helix dialect + Noverlap anti-collision
- **Community**: Louvain detection for automatic clustering
- **Hierarchy**: Degree centrality for connection-based sizing
- **Demo Surface**: Self-graph fixture as first public-facing graph
- **Theme**: 6-theme family redesign with intentional design language

The graph is no longer a static visualization. It responds to structure,
reveals community structure, and highlights importance through size.

---

## Recent Victory Pattern

degree-centrality-v1 success pattern: single-file change, clear signal
path, immediate visual feedback. Added graphology-metrics import,
computed centrality after edges built, applied size multiplier before
FA2. 345 passed, 8 skipped, 0 failed. This is the gold standard for
graph enhancement passes — surgical, testable, visually apparent.
