# 10 — Implementation Roadmap

## Status

Future roadmap concept only.

This roadmap should not be treated as active implementation authorization.

## Current Dependency Context

The Visual Grammar Engine should come after the current governance/source-adapter groundwork matures.

Recommended preceding milestones:

```txt
v70 QA Bundle Validator
v71 Contract-to-Code Trace Matrix
v72 Registry Explorer / Searchable System Index
v74 Source Adapter OS Reconnect Contract
v75 Synthetic Data Fixtures v0
```

## Visual Grammar Roadmap

```txt
vGrammar-1: Visual Grammar Engine Contract
Docs-only. Define grammar files, handles, routes, safety, forbidden behavior.

vGrammar-2: Handle Reference Registry / README
Read-only list of grammar handles users can reference.

vGrammar-3: Terminal Validator
lumaweave grammar validate file.lwgrammar.yaml.
No runtime application.

vGrammar-4: Grammar Lens Contract
Docs-only click-to-YAML-slice inspector behavior.

vGrammar-5: Read-only Grammar Lens
Click element → show resolved handle and YAML slice. No editing.

vGrammar-6: Preview-only Grammar Lens
Edit YAML → validate → preview override. No persistence.

vGrammar-7: Saved Workspace Overrides
Save validated changes locally.

vGrammar-8: Asset Bank Integration
Saved grammar presets appear in Asset Bank.

vGrammar-9: Runtime Graph/Sigma Dialect Application
Only after explicit graph runtime styling contract.

vGrammar-10: Screensaver / Live Desktop / Ambient Mode
Only after sandboxing, permission, performance, and safety contracts.
```

## Signal Loom Roadmap

```txt
vSignal-1: Signal Loom Contract
Docs-only. Define routing shape and forbidden behavior.

vSignal-2: Handle Reference README / Registry
Read-only signal, visual, target, and safety handles.

vSignal-3: Preset File Validator CLI
Validate .lwgrammar/.lwsignal YAML.

vSignal-4: Fixture Preview
Apply protocol to synthetic fixture data only.

vSignal-5: Passive UI Preview
Show resolved routes and safety classifications.

vSignal-6: Runtime Visual Preview
DOM-only, reduced-motion safe.

vSignal-7: Graph/Sigma Integration
Only after explicit graph runtime contract.

vSignal-8: Live Desktop / Screensaver Mode
Only after sandboxing, permission, performance, and safety contracts.
```

## Asset Bank Roadmap

```txt
vAsset-1: Accepted Asset Type Contract
Defines asset categories, file types, forbidden content, validation requirements.

vAsset-2: Passive Asset Type Registry
Static registry of allowed asset types displayed read-only.

vAsset-3: Asset Bank Contract
Defines lifecycle, metadata schema, quarantine, provenance, allowed targets.

vAsset-4: Local Asset Bank v0
Read-only seeded assets only. No imports yet.

vAsset-5: Safe Import Preview
User can import candidate assets into quarantine/preview only.

vAsset-6: Theme/Inspector Link
Selected element shows compatible accepted assets.
```

## v69 Retry Scar Integration

Future collapsible/evidence UI should use slices:

```txt
v69a: overview grid / summary cards only; no collapsing legacy accepted evidence.
v69b: section metadata registry + test helper contract.
v69c: collapse one legacy section at a time after tests are migrated and validated.
v69d: repeat section-by-section, stopping after first cascade.
```

## Do Not Repeat

- Do not collapse all legacy evidence sections in one pass.
- Do not mass-edit large Playwright specs.
- Do not patch many test failures one by one.
- Do not leave active QA key pointing at paused work.
- Do not treat a beautiful UI change as accepted without evidence.

## Reward/Milestone Note

The Visual Grammar Engine is a future pillar, not a quick feature.

It should be implemented only when the validation, registry, source adapter, and fixture foundations are strong enough to protect it.
