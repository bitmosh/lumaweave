# v109.5.0 — Registered-Bar Evaluation Report

**Date:** 2026-06-09  
**Arc:** v109 (Source Adapter Platform)  
**Evaluator:** Bandit (v109.5 pass)

## Evaluation approach

Each adapter was exercised using Playwright with `__lwTauriMock` injection — real file content injected via the Tauri mock, loading through the full adapter stack into `__lwGraphSummary`. This evaluates adapter logic: parsing, normalization, error handling, and warning quality. The Tauri IPC layer (`read_user_file`, `list_files`, `read_vault_file` Rust commands) was validated in v109.2.0 and is unchanged; it is not re-evaluated here.

**Note for v110+:** a Tauri `dev` visual smoke (graph renders, Sigma draws nodes/edges) should be added to the v113 source-adapter UX maturity pass. For this arc close, the registered-bar concern is adapter logic correctness and error message quality — both fully testable without the Rust path.

---

## §1 — markdown-vault (Obsidian)

**Test source:** Rhyzome vault at `/home/boop/Projects/rhyzome/rhyzome` (2 notes: `Welcome.md`, `create a link.md`; default Obsidian starter vault)

**Load outcome:**
- status: `loaded`
- 2 note nodes, 1 wikilink edge (`Welcome.md` → `create a link.md`)
- 0 warnings

**Wikilink resolution verified:** `[[create a link]]` in `Welcome.md` correctly resolved to `create a link.md`. Disambiguation, alias resolution, and tag extraction can't be verified against this minimal vault — those paths are covered by the fixture-based E2E spec (v109.1.1, 13 notes, disambiguation triplet).

**Misconfiguration test:** pointed `vaultRoot` at `/nonexistent/vault`  
→ error: `"Cannot list vault: Error: No such file or directory: /nonexistent/vault"`  
The `"Cannot list vault:"` prefix gives user context. The OS error suffix is technical but locatable.

**Bar verdict:** PASS  
**Rationale:** Loads real Obsidian vault data; wikilink resolution works; error message is clear about what failed.  
**Action:** Keep `status: "registered"`. Polish note: the OS error suffix (`Error: No such file or directory: ...`) in file-access errors is a v113 UX improvement candidate — wrap in plain language ("vault path not found").

---

## §2 — cytoscape-json

**Test source:** Constructed 6-node service architecture graph (`/tmp/eval-cytoscape.json`, nested `{elements: {nodes, edges}}` format) — REST API, Auth Service, Postgres, Redis Cache, Job Queue, Worker; 7 directed edges.

**Load outcome:**
- status: `loaded`
- 6 nodes, 7 edges
- 0 warnings
- Non-structural `data.type` field correctly preserved in `raw.cytoscapeData`

**Format finding:** The adapter requires a top-level `elements` key (by design, D9). The evaluation initially used `{nodes: [...], edges: [...]}` at the top level — this errors correctly with `"Missing required 'elements' key — not a Cytoscape.js JSON file"`. Correcting to `{elements: {nodes, edges}}` loaded cleanly. The error message for wrong format is clear.

**Misconfiguration test:** passed non-JSON text  
→ error: `"Invalid JSON: SyntaxError: Unexpected token 'h', "this is not json {{{" is not valid JSON"`  
The `"Invalid JSON:"` prefix is correct context. The V8 `SyntaxError` detail is standard JS engine output — technical but not misleading; LumaWeave is a developer tool and users pointing at a non-JSON file will understand "invalid JSON."

**Bar verdict:** PASS  
**Rationale:** Real-format data loads cleanly; error messages identify the failure correctly; no silent failures.  
**Action:** Keep `status: "registered"`. Polish note: V8 error detail in JSON parse errors is a v113 UX candidate — could be trimmed to `"Invalid JSON at line N: ..."` for readability.

---

## §3 — package-dependency

**Test source:** LumaWeave's own `package.json` (`/home/boop/Projects/lumaweave/package.json`)

**Load outcome:**
- status: `loaded`
- 44 nodes (1 root `lumaweave` + 43 unique packages)
- 43 edges (28 `depends-on`, 15 `depends-on-dev`, 0 `depends-on-peer`)
- 0 warnings
- Root node has `raw.version: "0.15.0"` and `raw.kind: "project"`
- All package nodes have correct `raw.dependencyType` (`"production"` or `"development"`)

**Dual-edge path:** LumaWeave has no packages in both `dependencies` + `peerDependencies`, so the dual-edge path wasn't exercised against this real file. That path is covered by the fixture E2E spec (`react` in both buckets, v109.3.1).

**Misconfiguration test:** pointed `projectPath` at `/nonexistent/project`  
→ error: `"Cannot read file: Error: No such file or directory: /nonexistent/package.json"`  
Clear about what failed.

**Bar verdict:** PASS  
**Rationale:** Loads the real project manifest with correct topology (44 nodes, 43 edges, correct edge types); no warnings; error messages are user-readable.  
**Action:** Keep `status: "registered"`.

---

## §4 — csv-edge-list

**Test source:** Constructed 7-node team collaboration graph (`/tmp/eval-edges.csv`): alice, bob, carol, dave, eve, frank, grace; 10 directed labeled edges (knows, collaborates, mentors, manages, reports-to).

**Load outcome:**
- status: `loaded`
- 7 nodes, 10 edges
- 0 warnings
- All edge `relationship` values correctly read from the `relationship` column

**Misconfiguration test:** pointed `sourceColumn` at `"from"` (not in header)  
→ error: `"Source column \"from\" not found in header row"`  
Excellent — fully user-language, no technical leakage. Best error message of the four adapters.

**Bar verdict:** PASS  
**Rationale:** Loads real CSV data correctly; error messages are the clearest of the four (fully plain-language); no warnings.  
**Action:** Keep `status: "registered"`.

---

## Summary verdicts

| Adapter | Test source | Load | Warnings | Error message quality | Verdict |
|---|---|---|---|---|---|
| markdown-vault | Rhyzome vault (2 notes) | ✓ 2N/1E | — | Good (OS suffix is minor) | **PASS** |
| cytoscape-json | Service arch JSON (6N/7E) | ✓ 6N/7E | — | Good (V8 error suffix is minor) | **PASS** |
| package-dependency | LumaWeave package.json (44N/43E) | ✓ 44N/43E | — | Good (OS suffix same as vault) | **PASS** |
| csv-edge-list | Team collab CSV (7N/10E) | ✓ 7N/10E | — | Excellent (plain language) | **PASS** |

**All four adapters ship as `status: "registered"`.** No downgrades. No spec count changes needed.

### Polish-debt notes (v113 candidates, not blocking v1.0)

1. **File-access error suffix pattern** (markdown-vault, package-dependency, cytoscape-json): `"Cannot read file: Error: No such file or directory: ..."` — the OS error is appended raw. A v113 pass could trim to `"File not found: /path/to/file"` for all three adapters.
2. **JSON parse error detail** (cytoscape-json): V8 `SyntaxError: Unexpected token 'h'` detail is developer-internal. A v113 pass could replace with `"Invalid JSON — check that the file is a valid Cytoscape.js JSON export"`.
3. **csv-edge-list error messages** are already at the v1.0 quality standard — no improvement needed.
