---
id: system.doc.domain-template
title: Domain Documentation Template
cluster: slate
references:
  - system.doc.architecture
tags: [documentation, template, canonical]
status: canonical
include_in_self_graph: false
type: template
agent_readable: true
last_updated: 2026-06-30
---

# LumaWeave — Domain Doc Template

Use this structure for a maintained architecture domain.

## Frontmatter

```yaml
---
id: domain.<stable-id>
title: <Domain title>
cluster: <cluster>
references:
  - system.doc.architecture
status: canonical
include_in_self_graph: true
type: manual
agent_readable: true
last_updated: YYYY-MM-DD
tags: [...]
---
```

## 1. Purpose

What responsibility belongs to this domain? What explicitly does not?

State the active runtime implementation. If a major future seam exists, distinguish it in the first section.

## 2. Runtime flow

Use a small diagram when it materially clarifies three or more relationships. Name the actual modules that own each transition.

## 3. Core model

Explain stable types, registries, state ownership, and identity rules. Prefer concepts over cached inventories.

## 4. Invariants and safety

List behavior that must remain true across changes, including lifecycle, persistence, accessibility, filesystem, or compatibility constraints.

## 5. Extension guide

Describe the smallest supported path for adding a new entry/behavior. Include validation and tests.

## 6. Known limitations

Record verified gaps. Link [Known Issues](../KNOWN_ISSUES.md) for reproducible defects; do not paste old investigations.

## 7. Future direction

Describe planned architecture with explicit language. Link a `status: concept` design document for detail.

## 8. Code and evidence map

List current source, tests, validators, and generated artifacts.

## Writing rules

- Code wins when docs disagree.
- Do not use internal arc numbers as feature names.
- Do not include pass reports or chat/publish workflow.
- Do not claim an interface seam is an implementation.
- Avoid exact counts unless the count is a stable tested contract.
- Update paths and limitations whenever architecture changes.
