# Investigation brief — v109.1 markdown-vault (Obsidian) adapter

**For:** Terminal Claude · **Output:** one markdown report dropped into PK as `v109_1_markdown_vault_report.md` · **No code changes, no commits, no installs.**

v109.1 is the first concrete adapter on the v109.0 platform. The platform is in place — `BaseSourceAdapter`, `DirectoryAdapter` (with `listFiles` + `readVaultFile` wired to the Tauri commands), `registerSourceAdapter()`, the per-adapter settings scaffolding (`AdapterConfigForm` + registry). This brief produces the implementation spec for the markdown-vault adapter itself.

The portfolio survey (`docs/prototypes/v109_adapter_portfolio_report.md`) §3 covered the high-level Obsidian shape. This brief goes one level deeper — algorithmic specifics that need to be locked before implementation, dependency checks, fixture vault design, and a fit-test of the SDK against this real adapter case.

**Hard stops:**
- No code changes. No commits. No installs.
- Cite file:line for every claim about current LumaWeave code.
- For Obsidian behavior claims, cite the official Obsidian docs URL where possible. If a claim is from cached knowledge without verification, mark it explicitly.
- Every recommendation includes tradeoff analysis, not just preference.

---

## §1 — Platform fit-check (the SDK works as designed?)

Before implementation specifics, sanity-check that v109.0's platform genuinely fits this adapter case:

1. **DirectoryAdapter shape** — read `directoryAdapter.ts` (v109.0.3 wiring). Confirm `listFiles(root, extensions, excludePrefixes)` + `readVaultFile(root, relativePath)` are sufficient for markdown-vault's needs. If the markdown-vault loader needs anything else (file stat for mtime? file size? extension extraction?), flag the gap.
2. **AdapterConfig union** — read `baseSourceAdapter.ts`. Confirm `MarkdownVaultConfig` is in the union with the right shape (`vaultRoot: string` minimum). If fields need adding for this implementation (e.g. `excludePatterns: string[]`, `maxNotes: number`), flag them.
3. **`registerSourceAdapter()` call site** — where should markdown-vault's registration live? A new file `src/source-adapter/adapters/markdownVaultAdapter.ts` that self-registers on module load? Or alongside `loadSelfGraph.ts`? Recommend a structure that scales for v109.2/3/4 too (4 adapters need 4 modules; the file layout should be consistent).
4. **`registerAdapterConfigForm()` call site** — same question for the form. The form module would live near the adapter module — confirm or recommend.

If the platform doesn't fit cleanly, flag it as a v109.0 patch needed before v109.1 can land. (My expectation is it fits — but better to confirm than assume.)

---

## §2 — Wikilink resolution: the algorithmic spec

The hardest single piece of logic in the adapter. Obsidian's resolution rules are documented but full of edge cases. Lock the algorithm with precision.

### 2.1 Resolution targets

A wikilink like `[[Note Name]]` resolves against:
- The set of all `.md` files in the vault (recursively)
- Each file has a *filename* (without `.md` extension) and a *full relative path* from vault root
- Each file may declare *aliases* in its frontmatter (`aliases: [Alt Name, Another Name]`)

Document Obsidian's resolution priority order. From cached knowledge / docs research:
- Exact match on filename (without extension)
- Exact match on alias
- Path-suffix match (`[[folder/Note Name]]` → exact path match relative to vault root)
- Header-anchor variants: `[[Note Name#Header]]` and `[[Note Name#^block]]`
- Disambiguation when multiple files match: Obsidian uses some "closest" rule — investigate and cite

Cite the official Obsidian docs (help.obsidian.md/Linking+notes+and+files or similar) and confirm the priority order.

### 2.2 Two-pass algorithm (recommended)

Confirm the two-pass approach fits:
- **Pass 1:** walk all `.md` files, build `index: Map<string, NoteInfo>` keyed by filename (without ext), with secondary keys for aliases and full paths. NoteInfo includes the file's path, mtime, frontmatter, raw body.
- **Pass 2:** for each note's body, regex-match wikilinks, resolve against the index, emit edges.

Sketch the index data structure. Specifically:
- How is the collision case handled (two notes both named "Project" in different folders)? Multimap? Disambiguation by "closest in path tree" relative to the linking note? Document the rule precisely.
- How is alias lookup integrated? Separate map? Same map with alias entries pointing to canonical paths?

### 2.3 Wikilink regex / parser

Recommend: regex (simpler, faster, sufficient for v1.0) or proper parser (more robust, handles nested cases like `[[foo|bar with [[ in it]]`)?

If regex: propose the exact pattern. The pattern needs to handle:
- `[[Simple]]`
- `[[Note Name|Display Text]]` — the `|` syntax for alt text
- `[[Note Name#Header]]` — the `#` for header anchor
- `[[Note Name#^block-id]]` — the `^` for block ref
- `[[folder/Note Name]]` — folder prefix
- Multi-line bodies (regex flags?)
- Edge: `[[]]` (empty wikilink — ignore? log?)
- Edge: nested brackets within a wikilink — Obsidian's actual behavior?

Cite a known-good regex from a markdown-it-wikilinks plugin or similar reference implementation. Don't invent from scratch.

### 2.4 What about unresolved wikilinks?

If `[[Nonexistent Note]]` appears in a note body, what happens?
- Option A: Silently skip. No node, no edge.
- Option B: Create a placeholder node (Obsidian-style "unresolved" link, often rendered greyed-out). The placeholder node has no content, no path, just a name.
- Option C: Create a phantom node tracked in metadata; not rendered as a node by default but available for "show unresolved links" view.

Recommend with tradeoff. Obsidian itself renders these as greyed-out nodes — option B fits the format's behavior. But for v1.0 simplicity, A might be defensible.

### 2.5 Backlinks

The SDK_SPEC + portfolio survey said "backlinks are derived not stored." Confirm:
- LumaWeave's graph rendering treats edges as bidirectional naturally (or doesn't?). Verify.
- If bidirectional rendering is the default, no backlink edge is needed — every wikilink edge serves both directions.
- If not, backlinks need to be reconstructed at query time. Where would that logic live?

Recommend.

---

## §3 — Tag handling

Locked decision: **tag-nodes, not tag-edges.** Each tag becomes a node; notes connect to tag-nodes by membership.

Lock the specifics:

### 3.1 Tag sources

Tags come from two places:
- **Frontmatter:** `tags: [a, b, c]` or `tags:\n  - a\n  - b`
- **Inline body:** `#tag`, `#tag/nested`

Confirm both are supported. The inline regex needs care — `#tag` should NOT match `#header` (markdown headers) or `#hex` (`#FF0000` color codes). Obsidian's rule: `#tag` requires a non-space, non-punctuation character after `#` (so `# Header` doesn't match because of the space). Cite the actual rule.

### 3.2 Nested tags

`#parent/child/grandchild` — Obsidian treats this as three nested levels. Question: does it create one tag-node (`parent/child/grandchild`) or three nodes (`parent`, `child`, `grandchild`) with parent-child edges among them?

Recommend. The full path as one tag is simpler for v1.0; the hierarchical decomposition would be a richer graph but more complex.

### 3.3 Tag node identity

What's the canonical ID for a tag-node? Just the tag text (`#projects`)? A normalized form (`tag:projects`)? A prefixed scheme distinct from note-node IDs to avoid collision?

Recommend a convention. Note-node IDs are relative paths (per locked decision). Tag-node IDs need to be in a namespace that doesn't collide with paths.

### 3.4 Tag node attributes

A tag-node needs *some* renderable attributes. Recommend:
- `label`: the tag text
- `kind: "tag"` (vs `kind: "note"`)
- Cluster/color hint: tag-nodes might share a cluster, or each top-level tag might be its own cluster
- Size: derived from membership count?

Light recommendation — these are easy v1.0 defaults that v109.5 polish can tune.

---

## §4 — Truncation: the 2000-note cap

Locked decision: 2000-note cap with truncation warning. Truncation order: **modification-date descending** (Ryan's lean). Lock the specifics:

### 4.1 What "modification date" means

Three candidates:
- Filesystem mtime (from the OS) — fastest, but resets on `git clone` / file copy
- Frontmatter `updated:` field if present — most semantically meaningful, but optional
- Frontmatter `created:` field — fallback if `updated:` absent

Recommend: prefer frontmatter `updated:` if present, fall back to fs mtime. Skip `created:` (different semantic). The fallback chain is simple and predictable.

But verify: is there a standard Obsidian convention for tracking modification dates in frontmatter? Cite if so. (Some users do; many don't.)

### 4.2 Truncation behavior

When the vault exceeds 2000 notes:
- Sort by chosen mtime descending
- Keep the top 2000
- Discard the rest
- Build the index + graph from only the kept set
- Wikilinks pointing to discarded notes: treat as unresolved (per §2.4 decision)
- Report: warning summary returned in `GraphSourceSummary.warnings` array — count of discarded notes, oldest kept date, newest discarded date

Confirm the warning shape fits `GraphSourceSummary`'s existing or proposed `warnings` field. If the field doesn't exist, propose its addition (small SDK_SPEC amendment).

### 4.3 Configurable cap?

The cap is 2000 for v1.0. Should `MarkdownVaultConfig` expose `maxNotes?: number` as a user override (with 2000 as default, hard ceiling at, say, 10000)?

Recommend. The risk of a user-override is "user opens 50k-note vault and the app freezes"; the benefit is power-user flexibility. For v1.0 I'd lean "no override, 2000 hard for now"; v109.5 or v110 can revisit.

---

## §5 — Fixture vault design (for E2E)

The E2E spec needs a real (small) vault committed to the repo. Design it.

Recommend: `tests/fixtures/markdown-vault/` directory in the repo. Contents:

- Maybe 8-12 notes covering the cases:
  - A "hub" note with multiple wikilinks
  - A note with frontmatter tags
  - A note with inline tags
  - A note with aliases declared
  - A note linked-to by alias (the resolution case)
  - A note in a subfolder (folder-prefix case)
  - A note that's the target of an unresolved wikilink (or a wikilink to a note that doesn't exist, depending on §2.4 decision)
  - A note with nested tags (`#projects/lumaweave`)
  - A note with both wikilinks and tags to test edge interaction

Sketch the fixture vault contents (note names, frontmatter, body excerpts). Don't write the actual .md files — just describe what each note covers and what edges/tag-nodes it should produce.

The E2E spec then loads this fixture, asserts the resulting graph has the expected nodes (N notes + M tag-nodes) and edges (X wikilink edges + Y tag-membership edges).

---

## §6 — Dependency check: YAML parser

Frontmatter parsing requires YAML. Is one already in the npm deps?

- Read `package.json` and report what YAML-adjacent packages exist (`yaml`, `js-yaml`, `gray-matter`, `front-matter`, etc.).
- Note: `gray-matter` is specifically for frontmatter+body splitting (very common for markdown) and uses `js-yaml` under the hood.
- If none of the above exist, this is a **per-install-approval gate** — flag it as a blocker that needs Ryan's sign-off before v109.1 implementation can proceed. Recommend which package (lightweight, well-maintained, no native deps preferred).

Don't install anything. Just report what's there and what would be needed.

---

## §7 — UI integration: the form

The empty-state scaffold from v109.0.4 needs replacing with a real form for markdown-vault. Design the form.

### 7.1 Fields

- **Vault root** (required): text input. Per locked decision, no folder-picker dialog for v1.0 — just text input. User types/pastes a path.
- **Validation hints?** A note like "Path must be an existing directory" displayed below the input. Should the input validate live (call a Tauri command to check existence), or just attempt the load and surface errors after?

Recommend.

### 7.2 Settings persistence

The form calls `onChange` with partial updates. The dispatch component (`AdapterConfigForm`) writes to `sources.configurations.markdown-vault.vaultRoot`. Confirm this fits the existing pattern from `AdapterConfigForm.tsx` (the v109.0.4 component).

### 7.3 Form testid

`data-testid="adapter-config-markdown-vault"` (per the v109.0.4 scaffolding pattern). E2E spec asserts this testid is visible when markdown-vault is the active adapter, AND the empty-state testid is absent.

---

## §8 — Pre-flight decisions Ryan will need to confirm

Aggregate every decision point this brief surfaces into one checklist. For each: clear question + investigator's recommendation + reasoning, in product-language where possible.

Examples of shape:
- "Unresolved wikilinks: skip / placeholder node / phantom node. Recommend X because Y."
- "Nested tags: single node `parent/child` or hierarchical decomposition. Recommend X because Y."
- "mtime source: frontmatter `updated:` with fs-mtime fallback. Confirm or change."
- "Configurable maxNotes: defer to v1.0+1 (no override now). Confirm or change."

This is the call-list Ryan will work through before implementation begins.

---

## §9 — Recommended pass shape

Given §1–§8, propose v109.1 implementation:

- **Single pass or multiple?** v109.1's complexity (wikilinks + tags + truncation + form + fixture) might warrant splitting into 2 passes (e.g. v109.1.0: adapter logic + form; v109.1.1: fixture vault + E2E spec + arc-step close). Or it might be a single pass with 3 commits like v109.0 was.
- **Files touched per step** (best-effort estimate; explicit lists).
- **Hard sequencing dependencies.**
- **Estimated total scope** (hours of agent time / commits).

---

## Output format

One markdown file dropped into PK as `v109_1_markdown_vault_report.md`. Nine sections numbered as above. File:line citations for code claims, doc-URL citations for Obsidian behavior claims, LOW/MED/HIGH ratings on every difficulty / effort question. Tradeoff analysis (not preference) on every architectural choice. No commits. No code changes. No installs.

When complete: ping back; planning Claude reads the report and scopes the v109.1 implementation pass(es) from it.
