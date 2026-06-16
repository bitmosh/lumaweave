# Bandit — v109.4: CSV edge-list adapter

Fourth and final concrete adapter in the v109 arc. SingleFileAdapter family, simplest input format. Implements per `docs/workflows/v109_4_csv_edge_list_report.md` v1.0. Two commits, merge gates between each.

Basis: report + v109.0/v109.1/v109.2/v109.3 commits (`087a10e` → `2b02181`).

Generic rules: `~/Projects/CLAUDE.md`; project: `~/Projects/lumaweave/CLAUDE.md`; Discord/gates: `~/Projects/DISCORD_PROTOCOL.md`.

## ⏩ BANDIT PASS PREFACE (each commit)
0. Discord MCP else HALT. 1. START→#current-task. 2. Work+verify. 3. END→#current-task. 4. MERGE GATE→#approve-this (1506441138612080680). 5. END-OF-RUN REPORT→#changelog w/ SHA. 6. BUMP+PUSH GATE→#approve-this.

No semver bump (arc-close at v109.5).

## Critical structural note from report §1

**csv-edge-list does NOT have a registry entry yet.** Unlike package-dependency (which was a candidate promoted to registered), this is a **fresh registration**. Consequences:
- `SourceAdapterType` union in `baseSourceAdapter.ts` likely needs `"csv-edge-list"` added (verify in pre-flight)
- `sourceAdapterRegistry.ts` adds a new `registerSourceAdapter(...)` call at module-init
- `source-adapter.spec.ts` entry count assertion goes 10 → **11** (genuine increment)

This is a real difference from v109.3. Easy to miss; high blast radius if missed.

## Locked decisions (from report §6 + Ryan-confirmed)

| # | Locked |
|---|---|
| 1 | Delimiter: single configurable, default `,`. NO auto-detect. |
| 2 | Column refs: single `string` field — interpreted as header name when `hasHeader: true`, numeric index when `false` |
| 3 | Parser: full RFC 4180 character-by-character state machine (~40 lines). NOT simple split. |
| 4 | Multi-line quoted fields: state machine handles literal newlines inside quoted cells |
| 5 | Malformed rows: skip + warn, hard cap on warning count (100) before whole-load failure |
| 6 | Empty source/target: skip + warn. Self-loops: silently allowed |
| 7 | Label column: optional; maps to `LumaWeaveEdgeDraft.relationship` |
| 8 | Node id: trimmed cell value, NO case normalization |
| 9 | Limits: 500-node cap (consistent with package-dependency), audible-ignore `maxNodes` config |
| 10 | Ship as `status: "registered"` (per §8 verdict — bar is clearable as scoped) |

**Targeted-test-scope + CI fast-jobs amendment applies.** Per-commit verifies only relevant E2E specs PLUS `typecheck` + `lint:css`. No full-suite runs.

---

## Commit 1 — `feat(v109.4.0): csv-edge-list adapter — RFC 4180 parser, header/no-header modes, label edges`

### Files (explicit paths only)

- `src/source-adapter/adapters/csvEdgeListAdapter.ts` — NEW. ~150 lines (adapter class + RFC 4180 state-machine parser).
- `src/source-adapter/adapters/CsvEdgeListConfigForm.tsx` — NEW. ~60 lines. Six fields: filePath, hasHeader, delimiter, sourceColumn, targetColumn, labelColumn.
- `src/source-adapter/baseSourceAdapter.ts` — MODIFIED. Add `"csv-edge-list"` to `SourceAdapterType` union if not already present (verify in pre-flight).
- `src/source-adapter/sourceAdapterRegistry.ts` — MODIFIED. Add fresh `registerSourceAdapter(csvEdgeListEntry, loadCsvEdgeList)` call. `status: "registered"`. Set `limits` matching the package-dependency precedent (`maxNodes: 500`, `maxEdges: 2000`, etc.). Add appropriate `inputPattern`, `qaReportFormat`, `translationSet` fields.
- Init file (per v109.1/v109.2/v109.3 pattern) — MODIFIED. Add `import "./source-adapter/adapters/csvEdgeListAdapter"` side-effect import.
- `tests/e2e/source-adapter.spec.ts` — MODIFIED. Entry count assertion: 10 → **11** (genuine increment).

### Pre-flight (verify, report, STOP if diverges)
1. Confirm v109.3.1 (commit `2b02181`) is on HEAD.
2. Confirm `CsvEdgeListConfig` shape at `baseSourceAdapter.ts`. Quote the lines. Expected:
   ```typescript
   { adapterId: "csv-edge-list"; filePath: string; hasHeader: boolean; delimiter: string; sourceColumn: string; targetColumn: string; labelColumn?: string }
   ```
3. **Confirm whether `SourceAdapterType` union includes `"csv-edge-list"`.** If yes, no type change needed. If no, this commit must add it to the union AND to any other discriminated-union type that references the adapter id (e.g. switch-statement exhaustiveness checks).
4. Confirm no `csv-edge-list` entry exists in `sourceAdapterRegistry.ts` currently (the report says it doesn't; verify by grep).
5. Quote a v109.3 registry entry (e.g. the package-dependency one) so the new entry's metadata fields match the established shape.
6. Confirm `loadCsvEdgeList` doesn't collide with any existing export.

### Adapter implementation outline

```typescript
// csvEdgeListAdapter.ts

import { SingleFileAdapter } from "../singleFileAdapter";
import type { AdapterConfig, CsvEdgeListConfig } from "../baseSourceAdapter";
import type {
  GraphSourceSummary,
  LumaWeaveNodeDraft,
  LumaWeaveEdgeDraft,
} from "../../graph/schema/graph.types";
import { makeErrorSummary } from "../adapterHelpers";  // or canonical helper location

const HARD_NODE_CAP = 500;
const HARD_WARNING_CAP = 100;  // beyond this, fail the load

class CsvEdgeListAdapter extends SingleFileAdapter {
  async load(config: AdapterConfig): Promise<GraphSourceSummary> {
    if (config.adapterId !== "csv-edge-list") {
      return makeErrorSummary("Adapter dispatch mismatch", "csv-edge-list", "");
    }
    const cfg = config as CsvEdgeListConfig;
    if (!cfg.filePath?.trim()) {
      return makeErrorSummary("File path not configured", "csv-edge-list", "");
    }
    
    const warnings: string[] = [];
    
    // D9: audible-ignore for maxNodes config override
    if ((cfg as any).maxNodes && (cfg as any).maxNodes !== HARD_NODE_CAP) {
      warnings.push(`maxNodes config override not honored in v1.0; using default ${HARD_NODE_CAP}.`);
    }
    
    let raw: string;
    try {
      raw = await this.readUserFile(cfg.filePath);
    } catch (err) {
      return makeErrorSummary(`Cannot read file: ${err}`, "csv-edge-list", cfg.filePath);
    }
    
    // Parse via RFC 4180 state machine (D3)
    const rows = parseCsv(raw, cfg.delimiter || ",");
    if (rows.length === 0) {
      return makeErrorSummary("File is empty", "csv-edge-list", cfg.filePath);
    }
    
    // Resolve column indices
    let headerRow: string[] | null = null;
    let dataRows: string[][];
    let sourceIdx: number;
    let targetIdx: number;
    let labelIdx: number | undefined;
    
    if (cfg.hasHeader) {
      headerRow = rows[0];
      dataRows = rows.slice(1);
      sourceIdx = headerRow.indexOf(cfg.sourceColumn);
      targetIdx = headerRow.indexOf(cfg.targetColumn);
      labelIdx = cfg.labelColumn ? headerRow.indexOf(cfg.labelColumn) : undefined;
      if (sourceIdx < 0) return makeErrorSummary(`Source column "${cfg.sourceColumn}" not found in header`, "csv-edge-list", cfg.filePath);
      if (targetIdx < 0) return makeErrorSummary(`Target column "${cfg.targetColumn}" not found in header`, "csv-edge-list", cfg.filePath);
      if (cfg.labelColumn && labelIdx === -1) {
        warnings.push(`Label column "${cfg.labelColumn}" not found in header; edges will have no relationship`);
        labelIdx = undefined;
      }
    } else {
      dataRows = rows;
      // D2: no-header → numeric index strings
      const parseIdx = (s: string, name: string): number => {
        const n = parseInt(s, 10);
        if (isNaN(n) || n < 0) throw new Error(`${name} column "${s}" is not a valid numeric index`);
        return n;
      };
      try {
        sourceIdx = parseIdx(cfg.sourceColumn, "Source");
        targetIdx = parseIdx(cfg.targetColumn, "Target");
        labelIdx = cfg.labelColumn ? parseIdx(cfg.labelColumn, "Label") : undefined;
      } catch (err) {
        return makeErrorSummary(String(err), "csv-edge-list", cfg.filePath);
      }
    }
    
    // Process rows
    const nodeMap = new Map<string, LumaWeaveNodeDraft>();
    const edges: LumaWeaveEdgeDraft[] = [];
    let edgeCounter = 0;
    let malformedCount = 0;
    
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const rowNum = cfg.hasHeader ? i + 2 : i + 1;  // 1-indexed for warnings; accounts for header
      
      // D5/D6: required columns present
      if (row.length <= Math.max(sourceIdx, targetIdx)) {
        warnings.push(`Row ${rowNum}: not enough columns; skipped`);
        malformedCount++;
        if (malformedCount >= HARD_WARNING_CAP) {
          return makeErrorSummary(
            `File appears malformed: ${malformedCount} rows had errors; aborting`,
            "csv-edge-list",
            cfg.filePath,
          );
        }
        continue;
      }
      
      const source = (row[sourceIdx] ?? "").trim();
      const target = (row[targetIdx] ?? "").trim();
      
      if (!source) {
        warnings.push(`Row ${rowNum}: empty source; skipped`);
        malformedCount++;
        if (malformedCount >= HARD_WARNING_CAP) {
          return makeErrorSummary(`Too many malformed rows; aborting`, "csv-edge-list", cfg.filePath);
        }
        continue;
      }
      if (!target) {
        warnings.push(`Row ${rowNum}: empty target; skipped`);
        malformedCount++;
        if (malformedCount >= HARD_WARNING_CAP) {
          return makeErrorSummary(`Too many malformed rows; aborting`, "csv-edge-list", cfg.filePath);
        }
        continue;
      }
      
      // D7/D8: emit nodes (deduplicate by id) + edge
      if (!nodeMap.has(source)) {
        nodeMap.set(source, {
          id: source,
          label: source,
          type: "node",
          raw: { kind: "node", sourceAdapter: "csv-edge-list" },
        });
      }
      if (!nodeMap.has(target)) {
        nodeMap.set(target, {
          id: target,
          label: target,
          type: "node",
          raw: { kind: "node", sourceAdapter: "csv-edge-list" },
        });
      }
      
      const label = (labelIdx !== undefined && row[labelIdx]) ? row[labelIdx].trim() : undefined;
      
      edges.push({
        id: `edge-${++edgeCounter}`,
        source,
        target,
        type: "edge",
        relationship: label || undefined,  // empty string → undefined
        raw: { sourceAdapter: "csv-edge-list", rowIndex: rowNum },
      });
    }
    
    // D9: node cap (trim + warn if needed)
    const allNodes = Array.from(nodeMap.values());
    let keptNodes = allNodes;
    if (allNodes.length > HARD_NODE_CAP) {
      keptNodes = allNodes.slice(0, HARD_NODE_CAP);
      warnings.push(
        `File contains ${allNodes.length} unique nodes; first ${HARD_NODE_CAP} kept, ${allNodes.length - HARD_NODE_CAP} discarded.`,
      );
    }
    
    // Filter edges to kept nodes
    const keptNodeIds = new Set(keptNodes.map(n => n.id));
    const keptEdges = edges.filter(e => keptNodeIds.has(e.source) && keptNodeIds.has(e.target));
    
    return {
      status: "loaded",
      sourceId: "csv-edge-list",
      sourcePath: cfg.filePath,
      label: `CSV Edge List: ${cfg.filePath}`,
      normalizedNodes: keptNodes,
      normalizedEdges: keptEdges,
      rawNodes: undefined,
      rawEdges: undefined,
      warnings,
    };
  }
}

// RFC 4180 state-machine parser (D3, D4).
// Handles: quoted fields with embedded delimiter, "" escape, multi-line quoted fields.
function parseCsv(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let i = 0;
  let inQuotes = false;
  const delim = delimiter.charCodeAt(0);
  
  while (i < text.length) {
    const ch = text.charCodeAt(i);
    
    if (inQuotes) {
      if (ch === 0x22 /* " */) {
        // Look ahead for escaped quote ""
        if (i + 1 < text.length && text.charCodeAt(i + 1) === 0x22) {
          currentField += '"';
          i += 2;
          continue;
        }
        // End of quoted field
        inQuotes = false;
        i++;
        continue;
      }
      // Any other char (including newline) is field content
      currentField += text[i];
      i++;
      continue;
    }
    
    // Not in quotes
    if (ch === 0x22 /* " */) {
      // Open quote — only valid at start of field. If field already has content, treat as literal.
      if (currentField.length === 0) {
        inQuotes = true;
        i++;
        continue;
      }
      // Literal quote in unquoted field — keep it
      currentField += text[i];
      i++;
      continue;
    }
    
    if (ch === delim) {
      currentRow.push(currentField);
      currentField = "";
      i++;
      continue;
    }
    
    if (ch === 0x0d /* \r */) {
      // Check for CRLF
      if (i + 1 < text.length && text.charCodeAt(i + 1) === 0x0a) {
        currentRow.push(currentField);
        rows.push(currentRow);
        currentField = "";
        currentRow = [];
        i += 2;
        continue;
      }
      // Lone CR — treat as row terminator
      currentRow.push(currentField);
      rows.push(currentRow);
      currentField = "";
      currentRow = [];
      i++;
      continue;
    }
    
    if (ch === 0x0a /* \n */) {
      currentRow.push(currentField);
      rows.push(currentRow);
      currentField = "";
      currentRow = [];
      i++;
      continue;
    }
    
    currentField += text[i];
    i++;
  }
  
  // Final field/row if file doesn't end with newline
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }
  
  return rows;
}

const adapterInstance = new CsvEdgeListAdapter();
export const loadCsvEdgeList: LoaderFn = (config) => adapterInstance.load(config);
```

### Form implementation

```tsx
// CsvEdgeListConfigForm.tsx

import type { AdapterConfigFormProps } from "../adapterConfigFormRegistry";
import { registerAdapterConfigForm } from "../adapterConfigFormRegistry";
import type { CsvEdgeListConfig } from "../baseSourceAdapter";

export function CsvEdgeListConfigForm({
  config,
  onChange,
}: AdapterConfigFormProps<CsvEdgeListConfig>): React.JSX.Element {
  return (
    <div className="lw-csv-edge-list-config">
      <label htmlFor="csv-file-path" className="text-xs text-gray-300 block mb-1">File path</label>
      <input
        id="csv-file-path"
        type="text"
        data-testid="adapter-config-csv-edge-list-filePath"
        value={config.filePath ?? ""}
        onChange={(e) => onChange({ filePath: e.target.value })}
        placeholder="/home/user/edges.csv"
        className="lw-text-input w-full"
      />
      
      <label className="text-xs text-gray-300 block mt-3 mb-1">
        <input
          type="checkbox"
          data-testid="adapter-config-csv-edge-list-hasHeader"
          checked={config.hasHeader ?? true}
          onChange={(e) => onChange({ hasHeader: e.target.checked })}
          className="mr-2"
        />
        First row is header
      </label>
      
      <label htmlFor="csv-delimiter" className="text-xs text-gray-300 block mt-3 mb-1">Delimiter</label>
      <input
        id="csv-delimiter"
        type="text"
        data-testid="adapter-config-csv-edge-list-delimiter"
        value={config.delimiter ?? ","}
        onChange={(e) => onChange({ delimiter: e.target.value })}
        placeholder=","
        maxLength={3}
        className="lw-text-input w-full"
      />
      
      <label htmlFor="csv-source-col" className="text-xs text-gray-300 block mt-3 mb-1">
        Source column {config.hasHeader === false && <span className="text-gray-500">(numeric index)</span>}
      </label>
      <input
        id="csv-source-col"
        type="text"
        data-testid="adapter-config-csv-edge-list-sourceColumn"
        value={config.sourceColumn ?? ""}
        onChange={(e) => onChange({ sourceColumn: e.target.value })}
        placeholder={config.hasHeader === false ? "0" : "source"}
        className="lw-text-input w-full"
      />
      
      <label htmlFor="csv-target-col" className="text-xs text-gray-300 block mt-3 mb-1">
        Target column {config.hasHeader === false && <span className="text-gray-500">(numeric index)</span>}
      </label>
      <input
        id="csv-target-col"
        type="text"
        data-testid="adapter-config-csv-edge-list-targetColumn"
        value={config.targetColumn ?? ""}
        onChange={(e) => onChange({ targetColumn: e.target.value })}
        placeholder={config.hasHeader === false ? "1" : "target"}
        className="lw-text-input w-full"
      />
      
      <label htmlFor="csv-label-col" className="text-xs text-gray-300 block mt-3 mb-1">
        Label column <span className="text-gray-500">(optional)</span>
      </label>
      <input
        id="csv-label-col"
        type="text"
        data-testid="adapter-config-csv-edge-list-labelColumn"
        value={config.labelColumn ?? ""}
        onChange={(e) => onChange({ labelColumn: e.target.value || undefined })}
        placeholder={config.hasHeader === false ? "2" : "relationship"}
        className="lw-text-input w-full"
      />
    </div>
  );
}

registerAdapterConfigForm("csv-edge-list", CsvEdgeListConfigForm as React.FC<AdapterConfigFormProps>);
```

### Verify (targeted scope)

```
npm run typecheck
npm run lint:css
npx playwright test tests/e2e/source-adapter.spec.ts --reporter=line
```

Expected:
- typecheck → 0 errors
- lint:css → 0/0
- source-adapter.spec.ts → entry count is now **11** (10 previous + 1 new csv-edge-list); all tests pass; the "Set as active" rotation should work for the new entry too

**Manual smoke (Ryan, `npm run tauri dev`):**
- App starts. Self-graph loads.
- Open SourceAdapterPanel — `csv-edge-list` shows as `registered`.
- Set active. Form shows all six fields (filePath, hasHeader checkbox, delimiter, three column fields).
- Quick test: write a tiny `/tmp/test.csv`:
  ```
  source,target,rel
  a,b,knows
  b,c,knows
  c,a,knows
  ```
  Configure: hasHeader=true, sourceColumn="source", targetColumn="target", labelColumn="rel". Load. Expect 3 nodes, 3 edges, no warnings.

### Commit
MERGE GATE → commit (explicit paths only): `feat(v109.4.0): csv-edge-list adapter — RFC 4180 parser, header/index modes, label edges`
END-OF-RUN REPORT → bump+push gate.

### Hard stops
- No new dependencies. No new Rust. No new Tauri commands.
- D3 locked: full RFC 4180 state machine. Do NOT use simple `String.prototype.split`.
- D5 locked: skip+warn for malformed rows, hard cap at 100 warnings.
- D6 locked: self-loops silently allowed; do not skip or warn.
- D8 locked: trimmed cell value as id; no case normalization.
- Use `LumaWeaveEdgeDraft.id` for edge identity (top-level required), not raw.
- If `SourceAdapterType` needs updating, do it in this commit — that's part of "fresh registration."
- source-adapter.spec.ts entry-count assertion MUST be updated to 11. If you forget, the test fails and you'll discover it via the targeted verification.

---

## Commit 2 — `feat(v109.4.1): csv-edge-list fixtures + E2E + arc-step docs`

### Files (explicit paths only)

- `tests/fixtures/csv-edge-list/sample-edges.csv` — NEW. Per report §5.
- `tests/fixtures/csv-edge-list/no-header.csv` — NEW.
- `tests/fixtures/csv-edge-list/quoted-fields.csv` — NEW.
- `tests/fixtures/csv-edge-list/malformed.csv` — NEW.
- `tests/e2e/csv-edge-list-adapter.spec.ts` — NEW. ~12 tests.
- `docs/LUMAWEAVE_NOW.md` — MODIFIED. v109.4 row + commit SHAs; mark `[COMPLETE]`; mark v109.5 (arc close) as `[NEXT]`. Architectural notes per below.

### Pre-flight
1. Confirm Commit 1 (v109.4.0) is on HEAD.
2. Confirm `tests/fixtures/{markdown-vault,cytoscape,package-dependency}/` exist (the parallel pattern).
3. Quote a v109.3 E2E `loadFixture` pattern — mirror it.

### Fixture: sample-edges.csv (per report §5)

```
source,target,relationship
alice,bob,knows
bob,carol,knows
carol,alice,knows
alice,dave,follows
dave,eve,follows
eve,alice,follows
frank,frank,refers-to-self
alice,bob,
gary,helen,collaborates
helen,alice,knows
```

Expected per report: 9 nodes (alice, bob, carol, dave, eve, frank, gary, helen — 8 unique, plus self-loop adds no new node), 10 edges. **Verify the count math during implementation — adjust assertions to actual.**

Cases covered: simple edges with relationships, a self-loop (`frank,frank,refers-to-self`), a row where source matches an existing target (creating a re-visit edge), an empty-label edge (`alice,bob,` — should emit edge with no `relationship`).

### Fixture: no-header.csv

```
alice,bob,knows
bob,carol,knows
carol,alice,knows
```

Configure: `hasHeader: false`, `sourceColumn: "0"`, `targetColumn: "1"`, `labelColumn: "2"`. Expect: 3 nodes, 3 edges.

### Fixture: quoted-fields.csv

```
source,target,relationship
"alice,jr",bob,knows
bob,"carol ""the great""",knows
"node
with-newline",alice,sees
```

Tests RFC 4180: embedded delimiter, `""` escape, literal newline inside quoted field. Expect 4 unique nodes (`alice,jr`, `bob`, `carol "the great"`, `node\nwith-newline`, `alice`) → wait, that's 5. Let me re-count: `alice,jr` + `bob` + `carol "the great"` + `node\nwith-newline` + `alice` = 5 nodes. Plus 3 edges. **Bandit verifies counts during implementation.**

### Fixture: malformed.csv

```
source,target,relationship
alice,bob,knows
incomplete-row
,bob,knows
alice,,knows
carol,dave,collaborates
```

Tests skip+warn. Expect: 4 nodes (alice, bob, carol, dave), 2 edges (alice→bob, carol→dave), 3 warnings (one for incomplete-row, one for empty-source, one for empty-target).

### E2E spec design

~12 tests per report §5 estimate. Mirror v109.3 `loadFixture` helper. Key assertions:

```typescript
test("sample-edges: load and counts", async ({ page }) => {
  const s = await loadFixture(page, "sample-edges.csv", { hasHeader: true, delimiter: ",", sourceColumn: "source", targetColumn: "target", labelColumn: "relationship" });
  expect(s.status).toBe("loaded");
  // Counts confirmed against fixture
});

test("sample-edges: empty label produces edge without relationship", async ({ page }) => { ... });
test("sample-edges: self-loop allowed", async ({ page }) => { ... });

test("no-header: index-based column references", async ({ page }) => {
  const s = await loadFixture(page, "no-header.csv", { hasHeader: false, delimiter: ",", sourceColumn: "0", targetColumn: "1", labelColumn: "2" });
  expect(s.normalizedNodes).toHaveLength(3);
});

test("quoted-fields: embedded delimiter preserved", async ({ page }) => {
  const s = await loadFixture(page, "quoted-fields.csv", { hasHeader: true, delimiter: ",", sourceColumn: "source", targetColumn: "target", labelColumn: "relationship" });
  const node = s.normalizedNodes.find((n: any) => n.id === "alice,jr");
  expect(node).toBeDefined();
});

test("quoted-fields: escaped double-quotes", async ({ page }) => {
  const s = await loadFixture(page, "quoted-fields.csv", ...);
  expect(s.normalizedNodes.find((n: any) => n.id === 'carol "the great"')).toBeDefined();
});

test("quoted-fields: literal newline in quoted field", async ({ page }) => {
  const s = await loadFixture(page, "quoted-fields.csv", ...);
  expect(s.normalizedNodes.find((n: any) => n.id.includes("\n"))).toBeDefined();
});

test("malformed: skip+warn for bad rows", async ({ page }) => {
  const s = await loadFixture(page, "malformed.csv", ...);
  expect(s.status).toBe("loaded");
  expect(s.warnings.length).toBeGreaterThanOrEqual(3);
  expect(s.normalizedEdges).toHaveLength(2);
});

test("missing source column: error", async ({ page }) => {
  const s = await loadFixture(page, "sample-edges.csv", { ..., sourceColumn: "nonexistent" });
  expect(s.status).toBe("error");
  expect(s.error).toMatch(/Source column.*not found/i);
});

test("hasHeader=false with non-numeric column ref: error", async ({ page }) => {
  const s = await loadFixture(page, "no-header.csv", { hasHeader: false, sourceColumn: "source" });  // string when index expected
  expect(s.status).toBe("error");
});

test("config form renders all six fields", async ({ page }) => {
  // Open panel, set csv-edge-list active, verify all six testids visible
});
```

### NOW.md update

Add to v109 open-arc table:
- `v109.4.0` (adapter+form+registry) — SHA
- `v109.4.1` (fixtures+E2E+docs) — SHA

Mark v109.4 `[COMPLETE]`; mark v109.5 (arc close + adapter-bar evaluation) `[NEXT]`.

Architectural notes section:
- csv-edge-list shipped as fresh registration (not a candidate promotion). SourceAdapterType union updated as needed.
- Full RFC 4180 parser via character-by-character state machine — handles embedded delimiters, escaped quotes, multi-line quoted fields. ~40 lines.
- Column references: single `string` field, interpreted as header name when `hasHeader: true`, parsed as numeric index when `hasHeader: false`.
- Self-loops silently allowed (legitimate graph semantic).
- Malformed-row discipline: skip + warn, hard cap at 100 warnings before whole-load failure.

### Verify
- `npm run typecheck`
- `npm run lint:css`
- `npx playwright test tests/e2e/csv-edge-list-adapter.spec.ts --reporter=line`
- `npx playwright test tests/e2e/source-adapter.spec.ts --reporter=line` (regression check)

Expected: all 12 csv-edge-list tests pass; source-adapter still passes.

### Commit
MERGE GATE → commit (explicit paths only): `feat(v109.4.1): csv-edge-list fixtures + E2E + arc-step docs (v109.4 complete)`
END-OF-RUN REPORT → bump+push gate.

### Hard stops
- All 12 E2E tests must pass.
- RFC 4180 cases (embedded delimiter, escaped quotes, multi-line) must each have a passing test.
- Don't modify existing adapter fixtures or specs.
- Fixture files: literal newlines in `quoted-fields.csv` are intentional — verify the file is written with actual newline bytes inside the quoted field, not escaped sequences.

---

## END-OF-RUN REPORT (each commit)
Files committed, pre-flight findings, verification numbers, manual smoke notes, divergences.

**Final report (after Commit 2):**
- Landed-state audit across both commits
- csv-edge-list status: `registered`
- v109.4 complete; v109.5 (arc close + adapter-bar evaluation) is next
- Registered-bar pre-evaluation: did v109.4 meet the bar during manual smoke (real CSV → clean load → useful errors)? Note for v109.5's evaluation pass.

## Hard stops (arc-level)
- Targeted-test-scope + CI fast-jobs only. No full-suite runs.
- No installs. No new deps. No new Rust. No new Tauri commands.
- No semver bump.
- Explicit-path git (NEVER `git add -A`). Discord MCP only.
- All 10 locked decisions are non-negotiable.
- Critical structural note about fresh registration (not candidate promotion) — entry count goes 10 → 11, SourceAdapterType union likely needs updating, init-import file needs the new side-effect import.
