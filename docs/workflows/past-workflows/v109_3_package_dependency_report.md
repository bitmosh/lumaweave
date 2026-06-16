# v109.3 Package-Dependency Adapter — Investigation Report

**Date:** 2026-06-08  
**Status:** Ready for implementation scoping  
**Confidence:** HIGH throughout — all claims grounded in on-disk code

---

## §1 — Platform fit-check

**SingleFileAdapter + readUserFile() — sufficient? YES, with one design note.**

`SingleFileAdapter` is at `src/source-adapter/singleFileAdapter.ts`. It exposes `protected async readUserFile(path: string)` (added in v109.2.0, `8ee4384`). The adapter calls `invokeReadUserFile(path)` which passes the absolute path to the Rust `read_user_file` command (symlink-rejected, regular-file-only, no scope restriction). This is exactly the right primitive for a user-supplied manifest file.

**`PackageDependencyConfig` — confirmed shape, with a flag.**

Located at `baseSourceAdapter.ts:42-46`:

```typescript
export interface PackageDependencyConfig {
  adapterId: "package-dependency";
  projectPath: string;                            // ← directory path, NOT file path
  manifestType: "package.json" | "pyproject.toml";
}
```

Two things to note vs. v109.2's `CytoscapeJsonConfig`:

1. **`projectPath` is a directory, not a file.** The adapter must compute the absolute manifest path as `projectPath + "/" + manifestType` before calling `readUserFile()`. This is actually better UX than asking the user to type the full file path — they give a project root and pick a manifest type. The Rust `canonicalize()` call will normalize the resulting path. No interface change needed; the adapter just concatenates.

2. **`manifestType` is already a typed union.** For v109.3 JSON-only, the adapter type-narrows: if `manifestType !== "package.json"` → `errorSummary("pyproject.toml not yet supported in v1.0")`. Clean deferral without removing the field.

**Registry status — confirmed candidate.**

`sourceAdapterRegistry.ts:356-379`. Status is `"candidate"`, loader is `candidateNoOpLoader`. The `inputPattern.pattern` already lists `**/{package.json,Cargo.toml,pyproject.toml,go.mod}` (ambitious, reflects original intent) — the registered entry's metadata will be updated to `"registered"` when the real loader lands, same as markdown-vault and cytoscape-json.

Registry `limits` already defined: `maxNodes: 500, maxEdges: 2000, maxDepth: 5, maxFileSize: 1048576 (1 MB), timeoutMs: 15000`. These are sensible for a direct-deps-only graph. No change needed.

**Effort: LOW.** The platform is a good fit. No new Tauri commands, no new base classes, no new SDK shape.

---

## §2 — Manifest format scope

**Recommendation: `package.json` only for v109.3. Tier B/C formats deferred.**

**Tradeoff table:**

| Format | Parser needed | Effort | Userbase relevance | Verdict |
|---|---|---|---|---|
| `package.json` | `JSON.parse` (built-in) | Trivial | Very high (npm/yarn/pnpm/bun) | **Tier A — ship** |
| `package-lock.json` | `JSON.parse` | Low (large file, transitive depth) | Medium (adds value but complexity) | Tier B — v110 |
| `pyproject.toml` | TOML parser (no dep in project) | High (new dep or hand-rolled) | Low-medium | Tier C — post-1.0 |
| `Cargo.toml` | TOML parser | High | Low-medium | Tier C — post-1.0 |
| `requirements.txt` | Line-by-line text parser | Medium | Low | Tier C |
| Others (go.mod, pom.xml, Gemfile) | Custom parsers | Very high | Low for this tool's audience | Out of scope |

**Reasoning:**

- `JSON.parse` is already proven on the platform (markdown-vault uses gray-matter, cytoscape-json uses `JSON.parse` directly). Zero new surface area.
- `pyproject.toml` requires TOML — there is no TOML parser in `package.json`. Adding one violates the package-install safeguard gate and increases v109.3 scope by 3-5x. This is why NOW.md explicitly says "JSON-only; TOML deferred."
- `PackageDependencyConfig` already has `manifestType` in the type system. The `"pyproject.toml"` branch is a `return errorSummary(...)` in v1.0 — the type is forward-compatible without any TOML work now.
- **Adapter size impact:** `package.json`-only ≈ 80-100 lines of implementation. Multi-format with real parsers ≈ 400+ lines plus dep gates. Stay small.

**Implementation gate for `manifestType`:**

```typescript
if (cfg.manifestType !== "package.json") {
  return makeErrorSummary(
    `${cfg.manifestType} not yet supported; only package.json is implemented in v1.0`,
    cfg.projectPath,
  );
}
```

---

## §3 — Dependency graph shape

### 3.1 Node identity — **name-only, version in `raw`**

**Options:**

| Strategy | Example id | Pro | Con |
|---|---|---|---|
| Name only | `react` | Simple, stable, deduplicates naturally | Same package at different versions = one node |
| Name@version | `react@19.0.0` | Exact version visible | Fragments graph; "react across projects" looks like unrelated nodes; version constraints (`^19`) resolve differently per install |
| Name with version in raw | `react`, `raw.version: "^19.0.0"` | Best of both — single node per package, constraint available for inspection | Constraint ≠ resolved version, but that's accurate for `package.json`-only |

**Recommendation: name-only.** For a visualization tool, the value is seeing the dependency *network* — which packages depend on which. Exact version fragmentation works against that. `raw.version` carries the constraint string for inspection via the Code spoke or inspector. If `package-lock.json` support is added later, the resolved version can go in `raw.resolvedVersion`.

### 3.2 Root node

The project itself is a node. Convention:

```typescript
{
  id: manifest.name ?? "package",          // fallback if name missing — see §4.1
  label: manifest.name ?? "package",
  type: "node",
  raw: {
    kind: "project",
    sourceAdapter: "package-dependency",
    version: manifest.version ?? "",
    description: manifest.description ?? "",
  }
}
```

**`id` = `manifest.name`** is stable and human-readable. No namespace prefix needed (unlike tag-nodes which use `tag:` to avoid collision with file-path IDs) — package names are already globally unique in npm's registry and don't collide with graph-node IDs from other adapters since IDs are scoped per-load.

### 3.3 Edge types

**Three distinct edge types. Recommendation: separate `relationship` values on `LumaWeaveEdgeDraft`.**

`LumaWeaveEdgeDraft` (`graph.types.ts:15-21`) has a `relationship?: string` field. Use it:

| Dep bucket | Edge `relationship` |
|---|---|
| `dependencies` | `"depends-on"` |
| `devDependencies` | `"depends-on-dev"` |
| `peerDependencies` | `"depends-on-peer"` |

The existing registry `translationSet.edgeMappings` (`sourceAdapterRegistry.ts:368`) already anticipates this with `"dependency"`, `"dev-dependency"`, `"peer-dependency"` keys. The implementation should align.

**Tradeoff:** single `"depends-on"` type with `raw.depType` would also work, but separate `relationship` strings are more immediately filterable in the inspector and align with how cytoscape-json uses the field for edge labels. Keep distinct.

### 3.4 Direct vs. transitive

`package.json` only lists direct deps. The graph is **root → direct deps only, depth 1.** This makes the graph small and fast for v1.0 (10-50 nodes typically). It's also honest — `package.json` is the *intent*, not the resolved tree.

Transitive depth via `package-lock.json` is a natural Tier B extension. The 500-node limit in the registry metadata will matter more there; flag it in warnings if a lock file is ever added.

### 3.5 Node attributes

**Package node:**
```typescript
{
  id: packageName,
  label: packageName,
  type: "node",
  raw: {
    kind: "package",
    sourceAdapter: "package-dependency",
    version: versionConstraint,    // e.g. "^19.0.0", preserved as-is
    dependencyType: "production" | "development" | "peer",
  }
}
```

**Root node:** see §3.2 above.

---

## §4 — Parsing edge cases

### 4.1 Missing `name` field

**Recommendation: fallback to `"package"`, emit a warning.**

```
No "name" field in manifest; using "package" as root node id.
```

Returning an error for a missing `name` is too strict — plenty of real `package.json` files omit `name` (internal monorepo packages, experimental setups). The graph is still useful. A warning surfaces it without blocking.

### 4.2 Workspaces / monorepos

`"workspaces": ["packages/*"]` in a root `package.json` signals a monorepo. **Recommendation: warn-and-skip.**

```
Workspaces detected (N entries); sub-package traversal not supported in v1.0. Showing root-level dependencies only.
```

Recursive traversal = reading N additional files + cross-package edge construction + potential cycles. That's a v2 feature. The warning is informative, the graph still has value (root + direct deps).

### 4.3 Version specifier formats

Preserve as-is. `"^19.0.0"`, `"~1.2.3"`, `">=4.0.0"`, `"git+https://..."`, `"file:../local"`, `"*"`, `"latest"` all land in `raw.version` unchanged. No normalization. Semantic parsing is not useful for visualization, and edge cases (`git+`, `file:`, `*`) require resolving the lockfile to mean anything concrete.

### 4.4 Empty / absent dependency buckets

`"dependencies": {}` or entirely absent → zero edges from that bucket. Fine. No warning needed — many packages intentionally have no production deps.

### 4.5 Invalid JSON

Same pattern as cytoscape-json: `JSON.parse` throws → `makeErrorSummary("Invalid JSON: ...")`. No special handling needed.

### 4.6 Permissiveness on shape

**Recommendation: accept if at least one recognized field is present; warn if it looks like it might not be a package.json.**

Strict gate: require all of `name` + at least one dep bucket. This would reject valid files that have only `devDependencies` (a test-harness-only package). Too strict.

Better gate: after parsing, check if the object has at least one of `{ name, dependencies, devDependencies, peerDependencies, version }`. If *none* are present → `errorSummary("File does not appear to be a package.json manifest")`. If only some are present → proceed with warnings for missing fields.

This is looser than cytoscape-json's strict `elements` gate (D9), but appropriate here because package.json has no single required field in the npm spec.

---

## §5 — UI form

**Very LOW effort. ~25 lines. Two inputs: file path + manifest type select.**

Given that `PackageDependencyConfig` uses `projectPath` (directory) + `manifestType`:

```tsx
// PackageDependencyConfigForm.tsx
<input
  id="pkg-project-path"
  type="text"
  data-testid="adapter-config-package-dependency"
  value={config.projectPath ?? ""}
  onChange={(e) => onChange({ projectPath: e.target.value })}
  placeholder="/home/user/my-project"
/>
<select
  data-testid="adapter-config-package-manifest-type"
  value={config.manifestType ?? "package.json"}
  onChange={(e) => onChange({ manifestType: e.target.value as "package.json" | "pyproject.toml" })}
>
  <option value="package.json">package.json (npm/yarn/pnpm)</option>
  <option value="pyproject.toml" disabled>pyproject.toml (Python — coming soon)</option>
</select>
```

The `pyproject.toml` option disabled with "coming soon" is honest UX — it signals the capability exists in the roadmap without shipping a broken path. The select is also pre-wired for Tier B/C expansion.

**Testids:**
- Outer wrapper: `data-testid="adapter-config-package-dependency"`
- Path input: `data-testid="adapter-config-package-project-path"`
- Type select: `data-testid="adapter-config-package-manifest-type"`

---

## §6 — Fixture file design for E2E

**Fixture: `tests/fixtures/package-dependency/sample-package.json`**

```json
{
  "name": "acme-dashboard",
  "version": "2.1.0",
  "description": "Internal dashboard for the Acme platform",
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "~6.24.0",
    "zod": "^3.22.4",
    "date-fns": ">=3.0.0"
  },
  "devDependencies": {
    "vite": "^5.3.1",
    "typescript": "~5.5.3",
    "@types/react": "^19.0.0"
  },
  "peerDependencies": {
    "react": ">=18.0.0"
  }
}
```

Counts: 1 root node + 5 production deps + 3 dev deps + 1 peer dep = **10 nodes total**.  
Edges: 5 `"depends-on"` + 3 `"depends-on-dev"` + 1 `"depends-on-peer"` = **9 edges total**.

Note: `react` appears in both `dependencies` and `peerDependencies`. By name-only identity, the *node* `react` is created once (from first occurrence in processing order — production wins since we process `dependencies` first). A *second edge* of type `"depends-on-peer"` is also emitted from the root to the same `react` node. So the graph has 10 nodes but `react` has 2 edges incident from the root (one production, one peer). The spec should assert both edges exist with distinct `relationship` values. This is correct behavior — the dual relationship is meaningful.

**Second fixture: `tests/fixtures/package-dependency/missing-name.json`**

```json
{
  "version": "1.0.0",
  "dependencies": {
    "lodash": "^4.17.21"
  }
}
```

For testing the missing-`name` fallback + warning.

**E2E assertions:**

```typescript
// sample-package.json
expect(s.status).toBe("loaded");
expect(s.normalizedNodes).toHaveLength(10);    // 1 root + 9 unique packages
expect(s.normalizedEdges).toHaveLength(9);     // 5 prod + 3 dev + 1 peer
const root = s.normalizedNodes.find(n => n.id === "acme-dashboard");
expect(root.raw.kind).toBe("project");
expect(root.raw.version).toBe("2.1.0");
const reactNode = s.normalizedNodes.find(n => n.id === "react");
expect(reactNode.raw.version).toBe("^19.0.0");  // production version wins
const prodEdge = s.normalizedEdges.find(e => e.source === "acme-dashboard" && e.target === "react" && e.relationship === "depends-on");
const peerEdge = s.normalizedEdges.find(e => e.source === "acme-dashboard" && e.target === "react" && e.relationship === "depends-on-peer");
expect(prodEdge).toBeDefined();
expect(peerEdge).toBeDefined();

// missing-name.json
expect(s.status).toBe("loaded");
const fallbackRoot = s.normalizedNodes.find(n => n.id === "package");
expect(fallbackRoot).toBeDefined();
expect(s.warnings.some(w => /name/i.test(w))).toBe(true);

// pyproject.toml path (set manifestType: "pyproject.toml" in config)
expect(s.status).toBe("error");
expect(s.error).toMatch(/pyproject\.toml.*not.*supported/i);
```

---

## §7 — Pre-flight decisions for Ryan

| # | Question | Recommendation | Reasoning |
|---|---|---|---|
| 1 | **Manifest format scope** | `package.json` only in v109.3; `manifestType: "pyproject.toml"` returns error | TOML requires a new dependency. JSON-only keeps v109.3 in the same weight class as v109.2. `manifestType` field stays in the config type as a forward-compat hook; just error on non-JSON in v1.0. |
| 2 | **Node identity** | Name-only, version constraint in `raw.version` | Visualization value is the network shape, not version fragments. Name-only produces clean, scannable graphs. `raw.version` preserves the constraint for inspection. |
| 3 | **Edge types** | Three distinct `relationship` strings: `"depends-on"` / `"depends-on-dev"` / `"depends-on-peer"` | Matches the existing `translationSet.edgeMappings` in the registry entry. Enables filtering by dep category. Two edges from root to `react` (prod + peer) is correct behavior — they represent distinct declared relationships. |
| 4 | **Workspaces / monorepo** | Warn-and-skip; show root deps only | Recursive traversal is a v2 feature. Warning is informative. Graph is still useful. |
| 5 | **Strictness on shape** | Accept if any of `{name, dependencies, devDependencies, peerDependencies, version}` present; error only if none | Strict `name`-required would reject valid packages. At least one recognized field = almost certainly a package.json. Zero recognized fields = clearly wrong file. |
| 6 | **`maxNodes` audible-ignore** | Same as v109.1 D4 and v109.2 D8 | Registry already sets `maxNodes: 500`. Direct deps from a single `package.json` are typically 5-50 nodes. The limit is not hit in normal use; the warn-and-ignore pattern is consistent with the platform. |
| 7 | **`projectPath` vs `filePath`** | Keep `projectPath` as-is; adapter computes `projectPath + "/" + manifestType` | Better UX — user types a project root, not a full file path. Consistent with `PackageDependencyConfig` as designed. No interface change needed. The Rust `canonicalize()` normalizes the concatenated path. |
| 8 | **`react` node identity when it appears in both `dependencies` + `peerDependencies`** | Single node (first occurrence wins), two edges from root | Correct graph semantics: one entity, two relationships declared. Edges distinguish the relationship type; the node is deduplicated. |

---

## §8 — v109.3 + v109.4 pairing decision

**Recommendation: keep separate. v109.3 standalone, v109.4 standalone.**

**Arguments for combining:**

- Both are SingleFileAdapter cases using `readUserFile()`.
- Both are algorithmically simple (no new parsing dependencies, no new Rust).
- Both could fit in one session in terms of raw code volume.

**Arguments against (and why they win):**

- `PackageDependencyConfig` has `projectPath` + `manifestType` — slightly different config UX than `CsvEdgeListConfig`'s `filePath`. The form, testids, and config path-building logic are distinct enough that mixing them in one commit obscures the boundary.
- Per-adapter discipline (v109.1, v109.2) has produced clean, bisect-friendly commit histories. Mixing adapters in one commit means "which adapter broke it?" is harder to answer.
- v109.3 is not that small: the `react` dual-edge case (same package in multiple dep buckets), the `projectPath` → file path computation, the `pyproject.toml` error path, the workspace detection — these are enough edge cases that the adapter deserves its own focused E2E fixture and spec.
- **However:** if Ryan prefers velocity over granularity, a combined pass with `v109.3.0` + `v109.4.0` commits in one session is defensible. The commits stay separate; only the session is combined. That's a reasonable middle ground.

**My call:** separate sessions. The arc is almost done regardless; the extra session is 1-2 hours and keeps the audit trail clean.

---

## §9 — Recommended pass shape

### v109.3 — 2 commits, single session

**Commit 1: `feat(v109.3.0): package-dependency adapter + form + registry`**

Files:
- `src/source-adapter/adapters/packageDependencyAdapter.ts` — NEW. ~100 lines.
- `src/source-adapter/adapters/PackageDependencyConfigForm.tsx` — NEW. ~35 lines.
- `src/source-adapter/sourceAdapterRegistry.ts` — MODIFIED. Import + registration, `status: "candidate"` → `"registered"`.
- `tests/e2e/source-adapter.spec.ts` — MODIFIED. Entry count 10 → 11.

**Commit 2: `feat(v109.3.1): package-dependency fixture + E2E + arc-step docs`**

Files:
- `tests/fixtures/package-dependency/sample-package.json` — NEW.
- `tests/fixtures/package-dependency/missing-name.json` — NEW.
- `tests/e2e/package-dependency-adapter.spec.ts` — NEW. ~7 tests.
- `docs/LUMAWEAVE_NOW.md` — MODIFIED. v109.3 complete, v109.4 [NEXT].

**Sequencing constraints:**

- No new Tauri commands needed.
- No new npm dependencies needed.
- No schema migration needed (settings schema already accepts `PackageDependencyConfig` in the `AdapterConfig` union).
- `projectPath` computation (`projectPath + "/" + manifestType`) happens entirely in the adapter TS — no Rust changes.
- `pyproject.toml` path is a 3-line error return — included in Commit 1 for completeness.

**Estimated scope: ~3 hours total** (similar to v109.2.1 + v109.2.2 in one session, minus the Tauri command which already exists).

---

## Summary

Platform fit is clean. The main pre-implementation finding is the `projectPath` + `manifestType` config shape — it differs from cytoscape-json's `filePath` but is intentional and well-suited to the adapter's UX. The adapter computes the final file path internally; `readUserFile()` is called on the computed path. Decision #7 above covers this explicitly for Ryan's sign-off.

All 8 pre-flight decisions are low-controversy; the only one that warrants explicit Ryan confirmation before implementation starts is **#3 (dual-edge behavior for packages appearing in multiple dep buckets)** — confirming two edges from root → react (one `"depends-on"`, one `"depends-on-peer"`) is the intended graph semantics, not a deduplication bug.

Ready for `BANDIT_v109_3_package_dependency.md` scoping.
