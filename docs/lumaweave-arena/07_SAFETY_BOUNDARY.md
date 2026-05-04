# Safety Boundary

## Core Rule

LumaWeave Arena must be synthetic, sandboxed, local-first, defensive/evaluative, and evidence-scored.

## Allowed

- toy/synthetic services
- CTF-style fake vulnerabilities
- simulated permissions
- simulated outcomes
- defensive reasoning
- incident response practice
- evidence/replay/scoring
- synthetic flags
- local fixture analysis
- abstract sandbox actions

## Forbidden

- real target exploitation
- scanning public IPs or real third-party systems
- malware generation or execution
- credential theft
- persistence techniques
- evasion techniques
- exfiltration
- unauthorized access
- arbitrary shell execution
- real secrets or credentials
- unsafe payloads

## Structural Enforcement

A future Arena system should enforce:

```txt
No real network targets.
No arbitrary shell commands.
No exploit payload execution.
No external IP scanning.
No secrets except synthetic flags.
No import of real credentials.
Sandbox-only action API.
```

## Safe Agent Output

Agents should operate through abstract arena actions and defensive reports.

They should not output operational exploit instructions, real-world attack steps, or commands against real targets.

## Evidence And Auditability

Every arena event should be replayable and auditable.

The system should retain:

- actor
- action type
- allowed/blocked status
- rule basis
- evidence links
- score impact
- safety classification
