// PlasmaEdge.frag.glsl — LumaWeave v91 (iter 4/5 port)
// Reference copy — shader source lives inline in PlasmaEdgeProgram.ts.
//
// VOLUMETRIC plasma:
//   (A) CORE          — bright band inside coreWidth, feathered edge
//   (B) BLOOM         — soft glow OUTSIDE the core toward rectangle rim
//   (C) FLOW          — 0=continuous 2D fbm shimmer  1=discrete particles
//   (D) PULSE         — slow sinusoidal breath, structural phase
//   (E) GRADIENT      — u_colorIn → u_colorOut at v_midStop
//
// Output: ADDITIVE-PREMULTIPLIED. blendFunc(ONE, ONE) for visual pass.
// RGB is pre-attenuated by intensity; alpha mirrors it.
//
// PICKING_MODE bypass:
//   Sigma prepends #define PICKING_MODE for hit-test buffer.
//   Structural order: coord calc → boundary → PICKING_MODE → lighting.

precision highp float;

varying vec2  v_uv;
varying float v_phase;
varying float v_edgeLength;
varying float v_midStop;
varying float v_hover;
varying vec4  v_color;

uniform vec3  u_colorIn;
uniform vec3  u_colorOut;
uniform float u_gradientWidth;
uniform float u_gradientStrength;
uniform float u_time;

uniform float u_flowMode;
uniform float u_particleDensity;
uniform float u_particleSize;

uniform float u_rest_flowSpeed;
uniform float u_rest_glowIntensity;
uniform float u_rest_pulseFrequency;
uniform float u_rest_pulseAmplitude;
uniform float u_rest_brightnessBase;
uniform float u_rest_coreWidth;
uniform float u_rest_feather;
uniform float u_rest_bloomFalloff;
uniform float u_rest_noiseAmount;
uniform float u_rest_noiseScale;

uniform float u_hovered_flowSpeed;
uniform float u_hovered_glowIntensity;
uniform float u_hovered_pulseFrequency;
uniform float u_hovered_pulseAmplitude;
uniform float u_hovered_brightnessBase;
uniform float u_hovered_coreWidth;
uniform float u_hovered_feather;
uniform float u_hovered_bloomFalloff;
uniform float u_hovered_noiseAmount;
uniform float u_hovered_noiseScale;

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float noise2(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.55;
  v += a * noise2(p);          p *= 2.03; a *= 0.5;
  v += a * noise2(p);          p *= 2.07; a *= 0.5;
  v += a * noise2(p);
  return v;
}

void main() {
  float u = v_uv.x;
  float v = v_uv.y;
  float absV = abs(v);
  float h = v_hover;

  #ifdef PICKING_MODE
  gl_FragColor = v_color;
  return;
  #endif

  float flowSpeed     = mix(u_rest_flowSpeed,      u_hovered_flowSpeed,      h);
  float glowIntensity = mix(u_rest_glowIntensity,  u_hovered_glowIntensity,  h);
  float pulseFreq     = mix(u_rest_pulseFrequency, u_hovered_pulseFrequency, h);
  float pulseAmp      = mix(u_rest_pulseAmplitude, u_hovered_pulseAmplitude, h);
  float brightness    = mix(u_rest_brightnessBase, u_hovered_brightnessBase, h);
  float coreWidth     = mix(u_rest_coreWidth,      u_hovered_coreWidth,      h);
  float feather       = mix(u_rest_feather,        u_hovered_feather,        h);
  float bloomFalloff  = mix(u_rest_bloomFalloff,   u_hovered_bloomFalloff,   h);
  float noiseAmount   = mix(u_rest_noiseAmount,    u_hovered_noiseAmount,    h);
  float noiseScale    = mix(u_rest_noiseScale,     u_hovered_noiseScale,     h);

  float aa = max(feather, 1e-3);
  float coreInner = max(0.0, coreWidth - aa);
  float coreOuter = coreWidth + aa;
  float core = 1.0 - smoothstep(coreInner, coreOuter, absV);

  float beyondCore = clamp((absV - coreOuter) / max(1.0 - coreOuter, 1e-3), 0.0, 1.0);
  float bloomEnvelope = pow(1.0 - beyondCore, bloomFalloff);
  float rimFade = 1.0 - smoothstep(0.92, 1.0, absV);
  float bloom = bloomEnvelope * rimFade;

  float pulse = 1.0 + pulseAmp *
                sin(u_time * pulseFreq * 6.2831853 + v_phase * 6.2831853);

  float shimmer;
  if (u_flowMode > 0.5) {
    float particles = 0.0;
    float density = max(u_particleDensity, 1.0);
    float radSq = max(u_particleSize * u_particleSize * 0.06, 1e-4);
    for (int i = 0; i < 8; i++) {
      if (float(i) >= density) break;
      float baseU = float(i) / density;
      float particleU = fract(baseU + u_time * flowSpeed * 0.18 + v_phase);
      float du = u - particleU;
      du = du - floor(du + 0.5);
      particles += exp(-(du * du) / radSq);
    }
    vec2 nUV = vec2(u * noiseScale - u_time * flowSpeed,
                    v * 0.6 + u_time * flowSpeed * 0.18);
    float residualNoise = fbm(nUV);
    float residualShimmer = mix(1.0, 0.7 + residualNoise * 0.6, noiseAmount * 0.4);
    shimmer = residualShimmer + particles * (0.9 + noiseAmount * 1.2);
  } else {
    vec2 nUV = vec2(u * noiseScale - u_time * flowSpeed,
                    v * 0.6 + u_time * flowSpeed * 0.18);
    float n = fbm(nUV);
    shimmer = mix(1.0, 0.35 + n * 1.35, noiseAmount);
  }

  float halfW = max(u_gradientWidth, 0.005) * 0.5;
  float gradT = smoothstep(v_midStop - halfW, v_midStop + halfW, u);
  vec3 gradientColor = mix(u_colorIn, u_colorOut, gradT);
  vec3 edgeColor = mix(u_colorIn, gradientColor, clamp(u_gradientStrength, 0.0, 1.0));

  float coreI  = core  * shimmer * pulse;
  float bloomI = bloom * glowIntensity * (0.55 + pulse * 0.45);
  float intensity = coreI + bloomI;
  intensity = intensity / (1.0 + intensity * 0.35);

  vec3 finalColor = edgeColor * brightness;
  finalColor = mix(finalColor, finalColor + vec3(0.55), clamp(coreI * 0.55, 0.0, 1.0));

  gl_FragColor = vec4(finalColor * intensity, intensity);
}
