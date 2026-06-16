# Bandit — v112.2: Theme menu Export sub-area MVP

Second implementation pass of the v112 UI-completeness arc. Wires the existing `theme.exportBundle` command (already registered, dispatch event has no listener) to a real download flow. Replaces the Export sub-area's `<StubSubArea />` with a working download button.

All infrastructure already exists: `exportGlobalThemeOverrideBundle()` produces the JSON shape; `themeOverrideStorage.loadOverrides()` provides the data; `settings.appearance.theme` provides the active theme id for the filename. The missing pieces are the dispatch listener (in AppShell) and the sub-area UI (in CategoryTheme).

Basis: `~/Projects/lumaweave/docs/SHIP_READINESS_ROADMAP.md` §3 (v112) + `docs/workflows/v112_0_ui_completeness_report.md` §4 (Export sub-area) + Ryan-locked decisions on Q1-Q4.

Generic rules: `~/Projects/CLAUDE.md`; project: `~/Projects/lumaweave/CLAUDE.md`; Discord/gates: `~/Projects/DISCORD_PROTOCOL.md`.

## ⏩ BANDIT PASS PREFACE
0. Discord MCP else HALT. 1. START→#current-task. 2. Work+verify. 3. END→#current-task. 4. MERGE GATE→#approve-this (1506441138612080680). 5. END-OF-RUN REPORT→#changelog w/ SHA. 6. BUMP+PUSH GATE→#approve-this.

No semver bump (arc closes at v112.7).

## Locked decisions (Ryan-confirmed)

| # | Locked |
|---|---|
| Q1 | Export format: **JSON only** (no CSS variant) |
| Q2 | Filename: **`lumaweave-overrides-{themeId}-{timestamp}.json`** with ISO 8601 compact timestamp (`20260610T172300Z` shape) |
| Q3 | Scope: **Global overrides only** (Option C) — ships `exportGlobalThemeOverrideBundle()` output as-is; UI hint explains the global-only scope; multi-scope export deferred to a post-Cerebra arc |
| Q4 | Empty state: **Disabled button + tooltip** `"Apply some overrides first."` |

Targeted-test-scope + CI fast-jobs only.

---

## Pre-flight (verify, report, STOP if diverges)

1. Confirm v112.1 (commit `d5319d8`) is on HEAD; `package.json` reads `"version": "0.18.0"`.

2. Quote `exportGlobalThemeOverrideBundle()` from `src/themes/themeOverrideStorage.ts`. Confirm:
   - Return type is `ThemeOverrideBundle` per the v112.0 report finding
   - The function works without throwing on empty override sets (returns a bundle with empty `overrides` array, or returns `null`, or behavior TBD — report exact behavior)

3. Quote the `theme.exportBundle` command registration from `src/control-plane/commands/command-registry.entries.ts` (line ~137 per v112.0 report). Confirm the dispatch event string is exactly `"theme:exportBundle"`.

4. Grep `src/` for `"theme:exportBundle"` listeners. Per the v112.0 report, none should exist. Confirm.

5. Identify where AppShell handles other command-dispatch events. The new handler must follow the existing pattern. Quote one existing `dispatch(...)` listener pattern from `AppShell.tsx` so the new one matches.

6. Quote the current `CategoryTheme.tsx` structure for sub-area rendering. Specifically:
   - How the active sub-area is selected (state variable, dispatch, etc.)
   - How `<StubSubArea />` is currently rendered for the `export` case
   - The `SUB_AREAS` array (lines ~12-18 per v112.0 report) — confirm the `export` entry has `live: false`

7. Confirm `settings.appearance.theme` is the active theme id path. Quote the type if available (`ThemeId` union).

8. Identify the i18n strings that will be needed:
   - Button label (e.g. `theme.export.downloadButton`)
   - Empty-state tooltip (e.g. `theme.export.emptyTooltip`)
   - Scope-limitation hint (e.g. `theme.export.scopeHint`)
   - Sub-area header / description if any
   
   Report whether any of these keys already exist in `en.json`. If not, the new keys go under `theme.export.*` in `en.json`.

9. **STOP if anything diverges from the v112.0 report's findings.**

---

## Files (explicit paths only)

- `src/app/AppShell.tsx` — add the `theme:exportBundle` event listener
- `src/control-plane/settings/categories/CategoryTheme.tsx` — replace `<StubSubArea label="Export" />` with `<ExportSubArea />`; add the `ExportSubArea` component (likely co-located); flip `export` entry in `SUB_AREAS` to `live: true`
- `src/i18n/manifests/en.json` — add `theme.export.*` i18n keys for button label, tooltip, and scope hint
- `tests/e2e/theme-export.spec.ts` — NEW. 3-4 small E2E tests verifying button states + filename pattern

Nothing else modified.

---

## Step 1 — AppShell event handler

Add a `useEffect` (or equivalent pattern matching the existing dispatch listener convention) in `AppShell.tsx` that listens for `"theme:exportBundle"`:

```typescript
useEffect(() => {
  function handleExportBundle() {
    // Get the bundle from the existing exporter
    const bundle = exportGlobalThemeOverrideBundle();
    
    // Per Q4, this listener fires only when the user clicks an enabled button —
    // the button is disabled when there are no overrides, so the bundle should
    // have non-empty overrides. But guard anyway:
    if (!bundle || bundle.overrides.length === 0) {
      // No overrides to export — silent no-op or a warning toast.
      // Recommend: silent. The button shouldn't have been clickable.
      console.warn("[theme] exportBundle called with no overrides");
      return;
    }
    
    // Compose filename: lumaweave-overrides-{themeId}-{timestamp}.json
    const themeId = useSettingsStore.getState().settings.appearance.theme;
    const timestamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    // Yields e.g. "20260610T172300Z" — 16 chars, filesystem-safe, lexicographically sortable
    const filename = `lumaweave-overrides-${themeId}-${timestamp}.json`;
    
    // Trigger browser download
    const json = JSON.stringify(bundle, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
  
  document.addEventListener("theme:exportBundle", handleExportBundle);
  return () => document.removeEventListener("theme:exportBundle", handleExportBundle);
}, []);
```

**Pre-flight verifies the existing dispatch pattern** — if AppShell uses a custom event bus (not `document.addEventListener`), adapt accordingly. Match the existing convention.

**Imports needed:**
- `exportGlobalThemeOverrideBundle` from `themeOverrideStorage`
- `useSettingsStore` (likely already imported in AppShell)

---

## Step 2 — ExportSubArea component in CategoryTheme.tsx

Add the component near the other sub-area components (Browse, Active). Co-located is fine; this isn't a separate file unless CategoryTheme is already large enough to warrant splitting.

```tsx
function ExportSubArea() {
  const { t } = useTranslation();
  const overrides = useThemeOverrideStore((s) => s.overrides);  // or however the store exposes it
  const hasOverrides = overrides.length > 0;
  
  function handleClick() {
    document.dispatchEvent(new CustomEvent("theme:exportBundle"));
  }
  
  return (
    <div className="theme-export">
      <p className="theme-export-hint">{t("theme.export.scopeHint")}</p>
      <button
        type="button"
        data-testid="theme-export-button"
        onClick={handleClick}
        disabled={!hasOverrides}
        title={!hasOverrides ? t("theme.export.emptyTooltip") : undefined}
        className="theme-export-button"
      >
        {t("theme.export.downloadButton")}
      </button>
    </div>
  );
}
```

**Pre-flight confirms** how the override list is read in CategoryTheme. If a hook exists, use it. If `themeOverrideStorage.loadOverrides()` is the only way, call it inside an effect to populate local state — but a reactive subscription is preferred so the button enables/disables in real time as users add/remove overrides.

**Replace the existing render:**

```tsx
// BEFORE
{subArea === "export" && <StubSubArea label="Export" />}

// AFTER
{subArea === "export" && <ExportSubArea />}
```

**Flip the SUB_AREAS entry:**

```tsx
// In SUB_AREAS at the top of the file:
{ id: 'export', label: 'Export', live: true },  // was live: false
```

---

## Step 3 — i18n keys

Add to `src/i18n/manifests/en.json` under `theme.export` (create the parent object if it doesn't exist):

```json
"theme": {
  "...": "(existing keys preserved)",
  "export": {
    "downloadButton": "Download override bundle",
    "emptyTooltip": "Apply some overrides first.",
    "scopeHint": "Exports your global theme overrides. Target-specific customizations are not yet included."
  }
}
```

**Important:** if the `theme` object doesn't exist yet (overrides are under `inspector` or elsewhere), place the new `theme.export.*` keys in whichever object hierarchy matches the existing convention. Pre-flight reports the actual structure.

---

## Step 4 — CSS for ExportSubArea (if needed)

Check the existing CategoryTheme CSS (likely co-located in a `.css` file or inline). Add styling for `.theme-export`, `.theme-export-hint`, `.theme-export-button` to match the existing sub-area visual language (Browse and Active provide the reference).

If styling already cascades from parent classes, no new CSS needed. Pre-flight confirms.

---

## Step 5 — E2E spec

Create `tests/e2e/theme-export.spec.ts` with 3-4 tests. Use existing E2E patterns from the v112-touched specs for fixture loading.

```typescript
import { test, expect } from "@playwright/test";

test.describe("Theme Export sub-area", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Navigate to Settings > Theme > Export
    // (Use existing helpers for opening settings if available; otherwise click through)
    // ...
  });

  test("export button is disabled when no overrides exist", async ({ page }) => {
    const button = page.getByTestId("theme-export-button");
    await expect(button).toBeVisible();
    await expect(button).toBeDisabled();
    await expect(button).toHaveAttribute("title", "Apply some overrides first.");
  });

  test("export button enables after applying an override", async ({ page }) => {
    // Apply a single override programmatically via the store
    await page.evaluate(() => {
      // Use __lwStore or the equivalent global to apply a global override
      // e.g. window.__lwStore.getState().applyGlobalOverride("app.background", "#ff0000");
      // Exact API depends on the store shape — pre-flight identifies the correct call
    });
    
    const button = page.getByTestId("theme-export-button");
    await expect(button).toBeEnabled({ timeout: 2000 });
  });

  test("clicking export triggers a download", async ({ page }) => {
    // Apply an override first
    await page.evaluate(() => { /* same as above */ });
    
    // Listen for download
    const downloadPromise = page.waitForEvent("download");
    await page.getByTestId("theme-export-button").click();
    const download = await downloadPromise;
    
    // Verify filename pattern
    expect(download.suggestedFilename()).toMatch(
      /^lumaweave-overrides-[a-z-]+-\d{8}T\d{6}Z\.json$/
    );
  });

  test("scope hint is visible", async ({ page }) => {
    await expect(
      page.getByText("Exports your global theme overrides")
    ).toBeVisible();
  });
});
```

The `applyGlobalOverride` mechanism in test #2 and #3 depends on what `themeOverrideStorage` actually exposes for test-side mutation. Pre-flight identifies the right hook. If none exists clean, the test can navigate UI to apply an override naturally (slower but always works).

---

## Step 6 — Verify

```bash
npm run typecheck
npm run lint:css
npx playwright test tests/e2e/theme-export.spec.ts --reporter=line
```

Expected:
- typecheck → 0 errors
- lint:css → 0/0
- theme-export.spec.ts → 4/4 pass

**Manual smoke (Ryan, `npm run tauri dev`):**
1. Open Settings → Theme → Export sub-area.
2. With no overrides applied: button is disabled, tooltip says "Apply some overrides first.", scope hint visible.
3. Apply an override (e.g. via Inspector or Browse → Active → tweak something).
4. Return to Export: button enabled.
5. Click button: a file downloads to your Downloads folder. Filename matches `lumaweave-overrides-{themeId}-{timestamp}.json`.
6. Open the file: valid JSON, contains the override you applied.

---

## Commit

MERGE GATE → commit (explicit paths only — the 4 files):
`feat(v112.2): theme export sub-area MVP — global overrides as JSON download`

END-OF-RUN REPORT to #changelog with SHA + bump+push gate.

---

## END-OF-RUN REPORT (required content)

- Pre-flight findings (existing function shape, dispatch convention, sub-area structure confirmed)
- AppShell event listener pattern used (matches existing convention or new)
- The 4 i18n keys added (with their final wording)
- typecheck + lint:css confirmation
- 4 E2E test results
- Manual smoke confirmation (6 steps above)
- Any deviations or surprises during implementation

---

## Hard stops

- **Only the 4 named files are modified.** No other source touched.
- **No changes to `themeOverrideStorage.ts`** — the existing `exportGlobalThemeOverrideBundle()` is used as-is. Multi-scope export is explicitly deferred per Q3.
- **No changes to `command-registry.entries.ts`** — the existing registration is correct; only the listener is missing.
- **Use the existing dispatch convention.** If AppShell uses a custom event bus, match it. Don't invent a new one.
- **Filename format is exact.** ISO 8601 compact (no separators in date/time; trailing Z). Match the example: `lumaweave-overrides-obsidian-aurora-20260610T172300Z.json`.
- **Empty state is disabled button + tooltip.** Don't hide the button. Don't show an error on click.
- **Scope hint text is exact.** "Exports your global theme overrides. Target-specific customizations are not yet included." — copy verbatim. Don't paraphrase.
- **The reactive override check** (button enabled/disabled) should use whatever subscription mechanism the existing store exposes — don't poll, don't use a setInterval.
- No new dependencies. No new Rust. No semver bump. No NOW.md / ROADMAP edits.
- Explicit-path git. Discord MCP only.
- Targeted-test-scope only.
