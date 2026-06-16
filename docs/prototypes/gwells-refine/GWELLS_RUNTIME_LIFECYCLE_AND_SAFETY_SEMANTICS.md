# GWells v0.2 — Runtime Lifecycle and Safety Semantics

**Status:** Draft  
**Purpose:** Define the runtime lifecycle rules GWells needs before profile-driven layouts become widely user-facing: scheduler control, pause/resume/stop, manual stepping, convergence, frame budgets, reseed safety, and large-graph protection.  
**Intended location:** `lumaweave/docs/prototypes/gwells-refine/GWELLS_RUNTIME_LIFECYCLE_AND_SAFETY_SEMANTICS.md`  
**Replaces:** Nothing yet. New implementation/engine safety doc.  
**Related:**
- `GWELLS_V0_2_IMPLEMENTATION_BRIDGE.md`
- `GWELLS_PROFILE_APPLY_MODES_AND_OVERRIDE_SEMANTICS.md`
- `GWELLS_MACRO_CONTROLS_AND_PARAMETER_MAPPING.md`
- `GWELLS_PROFILE_REGISTRY_CONTRACT.md`
- `gwells-committee-review.md`

---

## 1. Summary

GWells v0.2 introduces profiles, recommendations, macro controls, overrides, and guided UI operations. Those features increase how often the engine may be reconfigured while running.

Before GWells becomes heavily profile-driven, the runtime needs clearer lifecycle semantics.

The engine should support:

- explicit start
- explicit stop
- pause without wasting animation frames
- resume
- manual stepping
- deterministic step behavior for tests
- convergence detection
- frame-budget awareness
- safe reseeding
- large-graph safety clamps
- profile reapply without leaking loops

This document defines the lifecycle and safety contract needed for v0.2.

---

## 2. Design goal

GWells should feel alive, but it should not run away.

The runtime must be:

```txt
controllable
testable
pausable
stoppable
safe for large graphs
safe during profile changes
```

The current visual animation loop should become an implementation detail, not the only way the engine can run.

---

## 3. Current runtime problem areas

Known current issues to address over time:

```txt
requestAnimationFrame is hardcoded.
Paused state still schedules frames.
Stop behavior must reliably cancel future frames.
No manual step API exists.
No delta-time normalization exists.
No convergence detection exists.
frameBudgetMs is typed but not meaningfully enforced.
Profile reseeding may require cache rebuilds.
Seed parameter changes can stale cached pair ideal distances.
```

These issues are manageable, but they should be formalized before profile-driven UI increases runtime churn.

---

## 4. Runtime lifecycle states

Recommended state model:

```ts
export type GWRuntimeState =
  | "idle"
  | "running"
  | "paused"
  | "settled"
  | "stopped"
  | "error";
```

### 4.1 idle

Runtime exists but has not started.

### 4.2 running

Runtime is actively stepping physics.

### 4.3 paused

Runtime is not stepping physics, but can resume.

Paused should not continuously request animation frames.

### 4.4 settled

Runtime has converged according to configured thresholds.

Settled runtime may restart if:

- graph changes
- profile changes
- macro controls change
- user drags/pins/unpins nodes
- manual wake is requested

### 4.5 stopped

Runtime has been permanently stopped.

A stopped controller should not resume. A new apply operation should create or initialize a new runtime.

### 4.6 error

Runtime encountered an unrecoverable error.

Error state should surface diagnostics and stop scheduling frames.

---

## 5. Scheduler abstraction

### 5.1 Purpose

The engine should not directly depend on `requestAnimationFrame`.

A scheduler abstraction allows:

- browser animation
- test/manual stepping
- Node-compatible execution
- deterministic benchmark runs
- future worker-based execution

### 5.2 Type

```ts
export interface GWScheduler {
  request(callback: (timeMs: number) => void): GWFrameHandle;
  cancel(handle: GWFrameHandle): void;
}

export type GWFrameHandle = number | string | object;
```

### 5.3 Browser scheduler

```ts
export const browserAnimationScheduler: GWScheduler = {
  request: (callback) => requestAnimationFrame(callback),
  cancel: (handle) => cancelAnimationFrame(handle as number),
};
```

### 5.4 Manual scheduler

Manual scheduler is useful for tests.

```ts
export class GWManualScheduler implements GWScheduler {
  request(callback: (timeMs: number) => void): GWFrameHandle;
  cancel(handle: GWFrameHandle): void;
  flush(timeMs?: number): void;
}
```

### 5.5 Runtime config

```ts
export interface GWRuntimeConfig {
  scheduler?: GWScheduler;
  autoStart?: boolean;
  autoStopOnConvergence?: boolean;
  frameBudgetMs?: number;
  maxStepsPerFrame?: number;
}
```

---

## 6. Step API

### 6.1 Purpose

The engine should expose a manual `step()` method for tests, deterministic behavior, and advanced runtime control.

### 6.2 Type

```ts
export interface GWStepOptions {
  dtMs?: number;
  maxIterations?: number;
  respectFrameBudget?: boolean;
}

export interface GWStepResult {
  stepsRun: number;
  maxVelocity: number;
  averageVelocity: number;
  movedNodeCount: number;
  settled: boolean;
  warnings: string[];
}
```

### 6.3 Controller addition

```ts
export interface GWController {
  stop(): void;
  pause(): void;
  resume(): void;

  step(options?: GWStepOptions): GWStepResult;

  getRuntimeState(): GWRuntimeState;
}
```

---

## 7. Delta-time semantics

### 7.1 Problem

Without delta-time normalization, physics behavior can vary by frame rate.

### 7.2 Contract

Each physics step should accept a normalized time delta.

```txt
dtMs:
  actual elapsed milliseconds since last step

dtScale:
  clamped multiplier relative to a target frame, usually 16.67ms
```

### 7.3 Suggested clamp

```ts
const TARGET_FRAME_MS = 16.67;
const MIN_DT_SCALE = 0.25;
const MAX_DT_SCALE = 2.0;
```

```ts
const dtScale = clamp(dtMs / TARGET_FRAME_MS, MIN_DT_SCALE, MAX_DT_SCALE);
```

### 7.4 v0.2 recommendation

Add dt support conservatively.

Do not attempt a full physically correct integrator yet. The first goal is stable frame-rate behavior, not scientific simulation accuracy.

---

## 8. Convergence detection

### 8.1 Purpose

A graph that has visually settled should not continue consuming full runtime resources forever.

### 8.2 Convergence config

```ts
export interface GWConvergenceConfig {
  enabled: boolean;

  averageVelocityThreshold: number;
  maxVelocityThreshold: number;

  requiredStableFrames: number;

  autoPauseOnConvergence: boolean;
}
```

### 8.3 Suggested defaults

```txt
averageVelocityThreshold: 0.03
maxVelocityThreshold: 0.15
requiredStableFrames: 30
autoPauseOnConvergence: true
```

These values should be tuned through visual testing.

### 8.4 Settled behavior

When settled:

```txt
runtime state → settled
physics stepping stops or becomes low-frequency
UI may show “settled”
graph can wake on interaction/profile change
```

---

## 9. Frame budget semantics

### 9.1 Purpose

`frameBudgetMs` should define a maximum amount of work GWells attempts per frame.

### 9.2 Contract

When `frameBudgetMs` is present:

```txt
The engine should avoid exceeding the frame budget when possible.
The engine may defer remaining work to later frames.
The engine should expose diagnostics when budget is exceeded.
```

### 9.3 First implementation

The current engine loop is O(N²)-ish for many interactions. Full budget enforcement may require deeper refactoring.

v0.2 bridge behavior:

```txt
Recognize frameBudgetMs.
Emit warning if graph size likely exceeds budget.
Clamp expensive profiles for large graphs.
Avoid pretending budget is fully enforced until candidate pruning exists.
```

### 9.4 Later implementation

Future runtime may add:

```txt
spatial indexing
candidate pruning
chunked stepping
worker execution
Barnes-Hut approximation
LOD-based physics
```

---

## 10. Stop semantics

### 10.1 Contract

`stop()` must:

```txt
cancel scheduled frame
set runtime state to stopped
prevent future scheduled ticks
release runtime references where possible
prevent resume from restarting stopped runtime
```

### 10.2 Idempotency

`stop()` should be safe to call multiple times.

```txt
Calling stop twice should not throw.
```

---

## 11. Pause semantics

### 11.1 Contract

`pause()` must:

```txt
set runtime state to paused
cancel scheduled frame
not schedule another frame until resume/step
preserve current velocities and positions
```

### 11.2 Idempotency

`pause()` should be safe when already paused.

---

## 12. Resume semantics

### 12.1 Contract

`resume()` must:

```txt
restart scheduling only if runtime is paused or settled
not restart if stopped
not duplicate animation loops
```

### 12.2 Wake from settled

`resume()` may wake a settled runtime.

Graph/profile changes should also wake settled runtime automatically.

---

## 13. Profile reapply safety

Applying a new profile while physics is running should not create multiple loops.

Recommended sequence:

```txt
1. pause or stop current loop
2. resolve new profile runtime
3. rebuild required caches
4. optionally reseed
5. preserve pins/overrides according to apply mode
6. restart or settle depending on options
```

### 13.1 No duplicate loop rule

There must never be two active RAF loops controlling the same graph.

---

## 14. Cache rebuild requirements

Profile changes may invalidate runtime caches.

Must rebuild when:

```txt
seed layout changes
seed params change
profile changes
family map changes
node well assignments change
interaction set changes
graph topology changes
contains/parent edges change
```

Caches likely needing rebuild:

```txt
nodeAssignments
parentOfNode
resolvedInteractions
resolvedWellParams
pairIdealDistance
seed positions
pinned set
```

### 14.1 Pair ideal distance bug

When seed parameters change and the seed is rerun, pair ideal distances must be rebuilt.

Do not allow stale parent-child ideal distances after reseed.

---

## 15. Reseed lifecycle

Reseeding should be treated as a lifecycle event.

Recommended sequence:

```txt
1. pause runtime
2. snapshot pin/user-position state
3. run seed layout
4. restore preserved pins
5. rebuild seed-position caches
6. rebuild pair ideal distances
7. reset or scale velocities
8. resume or step depending on apply options
```

### 15.1 Velocity handling

After full reseed:

```txt
reset velocities to zero
```

After soft reseed, future behavior may preserve or damp velocities.

---

## 16. Error handling

Runtime errors should not trap the app in an infinite loop.

If an error occurs during a tick:

```txt
set runtime state to error
cancel scheduled frame
call onError if provided
store diagnostic message
avoid repeated console spam
```

### 16.1 Error callback

```ts
export interface GWRuntimeError {
  message: string;
  cause?: unknown;
  phase:
    | "seed"
    | "resolve"
    | "step"
    | "schedule"
    | "reseed"
    | "profile-apply";
}
```

---

## 17. Debug callback

Instead of unconditional console logging, use an optional debug callback.

```ts
export interface GWDebugEvent {
  type:
    | "runtime-start"
    | "runtime-stop"
    | "runtime-pause"
    | "runtime-resume"
    | "runtime-settled"
    | "budget-warning"
    | "profile-apply"
    | "reseed"
    | "cache-rebuild";

  message: string;
  data?: Record<string, unknown>;
}
```

```ts
onDebug?: (event: GWDebugEvent) => void;
```

---

## 18. Large graph safety

For large graphs, runtime should prefer conservative behavior.

### 18.1 Large graph

```txt
nodeCount > 1000
```

Recommended:

```txt
lower maxVelocity
higher damping
reduced long-range interactions
stable profile suggestions
warnings for high-motion profiles
```

### 18.2 Huge graph

```txt
nodeCount > 3000
```

Recommended:

```txt
avoid experimental expensive profiles
warn before relationship-heavy physics
prefer seed-heavy layouts
consider auto-pausing sooner
defer high-density interactions until spatial optimization exists
```

---

## 19. Runtime diagnostics

Expose runtime diagnostics for UI/debug panels.

```ts
export interface GWRuntimeDiagnostics {
  state: GWRuntimeState;
  frameCount: number;
  lastStepMs?: number;
  lastFrameBudgetExceeded?: boolean;

  averageVelocity?: number;
  maxVelocity?: number;
  movedNodeCount?: number;

  settledFrameCount?: number;

  warnings: string[];
}
```

Controller method:

```ts
getRuntimeDiagnostics(): GWRuntimeDiagnostics;
```

---

## 20. Public API target

```ts
export interface GWController {
  stop(): void;
  pause(): void;
  resume(): void;
  step(options?: GWStepOptions): GWStepResult;

  getRuntimeState(): GWRuntimeState;
  getRuntimeDiagnostics(): GWRuntimeDiagnostics;

  getDialectId(): string;
  getResolvedConfig(): Required<GWDialectConfig>;

  applyConfigOverride(nextOverride: Partial<GWDialectConfig>): void;
  applyPins(pins: Record<string, { x: number; y: number; z?: number }>): void;
}
```

Profile-aware extension:

```ts
export interface GWProfileController extends GWController {
  applyProfile(profileId: string, options?: GWApplyProfileOptions): GWApplyProfileResult;
  getCurrentProfileState(): GWProfileOverrideState;
}
```

---

## 21. Implementation sequence

### Pass 1 — Stop/pause correctness

Implement:

```txt
cancel RAF on pause
cancel RAF on stop
prevent duplicate loops
make stop/pause idempotent
```

### Pass 2 — Manual step

Implement:

```txt
controller.step()
step result diagnostics
manual scheduler for tests
```

### Pass 3 — Cache rebuild correctness

Implement:

```txt
rebuild pairIdealDistance on reseed
clear/reset velocity on full reseed
centralize cache rebuild
```

### Pass 4 — Runtime state and diagnostics

Implement:

```txt
runtime state enum
getRuntimeState()
getRuntimeDiagnostics()
debug callback
remove unconditional console logging
```

### Pass 5 — Convergence

Implement:

```txt
average velocity tracking
max velocity tracking
settled frame counter
auto-pause on convergence
wake on change
```

### Pass 6 — Frame budget and scale warnings

Implement:

```txt
frame budget diagnostics
large/huge graph warnings
profile safety clamps
```

---

## 22. Test checklist

### 22.1 Lifecycle tests

- stop cancels scheduled frame
- stop is idempotent
- pause cancels scheduled frame
- pause is idempotent
- resume does not duplicate loops
- resume does not restart stopped runtime
- manual step works while paused
- manual step does not require RAF

### 22.2 Cache tests

- reseed rebuilds pair ideal distances
- seed parameter override rebuilds caches
- family map change rebuilds node assignment cache
- interaction set change rebuilds interaction cache

### 22.3 Convergence tests

- settled state triggers after stable frames
- graph wakes after profile change
- graph wakes after pin/drag/reseed
- auto-pause stops scheduling after convergence

### 22.4 Safety tests

- large graph emits warning for expensive profile
- huge graph clamps motion defaults
- runtime error stops scheduling
- onError receives phase information
- onDebug receives lifecycle events

---

## 23. Non-goals

This doc does not require:

- Barnes-Hut implementation
- worker-thread physics
- full LOD physics
- 3D physics activation
- precise physical simulation accuracy
- advanced integrator replacement
- complete performance optimization

Those remain future engine work.

---

## 24. Success criteria

This runtime lifecycle work is successful when:

- GWells can be paused without wasting RAF cycles
- GWells can be stopped without leaking loops
- tests can step physics deterministically
- profile changes do not duplicate animation loops
- reseeding rebuilds all affected caches
- convergence can settle the graph
- large graphs trigger safe defaults/warnings
- debug information flows through callbacks instead of console noise

---

## 25. Guiding principle

The engine should be lively when the user needs motion.

It should be quiet when the graph is done.
