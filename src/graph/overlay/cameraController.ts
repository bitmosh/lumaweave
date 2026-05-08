/**
 * Camera Controller
 * Wraps Sigma's camera with eased animate calls and right-drag rotation
 * 
 * v86b: Sigma wrapper with interaction model
 * - Left-drag: pan
 * - Right-drag: rotate
 * - Scroll-wheel: zoom
 * - Eased transitions (380ms cubic-out)
 * - reduceMotion: instant transitions (no easing)
 */

import type Sigma from "sigma";

export interface CameraController {
  pan(dx: number, dy: number, opts?: { animated?: boolean }): void;
  zoom(factor: number, opts?: { animated?: boolean; anchor?: { x: number; y: number } }): void;
  rotate(degrees: number, opts?: { animated?: boolean }): void;
  reset(): void;
  getState(): { x: number; y: number; ratio: number; angle: number };
}

export interface CameraControllerOptions {
  reduceMotion: boolean;
  easingDuration?: number; // default 380ms
}

/**
 * Attach camera controller to Sigma instance
 * 
 * IMPORTANT: On first mount, READ initial state from Sigma's existing camera.
 * Do NOT call reset() or set initial zoom/pan/rotation in the constructor.
 * The wrapper takes over interaction handling but must preserve existing state.
 */
export function attachCameraController(
  sigma: Sigma,
  options: CameraControllerOptions
): CameraController {
  const { reduceMotion, easingDuration = 380 } = options;
  const camera = sigma.getCamera();
  
  // Read initial state from Sigma (do NOT reset)
  const initialState = camera.getState();

  const easing = reduceMotion ? 0 : easingDuration;

  return {
    pan(dx: number, dy: number, opts?: { animated?: boolean }): void {
      const animated = opts?.animated ?? true;
      if (animated) {
        camera.animate({ x: camera.x + dx, y: camera.y + dy }, { duration: easing });
      } else {
        camera.setState({ x: camera.x + dx, y: camera.y + dy });
      }
    },

    zoom(factor: number, opts?: { animated?: boolean; anchor?: { x: number; y: number } }): void {
      const animated = opts?.animated ?? true;
      const anchor = opts?.anchor;
      
      if (animated) {
        camera.animate(
          { ratio: camera.ratio * factor },
          { duration: easing, ...(anchor && { x: anchor.x, y: anchor.y }) }
        );
      } else {
        camera.setState({ ratio: camera.ratio * factor });
      }
    },

    rotate(degrees: number, opts?: { animated?: boolean }): void {
      const animated = opts?.animated ?? true;
      const targetAngle = camera.angle + (degrees * Math.PI / 180);
      
      if (animated) {
        camera.animate({ angle: targetAngle }, { duration: easing });
      } else {
        camera.setState({ angle: targetAngle });
      }
    },

    reset(): void {
      // Reset to initial state (not to 0,0,1,0)
      camera.animate(initialState, { duration: easing });
    },

    getState(): { x: number; y: number; ratio: number; angle: number } {
      return camera.getState();
    },
  };
}
