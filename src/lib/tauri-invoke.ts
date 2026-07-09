// SPDX-License-Identifier: Apache-2.0
/**
 * Thin wrapper around @tauri-apps/api/core invoke.
 *
 * In dev/test environments, window.__lwTauriMock[cmd] is checked first so
 * E2E tests can inject mock responses without the Tauri runtime.
 * Production code path: delegates directly to the Tauri runtime.
 * In browser/Playwright (no Tauri runtime): the dynamic import throws,
 * which propagates as a rejected Promise — callers handle via try/catch.
 */
export async function invokeListFiles(
  root: string,
  extensions: string[],
  excludePrefixes: string[],
  maxDepth?: number,
): Promise<string[]> {
  return invoke<string[]>("list_files", { root, extensions, excludePrefixes, maxDepth });
}

export async function invokeReadUserFile(path: string): Promise<string> {
  return invoke<string>("read_user_file", { path });
}

export async function invokeReadVaultFile(
  root: string,
  relativePath: string,
): Promise<string> {
  return invoke<string>("read_vault_file", { root, relativePath });
}

// ---------------------------------------------------------------------------
// R-LW-005 — graph lifecycle event emission
// All functions are fire-and-forget: callers .catch(() => {}) silently.
// ---------------------------------------------------------------------------

export async function invokeEmitSourceLoaded(
  adapterId: string,
  sourceKey: string,
  nodeCount: number,
  edgeCount: number,
  causationId: string | null = null,
): Promise<void> {
  return invoke("lw_emit_source_loaded", { adapterId, sourceKey, nodeCount, edgeCount, causationId });
}

export async function invokeEmitSourceLoadFailed(
  adapterId: string,
  sourceKey: string,
  error: string,
): Promise<void> {
  return invoke("lw_emit_source_load_failed", { adapterId, sourceKey, error });
}

export async function invokeEmitSourceSwitched(
  fromAdapterId: string,
  toAdapterId: string,
): Promise<void> {
  return invoke("lw_emit_source_switched", { fromAdapterId, toAdapterId });
}

export async function invokeEmitThemeChanged(
  fromThemeId: string,
  toThemeId: string,
): Promise<void> {
  return invoke("lw_emit_theme_changed", { fromThemeId, toThemeId });
}

export async function invokeEmitGraphLayoutSettled(
  nodeCount: number,
  durationMs: number,
): Promise<void> {
  return invoke("lw_emit_graph_layout_settled", { nodeCount, durationMs });
}

export async function invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  if (
    (import.meta.env.DEV || (window as any).PLAYWRIGHT) &&
    typeof window !== "undefined" &&
    (window as any).__lwTauriMock?.[cmd]
  ) {
    return (window as any).__lwTauriMock[cmd](args) as T;
  }
  const { invoke: tauriInvoke } = await import("@tauri-apps/api/core");
  return tauriInvoke<T>(cmd, args);
}
