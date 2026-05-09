# Phase Packet: v86b Visual Treatment

## A. Phase Mission

Make the graph beautiful. Land the glass-sphere shader uniforms, the Solar Plasma backdrop layer, the interaction overlay (click halo, glitter field, floating bookmarks, minimap, camera HUD), the cluster-depth dimming feature, and the edge plasma v1 SVG overlay. Wrap Sigma's camera with the design's interaction model (left-pan, right-rotate, scroll-zoom, eased transitions).

This is the visual centerpiece of v86. Users spend most of their time looking at the graph; this is what they will see.

## B. Scope Boundaries

### Allowed

- `SigmaGraphView.tsx` — uniforms wiring, overlay mount points, camera wrapper hook
- `NodeSphereProgram.ts` — fragment shader extension (3 new uniforms + interior flow)
- `graphStylePolicy.ts` — extended with dim mode
- `applyGraphLabelPolicyToGraphology.ts` — dim mode propagation
- `selectionNeighborhood.ts` — already supports the BFS we need; verify, don't refactor
- New files in `/src/graph/overlay/`:
  - `SolarBackdrop.tsx`
  - `ClickHalo.tsx`
  - `GlitterField.tsx`
  - `FloatingBookmark.tsx`
  - `BookmarkLayer.tsx`
  - `bookmarkRegistry.ts`
  - `Minimap.tsx`
  - `CameraHUD.tsx`
  - `cameraController.ts`
- New file `/src/graph/visual/dimmingPolicy.ts`
- New file `/src/graph/edges/PlasmaOverlayEdge.tsx`

### Forbidden

- Tile system rewrite → v86c
- Inspector mini-graph → v86d
- TopBar / footer / dock changes → v86e
- Sigma EdgeProgram for plasma edges → v91 (v86b uses SVG overlay route)
- 3D minimap → v94 (v86b ships 2D minimap)
- Audio reactivity wiring → v92
- Node geometry preset switching → v90
- Settings UI for the new tweaks → v86e (v86b reads the values from settings; v86e exposes the controls)

## C. Architecture Map

```
Layer 1 — Skeleton
  No new types in v86b. Consumes v86a's tier model.

Layer 2 — Organs
  graphStylePolicy.ts        Extended with dimMode + dim transition state
  dimmingPolicy.ts           NEW — BFS-based cluster lighting policy
  bookmarkRegistry.ts        NEW — registry contract for floating bookmarks

Layer 3 — Muscles
  NodeSphereProgram.ts       3 new uniforms + interior flow + hum + glow scaling
  PlasmaOverlayEdge.tsx      NEW — SVG overlay painting animated flow
  cameraController.ts        NEW — wraps Sigma camera with eased animate calls

Layer 4 — Nerves
  SigmaGraphView.tsx         Wires uniforms per frame, mounts overlay siblings

Layer 5 — Armor (overlay layer)
  SolarBackdrop.tsx          Z-index 0 — corona, flares, field, starfield, vignette
  ClickHalo.tsx              Z-index 4 — water-ripple on background click
  GlitterField.tsx           Z-index 4 — particle field wrapped to selection cluster
  FloatingBookmark.tsx       Z-index 5 — alert/pinned/ref disconnected nodes
  BookmarkLayer.tsx          Z-index 5 — manages floating bookmarks via registry
  Minimap.tsx                Z-index 6 — viewport-rect tracker, click-to-recenter
  CameraHUD.tsx              Z-index 6 — explicit zoom/pan/rotate buttons

Layer 6 — Paint
  All overlay components read v86a token values (backdrop.*, selection.halo.*, bookmark.*, etc.)
```

## D. Non-Negotiable Contracts

The seven v86 long-term contracts apply. Plus these v86b-specific:

1. **`reduceMotion` halts all motion.** When `appearance.reduceMotion === true`: hum/flow uniforms hold at `0.0`, backdrop animations pause (CSS `animation-play-state: paused`), halo expansion completes immediately, glitter draws static, no eased camera transitions (instant). Master accessibility contract.
2. **Performance preset coupling.** Setting `performance.qualityPreset` writes coherent values for `motionScale`, `drama`, `nodeHum`, `nodeFlowSpeed`, `nodeGlow`, `glitterDensity`, `particleCap`, `edgePlasmaMode`, `backdropMotion`, `starfieldEnabled`. Setting any one of these fine-grained values directly flips `qualityPreset` to `"custom"`. Mirror existing `physicsPreset` pattern.
3. **Camera wrapper preserves Sigma's existing camera state on mount.** Bandit must not reset zoom, pan, or rotation on first mount. Wrapper takes over interaction handling but reads initial state from existing Sigma camera.
4. **Dim mode is opt-in.** `graphStylePolicy.dimMode` defaults to `"off"`. The radial menu opens with `dimMode = "outside-cluster"` (v86d), but v86b ships the policy + a settings toggle (Inspector category, lands in v86e).
5. **Dim transitions animate on cluster depth change.** When user adjusts cluster depth from 3 → 2, the third-ring nodes/edges fade out at 200ms ease-out. Going 2 → 3 fades in. Pure CSS transition on opacity attribute.
6. **Edge plasma v1 is an overlay, not an EdgeProgram.** Static Sigma edges render underneath; SVG overlay paints animated flow on top. Documented as known temporary; v91 replaces with full Sigma EdgeProgram.
7. **Floating bookmarks read from a registry, not hardcoded.** v86b creates `bookmarkRegistry` with the same contract as other registries. Initial bookmarks (3 demo entries: alert, pinned, ref) populate via standard `register(entry)` call. v92+ adds real bookmark sources (QA advisories, user pins).

## E. Dependency Order

```txt
1. Skeleton: no new types

2. Organs:
   - dimmingPolicy.ts (BFS + opacity transition)
   - graphStylePolicy.ts extended with dimMode
   - bookmarkRegistry.ts (empty registry, contract live)
   - cameraController.ts (Sigma wrapper)

3. Muscles:
   - NodeSphereProgram.ts shader extension
   - PlasmaOverlayEdge.tsx SVG overlay
   - SigmaGraphView.tsx uniform wiring + overlay mount points

4. Armor (overlay components):
   - SolarBackdrop.tsx
   - ClickHalo.tsx
   - GlitterField.tsx
   - BookmarkLayer.tsx + FloatingBookmark.tsx (3 demo entries)
   - Minimap.tsx
   - CameraHUD.tsx

5. Paint:
   - Connect overlay components to v86a tokens
   - Performance preset matrix in settings.registry.ts (or settings.defaults.ts)

6. Validation:
   - Shader compiles + renders correctly
   - Reduce motion halts everything
   - Click halo paints
   - Selection produces glitter wrapped to BFS cluster
   - Dim mode dims correctly when toggled
   - Cluster depth changes fade rings smoothly
   - Minimap mirrors viewport
   - Camera HUD buttons animate
```

## F. Current Permissions

Bandit may patch the Allowed list. Bandit may inspect the entire codebase. Bandit may NOT touch tile system code, inspector overlay code, or panel/dock layout code beyond mount points.

## G. Later-Phase Items

- Sigma EdgeProgram for full plasma edges → v91
- 3D minimap → v94
- Geometry preset switching at runtime → v90
- Real bookmark sources (QA advisories, user pins) → v92+ (v86b ships demo bookmarks only)
- Audio-reactive uniform modulation → v92
- Auto-frame to selected cluster on radial menu open → v89

## H. Known Failure Modes

1. **Shader uniform location not found at runtime.** Sigma's `NodeCircleProgram.getDefinition()` returns the shader source — uniforms must be named exactly as expected by Sigma's binding code. Check the parent class's uniform list and append, don't replace.
2. **`u_time` driver causes excessive re-renders.** Use a single `requestAnimationFrame` loop in `SigmaGraphView` to update uniforms — never bind `u_time` to React state, will cause render cascades.
3. **Click halo intercepts clicks meant for the graph.** Must use `pointer-events: none` on the halo SVG and only paint visually. Click handler stays on the graph wrapper element.
4. **Glitter wraps the wrong nodes.** Reuse `selectionNeighborhood.getNodeNeighborhood(graph, nodeId, depth)` — it already returns the correct BFS expansion. Don't reinvent.
5. **Minimap viewport rect drifts when window resizes.** Subscribe to ResizeObserver on the graph viewport and recompute on every camera change — minimap reads `sigma.getCamera().getState()`.
6. **Right-drag context menu pops.** Wrap the graph element with `onContextMenu={e => e.preventDefault()}`.
7. **`reduceMotion` is a moving target.** It must be checked in three places: (a) shader uniform feed (uniforms hold at 0), (b) CSS animation-play-state on backdrop, (c) camera wrapper (skip easing, snap to target). Missing one means motion leaks through.
8. **Edge plasma overlay misaligns when Sigma re-layouts.** The SVG overlay must read edge endpoint screen coordinates from Sigma on every layout tick. Subscribe to Sigma's `afterRender` event.
9. **Dim transitions don't animate.** Sigma WebGL doesn't natively transition node attributes. Either crossfade via a CSS-overlaid SVG layer at the dim opacity, or apply via `sigma.refresh()` with manual easing in JS. Prefer the SVG approach for simplicity.

## I. Troubleshooting Playbooks

### Shader doesn't compile

1. Check console for GLSL compile error — Sigma logs it.
2. Common issues: missing semicolon, `vec3` vs `vec4` mismatch, undeclared uniform.
3. Test the shader in isolation: copy the SHADER_SOURCE string into a GLSL playground.
4. If using a uniform that the parent class doesn't declare, add it via the uniform-extension mechanism (see Sigma docs).

### Reduce motion is partially broken

1. Find the user-visible motion that's still happening with reduceMotion=true.
2. Trace it: shader uniform? CSS animation? camera easing?
3. Confirm the `reduceMotion` value is reaching that surface.
4. Add the kill switch.
5. Re-test by toggling reduce motion off → on → off.

### Glitter renders for unselected nodes

1. Check what node id is being passed to `selectionNeighborhood.getNodeNeighborhood`.
2. Verify it matches `selectedNodeId` from the store.
3. Check the depth value — should match `graphView.neighborhoodDepth`.
4. The result is a Set — glitter only paints for nodes in the Set.

### Minimap viewport rect is the wrong size

1. The minimap world rect should be the graph's bounding box at zoom 1.
2. Get it from Sigma: iterate nodes via `sigma.getNodeDisplayData(...)`, compute min/max.
3. The viewport rect at the current camera is the inverse-transformed visible area.
4. Use Sigma's `viewportToGraph` for the math — don't reimplement.

### Cluster depth change doesn't fade rings

1. Verify `dimMode === "outside-cluster"` is active.
2. Check `dimmingPolicy.applyDimPolicy` is being called on cluster depth change.
3. Verify the CSS transition class is applied to the dim-overlay SVG.
4. Inspect computed opacity values on the relevant nodes/edges.

## J. Validation Ladder

```bash
npm run typecheck                              # zero errors
npm run qa:e2e                                 # all tests green
node scripts/validate-system-index.mjs         # system index sound
```

New tests required:

- `node-sphere-uniforms.spec.ts` — uniforms compile, render, change with settings.
- `dim-mode.spec.ts` — dim mode toggles; cluster depth change fades rings; transitions complete in 200ms.
- `click-halo.spec.ts` — clicking background creates a halo; halo expands and fades; capped at 25% screen.
- `floating-bookmarks.spec.ts` — registry registers; bookmarks render at correct positions; correct colors per type.
- `minimap.spec.ts` — minimap mirrors viewport; click-to-recenter works.
- `camera-wrapper.spec.ts` — left-drag pans, right-drag rotates, scroll-zooms, easing applied, reduceMotion kills easing.

Manual QA:

1. Solar Plasma backdrop visible (corona, flares, starfield, vignette).
2. Glass-sphere nodes have flowing interior + hum.
3. Click on a node → glitter wraps to cluster depth.
4. Adjusting cluster depth dims/lights up rings smoothly.
5. Click on background → water-ripple halo paints.
6. Right-drag rotates the camera.
7. Left-drag pans.
8. Scroll-wheel zooms.
9. Camera transitions ease (380ms cubic-out).
10. Reduce motion checked → all motion stops.
11. Minimap shows live viewport rect including rotation.
12. Camera HUD buttons animate the camera.
13. Floating bookmarks render in the corners (alert/pinned/ref).
14. Edge plasma v1 paints animated flow on top of static Sigma edges.

## K. Research / Tool Policy

- Sigma WebGL custom programs: read Sigma's source for `NodeCircleProgram` to understand the uniform/attribute extension pattern. Do NOT guess at the API.
- GLSL: keep fragment shader complexity sane — `precision mediump float` is sufficient.
- Reduce-motion best practices: WCAG 2.1 Success Criterion 2.3.3 (Animation from Interactions). Contract: "all non-essential motion can be paused or removed."

## L. Output Requirements

Final report must include:

1. Number of new uniforms added to `NodeSphereProgram`.
2. Whether edge plasma v1 was implemented as overlay or static (overlay for `beautiful`/`balanced` presets, static for `large-graph`/`potato`).
3. Performance baseline: FPS at 100/500/1000 nodes with v86b's full visual stack on.
4. Reduce-motion verification: list every motion source and how it's halted.
5. Minimap performance: rerender count per second.
6. Sigma version compatibility note (which version this code is tested against).
7. Any v86a token paths that are still in PLANNED but should now be promoted (because v86b is binding to them).

---

## Appendix A — Shader Uniform Diff

```glsl
// NodeSphereProgram.ts — proposed shader

precision mediump float;

varying vec4 v_color;
varying vec2 v_position;

uniform float u_time;            // NEW — driven by rAF in SigmaGraphView
uniform float u_hum;             // NEW — appearance.nodeHum (0–2)
uniform float u_flowSpeed;       // NEW — appearance.nodeFlowSpeed (0–2)
uniform float u_glowStrength;    // NEW — appearance.nodeGlow (0.2–2)

void main() {
  vec2 center = vec2(0.5, 0.5);
  float dist = distance(v_position, center);
  float radius = 0.5;
  float alpha = 1.0 - smoothstep(radius - 0.02, radius, dist);
  if (alpha < 0.01) discard;
  
  // existing: phong specular
  vec3 lightDir = normalize(vec3(-1.0, -1.0, 1.0));
  vec3 normal = normalize(vec3(v_position - center, 1.0));
  vec3 viewDir = vec3(0.0, 0.0, 1.0);
  vec3 halfDir = normalize(lightDir + viewDir);
  float specular = pow(max(dot(normal, halfDir), 0.0), 32.0);
  
  // NEW: hum — radial breathe
  float humPulse = 0.5 + 0.5 * sin(u_time * u_hum);
  vec3 humTint = v_color.rgb * (0.20 * humPulse);
  
  // NEW: flow — interior rotating ellipse
  float angle = u_time * u_flowSpeed;
  vec2 flowed = vec2(
    cos(angle) * (v_position.x - 0.5) - sin(angle) * (v_position.y - 0.5),
    sin(angle) * (v_position.x - 0.5) + cos(angle) * (v_position.y - 0.5)
  );
  float flowMask = smoothstep(0.05, 0.0, abs(flowed.x * 1.4));
  vec3 flowTint = v_color.rgb * flowMask * 0.45;
  
  // existing: glow falloff (now scaled by u_glowStrength)
  float glow = smoothstep(radius, radius + 0.15, dist);
  vec3 glowColor = v_color.rgb * u_glowStrength * glow;
  
  // existing: rim light
  vec2 rimDir = normalize(vec2(1.0, 1.0));
  float rim = max(dot(normal, vec3(rimDir, 0.0)), 0.0);
  float rimLight = pow(rim, 3.0) * 0.3;
  
  vec3 finalColor = v_color.rgb + glowColor + vec3(specular) + vec3(rimLight)
                  + humTint + flowTint;
  gl_FragColor = vec4(finalColor, v_color.a * alpha);
}
```

## Appendix B — Dimming Policy Spec

```typescript
// dimmingPolicy.ts
export type DimMode = "off" | "outside-cluster";

export interface DimPolicyState {
  mode: DimMode;
  clusterDepth: number;
  selectedNodeId: string | null;
  dimOpacity: number;            // from token selection.dim.opacity (default 0.18)
  transitionMs: number;          // 200ms ease-out
}

export function applyDimPolicy(graph, state: DimPolicyState): void {
  if (state.mode === "off" || !state.selectedNodeId) {
    graph.forEachNode((id) => graph.setNodeAttribute(id, "alpha", 1.0));
    graph.forEachEdge((id) => graph.setEdgeAttribute(id, "alpha", 1.0));
    return;
  }
  
  const lit = bfs(graph, state.selectedNodeId, state.clusterDepth);  // Set<nodeId>
  
  graph.forEachNode((nodeId) => {
    graph.setNodeAttribute(nodeId, "alpha", lit.has(nodeId) ? 1.0 : state.dimOpacity);
  });
  
  graph.forEachEdge((edgeId, attrs, sourceId, targetId) => {
    graph.setEdgeAttribute(edgeId, "alpha",
      (lit.has(sourceId) && lit.has(targetId)) ? 1.0 : state.dimOpacity);
  });
  
  sigma.refresh();
}
```

CSS-based fade for cluster-depth-change transitions — apply via SVG overlay with opacity transitions, since Sigma WebGL doesn't transition node attrs natively.

## Appendix C — Camera Wrapper API

```typescript
// cameraController.ts
import type Sigma from "sigma";

export interface CameraController {
  pan(dx: number, dy: number, opts?: { animated?: boolean }): void;
  zoom(factor: number, opts?: { animated?: boolean; anchor?: { x: number; y: number } }): void;
  rotate(degrees: number, opts?: { animated?: boolean }): void;
  reset(): void;
  getState(): { x: number; y: number; ratio: number; angle: number };
}

export function attachCameraController(sigma: Sigma): CameraController {
  // wraps sigma.getCamera() with eased animate() calls
  // adds right-drag handler for rotation (Sigma doesn't ship this)
  // returns the controller
}
```

Default eased animation: 380ms `cubic-bezier(0,0,.2,1)`. When `appearance.reduceMotion === true`, all animations become instant (`{duration: 0}`).

## Appendix D — Edge Plasma v1 (SVG Overlay Route)

Sigma renders static lines underneath. SVG overlay sibling to Sigma canvas paints animated flow on top.

```typescript
// PlasmaOverlayEdge.tsx
function PlasmaOverlayEdge({ edges, sigma, motionScale, flowSpeed }) {
  const [paths, setPaths] = useState([]);
  
  useEffect(() => {
    const update = () => {
      const newPaths = edges.map(e => {
        const a = sigma.getNodeDisplayData(e.source);
        const b = sigma.getNodeDisplayData(e.target);
        const sa = sigma.graphToViewport(a);
        const sb = sigma.graphToViewport(b);
        return { id: e.id, sx: sa.x, sy: sa.y, tx: sb.x, ty: sb.y };
      });
      setPaths(newPaths);
    };
    sigma.on("afterRender", update);
    update();
    return () => sigma.off("afterRender", update);
  }, [sigma, edges]);
  
  return (
    <svg className="plasma-overlay" style={{
      position: "absolute", inset: 0, pointerEvents: "none", zIndex: 3
    }}>
      {paths.map(p => (
        <line key={p.id} x1={p.sx} y1={p.sy} x2={p.tx} y2={p.ty}
              stroke="url(#plasma-flow)" strokeWidth="2"
              style={{
                strokeDasharray: "4 8",
                animation: motionScale > 0
                  ? `flow ${4 / flowSpeed}s linear infinite`
                  : "none"
              }}/>
      ))}
      <defs>
        <linearGradient id="plasma-flow">{/* ... */}</linearGradient>
      </defs>
    </svg>
  );
}
```

In `large-graph` and `potato` performance presets, `edgePlasmaMode = "static"` — disable the overlay entirely (Sigma's static lines are sufficient).

## Appendix E — Performance Preset Matrix

`performance.qualityPreset` writes these. Setting any one fine-grained value flips preset to `"custom"`.

| Knob | beautiful | balanced (default) | large-graph | potato |
|---|---|---|---|---|
| `motionScale` | 1.0 | 0.6 | 0.3 | 0.0 |
| `drama` | extreme | cranked | quiet | quiet |
| `nodeHum` | 1.0 | 0.7 | 0.0 | 0.0 |
| `nodeFlowSpeed` | 1.0 | 0.55 | 0.0 | 0.0 |
| `nodeGlow` | 1.5 | 1.0 | 0.5 | 0.3 |
| `glitterDensity` | "high" | "medium" | "low" | "off" |
| `particleCap` | 600 | 300 | 120 | 0 |
| `edgePlasmaMode` | "animated-overlay" | "animated-overlay" | "static" | "static" |
| `backdropMotion` | "full" | "half" | "low" | "off" |
| `starfieldEnabled` | true | true | true | false |

`glitterDensity`, `particleCap`, `edgePlasmaMode`, `backdropMotion` need to be added to schema. If v86a missed them, add in v86b with a settings.schema patch + migration v79→v80.

## Appendix F — Bookmark Registry

```typescript
// bookmarkRegistry.ts
export type BookmarkType = "alert" | "pinned" | "ref";

export interface BookmarkEntry {
  id: string;
  type: BookmarkType;
  position: { x: number; y: number };  // viewport-relative 0–1
  label: string;
  sub?: string;
  targetNodeId?: string;
  color?: string;                      // optional override; defaults to type's token
}

export interface BookmarkRegistry { /* standard contract */ }
```

v86b ships 3 demo entries (alert/pinned/ref) so the visual is testable. Real sources wire up later.

---

*See `v86a_FOUNDATION.md` for token paths consumed. See `v86d_INSPECTOR_MINI_GRAPH.md` for radial menu activation of dim mode.*
