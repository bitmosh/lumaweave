/**
 * Asset Registry
 *
 * Registry for managing theme assets (textures, shaders, animations, etc.).
 * v86a: Empty bank, contract live. v88 Workshop will populate it.
 * v88a: Added subscribe + dev probe.
 */

import type { AssetEntry, AssetRegistry as AssetRegistryContract } from "./assetBank.types";

const entries = new Map<string, AssetEntry>();
const listeners = new Set<() => void>();

export const assetRegistry: AssetRegistryContract & {
  subscribe(listener: () => void): () => void;
} = {
  list() {
    return Array.from(entries.values());
  },

  getById(id: string) {
    return entries.get(id);
  },

  filterByCategory(query: { type?: string; family?: string; tags?: string[] }) {
    return this.list().filter((asset) => {
      if (query.type && asset.type !== query.type) return false;
      if (query.family && asset.family !== query.family) return false;
      if (query.tags && query.tags.length > 0) {
        if (!query.tags.every((tag) => asset.tags.includes(tag))) return false;
      }
      return true;
    });
  },

  validateShape(entry: unknown) {
    const errors: string[] = [];
    if (typeof entry !== "object" || entry === null) {
      return { valid: false, errors: ["Entry must be an object"] };
    }
    const e = entry as Record<string, unknown>;
    if (typeof e.id !== "string" || !e.id) errors.push("id must be a non-empty string");
    if (typeof e.type !== "string") errors.push("type must be a string");
    if (typeof e.family !== "string") errors.push("family must be a string");
    if (!Array.isArray(e.tags)) errors.push("tags must be an array");
    if (typeof e.mediaUrl !== "string") errors.push("mediaUrl must be a string");
    if (typeof e.sourceTheme !== "string") errors.push("sourceTheme must be a string");
    if (typeof e.createdAt !== "number") errors.push("createdAt must be a number");
    if (typeof e.updatedAt !== "number") errors.push("updatedAt must be a number");
    return { valid: errors.length === 0, errors: errors.length ? errors : undefined };
  },

  register(entry: AssetEntry) {
    const validation = this.validateShape(entry);
    if (!validation.valid) {
      throw new Error(`Invalid asset entry: ${validation.errors?.join(", ")}`);
    }
    entries.set(entry.id, entry);
    listeners.forEach((l) => l());
  },

  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

if (
  typeof window !== "undefined" &&
  (import.meta.env.DEV || (window as any).PLAYWRIGHT)
) {
  (window as any).__lwAssetRegistry = assetRegistry;
}
