// SPDX-License-Identifier: Apache-2.0
//
// L-001 regression cover: sibling directories must not be seeded on top of one another.
//
// Before the angular budget, a directory's seed position was a pure function of its PARENT's
// position, an alternation sign, and the spine angle — with no per-sibling term at all. Every
// sibling therefore computed byte-identical coordinates. Replayed against the self-graph
// fixture that produced 35 directories in 4 coincident piles (20 under src.control-plane, 11
// under src.graph, 2 each under docs.graph and docs.theme).
//
// The physics could never recover: for two coincident nodes dx = dy = 0, so the repulsion
// force is (0/dist, 0/dist) × magnitude = exactly zero. A perfect stack is a stable fixed
// point. So the seed has to be right — separation cannot be delegated to the simulation.
//
// BOTH seeders are covered. parallel-spines had the same missing per-sibling term AND a second
// defect on top of it: it fanned branches and orbited files in the x/z plane, while Sigma renders
// only (x, y). That fan was projected away in its entirety, so even a correct azimuthal spread
// would still have rendered as a pile. Testing only the default dialect would have missed it.
import { test, expect } from "@playwright/test";

interface SeedPos {
  x: number;
  y: number;
}

const DIALECTS = [
  { id: "gwells.dialect.radial-backbone", name: "radial-backbone", isDefault: true },
  { id: "gwells.dialect.parallel-spines", name: "parallel-spines", isDefault: false },
] as const;

async function readSeedPositions(
  page: import("@playwright/test").Page,
  dialect: (typeof DIALECTS)[number],
) {
  await page.goto("/");
  await page.waitForSelector("canvas");
  await page.waitForFunction(
    () => {
      const sigma = (window as any).__lwSigma;
      return !!sigma && sigma.getGraph().hasAttribute("__gwellsSeedPositions");
    },
    { timeout: 15_000 },
  );

  if (!dialect.isDefault) {
    await page.selectOption('[data-testid="dialect-select"]', dialect.id);
    // Wait for the reseed to actually land, rather than a fixed sleep: the probe reports the
    // dialect the engine is currently running, so poll until it flips.
    await page.waitForFunction(
      (id) => (window as any).__lwGetGwellsState?.()?.dialectId === id,
      dialect.id,
      { timeout: 10_000 },
    );
  }

  return page.evaluate(() => {
    const graph = (window as any).__lwSigma.getGraph();
    // NOTE: __gwellsSeedPositions is a Map, not a plain object (engine.ts:296 casts it as
    // Map<string, {x,y,z}>). Object.keys() on it silently returns [] — flatten it here, inside
    // the page, since a Map cannot cross the page.evaluate boundary anyway.
    const raw = graph.getAttribute("__gwellsSeedPositions") as Map<string, SeedPos>;
    const seeds: Record<string, SeedPos> = {};
    const types: Record<string, string> = {};
    raw.forEach((pos, id) => {
      seeds[id] = { x: pos.x, y: pos.y };
      const a = graph.getNodeAttributes(id);
      types[id] = a.nodeType || a.raw?.type || "unknown";
    });
    return { seeds, types };
  });
}

/** Group node ids by rounded coordinate. Anything with >1 member is a pile. */
function findPiles(seeds: Record<string, SeedPos>, precision = 1) {
  const buckets = new Map<string, string[]>();
  for (const [id, p] of Object.entries(seeds)) {
    if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) continue;
    const key = `${p.x.toFixed(precision)},${p.y.toFixed(precision)}`;
    const arr = buckets.get(key) ?? [];
    arr.push(id);
    buckets.set(key, arr);
  }
  return [...buckets.entries()]
    .filter(([, ids]) => ids.length > 1)
    .map(([coord, ids]) => ({ coord, ids }))
    .sort((a, b) => b.ids.length - a.ids.length);
}

for (const dialect of DIALECTS) {
  test.describe(dialect.name, () => {
    test("no two nodes are seeded at the same coordinates", async ({ page }) => {
      const { seeds } = await readSeedPositions(page, dialect);

      // Sanity: we actually got a seeded graph, not an empty one.
      expect(Object.keys(seeds).length).toBeGreaterThan(50);

      const piles = findPiles(seeds);
      const detail = piles
        .slice(0, 5)
        .map((p) => `  ${p.ids.length} nodes at (${p.coord}): ${p.ids.slice(0, 4).join(", ")}…`)
        .join("\n");

      expect(piles, `Coincident seed positions found:\n${detail}`).toHaveLength(0);
    });

    test("sibling directories fan out instead of collapsing to one point", async ({ page }) => {
      const { seeds, types } = await readSeedPositions(page, dialect);

      const dirIds = Object.keys(seeds).filter((id) => types[id] === "directory");
      expect(dirIds.length).toBeGreaterThan(10); // the self-graph has ~40+

      const dirSeeds = Object.fromEntries(dirIds.map((id) => [id, seeds[id]]));
      const piles = findPiles(dirSeeds);

      expect(piles, `Directory piles: ${JSON.stringify(piles.slice(0, 3))}`).toHaveLength(0);
    });

    test("no node pair is closer than a minimum separation", async ({ page }) => {
      const { seeds } = await readSeedPositions(page, dialect);

      // Weaker than "not identical": catches near-coincidence, where repulsion is technically
      // non-zero but so small the nodes are visually one blob.
      const MIN_SEPARATION = 8;
      const entries = Object.entries(seeds).filter(
        ([, p]) => Number.isFinite(p.x) && Number.isFinite(p.y),
      );

      // Guard against a vacuous pass: with no seeds, the loop below never runs and `worst.d` stays
      // Infinity, which would sail past the assertion while testing nothing.
      expect(entries.length).toBeGreaterThan(50);

      let worst = { a: "", b: "", d: Infinity };
      for (let i = 0; i < entries.length; i++) {
        for (let j = i + 1; j < entries.length; j++) {
          const [ida, pa] = entries[i];
          const [idb, pb] = entries[j];
          const d = Math.hypot(pa.x - pb.x, pa.y - pb.y);
          if (d < worst.d) worst = { a: ida, b: idb, d };
        }
      }

      expect(
        worst.d,
        `Closest pair: ${worst.a} ↔ ${worst.b} at ${worst.d.toFixed(2)} units`,
      ).toBeGreaterThanOrEqual(MIN_SEPARATION);
    });
  });
}
