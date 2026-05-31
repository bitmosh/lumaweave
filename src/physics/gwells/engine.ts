import type Graph from "graphology";
import type {
  GWApplyDialectOptions,
  GWController,
  GWDialectConfig,
  GWEngineConfig,
  GWInteractionEntry,
  GWNodeState,
  GWPhysicsState,
  GWWellTypeDefaults,
} from "./types";
import { GW_ENGINE_DEFAULTS } from "./types";
import { getDialectById, getDefaultDialect } from "./dialects";
import { getWellTypeById } from "./wellTypes";
import { getInteractionById } from "./interactions";
import { getSeedFunctionById } from "./seedFunctions";

export function applyDialect(
  graph: Graph,
  dialectId: string,
  options: GWApplyDialectOptions = {}
): GWController {
  // Step 1: Resolve dialect with fallback
  let dialect = getDialectById(dialectId);
  if (!dialect) {
    const fallback = getDefaultDialect();
    if (!fallback) {
      throw new Error(
        `[gwells] dialect '${dialectId}' not found and no default dialect registered`
      );
    }
    const errMsg = `[gwells] unknown dialect '${dialectId}', falling back to '${fallback.id}'`;
    if (options.onError) {
      options.onError(new Error(errMsg));
    } else {
      console.warn(errMsg);
    }
    dialect = fallback;
  }

  // Step 2: Engine config merge
  const engineConfig: GWEngineConfig = {
    ...GW_ENGINE_DEFAULTS,
    ...options.engineConfig,
  };

  // Step 3: Dialect config merge
  const resolvedConfig: GWDialectConfig = {
    wellOverrides: {
      ...dialect.config.wellOverrides,
      ...options.configOverride?.wellOverrides,
    },
    interactionOverrides: {
      ...dialect.config.interactionOverrides,
      ...options.configOverride?.interactionOverrides,
    },
    seedParams: {
      ...dialect.config.seedParams,
      ...options.configOverride?.seedParams,
    },
  };

  // Step 4: Run seed function
  const seedFn = getSeedFunctionById(dialect.seedFunctionId);
  if (seedFn) {
    try {
      seedFn.seed({ graph, config: resolvedConfig });
    } catch (err) {
      const seedErr = err instanceof Error ? err : new Error(String(err));
      if (options.onError) options.onError(seedErr);
      else console.warn(`[gwells] seed function failed:`, seedErr);
    }
  }

  // Step 5: Build per-node well assignment cache
  const nodeAssignments = new Map<string, string | null>();
  graph.forEachNode((nodeId, attrs) => {
    try {
      const wellTypeId = dialect.wellAssignment.assign(nodeId, attrs);
      nodeAssignments.set(nodeId, wellTypeId);
    } catch (err) {
      nodeAssignments.set(nodeId, null);
      if (options.onError) {
        options.onError(
          new Error(`[gwells] wellAssignment.assign threw for node ${nodeId}: ${err}`)
        );
      }
    }
  });

  // Step 5.5 (Pass C7): Build parent-of-node lookup from contains edges.
  // Used by interactions with requireEdge filter to know which nodes are
  // structurally related to which.
  const parentOfNode = new Map<string, string>();
  graph.forEachEdge((edgeId, attrs) => {
    const edgeType = attrs.relationship || attrs.raw?.type;
    if (edgeType === "contains") {
      const source = graph.source(edgeId); // contains-source = parent
      const target = graph.target(edgeId); // contains-target = child
      parentOfNode.set(target, source);
    }
  });

  // Step 6: Build resolved per-interaction table
  interface ResolvedInteraction {
    id: string;
    source: string;
    target: string;
    kind: GWInteractionEntry["kind"];
    strength: number;
    range: number | undefined;
    idealDistance: number | undefined;
    requireEdge: GWInteractionEntry["requireEdge"];  // NEW (Pass C7)
  }

  const resolvedInteractions: ResolvedInteraction[] = [];
  for (const interactionId of dialect.activeInteractions) {
    const interaction = getInteractionById(interactionId);
    if (!interaction) {
      if (options.onError) {
        options.onError(
          new Error(`[gwells] active interaction '${interactionId}' not found in registry`)
        );
      }
      continue;
    }
    const override = resolvedConfig.interactionOverrides?.[interactionId];
    resolvedInteractions.push({
      id: interaction.id,
      source: interaction.source,
      target: interaction.target,
      kind: interaction.kind,
      strength: override?.strength ?? interaction.strength,
      range: override?.range ?? interaction.range,
      idealDistance: override?.idealDistance ?? interaction.idealDistance,
      requireEdge: interaction.requireEdge,  // NEW (Pass C7)
    });
  }

  // Step 6b: Build resolved per-well-type parameter table
  function resolveWellParams(wellTypeId: string): GWWellTypeDefaults {
    const wellType = getWellTypeById(wellTypeId);
    if (!wellType) {
      return {
        attractionStrength: 0,
        siblingRepulsion: 0,
        springStiffness: 0,
        damping: 1,
        idealDistance: 0,
        centerGravity: 0,
        seedAdherence: 0,
      };
    }
    const override = resolvedConfig.wellOverrides?.[wellTypeId];
    return {
      attractionStrength:
        override?.attractionStrength ?? wellType.defaults.attractionStrength,
      siblingRepulsion:
        override?.siblingRepulsion ?? wellType.defaults.siblingRepulsion,
      springStiffness:
        override?.springStiffness ?? wellType.defaults.springStiffness,
      damping: override?.damping ?? wellType.defaults.damping,
      idealDistance:
        override?.idealDistance ?? wellType.defaults.idealDistance,
      centerGravity: override?.centerGravity ?? wellType.defaults.centerGravity ?? 0,
      seedAdherence: override?.seedAdherence ?? wellType.defaults.seedAdherence ?? 0,
    };
  }

  const resolvedWellParams = new Map<string, GWWellTypeDefaults>();
  for (const [, wellTypeId] of nodeAssignments) {
    if (wellTypeId && !resolvedWellParams.has(wellTypeId)) {
      resolvedWellParams.set(wellTypeId, resolveWellParams(wellTypeId));
    }
  }

  // Step 7: Initialize __gwellsState
  const nodeStates = new Map<string, GWNodeState>();
  graph.forEachNode((nodeId) => {
    const wellTypeId = nodeAssignments.get(nodeId);
    if (wellTypeId === null || wellTypeId === undefined) return;
    const wellType = getWellTypeById(wellTypeId);
    nodeStates.set(nodeId, {
      wellTypeId,
      pinned: wellType?.pinned ?? false,
      vx: 0,
      vy: 0,
      lastSpeed: 0,
      activeInteractions: [],
    });
  });

  const physicsState: GWPhysicsState = {
    dialectId: dialect.id,
    frame: 0,
    nodes: nodeStates,
    config: resolvedConfig,
  };

  graph.setAttribute("__gwellsState", physicsState);

  // Step 5.7 (Pass C8.2): Build per-pair ideal distance for edge-aware springs.
  // For interactions with requireEdge === "contains-parent", the spring's target
  // distance is the seeded distance between source and target — not a static
  // well-type default. This makes the spring agree with the seeder's placement.
  const pairIdealDistance = new Map<string, number>();
  const seedPositions = graph.hasAttribute("__gwellsSeedPositions")
    ? graph.getAttribute("__gwellsSeedPositions") as Map<string, { x: number; y: number; z?: number }>
    : null;

  if (seedPositions) {
    // Iterate every potential (source, target) pair for edge-aware spring interactions.
    // The parentOfNode map already tells us each node's parent. For each node in physics
    // state, if its parent participates in a relevant spring interaction, record the seeded
    // distance.
    for (const [nodeId] of nodeStates) {
      const parentId = parentOfNode.get(nodeId);
      if (!parentId) continue;
      
      const nodeSeed = seedPositions.get(nodeId);
      const parentSeed = seedPositions.get(parentId);
      if (!nodeSeed || !parentSeed) continue;
      
      const dx = parentSeed.x - nodeSeed.x;
      const dy = parentSeed.y - nodeSeed.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Store both directions for lookup convenience (the spring iterates source-target,
      // and depending on which direction the interaction is defined, the lookup happens
      // in one direction or the other).
      pairIdealDistance.set(`${nodeId}|${parentId}`, distance);
      pairIdealDistance.set(`${parentId}|${nodeId}`, distance);
    }
  }

  // Step 8: Frame loop
  let running = true;
  let paused = false;
  let rafId: number | null = null;

  function stepPhysics() {
    // Reset activeInteractions for all nodes
    for (const [, state] of physicsState.nodes) {
      state.activeInteractions.length = 0;
    }

    // NEW: Get seed positions map (set by seed function)
    const seedPositions = graph.hasAttribute("__gwellsSeedPositions")
      ? graph.getAttribute("__gwellsSeedPositions") as Map<string, { x: number; y: number; z?: number }>
      : null;

    // For each non-pinned node, accumulate forces
    for (const [nodeId, state] of physicsState.nodes) {
      if (state.pinned) continue;
      // Honor Sigma drag convention
      if (graph.getNodeAttribute(nodeId, "fixed") === true) continue;

      const params = resolvedWellParams.get(state.wellTypeId);
      if (!params) continue;

      const x = graph.getNodeAttribute(nodeId, "x") as number;
      const y = graph.getNodeAttribute(nodeId, "y") as number;

      let fx = 0;
      let fy = 0;

      for (const interaction of resolvedInteractions) {
        if (interaction.source !== state.wellTypeId) continue;

        // Find target nodes for this interaction
        let interactionFired = false;

        for (const [otherId, otherState] of physicsState.nodes) {
          if (otherId === nodeId) continue;
          if (otherState.wellTypeId !== interaction.target) continue;

          // Pass C7: edge-aware structural filter
          if (interaction.requireEdge === "contains-parent") {
            // Source's parent must be the target
            if (parentOfNode.get(nodeId) !== otherId) continue;
          } else if (interaction.requireEdge === "no-contains-parent") {
            // Source's parent must NOT be the target
            if (parentOfNode.get(nodeId) === otherId) continue;
          } else if (interaction.requireEdge === "shared-parent") {
            // Source and target must share the same parent
            const sourceParent = parentOfNode.get(nodeId);
            const otherParent = parentOfNode.get(otherId);
            if (!sourceParent || sourceParent !== otherParent) continue;
          }
          // If requireEdge is undefined, no filter applies (legacy behavior)

          const ox = graph.getNodeAttribute(otherId, "x") as number;
          const oy = graph.getNodeAttribute(otherId, "y") as number;
          const dx = ox - x;
          const dy = oy - y;
          const distSq = dx * dx + dy * dy;
          const dist = Math.sqrt(distSq) + 0.0001; // avoid div-by-zero

          // Range cutoff
          if (interaction.range !== undefined && dist > interaction.range) continue;

          // Force kind dispatch
          const { kind, strength, idealDistance } = interaction;
          let force = 0;
          let perpComponent = 0;

          switch (kind) {
            case "attraction": {
              force = strength;
              fx += (dx / dist) * force;
              fy += (dy / dist) * force;
              interactionFired = true;
              break;
            }
            case "repulsion": {
              force = strength / Math.max(distSq * 0.01, 0.01);
              fx -= (dx / dist) * force;
              fy -= (dy / dist) * force;
              interactionFired = true;
              break;
            }
            case "spring": {
              // Pass C8.2: prefer per-pair seeded ideal distance for edge-aware springs.
              // Falls back to interaction's static idealDistance, then well-type default.
              const pairKey = `${nodeId}|${otherId}`;
              const pairIdeal = pairIdealDistance.get(pairKey);
              const ideal = pairIdeal !== undefined
                ? pairIdeal
                : (idealDistance ?? params.idealDistance);
              const displacement = dist - ideal;
              force = strength * params.springStiffness * displacement;
              fx += (dx / dist) * force;
              fy += (dy / dist) * force;
              interactionFired = true;
              break;
            }
            case "linear-alignment": {
              // Documentary force for C1
              interactionFired = true;
              break;
            }
            case "perpendicular": {
              perpComponent = strength;
              fx += (-dy / dist) * perpComponent;
              fy += (dx / dist) * perpComponent;
              interactionFired = true;
              break;
            }
          }
        }

        if (interactionFired) {
          state.activeInteractions.push(interaction.id);
        }
      }

      // Apply center gravity (per-frame pull toward origin)
      if (params.centerGravity && params.centerGravity > 0) {
        const distFromOrigin = Math.sqrt(x * x + y * y) + 0.0001;
        // Pull strength is proportional to centerGravity. Direction is from node toward origin.
        fx += (-x / distFromOrigin) * params.centerGravity;
        fy += (-y / distFromOrigin) * params.centerGravity;
      }

      // NEW: Seed-anchor force — pull toward seeded position
      if (params.seedAdherence && params.seedAdherence > 0 && seedPositions) {
        const seedPos = seedPositions.get(nodeId);
        if (seedPos) {
          fx += (seedPos.x - x) * params.seedAdherence;
          fy += (seedPos.y - y) * params.seedAdherence;
        }
      }

      // C9.5: skip integration if force resolution produced non-finite.
      // Prevents NaN propagation through velocity. See
      // docs/_v100-rewrites/GWELLS_PHYSICS.md § NaN guards (supersedes GWELLS_ARCHITECTURE.md).
      if (!Number.isFinite(fx) || !Number.isFinite(fy)) {
        continue;
      }

      // Update velocity with damping
      state.vx = (state.vx + fx) * params.damping;
      state.vy = (state.vy + fy) * params.damping;

      // C9.5: velocity clamp prevents the Infinity→NaN cascade that
      // would otherwise occur if force/distance produced runaway
      // integration (e.g., a node released far from its seed with
      // high adherence). 10000 is ~200x the engine's nominal
      // maxVelocity (50) — clamp never engages during normal
      // physics, but structurally bounds pathological cases.
      const MAX_SAFE_VELOCITY = 10000;
      if (Math.abs(state.vx) > MAX_SAFE_VELOCITY) {
        state.vx = Math.sign(state.vx) * MAX_SAFE_VELOCITY;
      }
      if (Math.abs(state.vy) > MAX_SAFE_VELOCITY) {
        state.vy = Math.sign(state.vy) * MAX_SAFE_VELOCITY;
      }

      // Clamp velocity to maxVelocity (existing clamp, keep for safety)
      const speed = Math.sqrt(state.vx * state.vx + state.vy * state.vy);
      if (speed > engineConfig.maxVelocity) {
        const scale = engineConfig.maxVelocity / speed;
        state.vx *= scale;
        state.vy *= scale;
      }

      state.lastSpeed = Math.sqrt(state.vx * state.vx + state.vy * state.vy);

      // Update position
      const newX = x + state.vx;
      const newY = y + state.vy;

      // C9.5: never write non-finite positions. Reset offending
      // node's velocity so it stops contributing to sibling NaN
      // propagation; leave position at last known good value.
      if (!Number.isFinite(newX) || !Number.isFinite(newY)) {
        state.vx = 0;
        state.vy = 0;
        continue;
      }
      graph.setNodeAttribute(nodeId, "x", newX);
      graph.setNodeAttribute(nodeId, "y", newY);
    }
  }

  function tick() {
    if (!running) return;
    if (paused) {
      rafId = requestAnimationFrame(tick);
      return;
    }

    try {
      stepPhysics();
    } catch (err) {
      const stepErr = err instanceof Error ? err : new Error(String(err));
      if (options.onError) options.onError(stepErr);
      else console.warn(`[gwells] physics step failed:`, stepErr);
    }

    // Apply decoration callback (audio, jitter, etc.)
    if (options.decoration) {
      try {
        options.decoration(graph, physicsState.frame);
      } catch (err) {
        const decoErr = err instanceof Error ? err : new Error(String(err));
        if (options.onError) options.onError(decoErr);
        else console.warn(`[gwells] decoration callback failed:`, decoErr);
      }
    }

    physicsState.frame += 1;
    rafId = requestAnimationFrame(tick);
  }

  rafId = requestAnimationFrame(tick);

  // Pass C4: live config override mechanism
  function applyConfigOverride(partial: Partial<GWDialectConfig>): void {
    // Mutate resolvedConfig in place — closures (resolveWellParams) and
    // the seed function will pick up new values.
    if (partial.wellOverrides && Object.keys(partial.wellOverrides).length > 0) {
      resolvedConfig.wellOverrides = {
        ...resolvedConfig.wellOverrides,
        ...partial.wellOverrides,
      };
    }
    if (partial.interactionOverrides && Object.keys(partial.interactionOverrides).length > 0) {
      resolvedConfig.interactionOverrides = {
        ...resolvedConfig.interactionOverrides,
        ...partial.interactionOverrides,
      };
      // Rebuild cached resolvedInteractions array
      resolvedInteractions.length = 0;
      for (const interactionId of dialect!.activeInteractions) {
        const interaction = getInteractionById(interactionId);
        if (!interaction) continue;
        const override = resolvedConfig.interactionOverrides?.[interactionId];
        resolvedInteractions.push({
          id: interaction.id,
          source: interaction.source,
          target: interaction.target,
          kind: interaction.kind,
          strength: override?.strength ?? interaction.strength,
          range: override?.range ?? interaction.range,
          idealDistance: override?.idealDistance ?? interaction.idealDistance,
          requireEdge: interaction.requireEdge,  // NEW (Pass C7)
        });
      }
    }
    if (partial.seedParams && Object.keys(partial.seedParams).length > 0) {
      resolvedConfig.seedParams = {
        ...resolvedConfig.seedParams,
        ...partial.seedParams,
      };
      // Re-run seed function so node positions visibly update
      if (seedFn) {
        try {
          seedFn.seed({ graph, config: resolvedConfig });
        } catch (err) {
          const seedErr = err instanceof Error ? err : new Error(String(err));
          if (options.onError) options.onError(seedErr);
          else console.warn(`[gwells] seed function failed during override:`, seedErr);
        }
      }
    }
  }

  // Pass C9.1: pin overlay mechanism
  function applyPins(
    pinMap: Record<string, { x: number; y: number; z?: number }>
  ): void {
    const seedPositions = graph.hasAttribute("__gwellsSeedPositions")
      ? graph.getAttribute("__gwellsSeedPositions") as Map<
          string,
          { x: number; y: number; z: number }
        >
      : null;

    // Previously-pinned set lives on the graph so it survives controller
    // lifecycle (stop/applyDialect creates a new controller closure, but
    // the graph attribute persists, which is what lets dialect-switch
    // correctly unfix the prior dialect's pins).
    const previouslyPinned: Set<string> = graph.hasAttribute("__gwellsPinnedSet")
      ? graph.getAttribute("__gwellsPinnedSet") as Set<string>
      : new Set<string>();

    const currentPinned = new Set<string>();

    // Apply pins
    for (const [nodeId, pos] of Object.entries(pinMap)) {
      if (!graph.hasNode(nodeId)) continue;
      const attrs = graph.getNodeAttributes(nodeId);
      if (attrs.nodeType === "spine") continue;

      // C9.5: refuse to apply pins with non-finite coords. Catches
      // any case where handleMouseUp captured corrupted positions.
      if (!Number.isFinite(pos.x) || !Number.isFinite(pos.y)) {
        continue;
      }

      currentPinned.add(nodeId);

      if (seedPositions) {
        seedPositions.set(nodeId, {
          x: pos.x,
          y: pos.y,
          z: typeof pos.z === "number" ? pos.z : 0,
        });
      }

      graph.setNodeAttribute(nodeId, "x", pos.x);
      graph.setNodeAttribute(nodeId, "y", pos.y);
      if (typeof pos.z === "number") {
        graph.setNodeAttribute(nodeId, "z", pos.z);
      }
      graph.setNodeAttribute(nodeId, "fixed", true);
    }

    // Unpin nodes previously pinned but no longer
    for (const nodeId of previouslyPinned) {
      if (currentPinned.has(nodeId)) continue;
      if (!graph.hasNode(nodeId)) continue;
      graph.setNodeAttribute(nodeId, "fixed", false);
      // Seed position left as-is — drift back via C5.
    }

    // Persist for next call (and across controllers via the graph)
    graph.setAttribute("__gwellsPinnedSet", currentPinned);
  }

  // Step 9: Return controller
  const controller: GWController = {
    stop: () => {
      running = false;
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
      if (graph.hasAttribute("__gwellsState")) {
        graph.removeAttribute("__gwellsState");
      }
    },
    pause: () => {
      paused = true;
    },
    resume: () => {
      paused = false;
    },
    getDialectId: () => dialect.id,
    getResolvedConfig: () => resolvedConfig,
    applyConfigOverride,
    applyPins,
  };

  console.log(`[gwells] applied dialect '${dialect.id}'`);
  return controller;
}
