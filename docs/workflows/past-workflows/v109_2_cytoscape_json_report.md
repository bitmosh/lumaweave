# v109.2 Investigation Report — Cytoscape JSON Adapter

**Author:** Terminal Claude · **Date:** 2026-06-06 · **Output of:** `INVESTIGATION_v109_2_cytoscape_json.md`

---

## §1 — Platform Fit-Check (SingleFileAdapter)

### 1.1 SingleFileAdapter shape

`src/source-adapter/singleFileAdapter.ts:24-26` — `readFile()` wraps `invoke<string>("read_file", { path })`. The comment at line 6-7 is the platform note: *"Adapters reading user-configured external paths will use `read_vault_file` (landing in v109.0.3) instead."* This confirms that `readFile()` in its current form is **not** suitable for user-supplied external paths — the underlying `read_file` Tauri command validates the path against the project root (`src-tauri/src/fs.rs:5-17`). Attempting to pass an external absolute path will error with `"Path escapes project root"`.

Streaming concern: not applicable. `readFile()` calls `std::fs::read_to_string` (`fs.rs:15`), which loads the file fully into memory. Cytoscape JSON is typically under 10MB for well-scoped architecture graphs; moderately large biomedical graphs can reach 50–100MB. The hard 2000-node cap from §3.4 bounds the useful data to well under that. The adapter should load the full file and then cap — no streaming primitive is needed for v1.0.

### 1.2 CytoscapeJsonConfig

`src/source-adapter/baseSourceAdapter.ts:37-40` — already in the union:

```typescript
export interface CytoscapeJsonConfig {
  adapterId: "cytoscape-json";
  filePath: string;
}
```

The `filePath: string` field is exactly the right shape. No missing fields. The union membership is confirmed at line 62. **No changes needed to `baseSourceAdapter.ts`.**

### 1.3 Registry status

`src/source-adapter/sourceAdapterRegistry.ts` — `cytoscape-json` is **not registered** as of the current tree. All registered adapters are: `self-graph-yaml-frontmatter` (real loader), `markdown-vault` (real loader), and 7 candidates: `git-codebase`, `website-url`, `openapi-spec`, `database-schema`, `package-dependency`, `cloud-infrastructure`, `issue-tracker`. A cytoscape-json entry with `status: "candidate"` or `status: "registered"` (depending on what the pass delivers) must be added.

### 1.4 Tauri command (preview)

Full analysis in §4. Short answer: `readFile()` from `SingleFileAdapter` is broken for this use case. The adapter will need to either call `read_vault_file` with the parent directory (Option A) or a new `read_user_file` command (Option B). **Recommendation: Option B.** See §4.

**Difficulty: LOW** — platform is a clean fit once the Tauri command question is resolved.

---

## §2 — Cytoscape Format Ecosystem

### 2.1 Cytoscape.js native format

*Source: https://js.cytoscape.org/#notation/elements-json (cached knowledge — URL verified against my training data, but I have not fetched the live URL in this session. The format below matches the stable Cytoscape.js v3 spec that has been consistent since ~2016.)*

Cytoscape.js supports two equivalent representations of elements:

**Nested form** (most common in exports):
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
  "style": [...],
  "layout": {...}
}
```

**Flat array form** (also valid per the spec, commonly seen in programmatic construction):
```json
{
  "elements": [
    { "group": "nodes", "data": { "id": "n1" } },
    { "group": "edges", "data": { "id": "e1", "source": "n1", "target": "n2" } }
  ]
}
```

Key invariants from the spec:
- `data.id` is required for both nodes and edges
- `data.source` and `data.target` are required for edges
- `data` may contain any user-defined fields alongside `id`/`source`/`target`
- `position` (nodes only) is optional; used for deterministic layout
- `style` and `layout` at the root are optional (renderer hints, not graph data)
- Both nodes and edges can have a `classes` string (CSS-like selector classes)
- Both can have a `selected` and `locked` boolean field

The v109.2 adapter must handle **both** the nested form and the flat array form. These are both "native Cytoscape.js JSON" — treating only the nested form as valid would surprise a meaningful fraction of users.

Detection heuristic:
- `elements` is an object with `nodes`/`edges` keys → nested form
- `elements` is an array → flat form (check each item's `group` field)

### 2.2 Cytoscape Desktop `.cyjs` format

*(Cached knowledge — Cytoscape Desktop is a separate Java application from the Cytoscape Consortium.)*

The older Cytoscape Desktop export (`.cyjs`) wraps the graph differently:

```json
{
  "format_version": "1.0",
  "generated_by": "cytoscape-3.x.x",
  "target_cytoscapejs_version": "~2.1",
  "data": {
    "shared_name": "...",
    "name": "...",
    "SUID": 12345
  },
  "elements": { ... }
}
```

Key distinguishing markers: presence of `format_version` (string), `generated_by` (string with "cytoscape-"), and/or `target_cytoscapejs_version`.

**Recommendation: detect-and-error for v1.0.** If the adapter detects `format_version` or `generated_by` at the root, return an error summary with a message like:

> "This appears to be a Cytoscape Desktop export (format_version detected). The cytoscape-json adapter supports Cytoscape.js JSON (js.cytoscape.org); re-export via Cytoscape.js or open an issue to request Desktop format support."

Do not attempt to parse it. The data under `elements` might technically parse, but the `data.SUID` and shared-name fields mean the user is probably loading the wrong thing, and a clear error is better than silent wrong output.

### 2.3 Related look-alike formats

| Format | Distinguishing shape | Risk |
|--------|---------------------|------|
| JSON Graph Format (JGF) | `{"graph": {"nodes": {...}, "edges": {...}}}` — `graph` key, nodes as object not array | Low — `elements` key is absent |
| NetworkX node-link | `{"nodes": [...], "links": [...]}` — uses `links` not `edges`, no `elements` wrapper | Medium — if user saves this as `.json` and loads it, they'll get a clear "no elements" error, which is fine |
| Sigma.js export | `{"nodes": [...], "edges": [...]}` — flat, no `elements` wrapper | Medium — same; "no elements" error catches it |
| Gephi JSON | Various shapes; often has `layout` at top level without `elements` | Low |
| D3 force JSON | `{"nodes": [...], "links": [...]}` | Medium — same as NetworkX |

**Recommendation: strict `elements` wrapper required.** If `elements` is absent, return a clear format error naming the key that was expected. Users loading NetworkX/JGF/D3 will see a clear error that guides them. Do NOT try to be permissive and detect these sister formats — that complexity adds surface area with no real benefit; those formats are good candidates for their own adapters in v110+.

### 2.4 Format-identification gate

Order of validation checks at adapter load time:

1. Valid JSON — if `JSON.parse` throws, return error with parse message
2. Root is an object — if `typeof parsed !== "object" || Array.isArray(parsed)`, error
3. Cytoscape Desktop marker — check for `format_version` or `generated_by` → return detect-and-warn error (see §2.2)
4. `elements` key present — if absent, return format error ("missing required `elements` key")
5. `elements` is object or array — if neither, return format error
6. If `elements` is array: each item should have `group` field; warn if missing (treat as nodes)
7. If `elements` is object: accept `nodes` and `edges` sub-arrays (one or both may be absent, treat as empty)

**Difficulty: LOW** — all validation is structural, no ambiguity.

---

## §3 — Field Mapping: Cytoscape → LumaWeave

### 3.1 Actual type shapes (verified)

`src/graph/schema/graph.types.ts:8-21`:

```typescript
export type LumaWeaveNodeDraft = {
  id: string;
  label: string;
  type?: string;
  raw: Record<string, unknown>;
};

export type LumaWeaveEdgeDraft = {
  id: string;        // REQUIRED — not optional
  source: string;
  target: string;
  relationship?: string;
  raw: Record<string, unknown>;
};
```

**Important correction to the brief (§3.2):** `LumaWeaveEdgeDraft.id` is a required `string`, not absent. The brief hypothesized "LumaWeave's edge shape doesn't have a top-level `id` field" — this is wrong. The edge has a required `id`. Edge IDs from Cytoscape (`data.id`) should map **directly** to `LumaWeaveEdgeDraft.id` — no `raw.edgeId` needed. The `raw.edgeId` suggestion in the brief should be dropped.

Convention confirmation from `markdownVaultAdapter.ts:300`: edges get generated IDs like `mv:wikilink:${++edgeSeq}`. Since Cytoscape edges have explicit IDs, those should be used directly. The `cj:` prefix convention (e.g., `cj:e1`) could be considered for namespacing, but the simpler `data.id` direct passthrough is cleaner.

### 3.2 Node mapping

```typescript
// Cytoscape input:
{ data: { id: "n1", label: "Alpha", weight: 5, color: "red" }, position: { x: 100, y: 200 } }

// LumaWeaveNodeDraft output:
{
  id: "n1",
  label: "Alpha",           // fallback: data.name → data.id if data.label absent
  type: "node",             // always "node" — see decision below
  raw: {
    kind: "node",
    sourceAdapter: "cytoscape-json",
    cytoscapeData: { weight: 5, color: "red" },   // data fields minus id/label
    position: { x: 100, y: 200 },                 // optional; omitted if not present
  }
}
```

**Decision — label fallback chain:** `data.label` → `data.name` → `data.id`. The brief's recommendation is correct. `data.name` is a common convention in Cytoscape Desktop exports and biomedical data. Fall back to `data.id` as a last resort — this always exists per spec.

**Decision — type field:** Keep `type: "node"` always. The brief's recommendation is correct. A `data.type` or `data.group` field in Cytoscape's `data` object is user-defined and carries no structural meaning in Cytoscape.js. Promoting it to LumaWeave's `type` field would create an implicit contract with unknown semantics. Leave discriminating fields in `raw.cytoscapeData` for the cluster resolver and inspector.

**Decision — field promotion:** No Cytoscape fields are promoted to top-level LumaWeave node fields beyond `id` and `label`. Neither `LumaWeaveNodeDraft` nor the rendering pipeline has first-class fields for `color`, `size`, or `weight`. These stay in `raw.cytoscapeData`. The rendering pipeline reads `raw` for extensions; if a future version wants to use `weight` for node sizing, it reads `raw.cytoscapeData.weight`. The convention observed in markdown-vault confirms this: Obsidian frontmatter fields go in `raw.frontmatter`, not promoted to top-level.

**Decision — `position`:** Pass through to `raw.position: { x, y }` if present. This preserves layout information for potential future use (a "restore Cytoscape layout" feature). Don't promote to a top-level field — `LumaWeaveNodeDraft` has no position field.

### 3.3 Edge mapping

```typescript
// Cytoscape input:
{ data: { id: "e1", source: "n1", target: "n2", weight: 0.5, label: "calls" } }

// LumaWeaveEdgeDraft output:
{
  id: "e1",
  source: "n1",
  target: "n2",
  relationship: "calls",    // from data.label — optional; omitted if absent
  raw: {
    sourceAdapter: "cytoscape-json",
    cytoscapeData: { weight: 0.5 },   // data fields minus id/source/target/label
  }
}
```

**Decision — `relationship`:** Map `data.label` (edge) → `LumaWeaveEdgeDraft.relationship`. This is the obvious semantic match — Cytoscape uses `label` for display text on edges; LumaWeave's `relationship` field serves the same purpose.

**Decision — directed vs undirected:** `LumaWeaveEdgeDraft` has no directionality flag (`src/graph/schema/graph.types.ts:15-21`). Cytoscape.js doesn't encode this in JSON either — it's a rendering-level concern via `style`. No action needed: emit all edges without a directionality field.

**Decision — edge ID passthrough:** Use `data.id` directly as `LumaWeaveEdgeDraft.id` (not `raw.edgeId`). This is cleaner than the brief's suggestion and matches the type contract.

### 3.4 Duplicate and orphan handling

**Duplicate node IDs:** Cytoscape's own import silently overwrites. LumaWeave should warn + keep first (not overwrite). The semantics of "first wins" matches the principle of least surprise for file-order processing. Add warning string: `Duplicate node id "X" — first occurrence kept`.

**Orphan edges:** Edge references a `source` or `target` ID that doesn't appear in the node set. Sigma.js requires both endpoints to exist. Skip the orphan edge and add warning: `Edge "e1" references missing node "n999" — skipped`.

**Orphan detection timing:** Build a node ID set during node pass, then validate edges against it during edge pass. Single-pass is sufficient.

### 3.5 Limits

**2000-node hard cap.** Same as markdown-vault. `maxNodes` config field is optional (default 2000). If a `maxNodes` override is needed in the future, add it to `CytoscapeJsonConfig` — but for v1.0, hardcode the cap (no config field needed since the brief notes it as "audible-ignore" following markdown-vault D4).

**Truncation order:** First 2000 nodes in file order. Rationale: file order is the only stable, deterministic ordering available in Cytoscape JSON (no `updatedAt` equivalent). Sorting by degree would require a full two-pass (build graph → count degrees → sort → truncate), which adds complexity with no clear win — users with huge graphs need to pre-filter anyway. Warning text: `Graph contains X nodes; truncated to 2000 (file order). Pre-filter the source file to control which nodes are included.`

**Flat array form note:** In the flat array form, nodes and edges are interleaved. The truncation pass must separate them first (collect all nodes → apply cap → then collect edges against surviving node IDs).

**Difficulty: LOW–MED** — the flat array form adds a normalization step but no fundamental algorithmic complexity.

---

## §4 — Tauri Command Decision

This is the load-bearing security question for v109.2 and the v109.3/v109.4 single-file adapters.

### The current surface

`src-tauri/src/fs.rs:5-17` (`read_file`): validates every path against `get_project_root_inner()`. An absolute path like `/home/user/Downloads/graph.json` will error with `"Path escapes project root"`.

`src-tauri/src/fs.rs:152-163` (`read_vault_file`): takes `root: String` + `relative_path: String`; validates that `canonical(root + relative_path)` is within `canonical(root)`. The "root" is user-configurable, not hardcoded.

`src-tauri/src/lib.rs:14-22`: four commands currently registered: `read_file`, `run_script`, `list_files`, `read_vault_file`.

### Option A: Reuse `read_vault_file` with parent directory as root

**Mechanics:** adapter computes `parent_dir = dirname(config.filePath)` and `filename = basename(config.filePath)`, calls `invoke("read_vault_file", { root: parent_dir, relativePath: filename })`.

**Security model:** `read_vault_file` validates that the file is within the root. Since root = parent directory of the file itself, this is always true for any regular file. The validation becomes trivially satisfied — it adds no real scope restriction.

**Pros:**
- Zero new Tauri code
- Works correctly for the read

**Cons:**
- Semantically wrong. "Vault root" implies a directory scope; using it for single-file access strips the scope invariant entirely.
- The `singleFileAdapter.ts` comment says user-external paths "will use `read_vault_file`" — but `read_vault_file` was designed for directory adapters (markdown-vault uses it with a real root). Reusing it here bends its contract.
- The "root" varies per adapter invocation (wherever the user's file happens to live). Each adapter instance effectively has a different phantom vault, which is incoherent if you ever want to audit active read scopes.
- Does not cleanly handle the case where `config.filePath` is an absolute path but `basename(filePath)` is ambiguous (e.g., if `dirname` is empty or `.`).
- **Cost:** ~5 lines in the adapter. Zero Rust lines.

### Option B: New `read_user_file(path: string)` Tauri command

**Mechanics:** new command in `fs.rs`:

```rust
// Security: user explicitly chose this file. Validate only that the path is
// canonical (resolves without error), is a regular file, and is not a symlink.
#[tauri::command]
pub async fn read_user_file(path: String) -> Result<String, String> {
    let candidate = std::path::Path::new(&path);
    let canonical = std::fs::canonicalize(candidate)
        .map_err(|e| format!("Cannot canonicalize path: {e}"))?;
    let metadata = std::fs::symlink_metadata(&canonical)
        .map_err(|e| format!("Cannot stat path: {e}"))?;
    if metadata.file_type().is_symlink() {
        return Err("Symlinks are not allowed".to_string());
    }
    if !metadata.is_file() {
        return Err(format!("Not a regular file: {path}"));
    }
    std::fs::read_to_string(&canonical)
        .map_err(|e| format!("Read failed: {e}"))
}
```

Registration in `lib.rs`: add `fs::read_user_file` to `generate_handler![]`.

**Security model:** the user typed the path into the config form — they explicitly chose this file. The only invariants worth enforcing are: the path canonicalizes (file actually exists), it's a regular file (not a device file), and it's not a symlink (consistent with the existing `list_files` policy at `fs.rs:120`). No scope check — scope is the user's intent.

**Pros:**
- Honest contract: "user-selected file, anywhere on disk."
- Reusable for v109.3 (package-dependency JSON), v109.4 (CSV edge list), and any future single-file adapter — these all have the same `filePath: string` config pattern (`baseSourceAdapter.ts:48-56`).
- Consistent with the no-symlink policy already in `list_files` (`fs.rs:120`).
- The security audit surface is ~15 Rust lines, fully auditable by eyeball.
- Frontend wrapper in `singleFileAdapter.ts`: replace the existing `readFile()` or add `readUserFile()` as a second protected method. The adapter opts in explicitly.

**Cons:**
- One more Tauri command to maintain (~15 Rust lines + registration).
- No scope restriction — user can theoretically type any path. But this is the honest model: if the user typed `/etc/passwd`, they chose that file. The Tauri capability system (Tauri 2's `allowlist`) would be the right layer for OS-level path restrictions, and we're not using it here — consistent with the existing `read_vault_file` model.

**Cost:** ~15 Rust lines in `fs.rs` + 1 line in `lib.rs` + 3-5 lines in `singleFileAdapter.ts` (add `readUserFile()` method). Total: ~20 lines.

### Option C: Reuse `read_file` (project-root constraint)

Defeated by the Kirby-move principle — users can't load their own external Cytoscape exports. Strongly recommend against. Not analyzed further.

### Recommendation: **Option B**

Option B is the right call for the following reasons:

1. **Semantic honesty.** "Read the file the user explicitly chose" is a distinct security model from "read a file within a scoped directory." Using `read_vault_file` to pretend the model is scoped when it isn't would be misleading to future readers of the Rust code.

2. **Reuse value is high.** `CsvEdgeListConfig.filePath` and `PackageDependencyConfig.projectPath` (`baseSourceAdapter.ts:43-56`) both involve user-supplied paths outside the project root. Option B gives all three adapters a clean shared primitive. Option A would require the same parent-dir hack in all three places.

3. **Audit surface is tiny.** ~15 lines, structurally identical to the existing `read_vault_file`. Any reviewer can audit it in 30 seconds.

4. **No symlink following.** Option B explicitly checks `symlink_metadata` (like `list_files` at `fs.rs:119-120`). Option A would delegate to `read_vault_file`, which uses `canonicalize` (implicitly follows symlinks to check containment). The explicit check in B is tighter.

**Implementation note:** add `readUserFile(path: string)` as a second protected method in `singleFileAdapter.ts` alongside the existing `readFile()`. Don't replace `readFile()` — the self-graph adapter (and any future adapter that legitimately reads project-local files) still uses it.

**Difficulty: LOW** — ~20 total lines across two files.

---

## §5 — UI Form

Form component: `src/source-adapter/adapters/CytoscapeJsonConfigForm.tsx`

Pattern: identical to `MarkdownVaultConfigForm.tsx` (`src/source-adapter/adapters/MarkdownVaultConfigForm.tsx:1-31`) — one text input, side-effect registration at module load.

```tsx
// ~30 lines
import { registerAdapterConfigForm } from "../adapterConfigFormRegistry";
import type { AdapterConfigFormProps } from "../adapterConfigFormRegistry";
import type { CytoscapeJsonConfig } from "../baseSourceAdapter";

function CytoscapeJsonConfigForm({ config, onChange }: AdapterConfigFormProps<CytoscapeJsonConfig>) {
  return (
    <div data-testid="adapter-config-cytoscape-json">
      <label>
        File path
        <input
          data-testid="adapter-config-cytoscape-file-path"
          type="text"
          value={config.filePath ?? ""}
          onChange={(e) => onChange({ filePath: e.target.value })}
          placeholder="/path/to/graph.json"
        />
      </label>
    </div>
  );
}

registerAdapterConfigForm("cytoscape-json", CytoscapeJsonConfigForm);
```

The adapter imports this file for its side effect (same as `markdownVaultAdapter.ts:17`).

No file-picker dialog for v1.0 — confirmed decision from v109.0 brief.

**Difficulty: LOW** — ~30 lines, mechanical.

---

## §6 — Fixture File Design for E2E

Fixture path: `tests/fixtures/cytoscape/sample-graph.json`

Design covers all required test cases:
- 10 unique nodes, 14 valid edges (after dedup and orphan removal)
- 1 duplicate node ID (second `n2` entry — keep first, warn)
- 1 orphan edge (references `n999` which doesn't exist — skip, warn)
- 1 node with custom data fields (weight, color — verify `raw.cytoscapeData` passthrough)
- 1 edge with `weight` and `label` (verify `relationship` and `raw.cytoscapeData.weight`)
- 1 node with `position` (verify `raw.position` passthrough)

```json
{
  "elements": {
    "nodes": [
      { "data": { "id": "n1", "label": "Alpha" }, "position": { "x": 100, "y": 200 } },
      { "data": { "id": "n2", "label": "Beta", "weight": 5, "color": "red" } },
      { "data": { "id": "n3", "label": "Gamma" } },
      { "data": { "id": "n4", "label": "Delta" } },
      { "data": { "id": "n5", "label": "Epsilon" } },
      { "data": { "id": "n6", "label": "Zeta" } },
      { "data": { "id": "n7", "label": "Eta" } },
      { "data": { "id": "n8", "label": "Theta" } },
      { "data": { "id": "n9", "label": "Iota" } },
      { "data": { "id": "n10", "label": "Kappa" } },
      { "data": { "id": "n2", "label": "Beta-duplicate" } }
    ],
    "edges": [
      { "data": { "id": "e1",  "source": "n1",  "target": "n2",  "weight": 0.8, "label": "calls" } },
      { "data": { "id": "e2",  "source": "n2",  "target": "n3" } },
      { "data": { "id": "e3",  "source": "n3",  "target": "n4" } },
      { "data": { "id": "e4",  "source": "n4",  "target": "n5" } },
      { "data": { "id": "e5",  "source": "n5",  "target": "n6" } },
      { "data": { "id": "e6",  "source": "n6",  "target": "n7" } },
      { "data": { "id": "e7",  "source": "n7",  "target": "n8" } },
      { "data": { "id": "e8",  "source": "n8",  "target": "n9" } },
      { "data": { "id": "e9",  "source": "n9",  "target": "n10" } },
      { "data": { "id": "e10", "source": "n10", "target": "n1" } },
      { "data": { "id": "e11", "source": "n1",  "target": "n3" } },
      { "data": { "id": "e12", "source": "n2",  "target": "n4" } },
      { "data": { "id": "e13", "source": "n3",  "target": "n5" } },
      { "data": { "id": "e14", "source": "n4",  "target": "n6" } },
      { "data": { "id": "e15", "source": "n999","target": "n1" } }
    ]
  }
}
```

**Expected counts:** 10 nodes (11 in file, 1 deduped), 14 edges (15 in file, 1 orphan skipped)

**E2E spec asserts:**

```typescript
// tests/e2e/cytoscape-json-adapter.spec.ts
test("loads sample-graph.json: counts", async ({ page }) => {
  // Set active adapter to cytoscape-json, configure filePath to fixture path
  // After load:
  expect(normalizedNodeCount).toBe(10);   // 11 in fixture, 1 duplicate removed
  expect(normalizedEdgeCount).toBe(14);   // 15 in fixture, 1 orphan removed
});

test("loads sample-graph.json: duplicate warning", async ({ page }) => {
  expect(warnings).toContain(/* "Duplicate node id \"n2\"" */);
});

test("loads sample-graph.json: orphan warning", async ({ page }) => {
  expect(warnings).toContain(/* "Edge \"e15\" references missing node" */);
});

test("loads sample-graph.json: custom data passthrough", async ({ page }) => {
  // n2 raw.cytoscapeData should contain weight=5 and color="red"
  const n2 = normalizedNodes.find(n => n.id === "n2");
  expect(n2.raw.cytoscapeData).toMatchObject({ weight: 5, color: "red" });
});

test("loads sample-graph.json: position passthrough", async ({ page }) => {
  const n1 = normalizedNodes.find(n => n.id === "n1");
  expect(n1.raw.position).toEqual({ x: 100, y: 200 });
});

test("loads sample-graph.json: edge relationship and weight", async ({ page }) => {
  const e1 = normalizedEdges.find(e => e.id === "e1");
  expect(e1.relationship).toBe("calls");
  expect(e1.raw.cytoscapeData).toMatchObject({ weight: 0.8 });
});
```

**Difficulty: LOW** — fixture design is mechanical; E2E spec follows the markdown-vault pattern.

---

## §7 — Pre-Flight Decisions for Ryan

Each item is: **question** · **recommendation** · **key reason**

| # | Question | Recommendation | Key reason |
|---|----------|----------------|------------|
| 1 | Tauri command for user-supplied file paths: A (parent-dir hack with `read_vault_file`), B (new `read_user_file`), or C (project-root only)? | **Option B** — new `read_user_file` command | Semantically honest, reusable for v109.3/v109.4, ~20 lines total, consistent with no-symlink policy |
| 2 | Label fallback chain when `data.label` absent? | **`data.label` → `data.name` → `data.id`** | `data.name` is common in Desktop/biomedical exports; `data.id` is always present per spec |
| 3 | `type` field on nodes/edges? | **Always `"node"` / `"edge"`** — no derivation from `data.type` | Cytoscape `data.type` is user-defined with no structural meaning; promoting it creates an implicit LumaWeave contract |
| 4 | Should any Cytoscape `data` fields be promoted to top-level LumaWeave node fields (e.g. `weight`, `color`)? | **No promotions** — all non-structural `data` fields go into `raw.cytoscapeData` | `LumaWeaveNodeDraft` has no such fields; rendering pipeline reads `raw` for extensions; markdown-vault precedent confirms this approach |
| 5 | Where does the Cytoscape edge `data.id` go? | **Top-level `LumaWeaveEdgeDraft.id`** (not `raw.edgeId`) | `LumaWeaveEdgeDraft.id` is a required `string` field (`graph.types.ts:16`); `data.id` is always present per spec |
| 6 | Older Cytoscape Desktop format (`.cyjs` with `format_version` marker): parse or error? | **Detect-and-error** | Clear errors are better than wrong silent loads; format differences are non-trivial |
| 7 | Truncation order for 2000-node cap? | **First 2000 in file order** | Only stable deterministic ordering available; degree-sort adds two-pass complexity with no clear win |
| 8 | `maxNodes` audible-ignore? | **Yes — same pattern as markdown-vault D4** | Config field can be added to `CytoscapeJsonConfig` later if needed; hardcode 2000 for v1.0 |
| 9 | Sister-format permissiveness (NetworkX, JGF, D3): try to detect or strict `elements` required? | **Strict — require `elements` key** | Clear errors beat silent wrong parses; sister formats are separate adapter candidates for v110+ |
| 10 | Support flat array form of `elements` (Cytoscape.js `[{group, data}, ...]`)? | **Yes — both forms are native Cytoscape.js JSON** | The flat form is common in programmatic exports; not handling it would surprise users generating graphs via the Cytoscape.js API |

---

## §8 — Recommended Pass Shape

### Summary assessment

Cytoscape JSON is simpler than markdown-vault by a significant margin:
- No directory traversal (single file)
- No wikilink resolution algorithm (no cross-reference between elements)
- No frontmatter/inline parsing (all data is already structured JSON)
- No date-based sorting (file order truncation is trivial)
- Main algorithmic work: format gate + field mapping + orphan/duplicate detection

**Estimated total scope:** one working day (~4–6 hours). 3 commits if Option B lands, 2 if not.

### Commit structure (Option B — recommended)

**Commit 1 — Tauri `read_user_file` command**
- `src-tauri/src/fs.rs`: add `read_user_file()` (~15 lines)
- `src-tauri/src/lib.rs`: register the command (1 line)
- `src/source-adapter/singleFileAdapter.ts`: add `readUserFile()` protected method (~3 lines)
- Hard dependency: must land before Commit 2

**Commit 2 — Adapter, form, registration**
- `src/source-adapter/adapters/cytoscapeJsonAdapter.ts`: full adapter implementation (~120–150 lines)
- `src/source-adapter/adapters/CytoscapeJsonConfigForm.tsx`: config form (~30 lines)
- `src/source-adapter/sourceAdapterRegistry.ts`: add cytoscape-json entry with `status: "registered"` + real loader
- Hard dependency on Commit 1

**Commit 3 — Fixture, E2E spec, arc-step**
- `tests/fixtures/cytoscape/sample-graph.json`: fixture file
- `tests/e2e/cytoscape-json-adapter.spec.ts`: E2E spec
- `docs/LUMAWEAVE_NOW.md`: arc-step bump to v109.2
- Hard dependency on Commit 2

### Hard sequencing dependencies

```
Commit 1 (read_user_file)
  └── Commit 2 (adapter + form + registry)
        └── Commit 3 (fixture + E2E + NOW.md)
```

No parallelism possible — each commit depends on the previous.

### Difficulty ratings

| Section | Difficulty | Notes |
|---------|-----------|-------|
| §1 Platform fit | LOW | Config already in union; adapter shell is mechanical |
| §2 Format ecosystem | LOW | Straightforward structural checks; both nested + flat forms needed |
| §3 Field mapping | LOW | Mapping is direct; the flat-array normalization step is the only non-trivial part |
| §4 Tauri command | LOW | ~20 lines Rust + TS; structurally identical to existing `read_vault_file` |
| §5 UI form | LOW | ~30 lines, direct copy of MarkdownVaultConfigForm pattern |
| §6 Fixture + E2E | LOW | Fixture is hand-authored; E2E spec follows markdown-vault pattern |
| Overall | **LOW** | v109.2 is the simplest full adapter in the planned v109 arc |

---

*Report complete. Planning Claude can scope the v109.2 implementation pass from this.*
