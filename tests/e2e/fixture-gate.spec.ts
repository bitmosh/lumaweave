// SPDX-License-Identifier: Apache-2.0
//
// The canvas used to render LumaWeave's own self-graph when a load FAILED: the fixture gate
// was `isTestEnv || !hasRealSource`, and hasRealSource went false on error. You typed a bad
// path, the tile said "Load failed", and a graph you had never seen filled the canvas beside
// it — while AppShell's real "Failed to load graph data" placeholder sat unreachable, because
// the fixture always supplied nodes.
//
// This branch is invisible to a browser test: isTestEnv is true under Playwright, which forces
// the fixture unconditionally. So the gate is a pure function and the truth table is asserted
// directly. (shouldUseFixture imports nothing — in particular nothing that reaches a CSS
// import — so it stays safe to load in Playwright's Node-side transform.)
import { test, expect } from "@playwright/test";
import { shouldUseFixture } from "../../src/app/shouldUseFixture";

test("test env always uses the fixture, for stable geometry", () => {
  // The whole E2E suite depends on this half. It must not move.
  expect(
    shouldUseFixture({ isTestEnv: true, canLoadSources: true, hasRealNodes: true, isErrorState: false }),
  ).toBe(true);
  expect(
    shouldUseFixture({ isTestEnv: true, canLoadSources: true, hasRealNodes: false, isErrorState: true }),
  ).toBe(true);
});

test("browser dev with no Tauri bridge still shows the demo graph", () => {
  // THE REGRESSION THIS FILE EXISTS FOR.
  //
  // Adapters read files via Tauri `invoke`. In a plain browser that bridge is absent, so every
  // source read throws and the summary sits permanently in `error`. Treating that as a real
  // failure blanked the canvas — `npm run dev` showed nothing but "Failed to load graph data".
  // In an environment that cannot load ANY source, the error carries no information.
  expect(
    shouldUseFixture({ isTestEnv: false, canLoadSources: false, hasRealNodes: false, isErrorState: true }),
  ).toBe(true);
});

test("a failed load in an environment that CAN load never renders the fixture", () => {
  // The original bug: a bad path used to fill the canvas with LumaWeave's own self-graph.
  // Errors must surface as errors — but only where an error means something.
  expect(
    shouldUseFixture({ isTestEnv: false, canLoadSources: true, hasRealNodes: false, isErrorState: true }),
  ).toBe(false);
  expect(
    shouldUseFixture({ isTestEnv: false, canLoadSources: true, hasRealNodes: true, isErrorState: true }),
  ).toBe(false);
});

test("first run — nothing loaded, no error — shows the fixture", () => {
  expect(
    shouldUseFixture({ isTestEnv: false, canLoadSources: true, hasRealNodes: false, isErrorState: false }),
  ).toBe(true);
});

test("a loaded source replaces the fixture", () => {
  expect(
    shouldUseFixture({ isTestEnv: false, canLoadSources: true, hasRealNodes: true, isErrorState: false }),
  ).toBe(false);
});
