# Bandit — v112.5b: agent chat MVP implementation

Materializes the v112.5a design. Two commits:

- **v112.5b.0** — Rust: `InferenceBackend` trait + `RemoteClient` impl + `chat` and `test_inference_connection` Tauri commands + new `reqwest` direct dependency
- **v112.5b.1** — TypeScript/React: `AgentChatTile` (replaces `AgentChatPlaceholder`) + new "Agents" settings category + i18n + E2E

After v112.5b lands, only v112.6 (arc close) remains in the v112 arc.

Basis: `docs/canonical/LUMAWEAVE_POST_V1_FEATURE_ARCHITECTURE.md` (the design doc) + `docs/workflows/v112_5_agent_chat_report.md` (the investigation with locked decisions) + Ryan-confirmed §8 decisions.

Generic rules: `~/Projects/CLAUDE.md`; project: `~/Projects/lumaweave/CLAUDE.md`; Discord/gates: `~/Projects/DISCORD_PROTOCOL.md`.

## ⏩ BANDIT PASS PREFACE (each commit)
0. Discord MCP else HALT. 1. START→#current-task. 2. Work+verify. 3. END→#current-task. 4. MERGE GATE→#approve-this (1506441138612080680). 5. END-OF-RUN REPORT→#changelog w/ SHA. 6. BUMP+PUSH GATE→#approve-this.

No semver bump (v112.6 handles).

## Locked decisions (Ryan-confirmed)

| # | Locked |
|---|---|
| D1 | InferenceBackend trait: **minimal** — `chat()` + `backend_id()` + `supports_streaming()` + `stream_chat()` with NotSupported default |
| D2 | HTTP library: **`reqwest`** with `["rustls-tls", "json"]` features. **Explicit dep approval granted by Ryan.** |
| D3 | API-key storage: **Option D** — settings store path `agents.inference.byokKey` with masked input + plaintext warning UI |
| D4 | Endpoint validation: reject HTTPS-less non-localhost endpoints when API key is set (localhost / 127.0.0.1 / host.docker.internal exempt) |
| D5 | Streaming seam: `stream_chat()` on trait with default `NotSupported` error |
| D6 | Cancellation: 60s hard timeout via `tokio::time::timeout`; user-initiated cancel deferred to v1.1 |
| D7 | Conversation persistence: **ephemeral** — lives in React state; cleared on app restart |
| D8 | Model picker: **free-form text input** |
| D9 | Settings category: **"Agents"** |
| D10 | Test Connection button: **included** in v1.0 |

## v112 arc context

- v112.1 (`d5319d8`) — string scrub + 3 gwells log removals
- v112.2 (`2823b1f`) — theme export sub-area MVP
- v112.3 (`92c6696`) — Type spoke MVP
- v112.3a (`874ef58`) — Motion spoke MVP
- v112.4.0 (`e5f3847`) — dev-mode toggle + tile gating infrastructure
- v112.4.1 (`f661298`) — dev-tile triage + Command Deck rename
- v112.4.2 (`d908450`) — Tiles popover stacking fix (Case B)
- **v112.5b.0 / v112.5b.1 (THIS PASS)** — agent chat MVP
- v112.6 — arc close

---

## COMMIT 1 — `feat(v112.5b.0): InferenceBackend trait + RemoteClient + Tauri commands`

### Pre-flight (verify, report, STOP if diverges)

1. Confirm v112.4.2 (commit `d908450`) is on HEAD; `package.json` reads `"version": "0.18.0"`.

2. Confirm `docs/canonical/LUMAWEAVE_POST_V1_FEATURE_ARCHITECTURE.md` exists (v112.5a deliverable). Quote any sections that have changed since investigation if applicable — otherwise treat the doc as authoritative.

3. Read `src-tauri/Cargo.toml` end-to-end. Quote current direct dependencies. Confirm `reqwest` is NOT currently a direct dep (only transitive per `Cargo.lock:2977`).

4. Quote the existing Tauri command convention from `src-tauri/src/fs.rs` (around line 153, `read_user_file`). The new commands match this style: explicit error types, audit-by-eyeball Rust, security checks first.

5. Quote `src-tauri/src/lib.rs` (or `main.rs`) Tauri command registration. Identify where new commands get added to `tauri::generate_handler![...]`.

6. Confirm Tokio is already a direct or transitive dep. `tokio::time::timeout` is used in the implementation; verify it's available.

7. **STOP if any structural claim diverges from the architecture doc.**

### Files (explicit paths only — Commit 1)

**New:**
- `src-tauri/src/inference/mod.rs` — module entry; exports the trait + types + impls
- `src-tauri/src/inference/types.rs` — `ChatMessage`, `MessageRole`, `InferenceConfig`, `ChatResponse`, `TokenUsage`, `InferenceError`
- `src-tauri/src/inference/backend.rs` — the `InferenceBackend` trait definition
- `src-tauri/src/inference/remote_client.rs` — `RemoteClient` struct + `InferenceBackend` impl
- `src-tauri/src/inference/commands.rs` — `chat` and `test_inference_connection` Tauri commands

**Modified:**
- `src-tauri/Cargo.toml` — add `reqwest = { version = "0.12", features = ["rustls-tls", "json"] }` and `async-trait = "0.1"` and `serde = { version = "1", features = ["derive"] }` if not already present
- `src-tauri/src/lib.rs` (or `main.rs`) — register the new commands; add `pub mod inference;`

Nothing else modified.

### Step 1 — Cargo.toml updates

Add (or confirm present):
```toml
[dependencies]
# ... existing deps preserved
reqwest = { version = "0.12", features = ["rustls-tls", "json"] }
async-trait = "0.1"
serde = { version = "1", features = ["derive"] }  # if not already
serde_json = "1"  # if not already
```

If any of these already exist as direct deps, leave their versions alone (don't bump). Just ensure `reqwest` is added with the specified features.

### Step 2 — `inference/types.rs`

```rust
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum MessageRole {
    User,
    Assistant,
    System,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatMessage {
    pub role: MessageRole,
    pub content: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InferenceConfig {
    pub endpoint: String,
    pub model: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub api_key: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub temperature: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_tokens: Option<u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatResponse {
    pub message: ChatMessage,
    pub finish_reason: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub usage: Option<TokenUsage>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TokenUsage {
    pub prompt_tokens: u32,
    pub completion_tokens: u32,
    pub total_tokens: u32,
}

#[derive(Debug, thiserror::Error, Serialize)]
#[serde(tag = "kind", content = "message")]
pub enum InferenceError {
    #[error("Network error: {0}")]
    Network(String),
    #[error("Timeout after {0} seconds")]
    Timeout(u64),
    #[error("HTTP error {status}: {message}")]
    Http { status: u16, message: String },
    #[error("Invalid response: {0}")]
    InvalidResponse(String),
    #[error("Authentication required for non-localhost endpoint over HTTP without HTTPS")]
    InsecureEndpoint,
    #[error("Streaming not supported by this backend")]
    StreamingNotSupported,
    #[error("Configuration error: {0}")]
    Config(String),
}
```

**Note:** if `thiserror` isn't already a dep, add it OR replace `#[derive(thiserror::Error)]` with a manual `Display` impl. Pre-flight identifies which.

### Step 3 — `inference/backend.rs`

```rust
use async_trait::async_trait;
use super::types::{ChatMessage, ChatResponse, InferenceConfig, InferenceError};

#[async_trait]
pub trait InferenceBackend: Send + Sync {
    /// Send a non-streaming chat completion request.
    async fn chat(
        &self,
        messages: Vec<ChatMessage>,
        config: InferenceConfig,
    ) -> Result<ChatResponse, InferenceError>;
    
    /// Identifier for this backend (for logging/diagnostics).
    fn backend_id(&self) -> &'static str;
    
    /// Whether this backend supports streaming. Default: false.
    fn supports_streaming(&self) -> bool {
        false
    }
    
    /// Streaming chat — default impl returns StreamingNotSupported.
    /// Backends that support streaming override this method.
    async fn stream_chat(
        &self,
        _messages: Vec<ChatMessage>,
        _config: InferenceConfig,
    ) -> Result<(), InferenceError> {
        Err(InferenceError::StreamingNotSupported)
    }
}
```

### Step 4 — `inference/remote_client.rs`

```rust
use async_trait::async_trait;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::time::Duration;
use tokio::time::timeout;

use super::backend::InferenceBackend;
use super::types::{
    ChatMessage, ChatResponse, InferenceConfig, InferenceError, MessageRole, TokenUsage,
};

const REQUEST_TIMEOUT_SECS: u64 = 60;

pub struct RemoteClient {
    client: Client,
}

impl RemoteClient {
    pub fn new() -> Self {
        let client = Client::builder()
            .timeout(Duration::from_secs(REQUEST_TIMEOUT_SECS))
            .build()
            .expect("reqwest Client builder failed");
        Self { client }
    }
    
    fn validate_endpoint(endpoint: &str, has_api_key: bool) -> Result<(), InferenceError> {
        // Local endpoints exempt from HTTPS requirement
        let is_local = endpoint.contains("localhost")
            || endpoint.contains("127.0.0.1")
            || endpoint.contains("host.docker.internal");
        if has_api_key && !is_local && !endpoint.starts_with("https://") {
            return Err(InferenceError::InsecureEndpoint);
        }
        Ok(())
    }
}

#[derive(Serialize)]
struct ChatCompletionRequest<'a> {
    model: &'a str,
    messages: &'a [ChatMessage],
    stream: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    temperature: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    max_tokens: Option<u32>,
}

#[derive(Deserialize)]
struct ChatCompletionResponse {
    choices: Vec<Choice>,
    usage: Option<TokenUsage>,
}

#[derive(Deserialize)]
struct Choice {
    message: ChatMessageResponse,
    finish_reason: String,
}

#[derive(Deserialize)]
struct ChatMessageResponse {
    role: String,
    content: String,
}

#[async_trait]
impl InferenceBackend for RemoteClient {
    async fn chat(
        &self,
        messages: Vec<ChatMessage>,
        config: InferenceConfig,
    ) -> Result<ChatResponse, InferenceError> {
        Self::validate_endpoint(&config.endpoint, config.api_key.is_some())?;
        
        // Compose URL — endpoint may or may not include the /chat/completions path
        let url = if config.endpoint.ends_with("/chat/completions") {
            config.endpoint.clone()
        } else if config.endpoint.ends_with("/") {
            format!("{}chat/completions", config.endpoint)
        } else {
            format!("{}/chat/completions", config.endpoint)
        };
        
        let body = ChatCompletionRequest {
            model: &config.model,
            messages: &messages,
            stream: false,
            temperature: config.temperature,
            max_tokens: config.max_tokens,
        };
        
        let mut req = self.client.post(&url).json(&body);
        if let Some(key) = &config.api_key {
            req = req.bearer_auth(key);
        }
        
        let response = timeout(Duration::from_secs(REQUEST_TIMEOUT_SECS), req.send())
            .await
            .map_err(|_| InferenceError::Timeout(REQUEST_TIMEOUT_SECS))?
            .map_err(|e| InferenceError::Network(e.to_string()))?;
        
        let status = response.status();
        if !status.is_success() {
            let message = response.text().await.unwrap_or_else(|_| "(no body)".to_string());
            return Err(InferenceError::Http {
                status: status.as_u16(),
                message,
            });
        }
        
        let parsed: ChatCompletionResponse = response
            .json()
            .await
            .map_err(|e| InferenceError::InvalidResponse(e.to_string()))?;
        
        let choice = parsed
            .choices
            .into_iter()
            .next()
            .ok_or_else(|| InferenceError::InvalidResponse("Response had no choices".to_string()))?;
        
        let role = match choice.message.role.as_str() {
            "user" => MessageRole::User,
            "system" => MessageRole::System,
            _ => MessageRole::Assistant, // default to assistant for unknown roles
        };
        
        Ok(ChatResponse {
            message: ChatMessage {
                role,
                content: choice.message.content,
            },
            finish_reason: choice.finish_reason,
            usage: parsed.usage,
        })
    }
    
    fn backend_id(&self) -> &'static str {
        "remote-client"
    }
    
    fn supports_streaming(&self) -> bool {
        false
    }
}
```

**Audit-by-eyeball constraint:** the whole file is ~140 lines. Within the ~150 line target. If it grows beyond ~200 during implementation, flag and propose a refactor.

### Step 5 — `inference/commands.rs`

```rust
use super::backend::InferenceBackend;
use super::remote_client::RemoteClient;
use super::types::{ChatMessage, ChatResponse, InferenceConfig, InferenceError, MessageRole};

#[tauri::command]
pub async fn chat(
    messages: Vec<ChatMessage>,
    config: InferenceConfig,
) -> Result<ChatResponse, InferenceError> {
    let client = RemoteClient::new();
    client.chat(messages, config).await
}

#[tauri::command]
pub async fn test_inference_connection(
    config: InferenceConfig,
) -> Result<TestConnectionResult, InferenceError> {
    let client = RemoteClient::new();
    let probe_messages = vec![ChatMessage {
        role: MessageRole::User,
        content: "Hello".to_string(),
    }];
    
    let mut probe_config = config;
    probe_config.max_tokens = Some(5); // minimize cost for the probe
    
    match client.chat(probe_messages, probe_config).await {
        Ok(_response) => Ok(TestConnectionResult { ok: true, message: "Connection successful.".to_string() }),
        Err(e) => Ok(TestConnectionResult { ok: false, message: format!("Connection failed: {}", e) }),
    }
}

#[derive(serde::Serialize)]
pub struct TestConnectionResult {
    pub ok: bool,
    pub message: String,
}
```

**Note on `test_inference_connection`:** returns `Ok` even on failed connection because the caller wants the result data, not an error propagation. The `ok: bool` field signals success/failure.

### Step 6 — `inference/mod.rs`

```rust
pub mod backend;
pub mod commands;
pub mod remote_client;
pub mod types;

pub use backend::InferenceBackend;
pub use commands::{chat, test_inference_connection};
pub use remote_client::RemoteClient;
pub use types::*;
```

### Step 7 — `lib.rs` (or `main.rs`) updates

Add at the top:
```rust
pub mod inference;
```

In the `tauri::generate_handler![...]` macro, add `inference::chat, inference::test_inference_connection`.

### Step 8 — Verify

```bash
cd src-tauri && cargo check
cd .. && npm run typecheck
npm run lint:css
```

Expected:
- `cargo check` → 0 errors, possibly warnings about unused code (acceptable until v112.5b.1 wires the frontend)
- typecheck → 0 (no TS changed in this commit)
- lint:css → 0/0 (no CSS changed)

### Commit 1 message

`feat(v112.5b.0): InferenceBackend trait + RemoteClient impl + chat/test_inference_connection Tauri commands`

MERGE GATE → commit (explicit paths only) → END-OF-RUN REPORT → bump+push gate.

### Hard stops (Commit 1)

- **Rust only.** No TypeScript, no React, no CSS in this commit. Frontend wire-up is Commit 2.
- **Audit-by-eyeball total**: all new Rust under ~250 lines (types ~50 + backend ~30 + remote_client ~140 + commands ~30). If it grows significantly larger, flag.
- **No additional Rust deps beyond what's specified.** `reqwest`, `async-trait`, `thiserror` (if not present), `serde` features.
- **Endpoint URL composition is explicit.** Handle three cases: ends with `/chat/completions`, ends with `/`, doesn't end with `/`. Don't assume.
- **HTTPS validation is non-negotiable.** D4 locked: reject HTTPS-less non-localhost with API key.
- **60s timeout via tokio::time::timeout AND reqwest builder timeout.** Belt-and-suspenders — the reqwest timeout catches infrastructure issues; the tokio timeout catches the whole future being stuck.
- No semver bump. No NOW.md / ROADMAP edits.
- Explicit-path git. Discord MCP only.

---

## COMMIT 2 — `feat(v112.5b.1): AgentChatTile + Agents settings category + chat UI`

### Pre-flight (verify, report, STOP if diverges)

1. Confirm Commit 1 landed cleanly.

2. Confirm `src/control-plane/agent/AgentChatPlaceholder.tsx` exists from v112.5a's audit. This file gets renamed to `AgentChatTile.tsx` in this commit (or replaced; pre-flight identifies cleaner approach — replace if the tile-section registry references can be updated atomically).

3. Identify the settings category registration pattern. Per project knowledge, `settingsPanelCategoryRegistry.ts` exists. Quote how `CategoryAdvanced.tsx` is registered (per the v112.4.0 reference work).

4. Identify how settings store paths are added. From v112.4.0: `dev.mode` was added to schema v94. This commit adds `agents.inference.{endpoint, model, byokKey, temperature, maxTokens}` — needs schema v95 with backfill migration.

5. Identify the AppShell `invoke()` pattern for Tauri commands. Quote a usage from a recent commit (e.g., source adapter loaders use `invoke()` — find an example).

6. Confirm the existing Tauri invoke wrapper if any. Some projects wrap `invoke()` in a typed `tauri-invoke.ts` helper; verify if LumaWeave has this and use it. Otherwise import `invoke` directly from `@tauri-apps/api/core`.

7. **STOP if any structural claim diverges.**

### Files (explicit paths only — Commit 2)

**New:**
- `src/control-plane/agent/AgentChatTile.tsx` — replaces `AgentChatPlaceholder.tsx` (delete the placeholder)
- `src/control-plane/agent/ChatMessageList.tsx` — message rendering
- `src/control-plane/agent/ChatInput.tsx` — input row with send button
- `src/control-plane/agent/agentChat.css` — chat tile styles
- `src/control-plane/agent/useAgentChat.ts` — chat hook (manages messages, in-flight state, calls Tauri)
- `src/control-plane/settings/categories/CategoryAgents.tsx` — settings category UI
- `tests/e2e/agent-chat.spec.ts` — E2E: tile renders, settings save, test connection works

**Modified:**
- `src/control-plane/agent/AgentChatPlaceholder.tsx` — **DELETE** (replaced by AgentChatTile)
- `src/control-plane/panels/tileSectionRegistry.ts` — update content import to `AgentChatTile`; update label if needed
- `src/control-plane/settings/settings.schema.ts` — add `agents.inference.*` fields
- `src/control-plane/settings/settings.defaults.ts` — add defaults
- `src/control-plane/settings/settings.migrations.ts` — add v94 → v95 migration
- `src/control-plane/settings/settingsPanelCategoryRegistry.ts` — register `CategoryAgents`
- `src/i18n/manifests/en.json` — add `agents.*` keys (chat UI strings + settings labels)

### Step 1 — Settings schema v94 → v95

```typescript
// settings.schema.ts — add to LumaWeaveSettings
{
  // existing fields
  agents: {
    inference: {
      endpoint: string;  // default "http://localhost:11434/v1"
      model: string;     // default "llama3.1"
      byokKey: string;   // default "" — empty means no auth header
      temperature?: number;
      maxTokens?: number;
    };
  };
}

// settings.defaults.ts
{
  // existing defaults
  agents: {
    inference: {
      endpoint: "http://localhost:11434/v1",
      model: "llama3.1",
      byokKey: "",
    },
  },
}

// settings.migrations.ts — new v95
{
  version: 95,
  migrate: (settings) => ({
    ...settings,
    agents: settings.agents ?? {
      inference: {
        endpoint: "http://localhost:11434/v1",
        model: "llama3.1",
        byokKey: "",
      },
    },
  }),
}
```

### Step 2 — useAgentChat hook

```typescript
// useAgentChat.ts
import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useSettingsStore } from "...";

export type ChatRole = "user" | "assistant" | "system";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatResponse {
  message: ChatMessage;
  finish_reason: string;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

export function useAgentChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inFlight, setInFlight] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const config = useSettingsStore((s) => s.settings.agents?.inference);
  
  const send = useCallback(async (userText: string) => {
    if (!userText.trim() || inFlight) return;
    setError(null);
    
    const userMessage: ChatMessage = { role: "user", content: userText };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInFlight(true);
    
    try {
      const response = await invoke<ChatResponse>("chat", {
        messages: updatedMessages,
        config: {
          endpoint: config.endpoint,
          model: config.model,
          apiKey: config.byokKey || undefined,
          temperature: config.temperature,
          maxTokens: config.maxTokens,
        },
      });
      setMessages([...updatedMessages, response.message]);
    } catch (e: any) {
      // Tauri command errors come back as the InferenceError serde-serialized
      const message = typeof e === "string"
        ? e
        : e?.message ?? "Unknown error";
      setError(message);
    } finally {
      setInFlight(false);
    }
  }, [messages, inFlight, config]);
  
  const clear = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);
  
  return { messages, send, clear, inFlight, error };
}
```

### Step 3 — AgentChatTile + subcomponents

`AgentChatTile.tsx`:
```tsx
import { useAgentChat } from "./useAgentChat";
import { ChatMessageList } from "./ChatMessageList";
import { ChatInput } from "./ChatInput";
import "./agentChat.css";

export function AgentChatTile() {
  const { messages, send, clear, inFlight, error } = useAgentChat();
  
  return (
    <div className="lw-agent-chat" data-testid="agent-chat-tile">
      <ChatMessageList messages={messages} inFlight={inFlight} error={error} />
      <ChatInput onSend={send} disabled={inFlight} />
    </div>
  );
}
```

`ChatMessageList.tsx`:
```tsx
import { useTranslation } from "...";
import type { ChatMessage } from "./useAgentChat";

export function ChatMessageList({
  messages,
  inFlight,
  error,
}: {
  messages: ChatMessage[];
  inFlight: boolean;
  error: string | null;
}) {
  const { t } = useTranslation();
  
  if (messages.length === 0 && !inFlight) {
    return (
      <div className="lw-agent-chat-empty" data-testid="agent-chat-empty">
        {t("agents.chat.emptyState")}
      </div>
    );
  }
  
  return (
    <div className="lw-agent-chat-messages" data-testid="agent-chat-messages">
      {messages.map((msg, i) => (
        <div
          key={i}
          className={`lw-agent-chat-message lw-agent-chat-message-${msg.role}`}
          data-testid={`agent-chat-message-${i}`}
        >
          {msg.content}
        </div>
      ))}
      {inFlight && (
        <div className="lw-agent-chat-message lw-agent-chat-message-assistant lw-agent-chat-loading" data-testid="agent-chat-loading">
          {t("agents.chat.thinking")}
        </div>
      )}
      {error && (
        <div className="lw-agent-chat-error" data-testid="agent-chat-error">
          {error}
        </div>
      )}
    </div>
  );
}
```

`ChatInput.tsx`:
```tsx
import { useState, useCallback } from "react";
import { useTranslation } from "...";

export function ChatInput({
  onSend,
  disabled,
}: {
  onSend: (text: string) => void;
  disabled: boolean;
}) {
  const { t } = useTranslation();
  const [text, setText] = useState("");
  
  const handleSubmit = useCallback(() => {
    if (!text.trim() || disabled) return;
    onSend(text);
    setText("");
  }, [text, onSend, disabled]);
  
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );
  
  return (
    <div className="lw-agent-chat-input">
      <textarea
        data-testid="agent-chat-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t("agents.chat.inputPlaceholder")}
        disabled={disabled}
        rows={2}
      />
      <button
        type="button"
        data-testid="agent-chat-send"
        onClick={handleSubmit}
        disabled={disabled || !text.trim()}
      >
        {t("agents.chat.sendButton")}
      </button>
    </div>
  );
}
```

`agentChat.css`:
```css
.lw-agent-chat {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: var(--lw-spacing-sm);
}

.lw-agent-chat-messages {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--lw-spacing-xs);
}

.lw-agent-chat-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--lw-text-secondary);
  font-size: var(--lw-font-size-sm);
}

.lw-agent-chat-message {
  padding: var(--lw-spacing-xs) var(--lw-spacing-sm);
  border-radius: var(--lw-radius-sm);
  max-width: 85%;
  word-wrap: break-word;
}

.lw-agent-chat-message-user {
  background: var(--lw-accent-subtle);
  align-self: flex-end;
}

.lw-agent-chat-message-assistant {
  background: var(--lw-surface-2);
  align-self: flex-start;
}

.lw-agent-chat-loading {
  font-style: italic;
  color: var(--lw-text-secondary);
}

.lw-agent-chat-error {
  padding: var(--lw-spacing-xs) var(--lw-spacing-sm);
  border-radius: var(--lw-radius-sm);
  background: var(--lw-error-subtle);
  color: var(--lw-error-text);
  font-size: var(--lw-font-size-sm);
}

.lw-agent-chat-input {
  display: flex;
  gap: var(--lw-spacing-xs);
  padding-block-start: var(--lw-spacing-sm);
  border-block-start: 1px solid var(--lw-border);
}

.lw-agent-chat-input textarea {
  flex: 1;
  resize: none;
  padding: var(--lw-spacing-xs);
  background: var(--lw-surface);
  border: 1px solid var(--lw-border);
  border-radius: var(--lw-radius-sm);
  color: var(--lw-text);
  font-family: inherit;
}

.lw-agent-chat-input button {
  padding: var(--lw-spacing-xs) var(--lw-spacing-sm);
  background: var(--lw-accent);
  color: var(--lw-text-on-accent);
  border: none;
  border-radius: var(--lw-radius-sm);
  cursor: pointer;
}

.lw-agent-chat-input button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

Match existing CSS variable names per pre-flight — the `--lw-error-*` and `--lw-accent-*` tokens may have different names. Use what's canonical.

### Step 4 — CategoryAgents settings

```tsx
// CategoryAgents.tsx
import { useTranslation } from "...";
import { useSettingsStore } from "...";
import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";

export function CategoryAgents() {
  const { t } = useTranslation();
  const config = useSettingsStore((s) => s.settings.agents.inference);
  const setSetting = useSettingsStore((s) => s.setSetting);
  
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  
  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await invoke<{ ok: boolean; message: string }>("test_inference_connection", {
        config: {
          endpoint: config.endpoint,
          model: config.model,
          apiKey: config.byokKey || undefined,
        },
      });
      setTestResult(result);
    } catch (e: any) {
      setTestResult({ ok: false, message: typeof e === "string" ? e : e?.message ?? "Unknown error" });
    } finally {
      setTesting(false);
    }
  };
  
  return (
    <div className="lw-settings-category-agents">
      <h2>{t("settings.agents.title")}</h2>
      <p className="lw-settings-description">{t("settings.agents.description")}</p>
      
      <SettingsRow label={t("settings.agents.endpoint.label")} description={t("settings.agents.endpoint.hint")}>
        <input
          type="text"
          data-testid="settings-agents-endpoint"
          value={config.endpoint}
          onChange={(e) => setSetting("agents.inference.endpoint", e.target.value)}
          placeholder="http://localhost:11434/v1"
        />
      </SettingsRow>
      
      <SettingsRow label={t("settings.agents.model.label")} description={t("settings.agents.model.hint")}>
        <input
          type="text"
          data-testid="settings-agents-model"
          value={config.model}
          onChange={(e) => setSetting("agents.inference.model", e.target.value)}
          placeholder="llama3.1"
        />
      </SettingsRow>
      
      <SettingsRow label={t("settings.agents.apiKey.label")} description={t("settings.agents.apiKey.hint")}>
        <input
          type="password"
          data-testid="settings-agents-apikey"
          value={config.byokKey}
          onChange={(e) => setSetting("agents.inference.byokKey", e.target.value)}
          placeholder=""
        />
      </SettingsRow>
      
      <div className="lw-settings-warning" data-testid="settings-agents-warning">
        {t("settings.agents.apiKey.warning")}
      </div>
      
      <div className="lw-settings-test-section">
        <button
          type="button"
          data-testid="settings-agents-test"
          onClick={handleTest}
          disabled={testing}
        >
          {testing ? t("settings.agents.test.testing") : t("settings.agents.test.button")}
        </button>
        {testResult && (
          <div
            className={`lw-settings-test-result ${testResult.ok ? "ok" : "fail"}`}
            data-testid="settings-agents-test-result"
          >
            {testResult.message}
          </div>
        )}
      </div>
    </div>
  );
}
```

`SettingsRow` is the existing component pattern from CategoryAdvanced — match exactly. Pre-flight quotes the actual shape.

Register `CategoryAgents` in `settingsPanelCategoryRegistry.ts` between two existing categories. Pre-flight identifies the right position (e.g., after CategoryDataSources, before CategoryAdvanced — Agents fits between "data" and "developer").

### Step 5 — i18n keys

Add to `en.json`:

```json
"agents": {
  "chat": {
    "emptyState": "Start a conversation",
    "thinking": "Thinking…",
    "inputPlaceholder": "Ask the agent…",
    "sendButton": "Send"
  }
},
"settings": {
  "agents": {
    "title": "Agents",
    "description": "Configure the inference backend for the agent chat.",
    "endpoint": {
      "label": "Endpoint URL",
      "hint": "OpenAI-compatible endpoint. Default: http://localhost:11434/v1 (Ollama)."
    },
    "model": {
      "label": "Model",
      "hint": "Model name as registered with the endpoint."
    },
    "apiKey": {
      "label": "API Key",
      "hint": "Optional. Required for remote providers (OpenAI, Anthropic). Empty for local Ollama.",
      "warning": "API keys are stored unencrypted in settings for v1.0. OS keychain storage coming in v1.1."
    },
    "test": {
      "button": "Test Connection",
      "testing": "Testing…"
    }
  }
}
```

Remove the now-orphaned `agent.chat.placeholder.*` keys.

### Step 6 — tileSectionRegistry update

Change the registry entry's `content`:
```typescript
import { AgentChatTile } from "../agent/AgentChatTile";

// ...
content: () => createElement(AgentChatTile),
contentTestId: "agent-chat-tile",  // updated from agent-chat-placeholder
```

### Step 7 — E2E spec

```typescript
// tests/e2e/agent-chat.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Agent Chat", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Open the agent chat tile (pre-flight identifies the trigger)
  });

  test("tile renders empty state initially", async ({ page }) => {
    await expect(page.getByTestId("agent-chat-tile")).toBeVisible();
    await expect(page.getByTestId("agent-chat-empty")).toBeVisible();
  });

  test("input + send button are present", async ({ page }) => {
    await expect(page.getByTestId("agent-chat-input")).toBeVisible();
    await expect(page.getByTestId("agent-chat-send")).toBeVisible();
  });

  test("send button is disabled when input is empty", async ({ page }) => {
    await expect(page.getByTestId("agent-chat-send")).toBeDisabled();
  });

  test("send button enables when input has text", async ({ page }) => {
    await page.getByTestId("agent-chat-input").fill("Hello");
    await expect(page.getByTestId("agent-chat-send")).toBeEnabled();
  });

  test("settings category Agents is registered", async ({ page }) => {
    // Open settings (use existing helper)
    // Verify Agents category appears in the sidebar
    await expect(page.getByText("Agents")).toBeVisible();
  });

  test("Agents settings show endpoint/model/apikey fields", async ({ page }) => {
    // Open settings → Agents
    await expect(page.getByTestId("settings-agents-endpoint")).toBeVisible();
    await expect(page.getByTestId("settings-agents-model")).toBeVisible();
    await expect(page.getByTestId("settings-agents-apikey")).toBeVisible();
  });

  test("API key warning is visible", async ({ page }) => {
    await expect(page.getByTestId("settings-agents-warning")).toBeVisible();
  });

  test("default endpoint is Ollama localhost", async ({ page }) => {
    const value = await page.getByTestId("settings-agents-endpoint").inputValue();
    expect(value).toBe("http://localhost:11434/v1");
  });
});
```

**Note on the test connection test:** intentionally omitted from E2E because it requires a real backend. Manual smoke covers it.

### Step 8 — Verify

```bash
cd src-tauri && cargo check
cd ..
npm run typecheck
npm run lint:css
npx playwright test tests/e2e/agent-chat.spec.ts --reporter=line
```

Expected: all clean. 8 E2E pass.

### Step 9 — Manual smoke (Ryan, `npm run tauri dev`)

1. App launches. Open Settings → confirm "Agents" category appears in sidebar.
2. Click Agents. Confirm: endpoint defaults to `http://localhost:11434/v1`, model defaults to `llama3.1`, API key is empty, warning is visible, Test Connection button is present.
3. Click Test Connection. With Ollama running locally on default port: success message. With Ollama not running: failure message naming network error.
4. Adjust the model field to a model you actually have pulled (e.g., `llama3.2:3b` or whichever).
5. Close settings. Open the Agent Chat tile.
6. Type "Hello" → press Enter. Loading state appears. After response: assistant message renders.
7. Type a follow-up. Confirm conversation state persists during the session (multiple messages render in order).
8. Restart the app. Open Agent Chat. Confirm conversation is cleared (ephemeral per D7).
9. Optional: change endpoint to your bitmosh AI stack LiteLLM URL (`http://localhost:4000/v1`) with appropriate model. Confirm it works through that path too.

### Commit 2 message

`feat(v112.5b.1): AgentChatTile + Agents settings category + chat UI`

MERGE GATE → commit (explicit paths only) → END-OF-RUN REPORT → bump+push gate.

### Hard stops (Commit 2)

- **Replace AgentChatPlaceholder.tsx, don't add alongside.** Atomic transition.
- **Settings schema must migrate cleanly v94 → v95.** Sequential numbering.
- **Match existing SettingsRow component shape from CategoryAdvanced.** Don't invent a new layout component.
- **API key field is `type="password"`.** Always masked.
- **Test Connection button is non-blocking.** UI stays interactive during the test (the `testing` state disables the button only).
- **No conversation persistence.** Ephemeral state only — React useState, nothing in settings store, nothing in localStorage.
- **CSS uses `--lw-*` tokens.** Match existing tokens; don't introduce new ones unless absolutely necessary.
- **Don't add `agent.chat.placeholder.*` keys back.** Those are removed; the new keys live under `agents.chat.*` and `settings.agents.*`.
- No new npm dependencies. No new Rust. No semver bump. No NOW.md / ROADMAP edits.
- Explicit-path git. Discord MCP only.

---

## END-OF-RUN REPORTS (each commit)

Files committed, pre-flight findings, verification results, manual smoke notes, any deviations.

**Final report (after Commit 2):**
- v112.5 complete; v112.6 (arc close) is next
- New Rust surface added: ~200 lines (inference module)
- New direct dependency: `reqwest` with `["rustls-tls", "json"]`
- Settings schema at v95
- KNOWN_SHARP_EDGES candidates surfaced (if any) for v112.6 arc close

## Hard stops (arc-level)

- Targeted-test-scope + CI fast-jobs only.
- Two commits. Commit 1 is Rust-only; Commit 2 is frontend-only.
- No semver bump (v112.6 handles).
- Migration version sequential (v94 → v95).
- Explicit-path git. Discord MCP only.
