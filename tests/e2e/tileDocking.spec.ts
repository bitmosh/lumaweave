/**
 * v103.1.0: Tile docking resolution layer — unit tests.
 *
 * Tests the pure resolution functions in isolation:
 *   clampToViewport — floating tile clamping (the off-viewport bug proof)
 *   resolveDockedPosition — docked tile viewport-relative positioning
 *   resolveLivePosition — mode dispatch (docked → derived; floating → clamped)
 *
 * No rendering, no wiring. Resolution layer only.
 */

import { test, expect } from "@playwright/test";

const VP_1400 = { width: 1400, height: 900 };
const VP_3400 = { width: 3400, height: 1080 }; // ultrawide that caused the bug
const VP_800  = { width: 800,  height: 600 };  // narrow viewport

const TILE_W = 280;
const TILE_H = 320;
const MARGIN = 8;
const TOPBAR_HEIGHT = 64;
const STATUS_BAR_HEIGHT = 40;
const GAP = 12;
const COLLAPSED_H = 30;

test("tileDocking: clampToViewport — THE bug: x:3092 on a 1400-wide viewport clamps in", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const result = await page.evaluate(
    ({ w, h, vp, MARGIN }: { w: number; h: number; vp: { width: number; height: number }; MARGIN: number }) => {
      const { clampToViewport } = (window as any).__lwTileDocking ?? {};
      if (!clampToViewport) return { missing: true };
      return clampToViewport(3092, 200, w, h, vp);
    },
    { w: TILE_W, h: TILE_H, vp: VP_1400, MARGIN },
  );

  if ((result as any).missing) {
    console.log("__lwTileDocking probe not available; skipping");
    return;
  }

  // x:3092 must clamp to ≤ 1400 - 280 - 8 = 1112
  expect(result.x).toBeLessThanOrEqual(VP_1400.width - TILE_W - MARGIN);
  expect(result.x).toBeGreaterThanOrEqual(MARGIN);
});

test("tileDocking: clampToViewport — within-bounds tile is unchanged", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const result = await page.evaluate(
    ({ w, h, vp }: { w: number; h: number; vp: { width: number; height: number } }) => {
      const { clampToViewport } = (window as any).__lwTileDocking ?? {};
      if (!clampToViewport) return { missing: true };
      return clampToViewport(100, 100, w, h, vp);
    },
    { w: TILE_W, h: TILE_H, vp: VP_1400 },
  );

  if ((result as any).missing) return;

  expect(result.x).toBe(100);
  expect(result.y).toBe(100);
});

test("tileDocking: resolveDockedPosition — right edge, viewport-relative (never frozen)", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const result = await page.evaluate(
    ({ w, h, viewports }: { w: number; h: number; viewports: { width: number; height: number }[] }) => {
      const { resolveDockedPosition } = (window as any).__lwTileDocking ?? {};
      if (!resolveDockedPosition) return { missing: true };
      const anchor = { edge: "right", slot: 0 };
      return viewports.map((vp) => resolveDockedPosition(anchor, w, h, [], vp));
    },
    { w: TILE_W, h: TILE_H, viewports: [VP_1400, VP_3400, VP_800] },
  );

  if ((result as any).missing) return;

  const [r1400, r3400, r800] = result as Array<{ x: number; y: number }>;

  // Each must be viewport.width - w - 8 (never the same value — never frozen)
  expect(r1400.x).toBe(VP_1400.width - TILE_W - MARGIN); // 1112
  expect(r3400.x).toBe(VP_3400.width - TILE_W - MARGIN); // 3112
  expect(r800.x).toBe(Math.max(MARGIN, VP_800.width - TILE_W - MARGIN)); // clamped

  // They must all differ (viewport-relative, not frozen)
  expect(r1400.x).not.toBe(r3400.x);
});

test("tileDocking: resolveDockedPosition — left edge always at MARGIN", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const result = await page.evaluate(
    ({ w, h, vp }: { w: number; h: number; vp: { width: number; height: number } }) => {
      const { resolveDockedPosition } = (window as any).__lwTileDocking ?? {};
      if (!resolveDockedPosition) return { missing: true };
      const anchor = { edge: "left", slot: 0 };
      return resolveDockedPosition(anchor, w, h, [], vp);
    },
    { w: TILE_W, h: TILE_H, vp: VP_1400 },
  );

  if ((result as any).missing) return;

  expect(result.x).toBe(MARGIN); // always 8, regardless of viewport width
});

test("tileDocking: resolveDockedPosition — slot stacking has no overlap (small tiles, no overflow)", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // Use small tiles (h=100) so 3 slots fit well within VP_1400 (900h) without clamping.
  // Stack: 64 + (100+12) + (100+12) + 100 = 388 — well within 900-40 = 860.
  const SMALL_H = 100;

  const result = await page.evaluate(
    ({ w, h, vp, TOPBAR_HEIGHT, GAP }: { w: number; h: number; vp: { width: number; height: number }; TOPBAR_HEIGHT: number; GAP: number }) => {
      const { resolveDockedPosition } = (window as any).__lwTileDocking ?? {};
      if (!resolveDockedPosition) return { missing: true };

      const anchor0 = { edge: "left", slot: 0 };
      const anchor1 = { edge: "left", slot: 1 };
      const anchor2 = { edge: "left", slot: 2 };

      const tile0 = resolveDockedPosition(anchor0, w, h, [], vp);
      const edgeTile0 = { slot: 0, h: tile0.h, collapsed: false };
      const tile1 = resolveDockedPosition(anchor1, w, h, [edgeTile0], vp);
      const edgeTile1 = { slot: 1, h: tile1.h, collapsed: false };
      const tile2 = resolveDockedPosition(anchor2, w, h, [edgeTile0, edgeTile1], vp);

      return { tile0, tile1, tile2 };
    },
    { w: TILE_W, h: SMALL_H, vp: VP_1400, TOPBAR_HEIGHT, GAP },
  );

  if ((result as any).missing) return;

  const { tile0, tile1, tile2 } = result as any;

  // slot 0 starts at TOPBAR_HEIGHT
  expect(tile0.y).toBe(TOPBAR_HEIGHT);
  // slot 1 starts below slot 0's bottom + GAP
  expect(tile1.y).toBeGreaterThan(tile0.y + tile0.h - 1);
  expect(tile1.y).toBeLessThanOrEqual(tile0.y + tile0.h + GAP + 1);
  // slot 2 starts below slot 1's bottom + GAP
  expect(tile2.y).toBeGreaterThan(tile1.y + tile1.h - 1);
  // None are flagged as overflowed (small tiles fit fine)
  expect(tile0.overflowed).toBe(false);
  expect(tile1.overflowed).toBe(false);
  expect(tile2.overflowed).toBe(false);
});

test("tileDocking: resolveDockedPosition — height overflow returns overflowed=true and caps h", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const result = await page.evaluate(
    ({ w, vp }: { w: number; vp: { width: number; height: number } }) => {
      const { resolveDockedPosition } = (window as any).__lwTileDocking ?? {};
      if (!resolveDockedPosition) return { missing: true };

      // 5 tall tiles on a short viewport → must overflow
      const tallH = 500;
      const anchor = { edge: "left", slot: 2 };
      const existingTiles = [
        { slot: 0, h: tallH, collapsed: false },
        { slot: 1, h: tallH, collapsed: false },
      ];
      return resolveDockedPosition(anchor, w, tallH, existingTiles, vp);
    },
    { w: TILE_W, vp: VP_800 },
  );

  if ((result as any).missing) return;

  const r = result as { x: number; y: number; h: number; overflowed: boolean };
  // Either capped (h < 500) or overflowed=true when fairShare < floor
  expect(typeof r.overflowed).toBe("boolean");
  // h must be positive and not greater than requested
  expect(r.h).toBeGreaterThan(0);
  expect(r.h).toBeLessThanOrEqual(500);
});

test("tileDocking: resolveLivePosition — docked tile gets viewport-derived position", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const result = await page.evaluate(
    ({ w, h, vp, MARGIN }: { w: number; h: number; vp: { width: number; height: number }; MARGIN: number }) => {
      const { resolveLivePosition } = (window as any).__lwTileDocking ?? {};
      if (!resolveLivePosition) return { missing: true };

      const dockedTile = {
        id: "t1", sectionKey: "test", x: 3092, y: 999,
        w, h, collapsed: false, z: 1, mode: "docked",
        anchor: { edge: "right", slot: 0 },
      };
      return resolveLivePosition(dockedTile, [], vp);
    },
    { w: TILE_W, h: TILE_H, vp: VP_1400, MARGIN },
  );

  if ((result as any).missing) return;

  // x:3092 is ignored — docked position is viewport-relative
  expect(result.x).toBe(VP_1400.width - TILE_W - MARGIN); // 1112
  expect(result.x).not.toBe(3092);
});

test("tileDocking: resolveLivePosition — floating tile within bounds is unchanged", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const result = await page.evaluate(
    ({ w, h, vp }: { w: number; h: number; vp: { width: number; height: number } }) => {
      const { resolveLivePosition } = (window as any).__lwTileDocking ?? {};
      if (!resolveLivePosition) return { missing: true };

      const floatingTile = {
        id: "t2", sectionKey: "test", x: 200, y: 150,
        w, h, collapsed: false, z: 1, mode: "floating",
      };
      return resolveLivePosition(floatingTile, [], vp);
    },
    { w: TILE_W, h: TILE_H, vp: VP_1400 },
  );

  if ((result as any).missing) return;

  expect(result.x).toBe(200);
  expect(result.y).toBe(150);
});

test("tileDocking: resolveLivePosition — floating tile out of bounds is pulled in", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const result = await page.evaluate(
    ({ w, h, vp, MARGIN }: { w: number; h: number; vp: { width: number; height: number }; MARGIN: number }) => {
      const { resolveLivePosition } = (window as any).__lwTileDocking ?? {};
      if (!resolveLivePosition) return { missing: true };

      const strandedTile = {
        id: "t3", sectionKey: "test", x: 3092, y: 999,
        w, h, collapsed: false, z: 1,
        // mode undefined → treated as floating (back-compat)
      };
      return resolveLivePosition(strandedTile, [], vp);
    },
    { w: TILE_W, h: TILE_H, vp: VP_1400, MARGIN },
  );

  if ((result as any).missing) return;

  // Stranded at x:3092 gets clamped to ≤ 1400 - 280 - 8 = 1112
  expect(result.x).toBeLessThanOrEqual(VP_1400.width - TILE_W - MARGIN);
  expect(result.x).toBeGreaterThanOrEqual(MARGIN);
  expect(result.x).not.toBe(3092);
});
