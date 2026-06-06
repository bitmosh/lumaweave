/**
 * Markdown Vault Adapter — Obsidian-style vault to LumaWeave graph.
 * v109.1: wikilink resolution, tag nodes, frontmatter + inline tags, truncation.
 * Locked decisions: D1–D9 per BANDIT_v109_1_markdown_vault.md
 */

// gray-matter uses Buffer.from() to store raw content (file.orig); polyfill for browser context.
// We never read file.orig, so returning the input unchanged is sufficient.
if (typeof (globalThis as any).Buffer === "undefined") {
  (globalThis as any).Buffer = { from: (s: unknown) => s, isBuffer: () => false };
}

import matter from "gray-matter";
import { DirectoryAdapter } from "../directoryAdapter";
import type { AdapterCapabilities, AdapterConfig, MarkdownVaultConfig } from "../baseSourceAdapter";
import type { GraphSourceSummary, LumaWeaveEdgeDraft, LumaWeaveNodeDraft } from "../../graph/schema/graph.types";
import "./MarkdownVaultConfigForm"; // registers the config form as side effect

// D7 (non-negotiable): hex-aware regex rejects #FF0000, #abc etc.
const INLINE_TAG_RE = /#(?![0-9a-fA-F]{3,6}\b)([a-zA-Z][a-zA-Z0-9_\-/]*)/g;

// §2.3: wikilink regex. Groups: 1=target, 2=anchor, 3=display text
const WIKILINK_RE = /\[\[([^\[\]|#]+?)(?:#([^\[\]|]+?))?(?:\|([^\[\]]+?))?\]\]/g;

// D3: frontmatter date keys in priority order
const FRONTMATTER_DATE_KEYS = ["updated", "modified", "date_modified", "last_modified"] as const;

const MAX_NOTES = 2000;
const DEFAULT_EXCLUDE_PREFIXES = [".obsidian", ".git", ".trash"];

interface NoteInfo {
  relativePath: string;
  filename: string;        // basename without .md
  aliases: string[];
  frontmatterTags: string[];
  updatedAt: Date | undefined;
  body: string;
}

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

function parseDateLoose(value: unknown): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return isNaN(value.getTime()) ? undefined : value;
  if (typeof value === "string") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? undefined : d;
  }
  return undefined;
}

function normalizeStringArray(value: unknown): string[] {
  if (!value) return [];
  if (typeof value === "string") return value.trim() ? [value.trim()] : [];
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  return [];
}

function parseNoteInfo(relativePath: string, data: Record<string, unknown>, body: string): NoteInfo {
  const stripped = relativePath.replace(/\.md$/, "");
  const filename = stripped.split("/").pop() ?? stripped;

  let updatedAt: Date | undefined;
  for (const key of FRONTMATTER_DATE_KEYS) {
    updatedAt = parseDateLoose(data[key]);
    if (updatedAt) break;
  }

  return {
    relativePath,
    filename,
    aliases: normalizeStringArray(data.aliases),
    frontmatterTags: normalizeStringArray(data.tags),
    updatedAt,
    body,
  };
}

function sortByUpdatedDesc(notes: NoteInfo[]): NoteInfo[] {
  return [...notes].sort((a, b) => {
    if (a.updatedAt && b.updatedAt) return b.updatedAt.getTime() - a.updatedAt.getTime();
    if (a.updatedAt) return -1;
    if (b.updatedAt) return 1;
    return a.relativePath.localeCompare(b.relativePath);
  });
}

function sharedPrefixDepth(pathA: string, pathB: string): number {
  const partsA = pathA.split("/").slice(0, -1);
  const partsB = pathB.split("/").slice(0, -1);
  let depth = 0;
  const minLen = Math.min(partsA.length, partsB.length);
  for (let i = 0; i < minLen; i++) {
    if (partsA[i] === partsB[i]) depth++;
    else break;
  }
  return depth;
}

function disambiguate(candidates: NoteInfo[], linkingPath: string): NoteInfo {
  return [...candidates].sort((a, b) => {
    const sa = sharedPrefixDepth(linkingPath, a.relativePath);
    const sb = sharedPrefixDepth(linkingPath, b.relativePath);
    if (sa !== sb) return sb - sa;
    return a.relativePath.localeCompare(b.relativePath);
  })[0];
}

function resolveWikilink(
  target: string,
  linkingPath: string,
  byFilename: Map<string, NoteInfo[]>,
  byPath: Map<string, NoteInfo>,
  byAlias: Map<string, NoteInfo[]>,
): NoteInfo | undefined {
  // Priority 1: exact path match (e.g. [[folder/Note]])
  const pathHit = byPath.get(target);
  if (pathHit) return pathHit;

  // Priority 2: filename match (basename of target, e.g. [[Note]])
  const basename = target.split("/").pop() ?? target;
  const filenameHits = byFilename.get(basename);
  if (filenameHits) {
    return filenameHits.length === 1 ? filenameHits[0] : disambiguate(filenameHits, linkingPath);
  }

  // Priority 3: alias match
  const aliasHits = byAlias.get(target);
  if (aliasHits) {
    return aliasHits.length === 1 ? aliasHits[0] : disambiguate(aliasHits, linkingPath);
  }

  return undefined;
}

function addTagMembership(map: Map<string, Set<string>>, tag: string, noteId: string): void {
  const existing = map.get(tag) ?? new Set<string>();
  existing.add(noteId);
  map.set(tag, existing);
}

function makeErrorSummary(error: string, vaultRoot?: string): GraphSourceSummary {
  return {
    sourceId: "markdown-vault",
    label: vaultRoot ? `Markdown Vault: ${vaultRoot}` : "Markdown Vault",
    sourcePath: vaultRoot ?? "",
    publicBaseUrl: "",
    status: "error",
    graphPresent: false,
    manifestPresent: false,
    reportPresent: false,
    nodeCount: 0,
    edgeCount: 0,
    normalizedNodeCount: 0,
    normalizedEdgeCount: 0,
    warnings: [],
    error,
  };
}

// ---------------------------------------------------------------------------
// Adapter class
// ---------------------------------------------------------------------------

class MarkdownVaultAdapter extends DirectoryAdapter {
  readonly adapterId = "markdown-vault";
  readonly adapterType = "markdown-vault";
  readonly adapterVersion = "0.1.0";
  readonly capabilities: AdapterCapabilities = {
    supportsLiveRefresh: false,
    requiresUserPath: true,
    requiresNetwork: false,
    supportsFiltering: true,
    maxRecommendedNodes: 2000,
  };

  async load(config: AdapterConfig): Promise<GraphSourceSummary> {
    if (config.adapterId !== "markdown-vault") {
      return makeErrorSummary("Adapter dispatch mismatch");
    }
    const vaultConfig = config as MarkdownVaultConfig;

    if (!vaultConfig.vaultRoot?.trim()) {
      return makeErrorSummary("Vault root not configured. Enter the path in the Configuration section.");
    }

    const warnings: string[] = [];

    // D4: audible-ignore — log if user set maxNodes override
    if (vaultConfig.maxNodes !== undefined && vaultConfig.maxNodes !== MAX_NOTES) {
      warnings.push(
        `maxNodes config (${vaultConfig.maxNodes}) is not honored in v1.0; using default ${MAX_NOTES}.`,
      );
    }

    const excludePrefixes = vaultConfig.excludePatterns ?? DEFAULT_EXCLUDE_PREFIXES;

    let files: string[];
    try {
      files = await this.listFiles(vaultConfig.vaultRoot, ["md"], excludePrefixes);
    } catch (err) {
      return makeErrorSummary(`Cannot list vault: ${err}`, vaultConfig.vaultRoot);
    }

    // -----------------------------------------------------------------------
    // Pass 1: read + parse all files, build NoteInfo array
    // -----------------------------------------------------------------------
    const allNotes: NoteInfo[] = [];
    for (const relativePath of files) {
      try {
        const raw = await this.readVaultFile(vaultConfig.vaultRoot, relativePath);
        const parsed = matter(raw);
        allNotes.push(parseNoteInfo(relativePath, parsed.data as Record<string, unknown>, parsed.content));
      } catch (err) {
        warnings.push(`Skipped "${relativePath}": ${err}`);
      }
    }

    // Truncation (D3: sort by frontmatter date desc, undefined to end)
    const totalCount = allNotes.length;
    let keptNotes = allNotes;
    if (totalCount > MAX_NOTES) {
      keptNotes = sortByUpdatedDesc(allNotes).slice(0, MAX_NOTES);
      warnings.push(
        `Vault truncated: kept ${MAX_NOTES} of ${totalCount} notes. ` +
          `${totalCount - MAX_NOTES} older notes excluded. ` +
          `Wikilinks to excluded notes treated as unresolved.`,
      );
    }

    // Build lookup structures
    const byFilename = new Map<string, NoteInfo[]>();
    const byPath = new Map<string, NoteInfo>();
    const byAlias = new Map<string, NoteInfo[]>();

    for (const note of keptNotes) {
      // byPath: keyed by path without .md
      byPath.set(note.relativePath.replace(/\.md$/, ""), note);

      // byFilename: multimap (multiple notes may share a basename)
      const existing = byFilename.get(note.filename) ?? [];
      existing.push(note);
      byFilename.set(note.filename, existing);

      // byAlias: multimap
      for (const alias of note.aliases) {
        const ex = byAlias.get(alias) ?? [];
        ex.push(note);
        byAlias.set(alias, ex);
      }
    }

    // -----------------------------------------------------------------------
    // Pass 2: emit nodes and edges
    // -----------------------------------------------------------------------
    const noteNodes: LumaWeaveNodeDraft[] = [];
    const tagMembership = new Map<string, Set<string>>();
    const edges: LumaWeaveEdgeDraft[] = [];
    let edgeSeq = 0;

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

      // Inline tags from body (D7: hex-aware regex)
      INLINE_TAG_RE.lastIndex = 0;
      for (const match of note.body.matchAll(INLINE_TAG_RE)) {
        addTagMembership(tagMembership, match[1], noteId);
      }

      // Wikilinks
      WIKILINK_RE.lastIndex = 0;
      for (const match of note.body.matchAll(WIKILINK_RE)) {
        const target = match[1].trim();
        const anchor = match[2];
        const displayText = match[3];

        const resolved = resolveWikilink(target, note.relativePath, byFilename, byPath, byAlias);
        if (resolved) {
          edges.push({
            id: `mv:wikilink:${++edgeSeq}`,
            source: noteId,
            target: resolved.relativePath,
            relationship: "wikilink",
            raw: {
              sourceAdapter: "markdown-vault",
              ...(anchor !== undefined ? { anchor } : {}),
              ...(displayText !== undefined ? { displayText } : {}),
            },
          });
        } else {
          // D1: skip unresolved, log to warnings
          warnings.push(`Unresolved wikilink in ${note.relativePath}: [[${target}]]`);
        }
      }
    }

    // D2: single compound tag node per full tag string (no hierarchy decomposition)
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
          id: `mv:tag:${++edgeSeq}`,
          source: memberId,
          target: tagId,
          relationship: "tag-membership",
          raw: { sourceAdapter: "markdown-vault" },
        });
      }
    }

    const allNodes = [...noteNodes, ...tagNodes];
    const wikilinkEdgeCount = edges.filter((e) => e.relationship === "wikilink").length;

    return {
      sourceId: "markdown-vault",
      label: `Markdown Vault: ${vaultConfig.vaultRoot}`,
      sourcePath: vaultConfig.vaultRoot,
      publicBaseUrl: "",
      status: "loaded",
      graphPresent: allNodes.length > 0,
      manifestPresent: false,
      reportPresent: false,
      nodeCount: keptNotes.length,
      edgeCount: wikilinkEdgeCount,
      normalizedNodeCount: allNodes.length,
      normalizedEdgeCount: edges.length,
      warnings,
      normalizedNodes: allNodes,
      normalizedEdges: edges,
    };
  }
}

// ---------------------------------------------------------------------------
// Module-level registration side effects
// ---------------------------------------------------------------------------

const _adapterInstance = new MarkdownVaultAdapter();
export const loadMarkdownVault = (config: AdapterConfig) => _adapterInstance.load(config);
