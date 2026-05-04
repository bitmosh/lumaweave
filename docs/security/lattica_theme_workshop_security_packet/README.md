# Lattica Theme Workshop Security Packet

This packet contains planned security contracts for the future Lattica theme workshop, theme pack, catalog, sample-card preview, and verified install systems.

These documents are intentionally docs-only. They do not implement upload, install, scanning, signing, sandboxing, or workshop behavior.

## Files

- `LATTICA_THEME_WORKSHOP_SECURITY_PROTOCOL.md`
- `LATTICA_THEME_BUNDLE_FORMAT_CONTRACT.md`
- `LATTICA_THEME_SUBMISSION_FILTER_PIPELINE.md`
- `LATTICA_THEME_PROVENANCE_AND_SIGNATURE_POLICY.md`
- `LATTICA_THEME_SANDBOX_AND_EXECUTION_BOUNDARY.md`
- `LATTICA_THEME_WORKSHOP_THREAT_MODEL.md`

## Recommended repo destination

```txt
docs/security/
```

## Core Doctrine

Only Lattica-generated, signed, schema-valid, provenance-attested theme bundles may enter the trusted installation path.

All uploaded workshop content is untrusted until it survives the full filter pipeline.
