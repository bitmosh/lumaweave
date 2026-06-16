# Investigation brief — v109 Adapter Portfolio Survey (strategic + tactical)

**For:** Terminal Claude · **Output:** one markdown report dropped into PK · **No code changes, no commits, no installs.**

This brief is broader than the v107/v108 briefs — it's a **strategic survey of the source-adapter design space**, not a narrow code audit. The goal is to give planning Claude + Ryan the information they need to (a) pick *which* adapters to build first, (b) decide *how* the architecture should accept custom/community adapters, and (c) lock in the shared infrastructure that the first few adapters will calcify.

Context: LumaWeave's positioning intent is "the layer between graph-viz formats — any format flows in, becomes a beautifully-rendered, themable graph." The goal isn't competing with Obsidian/Roam/Cytoscape/Gephi; it's *absorbing* their formats so LumaWeave is the universal target. Shipping v1.0 with only 1-2 working adapters undermines that claim; shipping with 4-5 well-chosen ones validates it. This survey picks the 4-5.

**Hard stops:**
- No code changes. No commits. No installs.
- Cite file:line for every claim about current LumaWeave code.
- For external formats (Obsidian, Mermaid, Cytoscape, etc.), cite the format's official docs URL where possible. If a claim is from cached knowledge without verification, mark it explicitly.
- Every recommendation must include a tradeoff analysis in *product terms* (what shipping it means for the user / for LumaWeave's positioning), not just engineering preference. Ryan brings product instincts; the report must speak that language.

---

## §1 — Current state (quick anchor)

Brief audit, file:line citations:
1. Confirm v108 closed clean: `loadSource(adapterId, inputPath)` dispatches in `loadSource.ts`; self-graph adapter live-loads via Tauri `read_file`; `run_script` exists with hard-coded allowlist; settings schema is at v92 with `sources.refreshToken`.
2. List currently registered adapters in `sourceAdapterRegistry.ts` — id, status, label.
3. The registry is currently a `readonly` const array (no `registerSourceAdapter()` API). Confirm. This is the deferred Gap 5 from the v107 plan, now relevant.
4. Confirm `read_file` is the only fs-related Tauri command; no directory traversal exists.

---

## §2 — Adapter portfolio map (the big strategic table)

Survey ~12-15 candidate adapter types LumaWeave could plausibly support. For each, produce a row with:

- **Adapter name** (e.g. "Obsidian Vault", "Mermaid", "Cytoscape JSON", "GraphML", "OPML")
- **Format type:** directory / single-file / network-API / generated
- **Real-world user base:** brief sentence (who uses this, what for)
- **Implementation pattern:** derived (parse + build graph) / literal (parse pre-computed graph) / hybrid
- **Effort:** LOW / MED / HIGH (with one-line rationale)
- **Shared-infrastructure needs:** what new primitives does it require (e.g. "needs `list_files`", "needs YAML parser", "needs HTTP client", "needs nothing new")
- **Demoability/impact:** LOW / MED / HIGH (in *product positioning* terms — how strong is the Kirby-move claim if LumaWeave ships this?)

Categories to consider (not exhaustive — add what you find relevant):

- **Knowledge / notes:** Obsidian Vault, Logseq, Roam JSON export, generic Markdown-with-wikilinks, Foam, Dendron
- **Diagram DSLs:** Mermaid (parse the DSL), Graphviz DOT, PlantUML, D2
- **Graph data formats:** GraphML (XML), GEXF (Gephi), JSON Graph Format (JGF), Cytoscape JSON, NetworkX JSON node-link, generic JSON edge list
- **Code structure:** import-graph from a JS/TS repo (using tree-sitter or AST), call-graph, package-dependency tree (package.json / Cargo.toml / requirements.txt)
- **Web data:** OPML, RDF/Turtle, JSON-LD, OpenAPI spec, GraphQL schema
- **Generic:** CSV edge list, TSV adjacency, "any JSON tree"

After the table, **recommend a "Tier 2 build set"** — pick 3-5 adapters that together produce the strongest "we absorb the ecosystem" claim, with reasoning. Markdown-vault (Obsidian-style) is given (Ryan picked it); recommend the other 2-4.

---

## §3 — Obsidian Vault adapter — depth-dive

Markdown-vault is the day-1 build target, so this section is *implementation-detail* depth, not just survey-level:

1. **Vault structure:** what does an Obsidian vault actually look like on disk? Folder of `.md` files; `.obsidian/` config directory (workspace, plugins, themes — to be ignored or used for metadata?); attachment dirs; canvases (`.canvas` JSON files — separate format, in/out of scope?). Cite Obsidian's docs.
2. **File traversal:** recursive walk, skip `.obsidian/`, skip hidden files. How deep can vaults legitimately go? Are there pathological cases (a vault with 10,000 notes? Symlinked subdirs? Network-mounted folders?) the adapter needs to handle gracefully?
3. **Frontmatter parsing:** YAML at the top of each note, delimited by `---`. What fields matter for graph construction? (`tags:`, `aliases:`, custom user fields). Need a YAML parser — is one already in the npm deps, or would this require an install?
4. **Wikilink resolution:** `[[Note Name]]`, `[[Note Name|Display Text]]`, `[[Note Name#Header]]`, `[[Note Name#^block]]`, `[[folder/Note Name]]`. Two-pass approach (index → resolve). What's the canonical algorithm Obsidian itself uses? (Match against filename without extension; handle aliases; handle folder prefixes; ambiguity → "closest" by some rule.) Cite docs if possible.
5. **Tag parsing:** `#tag`, nested `#tag/subtag`. Inline (in body) and frontmatter (`tags: [a, b]` or `tags:\n  - a\n  - b`). Should tag links be edges (note → note via shared tag) or tag-nodes (notes connected to a tag node)? Recommend.
6. **Edge types:** (a) explicit wikilink, (b) implicit shared-tag, (c) backlinks (computed). Should the adapter produce all three by default? Configurable? Recommend a default.
7. **Performance:** how big can vaults realistically be? (Some Obsidian users have 10k+ notes.) Does the adapter need streaming/chunked processing, or is "load it all, then build the graph" fine for the realistic ceiling? Recommend.
8. **Node identity:** what's the canonical ID for each note? Filename, full path, frontmatter `id` field if present? This affects deduplication and stability across vault edits. Recommend.

Effort rating for the full Obsidian adapter: LOW / MED / HIGH (with rationale).

---

## §4 — Shared infrastructure: the new Tauri commands

The current security model (v108) is `read_file(path)` with `canonicalize → starts_with(project_root)` — designed for self-graph which lives inside the project. **An Obsidian vault is anywhere on disk** — `~/Documents/MyVault/`, `~/Dropbox/Notes/`, etc. The validation rule has to change.

Report on the design choices:

### 4.1 Path validation policy for user-configured roots

Three options:
- **(A)** Reuse `read_file` but change the validation rule to "starts_with the user-configured vault root" (stored in settings). New Tauri command `list_files(root, path)` does the same — root + relative path, validated against the configured root, not project_root.
- **(B)** Adopt `tauri-plugin-fs` with dynamic scope set at runtime (per-vault, when user picks a folder). What does the plugin's scope API actually support — runtime scope changes, or build-time only? (This is the question v108 D1 deferred. Investigate the *current* state of `tauri-plugin-fs` in Tauri 2 — does it support `app.fs_scope().allow(...)` at runtime? Cite the docs.)
- **(C)** Hybrid: keep manual validation for the project-root case (self-graph, codebase adapters), use `tauri-plugin-fs` for user-configured roots (vault, external data).

Recommend one with full tradeoff analysis. Cite docs.

### 4.2 `list_files` / `walk_directory` command shape

Vault discovery needs directory traversal. Propose the Rust command signature:
- `list_files(root: String, extensions: Vec<String>, exclude_prefixes: Vec<String>) -> Result<Vec<String>, String>` ?
- Or `walk_directory(root: String) -> Result<Vec<FileEntry>, String>` where `FileEntry { path, kind: file|dir }` ?
- Recursion depth limit? (Pathological vaults / symlink loops.)
- Return relative paths (relative to root) or absolute?

Sketch the command + rationale. Same security primitives as `read_file` (canonicalize, scope-check).

### 4.3 User folder-picker

If users point LumaWeave at "their Obsidian vault," we need a folder picker dialog. Tauri 2 has `tauri-plugin-dialog`. What's the API? Cite docs. Is this a new install (per-install approval required)?

### 4.4 Permission model for user-configured paths

v108 D5: no confirmation prompts (self-graph in project root). When the user is now pointing at *their personal documents*, does the calculus change? Recommend: one-time consent dialog when adding a new vault root? Capability-config-only? Confirmation per `run_script` (which the vault adapter probably doesn't need at all)? Report the analogous v1.0 desktop apps' patterns (Obsidian itself, Logseq, etc.) for reference.

### 4.5 `registerSourceAdapter()` API (the deferred Gap 5)

Tier 2 *needs* dynamic registration if there will be more than the const-array's worth of adapters. Convert the readonly const to a `register()` pattern matching `physicsDialectRegistry`. What does the migration look like? Sketch.

---

## §5 — Plugin vs core: how does LumaWeave accept custom adapters?

This is the strategic architecture question. Three concrete options, each with real tradeoffs *in product terms*:

### Option A — All-in-core
Every adapter ships in the LumaWeave binary. Adding a new adapter = forking LumaWeave, adding TS code, rebuilding.

- **For Ryan:** simplest engineering. Every adapter is reviewed, tested, polished. Total control over UX consistency.
- **Against:** caps the adapter count at what Ryan personally ships. No long-tail formats. Community can't contribute without a PR.
- **Concrete shape:** keep `registerSourceAdapter()` internal, ship N adapters in v1.0, period.

### Option B — Declarative config adapters
A subset of adapters can be expressed as *config files* (JSON/YAML) that describe parsing rules without executing code. Works for simple formats: "this is a JSON file, the nodes live at `$.nodes`, the edges at `$.edges`, the id field is called `name`." Users could write/share these as plain text.

- **For:** lowers the bar for community contribution dramatically. Some standardization (sharing a single JSON file is easier than a code package).
- **Against:** only works for declarative formats. Can't express Mermaid (DSL parsing), Obsidian (cross-file resolution), or anything that needs procedural logic. So it's a *complement* to core adapters, not a replacement.
- **Concrete shape:** ships alongside core adapters; "import from custom config" is a UX path.

### Option C — Plugin SDK (JS/WASM runtime loading)
A real plugin model. Users (or community) write JS modules that register adapters at runtime. LumaWeave provides an SDK API the plugins target.

- **For:** infinite extensibility. Strong "ecosystem" claim. Industry-standard pattern (VS Code, Obsidian itself, Roam).
- **Against:** real engineering investment (SDK design, plugin lifecycle, error isolation). Security implications (untrusted code in your app). Versioning hell (plugins break across LumaWeave releases). Plus: plugins running JS need filesystem/network access *through* LumaWeave — i.e. the plugin can't just call Tauri commands, it has to go through a sandboxed proxy.
- **Concrete shape:** real arc-level work, probably v2.0 territory, not v1.0. But scoping it now informs how to design `registerSourceAdapter()` and the adapter contract — if a plugin model is ever coming, the core API should be plugin-ready.

### Recommendation

Pick one *for v1.0* (probably A or A+B) with reasoning. Identify what the *post-v1.0* path looks like — is C a real possibility, or fundamentally out of scope?

**Also:** is there a precedent in the existing codebase for plugin-style extension? (Themes, physics dialects, settings categories all use a register-pattern — does any of them load *external* code, or is it all internal?)

---

## §6 — Recommended v109 arc shape

Given §1-§5, propose the v109 pass sequence. Likely structure (but verify against findings):

- **v109.0.1 — Shared infrastructure** (`registerSourceAdapter()`, `list_files`/`walk_directory` command, path-validation policy decision, folder-picker integration). The deferred Gap 5 + the new Tauri commands the vault adapter needs.
- **v109.0.2 — markdown-vault (Obsidian) adapter** built on §3's design.
- **v109.0.3 — second adapter** (whichever §2 recommends — Mermaid? Cytoscape JSON? a generic edge-list?), as proof the infrastructure generalizes.
- **v109.0.4 — arc close** (semver, NOW.md, document the adapter SDK + plugin-strategy decision).

Or alternative shape if findings suggest different sequencing. Justify the call.

**Hard sequencing constraints** — which passes strictly require earlier ones to be in place.

**Estimated total scope** — sessions / commits / hours of agent time.

---

## §7 — Pre-flight decisions Ryan will need to confirm

Aggregate every decision point this survey surfaces into one checklist. For each: clear question + investigator's recommendation + reasoning. Translate engineering tradeoffs into product terms wherever possible (Ryan's 5% expertise self-assessment means decisions framed only in technical jargon are unfair — frame in "what this means for the user / what this means for shipping").

Examples of shape:
- "Path validation policy for user-configured vaults: manual Rust (more code we own + audit) vs `tauri-plugin-fs` (less code + battle-tested + new dep). Recommend X because Y in *user-facing* terms."
- "Build set for v109: alongside markdown-vault, add A and B. Recommend because A absorbs format X (real userbase), B is LOW-effort and proves architecture generalizes."
- "Plugin model: defer C to post-v1.0; ship Option A for v1.0 but design `registerSourceAdapter()` so C is possible later. Reasoning: shipping 4-5 quality adapters is the v1.0 'Kirby move' claim; opening the plugin door now is scope creep."

---

## Output format

One markdown file. Seven sections, numbered as above. File:line citations for code claims, doc URL citations for format/API claims. LOW/MED/HIGH ratings on every effort + demoability question. Tradeoff analysis (not preference) on every architectural choice, with product-language framing where possible. Drop the report into PK as `v109_adapter_portfolio_report.md`. No commits. No code changes. No installs.

When complete: ping back; planning Claude reads the report and scopes the v109 arc from it.
