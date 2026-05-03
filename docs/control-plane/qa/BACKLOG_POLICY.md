# QA Backlog Policy

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

## Inspector Overlay Hardening Milestones

The "Inspector overlay hardening" backlog item tracks the following sequence:

1. Mission Control UI Inspector toggle — **completed (v24)**
2. UI Part / Component Role Registration Model — **completed (v24a/v24b)**
3. Ghost overlay registered-surface layer — **completed (v25)**
4. Registered/unregistered heuristic planning — **completed (v26)**
5. Runtime probe instrumentation — **accepted (v27a)**
6. Visible conservative warning badges — **current pass (v27b)**
7. Lock/pin selected target behavior — **future candidate**

Each milestone must produce Playwright/QA Debug evidence before advancing to the next stage.
