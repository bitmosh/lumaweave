// SPDX-License-Identifier: Apache-2.0
/**
 * System Index Registry
 * 
 * A searchable registry of LumaWeave systems, contracts, registries, validators,
 * evidence surfaces, future docs packets, and source-plugin concepts.
 * 
 * This static registry provides typed metadata for future Registry Explorer UI,
 * LumaWeave Self-Graph Fixture, Source Adapter OS graphing, and governance discovery.
 * 
 * Contract: docs/canonical/CONTROL_PLANE_AND_SYSTEM_INDEX.md (supersedes SYSTEM_INDEX_REGISTRY_CONTRACT.md)
 */

// Categories
export type SystemCategory =
  | "QA / Governance"
  | "Graph / Sigma Boundary"
  | "Theme / Token System"
  | "Motion Safety"
  | "Audio / Signal Systems"
  | "Source Adapter / Future Architecture"
  | "Visual Grammar / Customization"
  | "Arena / Simulation Future Concepts"
  | "Evidence / Traceability"
  | "Developer Tooling";

// Kinds
export type SystemKind =
  | "contract"
  | "registry"
  | "validator"
  | "runtime-surface"
  | "evidence-surface"
  | "future-architecture"
  | "future-concept"
  | "source-adapter"
  | "fixture"
  | "roadmap-item";

// Status
export type SystemStatus =
  | "accepted"
  | "current"
  | "paused"
  | "future"
  | "docs-only"
  | "planned"
  | "candidate"
  | "deprecated";

// Lifecycle
export type SystemLifecycle =
  | "proposed"
  | "contract-defined"
  | "implemented"
  | "validated"
  | "accepted"
  | "paused"
  | "deferred"
  | "planned";

// System Index Entry
export interface SystemIndexEntry {
  // Identity
  id: string;
  title: string;
  category: SystemCategory;
  kind: SystemKind;
  status: SystemStatus;
  lifecycle: SystemLifecycle;

  // Paths
  sourcePaths: string[];
  testPaths: string[];

  // QA & Validation
  qaKeys: string[];
  acceptedPasses: string[];
  validators: string[];

  // Evidence & Boundaries
  evidenceSurfaces: string[];
  forbiddenBoundaries: string[];

  // Relationships
  relatedSystems: string[];
  tags: string[];

  // Future
  futureImplementationStatus?: string;
  notes?: string;
}

// Static entries
const SYSTEM_INDEX_ENTRIES: readonly SystemIndexEntry[] = [
  {
    id: "qa.bundle.validator",
    title: "QA Bundle Validator",
    category: "QA / Governance",
    kind: "validator",
    status: "accepted",
    lifecycle: "accepted",
    sourcePaths: ["scripts/validate-qa-bundle.mjs"],
    testPaths: ["tests/e2e/contract-registry.spec.ts"],
    qaKeys: ["v68", "v70"],
    acceptedPasses: ["v70"],
    validators: [],
    evidenceSurfaces: ["Validator script output"],
    forbiddenBoundaries: [
      "no runtime UI changes",
      "no test rewrites",
      "no QA key rotation without validator proof",
    ],
    relatedSystems: ["contract.trace.matrix", "contract.trace.validator"],
    tags: ["drift-detection", "qa-governance"],
    notes: "Detects QA bundle drift before Playwright cascades",
  },
  {
    id: "contract.trace.matrix",
    title: "Contract-to-Code Trace Matrix",
    category: "Evidence / Traceability",
    kind: "contract",
    status: "accepted",
    lifecycle: "accepted",
    sourcePaths: [],
    testPaths: ["tests/e2e/contract-registry.spec.ts"],
    qaKeys: ["v71"],
    acceptedPasses: ["v71a"],
    validators: ["contract.trace.validator"],
    evidenceSurfaces: ["Trace matrix document"],
    forbiddenBoundaries: ["no runtime UI changes", "no graph/Sigma mutation"],
    relatedSystems: ["contract.trace.validator"],
    tags: ["traceability", "contract-mapping"],
    notes: "Maps contracts to code/tests/evidence",
  },
  {
    id: "contract.trace.validator",
    title: "Contract Trace Validator",
    category: "Evidence / Traceability",
    kind: "validator",
    status: "accepted",
    lifecycle: "accepted",
    sourcePaths: ["scripts/validate-contract-trace.mjs"],
    testPaths: ["tests/e2e/contract-registry.spec.ts"],
    qaKeys: ["v71"],
    acceptedPasses: ["v71b"],
    validators: [],
    evidenceSurfaces: ["Validator script output"],
    forbiddenBoundaries: ["no runtime UI changes", "no graph/Sigma mutation"],
    relatedSystems: ["contract.trace.matrix"],
    tags: ["traceability", "validation"],
    notes: "Validates trace matrix structure and required rows",
  },
  {
    id: "system.index.registry.contract",
    title: "System Index Registry Contract",
    category: "Evidence / Traceability",
    kind: "contract",
    status: "accepted",
    lifecycle: "accepted",
    sourcePaths: [],
    testPaths: ["tests/e2e/contract-registry.spec.ts"],
    qaKeys: ["v72"],
    acceptedPasses: ["v72a"],
    validators: [],
    evidenceSurfaces: ["Contract document"],
    forbiddenBoundaries: [
      "no runtime UI implementation",
      "no graph/Sigma mutation",
      "no source adapter runtime ingestion",
      "no audio input/playback/music runtime behavior",
    ],
    relatedSystems: ["system.index.registry"],
    tags: ["traceability", "system-index"],
    notes: "Defines schema and taxonomy for future Registry Explorer and Self-Graph Fixture",
  },
  {
    id: "graph.visual.inventory",
    title: "Graph Visual Inventory",
    category: "Graph / Sigma Boundary",
    kind: "runtime-surface",
    status: "current",
    lifecycle: "accepted",
    sourcePaths: ["src/control-plane/graph/GraphVisualInventoryPanel.tsx"],
    testPaths: ["tests/e2e/graph-visual-inventory.spec.ts"],
    qaKeys: ["v48", "v68"],
    acceptedPasses: ["v48", "v68"],
    validators: [],
    evidenceSurfaces: ["Graph Visual Inventory panel"],
    forbiddenBoundaries: [
      "no graph/Sigma mutation without explicit authorization",
      "no collapsible evidence sections without v69 retry",
    ],
    relatedSystems: [
      "graph.view.element.registry",
      "graph.theme.mapping.registry",
      "motion-safety.epilepsy-guard",
      "audio.synthetic-signal-preview",
      "audio.music-reactive-mapping.registry",
      "audio.source.registry",
    ],
    tags: ["graph", "inventory", "evidence"],
    notes: "Read-only inventory of graph visual elements",
  },
  {
    id: "graph.runtime.boundary",
    title: "Graph Runtime Boundary / Probe",
    category: "Graph / Sigma Boundary",
    kind: "registry",
    status: "accepted",
    lifecycle: "accepted",
    sourcePaths: ["src/graph/graphRuntimeBoundary.ts"],
    testPaths: ["tests/e2e/graph-runtime-boundary.spec.ts"],
    qaKeys: ["v42"],
    acceptedPasses: ["v42"],
    validators: [],
    evidenceSurfaces: ["Theme target probe UI"],
    forbiddenBoundaries: ["no graph/Sigma renderer mutation"],
    relatedSystems: [],
    tags: ["graph", "boundary", "probe"],
    notes: "Graph runtime boundary and theme target probe",
  },
  {
    id: "graph.theme.mapping.registry",
    title: "Graph Visual Theme Mapping Registry",
    category: "Theme / Token System",
    kind: "registry",
    status: "accepted",
    lifecycle: "accepted",
    sourcePaths: ["src/graph/graphVisualThemeMappingRegistry.ts"],
    testPaths: ["tests/e2e/theme-mapping.spec.ts"],
    qaKeys: ["v57"],
    acceptedPasses: ["v57"],
    validators: [],
    evidenceSurfaces: ["Theme Mapping panel"],
    forbiddenBoundaries: [
      "no theme mutation without lock/pin stability",
      "no graph/Sigma mutation unless explicitly contracted",
      "no node/edge/canvas styling unless explicitly contracted",
      "no physics/camera/filter changes unless explicitly contracted",
      "no token promotion without explicit pass",
    ],
    relatedSystems: [],
    tags: ["theme", "mapping", "graph"],
    notes: "Registry of graph visual theme mappings",
  },
  {
    id: "theme.token.path-map",
    title: "Theme Token Path Map",
    category: "Theme / Token System",
    kind: "registry",
    status: "accepted",
    lifecycle: "accepted",
    sourcePaths: ["src/themes/themeTokenPathMap.ts"],
    testPaths: ["tests/e2e/theme-token-path.spec.ts"],
    qaKeys: ["v57"],
    acceptedPasses: ["v57"],
    validators: [],
    evidenceSurfaces: ["Theme token path display"],
    forbiddenBoundaries: ["no CSS variable writes without explicit authorization"],
    relatedSystems: [],
    tags: ["theme", "token", "path"],
    notes: "Theme token path map for token value application",
  },
  {
    id: "motion-safety.epilepsy-guard",
    title: "Motion Safety / Epilepsy Guard",
    category: "Motion Safety",
    kind: "registry",
    status: "accepted",
    lifecycle: "accepted",
    sourcePaths: ["src/accessibility/motionSafetyRegistry.ts"],
    testPaths: ["tests/e2e/motion-safety.spec.ts"],
    qaKeys: ["v59"],
    acceptedPasses: ["v59"],
    validators: [],
    evidenceSurfaces: ["Motion Safety panel"],
    forbiddenBoundaries: ["no animation before safety guard is proven"],
    relatedSystems: [],
    tags: ["safety", "motion", "epilepsy"],
    notes: "Motion safety and epilepsy guard registry",
  },
  {
    id: "audio.synthetic-signal-preview",
    title: "Synthetic Audio Signal Preview",
    category: "Audio / Signal Systems",
    kind: "registry",
    status: "accepted",
    lifecycle: "accepted",
    sourcePaths: ["src/audio/syntheticAudioSignal.ts"],
    testPaths: ["tests/e2e/synthetic-audio-signal.spec.ts"],
    qaKeys: ["v62"],
    acceptedPasses: ["v62"],
    validators: [],
    evidenceSurfaces: ["Synthetic signal preview UI"],
    forbiddenBoundaries: [
      "no audio playback",
      "no real audio before safety gates",
    ],
    relatedSystems: [],
    tags: ["audio", "synthetic", "signal"],
    notes: "Synthetic audio signal preview registry",
  },
  {
    id: "audio.music-reactive-mapping.registry",
    title: "Music Reactive Mapping Registry",
    category: "Audio / Signal Systems",
    kind: "registry",
    status: "accepted",
    lifecycle: "accepted",
    sourcePaths: ["src/audio/musicReactiveMappingRegistry.ts"],
    testPaths: ["tests/e2e/music-reactive-mapping.spec.ts"],
    qaKeys: ["v63"],
    acceptedPasses: ["v63"],
    validators: [],
    evidenceSurfaces: ["Music Reactive Mapping panel"],
    forbiddenBoundaries: [
      "no music reactivity before Motion Safety proven",
      "no microphone",
      "no audio input/playback",
      "no file decoding",
      "no Web Audio runtime",
      "no music-reactive visuals unless explicitly contracted",
      "no graph/Sigma mutation from music mappings unless explicitly contracted",
    ],
    relatedSystems: [],
    tags: ["audio", "music", "reactive"],
    notes: "Music reactive mapping registry",
  },
  {
    id: "audio.source.registry",
    title: "Audio Source Registry",
    category: "Audio / Signal Systems",
    kind: "registry",
    status: "accepted",
    lifecycle: "accepted",
    sourcePaths: ["src/audio/audioSourceRegistry.ts"],
    testPaths: ["tests/e2e/audio-source-registry.spec.ts"],
    qaKeys: ["v66"],
    acceptedPasses: ["v66"],
    validators: [],
    evidenceSurfaces: ["Audio Source Registry UI"],
    forbiddenBoundaries: [
      "no microphone",
      "no audio input/playback",
      "no file upload/decoding",
      "no Web Audio runtime",
      "no music-reactive visuals",
      "no graph/Sigma mutation",
    ],
    relatedSystems: [],
    tags: ["audio", "source", "registry"],
    notes: "Audio source registry with 7 seed entries",
  },
  {
    id: "visual-grammar.engine",
    title: "Visual Grammar Engine",
    category: "Visual Grammar / Customization",
    kind: "future-architecture",
    status: "docs-only",
    lifecycle: "contract-defined",
    sourcePaths: [],
    testPaths: [],
    qaKeys: [],
    acceptedPasses: [],
    validators: [],
    evidenceSurfaces: [],
    forbiddenBoundaries: [
      "no implementation authorization",
      "no token promotion",
      "no CSS variable writes",
      "no graph/Sigma mutation",
      "no runtime behavior",
    ],
    relatedSystems: ["visual-grammar.grammar-lens", "signal-loom.routing"],
    tags: ["future", "docs-only", "customization"],
    futureImplementationStatus: "docs-only - no implementation authorization",
    notes: "Future architecture for grammar-based visual customization",
  },
  {
    id: "signal-loom.routing",
    title: "Signal Loom Routing",
    category: "Visual Grammar / Customization",
    kind: "future-architecture",
    status: "docs-only",
    lifecycle: "contract-defined",
    sourcePaths: [],
    testPaths: [],
    qaKeys: [],
    acceptedPasses: [],
    validators: [],
    evidenceSurfaces: [],
    forbiddenBoundaries: [
      "no implementation authorization",
      "no graph/Sigma mutation",
      "no runtime behavior",
    ],
    relatedSystems: ["visual-grammar.engine"],
    tags: ["future", "docs-only", "routing"],
    futureImplementationStatus: "docs-only - no implementation authorization",
    notes: "Future signal routing system for Visual Grammar Engine",
  },
  {
    id: "lumaweave-arena.concept",
    title: "Lumaweave Arena",
    category: "Arena / Simulation Future Concepts",
    kind: "future-concept",
    status: "docs-only",
    lifecycle: "contract-defined",
    sourcePaths: [],
    testPaths: [],
    qaKeys: [],
    acceptedPasses: [],
    validators: [],
    evidenceSurfaces: [],
    forbiddenBoundaries: [
      "no implementation authorization",
      "no real-world exploitation",
      "no live target interaction",
      "no scanning",
      "no malware",
      "no credential attacks",
      "no offensive tooling",
    ],
    relatedSystems: [],
    tags: ["future", "docs-only", "simulation", "defensive"],
    futureImplementationStatus: "docs-only - no implementation authorization",
    notes: "Future concept for sandboxed procedural graph arenas and LLM benchmark tournaments",
  },
  {
    id: "self-graph.fixture",
    title: "LumaWeave Self-Graph Fixture",
    category: "Evidence / Traceability",
    kind: "fixture",
    status: "future",
    lifecycle: "planned",
    sourcePaths: [],
    testPaths: [],
    qaKeys: [],
    acceptedPasses: [],
    validators: [],
    evidenceSurfaces: [],
    forbiddenBoundaries: [
      "no graph/Sigma mutation",
      "no source adapter runtime ingestion",
    ],
    relatedSystems: ["system.index.registry"],
    tags: ["future", "fixture", "self-graph"],
    futureImplementationStatus: "planned - dogfood LumaWeave on itself and create large-real-project graph fixture",
    notes: "Future fixture for dogfooding LumaWeave on itself and large graph testing",
  },
] as const;

// Helper functions
export function getAllSystemIndexEntries(): readonly SystemIndexEntry[] {
  return SYSTEM_INDEX_ENTRIES;
}

export function getSystemIndexEntryById(id: string): SystemIndexEntry | undefined {
  return SYSTEM_INDEX_ENTRIES.find((entry) => entry.id === id);
}

export function getSystemIndexEntriesByCategory(
  category: SystemCategory,
): SystemIndexEntry[] {
  return SYSTEM_INDEX_ENTRIES.filter((entry) => entry.category === category);
}

export function getSystemIndexEntriesByKind(kind: SystemKind): SystemIndexEntry[] {
  return SYSTEM_INDEX_ENTRIES.filter((entry) => entry.kind === kind);
}

export function getSystemIndexEntriesByStatus(status: SystemStatus): SystemIndexEntry[] {
  return SYSTEM_INDEX_ENTRIES.filter((entry) => entry.status === status);
}

export function getSystemIndexEntriesByTag(tag: string): SystemIndexEntry[] {
  return SYSTEM_INDEX_ENTRIES.filter((entry) => entry.tags.includes(tag));
}

export function getRelatedSystemIndexEntries(id: string): SystemIndexEntry[] {
  const entry = getSystemIndexEntryById(id);
  if (!entry) return [];
  return entry.relatedSystems
    .map((relatedId) => getSystemIndexEntryById(relatedId))
    .filter((e): e is SystemIndexEntry => e !== undefined);
}
