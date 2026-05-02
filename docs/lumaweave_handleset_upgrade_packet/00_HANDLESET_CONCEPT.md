# Handleset Concept

## What Is a Handleset?

A handleset is a structured library of all configurable LumaWeave values and their runtime wiring.

It includes:

- visual tokens
- settings controls
- physics parameters
- renderer settings
- theme customization fields
- menu settings
- backend/frontend wiring
- QA/test coverage
- active/planned/partial status

## Industry Terms

The closest industry terms are:

```txt
design token system
settings registry
configuration schema
theme token registry
control registry
source-of-truth config catalog
```

For LumaWeave, "Handleset Registry" is useful because it covers more than design tokens.

## Why It Matters

The handleset prevents:

- active controls that do nothing
- duplicated hardcoded colors
- settings paths with no runtime target
- renderer values disconnected from UI controls
- planned controls accidentally appearing active
- QA gaps around configurable values

## Core Principle

```txt
No configurable thing should be mysterious.
```

For every handle, we should know where it is defined, what its default is, where the UI control is, whether it is active/planned/partial, what runtime behavior it affects, and how it is validated.
