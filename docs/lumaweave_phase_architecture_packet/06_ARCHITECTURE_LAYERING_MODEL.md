# Architecture Layering Model

## Layer Order

```txt
1. Skeleton
2. Organs
3. Muscles
4. Nerves
5. Armor
6. Paint / Glitter
```

## Skeleton

Types, contracts, tokens, schemas.

## Organs

State/data-flow/policy systems.

## Muscles

Application behavior, renderer behavior, adapters.

## Nerves

Settings, QA, debug rows, Playwright, test hooks.

## Armor

Usability shell: panels, containment, layout stability.

## Paint / Glitter

Solar Plasma, full theme editor, 3D, force physics, cinematic effects.

## Rule

Bandit may inspect later layers, but must not implement them until earlier required layers are stable.
