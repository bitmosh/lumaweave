# Audio Reactivity Contract

## Status

v61 planning contract. Docs-only governance before Synthetic Audio Signal Preview implementation.

## Purpose

Define the Audio Reactivity system that converts audio-derived signals into normalized, safety-gated visual intent. This contract establishes the architecture, boundaries, and safety relationships for future music-reactive graph features.

This contract establishes:
- What constitutes Audio Reactivity
- The Audio Signal Model
- Synthetic Signal Source Model
- Real Audio Source Boundary
- Normalization Boundary
- Motion Safety Relationship
- Reduced Motion Relationship
- Epilepsy Risk Relationship
- Graph Visual Relationship
- Theme Relationship
- Accessibility Requirements
- Playwright Evidence Requirements
- v62 preconditions
- v63+ promotion path
- Stop conditions
- Acceptance criteria

This contract does not implement runtime behavior. It defines the rules for v62 implementation (Synthetic Audio Signal Preview).

## Definitions

### Audio Reactivity

A system that converts audio-derived signals into normalized, safety-gated visual intent. Audio reactivity does not execute visual effects directly. It produces normalized signal values that can be consumed by future visual systems, subject to Motion Safety gating.

### Synthetic Audio Signal

A deterministic fake signal used for development and Playwright testing without microphone access, audio files, or real sound. Synthetic signals provide predictable, repeatable values for rms, bass, mid, treble, beat, silence, and tempo channels.

### Audio Signal Channels

- **rms**: Root mean square amplitude (0 to 1)
- **bass**: Low-frequency energy (0 to 1)
- **mid**: Mid-frequency energy (0 to 1)
- **treble**: High-frequency energy (0 to 1)
- **beat**: Beat detection confidence (0 to 1)
- **silence**: Silence detection confidence (0 to 1)
- **tempo**: Tempo in BPM (60 to 200)

### Normalized Signal

A clamped, deterministic value in a known range, usually 0 to 1, used for preview/evidence only until visual reactivity is promoted. Normalization ensures signal values are predictable and bounded.

## Non-Goals

This contract does not:
- Implement real audio input (microphone, Web Audio API, audio files)
- Implement audio playback
- Implement music-reactive visual effects
- Implement graph/Sigma reactive styling
- Implement node/edge/canvas reactivity
- Implement camera motion
- Implement strobe/flash/flicker effects
- Implement persistent audio settings

## Audio Reactivity Model

The Audio Reactivity system follows this architecture:

```
Audio / signal source
→ normalized audio signal model
→ audio-reactive mapping registry
→ motion safety gate
→ visual target adapter
→ visual behavior
```

For v61/v62, only the first two pieces may exist:
- Contract (v61)
- Synthetic signal preview (v62)

No visual target adapter exists yet.
No reactive graph behavior exists yet.

### Signal Flow

1. **Signal Source**: Synthetic (v62) or real (future, requires separate contract)
2. **Normalization**: Convert raw audio to normalized channels (rms, bass, mid, treble, beat, silence, tempo)
3. **Mapping Registry**: Map normalized channels to visual parameters (future)
4. **Motion Safety Gate**: Check risk classification, epilepsy risk, reduce-motion preference (future)
5. **Visual Target Adapter**: Apply gated parameters to graph/Sigma (future)
6. **Visual Behavior**: Execute animations, styling, reactivity (future)

## Audio Signal Model

### Signal Channel Types

```typescript
interface AudioSignal {
  rms: number;        // 0 to 1
  bass: number;       // 0 to 1
  mid: number;        // 0 to 1
  treble: number;     // 0 to 1
  beat: number;       // 0 to 1
  silence: number;    // 0 to 1
  tempo: number;      // 60 to 200
}
```

### Signal Properties

- **Deterministic**: Same input produces same output
- **Normalized**: All values in known ranges
- **Clamped**: Values cannot exceed defined bounds
- **Bounded**: Safe for Playwright testing and UI display

## Synthetic Signal Source Model

### Synthetic Signal Definition

A synthetic signal is a manually defined, deterministic fixture that mimics audio analysis output without actual audio processing.

### Synthetic Signal Schema

```typescript
interface SyntheticAudioSignal {
  id: string;
  title: string;
  description: string;
  channels: AudioSignal;
  deterministic: true;
  source: "synthetic";
  visualOutputStatus: "deferred";
  motionSafetyStatus: "required-before-visual-output";
}
```

### Synthetic Signal Presets

v62 will seed these presets:
- **silence**: All channels at 0, tempo at 60
- **lantern-pulse-demo**: Low rms, moderate bass, slow tempo
- **plasma-loom-demo**: Moderate rms, balanced bass/mid/treble, medium tempo
- **constellation-demo**: High rms, strong bass, fast tempo

All values must be static/deterministic.

## Real Audio Source Boundary

### Forbidden Until Explicitly Promoted

The following are forbidden until a separate contract permits them:
- Microphone permission requests
- Web Audio API usage
- Audio file input (upload, drag-drop)
- Audio file analysis
- Audio playback
- Real-time audio processing
- Beat detection algorithms
- Frequency analysis algorithms

### Real Audio Contract Requirements

A future contract for real audio must define:
- Permission model for microphone access
- Privacy policy for audio data
- User consent flow
- Audio file handling policy
- Playback controls and muting
- Error handling for denied permissions

## Normalization Boundary

### Normalization Requirements

All audio signals must be normalized before use:
- Clamp values to defined ranges
- Handle edge cases (silence, clipping)
- Provide fallback values when analysis fails
- Ensure deterministic output for synthetic signals

### Normalization Policy

- Synthetic signals: Use pre-defined deterministic values
- Real signals (future): Normalize to 0-1 range, handle silence gracefully
- Tempo: Clamp to 60-200 BPM range
- All channels: Provide minimum 0, maximum 1 bounds

## Motion Safety Relationship

### Hard Safety Rule

No music-reactive visual feature may ship unless it is registered with Motion Safety.

### Registration Requirement

All audio-reactive visual effects must:
- Be classified in the Motion Safety Registry (src/accessibility/motionSafetyRegistry.ts)
- Have risk classification (safe/low/moderate/high)
- Have reduced-motion behavior (allow/soften/disable)
- Have epilepsy risk classification (none/possible/high)
- Require explicit opt-in for moderate/high-risk effects

### Motion Safety Gate

Before any visual output is executed:
1. Check effect's Motion Safety classification
2. Check user's reduce-motion preference
3. Check effect's epilepsy risk
4. Apply gate decision:
   - If reduce-motion enabled and behavior is disable: block effect
   - If reduce-motion enabled and behavior is soften: apply softened version
   - If epilepsy risk is high and no explicit opt-in: block effect
   - Otherwise: allow effect

### Reference

See docs/accessibility/MOTION_SAFETY_AND_EPILEPSY_GUARD_CONTRACT.md for full Motion Safety policy.

## Reduced Motion Relationship

### Master Safety Authority

Reduce motion is the master safety authority that overrides visual reactivity and animation systems.

### Reduced Motion Behavior

When reduce motion is enabled:
- All moderate/high-risk effects must be disabled
- All low-risk effects must be softened
- Safe effects may be allowed

### Softening Definition

Softening means:
- Disable animation while keeping static state
- Remove transitions and motion
- Preserve static visual indicators
- No strobe, flash, or flicker

## Epilepsy Risk Relationship

### Epilepsy Risk Classification

All audio-reactive visual effects must have epilepsy risk classification:
- **none**: No strobe, flash, or high-frequency motion
- **possible**: Mild motion, may affect sensitive users
- **high**: Strobe, flash, or rapid motion that may trigger seizures

### Epilepsy Risk Mitigation

For effects with epilepsy risk:
- **possible risk**: Soften under reduce motion, consider explicit opt-in
- **high risk**: Require explicit user opt-in, disable by default, block under reduce motion

### Forbidden Categories

The following are forbidden regardless of opt-in:
- Strobe effects (rapid on/off flashing)
- Rapid flashing (>3 Hz)
- Camera shake
- High-frequency motion that may trigger seizures

## Graph Visual Relationship

### Current Relationship

Audio reactivity does not directly mutate graph/Sigma in v61/v62.

### Future Relationship

When visual reactivity is promoted:
- Audio-reactive mapping registry will map normalized channels to graph parameters
- Graph/Sigma reactivity requires separate contract
- Node/edge/canvas styling requires separate contract
- All graph mutations must respect Motion Safety

### Forbidden Until Explicitly Promoted

- Direct graph/Sigma mutation from audio signals
- Node/edge styling changes from audio signals
- Canvas rendering changes from audio signals
- Physics/layout changes from audio signals

## Theme Relationship

### Current Relationship

Audio reactivity does not mutate theme presets or CSS variables in v61/v62.

### Future Relationship

When visual reactivity is promoted:
- Audio-reactive mapping may influence theme token values
- CSS variable writes require separate contract
- Theme preset mutation requires separate contract

### Forbidden Until Explicitly Promoted

- CSS variable writes from audio signals
- Theme preset mutation from audio signals
- Direct theme token value application from audio signals

## Accessibility Requirements

### Screen Reader Support

Audio reactivity UI must:
- Use semantic HTML
- Provide ARIA labels for all controls
- Announce state changes
- Support keyboard navigation

### Visual Accessibility

Audio reactivity visual features must:
- Respect reduce-motion preference
- Avoid strobe/flash/flicker
- Provide sufficient contrast
- Support high-contrast themes

### Audio Accessibility

If real audio is ever added:
- Provide visual indicators for audio activity
- Support captions or alternative indicators
- Provide mute/unmute controls
- Respect system audio preferences

## Playwright Evidence Requirements

### v62 Evidence Requirements

Playwright tests for v62 must prove:
- Synthetic signal preview is visible
- Synthetic presets are listed
- Signal channels are visible
- Signal values are deterministic/read-only
- Visual output is deferred
- Motion Safety is required before visual output
- No microphone/audio/playback controls exist
- No animation/graph mutation controls exist
- Existing Motion Safety registry still works
- No skipped tests

### Test ID Requirements

Use stable data-testid values:
- `audio-reactivity-preview-section`
- `audio-signal-preset-row`
- `audio-signal-channel`
- `audio-signal-value`
- `audio-visual-output-status`
- `audio-motion-safety-status`

### No DevTools Acceptance

All acceptance criteria must be verified via Playwright assertions, not manual DevTools inspection.

## v62 Preconditions

v62 (Synthetic Audio Signal Preview) may only proceed if:

1. **v61 contract is clean, committed, and accepted**
2. **Post-commit git status is clean**
3. **Typecheck passes with zero errors**
4. **Playwright passes with zero failures and zero skips**
5. **v62 remains synthetic/read-only/passive**
6. **No real audio, animation, or visual reaction is required**
7. **No microphone, Web Audio API, or audio file input is required**
8. **No graph/Sigma mutation is required**
9. **No node/edge/canvas styling is required**

If any precondition fails, v62 must not proceed.

## v63+ Promotion Path

### v63: Music Reactive Mapping Contract (future)

If v62 is clean and accepted, v63 may define:
- Audio-reactive mapping registry
- Mapping from normalized channels to visual parameters
- Visual target adapter architecture
- Graph/Sigma reactivity boundaries
- Node/edge/canvas styling boundaries

### v64+: Real Audio Input (future, requires separate contract)

Real audio input requires a separate contract that defines:
- Microphone permission model
- Web Audio API usage policy
- Audio file handling policy
- Privacy and consent requirements
- Error handling for denied permissions

### v65+: Visual Reactivity (future, requires Motion Safety gate)

Visual reactivity may only proceed if:
- Motion Safety gate is implemented
- All effects are registered in Motion Safety Registry
- Reduce motion behavior is defined
- Epilepsy risk is classified
- Explicit opt-in exists for high-risk effects

## Stop Conditions

### Immediate Stop

Stop immediately if any of the following are attempted:
- Microphone permission request
- Web Audio API usage
- Audio file input (upload, drag-drop)
- Audio playback
- Real-time audio processing
- Animation execution
- Graph/Sigma mutation
- Node/edge/canvas styling
- CSS variable writes
- Theme preset mutation
- Storage/persistence of audio data
- Hotkeys/listeners for audio
- Command execution for audio

### Stop at Checkpoint

Stop at v61 checkpoint if:
- v61 validation fails
- Typecheck fails
- Playwright fails
- Skipped tests appear
- Post-commit git status is dirty

Stop at v62 checkpoint if:
- v62 requires real audio
- v62 requires animation
- v62 requires visual output
- v62 violates Motion Safety requirements
- v62 validation fails

## Acceptance Criteria

### v61 Acceptance Criteria

v61 (Audio Reactivity Contract) is accepted when:

1. **Contract document exists** at `docs/audio/AUDIO_REACTIVITY_CONTRACT.md`
2. **All 20 required sections are present**
3. **Motion Safety relationship is clearly defined**
4. **Synthetic-before-real policy is stated**
5. **Signal preview-before-visual policy is stated**
6. **Forbidden categories are clearly listed**
7. **v62 preconditions are defined**
8. **v63+ promotion path is defined**
9. **Stop conditions are defined**
10. **BACKLOG_POLICY.md is updated** to mark v60 completed and v61 current
11. **QA registry is updated** with v61 checks
12. **Advisory registry is updated** if required
13. **Typecheck passes** with zero errors
14. **Playwright passes** with zero failures and zero skips
15. **Post-commit git status is clean**

### v62 Acceptance Criteria

v62 (Synthetic Audio Signal Preview) is accepted when:

1. **v61 preconditions are met** (v61 clean, committed, accepted)
2. **Synthetic signal model exists** at `src/audio/syntheticAudioSignal.ts`
3. **Synthetic presets are seeded** (silence, lantern-pulse-demo, plasma-loom-demo, constellation-demo)
4. **All values are deterministic/static**
5. **Passive UI is added** to GraphVisualInventoryPanel.tsx
6. **UI shows signal values as text/evidence only**
7. **UI shows visual output deferred**
8. **UI shows Motion Safety required before visual output**
9. **Playwright tests prove passive nature**
10. **Playwright tests prove no real audio controls**
11. **Playwright tests prove no animation/graph mutation**
12. **Playwright tests prove Motion Safety registry still works**
13. **BACKLOG_POLICY.md is updated** to mark v61 completed and v62 current
14. **QA registry is updated** with v62 checks
15. **Advisory registry is updated** if required
16. **Typecheck passes** with zero errors
17. **Playwright passes** with zero failures and zero skips
18. **Post-commit git status is clean**
