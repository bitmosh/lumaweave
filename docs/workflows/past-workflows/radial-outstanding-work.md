# Radial Inspector — Outstanding Work

_Last updated: 2026-06-04 · Version: 0.12.0 · Suite: 635 passed / 0 failed / 15 skipped_

All "ready to go" and "moderate" items from the previous backlog are **DONE**. This file now tracks the remaining work after both polish sessions.

---

## Status summary

| Category | Count | Notes |
|----------|-------|-------|
| Blocking bugs | 0 | — |
| UX polish (quick) | 3 | Non-blocking, good for next pass |
| UX polish (moderate) | 3 | Require design decision or test-fixture work |
| Deferred (future arcs) | 3 | Blocked on other roadmap items |

---

## Quick polish (next pass)

### Q1 · ColorTab "Kind" / "Cluster" scope buttons — signal deferred state

**Current:** Two permanently-disabled buttons in the scope row. Users may click them and get no feedback at all.

**Fix:** Add a tooltip on hover (`"Apply to all [node type] nodes · coming in v92"`) or replace them with a single faint `"More scope options in v92"` note. Either removes the ambiguity without removing the scope-tier concept from the UI.

**Effort:** 30 min CSS + copy

---

### Q2 · Geometry scope picker — section label + i18n

**Current:** "This" / "All" scope buttons have no heading above them. Users have to infer the section purpose from context. Strings are also hardcoded in JSX, unlike ColorTab which uses `t("...")`.

**Fix:** Add `"Apply to:"` label above the button row (matches ColorTab's section header pattern). Add i18n keys: `inspector.spokes.geometry.scopeLabel`, `inspector.spokes.geometry.scopeThis`, `inspector.spokes.geometry.scopeAll`.

**Effort:** 15 min + i18n key addition

---

### Q3 · CodeTab classname — `.lw-ide-tab` → `.lw-code-tab`

**Current:** The outer `<div>` in `CodeTab.tsx` uses `className="lw-ide-tab"` (leftover from the IdeTab → CodeTab rename). The `data-testid` is correct (`"code-tab"`), but the CSS class name doesn't match.

**Fix:** Rename the class in `CodeTab.tsx` and any corresponding CSS rules. No test changes needed.

**Effort:** 10 min grep + replace

---

## Moderate (design decision needed)

### M1 · Keyboard navigation in the ring

**Current:** Spoke buttons are focusable (`:focus-visible` ring is implemented) but there's no directional navigation — pressing Arrow keys does nothing. Tab order falls through the ring buttons but is not ring-aware.

**Design decision:** Arrow keys rotate around the ring (circular), or Left/Right for ±1 and Enter to open/close submenu? The submenu itself also needs its own focus trap when open.

**Effort:** 1–2h. Best done as a standalone keyboard-nav pass.

---

### M2 · ApplyTab — 3 skipped tests need a graph fixture

**Current:** `inspector-spokes-apply.spec.ts` has 3 `test.skip()` tests:
- "apply-selected button disabled when no candidates selected"
- "select-all enables apply-selected"
- "select-none after select-all re-disables apply-selected"

These skip because the DOM probe finds no candidates on a fresh page with no graph loaded.

**Fix:** Add a `setupCandidates(page)` helper in the test file that injects a synthetic `data-lw-theme-target` element into the DOM before opening the inspector. This guarantees at least one candidate row. Unfix the 3 tests after the helper exists.

**Effort:** 1–2h test-fixture work.

---

### M3 · HistoryTab doesn't show global-scope edits

**Current:** `HistoryTab` calls `getTargetOverrides(targetDescriptor.targetId)` — returns only target-scoped overrides. If you apply geometry at "All" scope (or make a global color edit), that override doesn't appear in History for any specific target.

**Options:**
- (A) Add a "This / Global" toggle to HistoryTab, showing global overrides when in "Global" mode. Symmetric with the scope pickers in Color and Geometry tabs.
- (B) Add "last-edited-during-target" tracking to the override storage so global overrides know which target was open when they were made. More complex storage change.
- (C) Document it as intentional: History = what's been customised on THIS target. Global edits live in a separate "global history" view (deferred).

Option A is the cleanest without a storage schema change.

**Effort:** 1–2h for option A.

---

## Deferred (future arcs)

### D1 · Type spoke — Typography axis tokens
**Blocked on:** Typography arc (no version assigned). `registerTypeSpoke.ts` has `placeholderMessage: "Coming in future arc (Typography axis token wiring)"`. Tokens don't exist yet.

### D2 · Motion spoke — Audio reactivity controls
**Blocked on:** Audio Reactivity arc (v92). `registerMotionSpoke.ts` has `placeholderMessage: "Coming in v92 (Audio Reactivity arc)"`. The `motion.reduce` token exists but the spoke needs controls wired to the reactivity system.

### D3 · Layout spoke — Physics dialect controls
**Blocked on:** Physics Dialect arc (v93). `registerLayoutSpoke.ts` has `placeholderMessage: "Coming in v93 (Physics Dialect arc)"`. Layout tokens don't exist yet.

---

## Architecture notes (not tasks)

- **`HistoryTab` and `ApplyTab` both import `color-tab.css`** for shared header/back-button patterns. Works fine but creates implicit coupling. Extract to `_inspector-shared.css` if those styles ever need to diverge.

- **`PlaceholderTab` base function (non-factory)** has a fallback that finds "the first placeholder spoke." Dead code in practice — all placeholder spokes use `makePlaceholderTab(id)`. Safe to remove or simplify.

- **`TargetDescriptor.surface` and `.status`** are passed through the `inspector:open` event and stored, but not currently used by any tab component. Available for future features that need to branch on the inspected element's surface type.

- **Geometry thumbnail cache** (`nodeProgramThumbnails.ts`): module-level Map, invalidates on theme switch via Zustand subscription. No max-size cap. Grows by 5 bitmaps per theme switch. Harmless at current scale (5 presets × 2–3 themes).

- **Geometry target-scope migration removed** (`themeOverrideStorage.ts`): the `loadOverrides()` filter that stripped target-scoped `node.geometry.preset` entries was removed to unblock the scope picker. Any legacy stale data (if it somehow existed) will now persist rather than auto-clean. This is acceptable — the data is structurally valid.
