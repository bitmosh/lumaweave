# Bandit — v111.4-pull: revert CI E2E wiring, defer to dedicated arc

Five amendments (v111.4, .4a, .4b, .4c, .4d, .4e) failed to land CI E2E green. Diagnosis cycle has hit its budget; per the v111.4e hard stop, we pull and defer.

This commit reverts the CI E2E wiring back to v110-era state (lint-css + typecheck only) and documents the deferral honestly. v111's other deliverables — GVI split, qa.ts helpers, flaker triage — remain banked.

Basis: v111.4e CI failure (4/5 shards hit 20-min job timeout) + Ryan-locked hard-stop decision from v111.4e investigation review.

Generic rules: `~/Projects/CLAUDE.md`; project: `~/Projects/lumaweave/CLAUDE.md`; Discord/gates: `~/Projects/DISCORD_PROTOCOL.md`.

## ⏩ BANDIT PASS PREFACE
0. Discord MCP else HALT. 1. START→#current-task. 2. Work+verify. 3. END→#current-task. 4. MERGE GATE→#approve-this (1506441138612080680). 5. END-OF-RUN REPORT→#changelog w/ SHA. 6. BUMP+PUSH GATE→#approve-this.

No semver bump. ONE commit. After this lands, v111.5 arc-close unblocks immediately.

## What this commit does

1. Reverts `.github/workflows/ci.yml` to v110-era state (lint-css + typecheck only; no e2e job)
2. Reverts `playwright.config.ts` to v111.4-pre state (webServer block back to `npm run dev` only, no `process.env.CI` branching)
3. Adds `docs/known-bugs/ci-e2e-vite-cold-start.md` documenting the investigation, failed attempts, and proposed real-fix path
4. Updates `docs/SHIP_READINESS_ROADMAP.md` §4 (defer list) to add "CI E2E wiring" as an explicit deferred item

## What this commit does NOT do

- Does not modify any test code
- Does not revert v111.1, v111.2, or v111.3 — those wins remain banked
- Does not change `package.json`
- Does not delete the `v111_4e_vite_preview_report.md` investigation report (it stays in `docs/workflows/` as historical record)

---

## Pre-flight (verify, report, STOP if diverges)

1. Confirm current HEAD is `6c24acf` (v111.4e) or later. Read `git log --oneline -10` and quote.

2. Identify the exact commit that introduced the e2e job to `.github/workflows/ci.yml`. Likely `915d6a5` (v111.4). Use `git log --diff-filter=A --follow -- .github/workflows/ci.yml` or `git log -p .github/workflows/ci.yml` to find when the `e2e` job first appeared.

3. Identify what the ci.yml looked like *immediately before* v111.4. Use `git show <commit-before-v111.4>:.github/workflows/ci.yml` to retrieve the v110-era state. Quote it.

4. Identify the exact playwright.config.ts state *before* v111.4e (`6c24acf`). The v111.4e change touched `webServer` — we need to know what it was before. Quote both the pre-v111.4e version (from `git show HEAD~1:playwright.config.ts`) and the current version.

5. Confirm v111.4e's playwright.config.ts change is the ONLY change to that file since v111.0. If earlier amendments (v111.4a/b/c/d) also touched playwright.config.ts, surface that — the revert needs to undo all of them.

6. Confirm `docs/known-bugs/` directory exists. If not, the new file creates it.

7. Read `docs/SHIP_READINESS_ROADMAP.md` §4 (defer list) and quote the section structure so the new entry matches the format.

---

## Files (explicit paths only)

- `.github/workflows/ci.yml` — revert to v110-era state (lint-css + typecheck only)
- `playwright.config.ts` — revert webServer block to pre-v111.4 state (`npm run dev` only, no CI branching)
- `docs/known-bugs/ci-e2e-vite-cold-start.md` — NEW, documenting the investigation and deferral
- `docs/SHIP_READINESS_ROADMAP.md` — §4 amendment

---

## Step 1 — Revert ci.yml

The simplest correct path: use `git show <pre-v111.4-commit>:.github/workflows/ci.yml > .github/workflows/ci.yml` to overwrite the current file with the historical version.

**Verify the retrieved version contains:**
- The `lint-css` job (unchanged)
- The `typecheck` job (unchanged)
- NO `e2e` job

If the historical version has anything unexpected, STOP and report.

## Step 2 — Revert playwright.config.ts

Use `git show <pre-v111.4-commit>:playwright.config.ts > playwright.config.ts` similarly.

**Verify the retrieved version contains:**
- `webServer.command: "npm run dev"` (string, not conditional)
- No `process.env.CI` references
- `env: { PLAYWRIGHT: "true" }` still present (this was correct in the original)

The pre-v111.4 webServer block, per the v111.4e investigation report §1.1, was:

```typescript
webServer: {
  command: "npm run dev",
  url: "http://localhost:1420",
  reuseExistingServer: true,
  timeout: 120_000,
  env: { PLAYWRIGHT: "true" },
},
```

Match this exactly.

## Step 3 — Create docs/known-bugs/ci-e2e-vite-cold-start.md

```markdown
# CI E2E wiring deferred — Vite dev server cold-start is too slow for CI

**Status:** DEFERRED (post-v1.0 — dedicated arc TBD)
**First investigated:** 2026-06-09 in v111 arc
**Last attempted:** v111.4e (commit `6c24acf`) — production-preview switch failed
**Real fix proposal:** in `docs/workflows/v111_4e_vite_preview_report.md`

## Summary

The v111 test-infrastructure arc planned to land CI E2E as a required gate. After five amendment attempts (v111.4, .4a, .4b, .4c, .4d, .4e), CI E2E does not run cleanly in this codebase. The root cause is structural: Vite dev server's per-request transformation cost is ~30-60s in CI per `page.goto`, and the production-preview workaround surfaced additional unknowns at the build-time and per-test layers that exceeded our willingness to keep investigating mid-arc.

## What we tried

| Attempt | Approach | Outcome |
|---|---|---|
| v111.4 (`915d6a5`) | Initial single-runner E2E job, 15-min timeout | Job timeout |
| v111.4a (`4fedf4f`) | Replace deprecated Playwright action | Job timeout |
| v111.4b (`74bf554`) | Increase timeout 15→30 min, 30→60s per-test | Job timeout |
| v111.4c (commit) | 3-shard matrix | Various failures across shards |
| v111.4d (commit) | 5-shard matrix | Shard-imbalance + gwells beforeEach |
| v111.4e (`6c24acf`) | Production-preview via playwright.config.ts webServer | 4/5 shards hit 20-min job timeout |

## What we learned

**Confirmed:**
- Vite dev server is the dominant slowness in CI (terminal Claude's investigation report)
- All dev-mode globals (`__lwSigma`, `__lwStore`, `__lwGraphSummary`) are exposed in production builds via `window.PLAYWRIGHT = true` set unconditionally in `src/main.tsx:17`
- No conditional testid rendering exists in the codebase
- The production-preview approach is *architecturally* correct

**Unresolved:**
- Production build time in CI (likely >90s; bumping `webServer.timeout` above 120s might help)
- Per-test runtime in production-preview mode in CI (still slower than projected)
- Possible WebGL headless issues in CI affecting gwells-physics specs
- Possible chunk-loading edge cases in production builds we haven't characterized

## What works (unchanged by this deferral)

- Local full-suite runs: ~3 min (post-v111.1 GVI split)
- Local CI fast jobs (lint-css + typecheck): runs on every push, green
- Manual pre-ship gate per `SHIP_READINESS_ROADMAP §3 v115`: 3 consecutive full-suite green runs before v1.0 release

## Proposed real-fix path (for a future dedicated arc)

Per the v111.4e investigation report's §6 alternatives and §7.2 unknowns, a dedicated CI-E2E arc should:

1. Measure actual `tsc && vite build` time in a clean CI container (currently unknown)
2. Investigate WebGL headless behavior in CI (gwells-physics is the canary)
3. Consider serving the production build via a simpler static server (`npx serve dist/`) with SPA fallback
4. Evaluate per-test isolation: can the production preview serve be shared across all tests in a shard, with test isolation via Playwright contexts only? (Reduces build-per-shard cost.)
5. Consider whether the full suite needs to run in CI at all, or whether a curated smoke subset is sufficient with the manual pre-ship gate covering completeness

This is not a v111 problem. It's a v112+ problem (or post-v1.0).

## Why we pulled rather than fixed

By the time of v111.4e, the v111 arc had already shipped its real value:
- GVI split: ~8.7 min → 2m 58s for the slow spec (66% reduction)
- qa.ts helpers: contract-registry flake stable
- Flaker triage: color-tab fixed, settings-panel/graph-sources documented, gwells C9.0 documented and deferred

The CI wiring was a *bonus*, not the core deliverable. Continuing to fight it past v111.4e meant spending the v111 close budget on something that wasn't blocking. The manual pre-ship gate covers the verification need for v1.0; CI E2E becomes a quality-of-life addition for a future arc when we can investigate it properly.

## Cross-references

- Investigation: `docs/workflows/v111_4e_vite_preview_report.md`
- The audit projection that started this thread: `docs/workflows/v111_0_test_infrastructure_report.md` §4 (projected 4-7 min CI runtime; reality was 70-100 min single-runner, still timed out at 5-shard matrix)
- Roadmap deferral: `docs/SHIP_READINESS_ROADMAP.md` §4
```

## Step 4 — Update SHIP_READINESS_ROADMAP.md §4

Find the current §4 (deferred items / explicit defer list). Add a new entry under the appropriate sub-section (most likely §4.2 "Platform features deferred" or a new sub-section "CI infrastructure deferred").

Format (mirror the existing entries):

```markdown
- **CI E2E wiring** — deferred to a dedicated post-v1.0 arc. v111 attempted via 6 amendments; Vite dev cold-start in CI is structurally too slow, production-preview switch surfaced additional unknowns. Full investigation in `docs/known-bugs/ci-e2e-vite-cold-start.md`. Local full-suite runs (~3 min) + manual pre-ship gate (per §3 v115) cover the verification need for v1.0. CI E2E becomes a quality-of-life addition, not a ship-readiness blocker.
```

Place it after any existing v111-related deferred items (or create a "CI / infrastructure" sub-section if appropriate).

## Step 5 — Verify

```bash
npm run typecheck
npm run lint:css
# YAML sanity:
# (visual inspection; no test runner change needed since playwright.config.ts is now back to pre-v111.4 state)
```

Both clean. Targeted-test-scope rules apply — no full E2E run needed (we're reverting to a state that's worked).

## Step 6 — Commit

MERGE GATE → commit (explicit paths only):
`chore(v111.4-pull): revert CI E2E wiring, defer to dedicated arc — 6 amendments, structural Vite/CI mismatch`

END-OF-RUN REPORT to #changelog with SHA + bump+push gate.

---

## END-OF-RUN REPORT (required content)

- Pre-flight findings (commits identified, file states quoted, defer-list section located)
- Files modified (4 expected: ci.yml revert, playwright.config.ts revert, new bug doc, ROADMAP §4 amendment)
- typecheck + lint:css confirmation
- Note: v111.5 (arc close) is now unblocked

---

## Hard stops

- **Only the 4 named files are modified.** Don't touch tests, source, package.json, or anything else.
- **Use `git show <commit>:<path>` for the reverts** to retrieve historical states exactly. Don't reconstruct by hand.
- **Don't delete the v111_4e_vite_preview_report.md** — it's historical record and the proposed-fix-path reference for the future arc.
- **Don't squash this with v111.5.** The pull is its own commit with its own narrative; arc close is a separate concern.
- **Don't relitigate.** The decision is locked. Bandit's role here is execution, not "wait, what if we tried..." — that conversation already happened and the answer is "pull."
- No new dependencies. No new Rust. No semver bump.
- Explicit-path git. Discord MCP only.
