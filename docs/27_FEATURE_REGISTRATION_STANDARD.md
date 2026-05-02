# Feature Registration Standard v0

## Goal

Define how new LumaWeave features are added safely and completely.

## 1. Feature Manifest Requirement

Every feature must declare:

- `id`: Unique identifier (e.g., "label-density-v0")
- `name`: Human-readable name
- `description`: Brief explanation of what the feature does
- `featureFlag`: Boolean if experimental (optional, default: false)
- `settings`: Array of setting paths added/modified
- `commands`: Array of command IDs added (optional)
- `panels`: Array of panel IDs touched/modified (optional)
- `rendererHooks`: Array of renderer hooks touched (optional)
- `qaChecklist`: Array of QA checklist items
- `sessionLogPath`: Path to session log documenting the feature

## 2. Completion Gates

A feature is not accepted unless:

- Schema updated if needed (`src/control-plane/settings/settings.schema.ts`)
- Defaults updated if needed (`src/control-plane/settings/settings.defaults.ts`)
- Registry/control UI updated if needed (`src/control-plane/settings/settings.registry.ts`)
- Settings are visible in SettingsPanel or intentionally hidden/planned
- AppShell wiring done if needed
- Renderer props accepted if needed
- Debug panel updated if needed
- QA checklist written
- `npm run typecheck` passes
- Manual QA steps documented in session log

## 3. Fail-Safe Rules

- **No dead controls**: If a setting exists in schema/defaults and affects renderer behavior, it must appear in SettingsPanel unless intentionally marked planned/hidden
- **No hidden active settings**: Settings that affect behavior must be visible in the UI or documented as planned
- **No hardcoded permanent colors without token TODO**: If colors are hardcoded, add a TODO comment to convert to theme tokens
- **No feature marked complete without runtime verification**: A feature is only complete when runtime evidence shows it triggered and produced the intended signal
- **If browser behavior differs from report, report is not accepted**: Manual QA must match documented behavior

## 4. Feature Registry Location

Suggested folder: `src/control-plane/features/`

Add or update: `src/control-plane/features/feature-registry.ts`

## 5. Feature Manifest Example

```typescript
import type { FeatureManifest } from "./feature.types";

export const labelDensityFeature: FeatureManifest = {
  id: "label-density-v0",
  name: "Label Density v0",
  description: "Controllable node and edge label visibility based on label modes and selection state",
  featureFlag: false,
  settings: [
    "labels.nodeLabelMode",
    "labels.edgeLabelMode",
    "labels.maxEdgeLabelLength",
    "labels.showLabelsOnHover",
    "labels.zoomLabelThreshold",
    "graphView.hoverNodeColor",
    "graphView.hoverLabelColor",
  ],
  commands: [],
  panels: ["SettingsPanel"],
  rendererHooks: ["sigma2d"],
  qaChecklist: [
    "Node labels can be turned off",
    "Node labels can be set to all",
    "Node labels work in selected-neighborhood mode",
    "Node labels work in important-only mode",
    "Edge labels can be turned off",
    "Edge labels work in selected-neighborhood mode",
    "Edge labels work in all-short mode",
    "Hovering a node shows label when showLabelsOnHover is true",
    "Hover label color contrasts with hover highlight",
    "Changing label modes does not break selection highlights",
    "Background click still clears selection highlights",
  ],
  sessionLogPath: "docs/logs/sessions/label-density-v0.md",
};
```

## 6. Feature Types (Future)

When implementing the runtime feature registry, consider these types:

```typescript
export interface FeatureManifest {
  id: string;
  name: string;
  description: string;
  featureFlag?: boolean;
  settings: string[];
  commands?: string[];
  panels?: string[];
  rendererHooks?: string[];
  qaChecklist: string[];
  sessionLogPath: string;
}

export interface FeatureRegistry {
  features: Map<string, FeatureManifest>;
  register(feature: FeatureManifest): void;
  get(id: string): FeatureManifest | undefined;
  list(): FeatureManifest[];
  listByFeatureFlag(enabled: boolean): FeatureManifest[];
}
```

## 7. Feature Onboarding Checklist

When adding a new feature:

- [ ] Feature manifest created or updated
- [ ] Schema updated (if adding new settings)
- [ ] Defaults updated (if adding new settings)
- [ ] Registry updated (if adding visible controls)
- [ ] SettingsPanel handles new control types (if needed)
- [ ] AppShell wired (if renderer props needed)
- [ ] Renderer accepts new props (if renderer props needed)
- [ ] Debug panel updated (if relevant)
- [ ] QA checklist written
- [ ] Session log created/updated
- [ ] Typecheck passes
- [ ] Manual QA performed
- [ ] Manual QA documented in session log

## 8. Settings Control Types

Supported control types in `settings.registry.ts`:

- `boolean`: Checkbox toggle
- `range`: Slider with min/max/step
- `select`: Dropdown with options
- `text`: Text input (for hex colors, strings, etc.)

## 9. Planned Features

If a setting exists but is not fully implemented:

- Mark with "(Planned)" in the label
- Add description explaining what it's planned for
- Example: `"label": "Zoom Label Threshold (Planned)", "description": "Minimum zoom level to show labels. Planned for future implementation."`

## 10. Session Log Requirements

Session logs must include:

- Goal
- Manual QA findings (failures and successes)
- Root causes found
- Files changed
- Settings exposed (if any)
- Behavior added
- Validation results
- Expected behavior after fix
- Known limitations
- Next steps
- Roadmap context

Session logs should be created under: `docs/logs/sessions/`

## 11. Type Enforcement

When the runtime feature registry is implemented:

- Use TypeScript types for feature manifests
- Validate feature manifests at startup
- Warn if a feature's settings are not in schema
- Warn if a feature's settings are not in registry

## 12. Feature Dependencies (Future)

If features depend on other features:

- Add `dependencies: string[]` to feature manifest
- Check dependencies at registration time
- Warn if dependency not registered

## 13. Feature Migration Path (Future)

When converting hardcoded values to theme tokens:

- Add migration note in session log
- Update feature manifest to include `themeTokens: string[]`
- Ensure theme tokens exist in theme schema
- Update settings defaults to use theme token references

## 14. Anti-Patterns

Avoid these anti-patterns:

- Adding settings without registry entries (creates hidden settings)
- Adding settings without schema entries (type errors)
- Adding renderer props without AppShell wiring (unused props)
- Marking feature complete without manual QA verification
- Adding color constants without TODO for theme token conversion
- Creating dead controls (controls that don't affect behavior)

## 15. Example: Complete Feature Onboarding

Example: Adding a new label mode

1. Add mode to schema: `settings.schema.ts` - `NodeLabelMode` type
2. Add mode to registry: `settings.registry.ts` - select options
3. Add mode to label policy: `labelPolicy.ts` - implement behavior
4. Add mode to QA checklist: feature manifest
5. Add mode to session log: document behavior
6. Run typecheck
7. Perform manual QA
8. Update session log with QA results

## 16. Feature Retirement (Future)

When retiring a feature:

- Mark `featureFlag: true` to disable
- Add `deprecated: true` to manifest
- Add deprecation notice in UI
- Document migration path in session log
- Remove from codebase in next major version

## 17. Feature Versioning

Feature IDs should include version:

- `label-density-v0`
- `label-density-v1`

When upgrading a feature:

- Create new feature manifest with new version
- Document migration from old version in session log
- Keep old feature manifest for reference
