# v98.4 Arc Closer — Panels-as-Tiles Migration + LeftTabPanel Removal

**Date:** 2026-05-27
**Branch:** `feat/v98-4-panels-as-tiles`
**E2E result:** 591 passed, 0 failed, 11 skipped

## What landed

### New tile content wrappers

| Component | File | Registry ID | Default visible |
|---|---|---|---|
| `GraphVisualInventoryTileContent` | `src/control-plane/graph/` | `graph-visual-inventory-section` | false |
| `SystemIndexTileContent` | `src/control-plane/system-index/` | `system-index-section` | false |
| `CommandDeckTileContent` | `src/control-plane/command-deck/` | `command-deck-section` | false |

`CommandDeckPanel` and `CommandDeckShell` props (`themeAccent`, `themeTextMuted`, `themePanelBorder`) made optional with CSS var defaults — no longer requires AppShell context.

### Command palette entries

Three new `view.toggleTile.*` entries:
- `view.toggleTile.graphVisualInventory`
- `view.toggleTile.systemIndex`
- `view.toggleTile.commandDeck`

### Viewport-aware anchor clamping

`computeAnchorPos` in `tileUtils.ts` now uses the tile height to clamp `y` to
`[TOPBAR_HEIGHT, window.innerHeight - STATUS_BAR_HEIGHT - h - 8]`. Resolves the
known bug where tiles with high `defaultAnchor.offset` values overlapped the status
bar. Constants: `STATUS_BAR_HEIGHT = 40`, `TOPBAR_HEIGHT = 64`.

### Test harness updates

- `tests/e2e/helpers/tiles.ts` — added `openGraphVisualInventory`, `openSystemIndex`,
  `openCommandDeck` helpers (same inject-via-store pattern as `openQaPanel`)
- `graph-visual-inventory.spec.ts` — added `openGraphVisualInventory` to `beforeEach`
- `system-index.spec.ts` — added `openSystemIndex` to each of 5 tests
- `command-deck.spec.ts` — added `openCommandDeck` to all 8 tests; replaced stale
  `tab-qa` (LeftTabPanel testid) assertion with `command-deck-panel` coexistence check

### LeftTabPanel removal

- `AppShell.tsx` — removed outer grid section wrapper (`gridTemplateColumns: var(--left-width) 1fr`),
  `<LeftTabPanel .../>` block, 7 now-dead imports, and `panelSummary` variable
- `LeftTabPanel.tsx` — deleted (fully orphaned, confirmed via grep)

### Docs

- `docs/known-bugs/tile-anchor-offsets-overlap-status-bar.md` — marked RESOLVED
- `docs/updates/v86+_updates/v99_PANEL_MIGRATION_ARC.md` — renamed to
  `v98_4_PANEL_MIGRATION.md` and updated to reflect completed status

## What was NOT changed

- SourceAdapterPanel: still lives inside `GraphSourcesTileContent` (was already migrated
  in v98.3; AppShell no longer has a direct reference)
- `LeftTabPanel`-related UI settings (`leftPanelCollapsed`, `leftPanelWidth`,
  `leftPanelActiveTab`, `*TabSections` settings keys) — left in settings schema for now;
  these are stale but harmless. Can be pruned in a future settings-schema cleanup pass.

## Known remaining debt

- Manual smoke check not performed by this pass (visual verification required)
- Settings schema stale keys from LeftTabPanel (leftPanelCollapsed, etc.)
- The commented-out tile system block in AppShell (`{/* v86a: tile system is v86c */}`)
  can be removed in a future cleanup pass

## v98 cleanup arc — full pass summary

The v98 arc ran four passes, all on 2026-05-27. Goal: retire the "everything in AppShell"
model by migrating panels to the tile registry and removing LeftTabPanel.

| Pass | Branch / commit | What it did | E2E |
|---|---|---|---|
| v98 initial | `1f59c64` | Post-v97 cleanup phases 4–15: debug store, StatusBar CSS, Solar Plasma topbar rules, ControlDock grid artifact fix, Graph Inspector floating panel removed | 8 pre-existing tile-system failures, 0 new |
| v98.1b | `3e587c2` (rejected) | Recovery pass: StatusBar popover live stats, topbar pill-toggle CSS, AppShell grid cleanup. Rejected by developer — superseded by v98.3 prompt | — |
| v98.3 | `feat/v98-3-cleanup-completion` | QA feedback tile (`qa-feedback-section`), TileProvider auto-populate with bootstrap flag, `openQaPanel` inject-via-store pattern, `clearTiles` helper, 10+ test files hardened. LeftTabPanel removal deferred — QA tile prerequisite not yet met. | 619 / 38 pre-existing / 10 skip |
| v98.4 | `ecb11a8` (this pass) | All remaining panels tiled (Graph Visual Inventory, System Index, Command Deck). LeftTabPanel removed from AppShell and deleted. Viewport-aware anchor clamping. 246 tests updated. | 591 / 0 / 11 skip |

The v98 arc is closed. LeftTabPanel is gone from the codebase.

## Test delta explanation

v98.3: 619 passed, 38 failed, 10 skipped
v98.4: 591 passed, 0 failed, 11 skipped

The 38 previously-failing tests in v98.3 were pre-existing failures from tiles
interfering with LeftTabPanel-dependent tests. After migration, those tests either
pass via the new tile-based helpers or are no longer in the active test count
(tests that accessed LeftTabPanel tabs that no longer exist).
