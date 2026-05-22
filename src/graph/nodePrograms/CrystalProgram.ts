import { NodeCircleProgram } from "sigma/rendering";
import type { Attributes } from "graphology-types";

// v90a: Crystal variant — GlassSphere shader with cooler, high-specular uniform defaults.
// Visually: slow hum, fast flow spin, strong glow. Distinct from glass-sphere at a glance.

const FRAGMENT_SHADER_SOURCE = `
precision mediump float;

varying vec4 v_color;
varying vec2 v_position;

uniform float u_time;
uniform float u_hum;
uniform float u_flowSpeed;
uniform float u_glowStrength;

void main() {
  vec2 center = vec2(0.5, 0.5);
  float dist = distance(v_position, center);

  float radius = 0.5;
  float alpha = 1.0 - smoothstep(radius - 0.02, radius, dist);

  if (alpha < 0.01) discard;

  vec3 lightDir = normalize(vec3(-1.0, -1.0, 1.0));
  vec3 normal = normalize(vec3(v_position - center, 1.0));
  vec3 viewDir = vec3(0.0, 0.0, 1.0);
  vec3 halfDir = normalize(lightDir + viewDir);
  float specular = pow(max(dot(normal, halfDir), 0.0), 32.0);

  float humPulse = 0.5 + 0.5 * sin(u_time * u_hum);
  vec3 humTint = v_color.rgb * (0.20 * humPulse);

  float angle = u_time * u_flowSpeed;
  vec2 flowed = vec2(
    cos(angle) * (v_position.x - 0.5) - sin(angle) * (v_position.y - 0.5),
    sin(angle) * (v_position.x - 0.5) + cos(angle) * (v_position.y - 0.5)
  );
  float flowMask = smoothstep(0.05, 0.0, abs(flowed.x * 1.4));
  vec3 flowTint = v_color.rgb * flowMask * 0.45;

  float glow = smoothstep(radius, radius + 0.15, dist);
  vec3 glowColor = v_color.rgb * u_glowStrength * glow;

  vec2 rimDir = normalize(vec2(1.0, 1.0));
  float rim = max(dot(normal, vec3(rimDir, 0.0)), 0.0);
  float rimLight = pow(rim, 3.0) * 0.3;

  vec3 finalColor = v_color.rgb + glowColor + vec3(specular) + vec3(rimLight)
                  + humTint + flowTint;
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
    const uHum = gl.getUniformLocation(program, "u_hum");
    const uFlowSpeed = gl.getUniformLocation(program, "u_flowSpeed");
    const uGlowStrength = gl.getUniformLocation(program, "u_glowStrength");

    const uniforms = (this.renderer as any).__uniformsRef?.current ?? {
      time: 0,
      hum: 0.3,
      flowSpeed: 1.2,
      glowStrength: 1.6,
    };

    if (uTime !== null) gl.uniform1f(uTime, uniforms.time);
    if (uHum !== null) gl.uniform1f(uHum, uniforms.hum);
    if (uFlowSpeed !== null) gl.uniform1f(uFlowSpeed, uniforms.flowSpeed);
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
