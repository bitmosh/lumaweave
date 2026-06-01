---
id: system.doc.architecture
title: Documentation Architecture
cluster: slate
references: []
tags:
  - doc-architecture
  - canonical
  - v100
status: canonical
include_in_self_graph: true
type: manual
agent_readable: true
last_updated: 2026-05-31
---

# LumaWeave — Documentation Architecture

How the docs are structured and why. This is the rule every other doc follows. It is itself static: it describes a structure, not a state, so it does not go stale.

## The problem this solves

If every doc embeds current facts — counts, versions, what's in progress — every doc goes stale the moment anything changes. Rewrite cost compounds: by the 40th doc, a single change forces edits across dozens. The fix is the documentation form of normalization: never store a mutable fact in more than one place, and keep concept-docs free of state entirely.

## Three layers, strictly separated

**1. Code is the source of truth for facts.** Counts, entry lists, what-exists-now, exact values. These are derivable by reading the code or running a validator/generator script. **No doc caches them.** A doc that asserts "26 handles" is a stale cache of `grep -c` waiting to happen. When a count or list matters, point to the file or the script that derives it.

**2. Static domain docs are the source of truth for concepts.** The canonical per-domain docs (Registry, Theme, Graph, Physics, …). They contain only timeless content: patterns, contracts, invariants, join/structure relationships, boundaries, and how to build within the domain. They are written once and touched only when the *architecture* changes — not when state changes.

**3. One live doc is the source of truth for state and intent.** `LUMAWEAVE_NOW.md` — the single place "right now" is allowed to live: current version/arc/pass, the roadmap, in-flight work, known bugs/paperweights. Updated every pass.

A second live surface already exists for history: the **dev-blog / #changelog feed** (via `blog.bumper`). That is the changelog. Per-pass history therefore never belongs in docs — the feed owns it.

## The test

Before any sentence enters a static doc, ask: **"Will this still be true 20 passes from now?"** If no, it does not belong in a static doc. It goes in `LUMAWEAVE_NOW.md`, or it comes out because the code already knows it.

## Rules for static docs

- **No counts, no metrics, no entry totals.** Describe structure ("Layer 1 joins Layer 2 by `settingsKey`"), not quantity ("20 contracts"). For live numbers, point to code or a validator.
- **No version/arc/pass references in the body.** "Hotkeys live in `hotkeys/`" is timeless and fine; "v100.0.0a moved them" is history and goes to the changelog feed.
- **Frontmatter is metadata about the doc, and that's allowed — what's banned is stale *claims in the body*.** The distinction that matters: a `last_updated: <date>` stamp is a *fact* (the doc was touched then), and facts don't rot — they help the reader gauge trust. What rots is a doc body confidently describing old mechanics (e.g. v35 behavior when code is at v97) while still flagged current. So:
  - **`last_updated`** — keep it; it's accurate metadata, auto-stamped by `normalize-frontmatter.mjs`.
  - **`status`** — the freshness contract. Vocabulary: `current` (maintained, reflects reality), `canonical` (the source-of-truth operating-manual for a domain), `accepted` (frozen reference), `complete`, `concept` (design, little/no implementation), `archived` (superseded — body may be stale, see successor). The v100 domain docs are `status: canonical`. **The discipline: flip `current`/`canonical` → `archived` the moment a doc is superseded.** That single field, not the absence of metadata, is what protects against stale docs.
  - **`version`** — allowed on anything. A version number going stale is fine *because `status` governs trust*: `version: v97` + `status: canonical` means "accurate as of v97"; the same version on `status: archived` means "was true at v97, may be stale now." Danger is only `old version` + `status: current`.
  - **Structural fields** (`id`, `title`, `type`, `domain`, `cluster`, `include_in_self_graph`, `references`, `tags`) — keep; they're timeless classification that tooling (the self-graph generator) depends on.
    - `include_in_self_graph` uses an **opt-out default**: `generate-self-graph.mjs` includes every doc file it finds unless the field is explicitly set to `false`. Set `false` only on docs that are noisy or actively harmful as graph nodes (e.g., large auto-generated logs). The canonical docs have `include_in_self_graph: true` (explicit, matching the default). New docs that omit the field are included — this is intentional; silence means "include."
  - Frontmatter is normalized by `normalize-frontmatter.mjs` against `frontmatter-rules.yaml` — that tool is the enforcement engine for these rules, not an exception to them.
- **Cross-reference by topic, never by state.** A static doc may link another static doc ("see the Theme & Token doc") — stable forever. It may link `LUMAWEAVE_NOW.md` for current state. It must never inline state from another doc.
- **Describe "planned" structurally, not temporally.** "An embedded inference backend is designed behind the `InferenceBackend` trait; the remote client is the shipped implementation" is timeless. "Planned for v103" is not — that lives in the roadmap section of the live doc.

## Rules for the live doc (`LUMAWEAVE_NOW.md`)

- It is the *only* doc expected to change every pass. (Static docs carry a `last_updated` stamp too — accurate metadata — but their *bodies* don't track per-pass state; `LUMAWEAVE_NOW.md` is where current state actually lives.)
- It holds: current production version + internal arc/pass; the roadmap; in-flight work; known bugs/paperweights; any genuinely volatile pointer the static docs defer to.
- It does not duplicate concepts from the static docs — it links to them.

## Why this ends the compounding-rewrite problem

A change to state touches exactly one doc (`LUMAWEAVE_NOW.md`). A change to a fact touches zero docs (code is truth). A static domain doc changes only when that domain's architecture genuinely changes — a rare, intentional event. Doc #40 never forces a rewrite of docs #1–39, because #1–39 assert nothing that #40's existence could falsify.
