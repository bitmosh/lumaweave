# Investigation brief — v110.0 real-source bugs + identity + ErrorBoundary

**For:** Terminal Claude · **Output:** one markdown report dropped into PK as `v110_0_real_source_identity_boundary_report.md` · **No code changes, no commits, no installs.**

v110 is the first arc of the ship-readiness home stretch per `~/Projects/lumaweave/docs/SHIP_READINESS_ROADMAP.md` §3. Three concerns bundled into one arc because they share a common quality: each is "ship-blocker hygiene" — discrete issues, all surface-level, none architecturally deep, but each must land before v1.0.

This brief surfaces the architectural decisions Ryan needs to make before v110 implementation can scope. Three open questions from ROADMAP §5:

1. **ErrorBoundary scope** — root-only, or root + per-major-subsystem?
2. **Identity rename surfaces** — beyond `tauri.conf.json`, what else carries the "starmap" identity?
3. **Real-source bug 2 fix shape** — dynamic testid selector vs unified naming?

Each question gets a dedicated section with: investigation of current code, options analysis with tradeoffs in product terms (not just engineering preference), and recommendation with reasoning.

**Hard stops:**
- No code changes. No commits. No installs.
- Cite file:line for every claim about current code.
- For React best-practice claims, cite the React docs URL or a reputable reference.
- Tradeoff analysis on every recommendation, in product-language where possible (Ryan is the decision-maker; surface what the choice means for users + maintainers, not just code structure).

---

## §1 — Current state confirmation

Quick anchors:
1. Confirm v109 close commit (semver 0.16.0, NOW.md header reflects v109 closed and v110 open).
2. Confirm SHIP_READINESS_ROADMAP.md is in the repo and §3 lists v110 sub-passes as described.
3. Confirm the two real-source-mode bugs are still present:
   - `src/control-plane/inspector/ThemeTargetInspectorOverlay.tsx:149-184` — panel right-edge overflow (cite the actual layout/positioning code)
   - `src/control-plane/inspector/ThemeTargetInspectorOverlay.tsx:42` — Sigma selector hardcoded fixture testid (cite the exact selector string)
4. Confirm `src/control-plane/StatusCluster.tsx:14-15` still returns hardcoded "settling" (the v89+ deferred wiring).
5. Confirm `tauri.conf.json`'s current `productName`, `identifier`, `title` fields.

---

## §2 — ErrorBoundary scope decision

### 2.1 Current state

Search `src/` for any existing ErrorBoundary usage. Expected: none (per the audit's finding). Confirm or correct.

Identify the **major subsystem boundaries** in the current app structure — natural "wrap me in a boundary" candidates. Likely candidates based on the codebase architecture:

- The AppShell root itself (the very top)
- The graph canvas (`AppShell` → Sigma rendering tree)
- The tile workspace (all docked/floating tiles collectively, or each tile individually?)
- The radial inspector
- The settings panel
- The source-adapter panel

For each, briefly describe what it does and what a crash there would mean for the user.

### 2.2 The two strategies

**Option A — Root-only ErrorBoundary.** A single boundary at the AppShell root. Catches every uncaught exception in the entire React tree. Recovery UI replaces the whole app surface.

- Pro: simple. One boundary, one recovery UI to design, easy to maintain.
- Pro: covers everything — including future code we haven't written yet, with zero additional work.
- Con: a bug anywhere takes down the whole app from the user's perspective. The graph view, tiles, inspector all disappear when (say) the settings panel's `useEffect` throws.
- Con: less informative recovery UI — "Something went wrong" with a "Reset settings" / "Reload app" button is the realistic shape, vs. a per-subsystem boundary that could say "The radial inspector crashed. Close it and continue."

**Option B — Root + per-subsystem boundaries.** Boundary at AppShell root plus boundaries around each major subsystem (graph canvas, tile workspace, inspector, etc.). Root boundary is the catch-all for things outside the subsystems; subsystem boundaries are scoped recovery.

- Pro: subsystem failures are contained. A radial inspector crash shows a "this tile crashed, click to dismiss" in just the inspector area; the graph + tiles keep working.
- Pro: more informative recovery — the user can keep using the parts that work.
- Pro: better debugging — knowing *which* boundary caught an error narrows the search.
- Con: more code. Every subsystem needs a wrapper. Every wrapper needs a recovery UI (or shared fallback).
- Con: developers must remember to wrap new subsystems. Easy to drift over time.
- Con: design overhead — each boundary's failure UI is a small product decision.

**Option C — Root-only for v1.0, per-subsystem post-v1.0.** Pragmatic middle path. Ship root-only now, plan per-subsystem as a follow-on arc if real-world failures show they're needed.

- Pro: minimum viable safety for v1.0. Eliminates white-screen-of-death entirely.
- Pro: easy upgrade path — boundaries can be added later without rewriting.
- Con: less polished failure UX in v1.0.

### 2.3 Recommendation

Recommend with reasoning *in product terms*: what does each option mean for a user encountering an error in shipped LumaWeave?

For a dev tool dogfooded on the user's own data, the realistic failure scenarios are: a malformed source file confusing an adapter, a settings store corruption, an unexpected graph shape breaking a renderer. How catastrophic each is, and whether per-subsystem boundaries meaningfully improve recovery, depends on which subsystems are most likely to fail.

Consider: does LumaWeave's *current* failure pattern (the v105 zombie-port, the v108 normalizer divergence, the v109.1 Buffer polyfill, the various radial-inspector bugs) suggest that a per-subsystem strategy would have helped? If yes → lean B. If most failures would have crashed everywhere anyway → lean A.

### 2.4 Recovery UI shape

Whichever option is recommended, sketch the recovery UI:
- What does it look like? (Title text, body, action buttons)
- What actions does it offer? Recovery options to consider:
  - Reload the app (Tauri-specific: how does this work? `window.location.reload()`, `appWindow.reload()`, full app restart?)
  - Reset settings to defaults (the corruption case)
  - Show the error details (toggle to expand stack trace for the user to copy/share)
  - Copy error to clipboard (so the user can send a bug report)
- Visual treatment: should it match LumaWeave's plasma/aurora aesthetic, or be deliberately stark (signaling "this is broken, don't expect normal UI")?

---

## §3 — Identity rename surfaces

### 3.1 Current state — where does "starmap" appear?

Grep the entire repo for `starmap` (case-insensitive). Report every occurrence with file:line and context:
- `tauri.conf.json` — known
- `Cargo.toml` — verify name field, package field
- Any other `.toml`, `.json`, `.yaml`, `.yml` config files
- Any `.rs` files (Rust hardcoded strings)
- Any `.ts`/`.tsx` files (TypeScript hardcoded strings, comments, etc.)
- Documentation files (README, blog posts, docs/)
- Test files

### 3.2 The categorization

For each occurrence, classify:
- **Must rename** — affects user-visible identity (app name, window title, dock label, About dialog, executable name)
- **Should rename** — internal identifiers that link to the user-visible identity (`com.boop.starmap` bundle id; if it changes, things like macOS Gatekeeper signing identity change)
- **Could rename** — historical references in old docs, blog posts, etc. Cleanup but not blocking
- **Don't rename** — anything that's intentional or where renaming would break something (e.g. if `starmap` is a Cargo package name and renaming would invalidate the build cache or registry references)

### 3.3 Specific Tauri 2 considerations

Tauri 2 has known gotchas around `productName` vs `identifier` changes:
- Changing `identifier` (bundle id) means OS-level settings under the old id are abandoned (a fresh install state). Generally fine for pre-1.0 software but worth knowing.
- Window title is `tauri.conf.json.app.windows[].title`
- macOS dock label, About dialog name = `productName`
- Linux .desktop file name (if shipping AppImage/.deb) — gets generated from `productName`
- Windows executable name — also `productName`-derived

Confirm or correct from Tauri 2 docs.

### 3.4 Cargo.toml specifically

The `Cargo.toml` `[package].name` field affects:
- The compiled Rust binary name (if not overridden elsewhere)
- The crate name in any `use` statements (internal to src-tauri)
- The dev workflow (`cargo run -p <name>` etc.)

Renaming this means: refactoring any imports + dev commands. Manageable, but it's *code change*, not just config. Report whether `Cargo.toml` is genuinely separate from `tauri.conf.json` here or whether Tauri 2's tooling links them.

### 3.5 Recommendation

Concrete rename plan:
- Exact files to change
- Order they need to change in (dependencies between changes)
- What needs to be tested after rename (window title visible, dock label, About dialog, app launches cleanly, build artifacts named correctly)
- Anything to defer until post-v1.0 (e.g. signing identity, distribution channels)

---

## §4 — Real-source bug 2 fix shape

### 4.1 Current state

Read `src/control-plane/inspector/ThemeTargetInspectorOverlay.tsx:42` and quote the exact code. Per the audit:
- The Sigma selector hardcodes `[data-testid="self-graph-fixture-loaded"]`
- In real-source mode, the testid on the loaded canvas is `[data-testid="graph-viewport"]`
- Result: in real-source mode, the overlay's Sigma reference is null → graph primitives can't be pinned via the inspector

Confirm by reading the actual code. Also locate where the two testids are *set* in their respective rendering paths:
- Search for `self-graph-fixture-loaded` — confirm the fixture-mode test surface that sets it
- Search for `graph-viewport` — confirm the real-source path that sets it
- Are these the canonical testids, or are there other testids on related elements that might be more appropriate?

### 4.2 The three options

**Option A — Dynamic testid selector.** The overlay component reads which source mode is active (from settings store) and selects the appropriate testid.

```tsx
const isFixtureMode = useSettingsStore(s => /* is the current source the fixture? */);
const sigmaSelector = isFixtureMode ? `[data-testid="self-graph-fixture-loaded"]` : `[data-testid="graph-viewport"]`;
```

- Pro: surgical, minimal code change
- Pro: both modes keep working as designed
- Con: the overlay knows about source modes — leaky abstraction
- Con: future source modes (Cerebra vault, etc.) might add new testids → growing switch

**Option B — Unified testid (rename for consistency).** Pick one canonical testid (probably `graph-viewport`) and apply it to both the fixture rendering path and the real-source rendering path. The overlay then uses a single selector.

- Pro: clean abstraction — the overlay doesn't know about source modes
- Pro: future source modes inherit the canonical testid
- Con: the rename affects every E2E spec that targets `self-graph-fixture-loaded` — multiple test files need updating
- Con: if `self-graph-fixture-loaded` is semantically distinct ("this specifically signals the fixture is loaded, not just any graph"), the unification might erase meaningful information

**Option C — Both testids on both elements.** Always render *both* testids on the graph viewport element, in both modes. The overlay uses one (whichever feels right); existing tests targeting the other still work.

```tsx
<div data-testid="graph-viewport" data-testid-legacy="self-graph-fixture-loaded">
```

- Pro: zero test changes needed; both selectors work everywhere
- Pro: clean migration path (deprecate old testid over time)
- Con: testids aren't designed to be multiple per element — though `data-*` attributes can stack
- Con: violates "one canonical testid per element" testing best practice

### 4.3 Recommendation

Recommend with reasoning. Consider:
- How many tests reference `self-graph-fixture-loaded`? (Grep and count.) If <5, the rename in Option B is trivial. If many, Option A's surgical fix is less disruptive.
- Is the distinction between fixture-loaded and graph-viewport semantically meaningful? Fixture-loaded signals "specifically the fixture data is rendered"; graph-viewport signals "any graph is rendered." Are there tests that genuinely need the more-specific signal?
- What about future source adapters? When the user loads markdown-vault, does the canvas testid become `graph-viewport` or something else? If `graph-viewport` is the universal "any source loaded" testid, Option B aligns naturally.

Also: which option does the E2E test that's currently *skipped* (per the audit) want to assert against?

### 4.4 Re-enabling the skipped E2E

The fix lands with the skipped test re-enabled. Sketch what that test should assert — that the overlay's Sigma reference is correctly attached in real-source mode (the inspector can be invoked, a primitive can be pinned). Don't write the spec; just outline what it covers.

---

## §5 — Recommended pass shape for v110

Given §2-§4 findings + the ROADMAP §3 v110 sub-pass structure (v110.0 through v110.6), confirm or amend the sub-pass split:

- v110.0 — investigation brief (this report) → decisions locked → v110.1 begins
- v110.1 — identity rename (1 commit, scoped per §3 recommendation)
- v110.2 — ErrorBoundary implementation (1 commit per Option A; possibly 2 commits per Option B)
- v110.3 — real-source bug 1 (panel overflow) + re-enabled E2E (1 commit)
- v110.4 — real-source bug 2 (testid fix) + re-enabled E2E (1 commit)
- v110.5 — StatusCluster `useLayoutState` resolution (1 commit)
- v110.6 — arc close (semver 0.16.0 → 0.17.0)

Each sub-pass: tightly scoped, single concern, mergeable independently. Recommend whether any pair should combine (e.g. v110.3 + v110.4 are both ThemeTargetInspectorOverlay edits — could be one commit) or whether any should split further.

Estimated overall scope across all v110 sub-passes (no hours — Ryan manages clock; just commit count and complexity rating per pass).

---

## §6 — Pre-flight decisions Ryan needs to confirm

Aggregate the recommendations from §2, §3, §4, §5 into a single checklist Ryan can work through:

1. **ErrorBoundary scope:** Option A (root-only) / Option B (root + per-subsystem) / Option C (root for v1.0, per-subsystem post-v1.0). Recommend X because Y.
2. **Recovery UI actions:** which subset of {reload, reset settings, show details, copy to clipboard}? Recommend X.
3. **Recovery UI visual:** aesthetic-match vs deliberately-stark. Recommend X.
4. **Identity rename scope:** the full list of must/should/could from §3.2. Confirm the list.
5. **Cargo.toml rename:** yes / no / wait-for-Cargo-build-verification. Recommend X.
6. **Real-source bug 2 fix:** Option A (dynamic selector) / Option B (unified testid) / Option C (dual testid). Recommend X because Y.
7. **v110 sub-pass shape:** adopt the 6-sub-pass split as described / merge any / split any. Recommend.

Each item gets investigator's recommendation + reasoning. Ryan picks; planning Claude scopes implementation from the locked decisions.

---

## Output format

One markdown file in PK as `v110_0_real_source_identity_boundary_report.md`. Six sections numbered as above. File:line citations, doc-URL citations for React + Tauri 2 claims, LOW/MED/HIGH ratings where relevant. Tradeoff analysis in product-language. When complete: ping back; planning Claude reads + works through §6 with Ryan; then scopes v110.1+.
