/**
 * Inspector Spoke Registry
 *
 * Registry for inspector radial spokes (Geometry, Type, Motion, Layout, etc.).
 * v86a: Foundation. v86d adds Color, Apply, IDE, History; v89 adds remaining spokes.
 *
 * Hybrid shape (v86a fields + v86d packet requirements).
 */

import type { ReactNode, ComponentType } from "react";
import type { RegistryContract } from "./registryContract.types";
import type { TargetDescriptor } from "../control-plane/inspector/inspector.types";

export interface InspectorSpoke {
  // v86a fields
  id: string;
  name: string;
  description?: string;
  category: string; // "geometry", "type", "motion", "layout", etc.
  enabled: boolean;
  order: number;

  // v86d packet fields
  label?: string; // display label for radial; falls back to name
  icon?: string; // optional icon/unicode
  color?: string; // spoke node color; defaults to theme token
  parentSpokeId?: string; // null for root spokes; non-null for child spokes
  action?: () => void; // for terminal spokes (e.g., "Open in IDE")
  tabContent?: () => ReactNode; // for spokes that open a tab
  tabComponent?: ComponentType<{ targetDescriptor: TargetDescriptor; onClose?: () => void }>; // v86d.3a+: tab component with props

  // v89.4: placeholder support
  status?: "active" | "placeholder"; // defaults to "active" if omitted
  intendedTokenPaths?: readonly string[]; // declared target paths for placeholder spokes
  placeholderMessage?: string; // shown in PlaceholderTab when status is "placeholder"
}

class InspectorSpokeRegistry implements RegistryContract<InspectorSpoke, { category?: string }> {
  private spokes: Map<string, InspectorSpoke> = new Map();
  private subscribers: Set<(entries: InspectorSpoke[]) => void> = new Set();

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
    this.notifySubscribers();
  }

  subscribe(listener: (entries: InspectorSpoke[]) => void): () => void {
    this.subscribers.add(listener);
    return () => {
      this.subscribers.delete(listener);
    };
  }

  private notifySubscribers(): void {
    const entries = this.list();
    this.subscribers.forEach((listener) => listener(entries));
  }
}

// Singleton instance
export const inspectorSpokeRegistry = new InspectorSpokeRegistry();
