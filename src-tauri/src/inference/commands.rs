// SPDX-License-Identifier: Apache-2.0
use super::remote_client::RemoteClient;
use super::backend::InferenceBackend;
use super::types::{ChatMessage, ChatResponse, InferenceConfig, InferenceError, MessageRole};

#[tauri::command]
pub async fn chat(
    messages: Vec<ChatMessage>,
    config: InferenceConfig,
) -> Result<ChatResponse, InferenceError> {
    let client = RemoteClient::new();
    client.chat(messages, config).await
}

#[derive(serde::Serialize)]
pub struct TestConnectionResult {
    pub ok: bool,
    pub message: String,
}

#[tauri::command]
pub async fn test_inference_connection(
    config: InferenceConfig,
) -> Result<TestConnectionResult, InferenceError> {
    let client = RemoteClient::new();
    let probe = vec![ChatMessage {
        role: MessageRole::User,
        content: "ping".to_string(),
    }];
    let mut probe_config = config;
    probe_config.max_tokens = Some(1);
    probe_config.temperature = Some(0.0);

    match client.chat(probe, probe_config).await {
        Ok(_) => Ok(TestConnectionResult {
            ok: true,
            message: "Connection successful.".to_string(),
        }),
        Err(e) => Ok(TestConnectionResult {
            ok: false,
            message: e.to_string(),
        }),
    }
}
