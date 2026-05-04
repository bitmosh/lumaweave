# Human Mode vs Evidence Mode Contract

**Version**: v73a
**Purpose**: Define Human Mode, Evidence Mode, and Debug Mode for dense control-plane/evidence surfaces to prevent the v69 failure pattern of collapsing accepted evidence before a test/helper/mode contract exists.

## Why This Contract Exists

**Problem Statement**:
- Graph Visual Inventory and control-plane surfaces are dense with accepted evidence.
- v69 failed because accepted legacy evidence was collapsed too broadly before a test/helper/mode contract existed.
- Future navigation improvements need clear rules for what can be summarized, hidden, expanded, or exposed.

**Root Cause of v69 Failure**:
- Collapsible Evidence Sections / Summary Cards were implemented without:
  - A clear contract for evidence visibility rules
  - Stable test helpers for collapsed content
  - Mode-aware rendering strategy
  - Stop conditions for evidence hiding

**Contract Goal**:
- Define evidence visibility rules before implementing any collapsible/summary UI.
- Ensure accepted evidence remains reachable in all modes.
- Provide a framework for future v69 retry with sliced, validated passes.
- Establish mode transition rules that preserve contract truth and safety boundaries.

## Modes

### Human Mode

**Purpose**: Overview-first, readable presentation for human operators.

**Characteristics**:
- Overview-first approach
- Summary cards for dense content
- Readable, user-friendly language
- Progressive disclosure allowed only if accepted evidence remains reachable
- No evidence weakening
- No dead controls

**Use Cases**:
- Daily operation and navigation
- Quick status checks
- Non-technical stakeholders
- Onboarding and exploration

**Example Rendering**:
- Grouped summaries (e.g., "5 active registries" instead of full list)
- Friendly labels (e.g., "Theme Mapping System" instead of "graph.theme.mapping.registry")
- Collapsible sections with stable open helpers

**Constraints**:
- Accepted evidence must be reachable through tested helpers
- No legacy accepted evidence may be collapsed by default until tests are migrated
- Fallback advisory is not current-pass evidence

---

### Evidence Mode

**Purpose**: Full accepted evidence visibility or direct reachability through tested helpers.

**Characteristics**:
- Full accepted evidence visible or directly reachable
- Source paths, test paths, QA keys, validators, forbidden boundaries
- Best mode for QA/Bandit review
- Default for validation-sensitive surfaces unless migrated
- No evidence weakening
- No test skips

**Use Cases**:
- QA validation and review
- Bandit checkpoint verification
- Contract compliance checking
- Debugging accepted evidence failures

**Example Rendering**:
- Full field lists (e.g., all 16 System Index entries with all fields)
- Raw IDs and identifiers
- Source paths, test paths, doc paths
- Forbidden boundaries explicitly listed
- Validator outputs and status

**Constraints**:
- Must preserve full accepted evidence path
- No test weakening or skipping
- Stable test helpers for all collapsed content

---

### Debug Mode

**Purpose**: Diagnostic IDs, raw status, and internal telemetry for internal QA/debug.

**Characteristics**:
- Diagnostic IDs and data-testid values
- Registry IDs and raw status/lifecycle fields
- Validator outputs
- Source paths
- Intended for internal QA/debug, not polished user view

**Use Cases**:
- Internal QA debugging
- Playwright test targeting
- Validator output inspection
- Registry state verification

**Example Rendering**:
- data-testid values
- Raw registry IDs (e.g., "graph.theme.mapping.registry")
- Lifecycle fields (e.g., "current", "future", "paused")
- Validator pass/fail counts
- Raw error messages

**Constraints**:
- Not intended for polished user view
- May include technical jargon
- May expose internal implementation details

## Evidence Visibility Rules

**Core Principle**: Accepted evidence is a contract.

**Rule 1: Human Mode Summarization**
- Human Mode may summarize evidence only if Evidence Mode preserves the full evidence path.
- Collapsed content must have stable open helpers/test IDs before becoming default-collapsed.
- Summary cards must not hide critical validation data (QA keys, validators, forbidden boundaries).

**Rule 2: Legacy Evidence Protection**
- No legacy accepted evidence may be collapsed by default until its tests are migrated.
- Legacy evidence must remain fully visible or directly reachable in Evidence Mode.
- Fallback advisory is not current-pass evidence.

**Rule 3: Test Helper Stability**
- Collapsed content must have stable open helpers/test IDs before becoming default-collapsed.
- Test helpers must be tested before collapsing becomes default.
- No test weakening, no test skips.

**Rule 4: Mode Reachability**
- Switching modes must not make evidence unreachable.
- Evidence Mode must always expose the full evidence path.
- Debug Mode must always expose diagnostic IDs for test targeting.

**Rule 5: Forbidden Boundary Preservation**
- Forbidden boundaries must be visible in all modes for relevant entries.
- Human Mode may summarize but must not hide forbidden boundary warnings.
- Evidence Mode must explicitly list forbidden boundaries.

## Mode Transition Rules

**Rule 1: No Graph/Sigma Mutation**
- Switching modes must not mutate graph/Sigma.
- Mode transitions must not alter graph topology or layout.
- Mode transitions must not change node/edge selection state.

**Rule 2: No Contract Truth Mutation**
- Switching modes must not change contract truth.
- Mode transitions must not alter validation status.
- Mode transitions must not change QA key acceptance state.

**Rule 3: No Audio Runtime Behavior**
- Switching modes must not enable audio input/playback/music runtime behavior.
- Mode transitions must not trigger audio playback.
- Mode transitions must not enable music-reactive mapping.

**Rule 4: No Command Execution**
- Switching modes must not execute commands.
- Mode transitions must not run external processes.
- Mode transitions must not trigger file system operations.

**Rule 5: No Storage Persistence (Until Contract Exists)**
- Switching modes must not persist settings until a storage contract exists.
- Mode transitions must not write to localStorage without a storage contract.
- Mode transitions must not persist user preferences without a storage contract.

## Relationship to v69 Retry

**Future Sliced Retry Strategy**:

**v69a: Overview Grid / Summary Cards Only**
- Implement overview grid and summary cards
- No collapsing legacy evidence
- No evidence hiding
- Validate that all accepted evidence remains reachable

**v69b: Section Metadata Registry + Test Helper Contract**
- Create section metadata registry
- Define test helper contract for collapsed content
- Implement stable open helpers/test IDs
- Validate that helpers work for all sections

**v69c: Collapse One Legacy Evidence Section at a Time**
- Collapse one legacy evidence section after validation
- Validate that tests still pass
- Validate that evidence remains reachable through helpers
- Stop if any test fails or evidence becomes unreachable

**v69d: Repeat Section-by-Section with Cascade Stop Rule**
- Repeat v69c for each legacy evidence section
- Stop cascade if any section fails validation
- Do not proceed to next section until current section is stable

**Stop Conditions for v69 Retry**:
- Any test fails
- Evidence becomes unreachable
- Helpers do not work
- Forbidden boundaries become hidden
- Accepted evidence is weakened
- Test skips are introduced

## Relationship to System Index

**Mode Compatibility**:
- SystemIndexPanel is naturally Human/Evidence/Debug compatible.
- System Index Registry entries have rich metadata suitable for mode-aware rendering.

**Human Mode Rendering**:
- Grouped summaries by category
- Category counts (10 categories)
- Kind counts (10 kinds)
- Status counts (6 statuses)
- Lifecycle counts (8 lifecycles)
- Future docs-only entries flagged
- Forbidden boundaries summarized

**Evidence Mode Rendering**:
- Full entry list (16 entries)
- All fields visible (title, id, category, kind, status, lifecycle, docPaths, sourcePaths, testPaths, validators, evidenceSurfaces, forbiddenBoundaries, relatedSystems, tags, futureImplementationStatus, notes)
- Future docs-only entries explicitly listed
- Forbidden boundaries explicitly listed

**Debug Mode Rendering**:
- Raw registry IDs (e.g., "graph.theme.mapping.registry")
- data-testid values
- Raw status/lifecycle fields
- Validator outputs
- Source paths and test paths

**Implementation Notes**:
- SystemIndexPanel already has stable data-testid values
- SystemIndexPanel is passive/read-only, no mode toggle needed initially
- Future mode-aware rendering can be added without breaking existing functionality

## Relationship to Visual Grammar Engine

**Current Status**:
- Visual Grammar Engine is future/docs-only source (docs/visual-grammar-engine/).
- No runtime implementation exists.
- Grammar Lens and Cursor Grammar Inspector are future concepts.

**Future Mode-Aware Rendering**:

**Human Mode**:
- Friendly labels for grammar handles
- Grammar patterns described in readable language
- Safety transforms summarized

**Evidence Mode**:
- Full grammar handles exposed
- Source paths for grammar rules
- Safety transform details
- Test paths for grammar validation

**Debug Mode**:
- Raw grammar paths
- Test IDs for grammar validation
- Internal grammar engine telemetry

**Implementation Notes**:
- Visual Grammar remains future/docs-only until explicit contract.
- Mode-aware rendering can be designed in contract phase before implementation.

## Relationship to LumaWeave Arena

**Current Status**:
- LumaWeave Arena is future concept/docs-only source (docs/lumaweave-arena/).
- No runtime implementation exists.
- Arena is synthetic/sandboxed/defensive/evaluative only.

**Future Mode Mapping**:

**Arena Spectator Mode**:
- Maps to Human Mode
- Friendly labels for agent behaviors
- Summarized scoring and telemetry

**Scoring/Evidence/Replay Mode**:
- Maps to Evidence Mode
- Full scoring data visible
- Replay traces fully exposed
- Agent decision paths documented

**Agent Telemetry/Debug Traces**:
- Maps to Debug Mode
- Raw agent state
- Internal decision logs
- Telemetry IDs and timestamps

**Implementation Notes**:
- Arena remains future/docs-only until explicit contract.
- Mode mapping can be designed in contract phase before implementation.
- Arena is synthetic/sandboxed/defensive/evaluative only, no production runtime.

## Future Implementation Ladder

**v73a: Contract Only**
- Create this contract (docs/control-plane/HUMAN_MODE_EVIDENCE_MODE_CONTRACT.md)
- Define modes, visibility rules, transition rules
- No runtime implementation
- No UI changes

**v73b: Mode Metadata Registry**
- Create mode metadata registry (TypeScript interface)
- Define mode flags and properties
- No runtime mode toggle
- No UI changes

**v73c: Passive Mode Indicator / No Behavior Change**
- Add passive mode indicator to UI (read-only display)
- No mode toggle behavior
- No evidence hiding
- No GraphVisualInventoryPanel changes

**v73d: SystemIndexPanel Mode-Aware Rendering**
- Add mode-aware rendering to SystemIndexPanel
- No evidence hiding
- Mode toggle still passive or disabled
- Validate that all modes preserve evidence reachability

**v73e: Graph Visual Inventory v69 Retry Support**
- Use mode contract to guide v69 retry
- Implement v69a (Overview Grid / Summary Cards Only)
- Implement v69b (Section Metadata Registry + Test Helper Contract)
- Implement v69c (Collapse One Legacy Section at a Time)
- Implement v69d (Repeat Section-by-Section with Cascade Stop Rule)

**v73f: Runtime Mode Toggle (If Needed)**
- Implement runtime mode toggle only after all above steps
- Implement storage contract for mode persistence
- Validate that mode transitions preserve evidence reachability
- Validate that mode transitions respect forbidden boundaries

## Forbidden

In this pass (v73a):

- No runtime mode toggle
- No UI implementation
- No evidence hiding
- No GraphVisualInventoryPanel edits
- No graph-visual-inventory.spec edits
- No QA key rotation
- No graph/Sigma mutation
- No audio input/playback/music runtime behavior
- No command execution
- No storage/persistence
- No token promotion
- No CSS variable writes
- No test skips

## Version History

- **v73a** (2026-05-04): Initial Human Mode vs Evidence Mode Contract (docs-only definition of modes, visibility rules, transition rules, and relationship to v69 retry, System Index, Visual Grammar Engine, and LumaWeave Arena)
