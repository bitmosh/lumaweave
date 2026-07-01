---
id: agent.known-sharp-edges
title: Known Sharp Edges
type: manual
status: current
domain: agent
cluster: violet
agent_readable: true
include_in_self_graph: false
last_updated: 2026-06-30
references:
  - system.lumaweave.known-issues
tags: [sharp-edges, runtime, tests]
---

# Known Sharp Edges

Recurring implementation traps, not a bug backlog. Current defects and quarantined tests live in [Known Issues](../KNOWN_ISSUES.md).

## Store state in callbacks

Render-captured settings can be stale during pointer/window events. Read current persisted state through `useSettingsStore.getState()` or a deliberately maintained live-store accessor.

This matters in tile dragging/grouping, source switching, pins, and theme overrides.

## Sigma lifecycle

Adding a setting to the graph-construction effect can recreate Sigma, reset camera/selection, and restart GWells. Dataset replacement constructs; other changes mutate and refresh.

The `GraphRenderer` interface is not wired into `SigmaGraphView`. Do not build against it as though renderer switching exists.

## GWells controller replacement

Stop the previous controller before applying a new dialect. Pause/resume must not schedule duplicate loops. Seed changes may require seed-derived cache rebuilds; well/interaction changes use different override paths.

There are two physics-related registries: the GWells dialect registry is the engine authority, while `src/graph/physics/physicsDialectRegistry.ts` supports control-plane inventory. Add engine behavior to the GWells modules.

## Generated self-graph

Documentation changes alter the application's dogfood graph. The fixture is generated and ignored; Vite/CI may regenerate it. If docs move or IDs change, run `npm run generate:graph` and inspect warnings.

## Source-adapter status

A candidate adapter has detailed metadata and a no-op error loader. It is not usable. A registered adapter still may support less than its input-pattern metadata suggests; package dependencies currently mean package.json only.

## Tauri path boundaries

Project reads and user-selected reads have different trust models. Do not replace a scoped read with `read_user_file` for convenience. Directory traversal intentionally rejects symlinks and returns relative paths.

The script timeout wraps the wait; it does not prove the spawned process was terminated. Do not describe it as a hard process kill.

## Theme governance

Token-governance helpers and tests exist, but the application does not call the assertion at boot. Do not claim boot enforcement unless that call is added and validated.

## CSS stacking contexts

A large numeric child z-index cannot escape a parent's stacking context. Backdrop filters, transforms, opacity, and positioned ancestors may create new contexts. Inspect the ancestor chain before increasing z-index.

## Playwright environment

The local suite contains skips/fixmes and is not run by GitHub Actions. Passing typecheck is not equivalent to E2E health. Reproduce timing failures in isolation and under the relevant suite load before changing production behavior.

## Provenance and IDE paths

Provenance manifests store repository-relative paths. The runtime resolves them against the project root before constructing editor URLs. Tauri development may run with `src-tauri/` as the process directory, so root resolution must normalize that boundary.

## Temporary diagnostics

Use unique prefixes and remove them before handoff. Search source and tests for both direct logs and browser-console listeners.
