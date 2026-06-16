# Source Adapter System — Cross-Reference & Development Plan

Audited against `docs/canonical/SOURCE_ADAPTER.md`, `sourceAdapterRegistry.ts`, `loadGraphifySource.ts`, `useGraphSourceSummary.ts`, `normalizeGraphifyGraph.ts`, `self-graph-adapter.ts`, `graph.types.ts`, `AppShell.tsx`, and `src-tauri/src/`.

**Audited:** 2026-06-03  
**Status:** Planning — pre-implementation

---

## 1. What Actually Exists vs. What the Docs Claim

| Layer | Doc claims | Code reality | Delta |
|---|---|---|---|
| Self-graph adapter | Fully wired, working | ✓ Confirmed — `adaptSelfGraphToSigma()` handles v0/v1, fixture is 747 KB | None |
| Live source loader | "The live-fetch path (NOT working)" | ✓ Confirmed broken — hardcoded to `/examples/ai-lab/graphify-out/graph.json`, path doesn't exist | None (known paperweight) |
| Registry | 9 typed catalog entries | ✓ Confirmed — sealed `readonly` const array, 1 registered + 8 candidate | No `register()` API |
| Normalization | Generic shape → `LumaWeaveNodeDraft` | ✓ Confirmed — `normalizeGraphifyGraph.ts` handles many raw shapes | Tied to "Graphify" concept, not adapter-typed |
| UI surfaces | `SourceAdapterPanel`, `GraphSourcesTileContent` | ✓ Confirmed — `SourceAdapterPanel` is read-only; `GraphSourcesTileContent` shows live source state | No source selection or configuration UI |
| Tauri backend | Not mentioned | Only `get_project_root()` + `open_in_ide()` — zero ingestion or FS traversal commands | Missing all backend commands for live adapters |
| AppShell fixture/live switching | Mentioned | ✓ Confirmed — `useFixture = isTestEnv || !hasRealSource`, falls back to fixture when fetch fails | Smart; ready for multi-source |
| Source settings | "Graph Sources panel" | `ui.graphTabSections.graphSources` / `sourceAdapter` — collapse state only | No source path configuration persisted |

**Summary:** The canonical doc is accurate. The architecture is correct. The implementation is exactly one adapter deep with a broken live path and no backend commands.

---

## 2. Current Candidate Adapters — Declared Capabilities

What each of the 8 candidate adapters already declares in the registry — their translation sets, limits, and what they need to implement.

### 2.1 `git-codebase`

**What it declares:**
- Input: `.git` path pattern
- Nodes: `file → code.file`, `function → code.function`, `class → code.symbol`, `commit → code.commit`
- Edges: `import → imports`, `call → calls`, `define → defines`, `export → exports`
- Limits: 10,000 nodes / 50,000 edges / 5-depth / 100MB / 60s
- Confidence: `observed`

**What it would surface:**
- File dependency graph (what imports what — already partially done by self-graph's `code-import` edge type)
- Call graph between functions and classes
- Commit history as time-ordered nodes with `defines`/`modifies` edges to files
- Authorship attribution (commit → file, file → committer)
- Hot-path detection (files modified most across commits)
- Module boundary mapping (directory clusters, entry/exit points)

**What's needed to implement:**
- Tauri command: `list_files(root: String, extensions: Vec<String>) → Vec<FileInfo>`
- Tauri command: `git_log(repo: String, max_commits: u32) → Vec<CommitInfo>`
- Tauri command: `parse_imports(file_path: String, language: String) → Vec<ImportEdge>`
- AST-level import/call graph parser (TypeScript: TS compiler API already used in provenance; other languages need separate parsers or WASM-compiled tooling)
- Adapter implementation file: `src/graph/adapters/git-codebase-adapter.ts`

**Confidence note:** `import` edges are `observed`; `call` edges would be `inferred` (static analysis can't resolve dynamic dispatch).

---

### 2.2 `website-url`

**What it declares:**
- Input: `https?://` URL pattern
- Nodes: `html-page → website.page`, `heading → website.heading`, `link → website.asset`
- Edges: `href → links_to`, `canonical → canonicalizes_to`
- Limits: 1,000 nodes / 5,000 edges / 3-depth / 5MB / 30s
- Confidence: `observed`

**What it would surface:**
- Sitemap as a navigable graph (page hierarchy, internal link clusters)
- Broken link detection (target exists or 404)
- Content clusters by topic (pages that link to each other densely)
- Canonical URL chains
- Asset dependency graph (CSS/JS/image files as leaf nodes)
- External link map (outbound links as cross-cluster edges)

**What's needed to implement:**
- Tauri command: `fetch_url(url: String, follow_redirects: bool) → HtmlResponse`
- Crawler with depth/page-count limits (BFS from start URL, respects robots.txt)
- HTML parser extracting hrefs, headings, title, canonical, meta
- Adapter implementation: `src/graph/adapters/website-url-adapter.ts`

**Note:** CORS makes browser-side fetching of arbitrary URLs impossible. This adapter requires Tauri to proxy all requests. In browser-only mode, it's unusable.

---

### 2.3 `markdown-vault`

**What it declares:**
- Input: `**/*.md` path pattern (same as self-graph but different semantics — vault vs codebase docs)
- Nodes: `note → markdown.note`, `heading → markdown.heading`, `tag → markdown.tag`
- Edges: `wiki-link → links_to`, `tag → tagged_as`, `mention → mentions`
- Limits: 2,000 nodes / 10,000 edges / 4-depth / 50MB / 45s
- Confidence: `observed`

**What it would surface:**
- Obsidian/Roam-style knowledge graph: notes as nodes, wiki-links as edges
- Tag taxonomy as a separate cluster layer
- Backlink view (who links to this note)
- Orphan detection (unlinked notes)
- Cluster detection by tag overlap or link density
- Note evolution via git history if available

**What's needed to implement:**
- Tauri command: `read_directory(path: String, extensions: Vec<String>, recursive: bool) → Vec<FileInfo>`
- Frontmatter parser (already essentially exists in generate-self-graph.mjs; needs Rust or TS port)
- Wiki-link extractor (`[[Note Title]]` → edge)
- Tag extractor from frontmatter and inline `#tag` syntax
- Adapter implementation: `src/graph/adapters/markdown-vault-adapter.ts`

**Relationship to self-graph:** The self-graph adapter processes LumaWeave's own docs. The markdown-vault adapter processes any external vault. They share 90% of their extraction logic — the markdown-vault adapter should share or extend the self-graph extraction patterns.

---

### 2.4 `openapi-spec`

**What it declares:**
- Input: `**/*.{json,yaml,yml}` schema pattern
- Nodes: `endpoint → api.endpoint`, `schema → api.schema`, `method → api.method`
- Edges: `response-schema → returns_schema`, `request-schema → uses_schema`, `security → requires_auth`
- Limits: 500 nodes / 2,000 edges / 3-depth / 1MB / 15s
- Confidence: `observed`

**What it would surface:**
- Full API surface as a navigable graph (endpoints → schemas → sub-schemas)
- Security requirement graph (which endpoints require which auth schemes)
- Schema reuse network (schemas referenced by many endpoints)
- Breaking change detection (compare two versions of the spec)
- Endpoint grouping by tag (API tags become clusters)
- Deprecated endpoint flagging (status nodes with `dimFactor`)

**What's needed to implement:**
- No Tauri commands needed — OpenAPI specs are local files, readable via existing `read_file` pattern or bundled at build time
- OpenAPI 3.0/3.1 + Swagger 2.0 parser (JSON/YAML)
- Schema dereferencing (`$ref` resolution) for deep schema graphs
- Adapter implementation: `src/graph/adapters/openapi-spec-adapter.ts`

**This is the most browser/TS-native adapter** — no Tauri backend needed for local files.

---

### 2.5 `database-schema`

**What it declares:**
- Input: `**/*.{sql,prisma}` schema pattern
- Nodes: `table → db.table`, `column → db.column`, `index → db.index`, `constraint → db.constraint`
- Edges: `foreign-key → foreign_key_to`, `index → indexed_by`
- Limits: 1,000 nodes / 5,000 edges / 3-depth / 10MB / 30s
- Confidence: `observed`

**What it would surface:**
- Full relational schema as an entity-relationship graph
- Foreign key dependency chains (cascade paths)
- Index coverage map (which columns are indexed, which queries they serve)
- Nullable/required column annotations as node attributes
- Circular reference detection in FK chains
- Prisma schema: model → relation graph

**What's needed to implement:**
- SQL DDL parser (CREATE TABLE, ADD CONSTRAINT, ADD INDEX)
- Prisma schema parser (simpler — Prisma's own language)
- Both are file-read + parse — Tauri `read_file` sufficient, no traversal needed
- Adapter implementation: `src/graph/adapters/database-schema-adapter.ts`

---

### 2.6 `package-dependency`

**What it declares:**
- Input: `**/{package.json,Cargo.toml,pyproject.toml,go.mod}` manifest pattern
- Nodes: `package → code.package`, `version → code.version`, `license → code.license`
- Edges: `dependency → depends_on`, `dev-dependency → dev_depends_on`, `peer-dependency → transitive_depends_on`
- Limits: 500 nodes / 2,000 edges / 5-depth / 1MB / 15s
- Confidence: `observed`

**What it would surface:**
- Flat and transitive dependency graph (what depends on what)
- License compatibility surface (GPL vs MIT in the same tree)
- Vulnerability surface (nodes with known CVEs via advisory DB lookup)
- Duplicate version detection (same package at multiple versions)
- Bundle size attribution (which packages contribute most to the output)
- Circular dependency detection

**What's needed to implement:**
- `package.json` is pure JSON — readable with `read_file`
- Transitive graph needs either `node_modules/` traversal (Tauri) or `npm ls --json` shell invocation
- `Cargo.toml` / `pyproject.toml` / `go.mod` parsers
- Advisory DB integration (e.g., GitHub Advisory Database API) for vulnerability data
- Adapter implementation: `src/graph/adapters/package-dependency-adapter.ts`

---

### 2.7 `cloud-infrastructure`

**What it declares:**
- Input: `**/*.{tf,yaml,yml}` manifest pattern (Terraform + Kubernetes/CloudFormation)
- Nodes: `service → infra.service`, `container → infra.container`, `bucket → infra.storage`, `role → infra.role`
- Edges: `depends → depends_on`, `connects → connects_to`, `assumes → assumes_role`
- Limits: 2,000 nodes / 10,000 edges / 4-depth / 5MB / 45s
- Confidence: `observed`

**What it would surface:**
- Service dependency graph (what calls what in a microservices system)
- IAM role assumption chains
- Network topology (VPCs, subnets, security groups)
- Storage attachment map (which services read/write which buckets/DBs)
- Cost attribution graph (resource → team → budget)
- Blast radius analysis (if this service goes down, what else breaks)

**What's needed to implement:**
- Terraform HCL parser (complex — `hcl2json` tool or Rust HCL parser)
- Kubernetes YAML parser (standard YAML)
- Adapter implementation: `src/graph/adapters/cloud-infrastructure-adapter.ts`

**This is the highest-complexity adapter** — HCL parsing and cross-resource `${module.x.output}` reference resolution are non-trivial.

---

### 2.8 `issue-tracker`

**What it declares:**
- Input: `https?://(github|linear|jira)\.` URL pattern
- Nodes: `issue → issue.tracker.issue`, `epic → issue.tracker.epic`, `milestone → issue.tracker.milestone`, `owner → issue.tracker.owner`
- Edges: `blocks → blocks`, `duplicate → duplicates`, `assignee → assigned_to`
- Limits: 1,000 nodes / 5,000 edges / 3-depth / 1MB / 30s
- Confidence: `observed`

**What it would surface:**
- Issue dependency graph (blocked-by chains, dependency trees)
- Epic → issue hierarchy (milestone/epic as spine nodes, issues as file-orbit nodes)
- Assignee workload map (owner node with weighted edges to their issues)
- Duplicate cluster detection
- Stale issue graph (issues with no activity in N days)
- Sprint velocity graph (issues closed per cycle)

**What's needed to implement:**
- GitHub Issues API / Linear GraphQL API / Jira REST API integration
- OAuth token management (settings store — no hardcoded credentials)
- Tauri command: `fetch_authenticated(url: String, token: String) → JsonResponse` (avoids CORS)
- Adapter implementation: `src/graph/adapters/issue-tracker-adapter.ts`

---

## 3. Missing Adapter Types — Rounding Out the System

The current 9 adapters cover code, docs, web, APIs, and infra. These gaps remain:

### 3.1 `ast-symbol` — Deep Code Structure

Goes beyond file-level imports to **symbol-level relationships** within files.

- Nodes: function, class, interface, type alias, enum, variable, decorator
- Edges: `calls`, `extends`, `implements`, `uses-type`, `decorates`, `overrides`
- Source: TypeScript compiler API (already used in provenance generation), Rust `syn` crate for Rust, tree-sitter for any language
- Distinct from `git-codebase`: git-codebase is file + commit level; ast-symbol is intra-file symbol level
- Combined: `git-codebase` gives the macro graph; `ast-symbol` gives the micro graph

### 3.2 `runtime-trace` — Live Behavior Graph

Captures **actual runtime behavior** rather than static structure.

- Source: OpenTelemetry traces, Jaeger/Zipkin exports, performance profiles (Chrome DevTools JSON)
- Nodes: service, span, operation, error event
- Edges: `calls` (with latency weight), `errors_at`, `depends_on` (inferred from span parent/child)
- Confidence: `observed` (it actually ran)
- This is the only adapter type where edges are weighted by **frequency** and **latency** rather than structural proximity

### 3.3 `test-coverage` — Quality Surface

Maps which code is covered by which tests, and what the coverage gaps are.

- Source: Istanbul/c8 `coverage-final.json`, Jest coverage output, cargo-tarpaulin
- Nodes: file, function/branch, test suite, test case
- Edges: `tests`, `covers`, `misses`
- Confidence: `observed` (coverage is measured)
- Useful combined with `ast-symbol`: shows which symbols are tested and which are blind spots

### 3.4 `changelog` — Time-Series Graph

Models the evolution of a codebase over time as a graph of events.

- Source: `CHANGELOG.md` (Keep a Changelog format), GitHub releases API, semantic-release output
- Nodes: version release, breaking change, feature, fix, deprecation
- Edges: `introduces`, `deprecates`, `fixes`, `breaks`
- Confidence: `observed` (from explicit changelog) or `inferred` (from git tags)
- Useful for migration planning and understanding API evolution

### 3.5 `graphql-schema` — API Schema Variant

Parallel to `openapi-spec` but for GraphQL.

- Source: `.graphql` schema files or introspection JSON
- Nodes: type, query, mutation, subscription, input, enum, scalar
- Edges: `returns`, `accepts`, `implements`, `extends`, `union-member`
- Same complexity as openapi-spec; no Tauri needed for local files

### 3.6 `env-config` — Runtime Configuration Graph

Maps environment configuration to the services that depend on it.

- Source: `.env` files, `docker-compose.yml`, Kubernetes ConfigMaps/Secrets, AWS Parameter Store exports
- Nodes: config key, service, environment (dev/staging/prod)
- Edges: `reads`, `sets`, `overrides`
- Useful for understanding blast radius of a config change

### 3.7 `communication` — Team Structure Graph

Maps human communication and collaboration topology.

- Source: Slack export JSON, Linear team assignments, GitHub PR review data
- Nodes: person, team, channel, PR, review
- Edges: `reviews`, `collaborates_with`, `owns`, `maintains`
- Confidence: `observed` (from actual message/review data)
- Sensitive — requires explicit user consent and data minimization

### 3.8 `semantic-embeddings` — AI-Inferred Similarity Graph

Uses embedding similarity to connect documents or code that are semantically related even without explicit links.

- Source: any text corpus — notes, code comments, API docs, commit messages
- Nodes: document/chunk
- Edges: `semantically-similar-to` (weight = cosine similarity, threshold-filtered)
- Confidence: `ai-inferred`
- Requires an embedding model (local via Tauri ML plugin, or API call)
- This is the `ai-inferred` confidence tier coming to life

---

## 4. Structural Gaps Cross-Referenced Against Code

These are gaps between the intended architecture and the current code, not gaps in the catalog.

### Gap 1: No adapter driver — `loadGraphifySource` is not adapter-typed

**File:** `src/graph/ingest/loadGraphifySource.ts`

`loadGraphifySource` is hardcoded to one source (`ai-lab`), one URL pattern, and the "Graphify" output format. The registry has 9 adapter types but there is no function that takes `adapterId` or `adapterType` and routes to the appropriate fetch/parse strategy.

**Needed:** `loadSource(adapterId: string, inputPath: string): Promise<GraphSourceSummary>` that:
1. Looks up the adapter entry from the registry
2. Dispatches to the correct adapter implementation
3. Normalizes output through the correct per-adapter normalizer
4. Returns `GraphSourceSummary` as today

### Gap 2: One generic normalizer serving all sources

**File:** `src/graph/normalize/normalizeGraphifyGraph.ts`

The normalizer tries to handle any raw shape by probing multiple possible field names (`nodes`, `elements.nodes`, `graph.nodes`, etc.). This works for one known format but becomes fragile as more adapter types emit different shapes. Each adapter should own its normalization logic, with a shared output contract.

**Needed:** Per-adapter normalizer pattern — `normalizeForGitCodebase()`, `normalizeForMarkdownVault()`, etc. — each calling a shared `validateNormalizedOutput()` contract check.

### Gap 3: No source configuration in settings

**File:** `src/control-plane/settings/settings.schema.ts`

No source paths, URLs, or credentials are persisted. The UI for adding/configuring sources doesn't exist. AppShell's fixture/real-source switch is implicit (tries live, falls back to fixture) rather than user-controlled.

**Needed:**
```typescript
sources: {
  active: string | null;          // active source adapterId
  configurations: {
    [adapterId: string]: {
      inputPath?: string;         // local path or URL
      label?: string;             // human name
      enabled: boolean;
    }
  }
}
```

### Gap 4: No backend commands for local FS or network fetch

**File:** `src-tauri/src/lib.rs`

Only three Tauri commands exist: `greet`, `get_project_root`, `open_in_ide`. There is no:
- File listing command (needed by git-codebase, markdown-vault, package-dependency)
- File reading command (needed by all local-path adapters)
- Authenticated network fetch (needed by issue-tracker, website-url)
- Git command execution (needed by git-codebase)

### Gap 5: Registry is sealed — no external registration API

**File:** `src/source-adapter/sourceAdapterRegistry.ts`

The registry is a `readonly` const array. When an adapter is implemented, its entry currently must be edited inline in this file. There's no `registerSourceAdapter()` function mirroring the gwells pattern. This is a minor friction point but inconsistent with the project's registry-first architecture.

---

## 5. Development Plan — Wiring Adapters Live

Ordered by prerequisite dependency and impact. Each tier produces shippable intermediate state.

---

### Tier 0 — Fix the Broken Live Path (1 session)

This is the paperweight fix. It doesn't implement any new adapter — it makes the infrastructure route-able so new adapters can be plugged in.

**0.1 — Repair `loadGraphifySource` into `loadSource(adapterId, inputPath)`**

Replace `src/graph/ingest/loadGraphifySource.ts` with an adapter-typed loader:

```typescript
// src/graph/ingest/loadSource.ts
export async function loadSource(
  adapterId: string,
  inputPath: string
): Promise<GraphSourceSummary>
```

- Validates `adapterId` against registry
- For now: routes `self-graph` to the existing fixture path; all others return `status: "not-implemented"` with a clear error
- Removes the hardcoded `ai-lab` path and `publicBaseUrl` constants

**0.2 — Add source configuration to settings schema**

Add `sources` section to `settings.schema.ts`:
```typescript
sources: {
  active: string | null;
  configurations: Record<string, { inputPath?: string; label?: string; enabled: boolean }>;
}
```

Default: `{ active: "self-graph-yaml-frontmatter", configurations: {} }`

**0.3 — Wire `useGraphSourceSummary` to settings-driven source**

`useGraphSourceSummary` currently ignores settings. Wire it to read `settings.sources.active` and call `loadSource(activeAdapterId, inputPath)`.

**0.4 — Add source selector UI to SourceAdapterPanel**

Currently read-only. Add a minimal "Set as active source" button per adapter entry (disabled for `candidate` adapters). No configuration UI yet — just selection of registered adapters. AppShell picks it up via the settings change.

**Result:** The live path is no longer broken. Switching between sources is possible from the UI. No new adapters yet, but the plumbing is correct.

---

### Tier 1 — Self-Graph Live Mode (1 session)

Make the self-graph adapter work as a **live source** (re-generated on demand) rather than a bundled fixture.

**1.1 — Add Tauri command: `read_file(path: String) → String`**

In `src-tauri/src/lib.rs`:
```rust
#[tauri::command]
async fn read_file(path: String) -> Result<String, String> {
  std::fs::read_to_string(&path).map_err(|e| e.to_string())
}
```

**1.2 — Add Tauri command: `run_script(script: String, args: Vec<String>) → String`**

Allows the frontend to trigger `generate-self-graph.mjs` and read the output. Sandboxed: only allows scripts within the project directory.

**1.3 — Self-graph live adapter**

Implement `src/graph/adapters/self-graph-live-adapter.ts`:
- Calls `run_script("scripts/generate-self-graph.mjs")` via Tauri
- Reads the output `self-graph-generated.json` via `read_file`
- Passes through the existing `adaptSelfGraphToSigma()` function
- Updates `GraphSourceSummary` with generation timestamp

**1.4 — Source refresh control**

Add a "Regenerate" button to `GraphSourcesTileContent`. On click: calls the live adapter, updates the graph. Spinner during generation.

**Result:** You can point LumaWeave at your own codebase, click Regenerate, and see a live graph of the current state. This is the dogfooding path.

---

### Tier 2 — Markdown Vault Adapter (1–2 sessions)

First fully new adapter, high overlap with self-graph extraction logic.

**2.1 — Add Tauri command: `list_files(root: String, extensions: Vec<String>, recursive: bool) → Vec<String>`**

```rust
#[tauri::command]
async fn list_files(root: String, extensions: Vec<String>, recursive: bool) -> Result<Vec<String>, String>
```

**2.2 — Add Tauri command: `read_files_batch(paths: Vec<String>) → Vec<FileContent>`**

Returns `{ path, content, size, modified }` for each file. Enforces `maxFileSize` limit per file.

**2.3 — Implement `markdown-vault-adapter.ts`**

```typescript
// src/graph/adapters/markdown-vault-adapter.ts
export async function adaptMarkdownVault(rootPath: string): Promise<{
  nodes: LumaWeaveNodeDraft[];
  edges: LumaWeaveEdgeDraft[];
  warnings: string[];
}>
```

Steps:
1. `list_files(rootPath, [".md"], true)` via Tauri
2. `read_files_batch(paths)` in chunks of 50
3. Parse each file: frontmatter (YAML), title (first H1), tags (`#tag` + frontmatter `tags:`), wiki-links (`[[Target]]`), markdown links `([text](path)`)
4. Build node per file: `{ id: slug(path), label: title || basename, type: "note", cluster: null, ... }`
5. Build edges: wiki-link → `links_to`, tag-overlap → `tagged_as`
6. Return normalized `LumaWeaveNodeDraft[]` / `LumaWeaveEdgeDraft[]`

**2.4 — Promote registry entry to `registered`**

Update `sourceAdapterRegistry.ts` entry for `markdown-vault` to `status: "registered"`.

**2.5 — Add vault path configuration UI**

In the source configuration panel: path input for markdown vault root. Validates that the path exists via `get_project_root` relative check.

**Result:** First fully new working adapter. Any Obsidian vault or markdown-first project becomes a LumaWeave graph.

---

### Tier 3 — Package Dependency Adapter (1 session)

Easiest "structural data" adapter — local file, pure JSON parsing.

**3.1 — Implement `package-dependency-adapter.ts`**

```typescript
export async function adaptPackageDependency(manifestPath: string): Promise<{
  nodes: LumaWeaveNodeDraft[];
  edges: LumaWeaveEdgeDraft[];
  warnings: string[];
}>
```

Steps:
1. `read_file(manifestPath)` via Tauri
2. Parse `package.json` (or `Cargo.toml` TOML, `pyproject.toml`)
3. Each package name in `dependencies`/`devDependencies`/`peerDependencies` becomes a node
4. Each dependency relationship becomes an edge with weight: `depends_on → 0.9`, `dev_depends_on → 0.5`, `transitive_depends_on → 0.3`
5. Optionally: if `node_modules/` exists, walk it to get transitive deps (depth-limited)

**3.2 — Promote registry entry to `registered`**

**Result:** Any JavaScript/Rust/Python project's dependency graph becomes navigable in LumaWeave. Combined with self-graph, you can see code structure AND dependency topology side by side (future: multi-source overlay).

---

### Tier 4 — OpenAPI Spec Adapter (1 session)

No Tauri needed — local file, pure JSON/YAML parsing.

**4.1 — Add YAML parser**

OpenAPI specs are frequently YAML. The project doesn't currently parse YAML. Options:
- Use `js-yaml` (already in many toolchains; check if it's in `node_modules`)
- Or add as a new dependency (requires developer approval per CLAUDE.md)
- Alternatively: accept only JSON format for v0, add YAML in v1

**4.2 — Implement `openapi-spec-adapter.ts`**

Steps:
1. Read file; parse JSON or YAML
2. Detect OpenAPI version (2.0 Swagger vs 3.0/3.1)
3. Extract paths → endpoint nodes (cluster by tag)
4. Extract components/definitions → schema nodes
5. Resolve `$ref` references into edges (`references_schema`)
6. Extract security schemes → auth nodes with `requires_auth` edges
7. Group by tag → cluster assignment

**Result:** Any OpenAPI-documented API becomes a navigable graph. Useful for understanding API surface area and schema reuse.

---

### Tier 5 — Git Codebase Adapter (2–3 sessions)

The dogfooding adapter. Most complex due to AST parsing, but highest value.

**5.1 — Add Tauri commands for git**

```rust
#[tauri::command]
async fn git_log(repo: String, max_commits: u32) -> Result<Vec<CommitInfo>, String>

#[tauri::command]  
async fn git_diff_stat(repo: String, from_sha: String, to_sha: String) -> Result<Vec<FileDiff>, String>
```

**5.2 — Import analysis (TypeScript)**

Reuse the TypeScript compiler API already wired in `generate-provenance-manifest.mjs`:
- Walk `src/**/*.ts(x)` 
- Extract `import` statements → `code-import` edges
- Extract exported symbols → `exports` edges
- Map to `code.file` and `code.symbol` nodes

**5.3 — Implement `git-codebase-adapter.ts`**

Steps:
1. `list_files(rootPath, [".ts", ".tsx", ".js", ".mjs"])` for source files
2. Parse imports via TypeScript compiler API (Tauri script invocation)
3. `git_log(rootPath, 100)` for recent commit history
4. Build file nodes (cluster by directory), commit nodes (cluster by author or time)
5. Build edges: `code-import`, `git-modifies`, `git-authored`

**5.4 — Promote registry entry to `registered`**

**Result:** LumaWeave can visualize any TypeScript/JavaScript codebase. The self-graph becomes a live instance of this adapter pointed at itself.

---

### Tier 6 — Issue Tracker Adapter (2 sessions)

Network-fetched data — requires OAuth token management.

**6.1 — Token storage**

Add to settings schema:
```typescript
integrations: {
  github?: { token: string; encrypted: boolean };
  linear?: { apiKey: string };
}
```

**IMPORTANT:** Tokens must be stored encrypted. Tauri's keychain integration (via `tauri-plugin-stronghold` or OS keychain) is the right mechanism. Plain localStorage is not acceptable for credentials.

**6.2 — Tauri command: `fetch_authenticated(url: String, headers: Vec<(String, String)>) → JsonResponse`**

Proxies authenticated requests through Rust to avoid CORS and keep tokens server-side.

**6.3 — Implement GitHub Issues adapter**

- GitHub GraphQL API: `repository { issues(first: 100) { nodes { ... } } }`
- Issue nodes with labels (→ cluster assignment), assignee, milestone
- `blocks` relationship via issue body parsing (`Blocks #123`)

**6.4 — Promote registry entry to `registered`**

---

### Tier 7 — Multi-Source Overlay (1–2 sessions)

Once 2+ adapters are live, enable viewing multiple sources simultaneously as overlapping graphs.

**7.1 — Multi-source settings schema**

```typescript
sources: {
  active: string[];  // Was: string | null. Now: array for multi-source
  overlay: "merge" | "side-by-side" | "filter";
}
```

**7.2 — Graph merge strategy**

When multiple sources are active, merge their normalized node/edge arrays:
- Same `id` in two sources → same node, edges from both (confidence weighted)
- Different sources → separate clusters, cross-source edges preserved
- Physics: each source's nodes start in their seeded positions; cross-source edges create inter-cluster springs

**7.3 — Source legend in GraphSourcesTileContent**

Show active sources with color-coded badges. Toggle sources on/off without re-fetching.

---

### Tier 8 — Missing Adapter Types (post-v1)

Implement in order of demand:

| Adapter | Prerequisites | Estimated effort |
|---|---|---|
| `ast-symbol` | TypeScript compiler API (already used) | 2 sessions |
| `graphql-schema` | GraphQL schema parser | 1 session |
| `database-schema` | SQL DDL parser (Rust: `sqlparser-rs`) | 2 sessions |
| `test-coverage` | Istanbul JSON parser | 1 session |
| `changelog` | Markdown parser + semantic version extraction | 1 session |
| `runtime-trace` | OpenTelemetry JSON parser | 2 sessions |
| `cloud-infrastructure` | HCL parser (complex) | 3+ sessions |
| `semantic-embeddings` | Embedding model integration | deferred |
| `communication` | Slack/Linear API + privacy controls | deferred |
| `env-config` | YAML/`.env` parser | 1 session |

---

## 6. What the UI Needs

Currently `SourceAdapterPanel` is display-only and `GraphSourcesTileContent` shows live source status. For adapters to be usable, the UI needs:

| UI component | What it does | When needed |
|---|---|---|
| Source selector | Pick active adapter from registered list | Tier 0 |
| Path/URL input | Configure `inputPath` for local-path adapters | Tier 0 |
| Refresh / Regenerate button | Trigger re-ingestion | Tier 1 |
| Source health badge | Show node/edge count, last updated, warnings | Tier 1 |
| Ingestion progress indicator | Show progress for slow adapters (git log, website crawl) | Tier 2 |
| Source overlay toggle | Enable/disable sources in multi-source mode | Tier 7 |
| Credential manager | Token input for authenticated adapters | Tier 6 |

---

## 7. Tauri Backend — New Commands Summary

All commands needed across the full plan:

| Command | Used by | Tier |
|---|---|---|
| `read_file(path) → String` | self-graph live, all local adapters | 1 |
| `list_files(root, extensions, recursive) → Vec<String>` | markdown-vault, git-codebase | 2 |
| `read_files_batch(paths) → Vec<FileContent>` | markdown-vault, git-codebase | 2 |
| `run_script(script, args) → String` | self-graph live (generate-self-graph.mjs) | 1 |
| `git_log(repo, max_commits) → Vec<CommitInfo>` | git-codebase | 5 |
| `git_diff_stat(repo, from, to) → Vec<FileDiff>` | git-codebase | 5 |
| `fetch_authenticated(url, headers) → JsonResponse` | issue-tracker, website-url | 6 |
| `store_credential(key, value)` / `read_credential(key)` | issue-tracker | 6 |

---

## 8. Invariants to Preserve

These come from `SOURCE_ADAPTER.md §3` and must not be violated by any implementation:

1. **Every adapter emits `LumaWeaveNodeDraft[]` / `LumaWeaveEdgeDraft[]`.** No source-specific shapes downstream of the adapter boundary.
2. **`adaptSelfGraphToSigma()` keeps v0 and v1 support.** Don't half-break either path during live-mode migration.
3. **Safety limits declared in registry entries are enforced by the adapter implementation.** An adapter that ignores `maxNodes` is non-conforming regardless of the registry entry.
4. **Confidence typing is required.** Every node and edge must carry `ConfidenceType` — `observed` for structural data, `inferred` for heuristic relationships, `ai-inferred` for ML-derived.
5. **Status lifecycle is a gate, not a label.** Promote an entry from `candidate → registered` only when the implementation exists and `validate-source-adapters.mjs` passes.
