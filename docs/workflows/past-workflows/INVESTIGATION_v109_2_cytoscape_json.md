# Investigation brief — v109.2 Cytoscape JSON adapter

**For:** Terminal Claude · **Output:** one markdown report dropped into PK as `v109_2_cytoscape_json_report.md` · **No code changes, no commits, no installs.**

v109.2 is the second concrete adapter on the v109.0 platform — and the first SingleFileAdapter case. The platform validated against markdown-vault (DirectoryAdapter) in v109.1; this validates the single-file family base. Cytoscape JSON is the right choice because the graph shape is already nearly what LumaWeave wants — most of the work is field-mapping and validation, not derivation.

Per the v109.0.4 scaffolding pattern + the v109.1 implementation pattern: the adapter lives in `src/source-adapter/adapters/cytoscapeJsonAdapter.ts`, the form in `CytoscapeJsonConfigForm.tsx`, registration in the registry.

This brief is tighter than v109.1's. Fewer algorithmic decisions; more about format identification and field-mapping precision.

**Hard stops:**
- No code changes. No commits. No installs.
- Cite file:line for every claim about current LumaWeave code.
- For Cytoscape format claims, cite the official Cytoscape.js docs URL where possible. Mark cached knowledge explicitly.
- Tradeoff analysis on every architectural choice, not preference.

---

## §1 — Platform fit-check (SingleFileAdapter)

Quick sanity check that v109.0's `SingleFileAdapter` actually fits this case.

1. **SingleFileAdapter shape** — read `src/source-adapter/singleFileAdapter.ts`. Confirm `readFile()` is sufficient (no other primitive needed for single-JSON-file adapters). If the JSON is huge (50MB+), is there a streaming concern? My expectation: not a concern for Cytoscape JSON, since these are typically pre-computed exports under 10MB. But verify by checking Cytoscape's typical export size for moderately-sized graphs.

2. **CytoscapeJsonConfig** — confirm it's in the `AdapterConfig` union at `baseSourceAdapter.ts` with the right shape (`filePath: string` minimum). Flag any field that's missing.

3. **Tauri command** — Cytoscape JSON files can be anywhere on disk (user-supplied paths). Does the v108 `read_file` Tauri command (project-root validated) work, or does this need `read_vault_file` (user-configured-root validated) like markdown-vault did? **This is a non-trivial security question** — if the file is anywhere on disk, then the validation rule needs to accommodate arbitrary user-supplied absolute paths, not a configured-root-relative path. Two options:
   - **A**: Reuse `read_vault_file` with the file's parent directory as the "root" — but each adapter invocation has a different "root," which is awkward.
   - **B**: Add a new `read_user_file` Tauri command that takes a single absolute path and validates only that the path is canonicalizable and not a symlink. No "scope" — the user picks the file, full stop.
   - **C**: Reuse `read_file` if we declare the v109.2 design assumes the JSON file lives somewhere the project root has access to. Unclean — defeats the "Kirby move" of accepting external data.

Recommend with full tradeoff. This is the **load-bearing security decision for v109.2** and possibly v109.3/v109.4 too.

---

## §2 — Cytoscape format ecosystem

There are multiple "Cytoscape JSON" formats in the wild. Map them.

### 2.1 Cytoscape.js native format

Cite the official Cytoscape.js JSON format spec: https://js.cytoscape.org/#notation/elements-json

Structure (from cached knowledge — verify):
```json
{
  "elements": {
    "nodes": [
      { "data": { "id": "n1", "label": "Node 1" }, "position": { "x": 100, "y": 200 } }
    ],
    "edges": [
      { "data": { "id": "e1", "source": "n1", "target": "n2", "weight": 0.5 } }
    ]
  },
  "style": [...],          // optional
  "layout": {...}          // optional
}
```

Key fields:
- `elements.nodes[]` — array, each with `data` (must contain `id`) and optional `position`
- `elements.edges[]` — array, each with `data.id` + `data.source` + `data.target`
- Arbitrary other fields in `data` for both nodes and edges — these are user-defined attributes

Verify the structure. Note any common variants (e.g. some exports use `elements` as a flat array of `{group: "nodes" | "edges", data: ...}` instead of the nested object form).

### 2.2 Cytoscape Desktop (older `.cyjs` format)

Older Cytoscape Desktop exports use a different schema. From cached knowledge:
- Sometimes wraps everything in a `data` field at root
- Uses `format_version` field
- May include `network_id` and other Cytoscape-Desktop-specific metadata

Should v109.2 support this? Recommendation: **detect-and-warn-but-don't-parse** for v1.0. We support the modern Cytoscape.js format; if we detect an older format (via the presence of `format_version` or other Desktop-specific markers), return an error summary with a clear "older Cytoscape Desktop format not supported in v1.0; export via Cytoscape.js or please file an issue" message.

Confirm or push back.

### 2.3 Related JSON-graph formats (out of scope but worth noting)

Briefly: are there other JSON-graph formats users might *try* to load through this adapter that look similar but aren't Cytoscape JSON? Examples:
- **JSON Graph Format (JGF)** — separate format
- **NetworkX node-link** — `{"nodes": [...], "links": [...]}` (note: `links` not `edges`)
- **Sigma.js export** — also JSON, also has `nodes`/`edges` but different field layout

The adapter could try to be permissive, or it could be strict (require the `elements` wrapper). Recommend strict-first (clear errors are better than wrong silent loads), with a follow-up note that JGF / NetworkX node-link could be their own adapters later (v110+).

### 2.4 The format-identification gate

Recommend: **at the top of the adapter's load, validate the file's shape before parsing**. Specifically:
- Must be valid JSON
- Must have a top-level `elements` object
- `elements.nodes` and `elements.edges` must be arrays (or one may be missing — handle gracefully)

If any of these fail, return a clear error summary. Don't attempt to "guess" the format and recover.

---

## §3 — Field mapping: Cytoscape → LumaWeave

Cytoscape's `data` object maps to LumaWeave's `LumaWeaveNodeDraft` / `LumaWeaveEdgeDraft` shape.

### 3.1 Node mapping

```typescript
// Cytoscape input:
{ data: { id: "n1", label: "Node 1", weight: 5, color: "red" }, position: { x, y } }

// LumaWeave output:
{
  id: "n1",
  label: "Node 1",
  type: "node",                  // or some derived type if a field hints at it?
  raw: {
    kind: "node",
    sourceAdapter: "cytoscape-json",
    cytoscapeData: { ... },      // pass through Cytoscape's data verbatim (minus id/label which are top-level)
    position: { x, y },          // pass through if present
    // Specific fields LumaWeave knows about extracted to raw top-level?
  }
}
```

Decisions to lock:
- **Label fallback**: if `data.label` is missing, fall back to `data.name`, then `data.id`. Recommend.
- **Type derivation**: should LumaWeave derive a `type` from a `data.type` or `data.group` field if present? Or keep `type: "node"` and put everything else in `raw`? Recommend keeping it simple — `type: "node"` always, with discriminating fields in raw. The cluster resolver and inspector use `raw` fields to differentiate.
- **Cytoscape-specific fields LumaWeave uses**: are there any fields LumaWeave should *promote* from Cytoscape's `data` to top-level node fields? For example, `data.color`, `data.size`, `data.weight` — do these map to LumaWeave's rendering hints, or stay in raw? Survey LumaWeave's existing self-graph adapter handling to see the convention. The investigator should report what the convention is and recommend.

### 3.2 Edge mapping

```typescript
// Cytoscape input:
{ data: { id: "e1", source: "n1", target: "n2", weight: 0.5, label: "uses" } }

// LumaWeave output:
{
  source: "n1",
  target: "n2",
  type: "edge",                  // or "directed" / "undirected" if a field hints at it?
  raw: {
    sourceAdapter: "cytoscape-json",
    edgeId: "e1",
    cytoscapeData: { ... },
    weight: 0.5,                 // promoted if LumaWeave uses it for rendering
    label: "uses",
  }
}
```

Decisions to lock:
- **Edge ID**: LumaWeave's edge shape doesn't have a top-level `id` field (per `graph.types.ts` — verify); the Cytoscape edge ID goes in `raw.edgeId`. Confirm this is the existing convention.
- **Directed vs undirected**: Cytoscape JSON doesn't natively distinguish directed/undirected edges (it's a renderer-level concern via the `style` block). LumaWeave's `LumaWeaveEdgeDraft` — does it have a directionality flag? Check and recommend.

### 3.3 Duplicate / orphan handling

- **Duplicate IDs**: if two nodes share an ID, what happens? Cytoscape itself rejects duplicates (silent overwrite or error). Recommend: warn + keep first occurrence + log to `warnings[]`.
- **Orphan edges** (edge references a node ID that doesn't exist): Cytoscape silently renders an edge to a non-existent endpoint. LumaWeave can't — Sigma needs both endpoints. Recommend: skip the orphan edge + warn.

### 3.4 Limits

Cytoscape graphs in the wild can be huge — biomedical / network-science graphs reaching 100k+ nodes. Per markdown-vault precedent: **2000-node hard cap for v1.0** with truncation warning. Same `maxNodes` config field (audible-ignore as in markdown-vault D4).

Truncation order for Cytoscape: there's no `updatedAt` to sort by. Options:
- Keep first 2000 in file order
- Sort by some attribute (degree count? size? weight?) descending
- Random sample of 2000

Recommend the simplest one for v1.0 — first 2000 in file order, with the warning that order may not reflect priority. Note that users with huge graphs should pre-filter before importing.

---

## §4 — Tauri command decision (revisited from §1)

This is the section where the security-surface question gets resolved.

Cytoscape JSON files live anywhere — user's downloads, project folder, network mount, whatever. The v108 `read_file` (project-root validated) won't work for arbitrary paths.

Report on each option with implementation cost:

**Option A: Reuse `read_vault_file` with parent-dir as root.**
- Pro: no new Tauri command
- Con: Awkward semantically — the "root" is just whatever directory the file is in. No real scope.
- Cost: Adapter computes parent dir from `filePath` config, passes as `root`. ~5 lines.

**Option B: New `read_user_file(path: string)` Tauri command.**
- Pro: Cleanest semantic — user picks an exact file, we read exactly that file.
- Validation: canonicalize the path + check it's a regular file + check it's not a symlink. No scope-check (the user explicitly chose the path).
- Cost: ~15 Rust lines + frontend wrapper + registration in `lib.rs`. Same audit-by-eyeball discipline as v108.
- Con: Another Tauri command to maintain. Another security-surface touchpoint.

**Option C: Reuse `read_file` with elevated-trust framing.**
- Pro: No new code at all
- Con: Defeats the Kirby-move principle — only files inside the project root would load, which means users can't load their own data
- Strongly recommend against.

Recommend with full reasoning. The choice affects v109.3 (package-dependency, also single-file, also anywhere on disk) and v109.4 (CSV, same).

My instinct (testable against the report's analysis): **Option B**. A new `read_user_file` is the cleanest, the security model is honest (the user explicitly chose this file via the form), and it's reusable for v109.3 and v109.4. ~15 lines of Rust is well within the audit-by-eyeball discipline. But verify.

---

## §5 — UI form

Similar to markdown-vault's vault-root input, but for a single file path.

- **File path** (required): text input. No file-picker dialog for v1.0 (locked decision from v109.0 brief — defer `tauri-plugin-dialog`).
- Form testid: `data-testid="adapter-config-cytoscape-json"`
- Inner input testid: `data-testid="adapter-config-cytoscape-file-path"`
- Validation: post-load only (same as markdown-vault). Errors from `read_user_file` (or whichever Tauri command lands) surface as load errors in the panel.

Effort: LOW. ~30 lines.

---

## §6 — Fixture file design for E2E

Single fixture JSON file at `tests/fixtures/cytoscape/sample-graph.json`. Should cover:
- A small graph (~10 nodes, ~15 edges)
- A node with custom data fields (to verify pass-through)
- An edge with `weight` and `label`
- One duplicate-ID case (to verify warning + keep-first)
- One orphan-edge case (edge references missing node — verify skip + warning)
- One node with `position: { x, y }` (verify pass-through)

Sketch the file contents in the report (10-20 lines of JSON).

E2E spec asserts:
- Loaded count: N nodes, M edges (with comment anchoring to fixture)
- Warnings present for duplicate-ID and orphan-edge
- Node with custom data: `raw.cytoscapeData.<field>` is present in the output node

---

## §7 — Pre-flight decisions for Ryan

Aggregate every decision the brief surfaces into a checklist. For each: clear question + investigator's recommendation + reasoning, in product-language where possible.

Expected items (verify the list against the brief):
1. Tauri command for single-file user data: Option A / B / C
2. Label fallback chain: `data.label` → `data.name` → `data.id`
3. Type field: keep `type: "node"`/`"edge"` always, derive from raw
4. Field promotion to raw top-level: which Cytoscape fields LumaWeave promotes
5. Older Cytoscape Desktop format handling: detect-and-error, or attempt-parse
6. Truncation order for Cytoscape: first 2000 in file order, sort by degree, or random
7. `maxNodes` audible-ignore: same pattern as markdown-vault D4
8. Sister format permissiveness: strict (require `elements`) or permissive (try to detect NetworkX/JGF)

---

## §8 — Recommended pass shape

Given §1-§7 findings, propose v109.2 implementation:
- **Single pass or multiple?** Estimate: Cytoscape is simpler than markdown-vault. Probably single-pass with 2-3 commits.
- If Option B (new `read_user_file` Tauri command) is recommended: that's its own commit (Rust commit, separate from the adapter logic). So 3 commits: `read_user_file` + adapter/form/registration + fixture/E2E/arc-step.
- If Option A or C (no new Tauri command): 2 commits: adapter/form/registration + fixture/E2E/arc-step.
- Estimate total scope: hours / commits.
- Hard sequencing dependencies (which steps require earlier ones in place).

---

## Output format

One markdown file dropped into PK as `v109_2_cytoscape_json_report.md`. Eight sections numbered as above. File:line citations for code claims, doc-URL citations for format claims, LOW/MED/HIGH ratings on every difficulty question, tradeoff analysis on every architectural choice. Drop the report into PK. No commits. No code changes. No installs.

When complete: ping back; planning Claude reads the report and scopes the v109.2 implementation pass from it.
