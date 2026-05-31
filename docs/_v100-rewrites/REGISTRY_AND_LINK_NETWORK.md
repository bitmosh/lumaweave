# LumaWeave — Registries & the Link Network

**Supersedes:** `REGISTRY_CONTRACT_PATTERNS.md`, `LINK_NETWORK_OVERVIEW.md`, `HANDLESET_CONCEPT.md`, `ACTIVE_HANDLES.md`, `PLANNED_HANDLES.md`, `GRAPH_VIEW_ELEMENT_REGISTRY_CONTRACT.md`, `GRAPH_VIEW_ELEMENT_REGISTRATION_MODEL.md`

This is the one place to understand how LumaWeave stores typed, structured lists of things — commands, hotkeys, theme targets, graph elements, lenses, physics dialects, and so on — and how the four "link network" registries connect user controls to the visuals they affect. It describes what exists today (code-derived), the patterns to build within, and the boundaries that keep the system coherent.


---

## 1. What a registry is here

A **registry** is a typed, in-code catalog of entries with a stable shape and pure helper functions to read it. Registries are how LumaWeave keeps "the list of X" in one authoritative place instead of scattered across the codebase, and they're what the validator scripts and (eventually) the self-graph and radial inspector read.

Two principles hold across all of them:

- **Typed and validated.** Every entry conforms to a TypeScript interface; many registries have a standalone `validate-*.mjs` script that hard-fails CI if an entry violates its contract.
- **Read-mostly.** A registry stores data and exposes pure reads (`getById`, `list`, `filterBy*`). Side effects, I/O, and graph/Sigma mutation live in the implementation files the registry *points at*, never in the registry itself.

---

## 2. The tier model (the real rule)

There are three core patterns plus a few honest variants. The earlier `REGISTRY_CONTRACT_PATTERNS.md` claimed every registry was a const-array with no mutation; that was an overclaim. The truth is a small, deliberate set of shapes — and knowing which to use is the point of this section.

### Tier 1 — const-array + pure helpers (the default)

A `readonly` array of entries plus standalone pure functions. No classes, no mutation, no I/O. **This is the canonical choice for any static list known at build time.**

```ts
export const SEED_FUNCTION_REGISTRY: readonly SeedFunctionEntry[] = [ /* … */ ] as const;
export function getById(id: string) { return SEED_FUNCTION_REGISTRY.find(e => e.id === id); }
```

### Tier 2 — register + subscribe (runtime-reactive dev extension points)

A mutable object-literal implementing a contract interface, with `register()`, `subscribe()`, and a `listeners` set. Use this **only** when entries are added at runtime and the UI must react to that registration. This is intentional, not drift — it's the extension surface for plugging in new capabilities.

```ts
const entries: LensEntry[] = [];
const listeners = new Set<() => void>();
export const lensRegistry = {
  list: () => [...entries],
  register: (e) => { entries.push(e); listeners.forEach(l => l()); },
  subscribe: (l) => { listeners.add(l); return () => listeners.delete(l); },
  // …
};
```

### Legacy — v86a class / factory

Predates the rehaul. Either a `class … implements RegistryContract` or a factory closure returning an object with a `Map`. Works fine; low-priority migration targets. Do not write new registries this way.

### Variants you will encounter (and when they're correct)

- **Contract-object metadata catalog.** An object-literal implementing a contract interface (`list`/`getById`/`filterBy*`) but **read-only** — no runtime registration. The four link-network registries (§6) and `perspectiveRegistry` use this. It's Tier-1 intent (static metadata) expressed through a contract interface rather than a bare array.
- **Registry + entries split.** A thin registry container (`hotkey-registry.ts`, `command-registry.entries.ts`) populated by a separate `*.entries.ts` file that calls `register()` as an import side effect. The container is the catalog; the entries file is the data. `hotkey-registry` uses `register()` without `subscribe()` — a read-mostly variant, not a full Tier 2.
- **Data registry.** A very large authored/generated data store (`qa-registry.ts` ~381 KB, `advisory-registry.ts` ~187 KB). These are QA evidence/advisory data, not the architectural tier pattern — treat them as data, not as registries to imitate.

### Decision rule for a new registry

Static list known at build time → **Tier 1**. Runtime-mutable with UI that must react to registration → **Tier 2**. Pure metadata catalog exposed via a contract interface → **contract-object** (Tier-1 intent). Never new Legacy. When in doubt, Tier 1.

---

## 3. Registry inventory

| Registry | Pattern | Domain | Notes |
|---|---|---|---|
| `commandRegistry` | Tier 1 | control-plane/commands | Command palette source |
| `settingsRegistry` | Tier 1 | control-plane/settings | Drives the real SettingsPanel |
| `settingsPanelCategoryRegistry` | Tier 1 | control-plane/settings | v98.5 typed categories |
| `systemIndexRegistry` | Tier 1 | control-plane/system-index | 16-field entries; validator-guarded |
| `controlPlaneModeRegistry` | Tier 1 | control-plane/modes | Human/Evidence/Debug modes |
| `nodeProgramRegistry` | Tier 1 | graph/nodePrograms | Orb/Sun/Crystal/GlassSphere/Pip |
| `sourceAdapterRegistry` | Tier 1 | source-adapter | |
| `audioSourceRegistry` (`AUDIO_SOURCES`) | Tier 1 | audio (deferred) | |
| `musicReactiveMappingRegistry` | Tier 1 | audio (deferred) | |
| `motionSafetyRegistry` | Tier 1 | accessibility | Reduce-motion classification |
| `editorTemplateRegistry` | Tier 1 (Record) | control-plane/ide | Open-in-IDE URL templates |
| `themeTargetRegistry` | Tier 1 + heuristics | themes | Static entries augmented by `themeTargetHeuristics.ts`; UI-surface counterpart to link Layer 3 |
| `provenanceRegistry` | Tier 1 (Map reads) | themes | Reads `provenance-manifest.json` |
| `lensRegistry` | Tier 2 | lens | Dev extension point |
| `physicsDialectRegistry` | Tier 2 | graph/physics | Dev extension point |
| `animationPrimitiveRegistry` | Tier 2 | motion | |
| `edgeStyleRegistry` | Tier 2 | graph/edges | |
| `fontAxisRegistry` | Tier 2 | themes | |
| `typographyRegistry` | Tier 2 | themes | |
| `tileSectionRegistry` | Tier 2– (register, no subscribe) | control-plane/panels | Tile catalog |
| `hotkey-registry` (+`.entries`) | Registry+entries (register, no subscribe) | control-plane/hotkeys | See boundary note §7 |
| `handlesetRegistry` | Contract-object (scaffold) | control-plane/handles | Link Layer 1 — **not wired** (§6) |
| `controlSurfaceContractRegistry` | Contract-object | control-plane/contracts | Link Layer 2 |
| `graphVisualThemeMappingRegistry` | Tier 1 array + helpers | graph | Link Layer 3 |
| `graphViewElementRegistry` (`graphViewElements`) | Tier 1 array + helpers | graph | Link Layer 4 |
| `perspectiveRegistry` | Contract-object | control-plane/perspectives | |
| `inspectorSpokeRegistry` | Legacy (class) | themes | Migration candidate |
| `bookmarkRegistry` | Legacy (factory) | graph/overlay | Migration candidate |
| `assetRegistry` | Legacy (class) | themes | Empty asset bank |
| `qa-registry`, `advisory-registry` | Data registry | control-plane/qa | Large data stores, not patterns to imitate |
| `feature-registry` | Stub | control-plane/features | Currently empty |

`seedFunctions` is **no longer a registry** — it was `seedFunctionRegistry.ts`, now plain module exports in `physics/gwells/seedFunctions.ts`. Treat seed functions as a module, not a registry.

---

## 4. The standard ladder (how a system graduates to runtime)

New systems follow this sequence; no skipping steps:

1. **Contract** (docs-only) — allowed/forbidden behavior, schema, evidence required.
2. **Registry** (typed, read-only) — the schema as static typed data; no mutation/I/O/side effects.
3. **Validator** (`validate-*.mjs`) — standalone script, exit 0/1, registered in the QA bundle.
4. **Passive UI** — read-only display with `data-testid` on every meaningful element.
5. **Playwright evidence** — covers every `data-testid`; no skipped assertions.
6. **Runtime promotion** — only after all the above are clean, and only with an explicit new contract. Never promoted informally.

Live validators following this pattern: `validate-system-index.mjs`, `validate-contract-trace.mjs`, `validate-control-plane-modes.mjs`, `validate-source-adapters.mjs`, `validate-gwells.mjs`, `validate-qa-bundle.mjs`.

---

## 5. Conventions

**The `RegistryContract` interface** (`registryContract.types.ts`) is the v86a contract Legacy and contract-object registries implement: `list()`, `getById(id)`, `filterByCategory(query)`, `validateShape(entry)`, `register(entry)`, and optional `subscribe(listener)`.

**`data-testid` naming:** `[system]-[component]-[role]`, all lowercase, hyphen-separated, system name first, stable across refactors (e.g. `system-index-entry-{id}`).

**Validator script pattern:** import the registry, accumulate *all* errors before exiting, `.toLowerCase()` + `.includes()` for prose fields, exact match for IDs/enums, `process.exit(0|1)`.

**Anti-patterns:** implementing before the contract is accepted; adding a field not in the contract schema; a validator that silently passes on missing data; a passive surface without `data-testid`; promoting to runtime without a contract.

---

## 6. The Link Network (four layers)

The Link Network is a four-layer **metadata** architecture that maps a user-facing control to where it lives, the graph element it affects, and the theme tokens it consumes. It is the spine the radial inspector is intended to traverse to answer "what controls affect this visual element?" and "which tokens does this control consume?"

**Important reality check:** the network is metadata/scaffolding, not wired runtime. Layer 1's own file header states it "does not yet drive UI … This is a documentation/scaffold layer only" — the live `SettingsPanel` runs off `settings.registry.ts`, not the handle registry. Treat the Link Network as a typed inventory and a foundation for future tooling, not as the active control path.

| Layer | Registry (file) | Role |
|---|---|---|
| **1 — Handles** | `handlesetRegistry` (`handleset.registry.ts`) | What the user can manipulate (e.g. `labels.nodeLabelMode`, `appearance.theme`) |
| **2 — Control Surface** | `controlSurfaceContractRegistry` (`controlSurfaceContract.registry.ts`) | Where each control lives (topbar / graph / settings / mission-control) |
| **3 — Graph Visual Theme Mapping** | `graphVisualThemeMappingRegistry` | Graph element → canonical token path |
| **4 — Graph View Element** | `graphViewElementRegistry` (`graphViewElements`) | Graph element identities |

**Join keys:** Layer 1 ↔ 2 join by `settingsKey`. Layer 3 ↔ 4 join by `graphElementId`.

**Sibling — Theme Target Registry.** `themeTargetRegistry` is the non-graph counterpart to Layer 3: it maps **UI surfaces** (panels, chrome) to token paths, where Layer 3 maps **graph elements**. It's static entries plus `themeTargetHeuristics.ts`.

**Naming drift (known, intentional to document).** Layer 1 uses the `labels.*` / `appearance.*` handle namespace; Layers 3–4 use `graph.*` element IDs. The two namespaces don't share a key — the join from a control to a graph visual is conceptual, not a direct string match. Don't try to join Layer 1/2 to Layer 3/4 on a shared key; there isn't one.

**Patterns expressed:** Layers 1–2 are contract-object catalogs; Layers 3–4 are Tier-1 const-arrays with pure helpers. (A consistency cleanup to a single shape is a valid future pass, not a bug.)

> The Layer-3 mapping *contract* (`GRAPH_VISUAL_THEME_MAPPING_CONTRACT.md`) and the forward-looking handle taxonomy (`FUTURE_VISUAL_HANDLES_TAXONOMY.md`) are covered by the Theme & Token and Deferred / Post-v1 Vision docs respectively, not here.

---

## 7. Boundaries & gotchas

- **Hotkeys live in `control-plane/hotkeys/`, not `commands/`.** `commands/` is the command-palette layer only. New hotkey work goes in `hotkeys/`.
- **Seed functions are not a registry** — plain module exports in `physics/gwells/seedFunctions.ts`.
- **The Link Network is scaffolding, not wired.** See §6. Don't assume editing a handle entry changes runtime behavior.
- **Registries never mutate Sigma or perform I/O.** Runtime behavior is in the files a registry points at, behind an explicit contract.
- **This doc asserts no counts.** Entry totals and lists live in code; derive them with the validators or by reading the registry files. A number written in a doc is a stale cache waiting to happen.

---

## 8. Adding a new registry — checklist

1. Write/accept the contract (allowed/forbidden, schema, evidence).
2. Pick the pattern via §2's decision rule (default Tier 1).
3. Implement the registry as typed data + pure helpers; no side effects.
4. Add a `validate-<name>.mjs` script; register it in the QA bundle.
5. If it surfaces in UI, make the surface passive with full `data-testid` coverage + Playwright evidence.
6. Runtime promotion (mutation, execution) only behind a new explicit contract.
