---
id: system.doc.template
title: Domain Doc Template
cluster: slate
references:
  - system.doc.architecture
tags:
  - template
  - canonical
  - v100
status: canonical
include_in_self_graph: true
type: manual
agent_readable: true
last_updated: 2026-05-31
---

# LumaWeave — Domain Doc Template

The skeleton every canonical domain doc follows (Registry, Theme, Graph, Physics, …). It encodes the present-tense, operating-manual voice and the static/live discipline from `DOC_ARCHITECTURE.md`. Read that first; this is the shape, that is the rule.

**Voice:** present indicative. "The theme engine resolves tokens down three tiers." Not "we plan to" / "this will." If a thing is genuinely unbuilt, say so explicitly and put it in §5 (Growth) as a designed seam, not woven through the present-tense sections.

**The one tense test:** every sentence in §1–§4 and §6 must be true today and in 20 passes. Anything that fails goes to §5 (described structurally) or to `LUMAWEAVE_NOW.md` (if temporal).

---

## Header
One line: what this domain is. Optional `Supersedes:` list. **No status/date/version frontmatter** (those live only in `LUMAWEAVE_NOW.md`).

## §1 — What it is
The orient. Two or three paragraphs: what this system does, what problem it solves, and the one-sentence mental model a reader should leave with. Present tense, shipped reality. No history of how it got here.

## §2 — The parts & how they connect
The map. The components of the system and their relationships — data flow, resolution order, join structure, lifecycle. This is structural ("Layer 1 joins Layer 2 by `settingsKey`"; "resolution walks Tier 3 → 2 → 1"), never quantitative ("there are 20 contracts"). Diagrams welcome. Describe the shape of the data, not its current contents.

## §3 — How to work in it safely
The operating manual — the section that prevents breakage.
- **Invariants / rules:** the things that must stay true or the system breaks. State them as rules ("components never reference primitives directly"; "customization changes presentation, never evidence truth").
- **Dependencies to respect:** what depends on what, what order things must happen in, what you must not reorder or skip.
- **Frontend connection:** where this domain surfaces in the UI, which components consume it, how a change here propagates to the screen.
- **Gotchas:** the non-obvious traps (the things we actually tripped on), stated as timeless cautions.

## §4 — How to extend it
The build-here guide for normal additions. The decision rule for "I want to add a new X" — which pattern to use, the required steps (contract → registry → validator → passive UI → evidence → promotion), the checklist. Present tense, applies to any future addition.

## §5 — How it's designed to grow
The forward axis, kept timeless. Describe the **mechanics and consequences** of growth, not a schedule:
- The seams built for future capability (traits, registries, extension points) and what lighting each one up *does*.
- The effect of scaling: "adding more X produces Y" — composition rules, performance characteristics, what changes downstream.
- Genuinely unbuilt features described structurally ("designed behind trait Z; the shipped implementation is W"), explicitly flagged as not-yet-built.
- **No version numbers, no "planned for vN."** The *when* lives in `LUMAWEAVE_NOW.md`'s roadmap; this section is the *how* and *what-it-costs*.

## §6 — Where it lives in code
The doc→code bridge. The directory/module map for this domain — paths to the key files and what each is responsible for. Stable (directory structure changes rarely); not file contents, not counts. The reader should be able to jump from any concept above to the file that implements it in one hop.

---

## Notes on applying the template
- Sections can merge or split where a domain warrants it; the *sequence* (orient → map → operate → extend → grow → locate) is the constant.
- Depth is not the enemy — cut planning-tense and redundant state, keep every load-bearing technical detail. The goal is "deeply informative and safe to mess with," not "short."
- When the source docs disagree with the code, the code wins; write what's true and note the resolved discrepancy only if a reader would otherwise be confused.
