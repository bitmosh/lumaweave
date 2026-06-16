# Investigation Report — v110.0
# Real-Source-Mode Bugs + Identity Rename + ErrorBoundary

**Date:** 2026-06-09  
**Arc:** v110 (ship-readiness home stretch)  
**Based on:** INVESTIGATION_v110_0_real_source_identity_boundary.md  
**Investigator:** Bandit (v110.0 pass)  
**Output target:** planning Claude + Ryan, for §6 decision lock-in

---

## §1 — Current State Confirmation

### 1.1 v109 arc close

Confirmed. `package.json:3` reads `"version": "0.16.0"`. `docs/LUMAWEAVE_NOW.md:24` header:

> **Production version:** 0.16.0 · **Internal arc:** v110 (real-source mode bugs + identity + error boundary — open) · **Last closed:** v109

`LUMAWEAVE_NOW.md:110` records: "Arc closed — v109 closer: 0.15.0 → 0.16.0 · 2026-06-09. 17 commits banked."

### 1.2 SHIP_READINESS_ROADMAP.md

Confirmed present at `docs/SHIP_READINESS_ROADMAP.md`. §3 ("The Home-Stretch Arc Sequence") lists the v110 sub-passes exactly as described in the brief.

### 1.3 Real-source bug 1 — panel overflow

Confirmed. `src/themes/ThemeTargetInspectorOverlay.tsx:42`:

```ts
const GRAPH_VIEWPORT_SELECTOR = "[data-testid='self-graph-fixture-loaded']";
```

Lines 160–195 use this selector to compute `graphViewportOffsets`:

```ts
const graphViewportElement = document.querySelector<HTMLElement>(GRAPH_VIEWPORT_SELECTOR);
if (!graphViewportElement) {
  setGraphViewportOffsets(null);
  return;
}
const rect = graphViewportElement.getBoundingClientRect();
setGraphViewportOffsets({
  right: Math.max(window.innerWidth - rect.right + PANEL_MARGIN_PX, PANEL_MARGIN_PX),
  bottom: Math.max(window.innerHeight - rect.bottom + PANEL_MARGIN_PX, PANEL_MARGIN_PX),
});
```

In real-source mode the section element carries `data-testid="graph-viewport"` (`AppShell.tsx:394`), not `self-graph-fixture-loaded`. The querySelector finds nothing → `graphViewportOffsets` is null → the panel falls back to `bottom: "4.5rem"; right: "1rem"` (lines 692–694). These fixed values do not account for the actual graph section boundaries at real-source viewport dimensions, causing the documented overflow.

The skipped test (`tests/e2e/theme-target-inspector.spec.ts:184`) measured: panel right edge 1264px vs viewport right boundary 861px.

### 1.4 Real-source bug 2 — Sigma selector

Confirmed. `src/themes/ThemeTargetInspectorOverlay.tsx:42–43`:

```ts
const GRAPH_VIEWPORT_SELECTOR = "[data-testid='self-graph-fixture-loaded']";
const SIGMA_ELEMENT_SELECTOR = `${GRAPH_VIEWPORT_SELECTOR} canvas, ${GRAPH_VIEWPORT_SELECTOR} svg, ${GRAPH_VIEWPORT_SELECTOR} [data-sigma-element]`;
```

`SIGMA_ELEMENT_SELECTOR` is used at line 200 to exclude graph canvas children from the theme-target hover probe. In real-source mode the section element has `data-testid="graph-viewport"`, so `SIGMA_ELEMENT_SELECTOR` never matches any canvas/SVG child → graph primitives are not excluded → the exclusion logic is broken in production mode.

Both bugs share the same root: the single stale constant at line 42.

Note: `src/themes/themeTargetHeuristics.ts:1` has its own `GRAPH_VIEWPORT_SELECTOR = "[data-testid='graph-viewport']"` and is already correct. The bug is local to `ThemeTargetInspectorOverlay.tsx`.

### 1.5 StatusCluster hardcoded "settling"

Confirmed. `src/control-plane/topbar/StatusCluster.tsx:13–16`:

```ts
function useLayoutState(): string {
  // v87.2 known limitation: FA2 supervisor state not yet exposed.
  // Returns a static placeholder until layout state store is wired (v89+).
  return "settling";
}
```

The comment says "v89+" — we are at v110. The string `"settling"` is rendered permanently in the topbar. `controlSurfaceContract.registry.ts:672` records it as a "placeholder".

### 1.6 tauri.conf.json identity fields

Confirmed. `src-tauri/tauri.conf.json:3–15`:

```json
"productName": "starmap",
"identifier": "com.boop.starmap",
"app": {
  "windows": [{ "title": "starmap", ... }]
}
```

Three fields, all "starmap".

---

## §2 — ErrorBoundary Scope Decision

### 2.1 Current state

Zero `ErrorBoundary` usage anywhere in `src/`. Grep for `ErrorBoundary`, `error.boundary`, `error-boundary` returns no results.

**Major subsystem boundaries in the current AppShell tree** (`src/app/AppShell.tsx`):

| Subsystem | Root component | What a crash there does to the user |
|---|---|---|
| AppShell root | `AppShell` | Entire app goes white |
| Graph canvas | `SigmaGraphView` (inside `<section data-testid="graph-viewport">`) | Graph disappears; tiles + inspector may still be DOM-present but non-functional |
| Tile workspace | `TileProvider` → `TileLayer` | All docked and floating tiles disappear |
| Settings panel | `SettingsPanelHost` | Settings drawer is inaccessible; settings store still runs |
| Command palette | `CommandPaletteHost` | `Cmd+K` stops working |
| Inspector overlay | `ThemeTargetInspectorOverlay` | Theme inspector stops rendering; no hover/pin UI |
| Mini-inspector | `InspectorMiniGraph` | Radial spoke UI crashes silently |
| Topbar | `Topbar` | Topbar disappears; access to settings + status lost |

### 2.2 Strategy analysis

**Option A — Root-only.** One boundary, one recovery UI. Any crash in any subsystem replaces the whole app surface.

- Pro: trivial to implement, zero maintenance overhead, catches everything including future code.
- Con: a settings-store migration bug, a font-load race in the topbar, or an inspector edge case all produce the same "app is dead" UX. The user loses the graph view when (say) only the inspector crashed.
- Con: recovery UI can only offer "Reload" or "Reset settings" — no subsystem context.

**Option B — Root + per-subsystem.** Boundary at root plus boundaries around graph canvas, tile workspace, inspector overlay, settings panel.

- Pro: a crash in the inspector shows a "this panel crashed" error in place — the graph keeps running. A tile crash shows a per-tile fallback. Most useful when failures are subsystem-local.
- Con: each boundary needs a recovery UI design decision. Developers must remember to wrap new subsystems.
- Con: LumaWeave's subsystems share state (Zustand store, graph data) — a crash in one often corrupts shared state anyway, so containment may be illusory.

**Option C — Root-only for v1.0, per-subsystem post-v1.0.** Ship root boundary now, add subsystem boundaries in v111+ as real failure patterns become clear.

### 2.3 Recommendation: **Option C**

**In product terms:** a developer-tool user encountering a crash wants either a one-click restart or, in corruption cases, a settings reset. They do not need "the inspector crashed but your graph is still there" — if the inspector crashes mid-session, the user will reload anyway to get a clean state. The value of per-subsystem boundaries only materializes when failures are subsystem-local AND the rest of the app remains coherent. In LumaWeave's architecture, most realistic failures cascade (the source adapter crash propagates to the graph summary, which propagates to the Sigma renderer — the graph is not "still there").

**Historical failure check:** The v105 zombie-port was a process-lifecycle failure (not a React crash at all). The v108 normalizer divergence produced wrong data, not a thrown exception. The v109.1 Buffer polyfill manifested as a thrown error in an async context but would have been caught by a root boundary just as well as a per-adapter boundary. None of these would have benefited meaningfully from per-subsystem isolation.

**For v1.0:** root-only is the correct scope. It eliminates white-screen-of-death — the most user-hostile crash class — with minimal implementation. The upgrade path to per-subsystem is additive; boundaries can be surgically added in v111+ once real failure distribution is known.

**Complexity trade-off for Ryan:** Option B adds ~5 boundary components, each needing a fallback UI. That's 1-2 passes of work. Option C's root-only is a single component + 1 integration point. Given the arc sequence already has v111–v115 stacked, spending an extra pass on per-subsystem boundaries before ship is not the right call.

### 2.4 Recovery UI shape

**Recommended UI (root boundary):**

```
┌───────────────────────────────────────────────────────┐
│                                                       │
│  ⚠  Something went wrong                             │
│                                                       │
│  LumaWeave encountered an unexpected error.           │
│                                                       │
│  [  Reload App  ]  [  Reset Settings  ]               │
│                                                       │
│  ▶ Copy error details                                 │
│                                                       │
└───────────────────────────────────────────────────────┘
```

**Actions:**
- **Reload App** — `window.location.reload()`. In Tauri 2, this is sufficient; the webview re-bootstraps. `appWindow.reload()` from `@tauri-apps/api/window` is also available but `window.location.reload()` is simpler and functionally equivalent for this use case.
- **Reset Settings** — call `useSettingsStore.getState().resetToDefaults()` (or whatever the store's reset action is), then reload. Covers the corruption case. Show only if the `useSettingsStore` module loaded before the crash (guard with try/catch in the boundary's render).
- **Copy error details** — copy `error.message + "\n" + error.stack` to clipboard via `navigator.clipboard.writeText()`. Single click, no toggle needed. The user can paste it into a bug report.

**Visual treatment:** deliberately stark. Dark background (`#060b14` from the graph palette), off-white text, a single amber accent for the warning icon. Do NOT use the aurora/plasma aesthetic — the user needs to immediately read "this is an error state", not "this is a loading screen." The LumaWeave brand is not load-bearing in a crash UI.

---

## §3 — Identity Rename Surfaces

### 3.1 All "starmap" occurrences (repo-wide)

| File | Line | Context | Category |
|---|---|---|---|
| `src-tauri/tauri.conf.json` | 3 | `"productName": "starmap"` | **Must rename** |
| `src-tauri/tauri.conf.json` | 5 | `"identifier": "com.boop.starmap"` | **Should rename** |
| `src-tauri/tauri.conf.json` | 15 | `"title": "starmap"` | **Must rename** |
| `src/control-plane/settings/settings.schema.ts` | 79 | `export interface StarmapSettings` | **Should rename** |
| `src/control-plane/settings/settings.defaults.ts` | 1,23 | `import/export StarmapSettings` | **Should rename** (follows schema) |
| `src/control-plane/settings/settings.migrations.ts` | 2,8,32,50,…(20+ lines) | `StarmapSettings` type annotation | **Should rename** (follows schema) |
| `src/control-plane/settings/settings.store.ts` | 4,9,28,34 | `StarmapSettings` type | **Should rename** (follows schema) |
| `src/control-plane/panels/panel.types.ts` | 3 | `export type StarmapPanel` | **Should rename** |
| `docs/LUMAWEAVE_NOW.md` | 154 | changelog entry: `StarmapSettings` | **Could rename** |
| `docs/agent/v107_report.md` | 63,67,254 | historical investigation docs | **Could rename** |
| `docs/agent/BANDIT_v107_0_tier0_source_adapter_plumbing.md` | 37 | historical implementation brief | **Could rename** |
| `docs/agent/brain/BANDIT_CURRENT_TITLE.md` | 502,503,546,547 | archived brain snapshots | **Could rename** |
| `docs/prototypes/minimap-design/Minimap Integration (1).md` | 145,146,171,182 | prototype design doc | **Could rename** |
| `docs/SHIP_READINESS_ROADMAP.md` | 31 | describes the bleed: `"starmap" (old project name)` | **Don't rename** |
| `docs/workflows/INVESTIGATION_v110_0_real_source_identity_boundary.md` | many | the investigation brief itself | **Don't rename** |

**Cargo.toml status:** `src-tauri/Cargo.toml:2` reads `name = "LumaWeave"`. Already renamed. The lib crate is `lumaweave_lib`. No "starmap" anywhere in Cargo.toml.

### 3.2 Tauri 2 considerations

Tauri 2 maps config fields to OS-level identity as follows:

- `productName` → macOS dock label, About dialog app name, macOS app bundle folder name (`{productName}.app`), Linux `.desktop` file `Name=`, Windows executable display name. **This is the primary user-visible identity field.**
- `app.windows[].title` → the window title bar string. Separate from `productName`; both need to change.
- `identifier` → the OS bundle ID (`com.boop.starmap`). macOS Gatekeeper, macOS Keychain, Linux `StartupWMClass`. Changing this means the new build is treated as a fresh app — settings stored under the old bundle ID are not migrated automatically.

**Identifier change consequences for LumaWeave:** settings are stored via Zustand in the webview's `localStorage`, not in OS-level app containers keyed by bundle ID. So changing `com.boop.starmap` → `com.boop.lumaweave` does NOT wipe user settings. A fresh install won't inherit the old bundle's localStorage, but in development with a single machine, the webview carries the same localStorage regardless. For pre-1.0 software, the identifier change is safe.

### 3.3 Cargo.toml — no action needed

`Cargo.toml [package].name = "LumaWeave"` is already correct. In Tauri 2, the binary name is derived from `tauri.conf.json productName`, not from `Cargo.toml [package].name`. The `[lib] name = "lumaweave_lib"` is a Tauri scaffolding convention. No rename needed in Cargo.

### 3.4 Recommendation: concrete rename plan

**Phase 1 — Runtime identity (tauri.conf.json, 1 file):**
1. `productName`: `"starmap"` → `"lumaweave"`
2. `identifier`: `"com.boop.starmap"` → `"com.boop.lumaweave"`
3. `app.windows[0].title`: `"starmap"` → `"LumaWeave"`

**Phase 2 — TypeScript type rename (5 source files):**
4. `settings.schema.ts:79`: `StarmapSettings` → `LumaWeaveSettings`
5. `settings.defaults.ts`: update import + export (2 lines)
6. `settings.migrations.ts`: rename type annotation (~20 lines; all mechanical)
7. `settings.store.ts`: rename import + 3 usages
8. `panel.types.ts:3`: `StarmapPanel` → `LumaWeavePanel`

**Phase 3 — Docs cleanup (optional, not blocking v110.1):**
9. Could-rename entries in `docs/` — cosmetic cleanup, can land in v112 (UI completeness).

**Order rationale:** config first (visible immediately when the Tauri app launches), TypeScript types second (caught by `tsc --noEmit`, never ship wrong). The two phases can be in one commit since there's no dependency between config and TS types.

**Post-rename verification:** after `npm run tauri:dev`: window title shows "LumaWeave", dock label shows "lumaweave" (macOS) or whatever the desktop entry shows (Linux). `npm run typecheck` passes clean.

**Deferral:** signing identity and distribution channels (Gatekeeper notarization, Linux AppImage signing) are post-v1.0 — no action for v110.

---

## §4 — Real-Source Bug 2 Fix Shape

### 4.1 Current state — confirmed code

`src/themes/ThemeTargetInspectorOverlay.tsx:42–43`:

```ts
const GRAPH_VIEWPORT_SELECTOR = "[data-testid='self-graph-fixture-loaded']";
const SIGMA_ELEMENT_SELECTOR = `${GRAPH_VIEWPORT_SELECTOR} canvas, ${GRAPH_VIEWPORT_SELECTOR} svg, ${GRAPH_VIEWPORT_SELECTOR} [data-sigma-element]`;
```

`src/app/AppShell.tsx:394`:

```tsx
data-testid={useFixture ? "self-graph-fixture-loaded" : "graph-viewport"}
```

One element, two possible testids, conditioned on `useFixture`. In fixture mode (default/test), the section gets `self-graph-fixture-loaded`. In real-source mode, it gets `graph-viewport`.

`SIGMA_ELEMENT_SELECTOR` is used at `ThemeTargetInspectorOverlay.tsx:200` to exclude graph canvas children from the hover probe (`resolveEntityFromEventTarget`). When the selector doesn't match, `matches()` returns false and graph primitives are NOT excluded → the bug.

**Note:** `src/themes/themeTargetHeuristics.ts:1` already has:
```ts
const GRAPH_VIEWPORT_SELECTOR = "[data-testid='graph-viewport']";
```
The heuristics module is correct. The bug is local to `ThemeTargetInspectorOverlay.tsx`.

### 4.2 Test counts

Files using `self-graph-fixture-loaded` exclusively (not in an OR selector, not inside the skipped test body):

| File | Occurrences | Purpose of the lookup |
|---|---|---|
| `tests/e2e/app-smoke.spec.ts:7` | 1 | "is the graph visible?" |
| `tests/e2e/self-graph.spec.ts:9,20,29,40` | 4 | "graph viewport ready for canvas checks" |
| `tests/e2e/command-deck.spec.ts:44` | 1 | "graph viewport ready" |
| `tests/e2e/ide-integration.spec.ts:6,16` | 2 | `waitForSelector` — graph ready |
| `tests/e2e/graph-visual-inventory.spec.ts:123,164` | 2 | visual inventory root element |

Total: **10 references across 5 files.** None of these semantically require "specifically the fixture testid" — they all mean "the graph section is ready." Renaming to `graph-viewport` changes only the string they look up, not what they assert.

Files using an OR selector `[data-testid="graph-viewport"], [data-testid="self-graph-fixture-loaded"]`:
- `tests/e2e/i18n.spec.ts:160`
- `tests/e2e/command-palette.spec.ts:139`
- `tests/e2e/selector-pattern-diagnostic.spec.ts:14`

These already handle both testids and require **no changes** under any option.

### 4.3 Recommendation: **Option B — Unified testid**

**Reasoning:**

Option A (dynamic selector in the overlay — read the source mode from the store) is the minimal-touch fix for the overlay itself but leaves the underlying design flaw in place: the overlay knows about source modes. When more adapters ship, this becomes a concern. It also still requires changing AppShell if the goal is a consistent testid, and if you're changing AppShell anyway, Option B is one more file for a cleaner result.

Option C (dual testid on one element) is a testing anti-pattern. Two `data-testid` attributes on one element can't be expressed in standard HTML (attribute names must be unique); the approach in the brief uses `data-testid-legacy`, which no Playwright `getByTestId()` call understands. In practice this option breaks more than it saves.

**Option B is clean because:**
1. `ThemeTargetInspectorOverlay.tsx:42` becomes `"[data-testid='graph-viewport']"` — matches the heuristics module's constant, establishing a canonical single value.
2. `AppShell.tsx:394` becomes `data-testid="graph-viewport"` always — removing the conditional.
3. The 10 test references become `graph-viewport` — 10 surgical string replacements across 5 files.
4. `SIGMA_ELEMENT_SELECTOR` at line 43 inherits the fix automatically.
5. Future source adapters (markdown-vault real-source, csv-edge-list real-source, etc.) all render in the same section element → they all get `graph-viewport` → no new cases needed.

**Semantic question — does `self-graph-fixture-loaded` carry meaningful information that `graph-viewport` doesn't?** Not in any test currently using it. The name `self-graph-fixture-loaded` was chosen as a signal that the fixture-mode graph had finished loading — but the tests don't assert "is this specifically the fixture?" they assert "is the graph section visible/ready?" `graph-viewport` is the semantically correct name for the general case.

### 4.4 Skipped test re-enable outline

The re-enabled test at `theme-target-inspector.spec.ts:698` should assert:

1. Load the page in real-source mode (or with the `__lwTauriMock` injected for a non-fixture adapter).
2. Navigate to a graph with nodes.
3. Enable the theme-target inspector overlay.
4. Hover over an element inside the graph section.
5. Assert: the inspector panel does **not** activate (the element is excluded as a Sigma graph primitive).
6. Hover over a registered theme-target element outside the graph section.
7. Assert: the inspector panel activates correctly.

This test is currently skipped because the selector at line 42 doesn't match in real-source mode, so step 5 fails (graph primitives ARE selected). After the Option B fix, step 5 and step 7 both pass because `SIGMA_ELEMENT_SELECTOR` correctly excludes canvas children.

---

## §5 — Recommended Pass Shape for v110

The 6-sub-pass split from the roadmap is sound. One amendment:

### Confirmed split

- **v110.0** — this investigation report → decisions locked
- **v110.1** — identity rename (tauri.conf.json 3 fields + TypeScript StarmapSettings rename, 1 commit)
- **v110.2** — ErrorBoundary at AppShell root (1 commit: new ErrorBoundary component + integration + recovery UI)
- **v110.3** — real-source bug 1: panel overflow fix + re-enabled E2E (1 commit)
- **v110.4** — real-source bug 2: unified testid fix + re-enabled E2E (1 commit)
- **v110.5** — StatusCluster: remove hardcoded "settling" (1 commit; see note below)
- **v110.6** — arc close (semver 0.16.0 → 0.17.0, NOW.md, SDK_SPEC)

### Keep v110.3 and v110.4 separate

Both touch `ThemeTargetInspectorOverlay.tsx` but for different concerns: v110.3 is layout math (the `graphViewportOffsets` computation path); v110.4 is selector identity (the `GRAPH_VIEWPORT_SELECTOR` constant). After Option B, v110.4 also touches `AppShell.tsx` and 5 test files — a different change surface than v110.3's layout computation. Separate commits allow precise revert if one pass introduces a regression.

### v110.5 — wire vs. remove

`useLayoutState()` has returned `"settling"` since v87.2 (comment text). We are at v110. The layout state store was never wired. Recommendation: **remove the layout field from the status cluster** rather than wire an unwired state. Options:

- **Wire:** would require exposing FA2 supervisor state from the gwells engine, plumbing it through a context or store, and keeping the "settling" → "stable" transition logic. This is not a one-commit change and expands v110's scope.
- **Remove:** delete the `useLayoutState` hook and the "layout: settling" span from the StatusCluster render. The node/edge count and FPS counter remain. The layout state display is not user-visible in the current UX value — it reads "settling" permanently, which communicates nothing. Removing it is more honest than keeping a broken label.

**Recommendation: remove the layout field in v110.5.** It can be re-added in v111+ if the gwells supervisor state gets exposed. The v110 brief says "wire or remove" — remove is the right call.

### Complexity ratings

| Sub-pass | Commits | Complexity | Notes |
|---|---|---|---|
| v110.1 | 1 | LOW | 3 config edits + ~25 mechanical TS symbol renames |
| v110.2 | 1 | LOW-MED | New component + recovery UI design + integration |
| v110.3 | 1 | MED | Layout math investigation + skipped E2E re-enable |
| v110.4 | 1 | LOW | 1-line overlay fix + AppShell + 10 test renames + skipped E2E re-enable |
| v110.5 | 1 | LOW | Delete hook + render span |
| v110.6 | 1 | LOW | Docs + semver |
| **Total** | **6** | — | All independently mergeable |

---

## §6 — Pre-Flight Decisions for Ryan

### 6.1 ErrorBoundary scope

**Recommendation: Option C — root-only for v1.0, per-subsystem post-v1.0.**

Why: historical failures have not been subsystem-isolated (they cascaded), and the shared Zustand store means a crash in one subsystem often renders others non-functional anyway. Root-only eliminates white-screen-of-death for v1.0. Per-subsystem boundaries can be added in v111+ as real failure patterns become clear.

---

### 6.2 Recovery UI actions

**Recommendation: Reload + Reset Settings + Copy error details.**

Not "Show error details" as a toggle — copy-to-clipboard is lower friction and achieves the same goal (user can paste the stack trace into a report). In a developer tool, the user understands stack traces; a single "Copy error details" button is sufficient.

---

### 6.3 Recovery UI visual

**Recommendation: deliberately stark.**

Deliberately distinct from the aurora/plasma theme: dark background, amber warning icon, clean sans-serif text. The user must immediately read "broken state", not "loading screen" or "themed panel". The brand is not load-bearing here.

---

### 6.4 Identity rename scope

**Recommended rename list:**

**Must rename (v110.1):**
- `src-tauri/tauri.conf.json`: `productName` → `"lumaweave"`, `title` → `"LumaWeave"`

**Should rename (v110.1):**
- `src-tauri/tauri.conf.json`: `identifier` → `"com.boop.lumaweave"`
- `src/control-plane/settings/settings.schema.ts`: `StarmapSettings` → `LumaWeaveSettings`
- `src/control-plane/settings/settings.defaults.ts`: follow schema rename
- `src/control-plane/settings/settings.migrations.ts`: follow schema rename
- `src/control-plane/settings/settings.store.ts`: follow schema rename
- `src/control-plane/panels/panel.types.ts`: `StarmapPanel` → `LumaWeavePanel`

**Could rename (v112 docs pass, not blocking v110.1):**
- `docs/LUMAWEAVE_NOW.md:154` and various `docs/agent/` files — historical references to `StarmapSettings`, cosmetic cleanup only

---

### 6.5 Cargo.toml rename

**Answer: no action needed.** `src-tauri/Cargo.toml [package].name` is already `"LumaWeave"`. The lib is `lumaweave_lib`. No "starmap" in Cargo. ✓

---

### 6.6 Real-source bug 2 fix

**Recommendation: Option B — unified testid (`graph-viewport` everywhere).**

Why: the fix is clean (1 constant in the overlay), future adapters get it for free, the heuristics module already uses `graph-viewport`, and the 10 test edits are mechanical string replacements. Option A keeps the overlay coupled to source-mode awareness; Option C is a testing anti-pattern.

---

### 6.7 v110 sub-pass shape

**Recommendation: adopt the 6-sub-pass split as described, with two amendments:**

1. **Keep v110.3 and v110.4 separate** — different concern (layout math vs. selector identity), different change surfaces, independent revert targets.
2. **v110.5: remove (not wire) the StatusCluster layout field** — the state has been unwired since v87.2 (we are at v110). Wiring requires cross-system plumbing outside v110's scope. Remove the field cleanly; re-add in v111+ when gwells exposes supervisor state.

Total: 6 commits, all independently mergeable, all LOW–MED complexity. v110 is a hygiene arc, not an architectural one.

---

*Report complete. Planning Claude reads §6 to lock decisions with Ryan; then scopes v110.1+.*
