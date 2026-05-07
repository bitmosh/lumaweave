/**
 * YAML Frontmatter Graph Parser
 *
 * Auto-generates LumaSourceGraph from docs/ YAML frontmatter.
 * Replaces the static self-graph fixture with a live parser.
 *
 * Node count: ~131 (108 doc files + 23 folder nodes)
 * Edge count: ~108 (folder→file containment) + inferred edges
 */

import type {
  LumaGraphEdge,
  LumaGraphNode,
  LumaSourceGraph,
} from "./types";

interface DocFrontmatter {
  id?: string;
  title?: string;
  type?: string;
  status?: string;
  domain?: string;
  cluster?: string;
  include_in_self_graph?: boolean;
  tags?: string[];
}

/**
 * Simple frontmatter parser using regex.
 * Extracts YAML frontmatter from markdown files without gray-matter.
 */
function parseFrontmatter(content: string): { data: any; content: string } {
  // Check if frontmatter exists (starts with ---)
  if (!content.startsWith("---")) {
    return { data: {}, content };
  }

  // Find the end of frontmatter (second ---)
  const endIndex = content.indexOf("\n---", 3);
  if (endIndex === -1) {
    return { data: {}, content };
  }

  const frontmatterText = content.slice(3, endIndex);
  const bodyContent = content.slice(endIndex + 4);

  // Parse key-value pairs
  const data: any = {};
  const lines = frontmatterText.split("\n");
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    
    const colonIndex = trimmed.indexOf(":");
    if (colonIndex === -1) continue;
    
    const key = trimmed.slice(0, colonIndex).trim();
    let value: any = trimmed.slice(colonIndex + 1).trim();
    
    // Handle quoted strings
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    
    // Handle arrays (simple comma-separated)
    if (value.startsWith("[") && value.endsWith("]")) {
      const arrayContent = value.slice(1, -1);
      if (arrayContent.trim()) {
        value = arrayContent.split(",").map((item: string) => {
          item = item.trim();
          if ((item.startsWith('"') && item.endsWith('"')) || 
              (item.startsWith("'") && item.endsWith("'"))) {
            return item.slice(1, -1);
          }
          return item;
        });
      } else {
        value = [];
      }
    }
    
    // Handle booleans
    if (value === "true") value = true;
    if (value === "false") value = false;
    
    data[key] = value;
  }

  return { data, content: bodyContent };
}

export function buildSelfGraphFromDocs(): LumaSourceGraph {
  const nodes: LumaGraphNode[] = [];
  const edges: LumaGraphEdge[] = [];
  const foldersSeen = new Set<string>();

  // Import all markdown files from docs/ as raw strings
  // Use absolute path from project root
  const docFiles = import.meta.glob("/docs/**/*.md", {
    eager: true,
    query: "?raw",
    import: "default",
  }) as Record<string, string>;
  
  const fileCount = Object.keys(docFiles).length;
  console.log("Vite glob loaded files:", fileCount);

  // Process each doc file
  Object.entries(docFiles).forEach(([path, content]) => {
    const { data } = parseFrontmatter(content);
    const fm = data as DocFrontmatter;

    // Skip files not included in self graph
    if (!fm.include_in_self_graph) return;
    if (!fm.id || !fm.domain) return;

    // Ensure folder node exists
    const folderNodeId = `docs.folder.${fm.domain}`;
    if (!foldersSeen.has(folderNodeId)) {
      foldersSeen.add(folderNodeId);
      nodes.push({
        id: folderNodeId,
        label: fm.domain,
        type: "docs.folder",
        cluster: fm.cluster ?? "gray",
        sourceAdapter: "yaml-frontmatter-parser",
        metadata: { path: `docs/${fm.domain}` },
      });
    }

    // Add doc file node
    const nodeId = `docs.file.${fm.id}`;
    nodes.push({
      id: nodeId,
      label: fm.title ?? fm.id,
      type: `docs.${fm.type ?? "file"}`,
      cluster: fm.cluster ?? "gray",
      sourceAdapter: "yaml-frontmatter-parser",
      metadata: {
        path,
        status: fm.status,
        domain: fm.domain,
        tags: fm.tags ?? [],
      },
    });

    // Add contains edge: folder → file
    edges.push({
      id: `edge.contains.${nodeId}`,
      source: folderNodeId,
      target: nodeId,
      type: "contains",
      confidence: "observed",
      metadata: {},
    });
  });

  // Add code spine nodes (same as current fixture)
  const CODE_SPINES = [
    { id: "code.system.core", label: "core", cluster: "blue", path: "src/app" },
    { id: "code.system.graph", label: "graph", cluster: "blue", path: "src/graph" },
    { id: "code.system.theme", label: "theme", cluster: "gold", path: "src/themes" },
    { id: "code.system.audio", label: "audio", cluster: "green", path: "src/audio" },
    { id: "code.system.accessibility", label: "accessibility", cluster: "green", path: "src/accessibility" },
    {
      id: "code.system.source-adapter",
      label: "source-adapter",
      cluster: "green",
      path: "src/source-adapter",
    },
    {
      id: "code.system.control-plane",
      label: "control-plane",
      cluster: "purple",
      path: "src/control-plane",
    },
    {
      id: "code.system.modes",
      label: "modes",
      cluster: "teal",
      path: "src/control-plane/modes",
    },
  ];

  CODE_SPINES.forEach((spine) => {
    nodes.push({
      id: spine.id,
      label: spine.label,
      type: "code.system",
      cluster: spine.cluster,
      sourceAdapter: "yaml-frontmatter-parser",
      metadata: { path: spine.path },
    });
  });

  // Add governs edges: contract/policy docs → code systems
  // Match by domain to code system
  const DOMAIN_TO_CODE_SYSTEM: Record<string, string> = {
    graph: "code.system.graph",
    theme: "code.system.theme",
    audio: "code.system.audio",
    accessibility: "code.system.accessibility",
    "source-adapter": "code.system.source-adapter",
    "control-plane": "code.system.control-plane",
  };

  nodes
    .filter(
      (n) =>
        n.type?.includes("contract") || n.type?.includes("policy")
    )
    .forEach((n) => {
      const domain = (n.metadata?.domain as string) ?? "";
      const target = DOMAIN_TO_CODE_SYSTEM[domain];
      if (target && nodes.find((nn) => nn.id === target)) {
        edges.push({
          id: `edge.governs.${n.id}`,
          source: n.id,
          target,
          type: "governs",
          confidence: "observed",
          metadata: {},
        });
      }
    });

  console.log("YAML frontmatter parser generated graph", {
    nodes: nodes.length,
    edges: edges.length,
    folders: foldersSeen.size,
  });

  return {
    nodes,
    edges,
    metadata: {
      adapterId: "yaml-frontmatter-parser",
      createdAt: new Date().toISOString(),
      inputSummary: `${nodes.length} nodes from docs/ YAML frontmatter`,
      nodeCount: nodes.length,
      edgeCount: edges.length,
      warnings: [],
    },
  };
}
