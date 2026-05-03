# Bandit Level 20.5: Graph Theme Preview Knight

## Level Awarded

+3 levels from previous (17.5 → 20.5)
- +1 v53 clean pass
- +1 v54 clean pass
- +1 full quest clean bonus

## Quest Completed

**v53/v54 Quest Mode: Graph Theme Token Value Preview**

### v53: Graph Theme Token Value Preview Contract (docs-only)

Created `docs/graph/GRAPH_THEME_TOKEN_VALUE_PREVIEW_CONTRACT.md` defining:
- What constitutes Graph Theme Token Value Preview
- Token path metadata (v52) vs token value preview (v54) distinction
- Allowed preview boundary for v54
- Forbidden boundaries (Sigma mutation, node/edge styling, CSS writes, storage, hotkeys)
- v54 preconditions
- v55+ promotion path
- Stop conditions and acceptance criteria

### v54: Read-Only Graph Theme Token Preview (implementation)

Implemented read-only token value preview in `src/control-plane/graph/GraphVisualInventoryPanel.tsx`:
- Added Graph Theme Token Value Preview (v54) section
- Displays preview status: "metadata only (value preview deferred)"
- Shows forbidden status for token application, CSS writes, Sigma mutation
- No apply/edit/save controls (read-only only)
- Added 11 Playwright tests in `tests/e2e/graph-visual-inventory.spec.ts` proving:
  - Token value preview section is visible
  - All status indicators show correct forbidden states
  - No apply/edit/save controls exist
  - Existing inventory/theme mapping/evidence wrapper modes still work

## Clean Pass Evidence

### v53 Validation
- Typecheck: 0 errors
- Playwright: 208 passed, 0 failures, 0 skips
- No skipped tests: confirmed via grep
- Post-commit git status: clean

### v54 Validation
- Typecheck: 0 errors
- Playwright: 219 passed (11 new tests added), 0 failures, 0 skips
- No skipped tests: confirmed via grep
- Post-commit git status: clean

## Contract Compliance

### v53 Contract Compliance
- All 19 required sections filled
- Consistent with GRAPH_THEME_RUNTIME_APPLICATION_CONTRACT.md
- Consistent with GRAPH_VISUAL_THEME_MAPPING_CONTRACT.md
- Consistent with GRAPH_RUNTIME_BOUNDARY_CONTRACT.md
- Token path vs token value boundary clearly defined
- All forbidden boundaries explicitly stated

### v54 Implementation Compliance
- Read-only display only (no apply/edit/save controls)
- No Sigma/renderer mutation
- No node/edge/canvas styling changes
- No token value application to graph runtime
- No CSS variable writes
- No storage/persistence added
- No hotkeys/listeners added
- No command execution added
- Playwright tests prove read-only behavior

## Commits

```
62ddc0d feat: implement read-only graph theme token preview (v54)
4d7ebed docs: define graph theme token value preview contract (v53)
```

## Backlog Updated

Updated `docs/control-plane/qa/BACKLOG_POLICY.md`:
- v53 marked as completed
- v54 marked as completed
- v55+ (first true graph theme application) marked as requiring new contract

## Architecture Boundaries Respected

### Token Path vs Token Value Boundary
- v52: token path strings as metadata only
- v54: token value preview as read-only display (metadata only in this implementation)
- v55+: token value application (forbidden until explicit new contract)

### Sigma/Renderer Boundary
- No Sigma instance access
- No Sigma API calls
- No renderer settings changes

### Node/Edge/Canvas Boundary
- No node/edge style changes
- No canvas style changes

### CSS Variable Boundary
- No CSS variable writes
- No DOM style.setProperty() calls

### Storage/Persistence Boundary
- No localStorage/sessionStorage
- No database/file storage

### Command/Hotkey Boundary
- No Command Deck registration
- No slash command registration
- No hotkey/listener addition

## Next Steps (v55+)

True token value application requires:
- Specific runtime contract for token application
- Advisory discussion and approval
- Playwright evidence for safe application
- No skipped tests
- No banned hotkeys
- No DevTools wording in docs
- Clear promotion path from v54 read-only preview to v55+ application

## Bandit Title Rationale

**Graph Theme Preview Knight** - Awarded for successfully implementing a read-only preview of graph theme token values while maintaining strict boundaries against mutation, CSS writes, storage, and hotkeys. The knight defends the graph runtime boundaries while providing valuable preview capability.
