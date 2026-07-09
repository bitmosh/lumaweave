// SPDX-License-Identifier: Apache-2.0
import { NodeCircleProgram } from "sigma/rendering";
import type { Attributes } from "graphology-types";

// v90d: Pip hand-tuned shader — promoted from stub to active.
// Visual character: flat minimal dot, intentionally small and quiet (~70% effective radius).
// No glow, no specular, no animation. Suits leaf nodes, low-importance entities, dense clusters.

const FRAGMENT_SHADER_SOURCE = `
precision mediump float;

varying vec4 v_color;
varying vec2 v_diffVector;
varying float v_radius;

void main() {
  vec2 pos_centered = v_diffVector / (v_radius * 2.0);
  float dist = length(pos_centered);

  // Shrunk pip radius — ~70% of base, makes pip read smaller than other presets
  if (dist > 0.35) discard;

  // PICKING_MODE bypass — must come before any lighting math
  #ifdef PICKING_MODE
  gl_FragColor = v_color;
  return;
  #endif

  // Soft anti-aliased edge — flat fill, no specular, no animation
  float alpha = 1.0 - smoothstep(0.33, 0.35, dist);

  gl_FragColor = vec4(v_color.rgb, v_color.a * alpha);
}
`;

export default class PipProgram<
  N extends Attributes = Attributes,
  E extends Attributes = Attributes,
  G extends Attributes = Attributes
> extends NodeCircleProgram<N, E, G> {
  setUniforms(params: any, programInfo: any): void {
    super.setUniforms(params, programInfo);
  }

  getDefinition() {
    const definition = super.getDefinition();
    return {
      ...definition,
      FRAGMENT_SHADER_SOURCE,
    };
  }
}
