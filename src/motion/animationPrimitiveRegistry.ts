// SPDX-License-Identifier: Apache-2.0
/**
 * Animation Primitive Registry
 *
 * Reusable named easing curves and animation primitives (v92/v93+).
 * v86e: contract stub. Empty registry; v92/v93 implements.
 *
 * Contract: docs/motion/contracts/ANIMATION_PRIMITIVE_REGISTRY_CONTRACT.md
 */

export type AnimationPrimitiveKind = "easing" | "spring" | "keyframe";

export interface AnimationPrimitive {
  id: string;
  label: string;
  kind: AnimationPrimitiveKind;
  config: Record<string, unknown>;
}

export interface AnimationPrimitiveFilterQuery {
  kind?: AnimationPrimitiveKind;
}

export interface AnimationPrimitiveRegistryContract {
  list: () => AnimationPrimitive[];
  getById: (id: string) => AnimationPrimitive | undefined;
  filterByCategory: (query: AnimationPrimitiveFilterQuery) => AnimationPrimitive[];
  validateShape: (entry: unknown) => entry is AnimationPrimitive;
  register: (entry: AnimationPrimitive) => void;
  subscribe: (listener: () => void) => () => void;
}

const entries: AnimationPrimitive[] = [];
const listeners: Set<() => void> = new Set();

export const animationPrimitiveRegistry: AnimationPrimitiveRegistryContract = {
  list: () => [...entries],
  getById: (id) => entries.find((e) => e.id === id),
  filterByCategory: ({ kind }) =>
    kind !== undefined ? entries.filter((e) => e.kind === kind) : [...entries],
  validateShape: (entry): entry is AnimationPrimitive => {
    if (typeof entry !== "object" || entry === null) return false;
    const e = entry as any;
    return (
      typeof e.id === "string" &&
      typeof e.label === "string" &&
      (e.kind === "easing" || e.kind === "spring" || e.kind === "keyframe") &&
      typeof e.config === "object" && e.config !== null
    );
  },
  register: (entry) => {
    entries.push(entry);
    listeners.forEach((l) => l());
  },
  subscribe: (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

if (
  typeof window !== "undefined" &&
  (import.meta.env.DEV || (window as any).PLAYWRIGHT)
) {
  (window as any).__lwAnimationPrimitiveRegistry = animationPrimitiveRegistry;
}
