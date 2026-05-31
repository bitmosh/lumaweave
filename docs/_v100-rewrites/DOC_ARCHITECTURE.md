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
- **No status frontmatter.** No `last_updated`, `last_pass`, `status: current`. A timeless doc has no "last pass"; those fields are volatile metadata that make permanent content look stale on sight. The only allowed header is a one-line topic description and, where useful, a stable `Supersedes:` list.
- **Cross-reference by topic, never by state.** A static doc may link another static doc ("see the Theme & Token doc") — stable forever. It may link `LUMAWEAVE_NOW.md` for current state. It must never inline state from another doc.
- **Describe "planned" structurally, not temporally.** "An embedded inference backend is designed behind the `InferenceBackend` trait; the remote client is the shipped implementation" is timeless. "Planned for v103" is not — that lives in the roadmap section of the live doc.

## Rules for the live doc (`LUMAWEAVE_NOW.md`)

- It is the *only* doc expected to change every pass, and the only one that carries a date.
- It holds: current production version + internal arc/pass; the roadmap; in-flight work; known bugs/paperweights; any genuinely volatile pointer the static docs defer to.
- It does not duplicate concepts from the static docs — it links to them.

## Why this ends the compounding-rewrite problem

A change to state touches exactly one doc (`LUMAWEAVE_NOW.md`). A change to a fact touches zero docs (code is truth). A static domain doc changes only when that domain's architecture genuinely changes — a rare, intentional event. Doc #40 never forces a rewrite of docs #1–39, because #1–39 assert nothing that #40's existence could falsify.
