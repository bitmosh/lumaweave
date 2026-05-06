/**
 * Self-Graph Fixture
 *
 * Static LumaSourceGraph built from docs/ YAML frontmatter.
 * This fixture makes LumaWeave show its own architecture.
 *
 * Node count: 58
 * Edge count: 43
 */

import type {
  LumaGraphEdge,
  LumaGraphNode,
  LumaSourceGraph,
} from "./types";

// DOCS FOLDER NODES (23 nodes - one per docs/ subdirectory)
const docsFolderNodes: LumaGraphNode[] = [
  {
    id: "docs.folder.accessibility",
    label: "accessibility",
    type: "docs.folder",
    cluster: "green",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "docs/accessibility" },
  },
  {
    id: "docs.folder.agent",
    label: "agent",
    type: "docs.folder",
    cluster: "purple",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "docs/agent" },
  },
  {
    id: "docs.folder.arena",
    label: "arena",
    type: "docs.folder",
    cluster: "teal",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "docs/arena" },
  },
  {
    id: "docs.folder.audio",
    label: "audio",
    type: "docs.folder",
    cluster: "green",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "docs/audio" },
  },
  {
    id: "docs.folder.control-plane",
    label: "control-plane",
    type: "docs.folder",
    cluster: "blue",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "docs/control-plane" },
  },
  {
    id: "docs.folder.grammar-lens",
    label: "grammar-lens",
    type: "docs.folder",
    cluster: "purple",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "docs/grammar-lens" },
  },
  {
    id: "docs.folder.graph",
    label: "graph",
    type: "docs.folder",
    cluster: "blue",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "docs/graph" },
  },
  {
    id: "docs.folder.handleset",
    label: "handleset",
    type: "docs.folder",
    cluster: "gold",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "docs/handleset" },
  },
  {
    id: "docs.folder.layout",
    label: "layout",
    type: "docs.folder",
    cluster: "gold",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "docs/layout" },
  },
  {
    id: "docs.folder.mission-control",
    label: "mission-control",
    type: "docs.folder",
    cluster: "blue",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "docs/mission-control" },
  },
  {
    id: "docs.folder.operating-policies",
    label: "operating-policies",
    type: "docs.folder",
    cluster: "purple",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "docs/operating-policies" },
  },
  {
    id: "docs.folder.overview",
    label: "overview",
    type: "docs.folder",
    cluster: "gray",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "docs/overview" },
  },
  {
    id: "docs.folder.physics",
    label: "physics",
    type: "docs.folder",
    cluster: "teal",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "docs/physics" },
  },
  {
    id: "docs.folder.platform",
    label: "platform",
    type: "docs.folder",
    cluster: "teal",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "docs/platform" },
  },
  {
    id: "docs.folder.quest",
    label: "quest",
    type: "docs.folder",
    cluster: "gray",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "docs/quest" },
  },
  {
    id: "docs.folder.rendering",
    label: "rendering",
    type: "docs.folder",
    cluster: "blue",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "docs/rendering" },
  },
  {
    id: "docs.folder.roadmap",
    label: "roadmap",
    type: "docs.folder",
    cluster: "gray",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "docs/roadmap" },
  },
  {
    id: "docs.folder.security",
    label: "security",
    type: "docs.folder",
    cluster: "green",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "docs/security" },
  },
  {
    id: "docs.folder.source-adapter",
    label: "source-adapter",
    type: "docs.folder",
    cluster: "green",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "docs/source-adapter" },
  },
  {
    id: "docs.folder.survival-manual",
    label: "survival-manual",
    type: "docs.folder",
    cluster: "purple",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "docs/survival-manual" },
  },
  {
    id: "docs.folder.theme",
    label: "theme",
    type: "docs.folder",
    cluster: "gold",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "docs/theme" },
  },
  {
    id: "docs.folder.visual-grammar-engine",
    label: "visual-grammar-engine",
    type: "docs.folder",
    cluster: "purple",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "docs/visual-grammar-engine" },
  },
  {
    id: "docs.folder.vr",
    label: "vr",
    type: "docs.folder",
    cluster: "teal",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "docs/vr" },
  },
];

// KEY DOC FILE NODES (12 nodes - the most important files)
const keyDocFileNodes: LumaGraphNode[] = [
  {
    id: "docs.file.session-and-stack",
    label: "SESSION_AND_STACK.md",
    type: "docs.file",
    cluster: "purple",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "docs/operating-policies/SESSION_AND_STACK.md" },
  },
  {
    id: "docs.file.source-of-truth",
    label: "SOURCE_OF_TRUTH.md",
    type: "docs.file",
    cluster: "purple",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "docs/operating-policies/SOURCE_OF_TRUTH.md" },
  },
  {
    id: "docs.file.bandit-protocol",
    label: "BANDIT_PROTOCOL.md",
    type: "docs.file",
    cluster: "purple",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "docs/agent/protocols/BANDIT_PROTOCOL.md" },
  },
  {
    id: "docs.file.ghost-overlay-current-state",
    label: "GHOST_OVERLAY_CURRENT_STATE.md",
    type: "docs.file",
    cluster: "purple",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "docs/grammar-lens/GHOST_OVERLAY_CURRENT_STATE.md" },
  },
  {
    id: "docs.file.rendering-layer-architecture",
    label: "RENDERING_LAYER_ARCHITECTURE.md",
    type: "docs.file",
    cluster: "blue",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "docs/rendering/RENDERING_LAYER_ARCHITECTURE.md" },
  },
  {
    id: "docs.file.physics-dialect-system",
    label: "PHYSICS_DIALECT_SYSTEM.md",
    type: "docs.file",
    cluster: "teal",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "docs/physics/PHYSICS_DIALECT_SYSTEM.md" },
  },
  {
    id: "docs.file.source-adapter-os-contract",
    label: "SOURCE_ADAPTER_OS_CONTRACT.md",
    type: "docs.file",
    cluster: "green",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "docs/source-adapter/SOURCE_ADAPTER_OS_CONTRACT.md" },
  },
  {
    id: "docs.file.platform-vision",
    label: "PLATFORM_VISION.md",
    type: "docs.file",
    cluster: "teal",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "docs/platform/PLATFORM_VISION.md" },
  },
  {
    id: "docs.file.lumaweave-high-def-overview",
    label: "LUMAWEAVE_HIGH_DEF_OVERVIEW.md",
    type: "docs.file",
    cluster: "gray",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "docs/overview/LUMAWEAVE_HIGH_DEF_OVERVIEW.md" },
  },
  {
    id: "docs.file.backlog-policy",
    label: "BACKLOG_POLICY.md",
    type: "docs.file",
    cluster: "gray",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "docs/roadmap/BACKLOG_POLICY.md" },
  },
  {
    id: "docs.file.grammar-lens-contract",
    label: "GRAMMAR_LENS_CONTRACT.md",
    type: "docs.file",
    cluster: "purple",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "docs/grammar-lens/GRAMMAR_LENS_CONTRACT.md" },
  },
  {
    id: "docs.file.motion-safety-epilepsy-guard",
    label: "MOTION_SAFETY_AND_EPILEPSY_GUARD_CONTRACT.md",
    type: "docs.file",
    cluster: "green",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "docs/accessibility/MOTION_SAFETY_AND_EPILEPSY_GUARD_CONTRACT.md" },
  },
];

// CODE SPINE NODES (8 nodes - one per major system)
const codeSpineNodes: LumaGraphNode[] = [
  {
    id: "code.system.core",
    label: "core",
    type: "code.system",
    cluster: "blue",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "src/app" },
  },
  {
    id: "code.system.graph",
    label: "graph",
    type: "code.system",
    cluster: "blue",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "src/graph" },
  },
  {
    id: "code.system.theme",
    label: "theme",
    type: "code.system",
    cluster: "gold",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "src/themes" },
  },
  {
    id: "code.system.audio",
    label: "audio",
    type: "code.system",
    cluster: "green",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "src/audio" },
  },
  {
    id: "code.system.accessibility",
    label: "accessibility",
    type: "code.system",
    cluster: "green",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "src/accessibility" },
  },
  {
    id: "code.system.source-adapter",
    label: "source-adapter",
    type: "code.system",
    cluster: "green",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "src/source-adapter" },
  },
  {
    id: "code.system.control-plane",
    label: "control-plane",
    type: "code.system",
    cluster: "blue",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "src/control-plane" },
  },
  {
    id: "code.system.modes",
    label: "modes",
    type: "code.system",
    cluster: "blue",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "src/control-plane/modes" },
  },
];

// KEY SOURCE FILE NODES (8 nodes - one per spine)
const keySourceFileNodes: LumaGraphNode[] = [
  {
    id: "code.file.sigma-graph-view",
    label: "SigmaGraphView.tsx",
    type: "code.file",
    cluster: "blue",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "src/graph/renderers/sigma2d/SigmaGraphView.tsx" },
  },
  {
    id: "code.file.app-shell",
    label: "AppShell.tsx",
    type: "code.file",
    cluster: "blue",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "src/app/AppShell.tsx" },
  },
  {
    id: "code.file.qa-panel",
    label: "QaPanel.tsx",
    type: "code.file",
    cluster: "blue",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "src/control-plane/qa/QaPanel.tsx" },
  },
  {
    id: "code.file.system-index-registry",
    label: "systemIndexRegistry.ts",
    type: "code.file",
    cluster: "blue",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "src/control-plane/system-index/systemIndexRegistry.ts" },
  },
  {
    id: "code.file.theme-tokens",
    label: "themeTokens.ts",
    type: "code.file",
    cluster: "gold",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "src/themes/themeTokens.ts" },
  },
  {
    id: "code.file.motion-safety-registry",
    label: "motionSafetyRegistry.ts",
    type: "code.file",
    cluster: "green",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "src/accessibility/motionSafetyRegistry.ts" },
  },
  {
    id: "code.file.source-adapter-registry",
    label: "sourceAdapterRegistry.ts",
    type: "code.file",
    cluster: "green",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "src/source-adapter/sourceAdapterRegistry.ts" },
  },
  {
    id: "code.file.synthetic-audio-signal",
    label: "syntheticAudioSignal.ts",
    type: "code.file",
    cluster: "green",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "src/audio/syntheticAudioSignal.ts" },
  },
  {
    id: "code.file.control-plane-mode-registry",
    label: "controlPlaneModeRegistry.ts",
    type: "code.file",
    cluster: "blue",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "src/control-plane/modes/controlPlaneModeRegistry.ts" },
  },
];

// KEY TEST + SCRIPT NODES (6 nodes)
const testScriptNodes: LumaGraphNode[] = [
  {
    id: "code.test.source-adapter",
    label: "source-adapter.spec.ts",
    type: "code.test",
    cluster: "gray",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "tests/e2e/source-adapter.spec.ts" },
  },
  {
    id: "code.test.system-index",
    label: "system-index.spec.ts",
    type: "code.test",
    cluster: "gray",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "tests/e2e/system-index.spec.ts" },
  },
  {
    id: "code.test.graph-visual-inventory",
    label: "graph-visual-inventory.spec.ts",
    type: "code.test",
    cluster: "gray",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "tests/e2e/graph-visual-inventory.spec.ts" },
  },
  {
    id: "code.test.contract-registry",
    label: "contract-registry.spec.ts",
    type: "code.test",
    cluster: "gray",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "tests/e2e/contract-registry.spec.ts" },
  },
  {
    id: "code.script.validate-source-adapters",
    label: "validate-source-adapters.mjs",
    type: "code.script",
    cluster: "gray",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "scripts/validate-source-adapters.mjs" },
  },
  {
    id: "code.script.validate-system-index",
    label: "validate-system-index.mjs",
    type: "code.script",
    cluster: "gray",
    sourceAdapter: "self-graph-yaml-frontmatter",
    metadata: { path: "scripts/validate-system-index.mjs" },
  },
];

// Combine all nodes
const allNodes: LumaGraphNode[] = [
  ...docsFolderNodes,
  ...keyDocFileNodes,
  ...codeSpineNodes,
  ...keySourceFileNodes,
  ...testScriptNodes,
];

// EDGES (STEP 3)
// All edges have confidence: "observed"

// 1. CONTAINS edges (folder → file)
const containsEdges: LumaGraphEdge[] = [
  // Doc file → parent folder contains edges
  { id: "edge.contains.session-and-stack", source: "docs.folder.operating-policies", target: "docs.file.session-and-stack", type: "contains", confidence: "observed", metadata: {} },
  { id: "edge.contains.source-of-truth", source: "docs.folder.operating-policies", target: "docs.file.source-of-truth", type: "contains", confidence: "observed", metadata: {} },
  { id: "edge.contains.bandit-protocol", source: "docs.folder.agent", target: "docs.file.bandit-protocol", type: "contains", confidence: "observed", metadata: {} },
  { id: "edge.contains.ghost-overlay-current-state", source: "docs.folder.grammar-lens", target: "docs.file.ghost-overlay-current-state", type: "contains", confidence: "observed", metadata: {} },
  { id: "edge.contains.rendering-layer-architecture", source: "docs.folder.rendering", target: "docs.file.rendering-layer-architecture", type: "contains", confidence: "observed", metadata: {} },
  { id: "edge.contains.physics-dialect-system", source: "docs.folder.physics", target: "docs.file.physics-dialect-system", type: "contains", confidence: "observed", metadata: {} },
  { id: "edge.contains.source-adapter-os-contract", source: "docs.folder.source-adapter", target: "docs.file.source-adapter-os-contract", type: "contains", confidence: "observed", metadata: {} },
  { id: "edge.contains.platform-vision", source: "docs.folder.platform", target: "docs.file.platform-vision", type: "contains", confidence: "observed", metadata: {} },
  { id: "edge.contains.lumaweave-high-def-overview", source: "docs.folder.overview", target: "docs.file.lumaweave-high-def-overview", type: "contains", confidence: "observed", metadata: {} },
  { id: "edge.contains.backlog-policy", source: "docs.folder.roadmap", target: "docs.file.backlog-policy", type: "contains", confidence: "observed", metadata: {} },
  { id: "edge.contains.grammar-lens-contract", source: "docs.folder.grammar-lens", target: "docs.file.grammar-lens-contract", type: "contains", confidence: "observed", metadata: {} },
  { id: "edge.contains.motion-safety-epilepsy-guard", source: "docs.folder.accessibility", target: "docs.file.motion-safety-epilepsy-guard", type: "contains", confidence: "observed", metadata: {} },

  // Code file → spine contains edges
  { id: "edge.contains.sigma-graph-view", source: "code.system.graph", target: "code.file.sigma-graph-view", type: "contains", confidence: "observed", metadata: {} },
  { id: "edge.contains.app-shell", source: "code.system.core", target: "code.file.app-shell", type: "contains", confidence: "observed", metadata: {} },
  { id: "edge.contains.qa-panel", source: "code.system.control-plane", target: "code.file.qa-panel", type: "contains", confidence: "observed", metadata: {} },
  { id: "edge.contains.system-index-registry", source: "code.system.control-plane", target: "code.file.system-index-registry", type: "contains", confidence: "observed", metadata: {} },
  { id: "edge.contains.theme-tokens", source: "code.system.theme", target: "code.file.theme-tokens", type: "contains", confidence: "observed", metadata: {} },
  { id: "edge.contains.motion-safety-registry", source: "code.system.accessibility", target: "code.file.motion-safety-registry", type: "contains", confidence: "observed", metadata: {} },
  { id: "edge.contains.source-adapter-registry", source: "code.system.source-adapter", target: "code.file.source-adapter-registry", type: "contains", confidence: "observed", metadata: {} },
  { id: "edge.contains.synthetic-audio-signal", source: "code.system.audio", target: "code.file.synthetic-audio-signal", type: "contains", confidence: "observed", metadata: {} },
  { id: "edge.contains.control-plane-mode-registry", source: "code.system.modes", target: "code.file.control-plane-mode-registry", type: "contains", confidence: "observed", metadata: {} },
];

// 2. GOVERNS edges (doc → code system)
const governsEdges: LumaGraphEdge[] = [
  { id: "edge.governs.source-of-truth.core", source: "docs.file.source-of-truth", target: "code.system.core", type: "governs", confidence: "observed", metadata: {} },
  { id: "edge.governs.source-of-truth.graph", source: "docs.file.source-of-truth", target: "code.system.graph", type: "governs", confidence: "observed", metadata: {} },
  { id: "edge.governs.source-of-truth.theme", source: "docs.file.source-of-truth", target: "code.system.theme", type: "governs", confidence: "observed", metadata: {} },
  { id: "edge.governs.source-of-truth.audio", source: "docs.file.source-of-truth", target: "code.system.audio", type: "governs", confidence: "observed", metadata: {} },
  { id: "edge.governs.source-of-truth.accessibility", source: "docs.file.source-of-truth", target: "code.system.accessibility", type: "governs", confidence: "observed", metadata: {} },
  { id: "edge.governs.source-of-truth.source-adapter", source: "docs.file.source-of-truth", target: "code.system.source-adapter", type: "governs", confidence: "observed", metadata: {} },
  { id: "edge.governs.source-of-truth.control-plane", source: "docs.file.source-of-truth", target: "code.system.control-plane", type: "governs", confidence: "observed", metadata: {} },
  { id: "edge.governs.source-of-truth.modes", source: "docs.file.source-of-truth", target: "code.system.modes", type: "governs", confidence: "observed", metadata: {} },
  { id: "edge.governs.bandit-protocol.agent", source: "docs.file.bandit-protocol", target: "docs.folder.agent", type: "governs", confidence: "observed", metadata: {} },
  { id: "edge.governs.ghost-overlay.grammar-lens", source: "docs.file.ghost-overlay-current-state", target: "docs.folder.grammar-lens", type: "governs", confidence: "observed", metadata: {} },
  { id: "edge.governs.grammar-lens-contract.grammar-lens", source: "docs.file.grammar-lens-contract", target: "docs.folder.grammar-lens", type: "governs", confidence: "observed", metadata: {} },
  { id: "edge.governs.motion-safety.accessibility", source: "docs.file.motion-safety-epilepsy-guard", target: "code.system.accessibility", type: "governs", confidence: "observed", metadata: {} },
  { id: "edge.governs.source-adapter-os.source-adapter", source: "docs.file.source-adapter-os-contract", target: "code.system.source-adapter", type: "governs", confidence: "observed", metadata: {} },
  { id: "edge.governs.rendering-architecture.graph", source: "docs.file.rendering-layer-architecture", target: "code.system.graph", type: "governs", confidence: "observed", metadata: {} },
];

// 3. TESTS edges (test/script → source)
const testsEdges: LumaGraphEdge[] = [
  { id: "edge.tests.source-adapter-spec", source: "code.test.source-adapter", target: "code.file.source-adapter-registry", type: "tests", confidence: "observed", metadata: {} },
  { id: "edge.tests.system-index-spec", source: "code.test.system-index", target: "code.file.system-index-registry", type: "tests", confidence: "observed", metadata: {} },
  { id: "edge.tests.validate-source-adapters", source: "code.script.validate-source-adapters", target: "code.file.source-adapter-registry", type: "tests", confidence: "observed", metadata: {} },
  { id: "edge.tests.validate-system-index", source: "code.script.validate-system-index", target: "code.file.system-index-registry", type: "tests", confidence: "observed", metadata: {} },
];

// 4. RELATED edges (folder cluster groupings)
const relatedEdges: LumaGraphEdge[] = [
  { id: "edge.related.operating-policies.agent", source: "docs.folder.operating-policies", target: "docs.folder.agent", type: "related", confidence: "observed", metadata: {} },
  { id: "edge.related.graph.rendering", source: "docs.folder.graph", target: "docs.folder.rendering", type: "related", confidence: "observed", metadata: {} },
  { id: "edge.related.theme.handleset", source: "docs.folder.theme", target: "docs.folder.handleset", type: "related", confidence: "observed", metadata: {} },
  { id: "edge.related.audio.accessibility", source: "docs.folder.audio", target: "docs.folder.accessibility", type: "related", confidence: "observed", metadata: {} },
];

// Combine all edges
const edges: LumaGraphEdge[] = [
  ...containsEdges,
  ...governsEdges,
  ...testsEdges,
  ...relatedEdges,
];

export const selfGraphFixture: LumaSourceGraph = {
  nodes: allNodes,
  edges: edges,
  metadata: {
    adapterId: "self-graph-yaml-frontmatter",
    createdAt: new Date().toISOString(),
    inputSummary: "Static fixture built from docs/ YAML frontmatter and src/ structure",
    nodeCount: allNodes.length,
    edgeCount: edges.length,
    warnings: [],
  },
};
