# Investigation Report — v112.5a Agent Chat Architecture

**Date:** 2026-06-11  
**Brief:** `INVESTIGATION_v112_5_agent_chat.md`  
**Output:** `docs/canonical/LUMAWEAVE_POST_V1_FEATURE_ARCHITECTURE.md` (companion deliverable)  
**Status:** Investigation complete. §8 decisions ready for Ryan to lock.

---

## §1 — Current AgentChatPlaceholder audit

### 1.1 AgentChatPlaceholder.tsx

**File:** `src/control-plane/agent/AgentChatPlaceholder.tsx`

> Note: The brief cites `src/tiles/sections/AgentChatPlaceholder.tsx` — the actual path is `src/control-plane/agent/AgentChatPlaceholder.tsx`. The registry import at `tileSectionRegistry.ts:14` confirms this location.

Current content (full file):
```tsx
import { t } from "../../i18n";
export function AgentChatPlaceholder() {
  return (
    <div className="lw-agent-chat-placeholder" data-testid="agent-chat-placeholder">
      <div className="lw-agent-chat-icon">💬</div>
      <div className="lw-agent-chat-title">{t("agent.chat.title")}</div>
      <div className="lw-agent-chat-desc">{t("agent.chat.placeholder.description")}</div>
      <div className="lw-agent-chat-status">{t("agent.chat.placeholder.status")}</div>
    </div>
  );
}
```

Renders: icon + title + description + status string. Pure presentational, no state, no effects.

### 1.2 Registry entry

From `src/control-plane/panels/tileSectionRegistry.ts:125`:
```typescript
{
  id: "agent-chat-section",
  label: "Agent Chat",
  category: "left-panel",
  defaultWidth: 360, defaultHeight: 560,
  collapsible: true,
  content: () => createElement(AgentChatPlaceholder),
  contentTestId: "agent-chat-placeholder",
  sourceTestId: undefined,
  defaultAnchor: { edge: "left", offset: 80 },
  defaultVisible: false, defaultExpanded: true,
  iconGlyph: "💬",
  // NO requiresDevMode — correct; chat is user-facing
}
```

- Tile ID: `agent-chat-section`
- Content testid: `agent-chat-placeholder`
- `requiresDevMode`: absent (correct — not a dev tool)
- i18n key for label: `agent.chat.title` → `"Agent Chat"`

### 1.3 i18n keys under `agent.chat.*`

From `src/i18n/manifests/en.json`:

| Key | Value |
|-----|-------|
| `agent.chat.title` | `"Agent Chat"` |
| `agent.chat.placeholder.description` | `"Chat with a local AI model."` |
| `agent.chat.placeholder.status` | `"Not yet connected — coming in a future update."` |
| `commands.view_toggleTile_agentChat` | `"Toggle Agent Chat Tile"` |

v112.1 updated `description` and `status` to user-language text (previously dev-placeholder). No `tiles.agentChat.*` prefix — keys live directly under `agent.chat.*`.

### 1.4 Rust side: zero agent/chat/inference code

Confirmed: grep over `src-tauri/src/` for `agent`, `chat`, `inference` returns zero matches in Rust source files (`fs.rs`, `ide.rs`, `lib.rs`, `main.rs`). The full Tauri module surface as of v112.1 is: `greet`, `ide::get_project_root`, `ide::open_in_ide`, `fs::read_file`, `fs::read_user_file`, `fs::run_script`, `fs::list_files`, `fs::read_vault_file`. No inference code exists yet.

### 1.5 Tauri command pattern (from `src-tauri/src/fs.rs:153`)

```rust
// Security: caller supplies absolute path. Validate: canonicalizable,
// regular file (not directory/device), not a symlink. NO scope restriction.
#[tauri::command]
pub async fn read_user_file(path: String) -> Result<String, String> {
    let canonical = std::fs::canonicalize(&path)
        .map_err(|e| format!("Cannot canonicalize path: {e}"))?;
    // ... validation ...
    std::fs::read_to_string(&canonical)
        .map_err(|e| format!("Read failed: {e}"))
}
```

Pattern: `#[tauri::command]` on `pub async fn`, returns `Result<T, String>` (String error maps to JS `Error`), registered in `lib.rs` via `tauri::generate_handler![...]`. New inference commands follow this exactly.

---

## §2 — InferenceBackend trait design

### 2.1 Proposed trait

```rust
use async_trait::async_trait;

#[async_trait]
pub trait InferenceBackend: Send + Sync {
    async fn chat(
        &self,
        messages: Vec<ChatMessage>,
        config: &InferenceConfig,
    ) -> Result<ChatResponse, InferenceError>;

    fn backend_id(&self) -> &'static str;
    fn supports_streaming(&self) -> bool { false }

    // v1.1+ streaming seam — default to unsupported; no migration needed to add this later
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

### 2.2 Design decisions

**Method count:** Minimal — just `chat()`, `backend_id()`, `supports_streaming()`. No `health_check`, `list_models`, or `cancel` on the trait. Rationale: trait methods are interface requirements every impl must provide. `health_check` is a RemoteClient convenience (a Tauri command, not a trait method); future impls may not need it. Keep the trait tight.

**Async trait:** `async_trait` crate — the standard choice. Compile-time macro expansion only; zero runtime cost. Alternative (`Pin<Box<dyn Future>>` manual returns) has identical semantics but ~3× the boilerplate per method and hostile to future edits. Use `async_trait`.

**Error type:** Single `InferenceError` enum — conventional and readable. Variants: `Network(String)`, `Timeout`, `Auth(String)`, `ModelNotFound(String)`, `ApiError { status: u16, body: String }`, `ParseError(String)`, `NotSupported(&'static str)`.

**Streaming seam:** `stream_chat()` exists on the trait *now* with a default `NotSupported` impl. Adding streaming in v1.1 means `RemoteClient` overrides `stream_chat()` and flips `supports_streaming()` to `true`. No trait migration, no breakage to other impls. This is the correct seam.

**Cancellation (v1.0):** Hard timeout via `tokio::time::timeout(Duration::from_secs(60), ...)` on the HTTP request. Non-streaming requests either complete or time out; user-initiated cancel is not wired. For v1.1 streaming: store a `tokio::task::AbortHandle` in a `Mutex<Option<AbortHandle>>` Tauri state resource; expose a `cancel_inference` command. This doesn't belong on the trait — it's infrastructure above the trait.

### 2.3 Forward-compat for future impls

- **CandleBackend:** Implements `chat()` against a local model. Zero trait changes. New module, new deps (candle crates), separate arc.
- **CerebraBackend:** Implements `InferenceBackend` for base chat; a sibling `CerebraExtensions` trait handles memory-context operations Cerebra adds. Base trait untouched.
- **StrudelOutputSink:** Strudel is NOT an inference backend — it consumes chat *output*. Probable design: a `ResponseObserver` trait that subscribes to `ChatResponse` events. The inference command layer should emit an event after each successful response (e.g., via a lightweight event bus or Zustand slice) so future observers can subscribe without coupling to the command internals. Don't build the bus in v1.0 — just leave the indirection point.

### 2.4 Module structure

```
src-tauri/src/inference/
  mod.rs           — exports InferenceBackend trait + core types
  remote_client.rs — RemoteClient impl
  commands.rs      — Tauri commands (chat, test_inference_connection)
  types.rs         — ChatMessage, InferenceConfig, ChatResponse, InferenceError
```

---

## §3 — RemoteClient implementation design

### 3.1 HTTP library

**Recommendation: `reqwest` with `features = ["rustls-tls", "json"]`.**

`reqwest` is already in `Cargo.lock` as a transitive dependency of Tauri — it's currently pulled in but not explicitly depended on. Promoting it to a direct dep in `Cargo.toml` makes the dependency explicit and version-controlled.

**Important:** This still requires Ryan's explicit approval per the package-install safeguard. The supply-chain rule applies to new direct dependencies regardless of prior transitive presence. Flag before implementation.

Alternatives:
- `ureq`: synchronous only — requires `spawn_blocking` wrapper, awkward with tokio
- `surf`: async-std ecosystem; mismatches Tauri's tokio runtime
- `hyper` direct: 4× the boilerplate, wrong abstraction level for this

`reqwest` + `rustls-tls` means no system OpenSSL dependency — cleaner cross-platform story (important for Tauri builds on Windows/Linux).

### 3.2 OpenAI chat completion endpoint

Reference: https://platform.openai.com/docs/api-reference/chat/create

```
POST {base_url}/chat/completions
Content-Type: application/json
Authorization: Bearer {api_key}  // omit header entirely if no key

{
  "model": "llama3.2",
  "messages": [
    {"role": "system", "content": "..."},
    {"role": "user", "content": "Hello"}
  ],
  "stream": false,
  "temperature": 0.7,        // optional
  "max_tokens": 2048         // optional
}

→ 200 OK
{
  "choices": [
    {
      "message": {"role": "assistant", "content": "Hi there!"},
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 5,
    "total_tokens": 15
  }
}
```

Ollama's OpenAI-compatible mode at `http://localhost:11434/v1` speaks this protocol exactly.

### 3.3 Error handling

| Condition | InferenceError variant |
|-----------|----------------------|
| Connection refused / DNS failure | `Network(err_string)` |
| Request exceeds 60s | `Timeout` |
| HTTP 401, 403 | `Auth(api_error_message)` |
| HTTP 404 (model) | `ModelNotFound(model_name)` |
| HTTP 4xx, 5xx other | `ApiError { status, body }` |
| Response JSON malformed | `ParseError(serde_err)` |
| `choices` array empty | `ParseError("empty choices")` |

User-language strings for each variant live in `en.json` under `agent.chat.error.*` (v112.5b adds these).

### 3.4 Audit-by-eyeball size

Estimated clean impl:
- `types.rs`: ~60 lines
- `remote_client.rs`: ~100-120 lines (struct, constructor, `chat()` impl, response parsing, error mapping)
- `commands.rs`: ~50 lines (two Tauri commands + `InferenceState`)
- `mod.rs`: ~15 lines (re-exports, trait definition, or split to `backend.rs`)

Total: ~230-250 lines. Fits Ryan's audit-by-eyeball comfort zone. If `remote_client.rs` exceeds 150 lines, move response parsing to `response_parser.rs`.

### 3.5 Endpoint validation

Rule: if `api_key.is_some()` AND endpoint scheme is `http://` AND host is not `localhost`/`127.0.0.1`/`::1`/`host.docker.internal` → return `InferenceError::Auth("Refusing to send API key over plain HTTP to non-local endpoint")`. This prevents accidental key exfiltration. Local HTTP is always allowed.

### 3.6 Timeout

60 seconds via `reqwest::ClientBuilder::timeout(Duration::from_secs(60))`. Set on the shared `Client` instance, not per-request. Ollama `llama3.2` on a mid-range GPU typically responds in 5-30s; 60s gives headroom without hanging indefinitely.

---

## §4 — API-key storage decision

### Options recap

| Option | Mechanism | Security | Complexity |
|--------|-----------|----------|------------|
| A — localStorage | Same as settings store | Plaintext | Zero |
| B — tauri-plugin-stronghold | OS keychain | Encrypted at rest | New dep + platform edge cases |
| C — env var only | `LUMAWEAVE_AI_API_KEY` | Never persists | Bad shipped UX |
| D — settings store + warning | `inference.byokKey` in Zustand store | Plaintext + honest warning | Near-zero |

### Recommendation: Option D for v1.0, Option B for v1.1

**Option D:** Key stored under `settings.inference.byokKey` (string, default `""`). Masked input in UI. Explicit warning: "Keys are stored unencrypted on this device. Use a minimal-permission key for remote providers." Works immediately for Ollama (no key needed) and for users who accept the tradeoff with remote providers.

**Option B for v1.1:** `tauri-plugin-stronghold` promotes the key to the OS keychain. New dep, Linux needs libsecret installed, but well-supported as of 2026. Migration from D → B: read `byokKey` from settings, write to keychain, clear settings field.

**Why not B in v1.0:** Adds ~1 new Rust crate + platform-specific setup instructions to the v1.0 ship surface. The supply-chain rule requires approval; the Linux/headless story is messier. For a solo developer who controls their own machine, Option D is honest and correct.

### Storage spec (Option D)

- **Settings path:** `settings.inference.byokKey` (empty string = no key)
- **UI surface:** Settings → AI category → "API Key" field, `type="password"`, optional
- **When key is empty:** `Authorization` header is omitted entirely. Ollama and local LiteLLM work without it.
- **Key masking:** Yes — `type="password"` input. Show/hide toggle optional but not required for v1.0.

---

## §5 — Chat UI design

### Layout

```
┌─────────────────────────────┐
│ Agent Chat    [model name] ⚙ │  ← header strip
├─────────────────────────────┤
│                             │
│  [assistant message]        │  ← message list (scrollable)
│                [user msg]   │
│  [assistant message]        │
│  [● thinking...]            │  ← in-flight state
│                             │
├─────────────────────────────┤
│ Type a message...    [Send] │  ← input row (fixed)
└─────────────────────────────┘
```

### Message rendering

- **User messages:** right-aligned, accent-tinted background
- **Assistant messages:** left-aligned, neutral background
- **System messages:** not shown (infrastructure, not conversation)
- **Code blocks:** monospace + dark background — lightweight inline markdown for ``` blocks only. Full Markdown renderer deferred; adds bundle weight and complexity for minimal v1.0 gain.

### Input behavior

- Enter → send; Shift+Enter → newline
- Send button disabled when input empty OR request in-flight
- On send: input clears, user message appends, "thinking" state shows in assistant position
- On response: "thinking" state replaced by assistant message

### Loading + error states

- **In-flight:** assistant bubble with "●●●" animation (CSS, no library)
- **Network error:** error bubble with user-language text (from `en.json agent.chat.error.*`) + retry button (re-sends same message)
- **API error (4xx with body):** error bubble with the API's error message
- **Timeout:** error bubble: "Request timed out. The model may be overloaded — try again."
- **Auth error:** error bubble with link to Settings AI config

### Conversation persistence

**Recommendation: Option A (ephemeral) for v1.0.**

Rationale: v1.0 is a quick-chat surface. When Cerebra IPC integrates (future arc), conversation history becomes Cerebra-managed — storing it in the settings store now creates a migration problem. Ephemeral is simpler and architecturally honest.

Forward-compat design: conversation state lives in a `useChatState` hook (or equivalent), not scattered through component state. Swapping the hook's backing store from `useState` to Cerebra IPC is contained to one file.

### Config UI

**Settings → AI category (recommended over gear-on-tile)** — reasons: consistent with all other settings, discoverable, avoids making the tile header crowded, allows settings to be configured before the tile is opened.

Fields:
1. **Endpoint URL** — text input, placeholder: `http://localhost:11434/v1`
2. **Model name** — free-form text input v1.0; placeholder: `llama3.2`
3. **API key** — `type="password"` masked input, optional, with warning note
4. **Test Connection** — button → calls `test_inference_connection` → shows "Connected ✓" or error message inline

### New i18n keys needed (v112.5b adds these)

Keys under `agent.chat.*` and `settings.inference.*`:
- `agent.chat.inputPlaceholder` — "Ask the agent..."
- `agent.chat.emptyState` — "Start a conversation"
- `agent.chat.thinking` — "Thinking..."
- `agent.chat.error.network` — "Connection failed. Is the endpoint running?"
- `agent.chat.error.auth` — "Authentication failed. Check your API key in Settings → AI."
- `agent.chat.error.timeout` — "Request timed out. Try again or check model availability."
- `agent.chat.error.modelNotFound` — "Model not found. Verify model name in Settings → AI."
- `agent.chat.error.generic` — "Something went wrong. Check the AI settings."
- `agent.chat.retry` — "Retry"
- `settings.inference.label` — "AI / Inference"
- `settings.inference.endpointUrl.label` — "Endpoint URL"
- `settings.inference.endpointUrl.hint` — "Default: http://localhost:11434/v1"
- `settings.inference.modelName.label` — "Model"
- `settings.inference.byokKey.label` — "API Key"
- `settings.inference.byokKey.hint` — "Leave blank for local Ollama. Keys stored unencrypted."
- `settings.inference.testConnection.label` — "Test Connection"
- `settings.inference.testConnection.success` — "Connected ✓"

---

## §6 — Tauri command surface

### New commands

**`chat`** — main inference call
```
invoke("chat", {
  messages: Array<{ role: "user"|"assistant"|"system", content: string }>,
  config: { model: string, endpointUrl: string, byokKey?: string, temperature?: number, maxTokens?: number }
}) → { message: { role, content }, finishReason: string, usage?: { promptTokens, completionTokens, totalTokens } }
```

**`test_inference_connection`** — config validation (one minimal probe request)
```
invoke("test_inference_connection", {
  config: same shape as above
}) → string  // "ok" or user-readable error string
```

### `list_inference_models` — deferred

Ollama `/api/tags` and OpenAI `/v1/models` exist but model-picker UX adds complexity. Users type model names in v1.0. Add "Fetch models" button in v1.1.

### Cancellation (v1.0 non-streaming)

60s `tokio::time::timeout` hard limit. No user-initiated cancel for v1.0.

**v1.1 streaming cancel pattern:**
```rust
// State resource
pub struct InferenceState {
    pub backend: Box<dyn InferenceBackend>,
    pub abort: Mutex<Option<tokio::task::AbortHandle>>,
}

// cancel_inference command — stores AbortHandle on spawn, calls abort()
```

### Audit-by-eyeball constraint

Two Tauri commands + `InferenceState` struct + `RemoteClient` impl + shared types: estimated 230-250 lines total across the `inference/` module. Within the ~200 line target. If `remote_client.rs` runs long, split response parsing to a helper function.

---

## §7 — Forward-compat hooks

### 7.1 Candle backend
The trait has no HTTP or networking assumptions. `CandleBackend` provides `chat()` via local model inference — same signature, different body. New module, new deps, own arc.

### 7.2 Cerebra IPC backend
`CerebraBackend` implements `InferenceBackend` for base `chat()`. Cerebra-specific methods (memory context injection, agent state access) go on a sibling `CerebraExtensions` trait — additive, no breakage to the base contract. Per `INTEGRATION_FUTURES.md §4`, Cerebra's "live" transport is `CerebraBackend`'s internal concern.

### 7.3 Strudel musical output
Strudel is a *consumer* of chat output, not an inference backend. The correct abstraction is a `ResponseObserver` (or event bus subscription) that receives `ChatResponse` after each completion. For v1.0: emit a lightweight event at the chat dispatch site (could be as simple as a Zustand event slice or a custom event). Don't build the observer system — just leave the indirection so the Strudel arc can hook in without touching inference command code.

Ryan's vision: "when the agent hits different kinds of nodes while thinking, it's playing tones with various effects applied." This requires streaming (token-by-token events) + Strudel integration — a v1.1+ combination. v1.0 lays the seam; doesn't build it.

### 7.4 Conversation persistence via Cerebra
Conversation state lives in a hook, not in component state directly. When Cerebra IPC integrates, the hook's backing store swaps — UI components don't change.

---

## §8 — Pre-flight decisions for Ryan

Each item has an investigator recommendation. Ryan locks the decision; v112.5b scopes from there.

---

**1. InferenceBackend trait scope**

Options: minimal (`chat()` + `backend_id()` + `supports_streaming()`) vs with `health_check`, `list_models`, `cancel`.

**Recommendation: MINIMAL.** Keep the trait to `chat()` + capability queries. `health_check` is a Tauri command, not a trait requirement. `list_models` is deferred. `cancel` is impl-level infrastructure above the trait. Every method added is a requirement every future impl must satisfy.

**→ Ryan's decision:**

---

**2. HTTP library**

Options: `reqwest` (recommended), `ureq`, `surf`, `hyper`.

**Recommendation: `reqwest` with `["rustls-tls", "json"]`.** Already a transitive dep (in `Cargo.lock`); promotes to explicit. No system OpenSSL. Standard Rust async HTTP.

**Requires Ryan's explicit approval as a new direct dependency** per the package-install safeguard — before `Cargo.toml` is edited in v112.5b.

**→ Ryan's approval (explicit):**

---

**3. API-key storage**

Options: A (localStorage as-is), B (OS keychain via stronghold), C (env var), D (settings store + warning).

**Recommendation: D for v1.0, B for v1.1.** Option D is honest, ships now, works for Ollama (no key needed), and has a clean migration path to B.

**→ Ryan's decision:**

---

**4. Endpoint validation**

Should `RemoteClient` refuse to send an API key over HTTP to a non-localhost endpoint?

**Recommendation: YES.** Local HTTP (localhost, 127.0.0.1, host.docker.internal) exempt. Any other HTTP + key set = error with user-readable message. Protects against misconfiguration.

**→ Ryan's decision:**

---

**5. Streaming seam**

Should the trait be designed so streaming can be added in v1.1 without a trait migration?

**Recommendation: YES.** `stream_chat()` on the trait with a `NotSupported` default. Zero cost today; v1.1 overrides it. No migration needed.

**→ Ryan's decision:** (This is a free yes — no tradeoff.)

---

**6. Cancellation mechanism**

v1.0: hard 60s timeout via `tokio::time::timeout`. User-initiated cancel not wired.
v1.1: `AbortHandle` in Tauri state resource + `cancel_inference` command.

**Recommendation: 60s timeout only for v1.0. Accept the UX gap.** Non-streaming requests are atomic; the "cancel" is navigating away from the tile and waiting for timeout. Acceptable for MVP.

**→ Ryan's decision:**

---

**7. Chat UI conversation persistence**

Options: A (ephemeral), B (settings store), C (multi-conversation history).

**Recommendation: A (ephemeral) for v1.0.** Cerebra will be the persistence layer when it integrates. Storing conversations in the settings store now creates a migration problem and clutters the store.

**→ Ryan's decision:**

---

**8. Model picker**

Free-form text input vs fetched-list dropdown.

**Recommendation: Free-form for v1.0.** Fetching models requires a new Tauri command + error handling + UI for multiple providers with different list APIs. Text input is sufficient for the target audience (developers who know their model names).

**→ Ryan's decision:**

---

**9. AI settings home**

New "AI" category in Settings panel vs gear icon on chat tile vs both.

**Recommendation: New Settings category.** Consistent with all other settings, discoverable, doesn't crowd the tile header. A gear icon on the tile header is additive (can be added later) and doesn't conflict.

**→ Ryan's decision:**

---

**10. Test Connection feature**

Include a "Test Connection" button in AI settings for v1.0?

**Recommendation: YES.** One `test_inference_connection` Tauri command (minimal probe request). Immediate feedback loop for users configuring a new endpoint. Low complexity: ~25 lines of Rust, one button in the UI. High value: bad config is the most common setup failure.

**→ Ryan's decision:**

---

## Evidence sources

- `src/control-plane/agent/AgentChatPlaceholder.tsx` — full file
- `src/control-plane/panels/tileSectionRegistry.ts:14,125` — registry entry
- `src/i18n/manifests/en.json` — `agent.chat.*` keys
- `src-tauri/Cargo.toml` — no reqwest direct dep
- `src-tauri/Cargo.lock` — reqwest present as transitive dep (line 2977)
- `src-tauri/src/lib.rs` — Tauri command registration pattern
- `src-tauri/src/fs.rs:153` — `read_user_file` command as convention reference
- `docs/canonical/DEFERRED_AND_POST_V1_VISION.md:28,83` — cross-refs to this feature architecture
- `~/Projects/future-integration/INTEGRATION_FUTURES.md:§4` — Cerebra forward-compat hooks
- OpenAI API reference: https://platform.openai.com/docs/api-reference/chat/create
