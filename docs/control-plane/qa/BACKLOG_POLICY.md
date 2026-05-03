# QA Backlog Policy

## v31 Note
As of v31, visual handles in 09_VISUAL_HANDLE_LIBRARY.md cite canonical token paths from THEME_TOKEN_PATH_MAP.md. This prevents drift between visual handles, Theme Target Registry token bindings, and canonical tokens before generated Theme Mapping controls are implemented. This is a docs/contract/QA pass with no runtime changes.

## v32 Note
As of v32, the Theme Mapping Panel generates read-only/disabled control rows for registered pinned targets, displaying canonical token paths and visual handle relationships. This makes the panel feel like it is showing the future editing surface, but nothing is editable yet. Storage and editing remain locked until v33–v34.

## v33 Note
As of v33, the Theme Override / Storage Contract defines semantics for future theme override storage implementation. v33 is contract-only with no storage implementation. v34 may implement storage only after this contract is accepted.

## v34a Note
As of v34a, global-only theme override storage foundation has been implemented. Storage validates canonical token paths, rejects planned/noncanonical strings, supports reset/remove behavior, and persists via localStorage. Theme Mapping Panel controls remain disabled; v34b will enable editing UI.

## v34b Note
As of v34b, one narrow theme mapping edit control has been enabled for panel.background on mission-control.panel. The control is wired to v34a global override storage, supports reset/remove, and persists via localStorage. All other controls remain disabled.

## Backlog Auto-Management Rule

A backlog item can be promoted during the pass that implements it, but after acceptance it must be marked completed, removed from active candidates, or converted into explicit follow-up subtasks.

## Additional Guidelines

- Do not let the active backlog become a list of completed work. Only show items that still require action.
- Do not invent filler entries just to maintain a "Top 10" list. If only a few active items remain, present them as "Top Backlog" or "Top active items".
- Avoid churning the backlog every pass. Persist durable items until they are completed, rejected, or deliberately reordered.
- Add new backlog items only when they are newly discovered, actionable, not already represented, and annotated with risk/dependency context.
- If a new task is a subtask of an existing backlog item, nest it under that parent instead of promoting it to a top-level item.
- Governance follow-ups (e.g., publishing the token path governance report) should be tracked as polish subtasks under the relevant parent instead of reusing completed top-level entries.
- Manual QA findings (like v24a's "UI Inspector reports parent surfaces") must be captured as child subtasks under the affected backlog item, with clear sequencing before downstream work (e.g., ghost overlay) begins.
- When introducing precision layers (e.g., v24b UI Part / Component Role Model), record the decision matrix in docs first, then add a backlog child task that explicitly blocks downstream items such as ghost overlays, registered/unregistered warnings, and lock/pin work until the model is accepted.
- Ghost overlay, warning heuristics, and Theme Mapping Panel tasks must cite the registration model they consume; if the model changes (new componentRoleId, handleId, etc.), update both docs and backlog context in the same pass.
- Registered/unregistered warning passes (v26+) must deliver a conservative heuristic + evidence plan before any runtime warnings are allowed. The backlog item stays under "Inspector overlay hardening" until documentation, QA checklist, and test plan entries all exist.
- After v26 planning, ship the **v27a runtime probe** (data collection only) before any badges: `window.__lwRunThemeTargetProbe` must exist, QA Debug must show probe evidence, Playwright must verify exclusions, and runtime behavior must stay badge-free. Only once v27a evidence is accepted can v27b (visible badges) proceed.
- Theme Mapping Panel v0 cannot begin until (a) token governance is accepted, (b) the inspector stack through v27b + viewport clamping remains green, (c) the v28 Theme Mapping Panel Entry Contract is accepted, (d) lock/pin selected target behavior is ready, and (e) storage/preset work is explicitly scheduled as a separate dependency.

## Inspector Overlay Hardening Milestones

The "Inspector overlay hardening" backlog item tracks the following sequence:

1. Mission Control UI Inspector toggle — **completed (v24)**
2. UI Part / Component Role Registration Model — **completed (v24a/v24b)**
3. Ghost overlay registered-surface layer — **completed (v25)**
4. Registered/unregistered heuristic planning — **completed (v26)**
5. Runtime probe instrumentation — **accepted (v27a)**
6. Visible conservative warning badges — **completed (v27b)**
7. Warning badge viewport-safe placement — **completed (v27b follow-up)**
8. Lock/pin selected target behavior — **current pass (v29)**

Each milestone must produce Playwright/QA Debug evidence before advancing to the next stage.

## Theme Mapping Panel v0 Dependencies

1. Token governance accepted (v22) — canonical ThemeTokenPath vocabulary locked.
2. Inspector overlay stack accepted through v27b follow-up — toggle, metadata panel, ghost overlay, runtime probe, badges, viewport clamping, hotkey discipline.
3. Theme Mapping Panel Entry Contract accepted (v28 planning) — documents registered/candidate/unknown/component-role/text-role/graph paths, storage block, QA requirements.
4. Lock/pin selected target behavior — remains part of inspector overlay hardening and must precede editable controls.
5. Theme override storage & presets — separate backlog item that ships after entry contract + lock/pin.

Theme Mapping Panel runtime work must cite this dependency list in QA/advisory entries before implementation begins.

## Dependency Scaffolding Rule (v28+)

Prioritize upcoming systems by **input contracts**, not feature excitement. Follow this scaffolding sequence:

1. **v29 — Lock/pin selected UI target behavior** (stabilize inspector targeting).
2. **v30 — Theme Mapping Panel v0 shell (read-only)**.
3. **v31 — Visual handles cite token paths** (docs/evidence linking handles to canonical vocabulary).
4. **v32 — Generated read-only Theme Mapping controls** (no storage yet).
5. **v33 — Theme override/storage contract** (data model + QA plan).
6. **v34 — Theme override storage + save preset** (runtime persistence once contract is proven).
7. **Command Deck / Hotkey Registry planning packet** (docs-only governance before new hotkeys/panels) — **completed (v35 planning, v36 runtime)**.
8. **Perspective System model** (defines how multiple inspector views coexist) — **completed (v37 contract)**.
9. **Perspective System v0** (read-only perspective registry and panel) — **completed (v38)**.
10. **Graph physics Playwright coverage** (stabilize physics sliders/toggles before more graph controls) — **completed (v39)**.
11. **Graph View Element Registry / Graph Visual Policy refresh** — **completed (v40)**.
12. **Graph View Element Registry v0** — **completed (v41)**.
13. **Graph Visual Inventory** — **completed (v42)**.
14. **Graph Registry Alignment / Contract Sync** — **completed (v43)**.
15. **Graph Evidence Hardening** — **completed (v44)**.
16. **Graph Runtime Boundary Contract** — **completed (v45)**.
17. **First Passive Graph Runtime Probe** — **completed (v46)**.
18. **First Promoted Graph Runtime Mutation Contract** — **completed (v47)**.
19. **First Safe Graph Runtime Mutation** — **current pass (v48)**.
20. **Graph visual/theme mapping** (after runtime boundary contract, passive probe, and first safe mutation).

Guardrails:
- Do **not** implement storage before override semantics exist (v33).
- Do **not** implement editable controls before read-only generation is proven (v30–v32).
- Do **not** implement graph visual mapping before the Graph View registry/policy is refreshed (steps 9–11).
- Do **not** add more hotkeys before Command Deck / Hotkey Registry policy exists (step 7).
- Do **not** start Theme Mapping runtime controls before lock/pin stability exists (step 1).
