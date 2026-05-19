# gwells C9.0 drift-back test flake under full-suite load

## Symptom

`tests/e2e/gwells-physics.spec.ts — Pass C9.0: Dragging a node
without modifier drifts back toward seed` occasionally fails when
run as part of the full qa:e2e suite. Passes 18/18 reliably when
gwells-physics.spec.ts is run in isolation.

## First observed

2026-05-18 after Chromium reinstall to chromium-1217 (triggered by
the playwright self-heal commit `a992c5d` cleaning the cache for
verification).

Test passed reliably in full-suite runs before that point. The
Chromium reinstall is the only environmental delta we know of, but
it's also possible the test has been marginal all along and just
hadn't tipped over yet.

## Possible causes (untested)

1. **rAF timing assumption.** The test asserts post-drag drift-back
   behavior that depends on the physics engine running for a known
   number of frames between mouseup and assertion. If rAF scheduling
   under heavy worker load fires fewer frames than expected, the
   node hasn't drifted back far enough by the assertion time.

2. **Worker contention with other tests.** Playwright runs the full
   suite with 12 workers. Other tests running concurrently may
   compete for CPU and reduce the gwells worker's rAF throughput.

3. **Chromium version timing.** chromium-1217 may have subtly
   different rAF scheduling or rendering pipeline timing than the
   previous version. Worth checking the version history if the
   issue persists.

## How to reproduce

Sometimes:
npm run qa:e2e

Never (so far):
npm run qa:e2e -- tests/e2e/gwells-physics.spec.ts

## Workaround for now

None applied. The 1 failure was confirmed isolated-flake during
the self-heal merge: full-suite showed 375/5/2, isolated gwells
run showed 18/18.

## Suggested fix path

Either:
- Increase the post-mouseup wait in the C9.0 test (currently
  unknown duration; add tolerance).
- Add an assertion-retry pattern (Playwright's expect.poll)
  instead of a single-shot assertion.
- If reproducible under load, investigate whether the engine's
  rAF tick is being throttled and add a deterministic "advance
  N frames" probe.

Priority: low. Failure is intermittent and the test path is
exercised reliably in isolated runs. Watch list: if this fails
in three or more consecutive full-suite runs, escalate.