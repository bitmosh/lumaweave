---
id: physics.gwells.probes-and-diagnostics
title: Gwells Physics — Probes and Diagnostics
status: active
last-updated: 2026-05-17
---

# Gwells Physics — Probes and Diagnostics

This is a reference for diagnosing gwells issues. Most diagnostics happen in
the dev server's browser console using globally-installed probes.

## Installed window probes

In dev mode and Playwright mode (NOT production), these globals are
installed:

- **`window.__lwSigma`** — the Sigma instance. Use `getGraph()`, `getCamera()`,
  `getSettings()`, `getContainer()`, etc.
- **`window.__lwGetGwellsState`** — returns the engine state object including
  `dialectId`, `frame` counter, `nodes` Map, etc. Returns `null` if no dialect
  is active.

Both are installed via `installGwellsProbeGlobal` in
`src/graph/renderers/sigma2d/gwellsProbe.ts`. They are gated behind
`import.meta.env.DEV || window.PLAYWRIGHT`.

A note on `undefined` in the console: when you assign to a variable
(`const x = ...`), the console echoes `undefined` after — that's the
statement's return value, not an error. Ignore it.

## Common diagnostic patterns

### Check active dialect

```javascript
const state = window.__lwGetGwellsState();
console.log("Active dialect:", state?.dialectId);
console.log("Frame:", state?.frame);
```

### Check overall layout extent

```javascript
const sigma = window.__lwSigma;
const graph = sigma.getGraph();
let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
let furthestDist = 0, furthestNode = null;
graph.forEachNode((id, attrs) => {
  if (attrs.x < minX) minX = attrs.x;
  if (attrs.x > maxX) maxX = attrs.x;
  if (attrs.y < minY) minY = attrs.y;
  if (attrs.y > maxY) maxY = attrs.y;
  const d = Math.sqrt(attrs.x ** 2 + attrs.y ** 2);
  if (d > furthestDist) { furthestDist = d; furthestNode = id; }
});
console.log(`Extent: x=[${minX.toFixed(0)}, ${maxX.toFixed(0)}], y=[${minY.toFixed(0)}, ${maxY.toFixed(0)}]`);
console.log(`Furthest: ${furthestNode} at ${furthestDist.toFixed(0)}`);
```

### Check camera and node size

```javascript
const sigma = window.__lwSigma;
console.log("Camera ratio:", sigma.getCamera().getState().ratio);
console.log("Container size:", sigma.getContainer().getBoundingClientRect());
console.log("itemSizesReference:", sigma.getSettings().itemSizesReference);

// Pick a sample node and show its size
const sample = sigma.getGraph().getNodeAttributes("docs.physics");
console.log("Sample node size:", sample.size, "rawSize:", sample.rawSize);
```

With `itemSizesReference: "positions"` (the Pass C8.4 setting), node sizes
live in graph coordinates. At current values (`computeNodeSize` MIN 48,
MAX 360), a directory of moderate content renders at ~150-250 graph units
of visual radius against `directoryOffset: 2400` spacing — comfortable
proportion. If `itemSizesReference` is "screen" instead of "positions",
something has reverted the Pass C8.4 fix — check the Sigma instantiation
in `SigmaGraphView.tsx`.

### Check spine layout (Pass C8.4 verification)

```javascript
const sigma = window.__lwSigma;
const graph = sigma.getGraph();

const spines = [];
graph.forEachNode((id, attrs) => {
  if (attrs.nodeType === "spine") {
    const category = id.startsWith("spine.src") ? "src"
                  : id.startsWith("spine.docs") ? "docs" : "other";
    spines.push({ id, x: Math.round(attrs.x), y: Math.round(attrs.y), category });
  }
});
spines.sort((a, b) => a.x - b.x);

console.log("Spines sorted by x:");
spines.forEach(s => console.log(`  [${s.category.padEnd(5)}] ${s.id.padEnd(40)} (${s.x}, ${s.y})`));

const negCats = new Set(spines.filter(s => s.x < 0).map(s => s.category));
const posCats = new Set(spines.filter(s => s.x > 0).map(s => s.category));
console.log(`Negative-x axis categories: ${[...negCats].join(", ")}`);
console.log(`Positive-x axis categories: ${[...posCats].join(", ")}`);
```

After Pass C8.4: negative-x should be one category, positive-x the other.
Before C8.4: both axes were a mix.

### Check fern-frond alternation

```javascript
const sigma = window.__lwSigma;
const graph = sigma.getGraph();

function frontDirection(spineId) {
  const spineAttrs = graph.getNodeAttributes(spineId);
  let totalY = 0, count = 0;
  graph.forEachOutEdge(spineId, (eid, eattrs, src, tgt) => {
    const t = eattrs.relationship || eattrs.raw?.type;
    if (t !== "contains") return;
    const tAttrs = graph.getNodeAttributes(tgt);
    const tType = tAttrs.nodeType || tAttrs.raw?.type;
    if (tType === "directory") {
      totalY += (tAttrs.y - spineAttrs.y);
      count++;
    }
  });
  return count ? Math.round(totalY / count) : 0;
}

const spines = [];
graph.forEachNode((id, attrs) => {
  if (attrs.nodeType === "spine") spines.push({ id, x: Math.round(attrs.x) });
});
spines.sort((a, b) => a.x - b.x);

console.log("Spine fronts (avg y-offset of first-level dirs):");
spines.forEach(s => {
  const dir = frontDirection(s.id);
  console.log(`  ${s.id.padEnd(40)} avgDirY=${dir} (${dir > 0 ? "up" : dir < 0 ? "down" : "empty"})`);
});
```

After Pass C8.4: avgDirY should alternate up, down, up, down for consecutive
spines along an axis.

### Check per-pair spring agreement (Pass C8.2 verification)

```javascript
const sigma = window.__lwSigma;
const graph = sigma.getGraph();
const seeds = graph.getAttribute('__gwellsSeedPositions');

function measureBothRadii(dirId) {
  if (!graph.hasNode(dirId)) return null;
  const dirSeed = seeds.get(dirId);
  const dirCurrent = graph.getNodeAttributes(dirId);
  const seededDists = [];
  const currentDists = [];
  graph.forEachOutEdge(dirId, (eid, eattrs, src, tgt) => {
    const t = eattrs.relationship || eattrs.raw?.type;
    if (t !== "contains") return;
    const tAttrs = graph.getNodeAttributes(tgt);
    const tType = tAttrs.nodeType || tAttrs.raw?.type;
    if (tType === "doc" || tType === "code" || tType === "config" || tType === "fixture") {
      const fileSeed = seeds.get(tgt);
      if (fileSeed && dirSeed) {
        seededDists.push(Math.sqrt((fileSeed.x-dirSeed.x)**2 + (fileSeed.y-dirSeed.y)**2));
      }
      const dxc = tAttrs.x - dirCurrent.x;
      const dyc = tAttrs.y - dirCurrent.y;
      currentDists.push(Math.sqrt(dxc*dxc + dyc*dyc));
    }
  });
  const avg = a => a.length ? Math.round(a.reduce((s,v)=>s+v,0) / a.length) : 0;
  return { dirId, fileCount: currentDists.length, seededAvg: avg(seededDists), currentAvg: avg(currentDists) };
}

console.log(JSON.stringify(measureBothRadii("docs.physics"), null, 2));
console.log(JSON.stringify(measureBothRadii("src.control-plane.panels"), null, 2));
```

After Pass C8.2: `seededAvg` and `currentAvg` should match closely. If they
diverge significantly, the spring force is fighting the seeder — investigate.

### Check overall drift

```javascript
const sigma = window.__lwSigma;
const graph = sigma.getGraph();
const seeds = graph.getAttribute('__gwellsSeedPositions');
let totalDrift = 0, n = 0, maxDrift = 0;
seeds.forEach((seedPos, id) => {
  const a = graph.getNodeAttributes(id);
  const d = Math.sqrt((seedPos.x - a.x)**2 + (seedPos.y - a.y)**2);
  totalDrift += d; n++; if (d > maxDrift) maxDrift = d;
});
console.log(`Drift: avg ${(totalDrift / n).toFixed(1)}, max ${maxDrift.toFixed(0)}, n=${n}`);
```

Healthy after Pass C8.2: avg < 20, max < 100 (with current sizing model
values, max may be somewhat higher). Pre-C8.2 was avg ~370.

### Check phyllotaxis size correlation (Pass C8.3 verification)

```javascript
const sigma = window.__lwSigma;
const graph = sigma.getGraph();

const dirId = "docs.physics";
const dirAttrs = graph.getNodeAttributes(dirId);
const children = [];
graph.forEachOutEdge(dirId, (eid, eattrs, src, tgt) => {
  const t = eattrs.relationship || eattrs.raw?.type;
  if (t !== "contains") return;
  const tAttrs = graph.getNodeAttributes(tgt);
  if (["doc","code","config","fixture"].includes(tAttrs.nodeType)) {
    children.push({
      id: tgt,
      rawSize: tAttrs.rawSize,
      visualSize: tAttrs.size?.toFixed(2),
      orbitRadius: Math.round(Math.sqrt((tAttrs.x-dirAttrs.x)**2 + (tAttrs.y-dirAttrs.y)**2)),
    });
  }
});
children.sort((a, b) => a.rawSize - b.rawSize);
console.log("Children sorted by rawSize:");
children.forEach(c => console.log(`  rawSize=${c.rawSize?.toString().padStart(5)} visualSize=${c.visualSize} orbit=${c.orbitRadius}`));
```

After Pass C8.3: orbitRadius should monotonically increase with rawSize.

## Validator script

```bash
npm run physics:gwells
```

Runs `scripts/validate-gwells.mjs`. 12 checks:

1. File existence (the 5 module files)
2. Required helper functions
3. Required types exports
4. Standalone import discipline (no `@/` imports)
5. Well type entry shape
6. Interaction entry shape
7. Seed function entry shape
8. Dialect entry shape
9. Exactly one default dialect
10. Cross-reference integrity (interactions reference real well types, etc.)
11. Status reference rule (no active entry references a retired entry)
12. Standalone module typecheck (`tsc --noEmit` from within
    `src/physics/gwells/`)

Run after any change to gwells. Should always be 12/12.

## E2E test spec

```bash
npm run qa:e2e -- tests/e2e/gwells-physics.spec.ts
```

10 tests cover:

- Engine state populated after page load
- Default dialect is `gwells.dialect.radial-backbone`
- All node positions finite (no NaN/undefined drift)
- Dialect switching via dropdown works
- Frame counter advances (physics loop running)
- Seed positions stored and accessible
- Drag-seed retention (threshold relaxed to 1100 in Pass C8.4; Pass C9 will
  rework entirely)
- Other smoke checks

Run after any change to gwells, source adapter, or related Sigma code.

## Project-wide tests

```bash
npm run qa:e2e
```

Full test suite. Currently 358/366 passing. The 8 failures are pre-existing
and unrelated to gwells:

- contract-registry-spec
- quality-preset-coupling (2 tests)
- settings-migrations
- theme-target-inspector (3 tests)
- v86c-tile-system (2 tests)

Filed for separate cleanup. When running gwells changes, ensure the number
of failures stays at 8 — increases beyond that indicate gwells broke
something else.

## Forcing a re-seed during development

When you edit `dialects.ts` or `seederHelpers.ts`, Vite's HMR updates the
JavaScript modules but doesn't automatically re-run the seeder. The existing
node positions stay in place. Two ways to force a re-seed:

1. **Hard reload** the page (Ctrl+Shift+R or Cmd+Shift+R)
2. **Switch dialects** via the dropdown and back

The second is faster and preserves dev state.

## Common bug patterns

### "I'm not seeing my edits"

Symptom: edit a value, hot reload happens, but the graph looks the same.
Cause: edits to `seederHelpers.ts` or `dialects.ts` need a re-seed. Fix: hard
reload or dialect-switch toggle.

### "Coordinate spacing changes have no visible effect"

Symptom: you double `spineSpacing` or `directoryOffset`, do a hard reload,
and the visual layout looks identical. Tuning seems to have no effect at
all.
Cause: `itemSizesReference` has reverted to `"screen"` (Sigma's default).
With screen-pixel sizing, Sigma normalizes graph coordinates to a unit
square internally, so coordinate-space changes don't affect visual scale.
Fix: check `SigmaGraphView.tsx` near the `new Sigma(...)` call. The setting
`itemSizesReference: "positions"` must be present. This was set in Pass
C8.4; if missing, restore it. Verify in console:
```javascript
window.__lwSigma.getSettings().itemSizesReference  // should be "positions"
```

### "Files are stacked on top of their parent" (post-C8.4)

Symptom: a directory's file children appear to be drawn inside or
overlapping the parent dot, not spaced around it.
Cause (Pass C8.4 model): node visual sizes are too large relative to file
orbit radii, in graph coordinates. Either `computeNodeSize` outputs are
too high, or `computeFileOrbit` MIN_ORBIT is too small for current node
sizes.
Fix: check `computeNodeSize` constants in `seederHelpers.ts`; current values
are MIN 48, MAX 360, SCALE_REF 6000. Check `computeFileOrbit`'s MIN_ORBIT
math in the same file. If you've recently changed one, the other likely
needs proportional adjustment. Use the orbit/size probe above to verify
the relationship.

### "Drift values are unexpectedly high"

Symptom: probe shows avg drift > 50 or so.
Cause: spring force not agreeing with seed-anchor force.
Fix: check that `pairIdealDistance` is populated. The probe
`measureBothRadii` shows whether `currentAvg` and `seededAvg` agree.

### "Spines are interleaving instead of bucketing"

Pre-Pass-C8.4 only. After C8.4, the bucketing-by-first-path-segment rule
should keep src and docs on separate axes. If they're mixed post-C8.4,
`assignSpinesToAxes` was reverted to alphabetical round-robin somewhere.

### "Alternation pattern is chaotic per-spine instead of static per-axis"

Pre-Pass-C8.4 only. Spines should alternate up-down-up-down along an axis
regardless of how many children each spine has. If you see consecutive
spines all pointing the same direction (or random direction), the
alternation logic isn't reading from per-axis index. Check
`placeBranchRecursive` — it should take an `alternationSign` parameter
computed from the spine's index in the axis, not from siblingIndex within
its parent.

### "Drag makes the graph go blank"

Pre-existing bug in SigmaGraphView's drag mouseup handler. Unrelated to
physics. Filed; will be addressed in Pass C9.

## Where to add new probes

If a recurring diagnostic pattern emerges, consider adding it to
`gwellsProbe.ts`. The current probe is minimal (state read only). New probes
should be:

- DEV/Playwright gated (don't ship in production)
- Read-only (don't allow external code to mutate engine state)
- Named `window.__lw*` for discoverability
