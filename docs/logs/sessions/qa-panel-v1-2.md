# Session Log: QA Panel v1.2

## Goal
Stabilize QA Panel v1.1 by fixing broken notes textarea, removing overflow buttons, clarifying submit behavior, renaming user-facing terminology, and documenting edge hover parity plan.

## Files Changed
- `src/control-plane/qa/QaPanel.tsx` - Fixed notes textarea with local state, removed Download/Reset buttons, cleaned up unused functions
- `src/control-plane/settings/settings.registry.ts` - Renamed "Node Selection Stage" to "Neighborhood Depth" in UI label
- `docs/28_PARALLEL_INTERACTION_STRUCTURE.md` - Created new doc defining parallel interaction structure standard and relationship label template plan

## What Changed

### Part A — Fix QA Notes Textarea

**Root Cause:**
The notes textarea was controlled directly by `qaResults[currentCheck.id]?.notes`. When typing, the Zustand store update and component re-render cycle caused a race condition where the typed text didn't immediately appear in the textarea. The cursor blinked but text didn't show.

**Fix:**
Added local React state (`localNotes`) for the textarea value:
- Added `localNotes` state initialized to empty string
- Added `useEffect` to sync `localNotes` when current check changes or qaResults updates
- Updated `updateNotes` to set both `localNotes` (immediate) and store (persisted)
- Changed textarea `value` from `currentResult?.notes` to `localNotes`

This provides immediate typing feedback while still persisting to the store.

### Part B — Remove Overflowing Buttons

**Removed:**
- Download Report button (function `downloadQaReport` also removed)
- Reset button (function `resetQa` also removed)
- Unused import `resetFeatureResults` removed

**Kept:**
- Copy Report button
- Submit Report button

**Result:**
Buttons now fit cleanly in the narrow sidebar without trailing outside the panel.

### Part C — Submit Behavior Clarity

**Existing behavior was already correct:**
- Submit Report stores finalized submission in Zustand store
- Submit Report copies markdown to clipboard if available
- Submit Report shows confirmation message
- Copy Report only copies without finalizing

**No changes needed** - the implementation already met requirements.

### Part D — Rename "Node Selection Stage" to "Neighborhood Depth"

**Changed:**
- `src/control-plane/settings/settings.registry.ts` line 184: label changed from "Node Selection Stage" to "Neighborhood Depth"
- Description unchanged: "Controls how much neighborhood context appears when selecting a node."
- Options unchanged: Stage 1/2/3 labels remain as-is (these are option labels, not the main setting label)

**Note:**
Internal variable `nodeSelectionStage` was not renamed in this pass. Only the user-facing UI label was changed as requested. Session log documents this distinction.

### Part E — Edge Hover Label Parity Plan

**Created:**
`docs/28_PARALLEL_INTERACTION_STRUCTURE.md`

**Defined:**
- Core principle: When implementing node behavior, ask "what is the matching edge behavior?"
- Standard: Edge interactions should mirror node interactions unless explicitly impossible
- Completion rule: No parallel feature is complete without node/edge parity review

**Documented parity example:**
- Node hover: state, events, policy, style, debug, QA
- Edge hover: matching structure (to be implemented)

### Part F — Relationship Label Display Template Plan

**Added to same doc:**
5 planned presets:
1. relationship-only (e.g., "contains")
2. source-target (e.g., "agent_utils.py -> is_duplicate_output()")
3. source-relationship-target (e.g., "agent_utils.py -> contains -> is_duplicate_output()")
4. source-location (e.g., "core/agent_utils.py:L39")
5. source-location-code-line (e.g., "core/agent_utils.py:L39 -> actual code line")

**Important limitation documented:**
Source code line extraction requires Graphify artifacts with source snippets, Tauri backend file read, or accessible fixture files. Do not fake source-line extraction if data unavailable.

**Current parity status table:**
- Hover label: Node ✅, Edge ❌
- Selection: Node ✅, Edge ✅
- Label modes: Node ✅, Edge ✅
- Debug display: Node ✅, Edge ❌
- QA coverage: Node ✅, Edge ❌

### Part G — Edge Hover Implementation Decision

**Decision: NOT IMPLEMENTED in this pass.**

**Reason:**
Edge hover implementation requires more than a small patch:
- Add `hoveredEdgeId` to SelectionContext (affects all consumers)
- Add `hoveredEdgeId` state in SigmaGraphView
- Add `enterEdge`/`leaveEdge` event handlers in SigmaGraphView
- Update labelPolicy.ts to handle edge hover logic
- Add DebugRow for Hovered Edge
- Add QA checklist item for edge hover

This touches multiple files and architectural boundaries. Per task instruction: "If this becomes larger than a small patch, stop after the doc and report that edge hover implementation should be a separate task."

**Recommendation:**
Edge hover parity should be a separate dedicated task following the parallel structure defined in `docs/28_PARALLEL_INTERACTION_STRUCTURE.md`.

## Validation

**Typecheck:**
- `npm run typecheck` passed with no errors

**Manual QA Required:**
1. QA notes textarea accepts typed text immediately
2. Notes remain when moving Previous/Next
3. Notes remain after browser refresh
4. Notes appear in Copy Report markdown
5. Notes appear in Submit Report markdown
6. Download and Reset buttons are gone from visible panel
7. Copy and Submit buttons fit in sidebar
8. Submit confirmation appears ("Submitted and copied" or "Submitted (clipboard unavailable)")
9. User-facing label says "Neighborhood Depth" instead of "Node Selection Stage"

## Known Limitations

- **Reset functionality removed:** Reset button was removed to prevent sidebar overflow. Users can clear localStorage via browser dev tools if needed, or a future Advanced/details section could restore it.
- **Edge hover not implemented:** Edge hover parity is documented but not implemented. Should be a separate task.
- **Internal variable naming:** `nodeSelectionStage` internal variable was not renamed, only the UI label. This is intentional to minimize scope in this pass.

## Design Decisions

**Local state for textarea:**
Chose local React state over uncontrolled input to maintain clean controlled pattern while solving the typing race condition. The useEffect sync ensures persistence is maintained.

**Button removal:**
Removed Download and Reset buttons to prevent sidebar overflow. Download is a convenience feature that can be re-added later if needed. Reset can be re-added behind an Advanced/details section.

**UI label only rename:**
Renamed only the user-facing label "Neighborhood Depth" without changing internal variable `nodeSelectionStage` to keep the pass focused and safe.

**Edge hover as separate task:**
Decided to document the plan and defer implementation to avoid scope creep. The parallel structure doc provides clear guidance for the future implementation.

## Parallel Structure Rule

For future prompts:

When implementing a behavior for nodes, explicitly ask:
**What is the matching edge behavior?**

When implementing a behavior for edges, explicitly ask:
**What is the matching node behavior?**

If they differ, document why.

Before patching, identify the existing sibling system. If implementing edge behavior, inspect the node behavior and mirror its architecture:
state → events → policy → style → debug → QA → docs.

Do not invent a separate pattern unless necessary.
