// SPDX-License-Identifier: Apache-2.0
import type { ThemeId } from "../control-plane/settings/settings.schema";
import { themeSelectableColors, type ColorSlot } from "./themeSelectableColors";
import { computeContrastRatio } from "./wcagContrast";

export type ColorUseCategory =
  | "node-primary"
  | "node-secondary"
  | "node-tertiary"
  | "panel-accent"
  | "panel-tint"
  | "edge-flow"
  | "edge-secondary"
  | "asset-tag"
  | "user-custom"
  | "state-success"
  | "state-warning"
  | "state-danger"
  | "state-info";

export interface PickContext {
  contextKey: string;
  themeId: ThemeId;
  neighbors?: string[];
  contrastPartner?: string;
  contrastMinRatio?: number;
  userPick?: string;
}

interface EngineState {
  rotationByCategory: Map<ColorUseCategory, number>;
  memoizedPicks: Map<string, { color: string; themeId: ThemeId }>;
  currentThemeId: ThemeId | null;
}

const state: EngineState = {
  rotationByCategory: new Map(),
  memoizedPicks: new Map(),
  currentThemeId: null,
};

const listeners = new Set<() => void>();

function notifyListeners(): void {
  listeners.forEach((l) => l());
}

function eligibleSlots(category: ColorUseCategory, allSlots: ColorSlot[]): ColorSlot[] {
  switch (category) {
    case "node-primary":
    case "edge-flow":
    case "user-custom":
      return allSlots.filter((s) => s.role === "primary" || s.role === "accent");
    case "node-secondary":
    case "edge-secondary":
      return allSlots.filter((s) => s.role === "secondary" || s.role === "accent");
    case "node-tertiary":
    case "panel-tint":
      return allSlots.filter((s) => s.lightness > 60);
    case "panel-accent":
      return allSlots.filter((s) => s.role === "primary" || s.role === "accent");
    case "asset-tag":
      return allSlots;
    case "state-success":
    case "state-warning":
    case "state-danger":
    case "state-info":
      // Semantic locks bypass this filter — handled in getSemanticSlot
      return [];
    default:
      return allSlots;
  }
}

function isSemanticCategory(category: ColorUseCategory): boolean {
  return category.startsWith("state-");
}

function getSemanticSlot(category: ColorUseCategory, themeId: ThemeId): ColorSlot | null {
  const set = themeSelectableColors[themeId];
  if (!set) return null;
  const roleKey = category.replace("state-", "") as keyof typeof set.semantics;
  const slotId = set.semantics[roleKey];
  return set.slots.find((s) => s.id === slotId) ?? null;
}

export function pick(category: ColorUseCategory, context: PickContext): string {
  // Step 1: User override always wins
  if (context.userPick) {
    return context.userPick;
  }

  // Detect theme change → reset
  if (state.currentThemeId !== null && state.currentThemeId !== context.themeId) {
    reset();
  }
  state.currentThemeId = context.themeId;

  // Step 2: Check memoization (only if theme matches)
  const memoized = state.memoizedPicks.get(context.contextKey);
  if (memoized && memoized.themeId === context.themeId) {
    return memoized.color;
  }

  // Step 3: Semantic locks
  if (isSemanticCategory(category)) {
    const slot = getSemanticSlot(category, context.themeId);
    if (slot) {
      state.memoizedPicks.set(context.contextKey, { color: slot.hex, themeId: context.themeId });
      return slot.hex;
    }
  }

  // Step 4-7: Filter + rotate
  const set = themeSelectableColors[context.themeId];
  if (!set) {
    return "#888888";
  }

  let candidates = eligibleSlots(category, set.slots);

  // Step 5: Apply contrast filter
  if (context.contrastPartner) {
    const minRatio = context.contrastMinRatio ?? 3.0;
    const contrastFiltered = candidates.filter(
      (s) => computeContrastRatio(s.hex, context.contrastPartner!) >= minRatio
    );
    if (contrastFiltered.length > 0) {
      candidates = contrastFiltered;
    }
  }

  // Step 6: Apply neighbor filter
  if (context.neighbors && context.neighbors.length > 0) {
    const neighborSet = new Set(context.neighbors.map((c) => c.toLowerCase()));
    const neighborFiltered = candidates.filter((s) => !neighborSet.has(s.hex.toLowerCase()));
    if (neighborFiltered.length > 0) {
      candidates = neighborFiltered;
    }
  }

  if (candidates.length === 0) {
    // Fallback: first eligible slot ignoring all filters
    const fallback = eligibleSlots(category, set.slots)[0] ?? set.slots[0];
    state.memoizedPicks.set(context.contextKey, { color: fallback.hex, themeId: context.themeId });
    return fallback.hex;
  }

  // Step 7: Pick from rotation — walk rotationOrder starting at currentIdx
  let currentIdx = state.rotationByCategory.get(category) ?? 0;
  let chosenSlot: ColorSlot | null = null;

  for (let attempt = 0; attempt < set.rotationOrder.length; attempt++) {
    const idx = (currentIdx + attempt) % set.rotationOrder.length;
    const slotId = set.rotationOrder[idx];
    const slot = candidates.find((c) => c.id === slotId);
    if (slot) {
      chosenSlot = slot;
      currentIdx = (idx + 1) % set.rotationOrder.length;
      break;
    }
  }

  if (!chosenSlot) {
    chosenSlot = candidates[0];
    currentIdx = (currentIdx + 1) % set.rotationOrder.length;
  }

  // Step 8: Record pick and advance rotation
  state.rotationByCategory.set(category, currentIdx);
  state.memoizedPicks.set(context.contextKey, { color: chosenSlot.hex, themeId: context.themeId });
  notifyListeners();

  return chosenSlot.hex;
}

export function release(contextKey: string): void {
  state.memoizedPicks.delete(contextKey);
  notifyListeners();
}

export function getRotationState(): Record<string, number> {
  return Object.fromEntries(state.rotationByCategory);
}

export function reset(): void {
  state.rotationByCategory.clear();
  state.memoizedPicks.clear();
  state.currentThemeId = null;
  notifyListeners();
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const colorSuggestionEngine = {
  pick,
  release,
  getRotationState,
  reset,
  subscribe,
};

// Dev probe
if (typeof window !== "undefined" && (import.meta.env.DEV || (window as any).PLAYWRIGHT)) {
  (window as any).__lwColorSuggestionEngine = colorSuggestionEngine;
}
