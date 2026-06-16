# Bandit — v109.1: markdown-vault (Obsidian) adapter — first Tier 2 adapter

First concrete adapter on the v109.0 platform. Implements the markdown-vault (Obsidian-style) adapter per `docs/workflows/v109_1_markdown_vault_report.md` v1.0. Three commits, merge gates between each.

Basis: `~/Projects/future-integration/SDK_SPEC.md` + `docs/workflows/v109_1_markdown_vault_report.md` + the v109.0 platform commits (`087a10e` → `c9e939c`).

Generic rules: `~/Projects/CLAUDE.md`; project: `~/Projects/lumaweave/CLAUDE.md`; Discord/gates: `~/Projects/DISCORD_PROTOCOL.md`.

## ⏩ BANDIT PASS PREFACE (run for EACH of the 3 commits)
0. Discord MCP else HALT. 1. START→#current-task. 2. Work+verify. 3. END→#current-task. 4. MERGE GATE→#approve-this (1506441138612080680), commit explicit paths. 5. END-OF-RUN REPORT→#changelog w/ SHA. 6. BUMP+PUSH GATE→#approve-this. Then proceed to next commit.

No semver bump this pass (v109 arc-close bumps minor at v109.5 or later).

## Locked decisions (from v109_1_markdown_vault_report.md §8 + Ryan's confirmations)

| # | Decision | Locked value |
|---|---|---|
| D1 | Unresolved wikilinks | **Skip, log to warnings[]** |
| D2 | Nested tags | **Single compound node** (`tag:parent/child/grandchild`) |
| D3 | mtime source | **Frontmatter `updated:` / `modified:` / `date_modified:` / `last_modified:` only**; undefined sorts to end |
| D4 | `maxNodes` config override | **Ignored in v1.0**; if user sets it, log warning so silent-ignore is audible |
| D5 | Backlinks | **Derive at query time**; no extra edges emitted |
| D6 | Tag clustering | **Adapter emits `kind: "tag"`**; cluster resolver does its job |
| D7 | Hex-color false positive | **Use hex-aware regex** with `(?![0-9a-fA-F]{3,6}\b)` negative lookahead |
| D8 | Adapter file layout | **`src/source-adapter/adapters/`** subdirectory |
| D9 | markdown-vault status | **Bump `candidate` → `registered`** after wiring |

**Ryan's amendments to report recommendations:**
- D4: silent-ignore became audible-ignore (log warning if `maxNodes` is set in config)
- D7: hex-aware regex replaces "accept false positive" — small lookahead, big honesty win
- §5 fixture: add a **disambiguation case** — two `Project.md` files in different subfolders, plus a wikilink that triggers the closest-in-path rule (so the rule is observable in E2E)

## Targeted-test-scope convention applies
Per-commit verification runs ONLY the relevant spec files. Full suite is a manual checkpoint at arc close, not a per-commit gate.

---

## Commit 1 — `feat(v109.1.0): markdown-vault adapter implementation + form + registration`

The substantive commit. Implements the adapter logic per report §1-§7.

### Files (explicit paths only)

- `src/source-adapter/adapters/markdownVaultAdapter.ts` — NEW. The adapter class + loader function + registration at module load.
- `src/source-adapter/adapters/MarkdownVaultConfigForm.tsx` — NEW. Single vault-root text input + `registerAdapterConfigForm` call.
- `src/source-adapter/sourceAdapterRegistry.ts` — MODIFIED. Import the new loader, replace `candidateNoOpLoader` for `"markdown-vault"`, bump status `"candidate"` → `"registered"`.
- `src/main.tsx` (or wherever the application's adapter-init lives — confirm in pre-flight) — MODIFIED. Add `import "./source-adapter/adapters/markdownVaultAdapter"` so the file's side effects (registration calls) execute at app startup.

### Pre-flight (verify, report, STOP if anything diverges)
1. Confirm v109.0.5 (commit `c9e939c`) is on HEAD.
2. Confirm `gray-matter@^4.0.3` is in `package.json` dependencies (NOT devDependencies). If not present where expected: STOP and report.
3. Confirm `MarkdownVaultConfig` exists in `baseSourceAdapter.ts` discriminated union with the shape from report §1.2.
4. Confirm `DirectoryAdapter` exists at `src/source-adapter/directoryAdapter.ts` with `listFiles()` + `readVaultFile()` from v109.0.3.
5. Confirm `GraphSourceSummary.warnings: string[]` exists in `src/graph/schema/graph.types.ts` around line 42.
6. Confirm `sourceAdapterRegistry.ts` currently has `markdown-vault` entry as a candidate with `candidateNoOpLoader`. Quote the lines.
7. **Identify the canonical adapter-init location** — where do the existing adapter modules' side-effect imports go? Likely `src/main.tsx` or a dedicated `src/source-adapter/init.ts`. Quote the existing pattern. If no clear pattern exists, STOP and ask.

### Implementation — adapter logic

```typescript
// markdownVaultAdapter.ts

import matter from "gray-matter";
import { DirectoryAdapter } from "../directoryAdapter";
import { registerSourceAdapter } from "../sourceAdapterRegistry";
import { registerAdapterConfigForm } from "../adapterConfigFormRegistry";
import { MarkdownVaultConfigForm } from "./MarkdownVaultConfigForm";
import type {
  AdapterConfig,
  MarkdownVaultConfig,
} from "../baseSourceAdapter";
import type {
  GraphSourceSummary,
  LumaWeaveNodeDraft,
  LumaWeaveEdgeDraft,
} from "../../graph/schema/graph.types";

const MAX_NOTES = 2000;
const DEFAULT_EXCLUDE_PREFIXES = [".obsidian", ".git", ".trash"];

// Hex-aware regex (D7): rejects #FF0000, #abc, etc. as tag candidates.
// Catches 3-char and 6-char hex codes via negative lookahead.
const INLINE_TAG_RE = /#(?![0-9a-fA-F]{3,6}\b)([a-zA-Z][a-zA-Z0-9_\-/]*)/g;

// Wikilink regex per report §2.3. Groups: 1=target, 2=anchor, 3=display
const WIKILINK_RE = /\[\[([^\[\]|#]+?)(?:#([^\[\]|]+?))?(?:\|([^\[\]]+?))?\]\]/g;

const FRONTMATTER_DATE_KEYS = ["updated", "modified", "date_modified", "last_modified"];

interface NoteInfo {
  relativePath: string;
  filename: string;            // without .md
  aliases: string[];
  frontmatterTags: string[];
  updatedAt: Date | undefined;
  body: string;
}

class MarkdownVaultAdapter extends DirectoryAdapter {
  async load(config: AdapterConfig): Promise<GraphSourceSummary> {
    // Type-guard at entry (per Q1 union pattern)
    if (config.adapterId !== "markdown-vault") {
      return errorSummary(config.adapterId, "markdown-vault", "Adapter dispatch mismatch");
    }
    const vaultConfig = config as MarkdownVaultConfig;
    if (!vaultConfig.vaultRoot || vaultConfig.vaultRoot.trim() === "") {
      return errorSummary("markdown-vault", "markdown-vault", "Vault root not configured");
    }
    
    const warnings: string[] = [];
    
    // D4: audible-ignore for maxNodes
    if (vaultConfig.maxNodes && vaultConfig.maxNodes !== MAX_NOTES) {
      warnings.push(
        `maxNodes config override (${vaultConfig.maxNodes}) is not honored in v1.0; using default ${MAX_NOTES}.`
      );
    }
    
    const excludePrefixes = vaultConfig.excludePatterns ?? DEFAULT_EXCLUDE_PREFIXES;
    
    let files: string[];
    try {
      files = await this.listFiles(vaultConfig.vaultRoot, ["md"], excludePrefixes);
    } catch (err) {
      return errorSummary("markdown-vault", "markdown-vault", `Cannot list vault: ${err}`);
    }
    
    // Pass 1: build index
    const notes: NoteInfo[] = [];
    for (const relativePath of files) {
      try {
        const raw = await this.readVaultFile(vaultConfig.vaultRoot, relativePath);
        const parsed = matter(raw);
        notes.push(parseNoteInfo(relativePath, parsed.data, parsed.content));
      } catch (err) {
        warnings.push(`Failed to read ${relativePath}: ${err}`);
      }
    }
    
    // Truncate to MAX_NOTES (D3 — frontmatter updated sort desc, undefined to end)
    const totalCount = notes.length;
    let keptNotes = notes;
    if (totalCount > MAX_NOTES) {
      keptNotes = sortByUpdatedDesc(notes).slice(0, MAX_NOTES);
      const discardedCount = totalCount - MAX_NOTES;
      warnings.push(
        `Vault truncated: kept ${MAX_NOTES} of ${totalCount} notes. ` +
        `${discardedCount} older notes excluded. ` +
        `Wikilinks to excluded notes treated as unresolved.`
      );
    }
    
    // Build lookup structures
    const byFilename = new Map<string, NoteInfo[]>();
    const byPath = new Map<string, NoteInfo>();
    const byAlias = new Map<string, NoteInfo[]>();
    
    for (const note of keptNotes) {
      // byFilename — multimap
      const existing = byFilename.get(note.filename) ?? [];
      existing.push(note);
      byFilename.set(note.filename, existing);
      // byPath — single
      byPath.set(note.relativePath.replace(/\.md$/, ""), note);
      // byAlias — multimap
      for (const alias of note.aliases) {
        const ex = byAlias.get(alias) ?? [];
        ex.push(note);
        byAlias.set(alias, ex);
      }
    }
    
    // Pass 2: resolve wikilinks + extract inline tags + emit nodes/edges
    const noteNodes: LumaWeaveNodeDraft[] = [];
    const tagMembership = new Map<string, Set<string>>();  // tag → noteIds
    const edges: LumaWeaveEdgeDraft[] = [];
    
    for (const note of keptNotes) {
      const noteId = note.relativePath;
      
      noteNodes.push({
        id: noteId,
        label: note.filename,
        type: "note",
        raw: {
          kind: "note",
          sourceAdapter: "markdown-vault",
          relativePath: note.relativePath,
          aliases: note.aliases,
          updatedAt: note.updatedAt?.toISOString(),
        },
      });
      
      // Frontmatter tags
      for (const tag of note.frontmatterTags) {
        addTagMembership(tagMembership, tag, noteId);
      }
      
      // Inline tags from body
      const inlineMatches = note.body.matchAll(INLINE_TAG_RE);
      for (const match of inlineMatches) {
        addTagMembership(tagMembership, match[1], noteId);
      }
      
      // Wikilinks
      const wlMatches = note.body.matchAll(WIKILINK_RE);
      for (const match of wlMatches) {
        const target = match[1].trim();
        const anchor = match[2];     // unused for graph edge; could go in raw metadata
        const display = match[3];    // unused for graph edge
        
        const resolved = resolveWikilink(target, note.relativePath, byFilename, byPath, byAlias);
        if (resolved) {
          edges.push({
            source: noteId,
            target: resolved.relativePath,
            type: "wikilink",
            raw: {
              sourceAdapter: "markdown-vault",
              anchor: anchor ?? undefined,
              displayText: display ?? undefined,
            },
          });
        } else {
          warnings.push(`Unresolved wikilink in ${note.relativePath}: [[${target}]]`);
        }
      }
    }
    
    // Tag nodes + tag-membership edges
    const tagNodes: LumaWeaveNodeDraft[] = [];
    for (const [tag, members] of tagMembership.entries()) {
      const tagId = `tag:${tag}`;
      tagNodes.push({
        id: tagId,
        label: `#${tag}`,
        type: "tag",
        raw: {
          kind: "tag",
          sourceAdapter: "markdown-vault",
          memberCount: members.size,
          size: Math.log(members.size + 1),
        },
      });
      for (const memberId of members) {
        edges.push({
          source: memberId,
          target: tagId,
          type: "tag-membership",
          raw: { sourceAdapter: "markdown-vault" },
        });
      }
    }
    
    return {
      status: "loaded",
      sourceId: "markdown-vault",
      sourcePath: vaultConfig.vaultRoot,
      label: `Markdown Vault: ${vaultConfig.vaultRoot}`,
      normalizedNodes: [...noteNodes, ...tagNodes],
      normalizedEdges: edges,
      rawNodes: undefined,  // adapter doesn't keep raw node refs separately
      rawEdges: undefined,
      warnings,
    };
  }
}

// Helper functions: parseNoteInfo, sortByUpdatedDesc, addTagMembership,
// resolveWikilink (with closest-in-path disambiguation), sharedPrefixDepth,
// errorSummary, parseDateLoose (handles ISO strings + JS Date objects from gray-matter)
// — all implemented as pure functions in the same file
```

**Critical implementation notes:**

- `gray-matter` returns `data` as `Record<string, unknown>` — coerce date fields carefully. `frontmatter.updated` could be a string (`"2026-01-15"`), a Date object (gray-matter auto-parses some YAML dates), or undefined. Handle all three in `parseDateLoose()`.
- `frontmatter.tags` could be `string`, `string[]`, or undefined. Normalize to `string[]`.
- `frontmatter.aliases` same — could be `string`, `string[]`, or undefined.
- The `byPath` lookup key strips `.md` extension so `[[folder/Note]]` matches `folder/Note.md`.
- `resolveWikilink` priority order per report §2.1: byPath → byFilename (with closest-in-path disambiguation) → byAlias (with same disambiguation). Return `undefined` if none match.
- `closest-in-path` rule per report §2.2: `sharedPrefixDepth(linkingPath, candidatePath)` counts shared folder components; higher score wins; alphabetical tiebreak on full relativePath.

### Implementation — form

```tsx
// MarkdownVaultConfigForm.tsx

import type { AdapterConfigFormProps } from "../adapterConfigFormRegistry";
import { registerAdapterConfigForm } from "../adapterConfigFormRegistry";
import type { MarkdownVaultConfig } from "../baseSourceAdapter";

export function MarkdownVaultConfigForm({
  config,
  onChange,
}: AdapterConfigFormProps<MarkdownVaultConfig>): React.JSX.Element {
  return (
    <div className="lw-markdown-vault-config">
      <label htmlFor="vault-root" className="text-xs text-gray-300 block mb-1">
        Vault root
      </label>
      <input
        id="vault-root"
        type="text"
        data-testid="adapter-config-vault-root"
        value={config.vaultRoot ?? ""}
        onChange={(e) => onChange({ vaultRoot: e.target.value })}
        placeholder="/home/user/my-vault"
        className="lw-text-input w-full"
      />
      <p className="text-xs text-gray-500 mt-1">
        Absolute path to vault directory. Validation occurs on load.
      </p>
    </div>
  );
}

registerAdapterConfigForm("markdown-vault", MarkdownVaultConfigForm as React.FC<AdapterConfigFormProps>);
```

### Implementation — registry update

In `sourceAdapterRegistry.ts`:
- Import `loadMarkdownVault` from the adapter file
- Change the markdown-vault entry's `status` from `"candidate"` to `"registered"`
- Change its `registerSourceAdapter(entry, candidateNoOpLoader)` call to `registerSourceAdapter(entry, loadMarkdownVault)`

The adapter file's bottom-of-module side effects:
```typescript
const adapterInstance = new MarkdownVaultAdapter();
export const loadMarkdownVault: LoaderFn = (config) => adapterInstance.load(config);
// Form registration happens in MarkdownVaultConfigForm.tsx
```

### Implementation — init file

Add the side-effect import to wherever the platform's modules are initialized (per pre-flight finding). The import ensures the form registers at app startup.

### Verify (targeted scope)

```
npm run typecheck
npx playwright test tests/e2e/source-adapter.spec.ts --reporter=line
```

Expected:
- typecheck → 0 errors
- source-adapter.spec.ts → all 10 tests pass (no behavioral change to existing tests; the markdown-vault entry status changes but the panel still shows 9 entries with 2 registered + 7 candidates)

**Manual smoke (Ryan, `npm run tauri dev`):**
- App starts cleanly, self-graph still loads.
- Open SourceAdapterPanel — markdown-vault is now listed as `registered` status (visual change: badge or color).
- Click "Set as active" on markdown-vault. Active indicator moves. Configuration section now shows the vault-root text input (NOT the empty-state).
- Type a non-existent path in the text input. Wait — the panel shows an error from the failed load.
- Type a real path to a small vault (Ryan's own test vault if available, or a temp dir with one .md file). Confirm graph loads.

### Commit
- MERGE GATE → commit (explicit paths only): `feat(v109.1.0): markdown-vault adapter — wikilink resolution, tag-nodes, frontmatter+inline tags, truncation`
- END-OF-RUN REPORT to #changelog + bump+push gate.

---

## Commit 2 — `feat(v109.1.1): markdown-vault fixture vault + E2E spec`

The proof-of-correctness commit. Designs and commits the fixture vault per report §5 (with the added disambiguation case per Ryan's amendment), plus an E2E spec asserting exact graph output.

### Files (explicit paths only)

- `tests/fixtures/markdown-vault/` (NEW directory)
  - `Hub.md`
  - `Tagged.md`
  - `InlineTags.md`
  - `Aliased.md`
  - `LinkByAlias.md`
  - `subfolder/Nested.md`
  - `LinkByPath.md`
  - `NestedTags.md`
  - `BothLinksAndTags.md`
  - `UnresolvedLinks.md`
  - **NEW per amendment:** `work/Project.md` + `personal/Project.md` + `LinkByCommonName.md` (the disambiguation case)
- `tests/e2e/markdown-vault.spec.ts` (NEW)

### Pre-flight
1. Confirm Commit 1 (v109.1.0) is on HEAD.
2. Confirm `tests/fixtures/` directory exists (where other fixture data lives). If it doesn't exist, STOP and ask where fixtures should go.
3. Confirm the E2E pattern for `page.evaluate(() => window.__lwStore...)` from `source-adapter.spec.ts:91-93` — quote the relevant lines.

### Fixture vault construction

Each .md file should be small (~5-15 lines). The key is the resulting graph, not realistic content. Per report §5 table with the disambiguation amendment:

**Original 10 notes** per the table in report §5.

**New 3 notes for disambiguation (per Ryan's amendment):**
- `work/Project.md` — frontmatter: `tags: [work-projects]`. Body: `Project tracking for work.`
- `personal/Project.md` — frontmatter: `tags: [personal-projects]`. Body: `My personal projects.`
- `LinkByCommonName.md` — at vault root, no frontmatter. Body: `Working on [[Project]] today.`
- **Expected resolution:** `LinkByCommonName.md` is at vault root (depth 0). `work/Project.md` and `personal/Project.md` are both at depth 1. Shared prefix depth with `LinkByCommonName.md` is 0 for both — tied. Alphabetical tiebreak: `personal/Project.md` wins (p < w).
- **Asserts:** 1 wikilink edge from `LinkByCommonName.md` → `personal/Project.md` (NOT to `work/Project.md`).

This makes the disambiguation rule observable in E2E. If the rule changes (e.g. we discover Obsidian's actual behavior differs from cached knowledge), this is the test that catches it.

### E2E spec design

```typescript
// markdown-vault.spec.ts

import { test, expect } from "@playwright/test";
import path from "node:path";

const FIXTURE_VAULT = path.resolve(__dirname, "../fixtures/markdown-vault");

test("markdown-vault: loads fixture vault with expected node/edge counts", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // Activate markdown-vault adapter + set fixture vault path
  await page.evaluate((vaultPath) => {
    const store = (window as any).__lwStore;
    store.getState().setSetting("sources.active", "markdown-vault");
    store.getState().setSetting("sources.configurations", {
      ...store.getState().settings.sources.configurations,
      "markdown-vault": { adapterId: "markdown-vault", vaultRoot: vaultPath },
    });
  }, FIXTURE_VAULT);

  // Wait for load to complete — graph source summary status becomes "loaded"
  await page.waitForFunction(() => {
    const summary = (window as any).__lwStore?.getState()?.graphSourceSummary;
    return summary?.status === "loaded" && summary?.sourceId === "markdown-vault";
  }, { timeout: 10000 });

  // Assert exact counts (anchored to fixture design in report §5 + disambiguation amendment)
  const summary = await page.evaluate(() => (window as any).__lwStore.getState().graphSourceSummary);
  
  // Note nodes: 10 original + 3 disambiguation = 13
  const noteNodes = summary.normalizedNodes.filter((n: any) => n.type === "note");
  expect(noteNodes).toHaveLength(13);
  
  // Tag nodes: 9 from report §5 + 2 from disambiguation (work-projects, personal-projects) = 11
  const tagNodes = summary.normalizedNodes.filter((n: any) => n.type === "tag");
  expect(tagNodes).toHaveLength(11);
  
  // Wikilink edges: 9 from §5 + 1 disambiguation = 10
  const wikilinkEdges = summary.normalizedEdges.filter((e: any) => e.type === "wikilink");
  expect(wikilinkEdges).toHaveLength(10);
  
  // Disambiguation correctness: LinkByCommonName.md → personal/Project.md (alphabetical tiebreak)
  const disambigEdge = wikilinkEdges.find((e: any) => e.source === "LinkByCommonName.md");
  expect(disambigEdge?.target).toBe("personal/Project.md");
  
  // Unresolved warnings: 2 from UnresolvedLinks.md
  const unresolvedWarnings = summary.warnings.filter((w: string) => w.includes("Unresolved wikilink"));
  expect(unresolvedWarnings).toHaveLength(2);
  
  // Alias resolution: LinkByAlias.md → Aliased.md
  const aliasEdge = wikilinkEdges.find((e: any) => e.source === "LinkByAlias.md");
  expect(aliasEdge?.target).toBe("Aliased.md");
});

test("markdown-vault: form testid replaces empty-state for active adapter", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => {
    (window as any).__lwStore.getState().setSetting("sources.active", "markdown-vault");
  });
  
  // Open source-adapter panel (use existing test helper or inline equivalent)
  // ...
  
  await expect(page.getByTestId("adapter-config-markdown-vault")).toBeVisible();
  await expect(page.getByTestId("adapter-config-empty")).not.toBeVisible();
  await expect(page.getByTestId("adapter-config-vault-root")).toBeVisible();
});
```

**Important — `__lwStore.graphSourceSummary` reactivity:** the test depends on the hook re-triggering when settings change. Confirm in pre-flight that this works as expected; if not, the test needs a manual trigger.

### Verify (targeted scope)

```
npm run typecheck
npx playwright test tests/e2e/markdown-vault.spec.ts --reporter=line
npx playwright test tests/e2e/source-adapter.spec.ts --reporter=line
```

Expected:
- typecheck → 0
- markdown-vault.spec.ts → both tests pass
- source-adapter.spec.ts → still 10 passing (no regression from v109.1.0)

**Manual smoke:** point at Ryan's real Obsidian vault (or any real vault he has access to). Confirm graph renders sensibly, warnings list is informative, large vaults trigger truncation correctly.

### Commit
- MERGE GATE → commit (explicit paths only): `feat(v109.1.1): markdown-vault fixture vault + E2E spec (incl. disambiguation case)`
- END-OF-RUN REPORT to #changelog + bump+push gate.

---

## Commit 3 — `docs(v109.1.2): NOW.md + SDK_SPEC update — v109.1 complete, tag-node convention recorded`

Small docs commit. Updates NOW.md to reflect v109.1 complete, and amends SDK_SPEC.md to record the tag-node convention surfaced by implementation.

### Files (explicit paths only)

- `docs/LUMAWEAVE_NOW.md` — MODIFIED. Add v109.1 row to open-arc commit table (with .0/.1/.2 SHAs); update markdown-vault status to `[COMPLETE]`; mark v109.2 (Cytoscape JSON) as `[NEXT]`. Architectural notes: tag-node convention, the disambiguation rule, the hex-aware tag regex.
- `~/Projects/future-integration/SDK_SPEC.md` — MODIFIED. §6 (Export Schema Convention) gains a note: "Adapters MAY emit nodes with `type: "tag"` and `raw.kind: "tag"` for category/tag entities. Tag-node IDs use the `tag:` namespace prefix to avoid collision with file-path-based identifiers. Convention established by v109.1 (markdown-vault); applies to any future adapter emitting category nodes."

### Pre-flight
1. Confirm Commits 1 + 2 are on HEAD.
2. Read current `LUMAWEAVE_NOW.md` structure — quote the open-arc table format from v109.0.5.
3. Read `~/Projects/future-integration/SDK_SPEC.md` §6 — quote the export schema convention section.

### Verify
- typecheck → 0 (sanity; no code changes)
- No E2E re-run needed.

### Commit
- MERGE GATE → commit (explicit paths only): `docs(v109.1.2): NOW.md v109.1 complete + SDK_SPEC tag-node convention recorded`
- END-OF-RUN REPORT to #changelog + bump+push gate.

---

## END-OF-RUN REPORT after each commit (#changelog)
Each commit's report: files committed (explicit list), pre-flight findings, verification results, manual smoke notes, any divergences from prompt.

**Final report (after Commit 3):**
- Landed-state audit across all 3 commits.
- markdown-vault adapter status: `registered`.
- SDK_SPEC amended with tag-node convention.
- v109.1 complete; v109.2 (Cytoscape JSON) is next.
- Any learnings worth logging for future passes.

## Hard stops
- **Targeted-test-scope only.** Do NOT run the full suite.
- **No installs. No new deps.** `gray-matter` is already in production deps; if it isn't where expected, STOP and ask.
- No new Rust this pass. Pure TypeScript + fixture .md files.
- No semver bump (v109 arc stays open).
- Explicit-path git (NEVER `git add -A`). Playwright foreground. Discord MCP only.
- **The hex-aware tag regex** is non-negotiable — D7 was specifically amended to use it. The pattern is `/#(?![0-9a-fA-F]{3,6}\b)([a-zA-Z][a-zA-Z0-9_\-/]*)/g`.
- **D4 audible-ignore is non-negotiable** — if user sets `maxNodes` to anything other than the default, log a warning. Silent-ignore is not acceptable.
- **The disambiguation test case is non-negotiable** — the fixture vault MUST include the `work/Project.md` + `personal/Project.md` + `LinkByCommonName.md` triplet, and the E2E spec MUST assert which one wins (per the closest-in-path + alphabetical-tiebreak rule).
- **Wikilink resolution priority order is fixed**: byPath → byFilename → byAlias. Don't reorder.
- **Adapter must NOT emit backlink edges** — per D5, backlinks are derived at query time from directed wikilink edges. Don't add reverse edges.
- **`GraphSourceSummary` return shape must be preserved** — AppShell's downstream consumers depend on it.
- If a real regression appears in `source-adapter.spec.ts` (the existing 10 tests), STOP and report. Do not loosen tests to make them pass.
- If `gray-matter` parsing throws on a malformed .md file, the adapter must catch it, log to warnings, and continue. One bad file should not fail the whole load.
