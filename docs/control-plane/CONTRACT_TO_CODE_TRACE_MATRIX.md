# Contract-to-Code Trace Matrix

**Version**: v71a
**Purpose**: Map major contracts and governance docs to runtime files, registries, tests, and evidence paths to reduce drift between contracts, source, QA, and validation.

## Overview

This matrix traces the relationship between:
- Contract documentation (`docs/contracts/`, `docs/control-plane/`, `docs/audio/`, `docs/graph/`)
- Source/runtime files (`src/`)
- Registry files (`src/*/registry.ts`)
- QA/advisory keys (`src/control-plane/qa/`)
- Playwright tests (`tests/e2e/`)
- Evidence surfaces (UI panels, inventory displays)
- Forbidden boundaries
- Current status
- Known gaps and future validation needs

## Trace Matrix

| Contract/Doc Path | Source/Runtime Files | Registry Files | QA Key/Pass Association | Playwright Test File(s) | Evidence Surface | Forbidden Boundaries | Current Status | Known Gaps / Future Validation |
|-------------------|---------------------|----------------|------------------------|------------------------|-----------------|----------------------|----------------|------------------------------|
| **Command Deck / Hotkey Registry** | `src/command-deck/` | `src/command-deck/hotkeyRegistry.ts` | v30–v32 | `tests/e2e/hotkey-registry.spec.ts` | Command Deck panel | No command execution without explicit authorization | Stable (v32) | Future: dedicated hotkey policy contract |
| **Perspective System** | `src/perspective/` | `src/perspective/perspectiveRegistry.ts` | v30 | `tests/e2e/perspective.spec.ts` | Perspective switcher UI | No perspective mutation without contract | Stable (v30) | Future: perspective migration protocol |
| **Graph View Element Registry** | `src/graph/graphViewElementRegistry.ts` | `src/graph/graphViewElementRegistry.ts` | v40 | `tests/e2e/graph-view-element-registry.spec.ts` | Graph Visual Inventory panel | No graph/Sigma mutation without explicit authorization | Stable (v40) | Future: element registry refresh policy |
| **Graph Visual Inventory** | `src/control-plane/graph/GraphVisualInventoryPanel.tsx` | Uses multiple registries | v48 (detail mode), v68 (navigation contract) | `tests/e2e/graph-visual-inventory.spec.ts` | Graph Visual Inventory panel | No collapsible evidence sections without v69 retry | Stable (v68) | v69 paused/retry later with sliced passes |
| **Graph Runtime Boundary / Probe** | `src/graph/graphRuntimeBoundary.ts` | `src/graph/graphRuntimeBoundary.ts` | v42 | `tests/e2e/graph-runtime-boundary.spec.ts` | Theme target probe UI | No graph/Sigma renderer mutation | Stable (v42) | Future: runtime boundary expansion |
| **Graph Theme Mapping Registry** | `src/graph/graphVisualThemeMappingRegistry.ts` | `src/graph/graphVisualThemeMappingRegistry.ts` | v57 | `tests/e2e/theme-mapping.spec.ts` | Theme Mapping panel | No theme mutation without lock/pin stability | Stable (v57) | Future: theme application readiness diagnostic |
| **Theme Token Path Map** | `src/themes/themeTokenPathMap.ts` | `src/themes/themeTokenPathMap.ts` | v57 | `tests/e2e/theme-token-path.spec.ts` | Theme token path display | No CSS variable writes without explicit authorization | Stable (v57) | Future: token path validation tool |
| **Motion Safety / Epilepsy Guard** | `src/accessibility/motionSafetyRegistry.ts` | `src/accessibility/motionSafetyRegistry.ts` | v59 | `tests/e2e/motion-safety.spec.ts` | Motion Safety panel | No animation before safety guard is proven | Stable (v59) | Future: reduced motion guard registry (v60) |
| **Synthetic Audio Signal Preview** | `src/audio/syntheticAudioSignal.ts` | `src/audio/syntheticAudioSignal.ts` | v62 | `tests/e2e/synthetic-audio-signal.spec.ts` | Synthetic signal preview UI | No audio playback, no real audio before safety gates | Stable (v62) | Future: signal-to-visual reactivity (deferred) |
| **Music Reactive Mapping Registry** | `src/audio/musicReactiveMappingRegistry.ts` | `src/audio/musicReactiveMappingRegistry.ts` | v63 | `tests/e2e/music-reactive-mapping.spec.ts` | Music Reactive Mapping panel | No music reactivity before Motion Safety proven | Stable (v63) | Future: passive inventory (v64) |
| **Audio Source Registry** | `src/audio/audioSourceRegistry.ts` | `src/audio/audioSourceRegistry.ts` | v66 | `tests/e2e/audio-source-registry.spec.ts` | Audio Source Registry UI | No microphone, no file upload, no playback | Stable (v66) | Future: local file metadata preview (v67, deferred) |
| **Graph Control Plane Navigation Contract** | `docs/control-plane/GRAPH_CONTROL_PLANE_NAVIGATION_CONTRACT.md` | N/A (contract-only) | v68 | `tests/e2e/contract-registry.spec.ts` | Navigation contract document | No runtime implementation in v68 | Stable (v68) | v69 paused/retry later with sliced passes |
| **QA Bundle Validator** | `scripts/validate-qa-bundle.mjs` | N/A (tooling) | v70 | `tests/e2e/contract-registry.spec.ts` | Validator script output | No runtime UI changes, no test rewrites | Stable (v70) | Future: validator enhancements |
| **Theme Workshop Security Packet** | `docs/themes/THEME_WORKSHOP_SECURITY_PACKET.md` | N/A (docs-only) | v77 (scheduled) | Future: `tests/e2e/theme-workshop-security.spec.ts` | Security packet document | No theme submission without security model | Future (v77) | Future: security model implementation plan |
| **Visual Grammar Engine** | `docs/visual-grammar-engine/` | N/A (future architecture) | Future | Future: validation tests | Future: Grammar Lens UI | **DO NOT IMPLEMENT** - docs-only future architecture | Docs-only / Future | Future: implementation only after explicit authorization |

## QA Key to Contract Mapping

| QA Key | Contract/Feature | Status | Advisory Section |
|--------|------------------|--------|------------------|
| v30 | Command Deck / Hotkey Registry | Stable | advisoryV30b |
| v30 | Perspective System | Stable | advisoryV30b |
| v40 | Graph View Element Registry | Stable | advisoryV40 |
| v42 | Graph Runtime Boundary / Probe | Stable | advisoryV42 |
| v48 | Graph Evidence Detail Mode | Stable | advisoryV48 |
| v57 | Graph Theme Mapping Registry | Stable | advisoryV57 |
| v57 | Theme Token Path Map | Stable | advisoryV57 |
| v59 | Motion Safety / Epilepsy Guard | Stable | advisoryV59 |
| v60 | Reduced Motion Guard Registry | Stable | advisoryV60 |
| v62 | Synthetic Audio Signal Preview | Stable | advisoryV62 |
| v63 | Music Reactive Mapping Registry | Stable | advisoryV63 |
| v64 | Passive Music Reactive Mapping Inventory | Stable | advisoryV64 |
| v65 | Audio Source System Contract | Stable | advisoryV65 |
| v66 | Passive Audio Source Registry | Stable | advisoryV66 |
| v67 | Local Audio File Metadata Preview | Deferred | advisoryV66 backlog |
| v68 | Graph Control Plane Navigation Contract | Stable (current) | advisoryV68 |
| v69 | Collapsible Evidence Sections / Summary Cards | Paused / retry later | advisoryV68 backlog |
| v70 | QA Bundle Validator Script | Stable | advisoryV68 backlog |
| v71 | Contract-to-Code Trace Matrix | In progress (docs-only) | To be added if needed |

## Forbidden Boundaries Summary

1. **No graph/Sigma mutation** without explicit authorization
2. **No audio input/playback/music runtime behavior** without safety gates
3. **No command execution** without explicit authorization
4. **No test skips** or weakening of accepted evidence
5. **No v69 retry** without sliced passes plan
6. **No Visual Grammar Engine implementation** without explicit authorization (docs-only)
7. **No CSS variable writes** without explicit authorization
8. **No new token path promotion** without explicit authorization

## Drift Prevention

The QA Bundle Validator (`scripts/validate-qa-bundle.mjs`) checks:
- DEFAULT_QA_KEY coherence (QaPanel vs contract-registry)
- CURRENT_QA_KEY coherence
- BACKLOG_POLICY current pass detection
- Advisory section existence for current QA key
- Proposal IDs in contract-registry exist in active advisory
- Advisory has backlog rows
- Clear drift classifications

Run before any QA key rotation or advisory changes:
```bash
npm run qa:bundle
# or
node scripts/validate-qa-bundle.mjs
```

## Future Validation Needs

1. **Contract-to-Code Trace Validator** (optional, if clearly safe):
   - Validate that contract files exist for all active QA keys
   - Validate that registry files match contract definitions
   - Validate that Playwright tests exist for all active contracts
   - Validate that evidence surfaces render correctly

2. **Registry Freshness Check**:
   - Validate that registries are not stale compared to contracts
   - Validate that QA/advisory keys are aligned with contract status

3. **Evidence Surface Validation**:
   - Validate that all contract evidence is accessible in UI
   - Validate that no evidence is hidden without tested access path

## Version History

- **v71a** (2026-05-04): Initial Contract-to-Code Trace Matrix (docs-only)
