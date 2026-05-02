# Identity Systems Map

## Purpose

LumaWeave uses multiple identity systems. They are not interchangeable.

Many failures happen when an agent treats one identity as another, deletes a contract-critical ID, or renames a witness without updating every dependent layer.

## Identity Matrix

| Term | Identifies | Defined In | Consumed By | Category | Must Not Be Confused With | Stability |
| --- | --- | --- | --- | --- | --- | --- |
| `handleId` | UI/control contract identity | handleset/control contract registries | Mission Control, control metadata, docs | contract metadata | `settingsKey` | stable once accepted |
| `settingsKey` | persisted/runtime settings path | settings store/schema/control bindings | runtime controls, persistence | runtime state | `handleId` | stable once shipped |
| `qaKey` | QA checklist/version identity | `qa-registry.ts` | QaPanel, reports, Playwright, docs | QA contract | `advisoryKey` | contract-stable |
| `advisoryKey` | advisory/review set identity | `advisory-registry.ts` | Advisory tab, reports, QA flows | advisory contract | `qaKey` | contract-stable |
| `themeTokenPath` | canonical theme value vocabulary | `themeTokenPaths.ts` | theme validation, target registry, future overrides | token vocabulary | `themeTargetId` | canonical |
| `themeTargetId` | inspectable UI/graph surface identity | `themeTargetRegistry.ts` | DOM markers, overlay, future mapping panel | target contract | `themeTokenPath` | canonical |
| `data-lw-theme-target` | rendered DOM witness for a theme target | JSX on safe containers | Inspector overlay, Playwright | DOM witness | `data-testid` | stable when tested |
| `data-testid` | test access/evidence point | JSX/test surfaces | Playwright | test witness | runtime contract ID | stable when tested |
| `visualHandle` | styling/scaffold class family | handleset/theme docs/CSS | CSS, visual handle audit, future mapping | styling scaffold | `themeTargetId` | semi-stable |
| control surface contract id | a control contract record | contract registry | Mission Control Debug, audits, tests | contract metadata | settings state key | stable once accepted |

## Critical Distinctions

### `handleId` vs `settingsKey`

`handleId` identifies the control contract. `settingsKey` identifies where state is stored.

They may look similar, but they are not the same thing.

A stateless control can have a `handleId` and `settingsKey: null`.

### `themeTokenPath` vs `themeTargetId`

`themeTokenPath` names a value, such as `panel.background`.

`themeTargetId` names a surface, such as `mission-control.panel`.

A target can bind multiple editable properties to token paths.

### `data-lw-theme-target` vs `data-testid`

`data-lw-theme-target` is runtime evidence that a DOM node corresponds to a theme target.

`data-testid` is a Playwright access point.

Do not use test IDs as runtime target IDs. Do not use theme target IDs as arbitrary test IDs.

### `qaKey` vs `advisoryKey`

`qaKey` chooses a checklist/report contract.

`advisoryKey` chooses the Bandit questions/proposals/backlog set.

They can match by convention, but the resolver must make that relationship explicit.

## Core Rule

When changing one identity, trace every join that depends on it:

```txt
Docs → Registry → Runtime → DOM marker → Playwright → QA Report
```

If the identity appears in tests, docs, Mission Control, reports, or DOM markers, it is contract-critical.
