# Bandit — v112.3a: Motion spoke MVP

Second half of v112's D3 work. Replaces the Motion spoke placeholder with a working MVP: Reduce Motion toggle wired to settings + read-only motion safety reference grouped by classification.

Basis: `~/Projects/lumaweave/docs/SHIP_READINESS_ROADMAP.md` §3 (v112) + `docs/workflows/v112_0_ui_completeness_report.md` §3.2 (Motion spoke) + Ryan-locked decision: "grouped by classification" display.

Generic rules: `~/Projects/CLAUDE.md`; project: `~/Projects/lumaweave/CLAUDE.md`; Discord/gates: `~/Projects/DISCORD_PROTOCOL.md`.

## ⏩ BANDIT PASS PREFACE
0. Discord MCP else HALT. 1. START→#current-task. 2. Work+verify. 3. END→#current-task. 4. MERGE GATE→#approve-this (1506441138612080680). 5. END-OF-RUN REPORT→#changelog w/ SHA. 6. BUMP+PUSH GATE→#approve-this.

No semver bump (arc closes at v112.7).

## Locked decisions

| # | Locked |
|---|---|
| D3 (Motion) | MVP: Reduce Motion toggle + motionSafetyRegistry display **grouped by classification** (safe → low → moderate → high risk sections). No edit controls. Animation primitive registry is empty stub; audio reactivity deferred. |

## v112 arc context

- v112.1 (`d5319d8`) — string scrub; Motion spoke placeholder text already updated
- v112.2 (`2823b1f`) — theme export sub-area MVP
- v112.3 (`92c6696`) — Type spoke MVP (pattern reference for this pass)
- **v112.3a (THIS PASS)** — Motion spoke MVP
- v112.4 → v112.7 next per ROADMAP §3

## Lessons banked from v112.3 (apply here)

- **i18n keys for spokes are `inspector.spokes.<id>.*`** (NOT `inspector.<id>.*`). For Motion: `inspector.spokes.motion.*`.
- **Registry entry field names need pre-flight verification.** Don't guess from semantic role; quote the actual TypeScript type.

---

## Pre-flight (verify, report, STOP if diverges)

1. Confirm v112.3 (commit `92c6696`) is on HEAD; `package.json` reads `"version": "0.18.0"`.

2. Quote `src/themes/motionSafetyRegistry.ts` end-to-end. Confirm:
   - The exact entry type shape (field names — likely something like `MotionSafetyEntry`)
   - All registered entries (count + classifications represented)
   - The classification field name (`risk`? `level`? `classification`?) and its possible values (`"safe"`, `"low"`, `"moderate"`, `"high"`? or different naming?)
   - The query API (`getAll()`, `list()`, `getByRisk()`?)

3. Quote `src/control-plane/inspector/spokes/registerMotionSpoke.ts` current state. Should currently use `makePlaceholderTab("motion")` per v112.1.

4. Quote `src/control-plane/inspector/tabs/TypeTab.tsx` (from v112.3) as the pattern reference. MotionTab follows the same registration shape.

5. Identify the **Reduce Motion mechanics**:
   - Find `view_toggleReduceMotion` in `command-registry.entries.ts`. Quote it.
   - Trace where the toggle's state actually lives. Likely paths to check:
     - `settings.store.ts` — is there an `appearance.reduceMotion` or similar setting?
     - `settings.schema.ts` — schema field for reduce-motion?
     - `themeAccessibilityProfile.ts` (per project knowledge) — accessibility profile state?
   - **Quote the canonical read+write API for the reduce-motion state.** This is load-bearing — the toggle must use the same mechanism that `view_toggleReduceMotion` uses, or the two will diverge.

6. Check whether `@media (prefers-reduced-motion: ...)` is referenced anywhere in `src/`. If LumaWeave already respects the OS signal, the toggle UI may need to indicate that ("System preference detected" or similar). If not, the toggle is purely app-state.

7. Check existing `inspector.spokes.motion.*` i18n keys. Per v112.1, `placeholderMessage` exists; confirm what else (if anything) is already there.

8. Identify the CSS location used by TypeTab (v112.3). MotionTab CSS lives in the same convention.

9. Confirm the v89-4 spec (or whichever spec tracks PLACEHOLDER_SPOKES) — `"motion"` should currently be in the list. After this commit, it should be removed (same pattern as v112.3 removed `"type"`).

10. **STOP if any structural claim diverges.** Especially #5 — the reduce-motion state mechanism is the most likely place for subtle assumptions to break.

---

## Files (explicit paths only)

- `src/control-plane/inspector/spokes/registerMotionSpoke.ts` — MODIFIED. Replace `makePlaceholderTab("motion")` with real `MotionTab` component reference. Status `placeholder` → `active`.
- `src/control-plane/inspector/tabs/MotionTab.tsx` — NEW.
- `src/i18n/manifests/en.json` — ADD `inspector.spokes.motion.*` keys for toggle label, classification group labels, optional helper text.
- CSS (same location as TypeTab's CSS) — ADD `.lw-motion-tab*` rules.
- `tests/e2e/inspector-motion-spoke.spec.ts` — NEW. ~5 small tests.
- Spec file containing `PLACEHOLDER_SPOKES` (v89-4 per v112.3 finding) — MODIFIED. Remove `"motion"` from the list.

Nothing else modified.

---

## Step 1 — MotionTab component shape

The MVP UI: a toggle at the top, a classification-grouped list below.

```tsx
function MotionTab() {
  const { t } = useTranslation();
  
  // Reduce motion state — pre-flight identifies the canonical hook/store path
  const reduceMotion = useSettingsStore((s) => s.settings.appearance.reduceMotion);
  // Or wherever it actually lives — use the same path view_toggleReduceMotion uses.
  
  const safetyEntries = useMemo(() => getAllMotionSafetyEntries(), []);
  // Or whatever the registry's actual query API is.
  
  // Group entries by classification
  const grouped = useMemo(() => groupByClassification(safetyEntries), [safetyEntries]);
  // Order: safe → low → moderate → high (least to most risky)
  
  function handleToggle() {
    // Dispatch the same command that view_toggleReduceMotion dispatches.
    // Pre-flight identifies the exact dispatch pattern — could be:
    //   document.dispatchEvent(new CustomEvent("view:toggleReduceMotion"))
    //   or window.dispatchEvent(...)
    //   or directly calling a settings-store action
    // Match whatever the command's execute() function does.
  }
  
  if (safetyEntries.length === 0) {
    return (
      <div className="lw-motion-tab-empty">
        <p>{t("inspector.spokes.motion.placeholderMessage")}</p>
      </div>
    );
  }
  
  return (
    <div className="lw-motion-tab" data-testid="inspector-motion-tab">
      {/* Toggle section */}
      <div className="lw-motion-toggle-section">
        <label className="lw-motion-toggle-label">
          <input
            type="checkbox"
            checked={reduceMotion}
            onChange={handleToggle}
            data-testid="motion-reduce-toggle"
          />
          <span>{t("inspector.spokes.motion.reduceMotionLabel")}</span>
        </label>
        <p className="lw-motion-toggle-hint">
          {t("inspector.spokes.motion.reduceMotionHint")}
        </p>
      </div>
      
      {/* Classification-grouped safety reference */}
      <div className="lw-motion-safety-section">
        <h3 className="lw-motion-section-header">
          {t("inspector.spokes.motion.safetyReferenceHeader")}
        </h3>
        {(["safe", "low", "moderate", "high"] as const).map((classification) => {
          const entries = grouped[classification] ?? [];
          if (entries.length === 0) return null;
          return (
            <MotionSafetyGroup
              key={classification}
              classification={classification}
              entries={entries}
            />
          );
        })}
      </div>
    </div>
  );
}

function MotionSafetyGroup({
  classification,
  entries,
}: {
  classification: "safe" | "low" | "moderate" | "high";
  entries: MotionSafetyEntry[];
}) {
  const { t } = useTranslation();
  return (
    <div
      className={`lw-motion-safety-group lw-motion-safety-${classification}`}
      data-testid={`motion-safety-group-${classification}`}
    >
      <h4 className="lw-motion-group-label">
        {t(`inspector.spokes.motion.classification.${classification}`)}
      </h4>
      <ul className="lw-motion-group-list">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="lw-motion-entry"
            data-testid={`motion-entry-${entry.id}`}
          >
            <span className="lw-motion-entry-name">{entry.name ?? entry.id}</span>
            {entry.description && (
              <span className="lw-motion-entry-description">{entry.description}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

**Important:** the exact field names (`name`, `description`, `id`, `risk`/`level`/`classification`) **must be confirmed via pre-flight**. If `MotionSafetyEntry` uses different names (e.g., `label` instead of `name`), use the actual names. Don't fabricate field names — the Type spoke lesson applies.

**Classification value mapping** is also pre-flight-verified. If the registry uses `"low-risk"`/`"moderate-risk"`/`"high-risk"` (hyphenated) or different terminology, the component's hard-coded `["safe", "low", "moderate", "high"]` array must match.

---

## Step 2 — Toggle wiring

The toggle uses **exactly the same mechanism** as `view_toggleReduceMotion`. Three possible patterns (pre-flight identifies which):

**Pattern A — direct store action:**
```typescript
function handleToggle() {
  useSettingsStore.getState().setSetting("appearance.reduceMotion", !reduceMotion);
}
```

**Pattern B — event dispatch:**
```typescript
function handleToggle() {
  window.dispatchEvent(new CustomEvent("view:toggleReduceMotion"));
}
```

**Pattern C — command registry invocation:**
```typescript
import { commandRegistry } from "...";

function handleToggle() {
  commandRegistry.execute("view_toggleReduceMotion");
}
```

**Match whatever `view_toggleReduceMotion`'s `execute()` function does.** The two surfaces (command palette invocation + spoke toggle) must converge on the same state mutation, or they'll silently drift apart.

---

## Step 3 — i18n keys

Add to `src/i18n/manifests/en.json` under `inspector.spokes.motion` (this object already exists per v112.1 — extend it):

```json
"inspector": {
  "spokes": {
    "motion": {
      "placeholderMessage": "Animation and motion controls are in development.",
      "reduceMotionLabel": "Reduce Motion",
      "reduceMotionHint": "Limits non-essential animations and transitions.",
      "safetyReferenceHeader": "Effect Safety Reference",
      "classification": {
        "safe": "Safe",
        "low": "Low Risk",
        "moderate": "Moderate Risk",
        "high": "High Risk"
      }
    }
  }
}
```

If the classification values in the registry differ (e.g., the registry uses `"none"` instead of `"safe"`), update the classification key names to match — the i18n keys mirror the registry values.

---

## Step 4 — CSS

Match TypeTab's CSS convention. Likely rules:

```css
.lw-motion-tab {
  display: flex;
  flex-direction: column;
  gap: var(--lw-spacing-md);
}

.lw-motion-toggle-section {
  /* Toggle area: label + hint, padded card-like */
  padding: var(--lw-spacing-sm);
  border-radius: var(--lw-radius-sm);
  background: var(--lw-surface-2);
}

.lw-motion-toggle-label {
  display: flex;
  align-items: center;
  gap: var(--lw-spacing-xs);
  cursor: pointer;
}

.lw-motion-toggle-hint {
  margin-block-start: var(--lw-spacing-xs);
  font-size: var(--lw-font-size-sm);
  color: var(--lw-text-secondary);
}

.lw-motion-safety-section {
  /* spacing from toggle section above */
}

.lw-motion-section-header {
  font-size: var(--lw-font-size-md);
  margin-block-end: var(--lw-spacing-sm);
}

.lw-motion-safety-group {
  margin-block-end: var(--lw-spacing-md);
}

.lw-motion-group-label {
  font-size: var(--lw-font-size-sm);
  /* subtle visual marker per classification — use a small colored dot or border */
}

/* Per-classification color hints (subtle — let the data lead, not the decoration) */
.lw-motion-safety-safe .lw-motion-group-label::before {
  /* a subtle green indicator */
}
.lw-motion-safety-low .lw-motion-group-label::before {
  /* a subtle yellow indicator */
}
.lw-motion-safety-moderate .lw-motion-group-label::before {
  /* a subtle orange indicator */
}
.lw-motion-safety-high .lw-motion-group-label::before {
  /* a subtle red indicator */
}

.lw-motion-group-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.lw-motion-entry {
  padding-block: var(--lw-spacing-xs);
}

.lw-motion-entry-name {
  font-weight: 500;
}

.lw-motion-entry-description {
  display: block;
  font-size: var(--lw-font-size-sm);
  color: var(--lw-text-secondary);
}
```

**Match the existing `--lw-*` token names** from TypeTab CSS or wherever the canonical token list is. Don't hardcode values.

**The classification color indicators are intentionally subtle** — a small dot or left border, not a full background fill. The data hierarchy should lead; color is a secondary signal.

---

## Step 5 — E2E spec

```typescript
import { test, expect } from "@playwright/test";

test.describe("Inspector Motion spoke", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Open inspector + activate Motion spoke (mirror v112.3's pattern)
    await page.getByTestId("inspector-spoke-motion").click();
  });

  test("Motion tab renders toggle + safety reference", async ({ page }) => {
    await expect(page.getByTestId("inspector-motion-tab")).toBeVisible();
    await expect(page.getByTestId("motion-reduce-toggle")).toBeVisible();
    await expect(page.getByText("Effect Safety Reference")).toBeVisible();
  });

  test("Reduce Motion toggle reflects settings state", async ({ page }) => {
    const toggle = page.getByTestId("motion-reduce-toggle");
    // Get current state from settings store
    const initialState = await page.evaluate(() => {
      return window.__lwStore.getState().settings.appearance.reduceMotion;
      // Adjust path per pre-flight findings on actual setting location
    });
    
    if (initialState) {
      await expect(toggle).toBeChecked();
    } else {
      await expect(toggle).not.toBeChecked();
    }
  });

  test("Toggling Reduce Motion updates settings state", async ({ page }) => {
    const toggle = page.getByTestId("motion-reduce-toggle");
    const initialState = await page.evaluate(() =>
      window.__lwStore.getState().settings.appearance.reduceMotion
    );
    
    await toggle.click();
    
    await page.waitForFunction((before) => {
      return window.__lwStore.getState().settings.appearance.reduceMotion !== before;
    }, initialState, { timeout: 2000 });
    
    const newState = await page.evaluate(() =>
      window.__lwStore.getState().settings.appearance.reduceMotion
    );
    expect(newState).toBe(!initialState);
  });

  test("Safety reference shows classification groups", async ({ page }) => {
    // At least the groups that have entries should render
    // Some classifications may have zero entries — those won't appear
    const visibleGroups = await page.locator('[data-testid^="motion-safety-group-"]').count();
    expect(visibleGroups).toBeGreaterThan(0);
  });

  test("Placeholder message is no longer visible (real content renders)", async ({ page }) => {
    await expect(
      page.getByText("Animation and motion controls are in development.")
    ).not.toBeVisible();
  });
});
```

The toggle-state-mutation test (#3) is the load-bearing one — it verifies the spoke toggle truly converges on the same state as `view_toggleReduceMotion`.

---

## Step 6 — Remove "motion" from v89-4 spec PLACEHOLDER_SPOKES

Per v112.3's lesson, the `PLACEHOLDER_SPOKES` list in (likely) `tests/e2e/v89-4-*.spec.ts` (or wherever it lives — pre-flight identifies) needs `"motion"` removed.

This is the same pattern v112.3 used for removing `"type"`. After this commit, the list should contain only `"layout"` (and possibly `"code"` if Code spoke is still in placeholder state — though per v112.0 report Code is active).

---

## Step 7 — Verify

```bash
npm run typecheck
npm run lint:css
npx playwright test tests/e2e/inspector-motion-spoke.spec.ts --reporter=line
# Also re-run the v89-4 spec to confirm placeholder list update doesn't regress:
npx playwright test tests/e2e/<v89-4-spec-name>.spec.ts --reporter=line
```

Expected:
- typecheck → 0
- lint:css → 0/0
- inspector-motion-spoke.spec.ts → 5/5 pass
- v89-4 placeholder spec → pass with updated list

**Manual smoke (Ryan, `npm run tauri dev`):**
1. Open radial inspector. Click Motion spoke (formerly stubbed).
2. Confirm Reduce Motion toggle appears at the top with hint text below it.
3. Confirm Effect Safety Reference section below with classification groups (Safe / Low / Moderate / High where each has entries).
4. Toggle Reduce Motion off → on. Open command palette, run "Toggle Reduce Motion" — confirm the spoke toggle reflects the change. Confirm the reverse: toggling from the command palette updates the spoke toggle visually.
5. No "Animation and motion controls are in development." message appears.

---

## Commit

MERGE GATE → commit (explicit paths only):
`feat(v112.3a): inspector Motion spoke MVP — Reduce Motion toggle + safety reference grouped by classification`

END-OF-RUN REPORT to #changelog with SHA + bump+push gate.

---

## END-OF-RUN REPORT (required content)

- Pre-flight findings: motionSafetyRegistry entry shape, classification value naming, toggle state location + mechanism, i18n existing keys
- The MotionTab component path and shape used
- Toggle wiring pattern (A/B/C from Step 2 — which was the actual)
- 4-5 new i18n keys added (under `inspector.spokes.motion.*`)
- typecheck + lint:css confirmation
- 5 E2E test results + v89-4 spec re-run result
- Manual smoke confirmation
- Any deviations (e.g., classification values differed from `safe/low/moderate/high`; OS preference detection considered)

---

## Hard stops

- **Only the named files are modified.** No other spoke files, no registry changes.
- **No edit controls beyond the toggle.** This is read-only data + one toggle. Animation primitive picker, audio reactivity controls all wait.
- **Toggle must converge with `view_toggleReduceMotion`.** Pre-flight identifies the canonical mechanism; use it. If the two mechanisms diverge, state splits silently — that's the worst kind of bug.
- **Classification group order is fixed: safe → low → moderate → high.** Least to most risky, top to bottom. Don't reorder.
- **Groups with zero entries don't render.** Empty section headers are noise.
- **No font/animation experimentation in MotionTab CSS.** Static UI; the spoke is for displaying motion state, not demonstrating motion.
- **Match registry field names exactly via pre-flight.** Don't guess — the v112.3 Type spoke lesson directly applies.
- **i18n key path is `inspector.spokes.motion.*`** (per v112.3 lesson).
- **The classification value names in code (`"safe"`, `"low"`, `"moderate"`, `"high"`) must match the actual registry values.** If registry uses different names, adjust the array + i18n keys.
- No new dependencies. No new Rust. No semver bump. No NOW.md / ROADMAP edits.
- Explicit-path git. Discord MCP only.
- Targeted-test-scope only.
