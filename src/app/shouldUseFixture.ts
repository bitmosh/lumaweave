// SPDX-License-Identifier: Apache-2.0

export interface FixtureGateInput {
  /** Playwright build (__PLAYWRIGHT__). Forces the fixture for stable geometry. */
  isTestEnv: boolean;
  /** The current summary carries renderable nodes. */
  hasRealNodes: boolean;
  /** The load failed. */
  isErrorState: boolean;
}

/**
 * Decides whether the canvas renders the built-in self-graph fixture instead of the loaded
 * source.
 *
 * The fixture is the FIRST-RUN demo graph, not a fallback for failure. The previous rule was
 * `isTestEnv || !hasRealSource`, and hasRealSource was false whenever an error was present —
 * so a failed load silently filled the canvas with LumaWeave's own self-graph. The user typed
 * a bad path, the tile said "Load failed", and a graph they had never seen appeared beside it.
 * It also made AppShell's "Failed to load graph data" placeholder dead code, because the
 * fixture always supplied nodes so the empty branch could never render.
 *
 * Extracted as a pure function because the branch that changed is unreachable from the E2E
 * suite: isTestEnv is true under Playwright, which forces the fixture unconditionally. The
 * truth table is covered in tests/e2e/fixture-gate.spec.ts instead.
 */
export function shouldUseFixture({
  isTestEnv,
  hasRealNodes,
  isErrorState,
}: FixtureGateInput): boolean {
  if (isTestEnv) return true;
  if (isErrorState) return false;
  return !hasRealNodes;
}
