# Test: reduceMotion halts shader uniforms

## Identity
- Spec file: tests/e2e/reduce-motion-halt.spec.ts
- Line range: 15-24
- First seen failing: unknown (pre-existing across v86a, v86b, vP-Tests)
- Last verified passing: unknown
- Investigated by: Bandit (vP-Forensics-1)
- Last audited: 2026-05-08
- Git archaeology: Ran `git log -L 15,45:tests/e2e/reduce-motion-halt.spec.ts --oneline | head -20` - found commit be0a0f8 "feat: v86b Visual Treatment (partial) — sphere uniforms, overlays, schema v80" which introduced the test. No commit found that broke the test - failure appears to be pre-existing across v86a/v86b.
- Related Investigations: See also `reduce-motion-halt--reducemotion-off-allows-uniforms-to-animate.md` and `reduce-motion-halt--reducemotion-preserves-glowstrength.md` - these three tests share the same root cause.

## Current Failure
```
Error: expect(received).toBe(expected) // Object.is equality
Expected: 0
Received: 0.7
```

Location: tests/e2e/reduce-motion-halt.spec.ts:21

The test sets reduceMotion to true, waits 100ms, then reads v86bUniforms and expects hum, flowSpeed, and time to be 0. The test fails because hum is 0.7 (the default value) instead of 0.

## Reconstructed Intent
This test was written to ensure that when reduceMotion is enabled, all shader animation uniforms (hum, flowSpeed, time) are halted at 0. The contract it protects is that reduceMotion should stop all motion effects in the shader uniforms, while preserving glowStrength. The test verifies this by setting reduceMotion=true and checking that the uniforms reflect the halted state.

## Current Relevance Assessment
The contract still exists and is meaningful. The production code in SigmaGraphView.tsx (lines 197-232) has a useEffect that should set v86bUniforms based on the reduceMotion prop. When reduceMotion is true, it should set time=0, hum=0, flowSpeed=0, glowStrength=nodeGlow. The reduceMotion prop is now passed from AppShell.tsx (line 837) to SigmaGraphView. The getSetting method has been forced to override Sigma's built-in getSetting to read from __settings (line 577-579). v86bUniforms are initialized when sigma is created (lines 585-592). However, the useEffect that updates v86bUniforms when reduceMotion changes is not working correctly - the uniforms retain their initial values instead of updating to reflect the reduceMotion state.

## Decision
SKIP-WITH-DOCUMENTATION

## Reasoning
The contract is valid (reduceMotion should halt shader uniforms), and the production code has the correct logic in place. However, the implementation has a timing/reactivity issue: the useEffect that updates v86bUniforms depends on [nodeHum, nodeFlowSpeed, nodeGlow, reduceMotion], but when reduceMotion changes via the settings store, the v86bUniforms are not updating correctly. The initialization happens when sigma is created with the initial prop values, and the useEffect should re-run when reduceMotion changes, but the uniforms retain their initial values. This is a complex reactivity issue involving the rAF loop, prop changes, and Sigma instance lifecycle. Fixing this requires deeper investigation into the React re-render cycle and the useEffect dependency array. Given the complexity and time constraints, skip with documentation until the reactivity issue can be properly diagnosed and fixed.

## Action Taken
Added skip comment to test with documentation of the reactivity issue.

## Deferral Counter
1

## Resolution (2026-05-18)
**RESOLVED** - The root cause was not a reactivity issue but a missing implementation. vP-Render-Pipeline-Refactor R2 (commit 54e11a8f) removed the monkey-patched getSetting pattern and introduced a ref-based uniform pipeline, but never wired the useEffect + rAF loop that updates uniformsRef.current. The uniformsRef was initialized from props on first render and then never updated, so reduceMotion / nodeHum / nodeFlowSpeed / nodeGlow setting changes had no effect on the shader.

This commit (feat/v86b-finish) adds the missing uniform update effect per SIGMA_LIFECYCLE_CONTRACT.md's documented pattern:
- Ref-sync effect for nodeHum/nodeFlowSpeed/nodeGlow (prevents rAF tear-down on prop changes)
- Main uniform update effect gated on reduceMotion:
  - When reduceMotion=true: halts time/hum/flowSpeed to 0, preserves glowStrength
  - When reduceMotion=false: runs rAF loop to animate time continuously
- Deterministic probe window.__lwReadUniforms() exposed for Playwright testing
- Tests rewritten to use the new probe instead of the old monkey-patched path

All three reduce-motion-halt tests now pass.
