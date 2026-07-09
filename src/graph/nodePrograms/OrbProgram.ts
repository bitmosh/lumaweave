// SPDX-License-Identifier: Apache-2.0
import { NodeCircleProgram } from "sigma/rendering";
import type { Attributes } from "graphology-types";

// v90c: Orb hand-tuned shader — promoted from stub to active.
// Visual character: soft luminous breathing sphere with gentle halo bloom.
// Distinct from glass-sphere (no flow spin), crystal (no facets/edge darkening),
// sun (no corona rings). Suits ambient, data-presence, and background nodes.

const FRAGMENT_SHADER_SOURCE = `
precision mediump float;

varying vec4 v_color;
varying vec2 v_diffVector;
varying float v_radius;

uniform float u_time;
uniform float u_breatheSpeed;
uniform float u_haloStrength;

void main() {
  vec2 uv = v_diffVector / (v_radius * 2.0) + 0.5;
  vec2 center = vec2(0.5, 0.5);
  vec2 offset = uv - center;
  float dist = length(offset);

  float radius = 0.46;
  float haloOuter = 0.63;

  float sphereAlpha = 1.0 - smoothstep(radius - 0.02, radius + 0.01, dist);
  float haloMask = smoothstep(haloOuter, radius + 0.02, dist);
  float haloAlpha = haloMask * 0.30;
  float alpha = max(sphereAlpha, haloAlpha);
  if (alpha < 0.01) discard;

  #ifdef PICKING_MODE
  gl_FragColor = v_color;
  return;
  #endif

  vec2 n2 = offset / max(dist, 0.001) * min(dist / radius, 1.0);
  vec3 normal = normalize(vec3(n2, sqrt(max(0.0, 1.0 - dot(n2, n2)))));
  vec3 viewDir = vec3(0.0, 0.0, 1.0);

  vec3 lightDir = normalize(vec3(-0.35, -0.55, 1.2));
  float diffuse = max(dot(normal, lightDir), 0.0) * 0.60;
  float softSpec = pow(max(dot(normal, normalize(lightDir + viewDir)), 0.0), 16.0) * 0.28;

  float breathe = 0.88 + 0.12 * sin(u_time * u_breatheSpeed);
  float core = smoothstep(0.32, 0.0, dist) * 0.22;

  vec3 haloColor = v_color.rgb * haloMask * u_haloStrength;
  vec3 baseColor = v_color.rgb * (0.52 + diffuse) * breathe;
  vec3 finalColor = baseColor + vec3(softSpec + core) + haloColor;

  gl_FragColor = vec4(finalColor, v_color.a * alpha);
}
`;

export default class OrbProgram<
  N extends Attributes = Attributes,
  E extends Attributes = Attributes,
  G extends Attributes = Attributes
> extends NodeCircleProgram<N, E, G> {
  setUniforms(params: any, programInfo: any): void {
    super.setUniforms(params, programInfo);

    const { gl, program } = programInfo;

    const uTime = gl.getUniformLocation(program, "u_time");
    const uBreatheSpeed = gl.getUniformLocation(program, "u_breatheSpeed");
    const uHaloStrength = gl.getUniformLocation(program, "u_haloStrength");

    const uniforms = (this.renderer as any).__uniformsRef?.current ?? {
      time: 0,
      breatheSpeed: 1.2,
      haloStrength: 0.5,
    };

    if (uTime !== null) gl.uniform1f(uTime, uniforms.time);
    if (uBreatheSpeed !== null) gl.uniform1f(uBreatheSpeed, uniforms.breatheSpeed ?? 1.2);
    if (uHaloStrength !== null) gl.uniform1f(uHaloStrength, uniforms.haloStrength ?? 0.5);
  }

  getDefinition() {
    const definition = super.getDefinition();
    return {
      ...definition,
      FRAGMENT_SHADER_SOURCE,
    };
  }
}
