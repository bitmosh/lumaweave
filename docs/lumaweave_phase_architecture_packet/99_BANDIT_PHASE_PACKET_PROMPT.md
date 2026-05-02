# Reusable Bandit Phase Packet Prompt

```txt
Bandit, read and follow the attached Phase Architecture Packet.

Before editing, restate:
1. current phase
2. current permitted layer
3. forbidden later-phase work
4. critical contracts
5. validation ladder
6. stop conditions

Use:
Observe → Classify → Patch → Validate → Report

You may inspect broadly, but only patch FIX NOW items in the current permitted layer.

Manual QA overrides code inspection.

No dead active controls.

Run:
npm run typecheck
npm run qa:e2e

If validation fails, follow the troubleshooting playbooks instead of patching blindly.

Final report must include:
1. summary
2. files inspected
3. files changed
4. issues fixed now
5. issues planned next
6. issues documented only
7. validation results
8. known limitations
9. recommended next task
```
