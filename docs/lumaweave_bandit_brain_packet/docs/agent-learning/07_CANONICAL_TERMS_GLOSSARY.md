# Canonical Terms Glossary

## Accepted QA Report

A manual or automated QA result that becomes contract evidence. Accepted QA can override code inspection.

## Advisory Set

Bandit-facing questions, proposals, and backlog items tied to a QA/version context.

## Blast Radius

The intended and actual set of files/systems a pass may affect.

## Contract Artifact

Any key, registry entry, checklist item, selector, DOM marker, doc section, or test witness that preserves accepted behavior.

## DOM Witness

A rendered attribute or element that proves runtime behavior exists. Example: `data-lw-theme-target`.

## Evidence Surface

UI/debug/test-accessible area used to prove contract state. Examples: Mission Control Debug summaries, Playwright `data-testid` surfaces.

## Future Scaffold

A placeholder or typed structure intended for later systems. Future scaffolds must not be wired as active controls until implemented.

## Identity Drift

A failure mode where related IDs are renamed, blended, or substituted without updating every dependent layer.

## Tangle Mode

A pause-and-map procedure used when failures cascade or the repo enters confusing state.

## Theme Token Path

Canonical name for a theme value, such as `panel.background`.

## Theme Target ID

Canonical name for an inspectable UI/graph surface, such as `mission-control.panel`.

## Visual Handle

CSS/scaffolding class family used to identify visual surface patterns. Example: `lw-panel`.

## No Dead Active Controls

Visible or active controls must be wired, documented as planned/experimental, or removed. Do not create interactive-looking controls that do nothing.
