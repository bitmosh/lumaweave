# Lattica Theme Workshop Threat Model

## Status

Planned adversarial model for user-generated theme/workshop support.

## Purpose

Identify likely attack paths against Lattica theme packs, preview cards, user workshop submissions, catalog downloads, and future embedded terminal workflows.

## Assets To Protect

- user projects
- local filesystem
- source code
- private tokens/secrets
- theme catalog integrity
- user trust
- Lattica app integrity
- graph/workspace data
- installed theme settings
- update channel
- user identity/session
- workshop moderation integrity

## Attackers

- malicious theme author
- compromised legitimate author
- attacker modifying theme bundle after export
- attacker submitting fake Lattica-generated file
- attacker exploiting parser/decoder
- attacker abusing image/SVG metadata
- attacker poisoning update channel
- attacker creating dependency confusion
- attacker social-engineering users through theme previews
- compromised reviewer/admin account
- compromised catalog infrastructure

## Attack Surfaces

- file upload
- archive extraction
- manifest parsing
- JSON schema parsing
- image decoding
- GIF/WebP animation preview
- preview rendering
- local import
- public catalog submission
- download/install button
- embedded terminal
- update mechanism
- user workshop comments/metadata
- theme screenshots/GIFs
- remote repository pulls
- theme metadata search/indexing
- revocation/update checks

## Abuse Cases And Controls

### Fake Lattica Bundle

Attack: A user submits a hand-crafted file pretending to be Lattica-generated.

Controls: signature verification, provenance verification, schema validation, generator identity check, and never trusting the extension alone.

### Backdoored Theme

Attack: Theme includes hidden JS, shell, HTML, SVG script, WASM, or executable payload.

Controls: file allowlist, MIME/magic-byte validation, static scan, executable rejection, SVG forbidden initially, and sandbox preview.

### Path Traversal

Attack: Archive writes outside target install directory.

Controls: normalized path check, reject absolute paths, reject `../`, reject symlinks/hardlinks, staging install, and final write-target verification.

### Archive Bomb

Attack: Tiny upload expands massively or overwhelms scanner.

Controls: compressed/uncompressed size caps, file count caps, compression ratio caps, extraction timeout, memory limit, and quarantine environment.

### Remote Beacon

Attack: Theme references external image/font/CSS to track users.

Controls: forbid remote URLs, no network in preview, local-only asset references, CSP, and asset inventory validation.

### CSS Injection

Attack: Theme token includes raw CSS or selectors to hide UI, spoof UI, or exfiltrate data.

Controls: typed token schema, no raw CSS blocks, no arbitrary selectors, strict token path allowlist, value validators, and no remote URLs.

### Malicious Update

Attack: Approved theme later updates into malicious version.

Controls: immutable versions, scan every version, signed catalog releases, revocation, user-visible changelog, and no silent major updates.

### Command Injection

Attack: Theme metadata defines install command or terminal text.

Controls: app-owned install commands only, no theme-defined commands, no auto-execute, command allowlist, and explicit user confirmation.

### Poisoned Preview Media

Attack: Theme preview image/GIF exploits decoder, embeds tracking data, or causes motion safety hazard.

Controls: image decoding in sandbox, metadata stripping, dimension/size caps, no remote media, motion-safety review, and dangerous animation rejection.

### Compromised Contributor Account

Attack: Trusted author uploads malicious version.

Controls: scan every version, no reputation bypass, signed catalog release after review, anomaly detection, and revocation.

### Dependency / Update Channel Poisoning

Attack: Attacker abuses package update, theme source repo, or catalog feed.

Controls: catalog signing, provenance verification, immutable releases, client-side signature verification, revocation checks, and no arbitrary repo pull from metadata.

### Workshop Social Engineering

Attack: Theme description or preview tricks users into running commands or disabling protections.

Controls: no arbitrary markdown HTML, moderation, app-generated command snippets only, warnings for external claims, and no direct terminal injection.

## Risk Matrix

| Threat | Impact | Likelihood | Required Control |
| --- | --- | --- | --- |
| Fake bundle | High | High | signature + provenance |
| Backdoored asset | High | Medium | allowlist + scan + sandbox |
| Path traversal | High | Medium | normalized path validation |
| Archive bomb | Medium | Medium | extraction limits |
| Remote beacon | Medium | High | forbid remote URLs |
| CSS injection | High | Medium | typed token schema |
| Malicious update | High | Medium | immutable signed releases |
| Command injection | Critical | Medium | no theme-defined commands |
| Poisoned media | High | Low/Medium | sandbox decode + scan |
| Compromised account | High | Medium | no reputation bypass |

## Residual Risks

Residual risks must be documented before public release, including image decoder zero-days, signing key compromise, catalog infrastructure compromise, reviewer error, and unknown parser vulnerabilities.

## Required Monitoring

Monitor failed submissions, repeated rejection patterns, author anomaly, signature failures, revoked installs, catalog update failures, scanner timeouts, and sandbox crashes.

## Acceptance Criteria

The threat model is acceptable only when every identified threat has prevention controls, every high/critical threat has detection and response controls, no trusted path bypasses scanning/signature/provenance, revocation and quarantine exist, and workshop content cannot execute or install arbitrary code.
