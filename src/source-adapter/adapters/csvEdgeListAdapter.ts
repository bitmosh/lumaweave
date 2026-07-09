// SPDX-License-Identifier: Apache-2.0
/**
 * CSV Edge-List Adapter — CSV file to LumaWeave graph.
 * v109.4: RFC 4180 state-machine parser, header/index column modes, optional label→relationship.
 * Locked decisions: D1–D10 per BANDIT_v109_4_csv_edge_list.md
 */

import { SingleFileAdapter } from "../singleFileAdapter";
import type { AdapterCapabilities, AdapterConfig, CsvEdgeListConfig } from "../baseSourceAdapter";
import type { GraphSourceSummary, LumaWeaveEdgeDraft, LumaWeaveNodeDraft } from "../../graph/schema/graph.types";
import "./CsvEdgeListConfigForm"; // registers the config form as side effect

const HARD_NODE_CAP = 500;
const HARD_WARNING_CAP = 100;

function makeErrorSummary(error: string, filePath?: string): GraphSourceSummary {
  return {
    sourceId: "csv-edge-list",
    label: filePath ? `CSV Edge List: ${filePath}` : "CSV Edge List",
    sourcePath: filePath ?? "",
    publicBaseUrl: "",
    status: "error",
    graphPresent: false,
    manifestPresent: false,
    reportPresent: false,
    nodeCount: 0,
    edgeCount: 0,
    normalizedNodeCount: 0,
    normalizedEdgeCount: 0,
    warnings: [],
    error,
  };
}

// RFC 4180 character-by-character state machine (D3, D4).
// Handles: quoted fields with embedded delimiter, "" escape, multi-line quoted fields.
// Delimiter is treated as single-character (first char of the supplied string).
function parseCsv(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let inQuotes = false;
  const delim = delimiter.charCodeAt(0);

  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i);

    if (inQuotes) {
      if (ch === 0x22 /* " */) {
        // Look ahead: "" = escaped quote
        if (i + 1 < text.length && text.charCodeAt(i + 1) === 0x22) {
          currentField += '"';
          i++;
          continue;
        }
        // End of quoted field
        inQuotes = false;
        continue;
      }
      // Any char inside quotes (including newlines) is field content
      currentField += text[i];
      continue;
    }

    // Not in quotes
    if (ch === 0x22 /* " */ && currentField.length === 0) {
      inQuotes = true;
      continue;
    }

    if (ch === delim) {
      currentRow.push(currentField);
      currentField = "";
      continue;
    }

    if (ch === 0x0d /* \r */) {
      // CRLF → consume both, emit row
      if (i + 1 < text.length && text.charCodeAt(i + 1) === 0x0a) {
        i++;
      }
      currentRow.push(currentField);
      rows.push(currentRow);
      currentField = "";
      currentRow = [];
      continue;
    }

    if (ch === 0x0a /* \n */) {
      currentRow.push(currentField);
      rows.push(currentRow);
      currentField = "";
      currentRow = [];
      continue;
    }

    currentField += text[i];
  }

  // Final field/row if file doesn't end with a newline
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  // Filter trailing empty rows (ubiquitous in exported CSVs)
  return rows.filter((r) => r.some((cell) => cell.length > 0));
}

class CsvEdgeListAdapter extends SingleFileAdapter {
  readonly adapterId = "csv-edge-list";
  readonly adapterType = "csv-edge-list";
  readonly adapterVersion = "0.1.0";
  readonly capabilities: AdapterCapabilities = {
    supportsLiveRefresh: false,
    requiresUserPath: true,
    requiresNetwork: false,
    supportsFiltering: false,
    maxRecommendedNodes: HARD_NODE_CAP,
  };

  async load(config: AdapterConfig): Promise<GraphSourceSummary> {
    if (config.adapterId !== "csv-edge-list") {
      return makeErrorSummary("Adapter dispatch mismatch");
    }
    const cfg = config as CsvEdgeListConfig;

    if (!cfg.filePath?.trim()) {
      return makeErrorSummary("File path not configured");
    }

    const warnings: string[] = [];
    const hasHeader = cfg.hasHeader ?? true;
    const delimiter = cfg.delimiter ?? ",";
    const sourceColRef = cfg.sourceColumn ?? "source";
    const targetColRef = cfg.targetColumn ?? "target";
    const labelColRef = cfg.labelColumn;

    // D9: audible-ignore maxNodes config override
    if ((cfg as any).maxNodes && (cfg as any).maxNodes !== HARD_NODE_CAP) {
      warnings.push(`maxNodes config override not honored in v1.0; using default ${HARD_NODE_CAP}.`);
    }

    let raw: string;
    try {
      raw = await this.readUserFile(cfg.filePath);
    } catch (err) {
      return makeErrorSummary(`Cannot read file: ${err}`, cfg.filePath);
    }

    const rows = parseCsv(raw, delimiter);
    if (rows.length === 0) {
      return makeErrorSummary("File is empty or contains no data rows", cfg.filePath);
    }

    // Resolve column indices
    let sourceIdx: number;
    let targetIdx: number;
    let labelIdx: number | undefined;
    let dataRows: string[][];

    if (hasHeader) {
      const headerRow = rows[0];
      dataRows = rows.slice(1);

      sourceIdx = headerRow.indexOf(sourceColRef);
      if (sourceIdx < 0) {
        return makeErrorSummary(
          `Source column "${sourceColRef}" not found in header row`,
          cfg.filePath,
        );
      }
      targetIdx = headerRow.indexOf(targetColRef);
      if (targetIdx < 0) {
        return makeErrorSummary(
          `Target column "${targetColRef}" not found in header row`,
          cfg.filePath,
        );
      }
      if (labelColRef) {
        const idx = headerRow.indexOf(labelColRef);
        if (idx < 0) {
          warnings.push(
            `Label column "${labelColRef}" not found in header row; edges will have no relationship`,
          );
        } else {
          labelIdx = idx;
        }
      }
    } else {
      dataRows = rows;

      const parseIndex = (ref: string, name: string): number | Error => {
        const n = parseInt(ref, 10);
        if (isNaN(n) || n < 0) {
          return new Error(
            `${name} column "${ref}" is not a valid numeric index (hasHeader is false — provide a 0-based column index)`,
          );
        }
        return n;
      };

      const si = parseIndex(sourceColRef, "Source");
      if (si instanceof Error) return makeErrorSummary(si.message, cfg.filePath);
      sourceIdx = si;

      const ti = parseIndex(targetColRef, "Target");
      if (ti instanceof Error) return makeErrorSummary(ti.message, cfg.filePath);
      targetIdx = ti;

      if (labelColRef) {
        const li = parseIndex(labelColRef, "Label");
        if (li instanceof Error) return makeErrorSummary(li.message, cfg.filePath);
        labelIdx = li;
      }
    }

    // Process data rows
    const nodeMap = new Map<string, LumaWeaveNodeDraft>();
    const edges: LumaWeaveEdgeDraft[] = [];
    let malformedCount = 0;

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      // 1-based file row number (accounts for header line)
      const fileRowNum = hasHeader ? i + 2 : i + 1;
      const requiredIdx = Math.max(sourceIdx, targetIdx);

      if (row.length <= requiredIdx) {
        warnings.push(`Row ${fileRowNum}: not enough columns; skipped`);
        if (++malformedCount >= HARD_WARNING_CAP) {
          return makeErrorSummary(
            `File appears malformed: ${malformedCount} rows had errors. Check delimiter setting and file encoding.`,
            cfg.filePath,
          );
        }
        continue;
      }

      const source = (row[sourceIdx] ?? "").trim();
      const target = (row[targetIdx] ?? "").trim();

      if (!source) {
        warnings.push(`Row ${fileRowNum}: empty source; skipped`);
        if (++malformedCount >= HARD_WARNING_CAP) {
          return makeErrorSummary(
            `File appears malformed: ${malformedCount} rows had errors.`,
            cfg.filePath,
          );
        }
        continue;
      }
      if (!target) {
        warnings.push(`Row ${fileRowNum}: empty target; skipped`);
        if (++malformedCount >= HARD_WARNING_CAP) {
          return makeErrorSummary(
            `File appears malformed: ${malformedCount} rows had errors.`,
            cfg.filePath,
          );
        }
        continue;
      }

      // D8: node identity = trimmed cell value, no case normalization
      if (!nodeMap.has(source)) {
        nodeMap.set(source, {
          id: source,
          label: source,
          type: "node",
          raw: { kind: "node", sourceAdapter: "csv-edge-list" },
        });
      }
      if (!nodeMap.has(target)) {
        nodeMap.set(target, {
          id: target,
          label: target,
          type: "node",
          raw: { kind: "node", sourceAdapter: "csv-edge-list" },
        });
      }

      const labelCell =
        labelIdx !== undefined && labelIdx < row.length ? row[labelIdx].trim() : undefined;

      // D10: edge id = file row number for debuggability
      edges.push({
        id: `edge-${fileRowNum}`,
        source,
        target,
        relationship: labelCell || undefined,
        raw: { sourceAdapter: "csv-edge-list", rowIndex: fileRowNum },
      });
    }

    // D9: node cap — truncate + filter edges to kept nodes
    const allNodes = Array.from(nodeMap.values());
    let keptNodes = allNodes;
    if (allNodes.length > HARD_NODE_CAP) {
      keptNodes = allNodes.slice(0, HARD_NODE_CAP);
      warnings.push(
        `File contains ${allNodes.length} unique nodes; first ${HARD_NODE_CAP} kept, ${allNodes.length - HARD_NODE_CAP} discarded.`,
      );
    }
    const keptIds = new Set(keptNodes.map((n) => n.id));
    const keptEdges = edges.filter((e) => keptIds.has(e.source) && keptIds.has(e.target));

    return {
      status: "loaded",
      sourceId: "csv-edge-list",
      sourcePath: cfg.filePath,
      label: `CSV Edge List: ${cfg.filePath}`,
      publicBaseUrl: "",
      graphPresent: true,
      manifestPresent: false,
      reportPresent: false,
      nodeCount: keptNodes.length,
      edgeCount: keptEdges.length,
      normalizedNodeCount: keptNodes.length,
      normalizedEdgeCount: keptEdges.length,
      normalizedNodes: keptNodes,
      normalizedEdges: keptEdges,
      warnings,
    };
  }
}

const adapterInstance = new CsvEdgeListAdapter();
export const loadCsvEdgeList = (config: AdapterConfig) => adapterInstance.load(config);
