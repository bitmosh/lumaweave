# Security Policy

## Scope

LumaWeave is a local-first desktop application. It reads files from your local
filesystem and, optionally, makes inference requests to a locally configured
model endpoint using a user-supplied API key.

The following are in scope for security reports:
- Path traversal or filesystem boundary violations in Tauri backend commands
- Injection vulnerabilities in source adapter parsing
- API key leakage (the BYOK key stored in settings is stored in localStorage;
  treat it as a browser-local credential)

The following are out of scope:
- Denial-of-service against the local process
- Vulnerabilities in upstream dependencies not directly exploitable through
  LumaWeave's surface

## Reporting a vulnerability

Do not open a public GitHub Issue for security vulnerabilities.

Send a report to: **zenpai9914@gmail.com** (subject: "LumaWeave security report")

Include:
- Description of the issue and attack surface
- Steps to reproduce
- Suggested fix if you have one

You will receive an acknowledgment within 5 business days.
