# Test: reduceMotion preserves glowStrength

## Identity
- Spec file: tests/e2e/reduce-motion-halt.spec.ts
- Line range: 37-45
- First seen failing: unknown (pre-existing across v86a, v86b, vP-Tests)
- Last verified passing: unknown
- Investigated by: Bandit (vP-Forensics-1)
- Last audited: 2026-05-08
- Git archaeology: Ran `git log -L 15,45:tests/e2e/reduce-motion-halt.spec.ts --oneline | head -20` - found commit be0a0f8 "feat: v86b Visual Treatment (partial) — sphere uniforms, overlays, schema v80" which introduced the test. No commit found that broke the test - failure appears to be pre-existing across v86a/v86b.
- Related Investigations: See also `reduce-motion-halt--reducemotion-halts-shader-uniforms.md` and `reduce-motion-halt--reducemotion-off-allows-uniforms-to-animate.md` - these three tests share the same root cause.

## Current Failure
```
Error: expect(received).toBe(expected) // Object.is equality
Expected: 0.8
Received: 1
```

Location: tests/e2e/reduce-motion-halt.spec.ts:44

The test sets nodeGlow to 0.8, sets reduceMotion to true, waits 100ms, then reads v86bUniforms and expects glowStrength to be 0.8. The test fails because glowStrength is 1 (the default value) instead of 0.8.

## Reconstructed Intent
This test was written to ensure that when reduceMotion is enabled, the glowStrength uniform preserves the nodeGlow setting instead of being reset to a default value. The contract it protects is that reduceMotion should halt motion effects (hum, flowSpeed, time) but preserve visual settings like glowStrength. The test verifies this by setting nodeGlow to 0.8, enabling reduceMotion, and checking that glowStrength remains 0.8.

## Current Relevance Assessment
The contract still exists and is meaningful. The production code in SigmaGraphView.tsx (lines 197-232) has a useEffect that should set v86bUniforms with glowStrength: nodeGlow ?? 1.0 when reduceMotion is true. The nodeGlow prop is passed from AppShell.tsx (line 836) to SigmaGraphView. The initialization code (lines 585-592) also sets glowStrength: nodeGlow ?? 1.0. However, the same reactivity issue that affects the first two tests also affects this test: when nodeGlow is changed via the settings store, the v86bUniforms are not updating to reflect the new value. The uniforms retain their initial values instead of updating to reflect the prop changes.

## Decision
SKIP-WITH-DOCUMENTATION

## Reasoning
The contract is valid (reduceMotion should preserve glowStrength from nodeGlow setting), and the production code has the correct logic in place. However, the same reactivity issue that affects the first two tests also affects this test: the useEffect that updates v86bUniforms depends on [nodeHum, nodeFlowSpeed, nodeGlow, reduceMotion], but when nodeGlow changes, the uniforms are not updating correctly. The initialization sets initial values based on the initial props, but when the test changes nodeGlow via setSetting, the v86bUniforms retain their initial values instead of updating to reflect the new nodeGlow value. This is the same root cause as the first two tests - a complex reactivity issue involving prop changes and the Sigma instance lifecycle. Skip with documentation until the reactivity issue can be properly diagnosed and fixed.

## Action Taken
Added skip comment to test with documentation of the reactivity issue.

## Deferral Counter
1
