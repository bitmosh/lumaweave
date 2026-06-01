# LumaWeave — Polish Debt (running, doc-rewrite arc)

Background log of partially-complete or drifted work spotted while writing the v100 canonical docs. NOT blockers — these are deferred polish candidates. Rolled out in volumes of 5 for triage. Each item: what, where, why it matters, suggested fix.

Status key: OPEN (logged, untriaged) · ACCEPTED (Ryan wants it) · WONTFIX · DONE

---

## Volume 1 — found during v100.0.1–.2 (registry + theme)

### 1. OKLCH migration is partial — palette generation still HSL
**Where:** `src/themes/paletteGeneration.ts`
**Found:** v100.0.2. The header comment claims "v93 swaps for OKLCH via culori," but the body still uses `hexToHSL`/`hslToHex`. Crossfade interpolation *is* OKLCH (`colorMath.ts` + `colorInterpolation.ts`), so the system is split: interpolation perceptual, generation not.
**Why it matters:** hue-anchor-generated palettes won't have the perceptual evenness OKLCH gives the crossfade. Inconsistent color-space behavior between two parts of the same subsystem. Also a live comment-vs-code lie that will mislead the next reader.
**Suggested fix:** port `generatePaletteFromHue` to culori OKLCH (same signature, per the comment's own intent), or correct the comment if HSL is deliberate. Status: OPEN.

### 2. Legacy hex-interpolation kept as dead-ish code behind @deprecated
**Where:** `src/themes/colorInterpolation.ts`
**Found:** v100.0.2. `interpolateColorHex` + `_parseColorHex` + `_formatColorHex` are retained `@deprecated` "for rollback safety (v99)." OKLCH has shipped; the rollback path is dangling.
**Why it matters:** dead code that looks live; a future edit could wire it back by accident. Small but it's exactly the kind of thing that rots.
**Suggested fix:** once OKLCH has "baked in production" (the comment's own gate), delete the legacy block. Confirm no importer of `interpolateColorHex` first. Status: OPEN.

### 3. Stale "v93 swaps for OKLCH" comments across theme files
**Where:** `themeCrossfade.ts`, `paletteGeneration.ts`, `themeHash.ts` headers (at least)
**Found:** v100.0.2. Multiple headers reference a "v93" future swap that either already happened (crossfade) or didn't (palette). Version-stamped comments that no longer track reality.
**Why it matters:** comment drift; per our doc-architecture principle, volatile version refs don't belong baked in. They mislead.
**Suggested fix:** a sweep to strip/correct version-stamped "will swap in vN" comments in `src/themes/`. Low risk, code-comment only. Status: OPEN.

### 4. handleset registry is scaffold-only, not wired to UI
**Where:** `src/control-plane/handles/handleset.registry.ts`
**Found:** v100.0.1. File header: "does not yet drive UI ... documentation/scaffold layer only." The live SettingsPanel runs off `settings.registry.ts`. The Link Network (Layers 1–2) is metadata, not the active control path.
**Why it matters:** a whole registry + contract layer exists as intent without runtime teeth. Either it's destined to drive UI (then it's unfinished) or it's permanent documentation (then it should be labeled as such, not as a registry).
**Suggested fix:** decide its fate — promote to actually drive settings, or relabel as a documentation artifact and stop implying it's live. Status: OPEN (genuine architectural decision, not just polish).

### 5. Two token representations with no enforced sync
**Where:** `src/themes/` — tier model (`tokenPrimitives/Semantics/Components.ts`) vs flat `themeTokens.ts`
**Found:** v100.0.2. Governance validates that flat runtime tokens satisfy canonical paths, but nothing enforces that the tier model and the flat tokens express the *same* values. They're maintained in parallel by hand.
**Why it matters:** edit one, forget the other, and design intent silently diverges from rendered reality with no test catching it.
**Suggested fix:** either generate the flat tokens from the tier model (single source), or add a validator asserting tier-resolved values equal flat-token values per theme. Status: OPEN.

---

## Volume 2 — found during v100.0.3–.5 (graph + gwells + source adapter)

### 6. Edge weight ignored — buildGraphologyGraph hardcodes weight=1
**Where:** `src/graph/.../buildGraphologyGraph.ts` (~line 110)
**Found:** v100.0.3. Every edge is built with `weight: 1`; the function never reads `edge.weight` from the source draft, despite the v1 schema carrying real weights and the layout intent being weight-driven attraction.
**Why it matters:** weight-based physics/visual emphasis silently can't work — a whole dimension of the data model is dropped at the build boundary. Higher-severity than cosmetic; it's a schema-vs-implementation gap.
**Suggested fix:** read `edge.raw.weight` (v1) into the Graphology edge attribute, decide whether Gwells or a visual channel consumes it, and wire accordingly. Confirm Gwells interaction model can use it (currently it doesn't). Status: OPEN.

### 7. JSON-404 paperweight — loadGraphifySource fetches an unserved external path
**Where:** `src/source-adapter/loadGraphifySource.ts`
**Found:** v100.0.5. Hardcoded `fetch('/examples/ai-lab/graphify-out/graph.json')` points at an external project's output the app doesn't serve; returns the SPA HTML 404, `.json()` throws, Graph Sources panel shows error. Self-graph renders fine via the fixture path, so it's panel-only — but visible in every screenshot.
**Why it matters:** named high-priority paperweight; can't be on screen at public launch. Misrepresents the source system as broken.
**Suggested fix:** point the loader at a served artifact, or replace with a registry-driven adapter load. Decide whether the live-source panel ships at v1.0 at all, or is hidden until a real adapter backs it. Status: OPEN.

### 8. Gwells stepPhysics has no spatial index (O(n × interactions × targets))
**Where:** `src/physics/gwells/engine.ts` stepPhysics
**Found:** v100.0.4. Force accumulation is pairwise within matching well types each frame. Fine at self-graph scale; degrades on large graphs.
**Why it matters:** caps the graph size Gwells can animate smoothly — a scaling ceiling for the codebase/vault adapters that will produce big graphs.
**Suggested fix:** spatial index / Barnes-Hut-style approximation for repulsion when node count crosses a threshold. Not needed until large-source adapters land. Status: OPEN (deferred — tie to first big-graph adapter).

### 9. linear-alignment / perpendicular force kinds are documentary (fire but apply no force)
**Where:** `src/physics/gwells/engine.ts` stepPhysics kind switch
**Found:** v100.0.4. `linear-alignment` sets `interactionFired = true` but applies no fx/fy ("documentary force for C1"). Worth confirming `perpendicular` is fully implemented vs. partial.
**Why it matters:** an interaction can be declared active and appear wired while contributing nothing — silent no-op that misleads dialect authors.
**Suggested fix:** either implement the alignment force or mark these kinds explicitly as no-op/structural in the registry + doc so authors aren't misled. Status: OPEN.

### 10. Self-graph dual-schema (v0 + v1) maintained in the adapter indefinitely
**Where:** `src/source-adapter/self-graph-adapter.ts`
**Found:** v100.0.5. Adapter branches on v0 vs v1 schema throughout. If the fixture is fully v1 now, the v0 branch is dead weight; if not, it's a migration left half-done.
**Why it matters:** dual-path code that's easy to break asymmetrically (the theme-tokens lesson). One path likely untested.
**Suggested fix:** confirm the generated fixture's schema; if v1-only, drop the v0 branch (after grep for other v0 consumers); else finish the migration. Status: OPEN.
