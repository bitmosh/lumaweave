# Session Log: QA Panel v1.4 — Checklist-Scoped Persistence and Editable Notes Fix

## Goal
Fix state isolation bugs where old checklist answers leaked into new checklists, and fix textarea edit/delete behavior where old text could not be deleted.

## Files Changed
- `src/control-plane/qa/qa.types.ts` - Added qaVersion, active, archived fields to QaCheckDefinition; added checklistKey to QaFeatureSubmission
- `src/control-plane/qa/qa-registry.ts` - Added qaVersion: 1 and active: true to all Label Controls Repair v0 checks
- `src/control-plane/qa/qa.store.ts` - Changed from results to resultsByChecklist with nested structure; updated setCheckResult to accept checklistKey
- `src/control-plane/qa/QaPanel.tsx` - Updated to use checklistKey-scoped results; fixed textarea sync logic; fixed status isolation; updated report generation; fixed dropdown visibility

## Root Cause of Stale Old Notes Leaking into New Checklist

The QA store was keyed only by checkId, not by checklist version. When a new QA checklist was generated (with a new qaVersion), the old checkIds would match and the old results would be loaded. This caused notes and status from the previous checklist version to appear in the new version, violating the requirement that new checklists should start fresh.

## Root Cause of Unable-to-Delete Notes

The useEffect that synced `localNotes` from the store had `qaResults` in its dependency array in v1.3. This caused the effect to run on every store update, which could restore stale persisted notes into localNotes even when the user was trying to delete them. The effect was designed to sync when navigating between checks, but including the entire results object in dependencies caused it to run too frequently and overwrite user input.

## New Store Shape

**Before:**
```typescript
results: Record<string, QaCheckResult>
// results["node-label-dropdown-visible"] = { status: "pass", notes: "..." }
```

**After:**
```typescript
resultsByChecklist: Record<string, Record<string, QaCheckResult>>
// resultsByChecklist["label-controls-repair-v0:v1"]["node-label-dropdown-visible"] = { status: "pass", notes: "..." }
```

The checklistKey is derived as: `${featureId}:v${qaVersion}`

## How Checklist Versioning Works

1. Each QaCheckDefinition now has a `qaVersion` field (number)
2. Each QaCheckDefinition has an `active` field (boolean, defaults to true)
3. Each QaCheckDefinition has an optional `archived` field (boolean)
4. The checklistKey is derived as `${featureId}:v${qaVersion}`
5. Results are stored under the checklistKey: `resultsByChecklist[checklistKey][checkId]`
6. When qaVersion changes, a new checklistKey is generated, creating a fresh answer set
7. Old checklist results are preserved in the store but isolated by their old checklistKey
8. Only active, non-archived checklists appear in the dropdown
9. If only one active checklist exists, the dropdown is hidden and the checklist name is shown as static text

## Files Changed Details

### src/control-plane/qa/qa.types.ts
- Added `qaVersion: number` to QaCheckDefinition
- Added `active?: boolean` to QaCheckDefinition
- Added `archived?: boolean` to QaCheckDefinition
- Added `checklistKey: string` to QaFeatureSubmission

### src/control-plane/qa/qa-registry.ts
- Added `qaVersion: 1` to all Label Controls Repair v0 checks
- Added `active: true` to all Label Controls Repair v0 checks
- This creates the checklistKey: "label-controls-repair-v0:v1"

### src/control-plane/qa/qa.store.ts
- Changed state from `results: Record<string, QaCheckResult>` to `resultsByChecklist: Record<string, Record<string, QaCheckResult>>`
- Changed `setCheckResult(checkId, result)` to `setCheckResult(checklistKey, checkId, result)`
- Changed `resetFeatureResults(featureId)` to `resetChecklistResults(checklistKey)`
- Updated reset logic to delete by checklistKey instead of by featureId prefix

### src/control-plane/qa/QaPanel.tsx
- Added `activeQaVersion` state (default: 1)
- Derived `activeChecklistKey` as `${activeFeatureId}:v${activeQaVersion}`
- Changed `qaResults` to `resultsByChecklist` from store
- Changed `currentChecklistResults` to `resultsByChecklist[activeChecklistKey] || {}`
- Changed `currentStoredResult` to `currentChecklistResults[currentCheck.id]`
- Fixed useEffect to sync localNotes only when `activeChecklistKey` or `currentCheck?.id` changes (removed qaResults from dependency)
- Fixed useEffect to use `currentStoredResult?.notes ?? ""` (empty string is valid)
- Updated `updateStatus` to call `setCheckResult(activeChecklistKey, checkId, result)`
- Updated `updateNotes` to call `setCheckResult(activeChecklistKey, checkId, result)`
- Updated `copyQaReport` to sync localNotes and call `setCheckResult(activeChecklistKey, ...)`
- Updated `submitQaReport` to sync localNotes, call `setCheckResult(activeChecklistKey, ...)`, and include checklistKey in submission
- Updated `generateMarkdownReport` to accept `checklistKey` instead of `featureId` and include it in report
- Updated dropdown to use `uniqueChecklists` derived from active checklists
- Added `handleChecklistChange` to parse checklistKey and update both featureId and qaVersion
- Updated dropdown to hide if only one active checklist exists
- Updated summary computation to use `currentChecklistResults`

## Typecheck Result

**PASSED** - `npm run typecheck` succeeded with no errors.

## Manual QA Instructions

1. Open current QA checklist (Label Controls Repair v0).
2. Type text into notes.
3. Delete the text completely.
4. Confirm textbox stays empty (empty string is valid).
5. Type different text.
6. Click Next.
7. Click Previous.
8. Confirm new text remains.
9. Refresh browser.
10. Confirm new text remains (persists for same checklist version).
11. Temporarily change qaVersion to 2 in qa-registry.ts for testing, or create a test active checklist version.
12. Confirm notes/status from old version (v1) do NOT appear.
13. Confirm status defaults to untested for new version (v2).
14. Confirm Copy Report includes only current version notes.
15. Confirm Submit Report includes only current version notes.
16. Restore intended qaVersion (1) if changed for test.

## Known Limitations

- **No archive/history UI:** There's no UI to view archived or historical QA checklists. Old checklists are simply hidden from the dropdown. Old checklist results are preserved in localStorage but not accessible through the UI. A future QA history/archive UI can be implemented to view past checklist versions.
- **Manual qaVersion editing:** Testing version isolation requires manually editing qaVersion in qa-registry.ts. There's no UI to create new checklist versions. This is acceptable for v0 since checklist versions should be generated by the system, not manually.
- **Submissions keyed by featureId:** Submissions are still keyed by featureId for historical tracking, not by checklistKey. This means only the most recent submission per featureId is preserved. If historical submissions per checklist version are needed, the submission key should be changed to checklistKey.

## Design Decisions

**ChecklistKey derivation:**
Chose `${featureId}:v${qaVersion}` as the checklistKey format. This is simple, readable, and easy to parse. The "v" prefix makes it clear that it's a version number.

**Empty string is valid:**
Empty string is a valid value for notes. The sync logic uses `currentStoredResult?.notes ?? ""` to ensure empty strings are preserved. No fallback to previous notes or default text.

**Sync only on checklistKey/checkId change:**
The useEffect that syncs localNotes only depends on `activeChecklistKey` and `currentCheck?.id`. This prevents the effect from running on every store update, which was causing the unable-to-delete bug.

**Dropdown hiding for single checklist:**
If only one active checklist exists, the dropdown is hidden and the checklist name is shown as static text. This reduces UI clutter when there's only one option. If multiple active checklists exist, the dropdown is shown.

**Active filter:**
Only checklists with `active !== false` appear in the dropdown. Archived checklists are filtered out. This allows future checklists to be marked as `active: false` or `archived: true` without appearing in the UI, while preserving their results in the store.

## QA Panel v1.4 Manual Acceptance Status

**READY FOR MANUAL ACCEPTANCE**

All code changes are complete and typecheck passes. Manual QA is required to verify:
1. Notes can be deleted completely (empty string is valid)
2. Notes persist after browser refresh for same checklist version
3. New checklist versions start fresh (no old notes/status leak)
4. Status defaults to untested for new checklist version
5. Copy Report includes only current version notes
6. Submit Report includes only current version notes
7. Dropdown shows only active checklists
8. Dropdown hides if only one active checklist

Once manual QA confirms these behaviors, QA Panel v1.4 can be accepted as the Baseline B acceptance harness.
