# Graph Source UX — Architectural Review

Reviewed against `docs/roadmap/GRAPH_SOURCE_UX.md` (the branch's own stated UX principles),
Nielsen's heuristics, ISO 9241-110 (dialogue principles) / -171 (accessibility), and WCAG 2.2.

Method: 7 independent review lenses over the on-disk code, each finding adversarially
verified against the source by a second pass. 56 findings raised, 49 survived, 7 refuted.
Every claim below carries a `file:line`. The five load-bearing structural claims were
additionally hand-verified.

## Status

| Fix-order step | State | Commit |
|---|---|---|
| 1. `commitSource` verb | **done** | `b341393` |
| 2. Picker draft layer | **done** | `b341393` |
| 3. Hoist the load lifecycle | **in progress** — side effects given a single owner (`af83c7c`); `loadSource()` still runs 4× and `cancelLoad` still mutes 1 of 4 | `af83c7c` |
| 4. Fix what the canvas says | **partial** — fixture no longer renders on error (`af83c7c`); loading busy-overlay still open | `af83c7c` |
| 5. One overlay contract (Escape layering, focus trap) | open | — |
| 6. One library, one card | open | — |
| 7. Fix the entry points (`EmptyPane` is dead code) | open | — |
| 8. Keep scan evidence on screen | **done** | `b341393` |
| 9. Registry owns adapter identity | open | — |
| 10. The sweep — token portal fix | **done** | `67ff407` |

Also closed along the way: Playwright collection was broken, hiding **57 tests**; 11 stale
assertions and 1 needless quarantine (`8c5781c`). Suite: 828 passed, 0 failed, 13 skipped.

Two findings **added** during implementation, not present in the original review:

- **The Cerebra listener was registered 4×.** `listen("cerebra:snapshot-available")` lives
  inside `useGraphSourceSummary`, which has four instances — so one snapshot called
  `commitSource()` four times, each bumping `refreshToken`: a reload storm. It was dormant only
  because an unchanged `sources.active` used to no-op; **the `commitSource` fix armed it.** Needs
  the Tauri runtime, so no spec covers it. Fixed by the owner flag in `af83c7c`.
- **The `{...prev}` spread in the loading state is load-bearing.** It retains `normalizedNodes`,
  which keeps `hasRealNodes` true mid-switch. Rewriting the loading state "cleanly" would flip
  the fixture gate and flash the built-in self-graph on every source change.

---

## The diagnosis

**The app has no `Source`.** It has an adapter id (`sources.active: string`), a config map keyed
*by adapter* (`sources.configurations: Record<adapterId, AdapterConfig>` — `settings.defaults.ts:4-6`),
a library of entries, and four private copies of a `summary`. Nowhere is there a single value
meaning "the source that is loaded." The library subsystem actually got this right —
`makeEntryId(adapterId, config)` hashes *both* (`settings.store.ts:23-32`) — but the load path
does not use that model. `useGraphSourceSummary`'s effect keys on `[activeAdapterId, refreshToken]`
(`useGraphSourceSummary.ts:163`), so the system's identity for a source is *the adapter alone*.
Almost every "weird" symptom falls out of that one line. Two Cytoscape files are the same source,
so clicking the second one does nothing (`GraphSourcePicker.tsx:185-189`). Reinterpreting a CSV as
JSON can't carry the path, because config is filed under the old adapter's key
(`GraphSourcePicker.tsx:163-171`). Clicking a Recent entry overwrites `configurations[entry.adapterId]`
wholesale (`GraphSourcePicker.tsx:191-199`), because an adapter can only hold one config at a time.
The loading card shows the *previous* source's label (`GraphSourcesTileContent.tsx:322`) because the
incoming source has no name until it has loaded. Same missing noun, five faces.

**And it has no commit.** The store is the only channel between surfaces, and a Zustand write carries
no verb — only a new value. So "edit" and "commit" are the same operation, from both ends.

From the editing end: `AdapterConfigForm.tsx:29-35` writes every keystroke straight into persisted
settings, and all four picker exits call a bare `onClose()` — so Cancel is a lie, and the working
config the user was only *looking at* is gone.

From the committing end: since a commit is just a value change, an *unchanged* value is not a commit.
`handleLoad` writes the same string to `sources.active` and the effect never re-runs. The error card's
own "Different config" escape (`GraphSourcesTileContent.tsx:352`) is therefore **100% dead by
construction**: it pre-selects the failing adapter, so the corrected path can never trigger a reload.
The team already felt this hole and patched around it — `sources.refreshToken` exists as an out-of-band
"I really mean it" channel, used by exactly two buttons (`GraphSourcesTileContent.tsx:242`, `:268`).
Those are the only two paths in the app that reliably load anything twice. **That token is the missing
verb, wearing a disguise.**

**The load lifecycle has no owner, so cause and effect land on different surfaces.**
`useGraphSourceSummary` is a plain hook with local `useState` (`:36-38`) and a local `cancelledRef`
(`:45`), instantiated **four times** in the default layout — `AppShell.tsx:61`,
`GraphSourcesTileContent.tsx:213`, `StatusCluster.tsx:7`, `GraphInspectorTileContent.tsx:6`.
One source switch fires four independent `loadSource()` calls, and `cancelLoad` flips exactly one of
the four refs. So "Cancel loading" mutes the tile while the canvas and the topbar complete the load and
render the graph you just cancelled. This is the purest form of the felt discontinuity: **the tile owns
the controls for a lifecycle it does not own the state of.**

The modal compounds it. `handleLoad` closes the picker at the exact instant the work begins, and because
the loading summary is `{...prev, status: "loading"}` (`:94-97`), the canvas keeps rendering the *old*
graph, fully interactive, until it hard-swaps. You commit on one surface, and for the next several
seconds every surface you're looking at says nothing happened. Then, if it fails,
`useFixture = isTestEnv || !hasRealSource` (`AppShell.tsx:108`) quietly renders the built-in self-graph —
**the app fabricates a graph in the error state**, and the canvas's own "Failed to load graph data"
branch (`AppShell.tsx:647`) is unreachable dead code.

**Each surface then speaks its own dialect of the app.**
- *Escape*: the picker registers an unguarded `document` listener (`GraphSourcePicker.tsx:173-179`),
  Settings a `window` listener with an input guard (`SettingsPanel.tsx:151-162`), the palette a third.
  All fire on one keypress — Escape-to-cancel-a-rename closes the whole picker, and closing the picker
  also closes the Settings panel behind it.
- *Focus*: the palette saves and restores it (`useCommandPaletteState.ts:69`, `:121`); the picker does
  neither. Its adapter cards are `<div onClick>` (`:485`) while its scan candidates are real `<button>`s
  (`:426`) — three "choose an adapter" affordances, two element types.
- *Commit*: inside **one modal**, the Recent tab commits on a single click and dismisses, while Open-new
  requires a footer Load button that is *hidden* on the Recent tab (`:548`).
- *Library*: the tile shows pinned + recent with five actions; the picker shows recent only with one
  (`:155`, `:347`) — and `pinLibraryEntry` **moves** the entry out of `recent` (`settings.store.ts:118-127`),
  so **starring your main project deletes it from the picker**.
- *Pixels*: the picker `createPortal`s to `document.body` (`:561`), escaping the `<main>` inline style that
  is the **only** definition site for all six `--lw-*` tokens it uses (`AppShell.tsx:464-486`). Custom
  properties inherit downward; `body` is an ancestor of `main`. So all 83 `var()` lookups fall back to
  hardcoded cyan/slate — **the busiest new surface is the one surface no theme can reach.**

### One candidate cause, partly rejected

*"Registry-should-own-it data lives in hardcoded maps, so surfaces drift."* The violation is real and the
repo's own rule forbids it — `ADAPTER_DISPLAY_NAMES` is duplicated **byte-for-byte** in
`GraphSourcePicker.tsx:80-93` and `GraphSourcesTileContent.tsx:10-23`, `formatRelativeTime` likewise,
and `isConfigValid` is a `switch` over adapter ids (`:113-120`) because `SourceAdapterEntry` carries no
`displayName` and no validator. But today the maps are identical and the `default:` branch is unreachable,
so this is **not** a source of the felt discontinuity — with one live exception: `SourceAdapterPanel.tsx:175`
renders `{entry.adapterId}` raw, so one adapter is "Cytoscape JSON" in the picker and `cytoscape-json` in
the adapter panel. It is the mechanism by which drift *will* become felt, not the cause of what's felt now.
Fix it cheaply, but don't fix it first.

---

## What's working

The thinking is better than the wiring, and that's the good problem to have.

- **`GRAPH_SOURCE_UX.md` is right.** "Detection assists, never decides silently"; "scores are display cues,
  never silent tiebreakers"; "every state has a visible way out." The bugs below are all *failures to
  implement these*, not failures to conceive them. Don't rewrite the principles; make the code obey them.
- **The scan/candidate model is the correct shape.** Ranked candidates, visible scores, visible reasons
  (`GraphSourcePicker.tsx:420-451`), plus a `Different type ↓` fallback that *adds* the full list without
  destroying the evidence (`:443-451`). That fallback is the pattern the rest of the panel should copy.
- **The error state's three-way escape taxonomy** (Try again / Different config / Different adapter,
  `GraphSourcesTileContent.tsx:341-364`) is exactly the right decomposition of "it broke." Two of the three
  are currently non-functional; the taxonomy is not the problem.
- **Content-addressed library entries.** `makeEntryId(adapterId, config)` (`settings.store.ts:23-32`) is the
  correct identity model. It already exists. The load path just doesn't use it.
- **The Cytoscape adapter's error copy.** `cytoscapeJsonAdapter.ts:119-137` — "Your file uses
  `{nodes:[], edges:[]}` without an `elements` wrapper… wrap your data:" — is exemplary. That register is the
  target for every other message.

---

## Flow breaks

**1. A commit that doesn't change the adapter is a silent no-op — the "Different config" escape hatch is 100% dead.**
`GraphSourcePicker.tsx:185` · `useGraphSourceSummary.ts:163` · `GraphSourcesTileContent.tsx:245`
You load Cytoscape file A, click Cytoscape file B in Recent, and nothing happens — no spinner, no error, the
modal just closes. Likewise you fix a bad path via the error card's "Different config", hit Load, and land back
on the identical error.
**Fix:** add one store action `commitSource(adapterId, config)` that writes `configurations`, `active`, **and**
increments `refreshToken` atomically; route all three commit paths through it. Load must key on
`(adapter, config)`, not adapter.

**2. Cancel is a lie: the picker has no draft layer.**
`AdapterConfigForm.tsx:29` · `GraphSourcePicker.tsx:163` · `:236`
You open the picker just to *look* at your working source's config, type over the path, change your mind, hit
Cancel — and your good path is gone from localStorage, detonating on the next "Try again" or app restart with
no cause the user can connect to. Keystrokes, candidate clicks, and even *opening* the picker in reinterpret
mode all overwrite persisted config.
**Fix:** hold `draftConfigs` in `GraphSourcePicker` state; pass `config`/`onChange` down as props —
`AdapterConfigFormProps` (`adapterConfigFormRegistry.ts:5-8`) already has that shape. Flush the draft inside
`commitSource` only. Delete the mount-time write at `:163-171`.

**3. "Cancel loading" cancels one of four independent loads.**
`useGraphSourceSummary.ts:36` · `:74`
You cancel a slow load; the tile snaps back to the old graph while the canvas and the topbar finish loading the
new one — two surfaces, two contradictory answers to "what am I looking at" — and `sources.active` is never
reverted, so the switch is permanent anyway.
**Fix:** hoist the lifecycle into one owner (a Zustand slice, or a `GraphSourceProvider` mounted once in
`AppProviders`) exposing `{summary, isLoading, error, cancelLoad}`; the four call sites subscribe. Make
`cancelLoad` restore `prevAdapterIdRef.current` into `sources.active`. Side benefit: one load instead of four,
one `pushLibraryEntry` instead of four.

**4. A failed load renders the built-in self-graph.**
`AppShell.tsx:101` · `:108`
You type a bad path; the tile says "Load failed" while the canvas fills with a graph you have never seen and
your previous good graph disappears. The canvas's own error placeholder (`:647`) can never render, because the
fixture always wins.
**Fix:** gate the fixture on a real first-run condition, not on the *absence* of nodes:
`useFixture = isTestEnv || (summary.status === "idle" && !hasEverLoaded)`. On `status === "error"`, keep
rendering the previous `normalizedNodes` (already retained by the `{...prev}` spread at
`useGraphSourceSummary.ts:96`) and dim the canvas.

**5. A source switch produces zero feedback on the two surfaces you're looking at.**
`useGraphSourceSummary.ts:94` · `GraphSourcesTileContent.tsx:322`
You hit Load, the modal vanishes, and for the next N seconds the canvas still shows the old graph — fully
interactive, so pins and selection you make in that window are about to be thrown away — and the topbar still
shows the old counts, while a small "Loading…" line off in the tile names *the source you just left*.
**Fix:** add a canvas busy layer on `status === "loading"`: dim the graph, overlay an indeterminate chip with
the **incoming** source's label and a Cancel button wired to the hoisted `cancelLoad`. Resolve the loading label
from the registry + committed config instead of inheriting `prev.label`.

**6. Reinterpret can't reinterpret.**
`GraphSourcePicker.tsx:163`
You click ⇄ on a `.json` entry to re-read it as CSV, pick the CSV card, and the form is blank — the entry's path
is written under `configurations["cytoscape-json"]`, and the picker never even *displays* the path, so you can't
retype it. Load stays permanently disabled. If you get past it, Load appends a *second* library entry.
**Fix:** seed the draft (item 2), and carry the path across adapters using a registry-declared `pathKey` when the
selected card changes. On commit, replace `reinterpretEntry.id` rather than pushing a second entry. Render the
entry's path in the modal header so the user can always see what they're reinterpreting.

**7. Escape has no layer discipline; the dialog neither takes focus nor gives it back.**
`GraphSourcePicker.tsx:173` · `:268` · `:327`
Escape while renaming a Recent entry closes the entire picker. Escape in the picker also closes the Settings panel
behind it. Tab after opening the modal walks into the tile *behind* the backdrop, because the picker sets no
initial focus and restores none on close — while the command palette does both.
**Fix:** one `useOverlayLayer(id)` hook owning an overlay stack (only the topmost layer consumes Escape), plus a
`useModalFocus(ref)` that saves `document.activeElement`, focuses the first meaningful control, traps Tab, and
restores on unmount. Adopt in `GraphSourcePicker`, `CommandPalette`, `SettingsPanel`. `e.stopPropagation()` in the
rename input is the one-line stopgap, not the fix.

**8. Clicking a scan candidate destroys the ranked evidence — while "Different type ↓" preserves it.**
`GraphSourcePicker.tsx:246`
You scan, get three ranked candidates with scores and reasons, click the top one to inspect it, and all three
vanish — replaced by the flat 12-card list, with the runner-up recoverable only by re-running the scan. This
directly violates "automated decisions are inspectable — selection reversible."
**Fix:** delete `setScanResults([])` / `setScanState("idle")` from `handleSelectCandidate`. Mark the clicked
candidate selected and render the config form inline *inside that candidate row* — the same expand-in-place
pattern the adapter cards already use at `:499`. The full list stays behind `Different type ↓`, which is what
that button is for.

**9. Pinning a source hides it from the picker; the picker and the tile are two different libraries.**
`GraphSourcePicker.tsx:155` · `settings.store.ts:118`
You star your main project to keep it handy and it disappears from the "Select Graph Source" modal —
`pinLibraryEntry` **moves** the entry out of `recent`, and the picker subscribes to `recent` only. Pin everything
and the modal reads "No recent sources yet." while your library is full. The same row offers five actions in the
tile and one in the picker.
**Fix:** extract `LibraryEntryCard` from `GraphSourcesTileContent.tsx:60-208` into
`graph-sources/LibraryEntryCard.tsx` and render it in both surfaces with the same handlers. Rename the picker tab
"Recent" → "Library" and render `pinned` + `recent`. One card, one rename path, one delete-confirm path.

**10. The adapter grid is keyboard-inert, so both documented manual escape hatches dead-end.**
`GraphSourcePicker.tsx:485`
The cards are `<div onClick>` with no role, no tabIndex, no key handler. So "No adapter recognized this path —
pick one manually" (`:457`) and "Different type ↓" (`:444`) instruct a keyboard user to do something they cannot
do, and `self-graph-yaml-frontmatter` (no scan fn, directory-based) is unreachable by any route but a mouse click.
**Fix:** make the list a radiogroup — `role="radiogroup"` on the container, `role="radio" aria-checked
tabIndex={selected ? 0 : -1}` per card, Enter/Space to select, Arrow keys for roving focus — and move the config
form out of the clickable region into a sibling panel below the card.

---

## Friction

**Onboarding never runs.** `settings.defaults.ts:5` ships `active: "self-graph-yaml-frontmatter"` and **nothing in
`src/` ever writes `sources.active = null`** — so `isEmpty` (`GraphSourcesTileContent.tsx:280`) is never true and
**`EmptyPane` is dead code in production.** First run boots into LumaWeave's own self-graph, which the user didn't
ask for and can't interpret. Compounding it: there is **no palette command that opens the picker**
(`command-registry.entries.ts:289` offers only "Toggle Graph Sources Tile"), and Settings → Data Sources is three
paragraphs of prose with zero controls (`CategoryDataSources.tsx:8-24`). The designed 60-second on-ramp has no
entry point.
*Fix:* default `active: null` (with a migration preserving existing users); register `data.openGraphSource` in the
command registry; make Settings → Data Sources dispatch it.

**One modal, two commit models.** Open-new teaches *click = select, Load = commit*; Recent commits and dismisses on
a single click (`GraphSourcePicker.tsx:334` → `:191`) — and the Load button you were just using **disappears** on
that tab (`:548`). The team's own spec encodes the contradiction (`GRAPH_SOURCE_UX.md:156` vs `:164`).
*Fix:* Recent rows select-and-stage into the draft; render Load on both tabs; keep double-click as the shortcut.

**Detection asserts confidence it hasn't earned.** `csv-edge-list` scores 0.9 "strong match" off
`target.endsWith(".csv")` and `package-dependency` 0.95 off a basename check (`sourceAdapterRegistry.ts:513`, `:471`)
— pure string matching, zero disk access — while `markdown-vault`, the only scanner that actually touches the
filesystem (`:339-354`), is capped at 0.6 "weak match". A typo'd path is badged "strong match" and fails only at
Load. Half the manual list is inert: 6 of 12 adapters are `status: "candidate"` stubs with no `formatHint`, styled
`cursor: default` with no `aria-disabled` (`GraphSourcePicker.css:342`); the entire "Stream" category is 100% dead.
*Fix:* no `scan()` may return "strong match" on a code path that never awaited I/O — probe existence, then tier
honestly (extension → "possible", exists → "weak", content-sniffed → "strong"). Collapse the six stubs behind a
`Not yet supported (6) ▾` disclosure.

**The app speaks jargon exactly where a stuck user is reading.** The acceptance criterion says "without knowing what
'adapter' means," yet one of the three error-recovery buttons is literally **"Different adapter"**
(`GraphSourcesTileContent.tsx:362`), the no-match message is "No adapter recognized this path"
(`GraphSourcePicker.tsx:457`), and the adapter error copy names those buttons back at you
(`cytoscapeJsonAdapter.ts:131`). Next to that exemplary Cytoscape guidance, the two *most common* failures render
raw exceptions: `Cannot read file: ${err}` and `Invalid JSON: ${err}` (`cytoscapeJsonAdapter.ts:97`, `:104`; same
pattern in all five adapters).
*Fix:* reword five strings ("Different adapter" → "Read it as a different format"); add a shared `toUserMessage(err)`
feeding `makeErrorSummary`, keeping the raw error behind the devMode Advanced disclosure.

**The flow is invisible to assistive tech.** The entire graph-source flow has **zero** `aria-live` regions — a grep
of `src/` finds exactly one `role="status"` in the whole app (`SettingsStatusBar.tsx:37`) — so load success, load
failure and scan completion are never announced. The picker declares `role="tablist"`/`role="tab"` (`:281`) with no
arrow-key nav, no roving tabindex, and no `role="tabpanel"` on the body it controls — promising interactions that
don't exist. The library's four icon buttons announce as bare glyphs (`✎ ★ ⇄ ×`,
`GraphSourcesTileContent.tsx:140-182`): `title` never becomes the accessible name when the glyph *is* the content,
and the sibling file already does it right (`aria-label="Close"`, `GraphSourcePicker.tsx:274`). All four are ~20px
tall with 4px gaps — under the 24px WCAG 2.2 SC 2.5.8 minimum, with the destructive `×` adjacent to `⇄`.
*Fix:* one `role="status" aria-live="polite"` wrapper around the tile's state block; `role="alert"` on the error
card; complete the tabs pattern; `aria-label` carrying the entry name on every icon button; a shared 24px
icon-button class.

**The picker is outside the app.** It `createPortal`s to `document.body` (`:561`), but all six `--lw-*` tokens it
consumes are defined **only** as an inline style on `<main>` (`AppShell.tsx:464-486`) — a descendant of `#root`,
which is a *child* of `body`. Custom properties inherit downward, so all 83 `var()` lookups in
`GraphSourcePicker.css` resolve to their hardcoded cyan/slate fallbacks. Pick an amber theme and a cyan modal from a
different application appears on top of it, immune to the theme inspector. **This is the felt discontinuity made
literal.**
*Fix:* promote the token block from `<main>` to `document.documentElement` in an effect (next to
`themeCrossfade.ts:108`, which already promotes `--lw-app-background`). One change; fixes every future portal.
Also: selecting an adapter injects its config form inline with no transition, no `scrollIntoView`, and no focus, so
the field you now need can land below the fold (`:499`).

---

## Polish

| What | Where | Fix |
|---|---|---|
| `ADAPTER_DISPLAY_NAMES` duplicated byte-for-byte; `isConfigValid` is a switch over adapter ids; `formatRelativeTime` copy-pasted | `GraphSourcePicker.tsx:80`,`:113`,`:123` / `GraphSourcesTileContent.tsx:10`,`:25` | Add `displayName` + `requiredConfigKeys` to `SourceAdapterEntry` (`sourceAdapterRegistry.ts:83`); delete both maps and the switch; hoist `formatRelativeTime` to one util |
| `SourceAdapterPanel` shows raw kebab ids while picker/tile show names | `SourceAdapterPanel.tsx:175` | Read `entry.displayName` once the registry owns it |
| Modal appears and vanishes in a single frame — no fade, no scale | `GraphSourcePicker.css:3` | `lw-picker-backdrop-in` 140ms / `lw-picker-modal-in` 180ms, inside SettingsPanel's existing 180–220ms band, wrapped in `prefers-reduced-motion` |
| Modal has zero `box-shadow` and omits `-webkit-backdrop-filter` (no autoprefixer in build) | `GraphSourcePicker.css:22` | Copy the elevation + prefix pair from `SettingsPanel.css:31-36`; align `saturate()` to 180% |
| Score badges hardcode `#22d3ee` / `#f59e0b` — the only raw hexes in 563 lines; under the default gold theme "weak match" reads *more* accent-native than "strong match" | `GraphSourcePicker.css:263-271` | `var(--lw-accent, #FFB347)` for strong; add a semantic `--lw-warn` token for weak |
| `GRAPH_SOURCE_UX.md` has UI text pasted into it — `ector ─ × GRAPH INSPECTOR` appears mid-table 4× | `GRAPH_SOURCE_UX.md:67`, `:159`, `:188`, `:243` | Delete the stray fragments |

---

## The fix order

Sequenced by leverage. Steps 1–3 are one coherent refactor of the source lifecycle and together dissolve roughly
two-thirds of the flow breaks. Do not start anywhere else.

1. **Give the store a `Source` and a `commitSource` verb.** *(~2–4h)* Add `commitSource(adapterId, config)` to
   `settings.store.ts` — writes `configurations[adapterId]`, `sources.active`, and bumps `sources.refreshToken` in
   one `set()`. Route `GraphSourcePicker.handleLoad` (`:187`), `handleLoadRecent` (`:197`) and
   `GraphSourcesTileContent.handleLoadEntry` (`:251`) through it. **Closes flow-breaks 1 and the commit half of 6.**
   Makes the error card's "Different config" hatch live for the first time. Everything downstream depends on this:
   until a commit is an *event* rather than a *diff*, no amount of UI work can make Load reliable.

2. **Give the picker a draft layer.** *(~half day)* `draftConfigs` in `GraphSourcePicker` state; pass
   `config`/`onChange` into `AdapterConfigForm` as props (`AdapterConfigFormProps` already has that shape). Flush only
   inside `commitSource`. Delete the mount-time write at `:163-171` and the store write in `handleSelectCandidate`
   (`:238`). **Closes 2**, and the persistence half of **6** and **8**. Do it *after* step 1, so the draft has a commit
   to flush into. This is what makes Cancel true.

3. **Hoist the load lifecycle to one owner.** *(~1 day — the biggest single piece)* Move
   `{summary, isLoading, error, cancelLoad}` out of the hook into a Zustand slice or a `GraphSourceProvider` mounted
   once; the four consumers subscribe. Make `cancelLoad` revert `sources.active`. **Closes 3.** Kills the 4× fan-out of
   `loadSource` / `pushLibraryEntry` / `invokeEmitSourceLoaded`, and is a prerequisite for step 4 — the canvas can't
   show a cancel button for a lifecycle it doesn't share.

4. **Fix what the canvas says.** *(~3h)* Gate the fixture on a genuine first-run condition instead of "no nodes"
   (`AppShell.tsx:108`); keep the previous graph rendered and dimmed on `status === "error"`; add a busy overlay on
   `status === "loading"` carrying the incoming source's label and a Cancel wired to the shared `cancelLoad`.
   **Closes 4 and 5.** After steps 1–4 the source lifecycle is honest end to end — this is the point at which the
   "discontinuity" should stop being felt.

5. **One overlay contract.** *(~half day)* `useOverlayLayer(id)` (Escape goes to the topmost layer only) +
   `useModalFocus(ref)` (initial focus, Tab containment, restore on unmount). Adopt in `GraphSourcePicker`,
   `CommandPalette`, `SettingsPanel`. **Closes 7**, and stops the next overlay from inventing a fourth dialect.

6. **One library, one card.** *(~half day)* Extract `LibraryEntryCard`; render it in tile and picker; picker tab becomes
   "Library" showing `pinned` + `recent`. **Closes 9**, and removes the two rename paths.

7. **Fix the entry points.** *(~2h)* `sources.active: null` by default + migration; `EmptyPane` becomes reachable;
   register `data.openGraphSource` in the command registry; Settings → Data Sources dispatches it instead of describing
   it. Only meaningful once the picker actually works — shipping a discoverable on-ramp into a broken commit model
   would be worse than the status quo.

8. **Keep the evidence on screen, and stop lying about it.** *(~3h)* Candidate select expands in place instead of
   clearing (`:246`); scans that never touched disk may not say "strong match" (`sourceAdapterRegistry.ts:471`, `:513`).
   **Closes 8.**

9. **Registry owns adapter identity.** *(~1–2h)* `displayName` + `requiredConfigKeys` on `SourceAdapterEntry`; delete
   both maps, the switch, and the duplicated util. Low urgency, low cost — and it prevents step 6's shared card from
   re-forking.

10. **The sweep.** *(~1 day, parallelizable)* Promote the token block to `documentElement` so the portal themes —
    genuinely a one-hour fix with outsized visual payoff; **consider pulling this forward** if you want to *see*
    progress early. Then a11y (flow-break 10 + the aria-live/tabs/hit-target cluster), copy, the six stubs, and the
    polish table.

**Calibration:** steps 1, 4, 8, 9 and the token fix are hour-scale. Steps 2, 5, 6 are half-day each. Step 3 is the only
true one-day refactor, and it is the one that pays for the rest.

**No new dependencies required.** Every fix above uses what is already in the tree (Zustand, React 19, the existing
registries). If a focus-trap library later looks attractive for step 5, that is a **DEPENDENCY REQUEST** requiring
explicit approval — but the ~40-line hand-rolled hook is the better call anyway, since it has to coordinate with the
overlay stack.

---

## Refuted during verification

Seven findings were raised and then knocked down. Recorded so they don't get re-raised:

- *"The Load button is disabled with no reachable explanation of what is missing"* — the config form makes the missing
  field visible.
- *"A scan that throws is reported as 'no adapter recognized'"* — the catch branch is unreachable; `scanTarget` uses
  `Promise.allSettled` (`sourceAdapterRegistry.ts:178-184`).
- *"Adapter cards are `<div onClick>` — there is **no** keyboard path to select a graph source **at all**"* (raised
  twice) — overstated. The cards genuinely are non-focusable divs (that survives as flow-break 10), but scan-result
  candidates and extension-suggestion chips *are* real `<button>`s, so a keyboard path exists for scannable paths. The
  defect is narrower than "the tab is unreachable."
- *"The empty state points but doesn't teach"* — refuted on impact grounds, since `EmptyPane` never renders at all
  (see Friction). The real defect is upstream.
- *"The tile and the picker are two different color systems"* — the *mechanism* was wrong (it's the portal escaping
  token scope, not two palettes), and it survives in that corrected form under Friction.
