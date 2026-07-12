# The Layout Pipeline — the standard order of operations

This is the template. Every layout/seed change follows these five stages, in this order. It exists because the previous approach — independently tuned constants, adjusted whenever the picture looked wrong — broke every time the content changed, and each fix broke something else.

The distinction that matters:

- **Preservative layout** hardcodes the numbers that produced a picture we liked. It is correct for exactly one input and silently wrong for every other. `directoryOffset: 220` is preservative: it was fine until node radii changed, then fine again until a directory was deleted.
- **Adaptive layout** derives the numbers from the content. It has no opinion about how far apart things should be; it computes how far apart they *must* be, and grows when the content grows.

**We build adaptive layouts.** A constant that encodes a distance is a bug in waiting.

---

## The five stages

Each stage is a **pure function**. No stage reads the graph's mutable render state (`size`, `color`) — geometry reads `baseSize` only (see `GRAPH_DISPLAY_MAP.md`). No stage mutates anything except the last.

```
1. DERIVE    content        → intrinsic quantities   (pure, no layout knowledge)
2. MEASURE   tree + (1)     → footprints, bottom-up  (pure)
3. ALLOCATE  footprints     → disjoint regions, top-down (pure)
4. PLACE     regions        → coordinates            (pure)
5. VERIFY    coordinates    → invariants hold        (assertion, in a test)
```

### 1 · DERIVE — content to intrinsic quantities

Everything a node knows about itself, independent of where it will go.

- `radius(v)` from `rawSize` — the only place a node's size is decided.

**Constants are allowed here and nowhere else.** This is the single tuning surface: change `NODE_RADIUS_MIN`/`MAX` and every downstream distance re-derives automatically. That property is the whole point.

### 2 · MEASURE — bottom-up footprints

Compute, for every subtree, **how much room it actually needs** — never how much room we think it should have.

- `discRadius(v)` — the radius of the disc containing `v` *and everything that orbits it* (its files). Derived from the file radii, not from a constant:
  - files must clear the parent: `orbit ≥ radius(v) + maxFileRadius + PAD`
  - files must clear *each other* around the orbit: `2π·orbit ≥ Σ 2·fileRadius`, i.e. `orbit ≥ Σ fileRadius / π`
  - take the max of both. A directory with 40 files gets a bigger disc than one with 2 — automatically.
- `width(v)` — the tangential width the subtree needs:
  ```
  width(v) = max( 2·discRadius(v) + PAD ,  Σ width(child) )
  ```
  A subtree is at least as wide as its own disc, and at least as wide as its children laid side by side.

This is the stage that makes the layout adaptive. **Growth propagates upward automatically:** add files to a leaf directory and its disc grows, so its width grows, so its ancestors' widths grow, so the rings and sectors that contain it grow. Nothing is re-tuned.

### 3 · ALLOCATE — top-down disjoint regions

Turn measured need into **disjoint** angular sectors and ring radii.

- **Ring radius** — the adaptive replacement for `directoryOffset`:
  ```
  r(d) = max(
    r(d-1) + maxDisc(d-1) + maxDisc(d) + PAD,   // radial clearance between rings
    Σ width(v) for v at depth d  /  2π          // enough circumference to hold them all
  )
  ```
  The second term is the one that makes the graph *spread out as it grows*. More content at a depth ⇒ a bigger ring. No constant.

- **Angular sector** — each subtree's share of its parent's sector, weighted by measured `width`, tiled exactly (no floor — a floor over-allocates, and over-allocation across a full circle is how sectors start overlapping again).
  ```
  θ(v) = width(v) / r(depth(v))
  ```

**The invariant this buys, by construction:**

Children fit inside their parent's sector, always. Since `Σ width(child) ≤ width(parent)` (stage 2) and `r(d) ≥ r(d-1)` (stage 3):

```
Σ θ(child) = Σ width(child) / r(d)  ≤  width(parent) / r(d)  ≤  width(parent) / r(d-1)  =  θ(parent)   ∎
```

And a node's disc fits inside its own sector, because the arc it owns is `θ(v)·r(d) = width(v) ≥ 2·discRadius(v)`.

**Therefore files cannot invade a sibling subtree** — the disc that contains them is contained in the sector. That was L-020, and it is now impossible rather than merely unlikely.

### 4 · PLACE — regions to coordinates

Purely mechanical: put each node at the centre of its allocated sector, on its ring; orbit its files inside its own disc (phyllotaxis for even spread). No decisions left to make.

### 5 · VERIFY — invariants, not thresholds

**Assert relations, never magic numbers.** A test that says "no pair closer than 8 units" is preservative: it encodes a snapshot and breaks when content changes, teaching everyone to nudge the threshold. The correct invariant is *relational and scale-free*:

```
for every pair (a, b):   distance(a, b)  ≥  radius(a) + radius(b)
```

This is content-independent. It holds for 40 nodes and 40,000. It cannot be satisfied by fiddling a constant — only by a layout that is actually correct. **When you can't state the invariant without a magic number, the design is wrong, not the number.**

---

## Idempotence

- **Deterministic.** Same input ⇒ same output, bit for bit. No `Math.random()` anywhere in the layout path. Ordering comes from sorted ids. (Symmetry-breaking for coincident nodes uses a hash of the node ids, never randomness — see `GWELLS_PHYSICS.md` L-002.)
- **Re-runnable.** Seeding twice produces the same positions. Stages 1–4 are pure functions of the graph, not of the previous layout.
- **Stable under change.** Adding content changes the layout *proportionally* — it does not require re-tuning constants elsewhere. This is the property `directoryOffset: 220` did not have, and it is why deleting one directory could break a spacing assertion three subtrees away.

## Rules

1. **A constant that encodes a distance belongs in stage 1 or nowhere.** If you find yourself adding `const SOMETHING_OFFSET = 220`, you are writing preservative layout. Derive it.
2. **Never tune a constant to make a test pass.** If the invariant fails, the allocation is wrong. Fix stage 2 or 3.
3. **Never relax the invariant in stage 5.** It is relational; there is nothing to relax without making it meaningless.
4. **Geometry reads `baseSize`, never `size`.** `size` is presentation — it is multiplied by a user setting and rewritten on hover. A layout that reads it changes shape when you mouse over a node.
5. **Bottom-up before top-down.** You cannot allocate room before you know how much room is needed. Every attempt to place first and fix up later reintroduces exactly the class of bug this document exists to prevent.
