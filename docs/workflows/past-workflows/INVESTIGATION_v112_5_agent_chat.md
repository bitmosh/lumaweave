# Investigation brief — v112.5a agent chat MVP design

**For:** Terminal Claude · **Output:** TWO markdown files:
1. `docs/canonical/LUMAWEAVE_POST_V1_FEATURE_ARCHITECTURE.md` — the architecture doc itself (this file is the deliverable, not just a report)
2. `docs/workflows/v112_5_agent_chat_report.md` — the investigation report with §N decision checklist for Ryan

**No code changes, no commits, no installs.** All design only; implementation happens in v112.5b after Ryan locks decisions.

v112.5 is the largest new feature in the v112 arc — a real chat surface backed by an `InferenceBackend` trait in Rust, with `RemoteClient` as the only impl shipped in v1.0. Candle stays deferred behind the trait per `DEFERRED_AND_POST_V1_VISION.md`. Cerebra IPC will eventually slot in as another impl. Strudel musical-output (post-v1.0 vision) is a known forward-compat consideration.

**Locked context from Ryan's session:**

- **Default endpoint:** Ollama direct (`http://localhost:11434/v1`) — Ollama's OpenAI-compatible mode. Lowest-config-required setup. Users running the bitmosh AI stack (LiteLLM proxy) can re-point at `http://localhost:4000/v1` via config.
- **BYOK:** in scope for v1.0 design AND implementation. Config exposes endpoint URL + optional API key + model name. Same client code handles local-only Ollama, bitmosh AI stack, and remote providers (OpenAI, Anthropic) — all OpenAI-compatible.
- **Streaming:** false for v1.0. Matches Ollama + LiteLLM working defaults. Streaming becomes a v1.1 polish item; design doc notes the deferral.
- **Architecture target:** `InferenceBackend` trait in Rust. `RemoteClient(endpoint, optional_api_key, model_name)` is the only impl. Frontend calls `invoke("chat", { messages })`; Rust handles HTTP.
- **Design doc home:** `docs/canonical/LUMAWEAVE_POST_V1_FEATURE_ARCHITECTURE.md`. Cross-references `DEFERRED_AND_POST_V1_VISION.md` and `INTEGRATION_FUTURES.md`.

**Hard stops:**
- No code changes. No commits. No installs.
- Cite file:line for every claim about current code.
- For external API decisions (OpenAI-compatible spec, Ollama API, Tauri plugin behaviors), cite the relevant docs URL.
- Each section asks specific questions; answer with direct evidence.
- Investigation must produce BOTH files. The architecture doc is itself a deliverable, not a draft to discuss before writing.

---

## §1 — Current AgentChatPlaceholder audit

1.1 Quote `src/tiles/sections/AgentChatPlaceholder.tsx` end-to-end. Report what it currently renders (per v112.1, it shows updated user-language placeholder text).

1.2 Quote its registration in `tileSectionRegistry.ts`. Confirm:
- The tile id (`agent-chat`? `agent-chat-placeholder`?)
- The testid
- Whether `requiresDevMode` is set (it should NOT be — chat is user-facing)
- The tile's current title in i18n

1.3 Identify the i18n keys currently under `tiles.agentChat.*` (or wherever the placeholder string lives). v112.1 updated description and status — quote both.

1.4 Identify any existing Rust code referencing `agent`, `chat`, or `inference` in `src-tauri/src/`. Per v112.0 §6.1: "zero Rust side." Confirm or correct.

1.5 Confirm `src-tauri/src/lib.rs` (or `main.rs`) Tauri command pattern — quote one existing command (e.g., `read_user_file` from v109.2) so the new `chat` command follows the same convention.

---

## §2 — InferenceBackend trait design

The trait shape is the load-bearing architectural decision. Future impls (candle, Cerebra IPC, Strudel-as-output-sink) must slot in without changing the trait. Get this shape right.

2.1 Propose the trait. Sketch in Rust:

```rust
#[async_trait]
pub trait InferenceBackend: Send + Sync {
    async fn chat(
        &self,
        messages: Vec<ChatMessage>,
        config: InferenceConfig,
    ) -> Result<ChatResponse, InferenceError>;
    
    fn backend_id(&self) -> &'static str;
    fn supports_streaming(&self) -> bool;
    // Other capability methods? — investigate what's needed
}

pub struct ChatMessage {
    pub role: MessageRole,  // "user" | "assistant" | "system"
    pub content: String,
    // Multimodal content? — v1.0 text-only, but trait should accommodate future
}

pub struct InferenceConfig {
    pub model: String,
    pub temperature: Option<f32>,
    pub max_tokens: Option<u32>,
    // What else? Top-p, presence/frequency penalty, stop sequences?
    // The OpenAI chat completion API has a known shape — match it where useful
}

pub struct ChatResponse {
    pub message: ChatMessage,  // The assistant's reply
    pub finish_reason: String,
    pub usage: Option<TokenUsage>,
}
```

2.2 Decide and recommend:
- **Method count.** Just `chat`? Or also `list_models`, `health_check`, `cancel`? Each adds API surface that future impls must implement. Start minimal; add when needed.
- **Async trait library.** `async_trait` macro is standard but adds compile-time cost. Alternative: return `Pin<Box<dyn Future>>` manually (more boilerplate). Recommend.
- **Error type.** Single `InferenceError` enum vs per-method errors. Single is conventional.
- **Streaming.** The trait should be designed such that streaming can be added later WITHOUT changing existing signatures. Option: a separate `stream_chat` method on the trait (defaulted to "not supported" via supports_streaming()). Pre-design this seam so v1.1 streaming doesn't require trait migration.
- **Cancellation.** Should `chat()` accept a cancellation token? For long Ollama inferences a user might want to cancel. Tauri commands can be cancelled via various mechanisms; investigate the Tauri 2 pattern.

2.3 Forward-compat hooks for future impls. List them:
- `CandleBackend` (post-v1.0, embedded local model): just needs `chat()` impl. Trait already accommodates.
- `CerebraBackend` (post-v1.0, sibling-module IPC): needs `chat()` plus possibly `set_context(memory_bundle)` — but Cerebra's design isn't finalized. Don't pre-emptively add methods.
- `StrudelOutputSink` (post-v1.0 vision): not a *chat* backend — it's an *output sink* for chat responses. May not be an `InferenceBackend` impl at all; could be a sibling trait (`ResponseSink`) that subscribes to chat events. Investigate whether Strudel's intended role fits "backend" or "consumer" semantics.

2.4 Where lives `RemoteClient`. Likely `src-tauri/src/inference/remote_client.rs`. Confirm or propose a structure.

---

## §3 — RemoteClient implementation design

This is the only impl shipping in v1.0. OpenAI-compatible HTTP client targeting any endpoint that speaks the standard chat completion API.

3.1 HTTP library choice. Rust options:
- `reqwest` — most common, well-supported, ~80 line Cargo.toml addition
- `ureq` — synchronous, simpler, smaller
- `surf` — async-std ecosystem
- `hyper` — low-level, lots of boilerplate

The audit-by-eyeball discipline matters. Recommend `reqwest` with `tls-rustls` features (no system OpenSSL dependency, cleaner cross-platform). Quote pre-flight: does `Cargo.toml` already have `reqwest`? If not, this is the first new dep in months — flag for Ryan's explicit approval per the no-installs-without-approval rule.

3.2 OpenAI chat completion endpoint shape:
- Endpoint: `{base_url}/chat/completions`
- Method: POST
- Headers: `Content-Type: application/json`, optionally `Authorization: Bearer {api_key}`
- Body: `{ "model": string, "messages": [{role, content}], "stream": false, ... }`
- Response: `{ "choices": [{ "message": {role, content}, "finish_reason": string }], "usage": {...} }`

Cite official OpenAI API docs (https://platform.openai.com/docs/api-reference/chat).

3.3 Error handling. Network errors, timeouts, API errors (4xx with JSON body), malformed responses. Map each to `InferenceError` variants.

3.4 Audit-by-eyeball Rust constraint. The whole `RemoteClient` impl must be small enough for Ryan to read and understand the security model. Estimate ~80-150 lines for a clean impl. If it grows beyond ~200 lines, propose a refactor; if it grows beyond ~300, flag a concern.

3.5 Endpoint validation. Should the client refuse non-HTTPS endpoints when an API key is set (prevent leaking keys over HTTP)? Recommend: yes for any non-localhost endpoint. Local endpoints (localhost, 127.0.0.1, host.docker.internal) can be HTTP since they don't leave the machine.

3.6 Timeout. Default request timeout. Recommend 60s (Ollama inference can be slow on weaker GPUs).

---

## §4 — API-key storage decision

BYOK is in scope. Where does the API key live?

4.1 Three real options:

**Option A — `localStorage` via webview.** Simple. Same mechanism as settings store. Pros: zero new code, works today. Cons: keys live in plaintext localStorage; any compromised webview process exposes them; not encrypted at rest.

**Option B — Tauri keychain plugin (`tauri-plugin-stronghold` or `tauri-plugin-secure-storage`).** Stores secrets in OS keychain (macOS Keychain, Windows Credential Manager, Linux libsecret). Pros: encrypted at rest, OS-protected. Cons: new dependency (audit-by-eyeball Rust grows), platform-specific edge cases (Linux needs libsecret installed; some headless environments lack it).

**Option C — Environment variable only.** User exports `LUMAWEAVE_AI_API_KEY` before launching. Pros: dev-friendly, never persists. Cons: terrible UX for shipped product (user must re-export every session), can't have multiple keys.

**Option D (hybrid) — settings store with explicit "I understand keys are stored unencrypted" toggle.** Settings store path: `inference.byokKey` (string). Surface UI: text field with masked input + warning text "Keys are stored unencrypted. Use OS keychain (coming later) for production keys." Defers the keychain plugin to a post-v1.0 polish item while giving users a working BYOK now.

4.2 Recommend. My instinct: **Option D for v1.0 with Option B planned as v1.1 polish.** Reasoning:
- Encrypted-at-rest is the right long-term answer
- Tauri keychain plugins are well-supported but add new Rust surface that needs audit-by-eyeball
- Option D is honest about the tradeoff and ships now
- Migration path from D → B is clean (read existing localStorage key, write to keychain, clear localStorage)

But investigate Tauri plugin maturity in 2026. If `tauri-plugin-stronghold` has matured to "drop in and use," Option B becomes the right v1.0 choice.

4.3 Whichever option wins, the design doc must specify:
- The exact storage key/path
- The UI surface for entering the key (settings panel? inline in chat config?)
- Whether the key is masked in UI (yes — text input with `type="password"` or equivalent)
- What happens when key is empty (request goes through without Authorization header; works for local Ollama, fails for OpenAI)

---

## §5 — Chat UI design

The user-visible surface. Lives in the existing `AgentChatPlaceholder` tile (renamed appropriately, e.g., `AgentChatTile.tsx`).

5.1 Layout:
- Message list (top, scrollable, fills available height)
- Input row (bottom, fixed): textarea + send button
- Possibly a header strip (current model selection + settings gear icon)

5.2 Message rendering:
- User messages: right-aligned, accent background
- Assistant messages: left-aligned, neutral background
- System messages: not shown by default (system prompts are infrastructure)
- Code blocks in assistant messages: should render with monospace + dark background. Use a lightweight Markdown renderer or skip Markdown for v1.0?

5.3 Input behavior:
- Enter sends; Shift+Enter newline (standard chat UX)
- Send button disabled when input empty or request in-flight
- After send, input clears; assistant message appears as a loading state ("typing..." or animated dots) until response arrives

5.4 Loading + error states:
- In-flight: assistant bubble with subtle "thinking" animation; cancel button next to it
- Network error: error bubble with retry button + error message in user-language
- API error (4xx, 5xx with body): error bubble with the API's error message
- Empty endpoint response: error bubble with "Model returned no content" message

5.5 Conversation persistence (single biggest UX decision):

**Option A — Ephemeral.** Conversation lives in memory; cleared on tile close or app restart. Simplest. Matches "this is a quick chat" mental model.

**Option B — Persisted in settings store.** Conversation stored under `inference.lastConversation` (or similar). Survives app restart. Cluttered if conversations get long.

**Option C — Persisted with conversation history (multiple conversations).** Sidebar/dropdown to select between conversations. Most product-shaped. Significant UI complexity.

Recommend **Option A for v1.0** — ephemeral is sufficient for the MVP. Conversation history is a v1.1+ feature once Cerebra IPC is integrated (because *Cerebra* will provide the persistence layer for conversations, not LumaWeave's settings store).

5.6 Config UI:
- Model name dropdown OR text input (free-form)
- Endpoint URL (text input with helper text showing default)
- API key (masked text input, optional)
- "Test connection" button (calls a simple `health_check` or sends a minimal completion to verify config works)

Settings panel home: a new "AI" or "Inference" category under Settings. Or a settings gear icon directly on the chat tile.

5.7 i18n strings needed:
- Tile title (replaces "Agent Chat Placeholder")
- Input placeholder ("Ask the agent...")
- Empty state ("Start a conversation")
- Error messages (multiple — network, auth, model-not-found, generic)
- Settings labels (endpoint, model, API key, test connection)
- Status texts (sending, error, ready)

---

## §6 — Tauri command surface

6.1 New commands needed:

**`invoke("chat", { messages, config })`** — the main chat call. Sends messages to RemoteClient, returns ChatResponse.

**`invoke("test_inference_connection", { config })`** — health check for the config UI's "Test connection" button. Sends a minimal completion request, returns success or detailed error.

6.2 Should there be a `list_inference_models` command? Ollama exposes `/api/tags` for listing local models; OpenAI exposes `/v1/models`. The model picker UX could populate from this — but it adds complexity. Recommend: defer for v1.0. User types model name manually; v1.1 can add a "fetch models" button.

6.3 Cancellation. If user closes the tile mid-inference, the Tauri command should cancel its HTTP request. Investigate Tauri 2's cancellation patterns.

6.4 Audit-by-eyeball constraint. All new Rust commands and the RemoteClient must fit in ~200 lines total. If they grow larger, propose splitting or scope-reduction.

---

## §7 — Forward-compat hooks (what the design must preserve)

7.1 **Candle backend (post-v1.0).** When candle ships:
- New module `src-tauri/src/inference/candle_backend.rs`
- Implements `InferenceBackend` trait
- Loads a local model file
- Same `chat()` method signature works

The trait must NOT have RemoteClient-specific assumptions. E.g., don't include `endpoint_url` in the trait method signatures — that's `RemoteClient`'s concern, not the trait's.

7.2 **Cerebra IPC backend (post-v1.0).** When Cerebra lands as a sibling module:
- New module `src-tauri/src/inference/cerebra_backend.rs` (or similar)
- Implements `InferenceBackend` plus Cerebra-specific methods (memory context, agent state)
- Uses `transport: "live"` per `INTEGRATION_FUTURES.md`

The trait should be extensible without breakage. Investigate Rust patterns for "extend trait with additional methods for some impls" — typically a separate trait that some impls also implement.

7.3 **Strudel musical output (post-v1.0 vision).** Per Ryan's earlier description: "imagine setting a scale to a graph and when the agent hits different kinds of nodes while thinking, it's playing tones with various effects applied for different types of data, corresponding colored animation effects." This isn't an inference backend — it's a *consumer* of chat events. Probable design: a separate `ResponseObserver` trait that gets notified of chat events (token streams, complete responses, node references in responses). Strudel would implement that.

For v1.0: the chat dispatch should emit events (e.g., `chat:message-received`) that future observers can subscribe to. Don't build observer infrastructure now — just don't foreclose it.

7.4 **Conversation persistence via Cerebra.** Per §5.5 Option A, conversations are ephemeral in v1.0. When Cerebra IPC integrates, conversation history becomes Cerebra-managed. The chat UI should be designed such that swapping from in-memory to Cerebra-backed conversation storage doesn't require UI changes — just the storage hook.

---

## §8 — Pre-flight decisions for Ryan

Aggregate the design surface into a clear decision checklist:

1. **InferenceBackend trait scope.** Minimal (just `chat()`)? Or with `health_check`, `list_models`, etc.? Recommend minimal; expand later.

2. **HTTP library.** `reqwest` recommended (with `tls-rustls`). Flag as a new dependency requiring explicit approval.

3. **API-key storage.** Option A / B / C / D from §4. Recommend D for v1.0, B for v1.1 polish.

4. **Endpoint validation.** Reject HTTPS-less endpoints when key is set (except localhost)? Recommend yes.

5. **Streaming hook.** Trait designed so streaming can be added later without migration? Yes — design includes the seam.

6. **Cancellation mechanism.** Tauri 2 cancellation pattern (investigate). Important for long Ollama inferences.

7. **Chat UI conversation persistence.** Ephemeral (Option A) / settings store (B) / multi-conversation (C). Recommend A for v1.0.

8. **Model picker.** Free-form text input vs fetched-list dropdown. Recommend free-form for v1.0.

9. **AI settings home.** New "AI" category under Settings panel vs gear icon on chat tile vs both. Recommend new Settings category.

10. **Test connection feature.** Include in v1.0? Recommend yes — gives users immediate feedback on config correctness.

Each gets investigator's recommendation + reasoning in product-language. Ryan locks decisions; v112.5b implementation scopes from there.

---

## Output format

**Two files:**

### File 1: `docs/canonical/LUMAWEAVE_POST_V1_FEATURE_ARCHITECTURE.md`

The architecture doc itself. Structure:

```
# LumaWeave — Post-v1.0 Feature Architecture

## Purpose
[What this doc captures; why it exists; relationship to DEFERRED_AND_POST_V1_VISION.md and INTEGRATION_FUTURES.md]

## Inference Architecture

### Overview
[The InferenceBackend trait + impl pattern; current state (RemoteClient only); future impls (Candle, Cerebra)]

### InferenceBackend Trait
[Rust signature, method semantics, error type, async pattern, streaming-future-proofing]

### Impls
- RemoteClient (v1.0)
- CandleBackend (post-v1.0)
- CerebraBackend (post-v1.0)

### Tauri Command Surface
[chat, test_inference_connection — exact signatures]

### Configuration
[Endpoint URL, model name, API key storage, BYOK pattern]

## Chat UI Architecture

### Component Structure
[AgentChatTile composition]

### State Management
[Conversation state — ephemeral in v1.0; future Cerebra-backed]

### Settings Integration
[AI category, config fields, test connection]

## Forward-Compat Hooks
[Candle slot, Cerebra slot, Strudel ResponseObserver consideration]

## Cross-References
- docs/canonical/DEFERRED_AND_POST_V1_VISION.md
- ~/Projects/future-integration/INTEGRATION_FUTURES.md
- ~/Projects/future-integration/SDK_SPEC.md
- docs/canonical/SHIP_READINESS_ROADMAP.md
```

This file is a real architecture doc that future-Claude (or any contributor) reads to understand the chat system's shape. Treat it as a deliverable, not a draft.

### File 2: `docs/workflows/v112_5_agent_chat_report.md`

The investigation report with §N decision checklist. Structure follows the §1-§8 outline above. File:line citations for code claims; doc-URL citations for external API claims. LOW/MED/HIGH ratings where relevant.

When complete: ping back; planning Claude reads + works through §8 with Ryan; then scopes v112.5b implementation passes.
