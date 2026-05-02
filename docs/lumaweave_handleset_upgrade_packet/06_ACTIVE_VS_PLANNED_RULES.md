# Active vs Planned Rules

## Core Rule

No dead active controls.

Every visible control must be one of:

```txt
active and wired
partial and documented
planned/disabled
hidden
```

## Active

A handle is active only if:

1. it appears in the UI
2. it updates state
3. it affects runtime behavior
4. it is validated by QA/test/manual check

## Partial

A handle is partial if it exists but runtime effect is incomplete, manual-only, or unverified.

## Planned

A handle is planned if it is a future feature and must not be presented as working.

## Deprecated

A handle is deprecated if it exists for compatibility but should not be used for new work.

## Internal

A handle is internal if it is not user-facing.

## Experimental

A handle is experimental if it is behind a debug/dev mode or may change without compatibility guarantees.
