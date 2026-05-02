# Future Prompt: TypeScript Handleset Registry v0

Use this later, not during the first audit.

```txt
Bandit task: TypeScript Handleset Registry v0

Goal:
Create a machine-readable handleset registry from the documentation audit.

Important:
Do not use it to render the SettingsPanel yet.
Do not alter runtime behavior.
This is a source-of-truth scaffold only.

Create:
src/control-plane/handles/handleset.types.ts
src/control-plane/handles/handleset.registry.ts
src/control-plane/handles/handleset.status.ts

Requirements:
1. Define HandleStatus.
2. Define HandlesetEntry.
3. Add entries for active handles only first.
4. Include source file references.
5. Include runtime binding descriptions.
6. Include QA/test references.
7. Export helper functions:
   - getHandlesByStatus
   - getHandlesByCategory
   - getActiveHandles
   - getPlannedHandles

Validation:
npm run typecheck
npm run qa:e2e

Do not render UI from this registry yet.
```
