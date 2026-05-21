import manifestData from "./provenance-manifest.json";

export interface ProvenanceEntry {
  filePath: string;
  startLine: number;
  endLine: number;
  snippet: string;
}

const manifest: Record<string, ProvenanceEntry> = manifestData as Record<string, ProvenanceEntry>;

export function getProvenance(targetId: string): ProvenanceEntry | undefined {
  return manifest[targetId];
}

export function getAllProvenance(): Map<string, ProvenanceEntry> {
  return new Map(Object.entries(manifest));
}

if (
  typeof window !== "undefined" &&
  (import.meta.env.DEV || (window as any).PLAYWRIGHT)
) {
  (window as any).__lwProvenanceRegistry = {
    getProvenance,
    getAllProvenance,
  };
}
