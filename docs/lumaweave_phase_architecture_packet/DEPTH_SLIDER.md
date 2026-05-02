Document but do not implement:
Progressive Neighborhood Depth Slider

Future design:
- max depth field: 1–5
- slider has circular major markers for each whole depth layer
- slider has notches between markers for .1 increments
- decimal values progressively blend/reveal the next graph ring
- depth rings should use tokenized gradient colors
- current Baseline B must first stabilize integer Depth 1/2/3 behavior

Progressive Neighborhood Depth Slider

Purpose:
Replace the simple integer Neighborhood Depth selector with a richer depth control that supports 1–5 graph traversal layers and smooth visual interpolation.

Core behavior:
- User can set max depth from 1 to 5.
- Slider displays circular major nodes at each whole depth level:
  1 ○ 2 ○ 3 ○ 4 ○ 5
- Slider includes small notches between whole levels for .1 increments.
- Whole numbers represent completed graph traversal rings/layers.
- Decimal values represent gradual reveal / intensity blending between rings.

Example:
Depth 2.0:
- selected/root node
- primary edges
- secondary nodes

Depth 2.5:
- same as Depth 2
- secondary edges / ternary nodes begin fading in at partial opacity

Depth 3.0:
- secondary edges and ternary nodes fully visible

Depth 4.3:
- fourth-layer neighborhood mostly active
- fifth-layer hints may begin if visual rules allow

Visual model:
- Each depth ring gets its own tokenized color.
- Edges/nodes blend by proximity to the current depth value.
- Labels can appear at whole-depth thresholds or fade in progressively.
- User can choose whether labels follow:
  - integer-only reveal
  - progressive fade-in
  - selected/hover-only

Settings:
- Max Neighborhood Depth: 1–5
- Current Depth: 1.0–maxDepth, step 0.1
- Progressive Reveal: on/off
- Depth Gradient: theme token preset
- Label Reveal Mode: threshold / progressive / selected-only

Phase:
Later visual/interaction phase.
Do not implement until integer Depth 1/2/3 behavior is stable and accepted.