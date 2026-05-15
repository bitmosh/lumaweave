# DRAFT — vP-v86b-node-render-fix: Restore parent vertex shader for node visibility

**Status:** DRAFT — Awaiting operator visual validation
**Date:** 2026-05-14
**Pass:** vP-v86b-node-render-fix

---

## Summary

Root cause: NodeSphereProgram was overriding the parent NodeCircleProgram's vertex shader with a custom shader that incorrectly emitted graph-space positions instead of quad-space positions. The fragment shader expected v_position in (0,0) to (1,1) quad space, but was receiving graph-space positions (potentially tens of thousands of units), causing all fragments to be discarded and nodes to be invisible.

Fix: Deleted the custom vertex shader and restored the parent's vertex shader by removing VERTEX_SHADER_SOURCE from getDefinition(). The parent NodeCircleProgram correctly emits v_position in (0,0) to (1,1) quad space, which is the contract the fragment shader was written against.

---

## Diagnostic Side-Quest Findings

Grep of SigmaGraphView.tsx for node program bindings:

**Search terms:**
- `nodeProgramClasses` ✅ Found
- `setSetting("nodeProgram` ✅ No results
- `new NodeCircleProgram` ✅ No results
- `new NodeSphereProgram` ✅ No results
- `defaultNodeType` ✅ Found
- `nodeType` ✅ No additional matches beyond defaultNodeType

**Results:**

1. **nodeProgramClasses (lines 561-563):**
```typescript
nodeProgramClasses: {
  circle: NodeSphereProgram,
},
```
Exactly ONE binding for the node circle program, and it's NodeSphereProgram.

2. **defaultNodeType (line 564):**
```typescript
defaultNodeType: "circle",
```

**Conclusion:** Clean configuration. No leftover NodeCircleProgram registration. NodeSphereProgram is the sole node renderer bound to the "circle" type.

---

## Changes Made

### File: src/graph/renderers/sigma2d/NodeSphereProgram.ts

**Change 1: Delete SPHERE_VERTEX_SHADER constant (lines 25-53):**
```typescript
// DELETED:
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
```

**Problem with this shader:** It was emitting `v_position = a_position`, which is the raw node graph-space position attribute. This lives in whatever coordinate space FA2 has spread the nodes across (currently hundreds of thousands of units wide). The fragment shader expected v_position in (0,0) to (1,1) quad space, so the distance calculation was enormous, alpha was zero, and every fragment was discarded.

---

**Change 2: Update comment block (lines 4-26):**
```typescript
// Before:
/**
 * Extends NodeCircleProgram and overrides both vertex and fragment shaders to add:
 * - Pass quad position from vertex to fragment shader
 */

// After:
/**
 * Extends NodeCircleProgram and overrides the fragment shader to add:
 * - Radial alpha mask (circle shape)
 * ...
 * Uses the parent's vertex shader which provides correct quad-space coordinates.
 * The parent emits v_position in (0,0) to (1,1) quad space, which is the contract
 * the fragment shader was written against.
 */
```

Updated to reflect that only the fragment shader is now overridden.

---

**Change 3: Modify getDefinition() to not set VERTEX_SHADER_SOURCE (lines 142-148):**
```typescript
// Before:
getDefinition() {
  const definition = super.getDefinition();
  return {
    ...definition,
    VERTEX_SHADER_SOURCE: SPHERE_VERTEX_SHADER,
    FRAGMENT_SHADER_SOURCE: SPHERE_FRAGMENT_SHADER,
  };
}

// After:
getDefinition() {
  const definition = super.getDefinition();
  return {
    ...definition,
    FRAGMENT_SHADER_SOURCE: SPHERE_FRAGMENT_SHADER,
  };
}
```

**Effect:** This allows the parent NodeCircleProgram's vertex shader to run. The parent correctly emits v_position in (0,0) to (1,1) quad space via its internal attributes, which is the contract the fragment shader was written against.

---

**Change 4: Fragment shader (SPHERE_FRAGMENT_SHADER):**
**Status:** Unchanged — continues to work with v_position from parent's vertex shader.

The fragment shader still expects v_position in (0,0) to (1,1) quad space, which is now correctly provided by the parent's vertex shader.

---

**Change 5: setUniforms override and uniform caching:**
**Status:** Unchanged — no modifications needed.

The uniform caching logic remains the same, as it's independent of the vertex shader change.

---

## Validation

### Typecheck
```bash
npm run typecheck
```

**Result:**
```
> lumaweave@0.6.0 typecheck
> tsc --noEmit
```

**Status:** ✅ Clean exit, zero errors

---

### Dev Server Startup
```bash
npm run dev
```

**Status:** Awaiting operator verification

---

## Expected Changes

Operator should reload the app and confirm:

1. **Nodes visible:** Nodes are visible as spheres on the graph
2. **No GLSL errors:** No GLSL compile errors in console
3. **No uniform location errors:** No "UniformLocation is not from the current active Program" errors
4. **No context loss:** No WebGL context loss errors
5. **Sphere appearance:** Nodes appear as glowing spheres with the expected visual effects (radial alpha mask, specular highlight, glow falloff, rim light, hum animation, flow animation)

---

## Files Modified

- `src/graph/renderers/sigma2d/NodeSphereProgram.ts` — Deleted SPHERE_VERTEX_SHADER constant, simplified getDefinition() to not override VERTEX_SHADER_SOURCE, updated comment block

---

## Files Not Modified

- `src/graph/renderers/sigma2d/SigmaGraphView.tsx` — No changes (read-only for diagnostic side-quest)
- `src/graph/renderers/sigma2d/buildGraphologyGraph.ts` — No changes
- Any other file — No changes

---

## Stop Conditions Checked

- ✅ Typecheck passed (zero errors)
- ✅ Parent getDefinition() provides VERTEX_SHADER_SOURCE (inherited from NodeCircleProgram)
- ✅ Fragment shader still references v_position correctly (it receives v_position from parent's vertex shader under the same name)
- ✅ No files outside the allowed list needed editing

---

## Additional Findings

During the diagnostic side-quest and fix:

1. **Clean configuration:** Exactly one node program binding (NodeSphereProgram for "circle" type), no leftover NodeCircleProgram registration.

2. **No direct instantiation:** The node program is bound in the config object, not instantiated directly with `new NodeSphereProgram()`. This is the standard Sigma pattern.

3. **Parent contract:** The parent NodeCircleProgram's vertex shader emits v_position in (0,0) to (1,1) quad space, which matches the fragment shader's expectations. This is the correct contract.

4. **Custom shader bug:** The custom vertex shader was incorrectly emitting graph-space positions instead of quad-space positions. This is a common WebGL mistake when overriding shaders without understanding the coordinate space contract.

5. **Fragment shader unchanged:** The fragment shader did not need modification because it was already written against the correct contract (quad-space positions). The bug was in the vertex shader, not the fragment shader.
