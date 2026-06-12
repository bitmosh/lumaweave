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
  }

  const totalStepMs = stepDurations.reduce((sum, value) => sum + value, 0);

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
