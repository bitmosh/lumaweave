// SPDX-License-Identifier: Apache-2.0
import { NodeCircleProgram } from "sigma/rendering";
import type { Attributes } from "graphology-types";

// v90a: Multi-ring corona shader for hub/identity nodes.
// Visual character: bright core, three concentric corona rings of decreasing
// intensity, pulsing outer ring. Distinctly different from glass-sphere at a glance.
// Uses u_time (from __uniformsRef) for the outer corona pulse animation.

const FRAGMENT_SHADER_SOURCE = `
precision mediump float;

varying vec4 v_color;
varying vec2 v_diffVector;
varying float v_radius;

uniform float u_time;
uniform float u_glowStrength;

void main() {
  vec2 pointCoord = v_diffVector / (v_radius * 2.0) + 0.5;
  vec2 center = vec2(0.5, 0.5);
  float dist = distance(pointCoord, center);

  if (dist > 0.7) discard;

  float core = smoothstep(0.18, 0.0, dist);

  float corona1 = smoothstep(0.38, 0.22, dist) * smoothstep(0.10, 0.20, dist) * 0.65;

  float pulse = 0.75 + 0.25 * sin(u_time * 1.2);
  float corona2 = smoothstep(0.65, 0.35, dist) * smoothstep(0.25, 0.38, dist) * 0.35 * pulse;

  float radial = smoothstep(0.5, 0.0, dist) * 0.5;

  float body = smoothstep(0.28, 0.26, dist);

  float bodyAlpha = body;
  float coronaAlpha = (1.0 - body) * (corona1 + corona2) * 0.85;
  float totalAlpha = clamp(bodyAlpha + coronaAlpha, 0.0, 1.0);

  if (totalAlpha < 0.01) discard;

  #ifdef PICKING_MODE
  gl_FragColor = v_color;
  return;
  #endif

  vec3 coreColor = mix(vec3(1.0, 0.95, 0.7), v_color.rgb, smoothstep(0.0, 0.18, dist));
  vec3 coronaColor = v_color.rgb * (corona1 + corona2 * 0.6);
  vec3 glowColor = v_color.rgb * u_glowStrength * smoothstep(0.65, 0.3, dist) * 0.4;

  vec3 finalColor = coreColor * body + coronaColor * (1.0 - body) + glowColor + vec3(radial * 0.15);

  gl_FragColor = vec4(finalColor, v_color.a * totalAlpha);
}
`;

export default class SunProgram<
  N extends Attributes = Attributes,
  E extends Attributes = Attributes,
  G extends Attributes = Attributes
> extends NodeCircleProgram<N, E, G> {
  setUniforms(params: any, programInfo: any): void {
    super.setUniforms(params, programInfo);

    const { gl, program } = programInfo;

    const uTime = gl.getUniformLocation(program, "u_time");
    const uGlowStrength = gl.getUniformLocation(program, "u_glowStrength");

    const uniforms = (this.renderer as any).__uniformsRef?.current ?? {
      time: 0,
      glowStrength: 1.0,
    };

    if (uTime !== null) gl.uniform1f(uTime, uniforms.time);
    if (uGlowStrength !== null) gl.uniform1f(uGlowStrength, uniforms.glowStrength);
  }

  getDefinition() {
    const definition = super.getDefinition();
    return {
      ...definition,
      FRAGMENT_SHADER_SOURCE,
    };
  }
}
