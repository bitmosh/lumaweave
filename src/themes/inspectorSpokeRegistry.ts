// SPDX-License-Identifier: Apache-2.0
/**
 * Inspector Spoke Registry
 *
 * Registry for inspector radial spokes (Geometry, Type, Motion, Layout, etc.).
 * v86a: Foundation. v86d adds Color, Apply, IDE, History; v89 adds remaining spokes.
 *
 * Hybrid shape (v86a fields + v86d packet requirements).
 */

import type { ComponentType } from "react";
import type { RegistryContract } from "./registryContract.types";
import type { TargetDescriptor } from "../control-plane/inspector/inspector.types";

export interface InspectorSpoke {
  id: string;
  name: string;
  category: string;
  enabled: boolean;
  order: number;

  label?: string;
  color?: string;
  tabComponent?: ComponentType<{ targetDescriptor: TargetDescriptor; onClose?: () => void }>;

  // v89.4: placeholder support
  status?: "active" | "placeholder" | "beta"; // defaults to "active" if omitted
  intendedTokenPaths?: readonly string[]; // declared target paths for placeholder spokes
  placeholderMessage?: string; // shown in PlaceholderTab when status is "placeholder"

  // radial icon (bb-design)
  iconPath?: string; // SVG path data for the spoke icon
  iconFill?: boolean; // true = fill="currentColor", false/omitted = stroke only
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
