# Bandit — v112.6: polish sweep + arc close

Final two commits of the v112 arc. Closes UI completeness with the settings opacity regression fixed and pre-existing test failures resolved.

- **v112.6.0** — polish sweep: opacity regression + status-cluster i18n + i18n.spec.ts:187. Diagnose-then-fix with explicit STOP if any diagnosis surfaces architectural concerns.
- **v112.6.1** — arc close: semver 0.18.0 → 0.19.0, NOW.md reconcile, ROADMAP v112 LANDED, KNOWN_SHARP_EDGES (~10 entries).

After v112.6 lands, v112 closes at 0.19.0 and v113 (source adapter UX maturity) becomes the next active arc per ROADMAP §3.

Basis: `~/Projects/lumaweave/docs/SHIP_READINESS_ROADMAP.md` §3 (v112) + `POLISH_DEBT_RUNNING.md` (opacity entry) + Ryan-locked decisions (polish at close + Path C diagnostic discipline + two-commit split).

Generic rules: `~/Projects/CLAUDE.md`; project: `~/Projects/lumaweave/CLAUDE.md`; Discord/gates: `~/Projects/DISCORD_PROTOCOL.md`.

## ⏩ BANDIT PASS PREFACE (each commit)
0. Discord MCP else HALT. 1. START→#current-task. 2. Work+verify. 3. END→#current-task. 4. MERGE GATE→#approve-this (1506441138612080680). 5. END-OF-RUN REPORT→#changelog w/ SHA. 6. BUMP+PUSH GATE→#approve-this.

**v112.6.1 IS the semver-bump commit.** 0.18.0 → 0.19.0.

## v112 arc context

- v112.1 (`d5319d8`) — string scrub + 3 gwells log removals
- v112.2 (`2823b1f`) — theme export sub-area MVP
- v112.3 (`92c6696`) — Type spoke MVP
- v112.3a (`874ef58`) — Motion spoke MVP
- ~~v112.4 — Bookmarks placeholder~~ (SKIPPED, deferred to Theme menu population audit)
- v112.4.0 (`e5f3847`) — dev-mode toggle + tile gating infrastructure
- v112.4.1 (`f661298`) — dev-tile triage + Command Deck → Keyboard Shortcuts
- v112.4.2 (`d908450`) — Tiles popover stacking fix (Case B)
- v112.5b.0 (commit SHA per Bandit's records) — Rust InferenceBackend + RemoteClient + chat commands
- v112.5b.1 (`7dd11bf`) — AgentChatTile + Agents settings category + chat UI
- **v112.6.0 (THIS PASS, commit 1)** — polish sweep
- **v112.6.1 (THIS PASS, commit 2)** — arc close

---

## COMMIT 1 — `fix(v112.6.0): settings panel opacity binding + status-cluster i18n + i18n.spec.ts:187`

Diagnose all three failures first. If any one of them surfaces an architectural concern (not just a binding fix or assertion update), **STOP and surface to Ryan** before attempting fixes.

### Pre-flight diagnosis (Path C — verify, report, decide)

For each of the three failures, diagnose root cause and propose a fix shape. STOP collectively if any is architectural.

#### Diagnosis Target 1 — Settings panel opacity regression

From `POLISH_DEBT_RUNNING.md`: "Settings panel background no longer responds to opacity setting; other UI elements still respect the setting and transition correctly."

Investigation:

1.1 Locate the setting itself. Grep for `opacity` in `settings.schema.ts`, `settings.defaults.ts`. Quote the exact setting key path (likely `appearance.opacity` or similar).

1.2 Find where the setting is *consumed* across the codebase. Grep for the setting path in all `.tsx`, `.ts`, `.css` files. Quote each consumer.

1.3 Find the settings panel's own opacity binding specifically. The `.settings-panel` selector (or whatever class wraps the settings UI) should be reading the opacity variable. Quote its current CSS.

1.4 Compare consumers that work (the ones still respecting opacity per the bug description) vs. the settings panel binding. The diff should reveal the regression.

**Expected diagnosis (most likely):** the settings panel CSS lost a `--lw-opacity` (or similar) variable binding somewhere during recent settings-category work. Either:
- A class name changed and the CSS selector no longer matches
- A CSS variable name changed and the selector references the old name
- A wrapping element gained/lost an `opacity` property that's overriding the variable

**Fix shape (if diagnosis is small):** restore the broken binding. Should be a 1-3 line CSS change. **If diagnosis surfaces something architectural** (e.g., the entire opacity system was refactored and the settings panel was missed in the refactor, or the binding requires a JS-level change to a React component), STOP.

#### Diagnosis Target 2 — status-cluster i18n test failure

Flagged as "1 pre-existing i18n fail (status cluster order)" in v112.4.1's report.

Investigation:

2.1 Locate the test. Grep `tests/e2e/` for `status cluster` (or whatever the spec actually tests). Quote the failing assertion.

2.2 Identify the cluster order in the running app vs. what the test expects. The mismatch is the source.

2.3 Determine which is correct. Possibilities:
- The test is stale and the new order (post-v112.4.1's "Keyboard Shortcuts" rename or similar) is correct → fix the test
- The runtime ordering changed unintentionally → fix the runtime
- Both changed but the intent isn't clear → STOP and ask

**Most likely:** v112.4.1's command-deck rename to "Keyboard Shortcuts" affected the i18n string ordering in the status cluster. Updating the assertion to match the new string is the fix.

**Fix shape (if diagnosis is small):** 1-2 line assertion update. **If diagnosis reveals the runtime ordering itself is wrong** (e.g., a sort that no longer sorts), STOP.

#### Diagnosis Target 3 — i18n.spec.ts:187 failure

Flagged as "1 pre-existing failure in i18n.spec.ts:187" in v112.5b.1's report. Possibly the same root cause as Target 2; possibly distinct.

Investigation:

3.1 Read `tests/e2e/i18n.spec.ts` lines ~180-200. Quote the failing assertion + 5 lines of context.

3.2 Determine what the assertion tests.
- An overall i18n key count? (Easy to break with new keys added in v112.5b.1's Agents settings.)
- A specific string value? (Could be the Keyboard Shortcuts rename.)
- A duplicate-key check? (Could be the cleanup of `agent.chat.placeholder.*` keys vs new `agents.*` keys.)

3.3 Categorize:
- **Stale assertion:** simple update to new expected value
- **Real regression:** investigate the runtime
- **Coupled to Target 2:** mention as cascade fix in same commit

**Most likely:** v112.5b.1 added new `agents.*` keys and removed `agent.chat.placeholder.*` keys; if the spec hard-codes a key count, the count changed. Update the assertion.

**Fix shape (if diagnosis is small):** 1-2 line assertion update. **If diagnosis reveals actual i18n integrity issue** (duplicate keys, missing keys for declared locales), STOP.

### Diagnostic decision gate

After all three diagnoses are complete, summarize:

- Target 1 fix shape + LOW/MED/HIGH complexity
- Target 2 fix shape + LOW/MED/HIGH complexity
- Target 3 fix shape + LOW/MED/HIGH complexity

**If ALL three are LOW complexity:** proceed to fix in this commit.

**If ANY is MED or HIGH:** STOP. Report to Ryan with the diagnosis. Don't fix until directed.

### Files (explicit paths only — Commit 1)

Depend on diagnosis. Expected:

- Target 1: 1-2 CSS files (likely `SettingsPanel.css` or wherever the settings panel selector lives)
- Target 2: 1 test file (`tests/e2e/<status-cluster-spec>.spec.ts`)
- Target 3: 1 test file (`tests/e2e/i18n.spec.ts`)
- Maybe 1 component file if Target 1 needs React-level fix

Total: 3-5 files. Pre-flight identifies exact paths.

### Verify (Commit 1)

```bash
npm run typecheck
npm run lint:css
# Run the previously-failing specs:
npx playwright test tests/e2e/<status-cluster-spec>.spec.ts --reporter=line
npx playwright test tests/e2e/i18n.spec.ts --reporter=line
# Plus a smoke check that the opacity setting works:
# (Pre-flight identifies any spec that exercises the opacity setting; otherwise manual smoke.)
```

Expected:
- typecheck → 0
- lint:css → 0/0
- Both formerly-failing specs → pass
- No regressions in adjacent specs (run a quick sanity sweep: `npx playwright test tests/e2e/settings*.spec.ts` if reasonable)

### Manual smoke (Ryan, `npm run tauri dev`)

1. Open Settings → Appearance (or wherever the opacity setting lives)
2. Toggle/slide the opacity setting
3. Confirm Settings panel background opacity transitions match other UI elements
4. Confirm the transition is smooth (not jumpy or absent)
5. Toggle back to default; confirm clean restoration

### Commit 1 message

`fix(v112.6.0): restore settings panel opacity binding + update stale i18n assertions`

(Adjust the message if diagnosis surfaces different root causes than expected.)

MERGE GATE → commit (explicit paths only) → END-OF-RUN REPORT → bump+push gate.

### Hard stops (Commit 1)

- **Diagnose all three BEFORE fixing any.** Don't apply piecemeal fixes; ensure none is architectural before committing.
- **Path C escape hatch.** If any single diagnosis surfaces architectural complexity (not just binding/assertion fix), STOP and report. Don't attempt a fix that requires reshaping anything beyond what the failure suggests.
- **Update POLISH_DEBT_RUNNING.md.** Mark the opacity regression entry RESOLVED. If the format has a RESOLVED section, move it. If it's strikethrough, apply.
- **Minimum files changed.** No tangential cleanup in this commit; just the three targets.
- **No semver bump.** v112.6.1 handles that.

---

## COMMIT 2 — `chore(v112.6.1): v112 arc close — semver 0.18.0→0.19.0, NOW.md + ROADMAP reconcile, KNOWN_SHARP_EDGES (10 entries)`

Standard arc close. Docs and version bump only.

### Pre-flight (verify, report, STOP if diverges)

1. Confirm Commit 1 landed cleanly. CI shows fast jobs green.

2. Read `package.json` — should be `0.18.0`. Bump to `0.19.0`.

3. Read `src-tauri/Cargo.toml` — should also be `0.18.0` if tracking main semver. Bump in lockstep.

4. Read `docs/LUMAWEAVE_NOW.md` header — confirm current state shows v112 as the open arc.

5. Read `docs/SHIP_READINESS_ROADMAP.md` §3 v112 entry — confirm it's currently formatted as in-progress.

6. Read `docs/KNOWN_SHARP_EDGES.md` end-to-end. Identify which of the v112 lessons (listed below in Step 4) are already logged. New ones get added; existing ones get extended or left alone per the doc's convention.

### Files (explicit paths only — Commit 2)

- `package.json` — version `0.18.0` → `0.19.0`
- `src-tauri/Cargo.toml` — version `0.18.0` → `0.19.0`
- `docs/LUMAWEAVE_NOW.md` — header bump, v112 → closed, v113 → next, full commit table
- `docs/SHIP_READINESS_ROADMAP.md` — v112 LANDED annotation with all commit SHAs
- `docs/KNOWN_SHARP_EDGES.md` — add v112 lessons (~10 entries; some may already be logged)

Nothing else modified.

### Step 1 — Semver bump

`package.json`: `"version": "0.18.0"` → `"version": "0.19.0"`.
`src-tauri/Cargo.toml`: same.

### Step 2 — NOW.md reconcile

Update header:
- `Production version: 0.19.0`
- `Internal arc: v113 (Source adapter UX maturity — per SHIP_READINESS_ROADMAP §3 v113)`
- `Last closed: v112 (UI completeness + content substitution)`

Move v112 to closed-arc section with the full commit table. Be honest about the saga (skipped v112.4, popover hotfix v112.4.2, two-commit splits for v112.4 and v112.5b):

| Sub-pass | Commit | Work |
|---|---|---|
| v112.0 | (no commit) | Investigation brief — `v112_0_ui_completeness_report.md` |
| v112.1 | `d5319d8` | String scrub (arc-number bleed) + 3 gwells debug logs removed |
| v112.2 | `2823b1f` | Theme export sub-area MVP — global overrides as JSON download |
| v112.3 | `92c6696` | Inspector Type spoke MVP — read-only typography role cards |
| v112.3a | `874ef58` | Inspector Motion spoke MVP — Reduce Motion toggle + safety reference |
| ~~v112.4~~ | (skipped) | Bookmarks placeholder — deferred to Theme menu population audit |
| v112.4.0 | `e5f3847` | Dev-mode settings toggle + tile section gating infrastructure (schema v94) |
| v112.4.1 | `f661298` | Dev-gate QaPanel + system-index + graph-visual-inventory; Command Deck → Keyboard Shortcuts |
| v112.4.2 | `d908450` | Tiles popover stacking fix (Case B — backdrop-filter trap) |
| v112.5a | (no commit) | Investigation + architecture doc — `LUMAWEAVE_POST_V1_FEATURE_ARCHITECTURE.md`, `v112_5_agent_chat_report.md` |
| v112.5b.0 | (Bandit's SHA) | InferenceBackend trait + RemoteClient + chat/test_inference_connection Tauri commands |
| v112.5b.1 | `7dd11bf` | AgentChatTile + Agents settings category + chat UI (schema v95) |
| v112.6.0 | (Commit 1 SHA) | Polish sweep — opacity regression + status-cluster i18n + i18n.spec.ts:187 |
| v112.6.1 | this SHA | Arc close — semver 0.18.0 → 0.19.0 + docs reconcile |

v112 architectural notes:

- **UI completeness pivoted from "remove placeholders" to "substitute honest content."** Original ROADMAP wording was misleading — the actual work was substituting stub content with MVP content where registries had data ready, honest "Coming soon" language where they didn't, and dev-gating internal tooling that wasn't user-facing.
- **5 working surfaces graduated from stub to MVP:** Theme Export sub-area, Type inspector spoke, Motion inspector spoke, the dev-mode settings infrastructure, and the agent chat surface.
- **3 internal tiles dev-gated** (QaPanel, system-index, graph-visual-inventory) via a single `requiresDevMode` flag + new schema field + reactive subscription pattern.
- **First new direct Rust dep in months: `reqwest`** for the agent chat InferenceBackend. Audit-by-eyeball Rust kept within ~200 lines for the new inference module.
- **LumaWeave's first canonical architecture doc** authored as a v112 deliverable: `docs/canonical/LUMAWEAVE_POST_V1_FEATURE_ARCHITECTURE.md`. Defines the InferenceBackend trait shape, forward-compat hooks for Candle / Cerebra / Strudel, and the chat UI architecture.
- **Settings schema bumped twice** (v94 for dev mode, v95 for agents.inference). Both with sequential additive migrations.
- **Polish-debt sweep at arc close** — settings panel opacity regression resolved; pre-existing i18n test failures fixed.

Open-arc section: v113 per ROADMAP.

Preserve every previously-logged deferred item and standing arc.

### Step 3 — SHIP_READINESS_ROADMAP update

In `docs/SHIP_READINESS_ROADMAP.md`, find the v112 entry in §3. Add the **LANDED:** annotation per §6 living-document conventions. Mirror the v111 / v110 LANDED format.

```markdown
### v112 — UI Completeness + Content Substitution

**LANDED:** 2026-06-11

| Sub-pass | Commit | Work |
| ... | ... | ... |
(commit table here)

**Outcomes:**
- 5 working surfaces graduated from stub to MVP (Theme Export, Type spoke, Motion spoke, dev-mode infrastructure, agent chat)
- 3 internal tiles dev-gated behind settings toggle (QaPanel, system-index, graph-visual-inventory)
- Command Deck renamed to user-language "Keyboard Shortcuts"
- 11 user-visible arc-number-bleed strings scrubbed to user-language equivalents
- 3 debug `console.log` calls removed from gwells internals
- First new direct Rust dependency in months: `reqwest` with `rustls-tls` features (~200 lines of Rust for the inference module)
- First canonical architecture document: `docs/canonical/LUMAWEAVE_POST_V1_FEATURE_ARCHITECTURE.md`
- Settings schema migrated v93 → v94 → v95 with two sequential additive migrations
- Polish-debt sweep at close: settings panel opacity regression resolved; status-cluster and i18n.spec.ts:187 pre-existing failures fixed

**Deviations from planned sub-pass structure:**
- v112.4 (Bookmarks placeholder) skipped after disambiguating Theme Bookmarks vs. graph FloatingBookmark system; Theme menu population deferred to a dedicated audit
- v112.4.2 added as hotfix during arc — tiles popover stacking fix (Case B stacking-context trap from backdrop-filter on .lw-status-bar)
- v112.5 split into v112.5a (investigation + architecture doc) and v112.5b (two-commit implementation: .0 Rust, .1 frontend)
- v112.6 split into v112.6.0 (polish sweep) and v112.6.1 (arc close)

**Pivot in framing:**
- Original ROADMAP v112 wording was "remove placeholders" — misleading. Actual work was "substitute honest content for stub content while keeping feature scaffolding intact." Ryan caught the framing error in v112.0 review; the report was rewritten as a per-surface assessment with MVP / honest placeholder / remove decisions per area.
```

Mark v113 as `[NEXT]`.

### Step 4 — KNOWN_SHARP_EDGES additions

Per pre-flight identification, append entries for unlogged v112 lessons. Ten total expected:

#### Lesson 1 — `useSyncExternalStore` + named event = reactive subscription pattern

```markdown
### Reactive UI subscriptions: `useSyncExternalStore` + named lifecycle event

**Symptom:** A UI surface needs to update when external state changes (settings, store, registry). useState/useEffect with polling is wasteful and laggy; manual subscriptions create cleanup bugs.

**Correct pattern:** `useSyncExternalStore` hook from React 18+, subscribing to a named lifecycle event:

```tsx
const overrides = useSyncExternalStore(
  (callback) => {
    window.addEventListener("lw:override-change", callback);
    return () => window.removeEventListener("lw:override-change", callback);
  },
  () => themeOverrideStorage.loadOverrides()
);
```

Replaces older patterns (`useEffect` + manual subscribe + cleanup, polling via setInterval). Solves React 18+ tearing (concurrent renders seeing inconsistent external state).

**LumaWeave conventions:**
- Lifecycle event names use `lw:` prefix and kebab-case (e.g., `lw:override-change`, `lw:settings-change`)
- Events dispatched on `window`, NOT `document`
- The snapshot function (second arg) reads the current state from the external store

**First encountered:** v112.2 (theme export sub-area's reactive button enable/disable on override count).
```

#### Lesson 2 — i18n key paths for inspector spokes

```markdown
### i18n key paths for inspector spokes: `inspector.spokes.<id>.*`, not `inspector.<id>.*`

**Symptom:** TypeScript strict mode or pre-flight catches an i18n key lookup that doesn't resolve — the assumed path `inspector.<id>.*` is wrong; the actual structure is `inspector.spokes.<id>.*`.

**Cause:** Inspector spokes are namespaced under `spokes` because the inspector itself has other concerns (ring rendering, gesture handling) that own the top-level `inspector.*` slot. Each spoke gets its own sub-namespace under `spokes`.

**Correct pattern:** When writing or editing inspector spoke code, i18n keys live at:
```
inspector.spokes.<id>.placeholderMessage
inspector.spokes.<id>.<roleSpecificKey>
```

**Pre-flight discipline:** Always grep `en.json` for the existing keys before writing new ones. Don't assume the path from the semantic role.

**First encountered:** v112.3 (Type spoke MVP — initial brief incorrectly assumed `inspector.type.*`; pre-flight caught it as `inspector.spokes.type.*`).
```

#### Lesson 3 — Registry field names need pre-flight verification

```markdown
### Registry entry field names need pre-flight verification — don't guess from semantic role

**Symptom:** Code reads `entry.family` or `entry.id` and the field is undefined at runtime, even though the type "should" have it semantically.

**Cause:** Registry entry types use specific field names that may not match the developer's mental model of the semantic role. `TypographyEntry` uses `fontFamily` and `role`, not `family` and `id`. `MotionSafetyEntry` may use different field names than expected too.

**Correct pattern:** When writing code that consumes a registry, ALWAYS:
1. Grep the registry's source file for the TypeScript type definition
2. Quote the exact field names in the implementation prompt or PR notes
3. Don't infer field names from the role's name (e.g., "typography registry" doesn't mean fields are named `font` and `family`)

**Why this happens:** Registry types evolve; field names get refined; the latest names may differ from initial drafts in design docs.

**First encountered:** v112.3 (TypographyEntry uses `fontFamily`/`role`, not `family`/`id`).
```

#### Lesson 4 — Registry location is not always thematically obvious

```markdown
### Registry location is not always under `src/themes/` — check by name, not by theme

**Symptom:** A registry assumed to be under `src/themes/` is actually under a different namespace (e.g., `src/accessibility/`).

**Cause:** Registries can be thematically related to themes (typography, motion, color) but architecturally belong elsewhere. `motionSafetyRegistry` is *accessibility* infrastructure (preventing seizures, respecting reduced-motion), even though motion is also "theme-adjacent."

**Correct pattern:** When looking for a registry, grep by the registry's actual name (e.g., `motionSafetyRegistry`) across the entire `src/` tree, not just `src/themes/`. Accessibility-adjacent state often lives under `src/accessibility/`. Settings-adjacent state often lives under `src/control-plane/settings/`. Inspector-adjacent state lives under `src/control-plane/inspector/`.

**First encountered:** v112.3a (`motionSafetyRegistry` is at `src/accessibility/`, not `src/themes/`).
```

#### Lesson 5 — Command-dispatch event bus uses `window`, not `document`

```markdown
### LumaWeave's command-dispatch event bus uses `window` event targets, NOT `document`

**Symptom:** A new event listener wired to `document.addEventListener("event-name", ...)` never fires; the dispatch is happening but the listener doesn't see it.

**Cause:** Established LumaWeave convention dispatches custom events on `window`, not `document`. A listener on `document` won't catch them.

**Correct pattern:**
- Dispatch: `window.dispatchEvent(new CustomEvent("event-name", { detail }))`
- Listen: `window.addEventListener("event-name", handler)` (and matching `removeEventListener` in cleanup)

**Why `window`?** Custom events on `window` propagate cleanly across all browser contexts; `document` listeners can miss events dispatched before the document is fully ready or from other realms.

**First encountered:** v112.2 (theme export's `theme:exportBundle` event dispatch — initial brief used `document.addEventListener`; pre-flight caught it).
```

#### Lesson 6 — CSS stacking context creators trap child z-index

```markdown
### CSS properties that create stacking contexts trap child z-index — the PARENT's z-index is the relevant value

**Symptom:** A child element with a very high z-index (e.g., 99999) still renders BELOW siblings outside its parent, even though the sibling has a lower z-index.

**Cause:** Properties on a parent that create a new stacking context isolate child z-index values to that context's tier. The child's z-index ranks within the parent's context, not against the page root.

**Properties that create stacking contexts:**
- `transform: <anything>`
- `opacity < 1`
- `filter: <anything>`
- `backdrop-filter: <anything>`
- `will-change: transform` (or `opacity`, `filter`)
- `isolation: isolate`
- `mask`, `clip-path`, `mix-blend-mode`
- `position: fixed/sticky` (in some contexts)

**Correct pattern:**
1. When a child needs to render above siblings outside the parent, check parents for the above properties first
2. If a parent has them, EITHER raise the parent's z-index (treats the whole context as a higher tier) OR render the child via React Portal outside the parent
3. Don't waste time bumping the child's z-index without checking parents

**Real-world example:** v112.4.2 fixed Tiles popover stacking — the `.lw-status-bar` had `backdrop-filter` creating a stacking context AND a z-index of 10. The popover inside it (with z-index 10100) was bounded to that context's tier. Fix: bump the status bar's z-index from 10 to 1001 (treats the whole status-bar-context as a higher tier than the tile-layer's 1000).

**First encountered:** v112.4.2 (Tiles popover stacking fix).
```

#### Lesson 7 — `word-wrap` is deprecated; use `overflow-wrap`

```markdown
### Stylelint: `word-wrap` is deprecated; use `overflow-wrap: break-word`

**Symptom:** `npm run lint:css` flags `word-wrap` as deprecated.

**Cause:** `word-wrap` was the original property name; the CSS Working Group renamed it to `overflow-wrap` for clarity. Browsers accept both for backward compatibility, but linters flag the old form.

**Correct pattern:** Use `overflow-wrap: break-word` in new CSS. Existing `word-wrap` usages can be migrated when touched.

**First encountered:** v112.5b.1 (agentChat.css initially used `word-wrap`; stylelint flagged it).
```

#### Lesson 8 — Schema version assertions in tests must update with bumps

```markdown
### Schema version bumps require greppinng for old version numbers in test assertions

**Symptom:** A schema bump (e.g., v94 → v95) passes typecheck and migration tests, but an unrelated spec fails with `expect(version).toBe(94)` because it hardcoded the old number.

**Cause:** Some tests hard-code the current schema version to assert "the system is at the expected version" rather than testing migration behavior. Both styles have a place, but the hard-coded ones are brittle to bumps.

**Correct pattern:** When bumping the settings schema:
1. Grep test files for the previous version number as a literal: `grep -rn "toBe(94)" tests/` (or whatever the version is)
2. Update each hit to the new version
3. Run all settings-adjacent specs after the bump to catch any missed assertion

**Architectural alternative:** rewrite hard-coded version assertions as behavior assertions (e.g., "the result has the agents.inference field after migration") — more robust but more verbose.

**First encountered:** v112.5b.1 (`settings-dev-mode.spec.ts:63` had `toBe(94)`; needed update to `toBe(95)`).
```

#### Lesson 9 — Stable identifiers vs unstable labels

```markdown
### Stable internal identifiers vs unstable user-visible labels — keep them separate

**Symptom:** Renaming a UI element seems like it should be a simple string change, but turns out to touch many files because the "name" is used as a key in registries, i18n maps, test selectors, and analytics events.

**Cause:** Conflating *identifier* (internal reference) with *label* (user-visible text) is a common anti-pattern. The identifier should be stable; the label can change freely.

**Correct pattern:**
- Internal identifiers (registry keys, i18n key paths, test ids, analytics event names, type discriminators) should be stable across UI rename refactors
- User-visible labels (button text, headings, descriptions) come from i18n resolution at render time
- When renaming a UI element: change the i18n VALUE, not the i18n KEY PATH

**Real-world example:** v112.4.1 renamed Command Deck → Keyboard Shortcuts. Implementation:
- `tiles.commandDeck.title` (i18n key) — UNCHANGED
- `tiles.commandDeck.title` (i18n value) — changed from "Command Deck" to "Keyboard Shortcuts"
- `command-deck-section` (tile section id) — UNCHANGED
- Test selectors referencing the testid — UNCHANGED

**First encountered:** v112.4.1 (Command Deck → Keyboard Shortcuts rename).
```

#### Lesson 10 — Defensive rendering for empty/sparse registry data

```markdown
### Defensive rendering: empty registry results should skip-render, not empty-render

**Symptom:** A UI section renders an empty header or empty list when its data source returns zero items, looking like a bug to users.

**Correct pattern:** When rendering grouped data, check group sizes before rendering headers:

```tsx
{groups.map((group) => {
  if (group.items.length === 0) return null;
  return <GroupHeader title={group.name}>...</GroupHeader>;
})}
```

If a classification has zero entries, that classification's header doesn't appear at all. Empty section headers signal "broken UI" more than they signal "no items in this category." The data hierarchy should lead; the rendering should follow.

**Anti-pattern:** Rendering `<h3>High Risk</h3><ul></ul>` when there are zero high-risk items.

**Forward-compat:** When new entries get added to the empty category later, the header appears automatically. No code change needed.

**First encountered:** v112.3a (Motion spoke's classification groups — the "high" risk group has zero entries in the registry; the component correctly skips rendering rather than showing an empty High Risk section).
```

Match the existing file's format and section ordering. Don't restructure existing entries.

### Verify (Commit 2)

```bash
npm run typecheck
npm run lint:css
```
Both clean. No E2E required (docs only).

Optional sanity: read the post-edit ROADMAP.md and NOW.md to confirm:
- `[NEXT]` marker is on v113
- v112's LANDED annotation is complete with all 14 commit SHAs (including the skipped v112.4)
- Header version is `0.19.0` throughout
- The v112.4-pull / skipped item is honestly noted

### Commit 2 message

`chore(v112.6.1): v112 arc close — semver 0.18.0→0.19.0, NOW.md + ROADMAP reconcile, KNOWN_SHARP_EDGES (10 entries)`

MERGE GATE → commit → END-OF-RUN REPORT → bump+push gate.

### Hard stops (Commit 2)

- **No code changes.** Only the 5 doc/config files modified.
- **Preserve every previously-logged deferred item.** Don't lose any entries.
- **Be honest about the v112 saga.** Include the skipped v112.4, the popover hotfix, the framing pivot, the polish-debt sweep at close. The lessons are part of v112's value.
- **The SHIP_READINESS_ROADMAP v112 LANDED annotation must include all commit SHAs.**
- **Semver bump is exactly 0.18.0 → 0.19.0.** Don't skip; don't bump major; don't bump patch.
- **KNOWN_SHARP_EDGES entries match existing format.** Don't restructure the file.
- No new dependencies. No new Rust. Explicit-path git. Discord MCP only.

---

## END-OF-RUN REPORTS (each commit)

Files committed, pre-flight findings, verification results, manual smoke notes, any deviations.

**Final report (after Commit 2):**
- v112 closed at 0.19.0
- v113 (source adapter UX maturity) is the next active arc
- POLISH_DEBT_RUNNING.md updated (opacity resolved)
- All three previously-failing tests now passing

## Hard stops (arc-level)

- Targeted-test-scope + CI fast-jobs only.
- Two commits. Commit 1 is polish-sweep; Commit 2 is arc close.
- Path C diagnostic discipline on Commit 1 — STOP if any diagnosis surfaces architectural concerns.
- Migration version sequential (we're at v95 from v112.5b.1; no schema bump in v112.6).
- Explicit-path git. Discord MCP only.
