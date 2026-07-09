// SPDX-License-Identifier: Apache-2.0
import { create } from "zustand";

export interface DebugRendererInfo {
  sigmaInputNodes: number | null;
  sigmaInputEdges: number | null;
  graphologyOrder: number | null;
  graphologySize: number | null;
  uniqueX: number | null;
  uniqueY: number | null;
  minX: number | null;
  maxX: number | null;
  minY: number | null;
  maxY: number | null;
  currentNodeSize: number | null;
  neighborhoodDepth: number | null;
  nodeLabelMode: string | null;
  edgeLabelMode: string | null;
  maxEdgeLabelLength: number | null;
  edgeLabelFontSize: number | null;
  nodeLabelFontSize: number | null;
  showLabelsOnHover: boolean | null;
  zoomLabelThreshold: number | null;
}

export interface DebugInteractionInfo {
  hoveredNodeId: string | null;
  hoveredEdgeId: string | null;
  activeSelectionMode: string;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
}

export interface DebugNeighborhoodInfo {
  sourceId: string | null;
  targetId: string | null;
  secondaryEdgeCount: number;
  secondaryNodeCount: number;
}

export interface DebugNodeNeighborhoodInfo {
  directEdgeCount: number;
  directNeighborCount: number;
}

interface DebugStoreState {
  renderer: DebugRendererInfo;
  interaction: DebugInteractionInfo;
  neighborhood: DebugNeighborhoodInfo;
  nodeNeighborhood: DebugNodeNeighborhoodInfo;

  setRenderer: (info: DebugRendererInfo) => void;
  setInteraction: (info: DebugInteractionInfo) => void;
  setNeighborhood: (info: DebugNeighborhoodInfo) => void;
  setNodeNeighborhood: (info: DebugNodeNeighborhoodInfo) => void;
}

const DEFAULT_RENDERER: DebugRendererInfo = {
  sigmaInputNodes: null,
  sigmaInputEdges: null,
  graphologyOrder: null,
  graphologySize: null,
  uniqueX: null,
  uniqueY: null,
  minX: null,
  maxX: null,
  minY: null,
  maxY: null,
  currentNodeSize: null,
  neighborhoodDepth: null,
  nodeLabelMode: null,
  edgeLabelMode: null,
  maxEdgeLabelLength: null,
  edgeLabelFontSize: null,
  nodeLabelFontSize: null,
  showLabelsOnHover: null,
  zoomLabelThreshold: null,
};

const DEFAULT_INTERACTION: DebugInteractionInfo = {
  hoveredNodeId: null,
  hoveredEdgeId: null,
  activeSelectionMode: "none",
  selectedNodeId: null,
  selectedEdgeId: null,
};

const DEFAULT_NEIGHBORHOOD: DebugNeighborhoodInfo = {
  sourceId: null,
  targetId: null,
  secondaryEdgeCount: 0,
  secondaryNodeCount: 0,
};

const DEFAULT_NODE_NEIGHBORHOOD: DebugNodeNeighborhoodInfo = {
  directEdgeCount: 0,
  directNeighborCount: 0,
};

export const useDebugStore = create<DebugStoreState>((set) => ({
  renderer: DEFAULT_RENDERER,
  interaction: DEFAULT_INTERACTION,
  neighborhood: DEFAULT_NEIGHBORHOOD,
  nodeNeighborhood: DEFAULT_NODE_NEIGHBORHOOD,

  setRenderer: (info) => set({ renderer: info }),
  setInteraction: (info) => set({ interaction: info }),
  setNeighborhood: (info) => set({ neighborhood: info }),
  setNodeNeighborhood: (info) => set({ nodeNeighborhood: info }),
}));
