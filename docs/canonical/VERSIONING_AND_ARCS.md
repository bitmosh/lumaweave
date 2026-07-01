---
id: system.versioning.arcs
title: Versioning and Development History
cluster: slate
references:
  - system.doc.architecture
  - system.lumaweave.current-status
  - system.lumaweave.development-history
tags: [versioning, releases, canonical]
status: canonical
include_in_self_graph: true
type: manual
agent_readable: true
last_updated: 2026-06-30
---

# LumaWeave — Versioning and Development History

LumaWeave has two different version concepts. They should not be conflated.

## Product version

`package.json` is the frontend/product semantic-version source. It is currently pre-1.0, so minor releases may still contain substantial product or architecture change.

`src-tauri/tauri.conf.json` and `src-tauri/Cargo.toml` have historically carried independent versions. They are not evidence of the frontend product version unless release tooling intentionally synchronizes them.

Release documentation should read the version from code rather than copying it into multiple current-state files.

## Historical internal arc labels

Development used labels such as `v109.3.0` to organize arcs, phases, and small passes:

```txt
v<arc>.<phase>.<pass>[optional-letter]
```

These labels are historical work identifiers, not SemVer and not public API compatibility claims. Existing comments, tests, migrations, and Git messages may retain them for traceability.

New public documentation should describe behavior rather than use arc numbers as feature names. New implementation work may use issue/branch names or another lightweight planning identifier, but should not require a permanent report per pass.

## Release policy

Before a product release:

1. Confirm the intended `package.json` version.
2. Decide whether Tauri/Cargo versions should match for that release.
3. Run typechecking, CSS lint, GWells validation, targeted Playwright tests, and the agreed release suite.
4. Regenerate derived self-graph artifacts.
5. Verify a clean install and production/Tauri build.
6. Update [Current Status](../CURRENT_STATUS.md) and [Roadmap](../ROADMAP.md) only where facts changed.
7. Summarize meaningful user/architecture changes in a changelog or release note.

## History location

- [Development History](../DEVELOPMENT_HISTORY.md) contains the compressed narrative.
- Git commits and tags contain detailed implementation history.
- [Current Status](../CURRENT_STATUS.md) describes present capability.
- [Roadmap](../ROADMAP.md) describes planned direction.

Per-pass prompts, completion reports, chat publication mechanics, and stale current-arc tables are not canonical versioning material.
