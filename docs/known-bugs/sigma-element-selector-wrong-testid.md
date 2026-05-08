# Bug: SIGMA_ELEMENT_SELECTOR targets wrong testid in real source mode

## Discovery
vP-Forensics-1 Wave 1 forensics on theme-target-inspector (selector pattern diagnostic test)

## Symptom
SIGMA_ELEMENT_SELECTOR in ThemeTargetInspectorOverlay.tsx targets `data-testid='self-graph-fixture-loaded'` but the actual DOM in real source mode uses `data-testid='graph-viewport'`. The selector pattern does not match in production, so the exclusion logic that prevents sigma primitives from being pinned is broken in real source mode.

## Location
File: `src/themes/ThemeTargetInspectorOverlay.tsx`
Line: 42 (SIGMA_ELEMENT_SELECTOR definition)

## Severity
High - Core contract failure: sigma primitives can be pinned in real source mode when they should be excluded from the inspector

## Proposed Fix
Update SIGMA_ELEMENT_SELECTOR to target both fixture and real source viewports. The selector should be:
```typescript
const SIGMA_ELEMENT_SELECTOR = `[data-testid='self-graph-fixture-loaded'] canvas, [data-testid='self-graph-fixture-loaded'] svg, [data-testid='self-graph-fixture-loaded'] [data-sigma-element], [data-testid='graph-viewport'] canvas, [data-testid='graph-viewport'] svg, [data-testid='graph-viewport'] [data-sigma-element]`;
```
Or use a combined selector pattern that matches both testids.

## Status
Open
