---
id: security.lattica.theme.workshop.PLACEHOLDER
title: Lattica Theme Workshop Security
type: contract
status: accepted
version: v73c
domain: security
cluster: green
agent_readable: true
include_in_self_graph: true
last_updated: v73c
tags: [security, lattica, theme, workshop, contract, accepted]
---
# Lattica Theme Provenance and Signature Policy

## Status

Planned supply-chain security policy for theme artifacts.

## Purpose

Ensure submitted theme bundles are authentic, untampered, and traceable to the Lattica Theme Creator or approved catalog release process.

## Required Checks

A trusted installable theme must have manifest hash, per-file hashes, bundle hash, valid signature, provenance statement, generator identity, schema version, build/export timestamp, immutable version, and revocation status.

## Signature Model

Suggested models:

1. Lattica-managed signing key
2. per-user signing identity
3. Sigstore/Cosign-style keyless signing
4. catalog-level signing after review

For public workshop, the strongest initial model is:

```txt
user-exported bundle
→ submit
→ quarantine scan
→ review
→ catalog repack
→ Lattica signs approved release
```

## Provenance Requirements

`provenance.json` should include generator name, generator version, schema version, export action, source theme project ID, bundle ID, file inventory hash, timestamp, environment metadata, user/workshop identity if applicable, signing identity if applicable, export mode, and approved capability list.

## Tamper Rule

If the bundle contents differ from provenance or manifest: reject.

## Signature Verification

Verify signature exists, signature is made by trusted identity/key, signed payload matches bundle hash, manifest hash matches signed payload, signature is not expired or revoked, and signing identity is allowed for the trust tier.

## Catalog Signing

Approved public themes should be repackaged and signed by Lattica.

This separates author identity, upload identity, review identity, and catalog release identity.

Users install catalog-signed releases, not raw uploads.

## Key Management

Signing keys must be stored securely, rotated on schedule, revoked if compromised, separated by environment, unavailable to theme content, and audited.

## Provenance Verification Result

A verifier should output:

```json
{
  "bundleId": "...",
  "bundleHash": "...",
  "signatureValid": true,
  "provenanceValid": true,
  "generatorTrusted": true,
  "schemaSupported": true,
  "revoked": false,
  "trustTier": "catalog-approved"
}
```

## Revocation

A theme version may be revoked if malicious content is discovered, a signature is compromised, provenance is invalid, a policy violation is discovered, a vulnerable asset is discovered, an uploader account is compromised, or a catalog signing key is compromised.

Clients must be able to check revocation status, warn users, disable update, optionally quarantine installed theme, and show reason/recommended action.

## Immutable Version Rule

Approved versions are immutable. A new upload must become a new version. No public theme version may be silently replaced.

## Update Channel Rule

Updates must be signed, provenance-verified, scanned independently, changelogged, revocation-checked, and user-visible before install unless policy allows safe patch auto-update.

## Acceptance Criteria

The provenance/signature policy is acceptable only when bundle identity, generator identity, and catalog release identity are verifiable; tampering is detected; revocation exists; and raw uploads cannot masquerade as approved catalog artifacts.
