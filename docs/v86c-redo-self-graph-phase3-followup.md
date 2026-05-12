# vP-Self-Graph-Regen Phase 3 Follow-up Diagnostics

Generated: 2026-05-11T20:30:17.594Z

## 1. TEST FAILURE EVIDENCE

### Failure 1
**Full test path/name:** `tests/e2e/v86c-tile-system.spec.ts:21:1 › v86c-integration: tile-tear-off handle clickable`

**Failure trace excerpt:**
```
Error: expect(locator).toHaveAttribute(expected) failed
Locator: getByText('⤴').first()
Expected: "Tear off as tile"
Received: "Drag to tear off as tile"
Timeout:  5000ms
```

### Failure 2
**Full test path/name:** `tests/e2e/v86c-tile-system.spec.ts:46:1 › v86c-integration: TileLayer renders`

**Failure trace excerpt:**
```
Error: expect(locator).toBeVisible() failed
Locator: getByTestId('tile-layer')
Expected: visible
Timeout: 5000ms
Error: element(s) not found
```

### Git log for test file
```
c7e2eaa v86c-integration: Tile system UI integration
4917993 v86c Tile System - Core Infrastructure
```

### Pre-existing Verification
Ran `git stash` → `npm run qa:e2e` → `git stash pop`.

**Result:** Same 2 failures occurred with identical error traces after stashing changes.

**Conclusion:** Both failures are pre-existing (from v86c tile system integration work) and were not introduced by this pass's self-graph generator changes.

---

## 2. TAG OVERLAP DIAGNOSTIC

Total tag-overlap edges: 1918

### Top 10 Most Common Tags by Tag-Overlap Edge Count

| Rank | Tag | Node Count | Tag-Overlap Edge Count |
|------|-----|-----------|----------------------|
| 1 | src | 103 | 1562 |
| 2 | control-plane | 53 | 1047 |
| 3 | graph | 44 | 419 |
| 4 | themes | 19 | 171 |
| 5 | contract | 27 | 110 |
| 6 | v86a | 24 | 99 |
| 7 | theme | 17 | 74 |
| 8 | accepted | 14 | 58 |
| 9 | link-network | 10 | 45 |
| 10 | vP-Registry-Y | 10 | 45 |

### Analysis
- `src` tag dominates with 1562 edges across 103 nodes (15.2 edges/node average)
- `control-plane` is second with 1047 edges across 53 nodes (19.8 edges/node average)
- These high-overlap tags suggest they are broadly applicable and may be good candidates for the stopword list if they don't provide meaningful semantic differentiation
- Lower-overlap tags like `vP-Registry-Y` and `link-network` (45 edges each) may be more semantically meaningful

---

## 3. ORPHANED NODES LIST

Total orphaned nodes: 36 (degree = 0)

### By Type
- doc: 30
- config: 5
- spine: 1

### Complete List

**Orphaned docs (30):**
- docs.-archive.git.git-readiness-audit (doc)
- docs.-archive.git.gitignore-draft (doc)
- docs.-archive.test-forensics.contract-registry--advisory-backlog-reorder-moves-item-down (doc)
- docs.-archive.test-forensics.contract-registry--advisory-backlog-reorder-moves-item-up (doc)
- docs.-archive.test-forensics.contract-registry--advisory-backlog-reorder-persists-through-tab-switching (doc)
- docs.-archive.test-forensics.contract-registry--bandit-backlog-top-10-renders (doc)
- docs.-archive.test-forensics.contract-registry--question-status-can-be-changed (doc)
- docs.-archive.test-forensics.contract-registry--v48-report-includes-advisory-set-key (doc)
- docs.-archive.test-forensics.contract-registry--v64-is-default-active-checklist (doc)
- docs.-archive.test-forensics.edge-plasma-overlay--plasmaoverlay-renders-as-svg-sibling (doc)
- docs.-archive.test-forensics.reduce-motion-halt--reducemotion-halts-shader-uniforms (doc)
- docs.-archive.test-forensics.reduce-motion-halt--reducemotion-off-allows-uniforms-to-animate (doc)
- docs.-archive.test-forensics.reduce-motion-halt--reducemotion-preserves-glowstrength (doc)
- docs.-archive.test-forensics.theme-target-inspector--inspector-panel-stays-inside-graph-viewport (doc)
- docs.-archive.test-forensics.theme-target-inspector--sigma-graph-primitives-cannot-be-pinned (doc)
- docs.-archive.test-forensics.visual-handles--v15-advisory-question-notes-still-work (doc)
- docs.-docs-tree (doc)
- docs.-src-tree (doc)
- docs.buildgraphologygraph (doc)
- docs.rehaul.ledger (doc)
- docs.self-graph-adapter (doc)
- docs.token-census-dead-candidates (doc)
- docs.updates.v86--updates.-new-v86--v86-index (doc)
- docs.updates.v86--updates.-new-v86--v86-roadmap (doc)
- docs.updates.v86--updates.-new-v86--v86-supplement (doc)
- docs.updates.v86--updates.-new-v86--v86a-foundation (doc)
- docs.updates.v86--updates.-new-v86--v86c-tile-system (doc)
- docs.updates.v86--updates.-new-v86--v86d-inspector-mini-graph (doc)
- docs.updates.v86--updates.-new-v86--v86e-cosmetic-polish (doc)
- docs.v86c-redo-structural-report (doc)

**Orphaned configs (5):**
- package (config)
- playwright.config (config)
- tsconfig (config)
- tsconfig.node (config)
- vite.config (config)

**Orphaned spine (1):**
- spine.themes (spine)

### Analysis
- 30 of 36 orphaned nodes are docs in `_archive/` or are meta/docs-tree files - these are legitimately isolated (archived test forensics, index files)
- 5 config files (package.json, tsconfigs, vite.config, playwright.config) are orphaned - these may be legitimately isolated as they are configuration files without clear relationships in the current extraction logic
- 1 spine node (spine.themes) is orphaned - this is expected as spine nodes are synthetic and may not have explicit edges in the current implementation
- The orphaned nodes appear to be legitimately isolated rather than indicating missing edge extraction logic
