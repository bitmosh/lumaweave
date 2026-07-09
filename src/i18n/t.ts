// SPDX-License-Identifier: Apache-2.0
import type { TranslationManifest } from "./types";

let _manifest: TranslationManifest = {};

export function setManifest(manifest: TranslationManifest): void {
  _manifest = manifest;
}

export function t(key: string, vars?: Record<string, string | number>): string {
  const parts = key.split(".");
  let node: unknown = _manifest;
  for (const part of parts) {
    if (typeof node !== "object" || node === null) return key;
    node = (node as Record<string, unknown>)[part];
  }
  if (typeof node !== "string") return key;
  if (!vars) return node;
  return node.replace(/\{(\w+)\}/g, (_, name) =>
    vars[name] !== undefined ? String(vars[name]) : `{${name}}`
  );
}
