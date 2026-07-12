// SPDX-License-Identifier: Apache-2.0
import type Graph from "graphology";
import type {
  GWApplyDialectOptions,
  GWController,
  GWDialectConfig,
  GWEngineConfig,
  GWInteractionEntry,
  GWNodeState,
  GWPhysicsState,
  GWRuntimeState,
  GWStepResult,
  GWWellTypeDefaults,
  GWWellAssignmentContext,
  GWDebugEvent,
  GWFrameHandle,
  GWScheduler,
} from "./types";
import { GW_ENGINE_DEFAULTS } from "./types";
import { getDialectById, getDefaultDialect } from "./dialects";
import { getWellTypeById } from "./wellTypes";
import { getInteractionById } from "./interactions";
import { getSeedFunctionById } from "./seedFunctions";
import { analyzeGraphStructure } from "./structuralResolver";

function nowMs(): number {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

/**
 * L-002: below this separation, two nodes are treated as coincident and given an artificial
 * direction to push apart along. Small enough that it never perturbs a healthy layout — a
 * sub-pixel gap is already a visual overlap — and large enough to escape float noise.
 */
const COINCIDENT_EPSILON = 0.5;
const COINCIDENT_EPSILON_SQ = COINCIDENT_EPSILON * COINCIDENT_EPSILON;

/**
 * A stable pseudo-angle for separating two coincident nodes.
 *
 * Deliberately NOT Math.random(): the layout must stay deterministic and repeatable, so the
 * same pair always separates along the same axis and the same graph always resolves to the
 * same picture. Derived from the node ids via FNV-1a, and made antisymmetric so that A pushing
 * away from B and B pushing away from A produce opposite directions rather than the same one
 * (which would drift the pair sideways instead of separating it).
 */
function stableSeparationAngle(a: string, b: string): number {
  // Order-independent hash of the unordered pair, so both halves of the interaction agree.
  const lo = a < b ? a : b;
  const hi = a < b ? b : a;
  let h = 0x811c9dc5;
  const s = `${lo} ${hi}`;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  const base = ((h >>> 0) / 0xffffffff) * Math.PI * 2;
  // Antisymmetric: the node that sorts first pushes one way, the other pushes back.
  return a === lo ? base : base + Math.PI;
}

const noopScheduler: GWScheduler = {
  request: () => ({ kind: "gwells.noop-frame" }),
  cancel: () => undefined,
};

function getDefaultScheduler(): GWScheduler {
  if (
    typeof globalThis.requestAnimationFrame === "function" &&
    typeof globalThis.cancelAnimationFrame === "function"
  ) {
    return {
      request: (callback) => globalThis.requestAnimationFrame(callback),
      cancel: (handle) => globalThis.cancelAnimationFrame(handle as number),
    };
  }

  return noopScheduler;
}

export function applyDialect(
  graph: Graph,
  dialectId: string,
  options: GWApplyDialectOptions = {}
): GWController {
  let runtimeState: GWRuntimeState = "running";
  const scheduler = options.scheduler ?? getDefaultScheduler();

  function emitDebug(
    type: GWDebugEvent["type"],
    message: string,
    data?: Record<string, unknown>,
  ): void {
    if (!options.onDebug) return;

    try {
      options.onDebug(data ? { type, message, data } : { type, message });
    } catch (err) {
      const debugErr = err instanceof Error ? err : new Error(String(err));
      if (options.onError) options.onError(debugErr);
    }
  }

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

  const activeDialect = dialect;

  // Step 2: Engine config merge
  const engineConfig: GWEngineConfig = {
    ...GW_ENGINE_DEFAULTS,
    ...options.engineConfig,
  };

  // Step 3: Dialect config merge
  const resolvedConfig: GWDialectConfig = {
    wellOverrides: {
      ...activeDialect.config.wellOverrides,
      ...options.configOverride?.wellOverrides,
    },
    interactionOverrides: {
      ...activeDialect.config.interactionOverrides,
      ...options.configOverride?.interactionOverrides,
    },
    seedParams: {
      ...activeDialect.config.seedParams,
      ...options.configOverride?.seedParams,
    },
  };

  // Step 4: Run seed function
  const seedFn = getSeedFunctionById(activeDialect.seedFunctionId);
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
  const assignmentContext: GWWellAssignmentContext = {
    graph,
    structure: analyzeGraphStructure(graph),
  };
  const nodeAssignments = new Map<string, string | null>();
  graph.forEachNode((nodeId, attrs) => {
    try {
      const wellTypeId = activeDialect.wellAssignment.assign(nodeId, attrs, assignmentContext);
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
  const interactionsBySourceWellType = new Map<string, ResolvedInteraction[]>();

  function rebuildResolvedInteractions(): void {
    resolvedInteractions.length = 0;
    interactionsBySourceWellType.clear();
    for (const interactionId of activeDialect.activeInteractions) {
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
      const resolved: ResolvedInteraction = {
        id: interaction.id,
        source: interaction.source,
        target: interaction.target,
        kind: interaction.kind,
        strength: override?.strength ?? interaction.strength,
        range: override?.range ?? interaction.range,
        idealDistance: override?.idealDistance ?? interaction.idealDistance,
        requireEdge: interaction.requireEdge,
      };
      resolvedInteractions.push(resolved);
      const bucket = interactionsBySourceWellType.get(resolved.source);
      if (bucket) bucket.push(resolved);
      else interactionsBySourceWellType.set(resolved.source, [resolved]);
    }
  }

  rebuildResolvedInteractions();
  emitDebug("cache-rebuild", "Resolved interaction cache rebuilt", {
    dialectId: activeDialect.id,
    interactionCount: resolvedInteractions.length,
  });

  // Step 6b: Build resolved per-well-type parameter table
  function resolveWellParams(wellTypeId: string): GWWellTypeDefaults {
    const wellType = getWellTypeById(wellTypeId);
    if (!wellType) {
      return {
        springStiffness: 0,
        damping: 1,
        idealDistance: 0,
        centerGravity: 0,
        seedAdherence: 0,
      };
    }
    const override = resolvedConfig.wellOverrides?.[wellTypeId];
    return {
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

  function rebuildResolvedWellParams(): void {
    resolvedWellParams.clear();
    for (const [, wellTypeId] of nodeAssignments) {
      if (wellTypeId && !resolvedWellParams.has(wellTypeId)) {
        resolvedWellParams.set(wellTypeId, resolveWellParams(wellTypeId));
      }
    }
  }

  rebuildResolvedWellParams();
  emitDebug("cache-rebuild", "Resolved well parameter cache rebuilt", {
    dialectId: activeDialect.id,
    wellTypeCount: resolvedWellParams.size,
  });

  // Step 7: Initialize __gwellsState
  const nodeStates = new Map<string, GWNodeState>();
  const nodeIdsByWellType = new Map<string, string[]>();
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
    const bucket = nodeIdsByWellType.get(wellTypeId);
    if (bucket) bucket.push(nodeId);
    else nodeIdsByWellType.set(wellTypeId, [nodeId]);
  });

  const physicsState: GWPhysicsState = {
    dialectId: activeDialect.id,
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

  function rebuildPairIdealDistance(): void {
    pairIdealDistance.clear();
    const seedPositions = graph.hasAttribute("__gwellsSeedPositions")
      ? graph.getAttribute("__gwellsSeedPositions") as Map<string, { x: number; y: number; z?: number }>
      : null;

    if (!seedPositions) return;

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
      if (!Number.isFinite(distance)) continue;

      // Store both directions for lookup convenience (the spring iterates source-target,
      // and depending on which direction the interaction is defined, the lookup happens
      // in one direction or the other).
      pairIdealDistance.set(`${nodeId}|${parentId}`, distance);
      pairIdealDistance.set(`${parentId}|${nodeId}`, distance);
    }
  }

  rebuildPairIdealDistance();
  emitDebug("cache-rebuild", "Seeded pair ideal distance cache rebuilt", {
    dialectId: activeDialect.id,
    pairCount: pairIdealDistance.size,
  });

  // Step 8: Frame loop
  let running = true;
  let paused = false;
  let scheduledFrame: GWFrameHandle | null = null;

  function stepPhysics(): GWStepResult {
    const stepStartMs = nowMs();
    let timingMarkMs = stepStartMs;
    const splitTiming = (): number => {
      const nextMarkMs = nowMs();
      const elapsedMs = nextMarkMs - timingMarkMs;
      timingMarkMs = nextMarkMs;
      return elapsedMs;
    };

    let movedNodeCount = 0;
    let maxVelocity = 0;
    let totalVelocity = 0;
    let velocitySampleCount = 0;
    const warnings: string[] = [];
    let forceInteractionsMs = 0;
    let auxForcesMs = 0;
    let integrationMs = 0;

    // Reset activeInteractions for all nodes.
    for (const [, state] of physicsState.nodes) {
      state.activeInteractions.length = 0;
    }
    const resetMs = splitTiming();

    // NEW: Get seed positions map (set by seed function).
    const seedPositions = graph.hasAttribute("__gwellsSeedPositions")
      ? graph.getAttribute("__gwellsSeedPositions") as Map<string, { x: number; y: number; z?: number }>
      : null;
    const seedLookupMs = splitTiming();

    // For each non-pinned node, accumulate forces.
    for (const [nodeId, state] of physicsState.nodes) {
      if (state.pinned) continue;
      // Honor Sigma drag convention.
      if (graph.getNodeAttribute(nodeId, "fixed") === true) continue;

      const params = resolvedWellParams.get(state.wellTypeId);
      if (!params) continue;

      const x = graph.getNodeAttribute(nodeId, "x") as number;
      const y = graph.getNodeAttribute(nodeId, "y") as number;

      let fx = 0;
      let fy = 0;

      const forceStartMs = nowMs();
      const sourceInteractions = interactionsBySourceWellType.get(state.wellTypeId);
      if (sourceInteractions) {
        for (const interaction of sourceInteractions) {
          const targetNodeIds = nodeIdsByWellType.get(interaction.target);
          if (!targetNodeIds || targetNodeIds.length === 0) continue;

          let interactionFired = false;

          for (const otherId of targetNodeIds) {
            if (otherId === nodeId) continue;
            const otherState = physicsState.nodes.get(otherId);
            if (!otherState) continue;

            // Pass C7: edge-aware structural filter.
            if (interaction.requireEdge === "contains-parent") {
              // Source's parent must be the target.
              if (parentOfNode.get(nodeId) !== otherId) continue;
            } else if (interaction.requireEdge === "no-contains-parent") {
              // Source's parent must NOT be the target.
              if (parentOfNode.get(nodeId) === otherId) continue;
            } else if (interaction.requireEdge === "shared-parent") {
              // Source and target must share the same parent.
              const sourceParent = parentOfNode.get(nodeId);
              const otherParent = parentOfNode.get(otherId);
              if (!sourceParent || sourceParent !== otherParent) continue;
            }
            // If requireEdge is undefined, no filter applies (legacy behavior).

            const ox = graph.getNodeAttribute(otherId, "x") as number;
            const oy = graph.getNodeAttribute(otherId, "y") as number;
            let dx = ox - x;
            let dy = oy - y;
            let distSq = dx * dx + dy * dy;

            // L-002: symmetry-breaking for coincident nodes.
            //
            // The `+ 0.0001` below prevents a division by zero, but it does NOT supply a
            // direction. For two nodes at the same coordinates dx = dy = 0, so every force
            // becomes (0/dist, 0/dist) * magnitude = exactly ZERO — the magnitude can be
            // enormous and it still moves nothing. A perfect stack was a stable fixed point
            // that repulsion could never break.
            //
            // Give them a direction. The angle is derived from the node ids, NOT from
            // Math.random(), so the sim stays deterministic and repeatable: the same graph
            // always resolves the same way.
            if (distSq < COINCIDENT_EPSILON_SQ) {
              const angle = stableSeparationAngle(nodeId, otherId);
              dx = Math.cos(angle) * COINCIDENT_EPSILON;
              dy = Math.sin(angle) * COINCIDENT_EPSILON;
              distSq = COINCIDENT_EPSILON_SQ;
            }

            const dist = Math.sqrt(distSq) + 0.0001; // avoid div-by-zero

            // Range cutoff.
            if (interaction.range !== undefined && dist > interaction.range) continue;

            // Force kind dispatch.
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
                const pairKey = [nodeId, otherId].join("|");
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
                // Documentary force for C1.
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
      }
      forceInteractionsMs += nowMs() - forceStartMs;

      const auxStartMs = nowMs();
      // Apply center gravity (per-frame pull toward origin).
      if (params.centerGravity && params.centerGravity > 0) {
        const distFromOrigin = Math.sqrt(x * x + y * y) + 0.0001;
        // Pull strength is proportional to centerGravity. Direction is from node toward origin.
        fx += (-x / distFromOrigin) * params.centerGravity;
        fy += (-y / distFromOrigin) * params.centerGravity;
      }

      // NEW: Seed-anchor force — pull toward seeded position.
      if (params.seedAdherence && params.seedAdherence > 0 && seedPositions) {
        const seedPos = seedPositions.get(nodeId);
        if (seedPos) {
          fx += (seedPos.x - x) * params.seedAdherence;
          fy += (seedPos.y - y) * params.seedAdherence;
        }
      }
      auxForcesMs += nowMs() - auxStartMs;

      const integrationStartMs = nowMs();
      // C9.5: skip integration if force resolution produced non-finite.
      // Prevents NaN propagation through velocity. See
      // docs/canonical/GWELLS_PHYSICS.md § NaN guards (supersedes GWELLS_ARCHITECTURE.md).
      if (!Number.isFinite(fx) || !Number.isFinite(fy)) {
        warnings.push('non-finite force skipped for node ' + nodeId);
        integrationMs += nowMs() - integrationStartMs;
        continue;
      }

      // Update velocity with damping.
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

      // Clamp velocity to maxVelocity (existing clamp, keep for safety).
      const speed = Math.sqrt(state.vx * state.vx + state.vy * state.vy);
      if (speed > engineConfig.maxVelocity) {
        const scale = engineConfig.maxVelocity / speed;
        state.vx *= scale;
        state.vy *= scale;
      }

      state.lastSpeed = Math.sqrt(state.vx * state.vx + state.vy * state.vy);

      // Update position.
      const newX = x + state.vx;
      const newY = y + state.vy;

      // C9.5: never write non-finite positions. Reset offending
      // node's velocity so it stops contributing to sibling NaN
      // propagation; leave position at last known good value.
      if (!Number.isFinite(newX) || !Number.isFinite(newY)) {
        state.vx = 0;
        state.vy = 0;
        warnings.push('non-finite position skipped for node ' + nodeId);
        integrationMs += nowMs() - integrationStartMs;
        continue;
      }
      graph.setNodeAttribute(nodeId, 'x', newX);
      graph.setNodeAttribute(nodeId, 'y', newY);
      movedNodeCount += 1;
      maxVelocity = Math.max(maxVelocity, state.lastSpeed);
      totalVelocity += state.lastSpeed;
      velocitySampleCount += 1;
      integrationMs += nowMs() - integrationStartMs;
    }

    const totalMs = nowMs() - stepStartMs;
    return {
      stepsRun: 1,
      movedNodeCount,
      maxVelocity,
      averageVelocity: velocitySampleCount > 0 ? totalVelocity / velocitySampleCount : 0,
      warnings,
      timings: {
        totalMs,
        resetMs,
        seedLookupMs,
        forceInteractionsMs,
        auxForcesMs,
        integrationMs,
      },
    };
  }

  function stepOnce(): GWStepResult {
    if (runtimeState === "stopped" || runtimeState === "error") {
      return {
        stepsRun: 0,
        movedNodeCount: 0,
        maxVelocity: 0,
        averageVelocity: 0,
        warnings: [`cannot step while runtime is ${runtimeState}`],
      };
    }

    try {
      return stepPhysics();
    } catch (err) {
      const stepErr = err instanceof Error ? err : new Error(String(err));
      runtimeState = "error";
      running = false;
      paused = false;
      cancelScheduledFrame();
      emitDebug("runtime-error", "Manual physics step failed; runtime stopped scheduling", {
        dialectId: activeDialect.id,
        message: stepErr.message,
      });
      if (options.onError) options.onError(stepErr);
      else console.warn(`[gwells] manual physics step failed:`, stepErr);
      return {
        stepsRun: 0,
        movedNodeCount: 0,
        maxVelocity: 0,
        averageVelocity: 0,
        warnings: [stepErr.message],
      };
    }
  }

  function cancelScheduledFrame(): void {
    if (scheduledFrame !== null) {
      scheduler.cancel(scheduledFrame);
      scheduledFrame = null;
    }
  }

  function scheduleNextFrame(): void {
    if (!running || paused || runtimeState !== "running" || scheduledFrame !== null) return;
    scheduledFrame = scheduler.request(tick);
  }

  function tick(_timeMs: number) {
    scheduledFrame = null;
    if (!running || paused) return;

    try {
      const stepResult = stepOnce();
      if (runtimeState === "error" || stepResult.stepsRun === 0) return;
    } catch (err) {
      const stepErr = err instanceof Error ? err : new Error(String(err));
      runtimeState = "error";
      running = false;
      paused = false;
      cancelScheduledFrame();
      emitDebug("runtime-error", "Physics step failed; runtime stopped scheduling", {
        dialectId: activeDialect.id,
        message: stepErr.message,
      });
      if (options.onError) options.onError(stepErr);
      else console.warn(`[gwells] physics step failed:`, stepErr);
      return;
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
    scheduleNextFrame();
  }

  scheduleNextFrame();

  // Pass C4: live config override mechanism
  function applyConfigOverride(partial: Partial<GWDialectConfig>): void {
    // Mutate resolvedConfig in place — closures (resolveWellParams) and
    // the seed function will pick up new values.
    if (partial.wellOverrides && Object.keys(partial.wellOverrides).length > 0) {
      resolvedConfig.wellOverrides = {
        ...resolvedConfig.wellOverrides,
        ...partial.wellOverrides,
      };
      rebuildResolvedWellParams();
      emitDebug("cache-rebuild", "Resolved well parameter cache rebuilt", {
        dialectId: activeDialect.id,
        wellTypeCount: resolvedWellParams.size,
      });
    }
    if (partial.interactionOverrides && Object.keys(partial.interactionOverrides).length > 0) {
      resolvedConfig.interactionOverrides = {
        ...resolvedConfig.interactionOverrides,
        ...partial.interactionOverrides,
      };
      rebuildResolvedInteractions();
      emitDebug("cache-rebuild", "Resolved interaction cache rebuilt", {
        dialectId: activeDialect.id,
        interactionCount: resolvedInteractions.length,
      });
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
          for (const [, state] of nodeStates) {
            state.vx = 0;
            state.vy = 0;
            state.lastSpeed = 0;
          }
          emitDebug("seed-rerun", "Seed function rerun after seed parameter override", {
            dialectId: activeDialect.id,
          });
          rebuildPairIdealDistance();
          emitDebug("cache-rebuild", "Seeded pair ideal distance cache rebuilt", {
            dialectId: activeDialect.id,
            pairCount: pairIdealDistance.size,
          });
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
    rebuildPairIdealDistance();
    emitDebug("cache-rebuild", "Seeded pair ideal distance cache rebuilt after pin update", {
      dialectId: activeDialect.id,
      pairCount: pairIdealDistance.size,
      pinnedCount: currentPinned.size,
    });
  }

  emitDebug("applied", "GWells dialect applied", {
    dialectId: activeDialect.id,
    nodeCount: nodeStates.size,
  });

  // Step 9: Return controller
  const controller: GWController = {
    stop: () => {
      if (!running && runtimeState === "stopped") return;
      running = false;
      paused = false;
      runtimeState = "stopped";
      cancelScheduledFrame();
      if (graph.hasAttribute("__gwellsState")) {
        graph.removeAttribute("__gwellsState");
      }
      emitDebug("stopped", "GWells runtime stopped", { dialectId: activeDialect.id });
    },
    pause: () => {
      if (!running || paused || runtimeState !== "running") return;
      paused = true;
      runtimeState = "paused";
      cancelScheduledFrame();
      emitDebug("paused", "GWells runtime paused", { dialectId: activeDialect.id });
    },
    resume: () => {
      if (!running || !paused || runtimeState !== "paused") return;
      paused = false;
      runtimeState = "running";
      scheduleNextFrame();
      emitDebug("resumed", "GWells runtime resumed", { dialectId: activeDialect.id });
    },
    step: () => {
      const result = stepOnce();
      if (result.stepsRun > 0) {
        physicsState.frame += result.stepsRun;
      }
      return result;
    },
    getRuntimeState: () => runtimeState,
    getDialectId: () => activeDialect.id,
    getResolvedConfig: () => resolvedConfig,
    applyConfigOverride,
    applyPins,
  };

  return controller;
}
