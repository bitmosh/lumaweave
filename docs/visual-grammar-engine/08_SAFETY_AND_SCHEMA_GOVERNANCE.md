# 08 — Safety and Schema Governance

## Purpose

This document defines the safety model for Visual Grammar Engine, Signal Loom, Grammar Lens, Asset Bank, and Visual Dialect preset files.

## Core Invariant

Users can author visual grammar.

Users cannot bypass safety, evidence, permissions, or runtime contracts.

## Schema Pipeline

```txt
YAML text
→ parse
→ schema validate
→ known handle validate
→ known source/target validate
→ capability validate
→ motion safety validate
→ audio safety validate
→ graph/Sigma contract validate
→ preview diff
→ preview layer
→ save only if allowed
```

## Forbidden Initially

- Raw JavaScript.
- Shell commands.
- Remote imports.
- Arbitrary CSS.
- Arbitrary CSS variable writes.
- Executable assets.
- Theme-defined commands.
- Microphone access.
- Audio playback.
- Audio file decoding.
- Web Audio runtime input.
- Uncontracted graph/Sigma mutation.
- High-frequency flash/strobe.
- Camera shake.
- Risky pulse behavior without safety gate.
- Test weakening.
- Fallback advisory acceptance.

## Allowed Initially

- Schema-valid grammar files.
- Static handle references.
- Terminal validation.
- Read-only handle documentation.
- Preview-only overrides, later.
- Reduced-motion-safe transforms.
- Metadata-only source references.
- Synthetic signal fixtures.

## Safety Gates

Every visual grammar route should answer:

```txt
What source event triggers this?
What signal/envelope is emitted?
What target selector is affected?
What handles are used?
What properties are mapped?
What is the reduced-motion fallback?
What forbidden capabilities are requested?
What contract authorizes this runtime behavior?
```

## Reduced Motion

Reduced Motion remains a master authority.

Visual Grammar presets must provide or inherit reduced-motion fallback behavior for any effect with motion, pulse, shimmer, glow transition, or intensity envelope.

Allowed fallbacks:

```txt
static-highlight
color-shift-only
badge-only
disable-pulse
outline-only
```

## Permission Boundaries

Visual Grammar files must not grant permissions.

They may declare requested capabilities, but capability validation must reject unsupported or uncontracted requests.

Example:

```yaml
permissions:
  audioCapture: false
  playback: false
  metadataOnly: true
```

## Preview vs Runtime

Initial grammar validation should be terminal/read-only.

Future preview should be reversible.

Runtime graph/Sigma or audio-reactive behavior requires explicit promotion contracts.

## Trust Model

Imported grammar/assets must not be trusted by default.

Future lifecycle:

```txt
candidate → quarantined → validated → accepted → active → deprecated/rejected
```

## Core Safety Copy

Presentation is customizable.

Contract truth is not.
