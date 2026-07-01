---
id: domain.deferred.post.v1.vision
title: Deferred and Post-v1 Vision
cluster: indigo
references:
  - system.doc.architecture
  - system.lumaweave.roadmap
  - domain.theme.token.system
  - domain.graph.sigma.rendering
  - domain.physics.gwells
tags: [vge, audio, deferred, vision, canonical]
status: canonical
include_in_self_graph: true
type: manual
agent_readable: true
last_updated: 2026-06-30
---

# LumaWeave — Deferred and Post-v1 Vision

Everything in this document is deferred unless an existing seam is explicitly identified. Seams are not working features.

## Existing seams

- Audio source/mapping registries and a synthetic signal exist; live audio-reactive rendering does not.
- The asset/handleset/grammar-lens registries provide vocabulary for a future Visual Grammar Engine; no complete grammar authoring/runtime system exists.
- GWells has a decoration callback and additive dialect registries; planned constellation/galaxy/profile behaviors are not registered.
- GWells seeders may store `z`; active force integration and rendering remain 2D.
- A small renderer interface type exists; Sigma does not implement it and no runtime renderer switch exists.
- Remote inference and Agent Chat are partially implemented and documented separately; embedded models, terminal, and Strudel remain future.

## Visual Grammar Engine

A future system for routing signals and authored grammar to canonical theme/visual properties:

- Grammar handle registry.
- Signal routing/compatibility.
- Asset bank.
- Editing/validation lens.
- Safety capabilities and Reduce Motion gates.

It must consume the existing token system rather than create a parallel color/theme model.

## Audio reactivity

Potential sources include microphone, file, synthetic, or generated music signals. Features would map analyzed values to shader uniforms, graph decoration, or safe physics parameters.

Requirements:

- Reduce Motion and intensity limits.
- Explicit source permission.
- No per-frame React state churn.
- Clear distinction between visual modulation and structural physics.

## Alternate physics and profiles

Future GWells work is consolidated under `docs/design/gwells/`:

- Profiles above the existing dialect API.
- Universal and source-shaped layouts.
- Explainable recommendations.
- Macro and advanced controls.
- Full 3D integration only with a real 3D renderer/integrator.

## Three-dimensional rendering and VR

The intended rendering stack is Three.js/React Three Fiber, but those dependencies are currently unused. A real implementation must define policy translation, materials, labels, selection, camera, lifecycle, accessibility, and performance—not merely consume stored `z` values.

VR is a later interaction layer over a proven 3D renderer, not an independent near-term target.

## Agent and creative systems

Longer-horizon concepts include agent presence in the graph, creative composition workflows, and richer LumaWeave/Cerebra integration. These are strategic ideas rather than release commitments.

## Promotion rule

A deferred system moves toward implementation only when it has:

1. A user problem and bounded first slice.
2. A runtime owner and explicit compatibility boundary.
3. Safety/accessibility requirements.
4. Validation evidence.
5. An update to Current Status and Roadmap.

See [Roadmap](../ROADMAP.md) for sequence rather than treating this document as a schedule.
