# Parallel Interaction Structure

## Core Principle

When implementing a behavior for nodes, explicitly ask:
**What is the matching edge behavior?**

When implementing a behavior for edges, explicitly ask:
**What is the matching node behavior?**

If they differ, document why.

## Standard

When a node interaction exists, edge interaction should have a mirrored structure unless explicitly impossible.

## Node → Edge Parity Example

### Node Hover (Existing)

- **State**: `hoveredNodeId`
- **Events**: `enterNode` / `leaveNode`
- **Policy**: Show hovered node label
- **Style**: Set node color to `hoverNodeColor`
- **Debug**: `Hovered Node` row in debug panel
- **QA**: "Hover label shows" check in QA panel

### Edge Hover (Planned/Partial)

- **State**: `hoveredEdgeId` (to be added)
- **Events**: `enterEdge` / `leaveEdge` (Sigma supports these)
- **Policy**: Show hovered edge label
- **Style**: Set edge color/size on hover (to be defined)
- **Debug**: `Hovered Edge` row in debug panel (to be added)
- **QA**: "Edge hover label appears" check in QA panel (to be added)

## Completion Rule

No parallel feature should be considered complete unless node and edge parity is reviewed.

If parity is intentionally skipped, document why in this file.

## Relationship Label Display Templates

### Planned Presets

Future relationship label display should support configurable templates using:
- Relationship type
- Source node label
- Target node label
- Source file path (if available in graph artifacts)
- Source location (line number, if available)

#### 1. relationship-only
```
contains
```
Shows only the relationship type.

#### 2. source-target
```
agent_utils.py -> is_duplicate_output()
```
Shows source node label, arrow, target node label.

#### 3. source-relationship-target
```
agent_utils.py -> contains -> is_duplicate_output()
```
Shows source, relationship, and target.

#### 4. source-location
```
core/agent_utils.py:L39
```
Shows source file path and line number.

#### 5. source-location-code-line
```
core/agent_utils.py:L39 -> actual code line
```
Shows source location and the actual code line at that location.

### Important Limitation

Actual source code line extraction requires one of:
- Graphify artifacts already include source snippets
- Tauri backend file read support
- Source files copied into a publicly accessible fixture

**Do not fake source-line extraction if data is unavailable.**

## Current Parity Status

| Feature | Node | Edge | Status |
|---------|------|------|--------|
| Hover label | ✅ Implemented | ❌ Not implemented | Parity gap |
| Selection | ✅ Implemented | ✅ Implemented | Parity achieved |
| Label modes | ✅ Implemented | ✅ Implemented | Parity achieved |
| Debug display | ✅ Hovered Node | ❌ Hovered Edge | Parity gap |
| QA coverage | ✅ Hover label check | ❌ Edge hover check | Parity gap |

## Future Parity Targets

- Edge hover label (high priority)
- Edge hover styling (medium priority)
- Edge-specific label templates (low priority)
