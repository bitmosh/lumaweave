# Session Log: Graphify Schema Detection Fix

## Goal

Fix the normalizer to correctly handle the actual Graphify schema (graph.nodes/graph.links) instead of only rendering one node.

## Files Changed

- `src/graph/normalize/normalizeGraphifyGraph.ts` - Updated to match Graphify schema with correct field priorities

## What Changed

### Schema Detection

**Issue**: Normalizer was looking for top-level `nodes` and `edges`, but Graphify uses `graph.nodes` and `graph.links`.

**Fix**: Updated extraction functions to check `graph.nodes` and `graph.links` first, then fall back to top-level fields.

### Node ID Extraction

**Priority**: id → norm_label → label → index-based

**Before**: Only checked `id` field, then index-based fallback.

**After**: Checks `id`, `norm_label`, `label` in order, then index-based.

### Node Label Extraction

**Priority**: label → norm_label → id → fallback

**Before**: Checked `label`, `name`, `title`, `id`.

**After**: Checks `label`, `norm_label`, `id` to match Graphify schema.

### Node Type Extraction

**Priority**: file_type → type → infer from source_file extension

**Before**: Checked `type`, `kind`, `category`.

**After**: Checks `file_type` first (Graphify field), then `type`, then infers from `source_file` extension.

### Edge Source Extraction

**Priority**: source → _src → from → source_id → data.source

**Before**: Checked `source`, `from`, `source_id`, `data.source`.

**After**: Added `_src` priority (Graphify field).

### Edge Target Extraction

**Priority**: target → _tgt → to → target_id → data.target

**Before**: Checked `target`, `to`, `target_id`, `data.target`.

**After**: Added `_tgt` priority (Graphify field).

### Edge Relationship Extraction

**Priority**: relation → relationship → type

**Before**: Checked `relationship`, `label`, `type`.

**After**: Added `relation` priority (Graphify field).

### Edge ID Generation

**Format**: `${source}--${relationship}--${target}--${index}`

**Before**: Used existing `id` or `edge-${index}`.

**After**: Generates stable ID from source, relationship, target, and index for better deduplication.

### Debug Logging

Added console.log statements to track:
- Detected node path: graph.nodes
- Detected edge path: graph.links
- Raw node count: 233
- Raw edge count: 313
- Normalized node count
- Normalized edge count

## Validation

- Typecheck passed: `npm run typecheck` succeeded
- Console will log schema detection and normalization results
- App should now render all 233 nodes instead of just one

## Issues

None encountered during implementation.

## Decision

Updated normalizer to match actual Graphify schema with correct field priorities. Added debug logging to verify schema detection and normalization counts.

## Next Step

Verify the app renders all 233 nodes in the browser at `http://localhost:1420` and check console for schema detection logs.
