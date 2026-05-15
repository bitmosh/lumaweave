# Source adapter JSON parse error on manifest read

**Status:** known bug, low priority
**Filed:** 2026-05-13
**Discovered during:** session handoff inventory (pre-existing)
**Severity:** functional — left panel shows error string instead of metadata
  values, but graph still loads and renders correctly

## Symptom

The Graph Sources panel in the left sidebar displays:
JSON.parse: unexpected character at line 1 column 1 of the JSON data

The error appears in the panel's bottom section where source metadata (manifest
data, report status) would normally render.

## What's actually happening

The fetch for one of the v0 metadata files (`manifest.json` or
`GRAPH_REPORT.md` based on the displayed status) is returning HTML — almost
certainly a Vite 404 page that begins with `<!doctype html>`. `JSON.parse` then
chokes on `<` at column 1 of the response body.

The panel itself shows:
- `graph.json: found` — successfully loaded
- `manifest.json: missing`
- `GRAPH_REPORT.md: missing`

The fetch for these missing files is returning a Vite dev server 404 response
(HTML), not a 404 status code that the code can branch on. The code receives
HTML and tries to parse it as JSON.

## Reproducibility

Consistent. Occurs on every load when `manifest.json` or `GRAPH_REPORT.md` are
absent from the fixture directory.

## Likely fix shape

Either:
- Check response `content-type` before calling `JSON.parse`
- Wrap the parse in try/catch and treat parse failures as "missing"
- Check response status more carefully (Vite dev server may serve 404s as HTML
  with a 200 status in some configs)

The fix lives in:
- `src/source/loadGraphifySource.ts` (manifest read path)
- `src/source/useGraphSourceSummary.ts` (report status read)

## Related

- Filed in the session handoff as `vP-Panel-Display-Sync`
- Also related: `vP-AI-Lab-Path-Cleanup` — these files have hardcoded
  `/home/boop/Projects/ai-lab/graphify-out` paths that should be relativized
- v0 vs v1 metadata schema drift (uses `metadata.nodeCount` instead of
  `metadata.stats.nodeCount`)

## Workaround

None needed for graph rendering. The panel just shows an ugly error string in
place of the metadata summary. Graph data itself loads fine.