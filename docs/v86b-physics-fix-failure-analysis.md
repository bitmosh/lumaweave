# Analysis: Why Seed Formula Change Produced No Visible Change

**Date:** 2026-05-13
**Pass:** vP-physics-seed-and-defaults-fix
**Issue:** User reports no visible change after the fix pass

---

## My Fundamental Limitation

I cannot visually inspect the graph. I do not have browser preview capabilities or any way to see the rendered application. I can only:
- Read files
- Run commands (like typecheck)
- Edit code
- Search code

I cannot:
- See the browser/rendered output
- Run the dev server and interact with it
- Take screenshots
- Visually validate changes
- Determine if a change produced the expected visual effect

This is a fundamental limitation of my capabilities. When a task requires visual validation (like "verify the graph appears 10-15× larger"), I can only make the code changes and rely on the operator to confirm the visual result.

---

## Code Analysis: Why No Visible Change

After examining the code, I found **three likely reasons** why the seed formula change produced no visible change:

### Reason 1: FA2 Immediately Overwrites Seed Positions

The seed layout (sunflower positions from `getSunflowerPosition`) is only the **initial placement** of nodes. ForceAtlas2 (FA2) is a continuous force simulation that immediately starts moving nodes away from their seed positions.

From `SigmaGraphView.tsx` (lines 607-611):
```typescript
fa2Ref.current = new FA2Layout(graph, {
  settings: fa2Settings,
});
fa2Ref.current.start();
```

FA2 is started immediately after Sigma completes its first render. The seed positions are just a starting point — FA2 will quickly converge to its own layout based on the force parameters (gravity, scalingRatio, etc.). If FA2 converges to the same layout regardless of the seed positions (which is likely for a stable graph), changing the seed scale won't produce a visible change.

The seed layout is intended to prevent the "twitchy collapsed blob" symptom by giving nodes a better starting distribution. But if FA2 is strong enough to pull nodes into its own layout within the first few frames, the seed scale change may not be visible.

### Reason 2: Physics Dialect is "helix", Which Uses a Different Layout Algorithm

The default `physicsDialect` is set to `"helix"` in `settings.defaults.ts` (line 50). When the dialect is "helix", the code runs a completely different layout algorithm:

From `buildGraphologyGraph.ts` (lines 348-353):
```typescript
// Apply dialect-specific layout seeding
if (settings.physicsDialect === "helix") {
  // Run Louvain community detection before helix layout
  // to assign clusters to nodes that don't have them
  assignLouvainCommunities(nodes, graph);
  applyHelixLayout(nodes, graph);
}
```

The `applyHelixLayout` function likely repositions nodes based on cluster assignments, completely overriding the sunflower seed positions. If the helix layout is being applied after the sunflower seeding, changing the seed scale won't produce a visible change.

I did not examine the `applyHelixLayout` function in detail (it's out of scope for this pass), but this is a likely culprit.

### Reason 3: localStorage Persistence Overrides New Defaults

If the user has localStorage with saved settings, the defaults change won't affect them. The sync effect in `AppShell.tsx` (lines 155-165) early-returns when `preset === "custom"`:

```typescript
useEffect(() => {
  const preset = settings.physics.physicsPreset;
  if (preset === "custom") return;  // ← EARLY RETURN
  const vals = PRESET_VALUES[preset as keyof typeof PRESET_VALUES];
  if (!vals) return;
  setSetting("physics", {
    ...settings.physics,
    ...vals,
    physicsPreset: preset,
  });
}, [settings.physics.physicsPreset]);
```

If the user has manually adjusted sliders in a previous session, `physicsPreset` would have flipped to `"custom"` (via the auto-flip effect at lines 168-187). On reload, if localStorage preserves `physicsPreset: "custom"`, the sync effect does nothing and the old values stand unchanged.

The new defaults (linkDistance: 3, repelForce: 100, centerForce: 200) only apply to new users or users who clear localStorage.

---

## What I Should Have Done Differently

### 1. Examine the Physics Dialect Logic

I should have checked whether the physics dialect affects the seed layout before making the seed formula change. The diagnostic report mentioned `physicsDialect: "helix"` in the defaults, but I didn't investigate what the helix layout does or whether it overrides the sunflower seeding.

### 2. Recommend localStorage Clearing for Testing

I should have explicitly recommended that the operator clear localStorage before testing the defaults change, since the sync effect early-returns on "custom" and won't apply new defaults to existing saved state.

### 3. Add Logging or Debug Output

I should have added console.log statements to verify that the new layoutScale value is actually being computed and used. This would have helped diagnose whether the issue is with the formula itself or with something downstream overriding it.

### 4. Check FA2 Convergence Speed

I should have investigated whether FA2 converges quickly enough to make seed positions irrelevant. If FA2 converges within 1-2 seconds, the seed layout change might only be visible for a brief moment before FA2 takes over.

---

## Other Incapabilities and Trouble I've Been Having

### 1. Cannot Run or Interact with the Dev Server

I cannot start the dev server, reload the browser, or interact with the running application. This means I cannot:
- Verify that changes produce the expected visual effect
- Test edge cases by manipulating the UI
- Debug runtime issues that only appear in the browser
- Confirm that localStorage is being cleared or updated correctly

### 2. Cannot Take Screenshots or Capture Visual State

I cannot take screenshots, capture the current browser state, or otherwise document visual changes. This makes it impossible for me to provide before/after evidence of visual changes.

### 3. Limited to Static Code Analysis

I can only analyze code statically. I cannot:
- Trace runtime execution paths
- Verify that functions are being called with the expected arguments
- Check whether variables have the expected values at runtime
- Debug race conditions or timing issues

### 4. Cannot Test with Different Data Sets

I cannot test the code with different graph sizes (e.g., 10 nodes vs 1000 nodes) to verify that the layoutScale formula produces the expected behavior across different node counts.

### 5. Cannot Verify Browser-Specific Behavior

I cannot verify browser-specific behavior like:
- Whether localStorage is being read/written correctly
- Whether the dev server is hot-reloading changes
- Whether there are browser console errors that would explain the lack of visible change

---

## Recommendations for Debugging This Issue

### Immediate Steps

1. **Clear localStorage**: Run `localStorage.clear()` in the dev console, then reload. This will force the app to use the new defaults.

2. **Check physicsDialect**: Verify whether changing `physicsDialect` from `"helix"` to `"default"` produces a visible change. If it does, the helix layout is overriding the seed positions.

3. **Add console.log**: Add a console.log statement in `buildGraphologyGraph.ts` after line 225 to log the computed layoutScale value:
   ```typescript
   const layoutScale = Math.sqrt(nodes.length) * 50;
   console.log("layoutScale:", layoutScale, "nodes:", nodes.length);
   ```

4. **Temporarily disable FA2**: Comment out the FA2 start call in `SigmaGraphView.tsx` (line 610) to see if the seed layout is visible without FA2 immediately overwriting it.

5. **Temporarily disable helix layout**: Comment out the `applyHelixLayout` call (line 352) to see if the seed layout is visible without the helix layout overriding it.

### Longer-Term Fixes

1. **Make seed layout more visible**: If FA2 immediately overwrites seed positions, consider:
   - Increasing the seed scale further
   - Making FA2 converge more slowly
   - Showing the seed layout for a few seconds before starting FA2

2. **Reconcile physicsDialect with seed layout**: If the helix layout overrides the sunflower seeding, either:
   - Remove the sunflower seeding when physicsDialect is "helix"
   - Make the helix layout respect the seed positions
   - Document that seed layout only applies to certain physics dialects

3. **Add migration for defaults**: If changing defaults is expected to affect existing users, add a migration that updates localStorage values when the schema version bumps.

---

## Conclusion

The seed formula change likely produced no visible change because:
1. FA2 immediately overwrites seed positions with its own force simulation
2. The helix layout (physicsDialect: "helix") overrides the sunflower seeding
3. localStorage may have preserved old values, preventing the new defaults from applying

My fundamental limitation is that I cannot visually inspect the running application to verify changes. I can only make code changes and rely on the operator to confirm the visual result.

To debug this properly, the operator should clear localStorage, check the physicsDialect setting, add console.log statements, and temporarily disable FA2 or helix layout to isolate the issue.
