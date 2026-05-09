---
id: meta.cluster.colors.readme
title: Doc Meta — Cluster Color Registry
type: readme
status: current
cluster: violet
domain: agent
subdomain: tooling
agent_readable: true
include_in_self_graph: false
last_updated: 2026-05-09
last_pass: vP-Forensics-2
references:
  - meta.cluster.colors.json
tags: [meta, cluster, colors, registry, customization]
---

# Doc Meta — Cluster Color Registry

This folder holds **infrastructure metadata** for the documentation system. Files here are not user-facing content; they are tooling configuration consumed by scripts and (eventually) the radial inspector / doc navigator.

## What's here

| File | Purpose |
|------|---------|
| `cluster-colors.json` | Single source of truth for cluster color values |
| `README.md` | This file |

## Cluster colors — how they work

Every doc carries a `cluster:` field in its frontmatter. The value is a descriptive color name:

```yaml
cluster: gold      # theme docs
cluster: azure     # graph docs
cluster: violet    # agent docs
```

The actual hex values for those names live in `cluster-colors.json`:

```json
{
  "palette": {
    "gold":  { "hex": "#FFB347", "domain": "theme" },
    "azure": { "hex": "#3D8BD8", "domain": "graph" },
    ...
  }
}
```

**Decoupling color from concept:** docs reference colors by name (`gold`), not by hex (`#FFB347`). To change "what gold looks like everywhere," edit `cluster-colors.json`. Frontmatter on individual docs never changes during a color customization.

## The 9-color palette

| Name | Hex | Domain | Conceptual family |
|------|-----|--------|-------------------|
| `gold` | `#FFB347` | theme | Visual identity / design tokens |
| `azure` | `#3D8BD8` | graph | Graph rendering / Sigma |
| `violet` | `#8B5CF6` | agent | Agent brain / operating memory |
| `teal` | `#14B8A6` | visual-grammar-engine | Future visual customization |
| `lime` | `#84CC16` | source-adapter | Data ingestion |
| `slate` | `#64748B` | control-plane | Mission Control / QA / governance |
| `stone` | `#A8A29E` | layout | UI shell / chrome |
| `ember` | `#D8541F` | audio | Audio reactivity / sensory signals |
| `crimson` | `#DC2626` | accessibility | Safety / motion / sensory limits |

## Future customization path

The current state is "edit JSON to change color values." Three planned evolutions:

**Soon** — A `loadClusterColors()` utility plus CSS custom property bridge (`--cluster-gold`, `--cluster-azure`, etc.) so consumers can read colors via standard CSS variable mechanisms.

**Later** — Cluster colors plug into the existing theme override storage system (`src/themes/themeOverrideStorage.ts`). Users get per-user color preferences alongside their theme overrides.

**Even later** — A simple color picker UI within LumaWeave for cluster colors. Per-theme variants (Solar Plasma might have a slightly redder gold than Midnight Loom).

The infrastructure for this already exists in the theme system. We just haven't wired the docs cluster colors through it yet. The naming pattern (descriptive color names, not hex literals in frontmatter) preserves the option to add customization later without touching individual docs.

## Adding new cluster colors

If a new conceptual family emerges that doesn't fit any existing bucket:

1. Add an entry to `cluster-colors.json` palette
2. Update `scripts/frontmatter-rules.yaml` — either add a new schema or update an existing one's `cluster:` value
3. Run `node scripts/normalize-frontmatter.mjs --dry-run --scope <relevant-subdir>` to preview
4. Run for real, commit with the rule change

Avoid color additions for fine-grained subdivisions. If theme cluster needs to split into theme-runtime vs theme-customization, prefer a `gold-light` / `gold-dark` variant within the same color family rather than introducing an entirely new color. Visual cohesion of the palette matters.

## Stability guarantee

`cluster-colors.json` schema version 1 is stable. Adding new color entries to the palette is non-breaking. Removing or renaming entries IS breaking — it requires a migration of all docs that reference the removed name.

The 9-color palette as currently defined is the locked v86a baseline. Subsequent additions extend; they do not replace.
