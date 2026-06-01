# LumaWeave — Deferred & Post-v1.0 Vision

The consolidated map of everything designed but deliberately not built yet: the Visual Grammar Engine, audio reactivity, alternate physics dialects, agent familiars, VR, the creative pipeline, and the post-v1.0 feature arcs (terminal, inference, Strudel). This is a **vision doc** — its job is to preserve high-detail design intent and the seams already in code, while being honest that none of it is live. The *when* lives in the roadmap (`LUMAWEAVE_NOW.md`); this is the *what* and *how*.

**Supersedes:** the `VGE_*` cluster (7), the audio cluster (`AUDIO_REACTIVITY_CONTRACT`, `AUDIO_SOURCE_SYSTEM_CONTRACT`, `MUSIC_REACTIVE_MAPPING_CONTRACT`, `UNIVERSAL_AUDIO_HANDLE_ROUTING`), the alternate-dialect docs (`CONSTELLATION_MODE_DIALECT`, `GALAXY_MODE_DIALECT`, `HELIX_CONSTELLATION_DIALECT`), and the concept docs (`AGENT_FAMILIAR_SYSTEM`, `VR_COMPATIBILITY_CONCEPT`, `CREATIVE_PIPELINE_CONCEPT`, `PLATFORM_VISION`). References (does not duplicate) `LUMAWEAVE_POST_V1_FEATURE_ARCHITECTURE.md`.

---

## §1 — What it is

LumaWeave's roadmap has a large body of designed-but-unbuilt architecture. Rather than scatter it across many planning docs (which rot) or delete it (losing intent), it's consolidated here as a single forward map. Each system below is described by what it is, what seam or scaffold already exists in code, and what lighting it up would do.

**Hard rule for this doc:** everything here is deferred. Several systems have *precursors* in the codebase (empty-bank registries, scaffold contracts, schema fields seeded ahead of use) — those are noted as seams, not as working features. Nothing here ships before v1.0 unless explicitly promoted, and promotion means its own contract + pass.

---

## §2 — What exists today (the seams)

A handful of these futures already have code-level scaffolding, which is why they're "deferred" rather than "unimagined":

- **Audio** — `audioSourceRegistry.ts`, `musicReactiveMappingRegistry.ts`, and `syntheticAudioSignal.ts` exist as registry scaffolds + a synthetic test signal. There is no live audio reactivity; the registries catalog what *would* route. The Gwells engine's per-frame `decoration` callback is the hook reactivity would attach to.
- **Visual Grammar Engine (VGE)** — precursors: `assetRegistry.ts` (empty forward-compat asset bank + `assetRefs` on theme presets), the handleset cluster (`handleset.registry.ts`, scaffold-only per the Registry doc), and the grammar-lens / cursor-inspector contracts. VGE extends these; it does not replace the token model (it routes to canonical tokens).
- **Alternate physics dialects** (constellation, galaxy, helix) — the Gwells dialect system (see the Gwells doc) is the extension point; these are designed dialects not yet registered.
- **3D / VR** — seed functions already store a `z` coordinate (parallel-spines arranges in 3D); the renderer-interface seam (Graph doc) is where a 3D renderer attaches.

Everything else (agent familiars, creative pipeline, the post-v1 feature arcs) is design-only with no code yet.

## §3 — How to work in it safely

- **Do not wire deferred systems into v1.0 surfaces.** The whole point of consolidating here is to keep them *out* of the ship path. A scaffold (empty registry, `z` field, decoration hook) is permission to design against, not a feature to expose.
- **Motion safety governs anything animated.** Audio reactivity, VGE signal-driven visuals, and alternate dialects all must honor reduce-motion (the motion-safety system) — animation that can't be frozen is a non-starter. This is the one hard invariant that crosses all the visual futures.
- **VGE routes to tokens; it never redefines them.** When VGE is built, grammar handles consume canonical theme token paths — they don't introduce a parallel color system. Preserve that or the theme governance breaks.
- **Promotion is explicit.** Moving any of these from deferred to active is a real arc with its own contract, not an incidental wiring during another pass.

## §4 — How to extend it

Adding to the vision is cheap and welcome; *implementing* is gated. To add a deferred concept: describe it in §5 here (what it is, the seam it would use, the effect of building it) rather than spinning up a new planning doc — this doc is the single home for deferred design. To *promote* one to active: open an arc, write its contract, and build against the existing seam (dialect registry, decoration hook, asset bank, renderer interface, etc.).

## §5 — The vision (high detail)

### Visual Grammar Engine (VGE)
A system for binding **visual grammar** — how graph elements look and move — to data and signals through editable "grammar handles." Core pieces as designed: a **Grammar Handle Registry** (extends today's handleset with grammar paths, signal compatibility, and safety capabilities), a **Signal Loom** (routes signals — audio, data, time — to visual properties), an **Asset Bank** (populates the empty `assetRegistry` with grammar-compatible assets), a **Grammar Lens** (the editing/validation/override UI, extending the current grammar-lens + cursor-inspector contracts), and a **dialect + safety** layer governing what bindings are allowed. VGE consumes canonical theme tokens; it routes to them rather than defining new ones. Design-locked; gated behind source-adapter and fixture prerequisites.

### Audio reactivity
Graph visuals responding to audio: an **audio source system** (mic, file, synthetic, or stream), a **music-reactive mapping** layer (audio features → visual properties), and **universal handle routing** (any audio signal → any compatible visual handle). The registries exist as scaffolds; the live path would feed the Gwells decoration callback and/or node-program uniforms per frame, always reduce-motion-gated. This is also the substrate the post-v1 Strudel tile's visual feed would plug into.

### Alternate physics dialects
New Gwells dialects beyond radial-backbone and parallel-spines: **constellation** (loose star-field clustering), **galaxy** (spiral/orbital arrangement), **helix-constellation** (twisted multi-spine). Each is a seed function + well-assignment + interaction set registered in the Gwells dialect registry — additive, no engine change.

### Agent familiars
Per-agent visual presences in the graph — a way to represent AI agents (Bandit, etc.) as entities operating on the graph, with their own visual grammar. Design-only.

### VR / 3D
The eventual three.js / react-three-fiber path (not C++), attaching at the renderer-interface seam after the 2D version ships. The `z` coordinate is already seeded in physics for forward-compatibility. VR is a further extension of the 3D renderer.

### Creative pipeline
A flow for authoring and composing visual/graph creative output — the broader "LumaWeave as a creative tool" thesis tying together themes, grammar, audio, and dialects.

### Post-v1.0 feature arcs (terminal · inference · Strudel)
Detailed in `LUMAWEAVE_POST_V1_FEATURE_ARCHITECTURE.md` (kept as the authoritative spec for these; not duplicated here): a real embedded **terminal tile** (xterm.js + portable-pty), **bring-your-own-LLM inference** (OpenAI-compatible remote client; candle deferred behind an `InferenceBackend` trait; no bundled model/container), a frontend-only **Strudel tile** (live `@strudel/web` visual feed — build first), and a **Strudel-LLM composer** (curated-context library, not fine-tuning). All gated behind v1.0 shipping; build order and rationale are in that doc.

### Platform vision
The longest horizon: LumaWeave + Cerebra as a combined platform (high-fidelity visualization + memory architecture). Strategic, not a build target — see `PLATFORM_VISION` content folded here for the positioning.

## §6 — Where it lives in code (seams only)

These are the *scaffolds*, not implementations:

- **Audio:** `src/audio/audioSourceRegistry.ts`, `src/audio/musicReactiveMappingRegistry.ts`, `src/audio/syntheticAudioSignal.ts`; reactivity hook = Gwells `decoration` callback (`physics/gwells/engine.ts`)
- **VGE precursors:** `src/themes/assetRegistry.ts` (empty bank) + `assetRefs` on presets; `src/control-plane/handles/handleset.registry.ts` (scaffold); grammar-lens + cursor-inspector contracts
- **Dialects:** `src/physics/gwells/dialects.ts` (registration point for constellation/galaxy/helix)
- **3D/VR:** `z` in Gwells seed functions; `graphRendererInterface.ts` (renderer seam)
- **Post-v1 arcs:** no code yet — spec in `LUMAWEAVE_POST_V1_FEATURE_ARCHITECTURE.md`

Everything else (familiars, creative pipeline, platform) is design-only with no code.
