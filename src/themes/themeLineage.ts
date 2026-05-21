/**
 * Theme Lineage
 *
 * Append-only lineage history for theme derivation chains.
 * Built-in themes have empty lineage (they're origin themes).
 * v88a runtime layer.
 */

import type { ThemeLineage } from "./theme.types";

const lineages = new Map<string, ThemeLineage[]>();
const listeners = new Set<() => void>();

export function appendLineage(themeId: string, entry: ThemeLineage): void {
  const current = lineages.get(themeId) ?? [];
  current.push(entry);
  lineages.set(themeId, current);
  listeners.forEach((l) => l());
}

export function getLineage(themeId: string): ThemeLineage[] {
  return [...(lineages.get(themeId) ?? [])];
}

export function clearLineage(themeId: string): void {
  lineages.delete(themeId);
  listeners.forEach((l) => l());
}

export function subscribeLineage(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

if (
  typeof window !== "undefined" &&
  (import.meta.env.DEV || (window as any).PLAYWRIGHT)
) {
  (window as any).__lwThemeLineage = { appendLineage, getLineage, clearLineage };
}
