# Layout & Physics — Roadmap

Branch: TBD (`feat/radial-layout`)

The graph is a **filesystem hierarchy** with semantic relations layered on top. Today the
layout does not know that, the physics cannot fix it, and the rendering does not distinguish
the two. This roadmap fixes all three, in that order.

---

## 0. Vocabulary

Terminology, so intent can be stated precisely instead of gestured at.

**Radial hierarchical layout** (radial tree / radial dendrogram) — depth maps to **radius**.
Each tree level is a concentric **ring**. This is the "concentric circle hierarchy".

**Angular budget** — the load-bearing idea. Each subtree is allocated an angular **wedge**
(*sector*), sized in proportion to its **leaf count**, and recursively subdivided among its
children. Siblings therefore own **disjoint angular ranges**, which makes sibling overlap
*impossible by construction* rather than something the physics has to fight. The current
seeder has no angular budget at all — it hands every sibling the same direction vector.

**Annulus** — the ring between two radii. **Angular extent** — the width of a wedge in degrees.
**Leaf-count weighting** — a subtree's wedge is proportional to how many leaves it contains, so
dense subtrees get more room than sparse ones.

**Reingold–Tilford** — the classic "tidy tree" algorithm; guarantees no sibling overlap. The
polar adaptation is what we want.

**Tree edges vs non-tree edges** — the `contains` edges form a **spanning tree** (412 of them
over 458 nodes). Everything else (866 edges: `code-import`, `describes`, `explicit-reference`,
`tag-overlap`, `governs`, `markdown-link`) are **non-tree edges**. Only tree edges should define
the layout.

**Hierarchical Edge Bundling** (Holten, 2006) — the canonical technique for exactly this
picture: draw the hierarchy radially, then route the *non-hierarchical* relations as bundles
that follow the tree, drawn thin and recessive. This is the target rendering.

**Seed vs relaxation** — a *seed* is the initial position assignment; *relaxation* is physics
settling it. A good system seeds well and relaxes gently. This one seeds badly and then
**servos back to the seed** (see §1.4), which is the worst of both.

**Target, in one sentence:**
> A radial hierarchical layout with leaf-weighted angular budgets, multiple roots on opposing
> hemispheres, tree edges solid, and semantic edges bundled and recessive.

---

## 1. Diagnosis (verified against the code and the live fixture)

### 1.1 Sibling directories are seeded at byte-identical coordinates

`radialBackbone.ts:126-144` — at depth 0 a directory's position is a pure function of the
parent position, an alternation sign, and the spine angle. **No per-sibling term.** At depth ≥ 1
it is worse: the child inherits `myDir` verbatim, so every child of a directory lands on the
single point `parentPos + myDir × directoryOffset`.

Replayed against `src/fixtures/self-graph-generated.json`:

```
20 directories on ONE point   ← children of src.control-plane
11 directories on ONE point   ← children of src.graph
 2 directories on ONE point   ← docs.graph
 2 directories on ONE point   ← docs.theme
────────────────────────────
35 directories in 4 coincident piles
```

Regression introduced by `c537ea6` ("Pass C8.4"), which replaced the `siblingIndex` parameter
with a shared `alternationSign` and never reintroduced angular spreading. (The depth ≥ 1 pile
predates it — `siblingIndex` was only ever consulted in the `depth === 0` branch.)
`parallelSpines.ts:138-144` has the same defect.

### 1.2 Coincident nodes can never separate

`engine.ts:414-441`. For two nodes at identical positions `dx = dy = 0`, so although the
repulsion *magnitude* saturates at `strength × 100`, the applied force is
`(dx/dist, dy/dist) × force` = **(0, 0)**. The direction vector is undefined and silently
becomes zero. There is **no `Math.random()` anywhere in the gwells tree** — no jitter, no
symmetry-breaking. Coincident nodes are a stable fixed point.

### 1.3 Repulsion is not size-aware, and its range is decorative

The physics loop reads only `x`, `y`, `fixed` (`engine.ts:372-378`). It never reads `size` —
even though `computeNodeSize` produces visual radii between **48 and 360**
(`seederHelpers.ts:268`). Meanwhile file↔file repulsion has `range: 140` and the parent spring's
rest length is ~90. **Two nodes with radius 200 will rest 90px apart and be considered
correctly separated.**

The force law is `strength / max(distSq × 0.01, 0.01)` with `strength = 1.0`, so:

| gap | force |
|---|---|
| 1 px | 100 (clamped) |
| 10 px | 1.0 |
| 50 px | 0.04 |
| 100 px | 0.01 |
| 320 px (`range`) | ~0.001 |

The declared `range: 320` is meaningless — the force is already nil by ~30px.

### 1.4 The seed is an attractor, not a starting guess

Three mechanisms hold the graph on the seed:

1. **Spines are hard-pinned** (`wellTypes.ts:21`) *and re-pinned at render time* — Sigma's
   nodeReducer overwrites x/y from `__seededSpinePositions` every frame
   (`SigmaGraphView.tsx:461-473`).
2. **`seedAdherence`** (`engine.ts:489-495`) is a Hookean spring straight back to the seed, with
   **no distance falloff and no range cutoff**, applied every frame.
3. **Spring rest lengths are derived from the seed** (`engine.ts:291-330, 443-455`) — the
   configured `idealDistance` is ignored in favour of the seeded distance.

Net: **the physics is a machine for restoring the seed.** A bad seed plus an engine forbidden
from fixing it.

### 1.5 Dead parameters — tuning them does nothing

- `siblingRepulsion` — tuned to 250/120/100/80 across 4 well types, overridden per-dialect to
  280/120/90 — is resolved at `engine.ts:229` and **never read by the force loop.** All actual
  repulsion comes from `interaction.strength`.
- `attractionStrength` — same: resolved, never read. No interaction even uses `kind: "attraction"`.
- Seed params `directoryAlternation`, `fileOrbitRadius`, `endpointFanArc`, `endpointFanCount` —
  parsed, never used.

### 1.6 Alternation is dead in this repo

`shouldUseHubRing` turns on at ≥4 root spines; the self-graph has **41**. In hub-ring mode each
spine run is a single node, so `nodeIndex` is always 0, so `alternationSign` is always `+1`.
**Every top-level directory is kicked in the same perpendicular direction.** The above/below
alternation does not run.

### 1.7 The radial backbone has no angular budget to spend

Directories never receive an angular fan. A subtree is a **straight ray**: one 90° kick off the
spine, then every deeper level extends in *exactly the same direction*. With 2 spokes there are
2 available directions for the whole tree — with hub-ring on, **one**. The seeder has zero
remaining degrees of freedom in 2D.

This is why it feels cramped, and why "3D would be better" is only half right: **the 2D angular
budget was never spent.** Recover the fan and 2D stops being cramped; 3D then becomes an
aesthetic choice rather than an escape hatch.

### 1.8 Rendering does not distinguish structure from semantics

458 nodes, 1,278 edges. **412 are `contains` (the tree). 866 (68%) are semantic** — and all of
them render as if they were primary, with animated highlighting. The structure is drowned in
its own annotations.

### 1.9 A shadowing typo

`radialBackbone.ts:293` — `const { radius, angleRad } = computeFileOrbit(...)` shadows the outer
spine `angleRad`, so `const finalAngle = angleRad + angleRad` **doubles the phyllotaxis angle**
instead of rotating the orbit into the spine frame. `parallelSpines.ts:309` does it correctly.

### 1.10 Controls: 64 knobs, 4 widgets

| | count |
|---|---|
| Addressable engine knobs (radial-backbone) | **64** |
| Declared in the settings schema | **1** (`physics.dialectId`) + an untyped bag |
| UI widgets in the Physics tile | **4** (dialect + 3 helix-twist sliders) |
| UI widgets in the Settings panel | **1** |

The blocker is **addressing**: the settings registry keys controls by static dot-path, but seed
params live at `physics.seedParamOverrides[<dialectId>].<param>` — and **dialect IDs contain
dots**. `getNestedValue` splits on `.`, so the path cannot be expressed. That is why
`HelixTwistSliders` is a bespoke hand-written component instead of three registry entries.
**Until this is fixed, every new control is another bespoke component.**

### 1.11 Other rot found along the way

- `physics.resetLayout` and `graph.cycleDialect` — command-palette entries that `dispatch()`
  events **nobody listens for**. Dead.
- "Reset Pinned" button is **unreachable** — gated behind a branch an earlier `if` always claims.
- Persisted helix-twist values are **silently dropped on page load** (controller is still null
  when the effect fires). One-line fix.
- `graphView.defaultLayout` exists in the schema with 7 lens values (`constellation`,
  `districts`, `solar-orbit`, `helix`, `trihelix`, `pipeline`, `impact-rings`) and **nothing
  reads it.** A whole `lensRegistry` sits unused.
- **No settle criterion.** The sim runs at RAF forever; motion only decays because damping
  bleeds it. Nothing says "done".
- Integration is explicit Euler with an implicit `dt = 1` — **framerate-dependent physics.**

---

## 2. Phases

### Phase 1 — Unstack (correctness)

Nothing else can be judged while 35 directories are in 4 piles.

- **L-001 · Angular budget in the seeder.** ✅ DONE. `placeBranchRecursive` now takes a wedge;
  each subtree gets an angular extent weighted by leaf count, recursively subdivided among
  children (`seederHelpers.subdivideWedge`, shared by both seeders). All 35 unstacked.

  `parallelSpines` needed a second fix on top: it fanned branches *and* orbited files in the
  **x/z plane**, and Sigma renders only **(x, y)**. The entire fan was projected away — even a
  correct azimuthal spread would still have rendered as a pile, and file orbits were horizontal
  rings seen exactly edge-on (a line segment, with every ±θ pair coincident). Both now fan in the
  spine's own **vertical plane** — `dir(φ) = outward(α)·cos φ + ŷ·sin φ` — which varies x *and* y,
  so the fan survives projection while `z` still carries the azimuth for a future 3D camera.
- **L-002 · Symmetry-breaking in the engine.** ✅ DONE. When `dist < 0.5`, the pair is given a
  deterministic separation direction from an FNV-1a hash of the two node ids (antisymmetric, so
  A→B and B→A oppose). Not `Math.random()` — the layout stays repeatable. Inert on a healthy
  layout; pure insurance so coincidence can never again be permanently fatal.
- **L-003 · Size-aware repulsion.** ⛔ BLOCKED — **the premise above was wrong.** Two findings:

  1. **`size` is a live presentation attribute, not a structural one.** `graphStylePolicy`
     rewrites it on selection and hover (`baseSize × selected`, neighbours `× secondary`, suns
     `× 1.8`, isolated `× 0.75`). Feeding `size` into the force loop would make *selecting a node
     physically shove its neighbourhood apart* — presentation state driving the simulation. The
     structural attribute is **`baseSize`**; any size-aware force must read that.
  2. **`r_a + r_b + padding` would explode the layout.** Measured on the self-graph: `baseSize`
     runs 48 → 360, median **219** — against a `directoryOffset` of **220**. Nodes are already
     drawn about as large as the gap between them. Demanding `r_a + r_b` of separation would ask
     the median pair for ~438 units where the seeder allots 220, and the sim would inflate until
     it hit that or tear itself apart.

  Meanwhile only **0.62%** of pairs (652 / 104,653) actually overlap after settling. This does not
  want a force-law rewrite. It wants either a **bounded overlap-resolution term** (a short-range
  push that acts only on the 0.62%, capped so it cannot inflate the whole graph) or — cheaper and
  probably the real answer — a **node-size scale that is not 1:1 with node spacing**. See L-019.
- **L-004 · Resolve the dead parameters.** ✅ DONE — deleted. `siblingRepulsion` and
  `attractionStrength` are gone from `GWWellTypeDefaults`, from the four well-type defaults, from
  the per-dialect overrides, and from the engine's resolution table. A clean typecheck with zero
  remaining references is the proof that nothing read them. Zero behaviour change, which was the
  whole point: they were tuned numbers that did nothing, so anyone tuning the layout would reach
  for the parameter *named after the problem* and watch it do nothing. Repulsion comes from
  `interaction.strength`; attraction comes from the springs.
- **L-005 · Fix the `angleRad` shadowing typo.** ✅ DONE. `radialBackbone` destructured
  `angleRad` from `computeFileOrbit` into a name that shadowed the spine's own `angleRad`, then
  computed `angleRad + angleRad` — discarding the orbit angle and stacking every file in a
  directory onto one ray. Renamed to `orbitAngle`; `computeFileOrbit`'s contract (the angle it
  returns is *relative to the parent*) is now documented at the definition.

**Acceptance:** no two nodes share coordinates after seeding — ✅ asserted by
`tests/e2e/gwells-seed-separation.spec.ts`, which covers **both** dialects (3 assertions each:
no coincident pairs, no directory piles, no pair closer than 8 units, with a guard against a
vacuous pass on an empty seed set). Verified to *fail* against both pre-fix seeders with the
signature `docs.graph.contracts ↔ docs.graph.intelligence at 0.00 units`.

The second half of the original acceptance — "no node pair overlaps by more than X% of combined
radii after settling" — is deferred with L-003, since the measurement above shows X cannot be
chosen sensibly until node size and node spacing stop being the same number.

### Phase 1b — Node scale (new, from the L-003 evidence)

- **L-019 · Decouple node size from node spacing.** `baseSize` median 219 vs `directoryOffset`
  220 means a node is as wide as its distance to its neighbour, so the graph reads as "everything
  stacked" even where the seeds are provably distinct. This is very likely a large share of the
  visual crowding — and it is a *one-number* fix, not a physics rewrite. Establish the intended
  ratio (node diameter should be some fraction of nearest-neighbour spacing), then set it in one
  place. Do this **before** any further physics tuning: every force constant is currently being
  judged against a picture whose nodes are too big for their spacing, so tuning against it now
  would bake the error into the constants.

### Phase 2 — Loosen (feel)

- **L-006 · Seed adherence becomes a bias, not a servo.** Reduce toward 0 and/or add a falloff so
  it is a weak home-pull, not a spring lock.
- **L-007 · Springs use their configured `idealDistance`**, not the seeded distance.
- **L-008 · Settle criterion.** Stop the sim when kinetic energy falls below a threshold for N
  frames. Also unblocks the thumbnail capture, which currently guesses with a timeout.
- **L-009 · Timestep.** Introduce a real `dt` so physics is not framerate-dependent.

**Acceptance:** dragging a node and releasing it relaxes locally instead of snapping back.

### Phase 3 — Edge semantics (this is the big visual win)

- **L-010 · Classify edges as tree vs non-tree.** `contains` = structural; all others = semantic.
- **L-011 · Only tree edges influence layout.** Semantic edges get zero (or near-zero) force.
- **L-012 · Recessive rendering for semantic edges.** Dimmed, dashed, thin. Reserve animation and
  saturation for structure and for the selection/neighbourhood lens.
- **L-013 · Hierarchical edge bundling** for semantic edges — route them along the tree.
- **L-014 · Edge-class visibility toggles** (`code-import`, `describes`, …) so 866 edges can be
  filtered by kind.

**Acceptance:** the hierarchy is legible at a glance with all semantic edges on.

### Phase 4 — Controls

- **L-015 · Fix registry addressing.** Add a `SettingControl` variant for dialect-scoped params
  (`{ dialectScoped: true, key: "spineSpacing" }`) with a resolver that reads/writes
  `physics.seedParamOverrides[activeDialect]`. **Prerequisite for everything below.**
- **L-016 · De-duplicate the two ~90-line render switches** in `PhysicsSectionContent` and
  `CategoryGraph` into one shared renderer, or every widget type must be built twice.
- **L-017 · Expose the ~40 worthwhile parameters** as registry entries, grouped (Seed / Forces /
  Damping / Rendering).
- **L-018 · Remove the rot** — dead commands, the unreachable Reset Pinned button, the dropped
  helix-twist-on-load bug.

### Phase 5 — New seeds

With the angular budget recovered, real options open:

- **Radial tidy tree (Reingold–Tilford, polar).** The direct expression of the stated goal.
  Multiple roots → opposing hemispheres. **Recommended default.**
- **Squarified treemap.** Space-filling, zero overlap by construction. Excellent for "how big is
  this directory" at a glance; poor for showing cross-links.
- **Force-directed with hierarchical constraints.** Loosest feel; least predictable.
- **3D radial.** Now an aesthetic choice, not a workaround for a spent 2D budget.
- The 7 unused `lensRegistry` shapes already in the schema.

---

## 3. Open questions

1. **Multiple roots.** `/src` and `/docs` on opposing hemispheres is clear for 2 roots. What is
   the rule for N? Equal hemispheres, or leaf-weighted sectors (so `/src` gets more arc than
   `/docs` because it has more files)?
2. **Do files get rings, or orbits?** Strict radial-tree says files are just the leaf ring. The
   current phyllotaxis orbit around the parent directory is prettier but breaks the concentric
   reading. Pick one.
3. **Should physics run at all after a good seed?** A correct radial tidy tree needs no
   relaxation. Physics could become purely interactive (drag, pin) rather than a layout engine.
   This is a real design fork and worth deciding deliberately.
4. **Bundling strength** — how aggressively to bundle 866 semantic edges before the hierarchy is
   obscured by the bundles themselves.

---

## 4. Suggested order

Phase 1 first, always — the pile-up makes everything else unjudgeable. Then Phase 3 (edge
semantics), because it is the biggest visual payoff per hour and is **independent of the layout
work**. Then Phase 2, then 4, then 5.
