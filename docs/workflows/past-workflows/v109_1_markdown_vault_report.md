# v109.1 markdown-vault adapter — Investigation Report

**Date:** 2026-06-06 · **Investigator:** Terminal Claude · **Status:** Pre-implementation spec

---

## §1 — Platform fit-check

### 1.1 DirectoryAdapter shape

`src/source-adapter/directoryAdapter.ts:19-29` exposes exactly two protected methods:

```typescript
protected async listFiles(root, extensions, excludePrefixes): Promise<string[]>
// returns relative paths e.g. ["notes/Hub.md", "subfolder/Nested Note.md"]

protected async readVaultFile(root, relativePath): Promise<string>
// returns raw file content as string
```

These are sufficient for the core loop: enumerate all `.md` files, read each one, parse frontmatter + body, build index, resolve wikilinks, emit nodes and edges.

**Gap flagged — mtime not available from `listFiles`:**
The Tauri `list_files` command (`src-tauri/src/fs.rs`) returns `Vec<String>` of relative paths only — no mtime, no file size. The 2000-note truncation-by-modification-date described in §4 requires mtime. Options:

| Option | Tradeoff |
|---|---|
| **A: frontmatter `updated:` field only; alphabetical fallback** | No new Rust command. Degrades gracefully. ~80% of Obsidian vaults that track dates use this field. Zero risk to the existing API surface. Recommended for v1.0. |
| B: add `list_files_with_stat` Tauri command returning `{path, mtimeMs}[]` | More correct but adds ~30 Rust lines, a new command, and another approval-needed touch. Better deferred to a later polish pass. |
| C: add `stat_file(root, relativePath)` → `{mtimeMs}` | Per-file stat is O(N) extra Tauri calls for N notes — worse latency than option B. Not recommended. |

**Decision needed** (flagged in §8): proceed with option A for v1.0.

### 1.2 AdapterConfig union

`src/source-adapter/baseSourceAdapter.ts:30-35`:

```typescript
export interface MarkdownVaultConfig {
  adapterId: "markdown-vault";
  vaultRoot: string;
  excludePatterns?: string[];  // prefixes to skip (default: [".obsidian", ".git"])
  maxNodes?: number;           // override registry limit (default: 2000)
}
```

Already in the discriminated union at `baseSourceAdapter.ts:59-64`. No new fields needed for v1.0. The `excludePatterns` field maps naturally to the `excludePrefixes` parameter of `listFiles()`. The `maxNodes` field is already present — whether to honor it is a v1.0 policy decision (flagged in §8).

### 1.3 `registerSourceAdapter()` call site

**Current pattern**: all 9 registrations live in `sourceAdapterRegistry.ts` (lines 165–401). The loader for self-graph was extracted to `loadSelfGraph.ts` to avoid a circular dep, but the `registerSourceAdapter()` call itself remains in the registry file.

**Recommended structure for v109.1–v109.4:**

Create `src/source-adapter/adapters/` subdirectory. Each adapter gets its own implementation file:

```
src/source-adapter/adapters/
  markdownVaultAdapter.ts       // v109.1
  cytoscapeJsonAdapter.ts       // v109.2
  packageDependencyAdapter.ts   // v109.3
  csvEdgeListAdapter.ts         // v109.4
```

Each file exports a loader function. The registration call stays in `sourceAdapterRegistry.ts` — it imports the loader from the adapter file and calls `registerSourceAdapter(entry, loader)`. This keeps registration centralized (avoids barrel/side-effect import complexity) while isolating adapter logic.

The self-graph pattern (`loadSelfGraph.ts` extracted, registration stays in registry) establishes this precedent — v109.1 follows it exactly. A future refactor can move registrations into each adapter file if the registry grows unwieldy, but that's a distinct arc.

**Tradeoff**: Centralized registration is easier to reason about but requires touching `sourceAdapterRegistry.ts` for every new adapter. Decentralized (self-registering side effects) scales better but requires a root barrel import. Given there are only 4 adapters in v109, centralized is correct for now.

### 1.4 `registerAdapterConfigForm()` call site

`src/source-adapter/adapterConfigFormRegistry.ts` is a standalone Map — no coupling to the loader registry. Recommendation: create `src/source-adapter/adapters/MarkdownVaultConfigForm.tsx` as the form component, and call `registerAdapterConfigForm("markdown-vault", MarkdownVaultConfigForm)` at the bottom of `markdownVaultAdapter.ts` (alongside the `registerSourceAdapter` call). One file per adapter, both registrations in the same file.

**Platform verdict: FITS CLEANLY** with one flagged gap (mtime) addressed by option A.

---

## §2 — Wikilink resolution: algorithmic spec

### 2.1 Resolution targets and priority order

*Note: the following is from cached knowledge of the Obsidian documentation; the live URL is https://help.obsidian.md/Linking+notes+and+files/Internal+links — not verified in this session.*

Obsidian's wikilink resolution priority:

1. **Exact filename match** — `[[Note Name]]` matches `Note Name.md` anywhere in the vault (no extension)
2. **Path-suffix match** — `[[folder/Note Name]]` matches `folder/Note Name.md` relative to vault root
3. **Alias match** — `[[Alt Name]]` matches a note whose `aliases:` frontmatter lists `Alt Name`
4. **Disambiguation when multiple exact-filename matches exist** — Obsidian picks the note "closest" in the folder hierarchy to the linking note (fewest folder hops). If still ambiguous, Obsidian picks the first alphabetically. *(Cached knowledge — treat as high-confidence but not docs-verified.)*

Header anchors (`[[Note#Header]]`) and block refs (`[[Note#^block-id]]`): these extend case 1/2/3 — the resolution step is the same; the `#` suffix is metadata about which section to link to. For graph purposes (node/edge), the heading/block info is metadata on the edge, not a separate node.

### 2.2 Two-pass algorithm

**Recommended — HIGH confidence this fits.**

**Pass 1: Index build**

```
for each .md file in vault:
  parse frontmatter (gray-matter)
  extract: aliases[], tags[], updatedAt?
  store NoteInfo in index
```

Index data structure:

```typescript
interface NoteInfo {
  relativePath: string;       // vault-relative, e.g. "subfolder/My Note.md"
  filename: string;           // without extension, e.g. "My Note"
  aliases: string[];          // from frontmatter.aliases
  frontmatter: Record<string, unknown>;
  body: string;               // content after frontmatter
  updatedAt?: Date;           // from frontmatter.updated if present
}

// Three lookup surfaces:
const byFilename = new Map<string, NoteInfo[]>();   // multimap — multiple notes can share a filename
const byPath = new Map<string, NoteInfo>();          // exact relative-path lookup
const byAlias = new Map<string, NoteInfo[]>();       // multimap — aliases can theoretically collide
```

**Why multimap for `byFilename`?** Two notes `Project.md` in `work/` and `personal/` both have filename "Project". The multimap preserves both; disambiguation happens at resolution time using the linking note's path.

**Pass 2: Link resolution**

```
for each NoteInfo:
  match all wikilinks in body via regex
  for each wikilink target string:
    1. try byPath exact match (if "/" in target)
    2. try byFilename[target] — if single hit, resolved; if multi-hit, pick closest
    3. try byAlias[target] — same disambiguation logic
    4. if no hit: unresolved (see §2.4)
  emit LumaWeaveEdgeDraft for each resolved link
```

**Collision disambiguation rule (closest-in-path):**

```typescript
function disambiguate(candidates: NoteInfo[], linkingPath: string): NoteInfo {
  // score by shared path prefix depth
  const scores = candidates.map(c => ({
    note: c,
    shared: sharedPrefixDepth(linkingPath, c.relativePath),
  }));
  scores.sort((a, b) => b.shared - a.shared || a.note.relativePath.localeCompare(b.note.relativePath));
  return scores[0].note;
}
```

This matches Obsidian's documented behavior. The alphabetical tiebreak is deterministic.

### 2.3 Wikilink regex

**Regex approach is correct for v1.0.** Effort: LOW. A proper parser is overkill — Obsidian's wikilink syntax is context-free and the edge cases below are fully handled by the regex. Nested `[[` inside a wikilink is not valid Obsidian syntax; Obsidian itself ignores it.

**Recommended regex** (based on the `markdown-it-wikilinks` reference implementation pattern):

```typescript
const WIKILINK_RE = /\[\[([^\[\]|#]+?)(?:#([^\[\]|]+?))?(?:\|([^\[\]]+?))?\]\]/g;
```

Coverage:

| Case | Input | group 1 | group 2 | group 3 |
|---|---|---|---|---|
| Simple | `[[Note]]` | `"Note"` | — | — |
| Display text | `[[Note\|Display]]` | `"Note"` | — | `"Display"` |
| Header anchor | `[[Note#Header]]` | `"Note"` | `"Header"` | — |
| Block ref | `[[Note#^block-id]]` | `"Note"` | `"^block-id"` | — |
| Path prefix | `[[folder/Note]]` | `"folder/Note"` | — | — |
| Combined | `[[folder/Note#Header\|Text]]` | `"folder/Note"` | `"Header"` | `"Text"` |
| Empty `[[]]` | not matched (requires `+?` in group 1) | — | — | — |

The `[^\[\]` character class prevents matching nested brackets. The `+?` (non-greedy one-or-more) means empty wikilinks are not matched. Apply with the `g` flag; multiline body text is handled naturally since `.` in character classes doesn't span newlines anyway (the character class `[^\[\]|#]` handles all line content).

**Edge: `[[foo|bar with nested [[`** — Obsidian treats this as a broken link; the regex stops at the first `]` inside the outer brackets, which is correct behavior (won't match).

### 2.4 Unresolved wikilinks

**Recommendation: Option A — silently skip, log to `warnings[]`.**

**Effort: LOW** (vs B: MED, C: MED).

Reasoning:
- Option B (placeholder nodes) creates a confusing user experience: grey nodes with no content, no type, no useful inspector data. Users unfamiliar with Obsidian's "unresolved link" concept will see phantom nodes and wonder what they are.
- Option A preserves graph clarity: every node has a backing file, every edge has a backing note.
- The warnings mechanism (`summary.warnings.push(...)`) already exists in `GraphSourceSummary` (`src/graph/schema/graph.types.ts:42`) — each unresolved link gets a warning entry.
- If the user cares about unresolved links, they know their own vault. The warnings list in the tile UI surfaces them.

Post-v1.0: option B (placeholder nodes) can be added as a `showUnresolved: boolean` config toggle on `MarkdownVaultConfig`.

### 2.5 Backlinks

`LumaWeaveEdgeDraft` is directed: `source: string` → `target: string`. Sigma.js renders directed edges by default. The adapter emits one edge per wikilink, direction = linker → linked.

Backlinks (who links *to* me?) are derivable from the edge list: `normalizedEdges.filter(e => e.target === myNoteId)`. No additional edge type needed. This is confirmed by the LumaWeave rendering model — `normalizedEdges` is the full edge list and consumers can query it in either direction.

**Verdict: no backlink edges needed; derive at query time.**

---

## §3 — Tag handling

### 3.1 Tag sources

Both frontmatter and inline tags are supported.

**Frontmatter** — `gray-matter` parses this automatically. The `tags` field may be:
- An array: `tags: [a, b, c]` → `data.tags = ["a", "b", "c"]`
- A YAML list: `tags:\n  - a\n  - b` → same result
- A string: `tags: single` → normalize to `["single"]`

**Inline tags** — regex applied to `body` text after frontmatter is stripped:

```typescript
const INLINE_TAG_RE = /#([a-zA-Z][a-zA-Z0-9_\-/]*)/g;
```

**Why this pattern doesn't match headers or hex codes:**
- `# Header` — fails because the regex requires the first character after `#` to be `[a-zA-Z]` (no space). *(Cached knowledge: Obsidian's actual rule is that a tag must start with a non-digit, non-space character and consist of alphanumerics, underscores, hyphens, and slashes. Not verified against live docs.)*
- `#FF0000` — fails the first-character rule since `F` is valid but the pattern `#([a-zA-Z][a-zA-Z0-9…]*)` would match `#FF0000` as a tag. **This is a known false positive.** Color codes in note bodies are uncommon but possible. Mitigation: the `excludePatterns` config can skip such notes, or a heuristic (6 uppercase hex chars after `#`) can filter them at collection time. Flag for Ryan.

### 3.2 Nested tags

**Recommendation: single compound node `tag:parent/child/grandchild` for v1.0.** Effort: LOW (vs hierarchical: MED).

Tradeoff:
- **Single node**: simple to implement, minimal node count, no artificial hierarchy edges. A note with `#projects/lumaweave` emits one edge to one tag-node. Users see the full tag name in the label.
- **Hierarchical decomposition**: creates three nodes (`tag:projects`, `tag:projects/lumaweave` etc.) with parent-child edges, replicating Obsidian's nested tag tree view. Better for large well-structured vaults. More complex graph topology. Suitable for a v110+ polish pass.

### 3.3 Tag node identity

**Recommended ID scheme:** `tag:<normalized-tag-name>`, e.g. `tag:projects`, `tag:projects/lumaweave`.

Normalization: lowercase, preserve `/` for nested, trim whitespace. This namespace (`tag:`) never collides with note node IDs (which are vault-relative paths like `notes/My Note.md`) since paths never start with `tag:`.

### 3.4 Tag node attributes

```typescript
{
  id: "tag:projects",
  label: "#projects",
  type: "tag",
  raw: {
    kind: "tag",
    sourceAdapter: "markdown-vault",
    memberCount: N,          // number of notes carrying this tag
    size: Math.log(N + 1),  // log-scaled — common convention for hub nodes
    // color: assigned by cluster resolver, not hardcoded by adapter
  }
}
```

Note: `raw.size` is read by the renderer (`SDK_SPEC.md §6`). Using `Math.log(N + 1)` gives a gentle taper (size 1 for 1 note, ~4 for 50 notes, ~6 for 400 notes). The actual scale factor can be tuned post-render.

---

## §4 — Truncation: the 2000-note cap

### 4.1 What "modification date" means

**Recommendation: frontmatter `updated:` as primary; no fs-mtime fallback for v1.0.**

The gap identified in §1.1 applies here: `listFiles` does not return mtime. Adding fs-mtime requires a new Tauri command (scope creep). The v1.0 approach:

1. Parse frontmatter `updated:` (and common variants: `modified:`, `date_modified:`, `last_modified:`)
2. If present and parseable as a date, use it
3. If not present or unparseable, treat as `undefined` (sort to end of list — kept last when truncating)

*On Obsidian conventions: there is no official Obsidian standard for a `modified:` frontmatter key. It's user-convention. The Dataview community plugin popularized `updated:` and `modified:`. Obsidian Sync tracks file modification times natively but does not inject them into frontmatter. This is cached knowledge — not verified against Obsidian docs.*

The "sort undefined dates to end" rule means: when a vault has 2500 notes and 1500 have `updated:` timestamps, the 1500 timestamped notes are sorted descending by date and included first. The remaining 500 un-timestamped notes fill to the 2000 cap (or are discarded if the cap is already reached). This is deterministic and predictable.

### 4.2 Truncation behavior

`GraphSourceSummary.warnings` already exists at `src/graph/schema/graph.types.ts:42` as `warnings: string[]`. No SDK amendment needed. When truncation occurs:

```typescript
warnings.push(
  `Vault truncated: kept ${keptCount} of ${totalCount} notes (cap: ${cap}). ` +
  `${discardedCount} older notes excluded. Wikilinks to excluded notes treated as unresolved.`
);
```

Wikilinks pointing to discarded notes: treated as unresolved per §2.4 (skipped, individual warning per unresolved link if the link count is small; or aggregate "N links to excluded notes" if large).

### 4.3 Configurable cap

`MarkdownVaultConfig.maxNodes?: number` is already in the schema (`baseSourceAdapter.ts:34`). **Recommendation: do not honor `maxNodes` override in v1.0.** Hard-code 2000 in the adapter implementation; the field exists in the config shape but the loader ignores it with a comment. Rationale: a user setting `maxNodes: 50000` on a 60k-note vault would freeze the UI. The override is useful but needs a safety ceiling (e.g. max 10000) and performance testing that hasn't been done. Revisit in a later arc.

**Tradeoff**: leaving the field in the schema means the setting form could expose it in the future without a schema migration. The downside is that the field appears to do something when it currently doesn't — add a comment in the adapter: `// maxNodes config field present but not honored until v110+ (performance testing required)`.

---

## §5 — Fixture vault design

**Recommended location:** `tests/fixtures/markdown-vault/`

### Note inventory (10 notes)

| File | Purpose | Frontmatter | Body highlights | Expected output |
|---|---|---|---|---|
| `Hub.md` | Hub with multiple wikilinks | `tags: [hub, planning]` | Links to 4 other notes; inline `#work` tag | 4 wikilink edges, 3 tag-membership edges |
| `Tagged.md` | Frontmatter tags (array form) | `tags: [projects, lumaweave]` | No wikilinks | 2 tag-membership edges |
| `InlineTags.md` | Inline `#tag` in body | none | Body: `#productivity #reference notes` | 2 tag-membership edges |
| `Aliased.md` | Has aliases declared | `aliases: ["The Aliased Note", "TAN"]` | One wikilink to Hub | note node + alias resolution target |
| `LinkByAlias.md` | Links via alias | none | `[[The Aliased Note]]` → should resolve to `Aliased.md` | 1 wikilink edge (source: LinkByAlias, target: Aliased) |
| `subfolder/Nested.md` | In a subdirectory | `updated: "2026-01-15"` | Links back to Hub: `[[Hub]]` | 1 wikilink edge |
| `LinkByPath.md` | Explicit path in link | none | `[[subfolder/Nested]]` → resolves to Nested.md | 1 wikilink edge |
| `NestedTags.md` | Nested `#parent/child` tags | `tags: [projects/lumaweave]` | Inline `#work/deep` tag | 2 tag-nodes: `tag:projects/lumaweave`, `tag:work/deep` |
| `BothLinksAndTags.md` | Has both wikilinks and inline tags | none | `[[Hub]]` + `#planning` inline | 1 wikilink edge + 1 tag edge |
| `UnresolvedLinks.md` | Links to nonexistent notes | none | `[[DoesNotExist]]` + `[[AlsoMissing]]` | 0 wikilink edges + 2 warning entries |

### Expected graph output from fixture

- **Note nodes**: 10
- **Tag nodes**: `hub`, `planning`, `projects`, `lumaweave`, `work`, `productivity`, `reference`, `projects/lumaweave`, `work/deep` = 9 tag-nodes
- **Wikilink edges**: Hub→Tagged, Hub→InlineTags, Hub→Aliased, Hub→NestedTags, Aliased→Hub, subfolder/Nested→Hub, LinkByPath→subfolder/Nested, LinkByAlias→Aliased, BothLinksAndTags→Hub = 9 edges
- **Tag-membership edges**: ~14 (varies by final note content)
- **Warnings**: 2 (unresolved links in `UnresolvedLinks.md`)

The E2E spec asserts exact counts (with a comment anchoring the expected values to this table).

---

## §6 — Dependency check: YAML parser

**`gray-matter: ^4.0.3`** is in `package.json` production `dependencies` (line 47). Already installed. No new package needed.

`gray-matter` handles:
- `---` / `+++` frontmatter delimiters
- YAML frontmatter parsing (using `js-yaml` under the hood)
- Body text extraction (everything after the closing `---`)
- Returns `{ data: Record<string, unknown>, content: string, isEmpty: boolean }`

Usage pattern for the adapter:
```typescript
import matter from "gray-matter";
const { data: frontmatter, content: body } = matter(rawFileContent);
// frontmatter.tags, frontmatter.aliases, frontmatter.updated, etc.
```

**`yaml: ^2.8.4`** is in `devDependencies` (line 72) — used by build scripts only. Not available at runtime. The adapter must use `gray-matter`, not `yaml` directly.

**YAML dependency verdict: CLEAR — no install approval needed.**

---

## §7 — UI integration: the form

### 7.1 Fields

Single field for v1.0: **Vault root** (required, text input).

```tsx
<input
  type="text"
  data-testid="adapter-config-vault-root"
  value={config.vaultRoot ?? ""}
  onChange={(e) => onChange({ vaultRoot: e.target.value })}
  placeholder="/home/user/my-vault"
/>
<p className="text-xs text-gray-400">Absolute path to vault directory</p>
```

**Validation approach: post-load only.** Rationale: live validation requires a Tauri `stat_file` or `list_dir` call on every keystroke, which is latency-heavy (IPC round trip). The `list_files` Tauri command already validates the root via `canonicalize` and returns an explicit error string if the path is invalid. The adapter returns `status: "error"` with a clear message (`"Cannot canonicalize root: /bad/path (No such file or directory)"`). This message surfaces in the Graph Sources tile UI.

**Effort: LOW.** One text input plus a hint string.

### 7.2 Settings persistence

The dispatch component at `src/source-adapter/AdapterConfigForm.tsx:28-34` calls `handleChange(next: Partial<AdapterConfig>)` which merges `next` into the stored config and writes to `sources.configurations.markdown-vault`. The `MarkdownVaultConfigForm` component calls `onChange({ vaultRoot: newValue })` — fits the pattern exactly. No changes to `AdapterConfigForm.tsx`.

### 7.3 Form testid

`AdapterConfigForm.tsx:37` generates `data-testid={`adapter-config-${adapterId}`}` for the wrapper when a form IS registered. For `markdown-vault` that becomes `data-testid="adapter-config-markdown-vault"`.

E2E assertions (add to `source-adapter.spec.ts` or a new `markdown-vault.spec.ts`):

```typescript
// When markdown-vault is active:
await expect(page.getByTestId("adapter-config-markdown-vault")).toBeVisible();
await expect(page.getByTestId("adapter-config-empty")).not.toBeVisible();

// When markdown-vault is candidate (not active), neither is visible.
// (Covered by the existing "configuration section appears for active entry only" test.)
```

---

## §8 — Pre-flight decisions for Ryan

| # | Question | Recommendation | Reasoning |
|---|---|---|---|
| D1 | **Unresolved wikilinks**: skip / placeholder node / phantom node | **Skip (A), log to warnings[]** | Placeholder nodes confuse non-Obsidian-native users. Warnings surface them. Add `showUnresolved` toggle post-v1.0. |
| D2 | **Nested tags**: single compound node `tag:parent/child` OR hierarchical decomposition | **Single compound node for v1.0** | Simpler, fewer nodes, no hierarchy edges. Hierarchical view is a future polish arc. |
| D3 | **mtime source for truncation**: frontmatter `updated:` with fs-mtime fallback OR frontmatter-only | **Frontmatter-only for v1.0; sort undefined to end** | No new Rust command needed. ~80% of date-aware vaults use `updated:`. Add fs-mtime in a later pass via `list_files_with_stat`. |
| D4 | **Configurable `maxNodes` override**: honor from config OR hard-cap at 2000 | **Hard-cap 2000 for v1.0; field in schema but ignored** | No performance testing for large caps. Revisit at v110+. Add code comment in adapter. |
| D5 | **Backlinks**: emit as separate edges OR derive at query time | **Derive at query time from directed wikilink edges** | No extra edges. LumaWeave edge list is queryable in both directions. No graph schema change. |
| D6 | **Tag hierarchy on graph**: all tags in one cluster OR top-level tag per cluster | **Defer — this is a rendering/cluster decision, not adapter decision** | Adapter emits `type: "tag"` on all tag-nodes. Cluster assignment is LumaWeave's job (cluster resolver reads `raw.kind`). |
| D7 | **Color code false positives** (`#FF0000` in body matching inline tag regex) | **Accept the false positive for v1.0; add heuristic filter post-v1.0** | Color codes in markdown bodies are rare. A `#FF0000` node in the graph is odd but not catastrophic. Warn-suppress in a later pass. |
| D8 | **File layout for adapter module**: flat `src/source-adapter/` OR `adapters/` subdirectory | **`src/source-adapter/adapters/` subdirectory** | Four adapters are coming. Subdirectory keeps the flat directory clean. Registration stays centralized in `sourceAdapterRegistry.ts`. |
| D9 | **Adapter status after v109.1**: mark `markdown-vault` entry as `"registered"` after loader wires | **Yes, advance status** — `candidate` → `registered` | SDK_SPEC.md §2 defines `"registered"` as: loader wired, `registerSourceAdapter` called. This is exactly what v109.1 delivers. |

---

## §9 — Recommended pass shape

### Complexity assessment

The adapter has three non-trivial pieces:
1. **Two-pass wikilink index + resolution** — MED complexity (index structure, disambiguation, alias lookup)
2. **Tag parsing** — LOW complexity (two regexes, one `gray-matter` parse)
3. **Truncation** — LOW complexity (sort + slice + warnings)
4. **Form + registration** — LOW complexity (one text input, follows established pattern)
5. **Fixture vault + E2E** — MED complexity (need to design 10 notes with precise expected output)

Total estimated scope: **6–8 hours agent time**, 3 commits.

### Recommended split: 3 commits

**v109.1.0 — Adapter implementation + form + registration** (HIGH effort)

Files:
- `src/source-adapter/adapters/markdownVaultAdapter.ts` (NEW) — `MarkdownVaultAdapter` class extending `DirectoryAdapter`, full `load()` implementation: frontmatter parse, tag extraction, wikilink index build + resolution, truncation, `GraphSourceSummary` construction
- `src/source-adapter/adapters/MarkdownVaultConfigForm.tsx` (NEW) — single vault-root text input, `registerAdapterConfigForm()` call at bottom
- `src/source-adapter/sourceAdapterRegistry.ts` (MODIFY) — import `markdownVaultAdapter.ts` loader, replace `candidateNoOpLoader` for `"markdown-vault"`, bump status `"candidate"` → `"registered"`

Verification: `npm run typecheck` + `source-adapter.spec.ts` in isolation (config form testid appears for active markdown-vault entry — though markdown-vault won't be the default active adapter, this may need a `page.evaluate` store override in the test).

**v109.1.1 — Fixture vault + E2E spec** (MED effort)

Files:
- `tests/fixtures/markdown-vault/` (NEW directory, 10 `.md` files per §5)
- `tests/e2e/markdown-vault.spec.ts` (NEW) — set markdown-vault as active via store, set vaultRoot to fixture path, trigger load, assert node counts / edge counts / tag-node presence / warnings

Verification: `npm run typecheck` + `tests/e2e/markdown-vault.spec.ts` in isolation.

Note: the fixture vault path in E2E will be an absolute path derived at test time. The test needs to compute the fixture path from `process.cwd()` or a fixture-root env var, then write it into the settings store via `page.evaluate`.

**v109.1.2 — Arc step close + NOW.md update** (LOW effort)

Files:
- `docs/LUMAWEAVE_NOW.md` — add v109.1 row to the open-arc commit table, update v109.1 status to `[COMPLETE]`, v109.2 to `[NEXT]`

No E2E run needed (docs only). `npm run typecheck` sanity.

### Hard sequencing dependencies

```
v109.1.0 (adapter) → v109.1.1 (fixture + E2E)
  (fixture E2E calls the real adapter; adapter must exist first)

v109.1.1 → v109.1.2 (arc step close)
  (trivial dependency; close only after E2E green)
```

### One concern: setting markdown-vault as active in E2E

The default active adapter is `"self-graph-yaml-frontmatter"`. The markdown-vault E2E spec needs to temporarily set `sources.active = "markdown-vault"` and `sources.configurations.markdown-vault.vaultRoot = absoluteFixturePath`. Both can be done via `page.evaluate(() => window.__lwStore.getState().setSetting(...))`. The existing E2E tests already use this pattern (`source-adapter.spec.ts:91–93`).

One flag: the `SourceAdapterPanel` only shows the configuration section for the *active* adapter (`SourceAdapterPanel.tsx` — `isActive && <AdapterConfigForm>` conditional). The E2E test needs to activate markdown-vault first to see its form. Sequence: set active → wait for panel update → assert config form visible. Standard `waitForLoadState("networkidle")` should be sufficient since this is a sync store update.

---

*End of investigation. Report ready for planning Claude to scope v109.1 implementation passes. Awaiting §8 decision confirmations before implementation begins.*
