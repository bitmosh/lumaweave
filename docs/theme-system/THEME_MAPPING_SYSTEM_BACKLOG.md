# Theme Mapping System Backlog (v18a)

## Summary
Theme Mapping Mode is the future fusion point between Control Contract OS, Visual Handle Library, and the Theme Token Path Map. v18a documents the backlog architecture only—no runtime code. This mode must surface canonical theme targets, expose their allowed token bindings, and stage overrides that can later be saved as presets.

## User Experience Vision
1. Operator toggles **Theme Mapping Mode** (inspired by Ableton MIDI Map Mode).
2. Inspector overlay highlights `data-lw-theme-target` nodes as the cursor moves.
3. Hovering shows `themeTargetId`, `visualHandle`, `tokenBindings`, and editable properties.
4. Clicking generates a contextual theme panel seeded with allowed controls (color, opacity, glow, radius, etc.).
5. Operator previews adjustments, then either saves to a preset or discards.
6. Debug UI reflects active overrides so QA can capture evidence.

## Relationship to Existing Systems
- **Control Contract OS**: Supplies canonical `handleId` + `settingsKey` metadata for any future control automatically emitted by the Theme Mapping Panel.
- **Visual Handle Library**: Defines reusable CSS primitives (`visualHandle`) that Theme Mapping targets attach to.
- **Theme Token Path Map**: Provides authoritative `themeTokenPath` references per property; must land in v19 before editable mappings go live.
- **Mission Control**: Hosts QA + Theme Mapping workflows; persists chosen presets via existing settings store.
- **Future Debug UI Inspector Overlay**: Shares the same inspection substrate as Theme Mapping Mode for hover ID readouts.
- **Theme Mapping Panel**: Future UI module that instantiates active controls generated from the contracts described here.

## Core IDs and Terms
- **handleId** – Control/action identity inside the Control Contract registry.
- **settingsKey** – Persisted state path for a control; nullable for stateless inspector affordances.
- **visualHandle** – CSS/DOM styling primitive (e.g., `lw-panel`) from the Visual Handle Library.
- **themeTokenPath** – Canonical design token path (e.g., `app.panel.border`).
- **themeTargetId** – Inspectable/customizable UI surface identifier (e.g., `mission-control.panel`).
- **`data-lw-theme-target`** – DOM attribute used by the inspector overlay to bind runtime nodes to `themeTargetId`.
- **themeOverride** – User-authored customization for a given `themeTargetId` + token/property pair.
- **themePreset** – Saved package of overrides + metadata (built-in or user-defined).
- **temporaryPreview** – Unsaved override layer used while the inspector is open; auto-reverts if canceled.

## Data Model Sketch
```ts
type ThemeTargetContract = {
  themeTargetId: string;
  label: string;
  surface: "shell" | "panel" | "control" | "graph" | "mission-control";
  visualHandle?: string;
  tokenBindings: Record<string, string>;
  editableProperties: string[];
  status: "active" | "planned" | "experimental";
};

const missionControlPanel: ThemeTargetContract = {
  themeTargetId: "mission-control.panel",
  label: "Mission Control Panel",
  surface: "mission-control",
  visualHandle: "lw-panel",
  tokenBindings: {
    background: "app.panel.background",
    border: "app.panel.border",
    accent: "accent.primary",
  },
  editableProperties: ["background", "border", "accent"],
  status: "planned",
};
```

## Override Layer Model
Resolution order (top wins):
1. **Temporary preview** — volatile edits while mapping mode is active.
2. **Per-target override** — saved adjustments scoped to a `themeTargetId`.
3. **User theme preset** — the operators selected preset (may include multiple overrides).
4. **Base theme preset** — shipped preset definition (Solar Plasma, etc.).
5. **Fallback token** — baked-in default token if nothing else matches.

Guardrails:
- Every override references a registered target + property.
- Overrides must be reversible (preview cancel, preset reset).
- Arbitrary CSS injection is prohibited in v0.
- Base presets stay intact even if user overrides fail to load.

## Required Future Phases
1. **v18 — Control Handle / Settings Key Alignment** *(complete)*: establishes trustworthy handle + settings metadata for future controls.
2. **v18a — Theme Mapping System backlog** *(this doc)*: records architecture before new runtime work.
3. **v19 — Theme Token Path Map**: produces canonical token graph; blockers for mapping mode without it.
4. **v20 — Theme Target Registry**: formalizes `ThemeTargetContract` entries tied to `data-lw-theme-target` usage.
5. **v21 — Debug UI Inspector Overlay**: runtime hover/selection substrate with readouts + QA evidence.
6. **v22 — Theme Mapping Panel v0**: generates controls from target registry, wiring into Control Contract OS.
7. **v23 — Theme Override Storage + Save Preset**: persistence + preset management for overrides.

**Why this order**: Each phase unlocks the next dependency—token map precedes targets, targets precede overlays, overlays precede control generation, controls precede storage.

## Non-Goals
- Implementing runtime color pickers or new UI.
- Touching graph renderer/glitter/preset runtime.
- Turning visual handles or theme targets into active controls prematurely.
- Editing existing presets or Mission Control layout.

## Risks / Guardrails
- **Risk**: Token ambiguity could cause inconsistent overrides. *Guardrail*: Finish Theme Token Path Map before emitting editable properties.
- **Risk**: Inspector overlay could misidentify DOM nodes. *Guardrail*: require `data-lw-theme-target` registration via Theme Target Registry.
- **Risk**: Override sprawl leading to unbounded CSS. *Guardrail*: whitelist editable properties per target.
- **Risk**: Coupling to glitter or graph visual policy prematurely. *Guardrail*: keep mapping mode orthogonal until those systems stabilize.

## Acceptance Criteria for Future Implementation
- Inspector overlay lists `themeTargetId`, `visualHandle`, `tokenBindings`, and editable properties for any registered target.
- Mapping Panel auto-generates controls with valid `handleId` + `settingsKey` metadata.
- Overrides respect the layer model and can be previewed, committed, or reset.
- QA Debug summary can show active per-target overrides for evidence.
- Theme presets remain loadable without mapping mode; new overrides degrade gracefully.
