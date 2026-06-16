# Bandit — v111.5: v111 arc close

Final pass of the v111 test-infrastructure arc. Semver bump (0.17.0 → 0.18.0), NOW.md reconcile, SHIP_READINESS_ROADMAP §3 v111 entry marked LANDED with all 5 commit SHAs, KNOWN_SHARP_EDGES updated with v111-surfaced learnings.

**Prerequisite: confirm v111.4 (`915d6a5`) CI run is GREEN before starting.** If CI failed on the post-merge run, v111.5 is blocked — amend v111.4 first.

Basis: `~/Projects/lumaweave/docs/SHIP_READINESS_ROADMAP.md` §6 (living-document conventions) + the established v109.5.1 / v110.3 arc-close pattern.

Generic rules: `~/Projects/CLAUDE.md`; project: `~/Projects/lumaweave/CLAUDE.md`; Discord/gates: `~/Projects/DISCORD_PROTOCOL.md`.

## ⏩ BANDIT PASS PREFACE
0. Discord MCP else HALT. 1. START→#current-task. 2. Work+verify. 3. END→#current-task. 4. MERGE GATE→#approve-this (1506441138612080680). 5. END-OF-RUN REPORT→#changelog w/ SHA. 6. BUMP+PUSH GATE→#approve-this.

**v111.5 IS the semver-bump commit.** 0.17.0 → 0.18.0.

## v111 arc context

- v111.0 (no commit) — investigation brief; report at `docs/workflows/v111_0_test_infrastructure_report.md`
- v111.1 (`cc42b94`) — GVI split into 3 files; suite ~8.7 min → 2m 58s (66% reduction)
- v111.2 (`fcd79d0`) — qa.ts helpers converted to web-first; contract-registry stable
- v111.3 (`68e543c`) — color-tab converted; 3 documented; gwells C9.0 deferred
- v111.4 (`915d6a5`) — CI E2E wired in as required job after lint+typecheck
- **v111.5 (THIS PASS)** — arc close

## Targeted test scope

Docs only; no code changes. Sanity:
```bash
npm run typecheck
npm run lint:css
```
Both clean (no code touched, so trivially expected to pass).

No E2E re-run needed.

---

## Pre-flight (verify, report, STOP if diverges)

1. **CONFIRM v111.4 CI IS GREEN.** Check the GitHub Actions tab for commit `915d6a5`. The new `e2e` job must show success. If it failed, STOP and report — v111.5 cannot proceed until v111.4 is amended.

2. Confirm v111.4 (`915d6a5`) is on HEAD.

3. Read `package.json` version — should be `0.17.0`. Bump target: `0.18.0`.

4. Read `src-tauri/Cargo.toml` version field — should also be `0.17.0` if it tracks main semver (per v110.3 + v109.5.1 pattern). Bump in lockstep.

5. Read `docs/LUMAWEAVE_NOW.md` header — should currently say:
   - `Production version: 0.17.0`
   - `Internal arc: v111 (test infrastructure)` or similar wording
   - `Last closed: v110 (real-source bugs + identity + ErrorBoundary)`

6. Read `docs/SHIP_READINESS_ROADMAP.md` §3 v111 entry — confirm it's currently formatted as the "in-progress" arc with sub-passes listed but no LANDED annotation.

7. Read `docs/KNOWN_SHARP_EDGES.md` end-to-end — identify whether the following v111 learnings have entries:
   - The graph-visual-inventory split pattern (file-level parallelism vs `test.describe.parallel()`)
   - The qa.ts helper conversion pattern (waitForTimeout Band-Aid → web-first assertion)
   - The gwells C9.0 architectural deferral documentation pattern (descriptive comment + bug doc cross-ref vs skip/fixme)
   - Multi-test triple-run stability check as conversion verification

   If any aren't logged, this commit adds them per Step 4.

---

## Files (explicit paths only)

- `package.json` — version `0.17.0` → `0.18.0`
- `src-tauri/Cargo.toml` — version `0.17.0` → `0.18.0` (if tracking main semver)
- `docs/LUMAWEAVE_NOW.md` — header bump, v111 → closed, v112 → next
- `docs/SHIP_READINESS_ROADMAP.md` — v111 entry gets **LANDED:** annotation with all 5 commit SHAs + measured outcomes
- `docs/KNOWN_SHARP_EDGES.md` — append v111-surfaced learnings

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

Move v111 to closed-arc section with 5-commit table:

| Sub-pass | Commit | Work |
|---|---|---|
| v111.0 | (no commit) | Investigation brief |
| v111.1 | `cc42b94` | GVI split into 3 files (Core / Probes / Theme) |
| v111.2 | `fcd79d0` | qa.ts helpers to web-first (openAdvisoryTab + expandSection) |
| v111.3 | `68e543c` | color-tab conversion + settings-panel/graph-sources documented + gwells C9.0 deferred |
| v111.4 | `915d6a5` | CI E2E wiring (required, after lint+typecheck) |
| v111.5 | this SHA | Arc close — semver 0.17.0 → 0.18.0 + docs reconcile |

v111 architectural notes:
- E2E suite reduced from ~8.7 min to ~2m 58s for the GVI portion (66% reduction); full suite under 5 min
- File-level parallelism via Playwright workers; no fixture pooling needed (split was sufficient)
- qa.ts helpers now use `expect(...).toBeVisible({ timeout })` and `toHaveAttribute(name, value, { timeout })` patterns; legacy waitForTimeout Band-Aids eliminated
- color-tab animation waits converted to web-first assertions on the actual end-state DOM mutations
- settings-panel debounce wait and graph-sources waitForFunction documented in-code as audited-acceptable (won't be re-flagged in future audits)
- gwells C9.0 documented as architectural-deferral with cross-ref to `docs/known-bugs/gwells-c9-0-drift-back-flake.md`; out of v1.0 scope
- CI now runs E2E as a required job gated on lint-css + typecheck passing first; microsoft/playwright-github-action@v1 caches browser binaries
- The targeted-test-scope convention is now formally complemented by CI's full-suite gate — local commits use targeted scope; CI catches regressions across the whole suite

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
- v111.3 `68e543c` — flaker triage (color-tab fix + 3 documented + gwells deferred)
- v111.4 `915d6a5` — CI E2E wiring (required, gated on lint+typecheck)
- v111.5 `(this SHA)` — arc close, semver 0.17.0 → 0.18.0

**Outcomes:**
- GVI portion: ~8.7 min → 2m 58s (66% reduction)
- contract-registry flake resolved via cascade fix in v111.2
- color-tab animation waits eliminated
- gwells C9.0 deferred as architectural (engine instrumentation needed, out of v1.0 scope)
- E2E now required in CI

**Deviations from planned sub-pass structure:** None significant. Pass shape held at 5 commits as planned.

**Audit projection vs reality:** projected 4-7 min post-v111; actual <5 min after v111.1 alone. Subsequent passes were correctness-focused, not runtime-focused. Sub-5-min stretch goal locked.
```

Mark v112 as `[NEXT]` (or whatever marker the doc uses for the active-next arc).

---

## Step 4 — KNOWN_SHARP_EDGES additions

Per pre-flight identification, append entries for any unlogged v111 lessons. Likely additions:

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

**Symptom:** A known-flaky test fails ~1/18 runs but passes in isolation. Root cause is architectural (worker contention, engine throttling, race between subsystems) and a real fix is out of arc scope.

**Anti-pattern:** Skip the test with `.skip()` or `.fixme()`. Skipping hides the failure mode; future Claudes or contributors don't see the issue surfaced anywhere they're looking.

**Anti-pattern:** Widening the tolerance (extending timeouts). If the root cause isn't timing variance, tolerance-widening fails to fix the issue and creates a slower test for no gain.

**Correct pattern:** Add a descriptive comment block above the test that names the symptom, the investigation history, the architectural root cause, and a cross-reference to a `docs/known-bugs/` entry. The test continues to run, the flake is honestly visible, and the deferral is auditable.

```typescript
// FLAKY: Architectural issue under full-suite worker contention.
// See docs/known-bugs/gwells-c9-0-drift-back-flake.md for investigation history.
// Tolerance-widening tested 2026-05-19 — root cause is rAF/worker contention, not timing.
// Deferred from v111 (test infrastructure arc).
// Real fix requires engine instrumentation under load — out of v1.0 scope.
test("Pass C9.0: Dragging a node without modifier drifts back toward seed", ...);
```

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
- v111's LANDED annotation is complete with all 5 SHAs
- Header version is `0.18.0` throughout

---

## Commit

MERGE GATE → commit (explicit paths only):
`chore(v111.5): v111 arc close — semver 0.17.0→0.18.0, NOW.md + ROADMAP reconcile, KNOWN_SHARP_EDGES`

END-OF-RUN REPORT to #changelog with SHA + bump+push gate.

---

## END-OF-RUN REPORT (required content)

- Pre-flight findings (CI green confirmation, current versions, current doc states)
- Files modified (5 expected)
- Confirmation that v111 LANDED annotation is in place in ROADMAP
- Confirmation that v112 is marked [NEXT] in both NOW.md and ROADMAP
- KNOWN_SHARP_EDGES entries added (4 expected; flag any that were already logged)
- typecheck + lint:css confirmation
- **v111 arc summary:** 5 commits across the arc, suite runtime reduction percentage, flakers triaged outcome, CI now running E2E

---

## Hard stops

- **CI green on v111.4 is non-negotiable as a prerequisite.** If `915d6a5`'s CI run is red, STOP and report — v111.5 doesn't ship until CI is honest.
- **No code changes.** Only the 5 doc/config files modified. No source edits.
- **Preserve every previously-logged deferred item** in NOW.md and KNOWN_SHARP_EDGES. Don't lose any entries when editing.
- **The SHIP_READINESS_ROADMAP v111 LANDED annotation must include all 5 SHAs.** Anything missing means the audit trail is incomplete.
- **Semver bump is 0.17.0 → 0.18.0.** Don't skip a number; don't bump major; don't bump patch.
- No new dependencies. No new Rust. Explicit-path git. Discord MCP only.
- Targeted-test-scope only (typecheck + lint:css).
