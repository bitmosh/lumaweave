// PlasmaEdge.vert.glsl — LumaWeave v91 (iter 5 port)
// Reference copy — shader source lives inline in PlasmaEdgeProgram.ts.
//
// Expands each edge into a curved ribbon walking a quadratic bezier in
// WORLD space. Thickness offset is added in world scaled by
// u_correctionRatio so on-screen size stays perceptually stable across
// zoom (matches Sigma 3's stock EdgeRectangleProgram convention).
//
// Each edge consumes EDGE_VERTEX_COUNT (72) vertices spread along u in
// fine steps (EDGE_SEGMENTS=12 quads × 6 verts). Hardware linear
// interpolation between two end-pairs would collapse the bezier walk
// back to a straight line; fine subdivision lets the curve land.
//
// Coords:
//   u in [0,1]   — position along edge (0=source, 1=target)
//   v in [-1,1]  — position across edge (-1 left rim, +1 right rim)
//
// PICKING_MODE bypass: when Sigma prepends #define PICKING_MODE,
// v_color = a_id (picking ID encoded as 4 UNSIGNED_BYTEs). Fragment
// emits v_color unchanged before any lighting math.

attribute vec2  a_source;
attribute vec2  a_target;
attribute vec2  a_corner;       // (uPos [0..1], vSign [-1..1])
attribute float a_thickness;
attribute float a_phase;        // [0..1] structural pulse phase
attribute float a_midStop;      // [0..1] gradient transition along edge
attribute float a_hoverFactor;  // [0..1] per-edge hover blend
attribute vec4  a_id;           // picking ID (4 UNSIGNED_BYTEs packed)

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
