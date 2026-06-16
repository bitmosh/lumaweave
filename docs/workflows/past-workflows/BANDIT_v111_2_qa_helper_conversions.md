# Bandit — v111.2: qa.ts helper-pattern conversions to web-first assertions

Second pass of the v111 test-infrastructure arc. Converts two `waitForTimeout()` race-condition Band-Aids in `tests/e2e/helpers/qa.ts` to web-first assertions. Expected cascade effect: fixes the contract-registry timeout flake.

Basis: `~/Projects/lumaweave/docs/SHIP_READINESS_ROADMAP.md` §3 (v111) + `docs/workflows/v111_0_test_infrastructure_report.md` §2.3 (qa.ts conversion analysis) + Ryan-locked decision: targeted scope only.

Generic rules: `~/Projects/CLAUDE.md`; project: `~/Projects/lumaweave/CLAUDE.md`; Discord/gates: `~/Projects/DISCORD_PROTOCOL.md`.

## ⏩ BANDIT PASS PREFACE
0. Discord MCP else HALT. 1. START→#current-task. 2. Work+verify. 3. END→#current-task. 4. MERGE GATE→#approve-this (1506441138612080680). 5. END-OF-RUN REPORT→#changelog w/ SHA. 6. BUMP+PUSH GATE→#approve-this.

No semver bump. ONE commit.

## Locked decisions (Ryan-confirmed)

| # | Locked |
|---|---|
| 2 | Helper scope: **targeted** (qa.ts only — two functions, two waitForTimeout calls) |
| Style | Web-first assertions per Playwright docs — `expect(...).toBe...({ timeout })`; auto-retrying poll, not arbitrary delay |

Targeted-test-scope + CI fast-jobs only. Full suite not a per-commit gate.

## v111.1 context

v111.1 landed at `cc42b94`. graph-visual-inventory split worked — 233 tests in 2m 58s (down from ~8.7 min). Sub-5-min target already met before this commit; v111.2's value is *correctness* (the contract-registry timeout flake), not runtime.

## Targeted test scope

The qa.ts conversions cascade-affect any spec that uses `openAdvisoryTab()` or `expandSection()`. Per the audit:
- `openAdvisoryTab()` is used in at least 2 specs
- `expandSection()` appears in 1-3 specs
- The contract-registry timeout failure (line 305, `expectChecklistContainsChecks` loop) is the highest-confidence target

**Per-commit verification:**
```bash
npm run typecheck
npm run lint:css
npx playwright test tests/e2e/contract-registry.spec.ts --reporter=line
# plus any other spec that imports from helpers/qa.ts — pre-flight identifies them
```

If the contract-registry test that was timing out now passes consistently across 3 consecutive runs, v111.2 achieved its primary goal.

---

## Pre-flight (verify, report, STOP if diverges)

1. Confirm v111.1 (commit `cc42b94`) is on HEAD.

2. Confirm `tests/e2e/helpers/qa.ts` current state:
   - **Line 76-80** (`openAdvisoryTab`): contains `await advisoryTab.click(); await page.waitForTimeout(150);`
   - **Line 306-320** (`expandSection`): contains `if (expanded === "false") { await toggle.click(); await page.waitForTimeout(250); }`
   - Quote both blocks verbatim — confirm line numbers haven't shifted since the audit.

3. Confirm `waitForAdvisorySection()` exists at lines 189-191 of qa.ts (per audit) and uses the correct web-first pattern. Quote it. This is the canonical pattern; `openAdvisoryTab` should adopt the equivalent.

4. Identify all callers of `openAdvisoryTab()` and `expandSection()` in `tests/e2e/`. Grep for both function names; report files + line counts. This is the cascade surface — specs that might benefit from the fix.

5. Identify the QA panel section testids:
   - What testid does the advisory tab content have? (Pre-flight should grep `qa-advisory` to find the canonical testid.)
   - What testid does `expandSection`'s collapsible content target?
   - Quote the relevant DOM element renders if helpful.

6. Confirm `tests/e2e/contract-registry.spec.ts` line 305 ("v48 checklist includes detail mode checks") — the documented flake target — currently times out (or is documented in `docs/known-bugs/contract-registry-qa-check-previous-timeout.md`).

7. **STOP if any structural claim diverges.** The two function locations and the existing `waitForAdvisorySection()` pattern are load-bearing for the fix.

---

## Files (explicit paths only)

- `tests/e2e/helpers/qa.ts` — TWO function bodies modified (lines ~76-80 and ~306-320)

Nothing else touched. No spec changes. No new helpers. No new dependencies.

---

## Conversion 1 — `openAdvisoryTab()`

**Current shape (line 76-80, per audit):**
```typescript
export async function openAdvisoryTab(page: Page): Promise<void> {
  const advisoryTab = page.getByTestId("qa-tab-advisory");
  await advisoryTab.click();
  await page.waitForTimeout(150); // wait for content
}
```

**Replacement:**
```typescript
export async function openAdvisoryTab(page: Page): Promise<void> {
  const advisoryTab = page.getByTestId("qa-tab-advisory");
  await advisoryTab.click();
  // Web-first: wait for advisory section content to be visible (auto-retries until satisfied or timeout)
  await expect(page.getByTestId("qa-advisory-section")).toBeVisible({ timeout: 5000 });
}
```

**Notes:**
- The `qa-advisory-section` testid is pre-flight verified — if the actual testid differs, use the actual one (the pattern is the same).
- 5000ms timeout is comfortable for content-render waits without being permissive enough to hide a real bug.
- If `expect` isn't already imported in qa.ts, add the import: `import { expect } from "@playwright/test";`. Check current imports first; the file might import `expect` already or not at all (it might be using `Page` only).

---

## Conversion 2 — `expandSection()`

**Current shape (line 306-320, per audit):**
```typescript
export async function expandSection(/* ... */): Promise<void> {
  // ... preceding logic to find toggle ...
  const expanded = await toggle.getAttribute("aria-expanded");
  if (expanded === "false") {
    await toggle.click();
    await page.waitForTimeout(250); // wait for animation
  }
}
```

(Exact preceding context per pre-flight quote.)

**Replacement:**
```typescript
export async function expandSection(/* ... */): Promise<void> {
  // ... preceding logic to find toggle ...
  const expanded = await toggle.getAttribute("aria-expanded");
  if (expanded === "false") {
    await toggle.click();
    // Web-first: wait for the toggle's aria-expanded to flip to "true"
    // (auto-retries until satisfied or timeout)
    await expect(toggle).toHaveAttribute("aria-expanded", "true", { timeout: 5000 });
  }
}
```

**Notes:**
- `toHaveAttribute(name, value, options)` accepts the timeout in the options object.
- If the toggle doesn't reliably set `aria-expanded="true"` after click (some custom toggles might use a different attribute), the pre-flight should surface this. Fall back to asserting visibility of the section's content if the attribute approach is unreliable.

---

## Implementation procedure

### Step 1 — Pre-flight reads
Per the pre-flight section above. Don't modify anything until structural claims are confirmed.

### Step 2 — Update qa.ts imports
If `expect` isn't already imported, add it at the top of the file:
```typescript
import { type Page, expect } from "@playwright/test";
```
(or whatever the current import style is; match it.)

### Step 3 — Apply Conversion 1
Replace lines 76-80 with the web-first pattern. Preserve function signature, JSDoc if any, and surrounding helper structure.

### Step 4 — Apply Conversion 2
Replace lines 306-320 (or wherever `expandSection`'s waitForTimeout sits per pre-flight) with the web-first pattern.

### Step 5 — Verify no other waitForTimeout calls in qa.ts
Grep `qa.ts` after the changes — if any `waitForTimeout` remains, identify it and report. Either:
- It's a legitimate use-case (debounce simulation) — leave it
- It's another Band-Aid not flagged in the audit — flag and decide

### Step 6 — Run targeted tests

```bash
npm run typecheck
npm run lint:css
# Run contract-registry — the highest-confidence target for the cascade fix:
npx playwright test tests/e2e/contract-registry.spec.ts --reporter=line
```

Expected: contract-registry passes. If it doesn't, investigate before committing. The "v48 checklist includes detail mode checks" test at line 305 should now run without timing out.

### Step 7 — Run callers of the changed helpers

Per pre-flight, identify all specs that import `openAdvisoryTab` or `expandSection`. Run each one:
```bash
npx playwright test tests/e2e/<spec-using-openAdvisoryTab>.spec.ts --reporter=line
# Repeat per affected spec
```

All should pass. If any regression appears, STOP — the helper change broke a downstream usage in a way the conversion didn't account for.

### Step 8 — Triple-run the contract-registry test (stability check)

The audit's primary success metric for v111.2 is the contract-registry timeout becoming stable. Run it 3 times in succession:

```bash
npx playwright test tests/e2e/contract-registry.spec.ts --reporter=line  # Run 1
npx playwright test tests/e2e/contract-registry.spec.ts --reporter=line  # Run 2
npx playwright test tests/e2e/contract-registry.spec.ts --reporter=line  # Run 3
```

All 3 must pass without flakes. Report pass/fail per run.

If any of the 3 fails: STOP and report. The fix didn't address the root cause; further investigation needed before committing.

---

## Commit

MERGE GATE → commit (explicit paths only):
`refactor(v111.2): convert qa.ts openAdvisoryTab + expandSection waitForTimeout to web-first assertions`

END-OF-RUN REPORT to #changelog with SHA + bump+push gate.

---

## END-OF-RUN REPORT (required content)

- Pre-flight findings (exact line numbers, current code blocks confirmed)
- The two converted function bodies (before/after diff in the report)
- Targeted spec results (contract-registry primary; other affected specs)
- **Triple-run stability result** for contract-registry — 3 consecutive runs
- typecheck + lint:css confirmation
- Any other `waitForTimeout` in qa.ts surfaced during the work (flag for v111.3 if any)
- Cascade observations: did other previously-flaky behaviors improve unexpectedly?

---

## Hard stops

- **Only `tests/e2e/helpers/qa.ts` is modified.** No spec edits. No other helper edits. No new helpers.
- **No assertion improvements beyond the conversion.** Don't "while we're here" rewrite the surrounding logic.
- **The triple-run stability check is non-negotiable.** Single-run pass isn't enough — the audit's claim is that this fixes a flake, so the verification has to demonstrate stability across runs.
- If `qa-advisory-section` (or whatever the canonical testid is) doesn't exist in the actual DOM, STOP — the conversion needs a different end-state to assert on, and choosing the wrong one creates a new false-pass.
- If `toHaveAttribute("aria-expanded", "true")` doesn't reliably fire on the toggle component, fall back to asserting visibility of the section's content area (whatever its testid is). Don't invent a new attribute or testid.
- No new dependencies. No new Rust. No semver bump. No NOW.md / ROADMAP edits this commit (v111.5 handles arc-close docs).
- Explicit-path git. Discord MCP only.
- Targeted-test-scope only. Do NOT run the full suite.
