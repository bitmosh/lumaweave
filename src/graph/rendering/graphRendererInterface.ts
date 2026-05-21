/**
 * GraphRenderer Interface
 *
 * Abstract renderer contract. Current implementation is Sigma2d;
 * future implementations (Sigma WebGPU, Three.js companion in v94)
 * honor the same interface.
 *
 * Contract: docs/graph/contracts/GRAPH_RENDERER_INTERFACE_CONTRACT.md
 */

export interface RendererCamera {
  x: number;
  y: number;
  zoom: number;
  rotation: number;
}

export interface GraphRenderer {
  mount: (container: HTMLElement, graph: any) => void;
  unmount: () => void;
  refresh: () => void;
  getCamera: () => RendererCamera;
  setCamera: (camera: RendererCamera) => void;
}
