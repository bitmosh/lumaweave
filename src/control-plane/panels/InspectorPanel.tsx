import type {
  LumaWeaveEdgeDraft,
  LumaWeaveNodeDraft,
} from "../../graph/schema/graph.types";

type GraphSummary = {
  source: string;
  rawNodeCount: number;
  rawEdgeCount: number;
  normalizedNodeCount: number;
  normalizedEdgeCount: number;
  renderer: string;
  layout: string;
  status: string;
};

type InspectorPanelProps = {
  selectedNode: LumaWeaveNodeDraft | null;
  selectedEdge?: LumaWeaveEdgeDraft | null;
  selectedEdgeSource?: LumaWeaveNodeDraft | null;
  selectedEdgeTarget?: LumaWeaveNodeDraft | null;
  secondaryEdgeCount?: number;
  secondaryNodeCount?: number;
  graphSummary: GraphSummary;
};

function MetadataRow({
  label,
  value,
}: {
  label: string;
  value: unknown;
}) {
  if (value === undefined || value === null || value === "") return null;

  return (
    <div className="flex justify-between gap-4 text-xs">
      <span className="text-slate-500">{label}:</span>
      <span className="max-w-56 truncate text-right text-slate-200">
        {String(value)}
      </span>
    </div>
  );
}

function RawPreview({ raw }: { raw: Record<string, unknown> }) {
  const rawText = JSON.stringify(raw, null, 2);
  const truncated = rawText.length > 1200;
  const preview = truncated ? rawText.slice(0, 1200) : rawText;

  return (
    <div className="mt-3">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
        Raw Metadata Preview
      </div>
      <pre className="max-h-72 overflow-auto rounded-lg border border-cyan-400/10 bg-slate-950/80 p-3 text-[11px] leading-relaxed text-slate-300">
        {preview}
        {truncated ? "\n\n... raw preview truncated" : ""}
      </pre>
    </div>
  );
}

export function InspectorPanel({
  selectedNode,
  selectedEdge,
  selectedEdgeSource,
  selectedEdgeTarget,
  secondaryEdgeCount,
  secondaryNodeCount,
  graphSummary,
}: InspectorPanelProps) {
  if (selectedEdge) {
    return (
      <section className="rounded-xl border border-amber-400/20 bg-slate-950/70 p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-amber-300">
          Selected Relationship
        </h3>

        <div className="space-y-2">
          <MetadataRow label="Edge ID" value={selectedEdge.id} />
          <MetadataRow
            label="Relationship"
            value={selectedEdge.relationship || "related"}
          />
          <MetadataRow label="Source" value={selectedEdge.source} />
          <MetadataRow label="Source Label" value={selectedEdgeSource?.label} />
          <MetadataRow label="Target" value={selectedEdge.target} />
          <MetadataRow label="Target Label" value={selectedEdgeTarget?.label} />

          <MetadataRow
            label="Confidence"
            value={
              selectedEdge.raw?.confidence_score ??
              selectedEdge.raw?.confidence ??
              undefined
            }
          />
          <MetadataRow label="Source File" value={selectedEdge.raw?.source_file} />
          <MetadataRow
            label="Source Location"
            value={selectedEdge.raw?.source_location}
          />
          {secondaryEdgeCount !== undefined && secondaryEdgeCount > 0 && (
            <MetadataRow label="Secondary Edges" value={secondaryEdgeCount} />
          )}
          {secondaryNodeCount !== undefined && secondaryNodeCount > 0 && (
            <MetadataRow label="Secondary Nodes" value={secondaryNodeCount} />
          )}
        </div>

        <RawPreview raw={selectedEdge.raw} />
      </section>
    );
  }

  if (selectedNode) {
    return (
      <section className="rounded-xl border border-cyan-400/20 bg-slate-950/70 p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-cyan-300">
          Selected Node
        </h3>

        <div className="space-y-2">
          <MetadataRow label="Node ID" value={selectedNode.id} />
          <MetadataRow label="Label" value={selectedNode.label} />
          <MetadataRow label="Type" value={selectedNode.type} />
          <MetadataRow label="Source File" value={selectedNode.raw?.source_file} />
          <MetadataRow
            label="Source Location"
            value={selectedNode.raw?.source_location}
          />
          <MetadataRow label="Community" value={selectedNode.raw?.community} />
          <MetadataRow label="File Type" value={selectedNode.raw?.file_type} />
        </div>

        <RawPreview raw={selectedNode.raw} />
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-cyan-400/20 bg-slate-950/70 p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-cyan-300">
        Graph Inspector
      </h3>

      <div className="space-y-2">
        <MetadataRow label="Source" value={graphSummary.source} />
        <MetadataRow label="Status" value={graphSummary.status} />
        <MetadataRow label="Renderer" value={graphSummary.renderer} />
        <MetadataRow label="Layout" value={graphSummary.layout} />
        <MetadataRow label="Raw Nodes" value={graphSummary.rawNodeCount} />
        <MetadataRow label="Raw Edges" value={graphSummary.rawEdgeCount} />
        <MetadataRow
          label="Normalized Nodes"
          value={graphSummary.normalizedNodeCount}
        />
        <MetadataRow
          label="Normalized Edges"
          value={graphSummary.normalizedEdgeCount}
        />
      </div>
    </section>
  );
}