# v99 Panel Migration Arc — LeftTabPanel Removal

## Status

DEFERRED from v98.3 (Pass 1c). LeftTabPanel removal requires migrating three panels
to the tile registry before the left panel can be removed from AppShell.

## Blocked on

`LeftTabPanel` in `src/control-plane/panels/LeftTabPanel.tsx` contains three panels
that are not yet registered as tiles:

| Panel | Component | Test file |
|---|---|---|
| Graph Visual Inventory | `GraphVisualInventoryPanel` | `tests/e2e/graph-visual-inventory.spec.ts` (214 tests) |
| System Index | `SystemIndexPanel` | `tests/e2e/system-index.spec.ts` (4+ tests) |
| Command Deck | `CommandDeckPanel` | `tests/e2e/command-deck.spec.ts` (8+ tests) |

Removing LeftTabPanel without migrating these panels first produces a 285-test cascade.

## Migration steps (v99 arc)

1. Register `GraphVisualInventoryPanel` as tile `graph-visual-inventory-section`
   - Add `GraphVisualInventoryTileContent` wrapper in `src/control-plane/graph/`
   - Add registry entry in `tileSectionRegistry.ts` with appropriate defaultAnchor
   - Update `graph-visual-inventory.spec.ts` to open via tile (not LeftTabPanel)

2. Register `SystemIndexPanel` as tile `system-index-section`
   - Add `SystemIndexTileContent` wrapper in `src/control-plane/system-index/`
   - Add registry entry, update `system-index.spec.ts`

3. Register `CommandDeckPanel` as tile `command-deck-section`
   - Add `CommandDeckTileContent` wrapper in `src/control-plane/command-deck/`
   - Add registry entry, update `command-deck.spec.ts`

4. Remove LeftTabPanel mount from AppShell (original Phase 7):
   - Remove imports: QaPanel, CollapsibleSection, CommandDeckPanel,
     GraphVisualInventoryPanel, SystemIndexPanel, SourceAdapterPanel, LeftTabPanel
   - Remove `panelSummary` variable (only used in LeftTabPanel block)
   - Remove LeftTabPanel JSX block (lines ~415-769 in AppShell at time of writing)
   - Remove outer section grid wrapper (two-column `gridTemplateColumns` style)

5. Run full E2E suite — should pass with tiles providing all previously-LeftTabPanel content

## Note on SourceAdapterPanel

`SourceAdapterPanel` is also in LeftTabPanel but has no dedicated test suite checking
its DOM presence. It can be migrated or omitted at the v99 arc's discretion.

## Reference

- v98.3 Phase 7 attempt: removed LeftTabPanel, produced 285-test cascade
- Situation Report: posted to #current-task 2026-05-27
- Known bug: `docs/known-bugs/tile-anchor-offsets-overlap-status-bar.md`
