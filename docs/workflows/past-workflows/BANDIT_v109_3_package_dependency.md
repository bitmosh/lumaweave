# Bandit — v109.3: package-dependency adapter

Third concrete adapter on the v109.0 platform. SingleFileAdapter, JSON-only (`package.json`). Implements per `docs/workflows/v109_3_package_dependency_report.md` v1.0. Two commits, merge gates between each.

Basis: report + v109.0/v109.1/v109.2 commits (`087a10e` → `888a83c`).

Generic rules: `~/Projects/CLAUDE.md`; project: `~/Projects/lumaweave/CLAUDE.md`; Discord/gates: `~/Projects/DISCORD_PROTOCOL.md`.

## ⏩ BANDIT PASS PREFACE (each commit)
0. Discord MCP else HALT. 1. START→#current-task. 2. Work+verify. 3. END→#current-task. 4. MERGE GATE→#approve-this (1506441138612080680). 5. END-OF-RUN REPORT→#changelog w/ SHA. 6. BUMP+PUSH GATE→#approve-this.

No semver bump (arc-close at v109.5).

## Locked decisions (Ryan-confirmed)

| # | Locked |
|---|---|
| 1 | Manifest format: `package.json` only; `manifestType: "pyproject.toml"` returns error |
| 2 | Node identity: name-only; version constraint in `raw.version` |
| 3 | Edge types: three distinct `relationship` values — `"depends-on"`, `"depends-on-dev"`, `"depends-on-peer"` |
| 4 | Workspaces / monorepo: warn-and-skip, root deps only |
| 5 | Shape strictness: permissive — accept if any of `{name, dependencies, devDependencies, peerDependencies, version}` present |
| 6 | `maxNodes` audible-ignore — same pattern as v109.1 D4 / v109.2 D8 |
| 7 | `projectPath` (directory) + `manifestType` selector — adapter concatenates internally |
| 8 | Dual-edge for packages in multiple buckets: single node, multiple edges with distinct `relationship` |

**Targeted-test-scope convention + CI fast-jobs amendment:** per-commit verifies only relevant E2E specs PLUS `typecheck` + `lint:css`. Full suite is manual checkpoint at arc close.

---

## Commit 1 — `feat(v109.3.0): package-dependency adapter implementation + form + registration`

### Files (explicit paths only)

- `src/source-adapter/adapters/packageDependencyAdapter.ts` — NEW. ~100 lines. Adapter class + loader + module-load registration.
- `src/source-adapter/adapters/PackageDependencyConfigForm.tsx` — NEW. ~35 lines. `projectPath` text input + `manifestType` select (only `package.json` enabled; `pyproject.toml` shown disabled with "coming later" tooltip).
- `src/source-adapter/sourceAdapterRegistry.ts` — MODIFIED. Import `loadPackageDependency`; change entry `status: "candidate" → "registered"`; replace `candidateNoOpLoader` with real loader.
- Init file (per v109.1/v109.2 pattern) — MODIFIED. Add `import "./source-adapter/adapters/packageDependencyAdapter"` to trigger module-load registration.
- `tests/e2e/source-adapter.spec.ts` — MODIFIED. Registered-entry count assertion: 3 → 4. Adjust the "set as active" rotation if needed.

### Pre-flight (verify, report, STOP if diverges)
1. Confirm v109.2.3 (commit `888a83c`) is on HEAD; package.json version 0.15.0.
2. Confirm `PackageDependencyConfig` shape at `baseSourceAdapter.ts:42-46`:
   - `adapterId: "package-dependency"`
   - `projectPath: string` (directory)
   - `manifestType: "package.json" | "pyproject.toml"`
3. Confirm registry entry at `sourceAdapterRegistry.ts:356-379` has `status: "candidate"` + `candidateNoOpLoader` + `limits: { maxNodes: 500, maxEdges: 2000, maxDepth: 5, maxFileSize: 1048576, timeoutMs: 15000 }`.
4. Confirm the v109.1/v109.2 adapter init-import pattern. Quote the existing import lines so the package-dependency one matches the style.
5. Confirm `LumaWeaveEdgeDraft.id` is required `string`, `relationship?: string` per `graph.types.ts:15-21`. Decision 3 uses `relationship`.

### Adapter implementation outline

```typescript
// packageDependencyAdapter.ts

import { SingleFileAdapter } from "../singleFileAdapter";
import { registerSourceAdapter } from "../sourceAdapterRegistry";
import type {
  AdapterConfig,
  PackageDependencyConfig,
} from "../baseSourceAdapter";
import type {
  GraphSourceSummary,
  LumaWeaveNodeDraft,
  LumaWeaveEdgeDraft,
} from "../../graph/schema/graph.types";
import { makeErrorSummary } from "../adapterHelpers";  // or wherever errorSummary lives — confirm

const HARD_NODE_CAP = 500;  // matches registry limits

interface PackageManifest {
  name?: string;
  version?: string;
  description?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  workspaces?: string[] | { packages?: string[] };
}

class PackageDependencyAdapter extends SingleFileAdapter {
  async load(config: AdapterConfig): Promise<GraphSourceSummary> {
    if (config.adapterId !== "package-dependency") {
      return makeErrorSummary("Adapter dispatch mismatch", "package-dependency", "");
    }
    const cfg = config as PackageDependencyConfig;
    
    // D1: only package.json in v1.0
    if (cfg.manifestType !== "package.json") {
      return makeErrorSummary(
        `${cfg.manifestType} not yet supported; only package.json is implemented in v1.0`,
        "package-dependency",
        cfg.projectPath,
      );
    }
    
    if (!cfg.projectPath?.trim()) {
      return makeErrorSummary("Project path not configured", "package-dependency", "");
    }
    
    const warnings: string[] = [];
    
    // D6: audible-ignore for maxNodes config field (not honored in v1.0)
    if ((cfg as any).maxNodes && (cfg as any).maxNodes !== HARD_NODE_CAP) {
      warnings.push(
        `maxNodes config override not honored in v1.0; using default ${HARD_NODE_CAP}.`
      );
    }
    
    // D7: compute manifest path as projectPath + "/" + manifestType
    const manifestPath = `${cfg.projectPath.replace(/\/$/, "")}/${cfg.manifestType}`;
    
    let raw: string;
    try {
      raw = await this.readUserFile(manifestPath);
    } catch (err) {
      return makeErrorSummary(`Cannot read manifest: ${err}`, "package-dependency", cfg.projectPath);
    }
    
    let manifest: PackageManifest;
    try {
      manifest = JSON.parse(raw);
    } catch (err) {
      return makeErrorSummary(`Invalid JSON in ${cfg.manifestType}: ${err}`, "package-dependency", cfg.projectPath);
    }
    
    if (typeof manifest !== "object" || manifest === null || Array.isArray(manifest)) {
      return makeErrorSummary("Manifest root must be a JSON object", "package-dependency", cfg.projectPath);
    }
    
    // D5: permissive shape — accept if any recognized field present
    const hasRecognizedField =
      typeof manifest.name === "string" ||
      typeof manifest.dependencies === "object" ||
      typeof manifest.devDependencies === "object" ||
      typeof manifest.peerDependencies === "object" ||
      typeof manifest.version === "string";
    if (!hasRecognizedField) {
      return makeErrorSummary(
        "File does not appear to be an npm package.json (no name/version/dependencies fields found)",
        "package-dependency",
        cfg.projectPath,
      );
    }
    
    // D4: workspaces warn-and-skip
    if (manifest.workspaces !== undefined) {
      warnings.push(
        "Workspaces detected; v1.0 shows root deps only. Sub-package traversal coming in a later release.",
      );
    }
    
    // Build root node
    const rootName = manifest.name?.trim();
    if (!rootName) {
      warnings.push("Manifest has no `name` field; using 'package' as root identifier.");
    }
    const rootId = rootName ?? "package";
    
    const nodes: LumaWeaveNodeDraft[] = [
      {
        id: rootId,
        label: rootId,
        type: "node",
        raw: {
          kind: "project",
          sourceAdapter: "package-dependency",
          version: manifest.version ?? "",
          description: manifest.description ?? "",
        },
      },
    ];
    
    // D2 + D8: name-only identity; package nodes deduplicated across buckets, but edges are per-bucket
    const packageNodes = new Map<string, LumaWeaveNodeDraft>();
    
    const buildPackageNode = (name: string, versionConstraint: string, dependencyType: "production" | "development" | "peer"): void => {
      // First occurrence wins for the node (dependency-type goes to first-seen bucket).
      // Edges are emitted per-bucket below, so dual-edge behavior is preserved.
      if (packageNodes.has(name)) return;
      packageNodes.set(name, {
        id: name,
        label: name,
        type: "node",
        raw: {
          kind: "package",
          sourceAdapter: "package-dependency",
          version: versionConstraint,
          dependencyType,
        },
      });
    };
    
    const edges: LumaWeaveEdgeDraft[] = [];
    let edgeCounter = 0;
    
    // Process in order: dependencies → devDependencies → peerDependencies (decision 8: first-occurrence wins for node, distinct edges per bucket)
    for (const [name, constraint] of Object.entries(manifest.dependencies ?? {})) {
      if (typeof constraint !== "string") continue;
      buildPackageNode(name, constraint, "production");
      edges.push({
        id: `edge-${++edgeCounter}`,
        source: rootId,
        target: name,
        type: "edge",
        relationship: "depends-on",
        raw: { sourceAdapter: "package-dependency", versionConstraint: constraint },
      });
    }
    for (const [name, constraint] of Object.entries(manifest.devDependencies ?? {})) {
      if (typeof constraint !== "string") continue;
      buildPackageNode(name, constraint, "development");
      edges.push({
        id: `edge-${++edgeCounter}`,
        source: rootId,
        target: name,
        type: "edge",
        relationship: "depends-on-dev",
        raw: { sourceAdapter: "package-dependency", versionConstraint: constraint },
      });
    }
    for (const [name, constraint] of Object.entries(manifest.peerDependencies ?? {})) {
      if (typeof constraint !== "string") continue;
      buildPackageNode(name, constraint, "peer");
      edges.push({
        id: `edge-${++edgeCounter}`,
        source: rootId,
        target: name,
        type: "edge",
        relationship: "depends-on-peer",
        raw: { sourceAdapter: "package-dependency", versionConstraint: constraint },
      });
    }
    
    // Apply node cap (root + packages, in insertion order)
    const allNodes = [...nodes, ...packageNodes.values()];
    let keptNodes = allNodes;
    if (allNodes.length > HARD_NODE_CAP) {
      keptNodes = allNodes.slice(0, HARD_NODE_CAP);
      warnings.push(
        `Manifest has ${allNodes.length} unique packages; first ${HARD_NODE_CAP} kept, ${allNodes.length - HARD_NODE_CAP} discarded.`,
      );
    }
    
    // Filter edges to only those referencing kept nodes
    const keptNodeIds = new Set(keptNodes.map(n => n.id));
    const keptEdges = edges.filter(e => keptNodeIds.has(e.source) && keptNodeIds.has(e.target));
    
    return {
      status: "loaded",
      sourceId: "package-dependency",
      sourcePath: cfg.projectPath,
      label: `Package Dependencies: ${rootId}`,
      normalizedNodes: keptNodes,
      normalizedEdges: keptEdges,
      rawNodes: undefined,
      rawEdges: undefined,
      warnings,
    };
  }
}

const adapterInstance = new PackageDependencyAdapter();
export const loadPackageDependency: LoaderFn = (config) => adapterInstance.load(config);
```

### Form implementation

```tsx
// PackageDependencyConfigForm.tsx

import type { AdapterConfigFormProps } from "../adapterConfigFormRegistry";
import { registerAdapterConfigForm } from "../adapterConfigFormRegistry";
import type { PackageDependencyConfig } from "../baseSourceAdapter";

export function PackageDependencyConfigForm({
  config,
  onChange,
}: AdapterConfigFormProps<PackageDependencyConfig>): React.JSX.Element {
  return (
    <div className="lw-package-dep-config">
      <label htmlFor="project-path" className="text-xs text-gray-300 block mb-1">
        Project root
      </label>
      <input
        id="project-path"
        type="text"
        data-testid="adapter-config-project-path"
        value={config.projectPath ?? ""}
        onChange={(e) => onChange({ projectPath: e.target.value })}
        placeholder="/home/user/my-project"
        className="lw-text-input w-full"
      />
      <p className="text-xs text-gray-500 mt-1 mb-3">
        Directory containing the manifest file.
      </p>
      
      <label htmlFor="manifest-type" className="text-xs text-gray-300 block mb-1">
        Manifest type
      </label>
      <select
        id="manifest-type"
        data-testid="adapter-config-manifest-type"
        value={config.manifestType ?? "package.json"}
        onChange={(e) => onChange({ manifestType: e.target.value as PackageDependencyConfig["manifestType"] })}
        className="lw-select w-full"
      >
        <option value="package.json">package.json (npm/yarn/pnpm)</option>
        <option value="pyproject.toml" disabled>
          pyproject.toml (coming later)
        </option>
      </select>
    </div>
  );
}

registerAdapterConfigForm("package-dependency", PackageDependencyConfigForm as React.FC<AdapterConfigFormProps>);
```

### Verify (targeted scope)

```
npm run typecheck
npm run lint:css
npx playwright test tests/e2e/source-adapter.spec.ts --reporter=line
```

Expected:
- typecheck → 0 errors
- lint:css → 0 errors, 0 warnings (post-v109.2.3 baseline holds)
- source-adapter.spec.ts → all tests pass; entry count assertion now expects 3 registered + N candidates with package-dependency moved from candidate to registered

**Manual smoke (Ryan, `npm run tauri dev`):**
- App starts cleanly, self-graph loads.
- Open SourceAdapterPanel — `package-dependency` shows as `registered` status.
- Click "Set as active" on package-dependency. Form shows project-path text input + manifest-type select (only `package.json` enabled).
- Enter the LumaWeave repo path itself (`/home/boop/Projects/lumaweave`). Confirm graph loads showing the LumaWeave package + its deps.
- Try a non-existent path → error renders cleanly.
- Try a path to a directory without package.json → error renders cleanly.

### Commit
MERGE GATE → commit (explicit paths only): `feat(v109.3.0): package-dependency adapter — npm package.json, three edge types, dual-edge dedup`
END-OF-RUN REPORT → bump+push gate.

### Hard stops
- No new dependencies. No new Rust. No new Tauri commands.
- D1 locked: `pyproject.toml` returns error, does NOT attempt parsing. No TOML parser introduced.
- D2 locked: name-only identity. Don't include version in node id.
- D3 locked: three distinct `relationship` strings. Don't collapse to a single type with `raw.depType`.
- D7 locked: `projectPath` (directory) + `manifestType` selector. Don't change the config shape.
- D8 locked: dual-edge for packages in multiple buckets. Don't deduplicate edges.
- Use `LumaWeaveEdgeDraft.id` for edge identity (top-level required field), not raw.
- Workspaces: warn-and-skip only. Do NOT attempt sub-package traversal.

---

## Commit 2 — `feat(v109.3.1): package-dependency fixture + E2E + arc-step docs`

### Files (explicit paths only)

- `tests/fixtures/package-dependency/sample-package.json` — NEW. Per report §6 listing.
- `tests/fixtures/package-dependency/missing-name.json` — NEW. For missing-name fallback test.
- `tests/e2e/package-dependency-adapter.spec.ts` — NEW. ~7 tests.
- `docs/LUMAWEAVE_NOW.md` — MODIFIED. v109.3 row + commit SHAs; mark `[COMPLETE]`; mark v109.4 (CSV edge list) as `[NEXT]`. Architectural notes: `projectPath` + `manifestType` config shape, dual-edge behavior, hex-aware tag regex pattern reused, package-dependency uses existing `read_user_file` from v109.2.

### Pre-flight (verify, report, STOP if diverges)
1. Confirm Commit 1 (v109.3.0) is on HEAD.
2. Confirm `tests/fixtures/cytoscape/` and `tests/fixtures/markdown-vault/` directories exist (paralleling pattern).
3. Quote the v109.2 E2E spec structure (the `loadFixture` helper, the `__lwGraphSummary` polling pattern) — we mirror it.

### Fixture: sample-package.json

```json
{
  "name": "acme-dashboard",
  "version": "2.1.0",
  "description": "Real-time analytics dashboard",
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "lodash": "^4.17.21",
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

Expected counts: 1 root + 9 unique packages (react dedupes between dependencies + peerDependencies) = **10 nodes total**; 5 + 3 + 1 = **9 edges total**.

### Fixture: missing-name.json

```json
{
  "version": "1.0.0",
  "dependencies": {
    "lodash": "^4.17.21"
  }
}
```

Expected: loads successfully with `id: "package"`, warning includes "name" mention.

### E2E spec sketch

```typescript
import { test, expect } from "@playwright/test";
import path from "node:path";

const FIXTURE_DIR = path.resolve(__dirname, "../fixtures/package-dependency");

async function loadFixture(page, filename: string, manifestType: "package.json" | "pyproject.toml" = "package.json") {
  const projectPath = FIXTURE_DIR;  // directory; adapter computes file path
  // For a single fixture file, we point projectPath at FIXTURE_DIR and the manifest must be at FIXTURE_DIR/package.json
  // For multiple fixtures: use a tmp dir or staged subdirs. Simplest: keep one fixture per subdir.
  // Alternative pattern: rename `sample-package.json` to `<subdir>/package.json`.
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.evaluate(({ pp, mt }) => {
    const store = (window as any).__lwStore;
    store.getState().setSetting("sources.active", "package-dependency");
    store.getState().setSetting("sources.configurations", {
      ...store.getState().settings.sources.configurations,
      "package-dependency": { adapterId: "package-dependency", projectPath: pp, manifestType: mt },
    });
  }, { pp: projectPath, mt: manifestType });
  await page.waitForFunction(() => {
    const s = (window as any).__lwGraphSummary;
    return s && (s.status === "loaded" || s.status === "error");
  }, { timeout: 10000 });
  return await page.evaluate(() => (window as any).__lwGraphSummary);
}

test("sample-package: counts after dedup", async ({ page }) => {
  const s = await loadFixture(page, "sample-package.json");
  expect(s.status).toBe("loaded");
  expect(s.normalizedNodes).toHaveLength(10);  // 1 root + 9 unique packages
  expect(s.normalizedEdges).toHaveLength(9);   // 5 prod + 3 dev + 1 peer
});

test("sample-package: root node has kind=project", async ({ page }) => {
  const s = await loadFixture(page, "sample-package.json");
  const root = s.normalizedNodes.find((n: any) => n.id === "acme-dashboard");
  expect(root.raw.kind).toBe("project");
  expect(root.raw.version).toBe("2.1.0");
  expect(root.raw.description).toBe("Real-time analytics dashboard");
});

test("sample-package: react dual-edge behavior", async ({ page }) => {
  const s = await loadFixture(page, "sample-package.json");
  const reactNode = s.normalizedNodes.find((n: any) => n.id === "react");
  expect(reactNode).toBeDefined();
  expect(reactNode.raw.version).toBe("^19.0.0");  // production constraint wins (processed first)
  
  const prodEdge = s.normalizedEdges.find(
    (e: any) => e.source === "acme-dashboard" && e.target === "react" && e.relationship === "depends-on",
  );
  const peerEdge = s.normalizedEdges.find(
    (e: any) => e.source === "acme-dashboard" && e.target === "react" && e.relationship === "depends-on-peer",
  );
  expect(prodEdge).toBeDefined();
  expect(peerEdge).toBeDefined();
});

test("sample-package: edge relationships per dep bucket", async ({ page }) => {
  const s = await loadFixture(page, "sample-package.json");
  const prodEdges = s.normalizedEdges.filter((e: any) => e.relationship === "depends-on");
  const devEdges = s.normalizedEdges.filter((e: any) => e.relationship === "depends-on-dev");
  const peerEdges = s.normalizedEdges.filter((e: any) => e.relationship === "depends-on-peer");
  expect(prodEdges).toHaveLength(5);
  expect(devEdges).toHaveLength(3);
  expect(peerEdges).toHaveLength(1);
});

test("missing-name fixture: fallback root id + warning", async ({ page }) => {
  // Switch fixture dir for this test
  // ...
  const s = await loadFixture(page, "missing-name.json");  // adjust per fixture layout
  expect(s.status).toBe("loaded");
  const root = s.normalizedNodes.find((n: any) => n.id === "package");
  expect(root).toBeDefined();
  expect(s.warnings.some((w: string) => /name/i.test(w))).toBe(true);
});

test("pyproject.toml: returns error", async ({ page }) => {
  const s = await loadFixture(page, "sample-package.json", "pyproject.toml");
  expect(s.status).toBe("error");
  expect(s.error).toMatch(/pyproject\.toml.*not.*supported/i);
});

test("config form shows project-path + manifest-type controls", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => {
    (window as any).__lwStore.getState().setSetting("sources.active", "package-dependency");
  });
  // Open the source adapter panel (per the existing pattern in source-adapter.spec.ts)
  // ...
  await expect(page.getByTestId("adapter-config-project-path")).toBeVisible();
  await expect(page.getByTestId("adapter-config-manifest-type")).toBeVisible();
});
```

**Fixture layout note:** Each fixture needs to be in its own subdir because the adapter computes `projectPath + "/package.json"` and reads from there. So:
- `tests/fixtures/package-dependency/sample/package.json` (the "sample-package" content above)
- `tests/fixtures/package-dependency/missing-name/package.json` (the "missing-name" content above)

The `FIXTURE_DIR` constant in the E2E becomes `tests/fixtures/package-dependency/sample` or `.../missing-name` depending on the test. Adjust the `loadFixture` helper accordingly.

### Verify

```
npm run typecheck
npm run lint:css
npx playwright test tests/e2e/package-dependency-adapter.spec.ts --reporter=line
npx playwright test tests/e2e/source-adapter.spec.ts --reporter=line
```

Expected:
- typecheck → 0
- lint:css → 0/0
- package-dependency-adapter.spec.ts → 7 tests pass
- source-adapter.spec.ts → still passes (no regression)
- Existing markdown-vault and cytoscape-json specs untouched — no need to re-run but if Bandit wants confidence: run them too, foreground.

### NOW.md update

Add to v109 open-arc table:
- `v109.3.0` (adapter+form+registry) — SHA
- `v109.3.1` (fixture+E2E+docs) — SHA

Mark v109.3 `[COMPLETE]`; mark v109.4 (CSV edge list) `[NEXT]`.

Architectural notes section:
- `package-dependency` adapter ships with JSON-only (`package.json`); `pyproject.toml` is in the config type but returns error in v1.0 (forward-compat hook for post-v1.0 TOML support).
- `projectPath` + `manifestType` config pattern: adapter computes the file path internally as `projectPath + "/" + manifestType`. Better UX than asking the user for a full file path.
- Dual-edge behavior locked: when a package appears in multiple dep buckets (e.g. `react` in both `dependencies` and `peerDependencies`), the graph emits one node + multiple edges with distinct `relationship` values. Correct graph semantics, not deduplication.
- The `react` first-occurrence-wins rule for node attributes (e.g. `raw.version`): processing order is `dependencies → devDependencies → peerDependencies`, so the production constraint wins when buckets disagree.

### Commit
MERGE GATE → commit (explicit paths only): `feat(v109.3.1): package-dependency fixture + E2E + arc-step docs (v109.3 complete)`
END-OF-RUN REPORT → bump+push gate.

### Hard stops
- All 7 E2E tests must pass.
- D8 locked: dual-edge test MUST find both `depends-on` and `depends-on-peer` edges from `acme-dashboard` → `react`.
- Don't deduplicate edges; only nodes.
- Don't modify existing markdown-vault or cytoscape-json fixtures or specs.
- Fixture layout: each fixture in its own subdir (so the `projectPath` config is a real directory containing `package.json`).

---

## END-OF-RUN REPORT (each commit)
Files committed, pre-flight findings, verification numbers, manual smoke notes, divergences.

**Final report (after Commit 2):**
- Landed-state audit across both commits
- package-dependency status: `registered`
- v109.3 complete; v109.4 (CSV edge list) is next
- Adapter registered-bar check: did v109.3 meet it (load real npm projects cleanly)? Note for v109.5's evaluation pass.

## Hard stops (arc-level)
- Targeted-test-scope + CI fast-jobs only. No full-suite run.
- No installs. No new deps. No TOML parser.
- No new Rust. No new Tauri commands.
- No semver bump.
- Explicit-path git (NEVER `git add -A`). Discord MCP only.
- All 8 locked decisions are non-negotiable.
- If any pre-flight check fails: STOP and ask. Don't paper over.
