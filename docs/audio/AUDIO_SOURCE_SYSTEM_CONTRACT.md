# Audio Source System Contract

## Status

**Version**: v65
**Status**: Contract
**Active**: Yes
**Maturity**: Contract-only, no runtime implementation
**Dependencies**: Audio Reactivity Contract (v61), Synthetic Audio Signal (v62), Music Reactive Mapping Contract (v63), Motion Safety / Epilepsy Guard (v59/v60)

## Purpose

Define the audio source architecture for Lattica's music-reactive graph system. This contract establishes the source types, permission boundaries, privacy models, and security constraints for audio input without requesting permissions, decoding files, playing sound, or producing reactive visuals in v65/v66.

The Audio Source System provides:
- A typed registry of audio source types
- Permission and privacy boundaries for each source
- Relationship to Synthetic Audio Signal model
- Relationship to Music Reactive Mapping
- Motion Safety integration
- Future promotion path for real audio input

## Definitions

**Audio Source**: A provider of audio signal data to the music-reactive graph system. Sources may be synthetic (deterministic models) or real (user-provided or system audio).

**Synthetic Source**: A deterministic, static audio signal model defined in code (e.g., SYNTHETIC_SIGNALS). No microphone, file upload, or Web Audio API required.

**Local File Source**: Audio data from a user-selected file on the local filesystem. Requires file upload and may involve metadata extraction or full signal decoding.

**Microphone Source**: Real-time audio input from the user's microphone via browser Web Audio API. Requires explicit browser permission.

**System Audio Source**: Audio output from the operating system or other applications. Requires OS/browser-dependent permissions and privacy considerations.

**Streaming Source**: Remote audio data received over the network. Requires network permissions and may involve tracking or privacy risks.

**External Adapter Source**: Audio data provided by a third-party adapter or plugin. Permission and privacy models are adapter-defined.

**Permission Model**: The set of user/browser/OS permissions required for a source type to function.

**Privacy Model**: The privacy risks associated with a source type, including data exposure, tracking, and local content access.

**Security Model**: The security constraints and attack vectors for a source type, including file validation, sandboxing, and input sanitization.

## Non-Goals

**v65/v66 Non-Goals**:
- No microphone permission requests
- No file upload UI or file picker
- No audio file decoding
- No audio playback
- No Web Audio API input
- No graph/Sigma mutation
- No visual reactivity or animation
- No real-time audio processing
- No audio visualization
- No streaming audio playback

**Deferred to v67+**:
- Real audio input (microphone, local file, system audio, streaming)
- Audio file decoding and signal extraction
- Audio playback
- Visual reactivity based on real audio
- Permission request UI
- File picker UI
- Audio visualization components

## Audio Source Model

### AudioSource Interface

```typescript
interface AudioSource {
  id: string;
  type: AudioSourceType;
  status: AudioSourceStatus;
  permission: AudioSourcePermission;
  privacyRisk: PrivacyRisk;
  playback: PlaybackStatus;
  decoding: DecodingStatus;
  visualOutput: VisualOutputStatus;
  motionSafetyEffectId?: string;
  safetyNotes?: string;
}

type AudioSourceType =
  | "synthetic"
  | "local-file-metadata"
  | "local-file-decoded-signal"
  | "microphone"
  | "system-audio"
  | "streaming-source"
  | "external-adapter";

type AudioSourceStatus =
  | "active-passive"
  | "active-reactive"
  | "future"
  | "locked"
  | "deferred"
  | "forbidden";

type AudioSourcePermission =
  | "none"
  | "user-selected-file"
  | "explicit-browser-permission"
  | "os-browser-dependent"
  | "network"
  | "adapter-defined";

type PrivacyRisk =
  | "none"
  | "low"
  | "moderate"
  | "high";

type PlaybackStatus =
  | "forbidden"
  | "not-required"
  | "future"
  | "locked-until-contracted";

type DecodingStatus =
  | "not-required"
  | "forbidden-in-v66"
  | "forbidden"
  | "future"
  | "deferred";

type VisualOutputStatus =
  | "deferred"
  | "forbidden"
  | "future";
```

### Source Status Semantics

- **active-passive**: Source is available in current version, but only for passive/read-only inspection (no reactivity)
- **active-reactive**: Source is available and may drive reactive visuals (deferred to v67+)
- **future**: Source is planned but not yet implemented
- **locked**: Source is blocked by safety/security governance and requires explicit approval
- **deferred**: Source is postponed pending architecture decisions
- **forbidden**: Source is prohibited by policy (e.g., system audio)

## Source Types

### 1. Synthetic Source

- **Type**: `synthetic`
- **Status**: `active-passive` (v65/v66)
- **Permission**: `none`
- **Privacy Risk**: `none`
- **Playback**: `not-required`
- **Decoding**: `not-required`
- **Visual Output**: `deferred`
- **Description**: Deterministic, static audio signal models defined in code (SYNTHETIC_SIGNALS). No microphone, file upload, or Web Audio API required.
- **Motion Safety Relationship**: Synthetic signals are safe by design - no user data, no privacy risk, no motion safety concerns.
- **Implementation**: Already exists in v62 (syntheticAudioSignal.ts)

### 2. Local File Metadata Source

- **Type**: `local-file-metadata`
- **Status**: `future` (v67+)
- **Permission**: `user-selected-file`
- **Privacy Risk**: `low` (local file name/metadata only)
- **Playback**: `forbidden in v66`
- **Decoding**: `forbidden in v66`
- **Visual Output**: `deferred`
- **Description**: User-selected audio file for metadata extraction only (duration, format, sample rate). No signal decoding, no playback.
- **Motion Safety Relationship**: Low risk - metadata only, no signal content exposed to graph.
- **Implementation**: Deferred to v67+ after file picker UI and metadata extraction contract.

### 3. Local File Decoded Signal Source

- **Type**: `local-file-decoded-signal`
- **Status**: `locked`
- **Permission**: `user-selected-file`
- **Privacy Risk**: `moderate` (local file content)
- **Playback**: `forbidden until contracted`
- **Decoding**: `future`
- **Visual Output**: `deferred`
- **Description**: User-selected audio file with full signal decoding for music-reactive mapping. Requires file validation, decoding, and safety gate.
- **Motion Safety Relationship**: Moderate risk - file content exposed to graph, requires Motion Safety gate enforcement.
- **Implementation**: Locked until safety gate and governance approval (v67+).

### 4. Microphone Input Source

- **Type**: `microphone`
- **Status**: `locked`
- **Permission**: `explicit-browser-permission`
- **Privacy Risk**: `high` (real-time audio capture)
- **Playback**: `forbidden`
- **Decoding**: `future`
- **Visual Output**: `deferred`
- **Description**: Real-time audio input from user microphone via Web Audio API. Requires explicit browser permission, explicit opt-in, and safety gate.
- **Motion Safety Relationship**: High risk - real-time audio capture, requires Motion Safety gate, epilepsy risk assessment, and explicit user consent.
- **Implementation**: Locked until safety gate, governance approval, and advisory approval (v67+).

### 5. System Audio Source

- **Type**: `system-audio`
- **Status**: `deferred` / `forbidden`
- **Permission**: `os-browser-dependent`
- **Privacy Risk**: `high` (system-wide audio capture)
- **Playback**: `forbidden`
- **Decoding**: `deferred`
- **Visual Output**: `deferred`
- **Description**: Audio output from operating system or other applications. Requires OS/browser-dependent permissions and has high privacy risk.
- **Motion Safety Relationship**: High risk - system audio capture, requires strong governance and likely forbidden.
- **Implementation**: Deferred/forbidden pending architecture and governance review.

### 6. Streaming Source

- **Type**: `streaming-source`
- **Status**: `deferred` / `forbidden`
- **Permission**: `network`
- **Privacy Risk**: `moderate` (remote tracking potential)
- **Playback**: `forbidden`
- **Decoding**: `deferred`
- **Visual Output**: `deferred`
- **Description**: Remote audio data received over network (e.g., streaming services, radio). Requires network permissions and may involve tracking.
- **Motion Safety Relationship**: Moderate risk - remote audio, requires governance and tracking policy.
- **Implementation**: Deferred/forbidden pending architecture and governance review.

### 7. External Adapter Source

- **Type**: `external-adapter`
- **Status**: `future`
- **Permission**: `adapter-defined`
- **Privacy Risk**: `adapter-defined`
- **Playback**: `forbidden`
- **Decoding**: `deferred`
- **Visual Output**: `deferred`
- **Description**: Audio data provided by third-party adapter or plugin. Permission and privacy models are adapter-defined.
- **Motion Safety Relationship**: Risk depends on adapter implementation, requires adapter contract and governance.
- **Implementation**: Future after adapter contract and governance framework.

## Synthetic Source Relationship

The Synthetic Source is the foundation of the Audio Source System. It provides:
- Deterministic, static audio signal models (SYNTHETIC_SIGNALS)
- No permission requirements (no microphone, no file upload)
- No privacy risk (no user data)
- Safe for passive inspection and testing
- Reference implementation for future source types

In v65/v66, only the Synthetic Source is active. All other source types are future/locked/deferred.

## Local File Source Boundary

### Local File Metadata Source (Future)
- **Boundary**: File picker UI + metadata extraction only
- **No Decoding**: Signal content is not decoded
- **No Playback**: Audio is not played
- **Privacy**: Only file name and metadata are exposed
- **Motion Safety**: Low risk - no signal content exposed to graph
- **Preconditions**: File picker UI contract, metadata extraction contract

### Local File Decoded Signal Source (Locked)
- **Boundary**: Full file validation + decoding + signal extraction
- **Decoding**: Full audio signal is decoded for music-reactive mapping
- **No Playback**: Audio is not played
- **Privacy**: File content is exposed to graph
- **Motion Safety**: Moderate risk - requires Motion Safety gate
- **Preconditions**: Safety gate, governance approval, advisory approval

## Microphone Source Boundary

- **Boundary**: Web Audio API microphone input + explicit opt-in
- **Permission**: Explicit browser permission required
- **Privacy**: High risk - real-time audio capture
- **Motion Safety**: High risk - requires Motion Safety gate, epilepsy risk assessment
- **Governance**: Locked until safety gate, governance approval, advisory approval
- **Preconditions**: Safety gate implementation, explicit opt-in UI, governance approval

## System Audio Boundary

- **Boundary**: OS/browser-dependent system audio capture
- **Permission**: OS/browser-dependent (often not available in web)
- **Privacy**: High risk - system-wide audio capture
- **Governance**: Deferred/forbidden pending architecture review
- **Preconditions**: Architecture review, governance approval (if ever allowed)

## Streaming Source Boundary

- **Boundary**: Network audio data reception
- **Permission**: Network access
- **Privacy**: Moderate risk - remote tracking potential
- **Governance**: Deferred/forbidden pending architecture review
- **Preconditions**: Architecture review, tracking policy, governance approval

## Permission Model

### Permission Levels

1. **None**: No permission required (synthetic source)
2. **User-Selected File**: User explicitly selects a file via file picker (local file sources)
3. **Explicit Browser Permission**: Browser permission dialog (microphone)
4. **OS/Browser-Dependent**: OS or browser-specific permission (system audio)
5. **Network**: Network access permission (streaming)
6. **Adapter-Defined**: Permission defined by external adapter (external adapter)

### Permission Request Policy (v67+)

- **No Automatic Requests**: Do not request permissions automatically on page load
- **Explicit User Action**: Permissions must be requested only after explicit user action (e.g., clicking "Enable Microphone")
- **Clear Purpose**: Permission request must clearly state the purpose and what data will be accessed
- **Revokeable**: Users must be able to revoke permissions at any time
- **Governance Approval**: Permission request UI must be approved by governance before implementation

## Privacy Model

### Privacy Risk Levels

1. **None**: No privacy risk (synthetic source)
2. **Low**: Minimal privacy risk (file name/metadata only)
3. **Moderate**: Moderate privacy risk (file content, remote tracking)
4. **High**: High privacy risk (real-time audio capture, system audio)

### Privacy Principles

- **Data Minimization**: Collect only the data necessary for the feature
- **Local-First**: Process audio data locally when possible (no cloud upload)
- **User Control**: Users must have control over what audio data is collected
- **Transparency**: Users must be informed about what audio data is collected and how it is used
- **Retention**: Audio data must not be persisted unless explicitly requested by user

## Security Model

### Security Constraints

- **File Validation**: Local file sources must validate file type, size, and content before decoding
- **Sandboxing**: Audio decoding must be sandboxed to prevent code execution
- **Input Sanitization**: All audio input must be sanitized to prevent injection attacks
- **Rate Limiting**: Microphone input must be rate-limited to prevent abuse
- **No Cloud Upload**: Audio data must not be uploaded to cloud services without explicit consent

### Security Boundaries

- **No Code Execution**: Audio decoding must not execute arbitrary code
- **No File System Access**: Audio sources must not access files outside user-selected files
- **No Network Exfiltration**: Audio data must not be exfiltrated to remote servers
- **No Persistent Storage**: Audio data must not be persisted without explicit consent

## Motion Safety Relationship

### Motion Safety Gate Enforcement

All audio sources (except synthetic) must pass through the Motion Safety Gate before driving reactive visuals:
- **Synthetic Source**: Safe by design - no gate required
- **Local File Metadata**: Low risk - gate optional but recommended
- **Local File Decoded Signal**: Moderate risk - gate required
- **Microphone**: High risk - gate required + epilepsy risk assessment
- **System Audio**: High risk - gate required (if ever allowed)
- **Streaming**: Moderate risk - gate required (if ever allowed)
- **External Adapter**: Risk depends on adapter - gate required

### Epilepsy Risk Assessment

Audio sources that drive reactive visuals must include epilepsy risk assessment:
- **Synthetic Source**: No risk - deterministic signals
- **Real Audio Sources**: Risk assessment required for strobe effects, rapid frequency changes, etc.

## Music Reactive Mapping Relationship

### Mapping Input

The Audio Source System provides the input signal for Music Reactive Mappings:
- **Synthetic Source**: Provides deterministic signal for testing and inspection
- **Real Audio Sources**: Provide user-provided or system audio for music-reactive effects (v67+)

### Mapping Contract

Music Reactive Mappings (v63) assume an audio channel input. The Audio Source System defines what sources can provide that channel:
- **v65/v66**: Only synthetic source is available
- **v67+**: Real audio sources become available after safety gate and governance approval

## Graph/Sigma Boundary

### No Graph/Sigma Mutation

The Audio Source System does not mutate the graph or Sigma renderer:
- **No Visual Effects**: Audio sources do not directly drive visual effects in v65/v66
- **No Graph Mutation**: Audio sources do not add/remove nodes or edges
- **No Sigma Configuration**: Audio sources do not change Sigma renderer settings

### Visual Output Deferred

Visual reactivity based on audio is deferred to v67+:
- **v65/v66**: Audio sources are passive/read-only only
- **v67+**: Visual reactivity may be enabled after safety gate and governance approval

## Playwright Evidence Requirements

### v65 Contract Evidence

- Contract file exists: docs/audio/AUDIO_SOURCE_SYSTEM_CONTRACT.md
- All required sections are present and complete
- Source types are clearly defined with status, permission, privacy risk
- Stop conditions are documented
- v66 preconditions are documented
- v67+ promotion path is documented

### v66 Implementation Evidence

- Registry file exists: src/audio/audioSourceRegistry.ts
- Registry exports getAllAudioSources() function
- Registry includes 7 seed entries (synthetic, local-file-metadata, local-file-decoded-signal, microphone, system-audio, streaming, external-adapter)
- Each entry has correct metadata (id, type, status, permission, privacyRisk, playback, decoding, visualOutput)
- UI section exists in GraphVisualInventoryPanel.tsx
- UI renders all 7 sources with correct metadata
- UI shows visual output status as deferred
- UI shows no microphone active
- UI shows no file input active
- UI shows no playback active
- UI shows no graph/Sigma mutation
- Playwright tests prove all 7 sources render
- Playwright tests prove passive/read-only nature

## v66 Preconditions

Before implementing v66 (Audio Source Registry), the following must be complete:

1. **v65 Contract Accepted**: AUDIO_SOURCE_SYSTEM_CONTRACT.md must be accepted by governance
2. **v64 Complete**: Passive Music Reactive Mapping Inventory must be complete and accepted
3. **Advisory Approval**: Advisory for v66 must be approved
4. **Test Plan**: Playwright test plan for Audio Source Registry must be documented
5. **UI Placement**: UI placement in GraphVisualInventoryPanel.tsx must be approved

## v67+ Promotion Path

### v67: Local Audio File Metadata Preview

After v66 is accepted, v67 may implement:
- File picker UI for local audio file selection
- Metadata extraction (duration, format, sample rate, channels)
- Passive display of file metadata
- No signal decoding, no playback
- Motion Safety: Low risk - metadata only

### v68: Local Audio File Decoded Signal

After v67 is accepted, v68 may implement:
- Full audio file decoding (Web Audio API decodeAudioData)
- Signal extraction for music-reactive mapping
- Safety gate enforcement
- Motion Safety gate required
- Governance approval required
- Advisory approval required

### v69: Microphone Input (Safety-Gated)

After v68 is accepted, v69 may implement:
- Web Audio API microphone input
- Explicit browser permission request
- Explicit opt-in UI
- Safety gate enforcement
- Epilepsy risk assessment
- Governance approval required
- Advisory approval required

### v70+: System Audio / Streaming / External Adapter

After v69 is accepted, v70+ may consider:
- System audio capture (if architecture permits)
- Streaming audio (if governance permits)
- External adapter support (if adapter contract exists)
- Strong governance required
- Strong privacy model required

## Stop Conditions

The following conditions must stop v65/v66 work:

1. **Motion Safety Gate Not Ready**: If Motion Safety gate is not implemented or tested, stop v66 implementation
2. **Governance Rejection**: If governance rejects the v65 contract, stop all work
3. **Advisory Rejection**: If advisory rejects v66 implementation, stop implementation
4. **Test Failures**: If Playwright tests fail for v64 or v66, stop and fix
5. **Security Concerns**: If security review identifies unmitigated risks, stop and address
6. **Privacy Concerns**: If privacy review identifies unacceptable risks, stop and address
7. **Graph/Sigma Mutation**: If implementation attempts to mutate graph/Sigma, stop immediately
8. **Visual Reactivity**: If implementation attempts to add visual reactivity in v66, stop immediately
9. **Microphone Permission**: If implementation requests microphone permission in v66, stop immediately
10. **File Upload**: If implementation adds file upload UI in v66, stop immediately
11. **Audio Playback**: If implementation adds audio playback in v66, stop immediately
12. **Web Audio Input**: If implementation uses Web Audio API for input in v66, stop immediately

## Acceptance Criteria

### v65 Contract Acceptance

1. Contract file exists and is complete
2. All 22 required sections are present
3. Source types are clearly defined
4. Permission model is clearly defined
5. Privacy model is clearly defined
6. Security model is clearly defined
7. Motion Safety relationship is documented
8. Music Reactive Mapping relationship is documented
9. Graph/Sigma boundary is documented
10. Stop conditions are documented
11. v66 preconditions are documented
12. v67+ promotion path is documented
13. Governance approval obtained
14. Advisory approval obtained

### v66 Implementation Acceptance

1. Registry file exists with 7 seed entries
2. Registry exports getAllAudioSources() function
3. UI section exists in GraphVisualInventoryPanel.tsx
4. UI renders all 7 sources with correct metadata
5. UI shows visual output status as deferred
6. UI shows no microphone active
7. UI shows no file input active
8. UI shows no playback active
9. UI shows no graph/Sigma mutation
10. Playwright tests pass for all 7 sources
11. Playwright tests prove passive/read-only nature
12. No microphone permission requested
13. No file upload UI
14. No audio playback
15. No Web Audio input
16. No visual reactivity
17. No graph/Sigma mutation
18. Governance approval obtained
19. Advisory approval obtained
