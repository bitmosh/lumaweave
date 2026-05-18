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
5. `docs/physics/GWELLS_DIALECT_PARALLEL_SPINES.md` — the parallel-spines
   dialect specification
6. `docs/physics/GWELLS_OVERVIEW.md` — system overview (start here for new
   readers)
7. `docs/physics/GWELLS_CURRENT_STATE.md` — pass timeline and known state

The module is designed for future extraction as a standalone npm
package. Its only runtime dependency is `graphology`.

## Status

v0 of the radial-backbone and parallel-spines dialects ships as of Pass
C8.4. See `GWELLS_CURRENT_STATE.md` for migration history. Pass C9 (drag-
pin redesign) is next; future passes extend the system per the trajectory
in `GWELLS_FUTURE_VISION.md`.