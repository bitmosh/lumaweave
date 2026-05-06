---
id: contract.source.adapter.os
title: Source Adapter OS Foundation Contract
type: contract
status: accepted
version: v74a
domain: source-adapter
cluster: green
agent_readable: true
include_in_self_graph: true
last_updated: v74a
depends_on:
  - policy.ingestion.safety.qa
  - schema.source.graph.normalized
  - policy.source.of.truth
tags: [source-adapter, OS, contract, foundation, lifecycle, safety, accepted]
---

# Source Adapter OS Foundation Contract

**Version:** v74a
**Type:** docs-only foundation contract
**Next implementation:** v74b (Base Registry + Validator)

---

## Purpose

The Source Adapter OS is the ingestion and conversion layer for LumaWeave. It defines how external data sources — codebases, websites, Markdown vaults, API specs, databases, cloud infrastructure, issue trackers, document corpora — are translated into a shared normalized graph format.

This contract establishes:
- The adapter lifecycle from candidate to active
- The base metadata schema for all adapters
- Safety requirements that are non-negotiable
- Forbidden behaviors that must never occur
- The relationship to existing LumaWeave boundaries
- Acceptance criteria for the registry and validator

This contract is the canonical authority for source adapter behavior. All adapter implementations must conform to this contract before being accepted.

---

## Adapter Lifecycle

An adapter progresses through these states:

```
candidate
  ↓
registered
  ↓
validated
  ↓
accepted
  ↓
active
```

### candidate
- Proposed adapter concept with documented scope
- May exist as a design doc or roadmap entry
- Not yet in the registry
- No runtime implementation required

### registered
- Added to the Source Adapter Base Registry with a `SourceAdapterEntry`
- Has a unique `adapterId`
- Has a declared `adapterType` (e.g., "website-url", "codebase", "markdown-vault")
- Has a declared `inputPattern` for source detection
- Has a `translationSet` mapping source entities to normalized graph types
- May be synthetic (planned) or implemented

### validated
- Registry entry passes the Source Adapter Base Validator (v74b)
- Translation set produces valid `LumaSourceGraph` schema
- All safety requirements are satisfied
- QA report format is defined
- Forbidden behaviors are explicitly avoided

### accepted
- Contract authorizes the adapter for use
- Adapter is marked as safe for ingestion
- Adapter may be used in fixtures or passive mounts
- Adapter may be promoted to active when implementation is complete

### active
- Adapter is fully implemented and tested
- Adapter produces real ingestion results
- Adapter is used in production workflows
- Adapter is monitored for safety violations

---

## Base Adapter Metadata Schema

All adapters must register with this TypeScript interface:

```typescript
interface SourceAdapterEntry {
  // Identity
  adapterId: string;           // Unique identifier, e.g., "website-url-v0"
  adapterType: string;        // Category, e.g., "website-url", "codebase", "markdown-vault"
  adapterVersion: string;     // Semantic version, e.g., "0.1.0"
  
  // Source detection
  inputPattern: {
    type: "url" | "path" | "manifest" | "schema";
    pattern: string;          // Regex or glob pattern for detection
    examples: string[];       // Example inputs that match
  };
  
  // Translation set
  translationSet: {
    // Source entity → normalized node type mapping
    nodeMappings: Record<string, string>;  // e.g., { "html_page": "website.page" }
    
    // Source relationship → normalized edge type mapping
    edgeMappings: Record<string, string>;  // e.g., { "href": "links_to" }
    
    // Confidence defaults
    defaultConfidence: "observed" | "inferred" | "ai-inferred";
  };
  
  // Safety limits
  limits: {
    maxNodes?: number;        // Default: 1000
    maxEdges?: number;        // Default: 5000
    maxDepth?: number;        // Default: 3
    maxFileSize?: number;     // In bytes, default: 10MB
    timeoutMs?: number;       // Default: 30000
  };
  
  // QA report format
  qaReportFormat: {
    requiredFields: string[];  // Fields that must appear in every QA report
  };
  
  // Status
  status: "candidate" | "registered" | "validated" | "accepted" | "active";
  
  // Governance
  contractVersion: string;    // Which contract version this adheres to
  lastUpdated: string;       // ISO timestamp
}
```

---

## Safety Requirements

All source adapters must follow these safety requirements without exception. Violation of any safety requirement is a contract breach.

### Local-First
- No unapproved network transmission of source data
- No storing source content beyond the current session unless explicitly contracted
- User explicitly approves each source before ingestion begins
- All ingestion operations are scoped to user-granted workspace

### Read-Only
- Adapters read source data only — they never write to, modify, or execute source files
- No project command auto-execution (e.g., no running `npm install`, `make build`, etc.)
- No script execution from ingested source
- No code evaluation from source content

### Scope Isolation
- No parent-directory wandering (e.g., if user grants access to `~/project`, do not read `~/project/..`)
- No access to secrets, credentials, or private keys without explicit grant
- No access to `.env` files unless explicitly granted
- Respect `.gitignore` and `.lumaweave-ignore` patterns
- All file access must be within the user-approved workspace boundary

### Audit Trail
- Every ingestion session produces a QA report
- QA report includes: what was read, what was skipped, limits applied, warnings, confidence breakdown
- QA report feeds Mission Control ingestion summary panel
- Audit logs must persist for the session duration
- All safety violations must be reported immediately

### Confidence Separation
- Observed edges must have explicit source evidence (file path, URL, line range, selector)
- Inferred edges must document the inference rule
- AI-inferred edges must be clearly labeled in both graph metadata and UI
- Never mix observed with AI-inferred without visible confidence labels
- Never display AI-inferred as fact — always as "model suggestion"

---

## Forbidden Behavior

The following behaviors are strictly forbidden. Any adapter exhibiting these behaviors must be rejected immediately.

### Execution Forbidden
- Executing any code from the source (scripts, postinstall hooks, makefiles, etc.)
- Running build commands, test commands, or installation commands
- Evaluating JavaScript, Python, or any code from source content
- Loading and executing dynamic libraries from source

### Network Forbidden
- Making network requests without user authorization
- Contacting external domains without explicit approval
- Transmitting source data to external services
- Fetching remote resources without user trigger

### Modification Forbidden
- Writing to the source directory
- Modifying source files in any way
- Creating or deleting files in the source workspace
- Altering source permissions or metadata

### Secrets Forbidden
- Accessing credentials or secrets without explicit grant
- Reading `.env`, `.aws/credentials`, `~/.ssh/`, or similar secret stores
- Extracting API keys, tokens, or passwords from source
- Logging or transmitting secret values

### Scope Forbidden
- Accessing files outside the user-granted scope
- Parent-directory traversal attacks
- Reading system directories without approval
- Accessing other users' home directories

### Automation Forbidden
- Auto-ingesting without user trigger
- Running periodic scans without user consent
- Background ingestion without explicit session
- Silent ingestion without UI indication

### Data Manipulation Forbidden
- Modifying graph data after ingestion without re-running the adapter
- Altering confidence values post-ingestion
- Injecting synthetic nodes/edges without documentation
- Tampering with QA reports after generation

---

## Relationship to Existing Boundaries

### Graph / Sigma Boundary
- Source adapters produce normalized graph data
- Sigma renderer consumes normalized graph data
- Adapters do not mutate Sigma rendering state directly
- Adapters do not write to graphology instance directly
- All graph mutations go through the normalized schema

### Audio Boundary
- Source adapters do not access audio input/playback systems
- Source adapters do not generate audio signals
- Source adapters do not trigger music reactivity
- Audio reactivity is reserved for runtime graph events only

### Motion Safety / Epilepsy Guard
- Source adapters do not control motion parameters
- Source adapters do not trigger visual effects
- Source adapters do not bypass epilepsy guard
- Motion safety is enforced at the renderer level, not the adapter level

### Runtime Contracts
- Source adapters do not execute runtime commands
- Source adapters do not call Tauri commands directly
- Source adapters do not mutate application state
- All adapter output is data-only, no side effects

### Theme System
- Source adapters do not write CSS variables
- Source adapters do not mutate theme tokens
- Source adapters do not trigger theme changes
- Theme is controlled by the theme system, not adapters

### Storage Persistence
- Source adapters do not write to localStorage without contract
- Source adapters do not persist ingestion results without user approval
- Source adapters do not cache source data across sessions unless contracted
- All persistence decisions require explicit contract

---

## Acceptance Criteria for v74b

The Source Adapter Base Registry + Validator (v74b) must prove:

### Registry Requirements
- TypeScript `SourceAdapterEntry` type matches the schema defined in this contract
- Static registry is seeded with documented adapter types (synthetic/planned)
- Registry entries have unique `adapterId` values
- Registry entries declare all required fields per the schema
- Registry entries have valid `status` values

### Validator Requirements
- Validator script checks registry entries against contract rules
- Validator proves every adapter has a registered translation set
- Validator proves every adapter produces valid `LumaSourceGraph` schema
- Validator proves every observed edge has at least one `SourceEvidence` entry
- Validator proves confidence values are one of: `observed` | `inferred` | `ai-inferred`
- Validator proves ingestion QA report format is defined
- Validator proves safety flags are present in limits

### Forbidden Behavior Detection
- Validator detects adapters that declare execution capabilities
- Validator detects adapters that declare network access without authorization
- Validator detects adapters that declare write access to source
- Validator detects adapters that access secrets without explicit grant
- Validator rejects any adapter violating forbidden behavior rules

### Evidence Requirements
- Playwright proves registry data renders in evidence panel
- Playwright proves validator runs successfully on synthetic entries
- Playwright proves validator rejects invalid entries
- Validation evidence is captured in the acceptance report

### Contract Coherence
- Registry schema matches this contract's TypeScript interface
- Validator enforces all safety requirements from this contract
- Validator enforces all forbidden behaviors from this contract
- QA report format matches the schema defined in INGESTION_SAFETY_AND_QA.md

---

## Contract Authority

This contract is the canonical authority for source adapter behavior. In case of conflict between this contract and any other documentation, this contract takes precedence.

Updates to this contract require a version bump and explicit acceptance through the standard QA pass process.

---

## Related Documents

- `docs/source-adapter/SOURCE_ADAPTER_OS_OVERVIEW.md` — Architecture and pipeline overview
- `docs/source-adapter/NORMALIZED_SOURCE_GRAPH_SCHEMA.md` — Common node/edge/evidence model
- `docs/source-adapter/INGESTION_SAFETY_AND_QA.md` — Safety rules and QA requirements
- `docs/source-adapter/SOURCE_ADAPTER_ROADMAP.md` — Phase sequence
- `docs/operating-policies/SOURCE_OF_TRUTH.md` — Forbidden boundaries by system
