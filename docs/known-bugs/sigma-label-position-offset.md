# Sigma label position offset

**Status:** known bug, low priority
**Filed:** 2026-05-13
**Discovered during:** v86b-close-1 manual validation
**Severity:** cosmetic (labels remain legible)

## Symptom

Node labels (e.g. `useGraphSourceSummary`, `TOKEN_CENSUS_LEGACY`, `dimmingPolicy`,
`CollapsiblePanel`) render offset from their corresponding nodes by a fixed
pixel distance — typically to the right of the actual node position. Labels
track the graph's transform (move correctly on pan/zoom) but maintain the
offset, indicating the labels are anchored to nodes but at the wrong screen
coordinate.

Screenshots: `docs/screenshots/sigma-label-offset-2026-05-13.png` (TODO if filed)

## Reproducibility

Consistent. Occurs on every reload with the self-graph fixture. Labels appear
correctly positioned when the graph is very small (early in simulation) but
diverge as the graph spreads. The offset distance does not scale with zoom.

## Likely cause

Sigma's label-rendering layer computes screen-space label positions from node
display data. A fixed-pixel offset that doesn't scale with zoom suggests a
viewport/container coordinate-space mismatch — Sigma is either:

- Computing label positions against a different container size than it renders
  against (possible interaction with the ResizeObserver guard added in
  vP-Render-Pipeline-Refactor R1)
- Receiving stale container dimensions during the moment labels lay out
- Using a label-policy offset constant that is wrong for the current container

## Not investigated yet

The ResizeObserver guard in R1 was added to suppress "Container has no width"
errors. It's possible the guard is letting Sigma proceed with a stale or
zero-width measurement during its first label layout, causing all subsequent
label positions to be offset from a wrong baseline.

## Files likely involved

- `src/graph/renderers/sigma2d/SigmaGraphView.tsx` — Sigma instance setup
- `src/graph/renderers/sigma2d/labelPolicy.ts` — label rendering policy
- `src/graph/renderers/sigma2d/applyGraphLabelPolicyToGraphology.ts` — label
  application to graph

## Workaround

None needed. Labels remain readable; the offset is cosmetic.

## Related

- The ResizeObserver guard work in `vP-Render-Pipeline-Refactor` (commit c3d7928)
- `GRAPH_VISUAL_POLICY.md` — label policy spec