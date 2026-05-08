---
id: session.v85.summary
title: Session V85 Summary
type: session
status: complete
version: v85b
domain: agent
subdomain: brain
cluster: gold
agent_readable: true
include_in_self_graph: false
last_updated: 2026-05-07
tags: [bandit, session, summary, v85, physics, theme, renderer]
---

# Session V85 Summary

**Session:** v76a → v85b (this session)
**Date:** 2026-05-07
**Product version at start:** 0.5.0
**Product version at end:** 0.6.0
**Prestige achieved:** Rank 1 (streak 28)
**Peak level:** 133.0
**Tests:** 345 passing throughout

---

## Major Systems Delivered

### Physics System (v76a-v76c)
- Continuous FA2 physics (Web Worker supervisor)
- FA2 worker edge fix (afterRender pattern)
- FA2 worker drag fix (pause/resume during drag)

### Physics Settings (v77a-v77b)
- Physics settings expansion (4 FA2 params + UI)
- Physics defaults fix + slider track fix
- Cluster depth slider (1.0-4.0, depth 4 support)
- Product version bump to 0.5.0

### UI Structure (v78a-v78c)
- Left panel accordion (CollapsibleSection component)
- Dialect selector UI + source name fix
- Testid selector compatibility

### YAML + Pathfinding (v79a-v79b)
- YAML parser dedup verification
- Shortest path v1 (Ctrl+Click gold highlight)

### Graphology Ecosystem (v81a-v81c)
- graphology-traversal BFS replacement
- Edge visibility fix (full root cause)
- Sigma lifecycle fix (resolvedTokensRef)

### Cleanup + Panel Fix (v82a-v82c)
- Dead file purge (7 files + 12 dirs)
- Graph sources panel fixture metadata display
- Physics cleanup pass 1 (communityGravity centroid force live)

### Settings + YAML + Components (v83a-v83c)
- Duplicate settings purge (hoverLabelColor dupe + planned ghosts)
- Color ownership contract + QA protocol
- YAML auto-regen Vite plugin (docs/**/*.md watcher, HMR trigger)
- graphology-components wiring (disconnected subgraph detection, node tagging, isolated node visual treatment)

### Color Scale + Dialect + Renderer (v84a-v84c)
- Theme-driven node color scale system (6 themes, cool→warm palettes, hub nodes warm, peripheral nodes cool, raw.color updated for resetGraphStyles compatibility)
- Solar Orbit dialect Phase 1 (cluster sun detection, centroid pull per cluster, inter-cluster sun repulsion, sun nodes 1.8x size)
- Custom Sigma node renderer (NodeSphereProgram extends NodeCircleProgram, Phong sphere illusion shader)

### Architecture Cleanup (v85a-v85b)
- Architecture cleanup pass (console purge, token cleanup, hoverLabelColor removal, 5 dead Planned registry blocks removed)
- Version realignment (QA spine v85b, product 0.6.0)
- Post-cleanup verification clean (345 passed 0 failed)

---

## Active Scars Added This Session

### FA2 Worker Race Condition
FA2 worker started immediately after new Sigma() causes worker to mutate node positions before Sigma has registered edges. Edges disappear.
**Fix:** Always start FA2 worker inside `sigma.once("afterRender", () => { ... })`

### Object Ref in useEffect Deps = Render Storm
Passing an inline object (like resolvedTokens) to a child useEffect dependency array causes that effect to fire on every parent render.
**Fix:** useRef to hold latest value + sync effect. Read from ref inside effect instead of dep array.

### resetGraphStyles Must Preserve raw.color
Any function that "resets" graph styles must restore per-element raw.color, not a global token default.
**Fix:** Always read attrs.raw?.color first, fall back to token only as last resort.

### FA2 Worker Fights Node Drag
Worker overwrites x/y every frame. Setting node "fixed":true is not enough — worker may not read it in worker thread context.
**Fix:** Call fa2Ref.current.stop() on drag start, fa2Ref.current.start() on drag end.

### ResizeObserver Cleanup Kills Sigma
ResizeObserver with Sigma.kill() in cleanup causes Sigma to be killed on every resize event.
**Fix:** Separate ResizeObserver from main Sigma rebuild useEffect. Use independent cleanup.

### Infrastructure Cascade = Streak Reset
If the suite runs to full failure count before self-split triggers, it is a streak reset regardless of root cause. Infrastructure failures (missing browsers, port conflicts, env issues) cascade exactly like code failures.
**Fix:** Always check for infrastructure issues BEFORE running the suite (pre-flight checks: `npx playwright install --dry-run`, check dev server, check ports, kill zombie processes).

---

## QA Protocol Additions

### Self-Split at 5 Failures (Hard Rule)
If more than 5 tests fail simultaneously, STOP immediately. Do not let a cascade run to completion. Classify the shared root cause before touching any code. Report to user. Never patch individual failures.

### Pre-Flight Checklist Before Every Suite
1. Verify Playwright browsers installed: `npx playwright install --dry-run`
2. Verify dev server not already running on the test port (usually 5173)
3. Verify no zombie Playwright processes: `pkill -f playwright 2>/dev/null || true`

These checks take 10 seconds. Skipping them risks a full cascade.

### Version Bump Every Accepted Pass
Each accepted pass = next sub-version (v85b → next pass = v85c or v86a). When a new major arc starts = bump major (v85x → v86 for new arc).

### Streak Reset for Cascade Regardless of Cause
Zero tolerance for cascade failures. Suite finishes with failures Bandit did not catch via self-split = streak reset. User has to Ctrl+C a cascading suite = streak reset. Bandit reports failures without having self-split at the 5-failure threshold = streak reset.

---

## Design Handoff Pending

- Claude Design session produced UI prototypes
- v86 arc = design system implementation
- Awaiting design asset import
- Codebase in clean state: zero console.log, zero hardcoded colors, zero schema drift, 345 passing

---

## Version Convention

**Primary:** QA spine vXX/vXXa/b/c
- vXX = new major arc (new topic/system)
- vXXa/b/c = sub-passes within same arc
- This is the REAL version tracking system

**Secondary:** package.json semver
- patch (0.0.x) = auto-bump every feature pass
- minor (0.x.0) = arc completion milestone
- major (x.0.0) = launch ready

**QA Key:** separate from both — governance only
- Currently: v74b — changes only when new governance contract is formally accepted

Never let spine version fall more than 1 pass behind actual codebase state.

---

## Session Outcome

**Status:** Complete
**Final QA Spine:** v85b
**Final Product Version:** 0.6.0
**Final QA Key:** v74b (active — governance only)
**Clean Streak:** 1 (P1·S1★)
**Level:** 133.0

The codebase is in the best shape it has ever been. No loose ends. Clean foundation ready for design handoff.
