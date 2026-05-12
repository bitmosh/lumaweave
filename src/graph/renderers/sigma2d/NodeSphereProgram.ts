import { NodeCircleProgram } from "sigma/rendering";
import type { Attributes } from "graphology-types";

/**
 * NodeSphereProgram - Custom node renderer that creates a glowing sphere illusion
 * 
 * v86b: Extended with 3 new uniforms for interior flow animation:
 * - u_time: driven by rAF in SigmaGraphView
 * - u_hum: appearance.nodeHum (0–2) - radial breathe
 * - u_flowSpeed: appearance.nodeFlowSpeed (0–2) - interior rotating ellipse
 * - u_glowStrength: appearance.nodeGlow (0.2–2) - glow scaling
 * 
 * Extends NodeCircleProgram and overrides both vertex and fragment shaders to add:
 * - Pass quad position from vertex to fragment shader
 * - Radial alpha mask (circle shape)
 * - Phong specular highlight at fixed angle
 * - Radial glow falloff beyond the circle edge
 * - Inner rim light at bottom-right edge
 * - Hum: radial breathe animation
 * - Flow: interior rotating ellipse animation
 * 
 * This produces a glowing sphere illusion from flat WebGL quads
 * with the same performance as circles.
 */
const SPHERE_VERTEX_SHADER = `
attribute vec2 a_position;
attribute float a_size;
attribute vec4 a_color;

uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform mat3 u_matrix;

varying vec4 v_color;
varying vec2 v_position;

void main() {
  // Apply transformation matrix
  vec2 position = (u_matrix * vec3(a_position, 1.0)).xy;
  
  // Convert to clip space
  vec2 screenPosition = position * u_pixelRatio;
  vec2 clipSpace = (screenPosition / u_resolution) * 2.0 - 1.0;
  
  gl_Position = vec4(clipSpace, 0.0, 1.0);
  gl_PointSize = a_size;
  
  // Pass color and position to fragment shader
  v_color = a_color;
  // Normalize position to quad space (0,0 to 1,1) for fragment shader
  v_position = a_position;
}
`;

const SPHERE_FRAGMENT_SHADER = `
precision mediump float;

varying vec4 v_color;
varying vec2 v_position;

// NEW v86b uniforms
uniform float u_time;
uniform float u_hum;
uniform float u_flowSpeed;
uniform float u_glowStrength;

void main() {
  // Distance from center (0,0 to 1,1 quad)
  vec2 center = vec2(0.5, 0.5);
  float dist = distance(v_position, center);
  
  // Radial alpha mask - circle shape
  float radius = 0.5;
  float alpha = 1.0 - smoothstep(radius - 0.02, radius, dist);
  
  // Discard pixels outside circle
  if (alpha < 0.01) discard;
  
  // Phong specular highlight at fixed angle (top-left light source)
  vec3 lightDir = normalize(vec3(-1.0, -1.0, 1.0));
  vec3 normal = normalize(vec3(v_position - center, 1.0));
  vec3 viewDir = vec3(0.0, 0.0, 1.0);
  vec3 halfDir = normalize(lightDir + viewDir);
  float specular = pow(max(dot(normal, halfDir), 0.0), 32.0);
  
  // NEW v86b: hum — radial breathe
  float humPulse = 0.5 + 0.5 * sin(u_time * u_hum);
  vec3 humTint = v_color.rgb * (0.20 * humPulse);
  
  // NEW v86b: flow — interior rotating ellipse
  float angle = u_time * u_flowSpeed;
  vec2 flowed = vec2(
    cos(angle) * (v_position.x - 0.5) - sin(angle) * (v_position.y - 0.5),
    sin(angle) * (v_position.x - 0.5) + cos(angle) * (v_position.y - 0.5)
  );
  float flowMask = smoothstep(0.05, 0.0, abs(flowed.x * 1.4));
  vec3 flowTint = v_color.rgb * flowMask * 0.45;
  
  // Radial glow falloff beyond circle edge (now scaled by u_glowStrength)
  float glow = smoothstep(radius, radius + 0.15, dist);
  vec3 glowColor = v_color.rgb * u_glowStrength * glow;
  
  // Inner rim light at bottom-right edge
  vec2 rimDir = normalize(vec2(1.0, 1.0));
  float rim = max(dot(normal, vec3(rimDir, 0.0)), 0.0);
  float rimLight = pow(rim, 3.0) * 0.3;
  
  // Combine effects
  vec3 finalColor = v_color.rgb + glowColor + vec3(specular) + vec3(rimLight)
                  + humTint + flowTint;
  gl_FragColor = vec4(finalColor, v_color.a * alpha);
}
`;

export default class NodeSphereProgram<
  N extends Attributes = Attributes,
  E extends Attributes = Attributes,
  G extends Attributes = Attributes
> extends NodeCircleProgram<N, E, G> {
  private uniformValues: {
    u_time: number;
    u_hum: number;
    u_flowSpeed: number;
    u_glowStrength: number;
  } = {
    u_time: 0,
    u_hum: 0.7,
    u_flowSpeed: 0.55,
    u_glowStrength: 1.0,
  };

  setUniform(name: string, value: number): void {
    if (name in this.uniformValues) {
      (this.uniformValues as any)[name] = value;
    }
  }

  // v86b: Override setUniforms to set GL uniforms per frame.
  // Uniform locations MUST be fetched per call — they are tied to
  // the specific shader program currently bound. Caching them
  // across calls causes "UniformLocation is not from the current
  // active Program" errors and eventual context loss.
  setUniforms(params: any, programInfo: any): void {
    super.setUniforms(params, programInfo);

    const { gl, program } = programInfo;

    // Fetch fresh uniform locations every call
    const uTime = gl.getUniformLocation(program, "u_time");
    const uHum = gl.getUniformLocation(program, "u_hum");
    const uFlowSpeed = gl.getUniformLocation(program, "u_flowSpeed");
    const uGlowStrength = gl.getUniformLocation(program, "u_glowStrength");

    // Read uniforms from ref (replaces previous getSetting path)
    const uniforms = (this.renderer as any).__uniformsRef?.current ?? {
      time: 0,
      hum: this.uniformValues.u_hum,
      flowSpeed: this.uniformValues.u_flowSpeed,
      glowStrength: this.uniformValues.u_glowStrength,
    };

    // Only set if location exists in current program
    if (uTime !== null) gl.uniform1f(uTime, uniforms.time);
    if (uHum !== null) gl.uniform1f(uHum, uniforms.hum);
    if (uFlowSpeed !== null) gl.uniform1f(uFlowSpeed, uniforms.flowSpeed);
    if (uGlowStrength !== null) gl.uniform1f(uGlowStrength, uniforms.glowStrength);
  }

  getDefinition() {
    const definition = super.getDefinition();
    return {
      ...definition,
      VERTEX_SHADER_SOURCE: SPHERE_VERTEX_SHADER,
      FRAGMENT_SHADER_SOURCE: SPHERE_FRAGMENT_SHADER,
    };
  }
}
