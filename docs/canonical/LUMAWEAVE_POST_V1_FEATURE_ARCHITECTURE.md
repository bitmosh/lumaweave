---
id: domain.inference.post.v1.architecture
title: Inference, Agent Chat, and Future Tool Surfaces
cluster: indigo
references:
  - domain.deferred.post.v1.vision
  - system.lumaweave.current-status
  - system.lumaweave.roadmap
tags: [inference, chat, terminal, strudel, canonical]
status: canonical
include_in_self_graph: true
type: manual
agent_readable: true
last_updated: 2026-06-30
---

# LumaWeave — Inference, Agent Chat, and Future Tool Surfaces

The original design grouped remote inference, Agent Chat, terminal, and Strudel as post-v1 work. Code has since implemented the first remote-inference/chat slice. This document now distinguishes that implementation from remaining plans.

## Implemented slice

### Rust backend boundary

`src-tauri/src/inference/` defines:

- An `InferenceBackend` trait.
- A `RemoteClient` implementation for OpenAI-compatible chat-completion endpoints.
- Request/response/error types.
- Tauri commands for chat and connection testing.

The frontend does not make provider HTTP requests directly. Tauri owns network requests and configuration transfer.

### Frontend Agent Chat

`src/control-plane/agent/` provides:

- Agent Chat tile content.
- Message list and input components.
- A `useAgentChat` hook.
- Settings integration for endpoint/model/API-key-related configuration.
- Connection testing and non-streaming request flow.

This is an MVP surface. It is not an autonomous agent runtime, tool-calling framework, persistent conversation system, or embedded model.

## Current limitations

- Non-streaming request/response flow.
- No cancellation API.
- No persistent conversation store.
- No tool/function calling.
- No graph-context retrieval pipeline.
- No embedded Candle/local model implementation.
- Provider compatibility depends on the configured OpenAI-style endpoint.
- Secrets/configuration require further release-level review.

## Future inference work

Potential additions behind the existing boundary:

- Streaming events.
- Cancellation and request lifecycle UI.
- Model discovery and health/capability reporting.
- Explicit graph-context selection.
- Conversation persistence.
- A Cerebra backend or IPC bridge.
- An embedded model backend only after dependency, packaging, and performance review.

Backend-specific features should not break the stable frontend command/request boundary without a deliberate migration.

## Terminal tile

Planned, not implemented.

A terminal surface requires:

- A frontend terminal emulator.
- A portable PTY/process backend.
- Session lifecycle and cancellation.
- Working-directory and environment policy.
- Output limits.
- Explicit trust/security boundaries.

It should not be simulated by a text area or shell-command shortcut.

## Strudel surface

Planned, not implemented.

A first slice would be a frontend music-code surface with controlled playback and a safe visual-signal feed. LLM composition is later and should use curated context rather than model fine-tuning as a default assumption.

Any audio/visual routing must follow Reduce Motion and intensity safety rules.

## Architecture rules

- Keep inference behind an explicit backend abstraction.
- Keep provider HTTP and credentials out of ad hoc component code.
- Treat terminal execution as a security boundary.
- Keep audio generation separate from visual/physics routing.
- Do not mark a settings form or trait slot as an implemented backend.
- Update [Current Status](../CURRENT_STATUS.md) when a future slice becomes real.
