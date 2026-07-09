// SPDX-License-Identifier: Apache-2.0
/**
 * Bookmark Registry Contract
 * 
 * Registry for floating bookmarks (alert, pinned, ref nodes)
 * Follows the standard registry contract pattern from v86a
 */

export type BookmarkType = "alert" | "pinned" | "ref";

export interface BookmarkEntry {
  id: string;
  type: BookmarkType;
  position: { x: number; y: number }; // viewport-relative 0–1
  label: string;
  sub?: string;
  targetNodeId?: string;
  color?: string; // optional override; defaults to type's token
}

export interface BookmarkRegistry {
  entries: Map<string, BookmarkEntry>;
  register(entry: BookmarkEntry): void;
  unregister(id: string): void;
  get(id: string): BookmarkEntry | undefined;
  getAll(): BookmarkEntry[];
  clear(): void;
}

/**
 * Create a new bookmark registry
 */
export function createBookmarkRegistry(): BookmarkRegistry {
  const entries = new Map<string, BookmarkEntry>();

  return {
    entries,

    register(entry: BookmarkEntry): void {
      entries.set(entry.id, entry);
    },

    unregister(id: string): void {
      entries.delete(id);
    },

    get(id: string): BookmarkEntry | undefined {
      return entries.get(id);
    },

    getAll(): BookmarkEntry[] {
      return Array.from(entries.values());
    },

    clear(): void {
      entries.clear();
    },
  };
}

/**
 * Singleton registry instance
 */
export const bookmarkRegistry = createBookmarkRegistry();

/**
 * Initialize with demo bookmarks (v86b ships 3 demo entries)
 */
export function initializeDemoBookmarks(): void {
  bookmarkRegistry.register({
    id: "demo-alert-1",
    type: "alert",
    position: { x: 0.94, y: 0.06 },
    label: "Alert",
    sub: "High priority",
  });

  bookmarkRegistry.register({
    id: "demo-pinned-1",
    type: "pinned",
    position: { x: 0.94, y: 0.14 },
    label: "Pinned",
    sub: "Saved for later",
  });

  bookmarkRegistry.register({
    id: "demo-ref-1",
    type: "ref",
    position: { x: 0.94, y: 0.22 },
    label: "Reference",
    sub: "Related node",
  });
}
