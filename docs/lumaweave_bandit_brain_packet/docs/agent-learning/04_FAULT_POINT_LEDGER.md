# Fault Point Ledger

## Purpose

This ledger converts repeated failures into reusable operating rules.

Every entry should describe the symptom, actual cause, strategic mistake, preventive rule, and future trigger.

---

## Fault Point: Deleted Theme Target Inspector Overlay

### Phase

v20 / Recovery Pass A2

### Symptom

Playwright failures appeared across QA panel, Debug tab, advisory content, `data-lw-theme-target` markers, and inspector overlay tests.

### Actual Cause

`src/themes/ThemeTargetInspectorOverlay.tsx` had been deleted while `src/app/AppShell.tsx` still imported it.

Vite failed module resolution before React hydration.

### Strategic Mistake

A runtime witness file was treated as disposable implementation during recovery.

### Why This Was Misleading

Because the app never hydrated, many unrelated selectors appeared missing. The QA/advisory contracts were not the root cause; they were unreachable.

### Contract Lesson

A small file can be contract-critical if it provides one or more of:

- app hydration dependency
- Playwright witness
- DOM marker interpreter
- Mission Control evidence surface
- debug/QA observability

### Preventive Rule

Before deleting, reverting, renaming, or replacing any file, classify whether it is:

1. runtime implementation
2. contract registry
3. QA/advisory contract
4. Playwright evidence surface
5. DOM/test witness
6. future scaffold
7. obsolete/dead code

If it is categories 2–5, do not delete or rename it during recovery unless the task explicitly authorizes a contract migration and updates all dependent tests/docs/UI surfaces.

### Future Trigger

If many unrelated Playwright selectors disappear at once, check for Vite/app hydration/module-resolution failure before editing registries or tests.

---

## Fault Point: Hotkey Collided With Ubuntu Terminal Shortcut

### Phase

v20 → v20a Inspector Activation

### Symptom

Manual QA could not reliably open the inspector overlay.

### Actual Cause

Overlay hotkey used `Ctrl+Alt+T`, which conflicts with Ubuntu’s terminal shortcut.

### Strategic Mistake

A hotkey that passed automated tests was treated as acceptable even though it failed the user’s real operating environment.

### Contract Lesson

Manual QA environment constraints can override automated evidence.

### Preventive Rule

Do not use native OS/browser shortcuts as feature hotkeys. For this project, `Ctrl+Alt+T` is banned entirely.

### Future Trigger

If adding a hotkey, check likely OS/browser conflicts and document the chosen shortcut.

### Resolution

Inspector overlay uses `Alt+Shift+I` as the official activation hotkey. Keep it documented anywhere the overlay contract is described and remove legacy references to `Ctrl+Alt+T`.
