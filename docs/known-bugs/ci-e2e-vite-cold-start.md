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
| v111.4c (`2a0702c`) | 3-shard matrix | Various failures across shards |
| v111.4d (`a98156b`) | 5-shard matrix | Shard-imbalance + gwells beforeEach |
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
