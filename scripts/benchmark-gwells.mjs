#!/usr/bin/env node

import fs from "fs";
import os from "os";
import path from "path";
import { performance } from "perf_hooks";
import { pathToFileURL, fileURLToPath } from "url";
import ts from "typescript";
import Graph from "graphology";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");
const GWELLS_SRC_DIR = path.join(REPO_ROOT, "src/physics/gwells");
const GWELLS_TEMP_DIR = path.join(os.tmpdir(), "lumaweave-gwells-benchmark");
const DIALECT_ID = "gwells.dialect.radial-backbone";
const BENCHMARK_STEP_COUNT = 20;
const BENCHMARK_OUTPUT_DIR = path.join(REPO_ROOT, "benchmarks");
const BENCHMARK_LATEST_PATH = path.join(BENCHMARK_OUTPUT_DIR, "gwells-latest.json");

function nowMs() {
  return performance.now();
}

function roundMs(value) {
  return Math.round(value * 100) / 100;
}

function time(fn) {
  const start = nowMs();
  const value = fn();
  return { value, ms: nowMs() - start };
}

function listTypeScriptFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listTypeScriptFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".ts")) {
      files.push(fullPath);
    }
  }
  return files.sort();
}

function patchRelativeImports(js) {
  return js.replace(
    /(from\s+["'])(\.\.?\/[^"']+)(["'])/g,
    (match, prefix, specifier, suffix) => {
      if (path.extname(specifier)) return match;
      return `${prefix}${specifier}.mjs${suffix}`;
    },
  );
}

function transpileGwellsToTemp() {
  fs.rmSync(GWELLS_TEMP_DIR, { recursive: true, force: true });
  fs.mkdirSync(GWELLS_TEMP_DIR, { recursive: true });

  for (const sourcePath of listTypeScriptFiles(GWELLS_SRC_DIR)) {
    const relativePath = path.relative(GWELLS_SRC_DIR, sourcePath);
    const outputPath = path.join(
      GWELLS_TEMP_DIR,
      relativePath.replace(/\.ts$/, ".mjs"),
    );
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    const source = fs.readFileSync(sourcePath, "utf8");
    const transpiled = ts.transpileModule(source, {
      fileName: sourcePath,
      compilerOptions: {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.ES2020,
        importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove,
      },
    });

    fs.writeFileSync(outputPath, patchRelativeImports(transpiled.outputText));
  }
}

async function loadGwells() {
  transpileGwellsToTemp();
  return import(pathToFileURL(path.join(GWELLS_TEMP_DIR, "index.mjs")).href);
}

function installRafStub() {
  const previousRequest = globalThis.requestAnimationFrame;
  const previousCancel = globalThis.cancelAnimationFrame;
  let nextId = 1;
  const scheduled = new Set();

  globalThis.requestAnimationFrame = () => {
    const id = nextId;
    nextId += 1;
    scheduled.add(id);
    return id;
  };

  globalThis.cancelAnimationFrame = (id) => {
    scheduled.delete(id);
  };

  return {
    getScheduledCount: () => scheduled.size,
    restore: () => {
      if (previousRequest === undefined) {
        delete globalThis.requestAnimationFrame;
      } else {
        globalThis.requestAnimationFrame = previousRequest;
      }

      if (previousCancel === undefined) {
        delete globalThis.cancelAnimationFrame;
      } else {
        globalThis.cancelAnimationFrame = previousCancel;
      }
    },
  };
}

function addNode(graph, id, attrs) {
  graph.addNode(id, {
    label: id,
    size: 10,
    rawSize: 1,
    ...attrs,
  });
}

function addDirectedEdge(graph, source, target, attrs) {
  graph.addDirectedEdgeWithKey(`${source}->${target}`, source, target, attrs);
}

function buildFilesystemLike(label, targetNodes) {
  const graph = new Graph({ type: "directed", multi: false });
  const spineCount = targetNodes >= 1500 ? 8 : targetNodes >= 500 ? 4 : 2;
  const spineIds = [];

  for (let spineIndex = 0; spineIndex < spineCount; spineIndex += 1) {
    const id = `${label}.spine.${spineIndex}`;
    addNode(graph, id, {
      nodeType: "spine",
      raw: { type: "spine" },
      size: 18,
    });
    spineIds.push(id);
  }

  let dirIndex = 0;
  let fileIndex = 0;
  while (graph.order < targetNodes) {
    const spineId = spineIds[dirIndex % spineIds.length];
    const dirId = `${label}.dir.${dirIndex}`;
    addNode(graph, dirId, {
      nodeType: "directory",
      raw: { type: "directory" },
      size: 14,
    });
    addDirectedEdge(graph, spineId, dirId, {
      relationship: "contains",
      raw: { type: "contains" },
    });

    const filesForDir = Math.min(6, targetNodes - graph.order);
    for (let i = 0; i < filesForDir; i += 1) {
      const fileKind = ["file", "doc", "code", "config", "fixture"][fileIndex % 5];
      const fileId = `${label}.file.${fileIndex}`;
      addNode(graph, fileId, {
        nodeType: fileKind,
        raw: { type: fileKind },
        rawSize: 1 + (fileIndex % 17),
      });
      addDirectedEdge(graph, dirId, fileId, {
        relationship: "contains",
        raw: { type: "contains" },
      });
      fileIndex += 1;
    }

    dirIndex += 1;
  }

  return graph;
}

function buildNoSpineGeneric(label, targetNodes) {
  const graph = new Graph({ type: "directed", multi: false });

  for (let index = 0; index < targetNodes; index += 1) {
    addNode(graph, `${label}.node.${index}`, {
      raw: { type: index % 11 === 0 ? "hubish" : "entity" },
      size: 8 + (index % 5),
    });
  }

  for (let index = 1; index < targetNodes; index += 1) {
    addDirectedEdge(graph, `${label}.node.${index - 1}`, `${label}.node.${index}`, {
      relationship: "depends-on",
      raw: { type: "depends-on" },
    });
  }

  for (let index = 0; index < targetNodes - 17; index += 17) {
    addDirectedEdge(graph, `${label}.node.${index}`, `${label}.node.${index + 17}`, {
      relationship: "references",
      raw: { type: "references" },
    });
  }

  return graph;
}

function buildDisconnectedOrphanHeavy(label, targetNodes) {
  const graph = new Graph({ type: "directed", multi: false });
  const componentCount = 10;
  const nodesPerComponent = 30;
  let nodeIndex = 0;

  for (let component = 0; component < componentCount; component += 1) {
    let previousId = null;
    for (let localIndex = 0; localIndex < nodesPerComponent; localIndex += 1) {
      const id = `${label}.component.${component}.node.${localIndex}`;
      addNode(graph, id, {
        raw: { type: localIndex === 0 ? "component-root" : "entity" },
        size: 8 + (localIndex % 4),
      });
      if (previousId) {
        addDirectedEdge(graph, previousId, id, {
          relationship: "links",
          raw: { type: "links" },
        });
      }
      previousId = id;
      nodeIndex += 1;
    }
  }

  while (nodeIndex < targetNodes) {
    addNode(graph, `${label}.orphan.${nodeIndex}`, {
      raw: { type: "entity" },
      size: 7,
    });
    nodeIndex += 1;
  }

  return graph;
}

function buildHierarchicalSpineGraph(label, targetNodes, options = {}) {
  const spineCount = options.spineCount ?? 4;
  const branchFactor = options.branchFactor ?? 2;
  const fileBurst = options.fileBurst ?? 3;
  const maxDepth = options.maxDepth ?? 3;
  const graph = new Graph({ type: "directed", multi: false });
  const queue = [];

  const fileKinds = ["file", "doc", "code", "config", "fixture"];
  let fileIndex = 0;
  let dirIndex = 0;

  for (let spineIndex = 0; spineIndex < spineCount; spineIndex += 1) {
    const spineId = label + ".spine." + spineIndex;
    addNode(graph, spineId, {
      nodeType: "spine",
      raw: { type: "spine" },
      size: 18,
    });

    const rootDirId = label + ".root." + spineIndex;
    addNode(graph, rootDirId, {
      nodeType: "directory",
      raw: { type: "directory" },
      size: 14,
    });
    addDirectedEdge(graph, spineId, rootDirId, {
      relationship: "contains",
      raw: { type: "contains" },
    });
    queue.push({ nodeId: rootDirId, depth: 0 });
  }

  while (queue.length > 0 && graph.order < targetNodes) {
    const current = queue.shift();
    if (!current) continue;
    const { nodeId, depth } = current;

    const remaining = targetNodes - graph.order;
    if (remaining <= 0) break;

    const childDirBudget = depth < maxDepth ? Math.min(branchFactor, Math.max(0, remaining - 1)) : 0;
    for (let index = 0; index < childDirBudget && graph.order < targetNodes; index += 1) {
      const childDirId = label + ".dir." + dirIndex;
      dirIndex += 1;
      addNode(graph, childDirId, {
        nodeType: "directory",
        raw: { type: "directory" },
        size: 12 + (depth % 3),
      });
      addDirectedEdge(graph, nodeId, childDirId, {
        relationship: "contains",
        raw: { type: "contains" },
      });
      queue.push({ nodeId: childDirId, depth: depth + 1 });
    }

    const fileBudget = Math.min(fileBurst, targetNodes - graph.order);
    for (let index = 0; index < fileBudget && graph.order < targetNodes; index += 1) {
      const fileKind = fileKinds[fileIndex % fileKinds.length];
      const fileId = label + ".file." + fileIndex;
      fileIndex += 1;
      addNode(graph, fileId, {
        nodeType: fileKind,
        raw: { type: fileKind },
        rawSize: 1 + (fileIndex % 17),
        size: 8 + (fileIndex % 5),
      });
      addDirectedEdge(graph, nodeId, fileId, {
        relationship: "contains",
        raw: { type: "contains" },
      });
    }
  }

  while (graph.order < targetNodes) {
    const orphanId = label + ".orphan." + graph.order;
    addNode(graph, orphanId, {
      raw: { type: "entity" },
      size: 7,
    });
  }

  return graph;
}

function buildMixedGraph(label, targetNodes) {
  const graph = buildHierarchicalSpineGraph(label + ".core", Math.max(1, Math.floor(targetNodes * 0.6)), {
    spineCount: 4,
    branchFactor: 2,
    fileBurst: 3,
    maxDepth: 2,
  });

  const hubId = label + ".hub";
  addNode(graph, hubId, {
    raw: { type: "hubish" },
    size: 20,
  });

  let genericIndex = 0;
  let previousId = hubId;
  while (graph.order < targetNodes) {
    const genericId = label + ".generic." + genericIndex;
    const kind = genericIndex % 5 === 0 ? "note" : genericIndex % 5 === 1 ? "tag" : "entity";
    addNode(graph, genericId, {
      raw: { type: kind },
      size: 8 + (genericIndex % 4),
    });

    if (genericIndex % 2 === 0) {
      addDirectedEdge(graph, previousId, genericId, {
        relationship: genericIndex % 4 === 0 ? "references" : "depends-on",
        raw: { type: genericIndex % 4 === 0 ? "references" : "depends-on" },
      });
      previousId = genericId;
    } else {
      addDirectedEdge(graph, hubId, genericId, {
        relationship: "references",
        raw: { type: "references" },
      });
    }

    if (genericIndex % 7 === 0 && graph.order < targetNodes) {
      const strayId = label + ".stray." + genericIndex;
      addNode(graph, strayId, {
        raw: { type: "entity" },
        size: 7,
      });
      addDirectedEdge(graph, genericId, strayId, {
        relationship: "links",
        raw: { type: "links" },
      });
    }

    genericIndex += 1;
  }

  return graph;
}
function inspectPositions(graph) {
  let missing = 0;
  let nonFinite = 0;

  graph.forEachNode((nodeId) => {
    const x = graph.getNodeAttribute(nodeId, "x");
    const y = graph.getNodeAttribute(nodeId, "y");
    const z = graph.getNodeAttribute(nodeId, "z");
    const hasX = typeof x === "number";
    const hasY = typeof y === "number";

    if (!hasX || !hasY) {
      missing += 1;
      return;
    }

    const zIsSafe = z === undefined || (typeof z === "number" && Number.isFinite(z));
    if (!Number.isFinite(x) || !Number.isFinite(y) || !zIsSafe) {
      nonFinite += 1;
    }
  });

  return {
    finitePositions: missing === 0 && nonFinite === 0,
    missingPositionCount: missing,
    nonFinitePositionCount: nonFinite,
  };
}

function getGraphCounts(graph) {
  return {
    nodeCount: graph.order,
    edgeCount: graph.size,
  };
}

function formatMs(value) {
  if (value === null) return "n/a";
  return String(roundMs(value)).padStart(8);
}

function percentile(values, p) {
  if (values.length === 0) return null;
  const sorted = values.slice().sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[index];
}

function measureManualSteps(controller, stepCount) {
  const stepDurations = [];
  const timingTotals = {
    totalMs: 0,
    resetMs: 0,
    seedLookupMs: 0,
    forceInteractionsMs: 0,
    auxForcesMs: 0,
    integrationMs: 0,
  };
  let timingSampleCount = 0;
  let totalMovedNodeCount = 0;
  let maxVelocity = 0;
  let lastAverageVelocity = 0;
  let warningCount = 0;

  for (let index = 0; index < stepCount; index += 1) {
    const step = time(() => controller.step());
    stepDurations.push(step.ms);
    totalMovedNodeCount += step.value.movedNodeCount;
    maxVelocity = Math.max(maxVelocity, step.value.maxVelocity);
    lastAverageVelocity = step.value.averageVelocity;
    warningCount += step.value.warnings.length;

    if (step.value.timings) {
      timingSampleCount += 1;
      for (const key of Object.keys(timingTotals)) {
        timingTotals[key] += step.value.timings[key] ?? 0;
      }
    }
  }

  const totalStepMs = stepDurations.reduce((sum, value) => sum + value, 0);
  const averageTimings = Object.fromEntries(
    Object.entries(timingTotals).map(([key, value]) => [
      key,
      timingSampleCount > 0 ? value / timingSampleCount : null,
    ]),
  );

  return {
    stepCount,
    averageStepMs: stepDurations.length > 0 ? totalStepMs / stepDurations.length : null,
    p95StepMs: percentile(stepDurations, 95),
    totalStepMs,
    totalMovedNodeCount,
    averageMovedNodeCount: stepDurations.length > 0
      ? totalMovedNodeCount / stepDurations.length
      : 0,
    maxVelocity,
    lastAverageVelocity,
    warningCount,
    stepTimingSampleCount: timingSampleCount,
    averageStepTimingsMs: averageTimings,
  };
}

function printResults(results) {
  const rows = [
    [
      "fixture",
      "nodes",
      "edges",
      "construct",
      "seed",
      "apply",
      "step avg",
      "step p95",
      "force avg",
      "integr avg",
      "moved avg",
      "warn",
      "finite",
      "missing",
      "nonfinite",
    ],
    ...results.map((result) => [
      result.fixture,
      String(result.nodeCount),
      String(result.edgeCount),
      formatMs(result.graphConstructionMs),
      formatMs(result.seedInitializationMs),
      formatMs(result.applyDialectSetupMs),
      formatMs(result.physicsStepAverageMs),
      formatMs(result.physicsStepP95Ms),
      formatMs(result.physicsStepTimingAverageMs?.forceInteractionsMs ?? null),
      formatMs(result.physicsStepTimingAverageMs?.integrationMs ?? null),
      String(Math.round(result.averageMovedNodeCount)),
      String(result.warningCount),
      result.finitePositions ? "yes" : "no",
      String(result.missingPositionCount),
      String(result.nonFinitePositionCount),
    ]),
  ];

  const widths = rows[0].map((_, columnIndex) =>
    Math.max(...rows.map((row) => row[columnIndex].length)),
  );

  console.log("\nGWells benchmark baseline");
  console.log(`Manual physics steps per fixture: ${BENCHMARK_STEP_COUNT}`);
  console.log("");

  rows.forEach((row, rowIndex) => {
    const line = row
      .map((cell, columnIndex) => cell.padEnd(widths[columnIndex]))
      .join("  ");
    console.log(line);
    if (rowIndex === 0) {
      console.log(widths.map((width) => "-".repeat(width)).join("  "));
    }
  });
}

async function main() {
  const gwells = await loadGwells();
  const raf = installRafStub();

  const fixtures = [
    {
      name: "filesystem-small",
      build: () => buildFilesystemLike("fs-small", 100),
    },
    {
      name: "filesystem-medium",
      build: () => buildFilesystemLike("fs-medium", 500),
    },
    {
      name: "filesystem-large",
      build: () => buildFilesystemLike("fs-large", 1800),
    },
    {
      name: "current-like-400",
      build: () => buildHierarchicalSpineGraph("current-like", 400, {
        spineCount: 4,
        branchFactor: 2,
        fileBurst: 3,
        maxDepth: 3,
      }),
    },
    {
      name: "hierarchy-1000",
      build: () => buildHierarchicalSpineGraph("hierarchy-1000", 1000, {
        spineCount: 6,
        branchFactor: 2,
        fileBurst: 4,
        maxDepth: 4,
      }),
    },
    {
      name: "hierarchy-2000",
      build: () => buildHierarchicalSpineGraph("hierarchy-2000", 2000, {
        spineCount: 8,
        branchFactor: 2,
        fileBurst: 4,
        maxDepth: 4,
      }),
    },
    {
      name: "stress-5000",
      build: () => buildHierarchicalSpineGraph("stress-5000", 5000, {
        spineCount: 12,
        branchFactor: 3,
        fileBurst: 4,
        maxDepth: 5,
      }),
    },
    {
      name: "wide-roots-30",
      build: () => buildHierarchicalSpineGraph("wide-roots-30", 480, {
        spineCount: 30,
        branchFactor: 1,
        fileBurst: 2,
        maxDepth: 2,
      }),
    },
    {
      name: "mixed-graph",
      build: () => buildMixedGraph("mixed-graph", 1000),
    },
    {
      name: "generic-no-spine",
      build: () => buildNoSpineGeneric("generic", 500),
    },
    {
      name: "disconnected-orphan-heavy",
      build: () => buildDisconnectedOrphanHeavy("orphan-heavy", 500),
    },
  ];

  try {
    const results = [];
    const dialect = gwells.getDialectById(DIALECT_ID);
    if (!dialect) {
      throw new Error(`Dialect not found: ${DIALECT_ID}`);
    }
    const seedFn = gwells.getSeedFunctionById(dialect.seedFunctionId);
    if (!seedFn) {
      throw new Error(`Seed function not found: ${dialect.seedFunctionId}`);
    }

    for (const fixture of fixtures) {
      const totalStart = nowMs();
      const construction = time(fixture.build);
      const counts = getGraphCounts(construction.value);

      const seedGraph = fixture.build();
      const seed = time(() => {
        seedFn.seed({ graph: seedGraph, config: dialect.config });
      });

      const applyGraph = fixture.build();
      const apply = time(() => gwells.applyDialect(applyGraph, DIALECT_ID));
      apply.value.pause();
      const manualSteps = measureManualSteps(apply.value, BENCHMARK_STEP_COUNT);
      apply.value.stop();

      const positionInspection = inspectPositions(applyGraph);

      results.push({
        fixture: fixture.name,
        dialectId: DIALECT_ID,
        nodeCount: counts.nodeCount,
        edgeCount: counts.edgeCount,
        graphConstructionMs: roundMs(construction.ms),
        seedInitializationMs: roundMs(seed.ms),
        applyDialectSetupMs: roundMs(apply.ms),
        physicsStepAverageMs: manualSteps.averageStepMs === null
          ? null
          : roundMs(manualSteps.averageStepMs),
        physicsStepP95Ms: manualSteps.p95StepMs === null
          ? null
          : roundMs(manualSteps.p95StepMs),
        physicsStepTotalMs: roundMs(manualSteps.totalStepMs),
        physicsStepCount: manualSteps.stepCount,
        totalMovedNodeCount: manualSteps.totalMovedNodeCount,
        averageMovedNodeCount: roundMs(manualSteps.averageMovedNodeCount),
        maxVelocity: roundMs(manualSteps.maxVelocity),
        lastAverageVelocity: roundMs(manualSteps.lastAverageVelocity),
        warningCount: manualSteps.warningCount,
        physicsStepTimingSampleCount: manualSteps.stepTimingSampleCount,
        physicsStepTimingAverageMs: Object.fromEntries(
          Object.entries(manualSteps.averageStepTimingsMs).map(([key, value]) => [
            key,
            value === null ? null : roundMs(value),
          ]),
        ),
        totalBenchmarkMs: roundMs(nowMs() - totalStart),
        finitePositions: positionInspection.finitePositions,
        missingPositionCount: positionInspection.missingPositionCount,
        nonFinitePositionCount: positionInspection.nonFinitePositionCount,
      });
    }

    printResults(results);

    fs.mkdirSync(BENCHMARK_OUTPUT_DIR, { recursive: true });
    fs.writeFileSync(
      BENCHMARK_LATEST_PATH,
      JSON.stringify({
        benchmark: "gwells",
        dialectId: DIALECT_ID,
        stepCount: BENCHMARK_STEP_COUNT,
        generatedAt: new Date().toISOString(),
        results,
      }, null, 2) + "\n",
    );
    console.log(`\nWrote ${path.relative(REPO_ROOT, BENCHMARK_LATEST_PATH)}`);

    const failures = results.filter((result) => !result.finitePositions);
    if (failures.length > 0) {
      console.error("\nPosition safety failed for:");
      for (const failure of failures) {
        console.error(
          `- ${failure.fixture}: missing=${failure.missingPositionCount}, nonFinite=${failure.nonFinitePositionCount}`,
        );
      }
      process.exitCode = 1;
    }

    if (raf.getScheduledCount() !== 0) {
      console.error(`\nRAF cleanup failed: ${raf.getScheduledCount()} frame(s) still scheduled`);
      process.exitCode = 1;
    }
  } finally {
    raf.restore();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
