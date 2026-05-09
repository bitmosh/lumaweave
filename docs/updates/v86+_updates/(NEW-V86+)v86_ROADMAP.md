# v86–v103 Development Roadmap

## Purpose

The forward-looking plan from the start of v86 through the end of the design system buildout, with polish arcs interleaved. Each numbered arc has a single mission and its own scope boundary. v86 establishes the foundation the rest of the roadmap consumes.

## Arc Map

```
v86  Solar Plasma + Token Tier Foundations           [keystone, in flight]
  v86a  Foundations
  v86b  Visual Treatment
  v86c  Tile System
  v86d  Inspector Mini-Graph
  v86e  Cosmetic Polish

v87   Theme Migration                                [retrofit 5 themes onto tier model]
v88   Workshop MVP                                   [asset import, tagging, family, remix preview]
v89   Inspector Full Radial                          [Geometry/Type/Motion/Layout spokes]
v90   Node Program Registry + Geometry Presets       [sun/glass/crystal/orb/pip]
v91   Edge Plasma Full                               [Sigma EdgeProgram replaces v86b overlay]
v92   Audio Reactivity                               [audio source → mapping rule → handle wiring]
v93   Physics Dialect + Lens Registry                [constellation/galaxy/helix/trihelix/...]
v94   3D Minimap                                     [Three.js companion renderer]
v95   Source Adapter Expansion                       [Cypher / JSONL / GraphQL adapters]
v96   IDE Integration                                [file open + line extraction]
v97   Hotkey Registry + Command Palette              [⌘K runtime]
v98   Code Spoke                                     [live + diff editor inside inspector]
v99   History Spoke Deepening                        [branching + time-scrubbing]
v100  Lattica Workshop Hardening                     [sandbox / signing / threat model]
v101  Agent Familiar System                          [graph-resident personas with gravity wells]
v102  Arena                                          [agent tournament infrastructure]
v103  VR Compatibility                               [stretch — may defer indefinitely]
```

## Difficulty + Dependencies

Difficulty: **S** = 1 sub-arc / **M** = 2–4 / **L** = 5–7 / **X** = 8+

| Arc | Difficulty | Depends on |
|---|---|---|
| v86 | L | — |
| v87 | M | v86a |
| v88 | L | v86a, v87 |
| v89 | M | v86d |
| v90 | M | v86b, v89 |
| v91 | M | v86b, v90 |
| v92 | L | v86b |
| v93 | L | v86a |
| v94 | L | v86b, v93 |
| v95 | M | — |
| v96 | M | v86d |
| v97 | S | v86a |
| v98 | M | v86d, v96, v97 |
| v99 | M | v86d, v88 |
| v100 | L | v88 |
| v101 | L | v86b, v92 |
| v102 | X | v101 |
| v103 | X | v94 (stretch) |

## Polish Arcs (interleave between numbered arcs)

| Arc | Mission | Difficulty | Best inserted after |
|---|---|---|---|
| vP1 | Performance pass — large-graph mode, FPS guardrails, particle-cap tuning | M | v91 |
| vP2 | Accessibility audit — WCAG AAA, color-blind palettes, reduce-motion completeness, larger hit targets, screen-reader labels | M | v87 |
| vP3 | Documentation pass — user docs, contributor guide, theme authoring guide | S | v88 |
| vP4 | Onboarding tour — first-run flow, tooltips, "What's this?" icons, fade-after-first-use tips, all toggleable | M | v97 |
| vP5 | Community features — theme sharing via Lattica bundle format, public asset marketplace | L | v100 |

## Time Estimate

Single-developer cadence:

- v86 = 3–5 weeks (keystone, larger than the rest)
- v87 through v97 = 1–3 weeks each
- v98 through v100 = 2–3 weeks each
- Roughly **6–9 months from v86 start to v97 + interleaved polish complete**.
- v101+ becomes its own conversation when v97 is in sight.

## v86 Long-Term Contracts

These are established in v86a and govern every arc that follows.

1. **Three-tier token model.** Primitives → Semantics → Components. No tier skipping. Tier 3 components reference Tier 2 semantics; Tier 2 references Tier 1 primitives; components never reference primitives directly. Governance enforces.
2. **Full theme declarations.** Every theme declares every canonical path. No inheritance until v88 Workshop.
3. **Override scope specificity.** Resolution order: target > target-kind > cluster > global. Documented in v86a appendix; only `target` and `global` runtime in v86d; rest land v89+.
4. **Two-step canonical token landing.** Add path to `PLANNED_THEME_TOKEN_PATHS` first; populate values across all six themes; only then promote to `CANONICAL_THEME_TOKEN_PATHS` and bind.
5. **Registry contract pattern.** All registries expose `list / getById / filterByCategory / validateShape / register`.
6. **Asset / preset separation.** Themes save native settings (colors, shapes, baked-in things) directly. Themes reference external assets (textures, animations, shaders, sound packs) by id from the asset bank.
7. **Solar Plasma is the reference theme in v86.** New canonical paths get thoughtful Solar Plasma values; other themes get neutral or theme-appropriate defaults until v87.

## Long-Term Registry Steady State (23)

The project's bleeding-edge architectural signature. Each registry is a one-line registration to extend.

```txt
Already in code (10):
  settingsRegistry, themeTargetRegistry, handleset.registry,
  panel-registry, controlPlaneModeRegistry, perspectiveRegistry,
  command-registry, audioSourceRegistry, motionSafetyRegistry,
  graphViewElementRegistry

Added in v86 (3):
  asset registry, Tier 1 primitive registry, inspector spoke registry

Added v87–v97 (7):
  hotkey registry (v97), lens registry (v93), physics dialect registry (v93),
  node program registry (v90), edge program registry (v91),
  audio mapping rule registry (v92), tile section registry (v86c)

Added v98+ (3):
  theme bundle registry (v100), agent persona registry (v101),
  arena ruleset registry (v102)
```

## Stop Conditions (Arc-Level)

Halt the current arc and audit when any of these occur:

- A registry's runtime contract drifts from the contract pattern → fix the pattern, propagate to all registries.
- A theme cannot express a design intent within Tier 2 semantics → add a primitive, propagate to all themes, resume.
- Override conflict resolution returns a result the user finds surprising → audit specificity rules, fix or document.
- Any active target binds to a planned-only token path → run governance check, demote or complete.

## Cross-References

- `v86_INDEX.md` — entry point with handoff prompt + sub-arc order
- `v86a_FOUNDATION.md` … `v86e_COSMETIC_POLISH.md` — sub-arc phase packets
- `lumaweave_integration_audit.html` — human-readable executive overview

---

*Hand v86a to Bandit first. Run v86b/c/d in parallel after v86a is green. Land v86e last.*
