# Graph Source UX — Feature Roadmap

Branch: `feat/graph-source-ux`

The source adapter system works mechanically, but the new-user experience of
loading an external graph is broken at two hard stops and rough everywhere else.
This roadmap addresses the full arc: unblock users immediately, then layer on a
proper selection UI, graph library, and visual thumbnails.

---

## UX principles (apply to every phase)

These are not aspirations — every ticket is reviewed against them before close.

**Escape hatches everywhere.**
At every point in the flow, the user must be able to correct, undo, or
reinterpret their previous decisions without restarting.

**Detection assists; it never decides silently.**
- Wrong: "detected as X, loading."
- Right: "candidates found: X (strong), Y (weak). [Load as X] [Load as Y] [Different type]"
- Detection produces a ranked candidate list. User selects. Confirmed adapter
  stored on SourceEntry.

**Collision handling — no auto-resolution.**
When multiple adapters match the same target (e.g. both `self-graph-yaml-frontmatter`
and `markdown-vault` match `**/*.md`), both surface as candidates with scores
as *display cues* — not silent tiebreakers. If all scores are low, the picker
still shows them alongside a "type not detected — pick one" option that lists
every registered adapter.

**Reinterpretation on SourceEntry.**
Every loaded SourceEntry supports "Reinterpret as..." — user can switch adapter
in-place without re-adding. Source path stays; adapter changes, reload fires
only when the user commits.

**Every state has a visible way out.**
- Empty: "Select graph source" affordance
- Loading: "Cancel loading" button
- Loaded: "Change source" affordance
- Error: three distinct options — "Try again" / "Different config" / "Different adapter"

**Configuration non-destructive until committed.**
Editing config in the picker never fires a load. Only the "Load" button commits.
After load, changing config again does not affect the loaded graph until "Reload
with new config" is explicitly committed.

**Library entries recoverable.**
Delete requires confirmation. Dialog makes clear the underlying file is not
affected. Confirmation cannot be triggered by accident.

**Automated decisions are inspectable.**
When scan finds N candidates, all N surface. Scores are visible. User selection
is stored and reversible.

---

## Current adapter inventory

6 working adapters, 6 stubs. No database category yet.

| ID | Reads | Category | Detection hint | Status |
|---|---|---|---|---|
| `cytoscape-json` | Cytoscape.js `*.json` | file-based | `*.json` extension | **working** |
| `package-dependency` | `package.json` / `Cargo.toml` / `pyproject.toml` / `go.mod` | file-based | manifest filenames | **working** |
| `csv-edge-list` | `*.csv` edge list | file-based | `*.csv` extensiector
─
×
GRAPH INSPECTORon | **working** |
| `cerebra-snapshot` | `.cerebra/graph.json` | file-based | path marker | **working** |
| `openapi-spec` | OpenAPI `*.{json,yaml,yml}` | file-based | extension | stub |
| `database-schema` | `*.{sql,prisma}` | file-based | extension | stub |
| `cloud-infrastructure` | Terraform `*.{tf,yaml,yml}` | file-based | extension | stub |
| `self-graph-yaml-frontmatter` | YAML frontmatter `**/*.md` | directory-based | `**/*.md` glob | **working** |
| `markdown-vault` | Obsidian vault `**/*.md` | directory-based | `**/*.md` glob | **working** |
| `git-codebase` | `.git` directory | directory-based | `.git` presence | stub |
| `website-url` | HTTP/HTTPS crawl | stream | `^https?://` | stub |
| `issue-tracker` | GitHub / Linear / Jira API | stream | URL pattern | stub |

**Known collision:** `self-graph-yaml-frontmatter` and `markdown-vault` share the
`**/*.md` detection pattern. Scanning any `.md` directory surfaces both. Score
differentiation (e.g. presence of `luma-*` frontmatter keys → strong
self-graph signal) is a display cue only. User always selects.

---

## Phases

### Phase 1 — Structural foundation

Data shapes and lifecycle plumbing. No visible UI yet.

**SA-001 · Explicit load trigger**
`useGraphSourceSummary` reruns on `[activeAdapterId, refreshToken]` only. Config
edits do nothing. Fix: decouple config mutation from load. Load fires only when
the user explicitly commits (button or keyboard shortcut). Changing config after
load does not affect the running graph until "Reload with new config" is committed.

**SA-004 · Regenerate scope**
"Regenerate" in Graph Sources tile bumps the shared `refreshToken` regardless of
active adapter. Hide or relabel it when active adapter is not
`self-graph-yaml-frontmatter`.

**SA-014 · Adapter `category` declaration**
Add `category: "file-based" | "directory-based" | "database" | "stream"` to
`SourceAdapterEntry`. Update all 12 registrations. UI groups adapters by category
in the picker. Category is also the dispatch key for the `scan(target)` interface
in Phase 3.

**SA-022 · `SourceEntry` type + `sources.library` schema**
Single data shape used everywhere — picker history, pinned sources, tile display,
thumbnail storage:
```ts
interface SourceEntry {
  id: string;              // uuid, stable across reloads
  adapterId: string;       // confirmed by user, not auto-assigned
  config: AdapterConfig;
  label: string;           // from summary.label on successful load; user-editable (Phase 7)
  pinnedAt?: string;       // ISO — set when user pins; absent for recent-only entries
  loadedAt: string;        // ISO — updated on each successful load
  nodeCount?: number;
  edgeCount?: number;
  thumbnailDataUrl?: string; // Phase 5
}

sources: {
  active: string | null;   // adapterId of currently loaded graph
  library: {
    pinned: SourceEntry[];  // user-selected; order preserved
    recent: SourceEntry[];  // auto-populated; max 20, newest first
  };
};
```
Add migration. `sources.history` (old name) → `sources.library.recent`.

---

### Phase 2 — Empty-state + entry points

First user-visible surface. Ships the GraphSourcePicker modal in minimal form.

**SA-017 · EmptyPane component**
Net-new — no existing pattern to mirror. Center affordance: icon + "Select a
graph source" primary button. Top-right dropdown affordance (secondary): quick
access to recent entries (if any) and "Open new source". Both trigger the same
GraphSourcePicker modal. Goes into `GraphSourcesTileContent` when
`sources.library.pinned.length === 0` and no graph is loaded.

**SA-018 · GraphSourcePicker modal**
Replaces the registry-browser surface as the user-facing "choose your source" UI.
The registry browser (`SourceAdapterPanel`) stays intact — it becomes dev-mode-only
(Phase 6). The picker is a modal, not a tile.

Minimal form for Phase 2 (no thumbnails, no directory scan):
- **Recent** tab: list of `sources.library.recent` entries; one click reloads
  (sets config + active adapter + triggers load). Empty if no history.
- **Open new** tab: adapter cards grouped by category (file-based, directory-based,
  stream). Each card shows adapter name, description, accepted formatector
─
×
GRAPH INSPECTORs. Selecting
  a card expands an inline config form *before* any load fires.
- "Load" button at the bottom of the config form is the only commit action.
- Cancel / ✕ at any point returns the user to wherever they were with no change.

Escape hatch audit:
- Empty state → EmptyPane visible ✓
- Picking adapter → configure before load ✓
- Cancel closes picker, active source unchanged ✓

**SA-019 · Loading state Cancel button**
While a load is in progress, display a "Cancel" button in `GraphSourcesTileContent`
and in the picker. Cancel aborts the in-flight loader, returns to the previous
loaded state (if any), or to empty state if nothing was previously loaded.

**SA-020 · Error state three-option escape hatch**
When `summary.error` is populated, `GraphSourcesTileContent` and the picker both
display three actions:
- **Try again** — retries current config without re-opening picker
- **Different config** — opens picker with current adapter pre-selected and config
  form expanded
- **Different adapter** — opens picker at "Open new" tab, no pre-selection

Replaces SA-002 (inline error display only) with a full escape hatch surface.

**SA-023 · "Change source" affordance in loaded state**
When a graph is loaded and healthy, `GraphSourcesTileContent` shows aector
─
×
GRAPH INSPECTOR visible
"Change source" button (not buried in a menu). Triggers the GraphSourcePicker
modal with the Recent tab active. User can switch without losing the current graph
until they commit a new load.

**SA-006 · Format hints in picker cards**
Each adapter card in the picker shows what the input must look like: one-line
format note + minimal example. Requires adding a `formatHint` string field to
`SourceAdapterEntry`.

**SA-007 · Adapter format guard UX**
When `cytoscape-json` fails with a format error, rewrite the message:
```
This adapter expects Cytoscape.js format: { "elements": { "nodes": [...], "edges": [...] } }
If your file uses { "nodes": [...], "edges": [...] } without an "elements" wrapper,
use "Different adapter" to try a compatible format.
```

---

### Phase 3 — Directory scanning

**SA-015 · `scan(target)` interface on SourceAdapterEntry**
Each adapter optionally declares:
```ts
scan?: (target: string) => Promise<ScanCandidate | null>;
// target is an absolute path (directory or file)
// returns null if this adapter cannot handle the target
interface ScanCandidate {
  adapterId: string;
  score: number;          // 0.0–1.0 — display cue only, never a silent tiebreaker
  scoreLabel: "strong match" | "weak match" | "possible";
  suggestedConfig: Partial<AdapterConfig>;
  reason: string;         // human-readable: "Found 3 .md files with luma frontmatter"
}
```
Stubs for adapters without a `scan` implementation are acceptable — they simply
return null for all targets.

**SA-021 · "Scan directory" action**
"Open new" tab in the picker adds a "Scan directory" button (path entry or, when
Tauri dialog is available, native folder picker). Runs all registered adapters'
`scan()` functions against the target concurrently. Surfaces all non-null results
as a ranked candidate list with scores visible.

Candidate list display:
- All candidates shown, ordered by score
- Score label ("strong match" / "weak match" / "possible") is visible on each card
- If no candidates: "No adapter recognized this directory — pick one manually"
  with the full adapter list below
- User selects; selected adapter + suggested config populate the config form
- User reviews config, then presses "Load" to commit
ector
─
×
GRAPH INSPECTOR
Collision display (self-graph vs markdown-vault example):
```
Scan results for ~/Projects/lumaweave

● self-graph-yaml-frontmatter   strong match   (412 .md files, luma frontmatter detected)
  [Load as LumaWeave Docs]

○ markdown-vault                weak match     (412 .md files, no luma frontmatter)
  [Load as Markdown Vault]

[Different type ↓]   lists all adapters
```

---

### Phase 4 — Graph Sources tile as library

**SA-009 · Push SourceEntry on successful load**
In the load lifecycle, when `result.status === "loaded"`, push to
`sources.library.recent`. Dedup by `adapterId + configHash` (update `loadedAt`
and counts in place rather than appending). Trim to 20.

**SA-010 · Library display in Graph Sources tile**
`GraphSourcesTileContent` becomes the persistent library surface:
- **Pinned** section: user-selected entries with "Unpin" and "Reinterpret as..."
  actions per entryector
─
×
GRAPH INSPECTOR
- **Recent** section: auto-populated entries with "Pin" and "Reinterpret as..."
  per entry

**SA-024 · "Reinterpret as..." action**
Every SourceEntry in the library shows a "Reinterpret as..." action. Opens the
picker with:
- Current adapter's config pre-loaded
- Adapter selector active — user picks a different adapter
- Config form updates to the new adapter's schema
- "Load with this adapter" commits; original entry's `adapterId` updates, reload fires

No re-add required. Source path stays; adapter swaps.

**SA-025 · Library delete confirmation**
Deleting a library entry shows a confirmation dialog:
```
Remove "~/Projects/lumaweave" from your library?
The underlying file is not affected. You can re-add it at any time.
[Remove from library]  [Cancel]
```
No "recently deleted" buffer needed — the underlying file is untouched and the
picker's "Scan directory" or "Open new" can re-surface it.

---

### Phase 5 — Thumbnails

**SA-011 · Stable capture threshold**
Thumbnail capture fires when kinetic energy in the GWells engine falls below a
defined threshold for N consecutive frames — not a vibe-based "after physics
settles" timeout. If GWells exposes a settle event to the React layer, subscribe
to it. If not, use an explicit "Capture thumbnail" user action as the MVP (user
presses a button in the loaded tile → snapshot taken).

A 2-second timeout after `afterRender` is acceptable as a fallback if neither
is available, but the behavior must be documented (not silently variable).

**SA-012 · Thumbnail capture + storage**
After stable capture: `canvas.toDataURL("image/jpeg", 0.4)` at max 300×200.
Store in the SourceEntry's `thumbnailDataUrl`. Total budget: 20 entries × ~10 KB
= ~200 KB in localStorage — acceptable.

**SA-013 · Sigma ref threading**
AppShell watches for `summary.status === "loaded"` transition, waits for GWells
settle signal (or user action), captures canvas, calls
`updateLibraryEntryThumbnail(entryId, dataUrl)`. AppShell already holds the
Sigma ref; capture stays in AppShell rather than threading the ref to the tile.

**SA-012b · Thumbnail display**
Pinned and Recent entries in the tile show thumbnails as small cards (120×80,
`object-fit: cover`). Fallback: node/edge count badge when no thumbnaector
─
×
GRAPH INSPECTORil.
In the picker's Recent tab, same display.

---

### Phase 6 — Dev mode gating

**SA-026 · Gate source-adapter-section**
Add `requiresDevMode: true` to `source-adapter-section` in the tile section
registry. One field, one line. The SourceAdapterPanel (registry browser) becomes
invisible to standard users. `graph-sources-section` stays ungated.

**SA-027 · Advanced picker section under dev gate**
In the GraphSourcePicker modal, add an "Advanced" section below the standard
config form. Visible only when `developer.devMode === true`. Shows raw adapter
config (adapter ID, full config object, inputPattern). Allows power users to
override any config field without navigating the registry browser.

Dev mode toggle exists at `settings.developer.devMode` (default `false`, wired
in `CategoryAdvanced.tsx` — no new UI needed).

---

### Phase 7 — Polish

**SA-028 · User-editable source labels**
SourceEntry has a `label` field populated from `summary.label` on load. Add an
edit affordance (inline rename, pencil icon) in the pinned tile and the picker
Recent tab. Updated label persists in `sources.library`.

**SA-003b · Auto-detect from extension on path entry**
When a user types a path in "Open new", run file-based adapters' detection
patterns against the filename extension and surface suggestions inline
(below the path field, above the adapter cards). These are suggestions — the
user still picks. No silent loading.

**File picker**
`@tauri-apps/plugin-dialog` provides a native OS file/folder picker.
Eliminates the biggest UX friction in path entry. Requires a
`[DEPENDENCY REQUEST]` — do not implement until approved. Affects all path
entry fields in the picker and Phase 3 scan target.

---

## Scope boundary

Out of scope for this branch:
- New adapters (generic `{nodes,edges}` JSON, graphology JSON, D3 force format)
- Live-refresh / file-watch for loaded sources
- Multi-source overlay (load two graphs simultaneously)

---

## Work order

```
Phase 1:  SA-001, SA-004, SA-014, SA-022          (structural foundation)
Phase 2:  SA-017, SA-018, SA-019, SA-020, SA-023,
          SA-006, SA-007                           (empty-state + entry points)
Phase 3:  SA-015, SA-021                           (directory scanning)
Phase 4:  SA-009, SA-010, SA-024, SA-025           (library tile)
Phase 5:  SA-011, SA-012, SA-012b, SA-013          (thumbnails)
Phase 6:  SA-026, SA-027                           (dev mode gating)
Phase 7:  SA-028, SA-003b, file picker             (polish)
```

Each phase is independently shippable. Phase 1 is the priority.

---

## Open questions

1. **GWells settle signal** — Does GWells currently emit a settle/quiesce event
   accessible to the React layer? If yes, SA-011 uses it directly. If no, Phase 5
   MVP is user-triggered capture (SA-011 noted above).

2. **Cancel abort semantics** — When the user cancels an in-flight load (SA-019),
   can the current loader be interrupted mid-stream, or does it need to complete
   and then be discarded? Depends on whether adapters are structured as
   cancellable async operations.

3. **`sources.active` migration** — Current default is `"self-graph-yaml-frontmatter"`.
   After SA-022 lands, `sources.active` becomes `string | null` pointing to an
   adapter ID. How does the existing self-graph entry get promoted into
   `sources.library`? Either: auto-create a synthetic SourceEntry on migration,
   or start `sources.library` empty and let the user re-add.

4. **Score thresholds** — How are "strong match" / "weak match" / "possible" labels
   assigned from a 0.0–1.0 score? Suggested: ≥0.7 = strong, 0.4–0.7 = weak,
   <0.4 = possible. Revisit when first adapters implement `scan()`.
   
   
## Acceptance criteria (user-experience level)

Each phase has a code-level Definition of Done (linter passes, tests pass, 
etc.) AND a user-experience Definition of Done.

### Phase 2 acceptance
A first-time user, with no prior context, can:
- Launch LumaWeave (installed but never opened)
- See an empty state with a clear affordance to load data
- Click the affordance and reach the source picker
- Load their own data (from a path they type or select)
- See a rendered graph

In under 60 seconds. Using only visible affordances. Without asking for help.

### Phase 3 acceptance
A first-time user, with a directory containing mixed content, can:
- Trigger a directory scan
- See what candidates were found, with clear labels for each
- Understand why each candidate matched
- Pick one and see the graph render

Without seeing any dead-end error states. Without needing to know what
"adapter" means.

### Phase 4 acceptance
A returning user, having previously loaded 3+ sources, can:
- See their library on launch
- Recognize sources by their thumbnails/labels/counts
- Pin frequently-used ones
- Switch between them instantly (no reload configuration)
- Reinterpret a source as a different adapter without losing the entry

### (etc. for phases 5-7)
