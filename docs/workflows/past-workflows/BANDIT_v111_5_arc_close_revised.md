# Bandit — v111.5: v111 arc close (revised post-pull)

Final pass of the v111 test-infrastructure arc. Semver bump (0.17.0 → 0.18.0), NOW.md reconcile, SHIP_READINESS_ROADMAP §3 v111 marked LANDED with all commit SHAs (including the pulled CI work and the pull), KNOWN_SHARP_EDGES updated with v111-surfaced learnings.

**Revised** from the original v111.5 scope to reflect v111.4-pull (`d2d0cce`): CI E2E was attempted across 6 amendments and pulled; ship-realistic version of v111 is split + helpers + flakers, with CI E2E explicitly deferred.

Basis: `~/Projects/lumaweave/docs/SHIP_READINESS_ROADMAP.md` §6 (living-document conventions) + the established v109.5.1 / v110.3 arc-close pattern + v111.4-pull's honest deferral.

Generic rules: `~/Projects/CLAUDE.md`; project: `~/Projects/lumaweave/CLAUDE.md`; Discord/gates: `~/Projects/DISCORD_PROTOCOL.md`.

## ⏩ BANDIT PASS PREFACE
0. Discord MCP else HALT. 1. START→#current-task. 2. Work+verify. 3. END→#current-task. 4. MERGE GATE→#approve-this (1506441138612080680). 5. END-OF-RUN REPORT→#changelog w/ SHA. 6. BUMP+PUSH GATE→#approve-this.

**v111.5 IS the semver-bump commit.** 0.17.0 → 0.18.0.

## v111 arc final shape

- v111.0 (no commit) — investigation brief; report at `docs/workflows/v111_0_test_infrastructure_report.md`
- v111.1 (`cc42b94`) — GVI split into 3 files; suite ~8.7 min → 2m 58s (66% reduction)
- v111.2 (`fcd79d0`) — qa.ts helpers converted to web-first; contract-registry stable
- v111.3 (`68e543c`) — color-tab converted; settings-panel + graph-sources documented; gwells C9.0 deferred
- v111.4 (`915d6a5`) — CI E2E initial wiring attempt
- v111.4a (`4fedf4f`) — Playwright action replacement
- v111.4b (`74bf554`) — timeout increase
- v111.4c — 3-shard matrix
- v111.4d — 5-shard matrix
- v111.4e (`6c24acf`) — production-preview switch (still failed)
- v111.4-pull (`d2d0cce`) — revert CI E2E, defer to dedicated arc
- **v111.5 (THIS PASS)** — arc close

## Targeted test scope

Docs only; no code changes. Sanity:
```bash
npm run typecheck
npm run lint:css
```
Both clean (no code touched). No E2E re-run needed.

---

## Pre-flight (verify, report, STOP if diverges)

1. Confirm v111.4-pull (`d2d0cce`) is on HEAD.

2. Read `package.json` version — should be `0.17.0`. Bump target: `0.18.0`.

3. Read `src-tauri/Cargo.toml` version field — should also be `0.17.0` if it tracks main semver (per v110.3 + v109.5.1 pattern). Bump in lockstep.

4. Read `docs/LUMAWEAVE_NOW.md` header — confirm current state showing v111 as the open arc.

5. Read `docs/SHIP_READINESS_ROADMAP.md` §3 v111 entry — confirm it's currently formatted as the in-progress arc.

6. Confirm `docs/known-bugs/ci-e2e-vite-cold-start.md` exists (created by v111.4-pull) — this will be cross-referenced in NOW.md and the roadmap.

7. Read `docs/KNOWN_SHARP_EDGES.md` end-to-end — identify which of the following v111 learnings already have entries:
   - File-level parallelism beats describe.parallel() for slow spec files
   - waitForTimeout Band-Aid → web-first assertion conversion pattern
   - Architectural-deferral documentation pattern (descriptive comment + bug-doc cross-ref vs skip/fixme)
   - Triple-run stability check as flake-fix verification
   - **NEW from v111.4 saga: audit projections about CI runtime must be measured before being treated as locked planning inputs**
   - **NEW from v111.4-pull: when amendments stop converging, pull and defer is correct engineering discipline**

   If any aren't logged, this commit adds them.

---

## Files (explicit paths only)

- `package.json` — version `0.17.0` → `0.18.0`
- `src-tauri/Cargo.toml` — version `0.17.0` → `0.18.0` (if tracking main semver)
- `docs/LUMAWEAVE_NOW.md` — header bump, v111 → closed, v112 → next
- `docs/SHIP_READINESS_ROADMAP.md` — v111 entry gets **LANDED:** annotation with all commit SHAs + honest deviation notes
- `docs/KNOWN_SHARP_EDGES.md` — append v111-surfaced learnings (six entries expected; flag any already logged)

Nothing else modified.

---

## Step 1 — Semver bump

`package.json`: `"version": "0.17.0"` → `"version": "0.18.0"`.

`src-tauri/Cargo.toml`: if it has a `version` field tracking main semver, bump it the same way.

---

## Step 2 — NOW.md reconcile

Update header:
- `Production version: 0.18.0`
- `Internal arc: v112 (UI completeness + dev-artifact-bleed cleanup — per SHIP_READINESS_ROADMAP §3 v112)`
- `Last closed: v111 (test infrastructure)`

Move v111 to closed-arc section with the full 11-row commit table (6 v111.4 attempts + the pull + the close — be honest about the shape):

| Sub-pass | Commit | Work |
|---|---|---|
| v111.0 | (no commit) | Investigation brief |
| v111.1 | `cc42b94` | GVI split into 3 files (Core / Probes / Theme) |
| v111.2 | `fcd79d0` | qa.ts helpers to web-first (openAdvisoryTab + expandSection) |
| v111.3 | `68e543c` | Flaker triage (color-tab + 3 documented + gwells C9.0 deferred) |
| v111.4 | `915d6a5` | CI E2E initial wiring (timed out) |
| v111.4a | `4fedf4f` | Replaced deprecated Playwright action (timed out) |
| v111.4b | `74bf554` | Timeout increase 15→30 min (timed out) |
| v111.4c | (commit SHA) | 3-shard matrix (timed out) |
| v111.4d | (commit SHA) | 5-shard matrix (4/5 timed out) |
| v111.4e | `6c24acf` | Production-preview switch (4/5 timed out) |
| v111.4-pull | `d2d0cce` | Revert CI E2E, defer to dedicated arc |
| v111.5 | this SHA | Arc close — semver 0.17.0 → 0.18.0 + docs reconcile |

(Bandit fills in v111.4c and v111.4d SHAs from git log.)

v111 architectural notes:
- GVI portion of E2E suite reduced from ~8.7 min to ~2m 58s (66% reduction); full local suite ~3 min after split
- File-level parallelism via Playwright workers; no fixture pooling needed (split was sufficient)
- qa.ts helpers now use `expect(...).toBeVisible({ timeout })` and `toHaveAttribute(name, value, { timeout })` patterns; legacy waitForTimeout Band-Aids eliminated for two high-leverage helpers
- color-tab animation waits converted to web-first assertions on actual end-state DOM mutations
- settings-panel debounce wait and graph-sources waitForFunction documented in-code as audited-acceptable (won't be re-flagged in future audits)
- gwells C9.0 documented as architectural deferral with cross-ref to `docs/known-bugs/gwells-c9-0-drift-back-flake.md`
- **CI E2E wiring DEFERRED**: 6 amendments attempted; Vite dev cold-start in CI is structurally too slow; production-preview switch surfaced additional unknowns. Full investigation in `docs/workflows/v111_4e_vite_preview_report.md`; deferral documented in `docs/known-bugs/ci-e2e-vite-cold-start.md`. Local full-suite runs + manual pre-ship gate (ROADMAP §3 v115) cover the verification need for v1.0. CI stays at v110-era state (lint-css + typecheck only).

Open-arc section: v112 per ROADMAP §3.

Preserve EVERY previously-logged deferred item and standing arc. Don't lose any.

---

## Step 3 — SHIP_READINESS_ROADMAP update

In `docs/SHIP_READINESS_ROADMAP.md`, find the v111 entry in §3. Add the **LANDED:** annotation per §6 living-document conventions.

Format (mirror the v110 LANDED annotation from v110.3's arc close):

```markdown
### v111 — Test Infrastructure

**LANDED:** 2026-06-09

- v111.1 `cc42b94` — graph-visual-inventory split (3 files: Core/Probes/Theme)
- v111.2 `fcd79d0` — qa.ts helper conversions (openAdvisoryTab, expandSection)
- v111.3 `68e543c` — flaker triage (color-tab fix + 3 documented + gwells C9.0 deferred)
- v111.4 + .4a-.4e — CI E2E wiring attempts (6 amendments, none converged)
- v111.4-pull `d2d0cce` — revert CI E2E, defer to dedicated arc
- v111.5 `(this SHA)` — arc close, semver 0.17.0 → 0.18.0

**Outcomes:**
- GVI portion: ~8.7 min → 2m 58s (66% reduction)
- contract-registry flake resolved via cascade fix in v111.2
- color-tab animation waits eliminated
- gwells C9.0 deferred as architectural (engine instrumentation needed, out of v1.0 scope)
- CI E2E DEFERRED to dedicated arc (post-v1.0); v110-era CI state (lint-css + typecheck) retained

**Deviations from planned sub-pass structure:**
- v111.4 split into 6 amendments (audit projection of CI runtime was wrong by ~10x; structural Vite/CI mismatch surfaced only through measurement)
- v111.4 pulled entirely after the prod-preview switch (v111.4e) failed CI with 4/5 shards timing out
- Decision discipline: when amendments stop converging, pull and defer rather than continue past arc-budget

**Audit projection vs reality (the lesson):**
- Audit (`v111_0_test_infrastructure_report.md` §4) projected 4-7 min CI runtime based on GVI split's local measurement
- Reality (single-runner): 70-100 min projected; never measured to completion
- Reality (5-shard matrix with prod-preview): 4/5 shards hit 20-min job timeout
- Root cause: Vite dev cold-start in CI is structurally slow and not addressed by timeout/shard configuration
- Real-fix path documented in `docs/known-bugs/ci-e2e-vite-cold-start.md` for a dedicated future arc
```

Mark v112 as `[NEXT]` (or whatever marker the doc uses for the active-next arc).

In §4 (defer list), verify that the v111.4-pull entry for CI E2E wiring is present (it should be — added by v111.4-pull's commit).

---

## Step 4 — KNOWN_SHARP_EDGES additions

Per pre-flight identification, append entries for unlogged v111 lessons. Six total:

### Lesson 1 — File-level parallelism vs `test.describe.parallel()`

```markdown
### Playwright: file-level parallelism beats describe-block parallelism for slow spec files

**Symptom:** A spec file with hundreds of tests runs serially, dominating full-suite runtime.

**Cause:** Playwright's default worker pool parallelizes across files, not within them. A 200-test file with `test.describe()` blocks (without `.parallel()`) blocks one worker for the full file's duration.

**Anti-pattern:** Adding `test.describe.parallel()` blocks within the file — works, but harder to measure individual block runtimes and harder to migrate later.

**Correct pattern:** Split the file into multiple spec files along natural feature-area boundaries. Playwright's worker pool fans out across the new files automatically; no config changes needed.

**First encountered:** v111.1 (graph-visual-inventory.spec.ts split into 3 files; ~8.7 min → 2m 58s).
```

### Lesson 2 — waitForTimeout Band-Aid → web-first assertion conversion

```markdown
### Playwright: convert waitForTimeout race-condition Band-Aids to web-first assertions

**Symptom:** Tests pass locally but fail intermittently in CI or under worker contention. Arbitrary `await page.waitForTimeout(150)` after a click is the usual code smell.

**Cause:** `waitForTimeout()` is unconditional; the test continues regardless of whether the expected state actually appeared. Under load, the state may take longer than the timeout; the test then asserts on stale DOM.

**Anti-pattern:**
```typescript
await button.click();
await page.waitForTimeout(150);  // hope the panel rendered
expect(await page.getByTestId("panel").isVisible()).toBe(true);
```

**Correct pattern:**
```typescript
await button.click();
await expect(page.getByTestId("panel")).toBeVisible({ timeout: 5000 });
```

The web-first form auto-retries until the condition is met or the timeout fires. Eliminates the race entirely.

**Acceptable waitForTimeout use-cases:**
- Debounce simulation (waiting for a debounced store update with no observable DOM end-state)
- Animation completion when the animation has no observable end-state in the DOM
- Visual regression tests waiting for paint to settle

**First encountered:** v111.2 (qa.ts openAdvisoryTab + expandSection conversions; contract-registry flake resolved as cascade effect).
```

### Lesson 3 — Document architectural-flake-deferrals in-code with bug doc cross-ref

```markdown
### Architectural flakes: document in-code with cross-reference, don't skip

**Symptom:** A known-flaky test fails ~1/N runs but passes in isolation. Root cause is architectural (worker contention, engine throttling, race between subsystems) and a real fix is out of arc scope.

**Anti-pattern:** Skip the test with `.skip()` or `.fixme()`. Skipping hides the failure mode; future Claudes or contributors don't see the issue surfaced anywhere they're looking.

**Anti-pattern:** Widening the tolerance (extending timeouts). If the root cause isn't timing variance, tolerance-widening fails to fix the issue and creates a slower test for no gain.

**Correct pattern:** Add a descriptive comment block above the test that names the symptom, the investigation history, the architectural root cause, and a cross-reference to a `docs/known-bugs/` entry. The test continues to run, the flake is honestly visible, and the deferral is auditable.

**First encountered:** v111.3 (gwells-physics.spec.ts C9.0 documentation).
```

### Lesson 4 — Triple-run stability check for flake-fix verification

```markdown
### Flake-fix verification: triple-run stability is the minimum bar

**Symptom:** A test was failing intermittently. Now it passes once after a fix. Has the fix worked?

**Reasoning:** A single pass after a flake-fix is insufficient evidence — flakes are intermittent by definition. The fix might not address the root cause; the test might have passed by luck on the first run.

**Correct pattern:** Run the affected test 3 times in succession after the fix. All 3 must pass without flakes. Report pass/fail per run.

If any of the 3 fails, the fix didn't address the root cause; investigate further before committing.

**First encountered:** v111.2 (contract-registry triple-run after qa.ts conversion), v111.3 (color-tab triple-run after web-first assertion conversion).
```

### Lesson 5 — Audit projections about CI runtime must be measured, not assumed

```markdown
### Audit projections about CI runtime must be measured before being treated as locked planning inputs

**Symptom:** An investigation report projects a runtime number (e.g., "5-7 min CI") based on local measurement and a CI-overhead factor. Decisions get locked based on that projection. Implementation reveals the projection was wrong by an order of magnitude.

**Cause:** Local-to-CI extrapolation is unreliable when the workload involves cold-start costs (dev server, browser, JIT compilation, dependency installs). The CI environment is structurally different in ways that linear scaling factors don't capture.

**Anti-pattern:** Treating an audit's CI runtime estimate as a fact suitable for locking a config decision (single runner vs matrix, timeout values, etc.).

**Correct pattern:** Mark CI runtime projections as "estimate pending measurement" in investigation reports. Before locking config decisions that depend on those numbers, do at least one full CI run to confirm the number is approximately right.

**First encountered:** v111.4 saga. Audit projected 4-7 min CI runtime for a single runner; reality was 70-100 min and even 5-shard matrix with production preview couldn't fit in a 20-min job timeout.

**Mitigation pattern:** When CI configuration depends on runtime projections, make the first attempt explicitly time-boxed and measure rather than commit. Use `continue-on-error: true` temporarily on the first run to gather data without blocking other work, then lock the config based on real measurements.
```

### Lesson 6 — When amendments stop converging, pull and defer

```markdown
### When amendments stop converging, pull and defer rather than continue

**Symptom:** A sub-pass requires multiple amendments (3+) to fix what each amendment-cycle's diagnosis claimed would be the resolution. The fix-amend cycle is making local sense but not producing convergent results.

**Cause:** The underlying problem is structurally larger than the sub-pass scope assumed. Each amendment addresses the immediate failure boundary; the next failure boundary has different mechanics that the prior fix didn't address.

**Anti-pattern:** Continuing to amend ("just one more fix"). Each amendment makes local sense; collectively they consume more budget than the work's value, and they obscure the structural insight.

**Correct pattern:** When an amendment cycle produces consecutive non-convergent results, stop. Investigate whether the underlying problem deserves its own arc. If yes, pull the current attempt cleanly, document what was learned in `docs/known-bugs/`, and add an explicit defer entry to the roadmap.

**Distinguishing pull-and-defer from giving up:** the explicit reasoning, the documented learnings, and the dedicated future arc path are what separate engineering discipline from incomplete work. A pull-and-defer commit with a structured bug doc is a deliverable; an unfinished attempt is not.

**First encountered:** v111.4 (CI E2E wiring). Six amendments across `.4`, `.4a`, `.4b`, `.4c`, `.4d`, `.4e` failed to converge. Pull-and-defer at `d2d0cce` documented the investigation, banked the wins, deferred the structural problem to a dedicated future arc.
```

Match the existing file's format and section ordering. Don't restructure existing entries.

---

## Verify

```bash
npm run typecheck
npm run lint:css
```
Both clean. No E2E required.

Optional sanity: read the post-edit ROADMAP.md and NOW.md to confirm:
- `[NEXT]` marker is on v112
- v111's LANDED annotation is complete with all relevant SHAs (including the pull)
- Header version is `0.18.0` throughout
- The defer-list entry for CI E2E wiring is preserved from v111.4-pull

---

## Commit

MERGE GATE → commit (explicit paths only):
`chore(v111.5): v111 arc close — semver 0.17.0→0.18.0, NOW.md + ROADMAP reconcile, KNOWN_SHARP_EDGES (6 entries)`

END-OF-RUN REPORT to #changelog with SHA + bump+push gate.

---

## END-OF-RUN REPORT (required content)

- Pre-flight findings (current versions, current doc states, KNOWN_SHARP_EDGES gaps identified)
- Files modified (5 expected)
- Confirmation that v111 LANDED annotation is in place in ROADMAP, including the pull
- Confirmation that v112 is marked [NEXT] in both NOW.md and ROADMAP
- KNOWN_SHARP_EDGES entries added (six expected; flag any that were already logged)
- typecheck + lint:css confirmation
- **v111 arc summary:** sub-passes across the arc, suite runtime reduction percentage, flakers triaged outcome, CI E2E deferral noted honestly

---

## Hard stops

- **No code changes.** Only the 5 doc/config files modified. No source edits.
- **Preserve every previously-logged deferred item** in NOW.md and KNOWN_SHARP_EDGES. Don't lose any entries when editing.
- **Be honest about the v111.4 saga.** The LANDED annotation includes all amendment SHAs and notes that v111.4 was pulled. Don't airbrush the history; the lesson is part of v111's value.
- **The SHIP_READINESS_ROADMAP v111 LANDED annotation must include all amendment SHAs.** Anything missing means the audit trail is incomplete.
- **Semver bump is 0.17.0 → 0.18.0.** Don't skip a number; don't bump major; don't bump patch.
- No new dependencies. No new Rust. Explicit-path git. Discord MCP only.
- Targeted-test-scope only (typecheck + lint:css).
