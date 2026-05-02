# Baseline B Consolidation Follow-up v0 QA Checklist

**Purpose:** Focused regression checklist for Baseline B Consolidation Pass v0.
**Scope:** New panel UX behavior + label adapter regression checks only.
**Baseline:** Label Controls Repair v0 (15 pass, 0 fail, ACCEPTED).
**Status:** Active in-app QA checklist (featureId: baseline-b-consolidation-followup-v0).

---

## Panel UX Checks

### 1. inspector-starts-collapsed
**Expected:** Inspector panel starts collapsed/minimized on app launch.
**Steps:**
1. Open http://localhost:1420
2. Observe Inspector panel (top-left floating panel)
3. Confirm it shows collapsed label "Inspector" only, not expanded content

### 2. debug-starts-collapsed
**Expected:** Renderer Debug panel starts collapsed/minimized on app launch.
**Steps:**
1. Open http://localhost:1420
2. Observe Renderer Debug panel (bottom-left floating panel)
3. Confirm it shows collapsed label "Debug" only, not expanded content

### 3. inspector-opens-on-node-selection
**Expected:** Selecting the first node opens Inspector automatically.
**Steps:**
1. Open http://localhost:1420
2. Confirm Inspector is collapsed
3. Click a node in the graph
4. Confirm Inspector expands automatically
5. Confirm Inspector shows selected node details

### 4. inspector-opens-on-edge-selection
**Expected:** Selecting the first edge opens Inspector automatically.
**Steps:**
1. Refresh app (to reset first-selection state)
2. Confirm Inspector is collapsed
3. Click an edge in the graph
4. Confirm Inspector expands automatically
5. Confirm Inspector shows selected edge details

### 5. debug-manual-only
**Expected:** Renderer Debug opens/closes only through its manual toggle.
**Steps:**
1. Open http://localhost:1420
2. Select a node (Inspector should open)
3. Confirm Renderer Debug remains collapsed
4. Select an edge
5. Confirm Renderer Debug remains collapsed
6. Click Renderer Debug toggle button
7. Confirm it expands
8. Click toggle again
9. Confirm it collapses

---

## Label Regression Checks

### 6. node-label-mode-regression
**Expected:** Node Label Mode behavior matches accepted Label Controls Repair v0 baseline.
**Steps:**
1. Set Node Label Mode to off
2. Confirm normal node labels are hidden
3. Set Node Label Mode to all
4. Confirm node labels are visible
5. Set Node Label Mode to selected-neighborhood
6. Select a node
7. Confirm selected/neighborhood labels appear according to selection stage

### 7. edge-label-mode-regression
**Expected:** Edge Label Mode behavior matches accepted Label Controls Repair v0 baseline.
**Steps:**
1. Set Edge Label Mode to off
2. Confirm edge labels are hidden
3. Set Edge Label Mode to all-short
4. Confirm short relationship labels are visible
5. Set Edge Label Mode to selected-neighborhood
6. Select an edge
7. Confirm selected/connected relationship labels appear

### 8. hover-label-regression
**Expected:** Hover label behavior matches accepted Label Controls Repair v0 baseline.
**Steps:**
1. Enable Show Labels On Hover
2. Set Node Label Mode to off
3. Hover an unselected node
4. Confirm label appears and is readable
5. Move cursor away
6. Confirm hover label disappears

### 9. background-clear-regression
**Expected:** Background clear behavior matches accepted Label Controls Repair v0 baseline.
**Steps:**
1. Select a node
2. Confirm highlight persists
3. Click graph background
4. Confirm selection clears
5. Select an edge
6. Click graph background
7. Confirm selection clears

### 10. edge-label-font-size-regression
**Expected:** Edge Label Font Size control still visibly works.
**Steps:**
1. Set Edge Label Mode to all-short
2. Change Edge Label Font Size to 10
3. Observe edge labels become smaller
4. Change Edge Label Font Size to 16
5. Observe edge labels become larger

---

## Acceptance Criteria

- **PASS:** All 10 checks pass
- **FAIL:** Any check fails
- **ACCEPT WITH MANUAL QA REQUIRED:** If automated tests pass but visual behavior needs verification

## Notes

- This checklist is for follow-up validation only, not full baseline replacement
- The full Label Controls Repair v0 baseline (15 checks) remains the accepted contract
- If any regression is found, fix before accepting consolidation pass
