# v109 Adapter Portfolio Report — Strategic + Tactical Survey

**Date:** 2026-06-05  
**For:** Planning Claude + Ryan  
**Scope:** Research only — no code changes, no commits, no installs.

---

## §1 — Current State Anchor

### v108 closure confirmed

**`loadSource` dispatch** — `src/graph/ingest/loadSource.ts:87–115`  
Routes to adapters via a hardcoded conditional. Only one branch exists:

```typescript
if (adapterId === "self-graph-yaml-frontmatter") {
  return loadSelfGraph(inputPath);          // line 109
}
return errorSummary(adapterId, entry.adapterType, `No loader for adapter: ${adapterId}`);  // line 114
```

Every adapter other than `self-graph-yaml-frontmatter` hits the fallback error path. Dispatch is not data-driven; adding a new adapter requires hand-coding an additional conditional here.

**Settings schema** — `src/control-plane/settings/settings.schema.ts:78`  
Schema is at version 92. The `sources` object (lines 57–61) holds:

```typescript
export interface SourcesSettings {
  active: string | null;
  configurations: Record<string, { inputPath?: string }>;
  refreshToken: number;  // v108.0.1: incremented on regenerate success
}
```

`refreshToken` is a reactivity counter, not an auth token. Incrementing it re-triggers `useGraphSourceSummary`.

### Registered adapters

**`src/source-adapter/sourceAdapterRegistry.ts:87–414`** — `readonly SourceAdapterEntry[] ... as const` — confirmed immutable, no `registerSourceAdapter()` API.

| adapterId | adapterType | status |
|---|---|---|
| `self-graph-yaml-frontmatter` | `self-graph` | **registered** |
| `git-codebase` | `git-codebase` | candidate |
| `website-url` | `website-url` | candidate |
| `markdown-vault` | `markdown-vault` | candidate |
| `openapi-spec` | `openapi-spec` | candidate |
| `database-schema` | `database-schema` | candidate |
| `package-dependency` | `package-dependency` | candidate |
| `cloud-infrastructure` | `cloud-infrastructure` | candidate |
| `issue-tracker` | `issue-tracker` | candidate |

Eight candidates exist in the registry with fully-specified `translationSet`, `limits`, and `inputPattern` — they are scoped but have no loaders. The migration to a `register()` API (§4.5) will not change any of these entries.

### Tauri filesystem commands

**`src-tauri/src/fs.rs`** — two commands exist:

- `read_file(path: String)` — reads a single file. Security invariant: `canonicalize(project_root + "/" + path).starts_with(project_root)`. Project-root-only. Any path pointing outside the project directory is rejected.
- `run_script(script: String, args: Vec<String>)` — runs `node <script> [args]`. Script must be in `ALLOWED_SCRIPTS: &[&str] = &["scripts/generate-self-graph.mjs"]` (line 21). Also enforces project-root containment. 60s timeout, 10MB stdout/stderr cap.

`list_files` and `walk_directory` do not exist anywhere in the codebase. Confirmed by grep across `src-tauri/` and `src/`.

### The deferred Gap 5

The registry's `readonly ... as const` shape (confirmed above) is the deferred Gap 5 from the v107 plan. It is now actively blocking: adding adapters requires mutating the const array. §4.5 resolves this.

---

## §2 — Adapter Portfolio Map

The table below surveys 15 candidate adapter types. **Format type:** the input shape (directory / single-file / network-API / generated). **Pattern:** derived = parse source material and *infer* a graph; literal = source is already a graph; hybrid = some of both. **Effort** is for the adapter loader code only, assuming the shared infrastructure in §4 exists. **Demoability** is the product-positioning claim — how strong is the "LumaWeave absorbs this format" statement to someone who uses that format.

| Adapter | Format type | Real-world user base | Pattern | Effort | Shared-infra needs | Demoability |
|---|---|---|---|---|---|---|
| **Obsidian Vault** | directory | Millions of note-takers, researchers, developers using Obsidian for PKM | derived | **MED** | `list_files`, YAML parser (already in deps) | **HIGH** — "your Obsidian vault as a graph" is immediate and visceral |
| **Logseq** | directory | Open-source-preferring PKM users; org-mode + markdown; smaller than Obsidian but loyal | derived | **MED** | `list_files`, EDN/YAML parser (EDN = new dep), block-reference resolution | **MED** — Logseq users are vocal, but the format has block references that add complexity and their DB version is changing rapidly |
| **Roam JSON Export** | single-file | Researchers, writers who were early Roam adopters; smaller + declining base | derived | **LOW** | nothing new (plain JSON) | **LOW-MED** — Roam is shrinking; the "absorb Roam exports" claim resonates with ex-Roam users migrating away |
| **Generic Markdown + Wikilinks** | directory | Any markdown-based wiki (Foam, Dendron, Zettlr, custom systems) | derived | **LOW-MED** | `list_files`, YAML parser (already in deps) | **MED** — less specific than Obsidian but covers a broader long tail |
| **Mermaid** | single-file | Developers everywhere — Mermaid renders in GitHub, GitLab, Notion, Confluence, VS Code | derived | **HIGH** | full Mermaid DSL parser (new dep or custom) | **HIGH** — Mermaid has enormous ecosystem penetration; "render your Mermaid as a themed interactive graph" is compelling |
| **Graphviz DOT** | single-file | Engineers, academics, documentation toolchains using Graphviz | derived | **MED** | DOT parser (new dep or ~200 lines of custom parsing) | **MED** — Graphviz has wide installed base; DOT is the lingua franca of graph description; less flashy than Mermaid |
| **D2** | single-file | Developers who found Mermaid limiting; growing audience, design-forward | derived | **HIGH** | D2 parser (new dep or custom; complex DSL) | **MED** — growing but not yet mass-market; the audience is enthusiastic but smaller |
| **Cytoscape JSON** | single-file | Bioinformatics, network scientists, data analysts using Cytoscape.js or Cytoscape Desktop | literal | **LOW** | nothing new | **MED-HIGH** — direct "absorb Cytoscape exports" claim; makes LumaWeave the premium rendering layer for existing Cytoscape graphs |
| **GraphML** | single-file | Graph theorists, network analysts using yEd, Gephi, or any GraphML-exporting tool | literal | **LOW** | XML parser (DOMParser available in browser context; no new dep) | **MED** — strong signal to the network science / Gephi community |
| **GEXF (Gephi)** | single-file | Gephi users specifically; subset of GraphML audience | literal | **LOW** | XML parser (same as GraphML, can reuse) | **LOW-MED** — niche but passionate; "import from Gephi" is a clear competitive statement |
| **package-dependency** | single-file | Every developer — `package.json`, `Cargo.toml`, `pyproject.toml`, `go.mod` (already in registry) | derived | **MED** | TOML parser for Cargo.toml (new dep) or JSON-only subset (no dep) | **HIGH** — "your project's dependency graph" is immediately relatable to every developer; strong first-demo moment |
| **OpenAPI spec** | single-file | API developers, backend engineers (already in registry) | derived | **MED** | YAML parser (already in deps) | **HIGH** for developer audience — "visualize your API's schema graph" is immediately useful |
| **CSV edge list** | single-file | Anyone with tabular data (data analysts, researchers, non-technical users) | literal | **LOW** | no new dep (CSV parsing is trivial with split/regex at this scope) | **MED-HIGH** — "drag in a CSV" is the strongest non-technical demo moment; removes the "I need a graph format" prerequisite |
| **NetworkX JSON node-link** | single-file | Python data scientists who export graphs from NetworkX (`node_link_data()`) | literal | **LOW** | nothing new | **MED** — Python/data science crowd is large; networkx is the canonical Python graph library |
| **OPML** | single-file | RSS reader users, mind-map exporters, legacy feed readers | derived | **LOW** | XML parser (DOMParser, no new dep) | **LOW** — OPML feels dated; the use case (outline → graph) is real but the user base is shrinking |

### Tier 2 Build Set Recommendation

**Ryan picked `markdown-vault` (Obsidian) as day-1. Alongside it, recommend these three for v109:**

**1. Cytoscape JSON** — LOW effort, zero new infrastructure needs, absorbs the most prominent graph-visualization tool in the scientific/data community. The claim is direct: "already have a Cytoscape graph? LumaWeave renders it better." This is also a proof-of-architecture pass — it exercises the `registerSourceAdapter()` path with a *literal* adapter (no directory walk, no multi-file resolution), validating that the shared infrastructure generalizes beyond the derived/directory case.

**2. package-dependency (already in registry)** — The existing registry entry (`sourceAdapterRegistry.ts:304–338`) has fully-specified `translationSet` and `inputPattern`. The JSON parsing path (package.json) requires nothing new. The TOML path (Cargo.toml) would need a parser — recommend scoping v109 to JSON-only manifests (package.json, pyproject.toml as JSON fallback) and noting Cargo.toml as a follow-on. "Show me who my app depends on" is the most universally relatable demo for developers. Strong Kirby-move claim.

**3. CSV edge list** — LOW effort, maximum accessibility. A user with *any* spreadsheet of relationships (project dependencies, org charts, citation networks, recipe links) can drag in a CSV and get a graph. This is the "it's for everyone" card that the others can't play. It also tests that the architecture doesn't assume complex parsing logic — the simplest possible adapter should work.

**Together:** Obsidian + Cytoscape + package-dependency + CSV covers knowledge graphs, scientific graphs, code structure graphs, and arbitrary data — four distinct user populations and four distinct input patterns. That's a credible "universal target" claim for v1.0.

---

## §3 — Obsidian Vault Adapter Depth-Dive

### 3.1 Vault structure

*[Sourced from Obsidian help docs: https://help.obsidian.md/Files+and+folders/Manage+notes — verified against training knowledge.]*

A vault is a folder on disk. Its contents:

- `.md` files — the notes, organized in whatever folder hierarchy the user chose
- `.obsidian/` — Obsidian's own configuration directory:
  - `app.json` — global preferences
  - `workspace.json` — open panes, layout state
  - `plugins/` — installed community plugins (each is a subdirectory)
  - `themes/` — installed themes
  - `snippets/` — CSS snippets
  - `hotkeys.json`, `graph.json`, etc.
- Attachment directories — images, PDFs, audio. Location is user-configurable (default: same directory as the note, or a dedicated folder like `attachments/`). Files are `.png`, `.jpg`, `.pdf`, `.webm`, etc.
- `.canvas` files — Obsidian Canvas format. Canvas files are JSON-based visual whiteboards that embed cards pointing at notes. **Recommendation: out of scope for v109.** Canvas is a separate format (layout, not structure), its nodes reference other notes by path, and supporting it fully would require a separate adapter. Ignore `.canvas` files in the vault walk.

**For the adapter:** walk `.md` files only, skip `.obsidian/`, skip hidden files/directories (any path component starting with `.`).

### 3.2 File traversal

Vaults range from 10 notes (new user) to 50,000+ notes. Community forums have users reporting 30,000-note vaults that they expect to open quickly in Obsidian.

Pathological cases:
- **Symlinked subdirectories**: Obsidian supports symlinks in vaults; a symlinked directory that points to a parent creates an infinite loop. The `list_files` command (§4.2) should use `follow_symlinks: false` — do not follow symlinks, just record the symlink target path as a file entry or skip it.
- **Network-mounted folders**: iCloud Drive, Dropbox, OneDrive vaults are common. These can be slow (seconds per directory read). The adapter should not assume local disk speeds; honor the 45-second timeout already declared in the registry entry (`sourceAdapterRegistry.ts:224`).
- **Very deep hierarchies**: Unusual (most vaults are flat or 2-3 levels deep) but possible. A `max_depth: 20` cap in `list_files` is safe.
- **10,000+ notes**: The registry already declares `maxNodes: 2000` (`sourceAdapterRegistry.ts:219`). For v1.0, honor this limit and display a warning to the user when the vault is truncated. Streaming/chunked processing is a future improvement.

### 3.3 Frontmatter parsing

Standard YAML block delimited by `---` at the very start of the file:

```markdown
---
title: My Note
tags: [project, research]
aliases: [Alt Name, Other Name]
created: 2024-01-15
---

# My Note
body text...
```

**Fields that matter for graph construction:**
- `tags` / `tag` — list of tags; can be YAML list (`[a, b]` or `- a\n- b`) or scalar string
- `aliases` — list of alternate names for this note; critical for wikilink resolution (see §3.4)
- Any other field — preserve as node properties (useful for future filtering/display, not required for graph structure)

**Good news: `yaml` package (`^2.8.4`) is already in `package.json`.** No new install needed. `yaml.parse(frontmatterString)` handles all valid YAML frontmatter including nested arrays, scalars, and edge cases like null values or missing fields.

Edge case: some notes have no frontmatter at all (just a bare markdown heading and body). The parser must handle both — if the file does not start with `---`, skip frontmatter parsing and treat fields as empty.

### 3.4 Wikilink resolution

*[Sourced from Obsidian docs: https://help.obsidian.md/Linking+notes+and+files/Internal+links — verified against training knowledge.]*

Obsidian's wikilink syntax:

| Syntax | Meaning |
|---|---|
| `[[Note Name]]` | Link to a note by filename (without extension) |
| `[[Note Name\|Display Text]]` | Same resolution, different label |
| `[[Note Name#Header]]` | Link to a note + specific heading; strip `#Header` for resolution |
| `[[Note Name#^block]]` | Link to a block; strip `#^block` for resolution |
| `[[folder/Note Name]]` | Folder-qualified path — more specific match |

**Resolution algorithm (Obsidian's "shortest unique path"):**

1. **Exact path match**: If `[[folder/Note Name]]`, find the file at exactly `vault/folder/Note Name.md`.
2. **Filename match**: If `[[Note Name]]`, collect all `.md` files whose stem equals `Note Name` (case-insensitive in Obsidian's default).
3. **Alias match**: A file with `aliases: ["Other Name"]` in frontmatter is also a valid target for `[[Other Name]]`.
4. **Ambiguity resolution**: If multiple files match, pick the one in the closest directory to the source note (same directory > parent directory > sibling > anywhere in vault). If still tied, alphabetical.
5. **Unresolved links**: `[[Missing Note]]` where no file matches — these can be rendered as stub nodes (useful for showing "planned but not yet written" notes) or silently dropped. Recommendation: include as stub nodes, marked with a `status: "unresolved"` property. Makes the graph more complete and hints at the user's intentions.

**Two-pass algorithm:**
- Pass 1: Walk all `.md` files, parse frontmatter, build an index: `Map<filename-stem, SourceAdapterEntry[]>` + `Map<alias, SourceAdapterEntry[]>` (for aliases).
- Pass 2: Re-scan each file's body for `[[...]]` patterns, resolve each link against the index, emit edges.

This is the non-trivial part of the adapter. The regex for finding wikilinks in body text needs to skip code blocks (fenced and inline) and raw URLs that happen to contain `[[`.

### 3.5 Tag parsing

Tags appear in two places:

**In frontmatter:**
```yaml
tags: [project, research, #urgent]   # YAML list syntax
tags:                                  # Block scalar syntax
  - project
  - research
tag: single-tag                        # Singular form
```

**Inline in body:**
```
Text with a #tag and #another/nested-tag here.
```

Inline tags follow the pattern `#[a-zA-Z][a-zA-Z0-9_/-]*` in body text (not inside code blocks, not in URLs).

**Tag representation recommendation: tag-nodes, not tag-edges.**

Tag-edges (note-to-note via shared tag) create combinatorial explosion: a vault with 200 notes all tagged `#project` would produce 200×199/2 = 19,900 implied edges, making the graph unreadable. Tag-nodes (each unique tag is a node; each note has an edge to each of its tags) produce N total note-to-tag edges — a clean bipartite subgraph that naturally shows clustering. Tag-nodes also make tags first-class navigable entities (you can click "this is what everything tagged #project looks like"), which is a stronger UX than implicit tag-edges.

Nested tags (`#tag/subtag`) should produce *both* the full tag node (`tag/subtag`) and the parent tag node (`tag`), with an edge from subtag to parent. This models the hierarchy explicitly.

### 3.6 Edge types

Three candidate edge types:

**(a) Explicit wikilinks** — `[[Note]]` → directed edge from source note to target note. The primary graph structure.

**(b) Tag membership** — note → tag-node (from §3.5). Secondary layer.

**(c) Backlinks** — the reverse of wikilinks: if A links to B, B "backlinks to" A. These are *derived* from (a) — they don't add new information, they just flip direction.

**Recommendation for default:** include (a) and (b); exclude (c) as separate edges. Backlinks can be computed from (a) at query time and don't need to be stored as edges. Adding bidirectional edges for every wikilink doubles edge count and creates a graph that is hard to read directionally. Let the user toggle backlink display as a view option rather than baking it in as a structural edge.

**Configurable additions:**
- "Show unresolved stubs" — on/off for stub nodes
- "Show tag nodes" — on/off for the tag-node layer (if off, tags become node properties only)
- "Include frontmatter fields as node properties" — which custom fields to preserve

### 3.7 Performance

| Vault size | Notes | Est. raw text | Load-all feasibility |
|---|---|---|---|
| Small | < 500 | < 25MB | Trivially fine |
| Medium | 500–2,000 | 25–100MB | Fine for v1.0 |
| Large | 2,000–10,000 | 100–500MB | Marginal; existing `maxNodes: 2000` cap protects |
| Very large | 10,000+ | > 500MB | Not safe for load-all without streaming |

**Recommendation for v1.0:** honor the existing `maxNodes: 2000` limit already declared in `sourceAdapterRegistry.ts:219`. Alphabetically select the first 2,000 notes (or by modification date — more useful). Display a user-visible warning: "Your vault has X notes; showing the first 2,000. Increase the limit in settings or filter by folder." This is straightforward and avoids the complexity of streaming/chunked processing, which is a v2 feature.

### 3.8 Node identity

Recommendation: **full path relative to vault root** (e.g., `notes/My Note.md`).

Rationale:
- Globally unique within the vault — no ambiguity even with same-named notes in different folders
- Human-readable in debug output and graph edges
- Stable as long as the file isn't moved or renamed (acceptable stability guarantee)
- Consistent with how Obsidian itself identifies files internally

Display label: filename stem without extension (e.g., `My Note`), with disambiguation suffix if multiple notes share a stem (e.g., `My Note (notes/)` vs `My Note (archive/)`).

Do not use frontmatter `id` fields as the primary graph ID. User-defined `id` fields are not guaranteed unique, not guaranteed present, and their semantics vary by user. Preserve as a node property if present.

### Effort rating: **MED**

The wikilink resolution algorithm (two-pass, alias handling, ambiguity resolution, code-block skipping) is the non-trivial core — maybe 150–200 lines of focused logic. Frontmatter YAML parsing is now effectively free (yaml already in deps). Directory walking needs new Tauri infrastructure (§4). The graph construction from parsed data is straightforward. No algorithmic heavy-hitters, but the integration surface is wide and the edge cases are numerous enough to warrant careful testing.

---

## §4 — Shared Infrastructure: New Tauri Commands

### 4.1 Path validation policy for user-configured roots

Current model (`src-tauri/src/fs.rs:6–15`): validate `canonicalize(root + "/" + path).starts_with(canonical_root)` where `root` is the project root from `get_project_root_inner()`. Hardwired to the LumaWeave project directory. An Obsidian vault at `~/Documents/MyVault/` is elsewhere on disk and fails this check.

**Three options:**

**Option A — Manual Rust validation against user-configured root**  
Change the validation from "must be inside project root" to "must be inside user-configured vault root" (stored in settings, passed as an argument to `list_files`). The `list_files(root, extensions, exclude_prefixes, max_depth)` command canonicalizes `root` directly (instead of calling `get_project_root_inner()`), then validates every path against it. `read_file` keeps its current project-root validation for the self-graph adapter; new file-reading for vault adapters goes through the new `list_files` + a new `read_vault_file(vault_root, relative_path)` variant.

- **For Ryan:** No new dependencies. The same security model that already works in production. Fully auditable — 20–30 lines of Rust. Consistent with the existing codebase pattern.
- **Against:** More Rust code we own. Two separate path-validation code paths (`read_file` uses project root, `read_vault_file` uses user-configured root) — must keep them consistent.
- **User-facing:** No behavior change visible to users. Vault path is set once in settings; thereafter all reads are silent and fast.

**Option B — `tauri-plugin-fs` with runtime scope**  
Tauri 2's `tauri-plugin-fs` supports runtime filesystem scope via `app.fs_scope().allow_directory(path, recursive)`. *[CACHED KNOWLEDGE: This is from training data; the current Tauri 2 plugin docs at https://v2.tauri.app/plugin/file-system/ should be consulted before implementation to confirm the runtime-allow API hasn't changed.]*

- **For:** Battle-tested plugin maintained by the Tauri team. Richer FS API (metadata, copy, move, etc.) that later adapters might want.
- **Against:** New dependency — **requires explicit per-install approval per CLAUDE.md** (supply-chain safeguard). Adds a plugin's attack surface. The dynamic scope API must be understood and audited before trusting it with user documents. The plugin's full FS API is more than needed (we want read-only).
- **User-facing:** No visible difference to users in v1.0. The plugin's value would show in future adapters that need richer FS access.

**Option C — Hybrid**  
Keep Option A for project-root access (self-graph, code adapters). Use Option B for user-configured external roots.

- **For:** Clean separation of concerns. Internal paths stay under manual validation; external user paths get the plugin's maintained security.
- **Against:** Two different security models in the same codebase — more mental overhead, more code paths to audit. The inconsistency itself is a risk surface.

**Recommendation: Option A.**

In product terms: LumaWeave is a single-developer local-first app. Option B's main value (maintained security model, community-vetted code) is optimized for team products where one engineer's security review is insufficient. Here, a 20-line Rust function that mirrors the existing `read_file` pattern is easier to audit than a plugin dependency with a runtime scope API. The package-install safeguard in CLAUDE.md is also real: vetting `tauri-plugin-fs` properly takes time, and the v109 arc doesn't need it. Option B can be revisited post-v1.0 if richer FS needs emerge.

### 4.2 `list_files` / `walk_directory` command shape

**Recommended signature:**

```rust
#[tauri::command]
pub async fn list_files(
    root: String,
    extensions: Vec<String>,        // e.g. ["md"] — filter; empty = all files
    exclude_prefixes: Vec<String>,  // e.g. [".obsidian", ".git", "."] — skip dirs/files
    max_depth: Option<u32>,         // default 20, hard cap at 50
) -> Result<Vec<String>, String>
```

**Returns:** relative paths (relative to `root`), e.g. `["notes/My Note.md", "archive/Old Note.md"]`. Rationale: absolute paths in the return value would expose the user's full home directory structure to the JS layer, which is unnecessary. The JS adapter has the vault root already (it's in settings); it can construct absolute paths by joining if needed.

**Security:** Same two-step pattern as `read_file`:
1. Canonicalize `root` — fail if it can't be canonicalized (doesn't exist or permission denied)
2. For every file discovered, canonicalize its full path and verify `starts_with(canonical_root)` — prevents traversal attacks via `..` components or malformed paths

**Symlinks:** `follow_symlinks: false` — do not follow symbolic links. Skip them silently. Prevents symlink loop cycles without needing explicit cycle detection.

**`walk_directory` alternative** (returning `FileEntry { path, kind: file|dir }`): more flexible, but the Obsidian adapter and all foreseeable v109 adapters need only file paths. The added directory-entry information creates complexity in the JS layer (callers must filter to files). Simpler `list_files` is the right scope for v109.

### 4.3 User folder-picker

`tauri-plugin-dialog` in Tauri 2 provides a native folder picker dialog (`open()` with `directory: true`). *[Docs: https://v2.tauri.app/plugin/dialog/ — CACHED KNOWLEDGE: verify against current docs before implementation.]*

**This is a new dependency — requires explicit per-install approval per CLAUDE.md.**

**Recommendation for v1.0: text input field in SettingsPanel. No folder picker, no new dep.**

In product terms: LumaWeave's target user for v1.0 is a developer who already has an Obsidian vault and knows exactly where it lives (`~/Documents/Vault/`, `~/Dropbox/Notes/`, etc.). A text input with placeholder "Absolute path to vault root, e.g. /home/you/Documents/MyVault" is sufficient and matches the UX pattern of dev tools (VS Code's `settings.json`, Git's remote config, etc.). A folder picker is a polish improvement — worth adding in a post-v1.0 pass once `tauri-plugin-dialog` has been properly vetted and approved.

### 4.4 Permission model for user-configured paths

**How comparable apps handle this:**
- **Obsidian:** Shows a "Choose vault" dialog once. After the user selects a folder, Obsidian reads/writes it freely until the vault is changed. No per-file prompts. No per-session consent.
- **Logseq:** Same pattern — choose graph folder once, free access thereafter.
- **VS Code:** Workspace folder chosen once; all files in the workspace are accessible without additional prompts.

These are the right reference points — they're all local-first desktop apps with similar trust models.

**Recommendation: one-time implicit consent at vault configuration time.**

When the user types a vault root path into the settings panel and saves, that act is the consent. No additional per-read prompts. No per-load confirmation dialogs. The Tauri security boundary (canonicalize + starts_with) enforces the scope automatically — reads outside the configured root are rejected at the Rust layer, not the UI layer.

The vault adapter does not use `run_script` at all. It is purely read-only. The `run_script` allowlist and confirmation considerations from v108 D5 do not apply here.

The one place where additional confirmation makes sense: **if the user configures a vault root that is outside their home directory** (e.g., `/etc/`, `/var/`, a system path). A soft warning in the settings UI ("This path looks like a system directory — are you sure?") covers this edge case without creating friction for the common case.

### 4.5 `registerSourceAdapter()` API — Gap 5 resolved

**Current shape** (`src/source-adapter/sourceAdapterRegistry.ts:87`): static `readonly` const array, `as const` at line 414. No mutation, no listeners, no `register()`.

**Target shape** — mirror the `physicsDialectRegistry` pattern (`src/graph/physics/physicsDialectRegistry.ts:28–56`):

```typescript
// physicsDialectRegistry.ts:32 — mutable entries array
const entries: PhysicsDialect[] = [];
// physicsDialectRegistry.ts:28 — register() in the contract
register: (entry: PhysicsDialect) => void;
// physicsDialectRegistry.ts:52–55 — implementation
register: (entry) => {
  entries.push(entry);
  listeners.forEach(l => l());
},
```

**Migration for `sourceAdapterRegistry.ts`:**

1. Change `const SOURCE_ADAPTER_ENTRIES: readonly SourceAdapterEntry[] = [...] as const` to `const entries: SourceAdapterEntry[] = []` plus a `const listeners: Array<() => void> = []`
2. Add `export function registerSourceAdapter(entry: SourceAdapterEntry): void { entries.push(entry); listeners.forEach(l => l()); }`
3. Add `export function subscribeSourceAdapters(listener: () => void): () => void` (unsubscribe pattern)
4. Keep all existing exports (`getAllSourceAdapterEntries`, `getSourceAdapterEntryById`, etc.) — their signatures are unchanged, they now read from `entries` instead of the const
5. Convert each entry in the old const array to a `registerSourceAdapter({...})` call at the bottom of the same file

Consumer code breaks at zero points — all exported getter functions retain identical signatures and return types.

**`loadSource.ts` dispatch refactor** (can be done in the same pass or deferred): replace the `if (adapterId === "self-graph-yaml-frontmatter")` conditional with a `Map<string, LoaderFn>` that gets populated alongside `registerSourceAdapter()`. Each adapter's loader is registered at module init time. This makes adding a new adapter a one-call operation rather than a conditional addition.

---

## §5 — Plugin vs Core: Custom Adapter Architecture

**Existing precedent in the codebase:** All registries (`physicsDialectRegistry`, `tileSectionRegistry`, `themeTargetRegistry`, `systemIndexRegistry`, `commandRegistry`, etc.) use internal `register()` calls — every entry is shipped inside the LumaWeave binary. None load external code. The `register()` APIs are extension points for the *in-binary* author, not for runtime-external callers.

### Option A — All-in-core

Every adapter ships in the LumaWeave binary. Adding an adapter = modifying LumaWeave source, rebuilding, shipping a new version.

- **For Ryan:** Maximum control over adapter quality, UX consistency, testing standards. Every adapter is reviewed, tested, and shipped together. No plugin versioning issues.
- **Against:** Hard cap at "what Ryan personally ships." Community can't contribute a format without a PR. No long-tail format support.
- **Concrete shape:** Keep `registerSourceAdapter()` internal. Ship N adapters in v1.0. New formats ship in new releases.

### Option B — Declarative config adapters (complement to A)

For formats that are structurally describable (JSON with a known schema, CSV with column headers), ship a "bring your own config" path: a JSON/YAML file that says "nodes live at `$.nodes[*]`, id field is `name`, edges at `$.edges[*]`, source is `from`, target is `to`." Users write/share these as plain text.

- **For:** Dramatically lowers the bar for community contribution. Sharing a 10-line JSON config is far easier than contributing a PR. No code execution surface — a declarative config is just data.
- **Against:** Only covers declarative formats. Mermaid, Obsidian, git-codebase — anything requiring procedural logic — cannot be expressed this way. This is a *complement*, not a replacement for core adapters.
- **Concrete shape:** A "custom adapter config" loader in the adapter engine that reads a user-provided `.lumaadapter.json` file. Ships alongside the core adapters; "import from custom config" is a UX path in SourceAdapterPanel.

### Option C — Plugin SDK (runtime-loaded JS/WASM)

External developers write JS/WASM modules that register adapters at runtime. LumaWeave provides a stable SDK API.

- **For:** Infinite extensibility. Strong "ecosystem" claim. Standard pattern (VS Code extensions, Obsidian plugins, Roam plugins).
- **Against:**
  - Real engineering investment: SDK design, plugin lifecycle management, error isolation (one buggy plugin must not crash the main app), security sandboxing (untrusted code inside your app).
  - Versioning hell: plugins break across LumaWeave releases unless the SDK contract is versioned and maintained.
  - Security: plugins running JS need filesystem/network access *through* LumaWeave. They can't call Tauri commands directly; they need a sandboxed proxy. This is a non-trivial security surface.
  - Community adoption precondition: a plugin ecosystem only delivers value if there's a community using LumaWeave. Shipping the plugin infrastructure before the user base exists is building infrastructure for a problem you don't have yet.
- **Concrete shape:** A full arc, probably v2.0 territory. The SDK design alone is a multi-session investigation.

### Recommendation: Option A for v1.0, with B as optional complement

**In product terms:** The v1.0 "Kirby move" claim — "LumaWeave absorbs any format" — is proven by shipping 4–5 quality, well-tested adapters that cover genuinely different formats. Option C is a *distribution* claim ("the community can add formats"), which requires a community to exist. Shipping the plugin infrastructure before the user base does not strengthen the v1.0 claim; it adds scope and complexity without delivering the claim.

Option B (declarative configs) is worth considering as a low-cost addition in v109 or v110 — it costs little to implement and adds a genuine contribution pathway for non-developers. It doesn't require the full plugin infrastructure.

**Post-v1.0 path:** Option C is technically feasible if `registerSourceAdapter()` is designed with a stable API boundary. The key design constraint: the internal `SourceAdapterEntry` type should be kept clean of internal implementation details so that a future external caller could satisfy it. This is a cheap constraint to honor now.

---

## §6 — Recommended v109 Arc Shape

### Proposed pass sequence

**v109.0.1 — Shared infrastructure**
- Migrate `sourceAdapterRegistry.ts` to `registerSourceAdapter()` + mutable entries (the Gap 5 fix)
- Add `list_files` Tauri command in `src-tauri/src/fs.rs`
- Path validation policy decision (Option A implemented — user-configured root validation)
- Update `loadSource.ts` dispatch to use a loader map (optional: could defer to 0.2 but cheap to do here)
- Settings schema update for vault root path (new `sources.vaultRoot?: string` field, schema → v93)
- Typecheck + E2E pass (the existing self-graph E2E must still pass)

**v109.0.2 — markdown-vault adapter**
- Implement the Obsidian vault loader on top of §3's design
- Two-pass algorithm: directory walk → frontmatter parse → wikilink resolve → tag-node construction
- Register via `registerSourceAdapter()`
- Loader registered in `loadSource.ts` map
- E2E test: fixture vault with known notes/links/tags, assert graph structure
- Typecheck + full E2E pass

**v109.0.3 — Cytoscape JSON adapter**
- Implement Cytoscape JSON loader (literal graph: parse `elements.nodes` and `elements.edges`)
- No directory walk needed — single `read_file` call against the project root for now (vault-style external file can be added as a follow-on)
- Register via `registerSourceAdapter()`
- E2E test: fixture Cytoscape JSON file, assert node/edge counts
- Typecheck + full E2E pass

**v109.0.4 — Arc close**
- Semver bump: `0.15.0` → `0.16.0`
- Update `docs/LUMAWEAVE_NOW.md`
- Document the adapter SDK contract (what `registerSourceAdapter()` expects, how to add a new adapter)
- PASS COMPLETE to #changelog, bumper bump

### Hard sequencing constraints

- **0.2 strictly requires 0.1** — needs `list_files` Tauri command + `registerSourceAdapter()` API
- **0.3 requires `registerSourceAdapter()` from 0.1** — but does *not* require `list_files` (Cytoscape is single-file). In principle, 0.3 could parallelize with 0.2, but sequential is safer (one adapter at a time, one test baseline at a time)
- **0.4 requires 0.1–0.3** — the arc close documents what was built

### Estimated total scope

| Pass | Sessions | Agent hours | Key risk |
|---|---|---|---|
| v109.0.1 | 1 | 2–3h | Tauri Rust changes require typecheck + integration test; fs.rs changes are non-trivial |
| v109.0.2 | 2 | 4–6h | Wikilink resolution has many edge cases; fixture vault construction takes time |
| v109.0.3 | 1 | 1–2h | Low complexity; main risk is misreading the Cytoscape JSON format |
| v109.0.4 | 0.5 | 1h | Documentation pass; minimal risk |
| **Total** | **~4.5** | **8–12h** | — |

---

## §7 — Pre-flight Decisions for Ryan

Every decision below is framed as: **Question → Recommendation → What it means for the user.**

---

**Decision 1: Path validation policy for vault access**

*Option A (manual Rust validation, user-configured root) vs Option B (tauri-plugin-fs, new dep) vs Option C (hybrid).*

**Recommend: Option A.**  
What it means: LumaWeave reads vault files using the same security model it already uses for the self-graph — your vault path is configured once in settings, and LumaWeave only reads inside that folder. No new dependencies to vet. For the user, behavior is identical to how Obsidian and Logseq handle vault access.

---

**Decision 2: Folder picker dialog**

*Text input in settings (no new dep) vs `tauri-plugin-dialog` (new dep, native OS dialog).*

**Recommend: text input for v1.0, folder picker as post-v1.0 polish.**  
What it means: In v1.0, you type your vault path into a settings field (same as you'd configure a path in VS Code). The path is validated immediately — if it doesn't exist or isn't a directory, you see an error. A native folder picker is nicer but requires vetting a new Tauri plugin. Defer unless the developer experience feels too rough during testing.

---

**Decision 3: Tag representation in the vault graph**

*Tag-nodes (each tag becomes a node; notes connect to their tags) vs tag-edges (note-to-note implied edges via shared tags).*

**Recommend: tag-nodes.**  
What it means: Your graph will have note nodes and tag nodes. A note with `#project` and `#research` tags will have two edges going out to the `project` and `research` tag nodes. Vaults with 200 notes all tagged `#project` don't produce an unreadable mess of 20,000 tag-edges — they produce clean clusters around the tag node. Tags become clickable/navigable entities. Tag-edges are opt-in via settings for users who want that view.

---

**Decision 4: Default edge types for the Obsidian adapter**

*Wikilinks only vs wikilinks + tag-nodes vs wikilinks + tag-nodes + backlinks as explicit edges.*

**Recommend: wikilinks + tag-nodes; backlinks computed on demand, not stored as edges.**  
What it means: The graph shows the structure you explicitly created (your `[[links]]` and your `#tags`). Backlinks — the reverse of your wikilinks — are always computable but don't appear as separate edges (which would double edge density). Future releases can add a "show backlinks" toggle. Keep the default graph clean.

---

**Decision 5: Note count ceiling for v1.0**

*Honor existing `maxNodes: 2000` cap (sourceAdapterRegistry.ts:219) vs raise the limit vs remove it.*

**Recommend: honor the existing 2,000-note cap for v1.0, with a user-visible truncation warning.**  
What it means: Vaults up to 2,000 notes load in full. Larger vaults load the first 2,000 (sorted alphabetically or by modification date) and show a message like "Your vault has 8,432 notes — showing the first 2,000. You can filter by folder in settings." This avoids memory issues with very large vaults and sets a clear UX expectation. Streaming/progressive loading is a v2 feature.

---

**Decision 6: Node identity for vault notes**

*Relative path from vault root vs bare filename stem vs frontmatter `id` field.*

**Recommend: relative path from vault root (e.g., `notes/My Note.md`).**  
What it means: Each note has a unique, stable ID based on where it lives in your vault. Two notes with the same filename in different folders get different IDs. The display name in the graph is just the filename stem (`My Note`), with a folder disambiguation suffix if needed. You don't need to add `id:` fields to every note for LumaWeave to work.

---

**Decision 7: Tier 2 build set**

*Alongside `markdown-vault`, which 2–4 adapters ship in v109?*

**Recommend: Cytoscape JSON + package-dependency + CSV edge list.**  
What it means:
- **Cytoscape JSON**: "You already have a graph in Cytoscape? Drop the JSON export into LumaWeave and get a beautiful themed render." Covers scientific and network-analysis users.
- **package-dependency** (already in registry, just needs a loader): "Show me who my app depends on." Immediate value for every developer. Scoping to `package.json`/`pyproject.toml` in v109 is enough; `Cargo.toml` can follow (needs a TOML parser dep — approval required).
- **CSV edge list**: "Drag in a spreadsheet." The broadest possible accessibility claim. `source,target,label` CSV → graph in seconds. Works for org charts, citation networks, anything tabular.
Together: knowledge graphs (Obsidian), scientific/network graphs (Cytoscape), code graphs (package-dependency), and arbitrary data graphs (CSV). Four distinct populations, four distinct input shapes.

---

**Decision 8: Plugin model for v1.0**

*Option A (all-in-core only) vs Option A+B (core + declarative config adapters) vs Option C (plugin SDK).*

**Recommend: Option A for v1.0; Option B as optional v109 stretch goal; Option C for post-v1.0.**  
What it means: Every adapter in v1.0 ships inside LumaWeave — quality-controlled, tested, and polished. You don't publish a plugin SDK at launch (that requires a community to exist before it's valuable). The declarative-config adapter (Option B) is a lightweight community-contribution pathway that could be added in v109.0.3 or v110 with minimal risk. The full plugin SDK (Option C) is scoped for a future arc when there's a user base to benefit from it. In the meantime, `registerSourceAdapter()` is designed cleanly enough that a future external-caller path is architecturally possible without redesigning it.

---

**Decision 9: `registerSourceAdapter()` migration timing**

*Migrate in v109.0.1 (standalone infra pass) vs bundle with the first new adapter in v109.0.2.*

**Recommend: v109.0.1, standalone.**  
What it means: The registry migration is a mechanical refactor with no user-visible behavior change (self-graph still works, all existing candidates still appear as candidates). Doing it in its own pass means: (a) it gets its own typecheck + E2E verification before any adapter code is added; (b) v109.0.2 can assume the new API exists and not carry two concerns in one pass. One commit, one concern.

---

*End of report. All code claims cite file:line. External format claims cite docs URLs or are marked \[CACHED KNOWLEDGE\] where not verified against current docs. Recommendations include product-language tradeoff framing.*
