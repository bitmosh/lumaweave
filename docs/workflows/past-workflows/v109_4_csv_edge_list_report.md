# v109.4 CSV Edge-List Adapter — Investigation Report

**Date:** 2026-06-08  
**Status:** Ready for implementation scoping  
**Confidence:** HIGH throughout — all claims grounded in on-disk code

---

## §1 — Platform fit-check

**SingleFileAdapter + readUserFile() — sufficient. Confirmed.**

`CsvEdgeListConfig` confirmed at `baseSourceAdapter.ts:48-56`:

```typescript
export interface CsvEdgeListConfig {
  adapterId: "csv-edge-list";
  filePath: string;
  hasHeader?: boolean;   // default true
  delimiter?: string;    // default ","
  sourceColumn?: string; // default "source"
  targetColumn?: string; // default "target"
  labelColumn?: string;  // optional
}
```

**Field types:** All column fields are `string`, not a `string | number` union. The comment-stated defaults are `"source"` and `"target"` — these are header-name defaults, consistent with the common `hasHeader: true` case. When `hasHeader: false`, the adapter must accept a numeric string (`"0"`, `"1"`) and parse it as a column index. No interface change needed; the single-string convention handles both cases.

**⚠ Critical §1 finding: `csv-edge-list` is absent from the registry and the `SourceAdapterType` union.**

This is materially different from v109.3 where `package-dependency` was already a candidate entry:

- `SourceAdapterType` (`sourceAdapterRegistry.ts:23-33`) lists 10 values; `"csv-edge-list"` is not among them.
- No `registerSourceAdapter(...)` block exists for `csv-edge-list` anywhere in the file.
- `CsvEdgeListConfig` IS present in `baseSourceAdapter.ts` and in the `AdapterConfig` discriminated union — the type exists; only the runtime registration is missing.

**Implementation consequence:** v109.4.0 must:
1. Add `"csv-edge-list"` to the `SourceAdapterType` union in `sourceAdapterRegistry.ts`.
2. Add a full `registerSourceAdapter(...)` block with limits, inputPattern, translationSet, status `"registered"`, and the real loader.
3. `source-adapter.spec.ts` entry count will increase **10 → 11** (this is a real new entry, unlike v109.3 which promoted an existing candidate).

**Effort: LOW.** No new Tauri commands. `readUserFile()` already covers the file-read path.

---

## §2 — CSV parsing scope

### 2.1 Delimiter handling

**Recommendation: configurable delimiter, default `,`, no auto-detect.**

| Option | Pro | Con |
|---|---|---|
| Single configurable (`,` default) | Predictable; user knows their file | Requires user to set the field for TSV/semicolon files |
| Auto-detect from first row | Zero-config for common cases | Gets it wrong silently; produces a malformed graph with no error; debugging is painful |
| Auto-detect + config override | Most ergonomic | Adds a detection layer that introduces its own failure modes |

**Why auto-detect is a v1.0 trap:** Detection is typically done by counting which delimiter produces the most consistent column count across the first N rows. Edge cases: single-column files, files with commas inside quoted fields, files with exactly 2 columns (can't distinguish `,` from `;` by consistency alone). Silent wrongness is worse than an explicit "please set delimiter" config error. The form already has a delimiter field — use it.

**Runtime behavior:** `cfg.delimiter ?? ","`. Single character expected. If multi-character is supplied, use as-is (e.g. `", "` to split on comma-space, which some exports produce). Trim whitespace from the delimiter field value itself; a user who types ` , ` meant `,`.

### 2.2 Header row handling

**Recommendation: trust the user; single `string` column field covers both name and index.**

The `CsvEdgeListConfig` shape already commits to `string` for column fields. The convention:

- `hasHeader: true` (default) → `sourceColumn` / `targetColumn` / `labelColumn` are header names (`"from"`, `"to"`, `"label"`). Missing from header → config error (not a skip).
- `hasHeader: false` → `sourceColumn` / `targetColumn` / `labelColumn` are numeric strings parsed as 0-based column indices (`"0"`, `"1"`, `"2"`). Non-parseable-as-integer → config error.

The adapter resolves which column index to use during the header-parsing phase (or at start of processing for the no-header case) and caches the resolved indices. Every row then uses the cached indices — no per-row string parsing.

**Mis-configuration case 3 (header exists but `hasHeader: false`):** no detection possible without heuristics. Trust the user; the result will be a node named "source" or "from" or whatever the header text is — visible and fixable. Do not add heuristics.

**Default column names:** `sourceColumn` defaults to `"source"`, `targetColumn` defaults to `"target"`. For `hasHeader: false` without explicit config, `"source"` is not a valid integer → the adapter should emit a clear config error: `"hasHeader is false but sourceColumn 'source' is not a valid column index; set sourceColumn to a numeric index like '0'"`.

### 2.3 Quoted field handling

**Recommendation: full RFC 4180 minimal compliance.**

| Option | Parser size | Handles embedded delimiter | Handles `""` escapes | Handles newlines in fields |
|---|---|---|---|---|
| `line.split(delimiter)` | ~3 lines | ✗ | ✗ | ✗ |
| Full RFC 4180 | ~40 lines | ✓ | ✓ | ✓ |

RFC 4180 (IETF RFC 4180, §2) specifies:
- Fields may be enclosed in double-quotes.
- Fields containing the delimiter, double-quote, or CR/LF must be enclosed.
- An embedded double-quote is represented by doubling (`""`).

**Why full compliance at 40 lines:** Every real-world CSV export (Excel, Google Sheets, pandas `.to_csv()`, PostgreSQL `\COPY`, Neo4j export, Gephi export) produces RFC 4180-compliant output. A simple split breaks immediately on any field containing the delimiter — e.g. `"New York, NY"` as a node label. The cost is ~40 lines of state machine. The correctness gain is that any export from any standard tool loads correctly. Simple split is only defensible for toy fixtures.

**Scope:** Full RFC 4180 means quoted fields, `""` escape, and multi-line fields (§2.4). This is the minimal standard-compliant baseline; extensions like semicolon-as-quote-alternative (used in some European locales) are not part of RFC 4180 and are out of scope for v1.0.

### 2.4 Multi-line quoted fields (quoted newlines)

**Recommendation: state machine over the full file string.**

`readUserFile()` returns the entire file as a string — no chunking, no streaming. A character-by-character state machine over this string handles quoted newlines correctly without any extra I/O:

```
states: FIELD_START | UNQUOTED | QUOTED | QUOTE_SEEN
transitions:
  FIELD_START + " → QUOTED
  FIELD_START + delim → emit empty field, FIELD_START
  FIELD_START + \n → emit row, FIELD_START
  QUOTED + " → QUOTE_SEEN
  QUOTED + other → append, stay QUOTED
  QUOTE_SEEN + " → append '"', QUOTED  (doubled-quote escape)
  QUOTE_SEEN + delim → emit field, FIELD_START
  QUOTE_SEEN + \n → emit row, FIELD_START
  UNQUOTED + delim → emit field, FIELD_START
  UNQUOTED + \n → emit row, FIELD_START
  UNQUOTED + other → append, stay UNQUOTED
```

**Alternative (split on newlines first):** If newlines inside quoted fields are treated as "not supported", the adapter can split `raw.split(/\r?\n/)` and process line-by-line. This is simpler (~10 lines less) but silently corrupts any file with quoted newlines. Since the full file is already in memory, there's no cost to the state machine approach.

**Practical note:** Multi-line fields in edge-list CSVs are rare (node labels are usually single-line). But "rare" in a general CSV parser becomes "guaranteed to surface" as soon as a real user's export tool uses it. The state machine is the right call.

### 2.5 Malformed row handling

**Recommendation: skip + warn, hard cap at 50 malformed rows → error.**

| Option | Pro | Con |
|---|---|---|
| Skip + warn (no cap) | Permissive; loads partial graph | File could be 99% malformed with no signal |
| Skip + warn (with cap) | Permissive + alerts on severe malformation | Cap choice is arbitrary |
| Fail on first malformed row | Maximally strict | One bad row aborts a 10,000-row file |

The cap is the key judgment. `>50 malformed rows → fail` with message: `"Too many malformed rows (51+); file appears structurally invalid. Check delimiter setting and file encoding."` This is more conservative than the brief's 100-row suggestion, because in a typical edge-list CSV of 50-500 edges, 50 malformed rows = 10-100% of the file — almost certainly a config mistake (wrong delimiter, wrong hasHeader) rather than isolated bad data.

**What counts as malformed:** fewer fields than the required column indices after parsing (i.e., after RFC 4180 parsing, not before). An RFC-quoted field containing the delimiter is not malformed — it's correct. Only post-parse column-count failures count.

**Empty rows:** skip silently (no warning). Trailing blank lines are ubiquitous in exported CSVs.

### 2.6 Source/target extraction

**Recommendation: trim + skip-if-empty; self-loops included silently.**

| Scenario | Handling |
|---|---|
| Empty source or target cell | Skip row + warn (`Row N: empty source/target; skipped`) |
| Whitespace-only source or target | Trim → effectively empty → same as above |
| Source === target (self-loop) | Include silently — legitimate in many graph models |
| Source or target exceeds `MAX_NODES` | Node already seen → emit edge to existing node; no new node. This is correct. |

**Trim scope:** apply `String.prototype.trim()` to all extracted cell values (source, target, label) before use. Cell values in the middle of fields (between delimiters) should not have interior whitespace trimmed — only leading/trailing.

### 2.7 Label column

**Recommendation: optional; maps to `LumaWeaveEdgeDraft.relationship`; empty → omit relationship.**

When `cfg.labelColumn` is set:
- Resolve the column index during the header phase (same as source/target).
- For each row: extract the label cell, trim it.
- If non-empty: set `relationship: trimmedLabel`.
- If empty: omit `relationship` (edge has no relationship field — consistent with Cytoscape adapter behavior when no label is present).

When `cfg.labelColumn` is absent/empty: all edges have no `relationship` field. No warning needed — optional field intentionally absent.

**Edge case:** `labelColumn` set, but the column index/name is invalid → treat as a config error (same as invalid sourceColumn). Report as error summary, not a per-row warning.

### 2.8 Node identity

**Recommendation: trimmed cell value, no case normalization, no special-character transformation.**

| Decision | Choice | Reasoning |
|---|---|---|
| Trim whitespace | Yes | Leading/trailing whitespace in cell values is almost always spurious |
| Case normalization | No | `"User"` and `"user"` are distinct identifiers in the source data |
| Special character handling | Pass through | Don't impose transformations the user didn't ask for |
| Namespace prefix | No | CSV node IDs are locally scoped; no collision risk with other adapters in a single-adapter load |
| Deduplication across source+target columns | Yes — track `seenNodeIds: Set<string>` | Same value appearing as source in one row and target in another → one node |

**ID = trimmed cell value.** `label = id` (no separate label field in the CSV format for nodes). The `raw.sourceAdapter = "csv-edge-list"` field distinguishes origin.

### 2.9 Limits

**Recommended limits for the new registry entry:**

| Limit | Value | Reasoning |
|---|---|---|
| `maxNodes` | 2000 | CSV edge lists can be large; 2000 matches markdown-vault and gives room for realistic graphs |
| `maxEdges` | 10000 | One edge per data row; 10,000 rows is a large but not unusual CSV |
| `maxDepth` | 1 | Not applicable for flat files; set 1 as placeholder |
| `maxFileSize` | 10485760 (10 MB) | Conservative upper bound; a 10 MB CSV of simple strings is ~200,000 rows |
| `timeoutMs` | 15000 | Matches package-dependency; CSV parsing is fast |

**`maxNodes` audible-ignore:** same pattern as v109.2 D8 and v109.3 — if a `maxNodes` config override is present, emit a warning and use the registry default. This is consistent across all SingleFileAdapter family members.

**Truncation order:** first N unique nodes in file order (source/target column, processing order). When the node cap is hit, remaining rows that reference new (unseen) nodes are skipped with a single aggregated warning. Rows referencing already-seen nodes still emit edges — no edge skipping due to the node cap alone.

---

## §3 — Graph shape

**Simple: no root node. Nodes derived from unique source+target cell values. One edge per valid data row.**

### Node shape
```typescript
{
  id: trimmedCellValue,
  label: trimmedCellValue,
  type: "node",
  raw: {
    kind: "node",
    sourceAdapter: "csv-edge-list",
  }
}
```

No version, no description, no dependency type — just the identity. CSV nodes are pure structural entities.

### Edge shape
```typescript
{
  id: `edge-${dataRowIndex}`,   // 1-based, counts only data rows (header not counted)
  source: trimmedSourceCell,
  target: trimmedTargetCell,
  relationship: trimmedLabelCell,  // present only if labelColumn configured and cell non-empty
  raw: {
    sourceAdapter: "csv-edge-list",
    rowIndex: dataRowIndex,        // for debugging/traceability
  }
}
```

**Edge ID scheme:** `edge-{dataRowIndex}` where `dataRowIndex` starts at 1 for the first data row (row 2 in a file with a header). Stable across runs of the same file with the same config. Skipped rows (malformed, empty source/target) do not consume an index — the index is for emitted edges only. Actually: **counter-proposal** — use the raw file row number (1-based including header) instead. This makes it trivially debuggable: `edge-3` corresponds to line 3 in the file. More useful for tracing warnings. Recommendation: use **file row number** (`fileRowIndex`), not a sequential emitted-edge counter. Confirmed: `id: \`edge-${fileRowIndex}\`` where fileRowIndex is the 1-based line number in the file.

---

## §4 — UI form

**~45 lines. Six fields: file path, hasHeader, delimiter, sourceColumn, targetColumn, labelColumn.**

```tsx
// CsvEdgeListConfigForm.tsx
<div className="lw-csv-config">
  <label>File path</label>
  <input data-testid="adapter-config-csv-edge-list-file-path"
    value={config.filePath ?? ""} onChange={(e) => onChange({ filePath: e.target.value })}
    placeholder="/home/user/exports/edges.csv" />

  <label><input type="checkbox"
    data-testid="adapter-config-csv-edge-list-has-header"
    checked={config.hasHeader ?? true}
    onChange={(e) => onChange({ hasHeader: e.target.checked })} />
    File has header row
  </label>

  <label>Delimiter</label>
  <input data-testid="adapter-config-csv-edge-list-delimiter"
    value={config.delimiter ?? ","}
    onChange={(e) => onChange({ delimiter: e.target.value })}
    placeholder="," maxLength={4} />

  <label>Source column</label>
  <input data-testid="adapter-config-csv-edge-list-source-column"
    value={config.sourceColumn ?? "source"}
    onChange={(e) => onChange({ sourceColumn: e.target.value })} />

  <label>Target column</label>
  <input data-testid="adapter-config-csv-edge-list-target-column"
    value={config.targetColumn ?? "target"}
    onChange={(e) => onChange({ targetColumn: e.target.value })} />

  <label>Label column (optional)</label>
  <input data-testid="adapter-config-csv-edge-list-label-column"
    value={config.labelColumn ?? ""}
    onChange={(e) => onChange({ labelColumn: e.target.value || undefined })}
    placeholder="leave blank for unlabeled edges" />
</div>
```

**Testid pattern:** `adapter-config-csv-edge-list-{fieldName}` (consistent with `adapter-config-cytoscape-file-path` convention).

**Checkbox note:** `hasHeader` is `boolean | undefined`; `checked={config.hasHeader ?? true}` handles the undefined case. The `onChange` emits the boolean directly — no string parsing needed.

**Form size estimate:** ~50 lines total with labels and className strings. Larger than cytoscape-json (1 field) and package-dependency (2 fields) but all simple inputs — no dropdowns, no complex state.

---

## §5 — Fixture file design for E2E

### `sample-edges.csv` (headline test, with header)

```csv
source,target,relationship
auth-service,user-db,queries
auth-service,session-cache,reads
api-gateway,auth-service,calls
api-gateway,billing-service,calls
billing-service,payment-api,calls
payment-api,stripe-webhook,receives
worker-pool,task-queue,polls
worker-pool,billing-service,notifies
billing-service,billing-service,self-audits
api-gateway,logger,emits
```

10 data rows. 9 unique nodes (auth-service, user-db, session-cache, api-gateway, billing-service, payment-api, stripe-webhook, worker-pool, task-queue, logger). 10 edges. One self-loop: `billing-service → billing-service`. All rows have all three columns.

E2E assertions:
- `status: "loaded"`
- 9 nodes, 10 edges
- `billing-service` node exists once (deduped from source+target columns)
- Self-loop edge exists: `source === "billing-service"`, `target === "billing-service"`
- Edge relationships present: find `api-gateway → auth-service` with `relationship: "calls"`

### `no-header.csv` (hasHeader: false, index-based columns)

Config for this fixture: `{ hasHeader: false, sourceColumn: "0", targetColumn: "1", labelColumn: "2" }`.

```csv
alpha,beta,links
beta,gamma,links
gamma,delta,links
delta,alpha,links
```

4 data rows. 4 unique nodes. 4 edges. The "relationship" column (index 2) contains `"links"`.

E2E assertions:
- 4 nodes, 4 edges
- Edge relationships all `"links"`

### `quoted-fields.csv` (RFC 4180 compliance)

Config: default (hasHeader: true, delimiter: `,`, sourceColumn: `"source"`, targetColumn: `"target"`, labelColumn: `"label"`).

```csv
source,target,label
"New York, NY","Los Angeles, CA",connects
"said ""hello""","world",greets
"line-one
line-two",endpoint,multi-line-source
simple-node,other-node,plain
```

4 data rows. 6 unique nodes. 4 edges.
- Row 2: embedded commas in source and target — tests quoted field parsing.
- Row 3: doubled-quote escape in source — tests `""` → `"` conversion.
- Row 4: literal newline inside the quoted source field — tests multi-line field handling.
- Row 5: unquoted row — proves RFC fields and unquoted fields coexist.

E2E assertions:
- `status: "loaded"`
- 6 nodes, 4 edges (if multi-line is supported) — OR status `"loaded"` with 5 nodes, 3 edges + warning if multi-line skipped (implementation choice; full RFC compliance = 6/4)
- Node `"New York, NY"` exists (embedded comma not split)
- Node `'said "hello"'` exists (doubled-quote decoded)

### `malformed.csv` (skip + warn behavior)

```csv
source,target,relationship
alpha,beta,connects
gamma
delta,epsilon,links
,zeta,arrives
theta,iota,flows
```

Row 3 (`gamma` — only 1 column): malformed, skipped.  
Row 5 (`,zeta,arrives` — empty source): empty source, skipped.  
Valid data rows: alpha→beta, delta→epsilon, theta→iota = 3 edges. 6 unique nodes (alpha, beta, delta, epsilon, theta, iota).

E2E assertions:
- `status: "loaded"` (not error — malformed rows don't abort)
- 6 nodes, 3 edges
- `warnings.length >= 2` (one per skipped row)
- Warnings mention the skipped rows

---

## §6 — Pre-flight decisions for Ryan

| # | Question | Recommendation | Reasoning |
|---|---|---|---|
| 1 | **Delimiter** | Configurable (default `,`), no auto-detect | Auto-detect is a silent-failure trap; user knows their format; config already exists |
| 2 | **Column reference type** | Single `string` field; header name when `hasHeader: true`, numeric index string when `hasHeader: false` | Interface is already `string` in `CsvEdgeListConfig`; convention is clear; no interface change needed |
| 3 | **Parser** | Full RFC 4180 compliance (~40 lines state machine) | All standard export tools produce RFC-compliant output; simple split breaks any field containing the delimiter |
| 4 | **Multi-line quoted fields** | State machine over full file string (supported) | `readUserFile()` already has full file in memory; state machine handles newlines correctly; no extra cost |
| 5 | **Malformed rows** | Skip + warn; hard cap at 50 malformed rows → error | 50 bad rows in a typical 50-500 row edge list = likely a config mistake; explicit error is more useful than silent partial graph |
| 6 | **Empty source/target** | Skip + warn; self-loops included silently | Empty endpoints are meaningless; self-loops are legitimate graph semantics |
| 7 | **Label column** | Optional; maps to `relationship`; empty cell → omit relationship | Consistent with cytoscape-json edge label behavior |
| 8 | **Node identity** | Trimmed cell value, no case normalization | Predictable, no transformations that differ from the source data |
| 9 | **Limits** | `maxNodes: 2000, maxEdges: 10000, maxFileSize: 10MB`; audible-ignore for `maxNodes` config override | Matches platform conventions; CSV edge lists can be large |
| 10 | **Edge ID scheme** | `edge-${fileRowIndex}` (1-based file line number, including header row in count) | Directly debuggable: `edge-3` = line 3 in the file; no ambiguity about which row |
| 11 | **Source/target defaults** | `sourceColumn: "source"`, `targetColumn: "target"` — from `CsvEdgeListConfig` comments; emit config error if these can't be resolved | The defaults require a header row with columns named "source" and "target"; with `hasHeader: false` the user must supply numeric index strings explicitly |
| 12 | **`csv-edge-list` not in registry** | Must add to `SourceAdapterType` union AND add `registerSourceAdapter` block (not just swap candidateNoOpLoader) | No candidate entry exists; this is a fresh registration; source-adapter.spec.ts count goes 10 → 11 |

---

## §7 — Recommended pass shape

### v109.4 — 2 commits, single session

**Commit 1: `feat(v109.4.0): csv-edge-list adapter + form + registry`**

Files:
- `src/source-adapter/adapters/csvEdgeListAdapter.ts` — NEW. ~180 lines (state machine parser + adapter class).
- `src/source-adapter/adapters/CsvEdgeListConfigForm.tsx` — NEW. ~55 lines (6-field form).
- `src/source-adapter/sourceAdapterRegistry.ts` — MODIFIED. Add `"csv-edge-list"` to `SourceAdapterType` union; add full `registerSourceAdapter` block; add import.
- `tests/e2e/source-adapter.spec.ts` — MODIFIED. Count 10 → 11 (this IS a new entry, unlike v109.3).

**Commit 2: `feat(v109.4.1): csv-edge-list fixtures + E2E + arc docs`**

Files:
- `tests/fixtures/csv-edge-list/sample-edges.csv` — NEW.
- `tests/fixtures/csv-edge-list/no-header.csv` — NEW.
- `tests/fixtures/csv-edge-list/quoted-fields.csv` — NEW.
- `tests/fixtures/csv-edge-list/malformed.csv` — NEW.
- `tests/e2e/csv-edge-list-adapter.spec.ts` — NEW. ~12 tests (more than v109.2/v109.3 due to parser edge cases).
- `docs/LUMAWEAVE_NOW.md` — MODIFIED. v109.4 complete, v109.5 arc-close [NEXT].

**Sequencing constraints:**
- No new Tauri commands.
- No new npm dependencies (RFC 4180 parser is hand-rolled, ~40 lines).
- `CsvEdgeListConfig` already in `AdapterConfig` union — no schema migration.
- State machine is purely in-memory over a string — no platform changes.

**Should v109.4 bundle with v109.5 (arc close)?**

**Recommendation: no. Keep separate.**

Arguments for bundling:
- v109.4 is small (2 commits); v109.5 arc-close is documentation + semver bump. Could be 1 session instead of 2.
- Faster arc close overall.

Arguments against (and why they win):
- v109.5 arc-close includes reconcile work (the `panelRegistry` reconcile noted in NOW.md + SHIP_READINESS_ROADMAP). That's real runtime work, not just docs — mixing adapter implementation with reconcile work in one session creates a large blast radius.
- The arc-close bump triggers a semver change (0.15.0 → 0.16.0). That commit should be clean and minimal, not tangled with a new adapter.
- Per-commit discipline has kept the v109 history bisect-friendly. Don't break the pattern on the last lap.
- If v109.4.1 has a test regression, a combined session would need to roll back both the adapter AND the arc-close state.

**Conclusion:** v109.4 standalone, then v109.5 standalone. Two sessions, each clean. The extra session is 30-60 minutes for arc-close.

---

## §8 — Registered-bar pre-evaluation

**Recommendation: ship as `"registered"`. The bar is clearable with the scoped implementation.**

### Will the scoped adapter meet the registered bar?

The registered bar (per SHIP_READINESS_ROADMAP §2.6): "a real user can load real CSV data with useful errors."

For CSV, this is straightforwardly achievable:
- **RFC 4180 compliance** means any export from Excel, Google Sheets, pandas, PostgreSQL, Neo4j, Gephi, or Cytoscape (CSV export) loads correctly.
- **Column configuration** (header name or index) covers the two dominant CSV shapes.
- **Error messages** for config mistakes (invalid column name/index, wrong delimiter) are actionable.
- **Skip + warn** for malformed rows means a partially-malformed file produces a useful partial graph with an explanation.

The adapter is the simplest in the v109 family — no graph structure to reconstruct (unlike markdown-vault's wikilink resolution or package-dependency's dep-bucket dispatch). The main correctness question is RFC 4180 compliance, which the state machine handles completely.

### Realistic test

After v109.4.1, the registered-bar test is: grab any real CSV with a source/target column structure and load it. Good candidates:
- A Neo4j relationship export (`MATCH (a)-[r]->(b) RETURN id(a), type(r), id(b)` → CSV)
- A Gephi edge-list CSV
- A GitHub dependency graph export (edges between packages)
- The LumaWeave source-adapter registry itself serialized to CSV edges

The E2E fixture suite covers the parsing edge cases; the real-world test covers integration. Bandit can do this in a quick smoke session after v109.4.1.

### Scope additions that would improve the bar

**Worth doing post-v1.0, not now:**

1. **Header preview in form:** After the user enters a file path, show the first row of the parsed CSV in the form to help them fill in `sourceColumn`/`targetColumn`. Requires a Tauri "peek" command or loading the file in the form itself. Noticeably improves UX for users who don't remember their column names. But it's a form enhancement, not a correctness requirement — the adapter works without it.

2. **Delimiter auto-suggest:** After loading, if >10% of rows were skipped (malformed), add a warning suggesting the user check their delimiter. This is a heuristic hint, not detection — consistent with the trust-the-user approach.

3. **TSV shorthand:** A `"tsv"` preset that sets `delimiter: "\t"`. Convenience, not correctness. Post-v1.0.

**Conclusion:** ship as `"registered"` with the scoped implementation. The bar is clearable without any of these additions. The real-world test is a 5-minute smoke that Bandit can run in the v109.4.1 session before committing.

---

## Summary

Platform fit is clean — `SingleFileAdapter` + `readUserFile()` is exactly right, `CsvEdgeListConfig` is already typed correctly, no interface changes needed. The main implementation decision is the RFC 4180 state machine (~40 lines), which is the right call for correctness against real-world CSV exports. The key pre-implementation flag is **decision #12**: `csv-edge-list` has no registry entry and no `SourceAdapterType` entry — the implementation must add both fresh, and `source-adapter.spec.ts` count goes 10 → 11 (genuine new entry, not a candidate promotion).

All 12 pre-flight decisions are ready for sign-off. No blocking questions — implementation can proceed directly to `BANDIT_v109_4_csv_edge_list.md` scoping.
