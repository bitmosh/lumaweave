# Changelog

All notable changes to LumaWeave are recorded here.
Entries are grouped by category and reference commit SHAs.

---

## [Unreleased] — pre-1.0

### Added

- **Cerebra snapshot receive path (S-031):** `cerebra_watcher` background thread
  subscribes to the hub Fossic store (`LATTICA_FOSSIC_STORE` env var or
  `~/.lattica/fossic/store.db`) and emits `cerebra:snapshot-available` Tauri
  events when Cerebra publishes a `GraphSnapshotAvailable` event. The frontend
  listener switches the active source adapter automatically. (`1ce580e`, `1285198`)
- **Gap replay on subscription degradation:** When the PostCommit subscription
  degrades, `cerebra_watcher` replays missed `GraphSnapshotAvailable` events
  (per known stream) before re-subscribing. (`1285198`)
- **`SourceLoaded` causation chain:** `lw_emit_source_loaded` now accepts an
  optional `causation_id` (hex Fossic `EventId`) that is stored on the
  `Append.causation_id` field, making the Cerebra→LumaWeave load traceable in
  the event log. (`1ce580e`)
- **Lifecycle event bridge:** `lw_emit_source_loaded`, `lw_emit_source_switched`,
  `lw_emit_source_load_failed`, `lw_emit_theme_changed`, and
  `lw_emit_graph_layout_settled` Tauri commands write lifecycle events to the
  project's local Fossic store. (`977a6e8`)
- **GWells hub-ring crowding relief:** Nodes in large hub rings no longer
  overlap under default seed parameters. (`a066dba`)
- **GWells benchmark matrix:** Deterministic benchmark harness extended to
  cover additional graph sizes and topology shapes. (`ea6152d`, `af81521`)
- **GWells interaction indexing by source and target:** Interaction lookup is
  now O(1) by node role; fixes a regression where the interaction index was
  never populated. (`af81521`, `4f28c47`)

### Changed

- **Version aligned to 0.19.2:** `package.json`, `src-tauri/Cargo.toml`, and
  `tauri.conf.json` were all at different stale versions; unified to `0.19.2`.
  (`850fa0c`)
- **Package hygiene:** Moved `chromium` and `glob` from `dependencies` to
  `devDependencies`; removed dead `graphology-layout-forceatlas2` dependency
  (replaced by GWells); removed Tauri scaffold `greet` boilerplate. (`7256f20`)
- **Shared `getNestedValue` utility:** Extracted from four inline copies into
  `src/control-plane/settingsUtils.ts`. (`7256f20`)
- **Renderer interface typing:** `graph: any` replaced with `graph: Graph`
  in `GraphRenderer`; redundant `as any` casts removed in `SigmaGraphView`.
  (`7256f20`)
- **GWells runtime lifecycle hardening:** `pause()`, `resume()`, `stop()`, and
  `step()` now guard against out-of-order calls; runtime state is inspectable.
  (`04ff1d5`, `c2eafbd`)
- **GWells fallback seeding safety:** Fallback placement no longer crashes on
  empty or degenerate graph inputs. (`a98d372`)
- **GWells structural resolver routing:** Well assignment routed through the
  structural resolver rather than hard-coded role checks. (`7b8b6b7`)
- **Documentation consolidation:** Internal agent-process docs archived; public
  docs reorganized under `docs/canonical/`, `docs/overview/`. (`4eb6316`)

### Fixed

- **GWells interaction index never populated:** A registration ordering bug
  caused the interaction index to be empty at runtime. (`4f28c47`)
- **GWells hub-ring radius scaling:** Hub rings scaled incorrectly for graphs
  with high-degree hub nodes. (`856dcd3`)

---

## Historical note

LumaWeave reached its current architecture (GWells physics engine, Sigma 3
renderer, Fossic lifecycle event bridge, source adapter registry) through a
series of pre-0.19 development passes not individually itemized here. The git
log contains the full history.
