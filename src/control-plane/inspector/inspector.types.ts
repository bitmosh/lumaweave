/**
 * Inspector Types
 *
 * Shared types for the inspector overlay and mini-graph system.
 */

export interface TargetDescriptor {
  targetId: string;
  label: string;
  surface?: string;
  status?: string;
  anchorX: number;
  anchorY: number;
}
