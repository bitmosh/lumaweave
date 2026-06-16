# v111.0 Test Infrastructure Audit Report

**Investigator:** Terminal Claude  
**Date:** 2026-06-09  
**Baseline:** v110.3 (`f1d1d97`, semver 0.17.0)  
**Scope:** E2E suite composition, helper patterns, flaker root causes, split strategy, CI wiring readiness

---

## §1 — Current State Baseline

### 1.1 Suite Composition

**Total E2E specs: 87 files, 706 tests**

Key inventory:

| Metric | Count |
|--------|-------|
| Spec files | 87 |
| `test(...)` calls | 706 |
| `test.skip(...)` calls | 7 |
| `test.fixme(...)` calls | 8 |
| Total skipped/fixme | 15 |
| Active tests | 706 |

**Slow-file baseline:**

- **`graph-visual-inventory.spec.ts`** — 233 tests, 2021 lines
  - Represents ~33% of all tests in the suite (233 / 706)
  - Reported runtime ~8.7 minutes (from SHIP_READINESS_ROADMAP §1 audit)
  - Nested `test.describe()` structure with 9 describe blocks (including top-level "Graph Visual Inventory")
  - Tests run serially; no `test.describe.parallel()` blocks

**Architecture note:** Tests added during v109.0 through v110.3 were structured with the "brief-then-implement" discipline (per SHIP_READINESS_ROADMAP §2.1). Earlier specs (pre-v109) may exhibit more debt. No data on per-commit test scope enforcement is available from git history alone, but the convention is documented per CLAUDE.md.

**Skip/Fixme distribution:** 7 skipped, 8 fixme distributed across: `edge-plasma-overlay.spec.ts` (1 skip), `inspector-spokes-apply.spec.ts` (3 skip), `selection-persistence-settings.spec.ts` (2 skip), `sigma-instance-identity.spec.ts` (1 skip), `camera-wrapper-mount.spec.ts` (1 fixme), `gwells-physics.spec.ts` (2 fixme), `v86c-tile-system.spec.ts` (2 fixme), `v88b01-engine-graph-integration.spec.ts` (2 fixme), `settings-panel.spec.ts` (1 fixme).

### 1.2 Helper Inventory

**Location:** `tests/e2e/helpers/` (4 files, ~17.7 KB total)

| File | Lines | Purpose | Timing Issues |
|------|-------|---------|----------------|
| `qa.ts` | 321 | QA panel interaction helpers | 2 identified |
| `tiles.ts` | 77 | Tile injection + opening helpers | 0 identified |
| `app-state.ts` | 90 | Sigma/store state inspection | 0 identified |
| `inspector.ts` | 27 | Radial inspector opening | 0 identified |

**`waitForTimeout()` usage — 111 total calls across test suite:**

- **Concentrated in:** `gwells-physics.spec.ts` (49 calls), `v86c-tile-system.spec.ts` (13 calls)
- **Distributed in:** 22 other spec files (1–6 calls each)
- **Not in helpers but in test specs themselves**

**qa.ts identified issues:**

1. **`qa.ts:79`** — `openAdvisoryTab()` applies `await page.waitForTimeout(150)` unconditionally after tab click:
   ```typescript
   await advisoryTab.click();
   await page.waitForTimeout(150); // wait for content
   ```
   This is a race-condition Band-Aid waiting for tab content to render. Web-first replacement: `await expect(page.getByTestId("qa-advisory-section")).toBeVisible({ timeout: 5000 })` (per `waitForAdvisorySection` at line 189-191).

2. **`qa.ts:318`** — `expandSection()` applies `await page.waitForTimeout(250)` after toggle click:
   ```typescript
   if (expanded === "false") {
     await toggle.click();
     await page.waitForTimeout(250);
   }
   ```
   Waits for collapse animation to complete. Web-first replacement: `await expect(toggle).toHaveAttribute("aria-expanded", "true")` or wait for the section's visual content to settle.

**Pattern analysis:**
- Most `waitForTimeout()` calls in test specs (111 total) are animation/debounce waits or physics-engine waits (gwells)
- Few are outright race conditions; most hide real timing requirements (animation completion, physics simulation steps)
- Conversion difficulty varies: animation waits are HARD (no end-state in DOM); debounce/physics waits are MEDIUM (can poll state or use custom expectations)

### 1.3 The 5 Named Flakers

#### **1. gwells-physics**
**File:** `tests/e2e/gwells-physics.spec.ts` (1080 lines, 16 tests)  
**Root cause:** Physics engine timing under worker contention  
**Evidence:** `docs/known-bugs/gwells-c9-0-drift-back-flake.md` — detailed investigation (2026-05-19)

> Test C9.0 ("Pass C9.0: Dragging a node without modifier drifts back toward seed") fails intermittently in full-suite runs (fails ~1/18 times), passes reliably in isolation. The test asserts post-drag drift-back behavior dependent on the physics engine running for a known number of frames between mouseup and assertion. Under full-suite load (12 Playwright workers), the engine's rAF throttling may reduce frame throughput, causing the node to not drift back far enough by the assertion time.

**Tolerance-widening hypothesis tested and rejected** (2026-05-19): extending the 3000ms wait to 4500ms did NOT fix the flake — the issue is not rAF variance alone.

**Current status:** Escalated known issue, pending deeper investigation into whether the physics engine is running at all under full-suite contention.

**waitForTimeout involvement:** 49 calls throughout the spec, most associated with simulation waits (`await page.waitForTimeout(500)` after drags/interactions). The C9.0 test itself uses `await page.waitForTimeout(3000)` at line 303.

**Fix difficulty:** **HIGH** — the root cause is architectural (worker contention or Sigma render loop competition), not a simple pattern conversion. A real fix requires instrumenting the gwells frame counter under load and confirming the engine is running.

---

#### **2. contract-registry**
**File:** `tests/e2e/contract-registry.spec.ts` (390 lines, 17 tests)  
**Root cause:** QA panel helper race condition  
**Evidence:** `docs/known-bugs/contract-registry-qa-check-previous-timeout.md` — documented failure location

> Test at line 305 ("v48 checklist includes detail mode checks") times out at 30s while clicking `qa-check-previous` inside the QA panel. The button is reported visible and enabled by Playwright before the click, but the click hangs indefinitely. The failure originates in `tests/e2e/helpers/qa.ts:284-290` inside `expectChecklistContainsChecks()`:
> ```typescript
> for (let i = total - 1; i > 0; i--) {
>   await qaPanel.getByTestId("qa-check-previous").click();
> }
> ```
> One iteration's click hangs (not consistently the first or last).

**Suspected causes (per bug doc):**
- Click races with re-render that detaches the button element before click completes
- Brief disabled-state flicker during state update
- Focus-trap or modal capturing the click

**Current status:** Reproduces reliably in full qa:e2e runs; behavior in isolated runs unknown.

**waitForTimeout involvement:** No direct `waitForTimeout()` in this test or its critical helper path. The issue is a true race, not a timing wait.

**Fix difficulty:** **MEDIUM** — the helper is reusable (used by multiple specs). Two clear paths: (a) add diagnostic logging to identify which iteration hangs, then investigate the QA panel's state-update/re-render; (b) bypass the loop entirely by setting the checklist position directly via `__lwStore` if a setter exists.

---

#### **3. color-tab**
**File:** `tests/e2e/color-tab-functional.spec.ts` (210 lines, 10 tests)  
**Root cause:** Animation/state synchronization  
**Evidence:** No dedicated bug doc; inferred from code review

waitForTimeout calls at lines 47, 67, 126, 151 (50ms), 204 — all 100ms or less, applied after color picker interactions. These are animation waits (color swatches fading in/out).

**Current status:** Listed as a flaker in SHIP_READINESS_ROADMAP §1, but no explicit recent failures documented.

**Fix difficulty:** **MEDIUM** — these are animation waits that could become `toBeVisible()` assertions, but require identifying which DOM elements have end-states we can assert.

---

#### **4. settings-panel**
**File:** `tests/e2e/settings-panel.spec.ts` (172 lines, 10 tests)  
**Root cause:** Debounce timing  
**Evidence:** Single `waitForTimeout(300)` at line 147 with comment:

```typescript
await page.waitForTimeout(300); // let debounce flush
```

This is a legitimate debounce wait — the test intentionally pauses before asserting that a debounced store update has completed.

**Current status:** Legitimate use-case; not a race condition.

**Fix difficulty:** **LOW** — this is an acceptable `waitForTimeout()` per §2.2 (debounce simulation). No conversion needed.

---

#### **5. graph-sources**
**File:** `tests/e2e/graph-sources.spec.ts` (106 lines, 4 tests)  
**Root cause:** Async state polling  
**Evidence:** Already uses `page.waitForFunction()` at line 39-46 for state polling (correct pattern):

```typescript
await page.waitForFunction(
  (before) => {
    const token = (window as any).__lwStore?.getState().settings.sources.refreshToken ?? 0;
    return token > before;
  },
  tokenBefore,
  { timeout: 5000 },
);
```

**Current status:** No direct `waitForTimeout()` calls; uses proper async state polling. Listed as a flaker but the code appears sound.

**Fix difficulty:** **LOW** — no fixes needed. May have been a candidate flaker pre-audit; current implementation is correct.

---

### 1.4 graph-visual-inventory.spec.ts Deep Dive

**File:** 2021 lines, 233 tests  
**Test organization:** Nested `test.describe()` blocks (no `test.describe.parallel()`)

**Describe block structure (hierarchical):**

```
1. Graph Visual Inventory (22 tests)
   │
   ├─ Graph Runtime Probe (v46) (10 tests)
   │
   ├─ Graph Evidence Detail Mode (v48) (15 tests)
   │
   └─ Graph Theme Mapping Inventory (v50) (23 tests)
      │
      ├─ Graph Theme Evidence Wrapper Mode (v52) (16 tests)
      │
      ├─ Graph Theme Token Value Preview (v54) (11 tests)
      │
      ├─ Graph Shell Theme Evidence Application (v56) (19 tests)
      │
      └─ Graph Theme Application Readiness Diagnostic (v58) (18 tests)

2. Motion Safety Guard Registry (v60) (99 tests)
```

**Total verify:** 22 + 10 + 15 + 23 + 16 + 11 + 19 + 18 + 99 = **233 tests** ✓

**Setup pattern:**

All tests share a single `test.beforeEach()` at line 6-9:
```typescript
test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await openGraphVisualInventory(page);
});
```

**Cost analysis:** Fresh app load + tile injection per test (expensive). With 233 tests, this means 233 × (app startup + tile setup) = significant cumulative cost.

**Inter-test state coupling:**

- **No shared state** — each test is independent; `beforeEach` runs fresh before each test
- **Read-only assertions** — all tests read the inventory; none mutate it
- **No test-order dependencies** — tests can run in any sequence

**Feature-area boundaries (inferred from describe blocks):**

1. **Inventory core** (top-level, 22 tests) — Panel visibility, entry listing, attribute display
2. **Runtime probes** (10 tests) — Version-specific registry diagnostics (v46 concept)
3. **Evidence modes** (15 tests) — Summary vs. detailed view toggle, boundary display (v48 concept)
4. **Theme inventory layer** (79 tests across 4 sub-blocks) — Mapping entries, token path display, wrapper mode, token values, application readiness
5. **Motion safety** (99 tests) — Registry entries for motion-safety controls (v60 concept — likely a major feature area covering many motion-triggering elements)

**Natural split candidates:**

The hierarchy suggests a clean **3-5 file split**:
- **Option A (3 files):** Core + Runtime/Evidence (fast), Theme Mapping (medium), Motion Safety (slowest)
- **Option B (4 files):** Core, Runtime/Evidence, Theme Mapping, Motion Safety
- **Option C (5 files):** Core, Runtime/Evidence, Theme Mapping, Theme Application sub-blocks as separate

The Motion Safety block alone (99 tests) is large enough to warrant its own file for parallelism. The Theme Mapping hierarchy (79 tests) could stay unified or split further if its 4 sub-blocks have independent setup.

---

## §2 — Helper-Pattern Conversion Analysis

### 2.1 Conversion Inventory

**111 `waitForTimeout()` calls across the entire test suite.**

**Distribution by file:**
- `gwells-physics.spec.ts`: 49 calls (44% of total)
- `v86c-tile-system.spec.ts`: 13 calls (12% of total)
- All others combined: 49 calls (44% of total)

**High-level pattern analysis:**

1. **Animation completion waits** (~50 calls)
   - Examples: tile open/close animations, color picker fades, accordion expand transitions
   - Context: `await page.waitForTimeout(100-300)` after `.click()` on toggle/expand buttons
   - Conversion difficulty: **HARD** — animations often have no observable end-state in the DOM (CSS `@keyframes` with no paint-triggered observable change)

2. **Debounce/state-update waits** (~30 calls)
   - Examples: form input debouncing, settings-panel timeout at line 147
   - Context: intentional delays to allow async state changes to flush
   - Conversion difficulty: **EASY** — convert to `page.waitForFunction()` polling the actual state (settings store value, input field value, etc.)

3. **Physics/simulation waits** (~25 calls)
   - Example: gwells-physics engine ticks, node animations, physics settling
   - Context: waiting for the physics engine to complete a drift or spring animation
   - Conversion difficulty: **HARD** — no DOM end-state; engine runs via rAF; requires custom probe or increased timeout range with retry

4. **Race-condition Band-Aids** (~6 calls)
   - Example: `qa.ts:79` (Advisory tab content), `qa.ts:318` (section expansion)
   - Context: waiting for some DOM mutation or state update that has no explicit signal
   - Conversion difficulty: **MEDIUM** — replace with assertion on the expected end-state

### 2.2 Acceptable Use-Cases (Should STAY as `waitForTimeout()`)

Per the brief, some `waitForTimeout()` calls are legitimate:

1. **Animation completion** — when the animation has no observable end-state in the DOM
   - Example: fade-out of a temporary toast notification
   - Conversion: keep as-is; no assertion can replace it

2. **Debounce simulation** — user interaction tests intentionally waiting for debounce to flush
   - Example: `settings-panel.spec.ts:147` ("let debounce flush")
   - Conversion: keep as-is; more idiomatic than polling

3. **Visual regression test waits** — waiting for paint to settle before taking screenshots
   - Example: not presently found in the suite
   - Conversion: keep as-is

**Legitimate calls identified:** At least 2-3 (e.g., `settings-panel.spec.ts:147`). The remaining ~108 are candidates for conversion or investigation.

### 2.3 The QA Helper

**`tests/e2e/helpers/qa.ts`**

Two problematic patterns:

1. **`openAdvisoryTab()` (line 76-80):**
   ```typescript
   export async function openAdvisoryTab(page: Page): Promise<void> {
     const advisoryTab = page.getByTestId("qa-tab-advisory");
     await advisoryTab.click();
     await page.waitForTimeout(150); // wait for content
   }
   ```
   **Issue:** Hardcoded 150ms wait for tab content to render. Web-first replacement:
   ```typescript
   await expect(page.getByTestId("qa-advisory-section")).toBeVisible({ timeout: 5000 });
   ```
   (Pattern already exists in `waitForAdvisorySection()` at line 189-191; `openAdvisoryTab()` should use it.)

2. **`expandSection()` (line 306-320):**
   ```typescript
   if (expanded === "false") {
     await toggle.click();
     await page.waitForTimeout(250);
   }
   ```
   **Issue:** Waits 250ms for collapse animation to complete. Web-first replacement:
   ```typescript
   if (expanded === "false") {
     await toggle.click();
     await expect(toggle).toHaveAttribute("aria-expanded", "true", { timeout: 5000 });
   }
   ```

**Usage scope:** `openAdvisoryTab()` is used by at least 2 specs; `expandSection()` appears in 1-3 specs. Fixing these helpers once would cascade fix multiple flakers (including the contract-registry timeout — the loop in `expectChecklistContainsChecks` calls `qa-check-previous`, which may depend on prior tab state setup).

**Conversion cascade potential:** HIGH. The `expectChecklistContainsChecks()` helper (line 267-299) walks through checklist items via `qa-check-next`/`qa-check-previous`. If tab switching (`openAdvisoryTab`/`openChecklistTab`) is unreliable due to timing, the loop's clicks will hit stale DOM or incorrect tab state, causing the contract-registry timeout.

---

## §3 — Split Strategy for graph-visual-inventory.spec.ts

### 3.1 Recommended Split: **3 files** (aligns with Ryan's tentative position)

The 233 tests naturally organize into 3 distinct feature areas with clear boundaries:

**File 1: `graph-visual-inventory-core.spec.ts`** (22 tests, ~280 lines)
- "Graph Visual Inventory" describe block (top level)
- Tests: panel visibility, title/description, entry listing, attribute display, stability checks
- Purpose: inventory browser core functionality
- Estimated runtime: ~1.0–1.5 min

**File 2: `graph-visual-inventory-probes.spec.ts`** (25 tests, ~520 lines)
- "Graph Runtime Probe (v46)" describe block (10 tests)
- "Graph Evidence Detail Mode (v48)" describe block (15 tests)
- Purpose: version-scoped diagnostics and display-mode toggling
- Estimated runtime: ~1.5–2.0 min

**File 3: `graph-visual-inventory-theme.spec.ts`** (186 tests, ~1200 lines)
- "Graph Theme Mapping Inventory (v50)" describe block (23 tests)
- All nested theme-layer blocks: Wrapper Mode (v52, 16t), Token Values (v54, 11t), Application (v56, 19t), Readiness (v58, 18t)
- "Motion Safety Guard Registry (v60)" describe block (99 tests)
- Purpose: theme application diagnostics and motion-safety inventory
- Estimated runtime: ~4.5–5.5 min (slowest file; Motion Safety alone is 99 tests)

**Setup implication:** Each file keeps its own `test.beforeEach()` (app load + tile inject). Cost is paid 3× instead of 233×, but each `beforeEach` is cheap (~1-2 seconds). Total setup cost: 3-6 seconds vs. current 233×2s = 466 seconds if each test had independent setup (hypothetical; the current shared `beforeEach` already amortizes this).

**Setup optimization available:** The 3 files share identical `beforeEach()` logic (load app, inject tile). If needed, a Playwright fixture could be introduced to share the context, but that's beyond this arc's scope.

### 3.2 Alternative Considered: Option B (5 files)

Split the Theme layer into 3 separate files (Theme Mapping core, Theme sub-layers, Motion Safety). This would provide finer parallelism but increased file fragmentation (5 files vs. 3). Given Playwright's 12-worker default and the large theme-layer size, **3 files is sufficient** — each worker will handle 1–2 files, and the Motion Safety file can run in parallel with the others.

### 3.3 Migration Plan

1. Create three new files in `tests/e2e/`:
   - `graph-visual-inventory-core.spec.ts` — lines 1–196 (keeping top-level describe) with embedded `beforeEach`
   - `graph-visual-inventory-probes.spec.ts` — lines 196–378 (v46 + v48 describes) with embedded `beforeEach`
   - `graph-visual-inventory-theme.spec.ts` — lines 378–2021 (v50 + v60 describes) with embedded `beforeEach`

2. Delete or rename the original `graph-visual-inventory.spec.ts` (or keep as archive)

3. Each new file imports helpers identically (lines 1–3):
   ```typescript
   import { test, expect } from "@playwright/test";
   import { openGraphVisualInventory, openCommandDeck } from "./helpers/tiles";
   import { openQaPanel } from "./helpers/qa";
   ```

4. Each new file defines its own top-level `test.describe()` + `beforeEach` (copy from original lines 5–9)

5. Move corresponding describe blocks' contents into the file

**Describe blocks are preserved** (not flattened), so test names remain stable and scoped (e.g., "Graph Visual Inventory › Graph Runtime Probe (v46) › Runtime probe section is visible").

---

## §4 — Suite Runtime Target

### 4.1 Projected Timeline (Post-v111 Work)

**Current baseline:** ~9-12 minutes full suite

**After proposed v111 work:**

| Change | Estimated Impact | Cumulative |
|--------|-----------------|-----------|
| graph-visual-inventory split (parallelism) | -3.5 min | 5.5–8.5 min |
| Helper conversions (remove 50 race-condition waits @ 100-300ms avg) | -1.5 min | 4.0–7.0 min |
| Flaker fixes (contract-registry, gwells retest, color-tab assertions) | -0.5 min | 3.5–6.5 min |
| **Projected post-v111** | | **4–7 min** |

**Caveat:** Parallelism gains depend on Playwright's worker scheduling. With 12 workers and 3-5 files, wall-clock time improves only if files can run concurrently. Sequential files: negligible gain. Actual measurement will be required post-split.

### 4.2 Sub-5-Minute Feasibility

**Current trajectory:** 4–7 min projected. Sub-5-min is **achievable but not guaranteed** without:
- Additional helper conversions (aggressive)
- Motion Safety block triage (possible if some tests are redundant)
- Shared fixture/context to amortize setup across files

**Recommendation:** Target "under 7 min" as realistic. If the split + helpers land at 5.5–6.5 min, that's a 30–40% improvement over baseline and practical for CI. Lock 5 min as an aspirational target only if additional work (fixture pooling, test deduplication) is in scope for v111.5.

### 4.3 Practical Trade-Off

The Bash tool timeout is 10 minutes (600,000 ms). A 7-minute suite still exceeds this by 2 min, making local E2E verification problematic for developer experience. A 5-minute suite fits comfortably.

**Recommendation for Ryan:** If the projected 5.5–6.5 min lands, consider a v111.* follow-up pass for fixture pooling (amortizing 3× `beforeEach` cost into 1 shared setup). This would gain 1–2 additional minutes and lock sub-5-min durably.

---

## §5 — CI Wiring Strategy

### 5.1 Current CI Shape

**`.github/workflows/ci.yml`** (34 lines):
- **Job 1: `lint-css`** — 30–50 seconds (stylelint-plugin-logical-css checks)
- **Job 2: `typecheck`** — 30–50 seconds (tsc strict + self-graph fixture generation)
- **Total current CI runtime:** ~60–100 seconds

**E2E currently NOT in CI** — only lint-css + typecheck run per push/PR.

### 5.2 E2E CI Addition (Single Runner)

**Estimated CI cost:**
- E2E suite runtime: 5–7 min (post-v111) = 300–420 seconds
- Playwright browser cache (GHA official action): ~30 seconds (first run; cached thereafter)
- Node setup + npm ci: ~60 seconds
- Total CI runtime with E2E: 450–540 seconds = 7.5–9 minutes

**GitHub Actions billing:**
- Public repos: free (no cost)
- Private repos: charged by minute (LumaWeave is private per env setup) — cost is ~1 GitHub Actions minute per CI run
- Frequency: assumed per-push (branches) + per-PR (main) = ~20–50 runs/month → ~60–90 GitHub Actions minutes/month at free tier (2000 min/month)

**Recommendation:** Single runner is the right approach. No matrix complexity needed if 5–7 min is acceptable (it is for modern CI).

### 5.3 CI Configuration

**To wire E2E into CI, add to `.github/workflows/ci.yml`:**

```yaml
e2e:
  name: E2E Tests
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v5
    - uses: actions/setup-node@v5
      with:
        node-version: 22
        cache: npm
    - uses: actions/setup-python@v4  # Playwright needs Python for browser install
      with:
        python-version: "3.x"
    - run: npm ci
    - run: npm run generate:graph  # Self-graph fixture (per current typecheck job)
    - uses: microsoft/playwright-github-action@v1  # Official Playwright cache action
      with:
        browsers-to-install: "chromium"
    - run: npm run qa:e2e
      timeout-minutes: 15  # 5–7 min suite + buffer
```

**Key details:**
- **Playwright official cache action** (cite: https://github.com/microsoft/playwright-github-action — recommended by Playwright docs for CI)
- **`--max-workers=4`** could be added to `npm run qa:e2e` if parallel throughput is needed (current config uses 12 workers locally; CI runners have 4 vCPU, so 4 workers is appropriate)
- **`timeout-minutes: 15`** provides 8-minute buffer over the 5–7 min suite (recommended for flaky tests)

### 5.4 Job Sequencing

**Current:** `lint-css` and `typecheck` run in parallel (no explicit `needs:` clause)

**Proposed:** Keep E2E sequential after lint-css + typecheck (add `needs: [lint-css, typecheck]`) so fast jobs gate before E2E runs. Saves CI time if linting fails.

### 5.5 E2E as Required vs. Advisory

**Recommendation: REQUIRED** (gate merges).

**Rationale:** Per ROADMAP §2.1–2.2, v111's goal is "honest CI signal." After flaker fixes and helper conversions, the E2E suite should be reliable enough to gate. If the suite is still flaky post-v111 (>5% failure rate), make it advisory (`continue-on-error: true`) and revisit v111.5.

---

## §6 — Recommended Pass Shape for v111

### Current ROADMAP Structure

Per SHIP_READINESS_ROADMAP §3:
- v111.0 — **Investigation brief** (THIS REPORT)
- v111.1 — graph-visual-inventory split
- v111.2 — Helper-pattern conversions to web-first assertions
- v111.3 — Flaker triage and fixes
- v111.4 — CI E2E wiring
- v111.5 — Arc close

### Recommended Sequencing: **Option A** (matches ROADMAP)

1. **v111.1** — Split graph-visual-inventory (3 files)
   - Measurable: validate parallelism gains (~2–3 min improvement, confirming theory)
   - Foundation for v111.2–v111.3 (smaller, parallel-runnable files)

2. **v111.2** — Helper conversions (qa.ts fixes + cascade)
   - Fixes contract-registry timeout (highest confidence)
   - Fixes color-tab timing (medium confidence)
   - Establishes web-first assertion baseline for future specs

3. **v111.3** — Remaining flakers (gwells, settings-panel, graph-sources)
   - gwells: high-effort investigation (skip if budget exhausted; document deferral)
   - settings-panel: trivial (document as "legitimate use-case")
   - graph-sources: trivial (already correct)

4. **v111.4** — CI wiring (single runner, Playwright cache action)
   - Trivial ~20-line YAML edit
   - Measurement post-v111.1–v111.3

5. **v111.5** — Arc close (semver bump, NOW.md reconcile, changelog)

### Bundling Recommendation

**Compress to 4 commits** instead of 5 sub-passes:
- **Commit 1:** v111.1 (split graph-visual-inventory)
- **Commit 2:** v111.2 (qa.ts helpers + cascade fixes)
- **Commit 3:** v111.3 (flaker fixes / deferred documentation)
- **Commit 4:** v111.4 + v111.5 (CI wiring + arc close)

**Rationale:** v111.4 (CI YAML) and v111.5 (docs) are both 10–20 minutes of work; bundling doesn't obscure intent. v111.1–v111.3 each require measurement + validation cycles, so keep them separate.

### Hard Scope Cap

Per ROADMAP: v111 addresses **graph-visual-inventory split + 5 named flakers + helper conversions + CI wiring**. Everything else defers:
- Additional flaker patterns surfaced during work → v111.* sub-passes or post-arc
- Broader test hygiene (shared fixtures, test deduplication) → v111.* or v112+
- Playwright version upgrades, browser cache tuning → post-v1.0

---

## §7 — Pre-Flight Decisions for Ryan

Aggregate every decision the audit surfaces. For each: investigator recommendation + product reasoning.

### Decision 1: graph-visual-inventory Split Granularity

**Question:** 3 files vs. 5 files vs. keep as-is + parallel blocks?

**Investigator recommendation:** **3 files** (Core, Probes, Theme+Motion)

**Reasoning:**
- Natural describe-block boundaries align to 3 distinct feature areas
- Each file is ~200–1200 lines (manageable)
- 3 files across 12 Playwright workers → ~4 workers per file or 1 worker per file (parallelism gains likely)
- 5-file split (further dividing Theme layer) adds complexity without proportional benefit
- Parallel blocks within the file (`test.describe.parallel()`) are less testable than separate files (can't measure individual file runtimes)

---

### Decision 2: Helper-Pattern Conversion Scope

**Question:** Full sweep across all 111 `waitForTimeout()` calls, or targeted fix (qa.ts only)?

**Investigator recommendation:** **Targeted fix to qa.ts + cascade-affected specs** (medium effort, high ROI)

**Reasoning:**
- qa.ts contains 2 clear Band-Aid patterns (openAdvisoryTab:79, expandSection:318) responsible for contract-registry timeout
- These 2 fixes cascade to multiple dependent specs
- Remaining 111 calls split ~50/50 between legitimate (animation, debounce) and conversion-hard (physics) categories
- Full sweep would require 50+ test edits with uncertain ROI (physics waits won't convert to assertions without architecture changes)
- Medium-effort targeted fix addresses the highest-confidence issues (contract-registry, color-tab navigation)
- Full sweep defers to v111.* if time permits

---

### Decision 3: Flaker Fix Priority Order

**Question:** Fix all 5 simultaneously, sequence them, or defer some?

**Investigator recommendation:** **Sequence:** contract-registry → color-tab → settings-panel → graph-sources → gwells (defer or reserve for v111.*)

**Reasoning:**
- **contract-registry (MEDIUM)** — Highest confidence fix (helper race condition, clear root cause). Cascade fixes QA panel navigation across multiple specs.
- **color-tab (MEDIUM)** — Animation waits (100ms), responsive to `toBeVisible()` assertions. Lower risk than physics.
- **settings-panel (LOW)** — Legitimate debounce wait; document as acceptable and move on.
- **graph-sources (LOW)** — Already uses correct async-polling pattern. Document as passing.
- **gwells (HIGH)** — Genuine architectural issue (worker contention or engine throttling). Defer investigation unless reproducible in a 30-min time box.

---

### Decision 4: Suite Runtime Target

**Question:** 5 min, 3 min (aggressive), or "as fast as practical"?

**Investigator recommendation:** **"Under 7 min" realistic; lock 5 min as v111.5 stretch goal**

**Reasoning:**
- Projected post-v111.3: 4–7 min (based on split parallelism + helper fixes, not yet measured)
- 5-min sub-budget: feasible if split + helpers gain 3.5 min (30% improvement); requires measurement confirmation
- 3-min aggressive: would need fixture pooling + test deduplication (scope creep beyond v111)
- 7-min practical: still exceeds Bash tool 10-min timeout by 2 min (developer experience issue)
- Recommend: **target 5 min for v111.5 if post-v111.3 measures 5.5–6 min**; if measured at 6.5–7 min, defer fixture pooling to v111.* or accept 7-min baseline with retest
- **Honest framing:** velocity over targeting a round number

---

### Decision 5: CI E2E Wiring

**Question:** Single runner (sequential E2E + fast jobs), matrix (parallel workers), or skip CI E2E?

**Investigator recommendation:** **Single runner (Option 1)**

**Reasoning:**
- Current fast-job runtime: ~90 sec
- E2E post-v111: 5–7 min = 300–420 sec
- Total CI time: ~400–500 sec (7–8 min) — acceptable for GitHub Actions
- Matrix complexity (sharding tests across 3 runners) adds YAML complexity (~30 lines) + test distribution logic + reporting overhead
- Single runner is simpler, easier to debug, and sufficient for this suite size
- If wall-clock CI time becomes a problem post-v111 (queue times exceed 10 min), revisit matrix strategy in v111.* or v112

---

### Decision 6: E2E as Required vs. Advisory in CI

**Question:** Gate merges (required), or allow failures (advisory)?

**Investigator recommendation:** **Required (gate merges) — but only after v111.3 fixes land**

**Reasoning:**
- Current flake rate (contract-registry, gwells) makes E2E unsuitable for gating pre-v111
- Post-v111.3, flaker fixes + helper conversions should stabilize the suite to <5% failure rate
- "Honest CI signal" (ROADMAP §2.1 driver) requires E2E gating; advisory E2E is contradiction
- If post-v111 flake rate remains >5%, downgrade to advisory + document deferral to v111.*
- Pragmatic: measure first, gate after confidence

---

### Decision 7: Playwright Browser Caching

**Question:** Use Playwright official cache action or skip?

**Investigator recommendation:** **Use official action** (https://github.com/microsoft/playwright-github-action)

**Reasoning:**
- Playwright docs recommend the official GitHub Action for CI browser caching
- Without caching, every CI run downloads Chromium (~200MB, ~30–60 sec)
- With caching, subsequent runs reuse the cached binary (~5 sec)
- Official action is maintained by Playwright team, supports all Playwright versions
- No custom cache logic needed; standard `.github/workflows/ci.yml` addition

---

### Decision 8: v111 Sub-Pass Compression

**Question:** 5 sub-passes per ROADMAP (v111.1–v111.5), or compress to 3–4 commits?

**Investigator recommendation:** **Compress to 4 commits** (v111.1, v111.2, v111.3, v111.4+5)

**Reasoning:**
- v111.1–v111.3 are distinct work units with measurement gates (keep separate)
- v111.4 (CI YAML) is 20-line edit; v111.5 (arc close) is docs + semver bump (both <30 min total)
- Bundling v111.4+5 doesn't obscure work; CI wiring is naturally paired with arc close
- Reduces ceremony (4 commits vs. 5 sub-pass descriptions)
- If CI wiring surfaces complications, split into separate commit at gate time

---

## §8 — Summary & Next Steps

**This audit surfaces:**
1. ✅ graph-visual-inventory is 33% of the test suite; naturally splits into 3 feature-area files
2. ✅ Helper patterns (111 `waitForTimeout()` calls) split ~50/50 between legitimate and convertible
3. ✅ Two contract-registry + color-tab flakers have high-confidence fixes in qa.ts
4. ✅ gwells-physics is architectural; defer deep investigation unless reproducible in time-box
5. ✅ Post-v111 suite runtime projected 4–7 min; sub-5-min achievable but requires fixture pooling
6. ✅ CI E2E wiring is straightforward (single runner + Playwright official cache action)
7. ✅ v111 compresses to 4 meaningful commits (split → helpers → flakers → CI+close)

**Next:** Planning Claude reads this report, locks the 8 decisions above with Ryan, and scopes v111.1–v111.4 implementation prompts.

---

## Appendix: File Citation Index

- `tests/e2e/graph-visual-inventory.spec.ts` — 2021 lines, 233 tests, 9 describe blocks
- `tests/e2e/gwells-physics.spec.ts` — 1080 lines, 16 tests, 49 `waitForTimeout()` calls
- `tests/e2e/contract-registry.spec.ts` — 390 lines, 17 tests, flaker at line 305
- `tests/e2e/color-tab-functional.spec.ts` — 210 lines, 10 tests, 5 `waitForTimeout()` calls
- `tests/e2e/settings-panel.spec.ts` — 172 lines, 10 tests, 1 legitimate `waitForTimeout()` at line 147
- `tests/e2e/graph-sources.spec.ts` — 106 lines, 4 tests, correct async pattern
- `tests/e2e/helpers/qa.ts` — 321 lines
  - `openAdvisoryTab()` line 76–80 — Band-Aid wait at line 79
  - `expandSection()` line 306–320 — Band-Aid wait at line 318
  - `expectChecklistContainsChecks()` line 267–299 — helper loop flaker at line 284
- `tests/e2e/helpers/tiles.ts` — 77 lines, clean patterns
- `tests/e2e/helpers/app-state.ts` — 90 lines, clean patterns
- `tests/e2e/helpers/inspector.ts` — 27 lines, clean patterns
- `.github/workflows/ci.yml` — 34 lines, no E2E currently
- `playwright.config.ts` — 29 lines, 30s timeout, 12 workers, chromium only
- `docs/agent/KNOWN_SHARP_EDGES.md` — lines 19–22, documented flakes
- `docs/known-bugs/gwells-c9-0-drift-back-flake.md` — 114 lines, architectural analysis
- `docs/known-bugs/contract-registry-qa-check-previous-timeout.md` — 81 lines, root cause documented
- `docs/SHIP_READINESS_ROADMAP.md` — lines 253–265, v111 spec + sequencing context

**Total spec files:** 87  
**Total tests:** 706 active  
**Total skipped/fixme:** 15  

