# Blast Radius & Post-Patch Validation Loop

## Status

Operating policy / validation protocol.

## Purpose

LumaWeave can safely take larger implementation bites only when each pass clearly defines its blast radius, proves the expected behavior, and verifies that adjacent systems were not accidentally changed.

This protocol prevents “just fix it” brute-force loops by requiring every meaningful patch to declare:

- what it intended to touch
- what it must not touch
- what systems are expected to change
- what systems are expected to remain unchanged
- what validation proves the patch worked
- what validation proves the blast radius stayed contained

A patch is not complete until its blast radius is named and its expected unaffected systems are still verified.

---

## Core Loop

Every non-trivial pass should follow this loop:

```txt
Pre-snapshot
→ classify risk
→ patch smallest proven boundary
→ run validation
→ compare deltas
→ update QA/checklist if needed
→ report residual risk
→ accept/reject
```

Expanded:

1. Capture the baseline before editing.
2. Name the intended change zone.
3. Name forbidden zones.
4. Assign a risk tier.
5. Patch only within the approved zone.
6. Run validation appropriate to the risk tier.
7. Compare pre/post deltas.
8. Report any scope expansion.
9. Stop if a forbidden zone was touched unexpectedly.
10. Record concise evidence.

---

## Risk Tiers

### Tier 0 — Docs Only

**Risk:** Low

Examples:

- backlog docs
- architecture notes
- session logs
- README/index updates

Validation:

```bash
git status --short
git diff --stat
```

Run typecheck only if docs reference generated code, typed docs, or code-adjacent imports.

Stop if runtime code changes appear.

---

### Tier 1 — Registry / Metadata Only

**Risk:** Low-medium

Examples:

- QA registry additions
- advisory registry additions
- contract metadata
- token path maps
- handle/setting metadata

Validation:

```bash
npm run typecheck
grep -R "test.skip" -n tests/e2e || true
```

Run Playwright when registry changes affect rendered Mission Control, Debug, QA, or UI contracts.

Stop if runtime behavior changes without approval.

---

### Tier 2 — UI / Debug Surface

**Risk:** Medium

Examples:

- Mission Control Debug diagnostics
- read-only summaries
- inspector overlays
- QA panel display changes
- stable `data-testid` instrumentation

Validation:

```bash
npm run typecheck
npm run qa:e2e
grep -R "test.skip" -n tests/e2e || true
```

Also verify:

- no new active controls unless explicitly intended
- no dead controls
- no layout breakage
- UI evidence is observable through Playwright

---

### Tier 3 — State / Persistence

**Risk:** Medium-high

Examples:

- localStorage keys
- persisted settings
- QA report reset behavior
- durable proposal decisions
- backlog order persistence

Validation:

```bash
npm run typecheck
npm run qa:e2e
grep -R "test.skip" -n tests/e2e || true
```

Required checks:

- durable state persists
- per-pass/per-report state resets
- stale state cannot override active canonical keys
- no unrelated durable state is wiped

Stop if persistence behavior is ambiguous.

---

### Tier 4 — Runtime Behavior

**Risk:** High

Examples:

- theme switching behavior
- label behavior
- graph setting behavior
- active control runtime wiring
- UI interaction behavior

Validation:

```bash
npm run typecheck
npm run qa:e2e
grep -R "test.skip" -n tests/e2e || true
```

Also verify:

- no console errors
- no visual fallback state
- no hover-required restoration
- no accidental reset of selected/current state

Manual QA may be required.

---

### Tier 5 — Graph Renderer / Layout / Sigma

**Risk:** Very high

Examples:

- `SigmaGraphView`
- Graphology graph construction
- graph visual policy application order
- camera/layout behavior
- renderer lifecycle
- graph container sizing

Validation:

```bash
npm run typecheck
npm run qa:e2e
grep -R "test.skip" -n tests/e2e || true
```

Required checks:

- app opens
- graph renders
- graph canvas remains visible
- no zero-width container crash
- theme colors remain stable
- label policy remains stable
- selected/hover state remains stable
- no console errors

Manual visual verification is recommended.

Stop if the change causes blank UI, graph disappearance, or renderer lifecycle instability.

---

### Tier 6 — Broad Architecture Refactor

**Risk:** Critical

Examples:

- rewriting settings architecture
- replacing theme runtime model
- restructuring QA system broadly
- changing graph renderer architecture
- large cross-domain refactors

Default action:

```txt
Do not proceed as one pass.
Split into smaller phase packets.
```

Validation must be designed before implementation.

---

## Pre-Patch Snapshot Requirements

Before editing, record:

```txt
branch:
git status:
current qaKey:
target qaKey:
typecheck:
playwright passed:
playwright failed:
playwright skipped:
test.skip matches:
```

For control/contract work, also record:

```txt
active controls:
with handleId:
with settingsKey:
settingsKey null/no-storage:
missing handleId:
missing settingsKey:
missing docs:
missing Playwright:
missing runtime binding:
```

For theme/token work, also record:

```txt
theme presets:
token groups found:
current token consumers:
duplicate/overlapping token names:
planned/future token gaps:
```

For graph/runtime work, also record:

```txt
graph renders:
console errors:
theme switching works:
label mode stable:
selected state stable:
camera/viewport stable:
```

---

## Intended vs Actual Change Zones

Every pass should declare its intended change zone before editing.

Example:

```txt
Intended change zone:
- src/themes/themeTokenPaths.ts
- docs/theme-system/THEME_TOKEN_PATH_MAP.md
- src/control-plane/qa/qa-registry.ts
- src/control-plane/qa/advisory-registry.ts
- tests/e2e/theme-selector.spec.ts

Forbidden zones:
- graph renderer
- Sigma/Graphology lifecycle
- settings store redesign
- glitter/particle systems
- arbitrary UI restyle
```

After patching, compare actual changed files against the planned zone.

If actual changed files exceed the planned zone, explain why.

If a forbidden zone was touched unexpectedly, stop and report.

---

## Forbidden-Zone Check

Each final report must explicitly answer:

```txt
graph renderer changed: yes/no
theme runtime behavior changed: yes/no
settings store behavior changed: yes/no
localStorage migration changed: yes/no
new active controls added: yes/no
glitter/particles changed: yes/no
broad restyle introduced: yes/no
```

If any answer is `yes`, validation must expand to cover that system.

---

## qaKey Transition Check

For every pass that changes QA identity, report:

```txt
previous accepted qaKey:
target qaKey:
active qaKey after patch:
header key:
dropdown key:
report key:
advisory set key:
history key:
```

Expected:

```txt
All active identity surfaces derive from the same canonical qaKey.
```

Identity drift is a hard blocker.

---

## Contract Delta Check

For control contract work, report before and after:

```txt
active controls:
with handleId:
with settingsKey:
settingsKey null/no-storage:
missing docs:
missing Playwright:
missing runtime binding:
high risk controls:
```

Warnings:

- active control count changes unexpectedly
- missing runtime binding count increases
- missing docs count increases
- missing Playwright count increases without explanation
- active controls disappear without rationale

---

## Test Health Check

Always run:

```bash
grep -R "test.skip" -n tests/e2e || true
```

Final reports must include:

```txt
Playwright passed:
Playwright failed:
Playwright skipped:
test.skip matches:
```

Rules:

- skipped tests are not passing tests
- obsolete tests should be deleted or replaced
- still-valid tests should be updated
- new `test.skip` requires explicit user approval
- acceptance target is zero skipped tests unless the user explicitly accepts debt

---

## Environment vs App Failure

If validation fails, classify before patching.

Environment prerequisite signals:

- browser executable missing
- dependency not installed
- command not found
- dev server unavailable
- port conflict
- permission/system package issue

Example:

```txt
browserType.launch: Executable doesn't exist
please run: npx playwright install
```

Classification:

```txt
Environment prerequisite failure
```

Safe local repair:

```bash
npx playwright install chromium
```

Ask before system-level repair:

```bash
sudo npx playwright install-deps chromium
```

Do not call the app unstable until prerequisites are repaired and validation is rerun.

---

## Post-Patch Validation Report Template

Use this for every non-trivial pass:

```md
# Blast Radius Report

## Intended Change Zone
- ...

## Actual Files Changed
- ...

## Systems Touched
- QA registry:
- Advisory registry:
- Contract registry:
- Settings:
- Theme runtime:
- Graph renderer:
- CSS:
- Tests:
- Docs:

## Expected Unchanged Systems
- ...

## Risk Tier
Tier X — reason

## Pre-Patch Baseline
- Branch:
- qaKey:
- Typecheck:
- Playwright passed:
- Playwright failed:
- Playwright skipped:
- test.skip matches:

## Post-Patch Validation
- Typecheck:
- Playwright passed:
- Playwright failed:
- Playwright skipped:
- test.skip matches:
- Manual QA:

## Delta
- active controls:
- missing Playwright coverage:
- missing docs:
- missing runtime binding:
- qaKey:
- new controls:
- deleted controls:

## Forbidden-Zone Check
- graph renderer changed:
- theme runtime behavior changed:
- settings store behavior changed:
- localStorage migration changed:
- new active controls added:
- glitter/particles changed:
- broad restyle introduced:

## Stop Conditions Triggered
- yes/no

## Remaining Risks
- ...
```

---

## Stop Conditions

Stop and report instead of continuing if:

- typecheck fails after a nontrivial change
- Playwright fails for app/test reasons
- Playwright failure is environmental and requires sudo/system package installs
- qaKey identity surfaces disagree
- implementation requires renderer/theme behavior changes outside scope
- active control count changes unexpectedly
- new skipped tests appear
- touched files exceed intended scope without explanation
- forbidden zones were modified unexpectedly
- durable state is at risk of being wiped
- manual QA contradicts automated results

---

## Prompt Block

Add this to future implementation prompts:

```md
# Blast Radius Requirement

Before patching:
- list intended files/systems
- list forbidden systems
- assign risk tier
- capture baseline validation

After patching:
- report actual files changed
- report whether forbidden systems changed
- run required validation
- compare pre/post deltas
- name remaining risks

If actual blast radius exceeds planned blast radius, stop and report before continuing.
```

---

## Operating Principle

```txt
Large passes are allowed only when the blast radius is explicit, bounded, and validated.
```
