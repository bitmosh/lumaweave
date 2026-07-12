// SPDX-License-Identifier: Apache-2.0
/**
 * Adaptive radial layout — the pipeline from docs/canonical/LAYOUT_PIPELINE.md.
 *
 * DERIVE -> MEASURE -> ALLOCATE -> PLACE. Four pure functions, in that order.
 *
 * The point of this module is what it does NOT contain: there is no `directoryOffset`, no
 * `spineSpacing`, no `MIN_ORBIT`. Not one constant encodes a distance. Every distance is derived
 * from the content, so the layout grows when the content grows and no number has to be re-tuned.
 *
 * That is the difference between adaptive and preservative layout. The old seeder was
 * preservative: `directoryOffset: 220` was tuned against one snapshot, and it was correct until
 * node radii changed, and correct again until a directory was deleted. Files orbited at >= 122
 * units while siblings sat 220 apart, so a file ALWAYS crossed into a neighbouring subtree (L-020)
 * — a fact nobody noticed until the content shifted and a different pair became the closest.
 *
 * Here, containment is structural:
 *
 *   Sum(width(child)) <= width(parent)            [MEASURE]
 *   r(d) >= r(d-1)                                 [ALLOCATE]
 *   => Sum(theta(child)) <= theta(parent)          => subtrees cannot cross
 *
 *   theta(v) * r(d) >= width(v) >= pi * disc(v)    => a node's disc (itself AND its orbiting
 *                                                     files) fits inside its own sector
 *
 * So files cannot invade a sibling — not because we constrain the orbit, but because the disc
 * that holds them is contained. Files still orbit a full circle; they simply have room to.
 *
 * Deterministic: no randomness, ordering comes from the caller's sorted ids. Re-running produces
 * identical output.
 */

import { NODE_RADIUS_MIN } from "../seederHelpers";

/** The one distance in this file, and it is expressed in stage-1 units, not invented. */
const PAD = NODE_RADIUS_MIN;

/**
 * A disc of radius p centred at distance r from the origin fits inside a wedge of angle theta
 * when sin(theta/2) >= p/r. Allocation gives theta = width/r, so it suffices that
 * width >= 2r*asin(p/r), and since asin(x) <= (pi/2)x on [0,1], width >= pi*p is sufficient for
 * ANY r > p. Hence the factor — it is a proof obligation, not a fudge.
 */
const WIDTH_FACTOR = Math.PI;

export interface LayoutTree {
  /** Roots, already sorted by the caller. Determinism comes from this ordering. */
  roots: string[];
  /** Directory children of a node, sorted. */
  childDirs: (id: string) => string[];
  /** Leaf (file) children of a node, sorted. */
  childFiles: (id: string) => string[];
  /** Structural radius. MUST come from `baseSize`, never `size` — see LAYOUT_PIPELINE.md rule 4. */
  radius: (id: string) => number;
}

export interface Measured {
  /** Radius of the disc containing this node AND its orbiting files. */
  discRadius: number;
  /** Radius at which this node's files orbit. */
  orbitRadius: number;
  /** Tangential width this subtree requires. */
  width: number;
  depth: number;
}

export interface Placed {
  x: number;
  y: number;
  z: number;
}

// ─── 2 · MEASURE ─────────────────────────────────────────────────────────────
// Bottom-up. How much room does this subtree ACTUALLY need? Never how much we think it deserves.

export function measure(tree: LayoutTree): Map<string, Measured> {
  const out = new Map<string, Measured>();

  const visit = (id: string, depth: number): Measured => {
    const cached = out.get(id);
    if (cached) return cached;

    const files = tree.childFiles(id);
    const selfRadius = tree.radius(id);

    // The file orbit has to satisfy two independent constraints, and we take the stricter:
    //   (a) files clear the parent's disc          -> orbit >= selfRadius + maxFile + PAD
    //   (b) files clear EACH OTHER around the ring
    //
    // (b) is derived, not guessed. Each file gets an angular slot proportional to its own radius
    // (see `place`), so neighbours i, i+1 are separated by an angle
    //     delta = pi * (r_i + r_i+1) / sumR.
    // Their chord separation is 2*orbit*sin(delta/2) >= (2/pi)*orbit*delta  (sin x >= 2x/pi on
    // [0, pi/2]), and requiring that to exceed r_i + r_i+1 gives, after the sumR cancels:
    //
    //     orbit >= sumR / 2                                                     [*]
    //
    // No fudge factor and no magic number — the bound falls out of the placement rule. This is
    // also why (b) makes a directory with 40 files automatically bigger than one with 2.
    //
    // My first attempt used `sumR / pi` with phyllotaxis placement, and the invariant test caught
    // it immediately: phyllotaxis distributes files well *on average* but guarantees no minimum
    // gap between ADJACENT files of differing size, so two large neighbours overlapped at a ratio
    // of 0.5. Sizing the orbit for total arc is not the same as spacing the files.
    let orbitRadius = 0;
    let discRadius = selfRadius;
    if (files.length > 0) {
      let maxFile = 0;
      let sumFile = 0;
      for (const f of files) {
        const r = tree.radius(f);
        if (r > maxFile) maxFile = r;
        sumFile += r;
      }
      orbitRadius = Math.max(selfRadius + maxFile + PAD, sumFile / 2); // [*]
      discRadius = orbitRadius + maxFile;
    }

    // Children are laid side by side inside this node's sector, so the subtree is at least as
    // wide as their sum — and at least as wide as its own disc.
    let childWidthSum = 0;
    for (const c of tree.childDirs(id)) {
      childWidthSum += visit(c, depth + 1).width;
    }

    const width = Math.max(WIDTH_FACTOR * discRadius + PAD, childWidthSum);

    const m: Measured = { discRadius, orbitRadius, width, depth };
    out.set(id, m);
    return m;
  };

  tree.roots.forEach((r) => visit(r, 0));
  return out;
}

// ─── 3 · ALLOCATE ────────────────────────────────────────────────────────────
// Top-down. Turn measured need into DISJOINT sectors and ring radii.

export interface Sector {
  centre: number;
  extent: number;
  ring: number;
}

export function allocate(
  tree: LayoutTree,
  measured: Map<string, Measured>,
): { sectors: Map<string, Sector>; ringRadius: number[] } {
  // Group by depth so a ring can be sized against everything that has to fit on it.
  const byDepth: string[][] = [];
  const walk = (id: string) => {
    const m = measured.get(id)!;
    (byDepth[m.depth] ??= []).push(id);
    tree.childDirs(id).forEach(walk);
  };
  tree.roots.forEach(walk);

  const maxDiscAt = (d: number) =>
    (byDepth[d] ?? []).reduce((mx, id) => Math.max(mx, measured.get(id)!.discRadius), 0);

  // THE ADAPTIVE REPLACEMENT FOR `directoryOffset`.
  //
  // A ring must satisfy two things, and again we take the stricter:
  //   (a) radial clearance — its discs must not touch the previous ring's discs
  //   (b) circumference    — 2*pi*r must be long enough to hold everything on it
  // (b) is what makes the graph SPREAD OUT as it grows. Add 500 files and the ring expands;
  // nothing is re-tuned.
  const ringRadius: number[] = [];
  for (let d = 0; d < byDepth.length; d++) {
    const totalWidth = (byDepth[d] ?? []).reduce((s, id) => s + measured.get(id)!.width, 0);
    const circumferenceNeed = totalWidth / (2 * Math.PI);

    if (d === 0) {
      // A single root sits at the origin and owns the whole circle; there is no ring to size.
      ringRadius[0] = tree.roots.length <= 1 ? 0 : Math.max(circumferenceNeed, maxDiscAt(0));
    } else {
      const clearance = ringRadius[d - 1] + maxDiscAt(d - 1) + maxDiscAt(d) + PAD;
      ringRadius[d] = Math.max(clearance, circumferenceNeed);
    }
  }

  const sectors = new Map<string, Sector>();

  // Roots tile the full circle, weighted by measured width. Exactly — no minimum-arc floor.
  // A floor over-allocates, and over-allocating a full circle is precisely how sectors began
  // overlapping again (see GWELLS_PHYSICS.md / L-001b: 41 roots x 12deg floor = 492deg of 360).
  tileInto(tree, measured, sectors, tree.roots, 0, 2 * Math.PI, ringRadius, 0);

  return { sectors, ringRadius };
}

/**
 * Give each child its own slice of the parent's sector. Each child receives AT LEAST the angle it
 * measured as needing (width / r); leftover slack is shared out in proportion, so the sector is
 * filled rather than clumped at its centre.
 *
 * Slack is guaranteed non-negative by the MEASURE invariant — see the proof in the file header.
 * We clamp anyway: a guarantee you don't check is a guarantee you don't have.
 */
function tileInto(
  tree: LayoutTree,
  measured: Map<string, Measured>,
  sectors: Map<string, Sector>,
  ids: string[],
  centre: number,
  extent: number,
  ringRadius: number[],
  depth: number,
): void {
  if (ids.length === 0) return;

  const r = ringRadius[depth];
  const needed = ids.map((id) => {
    const w = measured.get(id)!.width;
    // At the origin (single root) the whole circle is available.
    return r <= 0 ? extent / ids.length : w / r;
  });

  const totalNeeded = needed.reduce((a, b) => a + b, 0);
  const slack = Math.max(0, extent - totalNeeded);

  let cursor = centre - extent / 2;
  ids.forEach((id, i) => {
    const share =
      totalNeeded > 0 ? needed[i] + slack * (needed[i] / totalNeeded) : extent / ids.length;
    const mid = cursor + share / 2;
    cursor += share;

    sectors.set(id, { centre: mid, extent: share, ring: r });

    tileInto(tree, measured, sectors, tree.childDirs(id), mid, share, ringRadius, depth + 1);
  });
}

// ─── 4 · PLACE ───────────────────────────────────────────────────────────────
// Mechanical. Every decision was already made; this just evaluates cos/sin.

export function place(
  tree: LayoutTree,
  measured: Map<string, Measured>,
  sectors: Map<string, Sector>,
): Map<string, Placed> {
  const out = new Map<string, Placed>();

  const visit = (id: string) => {
    const s = sectors.get(id);
    const m = measured.get(id);
    if (!s || !m) return;

    const x = s.ring * Math.cos(s.centre);
    const y = s.ring * Math.sin(s.centre);
    // Planar for now. z is carried but unused by the renderer and by the 2D simulation —
    // see docs/ledger/GRAPH_DISPLAY.md GD-011/GD-013 and RM-016.
    out.set(id, { x, y, z: 0 });

    // Files orbit inside this node's OWN disc, which the allocation guarantees fits inside its
    // sector. So they may orbit a FULL CIRCLE without ever reaching a sibling — no angular squeeze
    // is needed, and none is applied. Containment comes from the disc, not from cramping the orbit.
    //
    // Each file gets an angular slot proportional to its own radius — the same proportional tiling
    // used for sectors, one level down. That is what makes the `orbit >= sumR / 2` bound in
    // `measure` sufficient: a big file is given a big slice, so it cannot crowd its neighbour.
    // (Evenly-spaced or golden-angle placement does NOT have this property when radii differ.)
    const files = tree.childFiles(id);
    if (files.length > 0) {
      const radii = files.map((f) => tree.radius(f));
      const sumR = radii.reduce((a, b) => a + b, 0) || 1;

      let cursor = 0;
      files.forEach((f, i) => {
        const slot = (2 * Math.PI * radii[i]) / sumR;
        const angle = cursor + slot / 2;
        cursor += slot;

        out.set(f, {
          x: x + m.orbitRadius * Math.cos(angle),
          y: y + m.orbitRadius * Math.sin(angle),
          z: 0,
        });
      });
    }

    tree.childDirs(id).forEach(visit);
  };

  tree.roots.forEach(visit);
  return out;
}

/** The whole pipeline, in order. */
export function layoutAdaptiveRadial(tree: LayoutTree): Map<string, Placed> {
  const measured = measure(tree);
  const { sectors } = allocate(tree, measured);
  return place(tree, measured, sectors);
}
