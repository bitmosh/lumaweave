# QA Playwright Evidence Policy

## Purpose

v27a proved that QA acceptance paths collapse when evidence relies on manual DevTools JavaScript or ad-hoc console inspection. This policy codifies the durable requirement that Bandit-automation and manual QA both rely on observable app behavior, in-app QA Debug readouts, or automated Playwright assertions instead of console spelunking.

## Accepted QA Evidence Paths

1. **Playwright assertions** – Prefer e2e specs that execute the scenario, assert results, and run via `npm run qa:e2e`.
2. **In-app QA Debug readouts** – Mission Control Debug tab (or equivalent) must expose probe/run data without console work.
3. **Visible manual app behavior** – If something can be observed directly in the UI (hotkeys, toggles, overlays), it counts once it is documented and reproducible.
4. **Typecheck/build output** – `npm run typecheck`, lint, and build artifacts satisfy infra checks when they cover the behavior.
5. **Git diff / file inspection** – Structural verifications (e.g., "graph renderer unchanged") are satisfied by explicit file diffs tied to acceptance notes.

## Forbidden / Anti-Patterns

1. **Manual DevTools JavaScript** – Do not require engineers to paste commands into the console for acceptance.
2. **Manual inspection of JS arrays or objects** – `window.__lwLastThemeTargetProbeResult` debugging is for internal instrumentation, not QA sign-off.
3. **"Trust me, I read the code"** – Code inspection alone never satisfies an acceptance check.
4. **Manual `window.__lwRunThemeTargetProbe()` execution** – Runtime probes must be triggered automatically via Playwright or surfaced via QA Debug.
5. **Skipping tests** – Never mark a test `skip` to rush acceptance or mask coverage gaps.
6. **Changing tests to fit broken behavior** – Fix the product or probe; do not relax test assertions to match regressions.

## Durable v27a Lesson

Probe-output behavior (candidates[], unknown[], timestamps, exclusion proofs) must be validated by Playwright or surfaced in QA Debug snapshots. If a checklist asks the user to inspect probe arrays or counts, it must cite:

- A Playwright spec that already runs the probe and asserts the condition, **or**
- A QA Debug readout that renders the needed data without DevTools scripting.

## Checklist Remediation Procedure

When a checklist item points to DevTools steps:

1. Add or extend a Playwright spec that exercises the same workflow and records the evidence automatically.
2. Surface probe/debug data in Mission Control or QA Debug if the information should be visible to humans.
3. Update `qa-registry.ts` steps to reference the automated evidence (command + spec file/section) instead of console instructions.
4. Include the evidence path in QA reports and logs before marking the check PASS.

## Stale Guidance Handling

- **Search scope:** `docs/lumaweave_bandit_brain_packet`, `docs/mission-control`, `docs/control-plane/qa`.
- **If active docs demand DevTools JavaScript:** update the wording to point at the acceptable evidence paths above.
- **If historical docs mention the old flow:** mark the section deprecated and link to this policy.
- **Do not archive** files without explicit approval; report stale passages with:
  - `file/path`
  - `stale guidance`
  - `superseding guidance`
  - `recommended action (keep/update/deprecate/archive)`

## Enforcement Signals

- QA submissions must show `Acceptance Decision: ACCEPT`, `Blocked: 0`, and `Unverified: 0` before a pass can advance.
- Probe evidence cited in QA reports must reference Playwright specs or QA Debug snapshots.
- Governance / Bandit reviews should flag any new checklist entry that relies on DevTools.
