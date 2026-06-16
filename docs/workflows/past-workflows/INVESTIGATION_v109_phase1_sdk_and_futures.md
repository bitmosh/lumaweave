# Investigation brief — v109 Phase 1: SDK_SPEC + INTEGRATION_FUTURES + SHARED_SCHEMA

**For:** Terminal Claude · **Output:** three markdown documents, dropped into the locations specified · **No code changes, no commits, no installs.**

Phase 1 of v109 (Source Adapter Platform). Produces the *design artifacts* that Phase 2 implementation builds against. The portfolio survey (`docs/prototypes/v109_adapter_portfolio_report.md`) + Ryan's product decisions + the Cerebra cross-project handoff are all already in PK and serve as input.

Three documents to produce. Each is read-only authoring; no implementation, no commits. **No files in `~/Projects/lumaweave/src/` or `~/Projects/cerebra/cerebra/` are modified.**

---

## Background — what's been decided

Read these first to ground the work:
- `~/Projects/lumaweave/docs/prototypes/v109_adapter_portfolio_report.md` — the strategic survey
- `~/Projects/lumaweave/docs/prototypes/source-adapter-plan.md` — earlier scoping
- The Cerebra cross-project handoff (`cerebra/docs/cerebra-adapter.md` if it lives there, or in PK as `cerebra-adapter.md`)
- `~/Projects/lumaweave/docs/LUMAWEAVE_NOW.md` — current arc state

Ryan-confirmed decisions:
1. **Tier 2 build set:** markdown-vault (Obsidian) + Cytoscape JSON + package-dependency + CSV. Four adapters across four distinct families.
2. **Path validation:** manual Rust (Option A), per-adapter user-configured roots.
3. **Folder picker:** text input in settings; defer `tauri-plugin-dialog`.
4. **Tag-nodes**, not tag-edges. Wikilinks + tag-membership default edges; backlinks derived not stored.
5. **2000-note cap** honored for v1.0 with truncation warning.
6. **Node identity:** vault-root-relative path.
7. **Plugin model:** Option A (all-in-core) for v1.0; Option B (declarative config) as optional v109 stretch; Option C (full plugin SDK) deferred post-v1.0.
8. **`registerSourceAdapter()` API:** introduced in v109.0 (standalone pass), mirrors `physicsDialectRegistry` pattern.
9. **Family-base architecture** (Ryan's amendment to the report's flat plan): `BaseSourceAdapter` interface + family base classes (`DirectoryAdapter`, `SingleFileAdapter`, future `DSLAdapter`, `APIAdapter`). Concrete adapters extend their family base. Categorized adapter picker is the product surface.
10. **Per-adapter settings config** (Ryan's amendment): adapter-specific config lives under `sources.configurations[adapterId]`, not in global namespace.
11. **Minor-version-per-adapter scheme** (Ryan's call): v109.0 = platform; v109.1 = first adapter (Obsidian); v109.2 = Cytoscape; v109.3 = package-dependency; v109.4 = CSV; v109.5 (or later) = arc close.
12. **Live-integration with Cerebra is post-v1.0**, not today's work. Today's job: forward-compatibility hooks (lightweight stubs), not implementation. Specifically:
    - `SourceAdapterEntry` gains optional `coupling?: "external" | "sibling-module"` field (default `"external"`).
    - Adapter export schemas reserve a top-level `extensions: {}` object for future live-channel payloads.
    - Adapter export schemas include a `transport: "file" | "live"` metadata field (default `"file"`).
    - These cost ~nothing now and preserve the architecture's ability to evolve.

**Hard stops:**
- No code changes anywhere. No commits. No installs.
- Cite file:line for every claim about current LumaWeave or Cerebra code.
- The three documents below are the *only* outputs. Drop them in the specified locations.

---

## Document 1 — `SDK_SPEC.md` v0.1

**Location:** `~/Projects/future-integration/SDK_SPEC.md` (create the directory if it doesn't exist; this is the shared cross-project dir between LumaWeave and Cerebra).

**Purpose:** the source-adapter SDK contract. The authoritative description of what an adapter is, how it registers, what it must produce, and how LumaWeave consumes it. Iteratively refined across v109 passes; each implementation pass surfaces edge cases that sharpen the spec.

**Sections (with per-section coherence rating — settled / open / TBD):**

### §1 — Overview
What the SDK is, what an adapter does, who's responsible for what (Cerebra-side authors vs LumaWeave-side authors vs eventual community).

### §2 — Adapter lifecycle states
The `candidate / registered / validated / accepted / active` lifecycle (the doc you have it referenced from the existing registry). When does an adapter advance from one stage to the next? What gates each transition?

### §3 — The `BaseSourceAdapter` interface
The minimal contract every adapter must satisfy. Probably:

```typescript
interface BaseSourceAdapter {
  readonly adapterId: string;
  readonly adapterType: string;
  readonly adapterVersion: string;
  readonly family: "directory" | "single-file" | "dsl" | "api";  // family declaration
  readonly capabilities: AdapterCapabilities;
  load(config: AdapterConfig): Promise<GraphSourceSummary>;
}
```

Define `AdapterCapabilities` (what an adapter can/cannot do — e.g. `supportsLiveRefresh`, `requiresUserPath`, `requiresNetwork`). Define `AdapterConfig` (the per-adapter settings shape).

### §4 — Family base shapes
For v109 we need at least:
- `DirectoryAdapter extends BaseSourceAdapter` — adapters reading from a user-configured directory root. Provides: `listFiles()`, `readVaultFile()`. Concrete implementations: markdown-vault (today), future Logseq, future Roam, future Cerebra-vault.
- `SingleFileAdapter extends BaseSourceAdapter` — adapters reading a single file (JSON, XML, etc.). Provides: `readFile()`. Concrete implementations: Cytoscape JSON (today), package-dependency, CSV, future GraphML, future Mermaid.

Sketch the family base API for each. Note: future families (`DSLAdapter` for Mermaid/D2; `APIAdapter` for network-fetch adapters; `GeneratedAdapter` for script-generated graphs) are *out of scope for v109* but their existence should be acknowledged so the family taxonomy is extensible.

### §5 — Registration & dispatch
- `registerSourceAdapter(entry: SourceAdapterEntry, loader: LoaderFn): void` — the registration API.
- The `LoaderFn` signature.
- The dispatch model in `loadSource.ts` — a `Map<adapterId, LoaderFn>` populated at module-init time.
- Subscriber pattern for adapter list changes (so UI updates when adapters register/unregister, important if a future plugin model loads adapters dynamically).

### §6 — Export schema convention
The shape of data an adapter produces. For v109, define:
- `LumaWeaveNodeDraft[]` and `LumaWeaveEdgeDraft[]` (already exist in code — cite file:line).
- The **top-level export envelope** for adapters that produce a *file* output (used by self-graph and the eventual Cerebra adapter):
  ```json
  {
    "schemaVersion": "<adapter-name>/v<n>",
    "transport": "file",                   // forward-compat: future "live"
    "extensions": {},                       // reserved namespace for live-mode payloads
    "metadata": { ... },
    "nodes": [ ... ],
    "edges": [ ... ]
  }
  ```
- Note that *not all* adapters produce a file — Cytoscape adapters read their input directly; markdown-vault constructs the graph from a directory walk. The envelope is only relevant for adapters whose input *is itself* a graph file (self-graph, Cerebra-vault, GraphML, GEXF).

### §7 — Coupling tiers
- `coupling: "external"` (default) — generic third-party formats. No special LumaWeave handling. The Kirby-move surface.
- `coupling: "sibling-module"` — paired modules (Cerebra). Eligible for future live-integration extensions. Operationally identical to external in v1.0; tagged for future capabilities to attach.
- Concrete rule: if an adapter is `sibling-module`, LumaWeave may consult the `extensions` field of its export envelope for known cross-system payloads. Today there are zero recognized extensions; tomorrow there may be `agentState`, `diffNotifications`, etc.

### §8 — Per-adapter settings shape
- Settings live under `sources.configurations[adapterId]: AdapterConfig`. Adapter-specific.
- Each adapter declares its `AdapterConfig` shape (e.g. markdown-vault: `{ vaultRoot: string, excludePatterns?: string[] }`; Cytoscape: `{ filePath: string }`; package-dependency: `{ projectPath: string, manifestType: "package.json" | "pyproject.toml" }`).
- Settings UI: each adapter contributes a settings sub-panel rendered by SourceAdapterPanel when that adapter is selected as active.

### §9 — Error contract
What an adapter must return on failure: `{ status: "error", error: string, sourceId, sourcePath: null }`. Error messages should be user-readable (the user will see them in the panel).

### §10 — Open questions & TBD
The questions the spec doesn't yet answer. Rate as "settled in v109" vs "open for future arc" vs "TBD pending implementation feedback." Examples to seed:
- Streaming/chunked loading for large vaults (deferred to v2)
- File-watching for live refresh (deferred; mock with manual refresh)
- Cross-adapter dependencies (e.g. an adapter that reads output of another adapter) — needed? defer?
- Capability negotiation across versions (a Cerebra-vault v2 exporter writing to a LumaWeave that only knows v1) — defer to first version-skew arc.

### Coherence ratings
At the end, summarize: which sections are *settled* (Phase 2 can implement against them confidently), which are *open* (need a decision before implementation hits them), which are *TBD* (will be sharpened by implementation feedback). Phase 2 only proceeds on settled sections.

---

## Document 2 — `INTEGRATION_FUTURES.md`

**Location:** `~/Projects/future-integration/INTEGRATION_FUTURES.md`

**Purpose:** capture the long-horizon vision for LumaWeave + Cerebra sibling-module integration so it isn't lost between now and when it's implemented. Explicitly labeled "**not v1.0**" so future-readers don't accidentally treat it as a roadmap.

**Sections:**

### §1 — Status & scope
Status: deferred post-v1.0. This document describes architectural intent, not commitments. Implementation may begin no earlier than [a future arc, TBD]. The purpose of recording it now is to (a) inform forward-compatibility decisions in v1.0 architecture and (b) preserve design intent that would otherwise live only in Ryan's head and planning Claude's context.

### §2 — The sibling-module vision
What LumaWeave + Cerebra together look like when fully integrated:
- LumaWeave as the visual front-end; Cerebra as the cognitive backend hosting an agent
- The agent dogfoods both systems: thinks in Cerebra's SKU-addressed memory; expresses itself through LumaWeave's visual grammar
- Bidirectional information flow: agent state surfaces in LumaWeave's graph (thinking trace, current focus, diff notifications); user interactions in LumaWeave route queries back to the agent
- Cerebra retrains itself via transformers/unsloth/LoRA on aggregated cognitive insights

Write this as a *vision document*, not a spec. Concise. The point is to preserve intent.

### §3 — The "least surface area" principle
Ryan's framing: *"what's the least amount of surface area we need to push appropriately hi-def info between the two modules?"* Document this as the guiding principle. Concretely:
- File-mediated handoff for v1.0 (the current `cerebra-graph.json` approach)
- Live channel only when justified by a feature that requires it (agent thinking-trace, real-time diff notifications)
- Never a tightly-coupled RPC layer; always a versioned data contract that can be transmitted by any medium

### §4 — Forward-compatibility hooks already present in v1.0
The actual implementation choices that preserve the future path. These are *in v1.0* and operationally invisible, but they're what makes the future work possible:
- `SourceAdapterEntry.coupling: "sibling-module"` field
- Adapter export envelope's reserved `extensions: {}` namespace
- Adapter export envelope's `transport: "file" | "live"` flag
- The `cerebra-vault` adapter when it lands (in v109.x or later) declares itself `coupling: "sibling-module"`

### §5 — Open questions for the future arc
Things to figure out *when* the live-integration arc opens (not now):
- IPC transport choice (Tauri sidecar? Unix domain socket? Local HTTP? WebSocket?)
- Process lifecycle: who starts whom? what happens when one crashes?
- Schema evolution across versions
- Parallel ingestion + post-ingestion triage architecture
- The "switching system" Ryan mentioned for managing each system's responsibilities — what does it actually do?
- Authentication/identity between sibling processes (if needed)
- Permission model for the agent's writes back to LumaWeave-rendered graphs

These are *not* questions to answer now. They're recorded so when the arc opens, the agenda is pre-loaded.

### §6 — Cross-references
- `SDK_SPEC.md` — the current adapter contract that includes the forward-compat hooks
- `SHARED_SCHEMA.md` — the cerebra-graph.json schema (current contract)
- `handoffs/` — record of cross-Claude design conversations between LumaWeave-side and Cerebra-side planning

### §7 — Do-not-build list
What this document is **not** authorizing:
- Do not build the live IPC channel today
- Do not stub the live channel with placeholder code
- Do not add Cerebra-specific UI to LumaWeave beyond the `coupling: "sibling-module"` flag
- Do not make LumaWeave depend on Cerebra being present
- Do not make Cerebra depend on LumaWeave being present

Each system stands alone in v1.0. Their joint operation is a *future capability*, not a v1.0 deliverable.

---

## Document 3 — `SHARED_SCHEMA.md` v1

**Location:** `~/Projects/future-integration/SHARED_SCHEMA.md`

**Purpose:** the authoritative `cerebra-graph.json` schema as a cross-project contract. Currently defined in the existing `cerebra-adapter.md` (in PK or in Cerebra's repo); this document is the canonical version both projects reference.

**Sections:**

### §1 — Status
Active contract. v1.0 of the schema. Either side updates this document when proposing schema changes; both sides must agree before changes ship.

### §2 — The schema
Reproduce the cerebra/v1 schema from the existing cerebra-adapter.md but with the v109 amendments:
- Top-level `transport: "file"` field
- Top-level `extensions: {}` object
- Schema version string format: `cerebra/v1`
- Full node and edge shapes
- Metadata block
- Cluster color mapping
- Edge weight conventions

### §3 — Backward compatibility policy
- Additive optional fields: no version bump required
- Breaking changes (renamed fields, removed fields, semantic changes): require version bump and both-side agreement
- The adapter loader checks `schemaVersion` and rejects unknown versions with a clear error

### §4 — Open evolution paths
What might extend this schema (recorded but not implemented):
- `extensions.agentState` for live agent payloads
- `extensions.diffNotifications` for file-touch annotations
- `extensions.thinkingTrace` for cognitive trace overlays
- `extensions.focus` for "agent is currently looking here" indicators
- Additional node types (e.g. `agent` for the agent itself as a graph entity)
- Additional edge types (e.g. `attended-to` for agent-attention edges)

These are *forward-compatible additions*. The v1 schema is stable; extensions land via the reserved namespace without bumping the version.

### §5 — Cross-references
- `SDK_SPEC.md` §6 — how this schema fits the adapter export envelope convention
- `INTEGRATION_FUTURES.md` §4 — why the `extensions` namespace exists
- The eventual LumaWeave `cerebra-vault` adapter implementation (when it lands)

---

## Output

Three markdown documents, written to `~/Projects/future-integration/`. Create the directory if it doesn't exist. Coherence ratings included in SDK_SPEC.md. File:line citations for code references. No commits. No implementation. When complete, drop a brief status note in PK ("Phase 1 docs landed; ready for Phase 2 implementation").
