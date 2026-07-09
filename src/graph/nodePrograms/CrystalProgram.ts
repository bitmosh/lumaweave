// SPDX-License-Identifier: Apache-2.0
import { NodeCircleProgram } from "sigma/rendering";
import type { Attributes } from "graphology-types";

// v90b: Crystal hand-tuned shader — promoted from stub to active.
// Visual character: sharp double specular (facet planes), cool refractive interior,
// edge darkening (faceted falloff), slow shimmer. Distinct from glass-sphere
// (no hum pulse, no flow spin, no outer glow ring) and sun (no corona rings).

const FRAGMENT_SHADER_SOURCE = `
precision mediump float;

varying vec4 v_color;
varying vec2 v_diffVector;
varying float v_radius;

uniform float u_time;
uniform float u_glowStrength;

void main() {
  vec2 uv = v_diffVector / (v_radius * 2.0) + 0.5;
  vec2 center = vec2(0.5, 0.5);
  vec2 offset = uv - center;
  float dist = length(offset);

  float radius = 0.46;

  float alpha = 1.0 - smoothstep(radius - 0.03, radius + 0.01, dist);
  if (alpha < 0.01) discard;

  #ifdef PICKING_MODE
  gl_FragColor = v_color;
  return;
  #endif

  vec2 n2 = offset / radius;
  vec3 normal = normalize(vec3(n2, sqrt(max(0.0, 1.0 - dot(n2, n2)))));
  vec3 viewDir = vec3(0.0, 0.0, 1.0);

  vec3 lightDir1 = normalize(vec3(-0.6, -0.4, 1.3));
  float spec1 = pow(max(dot(normal, normalize(lightDir1 + viewDir)), 0.0), 96.0) * 1.2;

  vec3 lightDir2 = normalize(vec3(0.5, 0.7, 0.9));
  float spec2 = pow(max(dot(normal, normalize(lightDir2 + viewDir)), 0.0), 48.0) * 0.4;

  float depth = 1.0 - smoothstep(0.0, radius * 0.75, dist);
  vec3 coolShift = vec3(0.78, 0.88, 1.18);
  vec3 interiorColor = v_color.rgb * mix(vec3(1.0), coolShift, depth * 0.55);

  float shimmer = 0.045 * sin(u_time * 0.7 + dist * 14.0);

  float edgeDarken = 1.0 - smoothstep(radius * 0.55, radius, dist) * 0.45;

  float core = smoothstep(0.15, 0.0, dist) * 0.25;

  vec3 finalColor = interiorColor * edgeDarken
                  + vec3(spec1 + spec2)
                  + vec3(shimmer + core)
                  + v_color.rgb * u_glowStrength * 0.04;

  gl_FragColor = vec4(finalColor, v_color.a * alpha);
}
`;

export default class CrystalProgram<
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
