precision mediump float;

varying vec4 v_color;
varying vec2 v_position;

uniform float u_time;
uniform float u_glowStrength;

void main() {
  vec2 center = vec2(0.5, 0.5);
  float dist = distance(v_position, center);

  // Discard well outside the outer corona
  if (dist > 0.7) discard;

  // Bright core (small, very high intensity)
  float core = smoothstep(0.18, 0.0, dist);

  // Corona ring 1 — medium radius, moderate intensity
  float corona1 = smoothstep(0.38, 0.22, dist) * smoothstep(0.10, 0.20, dist) * 0.65;

  // Corona ring 2 — large radius, low intensity, pulsing
  float pulse = 0.75 + 0.25 * sin(u_time * 1.2);
  float corona2 = smoothstep(0.65, 0.35, dist) * smoothstep(0.25, 0.38, dist) * 0.35 * pulse;

  // Radial gradient base — warm fade from center
  float radial = smoothstep(0.5, 0.0, dist) * 0.5;

  // Hard circle mask for the solid sphere body
  float body = smoothstep(0.28, 0.26, dist);

  // Combine: body alpha uses hard circle; corona uses soft rings beyond body
  float bodyAlpha = body;
  float coronaAlpha = (1.0 - body) * (corona1 + corona2) * 0.85;
  float totalAlpha = clamp(bodyAlpha + coronaAlpha, 0.0, 1.0);

  if (totalAlpha < 0.01) discard;

  // Color composition: bright warm core bleeds to node color outward
  vec3 coreColor = mix(vec3(1.0, 0.95, 0.7), v_color.rgb, smoothstep(0.0, 0.18, dist));
  vec3 coronaColor = v_color.rgb * (corona1 + corona2 * 0.6);
  vec3 glowColor = v_color.rgb * u_glowStrength * smoothstep(0.65, 0.3, dist) * 0.4;

  vec3 finalColor = coreColor * body + coronaColor * (1.0 - body) + glowColor + vec3(radial * 0.15);

  gl_FragColor = vec4(finalColor, v_color.a * totalAlpha);
}
