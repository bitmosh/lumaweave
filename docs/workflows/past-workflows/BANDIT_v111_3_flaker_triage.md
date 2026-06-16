# Bandit — v111.3: flaker triage (color-tab fix + 3 documentations)

Third pass of the v111 test-infrastructure arc. Triages the remaining 4 flakers from the SHIP_READINESS_ROADMAP §1 list. Mixed pass: one real conversion (color-tab), two inline documentations (settings-panel, graph-sources — both already correct or legitimate), one deferral (gwells — architectural, out of v111 scope).

Basis: `~/Projects/lumaweave/docs/SHIP_READINESS_ROADMAP.md` §3 (v111) + `docs/workflows/v111_0_test_infrastructure_report.md` §1.3 (flaker root-cause analysis) + Ryan-locked decision: contract-registry → color-tab → settings-panel → graph-sources → gwells (defer).

Generic rules: `~/Projects/CLAUDE.md`; project: `~/Projects/lumaweave/CLAUDE.md`; Discord/gates: `~/Projects/DISCORD_PROTOCOL.md`.

## ⏩ BANDIT PASS PREFACE
0. Discord MCP else HALT. 1. START→#current-task. 2. Work+verify. 3. END→#current-task. 4. MERGE GATE→#approve-this (1506441138612080680). 5. END-OF-RUN REPORT→#changelog w/ SHA. 6. BUMP+PUSH GATE→#approve-this.

No semver bump. ONE commit.

## v111 arc context

- v111.1 (`cc42b94`) — GVI split into 3 files; suite from ~8.7 min → 2m 58s
- v111.2 (`fcd79d0`) — qa.ts helpers converted; contract-registry stable
- **v111.3 (THIS PASS)** — flaker triage
- v111.4 — CI E2E wiring (next)
- v111.5 — arc close + semver 0.17.0 → 0.18.0

## Locked decisions (Ryan-confirmed)

| Flaker | Decision | Action |
|---|---|---|
| contract-registry | already resolved in v111.2 cascade | no action |
| color-tab | MEDIUM — convert animation waits | code change |
| settings-panel | LOW — legitimate debounce wait | inline comment |
| graph-sources | LOW — already correct pattern | inline comment |
| gwells C9.0 | HIGH — architectural, out of v111 scope | inline comment + bug doc cross-ref |

Targeted-test-scope + CI fast-jobs only.

---

## Targeted test scope

- `tests/e2e/color-tab-functional.spec.ts` — must pass triple-run after conversion
- `tests/e2e/settings-panel.spec.ts` — must pass (no behavior change; just documentation)
- `tests/e2e/graph-sources.spec.ts` — must pass (no behavior change; just documentation)
- `tests/e2e/gwells-physics.spec.ts` — no run required (deferred); but typecheck must clean

Plus CI fast-jobs always: `npm run typecheck` + `npm run lint:css`.

---

## Pre-flight (verify, report, STOP if diverges)

1. Confirm v111.2 (commit `fcd79d0`) is on HEAD.

2. Confirm `tests/e2e/color-tab-functional.spec.ts` waitForTimeout call sites per audit §1.3:
   - Approximately 5 calls at lines ~47, ~67, ~126, ~151, ~204
   - All ~100ms or less
   - All after color picker interactions (swatches, hex input commits, etc.)
   - Quote each block (5 lines before + 5 lines after each waitForTimeout) so the actual conversion target is visible.

3. Confirm `tests/e2e/settings-panel.spec.ts:147` has the debounce wait per audit:
   ```typescript
   await page.waitForTimeout(300); // let debounce flush
   ```
   Quote the surrounding context.

4. Confirm `tests/e2e/graph-sources.spec.ts:39-46` (or nearby) uses `page.waitForFunction()` correctly per audit §1.3. Quote the block.

5. Confirm `tests/e2e/gwells-physics.spec.ts:303` has the documented C9.0 flake target — `await page.waitForTimeout(3000)` after the drag. Quote the surrounding 10 lines.

6. Confirm `docs/known-bugs/gwells-c9-0-drift-back-flake.md` exists in the repo and is current (last-modified date close to 2026-05-19 per audit).

7. **STOP and report if any of the above structural claims diverges from the audit.** The conversions and documentations depend on exact call-site identification.

---

## Files (explicit paths only)

- `tests/e2e/color-tab-functional.spec.ts` — convert 5 waitForTimeout calls to web-first assertions
- `tests/e2e/settings-panel.spec.ts` — add inline comment marking the line 147 debounce as audited-and-acceptable
- `tests/e2e/graph-sources.spec.ts` — add inline comment marking the waitForFunction pattern as audited-and-correct
- `tests/e2e/gwells-physics.spec.ts` — add inline comment near C9.0 (line ~303) marking the architectural deferral, cross-referencing the bug doc

Nothing else modified.

---

## Conversion 1 — color-tab animation waits

Five waitForTimeout calls in `color-tab-functional.spec.ts`. Each is an animation/transition wait after a UI interaction. For each:

**The pattern to apply (per Playwright web-first principles):**

```typescript
// BEFORE
await swatchButton.click();
await page.waitForTimeout(100);

// AFTER
await swatchButton.click();
await expect(page.getByTestId("<element-that-transitions>")).toBeVisible({ timeout: 5000 });
// OR (if the transition is "selected state visible"):
await expect(swatchButton).toHaveClass(/selected/, { timeout: 5000 });
// OR (if the end-state is a value change):
await expect(page.getByTestId("hex-input")).toHaveValue(expectedHex, { timeout: 5000 });
```

**Important:** the right replacement depends on what the test is actually trying to verify next. Read the assertion that follows each waitForTimeout in the original code. The assertion tells you what end-state to wait for.

**Pre-flight identifies the actual end-states** per the five call sites. Concrete shape per call:

For each waitForTimeout in color-tab-functional.spec.ts:
- Identify the immediate next assertion
- Determine if that assertion's target is the right end-state
- If yes: replace waitForTimeout + assertion with a single web-first form (the assertion already auto-retries with a default 5s timeout if it's an `expect(...).toBe...` form, so the explicit waitForTimeout becomes redundant)
- If no (the assertion is downstream of a different intermediate state): pick the intermediate state's testid/value and assert on that

**Worked example (hypothetical — verify against actual code):**

Original at line ~47:
```typescript
await swatchButton.click();
await page.waitForTimeout(100);
expect(await hexInput.inputValue()).toBe("#FF0000");
```

Converted:
```typescript
await swatchButton.click();
// Web-first: hex input updates after swatch click; auto-retries until value matches.
await expect(hexInput).toHaveValue("#FF0000", { timeout: 5000 });
```

The `expect(...).toHaveValue` auto-polls until the value matches or the timeout fires. The 100ms wait + manual `inputValue()` becomes a single line that's race-condition-free.

**Apply to all 5 call sites.** Each conversion is small (~3 lines) but each requires reading the surrounding context to pick the right end-state.

### Step 2 — Triple-run stability check on color-tab

After conversion, run color-tab-functional.spec.ts 3 times in succession:

```bash
npx playwright test tests/e2e/color-tab-functional.spec.ts --reporter=line  # Run 1
npx playwright test tests/e2e/color-tab-functional.spec.ts --reporter=line  # Run 2
npx playwright test tests/e2e/color-tab-functional.spec.ts --reporter=line  # Run 3
```

All 3 must pass without flakes. Report pass/fail per run.

If any of the 3 fails: STOP. The conversion picked the wrong end-state for at least one call site; investigate.

---

## Documentation 2 — settings-panel debounce comment

In `tests/e2e/settings-panel.spec.ts` near line 147:

```typescript
// BEFORE
await page.waitForTimeout(300); // let debounce flush

// AFTER
// Audited 2026-06-09 (v111.3): legitimate debounce simulation per Playwright best practice
// (waiting for a debounced store update to complete, no observable DOM end-state to assert on).
// DO NOT convert to web-first assertion — debounce timing is the test's actual subject.
await page.waitForTimeout(300); // let debounce flush
```

The existing inline comment ("let debounce flush") stays; the audit-confirmation comment is added above it. Future audits see the marker and skip re-flagging this.

---

## Documentation 3 — graph-sources correct-pattern comment

In `tests/e2e/graph-sources.spec.ts` near the `waitForFunction` block (line ~39-46 per audit):

```typescript
// BEFORE
await page.waitForFunction(
  (before) => {
    const token = (window as any).__lwStore?.getState().settings.sources.refreshToken ?? 0;
    return token > before;
  },
  tokenBefore,
  { timeout: 5000 },
);

// AFTER
// Audited 2026-06-09 (v111.3): correct web-first pattern (polling for store state change).
// This was previously listed as a flaker but the implementation is sound.
await page.waitForFunction(
  (before) => {
    const token = (window as any).__lwStore?.getState().settings.sources.refreshToken ?? 0;
    return token > before;
  },
  tokenBefore,
  { timeout: 5000 },
);
```

---

## Documentation 4 — gwells C9.0 architectural deferral

In `tests/e2e/gwells-physics.spec.ts` near line ~303 (the C9.0 drift-back test):

```typescript
// BEFORE (the test setup, with the 3000ms wait)
test("Pass C9.0: Dragging a node without modifier drifts back toward seed", async ({ page }) => {
  // ... drag setup ...
  await page.waitForTimeout(3000);
  // ... assertion ...
});

// AFTER (with the deferral comment added)
// FLAKY: Architectural issue under full-suite worker contention.
// See docs/known-bugs/gwells-c9-0-drift-back-flake.md for investigation history.
// Tolerance-widening tested 2026-05-19 — root cause is rAF/worker contention, not timing.
// Deferred from v111 (test infrastructure arc) per audit §1.3.
// Real fix requires gwells engine instrumentation under load — out of v1.0 scope.
test("Pass C9.0: Dragging a node without modifier drifts back toward seed", async ({ page }) => {
  // ... drag setup ...
  await page.waitForTimeout(3000);
  // ... assertion ...
});
```

The test stays as-is (we're not skipping it — it passes in isolation). The comment surfaces the known issue for any future Claude or developer reading the spec.

---

## Implementation procedure

### Step 1 — Pre-flight reads
Per the pre-flight section above. Confirm all 4 structural claims before modifying anything.

### Step 2 — Apply color-tab conversions
Per Conversion 1. Read each of the 5 call sites, pick the right end-state per the test's actual goal, apply web-first assertion. Five small changes.

### Step 3 — Apply settings-panel comment
Per Documentation 2. Add the audit-marker comment above the existing `// let debounce flush` line.

### Step 4 — Apply graph-sources comment
Per Documentation 3. Add the audit-marker comment above the `waitForFunction` block.

### Step 5 — Apply gwells C9.0 comment
Per Documentation 4. Add the architectural-deferral comment block above the test definition. Do NOT skip the test or modify its assertions.

### Step 6 — Verify color-tab triple-run
Per Conversion 1, Step 2. Three consecutive passes required.

### Step 7 — Verify other affected specs

```bash
npm run typecheck
npm run lint:css
npx playwright test tests/e2e/settings-panel.spec.ts --reporter=line
npx playwright test tests/e2e/graph-sources.spec.ts --reporter=line
```

All must pass. (gwells-physics.spec.ts is NOT re-run; the C9.0 flake is known and accepted as deferred.)

---

## Commit

MERGE GATE → commit (explicit paths only — the 4 spec files):
`refactor(v111.3): flaker triage — color-tab to web-first, document settings-panel/graph-sources/gwells C9.0`

END-OF-RUN REPORT to #changelog with SHA + bump+push gate.

---

## END-OF-RUN REPORT (required content)

- Pre-flight findings (all 4 structural claims confirmed or amended)
- color-tab conversion summary (5 call sites, before/after per call)
- **Triple-run stability result for color-tab** — 3 consecutive runs
- settings-panel comment confirmed in place
- graph-sources comment confirmed in place
- gwells C9.0 comment confirmed in place + cross-reference to bug doc
- typecheck + lint:css confirmation
- Any waitForTimeout calls in the 4 spec files that were NOT addressed (and why — e.g., legitimate use-cases not flagged in the audit)

---

## Hard stops

- **No test logic changes outside the 5 color-tab conversions.** The other 3 spec files get inline comments only, no behavior changes.
- **No skip/fixme additions.** gwells C9.0 stays as a live test even though it's a known flake — the comment surfaces the issue, doesn't hide it.
- **Triple-run stability check on color-tab is non-negotiable.** Single-run pass is insufficient because the audit's claim is "fix the flake."
- **Don't run the full suite or even gwells-physics.spec.ts.** The C9.0 flake is documented as architectural; running it might fail (it does ~1/18 times) and create noise in the verification.
- **Don't try to fix gwells C9.0 in this commit.** It's deferred for a reason; the audit explicitly says "real fix requires engine instrumentation — out of v1.0 scope."
- **The color-tab conversions must each pick the *right* end-state for the test's actual goal.** Wrong end-state creates a new false-pass (test waits for the wrong thing, never sees it, times out — or sees it too early, passes before the real state is ready).
- If color-tab waitForTimeout calls are at different line numbers than the audit indicated, that's fine — find them by grep, convert each.
- No new dependencies. No new Rust. No semver bump. No NOW.md / ROADMAP edits this commit.
- Explicit-path git. Discord MCP only.
- Targeted-test-scope only.
