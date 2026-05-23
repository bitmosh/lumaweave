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

  // Sharper edge falloff than glass-sphere — faceted feel
  float alpha = 1.0 - smoothstep(radius - 0.03, radius + 0.01, dist);
  if (alpha < 0.01) discard;

  #ifdef PICKING_MODE
  gl_FragColor = v_color;
  return;
  #endif

  // Hemisphere normal from circle UV
  vec2 n2 = offset / radius;
  vec3 normal = normalize(vec3(n2, sqrt(max(0.0, 1.0 - dot(n2, n2)))));
  vec3 viewDir = vec3(0.0, 0.0, 1.0);

  // Sharp primary specular — tight, off-center (suggests a facet plane)
  vec3 lightDir1 = normalize(vec3(-0.6, -0.4, 1.3));
  float spec1 = pow(max(dot(normal, normalize(lightDir1 + viewDir)), 0.0), 96.0) * 1.2;

  // Secondary specular — opposite angle, dimmer (second facet)
  vec3 lightDir2 = normalize(vec3(0.5, 0.7, 0.9));
  float spec2 = pow(max(dot(normal, normalize(lightDir2 + viewDir)), 0.0), 48.0) * 0.4;

  // Refractive interior: cool blue-indigo tint strongest at center, fades to edge
  float depth = 1.0 - smoothstep(0.0, radius * 0.75, dist);
  vec3 coolShift = vec3(0.78, 0.88, 1.18);
  vec3 interiorColor = v_color.rgb * mix(vec3(1.0), coolShift, depth * 0.55);

  // Slow interior shimmer — no flow spin (distinguishes from glass-sphere)
  float shimmer = 0.045 * sin(u_time * 0.7 + dist * 14.0);

  // Facet edge darkening — opposite of glass-sphere's outer glow ring
  float edgeDarken = 1.0 - smoothstep(radius * 0.55, radius, dist) * 0.45;

  // Inner core brightening (refracted light through interior)
  float core = smoothstep(0.15, 0.0, dist) * 0.25;

  vec3 finalColor = interiorColor * edgeDarken
                  + vec3(spec1 + spec2)
                  + vec3(shimmer + core)
                  + v_color.rgb * u_glowStrength * 0.04;

  gl_FragColor = vec4(finalColor, v_color.a * alpha);
}
