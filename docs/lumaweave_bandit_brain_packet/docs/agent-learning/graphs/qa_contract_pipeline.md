# QA Contract Pipeline

```mermaid
flowchart LR
  A[Accepted Behavior] --> B[qa-registry.ts]
  B --> C[QaPanel Checklist]
  C --> D[Manual QA Report]
  B --> E[Playwright Tests]
  F[advisory-registry.ts] --> G[Advisory Tab]
  G --> D
  E --> H[Automated Evidence]
  H --> D
```

## Contract Meaning

QA artifacts are not just UI text.

They preserve:

- what was accepted
- what was incomplete
- what must remain stable
- what future work may extend
- what tests prove

## Rule

Do not delete or rewrite QA/advisory artifacts during recovery unless the pass explicitly authorizes a contract migration.
