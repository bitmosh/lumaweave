// SPDX-License-Identifier: Apache-2.0
/**
 * Theme-as-Code defineTheme()
 *
 * Pure function (one side effect: lineage append if parent given).
 * Does NOT auto-register the returned preset — caller decides.
 * Async because computeThemeHash uses crypto.subtle.
 */

import type { ThemePreset, ThemeAsCodeDefinition } from "./theme.types";
import type { ThemeId } from "../control-plane/settings/settings.schema";
import { computeThemeHash } from "./themeHash";
import { appendLineage } from "./themeLineage";

export async function defineTheme(def: ThemeAsCodeDefinition): Promise<ThemePreset> {
  const hash = await computeThemeHash({
    primitives: def.primitives,
    semantics: def.semantics,
    components: def.components,
  });

  const lineage = def.lineage ? [...def.lineage] : [];

  if (lineage.length > 0) {
    const lastParent = lineage[lineage.length - 1];
    appendLineage(def.id, {
      parentId: lastParent.parentId,
      parentHash: lastParent.parentHash,
      timestamp: Date.now(),
      changeKind: "derive",
    });
  }

  return {
    id: def.id,
    name: def.label,
    builtIn: false,
    themeId: def.id as ThemeId,
    tags: [],
    notes: "Defined via defineTheme()",
    assetRefs: [],
    hash,
    parentHash: lineage.length > 0 ? lineage[lineage.length - 1].parentHash : undefined,
    lineage,
  };
}

if (
  typeof window !== "undefined" &&
  (import.meta.env.DEV || (window as any).PLAYWRIGHT)
) {
  (window as any).__lwDefineTheme = { defineTheme };
}
