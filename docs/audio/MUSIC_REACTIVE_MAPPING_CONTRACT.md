# Music Reactive Mapping Contract

## Status

Draft - v63

## Purpose

This contract defines how synthetic audio signal channels may map to future graph visual targets through the Motion Safety gate. It establishes the relationship between audio signal channels and potential visual behaviors, classifies mapping risks, and defines strict boundaries for music-reactive features.

This is a mapping contract only. In v63/v64, it does not execute visual effects.

## Definitions

### Music Reactive Mapping

A passive relationship between normalized audio signal channels and future graph visual targets. In v63/v64, it does not execute visual effects. It defines which audio channels could theoretically drive which visual behaviors, subject to Motion Safety classification.

### Audio Signal Channels

Normalized synthetic audio signal channels from the v62 Synthetic Audio Signal Preview:
- **rms**: Root mean square amplitude (overall energy)
- **bass**: Low-frequency energy
- **mid**: Mid-frequency energy
- **treble**: High-frequency energy
- **beat**: Detected beat events
- **silence**: Audio absence detection
- **tempo**: Detected tempo in BPM

### Future Graph Visual Targets

Potential graph visual targets that could be driven by audio channels in future implementations:
- **graph.shell.glow**: Shell border glow intensity
- **graph.shell.pulse**: Shell pulse animation
- **graph.frame.border**: Frame border styling
- **graph.node.halo**: Node halo/glow effects
- **graph.edge.current**: Edge current/flow visualization
- **graph.cluster.aura**: Cluster aura effects
- **graph.label.glow**: Label glow effects
- **graph.overlay.particles**: Particle overlay effects
- **graph.camera.breathing**: Camera breathing motion

### Mapping Risk

Risk classification inherited from Motion Safety and based on the visual behavior a mapping would eventually drive. Risk levels: safe, low, moderate, high.

## Non-Goals

This contract does NOT:
- Implement visual effects
- Implement animation
- Execute real-time audio processing
- Connect to microphone or Web Audio API
- Play audio
- Mutate graph/Sigma state
- Style nodes/edges/canvas
- Write CSS variables
- Provide user controls for reactive features

## Music Reactive Mapping Model

A mapping is a passive relationship: `{audioChannel} → {visualTarget}` with associated metadata:
- Motion Safety effect reference
- Risk classification
- Reduced motion behavior
- Epilepsy risk
- Status (proposed-passive, locked-until-safety-gate, future, forbidden)

Mappings are static/read-only in v64. They define potential relationships without executing them.

## Audio Signal Channel Model

Audio channels are synthetic and deterministic in v62/v63/v64:
- Values are computed from static signal definitions
- No real audio input is used
- No microphone or Web Audio API access
- Channels provide normalized values (0-1 range typical)
- Channel values are read-only for mapping inspection

## Graph Visual Target Model

Graph visual targets are future destinations for potential visual effects:
- Targets are named references to graph components
- Targets do not execute behavior in v63/v64
- Targets are classified by Motion Safety registry
- Targets may be enabled/disabled by reduce motion
- High-risk targets may remain forbidden

## Motion Safety Gate Relationship

Hard safety rule: No music-reactive visual feature may ship unless it is registered with Motion Safety.

Every mapping must reference a Motion Safety registry classification:
- Safe mappings: May proceed as static readouts or passive indicators
- Low-risk mappings: May proceed with reduce motion soften behavior
- Moderate-risk mappings: Must be disabled by reduce motion
- High-risk mappings: Must be locked until safety gate implementation or remain forbidden

Motion Safety Guard Registry (v59/v60) is the authority for effect classification.

## Reduced Motion Relationship

Reduce motion is the master safety switch for music-reactive mappings:
- Safe mappings: May remain active (static readouts)
- Low-risk mappings: Soften behavior
- Moderate-risk mappings: Disable completely
- High-risk mappings: Disable completely

If reduce motion is enabled:
- Moderate and high-risk mappings must not execute
- Safe and low-risk mappings may provide passive indicators only
- No animation, pulse, flash, or camera motion

## Epilepsy Risk Relationship

Epilepsy risk is inherited from Motion Safety registry:
- None: No epilepsy risk
- Possible: May trigger photosensitive responses in some users
- High: High risk of seizure for photosensitive users

Mappings with epilepsy risk "possible" or "high" must:
- Be disabled by reduce motion
- Require explicit opt-in before any execution
- Never execute without safety gate approval
- Remain forbidden until v65+ safety gate implementation

## Mapping Risk Classification

Mapping risk is determined by:
1. The visual behavior the target would eventually drive
2. The Motion Safety classification of that behavior
3. The epilepsy risk of that behavior

Risk levels:
- **Safe**: Static readouts, passive indicators, no animation
- **Low**: Slow glow, subtle color shifts, no rapid changes
- **Moderate**: Pulse, shimmer, breathing motion, beat-synced effects
- **High**: Flash, strobe, rapid camera motion, beat-synced flashing

## Synthetic Signal Relationship

In v63/v64, mappings use synthetic signals only:
- Signals are static/deterministic from v62 registry
- No real audio input is processed
- No microphone or Web Audio API access
- Signal values are computed from typed definitions
- Mappings inspect signal values without driving visual output

Synthetic-before-real policy: Synthetic signal preview must precede real audio input.

## Real Audio Source Boundary

Real audio sources are forbidden in v63/v64:
- No microphone access
- No Web Audio API
- No file input (audio files)
- No streaming audio
- No audio playback

Real audio input may be considered in v65+ only after:
- Safety gate implementation
- Explicit governance approval
- Advisory approval
- Motion Safety classification complete

## Visual Output Boundary

Visual output is forbidden in v63/v64:
- No animation
- No pulse
- No shimmer
- No flash
- No camera motion
- No graph/Sigma reactive styling
- No node/edge/canvas changes
- No CSS variable writes

Visual output may be considered in v65+ only after:
- Safety gate implementation
- Explicit governance approval
- Advisory approval
- Motion Safety classification complete

## Graph / Sigma Boundary

Graph/Sigma mutation is forbidden in v63/v64:
- No direct Sigma API calls
- No node/edge attribute mutation
- No camera manipulation
- No layout changes
- No style injection

Graph/Sigma reactivity may be considered in v65+ only after:
- Safety gate implementation
- Explicit governance approval
- Advisory approval
- Motion Safety classification complete

## Node / Edge / Canvas Boundary

Node/edge/canvas styling is forbidden in v63/v64:
- No node color/size/shape changes
- No edge width/color changes
- No canvas drawing
- No overlay rendering

Node/edge/canvas styling may be considered in v65+ only after:
- Safety gate implementation
- Explicit governance approval
- Advisory approval
- Motion Safety classification complete

## Accessibility Requirements

Music-reactive mappings must respect:
- Reduce motion preference (master safety switch)
- Epilepsy risk classification
- Motion Safety registry classifications
- Explicit opt-in for moderate/high-risk effects
- Passive indicator mode for safe/low-risk mappings

Users must be able to:
- Disable all music-reactive features via reduce motion
- See which mappings are active/inactive
- Understand risk classifications
- Opt-in to moderate/high-risk features explicitly

## Playwright Evidence Requirements

Playwright tests must prove:
- Mapping inventory is visible
- Mapping rows are listed
- Audio channels are visible
- Future graph targets are visible
- Motion Safety references are visible
- Risk classifications are visible
- Reduced motion behaviors are visible
- High-risk mappings are labeled as disabled/forbidden
- Visual output is deferred (no reactive visuals active)
- No audio input/playback controls exist
- No animation/graph mutation controls exist
- Existing synthetic signal preview still works
- Existing Motion Safety registry still works
- No skipped tests

## v64 Preconditions

v64 Passive Music Reactive Mapping Inventory requires:
- v63 Music Reactive Mapping Contract is complete and committed
- Contract defines all required sections
- Contract establishes Motion Safety gate relationship
- Contract defines mapping risk classification
- Contract establishes forbidden boundaries
- Typecheck passes
- Contract document exists at docs/audio/MUSIC_REACTIVE_MAPPING_CONTRACT.md

## v65+ Promotion Path

v65 Safety-Gated DOM-Only Reactive Evidence Mode may include:
- Safety gate implementation for runtime enforcement
- DOM-only reactive evidence (no graph/Sigma mutation)
- Real audio input processing (if approved)
- Limited visual reactivity in DOM elements only
- Explicit user opt-in for each reactive feature
- Advisory approval required before implementation

v66+ may consider:
- Passive music-reactive mode presets
- Graph/Sigma reactive styling (if approved)
- Node/edge/canvas reactivity (if approved)
- Full music-reactive visual system (if approved)

## Stop Conditions

Stop immediately if:
- Visual effects are implemented
- Animation is added
- Pulse/shimmer/flash is added
- Camera motion is added
- Graph/Sigma mutation is added
- Node/edge/canvas styling is added
- Microphone or Web Audio API is added
- Audio playback is added
- Real audio input is added
- CSS variable writes are added
- Active apply/enable/play controls are added
- Storage/persistence is added for reactive settings
- Hotkeys/listeners are added for reactive features
- Command execution is added for reactive features

## Acceptance Criteria

v63 Music Reactive Mapping Contract is accepted when:
- Contract document exists at docs/audio/MUSIC_REACTIVE_MAPPING_CONTRACT.md
- All required sections are complete
- Motion Safety gate relationship is clearly defined
- Mapping risk classification is clearly defined
- Forbidden boundaries are clearly stated
- v64 preconditions are clearly stated
- v65+ promotion path is clearly stated
- Stop conditions are clearly stated
- Typecheck passes
- Contract follows established pattern from v59/v60/v61
