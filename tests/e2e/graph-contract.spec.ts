// SPDX-License-Identifier: Apache-2.0
//
// GUARDS FOR THE GRAPH DISPLAY LEDGER (docs/ledger/GRAPH_DISPLAY.md).
//
// These are CHARACTERIZATION tests. They assert what is CURRENTLY TRUE, not what ought to be.
// Several of them therefore pin a known defect in place on purpose.
//
// A FAILURE HERE IS NOT A BROKEN TEST. It means a documented fact about the tree has changed.
// The correct response is:
//   1. find the GD-### entry named in the test,
//   2. append a `Closed:` (or `Withdrawn:`) line to it with today's date and the sha,
//   3. then update or delete the guard.
//
// Never relax a guard to match new behaviour without the accompanying ledger line. The whole
// point of these is that prose cannot police itself — a doc goes stale silently, a test does not.
//
// Rules: docs/ledger/README.md
import { test, expect } from "@playwright/test";
import { execSync } from "node:child_process";

async function loadGraph(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.waitForSelector("canvas");
  await page.waitForFunction(
    () => !!(window as any).__lwSigma?.getGraph().hasAttribute("__gwellsSeedPositions"),
    { timeout: 15_000 },
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GD-002 — the seam ratchet.
//
// `window.__lwSigma` is the de-facto renderer API: the minimap and AppShell reach through it
// instead of through the props interface, which is why "swap the renderer" currently also means
// "rewrite the minimap". This does not forbid the existing damage — it forbids MORE of it.
//
// Permits progress, forbids regression. Lower the number when you remove a consumer; never
// raise it without a ledger line explaining why.
// ─────────────────────────────────────────────────────────────────────────────
test.describe("renderer seam", () => {
  const MAX_EXTERNAL_LWSIGMA_FILES = 7; // GD-002, measured 2026-07-12

  test("seam ratchet: __lwSigma consumers outside the renderer do not increase", () => {
    // Source files only — tests are allowed to reach for the global.
    const out = execSync(
      `grep -rl "__lwSigma" src/ --include=*.ts --include=*.tsx | grep -v "^src/graph/renderers/" || true`,
      { encoding: "utf8" },
    ).trim();

    const files = out ? out.split("\n").filter(Boolean) : [];

    expect(
      files.length,
      `Files outside src/graph/renderers/ reaching through window.__lwSigma:\n` +
        files.map((f) => `  ${f}`).join("\n") +
        `\n\nThis is GD-002. The renderer seam is a global, not the props interface.\n` +
        `If this count went UP, you widened the seam — route the new consumer through a facade.\n` +
        `If it went DOWN, lower MAX_EXTERNAL_LWSIGMA_FILES and note it in the ledger.`,
    ).toBeLessThanOrEqual(MAX_EXTERNAL_LWSIGMA_FILES);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GD-011 / GD-013 / GD-023 — the z axis.
//
// z is written by the seeders, carried through pins, and consumed by NOTHING. The physics is
// strictly 2D (no vz), and Sigma's nodeReducer returns {x, y} only. The 3D work inherits an
// axis that has never been pressure-tested against a renderer.
//
// These guards fail the moment z starts doing something — which is exactly when the ledger
// entries should close.
// ─────────────────────────────────────────────────────────────────────────────
test.describe("the z axis", () => {
  test("z is not consumed by the renderer or the physics", async ({ page }) => {
    await loadGraph(page);

    const before = await page.evaluate(() => {
      const g = (window as any).__lwSigma.getGraph();
      const z: Record<string, number> = {};
      g.forEachNode((id: string, a: any) => {
        if (typeof a.z === "number") z[id] = a.z;
      });
      return z;
    });

    expect(Object.keys(before).length).toBeGreaterThan(50); // not a vacuous pass

    // Let the simulation run. If physics ever gains a z force, these will diverge.
    await page.waitForTimeout(3000);

    const after = await page.evaluate(() => {
      const g = (window as any).__lwSigma.getGraph();
      const z: Record<string, number> = {};
      g.forEachNode((id: string, a: any) => {
        if (typeof a.z === "number") z[id] = a.z;
      });
      return z;
    });

    const moved = Object.keys(before).filter((id) => before[id] !== after[id]);

    expect(
      moved,
      `GD-023: the physics moved a node in z. The simulation is documented as strictly 2D ` +
        `(GWNodeState has vx/vy and no vz). If you added a z force, close GD-011/GD-023.\n` +
        `Nodes that moved: ${moved.slice(0, 5).join(", ")}`,
    ).toHaveLength(0);

    // The engine's per-node state carries no z velocity.
    const hasVz = await page.evaluate(() => {
      const state = (window as any).__lwGetGwellsState?.();
      if (!state) return null;
      const first = state.nodes instanceof Map ? [...state.nodes.values()][0] : null;
      return first ? "vz" in first : null;
    });
    expect(hasVz, "GD-023: GWNodeState gained a vz — the sim is no longer 2D.").toBe(false);
  });

  test("radial-backbone seeds a planar graph (z === 0)", async ({ page }) => {
    await loadGraph(page);

    // Default dialect. radialBackbone inherits z unchanged from a zero root, so the whole
    // tree is planar. Only parallel-spines produces genuine azimuthal depth.
    const dialect = await page.evaluate(
      () => (window as any).__lwGetGwellsState?.()?.dialectId,
    );
    expect(dialect).toBe("gwells.dialect.radial-backbone");

    const nonZero = await page.evaluate(() => {
      const g = (window as any).__lwSigma.getGraph();
      const bad: Array<{ id: string; z: number }> = [];
      g.forEachNode((id: string, a: any) => {
        if (typeof a.z === "number" && a.z !== 0) bad.push({ id, z: a.z });
      });
      return bad;
    });

    expect(
      nonZero,
      `GD-013: radial-backbone produced non-planar seeds. Turning on a 3D camera against the ` +
        `DEFAULT dialect currently shows a flat plane — if that changed, close GD-013.\n` +
        `Sample: ${JSON.stringify(nonZero.slice(0, 3))}`,
    ).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GD-015 / GD-020 / GD-021 — the attribute contract.
//
// This is the payload any imported renderer must consume. Pinning the exact key set means a
// silent addition or removal cannot slip past — which is precisely how `alpha` (written, never
// read) and `weight` (hardcoded 1, never read) accumulated in the first place.
// ─────────────────────────────────────────────────────────────────────────────
test.describe("attribute contract", () => {
  test("node attribute contract is exactly this set", async ({ page }) => {
    await loadGraph(page);

    const keys = await page.evaluate(() => {
      const g = (window as any).__lwSigma.getGraph();
      const seen = new Set<string>();
      g.forEachNode((_id: string, a: any) => Object.keys(a).forEach((k) => seen.add(k)));
      return [...seen].sort();
    });

    // Measured 2026-07-12. `type` is the Sigma PROGRAM id; `nodeType` is the SEMANTIC kind
    // (GD-015). `label` is destructively truncated; `fullLabel` is the real text (GD-020).
    // `cluster` / `componentIndex` / `isInLargestComponent` are written and never read (GD-021).
    //
    // NOTE the absence of `isSun` — the builder sets it on 11 nodes and SigmaGraphView deletes
    // every one of them on the next line (GD-050). If it reappears here, that bug was fixed.
    const EXPECTED = [
      "alpha",
      "baseSize",
      "cluster",
      "color",
      "componentIndex",
      "fullLabel",
      "isEndpoint",
      "isInLargestComponent",
      "isIsolated",
      "label",
      "labelColor",
      "nodeType",
      "originalLabel",
      "raw",
      "rawSize",
      "size",
      "type",
      "x",
      "y",
      "z",
    ];

    const added = keys.filter((k) => !EXPECTED.includes(k));
    const removed = EXPECTED.filter((k) => !keys.includes(k));

    expect(
      { added, removed },
      `The node attribute contract changed. This is the payload every renderer consumes.\n` +
        `Added: ${JSON.stringify(added)}\nRemoved: ${JSON.stringify(removed)}\n` +
        `Update docs/ledger/GRAPH_DISPLAY.md and docs/canonical/GRAPH_DISPLAY_MAP.md.`,
    ).toEqual({ added: [], removed: [] });
  });

  test("edge attribute contract is exactly this set", async ({ page }) => {
    await loadGraph(page);

    const keys = await page.evaluate(() => {
      const g = (window as any).__lwSigma.getGraph();
      const seen = new Set<string>();
      g.forEachEdge((_e: string, a: any) => Object.keys(a).forEach((k) => seen.add(k)));
      return [...seen].sort();
    });

    // `color` is written on every edge and DISCARDED by the GPU — PlasmaEdgeProgram never reads
    // data.color (GD-019). `weight` is hardcoded 1 and never read (GD-021).
    const EXPECTED = [
      "alpha",
      "color",
      "fullLabel",
      "id",
      "label",
      "originalLabel",
      "raw",
      "relationship",
      "size",
      "weight",
    ];

    const added = keys.filter((k) => !EXPECTED.includes(k));
    const removed = EXPECTED.filter((k) => !keys.includes(k));

    expect({ added, removed }, `The edge attribute contract changed.`).toEqual({
      added: [],
      removed: [],
    });
  });

  test("alpha is written but not consumed — all of dim mode is inert", () => {
    // GD-017. `dimmingPolicy` faithfully computes and writes `alpha` on every node and edge, and
    // NOTHING reads it: Sigma has no alpha attribute, no nodeReducer maps it to colour alpha, and
    // PlasmaEdgeProgram ignores colour entirely. The whole focus/context feature writes into the
    // void.
    //
    // "Nothing reads it" cannot be asserted from the page — so this is a source-level guard: the
    // ONLY file allowed to mention the alpha attribute is the one that writes it. The moment a
    // renderer starts consuming it, this fails, and that is the signal to CLOSE GD-017 (and
    // probably GD-033) because dimming just started working.
    const out = execSync(
      `grep -rln '"alpha"\\|attrs\\.alpha\\|data\\.alpha' src/ --include=*.ts --include=*.tsx || true`,
      { encoding: "utf8" },
    ).trim();

    const files = out ? out.split("\n").filter(Boolean) : [];

    expect(
      files,
      `Files touching the \`alpha\` graph attribute:\n${files.map((f) => `  ${f}`).join("\n")}\n\n` +
        `GD-017: alpha is currently WRITE-ONLY. If a reader appeared, dim mode may now actually ` +
        `work — close the ledger entry and rewrite this guard.`,
    ).toEqual(["src/graph/visual/dimmingPolicy.ts"]);
  });

  test("isSun is deleted immediately after it is computed", async ({ page }) => {
    await loadGraph(page);

    // GD-050. buildGraphologyGraph finds the highest-degree node per cluster and tags 11 of them
    // with isSun. SigmaGraphView then does, on the very next lines:
    //
    //     // Clear solar orbit attributes on rebuild
    //     graph.forEachNode((nodeId) => graph.removeNodeAttribute(nodeId, "isSun"));
    //
    // ...on the freshly built graph. So isSun never survives, and graphStylePolicy's sun branch
    // (x1.8 size + cluster colour) is unreachable. The `cluster` attribute set on the same line
    // DOES survive, which is what exposed the asymmetry.
    const state = await page.evaluate(() => {
      const g = (window as any).__lwSigma.getGraph();
      let withIsSun = 0;
      let withCluster = 0;
      g.forEachNode((_id: string, a: any) => {
        if ("isSun" in a) withIsSun++;
        if ("cluster" in a) withCluster++;
      });
      return { withIsSun, withCluster, computed: g.getAttribute("clusterSunCount") };
    });

    // The builder still computes them...
    expect(state.computed).toBeGreaterThan(0);
    expect(state.withCluster).toBe(state.computed);

    // ...and the renderer still throws them away.
    expect(
      state.withIsSun,
      `GD-050: ${state.withIsSun} nodes now carry isSun (the builder computed ` +
        `${state.computed}). If the removeNodeAttribute call in SigmaGraphView was deleted, the ` +
        `sun styling just came back to life — close GD-050 and update the node attribute ` +
        `contract guard above, which currently asserts isSun is ABSENT.`,
    ).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GD-026 — the seed handshake.
//
// The highest-risk contract for an imported seeder. Writing only x/y silently disables seed
// adherence, collapses springs to a static default, and breaks spine pinning — with no error.
// ─────────────────────────────────────────────────────────────────────────────
test.describe("seed handshake", () => {
  test("the seed handshake maps exist and are populated", async ({ page }) => {
    await loadGraph(page);

    const result = await page.evaluate(() => {
      const g = (window as any).__lwSigma.getGraph();
      const seeds = g.getAttribute("__gwellsSeedPositions");
      const spines = g.getAttribute("__seededSpinePositions");
      const sample = seeds instanceof Map ? [...seeds.values()][0] : null;
      return {
        hasSeeds: seeds instanceof Map,
        seedCount: seeds instanceof Map ? seeds.size : 0,
        hasSpines: spines instanceof Map,
        // __gwellsSeedPositions carries {x,y,z} for EVERY node; __seededSpinePositions is
        // {x,y} for spine nodes only and is read by the Sigma nodeReducer at render time.
        seedHasZ: sample ? typeof sample.z === "number" : false,
        nodeCount: g.order,
      };
    });

    expect(result.hasSeeds, "GD-026: __gwellsSeedPositions is missing.").toBe(true);
    expect(result.hasSpines, "GD-026: __seededSpinePositions is missing.").toBe(true);
    expect(
      result.seedCount,
      "GD-026: __gwellsSeedPositions must cover EVERY node — it feeds both the seed-anchor " +
        "force and the per-pair spring rest lengths.",
    ).toBe(result.nodeCount);
    expect(result.seedHasZ, "GD-026: seed positions lost their z component.").toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GD-042 — the fake taxonomy.
//
// physicsDialectRegistry duplicates the real gwells dialects in an INCOMPATIBLE id namespace.
// This guard proves the two cannot be joined, so nobody wires an imported engine into the wrong
// one. Delete this test when the duplicate registry is deleted, and close GD-042.
// ─────────────────────────────────────────────────────────────────────────────
test.describe("dialect taxonomy", () => {
  test("the real dialect registry is the one the engine reads", async ({ page }) => {
    await loadGraph(page);

    const ids = await page.evaluate(() => {
      const engineDialect = (window as any).__lwGetGwellsState?.()?.dialectId ?? null;
      const fake = (window as any).__lwPhysicsDialectRegistry?.list?.() ?? [];
      return { engineDialect, fakeIds: fake.map((e: any) => e.id) };
    });

    // The engine speaks `gwells.dialect.*`.
    expect(ids.engineDialect).toMatch(/^gwells\.dialect\./);

    // The display-only registry speaks `dialect.gwells.*` — a DIFFERENT namespace. If these
    // ever intersect, someone reconciled them: close GD-042 (or GD-044) and delete this guard.
    if (ids.fakeIds.length > 0) {
      expect(
        ids.fakeIds.includes(ids.engineDialect),
        `GD-042: physicsDialectRegistry now contains the engine's dialect id. The two ` +
          `taxonomies used to be disjoint (dialect.gwells.* vs gwells.dialect.*). If they were ` +
          `reconciled, close GD-042 and GD-044.`,
      ).toBe(false);
    }
  });
});
