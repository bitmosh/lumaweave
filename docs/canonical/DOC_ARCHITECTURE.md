---
id: system.doc.architecture
title: Documentation Architecture
cluster: slate
references:
  - system.lumaweave.current-status
  - system.lumaweave.roadmap
  - system.lumaweave.development-history
tags: [doc-architecture, canonical]
status: canonical
include_in_self_graph: true
type: manual
agent_readable: true
last_updated: 2026-06-30
---

# LumaWeave — Documentation Architecture

LumaWeave documentation separates current facts, durable architecture, future intent, and history so readers can tell what is implemented.

## Authority order

1. **Code and executable validation** determine whether a runtime path exists.
2. **Current Status** summarizes verified implementation boundaries.
3. **Canonical domain docs** explain maintained architecture and invariants.
4. **Roadmap/design docs** describe intended work and must label it Planned.
5. **Development History and Git** explain how the project arrived here.

A registry entry, dependency, type, schema field, test name, or interface seam is supporting evidence, not proof of a complete feature.

## Maintained documents

- [README](../../README.md): public product front door.
- [Current Status](../CURRENT_STATUS.md): Implemented, Partial, and Planned.
- [Roadmap](../ROADMAP.md): sequencing and direction.
- [Known Issues](../KNOWN_ISSUES.md): reproducible defects and quarantined tests.
- [Development History](../DEVELOPMENT_HISTORY.md): compressed narrative.
- [Documentation Index](../overview/DOCS_INDEX.md): maintained reading paths.
- `docs/canonical/`: domain architecture.
- `docs/design/`: explicitly future-facing design.

## Canonical domain rules

A canonical document should contain:

- Purpose and runtime boundary.
- Data/control flow.
- Invariants and safety constraints.
- Extension guidance.
- Known limitations.
- Future seams clearly separated from implemented behavior.
- A code/test map.

Avoid:

- Current arc numbers.
- Per-pass completion tables.
- Copied component counts unless the count explains a stable contract.
- Personal workflow, chat, or publication mechanics.
- Claims that a planned dependency or registry entry already works.
- Links to temporary investigation reports.

When architecture changes, update the canonical document in the same pass or mark it stale in Current Status.

## State and roadmap rules

Current Status is the concise implementation ledger. It may include a verification date and facts that change as code changes.

Roadmap describes direction and sequencing. It must not be used as proof that a feature shipped.

Known Issues contains only current evidence. Resolved investigations are removed; Git history preserves them.

## Design rules

Design documents use `status: concept` and state what is not implemented near the top. They preserve compatibility constraints, proposed models, validation requirements, and non-goals without pretending to be current code.

When design ships:

1. Move durable architecture into the canonical domain doc.
2. Update Current Status.
3. Remove or archive the superseded concept document if it has no remaining future content.

## History rules

Do not keep one permanent report per implementation pass. Compress milestone-level decisions into Development History and rely on Git for granular provenance.

External notes may retain raw prompts, agent-process records, forensic reports, and abandoned prototypes. They are not part of GitHub-facing project documentation.

## Frontmatter

Frontmatter supports the self-graph and navigation. Use stable IDs and references.

Status vocabulary:

- `current`: maintained state, issue, roadmap, or index.
- `canonical`: maintained domain architecture.
- `concept`: planned design.
- `complete`: frozen history/case study.
- `accepted`: frozen contract/reference.
- `archived`: retained but not authoritative.

## Review checklist

- Is every current claim backed by code or a test?
- Are Partial and Planned boundaries explicit?
- Do all local links resolve?
- Are code paths current?
- Is the same mutable fact duplicated?
- Is historical detail better represented by Git?
- Does the self-graph need regeneration?
