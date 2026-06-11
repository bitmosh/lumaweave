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
        // Local endpoints are exempt from the HTTPS requirement — they don't leave the machine.
        let is_local = endpoint.contains("localhost")
            || endpoint.contains("127.0.0.1")
            || endpoint.contains("::1")
            || endpoint.contains("host.docker.internal");
        if has_api_key && !is_local && !endpoint.starts_with("https://") {
            return Err(InferenceError::InsecureEndpoint);
        }
        Ok(())
    }

    fn build_url(endpoint: &str) -> String {
        if endpoint.ends_with("/chat/completions") {
            endpoint.to_string()
        } else if endpoint.ends_with('/') {
            format!("{endpoint}chat/completions")
        } else {
            format!("{endpoint}/chat/completions")
        }
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
    message: ChatMessageRaw,
    finish_reason: String,
}

#[derive(Deserialize)]
struct ChatMessageRaw {
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

        let url = Self::build_url(&config.endpoint);

        let body = ChatCompletionRequest {
            model: &config.model,
            messages: &messages,
            stream: false,
            temperature: config.temperature,
            max_tokens: config.max_tokens,
        };

        let mut req = self.client.post(&url).json(&body);
        if let Some(ref key) = config.api_key {
            req = req.bearer_auth(key);
        }

        let http_future = req.send();
        let response = timeout(Duration::from_secs(REQUEST_TIMEOUT_SECS), http_future)
            .await
            .map_err(|_| InferenceError::Timeout(REQUEST_TIMEOUT_SECS))?
            .map_err(|e| InferenceError::Network(e.to_string()))?;

        let status = response.status();
        if !status.is_success() {
            let body_text = response
                .text()
                .await
                .unwrap_or_else(|_| "(no body)".to_string());
            return Err(InferenceError::Http {
                status: status.as_u16(),
                message: body_text,
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
            _ => MessageRole::Assistant,
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
}
