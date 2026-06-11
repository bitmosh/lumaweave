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

    /// Stable identifier for this backend (used in logs and diagnostics).
    fn backend_id(&self) -> &'static str;

    /// Whether this backend supports streaming. Default: false.
    fn supports_streaming(&self) -> bool {
        false
    }

    /// Streaming chat — default impl returns StreamingNotSupported.
    /// v1.1+: backends that support streaming override this method.
    async fn stream_chat(
        &self,
        _messages: Vec<ChatMessage>,
        _config: InferenceConfig,
    ) -> Result<(), InferenceError> {
        Err(InferenceError::StreamingNotSupported)
    }
}
