# Lattica Theme Bundle Format Contract

## Status

Planned contract for trusted Lattica-generated theme bundle files.

## Purpose

Define the only acceptable file format for installable Lattica theme packs.

A Lattica theme bundle must be a data-only artifact. It must not contain executable behavior.

## Accepted Bundle Extension

Suggested extension: `.lattica-theme`.

The internal container may be ZIP-like, but the application must not treat arbitrary ZIP files as valid theme packs.

## Required Bundle Contents

```txt
manifest.json
theme.tokens.json
theme.preview.json
assets/
  previews/
  thumbnails/
  animations/
provenance.json
checksums.sha256
signature.sig
```

## Manifest Requirements

`manifest.json` must include:

```json
{
  "format": "lattica-theme-bundle",
  "formatVersion": "1.0.0",
  "generator": "Lattica Theme Creator",
  "generatorVersion": "x.y.z",
  "themeId": "reverse.dns.or.uuid",
  "themeName": "Theme Name",
  "authorDisplayName": "Author",
  "createdAt": "ISO-8601",
  "bundleId": "uuid",
  "bundleVersion": "semver",
  "declaredFiles": [],
  "declaredCapabilities": [],
  "forbiddenCapabilities": ["script", "network", "command", "hotkey", "filesystem", "postinstall"]
}
```

## Allowed File Types

Initial strict allowlist:

```txt
.json
.png
.webp
.gif
.md
```

SVG is forbidden at first unless a dedicated sanitizer and render sandbox are implemented.

## Forbidden File Types

```txt
.js .mjs .cjs .ts .tsx .jsx .html .htm .css .scss
.sh .bash .zsh .ps1 .bat .cmd .exe .dll .so .dylib .node .wasm
.zip .tar .gz .7z
```

## Token File Requirements

`theme.tokens.json` must be pure data.

Allowed: color tokens, spacing tokens, typography tokens, border tokens, glow/intensity tokens, named theme metadata, canonical Lattica token paths, and approved extension tokens if explicitly supported.

Forbidden: functions, expressions, JavaScript strings intended for eval, URLs, imports, CSS text blocks, raw HTML, arbitrary selectors, command strings, and filesystem paths outside bundle scope.

## Preview File Requirements

`theme.preview.json` describes sample cards and screenshots only. It may reference assets inside `assets/previews/`, `assets/thumbnails/`, and `assets/animations/`. It may not reference remote URLs.

## Asset Requirements

Assets must be declared in manifest, hash-matched, size-limited, dimension-limited, decoded safely, stripped of dangerous metadata where possible, and loaded from bundle-local relative paths only.

## Bundle Integrity

Every declared file must have path, size, SHA-256 hash, MIME type, and purpose.

No undeclared files, duplicate paths, symlinks, hardlinks, absolute paths, `../` traversal, or nested archives are allowed.

## Capability Declaration

Themes may declare only data capabilities such as `theme.tokens`, `theme.preview-cards`, `theme.static-assets`, and `theme.motion-safety-metadata`.

Forbidden capabilities include script, network, command, hotkey, filesystem, postinstall, plugin, remoteAsset, externalCss, webAudio, camera, and microphone.

## Data-Only Rule

A theme can describe appearance. A theme cannot perform actions, install dependencies, define commands, or define scripts.

## Compatibility

The bundle must declare supported Lattica version range, supported token schema version, supported preview schema version, reduced-motion compatibility, and motion-safety classification.

## Acceptance Criteria

A bundle format is acceptable only when it is schema-valid, every file is declared, every file hash matches, every file type is allowlisted, forbidden capabilities are absent, provenance is present, signature is present, and no executable content exists.
