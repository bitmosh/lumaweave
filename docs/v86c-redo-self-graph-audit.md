# v86c Self-Graph Generation Audit

**Generated:** 2026-05-11
**Purpose:** Diagnostic audit of current self-graph generation system
**Phase:** 1 (read-only - no modifications)

---

## 1. scripts/generate-self-graph.mjs

**Line Count:** 230 lines

**What It Extracts:**
- **Nodes:** From docs/ YAML frontmatter (.md files only)
  - Recursively finds all .md files in docs/ directory
  - Processes files with `include_in_self_graph: true` frontmatter
  - Requires `id` and `domain` frontmatter fields
- **Edges:** Generated programmatically
  - `contains` edges: folder → file (automatic for each file)
  - `governs` edges: contract/policy → code spine (domain-to-spine mapping)

**Frontmatter Fields Read:**
- `include_in_self_graph` (boolean) - required for inclusion
- `id` (string) - required for node ID generation
- `domain` (string) - required for folder assignment and spine mapping
- `cluster` (string) - optional, defaults to "gray"
- `type` (string) - optional, defaults to "file"
- `title` (string) - optional, defaults to `id`
- `status` (string) - optional, stored in metadata
- `tags` (array) - optional, stored in metadata

**Node Attributes Set:**
```javascript
{
  id: string,           // "docs.file.{id}" or "code.system.{spine}"
  label: string,        // title or id
  type: string,         // "docs.{type}" or "code.system"
  cluster: string,      // from frontmatter or spine definition
  sourceAdapter: string, // always "yaml-frontmatter-parser"
  metadata: {
    path: string,        // relative file path
    status: string,     // from frontmatter (docs only)
    domain: string,     // from frontmatter (docs only)
    tags: array,        // from frontmatter (docs only)
  }
}
```

**Edge Attributes Set:**
```javascript
{
  id: string,           // "edge.{type}.{target}"
  source: string,      // folder ID or doc ID
  target: string,      // file ID or spine ID
  type: string,        // "contains" or "governs"
  confidence: string,  // always "observed"
  metadata: {}         // always empty object
}
```

**Code Spine Nodes (Hardcoded):**
- 8 predefined spine nodes: core, graph, theme, audio, accessibility, source-adapter, control-plane, modes
- Each has type "code.system", cluster color, and path mapping

**Does It Generate manifest.json?**
- **NO** - The generator does NOT generate manifest.json

**Does It Generate GRAPH_REPORT.md?**
- **NO** - The generator does NOT generate GRAPH_REPORT.md

**Where It Writes Outputs:**
- Single output file: `src/fixtures/self-graph-generated.json`
- Output format: JSON with `nodes`, `edges`, `metadata` top-level fields
- Deduplicates nodes by ID (warns on duplicates)
- Filters edges to ensure source/target nodes exist

**Output Schema:**
```json
{
  "nodes": [...],
  "edges": [...],
  "metadata": {
    "adapterId": "yaml-frontmatter-parser",
    "createdAt": "ISO timestamp",
    "inputSummary": "X nodes from docs/ YAML frontmatter",
    "nodeCount": number,
    "edgeCount": number,
    "warnings": []
  }
}
```

---

## 2. src/fixtures/self-graph-generated.json

**First 50 Lines (nodes array head):**
```json
{
  "nodes": [
    {
      "id": "code.system.core",
      "label": "core",
      "type": "code.system",
      "cluster": "blue",
      "sourceAdapter": "yaml-frontmatter-parser",
      "metadata": {
        "path": "src/app"
      }
    },
    {
      "id": "code.system.graph",
      "label": "graph",
      "type": "code.system",
      "cluster": "blue",
      "sourceAdapter": "yaml-frontmatter-parser",
      "metadata": {
        "path": "src/graph"
      }
    },
    ... (continues with code spines, then docs.folder, then docs.file nodes)
```

**Last 30 Lines (edges array tail + metadata):**
```json
    {
      "id": "edge.contains.docs.file.vr.agent.familiar.system",
      "source": "docs.folder.vr",
      "target": "docs.file.vr.agent.familiar.system",
      "type": "contains",
      "confidence": "observed",
      "metadata": {}
    },
    {
      "id": "edge.contains.docs.file.vr.compatibility.concept",
      "source": "docs.folder.vr",
      "target": "docs.file.vr.compatibility.concept",
      "type": "contains",
      "confidence": "observed",
      "metadata": {}
    }
  ],
  "metadata": {
    "adapterId": "yaml-frontmatter-parser",
    "createdAt": "2026-05-11T18:00:38.621Z",
    "inputSummary": "147 nodes from docs/ YAML frontmatter",
    "nodeCount": 147,
    "edgeCount": 144,
    "warnings": []
  }
}
```

**Total Node Count:** 147
- 8 code system spine nodes
- 139 docs nodes (folders + files)

**Total Edge Count:** 144
- All "contains" edges (folder → file)
- Some "governs" edges (contract/policy → code spine)

**Top-Level Schema Fields Present:**
- `nodes` (array)
- `edges` (array)
- `metadata` (object)

**Data Integrity Issues:**
- None obvious from sample
- JSON is valid and well-formed
- Node IDs follow consistent naming convention
- Edge IDs follow consistent naming convention
- All edges reference valid node IDs (filtered during generation)

---

## 3. src/fixtures/self-graph-adapter.ts

**Schema Expected:**
```typescript
LumaSourceGraph {
  nodes: LumaGraphNode[];
  edges: LumaGraphEdge[];
  metadata?: {
    adapterId?: string;
    createdAt?: string;
    inputSummary?: string;
    nodeCount?: number;
    edgeCount?: number;
    warnings?: string[];
  };
}
```

**What Happens on JSON.parse Error:**
- **The adapter itself does NOT perform JSON parsing**
- JSON parsing happens at the file loading site (likely in the graph component)
- No explicit error handling in the adapter
- If JSON.parse fails, the error would propagate to the caller

**Does It Try to Load manifest.json?**
- **NO** - The adapter does NOT attempt to load manifest.json

**Does It Try to Load GRAPH_REPORT.md?**
- **NO** - The adapter does NOT attempt to load GRAPH_REPORT.md

**Adapter Function:**
```typescript
adaptSelfGraphToSigma(graph: LumaSourceGraph): {
  nodes: LumaWeaveNodeDraft[];
  edges: LumaWeaveEdgeDraft[];
}
```

**Transformation Logic:**
- Maps `LumaGraphNode` → `LumaWeaveNodeDraft`
- Maps `LumaGraphEdge` → `LumaWeaveEdgeDraft`
- Applies color mappings based on cluster
- Applies size mappings based on type
- Applies edge color mappings based on edge type
- Spreads metadata into `raw` field

**Color/Size Mappings (Hardcoded):**
- Clusters: blue (#4fa3e0), purple (#a67de8), gold (#e0a84f), teal (#4fd9c8), green (#64d9a4), gray (#6a7485)
- Types: code.system (18), docs.folder (12), code.file (8), docs.file (8), code.test (6), code.script (6)
- Edge types: contains (blue), governs (purple), depends_on (teal), related (green), imports (gold)

---

## Operator-Reported Errors

### Error 1: "JSON.parse: unexpected character at line 1 column 1 of the JSON data"

**Root Cause:**
- The file `src/fixtures/self-graph-generated.json` is being loaded from an incorrect path or the file is corrupted
- The adapter expects the file to exist at the expected location
- No explicit error handling in the loading path
- **Possible causes:**
  1. File was deleted or moved
  2. File has encoding issues
  3. Loading code is reading from wrong path
  4. File is empty or contains non-JSON content

**Investigation Needed:**
- Verify the file exists at `src/fixtures/self-graph-generated.json`
- Check file encoding (should be UTF-8)
- Verify file content starts with `{` (valid JSON object)
- Check the loading code in the graph component

### Error 2: "manifest.json: missing"

**Root Cause:**
- The generator (`scripts/generate-self-graph.mjs`) does NOT generate manifest.json
- The adapter does NOT attempt to load manifest.json
- **The loading code (likely in SigmaGraphView or a parent component) expects manifest.json to exist**
- manifest.json exists at `dist/examples/ai-lab/graphify-out/manifest.json` but NOT in `src/fixtures/`

**Investigation Needed:**
- Identify where manifest.json is being loaded
- Determine if manifest.json generation needs to be added to the generator
- Or determine if the loading code needs to be updated to not expect manifest.json

### Error 3: "GRAPH_REPORT.md: missing"

**Root Cause:**
- The generator (`scripts/generate-self-graph.mjs`) does NOT generate GRAPH_REPORT.md
- The adapter does NOT attempt to load GRAPH_REPORT.md
- **The loading code (likely in SigmaGraphView or a parent component) expects GRAPH_REPORT.md to exist**
- GRAPH_REPORT.md exists at `dist/examples/ai-lab/graphify-out/GRAPH_REPORT.md` but NOT in `src/fixtures/`

**Investigation Needed:**
- Identify where GRAPH_REPORT.md is being loaded
- Determine if GRAPH_REPORT.md generation needs to be added to the generator
- Or determine if the loading code needs to be updated to not expect GRAPH_REPORT.md

---

## Summary of Findings

### Generator (scripts/generate-self-graph.mjs)
- ✅ Extracts nodes from docs/ YAML frontmatter
- ✅ Generates contains and governs edges
- ✅ Reads frontmatter fields: id, domain, cluster, type, title, status, tags
- ✅ Sets appropriate node/edge attributes
- ❌ Does NOT generate manifest.json
- ❌ Does NOT generate GRAPH_REPORT.md
- ✅ Writes to src/fixtures/self-graph-generated.json

### Generated JSON (src/fixtures/self-graph-generated.json)
- ✅ Valid JSON structure
- ✅ 147 nodes, 144 edges
- ✅ Top-level schema: nodes, edges, metadata
- ✅ No obvious data integrity issues

### Adapter (src/fixtures/self-graph-adapter.ts)
- ✅ Expects LumaSourceGraph schema
- ❌ No JSON.parse error handling (delegates to caller)
- ❌ Does NOT load manifest.json
- ❌ Does NOT load GRAPH_REPORT.md
- ✅ Transforms nodes/edges to Sigma format

### Root Causes Identified
1. **JSON.parse error:** Loading code expects valid JSON at a specific path - file may be missing or corrupted
2. **manifest.json missing:** Generator doesn't create it, but loading code expects it
3. **GRAPH_REPORT.md missing:** Generator doesn't create it, but loading code expects it

---

## Recommendations for Phase 2

1. **Fix JSON.parse error:**
   - Verify file exists and is valid JSON
   - Add error handling in loading code
   - Add validation in adapter

2. **Add manifest.json generation:**
   - Add manifest.json output to generator
   - Include graph metadata, node/edge counts, generation timestamp
   - Write to same directory as self-graph-generated.json

3. **Add GRAPH_REPORT.md generation:**
   - Add GRAPH_REPORT.md output to generator
   - Include graph statistics, cluster distribution, edge type distribution
   - Write to same directory as self-graph-generated.json

4. **Upgrade extraction (as requested):**
   - Add code files as nodes (currently only docs/ files)
   - Use frontmatter richness for cluster, status, tags, references
   - Extract code dependencies as edges (imports, depends_on)
   - Add references frontmatter field handling

---

**Audit Complete:** Phase 1 (read-only diagnostic)
**Next Phase:** Awaiting operator + Claude review before authorizing Phase 2
