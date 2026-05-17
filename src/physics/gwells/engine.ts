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

  // Step 6: Build resolved per-interaction table
  interface ResolvedInteraction {
    id: string;
    source: string;
    target: string;
    kind: GWInteractionEntry["kind"];
    strength: number;
    range: number | undefined;
    idealDistance: number | undefined;
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
              const ideal = idealDistance ?? params.idealDistance;
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

      // Update velocity with damping
      state.vx = (state.vx + fx) * params.damping;
      state.vy = (state.vy + fy) * params.damping;

      // Clamp velocity to maxVelocity
      const speed = Math.sqrt(state.vx * state.vx + state.vy * state.vy);
      if (speed > engineConfig.maxVelocity) {
        const scale = engineConfig.maxVelocity / speed;
        state.vx *= scale;
        state.vy *= scale;
      }

      state.lastSpeed = Math.sqrt(state.vx * state.vx + state.vy * state.vy);

      // Update position
      graph.setNodeAttribute(nodeId, "x", x + state.vx);
      graph.setNodeAttribute(nodeId, "y", y + state.vy);
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
    if (partial.wellOverrides) {
      resolvedConfig.wellOverrides = {
        ...resolvedConfig.wellOverrides,
        ...partial.wellOverrides,
      };
    }
    if (partial.interactionOverrides) {
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
        });
      }
    }
    if (partial.seedParams) {
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
  };

  console.log(`[gwells] applied dialect '${dialect.id}'`);
  return controller;
}
