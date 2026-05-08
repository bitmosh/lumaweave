/**
 * Inspector Spoke Registry
 * 
 * Registry for inspector radial spokes (Geometry, Type, Motion, Layout, etc.).
 * v86a: Empty registry, contract only. v86d/v89 will add spokes.
 */

import type { RegistryContract } from "./registryContract.types";

export interface InspectorSpoke {
  id: string;
  name: string;
  description?: string;
  category: string; // "geometry", "type", "motion", "layout", etc.
  enabled: boolean;
  order: number;
}

class InspectorSpokeRegistry implements RegistryContract<InspectorSpoke, { category?: string }> {
  private spokes: Map<string, InspectorSpoke> = new Map();

  list(): InspectorSpoke[] {
    return Array.from(this.spokes.values()).sort((a, b) => a.order - b.order);
  }

  getById(id: string): InspectorSpoke | undefined {
    return this.spokes.get(id);
  }

  filterByCategory(query: { category?: string }): InspectorSpoke[] {
    if (query.category) {
      return this.list().filter((spoke) => spoke.category === query.category);
    }
    return this.list();
  }

  validateShape(entry: unknown): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (typeof entry !== "object" || entry === null) {
      return { valid: false, errors: ["Entry must be an object"] };
    }

    const e = entry as Record<string, unknown>;

    if (typeof e.id !== "string") errors.push("id must be a string");
    if (typeof e.name !== "string") errors.push("name must be a string");
    if (typeof e.category !== "string") errors.push("category must be a string");
    if (typeof e.enabled !== "boolean") errors.push("enabled must be a boolean");
    if (typeof e.order !== "number") errors.push("order must be a number");

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  register(entry: InspectorSpoke): void {
    const validation = this.validateShape(entry);
    if (!validation.valid) {
      throw new Error(`Invalid inspector spoke entry: ${validation.errors?.join(", ")}`);
    }
    this.spokes.set(entry.id, entry);
  }
}

// Singleton instance
export const inspectorSpokeRegistry = new InspectorSpokeRegistry();
