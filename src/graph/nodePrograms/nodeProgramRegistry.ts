import type { NodeProgramId, NodeProgramConstructor } from "./types";
import GlassSphereProgram from "./GlassSphereProgram";
import SunProgram from "./SunProgram";
import CrystalProgram from "./CrystalProgram";
import OrbProgram from "./OrbProgram";
import PipProgram from "./PipProgram";

// v90a: Central registry for per-node geometry programs.
// Consumers iterate this registry rather than hardcoding program lists.
// SigmaGraphView reads this registry to populate nodeProgramClasses.
//
// Sigma 3 dynamic type change behavior (verified from sigma.esm.js bindGraphHandlers):
// setNodeAttribute(node, "type", newProgramId) triggers updateNodeGraphUpdate →
// refresh({ skipIndexation: false }) — full re-index, new program renders immediately.
// No full Sigma reconstruction needed. Constraint: ALL target programs must be
// pre-registered in nodeProgramClasses at construction. v89.4 per-node Geometry
// spoke can rely on live type switching.

export interface NodeProgramEntry {
  id: NodeProgramId;
  label: string;
  description: string;
  status: "active" | "stub";
  programClass: NodeProgramConstructor;
}

export const NODE_PROGRAM_REGISTRY: readonly NodeProgramEntry[] = [
  {
    id: "glass-sphere",
    label: "Glass Sphere",
    description: "Specular sphere with hum pulse and flow rotation. Default program.",
    status: "active",
    programClass: GlassSphereProgram as unknown as NodeProgramConstructor,
  },
  {
    id: "sun",
    label: "Sun",
    description: "Multi-ring corona with pulsing outer ring. Hub and identity nodes.",
    status: "active",
    programClass: SunProgram as unknown as NodeProgramConstructor,
  },
  {
    id: "crystal",
    label: "Crystal",
    description: "Faceted, refractive geometry with sharp specular highlights. Decision nodes, formal types.",
    status: "active",
    programClass: CrystalProgram as unknown as NodeProgramConstructor,
  },
  {
    id: "orb",
    label: "Orb",
    description: "Soft luminous breathing sphere with gentle halo bloom. Ambient, data-presence, and background nodes.",
    status: "active",
    programClass: OrbProgram as unknown as NodeProgramConstructor,
  },
  {
    id: "pip",
    label: "Pip",
    description: "GlassSphere variant: minimal animation, tight glow. Leaf nodes.",
    status: "stub",
    programClass: PipProgram as unknown as NodeProgramConstructor,
  },
] as const;

export function listNodePrograms(): readonly NodeProgramEntry[] {
  return NODE_PROGRAM_REGISTRY;
}

export function getNodeProgramById(id: NodeProgramId): NodeProgramEntry | undefined {
  return NODE_PROGRAM_REGISTRY.find((entry) => entry.id === id);
}

export function filterByStatus(
  status: NodeProgramEntry["status"]
): readonly NodeProgramEntry[] {
  return NODE_PROGRAM_REGISTRY.filter((entry) => entry.status === status);
}

export function validateNodeProgramEntry(entry: NodeProgramEntry): string[] {
  const errors: string[] = [];
  if (!entry.id) errors.push("Missing id");
  if (!entry.label) errors.push("Missing label");
  if (!entry.description) errors.push("Missing description");
  if (!entry.programClass) errors.push("Missing programClass");
  if (!["active", "stub"].includes(entry.status))
    errors.push(`Unknown status: ${entry.status}`);
  return errors;
}

const VALID_PROGRAM_IDS = new Set<NodeProgramId>(
  NODE_PROGRAM_REGISTRY.map((e) => e.id)
);

export function resolveNodeProgramId(value: string | undefined): NodeProgramId {
  if (value && VALID_PROGRAM_IDS.has(value as NodeProgramId)) {
    return value as NodeProgramId;
  }
  return "glass-sphere";
}

export function buildNodeProgramClasses(): Record<string, NodeProgramConstructor> {
  const result: Record<string, NodeProgramConstructor> = {};
  for (const entry of NODE_PROGRAM_REGISTRY) {
    result[entry.id] = entry.programClass;
  }
  return result;
}
