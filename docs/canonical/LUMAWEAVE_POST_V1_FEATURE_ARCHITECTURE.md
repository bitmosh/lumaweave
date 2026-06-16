---
id: domain.inference.post.v1.architecture
title: Post-v1.0 Feature Architecture
cluster: indigo
references:
  - domain.deferred.post.v1.vision
  - domain.control.surface.contract
tags:
  - inference
  - chat
  - architecture
  - canonical
  - v112
status: canonical
include_in_self_graph: true
type: manual
agent_readable: true
last_updated: 2026-06-11
---

# LumaWeave — Post-v1.0 Feature Architecture

## Purpose

This document is the authoritative specification for the post-v1.0 feature arcs that have concrete architectural shape: the inference system (InferenceBackend trait + RemoteClient), the Agent Chat tile, and the terminal tile. It lives alongside `DEFERRED_AND_POST_V1_VISION.md` — that doc preserves high-level intent across *all* deferred systems; this doc provides implementation-grade spec for the ones whose design is locked.

`DEFERRED_AND_POST_V1_VISION.md §5` references this file as the authoritative build plan for "terminal · inference · Strudel." Do not duplicate or contradict it.

**Relationship to other docs:**
- `DEFERRED_AND_POST_V1_VISION.md` — the full deferred-systems map; cites this doc for inference/terminal/Strudel
- `~/Projects/future-integration/INTEGRATION_FUTURES.md` — Cerebra sibling-module vision; informs forward-compat hooks here
- `docs/SHIP_READINESS_ROADMAP.md` — when these arcs open

---

## Inference Architecture

### Overview

LumaWeave v1.0 ships a Rust `InferenceBackend` trait with one implementation: `RemoteClient`. `RemoteClient` speaks the OpenAI-compatible chat completion API, targeting any endpoint the user configures — Ollama (`http://localhost:11434/v1`), a LiteLLM proxy, OpenAI, Anthropic via LiteLLM, or any other compliant provider.

The frontend calls a Tauri command (`invoke("chat", ...)`) and gets back a `ChatResponse`. All HTTP happens in Rust. The frontend never handles API keys or raw HTTP.

Future impls — `CandleBackend` (local model, post-v1.0) and `CerebraBackend` (sibling-module IPC, post-v1.0) — slot in behind the same trait without changing the Tauri command signature or the frontend.

**Current state (v1.0):** `RemoteClient` only. No bundled model. No container. BYOK or Ollama direct.

### InferenceBackend Trait

Lives at `src-tauri/src/inference/mod.rs` (or `inference/backend.rs`). Uses `async_trait` — the standard convention for async Rust traits; compile-time cost only, no runtime overhead.

```rust
use async_trait::async_trait;

#[async_trait]
pub trait InferenceBackend: Send + Sync {
    /// Primary inference method. Non-streaming for v1.0; streaming adds stream_chat() in v1.1.
    async fn chat(
        &self,
        messages: Vec<ChatMessage>,
        config: &InferenceConfig,
    ) -> Result<ChatResponse, InferenceError>;

    /// Stable identifier used for logging and error attribution.
    fn backend_id(&self) -> &'static str;

    /// Capability query — false in v1.0 for all impls; true when streaming is implemented.
    fn supports_streaming(&self) -> bool { false }

    /// Optional streaming path — v1.1+. Default: unsupported. Override without trait migration.
    async fn stream_chat(
        &self,
        _messages: Vec<ChatMessage>,
        _config: &InferenceConfig,
        _on_token: impl Fn(String) + Send + 'static,
    ) -> Result<(), InferenceError> {
        Err(InferenceError::NotSupported("streaming"))
    }
}
```

**Design notes:**
- `chat()` config takes `&InferenceConfig` not owned value — avoids clone on every call.
- `stream_chat()` defaults to `NotSupported` — streaming impls override it without any breaking change. This is the seam that makes v1.1 streaming a drop-in addition.
- No `health_check()`, `list_models()`, or `cancel()` on the trait — these are impl-level operations, not contract requirements. `RemoteClient` exposes a health-check via a separate Tauri command; future impls may not need it.
- No Cerebra-specific methods (e.g., `set_context()`). Cerebra-specific extensions go on a sibling trait when that integration lands.

### Core Types

```rust
pub struct ChatMessage {
    pub role: MessageRole,
    pub content: String,
    // Multimodal content: deferred. String content is the v1.0 contract.
}

pub enum MessageRole {
    System,
    User,
    Assistant,
}

pub struct InferenceConfig {
    pub model: String,
    pub temperature: Option<f32>,
    pub max_tokens: Option<u32>,
    // top_p, stop sequences: deferred — add when a provider exposes them via UI
}

pub struct ChatResponse {
    pub message: ChatMessage,
    pub finish_reason: String,     // "stop", "length", etc.
    pub usage: Option<TokenUsage>, // None if provider doesn't report
}

pub struct TokenUsage {
    pub prompt_tokens: u32,
    pub completion_tokens: u32,
    pub total_tokens: u32,
}

pub enum InferenceError {
    Network(String),               // Connection refused, timeout, DNS
    Timeout,                       // Exceeded 60s request timeout
    Auth(String),                  // 401/403 — bad key or missing key
    ModelNotFound(String),         // 404 on the model
    ApiError { status: u16, body: String },  // Other 4xx/5xx
    ParseError(String),            // Malformed JSON response
    NotSupported(&'static str),    // Capability not implemented by this backend
}
```

### Impls

#### RemoteClient (v1.0 — ships)

**Location:** `src-tauri/src/inference/remote_client.rs`

OpenAI-compatible HTTP client. Targets any endpoint that accepts:
- `POST {base_url}/chat/completions`
- Body: `{"model": str, "messages": [{role, content}], "stream": false, ...}`
- Response: `{"choices": [{"message": {role, content}, "finish_reason": str}], "usage": {...}}`

```rust
pub struct RemoteClient {
    endpoint: String,       // e.g. "http://localhost:11434/v1"
    api_key: Option<String>,
    http: reqwest::Client,  // shared, reuse across requests
}
```

**HTTP library:** `reqwest` with `features = ["rustls-tls", "json"]`. `reqwest` is already present in `Cargo.lock` as a transitive dependency of Tauri — adding it to `Cargo.toml` promotes it to an explicit, version-controlled direct dependency. This requires Ryan's explicit approval per the package-install safeguard before implementation begins.

**Timeout:** 60 seconds. Ollama inference on a weaker GPU can be slow; 60s is generous without being unlimited. Set via `reqwest::ClientBuilder::timeout`.

**Endpoint security:** If an API key is set AND the endpoint is not localhost (`127.0.0.1`, `::1`, `localhost`, `host.docker.internal`) AND the scheme is `http://`, the client returns `InferenceError::Auth("Refusing to send API key over plain HTTP to non-local endpoint")`. Local endpoints are exempt — they don't leave the machine.

**Expected impl size:** ~100-120 lines for a clean impl. If it exceeds ~200 lines, split into sub-functions or a response-parsing module.

**Cancellation (v1.0):** `tokio::time::timeout` provides the 60s hard limit. User-initiated cancellation is not wired in v1.0 — the inflight request completes or times out. The chat UI shows a "waiting" state; the user can dismiss and start fresh. This is acceptable for non-streaming. When streaming lands (v1.1), a proper `AbortHandle` pattern applies: store `tokio::task::AbortHandle` in a `Mutex<Option<AbortHandle>>` within a Tauri state resource, expose a `cancel_inference` Tauri command to abort it.

#### CandleBackend (post-v1.0 — deferred)

**Location (future):** `src-tauri/src/inference/candle_backend.rs`

Implements `InferenceBackend` against a locally loaded Candle model. The trait fully accommodates this — no interface changes needed. Requires new `candle` crate deps and significant model-loading infrastructure; opens as its own arc.

**Forward-compat requirement:** The trait must not encode `endpoint_url` or HTTP assumptions in any method signature. It doesn't.

#### CerebraBackend (post-v1.0 — deferred)

**Location (future):** `src-tauri/src/inference/cerebra_backend.rs`

Implements `InferenceBackend` for Cerebra IPC (`transport: "live"`). May also implement a sibling `CerebraExtensions` trait for memory-context and agent-state operations not part of the base inference contract. Design deferred; opens with the Cerebra integration arc.

### Tauri Command Surface

Two new commands register in `src-tauri/src/lib.rs` alongside existing commands:

```rust
// src-tauri/src/inference/commands.rs

#[tauri::command]
pub async fn chat(
    messages: Vec<ChatMessage>,
    config: InferenceConfig,
    state: tauri::State<'_, InferenceState>,
) -> Result<ChatResponse, String> {
    state.backend.chat(messages, &config).await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn test_inference_connection(
    config: InferenceConfig,
    state: tauri::State<'_, InferenceState>,
) -> Result<String, String> {
    // Sends a minimal completion (1-token max) to verify config works.
    // Returns "ok" or an error string suitable for display in the UI.
    let probe = vec![ChatMessage { role: MessageRole::User, content: "ping".into() }];
    let probe_config = InferenceConfig {
        model: config.model.clone(),
        max_tokens: Some(1),
        temperature: Some(0.0),
    };
    state.backend.chat(probe, &probe_config).await
        .map(|_| "ok".to_string())
        .map_err(|e| e.to_string())
}
```

`InferenceState` is a Tauri-managed state resource:

```rust
pub struct InferenceState {
    pub backend: Box<dyn InferenceBackend>,
}
```

Both commands register via the existing pattern in `lib.rs`:

```rust
.manage(InferenceState { backend: Box::new(RemoteClient::from_config(&initial_config)) })
.invoke_handler(tauri::generate_handler![
    // ... existing commands ...
    inference::commands::chat,
    inference::commands::test_inference_connection,
])
```

**Frontend invoke pattern:**
```typescript
import { invoke } from "@tauri-apps/api/core";

const response = await invoke<ChatResponse>("chat", { messages, config });
```

### Configuration

**Settings store path:** `inference` section, version-bumped with migration.

```typescript
inference: {
  endpointUrl: string;    // default: "http://localhost:11434/v1"
  modelName: string;      // default: "llama3.2"
  byokKey: string;        // default: "" (empty = no key; works for local Ollama)
}
```

**API key storage (v1.0):** Settings store (`useSettingsStore`), unencrypted, persisted to localStorage. This is Option D from the v112.5a design investigation: honest about the tradeoff, ships now, works for local Ollama without any key at all.

UI surface: masked text input (`type="password"`) + warning text: "Keys are stored unencrypted on this device. For remote providers, use a key with minimal permissions."

**API key storage (v1.1 plan):** `tauri-plugin-stronghold` (OS keychain — macOS Keychain, Windows Credential Manager, Linux libsecret). Migration path from v1.0: read existing localStorage key, write to keychain, clear localStorage. Clean upgrade.

**Endpoint validation:** RemoteClient enforces: no API key transmission over HTTP to non-local endpoints. Local endpoints (`localhost`, `127.0.0.1`, `::1`, `host.docker.internal`) are exempt.

---

## Chat UI Architecture

### Component Structure

`AgentChatPlaceholder` at `src/control-plane/agent/AgentChatPlaceholder.tsx` becomes `AgentChatTile`. The tile section registry entry (`agent-chat-section` in `tileSectionRegistry.ts:125`) retains its ID, testid (`agent-chat-placeholder`), and no `requiresDevMode` — chat is user-facing.

**Component tree:**

```
AgentChatTile
├── AgentChatHeader          — model name + gear icon (opens config)
├── AgentChatMessageList     — scrollable, fills available height
│   └── AgentChatMessage[]   — user (right) or assistant (left) bubble
├── AgentChatStatusBar       — "Thinking..." / error / ready indicator
└── AgentChatInput           — textarea + send button
```

### State Management

**v1.0 — ephemeral.** Conversation state lives in `useState` (or a dedicated `useChatState` hook) inside `AgentChatTile`. Closed tile or app restart = fresh conversation. This is intentional: v1.0 is a quick-chat surface, not a conversation archive.

**Future — Cerebra-backed.** When Cerebra IPC integrates, the conversation storage hook swaps from in-memory to Cerebra-managed. The UI components don't change — only the storage hook. Forward-compat requirement: don't bake localStorage or settings-store writes into the message list rendering logic; keep them in an isolated hook.

**In-flight state:**
```typescript
type ChatState = {
  messages: ChatMessage[];
  status: "idle" | "sending" | "error";
  errorMessage: string | null;
};
```

### Settings Integration

**AI settings home:** A new "AI" (or "Inference") category in the Settings panel. Same pattern as existing categories (`CategoryAdvanced.tsx`, etc.).

**Config fields:**
- Endpoint URL — text input, default shown as placeholder
- Model name — free-form text input (v1.0); fetched-list dropdown deferred to v1.1
- API key — `type="password"` masked input, optional
- Test Connection — button; calls `test_inference_connection` Tauri command; shows success or error inline

**Inline config (alternate):** A gear icon on the tile header could open a compact config popover — useful for quick model switching without opening full Settings. Not required for v1.0; design should not prevent it.

---

## Terminal Tile (post-v1.0)

**Stack:** xterm.js + portable-pty. Provides a real embedded terminal in a tile.

**Seam:** Tile section registry entry with `requiresDevMode: true` initially (terminal is power-user surface). Graduate to user-visible when stable.

**Tauri surface:** `pty_spawn`, `pty_write`, `pty_resize`, `pty_kill` commands. Streams output via Tauri 2 `Channel<String>` for incremental terminal rendering.

**Cross-platform constraint:** `portable-pty` handles pty differences across macOS, Linux, and Windows (ConPTY). No raw system calls.

**Design deferred** — opens as its own arc after v1.0 ships.

---

## Strudel Tile (post-v1.0)

**Stack:** `@strudel/web` — frontend-only, loaded in the webview. No Rust side.

**v1.1 scope:** The tile itself — a live-coding environment for Strudel musical patterns, rendered in a tile. No AI integration yet.

**Strudel-LLM composer (post-v1.1):** Chat requests generate or modify Strudel patterns. LLM (via InferenceBackend) produces Strudel code; the tile evaluates it. This path uses a curated context library (known-good patterns), not fine-tuning.

**ResponseObserver seam:** The Strudel-LLM integration is a *consumer* of chat events, not an inference backend impl. Design consideration for v1.1: a `ResponseObserver` trait or event channel that lets Strudel subscribe to `ChatResponse` events without coupling to the inference command surface.

---

## Forward-Compat Hooks

### Candle slot
The `InferenceBackend` trait places zero HTTP or networking assumptions in its method signatures. `CandleBackend` implements `chat()` using a local model file — the command layer doesn't change, the frontend doesn't change.

### Cerebra slot
`CerebraBackend` implements `InferenceBackend` + a sibling `CerebraExtensions` trait for memory-context operations. The base `chat()` contract is unchanged. The Cerebra IPC transport (`transport: "live"` per `INTEGRATION_FUTURES.md §4`) is `CerebraBackend`'s internal concern.

### Streaming seam
`stream_chat()` on the trait defaults to `NotSupported`. v1.1 impls override it without any migration. The frontend check: `if (supportsStreaming) invoke("stream_chat", ...) else invoke("chat", ...)`.

### Conversation persistence seam
Conversation state is in a hook, not baked into components. Swapping from `useState` to a Cerebra-backed store is isolated to that hook.

### Chat event bus (future Strudel integration)
The dispatch site for a completed `ChatResponse` should emit an event (e.g., via a lightweight event emitter or Zustand slice) that future observers (Strudel tile, graph node highlights) can subscribe to. Don't build the bus in v1.0 — just don't foreclose it by processing responses inline with no indirection.

---

## Cross-References

- `docs/canonical/DEFERRED_AND_POST_V1_VISION.md` — all deferred systems map; §5 cites this doc for inference/terminal/Strudel
- `~/Projects/future-integration/INTEGRATION_FUTURES.md` — Cerebra integration vision; informs §§ Cerebra slot and conversation persistence seam
- `~/Projects/future-integration/SHARED_SCHEMA.md` — shared data schema for LumaWeave ↔ Cerebra handoff
- `docs/SHIP_READINESS_ROADMAP.md` — when these arcs open
