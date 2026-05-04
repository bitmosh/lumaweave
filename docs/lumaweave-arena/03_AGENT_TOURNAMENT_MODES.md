# Agent Tournament Modes

## Team Formats

- 1v1
- 2v2
- 3v3
- swarm vs swarm
- one large model vs many small specialist agents
- red team vs blue team
- model vs benchmark judge
- agent team vs synthetic project hardening task

## Example Roles

### Red Team Simulation Roles

All red-team roles must remain abstract, synthetic, and sandbox-only.

- recon analyst
- path planner
- exploit-simulation agent
- stealth/noise manager
- objective coordinator

### Blue Team / Defensive Roles

- telemetry analyst
- containment planner
- patch recommender
- policy auditor
- incident commander

### Purple / Judge Roles

- scoring agent
- rule arbiter
- evidence verifier
- replay summarizer
- safety-policy monitor

## Safe Action Model

Actions should be abstract, sandboxed, and non-transferable to real targets.

Example allowed synthetic action:

```yaml
action: probe_service
target: node.web-03
method: synthetic_banner_check
scope: sandbox_fixture_only
```

Example defensive action:

```yaml
action: review_input_boundary
target: api.route.createUser
mode: defensive_analysis
```

Example remediation action:

```yaml
action: propose_test_case
target: auth.middleware
goal: verify unauthorized access is rejected
```

## Forbidden Action Categories

Do not allow arena actions that perform or instruct:

- live exploitation
- scanning public targets
- credential theft
- malware behavior
- persistence
- evasion
- exfiltration
- arbitrary shell commands
- real network attacks

## Tournament Outputs

- scorecard
- replay timeline
- evidence graph
- model/agent telemetry
- decision-map summary
- safety compliance report
- comparison dashboard
