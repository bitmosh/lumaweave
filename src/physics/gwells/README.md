# gwells

Typed gravity-well physics engine for graphology graphs.

This is the source tree for the gwells module. For full documentation,
read the following in order:

1. `docs/physics/GWELLS_README.md` — module orientation and quickstart
2. `docs/physics/GRAVITY_WELL_SYSTEM_CONTRACT.md` — authoritative
   behavior contract
3. `docs/physics/GWELLS_REGISTRY_PATTERNS.md` — how the four
   registries compose
4. `docs/physics/GWELLS_DIALECT_RADIAL_BACKBONE.md` — the v0 seeder
   family specification

The module is designed for future extraction as a standalone npm
package. Its only runtime dependency is `graphology`.

## Status

v0 — Pre-implementation. Skeletons only; entries and engine arrive
in Pass C of the gwells migration.
