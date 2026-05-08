# Bug: Panel positioning logic fails in real source mode

## Discovery
vP-Forensics-1 Wave 1 forensics on theme-target-inspector

## Symptom
UI Inspector panel's right edge (1264px) exceeds the graph viewport's right boundary (861px) in real source mode, causing the panel to overflow outside the viewport area. The test assertion at line 212 uses measured graphBox.width (not hardcoded fixture width) and correctly identifies this as a production bug.

## Location
File: `src/themes/ThemeTargetInspectorOverlay.tsx`
Lines: 149-184 (panel positioning logic)

## Severity
Medium - UX issue where inspector panel overflows viewport bounds in real source mode

## Proposed Fix
The panel positioning logic in ThemeTargetInspectorOverlay.tsx calculates offsets dynamically using `graphViewportOffsets` based on getBoundingClientRect(), but the resulting position is outside the viewport bounds for real source dimensions. The positioning needs to account for the actual viewport width in real source mode, not just fixture dimensions. May need to clamp panel position to ensure it stays within viewport bounds regardless of mode.

## Status
Open
