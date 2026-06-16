# Investigation brief — v111.0 test infrastructure

**For:** Terminal Claude · **Output:** one markdown report dropped into PK as `v111_0_test_infrastructure_report.md` · **No code changes, no commits, no installs.**

v111 is the test-infrastructure arc per `~/Projects/lumaweave/docs/SHIP_READINESS_ROADMAP.md` §3. Goal: restore honest CI signal by splitting the slow spec, eliminating timing flakers, and wiring E2E into CI.

Current baseline (per the SHIP_READINESS_ROADMAP §1 audit + v110 commits):
- Full E2E suite: ~9-12 minutes total runtime
- `graph-visual-inventory.spec.ts` alone is ~8.7 min (~119 tests)
- 5 named timing-sensitive flakers: color-tab, contract-registry, graph-sources, gwells-physics, settings-panel
- E2E is NOT in CI (only `typecheck` + `lint:css` per `.github/workflows/ci.yml`)
- Targeted-test-scope convention is load-bearing per commit; full-suite verification effectively impossible

Ryan's tentative starting positions on the §5 ROADMAP questions (pending this audit):
- **Split granularity:** Option 1 — 3 files by feature area (verify against actual structure)
- **CI wiring:** Option 1 — single runner (verify against optimized suite runtime)
- **Runtime target:** under 5 minutes (verify achievable with proposed split + flaker fixes)

Ryan explicitly invites pushback if the audit surfaces a better path on any of these.

**Hard stops:**
- No code changes. No commits. No installs.
- Cite file:line for every claim about current test code.
- For Playwright + GitHub Actions best-practice claims, cite the official docs URL.
- Real measurements, not estimates, where the codebase makes them available (e.g., test counts per file, helper function pattern usage frequencies).

---

## §1 — Current state baseline

### 1.1 Suite composition

Inventory `tests/e2e/`. For each `*.spec.ts` file:
- Test count (count of `test(...)` calls, including `.skip` / `.only` — flag those separately)
- Approximate file size in lines
- Whether it's currently in any per-commit targeted-scope used during v109/v110 commits

Identify:
- Total spec count across all files
- The "slow file" (`graph-visual-inventory.spec.ts`) — exact test count, exact line count, exact runtime if Playwright cache/last-results carry that info
- Specs known to have timing issues (the 5 flakers)
- Specs that have been added since v109.0 (counted across v109.1, v109.2, v109.3, v109.4, v110.2) — these are likely well-structured (followed brief-then-implement); pre-v109 specs may have more debt

### 1.2 Helper inventory

Read `tests/e2e/helpers/` (or wherever shared test helpers live — confirm path in pre-flight).

For each helper file:
- Identify `waitForTimeout()` usages (count + file:line references)
- Identify `setTimeout()` / sleep-style patterns
- Identify `isVisible()` antipatterns (vs. preferred `expect(...).toBeVisible()`)
- Identify any race-prone patterns (clicking immediately after navigation without awaiting load state, asserting on state right after a setter without awaiting reactivity)

The audit's call-out of `tests/e2e/helpers/qa.ts:129` (QA panel timing) — confirm or correct that location. Quote the actual problematic line.

### 1.3 The 5 named flakers

Per the SHIP_READINESS_ROADMAP §1, these 5 spec areas have been timing-sensitive:
- color-tab
- contract-registry
- graph-sources
- gwells-physics
- settings-panel

For each:
- Identify the specific `*.spec.ts` file(s) involved
- Read each and identify the *likely* root cause of timing sensitivity (waitForTimeout chains, race conditions, animation-dependent assertions, fixture setup races, etc.)
- Rate the fix difficulty: LOW (one-pattern conversion), MEDIUM (multiple patterns + verification cycles), HIGH (genuine architectural race that needs design work)
- Note any that are KNOWN deferred from v105 close (the v105 "standing deferred test-hardening" list)

### 1.4 graph-visual-inventory.spec.ts deep dive

The single biggest target. Read the file end-to-end and report:
- Total `test(...)` count
- Are the tests organized via `test.describe(...)` blocks? If so, list the describe block names + test counts per block
- Test categories you can identify by reading (e.g., "node renderer tests", "edge style tests", "label policy", "theme application", etc.) — what natural feature-area boundaries exist?
- Shared setup: is there a `test.beforeAll`/`beforeEach`? If so, is it expensive (boot the app fresh per test) or cheap (run once for all)?
- Inter-test state coupling: do tests depend on each other's side effects, or are they independent?

This grounds the §3 split-strategy recommendation in reality.

---

## §2 — Helper-pattern conversion analysis

Web-first assertions are Playwright's recommended pattern for asynchronous UI state. Instead of:

```typescript
await page.waitForTimeout(500);
const isVisible = await page.locator('...').isVisible();
expect(isVisible).toBe(true);
```

The web-first form:

```typescript
await expect(page.locator('...')).toBeVisible({ timeout: 5000 });
```

The web-first version auto-retries until the condition is met or the timeout fires. No race; no arbitrary delay.

### 2.1 Conversion inventory

For every `waitForTimeout()` found in §1.2:
- What is being waited on? (Read 5 lines before + 5 lines after the call.)
- What's the equivalent web-first assertion?
- Is the conversion trivial (drop-in replacement), moderate (needs to identify the right assertion + verify it captures the same intent), or hard (the timeout is hiding a real race that the assertion would also hit)?

The HARD cases are the most interesting — those are where the test was masking a real bug or relying on animation completion timing that no assertion can replace. Flag each one explicitly.

### 2.2 Acceptable use-cases

Some `waitForTimeout()` calls are legitimate:
- Waiting for an animation to *finish* when the animation has no observable end-state in the DOM
- Debouncing simulation in user-interaction tests (e.g., "type fast, wait for debounce, assert final state")
- Visual regression tests waiting for paint to settle

Note any that should STAY as `waitForTimeout()`. The conversion goal isn't "zero waitForTimeout" — it's "zero waitForTimeout used as a race-condition Band-Aid."

### 2.3 The QA helper

`tests/e2e/helpers/qa.ts:129` (per the audit) — flagged as a specific problem area. Read the helper, identify the pattern, propose a conversion. Is this used by multiple specs? If so, fixing it once might cascade fix several flakers at once.

---

## §3 — Split strategy for graph-visual-inventory.spec.ts

### 3.1 Ryan's tentative position

3 files by feature area. The brief should validate or push back based on §1.4's findings.

### 3.2 The actual question

What's the natural shape of those 119 tests? Answer dictates the right split.

**If `test.describe` blocks already organize the file into 3-5 natural feature areas** — Option 1 (3 files) or Option 2 (5 files) is a clean lift. Each file becomes a former describe block's contents.

**If the tests are flat (no describe organization) or have many tiny describes** — the natural split might be different. Option 3 (`test.describe.parallel()` within the file) might be simpler: less file restructuring, parallelism via Playwright's existing parallel-block primitive.

**If tests share heavy setup** — splitting can multiply the setup cost (each file pays its own setup). Mitigation: `test.beforeAll(...)` at file scope (cheaper than `beforeEach`) plus possible test fixture reuse via Playwright's projects feature. Report whether the setup cost is real or negligible.

### 3.3 Recommended split

Concrete proposal:
- N files (whatever number makes sense, with reasoning)
- For each file: name, what tests it contains, estimated test count, estimated runtime contribution
- Setup strategy: does each file need its own setup, or is there a shared fixture approach?
- Migration plan: which tests move where; whether describe blocks are preserved or flattened

Include any pushback against Ryan's 3-file lean if the audit suggests otherwise.

### 3.4 The "minimal viable split" question

If the slow file's 8.7 minutes is genuinely dominated by ONE expensive setup that runs N times, splitting into N files might not help (each file pays the setup). In that case, the fix might be:
- Consolidate setup
- Use Playwright's `serial` mode with shared context
- Convert the test pattern entirely

Flag if this is the case. The "split the file" approach is the audit's recommendation, but if the file's slowness is actually a structural issue (e.g., 119 separate browser bootstraps), splitting won't fix it.

---

## §4 — Suite runtime target

### 4.1 Ryan's tentative position

Under 5 minutes.

### 4.2 Feasibility check

With the proposed §3 split + §2 helper conversions + §1.3 flaker fixes, is sub-5-min achievable? Estimate:
- Current: ~9-12 min
- After graph-visual-inventory split (parallelism): -X min
- After flaker fixes (removed retry cycles): -Y min
- After helper conversions (no more arbitrary 500ms waits): -Z min
- Projected: ?

Where the projection lands relative to the 5-min target informs whether v111's scope is sufficient or whether more aggressive optimizations would be needed.

### 4.3 Trade-off if 5-min isn't reachable

If the audit projects v111 lands at, say, 6-7 minutes even after all the planned work — does that change anything?
- For Bash tool verification: 7 minutes still exceeds the 10-min cap; 5 doesn't. Practically the difference matters.
- For CI: GitHub Actions has generous time budgets; 7 minutes is fine.
- For dev experience: 7 vs 5 isn't perceptually different at the "wait for it" scale.

Recommend whether to:
- Lock 5 min as a target and add v111.X passes if needed
- Accept "under 7 min" as the realistic target
- Push the target lower (under 3 min) with additional scope (e.g., shared browser context across tests)

### 4.4 The "as fast as practical" alternative

Sometimes a hard target distorts decisions. If the audit suggests "do the obvious wins, measure, declare done" is a healthier framing than "hit 5 min exactly," surface that. Engineering targets that hide trade-offs are worse than honest "do good work" framings.

---

## §5 — CI wiring strategy

### 5.1 Ryan's tentative position

Option 1 — single runner. After the suite is fast enough, run the full E2E suite as a single CI job on `push` and `pull_request`.

### 5.2 Validation

Read the current `.github/workflows/ci.yml`. Confirm shape (2 jobs: `lint-css` + `typecheck`, both ~30-50 seconds).

Adding E2E as a single runner: estimate the additional CI time, the cost (free for public repos / GitHub-billed minutes for private), the complexity.

### 5.3 Push-back option

If sub-5-min holds, single runner is right. If it doesn't, the matrix approach (multiple parallel runners, each running a subset) becomes interesting:
- Matrix complexity: ~10-30 lines of YAML to configure
- Wall-clock gain: roughly (suite-time / N) for N runners
- CI minute cost: roughly (suite-time) — same total, but parallel

Recommend single runner if 5-min holds; matrix only if real wall-clock matters and 5-min is unreachable.

### 5.4 Other CI considerations

While we're touching CI:
- Are there flags worth setting? (`--max-failures=10` so a cascade doesn't run all tests; `--workers=N` for parallel within a runner)
- Should the E2E job be required (blocking merge) or advisory (failing E2E is reported but doesn't block)? For pre-1.0 with active development, "required" gates intentional regressions; "advisory" tolerates known-flaky. The roadmap's principle is honest CI signal, so "required" once flakers are fixed.
- Browser caching: Playwright downloads browsers; CI runs are slow if this happens every time. Use Playwright's official cache action (cite the docs URL).

---

## §6 — Recommended pass shape for v111

Per ROADMAP §3, v111 has 5 sub-passes proposed. Validate or amend.

**Per the brief-then-implement loop:** v111.0 is THIS investigation report. v111.1+ are implementation passes.

Proposed structure (per ROADMAP):
- v111.1 — graph-visual-inventory split
- v111.2 — helper-pattern conversions to web-first assertions
- v111.3 — flaker triage and fixes
- v111.4 — CI E2E wiring
- v111.5 — arc close

**Sequencing question:** which order makes most sense?

- Option A: Split first (v111.1) → biggest single win, immediate measurement. Then helpers (v111.2) → cascade fix for multiple flakers. Then remaining flakers individually (v111.3). Then CI (v111.4). Then close (v111.5).
- Option B: Helpers first → the most foundational. Then flakers (some may resolve via helpers). Then split. Then CI.
- Option C: Flakers first → highest-quality wins. Then helpers. Then split. Then CI.

Recommend.

**Bundling question:** any sub-passes that should combine?
- v111.2 (helpers) + v111.3 (flakers) — if helpers fix most flakers, these are coupled work
- v111.1 (split) is naturally standalone
- v111.4 (CI wiring) is one trivial YAML edit — could fold into v111.5 (arc close)

Recommend final commit count.

**Blast radius:** like v110, v111 may be small enough that 5 sub-passes is over-ceremony. Per ROADMAP §6 (living-document conventions), this kind of compression is fine. Recommend.

---

## §7 — Pre-flight decisions for Ryan

Aggregate every decision the brief surfaces into one checklist. For each: clear question + investigator's recommendation + reasoning in product-language. Expected items:

1. graph-visual-inventory split: N files? Which feature areas?
2. Helper-pattern conversion scope: full sweep / targeted / minimal?
3. Flaker fix priority order: which 5 first, or all together?
4. Suite runtime target: 5 min / 3 min / "as fast as practical"?
5. CI wiring: single runner / matrix / per-area?
6. CI E2E job: required (gate merges) or advisory?
7. Browser caching: Playwright official cache action or skip?
8. v111 sub-pass shape: 5 commits per ROADMAP / compressed to fewer / different sequence?

Each gets investigator's recommendation. Ryan locks decisions; planning Claude scopes implementation from locked ground.

---

## Output format

One markdown file in PK as `v111_0_test_infrastructure_report.md`. Seven sections numbered as above (§1-§7). File:line citations for code; doc-URL citations for Playwright/GitHub Actions best practices. LOW/MED/HIGH ratings where relevant. Tradeoff analysis in product-language. When complete: ping back; planning Claude reads + works through §7 with Ryan; then scopes v111.1+.
