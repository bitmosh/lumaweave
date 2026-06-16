# GWells Physics System Snapshot

Date: 2026-06-15
Project: LumaWeave / GWells
Status: working planning snapshot

This directory captures the current state of the GWells physics/layout work after the recent polish, lifecycle, performance, and diagnostic passes. It is intentionally practical: what exists, what changed, what is still missing, and where the next passes should start.

## Files

- `01-current-status.md` - current runtime architecture, UI coverage, and latest circle-layout diagnosis.
- `02-work-completed.md` - summary of the GWells work completed in the recent pass sequence.
- `03-remaining-work-plan.md` - staged plan for finishing the physics-system reshaping work.
- `04-open-risks-and-verification.md` - bugs, uncertainties, checks, and validation work still needed.

## Short Version

GWells is much healthier than it was at the start of the recent work. The engine has better lifecycle controls, headless stepping, debug events, benchmark coverage, interaction indexing, and stronger docs. The current implementation is still mainly a v0.1-style hierarchical layout engine with two active dialects: radial backbone and parallel spines.

The broader product goal is not done yet. LumaWeave does not currently expose full user control over well types, interaction strengths, seed parameters, custom dialects, or profile composition. The planned v0.2 profile/family/macro-control system remains mostly documentation and design, not runtime implementation.

The latest major diagnosis: the current self-graph circle layout is not generic fallback. The active graph emits 46 root spine nodes, so both seeders enter hub-ring mode and place those roots around a very large ring. The next practical fix is to make current self-graph seeding coherent again, likely by grouping `src` and `docs` as major buckets or changing hub-ring behavior for many sibling spines.
