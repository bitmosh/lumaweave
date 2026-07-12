// SPDX-License-Identifier: Apache-2.0

export interface FixtureGateInput {
  /** Playwright build (__PLAYWRIGHT__). Forces the fixture for stable geometry. */
  isTestEnv: boolean;
  /**
   * The environment is capable of loading a source at all.
   *
   * Every adapter reads files through the Tauri `invoke` bridge. In a plain browser
   * (`npm run dev`, no Tauri shell) that bridge does not exist, so EVERY source read throws
   * and the summary is permanently in an error state. In that environment "error" is not an
   * exceptional condition — it is the only condition — so it must not suppress the demo graph.
   */
  canLoadSources: boolean;
  /** The current summary carries renderable nodes. */
  hasRealNodes: boolean;
  /** The load failed. */
  isErrorState: boolean;
}

/**
 * Decides whether the canvas renders the built-in self-graph fixture instead of the loaded
 * source.
 *
 * The fixture is the demo graph — shown when there is no real graph to show. It is NOT a
 * fallback that papers over failure.
 *
 * History, because this has now been wrong in both directions:
 *
 * 1. Originally `isTestEnv || !hasRealSource`, where hasRealSource went false on error. So a
 *    failed load silently filled the canvas with LumaWeave's own self-graph: you typed a bad
 *    path, the tile said "Load failed", and a graph you had never seen appeared next to it.
 *    AppShell's "Failed to load graph data" placeholder was unreachable dead code.
 *
 * 2. The fix for (1) suppressed the fixture on ANY error — which broke `npm run dev` in a
 *    browser entirely. With no Tauri bridge, every source read throws, so the app sat
 *    permanently on "Failed to load graph data" with a blank canvas. The E2E suite could not
 *    catch it, because `isTestEnv` forces the fixture and short-circuits the whole question.
 *
 * Hence `canLoadSources`: distinguish "this particular source failed" (show the error) from
 * "this environment cannot load sources at all" (show the demo).
 */
export function shouldUseFixture({
  isTestEnv,
  canLoadSources,
  hasRealNodes,
  isErrorState,
}: FixtureGateInput): boolean {
  // Tests always use the fixture — stable geometry. The entire E2E suite depends on this.
  if (isTestEnv) return true;

  // Browser dev with no Tauri bridge: nothing can ever load, so the error state carries no
  // information. Show the demo graph rather than a permanent error screen.
  if (!canLoadSources) return true;

  // A genuine failure in an environment that CAN load: say so. Don't fabricate a graph.
  if (isErrorState) return false;

  // Otherwise: fixture only until a real source has nodes to show.
  return !hasRealNodes;
}
