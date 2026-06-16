# v112.0 — UI Completeness Investigation Report

**Date:** 2026-06-10 · **Arc:** v112 · **Output for:** Planning Claude + Ryan review

No code changes made. All claims cite file:line and quote actual content.

---

## §1 — Internal arc numbers in user-visible strings

### 1.1–1.2 Full inventory

Six strings across three register files + three i18n entries (the i18n entries and the register-file strings are parallel — both render in the PlaceholderTab UI):

| File | Line | Current string | Surface |
|---|---|---|---|
| `src/control-plane/inspector/spokes/registerTypeSpoke.ts` | 17 | `"Coming in future arc (Typography axis token wiring)"` | Type spoke tab body |
| `src/control-plane/inspector/spokes/registerMotionSpoke.ts` | 16 | `"Coming in v92 (Audio Reactivity arc)"` | Motion spoke tab body |
| `src/control-plane/inspector/spokes/registerLayoutSpoke.ts` | 16 | `"Coming in v93 (Physics Dialect arc)"` | Layout spoke tab body |
| `src/i18n/manifests/en.json` | 272 | `"Coming in v93 (Physics Dialect arc)"` | Layout (i18n duplicate) |
| `src/i18n/manifests/en.json` | 276 | `"Coming in v92 (Audio Reactivity arc)"` | Motion (i18n duplicate) |
| `src/i18n/manifests/en.json` | 280 | `"Coming in future arc (Typography axis token wiring)"` | Type (i18n duplicate) |

**Note:** The `registerXSpoke.ts` files set `placeholderMessage` directly on the registry entry; `en.json` has mirror keys under `inspector.layout/motion/type.placeholderMessage`. Both paths feed the `PlaceholderTab` component. Both must be updated in sync.

**Recommended replacements:**

| Spoke | New string (register file + en.json) |
|---|---|
| Type | `"Typography controls are in development."` |
| Motion | `"Animation and motion controls are in development."` |
| Layout | `"Physics layout controls are in development."` |

### 1.3 Additional arc-number / dev-language bleed

**CategoryTheme.tsx — two locations:**

- `src/control-plane/settings/categories/CategoryTheme.tsx:229` — `StubSubArea` renders: `"Coming in a later v102 phase"` — visible as body text inside Workshop/History/Bookmarks/Export sub-areas  
- `src/control-plane/settings/categories/CategoryTheme.tsx:263` — `title={!area.live ? 'Coming in a later v102 phase' : undefined}` — tooltip on disabled sub-area nav buttons

**Recommended replacement:** `"Coming soon"` for both (matches the existing `en.json` key `inspector.placeholder.coming: "Coming soon"` — consistent language, no arc numbers).

**command-registry.entries.ts:**

- `src/control-plane/commands/command-registry.entries.ts:157` — `description: "Open the advanced theme workshop (coming soon)"` — shown in command palette tooltip for "Open Theme Workshop" command  
**Recommended:** `"Open the theme workshop"` (no "(coming soon)" — command can stay registered without advertising its incompleteness).

**PackageDependencyConfigForm.tsx:**

- `src/source-adapter/adapters/PackageDependencyConfigForm.tsx:37` — `<option value="pyproject.toml" disabled>pyproject.toml (Python — coming soon)</option>` — visible in source adapter form  
**Recommended:** Keep as-is OR replace with `"pyproject.toml (Python — not yet supported)"`. "Coming soon" implies an imminent release; "not yet supported" is more accurate. Low priority.

**AgentChatPlaceholder.tsx via i18n:**

- `src/i18n/manifests/en.json:368–369`:
  ```json
  "description": "Local agent chat surface. Wires to the agent infrastructure in a future pass.",
  "status": "Placeholder — not connected."
  ```
  The word "Placeholder" and "future pass" are dev-language rendered to the user.  
**Recommended:** Replace `description` with `"Chat with a local AI model."` and `status` with `"Not yet connected — coming in a future update."` OR simply remove the status line once real chat is wired (v112.6).

### 1.4 No other arc-number bleed found

Grep across `src/` for `Coming in v`, `v\d+ (`, `arc` and `phase` in string contexts found no additional instances beyond those catalogued above.

---

## §2 — Hardcoded values that should be dynamic registry reads

### 2.1–2.2 Candidates found

**A. PaletteCategoryChips — hardcoded category filter list**

`src/control-plane/commands/palette/components/PaletteCategoryChips.tsx:4`:
```typescript
const FILTER_VALUES: CategoryFilter[] = ["all", "view", "graph", "theme", "inspector", "physics", "labels", "debug"];
```
The command registry (`commandRegistry.getAll()`) already exists and commands have `category` fields. A `getCategories()` method would allow this list to be dynamic.

**Complexity: HIGH.** The registry doesn't currently expose `getCategories()` as a first-class query. Adding it is possible but risks touching the command registry contract, the `CategoryFilter` type, and the chips render logic. Divergence risk: "debug" category commands exist in the registry but may not belong in the user-facing filter list.

**Recommendation: DEFER.** The hardcoded list is currently accurate; adding a runtime-derived list in v112 adds risk without meaningful user benefit. Flag for a dedicated registry-hygiene arc.

**B. CategoryTheme.tsx — SUB_AREAS hardcoded list**

`src/control-plane/settings/categories/CategoryTheme.tsx:12-18`:
```typescript
const SUB_AREAS: { id: SubArea; label: string; live: boolean }[] = [
  { id: 'browse', label: 'Browse', live: true },
  { id: 'active', label: 'Active', live: true },
  { id: 'workshop', label: 'Workshop', live: false },
  { id: 'history', label: 'History', live: false },
  { id: 'bookmarks', label: 'Bookmarks', live: false },
  { id: 'export', label: 'Export', live: false },
];
```
This is not a divergence risk — there's no theme-sub-area registry. The `live` flag gates rendering. **Not a registry-wiring opportunity; this is configuration.**

**Recommendation: KEEP AS-IS.** The `live` flags will change as sub-areas ship; the list is the right shape for this use case.

**C. CategoryTheme stub buttons — disabled with `title` tooltip**

`src/control-plane/settings/categories/CategoryTheme.tsx:263`: disabled buttons use `disabled={!area.live}` and `title={!area.live ? 'Coming in a later v102 phase' : undefined}`. The `disabled` behavior is correct; only the tooltip text needs updating (covered in §1).

### 2.3 Divergence audit

**PaletteCategoryChips vs command registry:** The hardcoded `"debug"` filter category exists in the registry (commands like `debug_toggleFps`, `debug_clearAllOverrides` in en.json:309-310). No divergence found — the chips list matches what's actually registered.

**Inspector spoke list — NOT hardcoded.** The radial ring reads from `inspectorSpokeRegistry.list()` dynamically. No divergence.

**Theme list — NOT hardcoded.** `CategoryTheme.tsx` uses `builtInThemePresets` (imported from `themePresets.ts`) in `BrowseSubArea`. Dynamic.

**Source adapter list — NOT hardcoded.** `SourceAdapterPanel` iterates `sourceAdapterRegistry.entries`. Dynamic.

**Tile section list — NOT hardcoded.** AppShell iterates `tileSectionRegistry.list()`. Dynamic (but the registry itself is a static array — that's fine per the registry pattern).

---

## §3 — Inspector ring spoke content audit

### 3.1 Working spokes — confirmed real content

All six working spokes confirmed from registry entries and component files:

| Spoke | id | Status | Content |
|---|---|---|---|
| Geometry | geometry | active | Scope picker + geometry preset controls (GeometryTab.tsx) |
| Color | color | active | Color picker + override controls per target (ColorTab.tsx) |
| Apply | apply | active | Paste overrides to targets (ApplyTab.tsx) |
| History | history | active | Override history via `themeOverrideStorage` (HistoryTab.tsx) |
| Code | code | active | Provenance manifest lookup + "Open in editor" (CodeTab.tsx) |
| Open in IDE | (part of code spoke) | active | Editor picker + `get_project_root` Tauri command |

No minor polish issues found in labels. All six render real registry-driven content.

### 3.2 Stub spokes

#### Type spoke (`registerTypeSpoke.ts`)

**Current render:** `makePlaceholderTab("type")` — shows the `placeholderMessage` string (arc-number bleed, covered in §1). No real content.

**Registry availability:**
- `typographyRegistry.ts` — 3 seed entries: `display` (Space Grotesk), `body` (IBM Plex Sans), `mono` (IBM Plex Mono). Populated and functional.
- `fontAxisRegistry.ts` — **empty stub** (comment: "v86e: contract stub. Empty registry; v87 populates."). No axis data to render.

**MVP feasibility:** A minimum-viable Type spoke could render the 3 typography roles from `typographyRegistry` as a read-only display (font family name, specimen text sample, fallback stack) with no edit controls. This shows users the active type ramp without requiring the empty font axis registry. Edit controls (sliders, pickers) need v87's axis data first.

**Recommendation: SPLIT.** In v112: render the typography role cards from `typographyRegistry` as a read-only specimen display (1 commit). Leave axis sliders and editor controls to the dedicated typography arc (v87 era). Update `placeholderMessage` to `"Typography controls are in development."` until the full spoke ships.

#### Motion spoke (`registerMotionSpoke.ts`)

**Current render:** `makePlaceholderTab("motion")` — shows arc-number string. `intendedTokenPaths: ["motion.reduce"]` is declared but not wired.

**Registry availability:**
- `motionSafetyRegistry.ts` — populated with entries (safe/low/moderate/high risk classifications). Functional.
- `animationPrimitiveRegistry.ts` — **empty stub** (comment: "v86e: contract stub. Empty registry; v92/v93 implements.").
- `musicReactiveMappingRegistry.ts` — populated (audio source to visual mapping entries).
- Reduce Motion setting: `view_toggleReduceMotion` command exists in en.json:293 + `motionSafetyRegistry` classifies effects.

**MVP feasibility:** A minimum-viable Motion spoke could wire the existing Reduce Motion command as a toggle (reads `useSettingsStore` for `prefers-reduced-motion` state). `motionSafetyRegistry` entries could render as a read-only effect-safety reference panel. This doesn't require `animationPrimitiveRegistry` or audio reactivity infrastructure.

**Recommendation: SPLIT.** In v112: Reduce Motion toggle + motionSafetyRegistry read-only display (1 commit). Audio reactivity controls remain a future arc.

#### Layout spoke (`registerLayoutSpoke.ts`)

**Current render:** `makePlaceholderTab("layout")` — shows arc-number string. `intendedTokenPaths: undefined`.

**Registry availability:**
- `physicsDialectRegistry.ts` — **empty stub** (comment: "v86e: contract stub. Empty registry; v93 implements.").
- `lensRegistry.ts` — **empty stub** (comment: "v86e: contract stub. v93: drop layoutFn, add description+status, register 2 entries." — still empty in current tree).

**MVP feasibility:** None. Both registries that would power a Layout MVP are empty. Wiring a dialect picker to an empty registry renders nothing. The `PhysicsSectionContent` tile already exposes gwells physics controls (seeds, force params), so users have physics access today — just not through the inspector spoke.

**Recommendation: HONEST PLACEHOLDER.** Update `placeholderMessage` to `"Physics layout controls are in development."` (§1). No content change in v112. Flag in roadmap that this spoke's content awaits the physics dialect arc.

### 3.3 Stub spoke roadmap references

- **Motion spoke:** `gwells C9.0 drift-back` bug doc (`docs/known-bugs/gwells-c9-0-drift-back-flake.md`) is the closest. No explicit "audio reactivity arc" entry in ROADMAP §3 beyond the arc-number string in the code.
- **Type spoke:** No typography arc in ROADMAP §3. The `typographyRegistry` comment says "font loading deferred to v87" — but no v87 entry in the roadmap.
- **Layout spoke:** No physics dialect arc in ROADMAP §3.

**Roadmap gap flagged:** All three stub spokes have future arcs named in code comments (`v87`, `v92`, `v93`) but none appear in `SHIP_READINESS_ROADMAP.md §3`. A roadmap entry should be added for each so the devpath is visible. Not a v112 code change — a docs decision for Ryan.

---

## §4 — Theme menu sub-area audit

### Current state of all stubs

`CategoryTheme.tsx:225-231` — `StubSubArea` component:
```tsx
function StubSubArea({ label }: { label: string }) {
  return (
    <div className="theme-stub">
      <span className="theme-stub-label">{label}</span>
      <p className="theme-stub-coming">Coming in a later v102 phase</p>
    </div>
  );
}
```
All four stub sub-areas (Workshop, History, Bookmarks, Export) render this identically. Disabled nav buttons show the same string as a `title` tooltip.

### Workshop

**What it renders:** `<StubSubArea label="Workshop" />` — just the label + "Coming in a later v102 phase".

**MVP scope:** A full Workshop (palette wheel + semantic mapper + contrast guard) is major feature work — not a v112 fit.

**Command registry:** A `theme.openWorkshop` command is registered (`command-registry.entries.ts:154-158`), description reads "coming soon". The command exists as a stub.

**Recommendation: HONEST PLACEHOLDER.** Replace the "Coming in a later v102 phase" text with "Coming soon" (1 line, covered in §1). The nav button stays but is disabled. No content added in v112. The `theme.openWorkshop` command description should be updated to remove "(coming soon)" per §1.

**Commits needed: 0 additional** (handled in §1 string scrub).

### History

**What it renders:** `<StubSubArea label="History" />`.

**Is theme history tracked?** Searching for `themeHistory`, `lastAppliedTheme`, `appliedThemes` — **nothing found in settings store or elsewhere.** Theme application is not currently recorded. The settings store records the current theme ID (`appearance.theme`) but no history of prior themes.

**MVP scope:** To implement History, the settings store schema would need a `themeHistory: ThemeId[]` field (capped at N), populated whenever `appearance.theme` changes. 1 schema migration + 1 settings-store change + simple History sub-area component. Approachable in 2 commits but needs a schema migration.

**Recommendation: HONEST PLACEHOLDER** for v112 (update text per §1, no new feature). Flag as 2-commit MVP for v113+. The schema migration adds a small risk; better in a focused pass.

**Commits needed: 0 additional.**

### Bookmarks

**What it renders:** `<StubSubArea label="Bookmarks" />`.

**Is there a bookmarkRegistry?** Yes — `src/graph/overlay/bookmarkRegistry.ts` — but it's for **floating graph overlay bookmarks** (spatial pins on the graph canvas, with color properties like `alertColor`/`pinnedColor`). It is **not** a theme-bookmark system. No theme-bookmark store exists.

**MVP scope:** Bookmarking a theme would mean storing a `Set<ThemeId>` in settings. Simple to add, but adds yet another schema migration. The UI is trivial (star button on theme cards). The question is whether theme bookmarks are a real user need for v1.0.

**Recommendation: REMOVE FROM MENU** for v1.0. Theme bookmarking is a convenience feature; users can browse and apply themes directly from Browse. A user who sees a disabled "Bookmarks" tab and gets "Coming soon" is worse off than a user who doesn't see the tab at all. If the decision is to keep it visible as a roadmap signal, update text per §1.

**Commits needed: 0 additional** (either remove from SUB_AREAS or update text in §1 scrub).

### Export

**What it renders:** `<StubSubArea label="Export" />`.

**Is the export mechanism implemented?** Partially. `command-registry.entries.ts:137-141`:
```typescript
id: "theme.exportBundle",
description: "Export current theme overrides to a JSON bundle file",
execute: () => dispatch("theme:exportBundle"),
```
The command is registered and dispatches `"theme:exportBundle"`. However: no handler for `"theme:exportBundle"` appears in `AppShell.tsx` or anywhere in `src/`. The dispatch has no listener. `themeOverrideStorage.ts` has all the data needed (it stores overrides keyed by target ID) — serialization + browser download is ~10 lines of code.

**MVP scope:** 1 commit: add `theme:exportBundle` event handler in AppShell that reads `themeOverrideStorage`, serializes to JSON, and triggers a browser download. Then wire the Export sub-area to a "Download override bundle" button that calls the command.

**Recommendation: MVP in v112.** This is the most tractable sub-area — the data exists, the command is already registered, the handler is missing. **1-2 commits** to close the loop.

**Commits needed: 1-2.**

---

## §5 — Dev tooling tile section triage

### QaPanel (`qa-feedback-section`)

**What it renders:** 1606-line component. Two major surfaces:
1. A user-facing feedback survey ("Help shape LumaWeave by walking through these questions") — genuinely user-facing
2. A large QA registry browser, contract trace viewer, advisory system, and debug tooling — entirely dev infrastructure

**Reframe possibility:** The feedback survey portion (tile label "Feedback & Testing", description "Help shape LumaWeave by walking through these questions") is real user-facing content. The QA debug surface (registry checks, probe results, contract trace, clipboard-copy diagnostics) is not.

**Recommendation: DEV-GATE the full tile for now** (hide behind `?dev=true` URL param or settings toggle). Longer-term, extract the feedback survey into a standalone `FeedbackPanel` tile with a clean label ("Feedback") and keep QA tooling accessible only via dev mode. This is a 2-commit extraction in a future arc; for v112, dev-gating the entire tile is the right first step.

**If Ryan wants the feedback survey to stay user-accessible without extraction:** rename the tile label from "Feedback & Testing" to "Feedback" and dev-gate only the QA sections within the panel. That's MED complexity.

### System Index (`system-index-section`)

**What it renders:** A passive read-only browser of `systemIndexRegistry` entries — lists every registered subsystem with source paths, categories, tags. Useful for developers understanding the architecture; zero value for end users.

**Reframe possibility:** None. "Here is a catalog of our internal registry entries with their source file paths" is not a user-facing concept.

**Recommendation: DEV-GATE.** `defaultVisible: false` is already set — it won't appear in default tile state. The dev-gate prevents it from appearing in the tile menu for non-dev users. 1 feature-flag line.

### Command Deck (`command-deck-section`)

**What it renders:** `CommandDeckShell` — reads `hotkeyRegistry.getActive()` and `commandRegistry.getAll()`, displays commands with their keyboard shortcuts, perspectives, and contract boundaries.

**Is it different from the hotkey-invoked palette overlay?** Yes, meaningfully. The tile is a persistent reference panel (command list + hotkeys always visible). The command palette (`Ctrl+K`) is a searchable overlay for executing commands. Both serve different mental models.

**Reframe possibility:** Strong. A "Keyboard Shortcuts" or "Commands" tile showing available actions with their hotkeys is a genuine user-facing feature. The current "Command Deck" label and some internal terminology ("readOnlyShell", "contractBoundary" text from `commandDeck.readOnlyShell` i18n key) lean dev.

**Recommendation: KEEP AND RENAME.** Rename tile label from "Command Deck" to "Keyboard Shortcuts". Audit the `commandDeck.*` i18n strings for dev-language (the "readOnlyShell" and "contractBoundary" labels are visible — replace with user-language equivalents). This is a MED complexity rename, ~1 commit.

### Graph Visual Inventory (`graph-visual-inventory-section`)

**What it renders:** `GraphVisualInventoryPanel` — enumerates all entries from 7 registries (graphViewElement, graphVisualThemeMapping, motionSafety, syntheticAudioSignal, musicReactiveMappings, audioSources, lensRegistry, physicsDialectRegistry) with debug mode toggles (detailMode, themeEvidenceMode, themeApplicationMode, diagnosticMode). Purple-bordered "Graph Evidence Detail Mode" section.

**Reframe possibility:** Very limited. This is a developer evidence browser — the "detail mode", "theme evidence mode", "theme application mode", and "diagnostic mode" toggles are explicitly debug tooling. The content (registry entry lists) has no value to end users.

**Recommendation: DEV-GATE.** Same as System Index — `defaultVisible: false` is set; dev-gate prevents it from appearing for normal users. 1 feature-flag line.

---

## §6 — AgentChatPlaceholder → minimal real chat

### 6.1 Current state

**Component:** `src/control-plane/agent/AgentChatPlaceholder.tsx` — 11 lines. Renders title/description/status from i18n:
```
title: "Agent Chat"
description: "Local agent chat surface. Wires to the agent infrastructure in a future pass."
status: "Placeholder — not connected."
```

**Registration:** `tileSectionRegistry.ts:125-138` — `id: "agent-chat-section"`, `label: "Agent Chat"`, `category: "left-panel"`, `defaultVisible: false`. `contentTestId: "agent-chat-placeholder"`.

**React component:** `src/control-plane/agent/AgentChatPlaceholder.tsx`.

### 6.2 Integration architecture recommendation

**Option B — Tauri command proxy** is the right call for LumaWeave for three reasons:
1. **Pattern consistency.** All external I/O in LumaWeave goes through Tauri commands (`list_files`, `read_file`, `run_script`). A direct `fetch()` to Ollama would be the only exception and would require navigating webview CORS rules.
2. **Forward-compat.** The Cerebra IPC swap (post-v1.0) becomes a one-line Rust change — same `invoke("chat_with_ollama", { messages })` call from the frontend, different Rust backend.
3. **Auditable security surface.** The Tauri command layer is where security decisions live in this codebase. Keeping Ollama access there means the call can be validated and sandboxed the same way as file access.

**Option A caveat:** If Ollama is confirmed to run on `http://localhost:11434` without CORS restrictions in Tauri's webview, Option A would work and save 1 commit. Worth verifying in an investigation brief before committing to Option B's Rust surface.

**Recommendation: Option B, but investigation-brief-first.** This introduces the first new Tauri Rust command since v109 and should have a 1-page investigation brief before implementation.

### 6.3 Minimum-viable chat UI shape

For v1.0:
- **Message list:** scrollable, user messages right-aligned, assistant messages left-aligned, basic theming via `--lw-*` tokens
- **Input:** text area + send button; Enter sends, Shift+Enter new line
- **Loading state:** typing indicator or spinner during Ollama response
- **Error state:** "Could not connect to Ollama — is it running?" with a retry button
- **Persistence:** ephemeral per tile open/close session (no history saved — Cerebra will own that post-v1.0)
- **Model:** hardcoded to a default (e.g. `llama3.1` or configurable via settings store field) — no model picker for v1.0

### 6.4 Forward-compat hooks

The Tauri command shape (`invoke("chat_with_ollama", { messages: ChatMessage[] })`) becomes the IPC interface that Cerebra will replace. Document in the Rust command file: "This command is a forward-compat stub for Cerebra's agent IPC. When Cerebra's local agent is ready, this command routes to its socket instead of Ollama directly."

---

## §7 — Other dev-artifact bleed

### 7.1 Console output audit

**Legitimate (keep — operational error handlers):**
- `settings.store.ts:69` — `console.error("Failed to save settings to localStorage:", error)` — boundary error
- `QaPanel.tsx:49,273,482` — `console.error` on clipboard/parse failures — boundary
- `ErrorBoundary.tsx:23,34,51` — `console.error("[LumaWeave] Uncaught error in React tree", ...)` — intentional boundary logging
- `themeOverrideStorage.ts:131,144` — `console.error` on load/save failures — boundary
- `ThemeMappingPanel.tsx:49` — `console.error("Failed to set override:", error)` — boundary
- `SigmaGraphView.tsx:489,810` — `console.error("[gwells] failed to apply dialect", ...)` — runtime failure logging
- `gwells/engine.ts:36,71,438,448,503` — `console.warn` on seed/step/decoration failures — operational
- All `console.warn` in `buildGraphologyGraph.ts`, `themeTokens.ts`, `themeSelectableColors.ts`, `radialBackbone.ts`, `InspectorMiniGraph.tsx` — operational warnings with clear labels

**Debug bleed (remove or DEV-guard):**

| File | Line | Content | Recommendation |
|---|---|---|---|
| `src/physics/gwells/engine.ts` | 594 | `` console.log(`[gwells] applied dialect '${dialect.id}'`) `` | Remove — fires on every dialect apply, pure debug trace |
| `src/physics/gwells/seeders/parallelSpines.ts` | 351 | `` console.log(`[parallelSpines] Seeded ${seededPositions.size} spine positions...`) `` | Remove — fires on every seed, pure debug trace |
| `src/physics/gwells/seeders/radialBackbone.ts` | 332 | `console.log(...)` (seeded positions log) | Remove — same pattern |

Three `console.log` calls in gwells internals with no error handling context — pure instrumentation that should have been removed. **2 additional files beyond the two confirmed — grep for `console.log` in `radialBackbone.ts:332` confirms a third.**

### 7.2 `window.__lw*` globals

15+ globals exposed unconditionally across src/:

| Category | Globals | Load-bearing? |
|---|---|---|
| **Test/minimap-critical (keep)** | `__lwSigma` (useMinimapCamera, MinimapSnapshotCanvas, useMinimapNavigation), `__lwStore` (settings.store.ts:81), `__lwTauriMock` (tauri-invoke.ts), `__lwOverrideVersion` (HistoryTab), `__lwLastThemeTargetProbeResult`, `__lwPinnedInspectorEntity`, `__lwRunThemeTargetProbe` | Yes — test infrastructure and minimap navigation depend on these |
| **Dev convenience (guard)** | `__lwCommandRegistry`, `__lwPhysicsDialectRegistry`, `__lwLensRegistry`, `__lwFontAxisRegistry`, `__lwHotkeyRegistry`, `__lwAudioSourceRegistry`, `__lwAnimationPrimitiveRegistry`, `__lwTileDocking`, `__lwAccessibilityProfile`, `__lwPaletteGeneration`, `__lwCameraController` | No — console inspection conveniences only |

**Recommendation:** Guard the dev-convenience group behind `if (import.meta.env.DEV)` blocks. These are exposed for devtools access; they don't need to be visible in production builds. The test-critical group must stay unconditional (or they'd break E2E — same issue that led to `window.PLAYWRIGHT = true` being unconditional).

**CAUTION:** This would be a code change touching 10+ files in distinct subsystems. Coordinate with the v111.4-era finding that `window.PLAYWRIGHT = true` is unconditional — ensure the DEV guard doesn't accidentally exclude test contexts. **Not an immediate v112 priority;** best handled in v114 (security + dependency hygiene arc) where it can be done with full test verification.

### 7.3 Debug UI surfaces

No additional dev UI surfaces found beyond the §5 named tiles. `StatusCluster` was cleaned in v110.1. No "diagnostics panel" outside the tile system.

### 7.4 ARIA labels / tooltips

**One confirmed dev-language hit:**
- `src/control-plane/settings/categories/CategoryTheme.tsx:263` — `title={!area.live ? 'Coming in a later v102 phase' : undefined}` — screen readers will announce this on the disabled button. Replace with `"Coming soon"` (covered in §1 string scrub).

No other dev-language in `aria-label` or `title` attributes found.

### 7.5 Empty states

**Confirmed dev-language:**
- `agent-chat-placeholder` renders `"Placeholder — not connected."` (en.json:369) — user-visible. Replace with `"Not yet connected — coming in a future update."` OR remove once real chat is wired (preferred).

**Acceptable empty states (user-language):**
- `inspector.code.noProvenance: "No provenance data found for this target."` — clear
- `inspector.history.noEdits: "No edits yet for this target."` — clear
- Graph source empty state messages — confirmed user-language in existing i18n

---

## §8 — Pass shape and sequencing for v112

### Proposed sub-pass structure

| Sub-pass | Scope | Rationale | Est. commits |
|---|---|---|---|
| **v112.1** | String scrub — arc-number placeholders (§1) + gwells console.log removal (§7.1) | Lowest-risk, highest-polish density. The gwells logs are confirmed debug output; removing them is clean. All in the same "mechanical cleanup" bucket. | 1 commit |
| **v112.2** | Theme menu Export sub-area (§4 Export) | Self-contained: add `theme:exportBundle` handler in AppShell + wire Export sub-area. All data exists. | 1-2 commits |
| **v112.3** | Inspector stub spokes — Type MVP (typography role cards) + Motion MVP (reduce-motion toggle + motionSafetyRegistry display) + Layout honest placeholder (text only) (§3) | Three spokes, one commit each OR combined. Layout is text-only (covered by v112.1 string scrub already). Type and Motion need real component work. | 2 commits (Type + Motion; Layout handled in v112.1) |
| **v112.4** | Dev tile triage — System Index dev-gate, GVI dev-gate, CommandDeck rename + i18n cleanup, QaPanel dev-gate (§5) | Per-tile decisions, mostly low-risk except CommandDeck rename (needs i18n). | 2-3 commits |
| **v112.5** | AgentChatPlaceholder → Ollama chat — investigation brief first, then implementation (§6) | Investigation brief is 0 commits; implementation is 2-3 commits. | 2-3 commits (post-brief) |
| **v112.6** | BookmarkSubArea: remove from menu OR keep-and-update (§4 Bookmarks decision) | 1 line change (remove from SUB_AREAS or update text). | 0-1 commits |
| **v112.7** | Arc close — semver 0.18.0 → 0.19.0, NOW.md + ROADMAP reconcile | Standard arc-close pattern. | 1 commit |

**Total estimate: 9-13 commits.** Wider than v110 (3 commits), similar to v111 (8+ commits before CI detour). The Ollama integration (v112.5) is the biggest unknown; if the Tauri command Rust surface surfaces surprises, it could add amendments.

### 8.1 Combinations

**v112.1 already absorbs:** arc-number string scrub + gwells console.log + CategoryTheme tooltip fix + AgentChatPlaceholder description/status fix + PackageDependencyConfigForm "coming soon" update + Layout spoke placeholder text update (since Layout is text-only in §3). These are all one PR with no cross-subsystem risk.

**v112.3 + v112.4** could combine if scope is tight — both are "wire registries + rename" work. Keeping them separate is safer because the spoke changes (v112.3) touch the inspector registry and test coverage, while tile changes (v112.4) touch tileSectionRegistry and settings migrations (if dev-gate is feature-flag-based).

### 8.2 Splits

**v112.5 must split:** investigation brief (0 commits, confirms Option B/CORS behavior) → implementation. Don't start writing Rust before the brief confirms Option A vs B.

### 8.3 Dependency order

```
v112.1 (strings) → unblocks: v112.3 (Layout spoke text done), v112.5 brief
v112.2 (export) — independent
v112.3 (spokes) — after v112.1
v112.4 (tiles) — independent; settings migration risk means run typecheck before commit
v112.5 (chat) — after brief confirms architecture
v112.6 (bookmarks decision) — independent; 1 line
v112.7 (arc close) — after all above
```

### 8.4 Total commit estimate

9-12 committed changes (some sub-passes may need amendment commits for typecheck failures). v112 is the widest arc in recent history by surface area but not by depth — most changes are targeted substitutions, not architectural rewrites.

---

## §9 — Pre-flight decisions for Ryan

### D1 — Arc-number placeholder strings (§1)

Three spoke messages + two CategoryTheme locations + AgentChatPlaceholder + command description:

**Investigator recommendation:** All are simple substitutions — substitute with user-language as specified in §1. No decisions needed beyond confirming the proposed wording is acceptable.

> Confirmed wording choices to verify:
> - Type: `"Typography controls are in development."`
> - Motion: `"Animation and motion controls are in development."`
> - Layout: `"Physics layout controls are in development."`
> - Theme stubs: `"Coming soon"` (consistent with existing `inspector.placeholder.coming` key)
> - Workshop command description: remove "(coming soon)"
> - Agent Chat status: `"Not yet connected — coming in a future update."` OR remove (preference?)

### D2 — Hardcoded → registry wiring (§2)

**Investigator recommendation:** DEFER PaletteCategoryChips wiring to a registry-hygiene arc. No v112 wiring needed. The `SUB_AREAS` list is intentional configuration, not a registry divergence.

### D3 — Inspector stub spokes (§3)

| Spoke | Recommendation | Requires |
|---|---|---|
| Type | MVP: read-only typography role cards from `typographyRegistry` | New component (1 commit) |
| Motion | MVP: Reduce Motion toggle + motionSafetyRegistry display | New component (1 commit) |
| Layout | Honest placeholder (text only) | Covered in string scrub |

> Confirm: Is a read-only type-specimen display in the Type spoke valuable for v1.0, or defer the whole spoke until axis sliders are ready?

### D4 — Theme menu sub-areas (§4)

| Sub-area | Recommendation | Notes |
|---|---|---|
| Workshop | Honest placeholder ("Coming soon") | No v112 feature work |
| History | Honest placeholder ("Coming soon") | 2-commit MVP for v113+ |
| Bookmarks | **REMOVE FROM MENU** | No theme-bookmark infrastructure; confuses users |
| Export | **MVP in v112** — handler + button | Data exists; 1-2 commits |

> Confirm: Remove Bookmarks from menu, or keep as "Coming soon" to signal roadmap intent?

### D5 — Dev tooling tiles (§5)

| Tile | Recommendation | Notes |
|---|---|---|
| QaPanel | Dev-gate full tile; extract feedback survey to standalone tile (future arc) | MED complexity |
| System Index | Dev-gate | Clean, 1 flag |
| Command Deck | Keep + rename to "Keyboard Shortcuts" + i18n cleanup | User-facing feature |
| Graph Visual Inventory | Dev-gate | Clean, 1 flag |

> Confirm: What's the preferred dev-gate mechanism — URL param (`?dev=true`), settings store toggle, or build-time `import.meta.env.DEV` flag?
> The choice affects how developers access these tiles in production builds and whether a shipped build can expose them at all.

### D6 — AgentChatPlaceholder integration architecture (§6)

**Investigator recommendation: Option B (Tauri command proxy)** — aligns with existing Tauri discipline and forward-compat for Cerebra IPC. Requires an investigation brief before implementation to confirm CORS behavior and finalize the `invoke()` interface shape.

> Confirm: Option A, B, or C? Brief before implementation?

### D7 — Console output, `__lw*` globals, empty states (§7)

| Item | Recommendation |
|---|---|
| 3 `console.log` in gwells (engine.ts:594, parallelSpines.ts:351, radialBackbone.ts:332) | Remove in v112.1 string scrub pass |
| `window.__lw*` dev-convenience globals | Defer to v114 security arc — too many files, needs full test verification |
| Agent Chat "Placeholder — not connected." | Update text in v112.1 OR remove when real chat ships in v112.5 |

### D8 — v112 sub-pass shape

**Investigator recommendation:** 7 sub-passes as proposed in §8 (v112.1–v112.7). Not consolidated further — the tile triage (v112.4) and Ollama chat (v112.5) have different risk profiles that benefit from separate commits. v112.5 should not begin without an investigation brief.

---

*Report complete. Nine sections. File:line citations throughout. Planning Claude reads + works through §9 decisions with Ryan; then scopes v112.1 implementation brief.*
