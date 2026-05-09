---
id: theme.override.storage.contract
title: Theme Override / Storage Contract
type: contract
status: current
version: v86a
domain: theme
cluster: gold
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
governs:
  - src/themes/themeOverrideStorage.ts
references:
  - theme.system.overview
  - theme.token.path.map
  - theme.token.compatibility
  - theme.target.registry
  - theme.mapping.panel.entry.contract
  - link.network.overview
tags:
  - theme
  - override
  - storage
  - contract
  - v33
  - v34a
  - v34b
  - v34c1
  - v86a
---

# Theme Override / Storage Contract

*Originally drafted v33 Planning. Updated through: v34a global-only storage implementation, v34b narrow theme mapping edit control, v34c1 export-only override bundle, v86a tier model integration.*

## Status

- **v33 contract only.** This document defines semantics and preconditions for future theme override storage implementation.
- **v34a** has implemented global-only theme override storage foundation.
- **v34b** has enabled one narrow theme mapping edit control (`panel.background` on `mission-control.panel`).
- **v34c1** has implemented export-only override bundle capability for validated global theme overrides.
- **v34c2** may implement preset import/apply after v34c1 is accepted.
- No runtime override storage existed before v34a.
- No generated controls were editable before v34b.
- No export capability existed before v34c1.
- v32 generated read-only controls remain disabled and read-only during v33.
- v34b enabled only one narrow control; all other controls remain disabled.
- v34c1 is export-only; import/apply is deferred to v34c2.

## v86a Status Note

As of v86a, the three-tier token model (primitives / semantics / components) provides the resolved values that this override storage contract layers on top of. The contract is unchanged structurally — overrides still apply per canonical token path, validate against `CANONICAL_THEME_TOKEN_PATHS`, and persist via the storage mechanism defined in v34a/b/c1.

The relationship to the tier model:

- Overrides target canonical token paths (e.g. `panel.background`)
- Resolution walks Tier 3 → Tier 2 → Tier 1 the same way base presets do
- Override values can be Tier 1 primitives (raw colors), Tier 2 semantics (`{surface.panel.warm}`), or already-resolved values from the override storage layer
- Tier-walk validation in `themeTokenGovernance.ts` applies to override-resolved values too — overrides cannot bypass tier rules

Overrides are storage state, not part of the canonical token graph. They layer on top during runtime resolution but do not mutate `themePrimitives`, `themeSemantics`, `themeComponents`, or `themePresets`.

For the four-layer link network architecture, see [Link Network Overview](link.network.overview). For the three-tier token model, see [Theme System Overview](theme.system.overview) and [Theme Token Compatibility](theme.token.compatibility).

## Purpose

Define the formal contract for how future theme overrides will work before implementing storage in v34. This contract answers:

- What is a theme override?
- What is not a theme override?
- How do overrides relate to base theme presets?
- What scopes are allowed?
- What token paths are eligible?
- How do visual handles and Theme Targets connect to override eligibility?
- What is forbidden until v34+?
- How do generated read-only controls become eligible for future editing?
- What evidence proves storage/editing is still locked during v33?

This contract inherits from the accepted Theme Mapping Panel entry chain (v28–v32) and does not re-litigate requirements already established in those passes.

## Definitions

### Theme Override

A theme override is a user-authored value for a canonical `ThemeTokenPath`, scoped according to the approved scope model, layered on top of a selected base preset without mutating the canonical preset definition.

### Base Preset

A canonical theme preset defined in `src/themes/themePresets.ts` and documented in [Theme Preset Model](theme.preset.model). Base presets are immutable inputs to the theme system.

### Override Scope

The domain to which an override applies. Scopes define how widely an override affects the UI. Initial scopes are defined conservatively in the Scope Model section.

### Canonical ThemeTokenPath

A token path string defined in `src/themes/themeTokenPaths.ts` and documented in [Theme Token Path Map](theme.token.path.map). Only canonical paths are eligible for override storage.

## Non-Goals

### Not a Theme Override

The following are **not** theme overrides and are out of scope for v33/v34 storage work:

- Planned token promotion (governance-only process)
- Direct CSS mutation via browser DevTools or runtime injection
- Component-local style hacks or inline styles
- Graph/Sigma visual mutation (e.g., node color overrides)
- QA checklist state persistence
- Temporary inspector selection/pin state
- Runtime-only debug display state
- Theme selector preset selection (this is base preset selection, not override)

### Out of Scope for v33/v34

- Graph/Sigma renderer theme integration (deferred to Graph View Element Registry refresh)
- Command Deck / Hotkey Registry integration (deferred to dedicated hotkey system)
- Global CSS variable injection outside the theme system
- Theme preset creation/editing (deferred to future preset management capability)

## Override Model

### Layering

- Base preset provides default values for all canonical token paths.
- Overrides layer on top of base preset values for specific token paths.
- Override values take precedence over base preset values at runtime.
- Multiple overrides for the same token path within the same scope are disallowed (single-value constraint).

### Immutability

- Base presets cannot be mutated by overrides.
- Override storage is separate from preset definition files.
- Removing an override reverts to base preset value.
- Resetting all overrides reverts to base preset entirely.

### Persistence

- Overrides persist across browser sessions via storage mechanism defined in v34.
- Overrides are scoped per-user, not shared across users.
- Storage mechanism must include validation, migration, and reset behavior.

## Scope Model

### Initial Scopes (v34 Candidate)

v34 should begin with the smallest safe scope. The following scopes are proposed, but only the first is recommended for v34 initial implementation:

1. **Global Override** (recommended for v34)
   - Applies to all UI surfaces across the application.
   - Single override value per token path.
   - Simplest storage model.
   - No surface-specific logic.

2. **Theme Target Override** (deferred to v34b or later)
   - Applies to a specific Theme Target (e.g., `mission-control.panel`).
   - Requires surface scoping logic.
   - More complex storage model.
   - Enables per-surface customization.

3. **Visual Handle Override** (deferred to v34c or later)
   - Applies to all surfaces using a specific visual handle (e.g., `lw-panel`).
   - Requires handle-based lookup.
   - Most complex storage model.
   - Enables handle-based customization.

### Scope Hierarchy

If multiple scopes are implemented in future passes:

- More specific scopes override less specific scopes (e.g., target override overrides global override for that target).
- Scope hierarchy must be documented and validated.
- No silent scope conflicts allowed.

## Eligible Token Paths

### Canonical Only

- Only canonical `ThemeTokenPath` values from `src/themes/themeTokenPaths.ts` and [Theme Token Path Map](theme.token.path.map) are eligible for override storage.
- Planned tokens in the planned section of [Theme Token Path Map](theme.token.path.map) remain ineligible until promoted through full token governance.
- No new token path strings may be created via override storage.

### Validation

- Storage mechanism must validate token paths against canonical list before persisting.
- Invalid token paths must be rejected with clear error messages.
- Planned tokens must be rejected with governance-only messaging.

### Examples

- Eligible: `panel.background`, `text.primary`, `accent.primary`
- Ineligible: `control.background` (planned), `custom.token` (non-canonical)

## Theme Target / Visual Handle Relationship

### Eligibility Derivation

- Theme Target tokenBindings + Visual Handle token citations define which future controls are eligible for override editing.
- Only registered Theme Targets with complete metadata (`tokenBindings`, `editableProperties`, `visualHandle`) are eligible.
- Generated read-only controls from v32 are previews of possible future override controls, not active editors.

### Connection Path

1. User pins a registered Theme Target in the Theme Mapping Panel.
2. Panel displays generated read-only control rows for each editable property.
3. Each control row shows canonical token path and visual handle relationship.
4. In v34, these controls become editable when wired to override storage.
5. Override storage validates token paths against Theme Target bindings.

### Guardrails

- Overrides must respect Theme Target token bindings.
- Overrides cannot introduce token paths not bound to the target.
- Visual handle citations must align with Theme Target bindings.

## Generated Control Eligibility

### v32 State

- v32 generated read-only controls are disabled and display only.
- No editing behavior exists.
- No storage connection exists.
- Controls are diagnostic previews of future editing surface.

### v34 Eligibility

Generated controls become eligible for editing when:

- Override storage is implemented and validated.
- Controls are wired to storage read/write operations.
- Validation ensures only canonical token paths are stored.
- Scope model is applied correctly.

### Transition

- v33 contract defines the transition path.
- v34 implementation must prove:
  - Controls only enable when storage is ready.
  - Disabled state remains until v34 ships.
  - QA identity confirms storage/editing locked during v33.

## Storage Boundary

### v33 Semantics Only

- v33 does not define actual storage implementation details beyond contract semantics.
- Storage mechanism (localStorage, IndexedDB, file-based, etc.) is a v34 implementation decision.
- Any storage mechanism in v34 must include validation, migration/reset behavior, and no silent preset mutation.

### v34 Requirements

- No override should be persisted without a canonical token path and accepted scope.
- Storage must validate token paths before persisting.
- Storage must support reset/remove behavior.
- Storage must include migration path for schema changes.
- Storage must not mutate base preset files.

### Validation

- Invalid token paths cannot be stored.
- Planned tokens cannot be stored.
- Non-canonical strings cannot be stored.
- Empty/null values must be handled (treated as remove/reset).

## Preset Relationship

### Base Preset Immutability

- Base presets are immutable inputs.
- Overrides layer on top, do not mutate presets.
- Preset selection is separate from override editing.
- Switching presets does not clear overrides unless explicitly designed.

### Preset Save

- Saving a preset should be a separate promoted capability, not implicit in override editing unless v34 explicitly scopes it.
- v34 may implement override-only storage first.
- Preset save/export is deferred to v34b or later.

### Reset Behavior

- Reset overrides button reverts to base preset.
- Reset per-scope overrides (e.g., reset target overrides only).
- Clear all overrides resets entire application to base preset.

## Export Capability (v34c1)

### Export-Only Behavior

v34c1 implements export-only capability for validated global theme overrides. This is the smallest safe bridge from override storage toward future preset save/export.

### Export Function

- `exportGlobalThemeOverrideBundle()` exports current validated global overrides in a structured bundle format.
- Export is read-only; it does not mutate storage or base presets.
- Export filters to only canonical `ThemeTokenPath` entries.
- Invalid/noncanonical/planned tokens are filtered out during export.

### Export Bundle Format

```typescript
{
  version: 1,
  kind: "lumaweave.themeOverrideBundle",
  scope: "global",
  overrides: [
    {
      tokenPath: ThemeTokenPath,
      value: ThemeTokenValue
    }
  ]
}
```

### Export Rules

- Export empty override set safely (returns valid bundle with empty overrides array).
- Export must not include noncanonical token paths.
- Export must not include planned tokens.
- Export must not mutate storage.
- Export must not mutate base presets.
- If localStorage contains invalid manual junk, export sanitizes/rejects/ignores according to v33/v34a validation rules.

### Export vs Import

- v34c1 is export-only.
- Import/apply capability is deferred to v34c2.
- Export bundle format is designed to be compatible with future import capability.

### Validation

Export should be validated by Playwright tests proving:

- Valid global override exports correctly.
- Empty export works.
- Invalid/noncanonical stored data cannot appear in exported bundle.
- Base presets are not mutated.
- Existing v34b enabled control still works.
- Other controls remain disabled.
- Candidates remain diagnostic-only.

## Validation / Evidence Requirements

### Implementation Validation

Future implementation (v34) must prove:

- Invalid token paths cannot be stored.
- Planned tokens cannot be stored.
- Overrides do not mutate base presets.
- Reset/remove behavior exists and works.
- Generated controls only become enabled when wired to real behavior.
- Override values apply correctly at runtime.
- Scope model is enforced correctly.

### QA Evidence

- QA identity confirms storage/editing locked during v33.
- QA advisory questions validate contract understanding.
- Playwright tests prove visible behavior matches contract.
- Debug tab shows storage evidence (when implemented in v34).

### Runtime Evidence

- No localStorage/sessionStorage writes during v33.
- No persistence file mutations during v33.
- No theme preset file mutations during v33.
- No runtime theme mutation during v33.

## v34 Implementation Preconditions

### Contract Acceptance

- v33 contract must be accepted before v34 implementation begins.
- No storage implementation may proceed without contract acceptance.
- QA identity must confirm v33 acceptance.

### Checklist

- v33 contract doc exists and is reviewed.
- Scope model is defined and approved.
- Eligible token paths are documented.
- Storage boundary is clear.
- Validation requirements are defined.
- QA identity/advisory/backlog loads for v33.

### Technical Readiness

- Theme Target Registry is stable.
- Visual Handle Library is stable.
- Canonical token paths are stable.
- v32 generated controls are stable.
- No planned token promotion in flight.

## Forbidden Until Promoted

### v33 Forbidden

- localStorage/sessionStorage writes
- persistence file mutations
- settings schema mutations
- theme preset mutations
- runtime theme mutations
- color picker UI
- enabled inputs in Theme Mapping Panel
- save preset button behavior
- override application behavior
- graph/Sigma theme integration
- new hotkeys
- package/dependency changes
- planned token promotion
- weakening tests
- skipped tests
- manual DevTools JavaScript as acceptance path

### v34 Forbidden Until Promoted

- Graph/Sigma renderer theme integration (deferred to Graph View Element Registry)
- Command Deck / Hotkey Registry integration (deferred to dedicated hotkey system)
- Global CSS variable injection outside theme system
- Theme preset creation/editing (deferred to preset management)
- Multi-user override sharing
- Remote override synchronization

## Acceptance Criteria

### Contract Acceptance

- v33 contract doc exists with all required sections.
- Scope model is defined conservatively.
- Eligible token paths are documented.
- Storage boundary is clear.
- Preset relationship is clear.
- v34 implementation preconditions are documented.
- Forbidden items are clearly listed.

### QA Acceptance

- QA identity updated to v33.
- Checklist proves contract doc exists.
- Checklist proves storage/editing remains locked.
- Checklist proves no runtime override storage implemented.
- Checklist proves v32 controls remain read-only.
- Checklist proves v34 preconditions documented.
- Advisory questions load for v33.
- Advisory proposals load for v33.
- Backlog items load for v33.

### Validation Acceptance

- typecheck passes.
- Playwright passes with 0 skipped.
- `test.skip` grep returns no results.
- hotkey grep returns clean for active runtime/source/tests/current QA.
- DevTools wording grep returns clean.
- git diff shows only allowed files.
- No storage/editing/runtime theme mutations detected.

## Related Documents

- [Theme Mapping Panel Entry Contract](theme.mapping.panel.entry.contract) (v28)
- [Theme Target Registry](theme.target.registry)
- [Theme Token Path Map](theme.token.path.map)
- [Theme Token Compatibility](theme.token.compatibility)
- [Theme System Overview](theme.system.overview)
- Visual Handle Library — `docs/handleset/`
- UI Surface and Handle Inventory — pending consolidation

---

*v33 contract structure preserved. v86a status note added at top. Path references updated from `docs/theme-system/` to current `docs/theme/`. All v33–v34c1 governance unchanged.*
