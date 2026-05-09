---
id: policy.ingestion.safety.qa
title: Ingestion Safety and QA
type: policy
status: accepted
version: v73c
domain: source-adapter
cluster: lime
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
depends_on:
  - system.source.adapter.os
tags:
  - source-adapter
  - ingestion
  - safety
  - QA
  - policy
  - accepted
---

# Ingestion Safety and QA

---

## Safety Principles

All source adapters must follow these safety principles without exception:

### Local-First
```
No unapproved network transmission of source data
No storing source content beyond the current session unless explicitly contracted
User explicitly approves each source before ingestion begins
```

### Read-Only
```
Adapters read source data only — they never write to, modify, or execute source files
No project command auto-execution
No script execution from ingested source
```

### Scope Isolation
```
No parent-directory wandering (e.g. if user grants access to ~/project, do not read ~/project/..)
No access to secrets, credentials, or private keys
No access to .env files unless explicitly granted
Respect .gitignore and .lumaweave-ignore patterns
```

### Audit Trail
```
Every ingestion session produces a QA report
QA report includes: what was read, what was skipped, limits applied, warnings, confidence breakdown
QA report feeds Mission Control ingestion summary panel
```

---

## Confidence Class Rules

```
observed     → must have explicit source evidence (file path, URL, line range, selector)
               never produce observed edges without evidence

inferred     → must document the inference rule (e.g. "files changed together > 3 times in last 30 days")
               must be visually distinguishable from observed in the graph
               never promote inferred to observed without new direct evidence

ai-inferred  → must be clearly labeled in both graph metadata and UI
               must require explicit user opt-in to show in graph
               never mix with observed without a confidence label
               never display as fact — always as "model suggestion"
```

---

## Ingestion QA Report Format

```typescript
interface IngestionQAReport {
  adapterId: string;
  sourceDescription: string;
  startedAt: string;
  completedAt: string;
  
  counts: {
    nodesExtracted: number;
    edgesExtracted: number;
    observed: number;
    inferred: number;
    aiInferred: number;
  };
  
  limits: {
    applied: string[];    // e.g. ["50 page limit", "depth 1 only"]
    hit: string[];        // which limits were actually reached
  };
  
  skipped: Array<{
    item: string;         // what was skipped
    reason: string;       // why it was skipped
  }>;
  
  warnings: string[];     // general warnings
  errors: string[];       // non-fatal errors
  
  safety: {
    parentDirAccess: boolean;  // must be false
    secretsAccess: boolean;    // must be false
    networkRequests: number;   // count (0 for local adapters)
    externalDomains: string[]; // [] for local adapters
  };
}
```

---

## Validator Requirements (v74b)

The Source Adapter Base Validator must check:
```
□ Every adapter has a registered translation set
□ Every adapter produces a valid LumaSourceGraph schema
□ Every observed edge has at least one SourceEvidence entry
□ Confidence values are one of: observed | inferred | ai-inferred
□ Ingestion QA report is produced for every session
□ Safety flags (parentDirAccess, secretsAccess) are always false
□ Adapter does not access files outside the user-granted scope
```

---

## Forbidden Adapter Behaviors

```
Executing any code from the source (scripts, postinstall hooks, etc.)
Making network requests without user authorization
Writing to the source directory
Accessing credentials or secrets without explicit grant
Auto-ingesting without user trigger
Returning results from outside user-granted scope
Modifying graph data after ingestion without re-running the adapter
```
