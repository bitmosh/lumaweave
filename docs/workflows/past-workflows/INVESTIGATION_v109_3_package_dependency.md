# Investigation brief — v109.3 package-dependency adapter

**For:** Terminal Claude · **Output:** one markdown report dropped into PK as `v109_3_package_dependency_report.md` · **No code changes, no commits, no installs.**

v109.3 is the third concrete adapter on the v109.0 platform. SingleFileAdapter family, like v109.2 (Cytoscape). The platform handled JSON well; this validates the platform on **derived** data — the source file (e.g. `package.json`) isn't itself a graph, but the dependency tree is. The adapter parses the manifest and constructs the graph from it.

Brief is tighter than v109.2's. Most platform questions are answered. The real questions: which manifest formats to support, how to handle the dependency graph shape, and whether v109.3 + v109.4 (CSV) should be one combined session.

**Hard stops:**
- No code changes. No commits. No installs.
- Cite file:line for code claims; cite manifest-format docs (npm, Cargo, Python packaging) for format claims. Mark cached knowledge explicitly.
- Tradeoff analysis on every architectural choice.

---

## §1 — Platform fit-check (very quick)

1. `SingleFileAdapter` + `readUserFile()` from v109.2 — sufficient? Confirm.
2. `PackageDependencyConfig` in `baseSourceAdapter.ts` discriminated union — confirm the shape. Per cached knowledge it's at least `{ adapterId: "package-dependency", filePath: string }`. If it needs more fields (e.g. `manifestType` if we support multiple formats), flag the change.
3. Registry status — `package-dependency` is currently a candidate; confirm and quote.

LOW effort throughout. Should be a 30-second section in the report.

---

## §2 — Manifest format scope

The strategic call. Which dependency-manifest formats does v109.3 support?

**Universe of candidate formats:**
- **`package.json`** (npm/yarn/pnpm) — JSON, easy parsing, huge userbase
- **`package-lock.json`** (npm v6+) — JSON, includes transitive deps with versions
- **`yarn.lock`** — custom format (yaml-like but not yaml), transitive deps
- **`pnpm-lock.yaml`** — YAML, transitive deps
- **`Cargo.toml`** + **`Cargo.lock`** — TOML
- **`pyproject.toml`** — TOML
- **`requirements.txt`** — text, line-by-line, simple
- **`Pipfile`** / **`Pipfile.lock`** — TOML / JSON
- **`Gemfile`** / **`Gemfile.lock`** — Ruby-specific custom format
- **`go.mod`** + **`go.sum`** — text, custom format
- **`pom.xml`** (Maven) — XML
- **`build.gradle`** (Gradle) — Groovy/Kotlin DSL

This is *a lot*. v109.3 cannot reasonably support all of them. Recommend a **minimal v1.0 set** with reasoning. My instinct (testable):

- **Tier A (ship in v109.3):** `package.json` only. JSON parsing is already proven, npm is the dominant ecosystem, and it covers the bulk of would-be users for a graph-viz tool.
- **Tier B (v110 candidate):** `package-lock.json` for transitive depth. Adds value but increases scope.
- **Tier C (post-v1.0):** Cargo, Python, Ruby, Go — each requires its own parser, and TOML/text/custom formats are real engineering. These are *natural* future arcs but not v1.0.

Recommend the scope with tradeoffs in product terms. If "absorbing the ecosystem" means handling Python and Rust too, the cost is multiple adapter sub-implementations. The honest answer might be "v109.3 = npm, v109.4 = CSV, v110 = expand package-dep to Cargo+Python."

Also flag: if v109.3 is single-format (`package.json`), the adapter is genuinely small. If it's multi-format, the adapter needs a format-detection layer + per-format parsers. That changes the implementation size by 3-5x.

---

## §3 — Dependency graph shape

Once we have a parsed manifest, what does the graph look like?

### 3.1 Node identity

A `package.json` has dependencies like `"react": "^19.0.0"`. The node id options:
- **By name only** (`react`) — simple, but the same package across multiple projects would collide
- **By name + version** (`react@19.0.0`) — disambiguates, but creates many "same package different version" nodes that fragment the graph
- **By name only, version in attributes** — single node per package, version metadata in `raw`

Recommend.

### 3.2 The root node

The project itself (the one whose manifest we're parsing) needs to be a node. Its identity comes from `package.json`'s `name` field. Recommend a convention (`<project-name>` as id, `type: "project"` or `kind: "root"`).

### 3.3 Edge types

Three categories of dependencies in `package.json`:
- `dependencies` — production runtime
- `devDependencies` — development only
- `peerDependencies` — must be provided by consumer

Each should probably be a distinct edge type so the graph can be filtered later. Recommend edge `type` values (`"depends-on"`, `"depends-on-dev"`, `"depends-on-peer"`).

### 3.4 Direct vs transitive

`package.json` only lists *direct* dependencies. `package-lock.json` lists transitive ones too. For v1.0 with `package.json`-only, the graph is just the direct deps + the root — small, shallow. Probably fine.

If we later support `package-lock.json`, the graph gets much larger (a typical React project has 1000+ transitive deps). The 2000-node cap suddenly matters more. Note this for v110+ scoping but don't solve it here.

### 3.5 Node attributes

Each dependency node should have:
- `label`: package name
- `raw.version`: the version constraint from the manifest (e.g. `"^19.0.0"`)
- `raw.kind: "package"` (vs `"project"` for the root)
- `raw.sourceAdapter: "package-dependency"`
- `raw.dependencyType`: `"production"` | `"development"` | `"peer"` (matches edge type)

The root node:
- `label`: project name
- `raw.kind: "project"`
- `raw.version`: project's own version
- `raw.description`: from `package.json` `description` field
- `raw.sourceAdapter: "package-dependency"`

---

## §4 — Parsing edge cases

A few real-world cases the implementation must handle:

1. **Missing required fields:** `package.json` without a `name` → error or use filename? Recommend.
2. **Workspaces / monorepos:** `package.json` with a `workspaces` field listing sub-packages. v109.3 *could* recursively parse those, but that's recursion + cross-package edges + complexity explosion. Recommend: **flag a warning** that workspaces are detected but not traversed in v1.0; ignore and just emit the root's direct deps.
3. **Version specifier formats:** `^19.0.0`, `~19.0.0`, `>=18 <20`, `git+https://...`, `file:../local-pkg`, `*`. Recommend just preserving the string in `raw.version` without trying to normalize — semantic parsing isn't useful for visualization.
4. **Empty dependencies object:** `"dependencies": {}` or omitted entirely — fine, no edges emitted for that bucket.
5. **Invalid JSON:** caught by the v109.2-style format gate (`JSON.parse` throws → error summary).
6. **Not a `package.json`:** if the file parses but doesn't have a `dependencies`/`devDependencies`/`peerDependencies`/`name` shape — should we accept "anything with these fields" or strictly require it to look like an npm manifest? Recommend.

---

## §5 — UI form

Same shape as Cytoscape's form. Single text input for file path. `data-testid="adapter-config-package-dependency"`, inner input testid `data-testid="adapter-config-package-file-path"`. Placeholder text: `/path/to/package.json` or similar hint.

If multi-format is locked: also a small select / radio for format type (recommend against — single-format keeps the form trivial).

Effort: LOW. ~30 lines.

---

## §6 — Fixture file design for E2E

Per the v109.2 pattern. Single fixture JSON file at `tests/fixtures/package-dependency/sample-package.json`. Cover:
- A realistic `package.json` shape with `name`, `version`, `description`, multiple `dependencies`, a few `devDependencies`, a `peerDependencies` entry
- Include version specifier variety: `^19.0.0`, `~1.2.3`, `>=4.0.0`
- Modest size (~5-10 production deps, ~3-5 dev deps, ~1-2 peer deps)

Sketch the fixture (concrete JSON content, not just shape).

E2E spec asserts:
- Loaded count: 1 project node + N package nodes (per fixture)
- Edge counts: one edge per direct dependency, with correct `type` (`depends-on` vs `depends-on-dev` vs `depends-on-peer`)
- Root node has `raw.kind: "project"`
- A dependency node has `raw.version` matching the manifest

---

## §7 — Pre-flight decisions for Ryan

Aggregate every decision the brief surfaces into a checklist. Each: clear question + recommendation + reasoning in product-language. Expected items:
1. Manifest format scope: `package.json` only / `package.json` + `package-lock.json` / multi-format with detection
2. Node identity: name-only / name@version / name with version in raw
3. Edge types: distinct per dependency category, or one type with `raw.kind`
4. Workspaces / monorepo handling: warn-and-skip / recursive traverse / error
5. Strictness on shape: require npm-manifest-looking fields, or permissive
6. `maxNodes` audible-ignore: same pattern as v109.1 D4 and v109.2

---

## §8 — v109.3 + v109.4 pairing decision

**This is a real strategic call.** Both v109.3 (package-dependency) and v109.4 (CSV) are simple SingleFileAdapter cases. Both use `read_user_file` (already in place from v109.2). Both have minimal algorithmic complexity.

Could v109.3 + v109.4 be **combined into a single session/commit-sequence**? Pros:
- Both are simple; pairing them ships two adapters in one push
- v109 arc closes faster (next pass after this becomes v109.5 arc-close instead of v109.5 = CSV, v109.6 = close)
- Validates the platform on two distinct cases in one shot

Cons:
- Larger blast radius per pass
- Mixed-concern commits are harder to bisect later if something regresses
- v109.3 done well = honest milestone; v109.3 + v109.4 mashed = neither gets full attention

Recommend with reasoning. The choice affects how I (planning Claude) scope the next implementation prompt.

**My instinct:** v109.3 standalone, v109.4 separate. Same per-adapter discipline as v109.1 and v109.2. But if the report finds v109.3 is genuinely tiny (e.g. only the npm-single-format path), pairing might be defensible.

---

## §9 — Recommended pass shape

Given §1-§8, propose v109.3 implementation:
- Single pass or multiple? (Standalone v109.3 likely fits in one pass with 2-3 commits.)
- If combined with v109.4: one larger pass.
- Files touched per step (explicit lists).
- Hard sequencing dependencies.
- Estimated total scope (hours / commits).

---

## Output format

One markdown file in PK as `v109_3_package_dependency_report.md`. Nine sections. File:line + doc-URL citations. LOW/MED/HIGH ratings. Tradeoff analysis (not preference). When complete: ping back; planning Claude reads + scopes implementation.
