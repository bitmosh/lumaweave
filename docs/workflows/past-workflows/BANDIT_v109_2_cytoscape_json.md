# Bandit — v109.2: Cytoscape JSON adapter

Second adapter on the v109.0 platform. First SingleFileAdapter case. Implements per `docs/workflows/v109_2_cytoscape_json_report.md` v1.0. Three commits, merge gates between each.

Basis: report + v109.0/v109.1 commits (`087a10e` → `7d7e976`).

Generic rules: `~/Projects/CLAUDE.md`; project rules; Discord protocol.

## ⏩ BANDIT PASS PREFACE (each commit)
0. Discord MCP else HALT. 1. START→#current-task. 2. Work+verify. 3. END→#current-task. 4. MERGE GATE→#approve-this. 5. END-OF-RUN REPORT→#changelog w/ SHA. 6. BUMP+PUSH GATE→#approve-this.

No semver bump (arc-close at v109.5 or later).

## Locked decisions (Ryan-confirmed)

| # | Locked |
|---|---|
| 1 | Tauri: new `read_user_file(path)` command (Option B) |
| 2 | Label fallback: `data.label` → `data.name` → `data.id` |
| 3 | `type: "node" \| "edge"` always — no derivation from `data.type` |
| 4 | No field promotion — all non-structural `data` fields → `raw.cytoscapeData` |
| 5 | Edge `data.id` → `LumaWeaveEdgeDraft.id` (top-level, NOT `raw.edgeId`) |
| 6 | Cytoscape Desktop format: detect-and-error (don't parse) |
| 7 | Truncation: first 2000 in file order |
| 8 | `maxNodes` audible-ignore (same as markdown-vault D4) |
| 9 | Sister formats (NetworkX/JGF/D3): strict `elements` required, clear error otherwise |
| 10 | Support BOTH nested `{nodes,edges}` AND flat `[{group,data}]` forms (both native) |

Targeted-test-scope convention applies — no full-suite runs.

---

## Commit 1 — `feat(v109.2.0): read_user_file Tauri command + SingleFileAdapter.readUserFile()`

New Tauri command for user-supplied absolute paths (no scope restriction; canonicalize + regular-file + no-symlink). Extends SingleFileAdapter with a `readUserFile()` method. ~20 lines Rust, ~5 lines TS.

### Files
- `src-tauri/src/fs.rs` — add `read_user_file` command
- `src-tauri/src/lib.rs` — register in `invoke_handler!`
- `src/lib/tauri-invoke.ts` — add `invokeReadUserFile(path)` typed wrapper through `__lwTauriMock` shim
- `src/source-adapter/singleFileAdapter.ts` — add `protected readUserFile(path)` method

### Pre-flight (STOP if diverges)
1. Confirm v109.1.2 (`7d7e976`) is on HEAD.
2. Quote the v108 `read_file` Rust block — we're paralleling it.
3. Confirm no Cargo.toml changes needed (using `std::fs` only).
4. Confirm `tauri-invoke.ts` location matches prior commits.

### Rust

```rust
// Security: caller supplies absolute path. Validate: canonicalizable,
// regular file (not directory/device), not a symlink. NO scope restriction —
// the user picked the file via the form; we trust that intent.
#[tauri::command]
pub async fn read_user_file(path: String) -> Result<String, String> {
    let canonical = std::fs::canonicalize(&path)
        .map_err(|e| format!("Cannot canonicalize path: {e}"))?;
    // Reject symlinks (caller could have specified one; canonicalize follows them,
    // but we want to reject even reaching the file through a symlink).
    let metadata = std::fs::symlink_metadata(&path)
        .map_err(|e| format!("Cannot stat path: {e}"))?;
    if metadata.file_type().is_symlink() {
        return Err(format!("Symlinks not permitted: {path}"));
    }
    let final_metadata = std::fs::metadata(&canonical)
        .map_err(|e| format!("Cannot stat canonical path: {e}"))?;
    if !final_metadata.is_file() {
        return Err(format!("Not a regular file: {path}"));
    }
    std::fs::read_to_string(&canonical)
        .map_err(|e| format!("Read failed: {e}"))
}
```

Register in `lib.rs` `invoke_handler!` alongside the existing commands.

### Frontend wrapper

```typescript
export async function invokeReadUserFile(path: string): Promise<string> {
  return invoke<string>("read_user_file", { path });
}
```

Through the same `__lwTauriMock` path used by v108/v109.0.3.

### SingleFileAdapter extension

```typescript
// singleFileAdapter.ts — add alongside existing readFile()
protected async readUserFile(path: string): Promise<string> {
  return invokeReadUserFile(path);
}
```

### Verify
- `cd src-tauri && cargo check`
- `npm run typecheck`
- `npx playwright test tests/e2e/source-adapter.spec.ts --reporter=line` (sanity — should be unchanged)

### Manual smoke (Ryan, in Tauri devtools console)
```javascript
// Should succeed (returns file contents):
window.__TAURI_INTERNALS__.invoke("read_user_file", { path: "/tmp/test.txt" })
  .then(r => console.log("OK:", r.slice(0, 100)))
  .catch(e => console.log("ERROR:", e));

// Should fail (symlink rejection, if /tmp has a symlink available):
// And should fail (directory not allowed):
window.__TAURI_INTERNALS__.invoke("read_user_file", { path: "/tmp" })
  .then(r => console.log("UNEXPECTED OK:", r))
  .catch(e => console.log("ERROR (expected):", e));
```
First should return text. Second should return "Not a regular file: /tmp" or similar.

### Commit
MERGE GATE → `feat(v109.2.0): read_user_file Tauri command + SingleFileAdapter.readUserFile()` → END-OF-RUN REPORT → bump+push gate.

### Hard stops
- Cargo.toml unchanged. No new crates.
- No symlink-following.
- The Rust must be reviewable by eyeball (~20 lines).
- If anything in the verify step is red, STOP.

---

## Commit 2 — `feat(v109.2.1): cytoscape-json adapter implementation + form + registration`

### Files
- `src/source-adapter/adapters/cytoscapeJsonAdapter.ts` — NEW. Loader + adapter class.
- `src/source-adapter/adapters/CytoscapeJsonConfigForm.tsx` — NEW. Single file-path text input + `registerAdapterConfigForm` call.
- `src/source-adapter/sourceAdapterRegistry.ts` — MODIFIED. Add `cytoscape-json` registry entry with `status: "registered"` + real loader (replaces any candidate stub if present, or adds new entry).
- Init file (per pre-flight, likely `src/main.tsx` or wherever v109.1.0 added the markdown-vault side-effect import) — MODIFIED. Add `import "./source-adapter/adapters/cytoscapeJsonAdapter"`.

### Pre-flight (STOP if diverges)
1. Confirm Commit 1 on HEAD.
2. Confirm `CytoscapeJsonConfig` in `baseSourceAdapter.ts` — quote.
3. Confirm `LumaWeaveEdgeDraft.id` is required string per report §3.1.
4. Confirm whether `cytoscape-json` exists as a candidate in the registry currently. If yes: modify in place. If no: add new entry.
5. Locate the side-effect-import file used in v109.1 — quote the markdown-vault import line.

### Adapter implementation outline

```typescript
const MAX_NODES = 2000;

class CytoscapeJsonAdapter extends SingleFileAdapter {
  async load(config: AdapterConfig): Promise<GraphSourceSummary> {
    if (config.adapterId !== "cytoscape-json") {
      return errorSummary(config.adapterId, "cytoscape-json", "Adapter dispatch mismatch");
    }
    const cfg = config as CytoscapeJsonConfig;
    if (!cfg.filePath?.trim()) {
      return errorSummary("cytoscape-json", "cytoscape-json", "File path not configured");
    }
    
    const warnings: string[] = [];
    
    // D8 audible-ignore for maxNodes config field (not honored in v1.0)
    if ((cfg as any).maxNodes && (cfg as any).maxNodes !== MAX_NODES) {
      warnings.push(`maxNodes config override not honored in v1.0; using default ${MAX_NODES}.`);
    }
    
    let raw: string;
    try {
      raw = await this.readUserFile(cfg.filePath);
    } catch (err) {
      return errorSummary("cytoscape-json", "cytoscape-json", `Cannot read file: ${err}`);
    }
    
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      return errorSummary("cytoscape-json", "cytoscape-json", `Invalid JSON: ${err}`);
    }
    
    // Format-identification gate (report §2.4)
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return errorSummary("cytoscape-json", "cytoscape-json", "Root must be a JSON object");
    }
    if (parsed.format_version !== undefined || (typeof parsed.generated_by === "string" && parsed.generated_by.includes("cytoscape-"))) {
      return errorSummary("cytoscape-json", "cytoscape-json",
        "Cytoscape Desktop format detected; this adapter supports Cytoscape.js JSON (js.cytoscape.org). Re-export via Cytoscape.js.");
    }
    if (parsed.elements === undefined) {
      return errorSummary("cytoscape-json", "cytoscape-json", "Missing required `elements` key — not a Cytoscape.js JSON file");
    }
    
    // Normalize both forms (D10) into {nodes: [...], edges: [...]}
    const { nodeItems, edgeItems } = normalizeElements(parsed.elements, warnings);
    
    // Build nodes with deduplication
    const seenIds = new Set<string>();
    const nodes: LumaWeaveNodeDraft[] = [];
    for (const item of nodeItems.slice(0, MAX_NODES)) {
      const data = item.data ?? {};
      const id = data.id;
      if (typeof id !== "string" || !id) {
        warnings.push(`Node missing or invalid id; skipped`);
        continue;
      }
      if (seenIds.has(id)) {
        warnings.push(`Duplicate node id "${id}"; keeping first occurrence`);
        continue;
      }
      seenIds.add(id);
      const { id: _id, label, name, ...rest } = data;
      nodes.push({
        id,
        label: typeof label === "string" ? label : (typeof name === "string" ? name : id),
        type: "node",
        raw: {
          kind: "node",
          sourceAdapter: "cytoscape-json",
          cytoscapeData: rest,
          ...(item.position ? { position: item.position } : {}),
          ...(typeof item.classes === "string" ? { classes: item.classes } : {}),
        },
      });
    }
    
    if (nodeItems.length > MAX_NODES) {
      warnings.push(`File contains ${nodeItems.length} nodes; first ${MAX_NODES} kept, ${nodeItems.length - MAX_NODES} discarded.`);
    }
    
    // Build edges, skipping orphans
    const edges: LumaWeaveEdgeDraft[] = [];
    for (const item of edgeItems) {
      const data = item.data ?? {};
      const id = data.id;
      const source = data.source;
      const target = data.target;
      if (typeof id !== "string" || !id) {
        warnings.push(`Edge missing or invalid id; skipped`);
        continue;
      }
      if (typeof source !== "string" || typeof target !== "string") {
        warnings.push(`Edge "${id}" missing source or target; skipped`);
        continue;
      }
      if (!seenIds.has(source) || !seenIds.has(target)) {
        warnings.push(`Edge "${id}" references missing node; skipped`);
        continue;
      }
      const { id: _id, source: _s, target: _t, label, ...rest } = data;
      edges.push({
        id,
        source,
        target,
        type: "edge",
        relationship: typeof label === "string" ? label : undefined,
        raw: {
          sourceAdapter: "cytoscape-json",
          cytoscapeData: rest,
        },
      });
    }
    
    return {
      status: "loaded",
      sourceId: "cytoscape-json",
      sourcePath: cfg.filePath,
      label: `Cytoscape JSON: ${cfg.filePath}`,
      normalizedNodes: nodes,
      normalizedEdges: edges,
      rawNodes: undefined,
      rawEdges: undefined,
      warnings,
    };
  }
}

// Helper: normalize either form into nodeItems[] + edgeItems[]
function normalizeElements(elements: unknown, warnings: string[]): { nodeItems: any[]; edgeItems: any[] } {
  if (Array.isArray(elements)) {
    // Flat form: [{group: "nodes" | "edges", data: ...}]
    const nodeItems: any[] = [];
    const edgeItems: any[] = [];
    for (const item of elements) {
      if (!item || typeof item !== "object") continue;
      const group = item.group;
      if (group === "nodes") nodeItems.push(item);
      else if (group === "edges") edgeItems.push(item);
      else {
        warnings.push(`Flat-form element missing/unknown group field; treating as node`);
        nodeItems.push(item);
      }
    }
    return { nodeItems, edgeItems };
  }
  if (typeof elements === "object" && elements !== null) {
    // Nested form: {nodes: [...], edges: [...]}
    const obj = elements as any;
    return {
      nodeItems: Array.isArray(obj.nodes) ? obj.nodes : [],
      edgeItems: Array.isArray(obj.edges) ? obj.edges : [],
    };
  }
  warnings.push("elements field must be object or array");
  return { nodeItems: [], edgeItems: [] };
}

const adapterInstance = new CytoscapeJsonAdapter();
export const loadCytoscapeJson: LoaderFn = (config) => adapterInstance.load(config);
```

### Form (mirrors MarkdownVaultConfigForm pattern)

```tsx
export function CytoscapeJsonConfigForm({ config, onChange }: AdapterConfigFormProps<CytoscapeJsonConfig>) {
  return (
    <div className="lw-cytoscape-config">
      <label htmlFor="cytoscape-file-path" className="text-xs text-gray-300 block mb-1">File path</label>
      <input
        id="cytoscape-file-path"
        type="text"
        data-testid="adapter-config-cytoscape-file-path"
        value={config.filePath ?? ""}
        onChange={(e) => onChange({ filePath: e.target.value })}
        placeholder="/home/user/exports/graph.json"
        className="lw-text-input w-full"
      />
      <p className="text-xs text-gray-500 mt-1">Absolute path to a Cytoscape.js JSON file.</p>
    </div>
  );
}
registerAdapterConfigForm("cytoscape-json", CytoscapeJsonConfigForm as React.FC<AdapterConfigFormProps>);
```

### Registry update

If `cytoscape-json` is currently a candidate: change status `"candidate"` → `"registered"`, replace `candidateNoOpLoader` with `loadCytoscapeJson`. If not present: add new entry following the markdown-vault pattern.

### Verify
- `npm run typecheck`
- `npx playwright test tests/e2e/source-adapter.spec.ts --reporter=line` — existing tests still pass (registry now shows 3 registered + N candidates)

### Manual smoke
- Open SourceAdapterPanel — `cytoscape-json` entry registered.
- Set as active — form shows file-path input.
- Enter a real path to a Cytoscape JSON file (Ryan picks; or skip and verify in v109.2.2 with the fixture).

### Commit
MERGE GATE → `feat(v109.2.1): cytoscape-json adapter — both nested+flat forms, dedup, orphan skip, format detection` → END-OF-RUN REPORT → bump+push gate.

### Hard stops
- No new deps. No new Rust.
- D5 locked: edge id at top-level, NOT `raw.edgeId`.
- D4 locked: no field promotion — all non-structural goes to `raw.cytoscapeData`.
- D10 locked: BOTH forms must work; the `normalizeElements` helper is the load-bearing piece.
- Detect-and-error for Cytoscape Desktop format — don't try to parse.
- Strict `elements` key required.

---

## Commit 3 — `feat(v109.2.2): cytoscape-json fixture + E2E + arc-step docs`

### Files
- `tests/fixtures/cytoscape/sample-graph.json` — NEW. 11 nodes (1 duplicate), 15 edges (1 orphan), one node with custom data + position. Per report §6.
- `tests/fixtures/cytoscape/flat-form.json` — NEW. Smaller fixture in flat-array form (4 nodes, 3 edges) to verify normalizeElements.
- `tests/fixtures/cytoscape/desktop-format.json` — NEW. Minimal file with `format_version` field for detect-and-error test.
- `tests/e2e/cytoscape-json-adapter.spec.ts` — NEW. Test counts, dedup warning, orphan warning, data passthrough, position passthrough, edge relationship, BOTH forms load, Desktop format errors clearly.
- `docs/LUMAWEAVE_NOW.md` — MODIFIED. v109.2 row added with 3 commit SHAs; mark `[COMPLETE]`; mark v109.3 (package-dependency) as `[NEXT]`. Architectural notes: `read_user_file` command added; both Cytoscape forms supported; Desktop format detected-and-errored.

### Pre-flight (STOP if diverges)
1. Confirm Commits 1+2 on HEAD.
2. Confirm `tests/fixtures/markdown-vault/` exists from v109.1.1 (verify the fixture directory pattern).
3. Quote the v109.1 markdown-vault E2E spec structure — we're paralleling it.

### Fixture: sample-graph.json (nested form)

Per report §6: 11 nodes including 1 duplicate (`n2` appears twice), 15 edges including 1 orphan (`e15` source = `n999` which doesn't exist). Use the report's listing verbatim.

### Fixture: flat-form.json (flat array form)

```json
{
  "elements": [
    { "group": "nodes", "data": { "id": "a", "label": "Alpha" } },
    { "group": "nodes", "data": { "id": "b", "label": "Beta" } },
    { "group": "nodes", "data": { "id": "c", "label": "Gamma" } },
    { "group": "nodes", "data": { "id": "d", "label": "Delta" } },
    { "group": "edges", "data": { "id": "ab", "source": "a", "target": "b" } },
    { "group": "edges", "data": { "id": "bc", "source": "b", "target": "c" } },
    { "group": "edges", "data": { "id": "cd", "source": "c", "target": "d" } }
  ]
}
```

### Fixture: desktop-format.json

```json
{
  "format_version": "1.0",
  "generated_by": "cytoscape-3.9.0",
  "elements": { "nodes": [], "edges": [] }
}
```

Expected: error summary; no nodes/edges loaded.

### E2E spec

Mirror the v109.1 markdown-vault spec pattern. Key assertions per report §6 + locked decisions:

```typescript
import { test, expect } from "@playwright/test";
import path from "node:path";

const FIXTURE_DIR = path.resolve(__dirname, "../fixtures/cytoscape");

async function loadFixture(page, filename: string) {
  const filePath = path.join(FIXTURE_DIR, filename);
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.evaluate((fp) => {
    const store = (window as any).__lwStore;
    store.getState().setSetting("sources.active", "cytoscape-json");
    store.getState().setSetting("sources.configurations", {
      ...store.getState().settings.sources.configurations,
      "cytoscape-json": { adapterId: "cytoscape-json", filePath: fp },
    });
  }, filePath);
  await page.waitForFunction(() => {
    const s = (window as any).__lwGraphSummary;
    return s && (s.status === "loaded" || s.status === "error");
  }, { timeout: 10000 });
  return await page.evaluate(() => (window as any).__lwGraphSummary);
}

test("nested form: counts after dedup+orphan-skip", async ({ page }) => {
  const s = await loadFixture(page, "sample-graph.json");
  expect(s.status).toBe("loaded");
  expect(s.normalizedNodes).toHaveLength(10);  // 11 - 1 dup
  expect(s.normalizedEdges).toHaveLength(14);  // 15 - 1 orphan
});

test("nested form: dedup + orphan warnings", async ({ page }) => {
  const s = await loadFixture(page, "sample-graph.json");
  expect(s.warnings.some(w => /Duplicate node id.*n2/.test(w))).toBe(true);
  expect(s.warnings.some(w => /Edge.*e15.*missing node/.test(w))).toBe(true);
});

test("data passthrough: n2 has custom fields in raw.cytoscapeData", async ({ page }) => {
  const s = await loadFixture(page, "sample-graph.json");
  const n2 = s.normalizedNodes.find((n: any) => n.id === "n2");
  expect(n2.raw.cytoscapeData).toMatchObject({ weight: 5, color: "red" });
});

test("position passthrough", async ({ page }) => {
  const s = await loadFixture(page, "sample-graph.json");
  const n1 = s.normalizedNodes.find((n: any) => n.id === "n1");
  expect(n1.raw.position).toEqual({ x: 100, y: 200 });
});

test("edge relationship from label", async ({ page }) => {
  const s = await loadFixture(page, "sample-graph.json");
  const e1 = s.normalizedEdges.find((e: any) => e.id === "e1");
  expect(e1.relationship).toBe("calls");
});

test("flat-array form loads correctly", async ({ page }) => {
  const s = await loadFixture(page, "flat-form.json");
  expect(s.status).toBe("loaded");
  expect(s.normalizedNodes).toHaveLength(4);
  expect(s.normalizedEdges).toHaveLength(3);
});

test("Cytoscape Desktop format rejected with clear error", async ({ page }) => {
  const s = await loadFixture(page, "desktop-format.json");
  expect(s.status).toBe("error");
  expect(s.error).toMatch(/Cytoscape Desktop/i);
});
```

### Verify
- `npm run typecheck`
- `npx playwright test tests/e2e/cytoscape-json-adapter.spec.ts --reporter=line` — all 7 tests pass
- `npx playwright test tests/e2e/source-adapter.spec.ts --reporter=line` — 10 still pass
- `npx playwright test tests/e2e/markdown-vault.spec.ts --reporter=line` — 2 still pass (no regression)

### Manual smoke
- Point at a real Cytoscape JSON export if available; otherwise the fixture-load through the UI is sufficient.

### NOW.md update

Add to the v109 open-arc table:
- `v109.2.0` (Tauri command) — SHA
- `v109.2.1` (adapter+form+registry) — SHA
- `v109.2.2` (fixture+E2E+docs) — SHA

Mark v109.2 `[COMPLETE]`; mark v109.3 (package-dependency) `[NEXT]`.

Architectural notes section:
- `read_user_file` Tauri command added for user-supplied absolute paths; symlinks rejected, regular files only, no scope restriction. Reusable for v109.3/v109.4.
- Both nested `{nodes,edges}` and flat `[{group,data}]` forms of Cytoscape.js JSON supported via `normalizeElements` helper.
- Cytoscape Desktop `.cyjs` format detected via `format_version`/`generated_by` markers and rejected with clear error — re-export via Cytoscape.js recommended.

### Commit
MERGE GATE → `feat(v109.2.2): cytoscape-json fixture + E2E + arc-step docs (v109.2 complete)` → END-OF-RUN REPORT → bump+push gate.

### Hard stops
- All 7 E2E tests must pass.
- D6 hard stop: Desktop-format fixture MUST produce error status, not loaded.
- D10 hard stop: flat-form fixture MUST load correctly.
- Preserve markdown-vault E2E baseline.

---

## END-OF-RUN REPORT (each commit)

Files committed, pre-flight findings, verification results, manual smoke notes, divergences.

**Final report (after Commit 3):**
- Landed-state audit across 3 commits
- cytoscape-json status: `registered`
- v109.2 complete; v109.3 (package-dependency) is next
- v110 candidates: nothing new from this arc

## Hard stops (arc-level)
- Targeted-test-scope only.
- No installs. No new deps.
- No semver bump.
- Explicit-path git. Discord MCP only.
- The `read_user_file` Rust must stay reviewable by eyeball.
- `LumaWeaveEdgeDraft.id` is top-level required — don't put edge IDs in `raw`.
- Both Cytoscape forms — the `normalizeElements` is non-negotiable.
- Desktop format → detect-and-error, never attempt parse.
- If any pre-flight check fails: STOP and ask. Don't paper over.
