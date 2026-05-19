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

## Status update [2026-05-19]

Investigation pass at fix/gwells-c9-0-drift-back-flake branch.

Diagnostic findings:
- Isolated run: passed, timing ~3004ms wait, final position x=31290, y=1906
- Full suite run: passed, timing ~3004ms wait, final position x=31640, y=2538

**Unexpected result:** The test did NOT fail in the full suite run during this investigation. The timing is identical (~3004ms) in both runs, but the final positions differ (likely due to different nodes being selected by the probe). Since the test passed in both isolated and full-suite runs, I could not reproduce the failure to identify Pattern A/B/C.

The flake remains intermittent. Possible explanations:
1. The flake is load-dependent and didn't trigger in this particular run
2. Recent commits (v86c meta-test merge) may have affected the timing/worker contention
3. The flake may be more rare than the 3-consecutive-failure watch-list condition suggested

Recommended next steps:
- Continue monitoring for failures in future full-suite runs
- If the watch-list condition is met again, retry this investigation with more iterations
- Consider applying the tolerance-widening fix pre-emptively if the flake continues to appear

## Tolerance widening hypothesis tested and rejected [2026-05-19]

Applied a 4500ms wait extension (50% above the original 3000ms)
based on the rAF-timing-variance hypothesis. Tested in a single
full-suite run; C9.0 still failed.

Conclusion: rAF timing variance is NOT the cause. The drift-back
assertion is failing for some other reason under full-suite
load. Possible causes to investigate next time:

1. Physics engine not running during the wait under worker
   contention (rAF loop fully blocked, not just throttled).
2. Drag handler completing differently under load — drift logic
   may not engage cleanly after drag-released state.
3. Seed position itself drifting during the wait (other physics
   activity moving the target), making "drift toward seed"
   impossible to assert.
4. Sigma render loop competing with the test's wait timing.

Reverted the wait extension. Test is back to 3000ms. The bug
remains an escalated known issue.

A real fix needs a deeper investigation pass focused on what's
actually happening during the wait under full-suite load, not
just "more time." Suggested next attempt: instrument the gwells
engine's frame counter and the dragged node's per-frame
position to confirm whether the engine is running at all
during the failing full-suite wait.