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

## ~~Tiles popover stacks beneath floating tiles~~ DONE (v112.4.2)
- **Surface:** Tiles popover (tile section picker)
- **Root cause:** Case B stacking context trap — `.lw-status-bar { z-index: 10 }` created a stacking context bounding `.lw-status-bar-popover`'s z-index: 10100 below tile-layer (z-index: 1000).
- **Fix:** Raised `.lw-status-bar` to `z-index: 1001` (StatusBar.css). Status bar chrome now correctly renders above the tile-layer; popover renders on top of all floating tiles.
- **First observed:** v112.4 smoke testing (2026-06-10). **Resolved:** v112.4.2 (2026-06-10).

## Settings panel opacity binding regression
- **Surface:** Settings panel background
- **Symptom:** Settings panel background no longer responds to opacity setting; other UI elements still respect the setting and transition correctly
- **Expected:** Background opaque/transparent transition matches other surfaces
- **Likely cause:** CSS variable binding broke during recent settings-category work — possibly v110.1 StatusCluster cleanup or one of the v112 CategoryAdvanced touches. The setting value still propagates (other elements work); the *settings panel's own background reader* lost its binding.
- **First observed:** v112.4 smoke testing (2026-06-10)
- **Triage:** small CSS investigation — grep for the opacity CSS variable in `.settings-panel` selectors, verify the binding is intact
