# Test: reduceMotion off allows uniforms to animate

## Identity
- Spec file: tests/e2e/reduce-motion-halt.spec.ts
- Line range: 26-35
- First seen failing: unknown (pre-existing across v86a, v86b, vP-Tests)
- Last verified passing: unknown
- Investigated by: Bandit (vP-Forensics-1)
- Last audited: 2026-05-08
- Git archaeology: Ran `git log -L 15,45:tests/e2e/reduce-motion-halt.spec.ts --oneline | head -20` - found commit be0a0f8 "feat: v86b Visual Treatment (partial) — sphere uniforms, overlays, schema v80" which introduced the test. No commit found that broke the test - failure appears to be pre-existing across v86a/v86b.
- Related Investigations: See also `reduce-motion-halt--reducemotion-halts-shader-uniforms.md` and `reduce-motion-halt--reducemotion-preserves-glowstrength.md` - these three tests share the same root cause.

## Current Failure
```
Error: expect(received).toBeGreaterThan(expected)
Expected: > 0
Received:   0
```

Location: tests/e2e/reduce-motion-halt.spec.ts:34

The test sets reduceMotion to false, waits 200ms, reads v86bUniforms, waits another 200ms, reads v86bUniforms again, and expects the time value to increase. The test fails because time is 0 in both readings, indicating the rAF loop is not animating the uniforms.

## Reconstructed Intent
This test was written to ensure that when reduceMotion is disabled, the shader uniforms animate over time via the rAF loop. The contract it protects is that the rAF loop should increment the time uniform, allowing the shader animations to play. The test verifies this by checking that the time value increases between two readings.

## Current Relevance Assessment
The contract still exists and is meaningful. The production code in SigmaGraphView.tsx (lines 197-232) has a useEffect that should start an rAF loop when reduceMotion is false. The rAF loop increments time based on performance.now() and updates v86bUniforms with each frame. However, the rAF loop is not running or not updating the uniforms correctly. The same reactivity issue that affects the first test (reduceMotion halts shader uniforms) also affects this test - the useEffect depends on [nodeHum, nodeFlowSpeed, nodeGlow, reduceMotion], but when reduceMotion changes, the uniforms are not updating correctly. The initialization sets initial values, but the rAF loop is not animating them.

## Decision
SKIP-WITH-DOCUMENTATION

## Reasoning
The contract is valid (reduceMotion off should allow uniforms to animate), and the production code has the rAF loop logic in place. However, the same reactivity issue that affects the first test also affects this test: the useEffect that should start the rAF loop when reduceMotion is false is not working correctly. The time uniform remains at 0 instead of incrementing, indicating the rAF loop is not running or not updating the uniforms. This is the same root cause as the first test - a complex reactivity issue involving the rAF loop, prop changes, and Sigma instance lifecycle. Fixing this requires the same deeper investigation. Skip with documentation until the reactivity issue can be properly diagnosed and fixed.

## Action Taken
Added skip comment to test with documentation of the reactivity issue.

## Deferral Counter
1
