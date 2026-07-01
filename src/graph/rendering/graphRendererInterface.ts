/**
 * GraphRenderer Interface
 *
 * Abstract renderer contract. Current implementation is Sigma2d;
 * future implementations (Sigma WebGPU, Three.js companion) honor the same interface.
 */

import type Graph from "graphology";

export interface RendererCamera {
  x: number;
  y: number;
  zoom: number;
  rotation: number;
}

export interface GraphRenderer {
  mount: (container: HTMLElement, graph: Graph) => void;
  unmount: () => void;
  refresh: () => void;
  getCamera: () => RendererCamera;
  setCamera: (camera: RendererCamera) => void;
}
