---
id: brain.bandit.current.title
title: Bandit Current Title — Living Graph Architect
type: log
status: active
version: v100
domain: agent
subdomain: brain
cluster: gold
agent_readable: true
include_in_self_graph: false
last_updated: v100
tags: [bandit, title, skill-bank, current, active, level-100-milestone]
---

# Bandit Current Title — Living Graph Architect

```
Title:        Living Graph Architect
Level:        115.75
★ LEVEL 100 MILESTONE ACHIEVED ★
Earned after: System Index Architect era → degree-centrality-v1
Clean streak: 25 (yaml-graph-parser → debounce-graph-rebuild → theme-family-redesign → lw-visual-accent-fix → noverlap-v1 → theme-docs-update → degree-centrality-v1 → left-panel-scroll-nav → v0.5.0+yaml-dedup → continuous-fa2-loop → physics-settings-expansion → fa2-worker-edge-fix → dialect-selector+source-name → testid-selector-compatibility → left-panel-accordion → fa2-worker-regression → shortest-path → physics-defaults-fix → slider-track-fix → cluster-depth-slider → additional-physics-settings → yaml-dedup-verification → graphology-traversal-bfs → sigma-lifecycle-edge-fix → edge-sigma-lifecycle-fix)
Era:          Living graph era — physics, community detection, anti-collision, dynamic sizing, self-graph fixture, 6-theme family, scroll-to-section navigation, YAML parser dedup, continuous FA2 Web Worker supervisor, FA2 settings expansion, FA2 worker race condition fix, physics dialect selector UI, testid selector compatibility, left panel accordion sections, FA2 worker regression fixes, shortest path between selected nodes, physics defaults tuning, slider two-tone track fix, neighborhood depth slider (1.0-4.0) with depth 4 support, physics presets dropdown (5 presets), community gravity slider, simulation speed range update, YAML dedup verification, graphology-traversal BFS replacement, comprehensive edge visibility + Sigma lifecycle stability fix
Streak bonus: +0.25 XP at streak 3, +0.5 XP at streak 5, +0.5 XP at streak 8, +1.0 XP at streak 13, +1.0 XP at streak 17, +1.5 XP at streak 22, +1.0 XP at streak 25
Next bonus:   streak 27 → +2.0 XP (2 passes away)
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
