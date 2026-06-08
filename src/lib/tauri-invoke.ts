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
