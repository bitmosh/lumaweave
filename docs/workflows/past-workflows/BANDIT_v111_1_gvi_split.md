# Bandit — v111.1: split graph-visual-inventory.spec.ts into 3 files

First implementation pass of the v111 test-infrastructure arc. Splits the 233-test, 2021-line `graph-visual-inventory.spec.ts` into 3 feature-area files for Playwright worker parallelism. Pure refactor — no test logic changes, no new assertions, no helper modifications.

Basis: `~/Projects/lumaweave/docs/SHIP_READINESS_ROADMAP.md` §3 (v111) + `docs/workflows/v111_0_test_infrastructure_report.md` §3 (split strategy) + Ryan-locked decisions on §7.

Generic rules: `~/Projects/CLAUDE.md`; project: `~/Projects/lumaweave/CLAUDE.md`; Discord/gates: `~/Projects/DISCORD_PROTOCOL.md`.

## ⏩ BANDIT PASS PREFACE
0. Discord MCP else HALT. 1. START→#current-task. 2. Work+verify. 3. END→#current-task. 4. MERGE GATE→#approve-this (1506441138612080680). 5. END-OF-RUN REPORT→#changelog w/ SHA. 6. BUMP+PUSH GATE→#approve-this.

No semver bump (v111 arc closes at v111.5).

## Locked decisions (Ryan-confirmed)

| # | Locked |
|---|---|
| 1 | Split granularity: **3 files** (Core / Probes / Theme+Motion) |
| 8 | Pass shape: **5 commits** for v111 (no compression — clean revert boundaries) |

This commit handles split only. Helpers (v111.2), flakers (v111.3), CI wiring (v111.4), arc close (v111.5) are separate.

## Targeted test scope

The split's success criterion IS the test:
- All 233 tests still pass (no tests dropped, no tests broken by file boundaries)
- Test names remain stable (describe-block hierarchy preserved)
- The three new files run successfully under Playwright's worker pool

**Verification commands per spec file:**
```bash
npx playwright test tests/e2e/graph-visual-inventory-core.spec.ts --reporter=line
npx playwright test tests/e2e/graph-visual-inventory-probes.spec.ts --reporter=line
npx playwright test tests/e2e/graph-visual-inventory-theme.spec.ts --reporter=line
```

Plus CI fast-jobs always: `npm run typecheck` + `npm run lint:css`.

**Runtime measurement is part of verification.** Before the split, the original spec was ~8.7 min. After split, measure wall-clock time for all three new files run together (Playwright's parallel worker pool). Report the new total in the end-of-run.

---

## Pre-flight (verify, report, STOP if diverges)

1. Confirm v110.3 (commit `f1d1d97`, semver 0.17.0) is on HEAD.

2. Confirm `tests/e2e/graph-visual-inventory.spec.ts` exists and matches the report's structural claims:
   - 2021 lines
   - 233 tests
   - 9 describe blocks
   - Single `test.beforeEach()` at lines 6–9 with `await page.goto("/"); await openGraphVisualInventory(page);`

3. Quote the top-level imports (lines 1–4 expected per the report):
   ```typescript
   import { test, expect } from "@playwright/test";
   import { openGraphVisualInventory, openCommandDeck } from "./helpers/tiles";
   import { openQaPanel } from "./helpers/qa";
   ```
   Note: if `openCommandDeck` or `openQaPanel` aren't actually used by all 233 tests (some imports may be unused after split), only import what each new file needs. Report which imports are needed per new file.

4. Confirm the describe block boundaries from report §1.4:
   - **Block 1: "Graph Visual Inventory" (top-level)** — 22 tests
   - **Block 2: "Graph Runtime Probe (v46)"** — 10 tests
   - **Block 3: "Graph Evidence Detail Mode (v48)"** — 15 tests
   - **Block 4: "Graph Theme Mapping Inventory (v50)"** — 23 tests
     - **Block 4a: "Graph Theme Evidence Wrapper Mode (v52)"** — 16 tests
     - **Block 4b: "Graph Theme Token Value Preview (v54)"** — 11 tests
     - **Block 4c: "Graph Shell Theme Evidence Application (v56)"** — 19 tests
     - **Block 4d: "Graph Theme Application Readiness Diagnostic (v58)"** — 18 tests
   - **Block 5: "Motion Safety Guard Registry (v60)"** — 99 tests
   - Total: 22 + 10 + 15 + 23 + 16 + 11 + 19 + 18 + 99 = **233**

   If any describe block name or test count differs, report the actual values and STOP. The split file allocation depends on these exact counts.

5. Identify the **exact line ranges** of each describe block in the original file. Quote opening and closing braces' line numbers. This is the cut-and-paste boundary for the split.

6. Confirm `playwright.config.ts` settings:
   - Workers count (report says 12)
   - Timeout (report says 30s)
   - Any project-level settings that affect file discovery

7. **STOP and ask if anything diverges from the audit.** The split is mechanical only if the structural assumptions hold; any drift means we need to re-examine before cutting.

---

## Files (explicit paths only)

**Files to CREATE:**
- `tests/e2e/graph-visual-inventory-core.spec.ts`
- `tests/e2e/graph-visual-inventory-probes.spec.ts`
- `tests/e2e/graph-visual-inventory-theme.spec.ts`

**Files to DELETE:**
- `tests/e2e/graph-visual-inventory.spec.ts`

Other files: nothing else touched. No helper changes. No assertion changes. No fixture additions.

---

## File 1 — `graph-visual-inventory-core.spec.ts`

**Contents:** The original file's **top-level "Graph Visual Inventory" describe block** (22 tests).

**Shape:**
```typescript
import { test, expect } from "@playwright/test";
import { openGraphVisualInventory /*, others as needed */ } from "./helpers/tiles";
// Only imports actually used by this file's 22 tests.

test.describe("Graph Visual Inventory", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await openGraphVisualInventory(page);
  });

  // 22 tests from the top-level block — PRESERVED VERBATIM
  // Do NOT include any of the nested describe blocks (those go to other files).
});
```

**Critical:** Test names must stay identical. Playwright reports show full paths like "Graph Visual Inventory › Panel is visible" — those paths must be unchanged after split so CI history and any test references remain stable.

---

## File 2 — `graph-visual-inventory-probes.spec.ts`

**Contents:** "Graph Runtime Probe (v46)" + "Graph Evidence Detail Mode (v48)" describe blocks (10 + 15 = 25 tests).

**Shape:**
```typescript
import { test, expect } from "@playwright/test";
import { openGraphVisualInventory /*, others as needed */ } from "./helpers/tiles";

test.describe("Graph Visual Inventory", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await openGraphVisualInventory(page);
  });

  test.describe("Graph Runtime Probe (v46)", () => {
    // 10 tests — VERBATIM
  });

  test.describe("Graph Evidence Detail Mode (v48)", () => {
    // 15 tests — VERBATIM
  });
});
```

**Note:** The outer `test.describe("Graph Visual Inventory", ...)` wrapper is PRESERVED. This keeps the full test path identical — e.g., "Graph Visual Inventory › Graph Runtime Probe (v46) › <test name>". DO NOT flatten the hierarchy.

---

## File 3 — `graph-visual-inventory-theme.spec.ts`

**Contents:** "Graph Theme Mapping Inventory (v50)" (incl. its 4 nested sub-blocks) + "Motion Safety Guard Registry (v60)" (23 + 16 + 11 + 19 + 18 + 99 = 186 tests).

**Shape:**
```typescript
import { test, expect } from "@playwright/test";
import { openGraphVisualInventory /*, others as needed */ } from "./helpers/tiles";

test.describe("Graph Visual Inventory", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await openGraphVisualInventory(page);
  });

  test.describe("Graph Theme Mapping Inventory (v50)", () => {
    // 23 tests at this level — VERBATIM

    test.describe("Graph Theme Evidence Wrapper Mode (v52)", () => {
      // 16 tests — VERBATIM
    });

    test.describe("Graph Theme Token Value Preview (v54)", () => {
      // 11 tests — VERBATIM
    });

    test.describe("Graph Shell Theme Evidence Application (v56)", () => {
      // 19 tests — VERBATIM
    });

    test.describe("Graph Theme Application Readiness Diagnostic (v58)", () => {
      // 18 tests — VERBATIM
    });
  });

  test.describe("Motion Safety Guard Registry (v60)", () => {
    // 99 tests — VERBATIM
  });
});
```

**Note:** Motion Safety in the original was a SEPARATE top-level describe block (per report §1.4 tree — Block 5 distinct from Block 1). Re-check the original's structure: if "Motion Safety Guard Registry (v60)" is NOT actually nested under "Graph Visual Inventory" in the original, then in this new file, it should also be at the same level — meaning the new file would have TWO top-level describes:

```typescript
test.describe("Graph Visual Inventory", () => {
  // beforeEach + Theme Mapping Inventory subtree
});

test.describe("Motion Safety Guard Registry (v60)", () => {
  // Has its own beforeEach? Or shares with Graph Visual Inventory? Check original.
  // 99 tests
});
```

**Pre-flight should confirm:** does Motion Safety have its own `beforeEach`, or does it share the top-level one (suggesting it's nested under "Graph Visual Inventory")? The audit's tree diagram is ambiguous on this. Quote the actual nesting in pre-flight and preserve it exactly in the new file.

---

## Implementation procedure

### Step 1 — Confirm boundary line numbers (pre-flight extension)

Before any file creation, locate the **exact closing brace line numbers** of each describe block. The split is a clean cut-and-paste at these boundaries. Any drift means risk of:
- Tests landing in the wrong file
- Mismatched braces breaking syntax
- Lost imports

Report the boundaries before writing any new files.

### Step 2 — Create the three new files

For each new file:
1. Write the import block (only imports actually used by tests in that file)
2. Write the top-level `test.describe("Graph Visual Inventory", () => { ... })` wrapper with the shared `beforeEach`
3. Inside: paste the original describe blocks VERBATIM (cut-and-paste exact text from the original file)
4. Verify the braces close correctly

### Step 3 — Delete the original

```bash
git rm tests/e2e/graph-visual-inventory.spec.ts
```

### Step 4 — Verify each new file independently

```bash
npx playwright test tests/e2e/graph-visual-inventory-core.spec.ts --reporter=line
# Expected: 22 tests, all pass

npx playwright test tests/e2e/graph-visual-inventory-probes.spec.ts --reporter=line
# Expected: 25 tests, all pass

npx playwright test tests/e2e/graph-visual-inventory-theme.spec.ts --reporter=line
# Expected: 186 tests, all pass
```

Sum: 22 + 25 + 186 = **233**. If any count differs, a test was lost or duplicated — STOP and report.

### Step 5 — Measure parallel runtime

Run all three together to measure parallelism gain:
```bash
npx playwright test tests/e2e/graph-visual-inventory-core.spec.ts tests/e2e/graph-visual-inventory-probes.spec.ts tests/e2e/graph-visual-inventory-theme.spec.ts --reporter=line
```

Report the wall-clock time. Compare to the ~8.7 min baseline.

**If runtime is the same or worse:** report immediately. Playwright's worker scheduling may not be parallelizing the files; we'll need to investigate before proceeding.

**Expected:** the Theme file (186 tests, ~5 min worth of work) bottlenecks total time; Core + Probes finish much earlier and free workers. Realistic projection per report §4: ~5-6 min for the slowest file, with Core/Probes overlapping in the early portion.

### Step 6 — Confirm CI fast-jobs

```bash
npm run typecheck
npm run lint:css
```

Both should be untouched by this commit (no source code modified), but verify.

---

## Commit

MERGE GATE → commit (explicit paths only):
- ADD: `tests/e2e/graph-visual-inventory-core.spec.ts`
- ADD: `tests/e2e/graph-visual-inventory-probes.spec.ts`
- ADD: `tests/e2e/graph-visual-inventory-theme.spec.ts`
- DELETE: `tests/e2e/graph-visual-inventory.spec.ts`

Commit message: `refactor(v111.1): split graph-visual-inventory.spec.ts into 3 files for parallelism (Core / Probes / Theme)`

END-OF-RUN REPORT to #changelog with SHA + bump+push gate.

---

## END-OF-RUN REPORT (required content)

- File creation confirmations (3 new files, 1 deleted)
- Test count per new file (must sum to 233)
- Pre-flight findings (boundary line numbers, Motion Safety nesting structure)
- Individual file verification results (each new file run separately, pass counts)
- **Parallel-run measurement** — wall-clock time for all three files together, compared to ~8.7 min baseline
- typecheck + lint:css confirmation
- Any divergences from the audit's structural claims

---

## Hard stops

- **No test logic changes.** Tests must be moved VERBATIM. No "while we're here" assertion improvements, no helper extractions, no comment cleanups. Pure cut-and-paste.
- **No helper file changes.** v111.2 touches qa.ts; this commit does not.
- **No imports beyond what each file actually uses.** Don't blindly copy the original's full import block to each new file — only what's used.
- **Test names must remain identical.** Every test's full path (describe hierarchy + test name) must be character-for-character the same as before. Playwright reports, CI history, test IDs all depend on this.
- **If any test count diverges from 233 total, STOP.** This means a test was lost in the cut-and-paste.
- **Preserve the Motion Safety nesting exactly as it was.** Pre-flight confirms whether it's nested under "Graph Visual Inventory" or a separate top-level describe — reproduce exactly.
- No new dependencies. No new Rust. No semver bump. No NOW.md / ROADMAP edits this commit (those land in v111.5).
- Explicit-path git. Discord MCP only.
- Targeted-test-scope + CI fast-jobs only. Do NOT run the full suite as a verification step.
