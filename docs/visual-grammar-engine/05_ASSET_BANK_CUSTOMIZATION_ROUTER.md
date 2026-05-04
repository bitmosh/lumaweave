# 05 — Asset Bank Customization Router

## Purpose

The Asset Bank is the last organized point of contact with the user for customization.

It is a user-facing catalog, library, staging area, and routing layer for approved customization assets.

The Asset Bank should route user choices into the correct underlying systems without replacing those systems.

## Core Model

```txt
User-facing layer:
Asset Bank

Routes into:
- Theme Token Registry
- Theme Handle Registry
- Layout Preset Registry
- Widget Registry
- Graph/Sigma visual mapping registry, later
- Audio/music reactive mapping registry, later
- Evidence/QA templates
- Source Adapter fixtures, later

Does not replace:
- canonical token paths
- safety contracts
- QA/advisory lockstep
- graph/audio/runtime boundaries
```

## Core Rule

Asset Bank exposes approved customization options.

Registries decide what those options are allowed to mean.

## Responsibilities

The Asset Bank should:

- Organize user-accessible customization assets.
- Show provenance, status, type, compatible targets, and safety status.
- Route assets into token/handle/layout/signal registries.
- Prevent unsupported or unsafe asset use.
- Support preview/revert/history later.
- Support import quarantine later.
- Provide theme/layout/grammar preset browsing.

## Non-Responsibilities

The Asset Bank must not:

- Invent canonical token paths.
- Write arbitrary CSS/JS.
- Execute commands.
- Mutate Sigma.
- Enable audio input/playback.
- Bypass evidence contracts.
- Treat imported assets as trusted by default.
- Install executable theme packs.

## User-Facing Categories

```txt
Themes
Layouts
Widget presets
Panel frames
Status badges
Icons
Typography packs
Graph visual presets
Visual grammar presets
Signal Loom routes
Evidence templates
Source adapter fixtures
Screensaver/Ambient modes, future
```

## Accepted Asset Type Registry vs Asset Bank

```txt
Accepted Asset Type Registry
The rules for what can exist.

Asset Bank
The user-facing library of things that passed those rules.
```

## Asset Lifecycle

```txt
candidate
→ quarantined
→ validated
→ accepted
→ active
→ deprecated
→ rejected
```

## Example Asset Metadata

```ts
{
  id: "asset.solar-archive.boundary-seal.gold",
  type: "badge-style-preset",
  name: "Solar Archive Boundary Seal",
  status: "accepted",
  source: "lumaweave-generated",
  version: "1.0.0",
  scope: ["theme", "evidence", "boundary-status"],
  allowedTargets: ["evidence.boundarySeal", "status.badge"],
  forbiddenCapabilities: ["commandExecution", "audioInput", "graphMutation"],
  reducedMotionSafe: true,
  provenance: {
    createdBy: "local-user",
    importedAt: "...",
    signed: false
  }
}
```

## Inspector Integration

If a user clicks a visual element in Grammar Lens, the Asset Bank should show only compatible assets.

Example:

```txt
Selected:
Boundary Seal

Allowed asset slots:
- icon
- badge frame
- glow profile
- status color role
- typography role

Available from Asset Bank:
- Solar Archive Seal
- Blueprint Lock Badge
- Tokyo Neon Warning Chip
- Glade Atlas Oath Mark
```

## Product Analogy

```txt
Registries = warehouse inventory system / routing rules / safety rules
Asset Bank = user-facing catalog and staging area
Inspector Mode = scanner gun / picker interface
Theme Preview = temporary staging cart
Saved Theme/Layout = finalized order
```

## Core Invariant

User-accessible does not mean unrestricted.

It means visible, understandable, configurable, validated, and reversible.
