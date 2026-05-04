# Defensive Project Hardening Arena

## Purpose

The Defensive Project Hardening Arena helps small teams inspect and improve a project’s security posture as the project evolves.

This mode should be defensive, local-first, evidence-backed, and non-exploitative.

## Project Graph Inputs

A future source adapter may produce nodes and edges for:

- files
- routes
- APIs
- authentication boundaries
- dependencies
- configuration
- data flows
- secrets policy
- tests
- docs
- ownership
- threat assumptions

## Safe Defensive Evaluations

Allowed defensive/evaluative tasks:

- threat-model review
- dependency risk review
- authentication/permission path analysis
- configuration hardening checklist
- input/output boundary review
- sensitive data flow mapping
- test coverage gap discovery
- safe remediation planning
- defensive test proposal generation
- synthetic risk-path simulation against local fixtures

## Output Style

The system should report:

```txt
possible weak point
files/entities involved
evidence source
confidence
safe suggested test
safe remediation task
change since last scan
risk trend
```

## Adaptive Security Cartography

Long-term direction:

```txt
project changes
→ graph updates
→ risk model updates
→ security arena changes
→ suggested tests/hardening tasks update
→ replay shows whether security improved
```

## Living Threat Map

The graph should highlight:

- new risky edge
- new dependency
- new route with missing validation
- new permission relationship
- new untested boundary
- new secret-adjacent config
- new external input path

## Boundary

This mode should never perform unauthorized testing against real targets.

It should produce defensive insights, safe test suggestions, and evidence maps, not exploit execution.
