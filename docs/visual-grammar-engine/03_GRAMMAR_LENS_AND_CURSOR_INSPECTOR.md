# 03 — Grammar Lens and Cursor Grammar Inspector

## Purpose

Grammar Lens is the direct manipulation UI for the Visual Grammar Engine.

It lets users click an element, inspect the grammar that controls it, edit a focused YAML slice, validate the edit, preview it safely, pin the inspector, and save the result as an override or preset.

## Naming

```txt
Grammar Lens
General feature: click-to-inspect/edit visual grammar.

Cursor Grammar Inspector
Default-on/toggleable cursor popout mode.

Pinned Grammar Lens
Docked/pinned larger editor mode.
```

## Interaction Flow

```txt
Alt + Shift + I
→ Inspector Mode activates
→ user clicks a visual element
→ selected element highlights
→ system resolves grammar handle
→ Cursor Grammar Inspector opens near cursor
→ popout shows focused YAML grammar slice
→ user edits
→ validation runs
→ user previews/applies/saves/resets
```

## Cursor Popout Contents

The Cursor Grammar Inspector should show:

- Element name.
- Grammar handle.
- Scope.
- Source grammar preset.
- Focused YAML slice.
- Validation status.
- Safety status.
- Preview / Apply / Reset controls.
- Hint: `Press P to pin this Grammar Lens.`

## Focused YAML Slice

The popout should not show the entire grammar file by default.

It should show only the slice relevant to the selected element.

Example:

```yaml
element: graph.node.changed
handle: graph.node.glow
source: dialects/diff-work-pulse.lwgrammar.yaml

signal:
  use: diffPulse

map:
  intensity: "changedFiles / 12"
  saturation: "+20%"
  radius: "+8%"

safety:
  reducedMotion: static-highlight
  maxPulseHz: 1
```

## Pinning

Unpinned behavior:

- Follows selected element.
- Closes on Escape or outside click.
- Best for lightweight edits.

Pinned behavior:

- Becomes a dockable inspector panel.
- Can compare multiple selected handles.
- Can show related signal/source/safety sections.
- Can open the full grammar preset.
- Can show diff/revert/history.

## Apply Model

```txt
Draft
YAML changed but not validated.

Preview
Validated and temporarily applied in current session.

Saved
Written into a user preset / workspace override.
```

User-facing flow:

```txt
Edit → Validate → Preview → Save
```

System-facing flow:

```txt
YAML text
→ parse
→ schema validate
→ capability validate
→ safety validate
→ dependency/target resolution
→ preview diff
→ apply to preview layer
→ user confirms save
→ persist as override/preset
```

## Override Layer

Grammar Lens updates should apply through a reversible override stack:

```txt
Base theme/preset
→ active visual grammar preset
→ workspace overrides
→ temporary Grammar Lens preview override
```

Invalid edits should not apply.

Unsafe edits should transform or reject with clear explanation.

## Inline Validation Feedback

Examples:

```txt
✓ Valid YAML
✓ Handle exists: graph.node.glow
✓ Target exists: graph.nodes.changed
✓ Reduced Motion fallback present
⚠ intensity should be between 0 and 1
✕ maxPulseHz exceeds safety limit
✕ handle graph.node.strobe is forbidden
```

## Forbidden

Grammar Lens must not allow:

- Raw JavaScript.
- Shell commands.
- Remote imports.
- Arbitrary CSS injection.
- Permission changes.
- Command execution.
- Audio input/playback.
- Uncontracted graph/Sigma runtime mutation.
- Editing evidence truth or QA state as if it were visual style.

## Core Invariant

Grammar Lens can edit presentation grammar.

Grammar Lens cannot edit source truth, evidence status, permissions, command behavior, or uncontracted runtime capabilities.
