// SPDX-License-Identifier: Apache-2.0
/**
 * Theme Hash
 *
 * Content-addressable SHA-256 hash for theme definitions.
 * Two themes with identical token values produce identical hashes.
 * v88a: async via crypto.subtle. v93+ may cache synchronously.
 */

function normalizeForHash(obj: unknown): string {
  if (obj === null || typeof obj !== "object") return JSON.stringify(obj);
  if (Array.isArray(obj)) return "[" + obj.map(normalizeForHash).join(",") + "]";
  const keys = Object.keys(obj as object).sort();
  return (
    "{" +
    keys
      .map((k) => JSON.stringify(k) + ":" + normalizeForHash((obj as Record<string, unknown>)[k]))
      .join(",") +
    "}"
  );
}

export async function computeThemeHash(content: {
  primitives?: unknown;
  semantics?: unknown;
  components?: unknown;
}): Promise<string> {
  const normalized = normalizeForHash(content);
  const data = new TextEncoder().encode(normalized);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

if (
  typeof window !== "undefined" &&
  (import.meta.env.DEV || (window as any).PLAYWRIGHT)
) {
  (window as any).__lwThemeHash = { computeThemeHash };
}
