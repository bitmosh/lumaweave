# Quest Mode Prompt Template

Use this template when assigning Bandit a longer LumaWeave arc.

```txt
QUEST MODE: [Single Bite / Linear Quest / Self-Splitting Quest / Survey Only]

Mission:
[Describe the broad goal.]

Current accepted chain:
[List relevant accepted passes and latest commit if known.]

Starting requirement:
Run before editing:

git status --short
git log --oneline -5

If the working tree is dirty, stop and report before editing.

Self-Splitting Permission:
You may split this mission into independently acceptable sub-passes when it crosses architecture boundaries.

Architecture boundaries include:
- docs/contract → runtime behavior
- runtime display → enabled control
- enabled control → storage
- storage → schema/migration
- single-scope behavior → multi-scope behavior
- local override → preset save/export
- DOM UI → graph/Sigma renderer
- passive display → write-back action
- QA identity → accepted evidence
- existing token use → token promotion
- existing hotkey behavior → new hotkey system
- one feature family → another feature family

Execution Rule:
Complete one sub-pass at a time.
Do not blend scopes.
Validate after each sub-pass.
Commit or stop at each checkpoint.
Continue only while risk remains low/moderate and validation is clean.

Global Forbidden Scope:
- no skipped tests
- no weakened tests
- no manual DevTools JavaScript acceptance path
- no dead active controls
- no graph/Sigma changes unless explicitly scoped
- no storage/schema changes unless explicitly contracted
- no planned token promotion unless explicitly scoped
- no new free-floating hotkeys before Command Deck / Hotkey Registry
- no package/dependency changes unless explicitly justified

Stop Conditions:
Stop and report if:
- the next step requires a new contract
- validation fails outside scoped files
- tests need weakening or skipping
- graph/Sigma renderer changes appear necessary
- storage/schema scope expands unexpectedly
- planned token promotion appears necessary
- active controls would be dead/unwired
- QA identity/advisory/backlog cannot be made current
- broad architecture rewrite is required

Required Validation After Each Runtime/QA/Test Sub-Pass:

npm run typecheck
npm run qa:e2e
grep -R "test.skip" -n tests/e2e || true
grep -R -E "Ctrl\+Alt\+T|ctrl\+alt\+t|Alt\+F8|alt\+f8" -n src tests docs || true
grep -R "Run window.__lwRunThemeTargetProbe() from devtools\|triggered from DevTools\|can be triggered from DevTools" -n src docs tests || true
git diff --name-only
git status --short

Hotkey report format:
Banned hotkey check:
- active runtime/source/tests/current QA: clean
- historical/policy references: allowed

Per-Sub-Pass Report Format:

[sub-pass id] Report
Acceptance Recommendation: ACCEPT / DO NOT ACCEPT
Commit/Hash if committed:
Files Changed:
Behavior:
QA Identity:
Validation:
Remaining Failures:
Safe to Continue: yes/no
Reason if stopped:

Commit Rule:
If the sub-pass is accepted and commits are allowed, commit it separately before starting the next sub-pass.
Suggested commit message:
[commit message]

Final Report:
Return a final summary with:
- completed sub-passes
- skipped/deferred sub-passes
- final git status
- final git log --oneline -5
- recommended next prompt
```

## Fill-In Example

```txt
QUEST MODE: Linear Quest

Mission:
Complete the v34 arc as far as safely possible:
v34a — Global-only theme override storage foundation
v34b — Enable one narrow generated Theme Mapping control path
v34c — Preset export/save capability

Execution Rule:
Do v34a first. Validate and commit. Only then begin v34b. Stop before v34c if preset schema/import/export scope becomes broad.
```
