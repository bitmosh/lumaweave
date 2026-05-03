# Motion Safety and Epilepsy Guard Contract

## Status

v59 planning contract. Docs-only governance before Reduced Motion Guard Registry implementation.

## Purpose

Define the Motion Safety system that classifies, gates, softens, or disables animation/reactive visual effects based on reduce motion and epilepsy-risk policy.

This contract establishes:
- What constitutes Motion Safety
- The epilepsy risk model
- Reduced motion authority
- Visual effect risk categories
- Safety gate model
- Music-reactive relationship
- Graph visual relationship
- Theme relationship
- Command Deck relationship
- Accessibility requirements
- Playwright evidence requirements
- v60 preconditions
- v61+ promotion path
- Stop conditions
- Acceptance criteria

This contract does not implement runtime behavior. It defines the rules for v60 implementation (Reduced Motion Guard Registry).

## Definitions

### Motion Safety

A policy layer that classifies visual effects and decides whether they are allowed, softened, or disabled based on reduce motion preference and epilepsy risk.

### Epilepsy Risk

The risk that a visual effect may contribute to unsafe flashing, strobing, rapid contrast change, or high-frequency motion that could trigger photosensitive epilepsy.

### Reduced Motion Authority

The rule that reduce-motion preference overrides visual reactivity and animation systems. When reduce motion is enabled, all moderate/high-risk effects must be disabled and low-risk effects must be softened.

### Motion Safety Gate

A future runtime policy gate that blocks or softens risky effects before they reach visual targets. The gate checks risk classification, epilepsy risk, and reduce-motion preference before allowing effect execution.

### Risk Categories

- **safe**: No motion risk, allowed under all conditions
- **low**: Minor motion risk, allowed by default, softened under reduce motion
- **moderate**: Significant motion risk, disabled by default, disabled under reduce motion
- **high**: Severe motion or epilepsy risk, forbidden or requires explicit opt-in

### Reduced Motion Behavior

- **allow**: Effect is permitted regardless of reduce motion setting
- **soften**: Effect is permitted but with reduced intensity or disabled animation under reduce motion
- **disable**: Effect is disabled when reduce motion is enabled

### Epilepsy Risk Levels

- **none**: No epilepsy risk
- **possible**: Could contribute to epilepsy risk in rare cases
- **high**: Known epilepsy risk (strobe, rapid flashing, beat-synced flicker)

## Non-Goals

This contract does not:
- Implement the Reduced Motion Guard Registry (that is v60)
- Add actual animation or audio input
- Add music-reactive visuals
- Add graph/Sigma mutation
- Add node/edge/canvas styling
- Write CSS variables
- Mutate theme presets or storage
- Add hotkeys/listeners
- Add command execution
- Implement runtime safety gate (that requires v61+)

## Motion Safety Model

The model follows a strict progression:

```
v59: Motion Safety / Epilepsy Guard Contract (docs-only)
  ↓
v60: Reduced Motion Guard Registry (static/read-only registry)
  ↓
v61: Audio Reactivity Contract (docs-only, if promoted)
  ↓
v62+: Runtime Safety Gate (if promoted)
```

### v59 Role

v59 is the contract definition pass that:
- Defines motion safety policy and epilepsy risk model
- Defines reduced motion authority
- Defines visual effect risk categories (safe/low/moderate/high)
- Defines safety gate model
- Defines relationship to music-reactive, graph visual, theme, and Command Deck systems
- Sets explicit forbidden categories (strobe, rapid flashing, camera shake, audio reactivity, graph/Sigma mutation)
- Sets v60 preconditions (static registry, passive UI, no animation, no audio)
- Sets v61+ promotion path (when actual audio/reactive features might be permitted)

### v60 Role

v60 is the implementation pass that:
- Implements static/read-only Motion Safety registry only
- Classifies future visual effects by risk, reduced-motion behavior, epilepsy risk
- Adds passive/read-only UI if safe
- Does not add actual animation
- Does not add audio input
- Does not add music reactivity
- Does not add graph/Sigma mutation
- Does not add active controls

## Epilepsy Risk Model

### Risk Assessment Criteria

Visual effects are assessed for epilepsy risk based on:

1. **Flashing frequency**: Effects that flash 3+ times per second
2. **Strobe patterns**: Regular on/off light patterns
3. **Rapid contrast changes**: Sudden brightness/contrast shifts
4. **Beat-synced flicker**: Effects synchronized with audio beats
5. **Full-screen pulse**: Screen-wide brightness/contrast oscillation
6. **Camera shake/motion**: Rapid camera movement

### Risk Classification

- **none**: Static readouts, slow transitions (2+ seconds), no flashing
- **possible**: Slow border glow (1+ second transitions), gradual color shifts
- **high**: Strobe, rapid flashing (< 1 second), beat-synced flicker, camera shake, full-screen pulse

### Forbidden Until Explicit Promotion

The following are forbidden until v61+ with explicit new contract:
- Strobe
- Rapid flashing (< 1 second)
- Beat-synced high-frequency flicker
- Camera shake
- Full-screen pulse
- Rapid contrast inversion
- Audio-reactive visual output
- Graph/Sigma reactive styling
- Music-reactive node/edge/canvas changes

## Reduced Motion Authority

### Core Rule

Reduce motion preference overrides all visual reactivity and animation systems.

### Required Behavior

When reduce motion is enabled:
- **Disable** all moderate/high-risk effects
- **Soften** all low-risk effects (disable animation, keep static state)
- **Allow** static readouts only
- **Never** pulse, flash, shimmer, shake, strobe, rapidly flicker, or camera-move by default

### Reduce Motion Signal

The reduce motion preference may be expressed as:
- System-level prefers-reduced-motion media query
- Theme token `motion.reduce` (planned path, not yet active)
- Explicit user toggle (if added in future)

### Enforcement

Any future runtime safety gate must:
1. Check reduce motion preference before allowing effect execution
2. Disable or soften effects based on risk classification
3. Never bypass reduce motion for "cool" effects
4. Provide fallback static state when effects are disabled

## Visual Effect Risk Categories

### Safe

**Definition**: No motion risk, allowed under all conditions.

**Examples**:
- Static signal readout
- Slow border glow (2+ second transitions)
- Gradual color shifts (2+ seconds)
- Text labels and status indicators

**Reduced Motion Behavior**: allow

**Epilepsy Risk**: none

**Requires Explicit Opt-In**: false

### Low

**Definition**: Minor motion risk, allowed by default, softened under reduce motion.

**Examples**:
- Slow border glow (1+ second transitions)
- Gentle particle sparkle (2+ second intervals)
- Breathing animation (3+ second cycles)

**Reduced Motion Behavior**: soften (disable animation, keep static state)

**Epilepsy Risk**: possible

**Requires Explicit Opt-In**: false

### Moderate

**Definition**: Significant motion risk, disabled by default, disabled under reduce motion.

**Examples**:
- Graph shell pulse
- Edge shimmer
- Particle sparkle (1+ second intervals)
- Camera breathing

**Reduced Motion Behavior**: disable

**Epilepsy Risk**: possible

**Requires Explicit Opt-In**: true

### High

**Definition**: Severe motion or epilepsy risk, forbidden or requires explicit opt-in with warning.

**Examples**:
- Beat-synced flash
- Full-screen strobe
- Camera shake
- Rapid contrast inversion

**Reduced Motion Behavior**: disable

**Epilepsy Risk**: high

**Requires Explicit Opt-In**: true (or forbidden entirely)

## Safety Gate Model

### Gate Purpose

The safety gate is a future runtime policy gate that:
- Checks effect registration before execution
- Evaluates risk classification
- Checks epilepsy risk level
- Checks reduce motion preference
- Blocks or softens effects based on policy

### Gate Logic

```
IF effect is not registered:
  BLOCK effect

IF effect.epilepsyRisk == "high" AND NOT explicitOptIn:
  BLOCK effect

IF reduceMotionEnabled:
  IF effect.reducedMotionBehavior == "disable":
    BLOCK effect
  IF effect.reducedMotionBehavior == "soften":
    SOFTEN effect (disable animation, keep static)

IF effect.risk == "moderate" AND NOT explicitOptIn:
  BLOCK effect

ALLOW effect (with or without softening)
```

### Future Implementation

The safety gate is not implemented in v60. It requires v61+ with explicit contract.

## Music-Reactive Relationship

### Thread Dependency

This is Thread A (Motion Safety) → Thread B (Music-Reactive) dependency.

**Rule**: Thread B cannot ship visual reactions unless Thread A registers and gates them.

### Forbidden Until Thread A Complete

The following are forbidden until Motion Safety registry and safety gate exist:
- Audio input
- Music-reactive visual output
- Beat-synced effects
- Audio-reactive graph styling
- Music-reactive node/edge/canvas changes

### Future Relationship

When audio reactivity is promoted (v61+):
- All music-reactive effects must be registered in Motion Safety registry
- Effects must be classified by risk and epilepsy risk
- Safety gate must check reduce motion before allowing audio-reactive effects
- High epilepsy-risk audio-reactive effects may be forbidden entirely

## Graph Visual Relationship

### Boundary Respect

Motion Safety must respect existing graph contracts:
- GRAPH_RUNTIME_BOUNDARY_CONTRACT.md
- GRAPH_VISUAL_POLICY.md
- GRAPH_THEME_APPLICATION_CONTRACT.md

### Forbidden Graph Mutations

Motion Safety registry does not authorize:
- Sigma renderer mutation
- Graph node/edge styling changes
- Canvas rendering changes
- Physics changes
- Camera/filter behavior

### Allowed Graph Interactions

Motion Safety registry may classify:
- Future graph visual effects (if explicitly promoted)
- Graph shell pulse (if explicitly promoted)
- Edge shimmer (if explicitly promoted)

All graph effects must wait for explicit graph contracts before implementation.

## Theme Relationship

### Theme Token Path

The planned theme token path `motion.reduce` (from THEME_TOKEN_PATH_MAP.md) may express reduce motion preference in the future.

### Current Status

The `motion.reduce` token path is planned but not yet active. v60 does not implement token-based reduce motion detection.

### Future Integration

When theme-based reduce motion is implemented:
- Motion Safety gate must check `motion.reduce` token value
- Theme changes must trigger safety gate re-evaluation
- Reduce motion preference must be consistent across systems

## Command Deck Relationship

### Command Registration

If motion safety controls are added in future:
- Commands must be registered in Command Deck
- Hotkeys must not use banned hotkeys (Ctrl+Alt+T, Alt+F8)
- Commands must follow Command Deck governance

### Current Status

v60 does not add any commands or hotkeys.

## Accessibility Requirements

### Required Attributes

Any future motion safety UI must have:
- Toggle control: `aria-label` or `aria-labelledby`
- Toggle button: `aria-pressed` state
- Status labels: Visible text for current state
- Registry readout: Visible text for screen readers
- Keyboard navigation: Tab navigable controls
- Focus indicators: Visible focus states

### Keyboard Navigation

- Toggle controls: Tab navigable
- Enter/Space: Activate toggle
- No keyboard traps

### Screen Reader Support

- Motion safety status should be announced
- Risk classifications should be visible in text
- Toggle controls should have clear labels
- Registry entries should be visible as text

## Playwright Evidence Requirements

### Evidence Paths

Preferred evidence paths for v60 acceptance:

1. **Playwright assertions** – e2e specs that verify registry visibility and passive nature
2. **Visible manual app behavior** – Direct UI observation of registry display
3. **Typecheck/build output** – typecheck, lint, and build artifacts for infra checks
4. **Git diff / file inspection** – Structural verifications tied to acceptance notes

### Forbidden Evidence Paths

- Manual DevTools JavaScript execution
- Manual inspection of JS arrays or objects
- "Trust me, I read the code"
- Skipping tests
- Changing tests to fit broken behavior

### v60 Evidence Requirements

For v60 Reduced Motion Guard Registry acceptance, Playwright must prove:
- Motion Safety registry is visible if UI is added
- Registry rows are listed with correct classifications
- High-risk effects are labeled high/disabled
- Moderate effects are disabled under reduce motion policy
- Static readout is safe/allowed
- UI is passive/read-only (no active controls for effect execution)
- No animation/audio/graph mutation controls are active
- Existing reduce motion toggle (if any) still works
- No skipped tests
- Registry is static/read-only (no runtime effect execution)

## v60 Preconditions

Before v60 (Reduced Motion Guard Registry) implementation can begin, the following must be true:

1. **v59 Contract Accepted**: MOTION_SAFETY_AND_EPILEPSY_GUARD_CONTRACT.md is accepted and committed
2. **v59 Commit Clean**: Post-commit git status is clean
3. **Typecheck Passes**: npm run typecheck passes with zero errors
4. **Playwright Passes**: npm run qa:e2e passes with zero failures and zero skips
5. **No Skipped Tests**: grep -R "test.skip" returns no results
6. **No Banned Hotkeys**: grep for banned hotkeys returns no results in code
7. **No DevTools Wording**: grep for DevTools wording returns no results in docs
8. **Static Registry Scope Confirmed**: v60 can remain static/read-only registry
9. **No Animation Required**: No actual animation is required for v60
10. **No Audio Input Required**: No audio input is required for v60
11. **No Graph/Sigma Required**: No graph/Sigma mutation is required for v60
12. **Passive UI Scope Confirmed**: v60 UI (if added) can remain passive/read-only
13. **Gate Conditions Met**: All v59 → v60 gate conditions are satisfied

If any precondition fails, v60 must not proceed. Stop and report.

## v61+ Promotion Path

### Promotion Process

To promote from v60 (static registry) to v61+ (runtime safety gate or audio reactivity), the following process must be followed:

1. **Specific Runtime Contract**: Create specific contract for runtime safety gate or audio reactivity
2. **Advisory Discussion**: Advisory questions for runtime gate or audio reactivity are discussed and answered
3. **QA Checklist**: QA checklist items for runtime gate or audio reactivity are defined and verified
4. **Playwright Evidence**: Playwright tests prove runtime gate or audio reactivity is safe and correct
5. **Backlog Clearance**: No blocking backlog items exist
6. **Acceptance**: Runtime gate or audio reactivity is accepted via QA report
7. **Implementation**: Runtime gate or audio reactivity is implemented according to contract
8. **Validation**: Typecheck and Playwright validation pass
9. **Commit**: Runtime gate or audio reactivity is committed with appropriate message
10. **Post-Commit Verification**: Git status is clean and tests still pass

### Promotion Criteria

Runtime safety gate or audio reactivity can be promoted when:
- The specific runtime contract is accepted
- Runtime gate or audio reactivity has explicit advisory approval
- Runtime gate or audio reactivity has Playwright evidence
- Runtime gate or audio reactivity does not break existing contracts
- Runtime gate or audio reactivity does not break existing tests
- Runtime gate or audio reactivity has no skipped tests
- Runtime gate or audio reactivity has no banned hotkeys
- Runtime gate or audio reactivity has no DevTools wording in docs

### Forbidden Promotion Paths

The following promotion paths are forbidden:
- Promoting without specific contract acceptance
- Promoting without Playwright evidence
- Promoting with skipped tests
- Promoting with banned hotkeys
- Promoting that breaks existing contracts
- Promoting that breaks existing tests
- Promoting that requires DevTools manual steps

### v61 Candidate Categories

Potential v61+ runtime categories (all require explicit new contracts):
- Runtime safety gate implementation (check reduce motion, block/soften effects)
- Audio input system (if promoted for music reactivity)
- Music-reactive visual output (if promoted)
- Graph/Sigma reactive styling (if promoted)
- Theme-based reduce motion detection (if promoted)

## Stop Conditions

### Immediate Stop Conditions

Work must stop immediately if any of these conditions are detected:

1. **Animation Added**: Any code attempts to add actual animation in v60
2. **Audio Input Added**: Any code attempts to add audio input
3. **Music Reactivity Added**: Any code attempts to add music-reactive visuals
4. **Graph/Sigma Mutation Added**: Any code attempts to add graph/Sigma mutation
5. **Node/Edge Styling Added**: Any code attempts to add node/edge/canvas styling
6. **CSS Variables Written**: Any code attempts to write CSS variables
7. **Theme Preset Mutated**: Any code attempts to mutate theme presets
8. **Storage Added**: Any code attempts to add storage/persistence
9. **Hotkeys Added**: Any code attempts to add new hotkeys/listeners
10. **Command Execution Added**: Any code attempts to execute commands
11. **Active Controls Added**: Any code attempts to add active effect execution controls
12. **Test Skip Attempted**: Any test is marked as skipped
13. **DevTools Wording Found**: Any doc requires manual DevTools steps for acceptance
14. **Banned Hotkey Found**: Any code uses banned hotkeys (e.g., Ctrl+Alt+T)
15. **Strobe/Flashing Added**: Any code attempts to add strobe or rapid flashing

### Stop and Report Conditions

Work must stop and produce a Quest Mode Situation Report if:

1. **Typecheck Fails**: npm run typecheck returns errors
2. **Playwright Fails**: npm run qa:e2e returns failures
3. **Skipped Tests Found**: grep -R "test.skip" returns results
4. **Git Status Dirty**: git status --short shows uncommitted changes during validation
5. **Gate Condition Fails**: Any v59 → v60 gate condition fails
6. **Contract Violation**: Implementation violates contract requirements
7. **Boundary Crossing**: Implementation crosses forbidden boundary
8. **Evidence Missing**: Required Playwright evidence is missing
9. **UI Becomes Active**: UI adds active effect execution controls instead of passive display

## Acceptance Criteria

### v59 Acceptance Criteria

v59 (Motion Safety / Epilepsy Guard Contract) is accepted when:

1. **Contract Document Exists**: docs/accessibility/MOTION_SAFETY_AND_EPILEPSY_GUARD_CONTRACT.md exists with all 19 required sections
2. **Contract is Complete**: All required sections are filled with meaningful content
3. **Motion Safety Model Defined**: Motion Safety model is clearly defined
4. **Epilepsy Risk Model Defined**: Epilepsy risk model is clearly defined
5. **Reduced Motion Authority Defined**: Reduced motion authority is clearly defined
6. **Risk Categories Defined**: Visual effect risk categories (safe/low/moderate/high) are clearly defined
7. **Safety Gate Model Defined**: Safety gate model is clearly defined
8. **Music-Reactive Relationship Defined**: Relationship to music-reactive system is clearly defined
9. **Graph Visual Relationship Defined**: Relationship to graph visual system is clearly defined
10. **Theme Relationship Defined**: Relationship to theme system is clearly defined
11. **Command Deck Relationship Defined**: Relationship to Command Deck is clearly defined
12. **Accessibility Requirements Defined**: Accessibility requirements are defined
13. **Playwright Evidence Requirements Defined**: Playwright evidence requirements are defined
14. **v60 Preconditions**: v60 preconditions are clear and testable
15. **v61+ Promotion Path**: v61+ promotion path is defined
16. **Stop Conditions**: Stop conditions are clearly defined
17. **Forbidden Categories Explicit**: Forbidden categories (strobe, flashing, camera shake, audio reactivity) are explicitly listed
18. **QA Updated**: QA/advisory/backlog are updated for v59
19. **Typecheck Passes**: npm run typecheck passes with zero errors
20. **Playwright Passes**: npm run qa:e2e passes with zero failures and zero skips
21. **No Skipped Tests**: grep -R "test.skip" returns no results
22. **Commit Clean**: Post-commit git status is clean

### v60 Acceptance Criteria

v60 (Reduced Motion Guard Registry) is accepted when:

1. **v59 Gate Conditions Met**: All v59 → v60 gate conditions are satisfied
2. **Contract Respected**: Implementation respects MOTION_SAFETY_AND_EPILEPSY_GUARD_CONTRACT.md
3. **Static Registry**: Registry is static/read-only (no runtime effect execution)
4. **No Animation**: No actual animation is added
5. **No Audio Input**: No audio input is added
6. **No Music Reactivity**: No music-reactive visuals are added
7. **No Graph/Sigma Mutation**: No graph/Sigma mutation is added
8. **No Node/Edge Styling**: No node/edge/canvas styling is added
9. **No CSS Variables**: No CSS variables are written
10. **No Theme Mutation**: No theme preset mutation occurs
11. **No Storage**: No storage/persistence is added
12. **No Hotkeys**: No new hotkeys/listeners are added
13. **No Commands**: No command execution is added
14. **Registry Classifies Effects**: Registry classifies effects with risk, reduced-motion behavior, epilepsy risk
15. **Passive UI**: UI (if added) is passive/read-only with no active effect execution controls
16. **Playwright Proves Passive**: Playwright tests prove passive/read-only behavior
17. **Playwright Proves Classifications**: Playwright tests prove correct risk classifications
18. **Existing Systems Work**: Existing graph/theme/reduce motion systems still work
19. **No Skipped Tests**: No tests are skipped
20. **Typecheck Passes**: npm run typecheck passes with zero errors
21. **Playwright Passes**: npm run qa:e2e passes with zero failures and zero skips
22. **QA Updated**: QA/advisory/backlog are updated for v60
23. **Commit Clean**: Post-commit git status is clean
