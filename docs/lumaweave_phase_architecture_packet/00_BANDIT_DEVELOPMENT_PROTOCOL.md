# Bandit Development Protocol v0

## Core Loop

Use:

```txt
Observe → Classify → Patch → Validate → Report
```

## Classifications

```txt
FIX NOW        = low-risk, current-phase, directly stabilizes baseline
PLAN NEXT      = current-phase but needs a focused task
DOCUMENT ONLY  = later-phase or risky
BLOCKED        = requires missing info/tool/user decision
IGNORE FOR NOW = not relevant to current phase
```

## Non-Negotiable Rules

### Manual QA Overrides Code Inspection

If code looks correct but manual QA says behavior is broken, manual QA wins.

Bandit must add diagnostics, test hooks, or runtime proof. It must not claim completion based on inspection.

### No Dead Active Controls

Every visible active control must either work at runtime or be marked Planned/disabled/hidden.

### Broad Context, Narrow Permissions

Bandit may inspect broadly, but may only mutate the current permitted layer.

### Stop Before Risky Work

If a fix requires state-shape migration, renderer lifecycle changes, or major API mismatch, classify it as PLAN NEXT and stop.

## Critical Thinking Checklist

Before patching:

1. What is the root cause hypothesis?
2. What evidence supports it?
3. What would prove it wrong?
4. What is the smallest safe patch?
5. What validation proves it worked?

After validation:

1. Did the result match the hypothesis?
2. If not, revise the hypothesis.
3. Do not keep patching blindly.
