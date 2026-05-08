/**
 * Asset Registry
 * 
 * Registry for managing theme assets (textures, shaders, animations, etc.).
 * v86a: Empty bank, contract live. v88 Workshop will populate it.
 */

import type { AssetEntry, AssetRegistry as AssetRegistryContract } from "./assetBank.types";

class AssetRegistry implements AssetRegistryContract {
  private assets: Map<string, AssetEntry> = new Map();

  list(): AssetEntry[] {
    return Array.from(this.assets.values());
  }

  getById(id: string): AssetEntry | undefined {
    return this.assets.get(id);
  }

  filterByCategory(query: { type?: string; family?: string; tags?: string[] }): AssetEntry[] {
    return this.list().filter((asset) => {
      if (query.type && asset.type !== query.type) return false;
      if (query.family && asset.family !== query.family) return false;
      if (query.tags && query.tags.length > 0) {
        const hasAllTags = query.tags.every((tag) => asset.tags.includes(tag));
        if (!hasAllTags) return false;
      }
      return true;
    });
  }

  validateShape(entry: unknown): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (typeof entry !== "object" || entry === null) {
      return { valid: false, errors: ["Entry must be an object"] };
    }

    const e = entry as Record<string, unknown>;

    if (typeof e.id !== "string") errors.push("id must be a string");
    if (typeof e.type !== "string") errors.push("type must be a string");
    if (typeof e.family !== "string") errors.push("family must be a string");
    if (!Array.isArray(e.tags)) errors.push("tags must be an array");
    if (typeof e.mediaUrl !== "string") errors.push("mediaUrl must be a string");
    if (typeof e.sourceTheme !== "string") errors.push("sourceTheme must be a string");
    if (typeof e.createdAt !== "number") errors.push("createdAt must be a number");
    if (typeof e.updatedAt !== "number") errors.push("updatedAt must be a number");

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  register(entry: AssetEntry): void {
    const validation = this.validateShape(entry);
    if (!validation.valid) {
      throw new Error(`Invalid asset entry: ${validation.errors?.join(", ")}`);
    }
    this.assets.set(entry.id, entry);
  }
}

// Singleton instance
export const assetRegistry = new AssetRegistry();
