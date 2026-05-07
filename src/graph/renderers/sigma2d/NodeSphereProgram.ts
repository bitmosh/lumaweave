import { NodeCircleProgram } from "sigma/rendering";
import type { Attributes } from "graphology-types";

/**
 * NodeSphereProgram - Custom node renderer that creates a glowing sphere illusion
 * 
 * Extends NodeCircleProgram and overrides the fragment shader to add:
 * - Radial alpha mask (circle shape)
 * - Phong specular highlight at fixed angle
 * - Radial glow falloff beyond the circle edge
 * - Inner rim light at bottom-right edge
 * 
 * This produces a glowing sphere illusion from flat WebGL quads
 * with the same performance as circles.
 */
const SPHERE_FRAGMENT_SHADER = `
precision mediump float;

varying vec4 v_color;
varying vec2 v_position;

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
  
  // Radial glow falloff beyond circle edge
  float glow = smoothstep(radius, radius + 0.15, dist);
  vec3 glowColor = v_color.rgb * 0.5 * glow;
  
  // Inner rim light at bottom-right edge
  vec2 rimDir = normalize(vec2(1.0, 1.0));
  float rim = max(dot(normal, vec3(rimDir, 0.0)), 0.0);
  float rimLight = pow(rim, 3.0) * 0.3;
  
  // Combine effects
  vec3 finalColor = v_color.rgb + glowColor + vec3(specular) + vec3(rimLight);
  gl_FragColor = vec4(finalColor, v_color.a * alpha);
}
`;

export default class NodeSphereProgram<
  N extends Attributes = Attributes,
  E extends Attributes = Attributes,
  G extends Attributes = Attributes
> extends NodeCircleProgram<N, E, G> {
  getDefinition() {
    const definition = super.getDefinition();
    return {
      ...definition,
      FRAGMENT_SHADER_SOURCE: SPHERE_FRAGMENT_SHADER,
    };
  }
}
