/**
 * Thin wrapper around @tauri-apps/api/core invoke.
 * A dev/test mock shim (__lwTauriMock) is injected in v108.0.2.
 * Production code path: delegates directly to the Tauri runtime.
 * In browser/Playwright (no Tauri runtime): the dynamic import throws,
 * which propagates as a rejected Promise — callers handle via try/catch.
 */
export async function invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  const { invoke: tauriInvoke } = await import("@tauri-apps/api/core");
  return tauriInvoke<T>(cmd, args);
}
