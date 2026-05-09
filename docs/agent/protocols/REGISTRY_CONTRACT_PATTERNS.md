---
id: protocol.registry.contract.patterns
title: Registry and Contract Patterns
type: protocol
status: accepted
domain: agent
subdomain: protocols
cluster: purple
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
tags:
  - registry
  - contract
  - patterns
  - protocol
  - architecture
references:
  - index.source.of.truth
  - protocol.pass.transition
last_pass: vP-Forensics-2
---

# Registry and Contract Patterns

Canonical patterns for writing contracts and registries in LumaWeave. Consistent application of these patterns is what makes the validator infrastructure work.

---

## The Standard Ladder

Every new system follows this sequence. No skipping steps.

```
1. contract (docs-only)
   → defines: allowed behavior, forbidden behavior, schema, evidence required

2. registry (TypeScript, read-only)
   → implements: the schema from the contract as static typed data
   → must not: mutate anything, perform I/O, trigger side effects

3. validator script (reads registry, validates against contract rules)
   → must: run as a standalone .mjs script
   → must: exit 0 on pass, exit 1 on failure
   → must: be registered in QA bundle

4. passive UI surface (read-only display of registry data)
   → must: have data-testid attributes on all meaningful elements
   → must not: allow editing without a runtime contract

5. Playwright evidence (proves the UI surface renders correctly)
   → must: cover all data-testid elements in the surface
   → must not: skip any assertion

6. runtime promotion (only after all above are clean)
   → requires: explicit new contract
   → never: "promoted" informally
```

---

## Contract Document Structure

Every contract document must include:

```markdown
## Purpose
What this contract governs.

## Allowed Behavior
What implementations may do.

## Forbidden Behavior
What implementations must never do.

## Schema
TypeScript interface or YAML shape of the governed data.

## Evidence Required
What Playwright tests or validator outputs prove compliance.

## Forbidden Boundaries
List of forbidden boundary crossings specific to this system.

## Acceptance Criteria
Exact conditions that make this contract "accepted".
```

---

## Registry TypeScript Pattern

```typescript
// Every registry entry is a plain object — no classes, no side effects
export interface SystemEntry {
  id: string;           // stable dot-path ID: "system.index.registry"
  title: string;
  status: LifecycleStatus;
  // ... other contract-defined fields
}

// The registry is a const array — read-only, no runtime mutation
export const SYSTEM_REGISTRY: readonly SystemEntry[] = [
  {
    id: "system.index.registry",
    title: "System Index Registry",
    status: "accepted",
    // ...
  },
] as const;

// Helper functions are pure — no side effects
export function getEntryById(id: string): SystemEntry | undefined {
  return SYSTEM_REGISTRY.find(e => e.id === id);
}
```

---

## Validator Script Pattern

```javascript
// validate-[system-name].mjs
import { SYSTEM_REGISTRY } from '../src/[path]/registry.js';

const errors = [];

for (const entry of SYSTEM_REGISTRY) {
  // Use case-insensitive matching for string fields
  if (!entry.title?.trim()) {
    errors.push(`[${entry.id}] missing title`);
  }

  // Use substring matching for descriptive fields
  const desc = (entry.description ?? '').toLowerCase();
  if (!desc.includes('expected phrase')) {
    errors.push(`[${entry.id}] description missing expected content`);
  }
}

if (errors.length > 0) {
  console.error('Validation failed:');
  errors.forEach(e => console.error(' ', e));
  process.exit(1);
}

console.log('✅ All checks passed');
process.exit(0);
```

Key validator rules:
- Use `.toLowerCase()` for string comparisons unless schema requires case-sensitivity
- Use `.includes()` for prose/description fields, exact match for IDs and enum values
- Report all errors before exiting, not just the first one
- Exit codes: 0 = pass, 1 = fail

---

## data-testid Naming Convention

```
data-testid="[system]-[component]-[role]"

Examples:
  data-testid="system-index-panel-shell"
  data-testid="system-index-entry-{id}"
  data-testid="mode-registry-validator-output"
  data-testid="qa-bundle-validator-status"
```

Rules:
- All lowercase, hyphen-separated
- Include the system name as the first segment
- Stable across refactors — do not make them dynamic unless necessary
- Every meaningful UI element in a passive surface must have one

---

## Common Anti-Patterns to Avoid

```
❌ Implementing before the contract is accepted
❌ Adding a registry field not in the contract schema
❌ Using exact string match where case-insensitive is safer
❌ Validator that silently passes on missing data
❌ Passive UI surface without data-testid attributes
❌ Promoting to runtime without a runtime contract
❌ Skipping Playwright evidence after adding a UI surface
```
