// SPDX-License-Identifier: Apache-2.0
import { EdgeProgram } from "sigma/rendering";
import type { Attributes } from "graphology-types";
import { useSettingsStore } from "../../control-plane/settings/settings.store";

// v91: PlasmaEdgeProgram — full Sigma EdgeProgram port of the v91 shell shader.
// Replaces PlasmaOverlayEdge SVG hack (v86b) with a native WebGL edge program.
// Architecture: subdivided quadratic bezier ribbon, 12 segments (72 verts/edge).
// Two uniform sets (rest/hovered) blended per-edge by a_hoverFactor.
// Output: additive-premultiplied (ONE, ONE) for visual pass only.
// PICKING_MODE bypass: v_color = a_id in vertex; fragment emits unchanged.

const START_TIME = performance.now();

// 12 quads × 6 verts = 72 vertices per edge.
// Hardware linear interpolation between 2 end-pairs collapses bezier to a
// straight line; fine subdivision is what makes curvature actually render.
const EDGE_SEGMENTS = 12;
const EDGE_CORNERS: [number, number][] = [];
for (let i = 0; i < EDGE_SEGMENTS; i++) {
  const u0 = i / EDGE_SEGMENTS;
  const u1 = (i + 1) / EDGE_SEGMENTS;
  EDGE_CORNERS.push([u0, -1], [u1, -1], [u0, 1]);
  EDGE_CORNERS.push([u0, 1], [u1, -1], [u1, 1]);
}
const EDGE_VERTEX_COUNT = EDGE_CORNERS.length; // 72

const VERTEX_SHADER_SOURCE = `
attribute vec2  a_source;
attribute vec2  a_target;
attribute vec2  a_corner;
attribute float a_thickness;
attribute float a_phase;
attribute float a_midStop;
attribute float a_hoverFactor;
attribute vec4  a_id;

uniform mat3  u_matrix;
uniform float u_correctionRatio;
uniform float u_minEdgeThickness;
uniform float u_curvature;
uniform float u_globalHover;
uniform float u_rest_thicknessMultiplier;
uniform float u_hovered_thicknessMultiplier;

varying vec2  v_uv;
varying float v_phase;
varying float v_edgeLength;
varying float v_midStop;
varying float v_hover;
varying vec4  v_color;

vec2 bezier(float t, vec2 A, vec2 M, vec2 B) {
  float k = 1.0 - t;
  return k*k*A + 2.0*k*t*M + t*t*B;
}
vec2 bezierTangent(float t, vec2 A, vec2 M, vec2 B) {
  return 2.0 * ((1.0 - t) * (M - A) + t * (B - M));
}

void main() {
  vec2 chord = a_target - a_source;
  float chordLen = length(chord);
  vec2 midWorld = (a_source + a_target) * 0.5;
  vec2 perpUnit = chordLen > 1e-6 ? normalize(vec2(-chord.y, chord.x)) : vec2(0.0, 1.0);
  vec2 controlWorld = midWorld + perpUnit * chordLen * u_curvature;

  float t = a_corner.x;
  vec2 onCurveWorld = bezier(t, a_source, controlWorld, a_target);
  vec2 tangentWorld = bezierTangent(t, a_source, controlWorld, a_target);
  vec2 normalWorld = normalize(vec2(-tangentWorld.y, tangentWorld.x));

  float h = clamp(max(a_hoverFactor, u_globalHover), 0.0, 1.0);
  float thicknessMult = mix(u_rest_thicknessMultiplier, u_hovered_thicknessMultiplier, h);

  float requestedHalfWidth = a_thickness * thicknessMult;
  float minHalfWidth = u_minEdgeThickness * 0.5;
  float halfWidth = max(requestedHalfWidth, minHalfWidth) * u_correctionRatio;

  vec2 worldPos = onCurveWorld + normalWorld * a_corner.y * halfWidth;
  vec3 transformed = u_matrix * vec3(worldPos, 1.0);
  gl_Position = vec4(transformed.xy, 0.0, 1.0);

  v_uv = a_corner;
  v_phase = a_phase;
  v_edgeLength = chordLen;
  v_midStop = a_midStop;
  v_hover = h;

  v_color = vec4(0.0);
  #ifdef PICKING_MODE
  v_color = a_id;
  #endif
}
`;

const FRAGMENT_SHADER_SOURCE = `
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
`;

interface PlasmaStateDefaults {
  flowSpeed: number;
  glowIntensity: number;
  pulseFrequency: number;
  pulseAmplitude: number;
  brightnessBase: number;
  coreWidth: number;
  feather: number;
  bloomFalloff: number;
  noiseAmount: number;
  noiseScale: number;
  thicknessMultiplier: number;
}

interface PlasmaThemeDefaults {
  colorIn: [number, number, number];
  colorOut: [number, number, number];
  curvature: number;
  gradientWidth: number;
  gradientStrength: number;
  flowMode: number;
  particleDensity: number;
  particleSize: number;
  rest: PlasmaStateDefaults;
  hovered: PlasmaStateDefaults;
}

function hexToRgb(hex: string): [number, number, number] {
  const s = hex.replace("#", "");
  return [
    parseInt(s.slice(0, 2), 16) / 255,
    parseInt(s.slice(2, 4), 16) / 255,
    parseInt(s.slice(4, 6), 16) / 255,
  ];
}

// Theme defaults mapped from shell THEMES object.
// LumaWeave theme ID → plasma uniform values.
const PLASMA_THEME_DEFAULTS: Record<string, PlasmaThemeDefaults> = {
  // Solar Plasma — amber→magenta, noise (atmospheric haze). Reference theme.
  "solar-plasma": {
    colorIn: hexToRgb("#ffb347"),
    colorOut: hexToRgb("#e94584"),
    curvature: 0.15,
    gradientWidth: 0.55,
    gradientStrength: 0.9,
    flowMode: 0,
    particleDensity: 3,
    particleSize: 0.12,
    rest: {
      flowSpeed: 0.55, glowIntensity: 0.50, pulseFrequency: 0.55,
      pulseAmplitude: 0.22, brightnessBase: 0.45, coreWidth: 0.65,
      feather: 0.28, bloomFalloff: 2.4, noiseAmount: 0.45,
      noiseScale: 3.4, thicknessMultiplier: 1.05,
    },
    hovered: {
      flowSpeed: 0.78, glowIntensity: 0.68, pulseFrequency: 0.78,
      pulseAmplitude: 0.36, brightnessBase: 0.62, coreWidth: 0.78,
      feather: 0.48, bloomFalloff: 1.8, noiseAmount: 0.55,
      noiseScale: 4.2, thicknessMultiplier: 1.28,
    },
  },

  // Void Circuit — cyan→lavender, particles (synaptic firing). Cold, digital.
  "void-circuit": {
    colorIn: hexToRgb("#58e6ff"),
    colorOut: hexToRgb("#b8b0ff"),
    curvature: 0.10,
    gradientWidth: 0.55,
    gradientStrength: 0.85,
    flowMode: 1,
    particleDensity: 3,
    particleSize: 0.08,
    rest: {
      flowSpeed: 0.60, glowIntensity: 0.30, pulseFrequency: 0.75,
      pulseAmplitude: 0.20, brightnessBase: 0.40, coreWidth: 0.52,
      feather: 0.28, bloomFalloff: 3.0, noiseAmount: 0.20,
      noiseScale: 6.5, thicknessMultiplier: 0.85,
    },
    hovered: {
      flowSpeed: 0.85, glowIntensity: 0.48, pulseFrequency: 0.98,
      pulseAmplitude: 0.34, brightnessBase: 0.58, coreWidth: 0.65,
      feather: 0.48, bloomFalloff: 2.4, noiseAmount: 0.30,
      noiseScale: 8.5, thicknessMultiplier: 1.10,
    },
  },

  // Obsidian Aurora — teal→violet, noise (continuous ribbon). Atmospheric, bowed.
  "obsidian-aurora": {
    colorIn: hexToRgb("#56d6c0"),
    colorOut: hexToRgb("#b79cff"),
    curvature: 0.20,
    gradientWidth: 0.55,
    gradientStrength: 1.0,
    flowMode: 0,
    particleDensity: 2,
    particleSize: 0.12,
    rest: {
      flowSpeed: 0.35, glowIntensity: 0.40, pulseFrequency: 0.40,
      pulseAmplitude: 0.26, brightnessBase: 0.35, coreWidth: 0.60,
      feather: 0.28, bloomFalloff: 1.6, noiseAmount: 0.65,
      noiseScale: 2.0, thicknessMultiplier: 1.10,
    },
    hovered: {
      flowSpeed: 0.55, glowIntensity: 0.58, pulseFrequency: 0.62,
      pulseAmplitude: 0.40, brightnessBase: 0.52, coreWidth: 0.72,
      feather: 0.48, bloomFalloff: 1.3, noiseAmount: 0.78,
      noiseScale: 2.6, thicknessMultiplier: 1.35,
    },
  },

  // Midnight Loom — muted teal→ivory, particle sparse. Architectural, restrained.
  "midnight-loom": {
    colorIn: hexToRgb("#9cc4c0"),
    colorOut: hexToRgb("#f0ebe0"),
    curvature: 0.08,
    gradientWidth: 0.55,
    gradientStrength: 0.8,
    flowMode: 1,
    particleDensity: 1,
    particleSize: 0.20,
    rest: {
      flowSpeed: 0.35, glowIntensity: 0.18, pulseFrequency: 0.40,
      pulseAmplitude: 0.14, brightnessBase: 0.30, coreWidth: 0.50,
      feather: 0.28, bloomFalloff: 3.2, noiseAmount: 0.15,
      noiseScale: 6.5, thicknessMultiplier: 0.75,
    },
    hovered: {
      flowSpeed: 0.55, glowIntensity: 0.32, pulseFrequency: 0.62,
      pulseAmplitude: 0.24, brightnessBase: 0.48, coreWidth: 0.62,
      feather: 0.48, bloomFalloff: 2.4, noiseAmount: 0.25,
      noiseScale: 8.0, thicknessMultiplier: 0.98,
    },
  },

  // Agartha Dream — soft yellow→cherry, noise (hazy stained-glass). Warm, syrupy.
  "agartha-dream": {
    colorIn: hexToRgb("#ffd66b"),
    colorOut: hexToRgb("#e63757"),
    curvature: 0.12,
    gradientWidth: 0.55,
    gradientStrength: 0.85,
    flowMode: 0,
    particleDensity: 2,
    particleSize: 0.15,
    rest: {
      flowSpeed: 0.45, glowIntensity: 0.50, pulseFrequency: 0.55,
      pulseAmplitude: 0.22, brightnessBase: 0.45, coreWidth: 0.68,
      feather: 0.28, bloomFalloff: 2.0, noiseAmount: 0.38,
      noiseScale: 3.0, thicknessMultiplier: 1.10,
    },
    hovered: {
      flowSpeed: 0.68, glowIntensity: 0.68, pulseFrequency: 0.78,
      pulseAmplitude: 0.36, brightnessBase: 0.62, coreWidth: 0.80,
      feather: 0.48, bloomFalloff: 1.5, noiseAmount: 0.50,
      noiseScale: 4.0, thicknessMultiplier: 1.32,
    },
  },

  // Agartha Dusk — emerald→gold-leaf, particles (fireflies). Organic, dappled.
  "agartha-dusk": {
    colorIn: hexToRgb("#3fb373"),
    colorOut: hexToRgb("#e0c566"),
    curvature: 0.18,
    gradientWidth: 0.55,
    gradientStrength: 0.9,
    flowMode: 1,
    particleDensity: 2,
    particleSize: 0.16,
    rest: {
      flowSpeed: 0.40, glowIntensity: 0.30, pulseFrequency: 0.45,
      pulseAmplitude: 0.20, brightnessBase: 0.38, coreWidth: 0.70,
      feather: 0.28, bloomFalloff: 2.2, noiseAmount: 0.85,
      noiseScale: 2.4, thicknessMultiplier: 1.15,
    },
    hovered: {
      flowSpeed: 0.62, glowIntensity: 0.48, pulseFrequency: 0.65,
      pulseAmplitude: 0.32, brightnessBase: 0.55, coreWidth: 0.82,
      feather: 0.48, bloomFalloff: 1.7, noiseAmount: 0.95,
      noiseScale: 3.4, thicknessMultiplier: 1.38,
    },
  },
};

const FALLBACK_THEME = PLASMA_THEME_DEFAULTS["solar-plasma"];

export default class PlasmaEdgeProgram<
  N extends Attributes = Attributes,
  E extends Attributes = Attributes,
  G extends Attributes = Attributes
> extends EdgeProgram<string, N, E, G> {
  getDefinition() {
    return {
      VERTICES: EDGE_VERTEX_COUNT,
      VERTEX_SHADER_SOURCE,
      FRAGMENT_SHADER_SOURCE,
      METHOD: WebGLRenderingContext.TRIANGLES,
      UNIFORMS: [
        "u_matrix", "u_correctionRatio", "u_minEdgeThickness", "u_time",
        "u_curvature", "u_globalHover",
        "u_colorIn", "u_colorOut", "u_gradientWidth", "u_gradientStrength",
        "u_flowMode", "u_particleDensity", "u_particleSize",
        "u_rest_flowSpeed", "u_rest_glowIntensity",
        "u_rest_pulseFrequency", "u_rest_pulseAmplitude",
        "u_rest_brightnessBase", "u_rest_coreWidth", "u_rest_feather",
        "u_rest_bloomFalloff", "u_rest_noiseAmount", "u_rest_noiseScale",
        "u_rest_thicknessMultiplier",
        "u_hovered_flowSpeed", "u_hovered_glowIntensity",
        "u_hovered_pulseFrequency", "u_hovered_pulseAmplitude",
        "u_hovered_brightnessBase", "u_hovered_coreWidth", "u_hovered_feather",
        "u_hovered_bloomFalloff", "u_hovered_noiseAmount", "u_hovered_noiseScale",
        "u_hovered_thicknessMultiplier",
      ] as const,
      ATTRIBUTES: [
        { name: "a_source",      size: 2, type: WebGLRenderingContext.FLOAT },
        { name: "a_target",      size: 2, type: WebGLRenderingContext.FLOAT },
        { name: "a_corner",      size: 2, type: WebGLRenderingContext.FLOAT },
        { name: "a_thickness",   size: 1, type: WebGLRenderingContext.FLOAT },
        { name: "a_phase",       size: 1, type: WebGLRenderingContext.FLOAT },
        { name: "a_midStop",     size: 1, type: WebGLRenderingContext.FLOAT },
        { name: "a_hoverFactor", size: 1, type: WebGLRenderingContext.FLOAT },
        { name: "a_id",          size: 4, type: WebGLRenderingContext.UNSIGNED_BYTE, normalized: true },
      ],
    };
  }

  processVisibleItem(
    edgeIndex: number,
    startIndex: number,
    sourceData: any,
    targetData: any,
    data: any,
  ): void {
    const array = this.array;
    const x1 = sourceData.x, y1 = sourceData.y;
    const x2 = targetData.x, y2 = targetData.y;
    const thickness = data.size ?? 1;
    const phase = data._phase ?? 0;
    const midStop = data._midStop ?? 0.5;
    const hover = data._hoverFactor ?? 0;

    let i = startIndex;
    for (let k = 0; k < EDGE_VERTEX_COUNT; k++) {
      const [cu, cv] = EDGE_CORNERS[k];
      array[i++] = x1; array[i++] = y1;   // a_source
      array[i++] = x2; array[i++] = y2;   // a_target
      array[i++] = cu; array[i++] = cv;   // a_corner
      array[i++] = thickness;              // a_thickness
      array[i++] = phase;                  // a_phase
      array[i++] = midStop;                // a_midStop
      array[i++] = hover;                  // a_hoverFactor
      array[i++] = edgeIndex;              // a_id (packed as float, WebGL reads 4 UNSIGNED_BYTEs)
    }
  }

  setUniforms(params: any, { gl, uniformLocations: u }: any): void {
    // Detect picking pass: sigma binds picking framebuffer before calling render()
    // for the picking pass; default (visual) pass has null framebuffer bound.
    const isPicking = gl.getParameter(gl.FRAMEBUFFER_BINDING) !== null;

    gl.enable(gl.BLEND);
    if (isPicking) {
      // Premultiplied alpha — sigma's default. Ensures picking IDs are not summed.
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    } else {
      // Additive blending: edges contribute luminance to canvas backdrop.
      gl.blendFunc(gl.ONE, gl.ONE);
    }
    gl.disable(gl.DEPTH_TEST);

    const themeId = useSettingsStore.getState().settings.appearance.theme;
    const T = PLASMA_THEME_DEFAULTS[themeId] ?? FALLBACK_THEME;
    const r = T.rest;
    const h = T.hovered;

    gl.uniformMatrix3fv(u.u_matrix, false, params.matrix);
    gl.uniform1f(u.u_correctionRatio, params.correctionRatio);
    gl.uniform1f(u.u_minEdgeThickness, params.minEdgeThickness ?? 1.5);
    gl.uniform1f(u.u_time, (performance.now() - START_TIME) / 1000);

    gl.uniform1f(u.u_curvature, T.curvature);
    gl.uniform1f(u.u_globalHover, 0.0);
    gl.uniform3fv(u.u_colorIn, T.colorIn);
    gl.uniform3fv(u.u_colorOut, T.colorOut);
    gl.uniform1f(u.u_gradientWidth, T.gradientWidth);
    gl.uniform1f(u.u_gradientStrength, T.gradientStrength);
    gl.uniform1f(u.u_flowMode, T.flowMode);
    gl.uniform1f(u.u_particleDensity, T.particleDensity);
    gl.uniform1f(u.u_particleSize, T.particleSize);

    gl.uniform1f(u.u_rest_flowSpeed, r.flowSpeed);
    gl.uniform1f(u.u_rest_glowIntensity, r.glowIntensity);
    gl.uniform1f(u.u_rest_pulseFrequency, r.pulseFrequency);
    gl.uniform1f(u.u_rest_pulseAmplitude, r.pulseAmplitude);
    gl.uniform1f(u.u_rest_brightnessBase, r.brightnessBase);
    gl.uniform1f(u.u_rest_coreWidth, r.coreWidth);
    gl.uniform1f(u.u_rest_feather, r.feather);
    gl.uniform1f(u.u_rest_bloomFalloff, r.bloomFalloff);
    gl.uniform1f(u.u_rest_noiseAmount, r.noiseAmount);
    gl.uniform1f(u.u_rest_noiseScale, r.noiseScale);
    gl.uniform1f(u.u_rest_thicknessMultiplier, r.thicknessMultiplier);

    gl.uniform1f(u.u_hovered_flowSpeed, h.flowSpeed);
    gl.uniform1f(u.u_hovered_glowIntensity, h.glowIntensity);
    gl.uniform1f(u.u_hovered_pulseFrequency, h.pulseFrequency);
    gl.uniform1f(u.u_hovered_pulseAmplitude, h.pulseAmplitude);
    gl.uniform1f(u.u_hovered_brightnessBase, h.brightnessBase);
    gl.uniform1f(u.u_hovered_coreWidth, h.coreWidth);
    gl.uniform1f(u.u_hovered_feather, h.feather);
    gl.uniform1f(u.u_hovered_bloomFalloff, h.bloomFalloff);
    gl.uniform1f(u.u_hovered_noiseAmount, h.noiseAmount);
    gl.uniform1f(u.u_hovered_noiseScale, h.noiseScale);
    gl.uniform1f(u.u_hovered_thicknessMultiplier, h.thicknessMultiplier);
  }
}
