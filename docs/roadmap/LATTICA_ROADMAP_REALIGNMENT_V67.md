# Lattica Roadmap Realignment v67

## Status

**Status**: Contract (docs-only)
**Date**: 2026-05-03
**Bandit Level**: 32.75 (Audio Reactivity Contract Warden)
**Clean Quest Streak**: 2 (held)

## Purpose

Realign the roadmap after the completed safety/audio groundwork (v59–v66). This document establishes the current system architecture, identifies completed safety/audio spine systems, schedules ten improvement tracks, and proposes a v68–v80 roadmap.

This realignment is necessary because:
- The safety/audio pipeline (v59–v66) is now complete and stable
- Multiple Lattica-owned systems have been implemented but are underutilized
- The control plane is becoming a long scroll-wall and needs UX/navigation improvements
- Several foundational systems (QA governance, registries, theme mapping) need dedicated improvement sessions
- The roadmap needs to reflect the current state of external foundations vs Lattica-owned layers

## Current Accepted Pipeline

The following safety/audio contracts and implementations have been accepted and committed:

- **v59**: Motion Safety / Epilepsy Guard Contract
- **v60**: Reduced Motion Guard Registry
- **v61**: Audio Reactivity Contract
- **v62**: Synthetic Audio Signal Preview
- **v63**: Music Reactive Mapping Contract
- **v64**: Passive Music Reactive Mapping Inventory
- **v65**: Audio Source System Contract
- **v66**: Passive Audio Source Registry

Accepted commits:
- `ddda85b` docs: add Lattica theme workshop security packet
- `95a26ba` feat: add passive audio source and music reactive mapping registries

## What Changed Since Previous Roadmap

Since the previous roadmap, the following major changes have occurred:

1. **Safety/Audio Spine Complete**: Motion Safety, Epilepsy Guard, Audio Reactivity, Synthetic Signal Preview, Music Reactive Mapping, and Audio Source System are now fully governed with contracts and passive/read-only implementations.

2. **Registry Pattern Established**: Multiple registries have been implemented (Motion Safety, Synthetic Audio Signal, Music Reactive Mapping, Audio Source), establishing a pattern for passive/read-only system inventories.

3. **QA Advisory Lockstep Fixed**: The QA advisory binding issue has been resolved, establishing a stable pattern for QA identity bundle updates (BACKLOG_POLICY, QaPanel, qa-registry, advisory-registry, contract-registry).

4. **Helper Fix Pattern**: The switchQaKey helper has been fixed to not require the Advisory tab, establishing a pattern for separating key switch from advisory content wait.

5. **Theme Workshop Security**: The Lattica theme workshop security packet has been documented, establishing security boundaries for theme submissions.

6. **Control Panel Growth**: The Graph Visual Inventory has grown significantly with multiple registry sections (Graph View Elements, Theme Mappings, Motion Safety, Synthetic Signals, Music Reactive Mapping, Audio Sources), creating a scroll-wall navigation problem.

## Current System Layers

### External Foundations

These are third-party libraries and frameworks that Lattica depends on:

- **Graphology**: Graph data model library (external dependency)
- **Sigma**: Graph renderer (external dependency)
- **React**: UI framework (external dependency)
- **Vite**: Build tool (external dependency)
- **Playwright**: Test framework (external dependency)
- **TypeScript**: Language (external dependency)

### Lattica-Owned Layers

These are systems owned and maintained by Lattica:

- **Command Deck**: Command palette and hotkey system
- **Perspective System**: View state management
- **QA/Advisory/Backlog Governance**: Quality assurance and advisory system
- **Graph View Element Registry**: Typed inventory of graph visual elements
- **Graph Visual Inventory**: Passive/read-only control panel display
- **Graph Theme Mapping**: Theme token application system
- **Runtime Boundary/Probe**: Runtime inspection and validation
- **Motion Safety / Epilepsy Guard**: Visual effect safety classification
- **Synthetic Audio Signal Preview**: Static audio signal models
- **Music Reactive Mapping Registry**: Audio-to-visual mapping inventory
- **Audio Source Registry**: Audio source type inventory
- **Theme Workshop Security Packet**: Theme submission security model

## External Foundations vs Lattica-Owned Layers

### External Foundations (Maintained by Others)

- Graphology: Graph data model - external dependency, no Lattica control
- Sigma: Graph renderer - external dependency, no Lattica control
- React: UI framework - external dependency, no Lattica control
- Vite: Build tool - external dependency, no Lattica control
- Playwright: Test framework - external dependency, no Lattica control
- TypeScript: Language - external dependency, no Lattica control

### Lattica-Owned Layers (Maintained by Lattica)

- Command Deck: Lattica-owned, requires dedicated improvement session
- Perspective System: Lattica-owned, sprinkle into nearby quest
- QA/Advisory/Backlog Governance: Lattica-owned, requires dedicated improvement session
- Graph View Element Registry: Lattica-owned, sprinkle into nearby quest
- Graph Visual Inventory: Lattica-owned, sprinkle into nearby quest (v68 navigation contract)
- Graph Theme Mapping: Lattica-owned, sprinkle into nearby quest
- Runtime Boundary/Probe: Lattica-owned, sprinkle into nearby quest
- Motion Safety / Epilepsy Guard: Lattica-owned, stable, sprinkle into nearby quest
- Synthetic Audio Signal Preview: Lattica-owned, stable, sprinkle into nearby quest
- Music Reactive Mapping Registry: Lattica-owned, stable, sprinkle into nearby quest
- Audio Source Registry: Lattica-owned, stable, sprinkle into nearby quest
- Theme Workshop Security Packet: Lattica-owned, docs-first, requires dedicated session

## Completed Safety/Audio Spine

The following safety/audio systems are now complete and stable:

1. **Motion Safety / Epilepsy Guard (v59/v60)**
   - Contract: `docs/accessibility/MOTION_SAFETY_CONTRACT.md`
   - Registry: `src/accessibility/motionSafetyRegistry.ts`
   - UI: Graph Visual Inventory (passive/read-only)
   - Status: Complete, stable

2. **Audio Reactivity Contract + Synthetic Signal Preview (v61/v62)**
   - Contract: `docs/accessibility/AUDIO_REACTIVITY_CONTRACT.md`
   - Registry: `src/audio/syntheticAudioSignal.ts`
   - UI: Graph Visual Inventory (passive/read-only)
   - Status: Complete, stable

3. **Music Reactive Mapping Contract + Passive Inventory (v63/v64)**
   - Contract: `docs/audio/MUSIC_REACTIVE_MAPPING_CONTRACT.md`
   - Registry: `src/audio/musicReactiveMappingRegistry.ts`
   - UI: Graph Visual Inventory (passive/read-only)
   - Status: Complete, stable

4. **Audio Source System Contract + Passive Registry (v65/v66)**
   - Contract: `docs/audio/AUDIO_SOURCE_SYSTEM_CONTRACT.md`
   - Registry: `src/audio/audioSourceRegistry.ts`
   - UI: Graph Visual Inventory (passive/read-only)
   - Status: Complete, stable

## Deferred Runtime Behavior

The following runtime behaviors are explicitly deferred until future governance approval:

1. **Real Audio Input Processing**: Microphone, system audio, streaming sources - deferred until safety gate implementation
2. **Audio File Decoding**: Full audio file signal decoding - deferred until v68+ governance approval
3. **Music-Reactive Visuals**: Visual reaction to audio signals - deferred until safety gate implementation
4. **Graph/Sigma Mutation**: Runtime graph renderer mutations - deferred until governance approval
5. **Command Execution**: Runtime command execution from control panel - deferred until governance approval
6. **Node/Edge/Canvas Styling**: Runtime visual style mutations - deferred until governance approval
7. **Animation**: Runtime animation effects - deferred until governance approval

## Next Priority Lanes

After v67 roadmap realignment, the following priority lanes are recommended:

1. **UX/Navigation Lane (v68–v69)**: Improve Graph Visual Inventory navigation with sticky summary, collapsible sections, compact cards
2. **QA Governance Lane (v70–v71)**: QA Bundle Validator script, Contract-to-Code Trace Matrix
3. **Registry/Data Lane (v72)**: Registry Explorer / Searchable System Index
4. **Mode/Evidence Lane (v73)**: Human Mode vs Evidence Mode
5. **Source Adapter Lane (v74)**: Source Adapter OS Reconnect Contract
6. **Synthetic Data Lane (v75)**: Synthetic Data Fixtures as first-class toolset
7. **Security Lane (v76–v77)**: Verified Download Button Boundary, Theme Submission Security Model

## Ten Underutilized Systems To Schedule

The following ten Lattica-owned systems require dedicated improvement sessions or sprinkle-in opportunities:

1. **QA Bundle Validator Script**
   - Purpose: Validate QA lockstep bundle (BACKLOG_POLICY, QaPanel, qa-registry, advisory-registry, contract-registry) before commit
   - Classification: **dedicated session required**
   - Risk: Low
   - Priority: v70

2. **Contract-to-Code Trace Matrix**
   - Purpose: Create traceability matrix linking contract requirements to code locations and test assertions
   - Classification: **dedicated session required**
   - Risk: Low
   - Priority: v71

3. **Data-Driven Control Plane Section Registry**
   - Purpose: Define control panel sections as data-driven registry instead of hardcoded UI
   - Classification: **sprinkle into nearby quest**
   - Risk: Medium
   - Priority: v72 (Registry Explorer)

4. **Registry Explorer / Searchable System Index**
   - Purpose: Unified search interface for all registries (Motion Safety, Audio, Theme, Graph Elements)
   - Classification: **implementation-first**
   - Risk: Medium
   - Priority: v72

5. **Human Mode vs Evidence Mode**
   - Purpose: Define two control panel modes: Human Mode (compact, high-level) vs Evidence Mode (detailed, test-focused)
   - Classification: **docs-first**
   - Risk: Low
   - Priority: v73

6. **Source Adapter OS Reconnect**
   - Purpose: Define contract for source adapter reconnection after OS sleep/disconnect
   - Classification: **dedicated session required**
   - Risk: High
   - Priority: v74

7. **Theme Workshop Security Hardening Path**
   - Purpose: Implement security hardening for theme workshop (sandboxing, validation, audit trail)
   - Classification: **dedicated session required**
   - Risk: High
   - Priority: v77

8. **Synthetic Data Fixtures as First-Class Toolset**
   - Purpose: Promote synthetic data generation (graphs, audio, themes) to first-class testing toolset
   - Classification: **implementation-first**
   - Risk: Low
   - Priority: v75

9. **Verified Download Button Boundary**
   - Purpose: Define contract for download button security (verified sources, hash validation, sandbox)
   - Classification: **docs-first**
   - Risk: High
   - Priority: v76

10. **Theme Submission Security Model Implementation Plan**
    - Purpose: Create implementation plan for theme submission security model
    - Classification: **docs-first**
    - Risk: High
    - Priority: v77

## Dedicated Session Requirements

The following systems require dedicated sessions (cannot be sprinkled into nearby quests):

1. **QA Bundle Validator Script (v70)**: Requires focused session to design validation logic and edge cases
2. **Contract-to-Code Trace Matrix (v71)**: Requires focused session to map contract requirements to code/test locations
3. **Source Adapter OS Reconnect (v74)**: Requires focused session to define reconnection contracts and error handling
4. **Theme Workshop Security Hardening (v77)**: Requires focused session to design security architecture

## Sprinkle-In Opportunities

The following systems can be sprinkled into nearby quests:

1. **Data-Driven Control Panel Section Registry (v72)**: Can be sprinkled into Registry Explorer quest
2. **Registry Explorer / Searchable System Index (v72)**: Can be implementation-first quest
3. **Human Mode vs Evidence Mode (v73)**: Can be docs-first quest, then sprinkle into navigation improvements
4. **Synthetic Data Fixtures (v75)**: Can be implementation-first quest, then sprinkle into test suites
5. **Verified Download Button Boundary (v76)**: Can be docs-first quest, then sprinkle into download UI
6. **Theme Submission Security Model (v77)**: Can be docs-first quest, then sprinkle into theme workshop

## Proposed v68–v80 Roadmap

### v68: Graph Control Plane Navigation Contract
- **Type**: Contract (docs-only)
- **Purpose**: Define UX/navigation contract for Graph Visual Inventory
- **Key Features**: Sticky summary, collapsible evidence sections, compact summary cards, Music Reactive Mapping grouping
- **Implementation**: v69 (if user authorizes)

### v69: Collapsible Evidence Sections / Summary Cards
- **Type**: Implementation
- **Purpose**: Implement navigation contract from v68
- **Key Features**: Collapsible sections, compact cards, sticky TOC
- **Dependency**: v68 contract

### v70: QA Bundle Validator Script
- **Type**: Implementation
- **Purpose**: Validate QA lockstep bundle before commit
- **Key Features**: Pre-commit hook, bundle validation, mismatch detection
- **Classification**: Dedicated session

### v71: Contract-to-Code Trace Matrix
- **Type**: Docs + Implementation
- **Purpose**: Create traceability matrix for contract requirements
- **Key Features**: Requirement → Code → Test mapping, automated trace report
- **Classification**: Dedicated session

### v72: Registry Explorer v0
- **Type**: Implementation
- **Purpose**: Unified search interface for all registries
- **Key Features**: Search, filter, cross-registry queries, data-driven section registry
- **Classification**: Implementation-first

### v73: Human Mode vs Evidence Mode
- **Type**: Docs + Implementation
- **Purpose**: Define two control panel modes
- **Key Features**: Human Mode (compact), Evidence Mode (detailed), mode switch
- **Classification**: Docs-first

### v74: Source Adapter OS Reconnect Contract
- **Type**: Contract (docs-only)
- **Purpose**: Define reconnection contract after OS sleep/disconnect
- **Key Features**: Reconnection policy, error handling, user notification
- **Classification**: Dedicated session

### v75: Synthetic Data Fixtures v0
- **Type**: Implementation
- **Purpose**: Promote synthetic data to first-class toolset
- **Key Features**: Graph fixtures, audio fixtures, theme fixtures, test helpers
- **Classification**: Implementation-first

### v76: Verified Download Button Boundary Contract
- **Type**: Contract (docs-only)
- **Purpose**: Define download button security contract
- **Key Features**: Verified sources, hash validation, sandbox
- **Classification**: Docs-first

### v77: Theme Submission Security Model Implementation Plan
- **Type**: Docs
- **Purpose**: Create implementation plan for theme security
- **Key Features**: Sandboxing, validation, audit trail, security hardening path
- **Classification**: Docs-first, Dedicated session

### v78–v80: Buffer for Emergent Work
- **Type**: Reserved
- **Purpose**: Buffer for emergent work, re-prioritization, or recovery cycles

## Stop Conditions

Stop immediately if any of the following occur:

1. **Contract Violation**: Any implementation violates accepted contract (v59–v66)
2. **Safety Boundary Breach**: Any implementation breaches Motion Safety, Epilepsy Guard, or Audio Source System boundaries
3. **Graph/Sigma Mutation**: Any implementation mutates graph/Sigma renderer without governance approval
4. **Audio Input/Playback**: Any implementation adds microphone, file upload, audio playback, or Web Audio input without governance approval
5. **Command Execution**: Any implementation adds runtime command execution without governance approval
6. **Test Skip**: Any implementation adds `test.skip` or weakens historical contract tests
7. **Evidence Removal**: Any implementation removes or weakens evidence content in control panel
8. **Data Loss**: Any implementation risks data loss or corrupts user data

## Acceptance Criteria

v67 Roadmap Realignment is accepted when:

1. **Document Exists**: `docs/roadmap/LATTICA_ROADMAP_REALIGNMENT_V67.md` exists with all required sections
2. **System Layers Documented**: External foundations and Lattica-owned layers are clearly distinguished
3. **Completed Spine Documented**: Safety/audio spine (v59–v66) is documented as complete and stable
4. **Ten Improvement Tracks Scheduled**: All ten improvement tracks are classified with priority and session type
5. **Dedicated Sessions Identified**: Systems requiring dedicated sessions are clearly marked
6. **Sprinkle-In Opportunities Identified**: Systems that can be sprinkled are clearly marked
7. **v68–v80 Roadmap Proposed**: Roadmap from v68 to v80 is proposed with clear dependencies
8. **Stop Conditions Defined**: Stop conditions are clearly defined with breach criteria
9. **No Implementation**: No runtime code is added, no graph/Sigma mutation, no audio input/playback
10. **No Test Skips**: No `test.skip` is added, no historical tests are weakened

v67 is docs-only. Implementation is deferred to v68+ based on user authorization.
