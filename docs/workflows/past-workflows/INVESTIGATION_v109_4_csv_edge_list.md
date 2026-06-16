# Investigation brief — v109.4 CSV edge-list adapter

**For:** Terminal Claude · **Output:** one markdown report dropped into PK as `v109_4_csv_edge_list_report.md` · **No code changes, no commits, no installs.**

Final concrete adapter in the v109 arc. SingleFileAdapter family, simplest input format. The platform is fully proven against three other adapters; this validates it on the most permissive format. After v109.4, the arc closes at v109.5.

The brief should be tight — most platform questions are settled; the real questions are about CSV parsing specifics (RFC 4180 compliance level, delimiter detection, header row handling, error reporting for malformed rows).

**Hard stops:**
- No code changes. No commits. No installs.
- Cite file:line for code claims; cite RFC 4180 or relevant CSV docs where format claims arise.
- Tradeoff analysis on every architectural choice, in product terms.

---

## §1 — Platform fit-check

Quick. Confirm against current code:

1. `SingleFileAdapter` + `readUserFile()` from v109.2 — sufficient.
2. `CsvEdgeListConfig` discriminated-union member in `baseSourceAdapter.ts`. Per Ryan's heads-up: shape is `{ adapterId, filePath, hasHeader, delimiter, sourceColumn, targetColumn, labelColumn }`. Quote the exact lines, confirm field types (e.g. `sourceColumn` — string for header name, or number for column index, or union of both?).
3. Registry entry — quote the current state in `sourceAdapterRegistry.ts` (status, limits, `inputPattern`).

If anything diverges from these expectations, flag it. CsvEdgeListConfig might need amendments depending on the answers to §2 below.

---

## §2 — CSV parsing scope

CSV is deceptively complex. RFC 4180 defines the canonical shape, but real-world CSV files routinely violate it. The brief surfaces every decision the implementation must make.

### 2.1 Delimiter handling

Options:
- **Single configurable delimiter** (default `,`) — user can specify `,`, `\t`, `;`, `|`, etc. in the config. Simple.
- **Auto-detect from first row** — sniff which delimiter produces the most consistent column count. Risk: gets it wrong, silently produces malformed graph.
- **Auto-detect with fallback to config override** — try sniffing, but honor the config if set. Most ergonomic.

Recommend with reasoning. My instinct: **single configurable delimiter, default `,`** — auto-detect is a tar-pit for v1.0. The user knows what their file uses; the config lets them tell us. The form already has a delimiter field per Ryan's note.

### 2.2 Header row handling

Three real states a file might be in:
- Has a header row, declared via `hasHeader: true`
- Has no header row, declared via `hasHeader: false`
- Has a header row but `hasHeader: false` (user mis-configured)

For the third case, the adapter has no way to detect it without heuristics ("does the first row look like column names?"). v1.0 recommendation: **trust the user**. If `hasHeader: false`, treat row 1 as data. If the user got it wrong, the result will be a node literally named "source" or whatever the header text was — they'll see it and fix the config.

When `hasHeader: true`, the column references (`sourceColumn`, `targetColumn`, `labelColumn`) can be either:
- **Header names** (e.g. `sourceColumn: "from"`)
- **Column indices** (e.g. `sourceColumn: "0"` or `sourceColumn: 0`)

The config field type matters here. Recommend: keep it `string`, with the convention "if `hasHeader: true`, the string is a header name; if `hasHeader: false`, the string is a numeric index parsed as integer." If the string can't be parsed as an integer when `hasHeader: false`, that's a config error.

Alternative: separate fields per case (`sourceColumnByName?: string` + `sourceColumnByIndex?: number`). More explicit but more config surface. Recommend the single-string convention for simpler form UX.

### 2.3 Quoted field handling

RFC 4180: fields containing commas, newlines, or quotes must be quoted with double-quotes; internal double-quotes are escaped by doubling (`""`).

Decision: full RFC 4180 minimal compliance, or simpler split-on-delimiter?

- **Full RFC 4180** — supports quoted fields with embedded commas/newlines/escaped quotes. Correct for any standards-compliant CSV. ~30 lines of parsing logic.
- **Simple split** — `line.split(delimiter)`. Fast, ~3 lines. Breaks on any field containing the delimiter.

Recommend full RFC 4180. The cost is small (30 lines vs 3), the correctness gain is huge (won't silently mangle fields with embedded commas). Plus: any external user with a real CSV export from Excel, Google Sheets, or any data tool will produce RFC-compliant output. Simple split would break their files.

### 2.4 Multi-line fields (quoted newlines)

Edge case: an RFC 4180 quoted field can contain literal newlines. A parser that reads line-by-line will break on these.

Options:
- Stream the entire file content (current `readUserFile` already returns the whole file as a string)
- Use a character-by-character state machine for the quoted-field tracking

The streaming approach + state machine is more robust. Since we already have the full file in memory (no chunking), the state machine over a string is fine. Recommend.

### 2.5 Malformed row handling

If a row has fewer columns than required (or referenced column index out of range): skip and log to warnings, or fail the whole load?

Recommend: **skip + warn**, with a hard cap (e.g. >100 malformed rows → fail the load with a "file appears malformed beyond useful recovery" error). This matches the markdown-vault discipline (one bad note ≠ failed vault) and the cytoscape-json one (one orphan edge ≠ failed load).

### 2.6 Source/target column extraction

For each parsed row, extract source and target by the configured column. Decisions:
- **Empty source or target**: skip row + warn (an edge with no endpoint is meaningless)
- **Whitespace-only source/target**: same — skip + warn
- **Self-loop** (source === target): include by default, but warn? Skip by default? Recommend: include silently. Self-loops are legitimate in many graph models (recursive deps, reflexive relations). Don't be opinionated.

### 2.7 Label column

`labelColumn` is optional. When present:
- Extract the cell value
- Apply to the edge as `relationship` (top-level on `LumaWeaveEdgeDraft`) per established convention
- Empty/missing label cell: just omit the relationship (don't error)

When `labelColumn` is undefined/null/empty: emit edges with no `relationship` field.

### 2.8 Node identity

CSV edge lists don't have separate node declarations — nodes are derived from the unique values in the source + target columns. So node identity = the cell value string, trimmed.

Decisions:
- Whitespace normalization: trim leading/trailing whitespace from cell values before using as id. Yes.
- Case normalization: don't. `"User"` and `"user"` are different nodes. Predictable.
- Special characters: pass through unchanged. The cell value is the id.

### 2.9 Limits

Per established pattern: hard cap on nodes (probably 500 like package-dependency, or 2000 like markdown-vault — depends on registry's current limit). Audible-ignore for `maxNodes` config override. Truncation order: first N unique nodes in file order. Warnings array tracks the count of discarded.

---

## §3 — Graph shape

Simpler than other adapters. No "root" node like package-dependency. Just nodes derived from cells + edges from rows.

For each parsed row:
- `LumaWeaveNodeDraft { id: <source cell>, label: <source cell>, type: "node", raw: { kind: "node", sourceAdapter: "csv-edge-list" } }` — emitted once per unique source/target value (deduplicated by id)
- `LumaWeaveEdgeDraft { id: <row-index-based>, source, target, type: "edge", relationship: <label-column-value-or-undefined>, raw: { sourceAdapter: "csv-edge-list", rowIndex } }` — one per non-skipped row

Recommend the edge id scheme: `edge-{rowIndex}` where rowIndex starts at 1 (or 0 if no-header, or accounts for header row if present). Stable across runs of the same file.

---

## §4 — UI form

Mirror the v109.2 / v109.3 form patterns. Fields:

- `filePath` — text input (required)
- `hasHeader` — checkbox (default `true` since real-world CSVs usually have headers)
- `delimiter` — text input (default `,`, max length 3 for cases like `\\t` typed literally; alternative: dropdown with common options + "custom")
- `sourceColumn` — text input (default `"0"` if no header, or first header name if header — but the form can't know that, so just default `"source"` and let the user adjust)
- `targetColumn` — text input (default `"target"`)
- `labelColumn` — text input (optional, default empty)

Testid pattern: `data-testid="adapter-config-{adapterId}-{fieldName}"`.

Recommend keeping the form simple — single text inputs throughout. The dropdown for delimiter is tempting but adds form complexity for a single-character choice. Text input with placeholder "`,` (default)" is fine.

---

## §5 — Fixture file design for E2E

Per the v109.2 / v109.3 pattern. Sketch the fixtures:

### sample-edges.csv (the headline test)
Header row + ~10-15 data rows. Covers:
- Simple edges with all three columns (source, target, relationship)
- A self-loop (`foo,foo,refers-to-self`)
- A row where source === existing-target (creating an edge to a node already seen)
- A row with empty label column (proves optional label works)

### no-header.csv
Same data but no header row. Tests `hasHeader: false` with numeric column indices.

### quoted-fields.csv
Tests RFC 4180 compliance:
- A row with a comma inside a quoted field
- A row with escaped double-quotes (`""`)
- A row with a newline inside a quoted field

### malformed.csv
A file mixing valid rows with malformed ones (too few columns, missing source). Tests warn-and-skip behavior.

Sketch each fixture in the report (~5-15 lines of CSV each).

E2E assertions:
- Loaded node/edge counts per fixture
- Warnings present for malformed.csv
- Edge `relationship` populated when labelColumn configured, absent when not
- Quoted-fields.csv proves RFC compliance (the embedded comma doesn't split the field)
- no-header.csv proves index-based columns work

---

## §6 — Pre-flight decisions for Ryan

Aggregate every decision the brief surfaces into a checklist. For each: clear question + recommendation + reasoning in product-language. Expected items:

1. Delimiter: configurable (default `,`) with no auto-detect
2. Column reference: single string field, header name vs index by `hasHeader` flag
3. Parser: full RFC 4180 compliance vs simple split
4. Multi-line quoted fields: state machine vs line-by-line
5. Malformed rows: skip + warn (with hard cap on warning count)
6. Empty source/target: skip + warn; self-loops allowed silently
7. Label column: optional, maps to `relationship`
8. Node id: trimmed cell value, no case normalization
9. Limits: node cap (confirm value from registry), audible-ignore for `maxNodes` config

---

## §7 — Recommended pass shape

Given §1-§6, propose v109.4 implementation:

- Single pass or multiple? CSV is genuinely simple. Likely 2 commits: adapter+form+registry, then fixture+E2E+docs.
- Files touched (best-effort estimate).
- Hard sequencing dependencies.

Also: comment on whether v109.4 makes sense to **bundle with v109.5 (arc close)** as a combined session. Pros: faster arc close. Cons: mixed-concern commits. Recommend with reasoning.

---

## §8 — Registered-bar pre-evaluation

Per the SHIP_READINESS_ROADMAP §2.6, every adapter needs to clear the "registered" bar for v1.0 shipping. Forward-look:

- Will CSV edge-list, as scoped above, meet the bar (a real user can load real CSV data with useful errors)?
- What's the realistic test? (E.g. Bandit grabs a real edge-list export from somewhere and confirms it loads cleanly.)
- Are there scope additions that would noticeably improve the bar (e.g. previewing the parsed header row in the form before load)?

Recommend either:
- **Ship as registered** (if the bar is clearable with the scoped implementation)
- **Ship as candidate with "preview" framing** (if real-world CSVs would surface enough rough edges to not meet the bar)

This is the final check before scoping implementation.

---

## Output format

One markdown file in PK as `v109_4_csv_edge_list_report.md`. Eight sections. File:line citations for code claims, RFC/spec citations for format claims. LOW/MED/HIGH ratings. Tradeoff analysis (not preference) on every choice. When complete: ping back; planning Claude reads + scopes implementation.
