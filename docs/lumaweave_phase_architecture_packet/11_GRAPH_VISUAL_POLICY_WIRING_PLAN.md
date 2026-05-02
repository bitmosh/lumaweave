# Graph Visual Policy Wiring Plan

## Slice 1 — Tokens Only

Replace hardcoded values with token references where behavior is identical. Do not change logic.

Validation:

```bash
npm run typecheck
npm run qa:e2e
```

## Slice 2 — Style Policy

Wire `graphStylePolicy` to replace direct styling helper functions.

Rules:
- selected node persists
- hover is temporary
- hover does not erase selection
- selected edge behavior remains
- background clears selection

## Slice 3 — Label Policy Adapter

Do not directly replace old `labelPolicy` if APIs differ.

If new policy returns Maps and old policy mutates Graphology, create:

```txt
applyGraphLabelPolicyToGraphology.ts
```

Responsibilities:
1. Reset node labels.
2. Reset edge labels.
3. Call graphLabelPolicy.
4. Restore labels from fullLabel/originalLabel.
5. Preserve truncation.
6. Preserve all-short/all-medium.
7. Preserve selected-neighborhood behavior.

## Slice 4 — Remove Duplicates

Only remove old code after validation proves equivalent behavior.
