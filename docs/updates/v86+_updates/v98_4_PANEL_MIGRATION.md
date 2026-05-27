# v98.4 Panel Migration — LeftTabPanel Removal

## Status

COMPLETED in v98.4. All three panels migrated to tile registry; LeftTabPanel removed
from AppShell.

## What was done (v98.4)

| Panel | Tile wrapper | Registry ID | Test helper |
|---|---|---|---|
| Graph Visual Inventory | `GraphVisualInventoryTileContent` | `graph-visual-inventory-section` | `openGraphVisualInventory` |
| System Index | `SystemIndexTileContent` | `system-index-section` | `openSystemIndex` |
| Command Deck | `CommandDeckTileContent` | `command-deck-section` | `openCommandDeck` |

- `CommandDeckPanel` props made optional with CSS var defaults (no AppShell context needed)
- 3 new command palette entries added (`view.toggleTile.graphVisualInventory`, etc.)
- `computeAnchorPos` updated with viewport-aware clamping (`STATUS_BAR_HEIGHT = 40`)
- LeftTabPanel JSX block removed from AppShell (lines 408–769)
- `panelSummary` variable removed from AppShell (line 109)
- LeftTabPanel.tsx deleted if fully orphaned
- Known-bug doc `tile-anchor-offsets-overlap-status-bar.md` marked resolved

## Previous context

- v98.3 deferred LeftTabPanel removal (produced 285-test cascade; panels not yet tiled)
- Known bug: `docs/known-bugs/tile-anchor-offsets-overlap-status-bar.md` (resolved)
