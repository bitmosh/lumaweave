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
# Lattica Theme Submission Filter Pipeline

## Status

Planned security pipeline for accepting workshop submissions.

## Purpose

Define the full validation chain for theme submissions.

## Pipeline Overview

```txt
Upload received
→ quarantine storage
→ archive safety check
→ manifest parse
→ schema validation
→ file inventory validation
→ path traversal check
→ file type allowlist
→ MIME/content validation
→ hash verification
→ signature verification
→ provenance verification
→ static malware/security scan
→ semantic policy scan
→ sandbox preview render
→ reviewer queue
→ signed catalog release
```

## Stage 0 — Quarantine

Uploads must land in non-public quarantine storage.

Forbidden: direct public URL, direct install, direct preview in user app, execution, and extraction into production directories.

## Stage 1 — Archive Safety

Reject archive bombs, nested archives, symlinks, hardlinks, absolute paths, parent traversal, duplicate normalized paths, excessive file count, excessive uncompressed size, compression ratio above threshold, extraction timeout, or memory limit breach.

## Stage 2 — Manifest Validation

Reject if manifest is missing, invalid JSON, unsupported schema version, missing required fields, contains undeclared/forbidden capabilities, has file mismatch, includes remote URLs, includes commands/scripts/hooks, or references files outside allowed directories.

## Stage 3 — File Inventory Validation

Validate every actual file appears in manifest, every manifest file exists in archive, no undeclared file exists, no duplicate normalized path exists, no hidden executable is present, and no unexpected metadata file exists.

## Stage 4 — File Allowlist

Reject any file outside the allowlist. Reject files whose extension, MIME type, and magic bytes disagree. Reject polyglot files when detected.

## Stage 5 — Hash Verification

Compute SHA-256 for every file and compare against the manifest inventory, `checksums.sha256`, and provenance file inventory hash. Reject on mismatch.

## Stage 6 — Signature Verification

Verify bundle signature using the Lattica signing policy. Reject unsigned or invalidly signed bundles from the trusted install path.

## Stage 7 — Provenance Verification

Verify approved generator version, allowed schema, no post-generation mutation, creator identity or anonymous local provenance policy, export timestamp, file inventory hash, and bundle hash.

## Stage 8 — Static Security Scan

Scan for script tags, event handlers, `javascript:` URLs, remote imports, base64 executable payloads, suspicious command strings, embedded HTML, polyglot files, metadata abuse, known malware signatures, unsafe image chunks/metadata, suspicious compressed data, external references, and hidden files.

## Stage 9 — Semantic Theme Policy Scan

Validate canonical token names, value types/ranges, no remote URLs, no arbitrary CSS selectors, no CSS text injection, no raw HTML, no command strings, no extreme flashing/motion declarations, no high-risk animation declarations, and no hidden command/hotkey declarations.

## Stage 10 — Sandbox Preview Render

Render preview in an isolated sandbox with no network, no filesystem, no script execution, strict CSP, fixed viewport, reduced motion enabled, timeout limits, memory limits, no user credential access, and no local project access.

Reject if preview requires forbidden capability.

## Stage 11 — Human Review

Required before public catalog listing.

Review visual quality, safety labels, accessibility, motion risk, asset appropriateness, scan evidence, provenance evidence, suspicious metadata, author reputation/history, and policy compliance.

## Stage 12 — Catalog Release

Approved theme is repackaged into a signed immutable catalog artifact. Users download approved catalog artifacts, not raw submissions.

## Fail-Closed Behavior

If any scanner is unavailable, inconclusive, timed out, or returns unknown: quarantine or reject. Do not allow install.

## Audit Evidence

Every submitted bundle must produce submission ID, uploader ID, bundle hash, manifest hash, signature verification result, provenance verification result, file inventory, scan results, sandbox render result, reviewer decision, and final catalog artifact ID if approved.

## Rejection Reasons

Common rejection classes include invalid signature, missing provenance, file type violation, undeclared file, hash mismatch, path traversal, archive bomb risk, executable content, remote URL reference, unsafe preview asset, semantic token violation, malware scan hit, and reviewer rejection.

## Acceptance Criteria

A submission pipeline is acceptable only when all uploads are quarantined, every artifact is validated before install/public exposure, every file is allowlisted, every file hash is verified, signatures/provenance are required, sandbox render has no network/script/filesystem, public catalog requires signed release, and rejection/quarantine is fail-closed.
