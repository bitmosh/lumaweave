# Bandit — v110: real-source bugs + identity + ErrorBoundary

First arc of the ship-readiness home stretch. Three commits, merge gates between each.

Basis: `~/Projects/lumaweave/docs/SHIP_READINESS_ROADMAP.md` §3 (v110) + `docs/workflows/v110_0_real_source_identity_boundary_report.md` v1.0 + Ryan's locked decisions on §6.

Generic rules: `~/Projects/CLAUDE.md`; project: `~/Projects/lumaweave/CLAUDE.md`; Discord/gates: `~/Projects/DISCORD_PROTOCOL.md`.

## ⏩ BANDIT PASS PREFACE (each commit)
0. Discord MCP else HALT. 1. START→#current-task. 2. Work+verify. 3. END→#current-task. 4. MERGE GATE→#approve-this (1506441138612080680). 5. END-OF-RUN REPORT→#changelog w/ SHA. 6. BUMP+PUSH GATE→#approve-this.

**Only v110.3 (arc close) bumps semver** (0.16.0 → 0.17.0).

## Locked decisions (Ryan-confirmed)

| # | Locked |
|---|---|
| 1 | ErrorBoundary scope: **Option C** — root-only at AppShell, per-subsystem deferred post-v1.0 |
| 2 | Recovery UI actions: Reload + Reset Settings + Copy error details |
| 3 | Recovery UI visual: deliberately stark (dark background #060b14, amber accent, sans-serif) |
| 4 | Identity rename: `productName` + `title` + **`identifier`** all promoted to Must (one commit, Phase 1) + TS Starmap* renames (Phase 2 same commit) |
| 5 | Cargo.toml: no action needed (already `LumaWeave`) |
| 6 | Bug 2 fix: **Option B** — unified `graph-viewport` testid everywhere |
| 7 | Sub-pass shape: **three commits** (hygiene cluster / real-source bugs / arc close) — revised from report's six-pass split based on actual blast-radius assessment |

Targeted-test-scope + CI fast-jobs only (typecheck + lint:css always; cargo check if Rust touched; E2E only on directly affected specs).

---

## Commit 1 — `chore(v110.1): hygiene cluster — identity rename + ErrorBoundary + StatusCluster cleanup`

Three independent hygiene items bundled. All are additive or mechanical; none depend on the others. Bundling because the blast radius is small per item and the verification surface is identical for all three.

### Pre-flight (verify, report, STOP if diverges)
1. Confirm v109.5.1 (commit `49deb76` per recent history) is on HEAD; `package.json` reads `"version": "0.16.0"`.
2. Confirm `src-tauri/tauri.conf.json` has the three current "starmap" identity fields per report §1.6.
3. Confirm `src/control-plane/topbar/StatusCluster.tsx:13-16` still hardcodes "settling".
4. Confirm `src/control-plane/controlSurfaceContract.registry.ts:672` references the StatusCluster layout placeholder. Quote.
5. Confirm zero `ErrorBoundary` usage in `src/` (grep `ErrorBoundary`, `error-boundary`, `error.boundary`).
6. Confirm exact file paths for the TS Starmap* renames per report §3.1:
   - `src/control-plane/settings/settings.schema.ts:79` (`StarmapSettings`)
   - `src/control-plane/settings/settings.defaults.ts:1,23`
   - `src/control-plane/settings/settings.migrations.ts` (~20 lines)
   - `src/control-plane/settings/settings.store.ts:4,9,28,34`
   - `src/control-plane/panels/panel.types.ts:3` (`StarmapPanel`)
7. Identify where AppShell's root render is — the React tree root where the ErrorBoundary wraps. Quote the structure.

### Files (explicit paths only)

**Identity rename:**
- `src-tauri/tauri.conf.json` — three field updates
- `src/control-plane/settings/settings.schema.ts` — `StarmapSettings` → `LumaWeaveSettings`
- `src/control-plane/settings/settings.defaults.ts` — follow rename
- `src/control-plane/settings/settings.migrations.ts` — follow rename
- `src/control-plane/settings/settings.store.ts` — follow rename
- `src/control-plane/panels/panel.types.ts` — `StarmapPanel` → `LumaWeavePanel`

**ErrorBoundary:**
- `src/app/ErrorBoundary.tsx` — NEW, the root boundary component + recovery UI
- `src/app/ErrorBoundary.css` — NEW, stark dark recovery UI styling (or co-located CSS-in-JS if that matches existing patterns; confirm)
- `src/app/AppShell.tsx` — wrap the root render in `<ErrorBoundary>`

**StatusCluster cleanup:**
- `src/control-plane/topbar/StatusCluster.tsx` — remove `useLayoutState` hook + remove the "layout: settling" render span
- `src/control-plane/controlSurfaceContract.registry.ts` — remove the line 672 placeholder entry (Ryan's amendment to v110.6 — including here to keep registry honest)

### Identity rename implementation

**tauri.conf.json (3 fields):**

```json
{
  "productName": "lumaweave",
  "identifier": "com.boop.lumaweave",
  "app": {
    "windows": [{
      "title": "LumaWeave",
      ...
    }]
  }
}
```

Note casing: `productName` is lowercase `"lumaweave"` (executable/bundle naming convention); `title` is title-case `"LumaWeave"` (user-visible window title).

**TypeScript renames (5 files):** mechanical. Every `StarmapSettings` → `LumaWeaveSettings`. Every `StarmapPanel` → `LumaWeavePanel`. Use IDE/tooling for rename-safety; verify via `npm run typecheck` after.

### ErrorBoundary implementation

```tsx
// src/app/ErrorBoundary.tsx

import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null, errorInfo: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    // Best-effort error logging; do not throw from this method
    console.error("[LumaWeave] Uncaught error in React tree:", error, errorInfo);
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  private handleResetSettings = (): void => {
    // Guard with try/catch — if the store itself is the cause of the crash,
    // we don't want resetSettings to throw inside the boundary.
    try {
      // Confirm exact store reset API in pre-flight; likely:
      // useSettingsStore.getState().resetToDefaults?.()
      //   OR
      // localStorage.removeItem('lumaweave-settings')
      // Whatever the canonical reset is, use it. If unsure, prefer localStorage.clear()
      // scoped to the settings key, then reload.
      localStorage.removeItem("lumaweave-settings");  // confirm key in pre-flight
    } catch (err) {
      console.error("[LumaWeave] Reset failed:", err);
    }
    window.location.reload();
  };

  private handleCopyError = async (): Promise<void> => {
    const { error, errorInfo } = this.state;
    const text = [
      error?.message ?? "Unknown error",
      "",
      error?.stack ?? "(no stack trace)",
      "",
      errorInfo?.componentStack ?? "(no component stack)",
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("[LumaWeave] Copy to clipboard failed:", err);
    }
  };

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="lw-error-boundary" data-testid="error-boundary-recovery">
        <div className="lw-error-boundary-card">
          <div className="lw-error-boundary-icon" aria-hidden>⚠</div>
          <h1 className="lw-error-boundary-title">Something went wrong</h1>
          <p className="lw-error-boundary-body">
            LumaWeave encountered an unexpected error.
          </p>
          <div className="lw-error-boundary-actions">
            <button
              type="button"
              data-testid="error-boundary-reload"
              onClick={this.handleReload}
              className="lw-error-boundary-button lw-error-boundary-button-primary"
            >
              Reload App
            </button>
            <button
              type="button"
              data-testid="error-boundary-reset"
              onClick={this.handleResetSettings}
              className="lw-error-boundary-button"
            >
              Reset Settings
            </button>
            <button
              type="button"
              data-testid="error-boundary-copy"
              onClick={this.handleCopyError}
              className="lw-error-boundary-button-text"
            >
              Copy error details
            </button>
          </div>
        </div>
      </div>
    );
  }
}
```

**Recovery UI CSS (stark, deliberately off-brand):**

```css
/* src/app/ErrorBoundary.css */

.lw-error-boundary {
  position: fixed;
  inset: 0;
  background: #060b14;
  color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  z-index: 999999;
}

.lw-error-boundary-card {
  max-width: 480px;
  padding: 2rem;
  border: 1px solid #2a2f3a;
  border-radius: 8px;
  background: #0a1019;
}

.lw-error-boundary-icon {
  font-size: 2rem;
  color: #f59e0b;
  margin-bottom: 1rem;
}

.lw-error-boundary-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
  color: #f5f5f5;
}

.lw-error-boundary-body {
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0 0 1.5rem;
  color: #a3a8b3;
}

.lw-error-boundary-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.lw-error-boundary-button {
  padding: 0.5rem 1rem;
  background: #1a1f2a;
  border: 1px solid #2a2f3a;
  border-radius: 4px;
  color: #f5f5f5;
  font-size: 0.875rem;
  cursor: pointer;
  font-family: inherit;
}

.lw-error-boundary-button:hover {
  background: #242a36;
}

.lw-error-boundary-button-primary {
  background: #f59e0b;
  color: #060b14;
  border-color: #f59e0b;
  font-weight: 500;
}

.lw-error-boundary-button-primary:hover {
  background: #d97706;
  border-color: #d97706;
}

.lw-error-boundary-button-text {
  background: transparent;
  border: none;
  color: #a3a8b3;
  padding: 0.5rem;
  font-size: 0.8125rem;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
  font-family: inherit;
}

.lw-error-boundary-button-text:hover {
  color: #f5f5f5;
}
```

**Note on CSS logical properties:** if `lint:css` enforces logical properties (per the v109.2.3 sweep), use `inset-block-end` instead of `bottom`, etc. The stylelint config will catch violations. If it errors on `inset: 0` or any logical-vs-physical mismatch, adjust. Verify locally before commit.

**AppShell integration:**

```tsx
// src/app/AppShell.tsx
import { ErrorBoundary } from "./ErrorBoundary";
import "./ErrorBoundary.css";

// At the outermost render:
return (
  <ErrorBoundary>
    {/* existing AppShell content */}
  </ErrorBoundary>
);
```

Wrap whatever the existing top-level return is. Don't restructure other AppShell logic.

### StatusCluster cleanup

```tsx
// src/control-plane/topbar/StatusCluster.tsx

// REMOVE:
// function useLayoutState(): string {
//   return "settling";
// }

// REMOVE from render JSX: whatever span displays the "layout: settling" indicator.
// The node count and FPS remain.
```

And remove the corresponding entry in `controlSurfaceContract.registry.ts:672` — the line referencing the StatusCluster layout placeholder. Quote it in pre-flight; remove it cleanly.

### Verify (targeted scope)

```bash
npm run typecheck          # 0 errors
npm run lint:css           # 0/0 (post-v109.2.3 baseline holds; new ErrorBoundary.css passes too)
cd src-tauri && cargo check  # 0 errors (tauri.conf.json change)
cd ..
```

**Manual smoke (Ryan, `npm run tauri dev`):**
1. App launches. **Window title shows "LumaWeave"** (not "starmap"). Dock/taskbar shows "lumaweave" (or system equivalent).
2. App loads normally. Self-graph renders. No console errors related to the rename.
3. Open the topbar — the "settling" status string is GONE. Node count + FPS remain.
4. **Test the ErrorBoundary** by deliberately throwing an error somewhere temporary (or via devtools console: e.g., open the radial inspector and trigger a known crash path if you have one). Confirm:
   - The recovery UI appears with the stark dark-amber styling
   - "Reload App" button works
   - "Reset Settings" button works (and clears settings on next load)
   - "Copy error details" copies the stack trace to clipboard (paste into a notepad to verify)

If you don't have a deliberate crash path handy, the boundary will get exercised naturally over the next several sessions. Verify the visual layout at minimum by temporarily editing the boundary to render the error UI unconditionally, snapshot it, revert. Or skip the visual test for now and trust the implementation; v110.2's E2E re-enables will exercise some adjacent surfaces.

### Commit

MERGE GATE → commit (explicit paths only — list above): `chore(v110.1): hygiene cluster — identity rename (LumaWeave), ErrorBoundary at AppShell root, StatusCluster cleanup`
END-OF-RUN REPORT to #changelog + bump+push gate.

### Hard stops
- No semver bump.
- No new dependencies.
- ErrorBoundary scope is **root only** — do not add per-subsystem boundaries even if tempted.
- Identity rename uses lowercase `productName` ("lumaweave") and title-case `title` ("LumaWeave"). Verify both casings.
- Don't restructure AppShell.tsx beyond wrapping in `<ErrorBoundary>`.
- Don't rename anything that's outside the report §3.1 must/should list (no `docs/` rewrites in this commit).
- If the settings store doesn't have a clean `resetToDefaults` API, use `localStorage.removeItem` scoped to the settings key. Don't invent a new store API.

---

## Commit 2 — `fix(v110.2): real-source mode bugs — panel overflow + unified graph-viewport testid`

Both bug fixes touch `ThemeTargetInspectorOverlay.tsx`. The skipped E2E tests get re-enabled. Combined into one commit because they share the same file and the verification surface (re-enabled E2E covering both) is naturally combined.

### Pre-flight (verify, report, STOP if diverges)
1. Confirm Commit 1 (v110.1) is on HEAD.
2. Confirm `src/themes/ThemeTargetInspectorOverlay.tsx:42` still reads:
   ```ts
   const GRAPH_VIEWPORT_SELECTOR = "[data-testid='self-graph-fixture-loaded']";
   ```
3. Confirm `src/app/AppShell.tsx:394` reads:
   ```tsx
   data-testid={useFixture ? "self-graph-fixture-loaded" : "graph-viewport"}
   ```
4. Confirm `src/themes/themeTargetHeuristics.ts:1` already uses `"[data-testid='graph-viewport']"` (the canonical value).
5. Confirm `tests/e2e/theme-target-inspector.spec.ts:184` and `:698` are the two currently-skipped tests for the panel-overflow and selector-exclusion bugs.
6. Confirm the 10 test references to `self-graph-fixture-loaded` per report §4.2 across 5 files:
   - `tests/e2e/app-smoke.spec.ts:7`
   - `tests/e2e/self-graph.spec.ts:9, 20, 29, 40`
   - `tests/e2e/command-deck.spec.ts:44`
   - `tests/e2e/ide-integration.spec.ts:6, 16`
   - `tests/e2e/graph-visual-inventory.spec.ts:123, 164`
7. Confirm files with OR selectors (no change needed): `tests/e2e/i18n.spec.ts:160`, `tests/e2e/command-palette.spec.ts:139`, `tests/e2e/selector-pattern-diagnostic.spec.ts:14`.

### Files (explicit paths only)

- `src/themes/ThemeTargetInspectorOverlay.tsx` — change the hardcoded constant + fix the panel overflow layout math (per §1.3 in the report, lines 149-184 / 692-694 fallback)
- `src/app/AppShell.tsx:394` — remove the conditional, always render `data-testid="graph-viewport"`
- `tests/e2e/app-smoke.spec.ts` — `self-graph-fixture-loaded` → `graph-viewport` (1 occurrence)
- `tests/e2e/self-graph.spec.ts` — same (4 occurrences)
- `tests/e2e/command-deck.spec.ts` — same (1 occurrence)
- `tests/e2e/ide-integration.spec.ts` — same (2 occurrences)
- `tests/e2e/graph-visual-inventory.spec.ts` — same (2 occurrences)
- `tests/e2e/theme-target-inspector.spec.ts` — remove `.skip` from line 184 and line 698 tests; verify they pass after the fix

### Implementation

**Bug 2 fix (unified testid):**

In `ThemeTargetInspectorOverlay.tsx:42`:
```ts
// BEFORE
const GRAPH_VIEWPORT_SELECTOR = "[data-testid='self-graph-fixture-loaded']";

// AFTER
const GRAPH_VIEWPORT_SELECTOR = "[data-testid='graph-viewport']";
```

`SIGMA_ELEMENT_SELECTOR` at line 43 inherits the fix automatically.

In `AppShell.tsx:394`:
```tsx
// BEFORE
data-testid={useFixture ? "self-graph-fixture-loaded" : "graph-viewport"}

// AFTER
data-testid="graph-viewport"
```

**Bug 1 fix (panel overflow):**

The fix depends on what the actual layout math currently does and what the correct math should be. Pre-flight should surface the current implementation; the report says lines 149-184 compute `graphViewportOffsets` and lines 692-694 fall back to fixed `bottom: "4.5rem"; right: "1rem"`.

After bug 2 is fixed, `graphViewportElement` will be found in real-source mode too — so the existing offset-computation code (lines 160-195) starts running in real-source mode. The question is whether that code produces correct offsets in real-source mode, or whether the math itself was tuned only for fixture-mode viewport dimensions.

**Recommended approach:** apply the bug 2 fix first (in this commit). Re-run the skipped tests. If the panel-overflow test passes after just the bug 2 fix, **bug 1 was a downstream effect of bug 2** — no separate fix needed. Document this in the commit message.

If bug 1 still reproduces after bug 2 is fixed, then there's a genuine layout-math bug. In that case: read the current offset-computation logic, identify why it produces an overflow at real-source viewport dimensions, fix the math. The fix is likely a `Math.min` constraint to clamp the panel position to viewport bounds, or a corrected boundary calculation.

**Verify clamp approach:**
```tsx
// In the graphViewportOffsets useEffect (lines 160-195 area):
const rect = graphViewportElement.getBoundingClientRect();
const right = Math.max(window.innerWidth - rect.right + PANEL_MARGIN_PX, PANEL_MARGIN_PX);
const bottom = Math.max(window.innerHeight - rect.bottom + PANEL_MARGIN_PX, PANEL_MARGIN_PX);

// If panel-width is known and accessible here, also clamp:
// (Don't add new state for this; if PANEL_WIDTH is already a constant in the file, use it.)
// The panel's right edge must stay within window.innerWidth - PANEL_MARGIN_PX.
// If `right` value above places the panel beyond the viewport, increase `right` until it fits.

setGraphViewportOffsets({ right, bottom });
```

**Surface in the report**: pre-flight should clarify exactly what fix is needed by re-running the skipped test after bug 2 is in place. Don't over-engineer if the simple fix is sufficient.

**Test renames (10 occurrences, 5 files):** mechanical find-and-replace `self-graph-fixture-loaded` → `graph-viewport`. Use IDE for safety.

**Re-enable skipped tests:** find the two `.skip()` calls in `theme-target-inspector.spec.ts` (lines 184 and 698 per report) and remove `.skip`.

### Verify (targeted scope)

```bash
npm run typecheck
npm run lint:css
npx playwright test tests/e2e/theme-target-inspector.spec.ts --reporter=line
npx playwright test tests/e2e/app-smoke.spec.ts --reporter=line
npx playwright test tests/e2e/self-graph.spec.ts --reporter=line
```

Expected:
- typecheck → 0
- lint:css → 0/0
- theme-target-inspector → both previously-skipped tests now PASS
- app-smoke, self-graph → all pass (testid rename didn't break anything)

Spot-check at least one other affected spec (e.g., `command-deck.spec.ts`) to confirm the rename held.

**Manual smoke (Ryan, `npm run tauri dev`):**
1. App launches.
2. Switch to a real-source adapter (e.g., markdown-vault with a small vault path).
3. Open the theme target inspector overlay.
4. Confirm the panel positioning is correct — no overflow off the right edge.
5. Hover over a graph node — confirm the inspector does NOT activate on graph primitives (the SIGMA_ELEMENT_SELECTOR exclusion is working).
6. Hover over a topbar/UI element — confirm the inspector DOES activate.

### Commit

MERGE GATE → commit (explicit paths only): `fix(v110.2): real-source mode — unified graph-viewport testid + panel overflow fix + re-enabled E2E`
END-OF-RUN REPORT to #changelog + bump+push gate.

### Hard stops
- No semver bump.
- No new dependencies.
- After bug 2 fix, RE-RUN the panel-overflow test BEFORE implementing any bug 1 layout-math change. The fix might already be sufficient via the bug 2 fix's downstream effect.
- If bug 1 requires a layout-math change, keep it minimal — clamp logic, not a rewrite of the offset computation.
- The 10 test renames are mechanical — don't change test assertions, just the selector string.
- Don't touch the OR-selector files (i18n.spec.ts, command-palette.spec.ts, selector-pattern-diagnostic.spec.ts) — they handle both testids already.

---

## Commit 3 — `chore(v110.3): v110 arc close — semver 0.16.0→0.17.0 + NOW.md + SDK_SPEC + sharp-edges`

Standard arc-close shape. Per the established discipline from v109.5.1.

### Files (explicit paths only)

- `package.json` — version 0.16.0 → 0.17.0
- `src-tauri/Cargo.toml` — version field if it tracks main semver (confirm in pre-flight — should already be tracking based on v109.5)
- `docs/LUMAWEAVE_NOW.md` — close v110; new arc state header; v111 marked as next per ROADMAP §3
- `docs/SHIP_READINESS_ROADMAP.md` — v110 entry gets a `**LANDED:**` annotation with commits + outcomes; v111 stays as `[NEXT]`
- `~/Projects/future-integration/SDK_SPEC.md` — if any v110 work touched SDK concerns (it didn't, but confirm); otherwise no edits
- `docs/KNOWN_SHARP_EDGES.md` — append any v110-surfaced learnings

### Pre-flight (verify, report, STOP if diverges)
1. Confirm Commit 2 (v110.2) is on HEAD.
2. Confirm `package.json` reads `"version": "0.16.0"`.
3. Identify any KNOWN_SHARP_EDGES candidates surfaced during v110.1 + v110.2:
   - **ErrorBoundary recovery pattern** — could be a sharp-edge entry: "Settings reset via localStorage.removeItem requires knowing the canonical key; document it"
   - **Testid unification lesson** — small entry: "When a UI element has conditional testids based on internal mode, prefer a single canonical testid + assertions decoupled from internal mode"
   - **StatusCluster removal pattern** — minor: "When a hardcoded placeholder hasn't been wired in N arcs (here: v87.2 → v110), prefer removal over keeping a broken signal"

   Flag which apply; add entries for any not yet logged.

### Step 1 — Semver bump

`package.json`: `0.16.0` → `0.17.0`. `src-tauri/Cargo.toml` if linked.

### Step 2 — NOW.md reconcile

Update header:
- `Production version: 0.17.0`
- `Internal arc: v111 (test infrastructure — per SHIP_READINESS_ROADMAP §3 v111)`
- `Last closed: v110 (real-source bugs + identity + ErrorBoundary)`

Move v110 to closed-arc section with 3-commit table (v110.1 SHA, v110.2 SHA, v110.3 SHA).

v110 architectural notes:
- Identity rename complete: tauri.conf.json (productName, identifier, title) + 5 TypeScript files (StarmapSettings/StarmapPanel → LumaWeaveSettings/LumaWeavePanel)
- ErrorBoundary at AppShell root — root-only scope locked for v1.0; per-subsystem boundaries deferred per ROADMAP §2.6
- Real-source mode bugs resolved: unified `graph-viewport` testid; panel overflow fix
- StatusCluster layout-state field removed (was hardcoded "settling" since v87.2)
- Two previously-skipped E2E tests re-enabled in `theme-target-inspector.spec.ts`

Open-arc section: v111 per ROADMAP §3.

### Step 3 — ROADMAP update

In `docs/SHIP_READINESS_ROADMAP.md`, update the v110 entry per the §6 living-document conventions:
- Add `**LANDED:**` annotation with the 3 commit SHAs + closing commit
- Note any deviations from the planned sub-pass structure (the 6-pass split was compressed to 3 commits per Ryan's call)
- Confirm v111 is `[NEXT]`

### Step 4 — KNOWN_SHARP_EDGES additions

Append entries for any unlogged v110 lessons (see pre-flight identification).

### Verify

```bash
npm run typecheck
npm run lint:css
```

Both clean. No E2E required.

### Commit

MERGE GATE → commit (explicit paths only): `chore(v110.3): v110 arc close — semver 0.16.0→0.17.0, NOW.md + ROADMAP reconcile, sharp-edges`
END-OF-RUN REPORT → bump+push gate.

### Hard stops
- No code changes (only semver + docs).
- Preserve every previously-logged deferred item in NOW.md.
- Don't restructure SHIP_READINESS_ROADMAP.md beyond adding the v110 LANDED annotation.

---

## END-OF-RUN REPORT (each commit)
Files committed, pre-flight findings, verification results, manual smoke notes (Ryan on v110.1 + v110.2), divergences.

**Final report (after v110.3):**
- v110 arc closed in 3 commits (not 6 — compressed per Ryan's blast-radius assessment)
- Identity rename complete; ErrorBoundary root-scope shipped; real-source bugs resolved; StatusCluster cleaned
- Production 0.17.0
- v111 (test infrastructure) is NEXT per ROADMAP §3

## Hard stops (arc-level)
- Targeted-test-scope + CI fast-jobs only.
- No installs. No new deps. No new Rust commands (Cargo.toml version bump only if needed).
- Only v110.3 bumps semver.
- Explicit-path git. Discord MCP only.
- ErrorBoundary scope is ROOT-ONLY — per-subsystem deferred to post-v1.0.
- Identity rename includes `identifier` field (promoted to Must by Ryan).
- Real-source bug 1 may resolve via bug 2 fix; if not, minimal clamp logic — don't rewrite the layout system.
