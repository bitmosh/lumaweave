---
id: graph.contracts.sigma.lifecycle
title: Sigma Lifecycle Contract
type: contract
status: current
cluster: azure
domain: graph
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-11
last_pass: vP-Render-Pipeline-Refactor
references:
  - graph.contracts.first.graph.runtime.mutation
  - graph.contracts.graph.runtime.boundary
  - graph.contracts.graph.theme.runtime.application
  - graph.self.schema.v1
tags: [graph, contract, sigma, lifecycle, render-pipeline, performance]
---

# Sigma Lifecycle Contract

## Purpose

Defines when LumaWeave creates, mutates, and destroys its Sigma renderer
instance. Binds the implementation of `SigmaGraphView.tsx` to a single
authoritative lifecycle pattern. Replaces the current ad-hoc lifecycle
that recreates Sigma on every settings change.

This document is the contract for the vP-Render-Pipeline-Refactor pass
sequence. The refactor's success is measured against the success criteria
in this document.

## Problem statement

Profiling on 2026-05-11 confirmed the following symptoms:

- **71% CPU utilization** during simple graph panning (3,354 ms scripting
  over 4,690 ms recording window)
- **182 ms Input Delay (INP)** during slider drag — should be <50 ms,
  ideal <16 ms
- **6,000+ "Container has no width" errors** per session due to
  ResizeObserver firing during component remounts
- **19 useEffect hooks** in SigmaGraphView with overlapping dependency
  arrays causing cascade re-runs
- **A rAF loop calls `sigma.setSetting()` + `sigma.refresh()` 60 times
  per second** for v86b uniforms — likely the dominant scripting cost
- **Sigma instance is recreated** (not just settings-updated) on every
  state change to physics, theme, dim mode, label policy, source path,
  selection, hover, or layout dialect

Root causes:

1. **rAF-driven Sigma refresh storm.** The v86b uniform animation calls
   `setSetting` + `refresh` per frame, forcing Sigma to repaint and
   triggering downstream React reactions even when nothing visually
   changed.

2. **Component remount on state changes.** Something upstream causes
   SigmaGraphView to remount (not re-render) when settings change. This
   destroys the GL context, ResizeObserver fires during the 0-width
   moment, and Sigma is rebuilt against a fresh DOM node.

3. **Effect cascade.** 19 useEffect hooks with overlapping dependencies
   create N-way coupling. A single state change can trigger multiple
   effects that retrigger each other.

The refactor addresses each root cause in isolation rather than as one
sweeping change. See "Phase plan" below.

## Lifecycle states

Sigma exists in one of two states:

```
                  +-------------+
   +--------------|   ABSENT    |<-------------+
   |              +-------------+              |
   | create                                    | destroy
   |              +-------------+              |
   v              |             |              |
+-------------+   |             |              |
|   ACTIVE    |---+             |              |
|             |      mutate     |              |
|             |<----------------+              |
+-------------+                                |
   |                                           |
   +-------------------------------------------+
```

| State | Description |
|-------|-------------|
| **ABSENT** | No Sigma instance exists. Container is empty or showing a placeholder. |
| **ACTIVE** | Sigma instance exists, renders the current graph data, responds to user interaction. |

Transitions:

| Transition | Triggers |
|------------|----------|
| ABSENT to ACTIVE (create) | Component mount with graph data, OR source change after explicit cleanup |
| ACTIVE to ABSENT (destroy) | Component unmount, OR source change before recreation |
| ACTIVE to ACTIVE (mutate) | All settings changes, theme changes, selection changes, hover changes, dim changes, label changes, physics changes — see "Mutation rules" |

**Critical rule: the ACTIVE to ACTIVE mutate transition is the default.**
ABSENT to ACTIVE and ACTIVE to ABSENT are reserved for actual lifecycle
boundaries (mount, unmount, source switch).

## Mutation rules — what triggers what

| Trigger | Required action | Forbidden action |
|---------|----------------|------------------|
| Physics slider (repel, center, link distance) | `supervisor.setSettings({...})` on FA2 worker | Sigma recreation |
| Physics dialect change | `supervisor.setLayout(newDialect)` if support exists, else `supervisor.restart(newSeed)` | Sigma recreation, camera reset |
| Theme switch | Update CSS vars + call `applyGraphStylePolicy` + `sigma.refresh()` | Sigma recreation, graph rebuild |
| Selection change | Call `applyGraphStylePolicy` on existing graph + `sigma.refresh()` | Sigma recreation |
| Hover change | Update reducer state via setSetting + `sigma.refresh()` | Sigma recreation |
| Dim mode change | Re-apply dim policy to existing graph + `sigma.refresh()` | Sigma recreation |
| Label policy change | Update Sigma label settings via setSetting + `sigma.refresh()` | Sigma recreation |
| Node size / edge size change | Update via setSetting + `sigma.refresh()` | Sigma recreation |
| Reduce motion change | Update uniforms ref + Sigma reads on next paint | Sigma recreation |
| v86b animation tick | Update uniforms ref ONLY | Any React re-render, any setSetting call, any refresh call |
| Audio reactivity tick (future v92) | Update uniforms ref ONLY | Any React re-render, any setSetting call, any refresh call |
| Source graph change | `sigma.kill()`, `sigma = new Sigma(newGraph, container, ...)` | Update without explicit kill |
| Component unmount | `sigma.kill()` + cleanup | Leaving instance alive |

The forbidden actions column is **non-negotiable**. Any code that triggers
a forbidden action on the corresponding trigger is a defect against this
contract.

## React effect topology

SigmaGraphView SHALL have effects partitioned as follows. Each effect has
a single concern and minimal stable dependencies.

```typescript
// Mount effect — creates Sigma once per source
useEffect(() => {
  const sigma = new Sigma(graphRef.current, containerRef.current, {
    // ... mount-time settings
  });
  // Attach uniforms ref (see "v86b uniforms" section)
  (sigma as any).__uniformsRef = uniformsRef;
  sigmaRef.current = sigma;
  setupEventHandlers(sigma);
  return () => sigma.kill();
}, [sourceId]);  // ONLY sourceId

// Settings effect — apply settings to existing Sigma
useEffect(() => {
  const sigma = sigmaRef.current;
  if (!sigma) return;
  sigma.setSetting("...", value);
  sigma.refresh();
}, [specificSettings]);  // ONLY direct Sigma settings

// Style effect — apply style policy
useEffect(() => {
  const sigma = sigmaRef.current;
  if (!sigma) return;
  applyGraphStylePolicy(sigma.getGraph(), interactionState, ...);
  sigma.refresh();
}, [selectedNodeId, hoveredNodeId, dimMode, themeId]);

// Layout effect — update supervisor
useEffect(() => {
  const sup = supervisorRef.current;
  if (!sup) return;
  sup.setSettings({ scalingRatio, gravity, slowDown });
}, [repelForce, centerForce, linkDistance]);

// Layout dialect change — restart supervisor with new positions
useEffect(() => {
  const sup = supervisorRef.current;
  if (!sup) return;
  sup.stop();
  applyDialect(graphRef.current, physicsDialect);
  sup.start();
}, [physicsDialect]);

// Animation tick — DO NOT update React state, update ref only
useEffect(() => {
  let raf: number;
  const tick = (now: number) => {
    uniformsRef.current.time = now * 0.001;
    // hum, flowSpeed, glowStrength updated from audio source if active
    raf = requestAnimationFrame(tick);
  };
  if (!reduceMotion) raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}, [reduceMotion]);
```

**Effect count target: 5-7 focused effects.** Current implementation has
19 useEffect calls; the refactor must reduce this substantially.

**Forbidden patterns:**

- Calling `new Sigma(...)` outside the mount effect
- Storing Sigma instance in React state (must be in a ref)
- Dependency arrays containing `nodes`, `edges`, or other large reactive
  arrays — these change identity on every parent re-render
- Dependency arrays containing the entire `settings` object — destructure
  to specific keys
- Calling `setSelectedNode` or any React state setter from inside a Sigma
  event handler synchronously without batching
- Calling `sigma.refresh()` from inside a rAF loop (use ref pattern
  instead)

## v86b uniforms — special treatment

The current implementation uses a monkey-patched `getSetting` on Sigma to
return `v86bUniforms` from a custom `__settings` object, updated by a
rAF loop that also calls `sigma.refresh()` per frame. This is the
**dominant performance bottleneck** identified in profiling. The refactor
SHALL replace it with a ref-based pattern.

**Replacement pattern: ref-based uniform pipeline.**

```typescript
// 1. Single ref carries all animation state
const uniformsRef = useRef<V86bUniforms>({
  time: 0,
  hum: 0.7,
  flowSpeed: 0.55,
  glowStrength: 1.0,
});

// 2. Animation effect updates ref WITHOUT triggering React render
useEffect(() => {
  if (reduceMotion) {
    uniformsRef.current.time = 0;
    uniformsRef.current.hum = 0;
    uniformsRef.current.flowSpeed = 0;
    // glowStrength preserved per motion safety contract
    return;
  }
  let raf: number;
  const tick = (now: number) => {
    uniformsRef.current.time = now * 0.001;
    uniformsRef.current.hum = nodeHum ?? 0.7;
    uniformsRef.current.flowSpeed = nodeFlowSpeed ?? 0.55;
    uniformsRef.current.glowStrength = nodeGlow ?? 1.0;
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}, [reduceMotion, nodeHum, nodeFlowSpeed, nodeGlow]);

// 3. Sigma instance is given the ref at creation
// (in mount effect):
const sigma = new Sigma(...);
(sigma as any).__uniformsRef = uniformsRef;

// 4. NodeSphereProgram reads from ref each frame in setUniforms:
const uniforms = (this.renderer as any).__uniformsRef?.current ?? DEFAULT;
gl.uniform1f(uTime, uniforms.time);
// etc.
```

**Critical:** the animation effect MUST NOT call `sigma.setSetting()` or
`sigma.refresh()`. The shader naturally reads the ref values on its next
render pass, which Sigma triggers as part of its normal rAF cycle. We are
piggybacking on Sigma's own render loop, not forcing extra refreshes.

Result:
- Animation runs at 60fps via rAF, NEVER triggers a React render
- Sigma refresh is NOT forced per frame (Sigma manages its own paint cycle)
- GL uniforms get fresh values per frame
- Monkey-patched `getSetting` override is removed entirely
- v86b animation cost drops from "Sigma refresh per frame" to "ref write
  per frame" — orders of magnitude cheaper

## ResizeObserver handling

The current implementation has a ResizeObserver that calls Sigma when the
container resizes. During React remounts, the container momentarily has
0 width, causing thousands of "Container has no width" errors.

**Required fix:**

```typescript
useEffect(() => {
  const ro = new ResizeObserver((entries) => {
    const sigma = sigmaRef.current;
    if (!sigma) return;
    const { width, height } = entries[0].contentRect;
    if (width === 0 || height === 0) return;  // GUARD
    sigma.resize();
  });
  if (containerRef.current) ro.observe(containerRef.current);
  return () => ro.disconnect();
}, []);
```

The width/height === 0 guard prevents the error spam entirely. Sigma's
`allowInvalidContainer: true` setting is also acceptable but masks the
underlying issue rather than fixing it; the guard is preferred.

## Camera state preservation

Camera state MUST persist across all ACTIVE to ACTIVE mutate transitions.
The only acceptable camera resets are:

- User explicit reset (via reset button or keyboard shortcut)
- ABSENT to ACTIVE transition (initial mount, source switch — and even
  then, fit-to-graph rather than reset-to-origin is preferred)
- User pan/zoom/rotate via mouse

Implementation guidance: do NOT store camera state in React state. Camera
state lives in Sigma itself; reading it during mutations would be
unnecessary anyway. The refactor's camera persistence comes for free
once Sigma is no longer being recreated.

## Forbidden upstream patterns

The following upstream patterns force SigmaGraphView to remount and
therefore violate this contract. They must be eliminated:

- `<SigmaGraphView key={settingsHash} />` — changing key forces unmount
- `{condition && <SigmaGraphView />}` — toggling condition causes
  unmount/mount cycles
- Wrapping in a component that re-renders frequently with no memoization
- Passing freshly-created objects as props (e.g., `settings={{ ... }}`
  inline) — every parent render creates new object identity, breaking
  React.memo

Phase R4 of the plan is dedicated to investigating and identifying the
upstream remount cause. Phase R5 fixes it.

## Success criteria (binary)

The refactor is COMPLETE when all of the following hold:

| Criterion | Measurement | Target |
|-----------|-------------|--------|
| Scripting % during 3s pan | Chrome Performance recording | <10% (current: 71%) |
| INP during slider drag | Chrome Performance | <50 ms (current: 182 ms) |
| INP during theme switch | Chrome Performance | <50 ms (current: 150 ms) |
| "Container has no width" errors per session | Console count | 0 (current: 6,000+) |
| Sigma instance identity across settings change | sentinel-based test | UNCHANGED |
| Camera state across settings change | direct comparison | UNCHANGED |
| Camera state across theme change | direct comparison | UNCHANGED |
| Selection state across settings change | inspector check | UNCHANGED |
| useEffect count in SigmaGraphView | source count | 5-7 (current: 19) |
| getSetting monkey-patch | source presence | REMOVED |
| Test suite: vP-Render-Refactor-Test-Net | qa:e2e | 4/4 passing |
| rAF loop calls to sigma.refresh per second | profile observation | 0 (current: ~60) |

## Out of scope (do NOT do as part of this refactor)

- Three.js or WebGPU migration — future v94+ concerns
- Audio reactivity wiring — future v92 concern (the ref pattern is set up
  to receive it, but no audio source integration in this pass)
- Edge bundling / multi-edge separation — future v90-91 concern
- Physics slider value wiring per se — if sliders don't visibly affect
  layout AFTER refactor, file separately as vP-Physics-Wiring-Repair
- Panel display sync (useGraphSourceSummary v1 schema) — separate filed
  follow-up
- AI Lab path cleanup — separate filed follow-up
- New features of any kind

The refactor changes ONLY the lifecycle and effect topology. It does not
add features.

## Phase plan (granular, 11 sub-passes)

The refactor is structured as 11 small focused passes rather than one
sweeping change. Each pass:

- Touches 1-3 effects max
- Has a single concern that doesn't entangle with peers
- Has a clear verification gate
- Can be paused, rolled back, or postponed independently
- Lands its own commit

Passes are ordered by dependency: each pass either fixes something
isolated (no upstream dependency) OR depends on a prior pass.

### Phase R1 — ResizeObserver guard

**Scope:** Single change to the ResizeObserver block in SigmaGraphView.tsx
(currently around line 876-882).

**Change:** Add a width/height === 0 guard before calling `sigma.resize()`.

**Files affected:**
- `src/graph/renderers/sigma2d/SigmaGraphView.tsx` (single block)

**Impact:** Eliminates 6,000+ console errors per session. Pure isolated
cleanup. Does not change any rendering behavior.

**Verification:**
- Console clean of "Container has no width" errors after page load and
  basic interaction
- No regression in qa:e2e baseline (364/2/6 or current baseline)

**Dependencies:** None. First pass.

**Risk:** Near zero.

### Phase R2 — v86b uniforms ref pattern

**Scope:** Replace the rAF loop calling setSetting + refresh with the
ref-based pattern documented above. Remove monkey-patched getSetting if
no other consumer depends on it.

**Files affected:**
- `src/graph/renderers/sigma2d/SigmaGraphView.tsx` (the uniform useEffect
  around lines 197-232, plus the monkey-patch around lines 576-579)
- `src/graph/renderers/sigma2d/NodeSphereProgram.ts` (setUniforms method
  reads from ref instead of getSetting)

**Impact:** Eliminates 60Hz Sigma refresh storm. Expected to be the
single largest performance win.

**Verification:**
- Spheres still glow when reduceMotion is off
- reduceMotion still halts animation (uniforms read 0 except glowStrength)
- Console clean
- No regression in qa:e2e

**Dependencies:** None. Independent of R1.

**Risk:** Low. Well-defined interface between SigmaGraphView and
NodeSphereProgram via the ref.

### Phase R3 — Profile measurement gate

**Scope:** Operator-driven, not Bandit. Take new profile recordings
matching the original 3 scenarios (pan, slider scrub, theme switch).

**Why:** R1 + R2 should produce most of the win that's available WITHOUT
fixing the remount issue. The measurement tells us how much of the
performance problem was rAF-storm-driven vs. remount-driven, which
informs how aggressively we need to pursue Phases R4-R5.

**Compare:**
- Scripting % during pan (baseline 71%)
- INP during slider (baseline 182 ms)
- Console error count (baseline ~6,000)

**Outcome:** Decision point. If we're already approaching target metrics,
later phases focus on architectural cleanup. If still far off, R4-R5 are
the next big win.

**Dependencies:** R1 + R2 complete.

### Phase R4 — Upstream remount investigation

**Scope:** Bandit forensics pass, read-only. Identify what causes
SigmaGraphView to remount on state changes.

**Investigation targets:**
- AppShell.tsx — does it pass freshly-created objects as props?
- Parent component structure — is SigmaGraphView wrapped in something
  with unstable identity?
- key prop usage — anywhere using key={something_that_changes}?
- Conditional rendering — `{condition && <SigmaGraphView />}` patterns?

**Output:** `docs/v86c-redo-render-refactor-remount-investigation.md`
with findings + proposed fix.

**Dependencies:** None strictly, but should follow R3 measurement.

**Risk:** Zero (read-only).

### Phase R5 — Fix the remount

**Scope:** Implement R4's proposed fix. Likely involves:
- Memoizing settings objects passed as props
- Wrapping SigmaGraphView in React.memo
- Removing unstable keys
- Refactoring conditional renders

**Files affected:** Variable, depends on R4 findings. Expected: 1-2
files outside src/graph/.

**Verification:**
- `sigma-instance-identity.spec.ts` Part A (physics slider) passes
- `sigma-instance-identity.spec.ts` Part B (theme switch) passes
- Camera state persists visually (no flash on slider drag)

**Dependencies:** R4.

**Risk:** Medium. Touches non-graph code, may affect upstream behavior.

### Phase R6 — Settings consolidation, batch 1

**Scope:** Refactor 2 isolated settings effects from "trigger full
re-render" to "setSetting + refresh."

**Targets:**
- Label policy effects (currently around lines 985-1018)
- Edge size / node size effects (currently around lines 976-991)

**These are chosen because:** they don't share state with each other and
don't entangle with physics/style/layout effects.

**Files affected:** SigmaGraphView.tsx only.

**Verification:**
- Changing label settings updates Sigma without remount
- Changing size settings updates Sigma without remount
- Camera persists across these changes
- qa:e2e baseline holds

**Dependencies:** R5 (need remounts stopped first, otherwise this is moot).

**Risk:** Low to medium.

### Phase R7 — Style policy consolidation, batch 1

**Scope:** Refactor 2 style policy effects to share invocation path.

**Targets:**
- Selection effect (currently around line 895)
- Hover effect (related)

**These are chosen because:** they both call into `applyGraphStylePolicy`
and share the most logic. Consolidating them ensures one invocation per
change instead of multiple.

**Files affected:** SigmaGraphView.tsx only.

**Verification:**
- Selection still highlights selected node
- Hover still highlights hovered node
- applyGraphStylePolicy runs once per change (verifiable via console.log
  or breakpoint)
- qa:e2e baseline holds

**Dependencies:** R5.

**Risk:** Medium. Close to user interaction; regressions visible.

### Phase R8 — Settings consolidation, batch 2

**Scope:** Refactor physics slider effects and theme application.

**Targets:**
- Repel force, center force, link distance sliders
- Theme application effect (CSS vars + style policy)

**These are deferred to R8 because:** physics is where the camera flashing
lives, and theme is the largest single user-facing change. They need the
remount fix from R5 firmly in place to verify properly.

**Files affected:** SigmaGraphView.tsx, possibly theme application
helpers.

**Verification:**
- `camera-persistence-settings.spec.ts` passes
- `camera-persistence-theme.spec.ts` passes
- Physics sliders actually affect layout (resolves filed
  vP-Physics-Wiring-Repair concern, possibly)
- Theme switch doesn't reset camera
- qa:e2e baseline holds

**Dependencies:** R5, R6.

**Risk:** Medium-high. Most user-visible changes.

### Phase R9 — Style policy consolidation, batch 2

**Scope:** Refactor remaining style effects.

**Targets:**
- Dim mode effect
- Neighborhood depth effect

**Files affected:** SigmaGraphView.tsx only.

**Verification:**
- Dim mode toggle works (selected node prominent, others dimmed)
- Neighborhood depth slider affects dim radius correctly
- qa:e2e baseline holds

**Dependencies:** R7.

**Risk:** Low to medium.

### Phase R10 — Layout effects

**Scope:** Refactor supervisor lifecycle and layout effects.

**Targets:**
- Physics dialect change effect (currently around lines 295-420)
- Community gravity effect (currently around lines 235-292)
- Supervisor stop/restart logic

**Files affected:** SigmaGraphView.tsx only.

**Verification:**
- Physics dialect dropdown changes layout shape
- Community gravity toggle has visible effect (was previously reported
  as non-functional)
- Layout doesn't reset camera on dialect change
- qa:e2e baseline holds

**Dependencies:** R5.

**Risk:** Medium. Layout is sensitive; the supervisor pattern is its
own beast.

### Phase R11 — Final verification + cleanup

**Scope:** Operator profile run + minor cleanup + close-out.

**Tasks:**
- Operator takes final profile recording, compares against success criteria
- Bandit removes any dead code from the refactor
- Bandit verifies effect count is 5-7
- Bandit verifies monkey-patch is gone
- Generate final test report

**Verification:** All 12 success criteria met.

**Dependencies:** R1-R10 complete.

**Risk:** Low (mostly verification).

## Phase dependency summary

```
R1 (ResizeObserver)   --+
R2 (v86b uniforms)    --+-- R3 (profile gate) -- R4 -- R5 --+-- R6 -- R8 --+
                                                            |              +-- R11
                                                            +-- R7 -- R9 --+
                                                            |
                                                            +-- R10 -------+
```

- R1 and R2 are independent of each other and of everything else
- R3 is a measurement gate, not a code change
- R4 precedes R5 (investigation before fix)
- R5 is the bottleneck — most subsequent phases depend on it
- R6 to R8 is a series (settings consolidation in batches)
- R7 to R9 is a series (style policy consolidation in batches)
- R10 (layout) depends only on R5
- R11 is the closing gate

## Migration notes

The current SigmaGraphView is 1091 lines with 19 useEffect calls.
Post-refactor target: ~700-800 lines with 5-7 useEffect calls.

Files likely affected (cumulative across all 11 phases):

- `src/graph/renderers/sigma2d/SigmaGraphView.tsx` — primary refactor
- `src/graph/renderers/sigma2d/NodeSphereProgram.ts` — uniforms read from
  ref instead of getSetting (R2)
- `src/graph/renderers/sigma2d/EdgePlasmaOverlay.tsx` — same pattern if
  applicable (R2)
- `src/app/AppShell.tsx` — possibly, to stabilize upstream props (R5)
- Theme system files — only consumption pattern changes (R8)

## Backward compatibility

This refactor changes internal architecture only. External contracts:

- Source adapter contract: UNCHANGED
- Graph schema (v1): UNCHANGED
- Theme token system: UNCHANGED (only consumption pattern changes)
- Inspector overlay API: UNCHANGED
- Panel data contracts: UNCHANGED

User-facing behavior changes:

- Camera no longer flashes/resets on UI interactions (improvement)
- Slider response feels immediate instead of laggy (improvement)
- Selection survives settings changes (improvement)
- Edge rendering no longer flashes on reload (improvement, indirect)
- Physics sliders may suddenly start working (improvement, if R8 resolves
  the previously-reported "sliders do nothing" bug)

No new user-facing features. No removed features.

## Versioning

This is contract v1. Future revisions:

- v1.1 — non-breaking refinements (clarifications, additional examples,
  added phases if needed)
- v2.0 — breaking change to lifecycle model (e.g., adding a third state,
  introducing async-mount, multi-renderer support)

This document is authoritative. Disagreements between code and this
document are resolved by amending this document explicitly (with
versioning) rather than by silent drift.

---

*Implemented in: vP-Render-Pipeline-Refactor (Phases R1 through R11)*
*Tested by: vP-Render-Refactor-Test-Net (4 spec files)*
*Profile baseline captured: 2026-05-11*
